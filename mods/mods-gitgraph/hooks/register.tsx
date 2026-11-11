import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { GitCommit } from '../types'

const PANE_ID = 'mods-gitgraph'
const COMMAND_NAME = 'mods-gitgraph'
const MAX_LANES = 6
const DEFAULT_MAX_COMMITS = 300
const POLL_MS = 8000

// git commands that change refs/history and should trigger a redraw
const MUTATING_GIT = /\bgit\s+(?:(?:--[\w-]+(?:=\S+)?|-\w)\s+)*(commit|merge|rebase|checkout|switch|pull|push|reset|stash|cherry-pick|revert|branch|tag)\b/

const LANE_COLORS = [
  '#e06c75',
  '#61afef',
  '#98c379',
  '#e5c07b',
  '#c678dd',
  '#56b6c2',
  '#d19a66',
  '#56c2a0',
]

const commits = atom({ plugin: 'mods-gitgraph', key: 'commits' } as const, [] as GitCommit[])
const isOpenAtom = atom({ plugin: 'mods-gitgraph', key: 'isOpen' } as const, false)
const selectedAtom = atom({ plugin: 'mods-gitgraph', key: 'selected' } as const, null as string | null)
const detailAtom = atom({ plugin: 'mods-gitgraph', key: 'detail' } as const, null as string | null)
const errorAtom = atom({ plugin: 'mods-gitgraph', key: 'error' } as const, null as string | null)

type LogRow = {
  hash: string
  short: string
  parents: string[]
  refs: string[]
  author: string
  date: string
  subject: string
}

function parseLog(stdout: string): LogRow[] {
  const SEP = '\u001f'
  return stdout
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => {
      const [hash, short, parentsRaw, refsRaw, author, date, subject] = line.split(SEP)
      return {
        hash: hash ?? '',
        short: short ?? '',
        parents: parentsRaw ? parentsRaw.split(' ').filter(Boolean) : [],
        refs: refsRaw
          ? refsRaw
              .split(',')
              .map(part => part.trim())
              .filter(Boolean)
          : [],
        author: author ?? '',
        date: date ?? '',
        subject: subject ?? '',
      }
    })
}

// Approximates `git log --graph`'s lane layout: walks the commits top to
// bottom (topo order, children before parents) and keeps one slot per
// open lane holding the hash it is waiting for. A commit takes the slot
// waiting for it, or a free one; extra parents of a merge open new slots
// unless something already tracks them.
function assignLanes(rows: LogRow[]): GitCommit[] {
  const openLanes: (string | null)[] = []
  const out: GitCommit[] = []

  for (const row of rows) {
    let lane = openLanes.findIndex(h => h === row.hash)
    if (lane === -1) lane = openLanes.findIndex(h => h === null)
    if (lane === -1) {
      lane = openLanes.length
      openLanes.push(null)
    }

    const laneMask = openLanes.map(h => h !== null)
    laneMask[lane] = true

    const [first, ...rest] = row.parents
    if (!first || openLanes.some((h, i) => i !== lane && h === first)) {
      openLanes[lane] = null
    } else {
      openLanes[lane] = first
    }

    for (const parent of rest) {
      if (openLanes.some(h => h === parent)) continue
      const free = openLanes.findIndex(h => h === null)
      if (free === -1) openLanes.push(parent)
      else openLanes[free] = parent
    }

    out.push({ ...row, lane, laneMask, isMerge: row.parents.length > 1 })
  }

  return out
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, Math.max(0, max - 1)) + '…' : text
}

async function isGitRepo($: any) {
  try {
    const res = await $.process.run(['git', 'rev-parse', '--is-inside-work-tree'])
    return res.exitCode === 0 && res.stdout.trim() === 'true'
  } catch {
    return false
  }
}

async function refreshGraph($: any, maxCommits: number) {
  if (!(await isGitRepo($))) {
    await update($, errorAtom, () => 'ไม่ได้อยู่ใน git repository')
    await update($, commits, () => [])
    return
  }

  const SEP = '\u001f'
  const fmt = ['%H', '%h', '%P', '%D', '%an', '%ar', '%s'].join(SEP)
  const res = await $.process.run([
    'git',
    'log',
    '--all',
    '--topo-order',
    '--date-order',
    `--max-count=${maxCommits}`,
    `--pretty=format:${fmt}`,
  ])

  if (res.exitCode !== 0) {
    await update($, errorAtom, () => res.stderr.trim() || 'git log ล้มเหลว')
    return
  }

  const graph = assignLanes(parseLog(res.stdout))
  await update($, errorAtom, () => null)
  await update($, commits, () => graph)
}

function loadCommitDetail($: any, hash: string) {
  void (async () => {
    await update($, selectedAtom, () => hash)
    await update($, detailAtom, () => 'กำลังโหลด…')
    try {
      const res = await $.process.run(['git', 'show', '--stat', '--pretty=fuller', hash])
      await update($, detailAtom, () =>
        res.exitCode === 0 ? res.stdout.slice(0, 4000) : res.stderr.trim() || 'โหลดรายละเอียดไม่สำเร็จ',
      )
    } catch (err) {
      await update($, detailAtom, () => String(err))
    }
  })()
}

function closeCommitDetail($: any) {
  void (async () => {
    await update($, detailAtom, () => null)
    await update($, selectedAtom, () => null)
  })()
}

function renderLaneCells($: any, e: any, commit: GitCommit) {
  const { Text } = $.ui.resolve(e)
  const width = Math.min(commit.laneMask.length, MAX_LANES)
  const cells: ReturnType<typeof h>[] = []

  for (let i = 0; i < width; i++) {
    const color = LANE_COLORS[i % LANE_COLORS.length]
    if (i === commit.lane) {
      cells.push(
        <Text key={'c' + i} color={color}>
          {commit.isMerge ? '◆' : '●'}
        </Text>,
      )
    } else if (commit.laneMask[i]) {
      cells.push(
        <Text key={'c' + i} color={color}>
          │
        </Text>,
      )
    } else {
      cells.push(<Text key={'c' + i}> </Text>)
    }
  }

  if (commit.laneMask.length > MAX_LANES) {
    cells.push(
      <Text key="more" dimColor>
        …
      </Text>,
    )
  }

  return cells
}

export const register: Register = (on, options) => {
  const maxCommits = Number(options?.maxCommits) > 0 ? Number(options.maxCommits) : DEFAULT_MAX_COMMITS
  const autoOpen = options?.autoOpen !== false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND_NAME,
      description: 'เปิด/ปิดแผง Git Graph (เหมือน SourceTree/GitKraken) ด้านข้าง',
    })

    await refreshGraph($, maxCommits)

    if (autoOpen && !(await read($, errorAtom))) {
      const opened = await $.ui.open({ id: PANE_ID, title: 'Git Graph' })
      await update($, isOpenAtom, () => opened.isPlaced)
    }

    $.clock.every(POLL_MS, () => {
      void (async () => {
        if (await read($, isOpenAtom)) await refreshGraph($, maxCommits)
      })()
    })

    return next(e)
  })

  on('command.run', { command: COMMAND_NAME }, async $ => {
    const open = await read($, isOpenAtom)

    if (open) {
      await $.ui.close({ id: PANE_ID })
      await update($, isOpenAtom, () => false)
      return { text: 'ปิดแผง Git Graph แล้ว' }
    }

    await refreshGraph($, maxCommits)
    const err = await read($, errorAtom)
    if (err) return { text: err }

    const opened = await $.ui.open({ id: PANE_ID, title: 'Git Graph' })
    await update($, isOpenAtom, () => opened.isPlaced)
    return {
      text: opened.isPlaced ? 'เปิดแผง Git Graph แล้ว' : `เปิดแผงไม่ได้: ${opened.reason}`,
    }
  }).catch(() => ({ text: 'เกิดข้อผิดพลาดในการเปิด/ปิดแผง Git Graph' }))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const result = await next(e)
    if (MUTATING_GIT.test(e.command) && (await read($, isOpenAtom))) {
      await refreshGraph($, maxCommits)
    }
    return result
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = (await read($, commits)) ?? []
    const err = await read($, errorAtom)
    const sel = await read($, selectedAtom)
    const det = await read($, detailAtom)

    if (err) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="error">{err}</Text>
        </Box>
      )
    }

    const rows = e.viewport?.rows ?? 24
    const listRows = det ? Math.max(4, Math.floor(rows * 0.6)) : Math.max(4, rows - 1)
    const visible = list.slice(0, listRows)

    return (
      <Box flexDirection="column">
        {visible.length === 0 && <Text dimColor>ไม่มี commit ให้แสดง</Text>}
        {visible.map(commit => (
          <Button key={commit.hash} plain onPress={() => loadCommitDetail($, commit.hash)}>
            {renderLaneCells($, e, commit)}
            <Text> </Text>
            <Text weight={commit.hash === sel ? 'bold' : 'regular'} color={commit.hash === sel ? 'claude' : undefined}>
              {commit.short}
            </Text>
            <Text dimColor>{' ' + truncate(commit.subject, 44)}</Text>
            {commit.refs.length > 0 && <Text color="success">{' (' + commit.refs.join(', ') + ')'}</Text>}
          </Button>
        ))}
        {det && (
          <Box flexDirection="column" borderStyle="single" marginTop={1} paddingX={1}>
            <Button plain onPress={() => closeCommitDetail($)}>
              <Text dimColor>[ปิดรายละเอียด]</Text>
            </Button>
            <Text wrap="wrap">{det}</Text>
          </Box>
        )}
      </Box>
    )
  })
}
