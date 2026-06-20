import { test, expect } from '@playwright/test'

// 회원 관리는 인증이 필요하므로 대부분 시나리오는 로그인 계정이 필요하다.
// 미인증 보호 흐름만 자격증명 없이 검증 가능.

const TEST_EMAIL = process.env.E2E_ADMIN_EMAIL
const TEST_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('회원 관리', () => {
  test('미인증 상태로 회원 목록 접근 시 로그인으로 리다이렉트', async ({
    page,
  }) => {
    await page.goto('/admin/members')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('인증 후 회원 목록 → 등록 페이지 진입', async ({ page }) => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      'E2E_ADMIN_EMAIL/PASSWORD 미설정 — Supabase 계정 필요',
    )

    // 로그인
    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill(TEST_EMAIL!)
    await page.getByTestId('login-form-password-input').fill(TEST_PASSWORD!)
    await page.getByTestId('login-form-submit-button').click()
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // 사이드바 → 회원 관리
    await page.getByTestId('admin-nav-members').click()
    await expect(page).toHaveURL(/\/admin\/members/)

    // 등록 페이지 진입
    await page.getByTestId('member-create-button').click()
    // 모달로 회원 등록 폼 표시
    await expect(page.getByTestId('member-form')).toBeVisible()
  })

  test('등록 폼에서 이름 없이 제출 시 검증 차단', async ({ page }) => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      'E2E_ADMIN_EMAIL/PASSWORD 미설정 — Supabase 계정 필요',
    )

    await page.goto('/admin/login')
    await page.getByTestId('login-form-email-input').fill(TEST_EMAIL!)
    await page.getByTestId('login-form-password-input').fill(TEST_PASSWORD!)
    await page.getByTestId('login-form-submit-button').click()

    await page.goto('/admin/members/new')
    await page.getByTestId('member-form-phone-input').fill('010-0000-0000')
    await page.getByTestId('member-form-submit-button').click()
    // HTML5 required로 이름 입력 전 제출 차단 → 여전히 등록 페이지
    await expect(page).toHaveURL(/\/admin\/members\/new/)
  })
})
