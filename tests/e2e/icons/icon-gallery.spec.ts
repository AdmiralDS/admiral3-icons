import { expect, test } from '@playwright/test';

import { getPlaygroundScenarioPath } from '../utils';

const galleryScenarioId = 'icons/gallery';
const currentColorScenarioId = 'icons/current-color';
const coloredFillScenarioId = 'icons/colored-fill';
const visualScenarioId = 'icons/visual-snapshots';
const getIconTestId = (category: string, iconName: string) => `icon-${category}-${iconName}`;

test.describe('Icons playground', () => {
  test('renders icons metadata scenario in internal playground', async ({ page }) => {
    await page.goto(getPlaygroundScenarioPath(galleryScenarioId));

    await expect(page.getByRole('heading', { name: 'Internal E2E Playground' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Icons Gallery' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('icon-gallery')).toBeVisible();
    await expect(page.getByTestId('category-card')).toHaveCount(12);
  });

  test('keeps token theme controls available for visual scenarios', async ({ page }) => {
    await page.goto(getPlaygroundScenarioPath(galleryScenarioId));

    const shell = page.locator('.playground-shell');
    await expect(shell).toHaveAttribute('data-admiral-theme', 'light');

    await page.getByLabel('Theme').selectOption('dark');
    await expect(shell).toHaveAttribute('data-admiral-theme', 'dark');
  });

  test('applies currentColor from parent color to monochrome icons', async ({ page }) => {
    await page.goto(getPlaygroundScenarioPath(currentColorScenarioId));

    const example = page.getByTestId('current-color-example-ServicePlusOutline');
    const iconPath = example.locator('svg [fill="currentColor"]').first();

    await expect(page.getByTestId('current-color-template')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Icons CurrentColor' })).toHaveAttribute('aria-current', 'page');
    await expect(iconPath).toBeVisible();
    await expect(iconPath).toHaveAttribute('fill', 'currentColor');

    const colors = await iconPath.evaluate((path) => {
      const parent = path.closest('[data-testid="current-color-example-ServicePlusOutline"]');

      return {
        inheritedColor: parent ? getComputedStyle(parent).color : '',
        renderedFill: getComputedStyle(path).fill,
      };
    });

    expect(colors.inheritedColor).not.toBe('rgb(0, 0, 0)');
    expect(colors.renderedFill).toBe(colors.inheritedColor);
  });

  test('applies colored fill story color to currentColor icons', async ({ page }) => {
    await page.goto(getPlaygroundScenarioPath(coloredFillScenarioId));

    const iconPath = page.getByTestId('servicePlusOutline').locator('[fill="currentColor"]').first();

    await expect(page.getByRole('link', { name: 'Icons Colored Fill' })).toHaveAttribute('aria-current', 'page');
    await expect(iconPath).toBeVisible();

    const colors = await iconPath.evaluate((path) => {
      const preview = path.closest('span');

      return {
        inheritedColor: preview ? getComputedStyle(preview).color : '',
        renderedFill: getComputedStyle(path).fill,
      };
    });

    expect(colors.inheritedColor).not.toBe('rgb(0, 0, 0)');
    expect(colors.renderedFill).toBe(colors.inheritedColor);
  });

  test('keeps colored bank and flag icons independent from currentColor', async ({ page }) => {
    await page.goto(getPlaygroundScenarioPath(visualScenarioId), { waitUntil: 'networkidle' });
    await expect(page.getByTestId('icon-visual-snapshots')).toBeVisible();

    const coloredIcons = [
      {
        category: 'bank',
        name: 'Sber',
        coloredPathSelector: 'svg [fill="#009d1c"]',
      },
      {
        category: 'flags',
        name: 'RussianFederation',
        coloredPathSelector: 'svg [fill="#0c47b7"]',
      },
    ] as const;

    for (const { category, name, coloredPathSelector } of coloredIcons) {
      const icon = page.getByTestId(getIconTestId(category, name));
      const coloredPath = icon.locator(coloredPathSelector).first();

      await test.step(`${category}/${name}`, async () => {
        await icon.evaluate((element) => {
          element.setAttribute('style', 'color: rgb(255, 0, 255);');
        });

        await expect(coloredPath).toBeVisible();
        await expect(coloredPath).not.toHaveAttribute('fill', 'currentColor');

        const colors = await coloredPath.evaluate((path) => {
          const parent = path.closest('[data-testid]');

          return {
            inheritedColor: parent ? getComputedStyle(parent).color : '',
            renderedFill: getComputedStyle(path).fill,
          };
        });

        expect(colors.inheritedColor).toBe('rgb(255, 0, 255)');
        expect(colors.renderedFill).not.toBe(colors.inheritedColor);
      });
    }
  });
});
