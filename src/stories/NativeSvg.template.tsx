import { useEffect, useRef } from 'react';

import { typography } from '@admiral-ds/admiral3-tokens';
import styled from 'styled-components';

import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { renderSvgIcon } from '@admiral-ds/admiral3-icons/vanilla';

import { Code, Page, Panel, Text, Title } from './storyComponents';

const Preview = styled.div`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: 24px 0;
  color: var(--admiral-color-success-text-1-rest);
  border: 1px solid var(--admiral-color-neutral-stroke-1-rest);
  border-radius: var(--admiral-radius-by-base-4-medium);
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

const UtilityList = styled.ul`
  max-width: 980px;
  margin: 16px 0 0;
  padding-left: 24px;
  color: var(--admiral-color-neutral-text-1-rest);
  ${typography.textStyles.body.body2Long};

  li + li {
    margin-top: 8px;
  }
`;

const renderExample = `import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { renderSvgIcon } from '@admiral-ds/admiral3-icons/vanilla';

const svg = document.querySelector('#check-icon'); // существующий <svg>

if (svg instanceof SVGSVGElement) {
  renderSvgIcon(svg, ServiceCheckOutlineData, {
    width: 40,
    height: 40,
    'aria-label': 'Готово',
  });
}`;

const createExample = `import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { createSvgIconElement } from '@admiral-ds/admiral3-icons/vanilla';

const svg = createSvgIconElement(ServiceCheckOutlineData, {
  width: 24,
  height: 24,
  className: 'check-icon',
});

document.body.append(svg);`;

const stringExample = `import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { renderSvgIconToString } from '@admiral-ds/admiral3-icons/vanilla';

const markup = renderSvgIconToString(ServiceCheckOutlineData, {
  width: 24,
  height: 24,
  'aria-label': 'Готово',
});`;

export const NativeSvgTemplate = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      renderSvgIcon(svgRef.current, ServiceCheckOutlineData);
    }
  }, []);

  return (
    <Page data-testid="native-svg-template">
      <Title>Нативный SVG без React</Title>
      <Text>
        Пакет экспортирует независимое от фреймворка описание каждой иконки и три утилиты для разных способов владения
        SVG-элементом. Все DOM-узлы создаются через нативные методы без использования <Code>innerHTML</Code>.
      </Text>
      <UtilityList>
        <li>
          <Code>createSvgIconElement</Code> — создать новый SVG и затем самостоятельно добавить его в DOM.
        </li>
        <li>
          <Code>renderSvgIcon</Code> — заполнить или обновить уже существующий SVG, сохранив сам DOM-элемент.
        </li>
        <li>
          <Code>renderSvgIconToString</Code> — получить строку без DOM для SSR или серверного шаблона.
        </li>
      </UtilityList>
      <Preview>
        <svg ref={svgRef} width={40} height={40} aria-label="Готово" />
      </Preview>

      <Section>
        <SectionTitle>createSvgIconElement — создание нового элемента</SectionTitle>
        <Text>
          Используйте эту функцию по умолчанию в клиентском JavaScript. Она создаёт новый <Code>SVGSVGElement</Code>,
          заполняет его данными иконки и возвращает, не добавляя в документ. Место вставки и жизненный цикл элемента
          остаются под контролем вызывающего кода.
        </Text>
        <Panel>{createExample}</Panel>
      </Section>

      <Section>
        <SectionTitle>renderSvgIcon — заполнение существующего элемента</SectionTitle>
        <Text>
          Используйте функцию, когда тег <Code>svg</Code> уже создан HTML-шаблоном либо одну иконку нужно заменить на
          другую без замены корневого DOM-элемента. Функция изменяет переданный элемент: заменяет его дочерние SVG-узлы,
          применяет атрибуты и возвращает тот же экземпляр.
        </Text>
        <Panel>{renderExample}</Panel>
      </Section>

      <Section>
        <SectionTitle>renderSvgIconToString — SVG без DOM</SectionTitle>
        <Text>
          Используйте функцию в SSR, генераторах статических страниц и серверных шаблонах. Она возвращает полную
          SVG-разметку строкой и не обращается к глобальному <Code>document</Code>. Значения переданных атрибутов
          экранируются.
        </Text>
        <Panel>{stringExample}</Panel>
      </Section>

      <Section>
        <SectionTitle>SVG-данные и tree shaking</SectionTitle>
        <Text>
          Имя SVG-данных состоит из имени соответствующего React-компонента и суффикса <Code>Data</Code>. Статические
          именованные импорты поддерживают tree shaking. Флаги доступны отдельно через{' '}
          <Code>@admiral-ds/admiral3-icons/flags-data</Code>.
        </Text>
      </Section>
    </Page>
  );
};
