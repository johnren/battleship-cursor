# Bugs

## Fired enemy cells stayed clickable

- **Symptom:** After a miss or hit, that enemy cell still accepted clicks. Rapid or scripted clicks kept targeting the same cell; the turn did not advance.
- **Root cause:** Grid buttons used `disabled={!clickable}`, so lock/turn state was applied, but a recorded shot did not disable the cell. The reducer correctly ignored repeats, so the UI looked stuck.
- **Fix:** Disable an enemy cell once it has a shot mark.
- **Found:** Manual play of a seeded game in the browser.
- **Test:** End-to-end smoke test fires only untried cells and plays through to game over. Reducer already rejects a repeated shot without consuming a turn.
- **Fixed in:** 41274ee
