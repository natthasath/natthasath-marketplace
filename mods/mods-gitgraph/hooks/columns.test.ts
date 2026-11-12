import { describe, expect, test } from 'claude-code/testing'

import { COMPACT_COLS, EDGE_SAFETY, authorCell, authorCol, authorHeader, descriptionCol, hashCell, hashCol, hashHeader, subjectRoom } from './columns'

const HASH = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
const WIDTHS = [70, 80, 100, 120, 160, 200]
const GRAPHS = [6, 10, 20]

// A line laid out as the pane lays it: graph, Description, Author, Commit, the edge's cell.
const lineOf = (cols: number, graphWidth: number, description: string, author: string, hash: string) =>
  `${''.padEnd(graphWidth + 1)}${description.padEnd(descriptionCol(cols, graphWidth))}${author}${hash}${' '.repeat(EDGE_SAFETY)}`

describe('Description, Author and Commit line up on every width', () => {
  for (const cols of WIDTHS) {
    for (const graphWidth of GRAPHS) {
      test(`cols ${cols}, graph ${graphWidth}`, () => {
        const pills = 9
        const subject = 'p'.repeat(pills) + 'subject'.padEnd(subjectRoom(cols, graphWidth, pills))
        const row = lineOf(cols, graphWidth, subject, authorCell(cols, 'Natthasath S'), hashCell(cols, HASH))
        const header = lineOf(cols, graphWidth, 'Description', authorHeader(), hashHeader(cols))
        // Each column's text is exactly its column's width.
        expect(authorCell(cols, 'Natthasath S').length).toBe(authorCol(cols))
        expect(authorHeader().length).toBe(authorCol(cols))
        expect(hashCell(cols, HASH).length).toBe(hashCol(cols))
        expect(hashHeader(cols).length).toBe(hashCol(cols))
        // Both fill the pane exactly.
        expect(row.length).toBe(cols)
        expect(header.length).toBe(cols)
        // Each header starts in the same cell as its column's value.
        expect(header.indexOf('Description')).toBe(row.indexOf('p'))
        expect(header.indexOf('Author')).toBe(row.indexOf('Natthasath S'))
        expect(header.indexOf('Commit')).toBe(row.indexOf(HASH.slice(0, 7)))
      })
    }
  }

  test('a long author is cut to its column', () => {
    expect(authorCell(100, 'Someone With A Very Long Name').length).toBe(authorCol(100))
  })

  test('a narrow pane drops the Author column and keeps the hash', () => {
    const cols = COMPACT_COLS - 1
    expect(authorCol(cols)).toBe(0)
    expect(hashCell(cols, HASH).length).toBe(hashCol(cols))
  })

  test('the subject room never goes negative when the pills take everything', () => {
    expect(subjectRoom(70, 20, 80)).toBe(0)
  })
})
