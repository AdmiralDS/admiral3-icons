import type { ReactNode } from 'react';

import { typography } from '@admiral-ds/admiral3-tokens';
import styled from 'styled-components';

export const Page = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 100vh;
  padding: 32px;
  background: var(--admiral-color-base-neutral-base1-rest);
  color: var(--admiral-color-text-neutral-text1-rest);
  font-family: ${typography.primitives.fontFamily.primary};
`;

export const Title = styled.div`
  max-width: 980px;
  margin: 0 0 24px;
  color: var(--admiral-color-text-neutral-text1-rest);
  ${typography.textStyles.header.h5};
`;

export const Text = styled.div`
  max-width: 980px;
  color: var(--admiral-color-text-neutral-text1-rest);
  ${typography.textStyles.body.body2Long};

  a {
    color: var(--admiral-color-text-primary-link-rest);

    &:hover {
      color: var(--admiral-color-text-primary-link-hover);
    }
  }
`;

export const Code = styled.code`
  color: var(--admiral-color-text-neutral-text1-rest);
  ${typography.textStyles.monospace.mono2};
`;

export const Panel = styled.pre`
  box-sizing: border-box;
  max-width: 100%;
  margin: 16px 0;
  padding: 20px;
  overflow-x: auto;
  color: var(--admiral-color-text-neutral-text1-rest);
  border: 1px dashed var(--admiral-color-stroke-neutral-stroke1-rest);
  border-radius: var(--admiral-radius-by-base-4-medium);
  background: var(--admiral-color-base-neutral-base1-rest);
  ${typography.textStyles.monospace.mono2};
`;

const CategoryWrapper = styled.section`
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  margin: 0 0 20px;
  color: var(--admiral-color-text-neutral-text1-rest);
  ${typography.textStyles.header.h5};
`;

const IconsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 8px;
  padding: 32px 0;
  border-radius: var(--admiral-radius-by-base-8-medium);
  background: var(--admiral-color-base-neutral-base1-rest);

  svg {
    flex-shrink: 0;
  }
`;

export const IconCardContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  width: 200px;
  min-height: 100px;
  row-gap: 16px;
`;

export const IconPreview = styled.span<{ $preserveColors?: boolean }>`
  ${({ $preserveColors }) =>
    !$preserveColors && 'color: var(--story-icon-fill, var(--admiral-color-text-neutral-text2-rest));'}
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--admiral-color-text-neutral-text1-rest);
  cursor: pointer;
  border: 0;
  border-radius: var(--admiral-radius-by-base-4-medium);
  background: var(--admiral-color-base-neutral-invisible-rest);

  &:hover {
    background: var(--admiral-color-base-neutral-invisible-hover);
  }
`;

const ColoredIconsWrapper = styled(IconsWrapper)`
  --story-icon-fill: var(--admiral-color-stroke-primary-stroke1-rest);
`;

export const IconName = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  gap: 8px;
  color: var(--admiral-color-text-neutral-text2-rest);
  ${typography.textStyles.caption.caption1};
  text-align: center;
`;

export const IconNameText = styled.span`
  min-width: 0;
  overflow-wrap: break-word;
`;

export const Category = ({
  label,
  children,
  colored = false,
}: {
  label: string;
  children: ReactNode;
  colored?: boolean;
}) => {
  const Wrapper = colored ? ColoredIconsWrapper : IconsWrapper;

  return (
    <CategoryWrapper>
      <CategoryTitle>{label}</CategoryTitle>
      <Wrapper>{children}</Wrapper>
    </CategoryWrapper>
  );
};
