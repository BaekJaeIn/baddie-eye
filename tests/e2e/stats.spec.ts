import { test, expect } from '@playwright/test'

test.describe('매출 통계', () => {
  test('미인증 상태로 통계 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/admin/stats')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
