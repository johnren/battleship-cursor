import { cloneBoard, getShot, shipAt, type Board } from './board.ts'
import { inBounds, type Coord } from './coord.ts'
import { FLEET_CELL_COUNT, type ShipId } from './ships.ts'

export type FireKind = 'miss' | 'hit' | 'sunk' | 'repeat' | 'out-of-bounds'

export type FireOutcome = {
  kind: FireKind
  coord: Coord
  shipId?: ShipId
  shipName?: string
  sunkCells?: Coord[]
}

function withShot(board: Board, coord: Coord, mark: 'miss' | 'hit' | 'sunk'): Board {
  const next = cloneBoard(board)
  const row = next.shots[coord.row]
  if (row) {
    row[coord.col] = mark
  }
  return next
}

export function fire(board: Board, coord: Coord): { board: Board; outcome: FireOutcome } {
  if (!inBounds(coord)) {
    return { board, outcome: { kind: 'out-of-bounds', coord } }
  }
  if (getShot(board, coord)) {
    return { board, outcome: { kind: 'repeat', coord } }
  }

  const ship = shipAt(board.ships, coord)
  if (!ship) {
    const next = withShot(board, coord, 'miss')
    return { board: next, outcome: { kind: 'miss', coord } }
  }

  const next = cloneBoard(board)
  const nextShip = next.ships.find((candidate) => candidate.id === ship.id)
  if (!nextShip) {
    return { board, outcome: { kind: 'miss', coord } }
  }
  nextShip.hitCount += 1
  const row = next.shots[coord.row]
  if (row) {
    row[coord.col] = 'hit'
  }

  if (nextShip.hitCount >= nextShip.length) {
    for (const cell of nextShip.cells) {
      const sunkRow = next.shots[cell.row]
      if (sunkRow) {
        sunkRow[cell.col] = 'sunk'
      }
    }
    return {
      board: next,
      outcome: {
        kind: 'sunk',
        coord,
        shipId: nextShip.id,
        shipName: nextShip.name,
        sunkCells: nextShip.cells.map((cell) => ({ ...cell })),
      },
    }
  }

  return {
    board: next,
    outcome: {
      kind: 'hit',
      coord,
      shipId: nextShip.id,
      shipName: nextShip.name,
    },
  }
}

export function isWinningBoard(board: Board): boolean {
  const hitCells = board.ships.reduce((sum, ship) => sum + Math.min(ship.hitCount, ship.length), 0)
  return hitCells >= FLEET_CELL_COUNT && board.ships.every((ship) => ship.hitCount >= ship.length)
}

export function remainingShipCells(board: Board): number {
  return board.ships.reduce((sum, ship) => sum + (ship.length - ship.hitCount), 0)
}
