import { BOARD_SIZE, occupiedKeys, type Board as BoardModel, type Coord } from '../game/index.ts'
import { cellStatusLabel, formatCoord } from '../labels.ts'

const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

type Props = {
  title: string
  side: 'player' | 'enemy'
  board: BoardModel
  revealShips: boolean
  previewCells?: Coord[]
  previewValid?: boolean
  interactive?: boolean
  locked?: boolean
  onHover?: (coord: Coord | null) => void
  onPress?: (coord: Coord) => void
}

function keyOf(coord: Coord) {
  return `${coord.row},${coord.col}`
}

export function Board({
  title,
  side,
  board,
  revealShips,
  previewCells = [],
  previewValid = false,
  interactive = false,
  locked = false,
  onHover,
  onPress,
}: Props) {
  const occupied = occupiedKeys(board.ships)
  const previewKeys = new Set(previewCells.map(keyOf))
  const clickable = interactive && !locked

  return (
    <section className="board-panel">
      <h2>{title}</h2>
      <div className="board">
        <div className="board-corner" />
        <div className="board-cols">
          {COLS.map((col) => (
            <span key={col} className="board-label">
              {col}
            </span>
          ))}
        </div>
        <div className="board-rows">
          {ROWS.map((row) => (
            <span key={row} className="board-label">
              {row}
            </span>
          ))}
        </div>
        <div className="board-grid" role="grid" aria-label={title}>
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const row = Math.floor(index / BOARD_SIZE)
            const col = index % BOARD_SIZE
            const coord = { row, col }
            const shot = board.shots[row]?.[col] ?? null
            const hasShip = occupied.has(keyOf(coord))
            const inPreview = previewKeys.has(keyOf(coord))
            const preview = inPreview ? (previewValid ? 'valid' : 'invalid') : null
            const alreadyFired = shot !== null
            const canFire = clickable && side === 'enemy' && !alreadyFired
            const enabled = clickable && (side !== 'enemy' || !alreadyFired)
            const classes = ['cell']
            if (revealShips && hasShip && !shot) classes.push('cell-ship')
            if (shot === 'miss') classes.push('cell-miss')
            if (shot === 'hit') classes.push('cell-hit')
            if (shot === 'sunk') classes.push('cell-sunk')
            if (preview === 'valid') classes.push('cell-preview-valid')
            if (preview === 'invalid') classes.push('cell-preview-invalid')
            if (canFire) classes.push('cell-target')
            if (!clickable || (side === 'enemy' && alreadyFired)) classes.push('is-locked')

            const label = `${formatCoord(coord)}, ${cellStatusLabel({
              side,
              hasShip: revealShips && hasShip,
              shot,
              preview,
            })}`

            return (
              <button
                key={keyOf(coord)}
                type="button"
                role="gridcell"
                className={classes.join(' ')}
                aria-label={label}
                disabled={!enabled}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') onHover?.(coord)
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse') onHover?.(null)
                }}
                onClick={() => onPress?.(coord)}
              >
                {shot === 'miss' ? <span className="miss-dot" /> : null}
                {shot === 'hit' || shot === 'sunk' ? (
                  <span className="hit-mark">✕</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
