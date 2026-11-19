import { describe, expect, test } from 'claude-code/testing'

import { clampTop, windowAt } from './virtual'

// The rows a docked pane draws between its fixed header and footer.
describe('the docked pane scrolls its own rows', () => {
  test('a graph shorter than the window shows whole, from the top', () => {
    expect(windowAt([1, 1, 1], 0, 10)).toEqual({ from: 0, to: 3, shift: 0 })
    expect(clampTop(5, 3, 10)).toBe(0)
  })

  test('the window shows the rows it meets', () => {
    expect(windowAt([1, 1, 1, 1, 1, 1], 2, 3)).toEqual({ from: 2, to: 5, shift: 0 })
  })

  test('a tall row (an open detail) cut by the top is shifted up by what is hidden', () => {
    expect(windowAt([1, 6, 1, 1], 3, 3)).toEqual({ from: 1, to: 2, shift: 2 })
  })

  test('the top stays inside the graph', () => {
    expect(clampTop(-4, 20, 5)).toBe(0)
    expect(clampTop(99, 20, 5)).toBe(15)
  })
})
