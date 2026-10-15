import { occupiedKeys } from './board.ts'
import { BOARD_SIZE, coordKey, inBounds, type Coord } from './coord.ts'
import type { Rng } from './rng.ts'
import { SHIP_DEFS, type Orientation, type PlacedShip, type ShipId } from './ships.ts'

export function cellsForPlacement(
  origin: Coord,
  length: number,
  orientation: Orientation,
): Coord[] | null {
  const cells: Coord[] = []
  for (let i = 0; i < length; i++) {
    const cell: Coord = {
      row: orientation === 'vertical' ? origin.row + i : origin.row,
      col: orientation === 'horizontal' ? origin.col + i : origin.col,
    }
    if (!inBounds(cell)) return null
    cells.push(cell)
  }
  return cells
}

export function canPlace(
  existing: PlacedShip[],
  origin: Coord,
  length: number,
  orientation: Orientation,
): boolean {
  const cells = cellsForPlacement(origin, length, orientation)
  if (!cells) return false
  const occupied = occupiedKeys(existing)
  return cells.every((cell) => !occupied.has(coordKey(cell)))
}

export function placeShip(
  existing: PlacedShip[],
  id: ShipId,
  origin: Coord,
  orientation: Orientation,
): PlacedShip[] | null {
  const def = SHIP_DEFS.find((ship) => ship.id === id)
  if (!def) return null
  if (existing.some((ship) => ship.id === id)) return null
  if (!canPlace(existing, origin, def.length, orientation)) return null
  const cells = cellsForPlacement(origin, def.length, orientation)
  if (!cells) return null
  return [
    ...existing,
    {
      id: def.id,
      name: def.name,
      length: def.length,
      cells,
      hitCount: 0,
    },
  ]
}

export function placeFleetRandomly(rng: Rng): PlacedShip[] {
  const ships: PlacedShip[] = []
  for (const def of SHIP_DEFS) {
    let placed = false
    for (let attempt = 0; attempt < 500; attempt++) {
      const orientation: Orientation = rng.int(2) === 0 ? 'horizontal' : 'vertical'
      const origin: Coord = {
        row: rng.int(BOARD_SIZE),
        col: rng.int(BOARD_SIZE),
      }
      const next = placeShip(ships, def.id, origin, orientation)
      if (next) {
        ships.length = 0
        ships.push(...next)
        placed = true
        break
      }
    }
    if (!placed) {
      throw new Error(`Failed to place ${def.name}`)
    }
  }
  return ships
}
