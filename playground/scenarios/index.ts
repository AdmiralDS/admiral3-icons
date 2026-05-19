import type { ReactElement } from 'react';

import { iconGalleryScenarios } from './icon-gallery';

export type PlaygroundScenario = {
  id: string;
  title: string;
  render: () => ReactElement;
};

export const playgroundScenarios = [...iconGalleryScenarios];
