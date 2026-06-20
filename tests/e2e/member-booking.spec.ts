import { test, expect } from '@playwright/test'

test.describe('고객 예약 (Member Booking)', () => {
  test('미인증 상태로 예약 신청 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/booking')
    await expect(page).toHaveURL(/\/login/)
  })

  test('미인증 상태로 내 예약 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/me/appointments')
    await expect(page).toHaveURL(/\/login/)
  })

  test('미인증 상태로 가용 슬롯 API 호출 시 401', async ({ request }) => {
    const res = await request.get('/booking/slots?date=2026-07-01')
    expect(res.status()).toBe(401)
  })
})
