import { typography } from '@admiral-ds/admiral3-tokens';
import styled from 'styled-components';

import type { PlaygroundScenario } from './index';
import metadata from '../../metadata.json';
import { ColoredTemplate } from '../../src/stories/Colored.template';
import { CurrentColorTemplate } from '../../src/stories/CurrentColor.template';

type IconMeta = {
  name: string;
  svg?: string;
  type?: string;
};

const categoryEntries = Object.entries(metadata) as Array<[string, IconMeta[]]>;
const totalIcons = categoryEntries.reduce((count, [, icons]) => count + icons.length, 0);
const previewIcons = categoryEntries.flatMap(([category, icons]) =>
  icons.slice(0, 8).map((icon) => ({ ...icon, category })),
);
const getIconTestId = (category: string, iconName: string) => `icon-${category}-${iconName}`;

const VisualSnapshots = styled.section`
  display: grid;
  width: 100%;
  gap: 24px;
`;

const VisualCategory = styled.section`
  display: grid;
  gap: 12px;
`;

const VisualCategoryTitle = styled.h2`
  margin: 0;
  ${typography.textStyles.header.h6};
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  width: 100%;
  gap: 8px;
`;

const VisualItem = styled.article`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 12px;
  background: var(--admiral-color-base-neutral-base1-rest);
`;

const VisualSvg = styled.div`
  display: block;
  width: 40px;
  height: 40px;

  svg {
    display: block;
    width: 40px;
    height: 40px;
  }
`;

const GalleryRoot = styled.section`
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 24px;
  color: var(--admiral-color-text-neutral-text1-rest);
`;

const GalleryHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0 0 4px;
    ${typography.textStyles.header.h4};
  }

  p {
    margin: 0;
    color: var(--admiral-color-text-neutral-text2-rest);
    ${typography.textStyles.body.body2Long};
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const CategoryCard = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--admiral-color-stroke-neutral-subtle-rest);
  border-radius: var(--admiral-radius-by-base-8-medium);
  background: var(--admiral-color-base-neutral-base1-rest);

  h3 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${typography.textStyles.body.body1Long};
  }

  span {
    flex-shrink: 0;
    color: var(--admiral-color-text-neutral-text2-rest);
    ${typography.textStyles.body.body2Long};
  }
`;

const IconPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
`;

const IconPreviewCard = styled.article`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--admiral-color-stroke-neutral-subtle-rest);
  border-radius: var(--admiral-radius-by-base-8-medium);
  background: var(--admiral-color-base-neutral-base1-rest);
`;

const IconPreviewSvg = styled.div`
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--admiral-color-text-neutral-text2-rest);
  border-radius: var(--admiral-radius-by-base-8-medium);
  background: var(--admiral-color-base-neutral-base2-rest);

  svg {
    display: block;
    width: 32px;
    height: 32px;
  }
`;

const IconPreviewMeta = styled.div`
  display: grid;
  min-width: 0;
  gap: 2px;

  strong,
  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    ${typography.textStyles.body.body2Long};
  }

  span {
    color: var(--admiral-color-text-neutral-text2-rest);
    ${typography.textStyles.caption.caption1};
  }
`;

const EmptyState = styled.p`
  margin: 0;
  color: var(--admiral-color-text-neutral-text2-rest);
  ${typography.textStyles.body.body2Long};
`;

const IconGalleryScenario = () => (
  <GalleryRoot data-testid="icon-gallery">
    <GalleryHeader>
      <div>
        <h2>Icons metadata</h2>
        <p data-testid="icon-total">{totalIcons} icons across generated categories</p>
      </div>
    </GalleryHeader>

    <CategoryGrid data-testid="category-grid">
      {categoryEntries.map(([category, icons]) => (
        <CategoryCard data-testid="category-card" key={category}>
          <h3>{category}</h3>
          <span>{icons.length}</span>
        </CategoryCard>
      ))}
    </CategoryGrid>

    {previewIcons.length > 0 ? (
      <IconPreviewGrid data-testid="icon-preview-grid">
        {previewIcons.map((icon) => (
          <IconPreviewCard key={`${icon.category}/${icon.name}`}>
            <IconPreviewSvg aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon.svg ?? '' }} />
            <IconPreviewMeta>
              <strong>{icon.name}</strong>
              <span>
                {icon.category}
                {icon.type ? ` / ${icon.type}` : ''}
              </span>
            </IconPreviewMeta>
          </IconPreviewCard>
        ))}
      </IconPreviewGrid>
    ) : (
      <EmptyState data-testid="icon-empty-state">
        No generated icons yet. Run the icon generation pipeline to populate metadata previews.
      </EmptyState>
    )}
  </GalleryRoot>
);

const IconVisualSnapshotsScenario = () => (
  <VisualSnapshots data-testid="icon-visual-snapshots">
    {categoryEntries.map(([category, icons]) => (
      <VisualCategory key={category}>
        <VisualCategoryTitle>{category}</VisualCategoryTitle>
        <VisualGrid>
          {icons.map((icon) => (
            <VisualItem data-testid={getIconTestId(category, icon.name)} key={`${category}/${icon.name}`}>
              <VisualSvg
                aria-label={`${category} ${icon.name}`}
                dangerouslySetInnerHTML={{ __html: icon.svg ?? '' }}
                role="img"
              />
            </VisualItem>
          ))}
        </VisualGrid>
      </VisualCategory>
    ))}
  </VisualSnapshots>
);

export const iconGalleryScenarios: PlaygroundScenario[] = [
  {
    id: 'icons/gallery',
    title: 'Icons Gallery',
    render: () => <IconGalleryScenario />,
  },
  {
    id: 'icons/visual-snapshots',
    title: 'Icons Visual Snapshots',
    render: () => <IconVisualSnapshotsScenario />,
  },
  {
    id: 'icons/current-color',
    title: 'Icons CurrentColor',
    render: () => <CurrentColorTemplate />,
  },
  {
    id: 'icons/colored-fill',
    title: 'Icons Colored Fill',
    render: () => <ColoredTemplate />,
  },
];
