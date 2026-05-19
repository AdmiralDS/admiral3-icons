import { expect, test } from '@playwright/test';

import metadata from '../../metadata.json' with { type: 'json' };
import { getPlaygroundScenarioPath } from '../e2e/utils';

type IconMeta = {
  name: string;
  svg?: string;
  type?: string;
};

const METADATA = metadata as Record<string, IconMeta[]>;
const visualScenarioId = 'icons/visual-snapshots';
const getIconTestId = (category: string, iconName: string) => `icon-${category}-${iconName}`;

Object.entries(METADATA).forEach(([category, icons]) => {
  test.describe(`${category} icons visual snapshots`, () => {
    test(`${category} icons match snapshots`, async ({ page }) => {
      test.setTimeout(600_000);

      await page.goto(getPlaygroundScenarioPath(visualScenarioId), { waitUntil: 'networkidle' });
      await expect(page.getByTestId('icon-visual-snapshots')).toBeVisible();

      for (const { name } of icons) {
        const iconLocator = page.getByTestId(getIconTestId(category, name));

        await test.step(`icon: ${category}/${name}`, async () => {
          await iconLocator.waitFor({ state: 'visible' });
          await iconLocator.scrollIntoViewIfNeeded();

          await expect.soft(iconLocator).toHaveScreenshot([category, `${name}.png`], {
            maxDiffPixelRatio: 0.01,
          });
        });
      }
    });
  });
});
