import { short, truncate } from './format'

// The pane's text columns, in cells. Rows and the header lay these out as fixed-width boxes, so
// Author and Commit sit in the same cells on every row and under their header whatever the graph,
// the pills or the subject measure; only the Description column between them grows and shrinks.
export const AUTHOR_W = 12
export const HASH_W = 7
export const EDGE_SAFETY = 1
// Below this width the pane drops its header and the Author column, keeping the hash.
export const COMPACT_COLS = 70
// The gap before the Author and the Commit columns.
const GAP = 2

export const isCompact = (cols: number) => cols < COMPACT_COLS
export const authorCol = (cols: number) => (isCompact(cols) ? 0 : GAP + AUTHOR_W)
export const hashCol = (cols: number) => (isCompact(cols) ? 1 + HASH_W : GAP + HASH_W)
// Everything right of the Description column, the edge's safety cell included.
export const rightCols = (cols: number) => authorCol(cols) + hashCol(cols) + EDGE_SAFETY

// The text of a row's Author and Commit cells, each exactly its column's width.
export const authorCell = (cols: number, author: string) => `${' '.repeat(GAP)}${truncate(author, AUTHOR_W).padEnd(AUTHOR_W)}`
export const hashCell = (cols: number, hash: string) => `${' '.repeat(isCompact(cols) ? 1 : GAP)}${short(hash).padEnd(HASH_W)}`
// The header's own, the same widths.
export const authorHeader = () => `${' '.repeat(GAP)}${'Author'.padEnd(AUTHOR_W)}`
export const hashHeader = (cols: number) => `${' '.repeat(isCompact(cols) ? 1 : GAP)}${'Commit'.padEnd(HASH_W)}`

// The Description column: what is left once the graph and the right-hand columns have their cells.
export const descriptionCol = (cols: number, graphWidth: number) => Math.max(0, cols - (graphWidth + 1) - rightCols(cols))

// What a row gives its subject once its pills have their cells in the Description column.
export const subjectRoom = (cols: number, graphWidth: number, pillsWidth: number) => Math.max(0, descriptionCol(cols, graphWidth) - pillsWidth)
