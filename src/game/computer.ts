import { BOARD_SIZE, coordKey, inBounds, manhattan, neighbors, type Coord } from './coord.ts'
import { pickIndex, type Rng } from './rng.ts'
import type { FireOutcome } from './firing.ts'

export type AiMode = 'hunt' | 'target'

export type AiState = {
  fired: string[]
  unresolvedHits: Coord[]
}

export function createAiState(): AiState {
  return { fired: [], unresolvedHits: [] }
}

export function aiMode(ai: AiState): AiMode {
  return ai.unresolvedHits.length > 0 ? 'target' : 'hunt'
}

function firedSet(ai: AiState): Set<string> {
  return new Set(ai.fired)
}

function allUnfired(fired: Set<string>): Coord[] {
  const cells: Coord[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!fired.has(coordKey({ row, col }))) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

function huntCells(fired: Set<string>): Coord[] {
  const checkerboard: Coord[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 0 && !fired.has(coordKey({ row, col }))) {
        checkerboard.push({ row, col })
      }
    }
  }
  if (checkerboard.length > 0) return checkerboard
  return allUnfired(fired)
}

function clusterHits(hits: Coord[]): Coord[][] {
  const remaining = hits.map((hit) => ({ ...hit }))
  const clusters: Coord[][] = []
  while (remaining.length > 0) {
    const seed = remaining.pop()
    if (!seed) break
    const cluster = [seed]
    let grew = true
    while (grew) {
      grew = false
      for (let i = remaining.length - 1; i >= 0; i--) {
        const candidate = remaining[i]
        if (!candidate) continue
        if (cluster.some((cell) => manhattan(cell, candidate) === 1)) {
          cluster.push(candidate)
          remaining.splice(i, 1)
          grew = true
        }
      }
    }
    clusters.push(cluster)
  }
  return clusters
}

function isStraightLine(cluster: Coord[]): boolean {
  if (cluster.length < 2) return true
  const first = cluster[0]
  if (!first) return true
  return cluster.every((c) => c.row === first.row) || cluster.every((c) => c.col === first.col)
}

function addIfUnfired(candidates: Map<string, Coord>, coord: Coord, fired: Set<string>) {
  if (!inBounds(coord)) return
  const key = coordKey(coord)
  if (!fired.has(key)) {
    candidates.set(key, coord)
  }
}

function lineExtensions(cluster: Coord[], fired: Set<string>): Coord[] {
  const first = cluster[0]
  if (!first) return []
  const candidates = new Map<string, Coord>()
  const sameRow = cluster.every((c) => c.row === first.row)
  if (sameRow) {
    const cols = cluster.map((c) => c.col)
    const min = Math.min(...cols)
    const max = Math.max(...cols)
    addIfUnfired(candidates, { row: first.row, col: min - 1 }, fired)
    addIfUnfired(candidates, { row: first.row, col: max + 1 }, fired)
    for (let col = min + 1; col < max; col++) {
      addIfUnfired(candidates, { row: first.row, col }, fired)
    }
  } else {
    const rows = cluster.map((c) => c.row)
    const min = Math.min(...rows)
    const max = Math.max(...rows)
    addIfUnfired(candidates, { row: min - 1, col: first.col }, fired)
    addIfUnfired(candidates, { row: max + 1, col: first.col }, fired)
    for (let row = min + 1; row < max; row++) {
      addIfUnfired(candidates, { row, col: first.col }, fired)
    }
  }
  return [...candidates.values()]
}

function neighborCandidates(cluster: Coord[], fired: Set<string>): Coord[] {
  const candidates = new Map<string, Coord>()
  for (const hit of cluster) {
    for (const n of neighbors(hit)) {
      addIfUnfired(candidates, n, fired)
    }
  }
  return [...candidates.values()]
}

function targetCandidates(ai: AiState): Coord[] {
  const fired = firedSet(ai)
  const candidates = new Map<string, Coord>()
  for (const cluster of clusterHits(ai.unresolvedHits)) {
    let options: Coord[] = []
    if (cluster.length >= 2 && isStraightLine(cluster)) {
      options = lineExtensions(cluster, fired)
      if (options.length === 0) {
        options = neighborCandidates(cluster, fired)
      }
    } else {
      options = neighborCandidates(cluster, fired)
    }
    for (const option of options) {
      candidates.set(coordKey(option), option)
    }
  }
  return [...candidates.values()]
}

export function chooseShot(ai: AiState, rng: Rng): Coord {
  const fired = firedSet(ai)
  if (ai.unresolvedHits.length > 0) {
    const targeted = targetCandidates(ai)
    if (targeted.length > 0) {
      return pickIndex(rng, targeted)
    }
  }
  const hunts = huntCells(fired)
  if (hunts.length === 0) {
    throw new Error('No remaining cells to fire at')
  }
  return pickIndex(rng, hunts)
}

export function rememberShot(ai: AiState, outcome: FireOutcome): AiState {
  if (outcome.kind === 'repeat' || outcome.kind === 'out-of-bounds') {
    return ai
  }
  const fired = [...ai.fired, coordKey(outcome.coord)]
  let unresolvedHits = [...ai.unresolvedHits]
  if (outcome.kind === 'hit') {
    unresolvedHits.push({ ...outcome.coord })
  }
  if (outcome.kind === 'sunk') {
    unresolvedHits.push({ ...outcome.coord })
    const sunkKeys = new Set((outcome.sunkCells ?? []).map(coordKey))
    unresolvedHits = unresolvedHits.filter((hit) => !sunkKeys.has(coordKey(hit)))
  }
  return { fired, unresolvedHits }
}
