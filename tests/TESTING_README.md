## Общая информация

В проекте используются два Playwright-контура тестирования:

1. `Playwright e2e`

- smoke/runtime-проверки через internal playground;
- e2e-тесты лежат в `tests/e2e`.

2. `Playwright visual snapshots`

- визуальная регрессия иконок через internal playground;
- visual-тесты лежат в `tests/visual`;
- эталонные PNG-снимки хранятся рядом со spec в `*-snapshots`.

Unit-тестов и Vitest-команд в проекте сейчас нет.

## Структура тестов

Текущая структура:

```text
playground/scenarios/index.ts
playground/scenarios/icon-gallery.tsx
tests/e2e/icons/icon-gallery.spec.ts
tests/e2e/constants.ts
tests/e2e/utils.ts
tests/visual/icon.test.ts
tests/visual/icon.test.ts-snapshots/
```

Правила:

1. E2E-спеки для сценариев playground должны лежать в отдельной папке внутри `tests/e2e`.
2. Нельзя складывать e2e-спеки разных сценариев в корень `tests/e2e`.
3. Visual snapshot-спеки должны лежать в `tests/visual`.
4. Snapshot-файлы обновляются только через `npm run test:visual:update`.

Общие вспомогательные сущности для e2e хранятся в shared-файлах внутри `tests/e2e`:

- `utils.ts` - общие helper-функции;
- `constants.ts` - общие константы.

Если для e2e-тестов понадобятся новые общие helper-функции или константы, их нужно добавлять в shared-файлы внутри `tests/e2e`, а не дублировать по сценарным папкам. Не добавляйте shared-файлы "на будущее": они должны появляться только при реальном переиспользовании.

## Установка браузеров для Playwright

```shell
npx playwright install --with-deps
```

Дополнительная информация есть в официальной документации:
https://playwright.dev/docs/browsers

## Запуск тестов

Полная проверка проекта:

```shell
npm run check:full
```

E2E:

```shell
npm run test:e2e
```

E2E в UI-режиме:

```shell
npm run test:e2e-ui
```

Visual snapshots:

```shell
npm run test:visual
```

Обновление эталонных снимков:

```shell
npm run test:visual:update
```

Проверка публичных package exports:

```shell
npm run test:exports
```

## Workers

Количество workers для Playwright можно настроить через переменную `PW_WORKERS` в `.env` в корне проекта.

Пример:

```dotenv
PW_WORKERS='3'
```

По умолчанию используется `1`.

## Подход к e2e через internal playground

Для e2e используется отдельный internal playground:

1. Пакет собирается через `npm run build`, чтобы проверить published-like React entry points и декларации типов.
2. Playground собирается через `npm run playground:build`.
3. Готовая сборка поднимается статически через `npm run playground:serve`.
4. Playwright ходит в сценарии playground по query-параметру `scenario`.

Storybook остается витриной и docs/a11y-слоем, но не рантаймом для e2e.

Visual snapshots используют такой же production-like playground, но отдельный сценарий `icons/visual-snapshots` и отдельный конфиг `playwright.visual.config.ts`.

E2E-проверки должны покрывать browser/runtime-контракты:

1. пакетные entry points монтируются из consumer-like сценариев без runtime errors;
2. иконки корректно работают с темой из `styled-components` `ThemeProvider`;
3. переключение тем меняет computed styles, а не только текст или атрибуты;
4. ключевые playground-сценарии монтируются без runtime errors.

## Как добавлять сценарии в playground

Структура сценариев в `playground/scenarios` разделена по группам проверок. Playground не является полной копией Storybook: добавляйте сюда только те сценарии, которые нужно покрывать через e2e или использовать для browser/runtime integration checks.

Текущий паттерн:

```text
playground/scenarios/
  icon-gallery.tsx
  index.ts
```

Правила:

1. Для каждой группы связанных сценариев нужно заводить отдельный файл в `playground/scenarios`.
2. `playground/scenarios/index.ts` должен оставаться реестром и только собирать общий массив `playgroundScenarios`.
3. `id` сценария должен быть уникальным и стабильным, потому что именно он используется в `?scenario=...` и в Playwright-тестах.
4. `title` сценария используется в левом меню playground.

Пример:

```tsx
export const iconGalleryScenarios: PlaygroundScenario[] = [
  {
    id: 'icons/gallery',
    title: 'Icon Gallery',
    render: () => <IconGalleryScenario />,
  },
];
```

После добавления нового сценария нужно:

1. Подключить файл сценариев в `playground/scenarios/index.ts`.
2. Добавить или обновить e2e-спеку в `tests/e2e/...`, если сценарий должен покрываться Playwright.

## Рекомендации

Каждый тест должен быть независимым:

1. Не зависеть от порядка выполнения.
2. Не делить состояние с другими тестами.
3. Самостоятельно подготавливать нужные данные.
4. Не опираться на побочные эффекты других сценариев.

Каждый тест должен проверять одну конкретную вещь:

1. Если тест падает, должно быть сразу понятно, что сломалось.
2. Не стоит объединять в один сценарий много разных проверок без необходимости.

Описание назначения helper-функций и констант должно поддерживаться прямо рядом с их реализацией в `tests/e2e/utils.ts` и `tests/e2e/constants.ts`.
