// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('메트로놈', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[METRO-04] 메트로놈 UI가 표시된다', async ({ page }) => {
    await expect(page.locator('#metronomeToggle')).toBeVisible();
    await expect(page.locator('#bpmSlider')).toBeVisible();
    await expect(page.locator('#bpmValue')).toHaveText('100 BPM');
  });

  test('[METRO-01] 메트로놈 시작/정지 버튼이 토글된다', async ({ page }) => {
    const toggleBtn = page.locator('#metronomeToggle');

    // 초기 상태: 정지
    await expect(toggleBtn).toHaveText('▶');
    await expect(toggleBtn).not.toHaveClass(/active/);

    // 시작
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('⏹');
    await expect(toggleBtn).toHaveClass(/active/);

    // 정지
    await toggleBtn.click();
    await expect(toggleBtn).toHaveText('▶');
    await expect(toggleBtn).not.toHaveClass(/active/);
  });

  test('[METRO-03] BPM 프리셋 버튼이 작동한다', async ({ page }) => {
    const bpmValue = page.locator('#bpmValue');
    const bpmSlider = page.locator('#bpmSlider');

    // 60 BPM 선택
    await page.click('.bpm-preset[data-bpm="60"]');
    await expect(bpmValue).toHaveText('60 BPM');
    await expect(bpmSlider).toHaveValue('60');
    await expect(page.locator('.bpm-preset[data-bpm="60"]')).toHaveClass(/active/);

    // 120 BPM 선택
    await page.click('.bpm-preset[data-bpm="120"]');
    await expect(bpmValue).toHaveText('120 BPM');
    await expect(bpmSlider).toHaveValue('120');
    await expect(page.locator('.bpm-preset[data-bpm="120"]')).toHaveClass(/active/);
    await expect(page.locator('.bpm-preset[data-bpm="60"]')).not.toHaveClass(/active/);
  });

  test('[METRO-03] BPM 슬라이더가 작동한다', async ({ page }) => {
    const bpmSlider = page.locator('#bpmSlider');
    const bpmValue = page.locator('#bpmValue');

    await bpmSlider.fill('80');
    await expect(bpmValue).toHaveText('80 BPM');
    await expect(page.locator('.bpm-preset[data-bpm="80"]')).toHaveClass(/active/);

    await bpmSlider.fill('150');
    await expect(bpmValue).toHaveText('150 BPM');
    // 프리셋에 없는 값이면 모든 프리셋이 비활성화
    await expect(page.locator('.bpm-preset.active')).toHaveCount(0);
  });

  test('[METRO-02] 박자 선택이 작동한다', async ({ page }) => {
    // 기본: 4/4
    await expect(page.locator('.control-button[data-time-sig="4"]')).toHaveClass(/active/);

    // 3/4 선택
    await page.click('.control-button[data-time-sig="3"]');
    await expect(page.locator('.control-button[data-time-sig="3"]')).toHaveClass(/active/);
    await expect(page.locator('.control-button[data-time-sig="4"]')).not.toHaveClass(/active/);
  });

  test('[METRO-01] 메트로놈 실행 중 BPM 변경 시 재시작된다', async ({ page }) => {
    const toggleBtn = page.locator('#metronomeToggle');

    // 시작
    await toggleBtn.click();
    await expect(toggleBtn).toHaveClass(/active/);

    // BPM 변경
    await page.click('.bpm-preset[data-bpm="120"]');

    // 여전히 실행 중
    await expect(toggleBtn).toHaveClass(/active/);
    await expect(page.locator('#bpmValue')).toHaveText('120 BPM');

    // 정지
    await toggleBtn.click();
    await expect(toggleBtn).not.toHaveClass(/active/);
  });

});
