import { describe, expect, test } from 'claude-code/testing'

import type { Node } from '../types'
import { ancestors, countCells, flatten, formatDate, formatSize, markOf, parseStatus, relPath, searchFiles } from './tree'

const node = (path: string, isDir = false): Node => ({ name: path.split('/').pop() ?? path, path, isDir, size: 0, mtimeMs: 0 })

describe('paths', () => {
  test('a tool path becomes the tree path, on Windows and elsewhere', () => {
    expect(relPath('C:\\code\\app', 'C:\\code\\app\\src\\main.ts')).toBe('src/main.ts')
    expect(relPath('C:\\code\\app', 'c:/Code/App/src/main.ts')).toBe('src/main.ts')
    expect(relPath('/home/me/app', '/home/me/app/README.md')).toBe('README.md')
    expect(relPath('/home/me/app', '/home/me/application/x')).toBeNull()
    expect(relPath('/home/me/app', './src/a.ts')).toBe('src/a.ts')
  })

  test('the folders above a file', () => {
    expect(ancestors('a/b/c.ts')).toEqual(['a', 'a/b'])
    expect(ancestors('c.ts')).toEqual([])
  })
})

describe('git status', () => {
  const out = ['## main...origin/main [ahead 1]', ' M src/a.ts', 'A  src/new.ts', '?? docs/', '!! node_modules/', 'R  src/b.ts', 'src/old.ts', ''].join('\0')

  test('marks each path and the folders holding changes', () => {
    const git = parseStatus(out)
    expect(git.branch).toBe('main')
    expect(git.changed).toBe(4)
    expect(git.marks['src/a.ts']).toBe('M')
    expect(git.marks['src/b.ts']).toBe('R')
    expect(git.marks.src).toBe('M')
    expect(git.marks['src/old.ts']).toBeUndefined()
  })

  test('each folder counts the changes below it', () => {
    const git = parseStatus(out)
    expect(git.counts.src).toEqual([0, 3, 0])
    expect(git.counts['']).toEqual([1, 3, 0])
    expect(countCells(git.counts['']).map(c => c.t)).toEqual(['?:1', 'M:3'])
    expect(countCells(undefined)).toEqual([])
  })

  test('a file in an untracked or ignored folder takes its mark', () => {
    const git = parseStatus(out)
    expect(markOf(git, 'docs/guide/x.md')).toBe('?')
    expect(markOf(git, 'node_modules/react/index.js')).toBe('!')
    expect(markOf(git, 'README.md')).toBeUndefined()
  })

  test('paths outside the tree root are left out', () => {
    const git = parseStatus(out, 'src/')
    expect(git.marks['a.ts']).toBe('M')
    expect(git.marks['docs/']).toBeUndefined()
  })
})

describe('rows', () => {
  const dirs = { '': [node('z.txt'), node('src', true), node('a.txt')], src: [node('src/b.ts'), node('src/lib', true)] }

  test('folders first, an expanded folder below its row', () => {
    expect(flatten(dirs, []).map(r => r.node.path)).toEqual(['src', 'a.txt', 'z.txt'])
    expect(flatten(dirs, ['src']).map(r => `${r.depth}:${r.node.path}`)).toEqual(['0:src', '1:src/lib', '1:src/b.ts', '0:a.txt', '0:z.txt'])
  })

  test('sizes read short, dates to the minute', () => {
    expect(formatSize(512)).toBe('512 B ')
    expect(formatSize(1536)).toBe('1.5 KB')
    expect(formatSize(50 * 1024 * 1024)).toBe('50.0 MB')
    expect(formatDate(new Date(2026, 10, 9, 7, 5).getTime())).toBe('2026-11-09 07:05')
    expect(formatDate(0)).toBe('')
  })

  test('search finds names before paths', () => {
    expect(searchFiles(['src/tree.ts', 'tree/a.ts', 'b.ts'], 'TREE', 10)).toEqual(['src/tree.ts', 'tree/a.ts'])
    expect(searchFiles(['a'], '  ', 10)).toEqual([])
  })
})
