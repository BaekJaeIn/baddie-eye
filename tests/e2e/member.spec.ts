import { test, expect } from '@playwright/test'

test.describe('고객 영역 (Member)', () => {
  test('미인증 상태로 마이페이지 접근 시 로그인 리다이렉트', async ({
    page,
  }) => {
    await page.goto('/me')
    await expect(page).toHaveURL(/\/login/)
  })

  test('미인증 상태로 온보딩 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login/)
  })

  test('로그인 페이지에 카카오 버튼 표시', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('kakao-login-button')).toBeVisible()
  })

  test('manifest.json 제공', async ({ request }) => {
    const res = await request.get('/manifest.json')
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.name).toBe('Baddie Eye')
    expect(json.display).toBe('standalone')
  })
})
