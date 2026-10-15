import { describe, expect, it } from 'vitest'
import { cellsForPlacement, canPlace, placeFleetRandomly, placeShip } from './placement.ts'
import { createRng } from './rng.ts'
import { SHIP_DEFS } from './ships.ts'
import { occupiedKeys } from './board.ts'
import { BOARD_SIZE } from './coord.ts'

describe('cellsForPlacement', () => {
  it('places a horizontal ship fully on the board', () => {
    expect(cellsForPlacement({ row: 0, col: 0 }, 5, 'horizontal')).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ])
  })

  it('places a vertical ship fully on the board', () => {
    expect(cellsForPlacement({ row: 5, col: 9 }, 3, 'vertical')).toEqual([
      { row: 5, col: 9 },
      { row: 6, col: 9 },
      { row: 7, col: 9 },
    ])
  })

  it('rejects a horizontal ship that would pass column 10', () => {
    expect(cellsForPlacement({ row: 0, col: 9 }, 2, 'horizontal')).toBeNull()
    expect(cellsForPlacement({ row: 3, col: 8 }, 3, 'horizontal')).toBeNull()
    expect(cellsForPlacement({ row: 9, col: 6 }, 5, 'horizontal')).toBeNull()
  })

  it('rejects a vertical ship that would pass row J', () => {
    expect(cellsForPlacement({ row: 9, col: 0 }, 2, 'vertical')).toBeNull()
    expect(cellsForPlacement({ row: 8, col: 4 }, 3, 'vertical')).toBeNull()
    expect(cellsForPlacement({ row: 6, col: 9 }, 5, 'vertical')).toBeNull()
  })

  it('does not wrap from column 10 to column 1', () => {
    const cells = cellsForPlacement({ row: 0, col: 9 }, 2, 'horizontal')
    expect(cells).toBeNull()
    expect(canPlace([], { row: 0, col: 9 }, 2, 'horizontal')).toBe(false)
  })

  it('does not wrap from row J to row A', () => {
    expect(cellsForPlacement({ row: 9, col: 4 }, 2, 'vertical')).toBeNull()
    expect(canPlace([], { row: 9, col: 4 }, 2, 'vertical')).toBe(false)
  })

  it('allows a ship that ends on the last column or last row', () => {
    expect(canPlace([], { row: 0, col: 8 }, 2, 'horizontal')).toBe(true)
    expect(canPlace([], { row: 8, col: 0 }, 2, 'vertical')).toBe(true)
    expect(cellsForPlacement({ row: 0, col: 8 }, 2, 'horizontal')).toEqual([
      { row: 0, col: 8 },
      { row: 0, col: 9 },
    ])
  })
})

describe('canPlace overlaps and touching', () => {
  const destroyer = placeShip([], 'destroyer', { row: 0, col: 0 }, 'horizontal') ?? []

  it('rejects overlapping ships', () => {
    expect(canPlace(destroyer, { row: 0, col: 0 }, 3, 'horizontal')).toBe(false)
    expect(canPlace(destroyer, { row: 0, col: 1 }, 2, 'horizontal')).toBe(false)
    expect(canPlace(destroyer, { row: 0, col: 1 }, 4, 'vertical')).toBe(false)
  })

  it('allows ships that only touch', () => {
    expect(canPlace(destroyer, { row: 1, col: 0 }, 2, 'horizontal')).toBe(true)
    expect(canPlace(destroyer, { row: 0, col: 2 }, 2, 'horizontal')).toBe(true)
    expect(canPlace(destroyer, { row: 0, col: 1 }, 2, 'vertical')).toBe(false)
    expect(canPlace(destroyer, { row: 1, col: 1 }, 2, 'vertical')).toBe(true)
  })

  it('rejects a second copy of the same ship id', () => {
    expect(placeShip(destroyer, 'destroyer', { row: 5, col: 5 }, 'horizontal')).toBeNull()
  })
})

describe('placeFleetRandomly', () => {
  it('places every ship on the board without overlap', () => {
    const ships = placeFleetRandomly(createRng(123))
    expect(ships).toHaveLength(SHIP_DEFS.length)
    const keys = occupiedKeys(ships)
    expect(keys.size).toBe(SHIP_DEFS.reduce((sum, ship) => sum + ship.length, 0))
    for (const ship of ships) {
      expect(ship.cells).toHaveLength(ship.length)
      for (const cell of ship.cells) {
        expect(cell.row).toBeGreaterThanOrEqual(0)
        expect(cell.row).toBeLessThan(BOARD_SIZE)
        expect(cell.col).toBeGreaterThanOrEqual(0)
        expect(cell.col).toBeLessThan(BOARD_SIZE)
      }
    }
  })
})
