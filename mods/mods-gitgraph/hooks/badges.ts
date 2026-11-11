import type { Badge, BadgeKind, Ref } from '../types'
import { truncate } from './format'

const ORDER: BadgeKind[] = ['head', 'detached', 'branch', 'remote', 'tag']
const MIN_LABEL = 7
// A badge's caps/padding (2) plus its trailing gap (1).
const PILL_PAD = 3

// Turns decoration refs into one badge per local branch (its matching remote-tracking
// refs folded in as `remotes`), standalone badges for remotes with no local branch,
// and one per tag. Sorted head, detached, branch, remote, tag.
export function badgesOf(refs: Ref[]): Badge[] {
  const heads = refs.filter(r => r.kind === 'head')
  const branches = refs.filter(r => r.kind === 'branch')
  const remotes = refs.filter(r => r.kind === 'remote')
  const tags = refs.filter(r => r.kind === 'tag')

  const badges: Badge[] = []
  const used = new Set<Ref>()

  const foldRemotes = (name: string) => {
    const matches = remotes.filter(r => !used.has(r) && (r.name === name || r.name.endsWith(`/${name}`)))
    matches.forEach(r => used.add(r))
    return matches.map(r => r.name.split('/')[0] ?? r.name)
  }

  for (const h of heads) {
    if (h.name === 'HEAD') badges.push({ kind: 'detached', label: 'HEAD', remotes: [] })
    else badges.push({ kind: 'head', label: h.name, remotes: foldRemotes(h.name) })
  }
  for (const b of branches) badges.push({ kind: 'branch', label: b.name, remotes: foldRemotes(b.name) })
  for (const r of remotes) if (!used.has(r)) badges.push({ kind: 'remote', label: r.name, remotes: [] })
  for (const t of tags) badges.push({ kind: 'tag', label: t.name, remotes: [] })

  return badges.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
}

// A badge's text split into its name (with a leading icon for head/tag) and its
// folded-remotes suffix, drawn dimmer by the caller.
export function badgeParts(badge: Badge): { name: string; remotes: string } {
  const icon = badge.kind === 'head' ? '● ' : badge.kind === 'tag' ? '◆ ' : ''
  const remotes = badge.remotes.length > 0 ? ` ⇄ ${badge.remotes.join(',')}` : ''
  return { name: icon + badge.label, remotes }
}

export function badgeWidth(badge: Badge): number {
  const { name, remotes } = badgeParts(badge)
  return name.length + remotes.length + PILL_PAD
}

// Fits one badge into `room` columns: drops its remotes first, then truncates the
// name with an ellipsis; null once the name would fall below MIN_LABEL.
export function shrink(badge: Badge, room: number): Badge | null {
  if (badgeWidth(badge) <= room) return badge
  if (badge.remotes.length > 0) return shrink({ ...badge, remotes: [] }, room)
  const { name: icon } = badgeParts({ ...badge, remotes: [] })
  const iconLen = icon.length - badge.label.length
  const maxLabel = room - PILL_PAD - iconLen
  if (maxLabel < MIN_LABEL) return null
  return { ...badge, label: truncate(badge.label, maxLabel) }
}

// Lays out as many badges as fit in `max` columns, reserving room for a trailing
// `+N` pill once any are hidden.
export function fitBadges(badges: Badge[], max: number): { shown: Badge[]; hidden: number; width: number } {
  const shown: Badge[] = []
  let width = 0
  let hidden = 0
  for (let i = 0; i < badges.length; i++) {
    if (hidden > 0) {
      hidden++
      continue
    }
    const reserveForMore = i < badges.length - 1 ? PILL_PAD + 2 : 0
    const fitted = shrink(badges[i]!, max - width - reserveForMore)
    if (fitted) {
      shown.push(fitted)
      width += badgeWidth(fitted)
    } else {
      hidden++
    }
  }
  if (hidden > 0) width += `+${hidden}`.length + PILL_PAD
  return { shown, hidden, width }
}

// Scales an additions/deletions pair into a bar of at most `width` cells; a
// non-zero side keeps at least one cell.
export function diffBar(adds: number | null, dels: number | null, width: number): { adds: number; dels: number } {
  const a = adds ?? 0
  const d = dels ?? 0
  const total = a + d
  if (total <= 0) return { adds: 0, dels: 0 }
  let barA = Math.round((a / total) * width)
  let barD = width - barA
  if (a > 0 && barA === 0) {
    barA = 1
    barD = Math.max(0, width - 1)
  }
  if (d > 0 && barD === 0) {
    barD = 1
    barA = Math.max(0, width - 1)
  }
  return { adds: barA, dels: barD }
}
