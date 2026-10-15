import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Board } from './components/Board.tsx'
import { FleetStatus } from './components/FleetStatus.tsx'
import { Header } from './components/Header.tsx'
import { MessageLog } from './components/MessageLog.tsx'
import { PlacementBar } from './components/PlacementBar.tsx'
import {
  SHIP_DEFS,
  canPlaceSelected,
  visiblePreviewCells,
  coordsEqual,
  createInitialState,
  gameReducer,
  parseSeed,
  type Coord,
  type ShipId,
} from './game/index.ts'

function readSeed(): number {
  if (typeof window === 'undefined') return 1
  return parseSeed(window.location.search)
}

export default function App() {
  const seed = useMemo(() => readSeed(), [])
  const [state, dispatch] = useReducer(gameReducer, seed, createInitialState)
  const [hover, setHover] = useState<Coord | null>(null)
  const [touchPreview, setTouchPreview] = useState<Coord | null>(null)
  const pointerType = useRef<'mouse' | 'touch' | 'pen'>('mouse')

  const placing = state.phase === 'placement'
  const selected = SHIP_DEFS.find((ship) => ship.id === state.selectedShipId)
  const previewOrigin = hover ?? touchPreview
  const previewCells =
    placing && selected && previewOrigin
      ? visiblePreviewCells(previewOrigin, selected.length, state.orientation)
      : []
  const previewValid = Boolean(
    placing && selected && previewOrigin && canPlaceSelected(state, previewOrigin),
  )

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      pointerType.current = event.pointerType === 'touch' ? 'touch' : event.pointerType === 'pen' ? 'pen' : 'mouse'
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    if (!placing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R' || event.key === ' ') {
        event.preventDefault()
        dispatch({ type: 'ROTATE' })
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [placing])

  function onPlayerPress(coord: Coord) {
    if (!placing) return
    if (pointerType.current === 'touch' || pointerType.current === 'pen') {
      if (!touchPreview || !coordsEqual(touchPreview, coord)) {
        setTouchPreview(coord)
        setHover(null)
        return
      }
    }
    if (!selected || !canPlaceSelected(state, coord)) return
    dispatch({ type: 'PLACE_SHIP', origin: coord })
    setTouchPreview(null)
    setHover(null)
  }

  const placedIds = new Set(state.playerBoard.ships.map((ship) => ship.id))

  return (
    <div className="app">
      <Header phase={state.phase} turn={state.turn} />
      {placing ? (
        <PlacementBar
          selectedShipId={state.selectedShipId}
          placedIds={placedIds}
          orientation={state.orientation}
          canStart={state.playerBoard.ships.length === SHIP_DEFS.length}
          onSelect={(id: ShipId) => dispatch({ type: 'SELECT_SHIP', id })}
          onRotate={() => dispatch({ type: 'ROTATE' })}
          onRandomize={() => {
            dispatch({ type: 'RANDOMIZE' })
            setTouchPreview(null)
            setHover(null)
          }}
          onReset={() => {
            dispatch({ type: 'RESET_PLACEMENT' })
            setTouchPreview(null)
            setHover(null)
          }}
          onStart={() => dispatch({ type: 'START' })}
        />
      ) : null}
      <div className="boards">
        <div className="board-column">
          <Board
            title="Your fleet"
            side="player"
            board={state.playerBoard}
            revealShips
            previewCells={previewCells}
            previewValid={previewValid}
            interactive={placing}
            onHover={placing ? setHover : undefined}
            onPress={onPlayerPress}
          />
          <FleetStatus ships={state.playerBoard.ships} />
        </div>
        <div className="board-column">
          <Board
            title="Enemy waters"
            side="enemy"
            board={state.enemyBoard}
            revealShips={state.phase === 'over'}
            interactive={false}
            locked
          />
          <FleetStatus ships={state.enemyBoard.ships} />
        </div>
      </div>
      <MessageLog entries={state.log} />
    </div>
  )
}
