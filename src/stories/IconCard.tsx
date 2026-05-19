import { forwardRef } from 'react';

import { DocumentsCopyOutline } from '@admiral-ds/admiral3-icons';

import type { IconCategoryConfig } from '../iconCategoryConfig';
import { ORIGINAL_COLOR_CATEGORIES, type IconInfo } from './iconStoryData';
import { IconButton, IconCardContainer, IconName, IconNameText, IconPreview } from './storyComponents';

const IconNameLabel = ({ name }: { name: string }) => (
  <IconNameText>
    {name.split(/(?<=[a-z])(?=[A-Z])/).map((part, index) => (
      <span key={`${part}${index}`}>
        {part}
        <wbr />
      </span>
    ))}
  </IconNameText>
);

const CopyIcon = forwardRef<HTMLButtonElement, { text: string }>(({ text }, ref) => {
  const copyToClipboard = () => {
    void navigator.clipboard?.writeText(text);
  };

  return (
    <IconButton ref={ref} type="button" title="Копировать пример использования" onClick={copyToClipboard}>
      <DocumentsCopyOutline width={16} height={16} aria-hidden />
    </IconButton>
  );
});

export const IconCard = ({ category, icon }: { category: IconCategoryConfig['value']; icon: IconInfo }) => {
  const packageEntryPoint = category === 'flags' ? '@admiral-ds/admiral3-icons/flags' : '@admiral-ds/admiral3-icons';
  const exampleText = `
import { ${icon.reactComponentName} } from '${packageEntryPoint}';
`;

  return (
    <IconCardContainer>
      <IconPreview title={exampleText} $preserveColors={ORIGINAL_COLOR_CATEGORIES.has(category)}>
        <icon.Component width={24} height={24} data-testid={`${category}${icon.name}`} />
      </IconPreview>
      <IconName>
        <IconNameLabel name={icon.name} />
        <CopyIcon text={exampleText} />
      </IconName>
    </IconCardContainer>
  );
};
