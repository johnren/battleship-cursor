export const BOARD_SIZE = 10

export type Coord = {
  row: number
  col: number
}

export function inBounds(coord: Coord): boolean {
  return (
    coord.row >= 0 &&
    coord.row < BOARD_SIZE &&
    coord.col >= 0 &&
    coord.col < BOARD_SIZE
  )
}

export function coordKey(coord: Coord): string {
  return `${coord.row},${coord.col}`
}

export function coordsEqual(a: Coord, b: Coord): boolean {
  return a.row === b.row && a.col === b.col
}

export function manhattan(a: Coord, b: Coord): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

export function neighbors(coord: Coord): Coord[] {
  return [
    { row: coord.row - 1, col: coord.col },
    { row: coord.row + 1, col: coord.col },
    { row: coord.row, col: coord.col - 1 },
    { row: coord.row, col: coord.col + 1 },
  ].filter(inBounds)
}
