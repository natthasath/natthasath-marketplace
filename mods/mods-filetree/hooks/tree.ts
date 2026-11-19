import type { Git, GitCounts, GitMark, Node } from '../types'

// Names never shown: git's own folder.
export const HIDDEN = new Set(['.git'])

const slashes = (path: string) => path.replace(/\\/g, '/').replace(/\/+$/, '')
const isWindowsPath = (path: string) => /^[A-Za-z]:\//.test(path)

// A tool's path as the tree's, relative to `root` and `/`-separated; null when it lies outside.
// A relative path is taken as already relative to `root`.
export function relPath(root: string, path: string): string | null {
  const p = slashes(path)
  const r = slashes(root)
  const isAbsolute = p.startsWith('/') || isWindowsPath(p)
  if (!isAbsolute) return p.replace(/^\.\//, '')
  const fold = (s: string) => (isWindowsPath(r) ? s.toLowerCase() : s)
  if (fold(p) === fold(r)) return ''
  return fold(p).startsWith(`${fold(r)}/`) ? p.slice(r.length + 1) : null
}

// The folders that hold `path`, outermost first: `a/b/c.ts` is in `a` and `a/b`.
export function ancestors(path: string): string[] {
  const parts = path.split('/')
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'))
}

export const parentOf = (path: string) => path.split('/').slice(0, -1).join('/')
export const baseName = (path: string) => path.split('/').pop() ?? path
export const joinPath = (dir: string, name: string) => (dir ? `${dir}/${name}` : name)

// Folders first, then by name, case set aside.
export const sortNodes = (nodes: Node[]) =>
  [...nodes].sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) : a.isDir ? -1 : 1))

// Which mark wins when a folder holds several.
const RANK: Record<GitMark, number> = { U: 6, D: 5, M: 4, A: 3, R: 2, '?': 1, '!': 0 }

function markOfCode(xy: string): GitMark {
  if (xy === '??') return '?'
  if (xy === '!!') return '!'
  if (xy.includes('U') || xy === 'AA' || xy === 'DD') return 'U'
  if (xy.includes('D')) return 'D'
  if (xy.includes('A')) return 'A'
  if (xy.includes('R') || xy.includes('C')) return 'R'
  return 'M'
}

// `git status --porcelain=v1 -z --branch --ignored`, its paths relative to the repository; `prefix`
// (`git rev-parse --show-prefix`) is where the tree's root sits in it, and paths outside are left out.
export function parseStatus(out: string, prefix = ''): Git {
  const records = out.split('\0')
  const marks: Record<string, GitMark> = {}
  const counts: Record<string, GitCounts> = {}
  let branch = ''
  let changed = 0
  const base = slashes(prefix)
  for (let i = 0; i < records.length; i++) {
    const rec = records[i] ?? ''
    if (rec.startsWith('## ')) {
      branch = rec.slice(3).replace(/^No commits yet on /, '').split('...')[0]?.split(' ')[0] ?? ''
      continue
    }
    if (rec.length < 4) continue
    const xy = rec.slice(0, 2)
    // A rename or copy is followed by the path it came from.
    if (xy.includes('R') || xy.includes('C')) i++
    const full = slashes(rec.slice(3))
    const path = base ? (full.startsWith(`${base}/`) ? full.slice(base.length + 1) : null) : full
    if (path === null || path === '') continue
    const mark = markOfCode(xy)
    marks[path] = mark
    if (mark === '!') continue
    changed++
    const slot = mark === '?' ? 0 : mark === 'D' ? 2 : 1
    for (const dir of ['', ...ancestors(path)]) {
      const had = marks[dir]
      if (dir && (had === undefined || RANK[mark] > RANK[had])) marks[dir] = mark
      const c: GitCounts = counts[dir] ?? [0, 0, 0]
      c[slot]++
      counts[dir] = c
    }
  }
  return { branch, marks, counts, changed }
}

// A path's mark: its own, or an untracked or ignored folder's above it (git lists such a folder whole).
export function markOf(git: Git, path: string): GitMark | undefined {
  const own = git.marks[path]
  if (own) return own
  for (const dir of ancestors(path).reverse()) {
    const m = git.marks[dir]
    if (m === '?' || m === '!') return m
  }
  return undefined
}

export type Row = { node: Node; depth: number }

// The rows on screen: each loaded folder's entries, an expanded folder's below it, indented.
export function flatten(dirs: Record<string, Node[]>, expanded: readonly string[]): Row[] {
  const open = new Set(expanded)
  const walk = (at: string, depth: number): Row[] =>
    sortNodes(dirs[at] ?? []).flatMap(node => [{ node, depth }, ...(node.isDir && open.has(node.path) ? walk(node.path, depth + 1) : [])])
  return walk('', 0)
}

// Bytes as `512 B `, `1.5 KB`, `12 KB`, `3.4 MB`: the bytes' trailing space keeps the units in a column.
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B `
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1_073_741_824).toFixed(1)} GB`
}

const two = (n: number) => String(n).padStart(2, '0')
// When a file was last modified, `2026-11-19 14:05`, in local time.
export function formatDate(ms: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`
}

// A folder's changes as the Git column shows them: `?:2 M:3 D:1`, the empty ones left out.
export function countCells(c: GitCounts | undefined): { t: string; mark: GitMark }[] {
  if (!c) return []
  return [
    ...(c[0] ? [{ t: `?:${c[0]}`, mark: '?' as const }] : []),
    ...(c[1] ? [{ t: `M:${c[1]}`, mark: 'M' as const }] : []),
    ...(c[2] ? [{ t: `D:${c[2]}`, mark: 'D' as const }] : []),
  ]
}

// Files whose name holds `query`, case set aside: a match in the name before one only in the path.
export function searchFiles(files: readonly string[], query: string, limit: number): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const inName = files.filter(f => baseName(f).toLowerCase().includes(q))
  const inPath = files.filter(f => !baseName(f).toLowerCase().includes(q) && f.toLowerCase().includes(q))
  return [...inName, ...inPath].slice(0, limit)
}
