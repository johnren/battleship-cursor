import { placeShip } from './placement.ts'
import type { PlacedShip } from './ships.ts'

/** Known-valid fleet used by unit tests: each ship on its own row, left-aligned. */
export function standardFleet(): PlacedShip[] {
  let ships: PlacedShip[] = []
  ships = placeShip(ships, 'carrier', { row: 0, col: 0 }, 'horizontal') ?? []
  ships = placeShip(ships, 'battleship', { row: 1, col: 0 }, 'horizontal') ?? ships
  ships = placeShip(ships, 'cruiser', { row: 2, col: 0 }, 'horizontal') ?? ships
  ships = placeShip(ships, 'submarine', { row: 3, col: 0 }, 'horizontal') ?? ships
  ships = placeShip(ships, 'destroyer', { row: 4, col: 0 }, 'horizontal') ?? ships
  return ships
}
