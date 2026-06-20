import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.E2E_ADMIN_EMAIL
const TEST_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('예약/시술 관리', () => {
  test('미인증 상태로 예약 관리 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/admin/appointments')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('미인증 상태로 시술 종류 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/admin/treatments')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('인증 후 주간 캘린더 진입', async ({ page }) => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      'E2E_ADMIN_EMAIL/PASSWORD 미설정 — Supabase 계정 필요',
    )

    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill(TEST_EMAIL!)
    await page.getByTestId('login-form-password-input').fill(TEST_PASSWORD!)
    await page.getByTestId('login-form-submit-button').click()
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    await page.getByTestId('admin-nav-appointments').click()
    await expect(page).toHaveURL(/\/admin\/appointments/)
    await expect(page.getByTestId('week-calendar')).toBeVisible()
  })
})
