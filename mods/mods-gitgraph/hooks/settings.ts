import type { RemoteInfo } from '../types'

// `git remote -v` lines: `<name>\t<url> (fetch|push)`. Fetch and push URLs for the
// same remote name are merged into one entry.
export function parseRemotes(stdout: string): RemoteInfo[] {
  const byName = new Map<string, RemoteInfo>()
  for (const line of stdout.split('\n')) {
    const m = line.match(/^(\S+)\t(\S+)\s+\((fetch|push)\)/)
    if (!m) continue
    const [, name = '', url = '', dir = ''] = m
    const entry = byName.get(name) ?? { name, fetchUrl: '', pushUrl: '' }
    if (dir === 'fetch') entry.fetchUrl = url
    else entry.pushUrl = url
    byName.set(name, entry)
  }
  return [...byName.values()]
}

// `null` for `user.email` without an `@`; an empty value unsets the key instead of setting it.
export function userConfigArgs(scope: 'local' | 'global', key: 'name' | 'email', value: string): string[] | null {
  const trimmed = value.trim()
  if (key === 'email' && trimmed && !trimmed.includes('@')) return null
  if (!trimmed) return ['config', `--${scope}`, '--unset', `user.${key}`]
  return ['config', `--${scope}`, `user.${key}`, trimmed]
}

export const isRemoteName = (name: string) => /^[A-Za-z0-9._/-]+$/.test(name) && !name.startsWith('-')

export const isRemoteUrl = (url: string) => url.length > 0 && !url.startsWith('-') && !/\s/.test(url)

export function addRemotePlan(name: string, url: string, existing: string[]): { args: string[] } | { error: string } {
  const trimmedUrl = url.trim()
  const trimmedName = name.trim() || 'origin'
  if (!isRemoteUrl(trimmedUrl)) return { error: `Invalid URL: "${trimmedUrl.slice(0, 40)}"` }
  if (!isRemoteName(trimmedName)) return { error: `Invalid remote name: "${trimmedName.slice(0, 40)}"` }
  if (existing.includes(trimmedName)) return { error: `Remote "${trimmedName}" already exists` }
  return { args: ['remote', 'add', trimmedName, trimmedUrl] }
}
