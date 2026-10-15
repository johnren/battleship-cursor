import type { Phase } from '../game/index.ts'

type Props = {
  phase: Phase
  turn: 'player' | 'computer'
}

export function Header({ phase, turn }: Props) {
  let indicator: { className: string; label: string }
  if (phase === 'placement') {
    indicator = { className: 'turn-pill', label: 'Place your fleet' }
  } else if (phase === 'over') {
    indicator = { className: 'turn-pill is-muted', label: 'Game over' }
  } else if (turn === 'computer') {
    indicator = { className: 'turn-pill is-muted', label: 'Enemy firing…' }
  } else {
    indicator = { className: 'turn-pill', label: 'Your turn' }
  }

  return (
    <header className="header">
      <h1>Battleship</h1>
      <div className={indicator.className}>
        {turn === 'computer' && phase === 'battle' ? (
          <span className="pulse-dot" aria-hidden="true" />
        ) : null}
        {indicator.label}
      </div>
    </header>
  )
}
