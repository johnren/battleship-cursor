import { createBoard, type Board } from './board.ts'
import { aiMode, chooseShot, createAiState, rememberShot, type AiState } from './computer.ts'
import type { Coord } from './coord.ts'
import { fire, isWinningBoard, type FireOutcome } from './firing.ts'
import { canPlace, placeFleetRandomly, placeShip } from './placement.ts'
import { createRng, restoreRng, type Rng } from './rng.ts'
import { SHIP_DEFS, type Orientation, type ShipId } from './ships.ts'

export type Phase = 'placement' | 'battle' | 'over'
export type Actor = 'player' | 'computer'

export type LogEntry = {
  actor: Actor
  kind: 'hit' | 'miss' | 'sunk'
  coord: Coord
  shipName?: string
}

export type GameState = {
  seed: number
  rngState: number
  phase: Phase
  orientation: Orientation
  selectedShipId: ShipId | null
  playerBoard: Board
  enemyBoard: Board
  turn: Actor
  winner: Actor | null
  log: LogEntry[]
  ai: AiState
  playerShotsFired: number
  playerHits: number
  computerMoveNonce: number
}

export type GameAction =
  | { type: 'SELECT_SHIP'; id: ShipId }
  | { type: 'ROTATE' }
  | { type: 'PLACE_SHIP'; origin: Coord }
  | { type: 'RANDOMIZE'; rng?: Rng }
  | { type: 'RESET_PLACEMENT' }
  | { type: 'START' }
  | { type: 'PLAYER_FIRE'; coord: Coord }
  | { type: 'COMPUTER_FIRE' }
  | { type: 'PLAY_AGAIN' }

function nextSelectedShip(placedIds: Set<ShipId>, current: ShipId | null): ShipId | null {
  const remaining = SHIP_DEFS.filter((ship) => !placedIds.has(ship.id))
  if (remaining.length === 0) return null
  if (current && remaining.some((ship) => ship.id === current)) return current
  return remaining[0]?.id ?? null
}

export function createInitialState(seed: number): GameState {
  const rng = createRng(seed)
  const enemyShips = placeFleetRandomly(rng)
  return {
    seed,
    rngState: rng.getState(),
    phase: 'placement',
    orientation: 'horizontal',
    selectedShipId: 'carrier',
    playerBoard: createBoard(),
    enemyBoard: createBoard(enemyShips),
    turn: 'player',
    winner: null,
    log: [],
    ai: createAiState(),
    playerShotsFired: 0,
    playerHits: 0,
    computerMoveNonce: 0,
  }
}

function logFromOutcome(actor: Actor, outcome: FireOutcome): LogEntry | null {
  if (outcome.kind === 'hit' || outcome.kind === 'miss' || outcome.kind === 'sunk') {
    return {
      actor,
      kind: outcome.kind,
      coord: outcome.coord,
      shipName: outcome.shipName,
    }
  }
  return null
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_SHIP': {
      if (state.phase !== 'placement') return state
      if (state.playerBoard.ships.some((ship) => ship.id === action.id)) return state
      return { ...state, selectedShipId: action.id }
    }
    case 'ROTATE': {
      if (state.phase !== 'placement') return state
      return {
        ...state,
        orientation: state.orientation === 'horizontal' ? 'vertical' : 'horizontal',
      }
    }
    case 'PLACE_SHIP': {
      if (state.phase !== 'placement' || !state.selectedShipId) return state
      const nextShips = placeShip(
        state.playerBoard.ships,
        state.selectedShipId,
        action.origin,
        state.orientation,
      )
      if (!nextShips) return state
      const placedIds = new Set(nextShips.map((ship) => ship.id))
      return {
        ...state,
        playerBoard: { ...state.playerBoard, ships: nextShips },
        selectedShipId: nextSelectedShip(placedIds, state.selectedShipId),
      }
    }
    case 'RANDOMIZE': {
      if (state.phase !== 'placement') return state
      const rng = action.rng ?? createRng((Date.now() ^ state.rngState) >>> 0)
      return {
        ...state,
        playerBoard: createBoard(placeFleetRandomly(rng)),
        selectedShipId: null,
      }
    }
    case 'RESET_PLACEMENT': {
      if (state.phase !== 'placement') return state
      return {
        ...state,
        playerBoard: createBoard(),
        selectedShipId: 'carrier',
      }
    }
    case 'START': {
      if (state.phase !== 'placement') return state
      if (state.playerBoard.ships.length !== SHIP_DEFS.length) return state
      return {
        ...state,
        phase: 'battle',
        turn: 'player',
        selectedShipId: null,
      }
    }
    case 'PLAYER_FIRE': {
      if (state.phase !== 'battle' || state.turn !== 'player') return state
      const { board, outcome } = fire(state.enemyBoard, action.coord)
      if (outcome.kind === 'repeat' || outcome.kind === 'out-of-bounds') return state
      const entry = logFromOutcome('player', outcome)
      const playerHits = state.playerHits + (outcome.kind === 'miss' ? 0 : 1)
      const next: GameState = {
        ...state,
        enemyBoard: board,
        playerShotsFired: state.playerShotsFired + 1,
        playerHits,
        log: entry ? [entry, ...state.log] : state.log,
      }
      if (isWinningBoard(board)) {
        return { ...next, phase: 'over', winner: 'player', turn: 'player' }
      }
      return { ...next, turn: 'computer' }
    }
    case 'COMPUTER_FIRE': {
      if (state.phase !== 'battle' || state.turn !== 'computer') return state
      const rng = restoreRng(state.rngState)
      const coord = chooseShot(state.ai, rng)
      const { board, outcome } = fire(state.playerBoard, coord)
      if (outcome.kind === 'repeat' || outcome.kind === 'out-of-bounds') {
        return {
          ...state,
          rngState: rng.getState(),
          ai: rememberShot(state.ai, { ...outcome, coord }),
        }
      }
      const entry = logFromOutcome('computer', outcome)
      const next: GameState = {
        ...state,
        playerBoard: board,
        rngState: rng.getState(),
        ai: rememberShot(state.ai, outcome),
        log: entry ? [entry, ...state.log] : state.log,
      }
      if (isWinningBoard(board)) {
        return { ...next, phase: 'over', winner: 'computer', turn: 'computer' }
      }
      return { ...next, turn: 'player' }
    }
    case 'PLAY_AGAIN': {
      const reset = createInitialState(state.seed)
      return {
        ...reset,
        computerMoveNonce: state.computerMoveNonce + 1,
      }
    }
    default:
      return state
  }
}

export function canPlaceSelected(state: GameState, origin: Coord): boolean {
  if (!state.selectedShipId) return false
  const def = SHIP_DEFS.find((ship) => ship.id === state.selectedShipId)
  if (!def) return false
  return canPlace(state.playerBoard.ships, origin, def.length, state.orientation)
}

export { aiMode }
