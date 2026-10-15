import type { Coord } from './coord.ts'

export const SHIP_DEFS = [
  { id: 'carrier', name: 'Carrier', length: 5 },
  { id: 'battleship', name: 'Battleship', length: 4 },
  { id: 'cruiser', name: 'Cruiser', length: 3 },
  { id: 'submarine', name: 'Submarine', length: 3 },
  { id: 'destroyer', name: 'Destroyer', length: 2 },
] as const

export type ShipId = (typeof SHIP_DEFS)[number]['id']

export const FLEET_CELL_COUNT = SHIP_DEFS.reduce((sum, ship) => sum + ship.length, 0)

export type Orientation = 'horizontal' | 'vertical'

export type PlacedShip = {
  id: ShipId
  name: string
  length: number
  cells: Coord[]
  hitCount: number
}
