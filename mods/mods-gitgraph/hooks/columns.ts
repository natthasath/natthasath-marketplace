import { short, truncate } from './format'

// The pane's text columns, in cells. The header and the rows both take their widths from here, so
// they cannot drift apart: the header once measured its meta columns with an empty hash and ran
// several cells wider than the rows.
export const AUTHOR_W = 12
export const HASH_W = 7
export const EDGE_SAFETY = 1
// Below this width the pane drops its header and the Author column, keeping the hash.
export const COMPACT_COLS = 70

// A row's right-hand columns: two spaces, the author, two spaces, the short hash.
export function metaOf(cols: number, author: string, hash: string): string {
  if (cols < COMPACT_COLS) return ` ${short(hash)}`
  return `  ${truncate(author, AUTHOR_W).padEnd(AUTHOR_W)}  ${short(hash)}`
}

// The header's right-hand columns, as wide as a row's (`Commit` is 6 cells, a short hash 7).
export function metaHeader(cols: number): string {
  if (cols < COMPACT_COLS) return ` ${'Commit'.padEnd(HASH_W)}`
  return `  ${'Author'.padEnd(AUTHOR_W)}  ${'Commit'.padEnd(HASH_W)}`
}

// What a row gives its subject once the graph, the pills and the meta columns have their cells.
export function subjectRoom(cols: number, graphWidth: number, metaLength: number, pillsWidth: number): number {
  return Math.max(0, cols - (graphWidth + 1 + metaLength + EDGE_SAFETY) - pillsWidth)
}

// The header line: Graph, Description (the pills and the subject), then Author and Commit.
export function headerText(cols: number, graphWidth: number): string {
  const metaLength = metaHeader(cols).length
  return `${'Graph'.padEnd(graphWidth + 1)}${'Description'.padEnd(Math.max(0, cols - graphWidth - 1 - metaLength - EDGE_SAFETY))}${metaHeader(cols)}`
}
