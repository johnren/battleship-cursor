import { describe, expect, it } from 'vitest'
import { cellStatusLabel, formatCoord, formatLogEntry } from '../labels.ts'

describe('labels', () => {
  it('formats coordinates as row letter plus 1-based column', () => {
    expect(formatCoord({ row: 0, col: 0 })).toBe('A1')
    expect(formatCoord({ row: 1, col: 6 })).toBe('B7')
    expect(formatCoord({ row: 9, col: 9 })).toBe('J10')
  })

  it('describes cell status in words, not only color', () => {
    expect(
      cellStatusLabel({ side: 'player', hasShip: true, shot: null, preview: null }),
    ).toBe('your ship')
    expect(
      cellStatusLabel({ side: 'enemy', hasShip: false, shot: 'miss', preview: null }),
    ).toBe('miss')
    expect(
      cellStatusLabel({
        side: 'player',
        hasShip: false,
        shot: null,
        preview: 'invalid',
      }),
    ).toBe('invalid placement')
  })

  it('uses the spec wording for the shot log', () => {
    expect(
      formatLogEntry({ actor: 'player', kind: 'hit', coord: { row: 1, col: 6 } }),
    ).toBe('Hit at B7.')
    expect(
      formatLogEntry({ actor: 'player', kind: 'miss', coord: { row: 2, col: 2 } }),
    ).toBe('Miss at C3.')
    expect(
      formatLogEntry({
        actor: 'player',
        kind: 'sunk',
        coord: { row: 0, col: 0 },
        shipName: 'Cruiser',
      }),
    ).toBe('You sank their Cruiser!')
    expect(
      formatLogEntry({
        actor: 'computer',
        kind: 'hit',
        coord: { row: 4, col: 4 },
        shipName: 'Battleship',
      }),
    ).toBe('They hit your Battleship at E5.')
  })
})
