export { BOARD_SIZE, coordKey, coordsEqual, inBounds, type Coord } from './coord.ts'
export { SHIP_DEFS, FLEET_CELL_COUNT, type ShipId, type Orientation, type PlacedShip } from './ships.ts'
export { createRng, parseSeed, type Rng } from './rng.ts'
export { createBoard, emptyShotGrid, getShot, occupiedKeys, type Board, type ShotMark } from './board.ts'
export {
  canPlace,
  cellsForPlacement,
  visiblePreviewCells,
  placeFleetRandomly,
  placeShip,
} from './placement.ts'
export { fire, isWinningBoard, type FireOutcome } from './firing.ts'
export { aiMode, chooseShot, createAiState, rememberShot, type AiState, type AiMode } from './computer.ts'
export {
  createInitialState,
  gameReducer,
  canPlaceSelected,
  type GameState,
  type GameAction,
  type LogEntry,
  type Phase,
} from './reducer.ts'
