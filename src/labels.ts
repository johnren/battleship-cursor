import type { Coord, ShotMark } from './game/index.ts'

const ROWS = 'ABCDEFGHIJ'

export function formatCoord(coord: Coord): string {
  const row = ROWS[coord.row] ?? '?'
  return `${row}${coord.col + 1}`
}

export function cellStatusLabel(options: {
  side: 'player' | 'enemy'
  hasShip: boolean
  shot: ShotMark | null
  preview: 'valid' | 'invalid' | null
}): string {
  if (options.preview === 'valid') return 'valid placement'
  if (options.preview === 'invalid') return 'invalid placement'
  if (options.shot === 'miss') return 'miss'
  if (options.shot === 'hit') return 'hit'
  if (options.shot === 'sunk') return 'sunk'
  if (options.side === 'player' && options.hasShip) return 'your ship'
  return 'water'
}

export function formatLogEntry(entry: {
  actor: 'player' | 'computer'
  kind: 'hit' | 'miss' | 'sunk'
  coord: Coord
  shipName?: string
}): string {
  const at = formatCoord(entry.coord)
  if (entry.actor === 'player') {
    if (entry.kind === 'sunk') return `You sank their ${entry.shipName}!`
    if (entry.kind === 'hit') return `Hit at ${at}.`
    return `Miss at ${at}.`
  }
  if (entry.kind === 'sunk') return `They sank your ${entry.shipName}!`
  if (entry.kind === 'hit') return `They hit your ${entry.shipName} at ${at}.`
  return `They missed at ${at}.`
}
