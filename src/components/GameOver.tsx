type Props = {
  winner: 'player' | 'computer'
  shotsFired: number
  hits: number
  onPlayAgain: () => void
}

export function GameOver({ winner, shotsFired, hits, onPlayAgain }: Props) {
  const accuracy = shotsFired === 0 ? 0 : Math.round((hits / shotsFired) * 100)
  return (
    <div className="dialog-backdrop">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
      >
        <h2 id="game-over-title">{winner === 'player' ? 'Victory' : 'Defeat'}</h2>
        <p>Shots fired: {shotsFired}</p>
        <p>Hit accuracy: {accuracy}%</p>
        <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
