export type RefKind = 'head' | 'branch' | 'remote' | 'tag'
export type Ref = { kind: RefKind; name: string }

export type Commit = {
  hash: string
  parents: string[]
  refs: Ref[]
  author: string
  time: number
  subject: string
}

export type FileStat = { path: string; adds: number | null; dels: number | null }

export type CommitDetail = {
  hash: string
  author: string
  email: string
  time: number
  body: string
  files: FileStat[]
}

export type Cell = { ch: string; color: number }

export type GraphRow = { commit: Commit; cells: Cell[] }

export type GraphStatus = 'idle' | 'ready' | 'no-repo' | 'error'

export type Graph = {
  status: GraphStatus
  rows: GraphRow[]
  head: string
  branch: string
  dirty: number
  conflicts: number
  remotes: string[]
  hasMore: boolean
  error?: string
}

export type BadgeKind = 'head' | 'branch' | 'remote' | 'tag' | 'detached'
export type BadgeStyle = 'auto' | 'round' | 'square'

export type Badge = {
  kind: BadgeKind
  label: string
  remotes: string[]
}

export type ConfigScope = 'local' | 'global'

export type RemoteInfo = { name: string; fetchUrl: string; pushUrl: string }

export type RepoSettings = {
  local: { name: string; email: string }
  global: { name: string; email: string }
  remotes: RemoteInfo[]
}

export type Repos = {
  list: string[]
  active: string
  isPicking: boolean
  branches: Record<string, string>
}

export type MenuState = { hash: string; badge: Badge } | null

export type View = {
  scope: 'all' | 'head'
  limit: number
  selected: string | null
  confirm: string | null
  menu: MenuState
  isRenaming: boolean
  isDeleting: boolean
  isForce: boolean
  push: string[] | null
  running: string | null
  isSettings: boolean
  configScope: ConfigScope
  editingRemote: string | null
  isAddingRemote: boolean
  remoteDraft: string
  scrollTo: string | null
  isSearching: boolean
  refresh: 'idle' | 'running' | 'done'
  isOpen: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'mods-gitgraph': {
      graph: Graph
      graphVersion: number
      view: View
      detail: CommitDetail | null
      isRound: boolean
      hasNerdFont: boolean
      settings: RepoSettings | null
      repos: Repos
    }
  }
}
