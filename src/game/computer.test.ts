import { describe, expect, it } from 'vitest'
import { createBoard } from './board.ts'
import { aiMode, chooseShot, createAiState, rememberShot } from './computer.ts'
import { coordKey, inBounds } from './coord.ts'
import { fire } from './firing.ts'
import { placeFleetRandomly } from './placement.ts'
import { createRng } from './rng.ts'
import { BOARD_SIZE } from './coord.ts'

describe('computer opponent', () => {
  it('in 100 full games never repeats a shot, never fires off the board, and stays in target mode while hits remain', () => {
    for (let game = 0; game < 100; game++) {
      const rng = createRng(1000 + game)
      const playerBoard = createBoard(placeFleetRandomly(createRng(5000 + game)))
      let board = playerBoard
      let ai = createAiState()
      const seen = new Set<string>()
      let shots = 0

      while (shots < BOARD_SIZE * BOARD_SIZE) {
        const unresolvedBefore = ai.unresolvedHits.length
        if (unresolvedBefore > 0) {
          expect(aiMode(ai)).toBe('target')
        }
        const coord = chooseShot(ai, rng)
        expect(inBounds(coord)).toBe(true)
        const key = coordKey(coord)
        expect(seen.has(key)).toBe(false)
        seen.add(key)
        if (unresolvedBefore > 0) {
          expect(aiMode(ai)).toBe('target')
        }
        const { board: next, outcome } = fire(board, coord)
        expect(outcome.kind === 'repeat' || outcome.kind === 'out-of-bounds').toBe(false)
        board = next
        ai = rememberShot(ai, outcome)
        if (outcome.kind === 'hit' || outcome.kind === 'sunk') {
          const stillUnresolved = ai.unresolvedHits.length > 0
          if (stillUnresolved) {
            expect(aiMode(ai)).toBe('target')
          }
        }
        shots += 1
        if (board.ships.every((ship) => ship.hitCount >= ship.length)) break
      }

      expect(board.ships.every((ship) => ship.hitCount >= ship.length)).toBe(true)
    }
  })

  it('enters target mode after a hit and hunts again only after a sink with no leftover hits', () => {
    const board = createBoard(placeFleetRandomly(createRng(7)))
    const destroyer = board.ships.find((ship) => ship.id === 'destroyer')
    if (!destroyer) throw new Error('missing destroyer')
    let ai = createAiState()
    const first = fire(board, destroyer.cells[0]!)
    ai = rememberShot(ai, first.outcome)
    expect(aiMode(ai)).toBe('target')
    const second = fire(first.board, destroyer.cells[1]!)
    ai = rememberShot(ai, second.outcome)
    expect(aiMode(ai)).toBe('hunt')
  })
})
