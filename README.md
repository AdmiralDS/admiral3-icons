# @admiral-ds/admiral3-icons

Официальная библиотека SVG-иконок для продуктов Admiral Design System 3.0.

Пакет поддерживает React-компоненты, независимые от фреймворка SVG-данные и утилиты для работы с SVG без React
(`vanilla`) в DOM и при SSR. Флаги вынесены в отдельные entry points и не входят в основной импорт.

Полный список иконок, примеры и рекомендации доступны в [каталоге иконок](https://admiralds.github.io/admiral3-icons/).

## Установка

Для React-проекта:

```shell
npm install @admiral-ds/admiral3-icons react react-dom
```

Поддерживаются `react` и `react-dom` версии `^19.2.4`. Они объявлены опциональными peer dependencies и не нужны,
если используются только SVG-данные или утилиты для работы с SVG без React (`vanilla`):

```shell
npm install @admiral-ds/admiral3-icons
```

## React-компоненты

Основной entry point экспортирует все категории, кроме флагов:

```tsx
import { ServiceCheckOutline } from '@admiral-ds/admiral3-icons';

export function StatusIcon() {
  return <ServiceCheckOutline width={24} height={24} aria-label="Готово" />;
}
```

Компоненты принимают стандартные SVG-props. Монохромные иконки используют `currentColor`, поэтому их цвет можно
задавать CSS-свойством `color`.

Флаги импортируются отдельно:

```tsx
import { FlagsRussianFederation } from '@admiral-ds/admiral3-icons/flags';

export function CountryFlag() {
  return <FlagsRussianFederation width={24} height={24} aria-label="Российская Федерация" />;
}
```

Используйте статические именованные импорты для tree shaking. Динамический доступ через `import * as Icons` может
привести к попаданию всего набора иконок в итоговый бандл.

## SVG-данные

Для каждой иконки доступно описание типа `SvgIconDefinition`. Имя экспорта состоит из имени React-компонента и
суффикса `Data`:

```ts
import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';

console.log(ServiceCheckOutlineData.name); // ServiceCheckOutline
console.log(ServiceCheckOutlineData.attributes.viewBox); // 0 0 24 24
```

Данные обычных иконок экспортируются из `@admiral-ds/admiral3-icons/data`, данные флагов — из
`@admiral-ds/admiral3-icons/flags-data`. Оба entry point также экспортируют типы `SvgIconDefinition` и `SvgIconNode`.
SVG-данные не импортируют React и подходят для любого UI-фреймворка.

## Утилиты для работы с SVG без React (`vanilla`)

Entry point `@admiral-ds/admiral3-icons/vanilla` экспортирует три утилиты. Все они принимают `SvgIconDefinition` и
не зависят от React.

Пользовательские атрибуты переопределяют корневые атрибуты иконки. `className` преобразуется в SVG-атрибут `class`, а
значения `null` и `undefined` удаляют соответствующий атрибут.

### `createSvgIconElement`

Создаёт новый `SVGSVGElement`, заполняет его и возвращает без добавления в DOM:

```ts
import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { createSvgIconElement } from '@admiral-ds/admiral3-icons/vanilla';

const icon = createSvgIconElement(ServiceCheckOutlineData, {
  width: 24,
  height: 24,
  className: 'status-icon',
  'aria-label': 'Готово',
});

document.querySelector('#icon-container')?.append(icon);
```

Третьим аргументом можно передать нужный `Document`, например документ iframe. По умолчанию используется глобальный
`document`.

### `renderSvgIcon`

Заполняет существующий `<svg>` и возвращает тот же элемент. Дочерние узлы заменяются, а атрибуты вызывающего кода,
которых нет в данных иконки или аргументе `attributes`, сохраняются:

```ts
import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { renderSvgIcon } from '@admiral-ds/admiral3-icons/vanilla';

const svg = document.querySelector<SVGSVGElement>('#status-icon');

if (svg) {
  renderSvgIcon(svg, ServiceCheckOutlineData, {
    width: 32,
    height: 32,
    'aria-label': 'Готово',
  });
}
```

Функция подходит для HTML-шаблонов и смены иконки без замены корневого DOM-элемента.

### `renderSvgIconToString`

Возвращает полную SVG-разметку без обращения к DOM. Используйте её для SSR, статических страниц и серверных шаблонов:

```ts
import { ServiceCheckOutlineData } from '@admiral-ds/admiral3-icons/data';
import { renderSvgIconToString } from '@admiral-ds/admiral3-icons/vanilla';

const markup = renderSvgIconToString(ServiceCheckOutlineData, {
  width: 24,
  height: 24,
  className: 'status-icon',
  'aria-label': 'Готово',
});
```

Значения атрибутов экранируются перед добавлением в разметку. Способ вставки полученной строки и дополнительная
обработка зависят от используемого шаблонизатора или фреймворка.

## Именование

- `ServiceCheckOutline` — контурный React-компонент;
- `CategoryAcceptSolid` — залитый React-компонент;
- `ServiceCheckOutlineData` — SVG-данные соответствующей иконки.

## Публичные entry points

| Импорт                                    | Содержимое                     | Нужен React |
| ----------------------------------------- | ------------------------------ | ----------- |
| `@admiral-ds/admiral3-icons`              | React-компоненты, кроме флагов | Да          |
| `@admiral-ds/admiral3-icons/flags`        | React-компоненты флагов        | Да          |
| `@admiral-ds/admiral3-icons/data`         | SVG-данные, кроме флагов       | Нет         |
| `@admiral-ds/admiral3-icons/flags-data`   | SVG-данные флагов              | Нет         |
| `@admiral-ds/admiral3-icons/vanilla`      | DOM- и SSR-утилиты             | Нет         |
| `@admiral-ds/admiral3-icons/package.json` | Метаданные npm-пакета          | Нет         |

## Разработка

Подробная документация для контрибьюторов:

- [обновление иконок и выпуск релиза](CONTRIBUTING.md);
- [тестирование](tests/TESTING_README.md);
- [структура проекта](PROJECT-MAP.md).

## Лицензия

См. [LICENSE](LICENSE).
