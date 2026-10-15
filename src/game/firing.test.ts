import { describe, expect, it } from 'vitest'
import { createBoard } from './board.ts'
import { fire, isWinningBoard } from './firing.ts'
import { SHIP_DEFS, type ShipId } from './ships.ts'
import { standardFleet } from './testFleet.ts'
import type { Coord } from './coord.ts'

function sinkShip(board: ReturnType<typeof createBoard>, id: ShipId) {
  const ship = board.ships.find((s) => s.id === id)
  if (!ship) throw new Error(`missing ${id}`)
  let current = board
  let last = fire(current, ship.cells[0] as Coord).outcome
  for (const cell of ship.cells) {
    const result = fire(current, cell)
    current = result.board
    last = result.outcome
  }
  return { board: current, last }
}

describe('fire', () => {
  it('reports a miss on empty water', () => {
    const board = createBoard(standardFleet())
    const { board: next, outcome } = fire(board, { row: 9, col: 9 })
    expect(outcome.kind).toBe('miss')
    expect(next.shots[9]?.[9]).toBe('miss')
  })

  it('reports a hit on a ship cell', () => {
    const board = createBoard(standardFleet())
    const { board: next, outcome } = fire(board, { row: 0, col: 0 })
    expect(outcome.kind).toBe('hit')
    expect(outcome.shipName).toBe('Carrier')
    expect(next.shots[0]?.[0]).toBe('hit')
    expect(next.ships[0]?.hitCount).toBe(1)
  })

  it('rejects a repeated shot without changing the board', () => {
    const board = createBoard(standardFleet())
    const first = fire(board, { row: 9, col: 9 })
    const second = fire(first.board, { row: 9, col: 9 })
    expect(second.outcome.kind).toBe('repeat')
    expect(second.board).toBe(first.board)
  })

  it('rejects a repeated hit', () => {
    const board = createBoard(standardFleet())
    const first = fire(board, { row: 0, col: 0 })
    const second = fire(first.board, { row: 0, col: 0 })
    expect(second.outcome.kind).toBe('repeat')
    expect(first.board.ships[0]?.hitCount).toBe(1)
  })

  it('rejects shots off the board', () => {
    const board = createBoard(standardFleet())
    expect(fire(board, { row: -1, col: 0 }).outcome.kind).toBe('out-of-bounds')
    expect(fire(board, { row: 0, col: 10 }).outcome.kind).toBe('out-of-bounds')
  })
})

describe('sunk detection', () => {
  it.each(SHIP_DEFS.map((ship) => [ship.id, ship.name, ship.length] as const))(
    'sinks the %s',
    (id, name, length) => {
      const started = createBoard(standardFleet())
      const { board, last } = sinkShip(started, id)
      expect(last.kind).toBe('sunk')
      expect(last.shipName).toBe(name)
      expect(last.sunkCells).toHaveLength(length)
      const sunk = board.ships.find((ship) => ship.id === id)
      expect(sunk?.hitCount).toBe(length)
      for (const cell of sunk?.cells ?? []) {
        expect(board.shots[cell.row]?.[cell.col]).toBe('sunk')
      }
    },
  )
})

describe('win detection', () => {
  it('does not win until every ship cell is hit', () => {
    let board = createBoard(standardFleet())
    expect(isWinningBoard(board)).toBe(false)
    for (const ship of SHIP_DEFS.slice(0, 4)) {
      board = sinkShip(board, ship.id).board
      expect(isWinningBoard(board)).toBe(false)
    }
    board = sinkShip(board, 'destroyer').board
    expect(isWinningBoard(board)).toBe(true)
  })
})
