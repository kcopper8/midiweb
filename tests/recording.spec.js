// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('녹음/재생', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[REC-03] 녹음 섹션 UI가 표시된다', async ({ page }) => {
    await expect(page.locator('#recordingIndicator')).toBeVisible();
    await expect(page.locator('#recordingTitle')).toHaveText('녹음 대기');
    await expect(page.locator('#recordingList')).toBeVisible();
  });

  test('[REC-01] 메트로놈 시작 시 녹음 인디케이터가 활성화된다', async ({ page }) => {
    const indicator = page.locator('#recordingIndicator');
    const title = page.locator('#recordingTitle');

    await expect(indicator).not.toHaveClass(/active/);

    // 메트로놈 시작 → 녹음 시작
    await page.click('#metronomeToggle');

    await expect(indicator).toHaveClass(/active/);
    await expect(title).toHaveText('녹음 중');

    // 메트로놈 정지
    await page.click('#metronomeToggle');
  });

  test('[REC-02] 메트로놈 정지 시 녹음이 저장된다', async ({ page }) => {
    // 메트로놈 시작 → 녹음 시작
    await page.click('#metronomeToggle');

    // 건반 연주
    const notes = page.locator('.note-button');
    await notes.nth(0).dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    await notes.nth(1).dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    await notes.nth(2).dispatchEvent('mousedown');

    // 메트로놈 정지 → 녹음 저장
    await page.click('#metronomeToggle');

    // 녹음 목록에 항목이 추가됨
    const recordingItems = page.locator('.recording-item');
    await expect(recordingItems).toHaveCount(1);

    // 인디케이터가 비활성화됨
    await expect(page.locator('#recordingIndicator')).not.toHaveClass(/active/);
  });

  test('[REC-03] 녹음 목록에 시간과 길이가 표시된다', async ({ page }) => {
    // 메트로놈 시작 → 녹음 시작
    await page.click('#metronomeToggle');

    // 건반 연주
    await page.locator('.note-button').first().dispatchEvent('mousedown');
    await page.waitForTimeout(100);

    // 메트로놈 정지 → 녹음 저장
    await page.click('#metronomeToggle');

    const recordingInfo = page.locator('.recording-info');
    await expect(recordingInfo).toBeVisible();

    // 시간 형식 확인 (한국어: "HH시 MM분 SS초" 또는 영어: "HH:MM:SS")
    const text = await recordingInfo.textContent();
    expect(text).toMatch(/(\d{1,2}:\d{2}:\d{2}|\d{1,2}시\s*\d{1,2}분\s*\d{1,2}초)/);

    // 길이 확인
    await expect(page.locator('.recording-duration')).toContainText('초');
  });

  test('[REC-04] 재생 버튼이 작동한다', async ({ page }) => {
    // 녹음
    await page.click('#metronomeToggle');
    await page.locator('.note-button').first().dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    await page.click('#metronomeToggle');

    const playBtn = page.locator('.recording-btn[data-action="play"]');

    // 재생 시작
    await playBtn.click();
    await expect(playBtn).toHaveClass(/playing/);
    await expect(page.locator('.recording-item')).toHaveClass(/playing/);
  });

  test('[REC-04] 정지 버튼이 작동한다', async ({ page }) => {
    // 녹음
    await page.click('#metronomeToggle');
    await page.locator('.note-button').first().dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    await page.click('#metronomeToggle');

    // 재생
    await page.locator('.recording-btn[data-action="play"]').click();

    // 정지
    await page.locator('.recording-btn[data-action="stop"]').click();
    await expect(page.locator('.recording-btn[data-action="play"]')).not.toHaveClass(/playing/);
    await expect(page.locator('.recording-item')).not.toHaveClass(/playing/);
  });

  test('[REC-04] 삭제 버튼이 작동한다', async ({ page }) => {
    // 녹음
    await page.click('#metronomeToggle');
    await page.locator('.note-button').first().dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    await page.click('#metronomeToggle');

    await expect(page.locator('.recording-item')).toHaveCount(1);

    // 삭제
    await page.locator('.recording-btn[data-action="delete"]').click();
    await expect(page.locator('.recording-item')).toHaveCount(0);
  });

  test('[REC-02] 설정 패널이 토글된다', async ({ page }) => {
    const settingsPanel = page.locator('#settingsPanel');

    await expect(settingsPanel).not.toHaveClass(/open/);

    await page.click('#settingsToggle');
    await expect(settingsPanel).toHaveClass(/open/);

    await page.click('#settingsToggle');
    await expect(settingsPanel).not.toHaveClass(/open/);
  });

  test('[REC-02] 녹음 모드 변경이 작동한다', async ({ page }) => {
    await page.click('#settingsToggle');

    const modeSelect = page.locator('#recordingModeSelect');
    const delayRow = page.locator('#delaySettingRow');
    const newRecordingBtn = page.locator('#newRecordingBtn');

    // 기본: 시간 기반
    await expect(delayRow).toBeVisible();
    await expect(newRecordingBtn).not.toHaveClass(/visible/);

    // 수동 모드로 변경
    await modeSelect.selectOption('manual');
    await expect(delayRow).not.toBeVisible();
    await expect(newRecordingBtn).toHaveClass(/visible/);

    // 무한 연속 모드로 변경
    await modeSelect.selectOption('continuous');
    await expect(delayRow).not.toBeVisible();
    await expect(newRecordingBtn).not.toHaveClass(/visible/);
  });

  test('[REC-01] 메트로놈 없이 건반 클릭 시 녹음되지 않는다', async ({ page }) => {
    const indicator = page.locator('#recordingIndicator');

    // 메트로놈 없이 건반 클릭
    await page.locator('.note-button').first().dispatchEvent('mousedown');
    await page.waitForTimeout(100);

    // 녹음이 시작되지 않음
    await expect(indicator).not.toHaveClass(/active/);

    // 녹음 목록에 항목 없음
    await expect(page.locator('.recording-item')).toHaveCount(0);
  });

});
