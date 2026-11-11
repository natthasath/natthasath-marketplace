import type { Register } from 'claude-code'

const PANE = 'matrix-code'
const TICK_MS = 60
const MAX_HEAT = 10

const KATAKANA_START = 0xff66
const KATAKANA_END = 0xff9d
const SYMBOLS = [0x3a, 0x2e, 0x3d, 0x2a, 0x2b, 0x2d]

function randomGlyph(): number {
  const r = Math.random()
  if (r < 0.7) {
    return KATAKANA_START + Math.floor(Math.random() * (KATAKANA_END - KATAKANA_START + 1))
  }
  if (r < 0.9) return 0x30 + Math.floor(Math.random() * 10)
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!
}

function headColor(): number {
  return 0xcdffd6 // bright, slightly white-green neon head
}

function trailColor(t: number): number {
  const clamped = Math.max(0, Math.min(1, t))
  const g = Math.round(50 + 170 * clamped)
  const b = Math.round(18 * clamped)
  return (g << 8) | b
}

type Column = {
  active: boolean
  head: number
  length: number
  ticksPerStep: number
  tickCount: number
}

function freshColumn(): Column {
  return { active: false, head: 0, length: 8, ticksPerStep: 3, tickCount: 0 }
}

export const register: Register = on => {
  let heat = 0
  let working = false
  let gridCols = 40
  let gridRows = 24
  let columns: Column[] = Array.from({ length: gridCols }, freshColumn)

  function resize(cols: number, rows: number) {
    const nextCols = Math.max(1, Math.min(512, Math.round(cols)))
    const nextRows = Math.max(1, Math.min(256, Math.round(rows)))
    if (nextCols === gridCols && nextRows === gridRows) return
    gridCols = nextCols
    gridRows = nextRows
    columns = Array.from({ length: gridCols }, freshColumn)
  }

  function step(intensity: number) {
    for (const col of columns) {
      if (!col.active) {
        const spawnProb = working ? 0.015 + intensity * 0.1 : 0
        if (spawnProb > 0 && Math.random() < spawnProb) {
          col.active = true
          col.head = 0
          col.length = 6 + Math.floor(Math.random() * 10) + Math.floor(intensity * 6)
          col.ticksPerStep = Math.max(1, Math.round(4 - intensity * 2.5 + Math.random() * 1.5))
          col.tickCount = 0
        }
        continue
      }
      col.tickCount += 1
      if (col.tickCount >= col.ticksPerStep) {
        col.tickCount = 0
        col.head += 1
      }
      if (col.head - col.length > gridRows) col.active = false
    }
  }

  function encode(): string {
    const words = new Uint32Array(gridCols * gridRows * 3)
    for (let row = 0; row < gridRows; row++) {
      for (let c = 0; c < gridCols; c++) {
        const idx = (row * gridCols + c) * 3
        const col = columns[c]!
        let code = 0x20
        let fg = 0
        if (col.active) {
          const distance = col.head - row
          if (distance >= 0 && distance <= col.length) {
            code = randomGlyph()
            fg = distance === 0 ? headColor() : trailColor(1 - distance / col.length)
          }
        }
        words[idx] = code
        words[idx + 1] = fg
        words[idx + 2] = 0 // pure black background, hacker dark theme
      }
    }
    return new Uint8Array(words.buffer).toBase64()
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'matrix',
      description: 'Open or close the Matrix code-rain panel',
    })
    void $.ui.open({ id: PANE, title: 'Matrix' })

    $.clock.every(TICK_MS, () => {
      heat *= 0.93
      const intensity = working ? Math.min(1, heat / MAX_HEAT) : 0
      step(intensity)
      void $.ui.blit({ requestId: PANE, key: 'rain', cells: encode() })
    })

    return next(e)
  })

  on('command.run', { command: 'matrix' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: 'Matrix' })
    return {
      text: opened.isPlaced ? 'Matrix panel opened.' : 'Matrix panel queued (widen the terminal to see it).',
    }
  })

  on('prompt.submit', ($, e, next) => {
    working = true
    heat = Math.max(heat, 2)
    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    working = false
    return next(e)
  })

  on('tool.call', ($, e, next) => {
    heat = Math.min(MAX_HEAT, heat + 2)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    if (e.surface !== 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box>
          <Text dimColor>Matrix rain draws on the terminal only.</Text>
        </Box>
      )
    }

    const { Raster } = $.ui.resolve(e)
    const cols = e.props.bodyColumns ?? gridCols
    const rows = e.viewport?.rows ?? gridRows
    resize(cols, rows)

    return <Raster key="rain" columns={gridCols} rows={gridRows} cells={encode()} />
  })
}
