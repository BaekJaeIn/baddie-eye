import { test, expect } from '@playwright/test'

// 주의: 이 E2E 테스트는 Supabase 연결 + 테스트 Admin 계정이 필요하다.
// 자격증명이 필요한 시나리오(시나리오 1, 4)는 환경변수가 설정되어야 통과한다.
// 미설정 시에도 미인증 보호 흐름(시나리오 2, 3)은 검증 가능.

const TEST_EMAIL = process.env.E2E_ADMIN_EMAIL
const TEST_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('Admin 인증', () => {
  test('시나리오 2: 미인증 상태로 대시보드 접근 시 로그인으로 리다이렉트', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('시나리오 3: 잘못된 자격증명은 generic 에러를 표시한다', async ({
    page,
  }) => {
    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill('wrong@example.com')
    await page.getByTestId('login-form-password-input').fill('wrongpassword')
    await page.getByTestId('login-form-submit-button').click()

    const error = page.getByTestId('login-form-error')
    await expect(error).toBeVisible()
    // 계정 열거 방지: 구체적 원인이 아닌 generic 메시지
    await expect(error).toContainText('이메일 또는 비밀번호가 올바르지 않습니다')
  })

  test('짧은 비밀번호는 클라이언트 검증에 걸린다', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill('owner@example.com')
    await page.getByTestId('login-form-password-input').fill('short')
    await page.getByTestId('login-form-submit-button').click()
    // HTML5 minLength로 폼 제출이 막힘 → 여전히 로그인 페이지
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('시나리오 1 & 4: 로그인 → 대시보드 → 로그아웃', async ({ page }) => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD 미설정 — Supabase 계정 필요',
    )

    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill(TEST_EMAIL!)
    await page.getByTestId('login-form-password-input').fill(TEST_PASSWORD!)
    await page.getByTestId('login-form-submit-button').click()

    // 대시보드 이동 확인
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.getByTestId('dashboard-page')).toBeVisible()

    // 로그아웃
    await page.getByTestId('admin-header-logout-button').click()
    await expect(page).toHaveURL(/\/admin\/login/)

    // 로그아웃 후 보호 페이지 재접근 차단
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
