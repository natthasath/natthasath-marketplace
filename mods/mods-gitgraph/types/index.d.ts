export type GitCommit = {
  hash: string
  short: string
  parents: string[]
  refs: string[]
  author: string
  date: string
  subject: string
  lane: number
  laneMask: boolean[]
  isMerge: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'mods-gitgraph': {
      commits: GitCommit[]
      isOpen: boolean
      selected: string | null
      detail: string | null
      error: string | null
    }
  }
}
