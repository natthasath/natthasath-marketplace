import { atom, read, update } from 'claude-code'
import type { ClientElements, Elements, EngineInterface, ProcessRunResult, Register, RenderChildren } from 'claude-code'

import type { Badge, BadgeKind, BadgeStyle, Cell, CommitDetail, ConfigScope, FileStat, Graph, GraphRow, Ref, RepoSettings, Repos, View } from '../types'
import { badgeParts, badgesOf, diffBar, fitBadges } from './badges'
import { isBranchNameCandidate } from './detect'
import { authorCell, authorCol, authorHeader, COMPACT_COLS, descriptionCol, EDGE_SAFETY, hashCell, hashCol, hashHeader, rightCols, subjectRoom } from './columns'
import { absTime, fitGraph, relTime, short, truncate, truncateMiddle } from './format'
import { layout } from './lanes'
import { clampTop, findByHash, isHashQuery, topOf, visibleRange, windowAt, wrapRows } from './virtual'
import { DETAIL_FORMAT, LOG_FORMAT, parseDetail, parseLog, parseStatus, remotesOf, UNCOMMITTED, withUncommitted } from './log'
import { checkoutArgs, defaultPushRemotes, deleteBranchArgs, type MenuItem, menuFor, pushRuns, renameArgs } from './menu'
import { drawPill, type PillProps } from './pilldraw'
import type { TapRun } from './tap'
import { BRANCH_ARGS, UPSTREAM_ARGS, FIND_ARGS, parseBranch, parseUpstream, parseRepos, pickActive, branchColumn, repoLabel } from './repos'
import { addRemotePlan, isRemoteUrl, parseRemotes, userConfigArgs } from './settings'
import type { SpinnerProps } from './spinner'

const PANE = 'mods-gitgraph'
const TITLE = 'Git Graph'
const PAGE = 300
const POLL_MS = 5_000
const GIT_TIMEOUT_MS = 15_000
const NETWORK_TIMEOUT_MS = 120_000
const MAX_FILES = 20

// The pane draws on the terminal's own background and text colour, secondary text dimmed:
// only the lanes, the pills, the selection and the diff counts carry colours of their own.
const PALETTE = ['#4fc1ff', '#c586c0', '#ce9178', '#4ec9b0', '#dcdcaa', '#f48771', '#b5cea8', '#d7ba7d']
const BADGE_FG = '#1e1e1e'
const BADGE_BG: Partial<Record<BadgeKind, string>> = { tag: '#e2c08d', detached: '#f48771' }
const SELECTED_BG = '#264f78'
const REMOTE_BG = '#9d9d9d'
const SPINNER_COLOR = '#4fc1ff'
const ADD_COLOR = '#89d185'
const DEL_COLOR = '#f48771'
const BODY_LINES = 8
const OVERSCAN = 15
const BAR_W = 8
const MIN_SUBJECT = 20
// A pill's caps (or padding) and its gap, around its name.
const PILL_PAD = 3
const STATUS_ARGS = ['status', '--porcelain=v2', '--branch']
const REFS_ARGS = ['for-each-ref', '--format=%(objectname) %(refname)']
const DOUBLE_CLICK_MS = 450
const REFRESHED_MS = 1_500
// Nerd Font glyphs where one is installed, plain Unicode otherwise.
const ICONS = {
  nerd: { on: '', off: '', fetch: '', refresh: '\u{f0450}', settings: '', search: '' },
  plain: { on: '◉', off: '○', fetch: '☁', refresh: '↻', settings: '⚙', search: '⌕' },
}
// No git the pane runs opens an editor (merge, rebase or tag messages) or asks for a password.
const GIT_ENV = { GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true', GIT_MERGE_AUTOEDIT: 'no' }
const NERD_FONT_CHECK = 'ls ~/Library/Fonts /Library/Fonts ~/.local/share/fonts ~/.fonts /usr/share/fonts 2>/dev/null | grep -qi nerd'

const EMPTY_GRAPH: Graph = { status: 'idle', rows: [], head: '', branch: '', dirty: 0, conflicts: 0, remotes: [], hasMore: false }
const DEFAULT_VIEW: View = { scope: 'all', limit: PAGE, selected: null, confirm: null, menu: null, isRenaming: false, isDeleting: false, isForce: false, push: null, running: null, isSettings: false, configScope: 'local', editingRemote: null, isAddingRemote: false, remoteDraft: '', scrollTo: null, isSearching: false, refresh: 'idle', isOpen: false }

const graphState = atom({ plugin: 'mods-gitgraph', key: 'graph' } as const, EMPTY_GRAPH)
// Bumped with every graph write: renders read this small number and keep the graph
// itself in `graphCache`, so a scroll step does not carry the whole graph across.
const versionState = atom({ plugin: 'mods-gitgraph', key: 'graphVersion' } as const, 0)
const viewState = atom({ plugin: 'mods-gitgraph', key: 'view' } as const, DEFAULT_VIEW)
const detailState = atom({ plugin: 'mods-gitgraph', key: 'detail' } as const, null as CommitDetail | null)
const roundState = atom({ plugin: 'mods-gitgraph', key: 'isRound' } as const, false)
const nerdState = atom({ plugin: 'mods-gitgraph', key: 'hasNerdFont' } as const, false)
const settingsState = atom({ plugin: 'mods-gitgraph', key: 'settings' } as const, null as RepoSettings | null)
// Searched when the pane opens and on refresh; every git the pane runs runs in `active`.
const reposState = atom({ plugin: 'mods-gitgraph', key: 'repos' } as const, { list: [], active: '.', isPicking: false, branches: {} } as Repos)
const scrollTopState = atom({ plugin: 'mods-gitgraph', key: 'scrollTop' } as const, 0)

// Everything transient a git action, a selection or a new menu closes.
const CLOSED = {
  confirm: null,
  menu: null,
  isRenaming: false,
  isDeleting: false,
  isForce: false,
  push: null,
  editingRemote: null,
  isAddingRemote: false,
} satisfies Partial<View>

let generation = 0
// What a render derives from the graph, worked out once per graph version.
type GraphCache = { version: number; graph: Graph; maxCells: number; indexOf: Map<string, number> }
let graphCache: GraphCache | null = null
let signature = ''
let busy = false
// Set synchronously when an action starts, so a second press before the redraw is ignored.
let isRunning = false
// The last left click on a pill, to tell a double click, and the commit selected before it.
let lastPillClick: { key: string; at: number; selected: string | null } = { key: '', at: 0, selected: null }
// Set while a docked terminal pane draws the graph: the pane scrolls its own rows, between `0` and `maxTop`.
let ownScroll: { top: number; maxTop: number } | null = null

const firstLine = (text: string) => text.split('\n').find(l => l.trim() !== '') ?? 'unknown error'

// Runs git in a repo. Network commands may wait on a remote: a longer timeout.
const gitIn = ($: EngineInterface, cwd: string, args: string[], isNetwork = false) =>
  $.process.run(['git', ...args], { cwd, timeoutMs: isNetwork ? NETWORK_TIMEOUT_MS : GIT_TIMEOUT_MS, env: GIT_ENV })

// Runs in the repo the pane shows.
async function git($: EngineInterface, args: string[], isNetwork = false) {
  const { active } = await read($, reposState)
  return gitIn($, active, args, isNetwork)
}

// Lists the repos in the session folder and keeps the active one while it is still there;
// a failed search leaves the session folder alone. True when the active repo changed.
async function findRepos($: EngineInterface): Promise<boolean> {
  const list = await $.process.run(FIND_ARGS, { timeoutMs: GIT_TIMEOUT_MS }).then(out => parseRepos(out.stdout), (): string[] => [])
  const before = (await read($, reposState)).active
  const { active, isPicking } = await update($, reposState, r => ({ ...r, list, active: pickActive(list, before) }))
  // Only an open picker shows branches; read off the graph's critical path.
  if (isPicking) void loadBranches($, list)
  return active !== before
}

// The branch a repo is on, as its upstream (`origin/main`) when it tracks one on a remote.
async function headOf($: EngineInterface, path: string): Promise<string | null> {
  const branch = await gitIn($, path, BRANCH_ARGS).then(parseBranch, () => null)
  if (!branch || branch === 'detached') return branch
  return (await gitIn($, path, UPSTREAM_ARGS(branch)).then(parseUpstream, () => null)) ?? branch
}

// Reads the branch each repo is on, for the picker; a repo whose read fails shows none.
async function loadBranches($: EngineInterface, list: readonly string[]): Promise<void> {
  const heads = await Promise.all(list.map(path => headOf($, path)))
  const branches = Object.fromEntries(list.flatMap((path, i) => (heads[i] ? [[path, heads[i]]] : [])))
  await update($, reposState, r => ({ ...r, branches }))
}

async function togglePicker($: EngineInterface): Promise<void> {
  const { isPicking, list } = await update($, reposState, r => ({ ...r, isPicking: !r.isPicking }))
  if (isPicking) await loadBranches($, list)
}

// Shows another repo: what was open belonged to the last one.
async function showRepo($: EngineInterface): Promise<void> {
  await Promise.all([
    update($, viewState, (v): View => ({ ...v, ...CLOSED, selected: null, limit: PAGE, scrollTo: null })),
    update($, detailState, () => null),
  ])
  const view = await read($, viewState)
  await Promise.all([load($), view.isSettings ? loadSettings($) : undefined, update($, scrollTopState, () => 0)])
  try {
    await $.ui.scroll({ to: 'start', in: PANE })
  } catch {
    // no surface to scroll
  }
}

async function selectRepo($: EngineInterface, path: string): Promise<void> {
  const before = (await read($, reposState)).active
  await update($, reposState, r => ({ ...r, active: path, isPicking: false }))
  if (path !== before) await showRepo($)
}

// What changes when commits, refs, HEAD or the working tree change.
const signatureOf = (status: string, refs: string) => `${status}\0${refs}`

function cacheOf(version: number, graph: Graph): GraphCache {
  return {
    version,
    graph,
    maxCells: graph.rows.reduce((n, r) => Math.max(n, r.cells.length), 1),
    indexOf: new Map(graph.rows.map((r, i) => [r.commit.hash, i])),
  }
}

async function setGraph($: EngineInterface, change: (g: Graph) => Graph): Promise<void> {
  const graph = await update($, graphState, change)
  graphCache = cacheOf(await update($, versionState, n => n + 1), graph)
}

async function readCache($: EngineInterface): Promise<GraphCache> {
  const version = await read($, versionState)
  if (graphCache?.version !== version) graphCache = cacheOf(version, await read($, graphState))
  return graphCache
}

const readGraph = async ($: EngineInterface) => (await readCache($)).graph

type RepoState = { status: ProcessRunResult; refs: ProcessRunResult }

// `known` is a status and refs a caller has just read (the poll), so they are not run twice.
async function load($: EngineInterface, known?: RepoState): Promise<void> {
  const gen = ++generation
  const isCurrent = () => gen === generation
  const view = await read($, viewState)
  busy = true
  try {
    const [log, status, refs] = await Promise.all([
      git($, ['log', view.scope === 'all' ? '--all' : 'HEAD', '--date-order', `-n${view.limit + 1}`, LOG_FORMAT]),
      known?.status ?? git($, STATUS_ARGS),
      known?.refs ?? git($, REFS_ARGS),
    ])
    if (!isCurrent()) return
    if (status.exitCode !== 0) {
      await setGraph($, (): Graph => ({ ...EMPTY_GRAPH, status: 'no-repo' }))
      return
    }
    const { head, branch, dirty, conflicts } = parseStatus(status.stdout)
    const remotes = remotesOf(refs.stdout)
    const commits = parseLog(log.exitCode === 0 ? log.stdout : '', remotes)
    const shown = withUncommitted(commits.slice(0, view.limit), head, dirty)
    const cells = layout(shown)
    signature = signatureOf(status.stdout, refs.stdout)
    await setGraph($, (): Graph => ({
      status: 'ready',
      rows: shown.map((commit, i) => ({ commit, cells: cells[i] ?? [] })),
      head,
      branch,
      dirty,
      conflicts,
      remotes,
      hasMore: commits.length > view.limit,
    }))
  } catch (err) {
    if (isCurrent()) await setGraph($, (g): Graph => ({ ...g, status: 'error', error: String(err) }))
  } finally {
    if (isCurrent()) busy = false
  }
}

// Reloads only when the repository changed since the last load.
async function poll($: EngineInterface): Promise<void> {
  if (busy || !(await read($, viewState)).isOpen) return
  busy = true
  let known: RepoState
  try {
    const [status, refs] = await Promise.all([git($, STATUS_ARGS), git($, REFS_ARGS)])
    if (signatureOf(status.stdout, refs.stdout) === signature) return
    known = { status, refs }
  } finally {
    busy = false
  }
  await load($, known)
}

// Finds the repos, loads the active one, and opens the pane once it is really a
// git repository (an empty folder never gets a pane with nothing to show).
async function tryOpen($: EngineInterface): Promise<Graph> {
  await findRepos($)
  await load($)
  const graph = await readGraph($)
  if (graph.status !== 'no-repo') {
    await $.ui.open({ id: PANE, title: TITLE })
    await update($, viewState, v => ({ ...v, isOpen: true }))
  }
  return graph
}

async function select($: EngineInterface, hash: string): Promise<void> {
  const selected = (await read($, viewState)).selected === hash ? null : hash
  await update($, viewState, v => ({ ...v, ...CLOSED, selected }))
  await update($, detailState, () => null)
  if (selected) await loadDetail($, selected)
}

async function loadDetail($: EngineInterface, hash: string): Promise<void> {
  const out = await git($, ['show', '--numstat', '--diff-merges=first-parent', DETAIL_FORMAT, hash])
  if ((await read($, viewState)).selected !== hash) return
  await update($, detailState, () => (out.exitCode === 0 ? parseDetail(out.stdout) : null))
}

// Reloads everything on screen; the button shows it running, then `✓ updated` for a moment.
async function refreshAll($: EngineInterface): Promise<void> {
  if ((await read($, viewState)).refresh === 'running') return
  await update($, viewState, (v): View => ({ ...v, refresh: 'running' }))
  try {
    if (await findRepos($)) return await showRepo($)
    const view = await read($, viewState)
    await Promise.all([load($), view.selected ? loadDetail($, view.selected) : undefined, view.isSettings ? loadSettings($) : undefined])
  } finally {
    await update($, viewState, (v): View => ({ ...v, refresh: 'done' }))
    $.clock.after(REFRESHED_MS, () => void update($, viewState, (v): View => (v.refresh === 'done' ? { ...v, refresh: 'idle' } : v)))
  }
}

async function checkoutRef($: EngineInterface, badge: Badge): Promise<void> {
  const { remotes } = await readGraph($)
  const args = checkoutArgs(badge, remotes)
  if (args) await runAction($, args, `Checked out ${badge.label}`)
  else $.ui.toast(badge.kind === 'head' ? `Already on ${badge.label}` : `Nothing to check out for ${badge.label}`)
}

// Selects the loaded commit the hash starts, and scrolls the pane to it: the render
// draws the window around `scrollTo` so the row exists to be scrolled to.
async function searchCommit($: EngineInterface, value: string): Promise<void> {
  const query = value.trim()
  if (!isHashQuery(query)) {
    $.ui.toast('Invalid hash: use 4 to 40 hex digits')
    return
  }
  const graph = await readGraph($)
  const hash = findByHash(graph.rows.map(r => r.commit.hash).filter(h => h !== UNCOMMITTED), query)
  if (!hash) {
    const exists = (await git($, ['rev-parse', '--verify', '--quiet', `${query}^{commit}`])).exitCode === 0
    $.ui.toast(exists ? `Commit ${query} is not among the ${graph.rows.length} loaded: use "Load more"` : `No commit with hash ${query}`)
    return
  }
  await update($, viewState, v => ({ ...v, scrollTo: hash, menu: null, isSearching: false }))
  if ((await read($, viewState)).selected !== hash) await select($, hash)
  // A pane scrolling its own rows already draws the commit centered, and keeps it there until
  // the next scroll lets go: the engine's scroll would move the window by its own reckoning.
  if (ownScroll) return
  // Scrolling is a convenience: where a surface cannot, the commit is still selected.
  try {
    await $.ui.scroll({ to: { key: hash }, in: PANE, block: 'center' })
  } catch {
    // no surface to scroll
  }
  await update($, viewState, v => ({ ...v, scrollTo: null }))
}

async function openMenu($: EngineInterface, hash: string, badge: Badge): Promise<void> {
  await update($, viewState, (v): View => {
    const isSame = v.menu?.hash === hash && v.menu.badge.label === badge.label && v.menu.badge.kind === badge.kind
    return { ...v, ...CLOSED, menu: isSame ? null : { hash, badge } }
  })
}

async function runAction($: EngineInterface, args: string[], done: string, isNetwork = false): Promise<void> {
  await runActions($, [args], done, `Running git ${args[0]}…`, isNetwork)
}

// Holds the one-action-at-a-time lock while `work` runs: `running` replaces the action
// buttons with a spinner and the label. `work` returns the failures to report; the
// result is null when another action held the lock.
async function withRunning($: EngineInterface, label: string, done: string, work: () => Promise<string[]>): Promise<string[] | null> {
  if (isRunning) return null
  isRunning = true
  let failures: string[] = []
  try {
    await update($, viewState, v => ({ ...v, running: label, confirm: null }))
    failures = await work()
  } finally {
    isRunning = false
    await update($, viewState, v => ({ ...v, ...CLOSED, running: null }))
  }
  $.ui.toast(failures.length === 0 ? done : failures.join(' · '))
  await Promise.all([load($), (await read($, viewState)).isSettings ? loadSettings($) : undefined])
  return failures
}

// Runs each git command in turn, all of them even when one fails (a push to every
// remote), and names each failure by its command and target: `git push github: …`.
async function runActions($: EngineInterface, runs: string[][], done: string, label: string, isNetwork = false): Promise<void> {
  await withRunning($, label, done, async () => {
    const failures: string[] = []
    for (const args of runs) {
      const out = await git($, args, isNetwork)
      const target = args.filter(a => !a.startsWith('-')).slice(0, isNetwork ? 2 : 1).join(' ')
      if (out.exitCode !== 0) failures.push(`git ${target} failed: ${firstLine(out.stderr || out.stdout)}`)
    }
    return failures
  })
}

async function loadSettings($: EngineInterface): Promise<void> {
  const get = async (scope: ConfigScope, key: string) => (await git($, ['config', `--${scope}`, '--get', key])).stdout.trim()
  const [localName, localEmail, globalName, globalEmail, remotes] = await Promise.all([
    get('local', 'user.name'),
    get('local', 'user.email'),
    get('global', 'user.name'),
    get('global', 'user.email'),
    git($, ['remote', '-v']),
  ])
  await update($, settingsState, () => ({
    local: { name: localName, email: localEmail },
    global: { name: globalName, email: globalEmail },
    remotes: parseRemotes(remotes.stdout),
  }))
}

async function setUser($: EngineInterface, scope: ConfigScope, key: 'name' | 'email', value: string): Promise<void> {
  const args = userConfigArgs(scope, key, value)
  if (!args) {
    $.ui.toast(`Invalid email: "${truncate(value.trim(), 40)}"`)
    return
  }
  const where = scope === 'local' ? 'this repository' : 'global'
  await runAction($, args, value.trim() ? `user.${key} saved (${where})` : `user.${key} removed (${where})`)
}

async function setRemoteUrl($: EngineInterface, remote: string, value: string): Promise<void> {
  const url = value.trim()
  if (!isRemoteUrl(url)) {
    $.ui.toast(`Invalid URL: "${truncate(url, 40)}"`)
    return
  }
  await runAction($, ['remote', 'set-url', remote, url], `Updated ${remote} URL`)
}

async function addRemote($: EngineInterface, url: string): Promise<void> {
  const name = (await read($, viewState)).remoteDraft
  const existing = (await read($, settingsState))?.remotes.map(r => r.name) ?? []
  const plan = addRemotePlan(name, url, existing)
  if ('error' in plan) {
    $.ui.toast(plan.error)
    return
  }
  await runAction($, plan.args, `Remote ${plan.args[2]} added`)
}

// The trimmed name when it is a valid new branch name; a toast and null otherwise.
async function branchName($: EngineInterface, value: string): Promise<string | null> {
  const name = value.trim()
  if (isBranchNameCandidate(name) && (await git($, ['check-ref-format', '--branch', name])).exitCode === 0) return name
  $.ui.toast(`Invalid branch name: "${truncate(name, 40)}"`)
  return null
}

async function createBranch($: EngineInterface, hash: string, value: string): Promise<void> {
  const name = await branchName($, value)
  if (name) await runAction($, ['branch', name, hash], `Branch ${name} created at ${short(hash)}`)
}

async function renameBranch($: EngineInterface, from: string, value: string): Promise<void> {
  const name = await branchName($, value)
  if (name) await runAction($, renameArgs(from, name), `Branch ${from} renamed to ${name}`)
}

const localBranch = (refs: Ref[]) => refs.find(r => (r.kind === 'head' && r.name !== 'HEAD') || r.kind === 'branch')?.name
const isCheckedOut = (refs: Ref[]) => refs.some(r => r.kind === 'head' && r.name !== 'HEAD')
const LANE_FALLBACK: string = PALETTE[0] ?? SPINNER_COLOR
const laneColor = (cells: Cell[]) => PALETTE[(cells.find(c => c.ch === '●' || c.ch === '○')?.color ?? 0) % PALETTE.length] ?? LANE_FALLBACK

function groupCells(cells: Cell[]): { text: string; color: number }[] {
  const groups: { text: string; color: number }[] = []
  for (const cell of cells) {
    const last = groups[groups.length - 1]
    if (last && (last.color === cell.color || cell.ch === ' ')) last.text += cell.ch
    else groups.push({ text: cell.ch, color: cell.color })
  }
  return groups
}

type Ctx = {
  els: ReturnType<EngineInterface['ui']['resolve']>
  graph: Graph
  view: View
  detail: CommitDetail | null
  cols: number
  graphMax: number
  graphWidth: number
  now: number
  isRound: boolean
  icons: (typeof ICONS)['plain']
  repos: Repos
  // Fields where the surface has them (not mobile).
  Input: Elements['terminal']['Input'] | undefined
  // Only the terminal and the desktop draw a `Client` (vscode's table holds a stub); elsewhere pills are Text.
  Client: Elements['terminal']['Client'] | undefined
  // The desktop: plain Buttons are drawn by ./tap.tsx there (see tapButtons).
  isDesktop: boolean
}

function pillProps({ isRound }: Ctx, badge: Badge, lane: string): PillProps {
  const { name, remotes } = badgeParts(badge)
  return {
    name,
    remotes,
    bg: BADGE_BG[badge.kind] ?? lane,
    fg: BADGE_FG,
    isBold: badge.kind === 'head' || badge.kind === 'detached',
    isRound,
  }
}

// The pill ./pill.tsx draws, for surfaces without `Client`.
const renderPill = ({ els: { Text } }: Ctx, p: PillProps) => drawPill(Text as ClientElements['Text'], p)

// A pill that names something other than a ref: a hash, the current branch, a remote, `+N`.
const plainPill = ({ isRound }: Ctx, name: string, bg: string, isBold = false): PillProps => ({
  name,
  remotes: '',
  bg,
  fg: BADGE_FG,
  isBold,
  isRound,
})

function copyButton($: EngineInterface, { els: { Button } }: Ctx, key: string, label: string, text: string, copied: string, close = false) {
  return (
    <Button key={key} onPress={async pe => {
      const res = await $.ui.copy({ text, surface: pe.surface })
      $.ui.toast(res.isCopied ? copied : 'Could not copy')
      if (close) await update($, viewState, v => ({ ...v, menu: null }))
    }}>
      {label}
    </Button>
  )
}

// The fixed-width boxes right of the Description column, a row's and the header's alike: Author,
// Commit and the edge's cell. Being boxes, they hold their cells whatever the pills before them draw.
function rightColumns({ els: { Box, Text }, cols }: Ctx, author: string, hash: string) {
  return [
    authorCol(cols) > 0 && (
      <Box width={authorCol(cols)} flexShrink={0}>
        <Text dimColor>{author}</Text>
      </Box>
    ),
    <Box width={hashCol(cols)} flexShrink={0}>
      <Text dimColor>{hash}</Text>
    </Box>,
    <Box width={EDGE_SAFETY} flexShrink={0}>
      <Text> </Text>
    </Box>,
  ]
}

// One row of the pane, exactly one terminal row tall whatever it holds.
function line({ els: { Box } }: Ctx, children: RenderChildren, gap = 0, justify?: 'space-between') {
  return (
    <Box height={1} overflow="hidden" flexDirection="row" gap={gap} justifyContent={justify}>
      {children}
    </Box>
  )
}

const rule = (ctx: Ctx) => line(ctx, <ctx.els.Text dimColor>{'─'.repeat(Math.max(0, ctx.cols))}</ctx.els.Text>)

const headName = (graph: Graph) => graph.branch || (graph.head ? short(graph.head) : '—')

// An on/off switch: the icon in green when on, the label dimmed when off.
function switchButton({ els: { Button, Text }, icons }: Ctx, key: string, label: string, isOn: boolean, onPress: () => Promise<unknown>) {
  return (
    <Button key={key} plain onPress={onPress}>
      <Text color={isOn ? 'success' : undefined} dimColor={!isOn}>{isOn ? icons.on : icons.off}</Text>
      <Text dimColor={!(isOn)}> {label}</Text>
    </Button>
  )
}

// Presses of the desktop's Text-drawn buttons, by Button key: the closures stay here, since a
// Client can only post a message. Rebuilt on every render.
const taps = new Map<string, () => unknown>()

// A Button's children flattened to coloured runs, a Text's colours passed down to what it holds.
function runsOf(node: unknown, inherit: Omit<TapRun, 't'> = {}): TapRun[] {
  if (node === null || node === undefined || typeof node === 'boolean') return []
  if (typeof node === 'string' || typeof node === 'number') return [{ ...inherit, t: String(node) }]
  if (Array.isArray(node)) return node.flatMap(n => runsOf(n, inherit))
  const el = node as { type?: string; props?: Record<string, unknown>; children?: unknown }
  if (el.type !== 'Text') return []
  const p = el.props ?? {}
  const next: Omit<TapRun, 't'> = { ...inherit }
  if (typeof p.color === 'string') next.color = p.color
  if (p.dimColor === true) next.dim = true
  if (typeof p.backgroundColor === 'string') next.backgroundColor = p.backgroundColor
  if (p.weight === 'bold' || p.weight === 'semibold') next.weight = 'bold'
  if (p.italic === true) next.italic = true
  return runsOf(el.children, next)
}

// The columns (graph, pills, subject, author, age) are padded by character count, which lines up
// only in a monospaced face. The terminal always has one; the desktop draws a proportional face
// unless a Text asks for `mono`, so every Text there asks.
function monoText(els: Ctx['els']): Ctx['els'] {
  const Native = els.Text as (props: any) => any
  return { ...els, Text: (props: any) => Native({ mono: true, ...props }) } as Ctx['els']
}

// On the desktop every plain Button is drawn as Text by ./tap.tsx (see there for why); the
// terminal keeps the real Button, which the keyboard focus walks.
function tapButtons(els: Ctx['els'], Client: NonNullable<Ctx['Client']>): Ctx['els'] {
  const Native = els.Button as (props: any) => any
  const Button = (props: any) => {
    if (!props.plain || typeof props.key !== 'string') return Native(props)
    taps.set(props.key, props.onPress)
    return <Client key={`tap:${props.key}`} module="./tap.tsx" props={{ runs: runsOf(props.children) }} />
  }
  return { ...els, Button } as Ctx['els']
}

const blank = (ctx: Ctx) => line(ctx, <ctx.els.Text> </ctx.els.Text>)

// An Input's label drawn as a Text beside it, in the pane's own text colour.
const labeled = ({ els: { Box, Text } }: Ctx, label: string, input: RenderChildren) => (
  <Box flexDirection="row">
    <Text>{label} </Text>
    {input}
  </Box>
)

// An icon Button's label, a space each side so the click target is wider than the glyph.
const iconLabel = (ctx: Ctx, glyph: string) => (ctx.icons === ICONS.nerd ? ` ${glyph}  ` : ` ${glyph} `)
// The cells an icon takes: a Nerd Font icon two, as above.
const iconCells = (ctx: Ctx) => (ctx.icons === ICONS.nerd ? 2 : 1)

// Header rows, each one row tall: toolbar, search (where fields exist), column titles, rule.
function renderHeader($: EngineInterface, ctx: Ctx) {
  const { els, graph, view, cols, graphWidth, icons } = ctx
  const { Box, Text, Button } = els
  const { Input, repos } = ctx
  const isAll = view.scope === 'all'
  const headRow = graph.rows.find(r => r.commit.hash === graph.head)
  const count = graph.rows.length - (graph.dirty ? 1 : 0)
  const head = headName(graph)
  const lines = [
    <Box height={1} overflow="hidden" flexDirection="row" justifyContent="space-between" columnGap={2}>
      {/* With several repos, the repo comes first: its options open as rows below the header's first row. */}
      {repos.list.length > 1 && (
        <Box flexShrink={0}>
          <Button key="repo" plain onPress={() => togglePicker($)}>
            <Text dimColor={!(repos.isPicking)}>{`repo: ${repoLabel(repos.active)} ${repos.isPicking ? '▴' : '▾'}`}</Text>
          </Button>
        </Box>
      )}
      <Box flexShrink={1} flexGrow={1} overflow="hidden">
        <Text wrap="truncate-end">
          {renderPill(ctx, plainPill(ctx, `⎇ ${head}`, headRow ? laneColor(headRow.cells) : LANE_FALLBACK, true))}
          <Text dimColor>
            {' '}
            {count}
            {graph.hasMore ? '+' : ''} commits
          </Text>
          {graph.dirty > 0 && <Text color="warning">{`  ● ${graph.dirty} ${graph.dirty === 1 ? 'change' : 'changes'}`}</Text>}
        </Text>
      </Box>
      <Box flexDirection="row" gap={2} flexShrink={0}>
        {switchButton(ctx, 'scope', 'all branches', isAll, async () => {
          await update($, viewState, (v): View => ({ ...v, ...CLOSED, scope: v.scope === 'all' ? 'head' : 'all', limit: PAGE, selected: null }))
          await load($)
        })}
        <Box flexDirection="row">
          {Input && (
            <Button key="search-toggle" plain onPress={() => update($, viewState, v => ({ ...v, isSearching: !v.isSearching }))}>
              <Text dimColor={!(view.isSearching)}>{iconLabel(ctx, icons.search)}</Text>
            </Button>
          )}
          <Button key="settings" plain onPress={async () => {
            await update($, viewState, v => ({ ...v, ...CLOSED, isSettings: true, selected: null }))
            await loadSettings($)
          }}>
            <Text dimColor>{iconLabel(ctx, icons.settings)}</Text>
          </Button>
          <Button key="fetch" plain onPress={() => runActions($, [['fetch', '--all']], 'Fetched all remotes ✓', 'Fetching all remotes…', true)}>
            <Text dimColor>{iconLabel(ctx, icons.fetch)}</Text>
          </Button>
          {view.refresh === 'running' && renderSpinner(ctx, 'refresh-spinner')}
          <Button key="refresh" plain onPress={() => refreshAll($)}>
            {view.refresh === 'done' ? <Text color="success"> ✓ </Text> : <Text dimColor>{iconLabel(ctx, icons.refresh)}</Text>}
          </Button>
        </Box>
      </Box>
    </Box>,
  ]
  if (repos.isPicking)
    for (const path of repos.list) {
      const label = `  ${path === repos.active ? '●' : '○'} ${repoLabel(path)}`
      lines.push(
        line(
          ctx,
          // The branch goes inside the Button, as a dim Text child: a sibling of the Button on the row is not drawn.
          <Button key={`repo-option:${path}`} plain onPress={() => selectRepo($, path)}>
            <Text dimColor={!(path === repos.active)}>{label}</Text>
            <Text dimColor>{branchColumn(label, repos.branches[path], cols)}</Text>
          </Button>,
        ),
      )
    }
  if (Input && view.isSearching)
    lines.push(
      line(
        ctx,
        labeled(ctx, `${icons.search} `, <Input key="search" placeholder="find commit by hash" submitLabel="find" autoFocus onSubmit={value => searchCommit($, value)} />),
      ),
    )
  if (cols >= COMPACT_COLS)
    lines.push(
      line(ctx, [
        <Box width={graphWidth + 1} flexShrink={0}>
          <Text> </Text>
        </Box>,
        <Box width={descriptionCol(cols, graphWidth)} flexShrink={0} overflow="hidden">
          <Text dimColor>Description</Text>
        </Box>,
        ...rightColumns(ctx, authorHeader(), hashHeader(cols)),
      ]),
    )
  lines.push(rule(ctx))
  return { node: <Box flexDirection="column">{lines}</Box>, height: lines.length }
}

function renderRow($: EngineInterface, ctx: Ctx, { commit, cells }: GraphRow) {
  const { els, view, cols, graphMax, graphWidth } = ctx
  const { Box, Text, Button } = els
  const { Client } = ctx
  const fitted = fitGraph(cells, graphMax)
  const graphText = groupCells(fitted).map(g => <Text color={PALETTE[g.color % PALETTE.length]}>{g.text}</Text>)
  const pad = ' '.repeat(graphWidth - fitted.length + 1)
  if (commit.hash === UNCOMMITTED)
    return line(
      ctx,
      <Text>
        {graphText}
        {pad}
        <Text italic color="warning">
          {commit.subject}
        </Text>
      </Text>,
    )
  const lane = laneColor(cells)
  // Pills get what is left once the subject keeps its minimum; the rest become `+N`.
  const fixed = graphWidth + 1 + rightCols(cols)
  const { shown, hidden, width } = fitBadges(badgesOf(commit.refs), Math.max(0, cols - fixed - MIN_SUBJECT))
  const more = hidden > 0 ? `+${hidden}` : ''
  const room = subjectRoom(cols, graphWidth, width)
  const isSelected = view.selected === commit.hash
  // With `Client`, each pill is its own instance so a right click opens its menu.
  const pills = [
    ...shown.map((b, i) => (
      <Box flexShrink={0}>
        {Client ? (
          <Client key={`pill:${commit.hash}:${i}`} module="./pill.tsx" props={pillProps(ctx, b, lane)} />
        ) : (
          renderPill(ctx, pillProps(ctx, b, lane))
        )}
      </Box>
    )),
    more && <Box flexShrink={0}>{renderPill(ctx, plainPill(ctx, more, REMOTE_BG))}</Box>,
  ]
  return (
    <Box key={`rowbox:${commit.hash}`} height={1} overflow="hidden" flexDirection="row">
      <Box width={graphWidth + 1} flexShrink={0}>
        <Text>
          {graphText}
          {pad}
        </Text>
      </Box>
      {ctx.isDesktop && Client
        ? // On the desktop a Client's region is clipped narrower than what it draws, so whatever
          // sits at its end is lost: the Client (./tap.tsx) draws only the subject, cut by the
          // Description box, and Author and Commit are the pane's own fixed boxes, like the header's.
          [
            <Box width={descriptionCol(cols, graphWidth)} flexShrink={0} overflow="hidden" flexDirection="row">
              {pills}
              {(taps.set(commit.hash, () => select($, commit.hash)),
              (
                <Client
                  key={`tap:${commit.hash}`}
                  module="./tap.tsx"
                  props={{ runs: [{ t: truncate(commit.subject, room), ...(isSelected ? { backgroundColor: SELECTED_BG, weight: 'bold' as const } : {}) }] }}
                />
              ))}
            </Box>,
            ...rightColumns(ctx, authorCell(cols, commit.author), hashCell(cols, commit.hash)),
          ]
        : [
            // In the terminal the subject, the author and the hash are one Button, so one element
            // draws them and they stay in step.
            <Box width={descriptionCol(cols, graphWidth) + authorCol(cols) + hashCol(cols)} flexShrink={0} overflow="hidden" flexDirection="row">
              {pills}
              <Button key={commit.hash} plain onPress={() => select($, commit.hash)}>
                <Text backgroundColor={isSelected ? SELECTED_BG : undefined} weight={isSelected ? 'bold' : undefined}>
                  {truncate(commit.subject, room).padEnd(room)}
                </Text>
                {authorCol(cols) > 0 && <Text dimColor>{authorCell(cols, commit.author)}</Text>}
                <Text dimColor>{hashCell(cols, commit.hash)}</Text>
              </Button>
            </Box>,
            <Box width={EDGE_SAFETY} flexShrink={0}>
              <Text> </Text>
            </Box>,
          ]}
    </Box>
  )
}

// A destructive action: the first press arms it, the second runs it.
function confirmButton($: EngineInterface, { els: { Button }, view }: Ctx, key: string, armKey: string, label: string, run: () => Promise<void>) {
  const armed = view.confirm === armKey
  return (
    <Button key={key} variant={armed ? 'primary' : undefined} onPress={async () => {
      if (armed) await run()
      else await update($, viewState, v => ({ ...v, confirm: armKey }))
    }}>
      {armed ? `Confirm: ${label.replace(/…$/, '')}?` : label}
    </Button>
  )
}

// The spinner where the surface draws a `Client`, an hourglass elsewhere.
function renderSpinner({ els, Client }: Ctx, key = 'spinner') {
  const props: SpinnerProps = { color: SPINNER_COLOR }
  return Client ? <Client key={key} module="./spinner.tsx" props={props} /> : <els.Text dimColor>⏳</els.Text>
}

function renderRunning(ctx: Ctx, key = 'spinner') {
  const { els, view } = ctx
  return line(
    ctx,
    <els.Box flexDirection="row">
      {renderSpinner(ctx, key)}
      <els.Text> {view.running}</els.Text>
    </els.Box>,
  )
}

function renderPushChooser($: EngineInterface, ctx: Ctx, badge: Badge, item: MenuItem) {
  const { els: { Text, Button }, graph, view } = ctx
  const chosen = graph.remotes.filter(r => view.push?.includes(r))
  const isAll = chosen.length === graph.remotes.length
  const setPush = (fn: (sel: string[]) => string[]) => update($, viewState, v => ({ ...v, push: fn(v.push ?? []) }))
  return [
    line(ctx, <Text dimColor>Push {badge.label} to:</Text>),
    line(
      ctx,
      [
        ...graph.remotes.map(r => (
          <Button key={`push-remote-${r}`} plain onPress={() => setPush(sel => (sel.includes(r) ? sel.filter(x => x !== r) : [...sel, r]))}>
            <Text>{chosen.includes(r) ? '☑' : '☐'} {r}</Text>
          </Button>
        )),
        graph.remotes.length > 1 && (
          <Button key="push-remote-all" plain onPress={() => setPush(() => (isAll ? [] : graph.remotes))}>
            <Text>{isAll ? '☑' : '☐'} all</Text>
          </Button>
        ),
      ],
      2,
    ),
    line(
      ctx,
      [
        chosen.length ? (
          <Button key="push-run" variant="primary" onPress={() =>
            runActions(
              $,
              pushRuns(item, chosen),
              `Pushed ${badge.label} to ${chosen.join(', ')} ✓`,
              `Pushing ${badge.label} to ${chosen.join(', ')}…`,
              true,
            )
          }>
            Push to {chosen.join(', ')}
          </Button>
        ) : (
          <Text dimColor>Select at least one remote</Text>
        ),
        <Button key="push-cancel" plain onPress={() => update($, viewState, v => ({ ...v, push: null }))}>
          <Text dimColor>cancel</Text>
        </Button>,
      ],
      2,
    ),
  ]
}

function renderMenuItem($: EngineInterface, ctx: Ctx, badge: Badge, item: MenuItem) {
  const { Button } = ctx.els
  const key = `menu-${item.id}`
  if (item.copy !== undefined) return copyButton($, ctx, key, item.label, item.copy, `Copied "${item.copy}"`, true)
  if (item.pushArgs)
    return (
      <Button key={key} variant={ctx.view.push ? 'primary' : undefined} onPress={() =>
        update($, viewState, v => ({ ...v, push: v.push ? null : defaultPushRemotes(badge, ctx.graph.remotes), isRenaming: false, confirm: null }))
      }>
        {item.label}
      </Button>
    )
  if (item.deleteBranch !== undefined)
    return (
      <Button key={key} variant={ctx.view.isDeleting ? 'primary' : undefined} onPress={() =>
        update($, viewState, v => ({ ...v, isDeleting: !v.isDeleting, isForce: false, isRenaming: false, push: null, confirm: null }))
      }>
        {item.label}
      </Button>
    )
  if (item.isRename)
    return (
      <Button key={key} onPress={() => update($, viewState, v => ({ ...v, isRenaming: !v.isRenaming, confirm: null }))}>
        {item.label}
      </Button>
    )
  const runs = item.runs ?? []
  return confirmButton($, ctx, key, `menu:${item.id}:${badge.kind}:${badge.label}`, item.label, () =>
    runActions($, [runs], `${item.label}: ${badge.label} ✓`, `${item.label}: ${badge.label}…`, item.isNetwork),
  )
}

// A framed box exactly `rows.length + 2` rows tall: the border, then one row each.
function framed({ els: { Box } }: Ctx, color: string, indent: number, rows: RenderChildren[]) {
  const height = rows.length + 2
  return {
    node: (
      <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1} marginLeft={indent} height={height} overflow="hidden" flexShrink={0}>
        {rows}
      </Box>
    ),
    height,
  }
}

// A framed Button's chrome around its label, in cells.
const BUTTON_CHROME = 4
// The cells a framed Button takes; armed, it reads `Confirm: …?`.
const buttonWidth = (label: string, isArmed: boolean) => (isArmed ? `Confirm: ${label}?` : label).length + BUTTON_CHROME

// Framed Buttons inside a framed box, on as many rows as its width needs, none cut off.
function buttonRows({ els: { Box }, cols, graphWidth }: Ctx, key: string, items: BarItem[]) {
  return wrapRows(items.map(i => i.width), cols - graphWidth - 1 - 4, 1).map((row, n) => (
    <Box key={`${key}-${n}`} height={1} overflow="hidden" flexDirection="row" columnGap={1}>
      {row.map(i => items[i]?.node)}
    </Box>
  ))
}

function renderMenu($: EngineInterface, ctx: Ctx, { cells }: GraphRow, badge: Badge) {
  const { els, graph, view } = ctx
  const { Text, Button } = els
  const { Input } = ctx
  const lane = laneColor(cells)
  const items = menuFor(badge, graph.remotes)
  const push = items.find(i => i.pushArgs)
  const rows: RenderChildren[] = [
    line(
      ctx,
      [
        <Text>{renderPill(ctx, pillProps(ctx, badge, lane))}</Text>,
        <Button key="menu-close" plain onPress={() => update($, viewState, v => ({ ...v, menu: null, isRenaming: false }))}>
          <Text dimColor>close</Text>
        </Button>,
      ],
      0,
      'space-between',
    ),
  ]
  if (view.running) rows.push(renderRunning(ctx))
  else {
    // An armed item is measured with its longer `Confirm: …?`.
    const isArmed = (item: MenuItem) => view.confirm?.startsWith(`menu:${item.id}:`) === true
    rows.push(...buttonRows(ctx, 'menu-items', items.map(item => ({ node: renderMenuItem($, ctx, badge, item), width: buttonWidth(item.label, isArmed(item)) }))))
    if (view.push && push) rows.push(...renderPushChooser($, ctx, badge, push))
    const branch = items.find(i => i.deleteBranch !== undefined)?.deleteBranch
    if (view.isDeleting && branch !== undefined)
      rows.push(
        line(
          ctx,
          [
            switchButton(ctx, 'menu-opt-force', 'force (deletes unmerged work)', view.isForce, () => update($, viewState, v => ({ ...v, isForce: !v.isForce }))),
            confirmButton($, ctx, 'menu-delete-run', `delete-branch:${branch}`, `Delete ${branch}`, () =>
              runAction($, deleteBranchArgs(branch, view.isForce), `Deleted ${branch}`),
            ),
          ],
          2,
        ),
      )
    if (view.isRenaming && Input)
      rows.push(
        line(ctx, labeled(ctx, "New name:", <Input key="rename" value={badge.label} submitLabel="rename" autoFocus onSubmit={value => renameBranch($, badge.label, value)} />)),
      )
  }
  return framed(ctx, BADGE_BG[badge.kind] ?? lane, ctx.graphWidth + 1, rows)
}

function renderFiles(ctx: Ctx, files: FileStat[]) {
  const { els: { Text }, cols } = ctx
  const adds = files.reduce((n, f) => n + (f.adds ?? 0), 0)
  const dels = files.reduce((n, f) => n + (f.dels ?? 0), 0)
  const pathRoom = Math.max(10, cols - ctx.graphWidth - 5 - 12 - BAR_W - 2)
  return [
    line(
      ctx,
      <Text>
        <Text weight="bold">{files.length} {files.length === 1 ? 'file' : 'files'}</Text>
        <Text color={ADD_COLOR}>{`  +${adds}`}</Text>
        <Text color={DEL_COLOR}>{` −${dels}`}</Text>
      </Text>,
    ),
    ...files.slice(0, MAX_FILES).map(f => {
      const bar = diffBar(f.adds, f.dels, BAR_W)
      return line(
        ctx,
        <Text>
          {truncate(f.path, pathRoom).padEnd(pathRoom)}
          {f.adds === null ? (
            <Text dimColor>{'bin'.padStart(12)}</Text>
          ) : (
            <Text>
              <Text color={ADD_COLOR}>{`+${f.adds}`.padStart(6)}</Text>
              <Text color={DEL_COLOR}>{` −${f.dels}`.padEnd(6)}</Text>
            </Text>
          )}{' '}
          <Text color={ADD_COLOR}>{'+'.repeat(bar.adds)}</Text>
          <Text color={DEL_COLOR}>{'−'.repeat(bar.dels)}</Text>
        </Text>,
      )
    }),
    ...(files.length > MAX_FILES ? [line(ctx, <Text dimColor>… and {files.length - MAX_FILES} more files</Text>)] : []),
  ]
}

function renderDetail($: EngineInterface, ctx: Ctx, { commit, cells }: GraphRow) {
  const { els, detail, graph, view } = ctx
  const { Text, Button } = els
  const { Input } = ctx
  const branch = localBranch(commit.refs)
  const lane = laneColor(cells)
  const badges = badgesOf(commit.refs).filter(b => b.kind !== 'detached')
  const [subject = '', ...rest] = (detail?.body ?? commit.subject).split('\n')
  const body = rest.join('\n').trim().split('\n').filter((l, i, all) => l !== '' || (i > 0 && all[i - 1] !== ''))
  // The card's text room in cells (its indent, border and padding taken out). The desktop does not
  // cut a long line at the edge as the terminal does, so each line is cut here, with an ellipsis.
  const inner = Math.max(10, ctx.cols - ctx.graphWidth - 1 - 4)
  const rows: RenderChildren[] = [
    line(
      ctx,
      <Text wrap="truncate-end">
        {renderPill(ctx, plainPill(ctx, short(commit.hash), lane, true))}
        <Text weight="bold">{truncate(subject, inner - short(commit.hash).length - PILL_PAD)}</Text>
      </Text>,
    ),
  ]
  if (detail === null) rows.push(line(ctx, <Text dimColor>Loading details…</Text>))
  else {
    rows.push(
      line(
        ctx,
        <Text dimColor wrap="truncate-end">
          {truncate(`${detail.author} <${detail.email}> · ${absTime(detail.time)} (${relTime(ctx.now, detail.time)}) · ${detail.hash}`, inner)}
        </Text>,
      ),
    )
    if (body.length && body[0] !== '') {
      rows.push(blank(ctx), ...body.slice(0, BODY_LINES).map(l => line(ctx, <Text wrap="truncate-end">{truncate(l, inner)}</Text>)))
      if (body.length > BODY_LINES) rows.push(line(ctx, <Text dimColor>…</Text>))
    }
    rows.push(blank(ctx), ...renderFiles(ctx, detail.files))
  }
  if (badges.length)
    rows.push(
      blank(ctx),
      line(
        ctx,
        [
          <Text dimColor>Refs:</Text>,
          ...badges.map((b, i) => (
            <Button key={`refmenu-${i}`} plain onPress={() => openMenu($, commit.hash, b)}>
              <Text>⋯ {b.label}</Text>
            </Button>
          )),
        ],
        1,
      ),
    )
  rows.push(blank(ctx))
  if (view.running) rows.push(view.menu ? blank(ctx) : renderRunning(ctx))
  else {
    const confirmItem = (key: string, armKey: string, label: string, run: () => Promise<void>): BarItem => ({
      node: confirmButton($, ctx, key, armKey, label, run),
      width: buttonWidth(label, view.confirm === armKey),
    })
    const head = headName(graph)
    const actions = [
      { node: copyButton($, ctx, 'copy', 'Copy hash', commit.hash, `Copied hash ${short(commit.hash)}`), width: buttonWidth('Copy hash', false) },
      !isCheckedOut(commit.refs) &&
        confirmItem('checkout', `checkout:${commit.hash}`, `Checkout ${branch ?? '(detached)'}`, () =>
          runAction($, (branch && checkoutArgs({ kind: 'branch', label: branch, remotes: [] })) || ['checkout', '--detach', commit.hash], `Checked out ${branch ?? short(commit.hash)}`),
        ),
      commit.hash !== graph.head &&
        confirmItem('pick', `pick:${commit.hash}`, 'Cherry-pick', () => runAction($, ['cherry-pick', commit.hash], `Cherry-picked ${short(commit.hash)}`)),
      // Moves the current branch here and keeps the changes staged; a commit left
      // behind stays in the graph while a ref (a pushed branch) keeps it, to reset back to.
      commit.hash !== graph.head &&
        confirmItem('reset', `reset:${commit.hash}`, `Reset ${head} here (soft)`, () =>
          runAction($, ['reset', '--soft', commit.hash], `Reset ${head} to ${short(commit.hash)}: changes kept staged`),
        ),
    ].filter((a): a is BarItem => a !== false)
    rows.push(...buttonRows(ctx, 'detail-actions', actions))
    if (Input)
      rows.push(line(ctx, labeled(ctx, "New branch here:", <Input key="new-branch" placeholder="branch-name" submitLabel="create" onSubmit={value => createBranch($, commit.hash, value)} />)))
  }
  return framed(ctx, lane, ctx.graphWidth + 1, rows)
}

function renderSettings($: EngineInterface, ctx: Ctx, settings: RepoSettings | null) {
  const { els, view, cols } = ctx
  const { Box, Text, Button } = els
  const { Input } = ctx
  const scopeButton = (scope: ConfigScope, label: string) => (
    <Button key={`scope-${scope}`} plain onPress={() => update($, viewState, v => ({ ...v, configScope: scope }))}>
      <Text>{view.configScope === scope ? '◉' : '○'} {label}</Text>
    </Button>
  )
  const both = (key: 'name' | 'email') => `local: ${settings?.local[key] || '—'} · global: ${settings?.global[key] || '—'}`
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Text weight="bold">{ctx.icons.settings} Repository settings</Text>
        <Button key="settings-back" plain onPress={() => update($, viewState, v => ({ ...v, isSettings: false }))}>
          <Text dimColor>← graph</Text>
        </Button>
      </Box>
      {rule(ctx)}
      {settings === null ? (
        <Text dimColor>Loading…</Text>
      ) : (
        <Box flexDirection="column" gap={1}>
          <Box flexDirection="column">
            <Text weight="bold">User</Text>
            <Text dimColor>name   {both('name')}</Text>
            <Text dimColor>email  {both('email')}</Text>
            <Box flexDirection="row" gap={2} marginTop={1}>
              <Text dimColor>Save to:</Text>
              {scopeButton('local', 'this repository')}
              {scopeButton('global', 'global')}
            </Box>
            {Input && !view.running && (
              <Box flexDirection="column">
                {labeled(ctx, "Name:", <Input key="cfg-name" value={settings[view.configScope].name} submitLabel="save" onSubmit={value => setUser($, view.configScope, 'name', value)} />)}
                {labeled(ctx, "Email:", <Input key="cfg-email" value={settings[view.configScope].email} submitLabel="save" onSubmit={value => setUser($, view.configScope, 'email', value)} />)}
              </Box>
            )}
          </Box>
          <Box flexDirection="column">
            <Text weight="bold">Remotes</Text>
            {settings.remotes.length === 0 && <Text dimColor>No remotes.</Text>}
            {settings.remotes.map(r => (
              <Box flexDirection="column">
                <Box height={1} overflow="hidden" flexDirection="row">
                  <Box flexShrink={0}>{renderPill(ctx, plainPill(ctx, r.name, REMOTE_BG, true))}</Box>
                  <Text dimColor>{truncateMiddle(r.fetchUrl, Math.max(10, cols - r.name.length - PILL_PAD))}</Text>
                </Box>
                {r.pushUrl && r.pushUrl !== r.fetchUrl && (
                  <Text dimColor>{`  push: ${truncateMiddle(r.pushUrl, Math.max(10, cols - 8))}`}</Text>
                )}
                {!view.running && (
                  <Box flexDirection="row" gap={1} marginLeft={2}>
                    <Button key={`remote-fetch-${r.name}`} plain onPress={() => runAction($, ['fetch', r.name], `Fetched ${r.name} ✓`, true)}>
                      <Text dimColor>fetch</Text>
                    </Button>
                    <Button key={`remote-edit-${r.name}`} plain onPress={() =>
                      update($, viewState, v => ({ ...v, editingRemote: v.editingRemote === r.name ? null : r.name }))
                    }>
                      <Text dimColor>edit URL</Text>
                    </Button>
                    {confirmButton($, ctx, `remote-delete-${r.name}`, `remote-delete:${r.name}`, 'Delete', () =>
                      runAction($, ['remote', 'remove', r.name], `Remote ${r.name} removed`),
                    )}
                  </Box>
                )}
                {Input && view.editingRemote === r.name && !view.running && (
                  labeled(ctx, "New URL:", <Input key={`remote-url-${r.name}`} value={r.fetchUrl} submitLabel="save" autoFocus onSubmit={value => setRemoteUrl($, r.name, value)} />)
                )}
              </Box>
            ))}
            {view.running ? (
              renderRunning(ctx)
            ) : (
              <Box flexDirection="column" marginTop={1}>
                <Button key="remote-add" plain onPress={() =>
                  update($, viewState, v => ({ ...v, isAddingRemote: !v.isAddingRemote, remoteDraft: '' }))
                }>
                  <Text>+ Add remote</Text>
                </Button>
                {Input && view.isAddingRemote && (
                  <Box flexDirection="column">
                    {labeled(ctx, "Name:", <Input
                      key="remote-new-name"
                      placeholder="origin"
                      submitLabel="next"
                      autoFocus
                      onInput={value => update($, viewState, v => ({ ...v, remoteDraft: value }))}
                      onSubmit={value => update($, viewState, v => ({ ...v, remoteDraft: value }))}
                    />)}
                    {labeled(ctx, `URL for ${view.remoteDraft.trim() || 'origin'}:`, <Input key="remote-new-url" placeholder="git@github.com:user/repo.git" submitLabel="add" onSubmit={value => addRemote($, value)} />)}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

type BarItem = { node: RenderChildren; width: number }

async function renderPane($: EngineInterface, hostEls: Ctx['els'], surface: string, isDocked: boolean, cols: number, scroll: { offset: number; bodyRows: number }) {
  const els = surface === 'desktop' ? monoText(hostEls) : hostEls
  const { Box, Text } = els
  // Only the graph scrolls its own rows; any other screen lets the engine scroll.
  ownScroll = null
  const [cache, view, detail, isRound, repos] = await Promise.all([
    readCache($),
    read($, viewState),
    read($, detailState),
    read($, roundState),
    read($, reposState),
  ])
  const { graph, indexOf } = cache
  if (graph.status === 'no-repo') return <Box padding={1}><Text dimColor>Not a git repository.</Text></Box>
  if (graph.status === 'error') return <Box padding={1}><Text color="error">Could not read git: {graph.error ?? ''}</Text></Box>

  const graphMax = Math.max(6, Math.min(40, Math.floor(cols / 3)))
  const Client = (surface === 'desktop' && 'Client' in els ? (els.Client as Elements['terminal']['Client']) : undefined)
  taps.clear()
  const ctx: Ctx = {
    els: Client ? tapButtons(els, Client) : els,
    graph,
    view,
    detail,
    cols,
    graphMax,
    graphWidth: Math.min(graphMax, cache.maxCells),
    now: Math.floor(Date.now() / 1000),
    isRound,
    icons: ICONS.plain,
    repos,
    Input: 'Input' in els ? (els.Input as Elements['terminal']['Input']) : undefined,
    Client: (surface === 'terminal' || surface === 'desktop') && 'Client' in els ? (els.Client as Elements['terminal']['Client']) : undefined,
    isDesktop: Client !== undefined,
  }
  if (view.isSettings) return <Box padding={1}>{renderSettings($, ctx, await read($, settingsState))}</Box>
  const header = renderHeader($, ctx)

  const rowOf = (hash: string | null | undefined) => (hash ? graph.rows[indexOf.get(hash) ?? -1] : undefined)
  const menuRow = rowOf(view.menu?.hash)
  const menuBox = menuRow && view.menu ? renderMenu($, ctx, menuRow, view.menu.badge) : undefined
  const selectedRow = rowOf(view.selected)
  const detailBox = selectedRow ? renderDetail($, ctx, selectedRow) : undefined
  const heights = graph.rows.map(r => 1 + (r === menuRow ? (menuBox?.height ?? 0) : 0) + (r === selectedRow ? (detailBox?.height ?? 0) : 0))
  const centered = view.scrollTo ? (indexOf.get(view.scrollTo) ?? -1) : -1
  const rows = (from: number, to: number) => [
    graph.rows.length === 0 && <Text dimColor>{graph.status === 'ready' ? 'No commits yet.' : 'Loading…'}</Text>,
    ...graph.rows.slice(from, to).map(row => (
      <Box key={`row:${row.commit.hash}`} flexDirection="column" flexShrink={0}>
        {renderRow($, ctx, row)}
        {row === menuRow && menuBox?.node}
        {row === selectedRow && detailBox?.node}
      </Box>
    )),
  ]

  // On a docked terminal pane the pane scrolls its own rows: the tree holds still at the pane's
  // height and the rows move under a fixed header and footer (an engine scroll would carry the
  // footer off and back on each step). The ui.scroll hook moves `scrollTopState`.
  if (isDocked && surface === 'terminal') {
    const viewport = Math.max(1, scroll.bodyRows - header.height - FOOTER_ROWS)
    const total = topOf(heights, heights.length)
    const top = clampTop(centered >= 0 ? topOf(heights, centered) - Math.floor(viewport / 2) : await read($, scrollTopState), total, viewport)
    const { from, to, shift } = windowAt(heights, top, viewport)
    ownScroll = { top, maxTop: Math.max(0, total - viewport) }
    return (
      <Box flexDirection="column" height={scroll.bodyRows} overflow="hidden">
        {header.node}
        <Box key="rows-window" height={viewport} flexShrink={0} overflow="hidden">
          <Box position="absolute" top={-shift} left={0} width={cols} flexDirection="column">
            {rows(from, to)}
          </Box>
        </Box>
        {renderFooter($, ctx, from, to)}
      </Box>
    )
  }

  // Elsewhere the engine scrolls the tree: only the rows in its window are drawn, spacers of
  // the same height standing for the rest, so a scroll step costs a window of rows.
  const offset = centered >= 0 ? header.height + topOf(heights, centered) - Math.floor(scroll.bodyRows / 2) : scroll.offset
  const { from, to, before, after } = visibleRange(heights, header.height, offset, scroll.bodyRows, OVERSCAN)
  return (
    <Box flexDirection="column">
      {header.node}
      {before > 0 && <Box key="space-before" height={before} flexShrink={0} />}
      {rows(from, to)}
      {after > 0 && <Box key="space-after" height={after} flexShrink={0} />}
      {renderFooter($, ctx, 0, graph.rows.length)}
    </Box>
  )
}

const FOOTER_ROWS = 2

// A rule, then the commits on screen (all of them off a docked pane) and "Load more" at the right.
function renderFooter($: EngineInterface, ctx: Ctx, from: number, to: number) {
  const { els: { Box, Button, Text }, graph } = ctx
  // The uncommitted row, first when there is one, is not a commit.
  const dirty = graph.dirty ? 1 : 0
  const count = graph.rows.length - dirty
  const last = Math.max(0, to - dirty)
  const first = Math.min(last, Math.max(1, from + 1 - dirty))
  const shown = count === 0 ? '' : first === 1 && last === count ? `${count}${graph.hasMore ? '+' : ''} commits` : `${first}–${last} of ${count}${graph.hasMore ? '+' : ''} commits`
  return (
    <Box key="footer" height={FOOTER_ROWS} flexShrink={0} flexDirection="column">
      {rule(ctx)}
      {line(
        ctx,
        [
          <Text dimColor>{shown}</Text>,
          graph.hasMore && (
            <Button key="more" plain onPress={async () => {
              await update($, viewState, v => ({ ...v, limit: v.limit + PAGE }))
              await load($)
            }}>
              <Text dimColor>Load {PAGE} more commits</Text>
            </Button>
          ),
        ],
        0,
        'space-between',
      )}
    </Box>
  )
}

async function hasNerdFont($: EngineInterface): Promise<boolean> {
  try {
    return (await $.process.run(['sh', '-c', NERD_FONT_CHECK], { timeoutMs: 3_000 })).exitCode === 0
  } catch {
    return false
  }
}

export const register: Register = (on, options) => {
  const style: BadgeStyle = options?.badges === 'round' || options?.badges === 'square' ? options.badges : 'auto'
  const autoOpen = options?.autoOpen !== false

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: PANE, description: 'Open Git Graph: the commit graph of this repository' })
    $.clock.every(POLL_MS, () => void poll($))
    const hasNerd = await hasNerdFont($)
    await update($, nerdState, () => hasNerd)
    await update($, roundState, () => (style === 'auto' ? hasNerd : style === 'round'))
    if (autoOpen) await tryOpen($)
    return next(e)
  })

  on('command.run', { command: PANE }, async $ => {
    if ((await read($, viewState)).isOpen) {
      await $.ui.close({ id: PANE })
      return { text: 'ปิดแผง Git Graph แล้ว' }
    }
    const graph = await tryOpen($)
    return { text: graph.status === 'no-repo' ? 'ไม่ได้อยู่ใน git repository' : 'เปิดแผง Git Graph แล้ว' }
  }).catch(() => ({ text: 'เกิดข้อผิดพลาดในการเปิด/ปิดแผง Git Graph' }))

  on('ui.close', { id: PANE }, async ($, e, next) => {
    await update($, viewState, v => ({ ...v, isOpen: false }))
    return next(e)
  }).catch(($, e, next) => next(e))

  // A pill posts `{ button }`: right opens its ref's menu, left selects the commit at once,
  // and a second left click on the same pill within DOUBLE_CLICK_MS checks the ref out,
  // putting back the selection the first click changed: a double click leaves no details.
  on('ui.message', { requestId: PANE }, async ($, e, next) => {
    const [kind, hash = '', index = ''] = e.element.split(':')
    const button = (e.data as { button?: string } | null)?.button
    if (kind === 'tap') {
      if (button === 'left') await taps.get(e.element.slice('tap:'.length))?.()
      return next(e)
    }
    if (kind !== 'pill') return next(e)
    const row = (await readGraph($)).rows.find(r => r.commit.hash === hash)
    const badge = row && badgesOf(row.commit.refs)[Number(index)]
    const now = Date.now()
    const isDouble = button === 'left' && lastPillClick.key === e.element && now - lastPillClick.at <= DOUBLE_CLICK_MS
    const before = lastPillClick.selected
    const { selected } = await read($, viewState)
    lastPillClick = button === 'left' && !isDouble ? { key: e.element, at: now, selected } : { key: '', at: 0, selected: null }
    if (badge && button === 'right') await openMenu($, hash, badge)
    else if (badge && isDouble) {
      // `select` toggles: selecting the clicked commit again closes what the first click opened.
      if (selected !== before) await select($, before ?? hash)
      await checkoutRef($, badge)
    } else if (button === 'left') await select($, hash)
    return next(e)
  }).catch(($, e, next) => next(e))

  // Any Bash call may have committed, switched or edited: the signature check decides.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    await poll($)
    return ran
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) =>
    renderPane($, $.ui.resolve(e), e.surface, e.props.placement === 'dock', e.props.bodyColumns, e.props.scroll),
  )

  // On a docked terminal pane the mod scrolls its own rows: the engine's window holds still
  // (no `next`), so the header and the footer never move. Elsewhere the engine scrolls.
  on('ui.scroll', { requestId: PANE }, async ($, e, next) => {
    if (!ownScroll) return next(e)
    const { top, maxTop } = ownScroll
    await update($, scrollTopState, () => Math.max(0, Math.min(top + (e.by ?? 0), maxTop)))
    // A search's centered commit lets go at the first scroll, from where it was drawn.
    if ((await read($, viewState)).scrollTo) await update($, viewState, v => ({ ...v, scrollTo: null }))
    return {}
  }).catch(($, e, next) => next(e))
}
