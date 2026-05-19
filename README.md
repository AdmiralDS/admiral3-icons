# @admiral-ds/admiral3-icons

**@admiral-ds/admiral3-icons** - официальная библиотека SVG-иконок для продуктов Admiral Design System 3.0.

Пакет поставляет иконки в виде готовых React-компонентов.

Иконки сгруппированы по категориям: `bank`, `category`, `communication`, `documents`, `finance`, `flags`, `location`, `logo`, `redact`, `security`, `service`, `system`.

## Каталог иконок

Полный перечень иконок, сгруппированный по категориям, информация по использованию, настройке и примеры:

[Каталог иконок](https://admiralds.github.io/admiral3-icons/)

## Установка

```shell
npm install @admiral-ds/admiral3-icons
```

Peer dependencies:

- `react`
- `react-dom`

## Использование

Основной entry point экспортирует все категории, кроме флагов:

```tsx
import { ServiceCheckOutline } from '@admiral-ds/admiral3-icons';

export function Example() {
  return <ServiceCheckOutline width={24} height={24} />;
}
```

React-компоненты поддерживают стандартные SVG-props: `width`, `height`, `fill`, `stroke`, `className`, `aria-label` и другие.

## Флаги

Флаги вынесены в отдельный subpath, чтобы не утяжелять основной импорт:

```tsx
import { FlagsRussianFederation } from '@admiral-ds/admiral3-icons/flags';

export function Example() {
  return <FlagsRussianFederation width={24} height={24} />;
}
```

## Форматы

- **Outline** - контурные иконки для интерфейсных элементов.
- **Solid** - залитые иконки, которые хорошо читаются в маленьких размерах.

Формат отражается в имени компонента и SVG-файла, например `ServiceCheckOutline` или `CategoryAcceptSolid`.

## Публичные subpath

- `@admiral-ds/admiral3-icons` - React-компоненты всех категорий, кроме флагов.
- `@admiral-ds/admiral3-icons/flags` - React-компоненты флагов.

## Разработка

Правила разработки и workflow репозитория описаны отдельно:

- [Соглашения по внесению изменений](CONTRIBUTING.md)
- [Руководство по тестированию](tests/TESTING_README.md)

## Лицензия

См. [LICENSE](LICENSE).
