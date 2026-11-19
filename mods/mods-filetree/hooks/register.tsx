import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register, RenderChildren } from 'claude-code'

import type { Activity, ActivityKind, Column, Git, GitMark, Node, View } from '../types'
import { ancestors, baseName, flatten, formatDate, formatSize, HIDDEN, joinPath, markOf, parentOf, parseStatus, relPath, type Row, searchFiles } from './tree'

const PANE = 'mods-filetree'
const TITLE = 'File Tree'
const POLL_MS = 3_000
const GIT_TIMEOUT_MS = 15_000
// How long a file Claude read or wrote stays lit.
const ACTIVE_MS = 6_000
const DOUBLE_CLICK_MS = 450
const MAX_MATCHES = 200
const OVERSCAN = 15
const INDENT = 2
const FOOTER_ROWS = 2
// The right column's cells (a date is the widest) and the git mark's before it.
const RIGHT_COL = 10
const MARK_COL = 2
// One cell kept free at the right edge, where a terminal may wrap.
const EDGE = 1

// The pane draws on the terminal's own background and text colour, secondary text dimmed:
// only folders, git marks, Claude's activity and the selection carry colours of their own.
const DIR_COLOR = '#4fc1ff'
const SELECTED_BG = '#264f78'
const READ_COLOR = '#4ec9b0'
const WRITE_COLOR = '#dcdcaa'
const MARK_COLOR: Record<GitMark, string | undefined> = { M: '#e2c08d', A: '#89d185', '?': '#89d185', D: '#f48771', U: '#f48771', R: '#4ec9b0', '!': undefined }
const ICONS = { search: '⌕', collapse: '⊟', refresh: '↻', active: '◆', open: '▾', closed: '▸', branch: '⎇' }
// No git the pane runs asks for a password or opens an editor.
const GIT_ENV = { GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true', GIT_OPTIONAL_LOCKS: '0' }
const STATUS_ARGS = ['status', '--porcelain=v1', '-z', '--branch', '--ignored']
const FILES_ARGS = ['ls-files', '--cached', '--others', '--exclude-standard']
const READ_TOOLS = new Set(['Read'])
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])

const EMPTY_GIT: Git = { branch: '', marks: {}, changed: 0 }
const DEFAULT_VIEW: View = { isOpen: false, expanded: [], selected: null, isSearching: false, query: '', matches: [], column: 'size', scrollTo: null }

const rootState = atom({ plugin: 'mods-filetree', key: 'root' } as const, '')
const dirsState = atom({ plugin: 'mods-filetree', key: 'dirs' } as const, {} as Record<string, Node[]>)
const gitState = atom({ plugin: 'mods-filetree', key: 'git' } as const, EMPTY_GIT)
const activityState = atom({ plugin: 'mods-filetree', key: 'activity' } as const, {} as Activity)
const viewState = atom({ plugin: 'mods-filetree', key: 'view' } as const, DEFAULT_VIEW)
const scrollTopState = atom({ plugin: 'mods-filetree', key: 'scrollTop' } as const, 0)

let busy = false
// The last left click on a row, to tell a double click.
let lastClick = { path: '', at: 0 }
// Set while a docked terminal pane draws the tree: the pane scrolls its own rows, between `0` and `maxTop`.
let ownScroll: { top: number; maxTop: number } | null = null
// The repository's files, read when a search opens: a search reaches folders not opened yet.
let files: string[] | null = null
let gitSignature = ''
let opener: string[] | null = null

const isWindowsRoot = (root: string) => /^[A-Za-z]:[\\/]/.test(root)
const absPath = (root: string, path: string) => (path ? `${root.replace(/[\\/]+$/, '')}${isWindowsRoot(root) ? '\\' : '/'}${path.split('/').join(isWindowsRoot(root) ? '\\' : '/')}` : root)

async function git($: EngineInterface, args: string[]) {
  return $.process.run(['git', ...args], { cwd: await read($, rootState), timeoutMs: GIT_TIMEOUT_MS, env: GIT_ENV })
}

const signatureOf = (nodes: Node[]) => nodes.map(n => `${n.name}\0${n.isDir}\0${n.size}\0${n.mtimeMs}`).join('\n')

// Lists one folder; a folder gone since is dropped, with its expansion.
async function loadDir($: EngineInterface, path: string): Promise<void> {
  const root = await read($, rootState)
  try {
    const entries = await $.fs.list(absPath(root, path))
    const nodes = entries
      .filter(e => !HIDDEN.has(e.name))
      .map((e): Node => ({ name: e.name, path: joinPath(path, e.name), isDir: e.kind === 'dir', size: e.size, mtimeMs: e.mtimeMs }))
    const before = (await read($, dirsState))[path]
    if (before && signatureOf(before) === signatureOf(nodes)) return
    await update($, dirsState, d => ({ ...d, [path]: nodes }))
  } catch {
    if (path === '') return
    await update($, dirsState, ({ [path]: _, ...rest }) => rest)
    await update($, viewState, v => ({ ...v, expanded: v.expanded.filter(p => p !== path) }))
  }
}

async function loadGit($: EngineInterface): Promise<void> {
  const [status, prefix] = await Promise.all([git($, STATUS_ARGS), git($, ['rev-parse', '--show-prefix'])]).catch(() => [null, null] as const)
  const out = status?.exitCode === 0 ? status.stdout : ''
  const signature = `${out}\0${prefix?.stdout ?? ''}`
  if (signature === gitSignature) return
  gitSignature = signature
  await update($, gitState, () => (status?.exitCode === 0 ? parseStatus(out, prefix?.stdout.trim() ?? '') : EMPTY_GIT))
}

// Rereads every open folder and git: what changed redraws, what did not stays as it was.
async function refresh($: EngineInterface): Promise<void> {
  const { expanded } = await read($, viewState)
  await Promise.all([...['', ...expanded].map(p => loadDir($, p)), loadGit($)])
}

async function poll($: EngineInterface): Promise<void> {
  if (busy || !(await read($, viewState)).isOpen) return
  busy = true
  try {
    await refresh($)
  } finally {
    busy = false
  }
}

// Opens the pane on the session's folder; another folder than last time starts the tree over.
async function openPane($: EngineInterface): Promise<void> {
  const root = await $.session.cwd()
  if (root !== (await read($, rootState))) {
    await Promise.all([
      update($, rootState, () => root),
      update($, dirsState, () => ({})),
      update($, viewState, v => ({ ...v, expanded: [], selected: null, matches: [], query: '' })),
      update($, scrollTopState, () => 0),
    ])
    gitSignature = ''
    files = null
  }
  await update($, viewState, v => ({ ...v, isOpen: true }))
  await refresh($)
  await $.ui.open({ id: PANE, title: TITLE })
}

async function toggleDir($: EngineInterface, path: string): Promise<void> {
  const { expanded } = await update($, viewState, v => ({
    ...v,
    selected: path,
    expanded: v.expanded.includes(path) ? v.expanded.filter(p => p !== path && !p.startsWith(`${path}/`)) : [...v.expanded, path],
  }))
  if (expanded.includes(path) && !(await read($, dirsState))[path]) await loadDir($, path)
}

// Opens the folders down to `path` and centers it.
async function reveal($: EngineInterface, path: string, isSelecting: boolean): Promise<void> {
  const dirs = ancestors(path)
  await update($, viewState, v => ({
    ...v,
    expanded: [...new Set([...v.expanded, ...dirs])],
    scrollTo: path,
    ...(isSelecting ? { selected: path, isSearching: false, query: '', matches: [] } : {}),
  }))
  const loaded = await read($, dirsState)
  await Promise.all(dirs.filter(d => !loaded[d]).map(d => loadDir($, d)))
  // A pane scrolling its own rows draws the row centered and keeps it so until the next scroll.
  if (ownScroll) return
  try {
    await $.ui.scroll({ to: { key: `row:${path}` }, in: PANE, block: 'center' })
  } catch {
    // no surface to scroll
  }
  await update($, viewState, v => ({ ...v, scrollTo: null }))
}

// A click on a row: a folder opens or closes, a file is selected, a second click opens it.
async function press($: EngineInterface, row: Node, isMatch: boolean): Promise<void> {
  const now = Date.now()
  const isDouble = lastClick.path === row.path && now - lastClick.at <= DOUBLE_CLICK_MS
  lastClick = isDouble ? { path: '', at: 0 } : { path: row.path, at: now }
  if (isMatch) return reveal($, row.path, true)
  if (row.isDir) return toggleDir($, row.path)
  if (isDouble) return openFile($, row.path)
  await update($, viewState, v => ({ ...v, selected: row.path }))
}

// The command that opens a path in its default app.
async function openerOf($: EngineInterface, root: string): Promise<string[]> {
  if (opener) return opener
  if (isWindowsRoot(root)) return (opener = ['explorer'])
  const uname = await $.process.run(['uname'], { timeoutMs: 3_000 }).catch(() => null)
  return (opener = uname?.stdout.trim() === 'Darwin' ? ['open'] : ['xdg-open'])
}

async function openFile($: EngineInterface, path: string): Promise<void> {
  const root = await read($, rootState)
  const run = await openerOf($, root)
  // explorer answers 1 even when it opened the file, so its exit code says nothing.
  const out = await $.process.run([...run, absPath(root, path)], { cwd: root, timeoutMs: 10_000 }).catch(() => null)
  $.ui.toast(out && (out.exitCode === 0 || run[0] === 'explorer') ? `Opened ${baseName(path)}` : `Could not open ${baseName(path)}`)
}

async function search($: EngineInterface, query: string): Promise<void> {
  if (files === null) {
    const out = await git($, FILES_ARGS).catch(() => null)
    files = out?.exitCode === 0 ? out.stdout.split('\n').filter(Boolean) : null
  }
  // Outside a repository only the folders loaded so far are searched.
  const pool = files ?? flatten(await read($, dirsState), Object.keys(await read($, dirsState))).filter(r => !r.node.isDir).map(r => r.node.path)
  await update($, viewState, v => ({ ...v, query, matches: searchFiles(pool, query, MAX_MATCHES) }))
  await update($, scrollTopState, () => 0)
}

// Lights a file Claude read or wrote, and with Follow Claude opens the folders down to it.
async function touch($: EngineInterface, filePath: unknown, kind: ActivityKind, isFollowing: boolean): Promise<void> {
  if (typeof filePath !== 'string' || !(await read($, viewState)).isOpen) return
  const path = relPath(await read($, rootState), filePath)
  if (!path) return
  const at = Date.now()
  await update($, activityState, a => ({ ...a, [path]: { kind, at } }))
  $.clock.after(ACTIVE_MS + 50, () => void update($, activityState, a => Object.fromEntries(Object.entries(a).filter(([, v]) => Date.now() - v.at < ACTIVE_MS))))
  if (isFollowing) await reveal($, path, false)
}

type Ctx = {
  els: ReturnType<EngineInterface['ui']['resolve']>
  Input: Elements['terminal']['Input'] | undefined
  cols: number
  root: string
  view: View
  git: Git
  activity: Activity
  now: number
  rowCount: number
}

function line({ els: { Box } }: Ctx, children: RenderChildren, justify?: 'space-between', gap = 0) {
  return (
    <Box height={1} overflow="hidden" flexDirection="row" justifyContent={justify} gap={gap}>
      {children}
    </Box>
  )
}

const rule = (ctx: Ctx) => line(ctx, <ctx.els.Text dimColor>{'─'.repeat(Math.max(0, ctx.cols))}</ctx.els.Text>)

const truncate = (text: string, room: number) => (text.length <= room ? text : room <= 1 ? text.slice(0, room) : `${text.slice(0, room - 1)}…`)

function iconButton({ els: { Button, Text } }: Ctx, key: string, label: string, isOn: boolean, onPress: () => Promise<unknown>) {
  return (
    <Button key={key} plain onPress={onPress}>
      <Text dimColor={!isOn}>{` ${label} `}</Text>
    </Button>
  )
}

function renderHeader($: EngineInterface, ctx: Ctx) {
  const { els: { Box, Text }, Input, view, git, root } = ctx
  const lines = [
    <Box height={1} overflow="hidden" flexDirection="row" justifyContent="space-between" columnGap={2}>
      <Box flexShrink={1} flexGrow={1} overflow="hidden">
        <Text wrap="truncate-end">
          <Text color={DIR_COLOR} weight="bold">{`${ICONS.open} ${baseName(root.replace(/\\/g, '/')) || root}`}</Text>
          {git.branch && <Text dimColor>{`  ${ICONS.branch} ${git.branch}`}</Text>}
          {git.changed > 0 && <Text color="warning">{`  ● ${git.changed}`}</Text>}
        </Text>
      </Box>
      <Box flexDirection="row" flexShrink={0}>
        {Input && iconButton(ctx, 'search', ICONS.search, view.isSearching, () => update($, viewState, v => ({ ...v, isSearching: !v.isSearching, query: '', matches: [] })))}
        {iconButton(ctx, 'column', view.column, true, () => update($, viewState, (v): View => ({ ...v, column: v.column === 'size' ? 'date' : 'size' })))}
        {iconButton(ctx, 'collapse', ICONS.collapse, false, async () => {
          await update($, viewState, v => ({ ...v, expanded: [] }))
          await update($, scrollTopState, () => 0)
        })}
        {iconButton(ctx, 'refresh', ICONS.refresh, false, async () => {
          gitSignature = ''
          files = null
          await refresh($)
          $.ui.toast('File tree refreshed')
        })}
      </Box>
    </Box>,
  ]
  if (Input && view.isSearching)
    lines.push(
      line(ctx, [
        <Text>{`${ICONS.search} `}</Text>,
        <Input key="query" placeholder="find file by name" submitLabel="find" autoFocus onInput={value => search($, value)} onSubmit={value => search($, value)} />,
      ]),
    )
  lines.push(rule(ctx))
  return { node: <Box flexDirection="column">{lines}</Box>, height: lines.length }
}

function renderRow($: EngineInterface, ctx: Ctx, { node, depth }: Row, isMatch: boolean) {
  const { els: { Button, Text }, cols, view, git, activity, now } = ctx
  const mark = markOf(git, node.path)
  const lit = activity[node.path]
  const isActive = lit !== undefined && now - lit.at < ACTIVE_MS
  const isSelected = view.selected === node.path
  const lead = ' '.repeat(depth * INDENT) + (node.isDir ? `${view.expanded.includes(node.path) ? ICONS.open : ICONS.closed} ` : isActive ? `${ICONS.active} ` : '  ')
  const name = isMatch ? node.path : node.name
  // A search match's size and date are not read: its right column stays empty.
  const right = node.isDir || isMatch ? '' : view.column === 'size' ? formatSize(node.size) : formatDate(node.mtimeMs)
  const room = Math.max(1, cols - lead.length - MARK_COL - 1 - RIGHT_COL - EDGE)
  const color = isActive ? (lit.kind === 'write' ? WRITE_COLOR : READ_COLOR) : node.isDir ? DIR_COLOR : mark ? MARK_COLOR[mark] : undefined
  return (
    <Button key={`row:${node.path}`} plain onPress={() => press($, node, isMatch)}>
      <Text color={isActive ? color : undefined} dimColor={!isActive}>{lead}</Text>
      <Text color={color} dimColor={mark === '!' && !isActive} weight={isActive || isSelected ? 'bold' : undefined} backgroundColor={isSelected ? SELECTED_BG : undefined}>
        {truncate(name, room).padEnd(room)}
      </Text>
      <Text color={mark ? MARK_COLOR[mark] : undefined} dimColor={mark === '!'}>{(mark && mark !== '!' ? mark : '').padStart(MARK_COL)}</Text>
      <Text dimColor>{` ${right.padStart(RIGHT_COL)}`}</Text>
    </Button>
  )
}

// A rule, then the selected path with its actions, or what the tree holds.
function renderFooter($: EngineInterface, ctx: Ctx) {
  const { els: { Box, Button, Text }, view, git, root, rowCount } = ctx
  const selected = view.selected
  const copy = (key: string, label: string, text: string) => (
    <Button key={key} plain onPress={async pe => {
      const res = await $.ui.copy({ text, surface: pe.surface })
      $.ui.toast(res.isCopied ? `Copied ${text}` : 'Could not copy')
    }}>
      <Text dimColor>{` ${label} `}</Text>
    </Button>
  )
  const body = selected
    ? line(
        ctx,
        [
          <Box flexShrink={1} overflow="hidden">
            <Text wrap="truncate-start">{selected}</Text>
          </Box>,
          <Box flexDirection="row" flexShrink={0}>
            {copy('copy-rel', 'copy', selected)}
            {copy('copy-abs', 'copy abs', absPath(root, selected))}
            <Button key="open" plain onPress={() => openFile($, selected)}>
              <Text dimColor> open </Text>
            </Button>
          </Box>,
        ],
        'space-between',
        1,
      )
    : line(ctx, <Text dimColor>{`${view.isSearching && view.query ? `${view.matches.length}${view.matches.length === MAX_MATCHES ? '+' : ''} matches` : `${rowCount} items`}${git.changed ? ` · ${git.changed} changed` : ''}`}</Text>)
  return (
    <Box key="footer" height={FOOTER_ROWS} flexShrink={0} flexDirection="column">
      {rule(ctx)}
      {body}
    </Box>
  )
}

const clampTop = (top: number, total: number, rows: number) => Math.max(0, Math.min(top, total - rows))

async function renderPane($: EngineInterface, els: Ctx['els'], surface: string, isDocked: boolean, cols: number, scroll: { offset: number; bodyRows: number }) {
  const { Box, Text } = els
  ownScroll = null
  const [root, dirs, git, activity, view] = await Promise.all([read($, rootState), read($, dirsState), read($, gitState), read($, activityState), read($, viewState)])
  const isMatching = view.isSearching && view.query.trim() !== ''
  const rows: Row[] = isMatching
    ? view.matches.map(path => ({ node: { name: baseName(path), path, isDir: false, size: 0, mtimeMs: 0 }, depth: 0 }))
    : flatten(dirs, view.expanded)
  const ctx: Ctx = {
    els,
    Input: 'Input' in els ? (els.Input as Elements['terminal']['Input']) : undefined,
    cols,
    root,
    view,
    git,
    activity,
    now: Date.now(),
    rowCount: rows.length,
  }
  const header = renderHeader($, ctx)
  const empty = rows.length === 0 && <Text dimColor>{isMatching ? 'No files match.' : dirs[''] ? 'Empty folder.' : 'Loading…'}</Text>
  const drawn = (from: number, to: number) => rows.slice(from, to).map(row => renderRow($, ctx, row, isMatching))
  const centered = view.scrollTo ? rows.findIndex(r => r.node.path === view.scrollTo) : -1

  // On a docked terminal pane the pane scrolls its own rows between a fixed header and footer.
  if (isDocked && surface === 'terminal') {
    const viewport = Math.max(1, scroll.bodyRows - header.height - FOOTER_ROWS)
    const top = clampTop(centered >= 0 ? centered - Math.floor(viewport / 2) : await read($, scrollTopState), rows.length, viewport)
    ownScroll = { top, maxTop: Math.max(0, rows.length - viewport) }
    return (
      <Box flexDirection="column" height={scroll.bodyRows} overflow="hidden">
        {header.node}
        <Box key="rows-window" height={viewport} flexShrink={0} flexDirection="column" overflow="hidden">
          {empty}
          {drawn(top, top + viewport)}
        </Box>
        {renderFooter($, ctx)}
      </Box>
    )
  }

  // Elsewhere the engine scrolls the tree: only the rows near its window are drawn, spacers standing for the rest.
  const offset = centered >= 0 ? centered - Math.floor(scroll.bodyRows / 2) : scroll.offset - header.height
  const from = Math.max(0, Math.min(rows.length, offset - OVERSCAN))
  const to = Math.max(from, Math.min(rows.length, offset + scroll.bodyRows + OVERSCAN))
  return (
    <Box flexDirection="column">
      {header.node}
      {empty}
      {from > 0 && <Box key="space-before" height={from} flexShrink={0} />}
      {drawn(from, to)}
      {to < rows.length && <Box key="space-after" height={rows.length - to} flexShrink={0} />}
      {renderFooter($, ctx)}
    </Box>
  )
}

export const register: Register = (on, options) => {
  const autoOpen = options?.autoOpen !== false
  const isFollowing = options?.followClaude !== false
  const column: Column = options?.column === 'date' ? 'date' : 'size'

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: PANE, description: 'Open File Tree: the files of this folder, with git and what Claude touches' })
    await update($, viewState, v => ({ ...v, column }))
    $.clock.every(POLL_MS, () => void poll($))
    if (autoOpen) await openPane($)
    return next(e)
  })

  on('command.run', { command: PANE }, async $ => {
    if ((await read($, viewState)).isOpen) {
      await $.ui.close({ id: PANE })
      return { text: 'ปิดแผง File Tree แล้ว' }
    }
    await openPane($)
    return { text: 'เปิดแผง File Tree แล้ว' }
  }).catch(() => ({ text: 'เกิดข้อผิดพลาดในการเปิด/ปิดแผง File Tree' }))

  on('ui.close', { id: PANE }, async ($, e, next) => {
    await update($, viewState, v => ({ ...v, isOpen: false }))
    return next(e)
  }).catch(($, e, next) => next(e))

  // Claude's reads light a file as they start; a write lights it, then rereads its folder and git once done.
  on('tool.call', async ($, e, next) => {
    const input = e as { tool: string; file_path?: unknown; notebook_path?: unknown }
    const isWrite = WRITE_TOOLS.has(input.tool)
    if (!isWrite && !READ_TOOLS.has(input.tool)) return next(e)
    const filePath = input.file_path ?? input.notebook_path
    await touch($, filePath, isWrite ? 'write' : 'read', isFollowing)
    const ran = await next(e)
    if (isWrite && typeof filePath === 'string') {
      const path = relPath(await read($, rootState), filePath)
      if (path) await Promise.all([loadDir($, parentOf(path)), loadGit($)])
    }
    return ran
  }).catch(($, e, next) => next(e))

  // Bash may create, move or delete files: the tree rereads what is open.
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
    await update($, scrollTopState, () => Math.max(0, Math.min(top + e.by, maxTop)))
    if ((await read($, viewState)).scrollTo) await update($, viewState, v => ({ ...v, scrollTo: null }))
    return {}
  }).catch(($, e, next) => next(e))
}
