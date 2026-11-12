import type { ClientModule } from 'claude-code'

export type TapRun = { t: string; color?: string; backgroundColor?: string; weight?: 'bold'; italic?: boolean }
export type TapProps = { runs: TapRun[] }

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
  const { Text } = surface.elements
  return (
    <Text>
      {p.runs.map(r => (
        <Text color={r.color} backgroundColor={r.backgroundColor} weight={r.weight} italic={r.italic}>
          {r.t}
        </Text>
      ))}
    </Text>
  )
}

export default Tap
