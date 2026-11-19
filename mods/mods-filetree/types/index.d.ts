// A directory entry as the tree keeps it: `path` is relative to the session's folder, `/`-separated.
export type Node = { name: string; path: string; isDir: boolean; size: number; mtimeMs: number }

// One letter per path, as `git status --porcelain` gives it: M modified, A added, D deleted,
// R renamed, U conflicted, ? untracked, ! ignored.
export type GitMark = 'M' | 'A' | 'D' | 'R' | 'U' | '?' | '!'

// A folder's changed paths below it: untracked, modified (added, renamed, conflicted too), deleted.
export type GitCounts = [number, number, number]

export type Git = {
  branch: string
  // Each changed or ignored path's mark; a folder holding changes carries the strongest of them.
  marks: Record<string, GitMark>
  // Each folder's changes below it, by folder ('' is the root).
  counts: Record<string, GitCounts>
  changed: number
}

export type ActivityKind = 'read' | 'write'
// Files Claude touched lately, by path, with when; a row lights while `at` is recent.
export type Activity = Record<string, { kind: ActivityKind; at: number }>

export type Column = 'size' | 'date'

export type View = {
  isOpen: boolean
  expanded: string[]
  selected: string | null
  query: string
  matches: string[]
  column: Column
  // The path a render centers once, then lets go.
  scrollTo: string | null
}

declare module 'claude-code' {
  interface PluginState {
    'mods-filetree': {
      root: string
      // Each loaded folder's entries, by its path ('' is the root).
      dirs: Record<string, Node[]>
      git: Git
      activity: Activity
      view: View
      // The first row a docked terminal pane shows, the pane scrolling its own rows.
      scrollTop: number
    }
  }
}
