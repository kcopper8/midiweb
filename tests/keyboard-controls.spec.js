// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('건반 및 컨트롤', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지 로드 시 기본 UI가 표시된다', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('계이름 연주기');
    await expect(page.locator('#noteContainer')).toBeVisible();
    await expect(page.locator('.control-button[data-scale="major"]')).toHaveClass(/active/);
  });

  test('건반 버튼이 렌더링된다', async ({ page }) => {
    const noteButtons = page.locator('.note-button');
    await expect(noteButtons).toHaveCount(8); // Major 스케일: 8개 음
  });

  test('건반 클릭 시 active 클래스가 추가된다', async ({ page }) => {
    const firstNote = page.locator('.note-button').first();

    await firstNote.dispatchEvent('mousedown');
    await expect(firstNote).toHaveClass(/active/);

    await firstNote.dispatchEvent('mouseup');
    await expect(firstNote).not.toHaveClass(/active/);
  });

  test('스케일 변경 시 건반 개수가 변경된다', async ({ page }) => {
    // Pentatonic 선택 (6개 음)
    await page.click('.control-button[data-scale="pentatonic"]');
    await expect(page.locator('.control-button[data-scale="pentatonic"]')).toHaveClass(/active/);

    const noteButtons = page.locator('.note-button');
    await expect(noteButtons).toHaveCount(6);

    // Chromatic 선택 (13개 음)
    await page.click('.control-button[data-scale="chromatic"]');
    await expect(page.locator('.note-button')).toHaveCount(13);
  });

  test('옥타브 변경 시 건반 행이 추가된다', async ({ page }) => {
    // 기본: 1옥타브, 1행
    await expect(page.locator('.octave-row')).toHaveCount(1);

    // 2옥타브 선택
    await page.click('.control-button[data-octave="2"]');
    await expect(page.locator('.octave-row')).toHaveCount(2);

    // 3옥타브 선택
    await page.click('.control-button[data-octave="3"]');
    await expect(page.locator('.octave-row')).toHaveCount(3);
  });

  test('파형 변경이 작동한다', async ({ page }) => {
    await page.click('.control-button[data-wave="square"]');
    await expect(page.locator('.control-button[data-wave="square"]')).toHaveClass(/active/);
    await expect(page.locator('.control-button[data-wave="sine"]')).not.toHaveClass(/active/);
  });

  test('볼륨 슬라이더가 작동한다', async ({ page }) => {
    const slider = page.locator('#volumeSlider');
    const valueDisplay = page.locator('#volumeValue');

    await expect(valueDisplay).toHaveText('50%');

    await slider.fill('75');
    await expect(valueDisplay).toHaveText('75%');

    await slider.fill('25');
    await expect(valueDisplay).toHaveText('25%');
  });

  test('건반에 음 정보가 표시된다', async ({ page }) => {
    const firstNote = page.locator('.note-button').first();

    await expect(firstNote.locator('.note-name')).toHaveText('도');
    await expect(firstNote.locator('.note-label')).toContainText('C4');
  });

  test('건반에 키보드 힌트가 표시된다', async ({ page }) => {
    const firstNote = page.locator('.note-button').first();
    const keyHint = firstNote.locator('.note-key');
    await expect(keyHint).toBeVisible();
    // 키보드 힌트가 존재하는지 확인 (대문자 또는 숫자)
    const text = await keyHint.textContent();
    expect(text).toMatch(/^[A-Z0-9]$/);
  });

  test('3옥타브 모드에서 각 행에 키보드 힌트가 표시된다', async ({ page }) => {
    // 3옥타브 선택
    await page.click('.control-button[data-octave="3"]');

    // 3개의 옥타브 행이 있어야 함
    await expect(page.locator('.octave-row')).toHaveCount(3);

    // 각 행의 첫 번째 버튼에 키 힌트가 있어야 함
    const rows = page.locator('.octave-row');
    for (let i = 0; i < 3; i++) {
      const firstNote = rows.nth(i).locator('.note-button').first();
      await expect(firstNote.locator('.note-key')).toBeVisible();
    }
  });

});
