import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register, RenderChildren } from 'claude-code'

import type { Activity, ActivityKind, Column, Git, GitMark, Node, View } from '../types'
import { ancestors, baseName, countCells, flatten, formatDate, formatSize, HIDDEN, joinPath, markOf, parentOf, parseStatus, relPath, type Row, searchFiles } from './tree'

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
const FOOTER_ROWS = 1
// A row's caret and glyph before its name, and its git badge (` M`) after the columns.
const LEAD = 4
const BADGE = 2
// One cell kept free at the right edge, where a terminal may wrap.
const EDGE = 1

// The pane draws on the terminal's own background and text colour, secondary text dimmed, in
// the terminal's own palette: the accent (folders, the root, the branch) is its blue, the git
// marks its green, yellow and red, as the filetree plugin draws them.
const ACCENT = 'ansi256(4)'
const SELECTED_BG = 'ansi256(238)'
const SEARCH_BG = 'ansi256(236)'
const READ_COLOR = 'ansi256(6)'
const WRITE_COLOR = 'ansi256(208)'
const MARK_COLOR: Record<GitMark, string | undefined> = { M: 'ansi256(3)', A: 'ansi256(2)', '?': 'ansi256(2)', D: 'ansi256(1)', U: 'ansi256(1)', R: 'ansi256(4)', '!': undefined }
const ICONS = { root: '■', dir: '■', file: '∙', cursor: '▎', open: '▾', closed: '▸', branch: '⑂', clean: '±', search: '⌕', clear: '×', column: '◫', collapse: '⊟', refresh: '↻', pointer: '↖', ignored: '⊘' }
const COLUMN_LABEL: Record<Column, string> = { date: 'Modified', size: 'Size' }
// No git the pane runs asks for a password or opens an editor.
const GIT_ENV = { GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true', GIT_OPTIONAL_LOCKS: '0' }
const STATUS_ARGS = ['status', '--porcelain=v1', '-z', '--branch', '--ignored']
const FILES_ARGS = ['ls-files', '--cached', '--others', '--exclude-standard']
const READ_TOOLS = new Set(['Read'])
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])

const EMPTY_GIT: Git = { branch: '', marks: {}, counts: {}, changed: 0 }
const DEFAULT_VIEW: View = { isOpen: false, expanded: [], selected: null, query: '', matches: [], column: 'date', scrollTo: null }

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
    const entries = (await $.fs.list(absPath(root, path))).filter(e => !HIDDEN.has(e.name))
    // A listing gives a folder no time: each one's own is read, for the Modified column.
    const times = await Promise.all(entries.map(e => (e.kind === 'dir' ? $.fs.stat(absPath(root, joinPath(path, e.name))).then(s => s.mtimeMs, () => 0) : e.mtimeMs)))
    const nodes = entries.map((e, i): Node => ({ name: e.name, path: joinPath(path, e.name), isDir: e.kind === 'dir', size: e.size, mtimeMs: times[i] ?? 0 }))
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
    ...(isSelecting ? { selected: path, query: '', matches: [] } : {}),
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
  // The Git and value columns' cells, a header label's included, as wide as the rows on screen need.
  gitCol: number
  metricCol: number
}

const truncate = (text: string, room: number) => (text.length <= room ? text : room <= 1 ? text.slice(0, room) : `${text.slice(0, room - 1)}…`)

// A toolbar button: a glyph, dimmed while what it switches is off.
function toolButton({ els: { Button, Text } }: Ctx, key: string, glyph: string, isOn: boolean, onPress: () => Promise<unknown>) {
  return (
    <Button key={key} plain onPress={onPress}>
      <Text {...(isOn ? { color: ACCENT } : { dimColor: true })}>{glyph}</Text>
    </Button>
  )
}

// The root's row with the toolbar, the branch's row, a blank row, the search bar and the column
// titles: the filetree plugin's header, top to bottom.
function renderHeader($: EngineInterface, ctx: Ctx) {
  const { els: { Box, Button, Text }, Input, view, git, root, cols } = ctx
  const rootName = baseName(root.replace(/\\/g, '/')) || root
  const lines = [
    <Box key="head" flexDirection="row" height={1} overflow="hidden">
      <Box flexDirection="row" flexShrink={1} overflow="hidden" backgroundColor={view.selected === '' ? SELECTED_BG : undefined}>
        <Button key="root" plain onPress={() => update($, viewState, v => ({ ...v, selected: '' }))}>
          <Text color={ACCENT}>{`${ICONS.root} `}</Text>
          <Text bold color={ACCENT}>{rootName}</Text>
        </Button>
      </Box>
      <Box flexGrow={1} />
      <Box flexDirection="row" gap={2} flexShrink={0}>
        {toolButton(ctx, 'column', ICONS.column, view.column === 'size', () => update($, viewState, (v): View => ({ ...v, column: v.column === 'date' ? 'size' : 'date' })))}
        {toolButton(ctx, 'collapse', ICONS.collapse, false, async () => {
          await update($, viewState, v => ({ ...v, expanded: [] }))
          await update($, scrollTopState, () => 0)
        })}
        {toolButton(ctx, 'refresh', ICONS.refresh, false, async () => {
          gitSignature = ''
          files = null
          await refresh($)
          $.ui.toast('File tree refreshed')
        })}
        <Text> </Text>
      </Box>
    </Box>,
  ]
  if (git.branch) {
    const cells = countCells(git.counts[''])
    lines.push(
      <Box key="branch" flexDirection="row" height={1} overflow="hidden">
        <Box flexDirection="row" flexShrink={0}>
          <Text color={ACCENT}>{`${ICONS.branch} `}</Text>
          <Text bold>{git.branch}</Text>
        </Box>
        <Box flexGrow={1} />
        <Box flexDirection="row" flexShrink={1}>
          {cells.length === 0 ? <Text dimColor>{`${ICONS.clean} no changes`}</Text> : cells.map(c => <Text color={MARK_COLOR[c.mark]}>{` ${c.t}`}</Text>)}
        </Box>
        <Box width={1} flexShrink={0} />
      </Box>,
    )
  }
  lines.push(<Text key="gap"> </Text>)
  if (Input)
    lines.push(
      <Box key="search" flexDirection="row" height={1} width={cols} backgroundColor={SEARCH_BG}>
        <Text dimColor>{`${ICONS.search} `}</Text>
        <Box flexGrow={1}>
          <Input key="q" placeholder="search" submitLabel="go" value={view.query} onInput={value => search($, value)} onSubmit={value => search($, value)} />
        </Box>
        {view.query ? (
          <Button key="clear" plain onPress={() => search($, '')}>
            <Text dimColor>{` ${ICONS.clear} `}</Text>
          </Button>
        ) : null}
      </Box>,
    )
  lines.push(
    <Box key="columns" flexDirection="row" height={1} width={cols} overflow="hidden">
      <Text>{'    '}</Text>
      <Text dimColor>Name</Text>
      <Box flexGrow={1} />
      {ctx.gitCol > 0 && (
        <Box width={ctx.gitCol} flexShrink={0} flexDirection="row" justifyContent="flex-end">
          <Text dimColor>Git</Text>
        </Box>
      )}
      <Box width={ctx.metricCol} flexShrink={0} flexDirection="row" justifyContent="flex-end">
        <Text dimColor>{COLUMN_LABEL[view.column]}</Text>
      </Box>
      <Box width={BADGE + EDGE} flexShrink={0} />
    </Box>,
  )
  return { node: <Box flexDirection="column">{lines}</Box>, height: lines.length }
}

// A row's value-column text: when it was modified, or its size (a folder's left out).
const metricOf = (view: View, node: Node, isMatch: boolean) =>
  isMatch ? '' : view.column === 'date' ? formatDate(node.mtimeMs) : node.isDir ? '' : formatSize(node.size)

const gitTextOf = (git: Git, node: Node) => (node.isDir ? countCells(git.counts[node.path]).map(c => c.t).join(' ') : '')

function renderRow($: EngineInterface, ctx: Ctx, { node, depth }: Row, isMatch: boolean) {
  const { els: { Box, Button, Text }, cols, view, git, activity, now } = ctx
  const mark = markOf(git, node.path)
  const lit = activity[node.path]
  const isActive = lit !== undefined && now - lit.at < ACTIVE_MS
  const isSelected = view.selected === node.path
  const counts = node.isDir ? countCells(git.counts[node.path]) : []
  // A folder shows its counts in the Git column, a file its mark in the badge.
  const badge = counts.length || !mark ? '  ' : mark === '!' ? ` ${ICONS.ignored}` : ` ${mark}`
  const gitColor = mark && mark !== '!' ? MARK_COLOR[mark] : undefined
  const isIgnored = mark === '!'
  const activeColor = isActive ? (lit.kind === 'write' ? WRITE_COLOR : READ_COLOR) : undefined
  const caret = node.isDir ? `${view.expanded.includes(node.path) ? ICONS.open : ICONS.closed} ` : isSelected ? `${ICONS.cursor} ` : '  '
  const glyph = `${node.isDir ? ICONS.dir : ICONS.file} `
  const indent = '  '.repeat(isMatch ? 0 : depth)
  const room = Math.max(4, cols - indent.length - LEAD - ctx.gitCol - ctx.metricCol - BADGE - EDGE)
  const name = truncate(isMatch ? node.path : node.name, room).padEnd(room)
  const iconColor = activeColor ?? (isIgnored ? undefined : (gitColor ?? (node.isDir ? ACCENT : undefined)))
  const nameColor = activeColor ?? (isIgnored ? undefined : gitColor)
  const metric = metricOf(view, node, isMatch)
  return (
    <Box key={`rowbox:${node.path}`} height={1} overflow="hidden" flexDirection="row" backgroundColor={isSelected ? SELECTED_BG : undefined}>
      <Button key={`row:${node.path}`} plain onPress={() => press($, node, isMatch)}>
        <Text>{indent}</Text>
        <Text {...(isSelected && !node.isDir ? { color: ACCENT, bold: true } : { dimColor: true })}>{caret}</Text>
        <Text {...(iconColor ? { color: iconColor } : { dimColor: true })}>{glyph}</Text>
        <Text {...(nameColor ? { color: nameColor } : isIgnored ? { dimColor: true } : {})} bold={isSelected || isActive} strikethrough={mark === 'D' && !node.isDir}>
          {name}
        </Text>
        {ctx.gitCol > 0 && (
          <Text>
            {' '.repeat(Math.max(0, ctx.gitCol - gitTextOf(git, node).length))}
            {counts.map((c, i) => (
              <Text color={MARK_COLOR[c.mark]}>{`${i ? ' ' : ''}${c.t}`}</Text>
            ))}
          </Text>
        )}
        <Text {...(gitColor && !isIgnored ? { color: gitColor } : { dimColor: true })}>{metric.padStart(ctx.metricCol)}</Text>
        <Text bold {...(gitColor && !counts.length ? { color: gitColor } : { dimColor: true })}>{badge}</Text>
      </Button>
    </Box>
  )
}

// One row: how many folders and files the tree shows, and the selected path.
function renderFooter($: EngineInterface, ctx: Ctx, rows: Row[], isMatching: boolean) {
  const { els: { Box, Button, Text }, view } = ctx
  const folders = rows.filter(r => r.node.isDir).length
  const fileCount = rows.length - folders
  const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`
  const summary = isMatching
    ? `${plural(view.matches.length, 'match')}${view.matches.length === MAX_MATCHES ? '+' : ''}`.replace('matchs', 'matches')
    : `${plural(folders, 'folder')} · ${plural(fileCount, 'file')}`
  const selected = view.selected
  return (
    <Box key="footer" flexDirection="row" height={FOOTER_ROWS} overflow="hidden" flexShrink={0}>
      <Box flexShrink={0}>
        <Text dimColor>{summary}</Text>
      </Box>
      <Box flexGrow={1} />
      {selected ? (
        <Box flexShrink={1} marginLeft={2} overflow="hidden">
          <Button key="footer-path" plain onPress={async pe => {
            const res = await $.ui.copy({ text: selected, surface: pe.surface })
            $.ui.toast(res.isCopied ? `Copied ${selected}` : 'Could not copy')
          }}>
            <Text dimColor wrap="truncate-start">{selected}</Text>
          </Button>
        </Box>
      ) : null}
      {selected ? (
        <Box flexShrink={0}>
          <Text dimColor>{` ${ICONS.pointer} `}</Text>
        </Box>
      ) : null}
    </Box>
  )
}

const clampTop = (top: number, total: number, rows: number) => Math.max(0, Math.min(top, total - rows))

async function renderPane($: EngineInterface, els: Ctx['els'], surface: string, isDocked: boolean, cols: number, scroll: { offset: number; bodyRows: number }) {
  const { Box, Text } = els
  ownScroll = null
  const [root, dirs, git, activity, view] = await Promise.all([read($, rootState), read($, dirsState), read($, gitState), read($, activityState), read($, viewState)])
  const isMatching = view.query.trim() !== ''
  const rows: Row[] = isMatching
    ? view.matches.map(path => ({ node: { name: baseName(path), path, isDir: false, size: 0, mtimeMs: 0 }, depth: 0 }))
    : flatten(dirs, view.expanded)
  const gitWidth = rows.reduce((w, r) => Math.max(w, gitTextOf(git, r.node).length), 0)
  const metricWidth = rows.reduce((w, r) => Math.max(w, metricOf(view, r.node, isMatching).length), 0)
  const ctx: Ctx = {
    els,
    Input: 'Input' in els ? (els.Input as Elements['terminal']['Input']) : undefined,
    cols,
    root,
    view,
    git,
    activity,
    now: Date.now(),
    gitCol: gitWidth ? Math.max(gitWidth + 1, 'Git'.length + 3) : 0,
    metricCol: Math.max(metricWidth + 1, COLUMN_LABEL[view.column].length + 3),
  }
  const header = renderHeader($, ctx)
  const empty = rows.length === 0 && <Text dimColor>{isMatching ? 'no matches' : dirs[''] ? 'empty' : 'Loading…'}</Text>
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
        {renderFooter($, ctx, rows, isMatching)}
      </Box>
    )
  }

  // Elsewhere the engine scrolls the tree: only the rows near its window are drawn, spacers standing for the rest.
  const offset = centered >= 0 ? centered - Math.floor(scroll.bodyRows / 2) : scroll.offset - header.height
  const from = Math.max(0, Math.min(rows.length, offset - OVERSCAN))
  const to = Math.max(from, Math.min(rows.length, offset + scroll.bodyRows + OVERSCAN))
  return (
    <Box flexDirection="column" minHeight={isDocked ? scroll.bodyRows : undefined}>
      {header.node}
      {empty}
      {from > 0 && <Box key="space-before" height={from} flexShrink={0} />}
      {drawn(from, to)}
      {to < rows.length && <Box key="space-after" height={rows.length - to} flexShrink={0} />}
      <Box flexGrow={1} />
      {renderFooter($, ctx, rows, isMatching)}
    </Box>
  )
}

export const register: Register = (on, options) => {
  const autoOpen = options?.autoOpen !== false
  const isFollowing = options?.followClaude !== false
  const column: Column = options?.column === 'size' ? 'size' : 'date'

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
