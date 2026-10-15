import { BOARD_SIZE, coordKey, coordsEqual, inBounds, type Coord } from './coord.ts'
import type { PlacedShip } from './ships.ts'

export type ShotMark = 'miss' | 'hit' | 'sunk'

export type Board = {
  ships: PlacedShip[]
  shots: (ShotMark | null)[][]
}

export function emptyShotGrid(): (ShotMark | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  )
}

export function createBoard(ships: PlacedShip[] = []): Board {
  return { ships, shots: emptyShotGrid() }
}

export function occupiedKeys(ships: PlacedShip[]): Set<string> {
  const keys = new Set<string>()
  for (const ship of ships) {
    for (const cell of ship.cells) {
      keys.add(coordKey(cell))
    }
  }
  return keys
}

export function shipAt(ships: PlacedShip[], coord: Coord): PlacedShip | undefined {
  return ships.find((ship) => ship.cells.some((cell) => coordsEqual(cell, coord)))
}

export function getShot(board: Board, coord: Coord): ShotMark | null {
  if (!inBounds(coord)) return null
  return board.shots[coord.row]?.[coord.col] ?? null
}

export function allShipsSunk(board: Board): boolean {
  return board.ships.length > 0 && board.ships.every((ship) => ship.hitCount >= ship.length)
}

export function cloneBoard(board: Board): Board {
  return {
    ships: board.ships.map((ship) => ({
      ...ship,
      cells: ship.cells.map((cell) => ({ ...cell })),
    })),
    shots: board.shots.map((row) => [...row]),
  }
}
