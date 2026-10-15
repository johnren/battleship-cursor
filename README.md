# Battleship

**Play:** https://johnren.github.io/battleship-cursor/

Single-player Battleship in the browser. You place a fleet, then take turns firing with a computer opponent. No accounts, no backend.

## How to play

1. Place five ships on **Your fleet**: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2). Hover to preview, click to place. On a touch screen, tap once to preview and tap the same cell again to confirm.
2. **Rotate** (button, `R`, or Space) switches horizontal/vertical. **Randomize** fills a valid fleet. **Reset** clears it. **Start** is enabled when all five ships are placed.
3. Fire on **Enemy waters**. Hits do not grant extra turns. The computer fires after a short pause.
4. Sink all 17 enemy ship cells to win. **Play Again** starts a new match with the same URL seed.

Open `?seed=123` to make the computer’s fleet and shots repeatable.

## Run locally

Requires **Node 24** (current LTS).

```bash
npm install
npm run dev
```

Then open the printed local URL (Vite `base` is `/battleship-cursor/`).

```bash
npm test          # Vitest unit tests
npm run lint      # ESLint
npm run build     # production build
npm run test:e2e  # Playwright smoke test against the built app
```

### Versions

| Tool | Version |
| --- | --- |
| Node | 24 (LTS) |
| React | 19.2.8 |
| Vite | 8.3 |
| TypeScript | 5.9 |
| Vitest | 5.0.5 |
| Playwright | 1.64 |
| ESLint | 9.39 |

## Architecture

- `src/game/` — board, ships, placement, firing, win detection, computer opponent, and a seedable RNG. No React imports.
- `src/components/` — boards, placement bar, fleet status, log, header, game-over dialog.
- `src/App.tsx` — `useReducer` over `gameReducer`. Coordinates are `{ row, col }` (0–9); labels like `B7` are UI-only (`src/labels.ts`).

## Computer opponent

Hunt/target, using only its own shot history:

- **Hunt:** random untried cells on a checkerboard (every other cell), because the smallest ship is length 2.
- **Target:** after a hit, try orthogonal neighbors. Once two hits line up, extend that line both ways until the ship sinks.
- After a sink, hunt again unless other hits are still unexplained.
- Never shoots the same cell twice or off the board. It does not read the player’s ship positions.

## Choices

- **Randomize** for the player is not driven by `?seed=`; the seed only repeats the computer’s fleet and its shots.
- Grid cells stay square and shrink so a 10×10 board fits at 375px with 16px side margins. Control buttons stay at least 44px tall.
- Hit accuracy is `round(hits / shots × 100)`.
- Space during placement calls `preventDefault` so it rotates instead of scrolling or activating **Start**.
