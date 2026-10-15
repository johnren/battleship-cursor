import { expect, test } from '@playwright/test'

test('seeded game can be randomized, started, and played to game over', async ({ page }) => {
  await page.goto('/battleship-cursor/?seed=123')
  await page.getByRole('button', { name: 'Randomize' }).click()
  await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByText('Your turn')).toBeVisible()

  const dialog = page.getByRole('dialog')
  const enemyGrid = page.locator('.board-grid').nth(1)

  while (!(await dialog.isVisible())) {
    const cell = enemyGrid.locator('button:not([disabled])').first()
    if ((await cell.count()) === 0) {
      await expect(dialog).toBeVisible({ timeout: 4000 })
      break
    }
    await cell.click()
    await Promise.race([
      page.getByText('Your turn').waitFor({ state: 'visible', timeout: 4000 }),
      dialog.waitFor({ state: 'visible', timeout: 4000 }),
    ]).catch(() => undefined)
  }

  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: /Victory|Defeat/ })).toBeVisible()
  await expect(dialog.getByText(/Shots fired:/)).toBeVisible()
  await expect(dialog.getByText(/Hit accuracy:/)).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Play Again' })).toBeVisible()
})
