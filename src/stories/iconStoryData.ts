import type { FunctionComponent, SVGProps } from 'react';

import * as Icons from '@admiral-ds/admiral3-icons';

import * as FlagsIcons from '@admiral-ds/admiral3-icons/flags';

import metadata from '../../metadata.json';
import { ICON_CATEGORY_CONFIG, type IconCategoryConfig } from '../iconCategoryConfig';

type IconComponent = FunctionComponent<SVGProps<SVGSVGElement>>;

type IconMeta = {
  name: string;
  path: string;
};

export type IconInfo = IconMeta & {
  Component: IconComponent;
  reactComponentName: string;
};

export type CategoryInfo = IconCategoryConfig & {
  icons: Array<IconInfo>;
};

const metadataByCategory = metadata as Record<IconCategoryConfig['value'], Array<IconMeta>>;

type IconPack = Partial<Record<string, IconComponent>>;

const iconPackMap = {
  bank: Icons,
  category: Icons,
  communication: Icons,
  documents: Icons,
  finance: Icons,
  flags: FlagsIcons,
  location: Icons,
  logo: Icons,
  redact: Icons,
  security: Icons,
  service: Icons,
  system: Icons,
} satisfies Record<IconCategoryConfig['value'], IconPack>;

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const getIcons = (category: IconCategoryConfig['value'], pack: IconPack) =>
  metadataByCategory[category].flatMap((iconMetaInfo) => {
    const reactComponentName = `${capitalizeFirstLetter(category)}${iconMetaInfo.name}`;
    const Component = pack[reactComponentName];

    return Component ? [{ ...iconMetaInfo, reactComponentName, Component }] : [];
  });

export const CATEGORIES: Array<CategoryInfo> = ICON_CATEGORY_CONFIG.map((category) => ({
  ...category,
  icons: getIcons(category.value, iconPackMap[category.value]),
})).filter(({ icons }) => icons.length > 0);

export const FLAGS_CATEGORIES = CATEGORIES.filter(({ value }) => value === 'flags');

export const ICON_CATEGORIES = CATEGORIES.filter(({ value }) => value !== 'flags');

export const ORIGINAL_COLOR_CATEGORIES = new Set<IconCategoryConfig['value']>(['bank', 'flags']);

export const COLORED_CATEGORIES = CATEGORIES.filter(({ value }) => !ORIGINAL_COLOR_CATEGORIES.has(value));
