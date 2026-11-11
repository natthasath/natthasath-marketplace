import type { ClientModule } from 'claude-code'

import { drawPill, type PillProps } from './pilldraw'

// Draws a ref pill client-side so a left or right click on it can be told apart
// (a plain Button's press cannot): it posts the button that went down, and the
// hooks module (ui.message) opens the badge's menu or selects the commit.
const Pill: ClientModule<PillProps, true> = (p, surface) => {
  if (surface.state === undefined) {
    surface.setState(true)
    surface.onPointer(e => {
      if (e.type === 'down') surface.post({ button: e.button ?? 'left' })
    })
  }
  return drawPill(surface.elements.Text, p)
}

export default Pill
