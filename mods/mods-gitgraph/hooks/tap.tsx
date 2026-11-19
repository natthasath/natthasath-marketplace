import type { ClientModule } from 'claude-code'

export type TapRun = { t: string; color?: string; dim?: boolean; backgroundColor?: string; weight?: 'bold'; italic?: boolean }
export type TapProps = { runs: TapRun[] }

// A plain Button on the desktop is a native control: the host picks its label colour, so a
// dimmed label or a coloured run would not show. This draws the same label as Text with the
// runs' own colours and posts a left press for the hooks module (ui.message `tap:<key>`).
const Tap: ClientModule<TapProps, true> = (p, surface) => {
  if (surface.state === undefined) {
    surface.setState(true)
    surface.onPointer(e => {
      if (e.type === 'down') surface.post({ button: e.button ?? 'left' })
    })
  }
  const { Text } = surface.elements
  return (
    <Text mono>
      {p.runs.map(r => (
        <Text mono color={r.color} dimColor={r.dim} backgroundColor={r.backgroundColor} weight={r.weight} italic={r.italic}>
          {r.t}
        </Text>
      ))}
    </Text>
  )
}

export default Tap
