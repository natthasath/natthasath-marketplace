import type { ClientModule } from 'claude-code'

export type TapRun = { t: string; color?: string; backgroundColor?: string; weight?: 'bold'; italic?: boolean }
// `cells`, when given, lays the runs out as columns, one per run: a number is that many cells,
// fixed; `null` takes what is left and cuts its text with an ellipsis. Without it, one line as before.
export type TapProps = { runs: TapRun[]; cells?: (number | null)[] }

// A plain Button on the desktop is a native control: the host picks its label colour, which on a
// light app theme is dark and vanishes into this pane's dark background. This draws the same
// label as Text with its own explicit colours and posts a left press for the hooks module
// (ui.message `tap:<key>`), so the pane looks the same in a light theme as in a dark one.
const Tap: ClientModule<TapProps, true> = (p, surface) => {
  if (surface.state === undefined) {
    surface.setState(true)
    surface.onPointer(e => {
      if (e.type === 'down') surface.post({ button: e.button ?? 'left' })
    })
  }
  const { Box, Text } = surface.elements
  if (p.cells)
    return (
      <Box flexDirection="row" width="100%" height={1} overflow="hidden">
        {p.runs.map((r, i) => {
          const w = p.cells?.[i] ?? null
          const text = (
            <Text mono wrap={w === null ? 'truncate-end' : undefined} color={r.color} backgroundColor={r.backgroundColor} weight={r.weight} italic={r.italic}>
              {r.t}
            </Text>
          )
          return w === null ? (
            <Box flexGrow={1} flexShrink={1} overflow="hidden">
              {text}
            </Box>
          ) : (
            <Box width={w} flexShrink={0}>
              {text}
            </Box>
          )
        })}
      </Box>
    )
  return (
    <Text mono>
      {p.runs.map(r => (
        <Text mono color={r.color} backgroundColor={r.backgroundColor} weight={r.weight} italic={r.italic}>
          {r.t}
        </Text>
      ))}
    </Text>
  )
}

export default Tap
