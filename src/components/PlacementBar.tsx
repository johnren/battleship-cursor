import { SHIP_DEFS, type Orientation, type ShipId } from '../game/index.ts'

type Props = {
  selectedShipId: ShipId | null
  placedIds: Set<ShipId>
  orientation: Orientation
  canStart: boolean
  onSelect: (id: ShipId) => void
  onRotate: () => void
  onRandomize: () => void
  onReset: () => void
  onStart: () => void
}

export function PlacementBar({
  selectedShipId,
  placedIds,
  orientation,
  canStart,
  onSelect,
  onRotate,
  onRandomize,
  onReset,
  onStart,
}: Props) {
  return (
    <section className="placement-bar" aria-label="Ship placement">
      <div className="ship-picker">
        {SHIP_DEFS.map((ship) => {
          const placed = placedIds.has(ship.id)
          return (
            <button
              key={ship.id}
              type="button"
              className={
                selectedShipId === ship.id ? 'ship-pick is-selected' : 'ship-pick'
              }
              disabled={placed}
              onClick={() => onSelect(ship.id)}
            >
              {ship.name}
              <span className="ship-length" aria-hidden="true">
                {'■'.repeat(ship.length)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="placement-actions">
        <button type="button" className="btn btn-outline" onClick={onRotate}>
          Rotate ({orientation === 'horizontal' ? 'H' : 'V'})
        </button>
        <button type="button" className="btn btn-outline" onClick={onRandomize}>
          Randomize
        </button>
        <button type="button" className="btn btn-outline" onClick={onReset}>
          Reset
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onStart}
          disabled={!canStart}
        >
          Start
        </button>
      </div>
    </section>
  )
}
