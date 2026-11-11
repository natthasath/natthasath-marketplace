// `find` arguments that locate every `.git` directory up to 4 levels under the
// session folder, skipping dependency/build folders and hidden folders other
// than `.git` itself (a `.git` *file*, marking a submodule or worktree, is
// excluded by `-type d`, not by name).
export const FIND_ARGS = [
  'find',
  '.',
  '-maxdepth',
  '4',
  '(',
  '-name', 'node_modules',
  '-o', '-name', 'vendor',
  '-o', '-name', 'dist',
  '-o', '-name', 'build',
  '-o', '-name', 'target',
  ')',
  '-prune',
  '-o',
  '(',
  '-name', '.*',
  '-not', '-name', '.git',
  ')',
  '-prune',
  '-o',
  '-name', '.git',
  '-type', 'd',
  '-print',
]

export function parseRepos(stdout: string): string[] {
  const roots = stdout
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => (l.replace(/\/\.git$/, '') || '.') === '' ? '.' : l.replace(/\/\.git$/, ''))
  const unique = [...new Set(roots.map(r => (r === './.git' ? '.' : r)))]
  const rest = unique.filter(r => r !== '.').sort()
  return unique.includes('.') ? ['.', ...rest] : rest
}

export function pickActive(list: string[], before: string): string {
  if (list.includes(before)) return before
  return list[0] ?? '.'
}

export const BRANCH_ARGS = ['symbolic-ref', '--short', '-q', 'HEAD']

export function parseBranch(res: { exitCode: number; stdout: string }): string | null {
  if (res.exitCode === 0) return res.stdout.trim()
  if (res.exitCode === 1) return 'detached'
  return null
}

export const UPSTREAM_ARGS = (branch: string): string[] => ['for-each-ref', '--format=%(upstream:short)', `refs/heads/${branch}`]

export function parseUpstream(res: { exitCode: number; stdout: string }): string | null {
  if (res.exitCode !== 0) return null
  const name = res.stdout.trim()
  return name || null
}

export const repoLabel = (path: string) => (path === '.' ? '(this folder)' : path.replace(/^\.\//, ''))

// Right-aligns `[branch]` in the room left after `label`, truncating from the
// left so the closing bracket always shows.
export function branchColumn(label: string, branch: string | undefined, cols: number): string {
  if (!branch) return ''
  const text = `[${branch}]`
  const room = Math.max(0, cols - label.length)
  if (room <= 0) return ''
  if (text.length > room) return room < 3 ? '' : ` ${text.slice(1, room - 2)}…]`.slice(-room)
  return ' '.repeat(room - text.length) + text
}
