import { typography } from '@admiral-ds/admiral3-tokens';
import styled from 'styled-components';

import { Code, Page, Panel, Text, Title } from './storyComponents';

const Flow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 980px;
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const FlowItem = styled.div`
  box-sizing: border-box;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--admiral-color-neutral-stroke-1-rest);
  border-radius: var(--admiral-radius-by-base-4-medium);
  background: var(--admiral-color-neutral-base-2-rest);
`;

const FlowTitle = styled.div`
  margin-bottom: 8px;
  color: var(--admiral-color-neutral-text-1-rest);
  ${typography.textStyles.subtitle.subtitle2};
`;

const FlowText = styled.div`
  color: var(--admiral-color-neutral-text-2-rest);
  ${typography.textStyles.body.body2Long};
`;

const Section = styled.section`
  max-width: 980px;
  margin-top: 32px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px;
  color: var(--admiral-color-neutral-text-1-rest);
  ${typography.textStyles.header.h6};
`;

const recommendedImport = `import { ServiceCheckOutline } from '@admiral-ds/admiral3-icons';

export function Example() {
  return <ServiceCheckOutline width={24} height={24} />;
}`;

const dynamicImport = `import * as Icons from '@admiral-ds/admiral3-icons';

const Icon = Icons[iconName];`;

export const BundleSizeTemplate = () => (
  <Page data-testid="bundle-size-template">
    <Title>Размер итоговой сборки</Title>
    <Text>
      В установленном npm-пакете находятся все иконки, но в production-сборку приложения при корректном tree shaking
      попадают только реально используемые React-компоненты или SVG-данные. Пакет публикуется в ESM-формате и помечен
      как не содержащий побочных эффектов.
    </Text>

    <Flow aria-label="Как иконки попадают в итоговую сборку">
      <FlowItem>
        <FlowTitle>1. npm-пакет</FlowTitle>
        <FlowText>
          Содержит React-компоненты, SVG-данные и рендерер для работы с SVG без React (<Code>vanilla</Code>).
        </FlowText>
      </FlowItem>
      <FlowItem>
        <FlowTitle>2. Сборщик приложения</FlowTitle>
        <FlowText>Анализирует статические ESM-импорты и удаляет неиспользуемые экспорты.</FlowText>
      </FlowItem>
      <FlowItem>
        <FlowTitle>3. Итоговый бандл</FlowTitle>
        <FlowText>Содержит используемые иконки, если сборщик поддерживает и применяет tree shaking.</FlowText>
      </FlowItem>
    </Flow>

    <Section>
      <SectionTitle>Рекомендуемый импорт</SectionTitle>
      <Text>
        Используйте статические именованные импорты. Такой код позволяет Vite, Rollup и Webpack определить, какие
        компоненты нужны приложению.
      </Text>
      <Panel>{recommendedImport}</Panel>
    </Section>

    <Section>
      <SectionTitle>Динамический выбор иконки</SectionTitle>
      <Text>
        При импорте пространства имён и выборе компонента по динамическому ключу сборщик может сохранить в бандле весь
        набор, поскольку заранее не знает возможное значение <Code>iconName</Code>.
      </Text>
      <Panel>{dynamicImport}</Panel>
    </Section>

    <Section>
      <SectionTitle>Флаги</SectionTitle>
      <Text>
        Флаги вынесены в отдельный entry point <Code>@admiral-ds/admiral3-icons/flags</Code> и не входят в основной
        импорт. Их SVG-данные также доступны отдельно через <Code>@admiral-ds/admiral3-icons/flags-data</Code>.
      </Text>
    </Section>
  </Page>
);
