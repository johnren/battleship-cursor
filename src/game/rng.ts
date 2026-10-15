export type Rng = {
  next(): number
  int(maxExclusive: number): number
  getState(): number
}

function mulberry32(state: number): Rng {
  let a = state >>> 0
  const rng: Rng = {
    next() {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    int(maxExclusive: number) {
      if (maxExclusive <= 0) return 0
      return Math.floor(rng.next() * maxExclusive)
    },
    getState() {
      return a >>> 0
    },
  }
  return rng
}

export function createRng(seed: number): Rng {
  return mulberry32(seed === 0 ? 1 : seed)
}

export function restoreRng(state: number): Rng {
  return mulberry32(state)
}

export function parseSeed(search: string): number {
  const params = new URLSearchParams(search)
  const raw = params.get('seed')
  if (raw !== null && /^\d+$/.test(raw)) {
    return Number(raw)
  }
  return (Date.now() ^ (Math.floor(Math.random() * 0xffffffff) >>> 0)) >>> 0
}

export function pickIndex<T>(rng: Rng, items: readonly T[]): T {
  const item = items[rng.int(items.length)]
  if (item === undefined) {
    throw new Error('Cannot pick from an empty list')
  }
  return item
}
