import { describe, expect, test } from 'claude-code/testing'

import { COMPACT_COLS, EDGE_SAFETY, headerText, metaOf, subjectRoom } from './columns'

const HASH = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
// What a row is made of, left to right, as renderRow lays it out.
function rowText(cols: number, graphWidth: number, pillsWidth: number, author: string): string {
  const meta = metaOf(cols, author, HASH)
  const room = subjectRoom(cols, graphWidth, meta.length, pillsWidth)
  return `${'●'.padEnd(graphWidth + 1)}${'p'.repeat(pillsWidth)}${'subject'.padEnd(room)}${meta}`
}

describe('header columns line up with the rows', () => {
  for (const cols of [70, 80, 100, 120, 160, 200]) {
    for (const graphWidth of [6, 10, 20]) {
      test(`cols ${cols}, graph ${graphWidth}`, () => {
        const header = headerText(cols, graphWidth)
        const row = rowText(cols, graphWidth, 9, 'Natthasath S')
        // Both end EDGE_SAFETY cells short of the pane, so neither overflows nor is cut.
        expect(header.length).toBe(cols - EDGE_SAFETY)
        expect(row.length).toBe(cols - EDGE_SAFETY)
        // Author and Commit start in the same cells as the row's author and hash.
        expect(header.indexOf('Author')).toBe(row.indexOf('Natthasath S'))
        expect(header.indexOf('Commit')).toBe(row.indexOf(HASH.slice(0, 7)))
        // The Description column starts where the row's pills do.
        expect(header.indexOf('Description')).toBe(row.indexOf('p'))
      })
    }
  }

  test('a long author is cut to its column, not past it', () => {
    const row = rowText(100, 8, 0, 'Someone With A Very Long Name')
    expect(row.length).toBe(100 - EDGE_SAFETY)
  })

  test('narrow panes use the compact meta and keep the hash column aligned', () => {
    const cols = COMPACT_COLS - 1
    const row = rowText(cols, 8, 0, 'Natthasath')
    expect(row.length).toBe(cols - EDGE_SAFETY)
    expect(row.endsWith(HASH.slice(0, 7))).toBe(true)
  })

  test('the room never goes negative when the pills take everything', () => {
    expect(subjectRoom(70, 20, 23, 80)).toBe(0)
  })
})
