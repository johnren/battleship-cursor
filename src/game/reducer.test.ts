import { describe, expect, it } from 'vitest'
import { createInitialState, gameReducer } from './reducer.ts'
import { placeFleetRandomly } from './placement.ts'
import { createRng } from './rng.ts'
import { SHIP_DEFS } from './ships.ts'

function startedGame(seed = 42) {
  let state = createInitialState(seed)
  state = gameReducer(state, { type: 'RANDOMIZE', rng: createRng(99) })
  state = gameReducer(state, { type: 'START' })
  return state
}

describe('gameReducer', () => {
  it('starts disabled until all five ships are placed', () => {
    let state = createInitialState(1)
    const afterStart = gameReducer(state, { type: 'START' })
    expect(afterStart.phase).toBe('placement')
    state = gameReducer(state, {
      type: 'PLACE_SHIP',
      origin: { row: 0, col: 0 },
    })
    expect(state.playerBoard.ships).toHaveLength(1)
    expect(gameReducer(state, { type: 'START' }).phase).toBe('placement')
    state = gameReducer(state, { type: 'RANDOMIZE', rng: createRng(2) })
    expect(state.playerBoard.ships).toHaveLength(SHIP_DEFS.length)
    state = gameReducer(state, { type: 'START' })
    expect(state.phase).toBe('battle')
    expect(state.turn).toBe('player')
  })

  it('ignores a second click on the same enemy cell and does not consume a turn', () => {
    let state = startedGame()
    const coord = { row: 0, col: 0 }
    state = gameReducer(state, { type: 'PLAYER_FIRE', coord })
    expect(state.turn).toBe('computer')
    const shots = state.playerShotsFired
    const blocked = gameReducer(state, { type: 'PLAYER_FIRE', coord })
    expect(blocked).toBe(state)
    expect(blocked.playerShotsFired).toBe(shots)
  })

  it('Play Again fully resets state, including a pending computer move', () => {
    let state = startedGame(42)
    const enemyShips = state.enemyBoard.ships
    state = gameReducer(state, { type: 'PLAYER_FIRE', coord: { row: 0, col: 0 } })
    expect(state.turn).toBe('computer')
    expect(state.phase).toBe('battle')
    const nonce = state.computerMoveNonce
    const pending = { ...state }
    state = gameReducer(state, { type: 'PLAY_AGAIN' })
    expect(state.phase).toBe('placement')
    expect(state.turn).toBe('player')
    expect(state.winner).toBeNull()
    expect(state.log).toEqual([])
    expect(state.playerBoard.ships).toEqual([])
    expect(state.playerShotsFired).toBe(0)
    expect(state.playerHits).toBe(0)
    expect(state.ai.fired).toEqual([])
    expect(state.ai.unresolvedHits).toEqual([])
    expect(state.computerMoveNonce).toBe(nonce + 1)
    const afterCancel = gameReducer(state, { type: 'COMPUTER_FIRE' })
    expect(afterCancel.turn).toBe('player')
    expect(afterCancel.playerBoard.shots.flat().every((shot) => shot === null)).toBe(true)
    expect(gameReducer(pending, { type: 'COMPUTER_FIRE' }).turn).toBe('player')
    expect(state.enemyBoard.ships).toEqual(enemyShips)
    expect(placeFleetRandomly(createRng(42)).map((s) => s.id)).toEqual(
      state.enemyBoard.ships.map((s) => s.id),
    )
  })
})
