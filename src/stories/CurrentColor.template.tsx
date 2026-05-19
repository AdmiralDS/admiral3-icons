import { typography } from '@admiral-ds/admiral3-tokens';
import styled from 'styled-components';

import {
  DocumentsCopyOutline,
  FinanceCardOutline,
  ServiceCheckOutline,
  ServicePlusOutline,
} from '@admiral-ds/admiral3-icons';

import { Code, Page, Panel, Text, Title } from './storyComponents';

const ExampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
  width: 100%;
  gap: 24px;
  margin-top: 24px;
`;

const ExampleItem = styled.div<{ $color: string }>`
  display: grid;
  min-width: 0;
  max-width: 160px;
  gap: 12px;
  justify-self: center;
  justify-items: center;
  color: ${({ $color }) => $color};
`;

const IconWrapper = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
`;

const ExampleName = styled.span`
  max-width: 100%;
  color: var(--admiral-color-text-neutral-text2-rest);
  ${typography.textStyles.caption.caption1};
  overflow-wrap: anywhere;
  text-align: center;
`;

const examples = [
  {
    name: 'ServicePlusOutline',
    color: 'var(--admiral-color-text-primary-text1-rest)',
    Icon: ServicePlusOutline,
  },
  {
    name: 'ServiceCheckOutline',
    color: 'var(--admiral-color-text-status-success-text1-rest)',
    Icon: ServiceCheckOutline,
  },
  {
    name: 'DocumentsCopyOutline',
    color: 'var(--admiral-color-text-status-error-text1-rest)',
    Icon: DocumentsCopyOutline,
  },
  {
    name: 'FinanceCardOutline',
    color: 'var(--admiral-color-text-extra-purple-text1-rest)',
    Icon: FinanceCardOutline,
  },
] as const;

export const CurrentColorTemplate = () => (
  <Page data-testid="current-color-template">
    <Title>Заливка иконок</Title>
    <Text>
      Монохромные иконки используют <Code>fill=&quot;currentColor&quot;</Code>, поэтому их цвет задается через
      CSS-свойство <Code>color</Code>. Передавайте цвет на сам компонент, родительский контейнер или через{' '}
      <Code>className</Code> - SVG унаследует его автоматически.
    </Text>
    <Panel>{`<ServicePlusOutline style={{ color: 'var(--admiral-color-text-primary-text1-rest)' }} />

<span style={{ color: 'var(--admiral-color-text-status-success-text1-rest)' }}>
  <ServiceCheckOutline />
</span>`}</Panel>
    <Text>
      Многоцветные иконки, например флаги и банковские логотипы, сохраняют собственные цвета и не должны перекрашиваться
      через <Code>currentColor</Code>.
    </Text>
    <ExampleGrid>
      {examples.map(({ name, color, Icon }) => (
        <ExampleItem data-testid={`current-color-example-${name}`} key={name} $color={color}>
          <IconWrapper>
            <Icon width={40} height={40} aria-label={name} />
          </IconWrapper>
          <ExampleName>{name}</ExampleName>
        </ExampleItem>
      ))}
    </ExampleGrid>
  </Page>
);
