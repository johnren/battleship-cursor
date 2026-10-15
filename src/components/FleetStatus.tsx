import { SHIP_DEFS, type PlacedShip } from '../game/index.ts'

type Props = {
  ships: PlacedShip[]
}

export function FleetStatus({ ships }: Props) {
  return (
    <ul className="fleet-status">
      {SHIP_DEFS.map((def) => {
        const placed = ships.find((ship) => ship.id === def.id)
        const hits = placed?.hitCount ?? 0
        const sunk = Boolean(placed && hits >= def.length)
        return (
          <li key={def.id} className={sunk ? 'fleet-item is-sunk' : 'fleet-item'}>
            <span className="fleet-name">{def.name}</span>
            <span className="fleet-pips" aria-hidden="true">
              {Array.from({ length: def.length }, (_, index) => {
                let pip = 'empty'
                if (placed) pip = 'ship'
                if (index < hits) pip = 'hit'
                if (sunk) pip = 'sunk'
                return <span key={index} className={`pip pip-${pip}`} />
              })}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
