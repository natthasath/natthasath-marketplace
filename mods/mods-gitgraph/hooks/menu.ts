import type { Badge } from '../types'

export type MenuItem = {
  id: string
  label: string
  runs?: string[]
  pushArgs?: boolean
  deleteBranch?: string
  isRename?: boolean
  copy?: string
  isNetwork?: boolean
}

// `origin/feat/x` -> `{ remote: 'origin', branch: 'feat/x' }`, matching the longest
// known remote name first (a remote itself may hold a `/`).
export function splitRemote(name: string, remotes: string[]): { remote: string; branch: string } | null {
  const sorted = [...remotes].sort((a, b) => b.length - a.length)
  for (const remote of sorted) if (name === remote || name.startsWith(`${remote}/`)) return { remote, branch: name.slice(remote.length + 1) }
  return null
}

export const renameArgs = (from: string, to: string): string[] => ['branch', '-m', from, to]

export const deleteBranchArgs = (branch: string, force: boolean): string[] => ['branch', force ? '-D' : '-d', branch]

// `null` when there is nothing to check out (already on it, or a detached HEAD).
export function checkoutArgs(badge: Badge, remotes: string[] = []): string[] | null {
  if (badge.kind === 'head') return null
  if (badge.kind === 'detached') return null
  if (badge.kind === 'tag') return ['checkout', `tags/${badge.label}`]
  if (badge.kind === 'remote') {
    const split = splitRemote(badge.label, remotes)
    if (!split) return null
    return ['checkout', '-b', split.branch, '--track', badge.label]
  }
  return ['checkout', badge.label]
}

// One `git push` per remote chosen in the menu's push picker.
export function pushRuns(item: MenuItem, chosen: string[]): string[][] {
  if (item.id === 'push-tag') return chosen.map(remote => ['push', remote, `refs/tags/${item.copy ?? ''}`])
  return chosen.map(remote => ['push', remote, item.copy ?? ''])
}

// The branch's own remotes first, then `origin`, then whatever remote exists.
export function defaultPushRemotes(badge: Badge, allRemotes: string[]): string[] {
  if (badge.remotes.length > 0) return badge.remotes
  if (allRemotes.includes('origin')) return ['origin']
  return allRemotes.slice(0, 1)
}

function localBranchMenu(badge: Badge, remotes: string[]): MenuItem[] {
  const isHead = badge.kind === 'head'
  const items: MenuItem[] = []
  if (!isHead) items.push({ id: 'checkout', label: 'Checkout', runs: checkoutArgs(badge) ?? undefined })
  items.push({ id: 'rename', label: 'Rename', isRename: true })
  items.push({ id: 'push', label: 'Push', pushArgs: true, copy: badge.label, isNetwork: true })
  if (!isHead) {
    items.push({ id: 'merge', label: 'Merge into current', runs: ['merge', badge.label] })
    items.push({ id: 'rebase', label: 'Rebase current onto this', runs: ['rebase', badge.label] })
    items.push({ id: 'delete', label: 'Delete', deleteBranch: badge.label })
  }
  items.push({ id: 'copy', label: 'Copy name', copy: badge.label })
  return items
}

function remoteBranchMenu(badge: Badge, remotes: string[]): MenuItem[] {
  const split = splitRemote(badge.label, remotes)
  const items: MenuItem[] = [{ id: 'checkout', label: 'Checkout as tracking branch', runs: checkoutArgs(badge, remotes) ?? undefined }]
  if (split) items.push({ id: 'fetch', label: `Fetch ${split.remote}`, runs: ['fetch', split.remote], isNetwork: true })
  items.push({ id: 'merge', label: 'Merge into current', runs: ['merge', badge.label] })
  if (split)
    items.push({
      id: 'delete-remote',
      label: `Delete on ${split.remote}`,
      runs: ['push', '--delete', split.remote, split.branch],
      isNetwork: true,
    })
  items.push({ id: 'copy', label: 'Copy name', copy: badge.label })
  return items
}

function tagMenu(badge: Badge): MenuItem[] {
  return [
    { id: 'push-tag', label: 'Push', pushArgs: true, copy: badge.label, isNetwork: true },
    { id: 'delete', label: 'Delete', runs: ['tag', '-d', badge.label] },
    { id: 'copy', label: 'Copy name', copy: badge.label },
  ]
}

export function menuFor(badge: Badge, remotes: string[]): MenuItem[] {
  if (badge.kind === 'head' || badge.kind === 'branch') return localBranchMenu(badge, remotes)
  if (badge.kind === 'remote') return remoteBranchMenu(badge, remotes)
  if (badge.kind === 'tag') return tagMenu(badge)
  return [{ id: 'copy', label: 'Copy name', copy: badge.label }]
}
