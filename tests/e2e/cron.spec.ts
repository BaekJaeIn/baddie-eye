import { test, expect } from '@playwright/test'

test.describe('Cron 리마인더 보안', () => {
  test('시크릿 없이 호출 시 401', async ({ request }) => {
    const res = await request.get('/api/cron/reminders')
    expect(res.status()).toBe(401)
  })

  test('잘못된 시크릿으로 호출 시 401', async ({ request }) => {
    const res = await request.get('/api/cron/reminders', {
      headers: { authorization: 'Bearer wrong-secret' },
    })
    expect(res.status()).toBe(401)
  })
})
