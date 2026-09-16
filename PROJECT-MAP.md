# Project Map

Пакет `@admiral-ds/admiral3-icons` публикует SVG-иконки Admiral 3.0 как React-компоненты, независимые от фреймворка SVG-данные и vanilla-утилиты для DOM и SSR.

## Назначение проекта

- Основной entry point `@admiral-ds/admiral3-icons` экспортирует React-компоненты всех категорий, кроме флагов.
- Subpath `@admiral-ds/admiral3-icons/flags` экспортирует только флаги.
- Subpath `@admiral-ds/admiral3-icons/data` экспортирует SVG-данные всех категорий, кроме флагов.
- Subpath `@admiral-ds/admiral3-icons/flags-data` экспортирует только SVG-данные флагов.
- Subpath `@admiral-ds/admiral3-icons/vanilla` экспортирует утилиты для создания SVG DOM-элементов, рендеринга в контейнер и SSR-строки.

## Основной поток данных

```text
inputZip/<plugin-icons.zip + flags.zip>
  -> scripts/update_icons_from_single_zip.py
  -> public/icons/<category>/*.svg
  -> scripts/formatSvg.cjs
  -> build/<category>/*.svg
  -> scripts/createMetadata.js
  -> metadata.json + flags-metadata.json
  -> scripts/generate-svg-icon-exports.cjs
  -> src/icons/<category>.ts + src/data/<category>.ts
  -> src/index.ts + src/flags.ts + src/data.ts + src/flags-data.ts
  -> vite build + tsc
  -> dist/index.* + dist/flags.* + dist/data.* + dist/flags-data.* + dist/vanilla.*
```

Fallback-поток для ручного экспорта по категориям:

```text
inputZipManual/<category>/*.zip
  -> scripts/update_icons_from_zip.py
  -> public/icons/<category>/*.svg
  -> npm run build-meta
```

## Категории иконок

`icon-categories.json` - источник правды для категорий, Storybook labels и названий фреймов Pixso. Скрипты синхронизируют `public/icons`, `build`, `src/iconCategoryConfig.ts`, `src/icons`, `src/data`, `src/index.ts`, `src/flags.ts`, `src/data.ts` и `src/flags-data.ts` с этим конфигом.

- `category`
- `communication`
- `documents`
- `finance`
- `flags`
- `location`
- `logo`
- `redact`
- `security`
- `service`
- `system`

Флаги входят в `metadata.json`, но не экспортируются из root entry points `@admiral-ds/admiral3-icons` и `@admiral-ds/admiral3-icons/data`.

## Каталоги

- `inputZip` - временная папка для двух ZIP: обычных иконок из Pixso Icons Plugin и отдельного ручного экспорта флагов. После `npm run icons:update` скрипт очищает содержимое, оставляя `.gitkeep`.
- `inputZipManual/<category>` - fallback-папки для ручных ZIP-архивов по категориям. После `npm run icons:update:manual` скрипт очищает содержимое категории, оставляя `.gitkeep`.
- `.tmp/pixso-icons` - временная папка распаковки обоих ZIP. Генерируется и удаляется скриптом.
- `public/icons/<category>` - исходные SVG по категориям. Синхронизируется скриптами из Pixso ZIP, не часть публичного API пакета.
- `build/<category>` - оптимизированные SVG после SVGO. Генерируется из `public/icons`, используется для сборки React-компонентов и не является публичным API пакета.
- `src/icons/<category>.ts` - сгенерированные React-экспорты категории через `vite-plugin-svgr`.
- `src/data/<category>.ts` - сгенерированные независимые от фреймворка SVG-описания категории.
- `src/index.ts` - root entry point, реэкспортирует все `src/icons/*`, кроме `flags`.
- `src/flags.ts` - отдельный entry point для `@admiral-ds/admiral3-icons/flags`.
- `src/data.ts` - root data entry point, реэкспортирует все `src/data/*`, кроме `flags`, и типы SVG-описаний.
- `src/flags-data.ts` - отдельный data entry point для SVG-описаний флагов.
- `src/svg-data.ts` - общие типы `SvgIconDefinition` и `SvgIconNode`.
- `src/vanilla.ts` - независимые от React DOM- и SSR-утилиты для SVG-описаний.
- `dist/` - результат library build: ESM entry points и `.d.ts`. Генерируется, не редактируется вручную.
- `playground/` - internal Vite-приложение для browser/runtime-проверок.
- `playground/scenarios/` - сценарии playground. `index.ts` собирает реестр, `icon-gallery.tsx` показывает данные из `metadata.json`.
- `tests/e2e/` - Playwright e2e/smoke-тесты playground.
- `tests/visual/` - Playwright visual snapshot-тесты и эталонные PNG-снимки.
- `.storybook/` - конфигурация Storybook, темы и preview-настройки.
- `.github/workflows/` - CI и npm release workflows.
- `scripts/` - генераторы, проверка package exports и утилиты обновления иконок.
- `scripts/constants/` - справочники стран для генерации `flags-metadata.json`.

## Ключевые файлы

- `package.json` - package exports, npm scripts, peer dependencies и список файлов для публикации.
- `README.md` - краткая пользовательская документация пакета.
- `CONTRIBUTING.md` - процесс обновления иконок из Pixso, проверки, PR и релиза.
- `icon-categories.json` - источник правды для категорий, Storybook labels и Pixso frame names.
- `src/iconCategoryConfig.ts` - сгенерированный TypeScript-конфиг категорий для UI/Storybook.
- `metadata.json` - сгенерированная metadata по всем категориям: имя, путь, SVG и тип `outline`/`solid`.
- `flags-metadata.json` - сгенерированная metadata флагов: path, ISO-код, английское и русское название страны.
- `commitMessages.txt` - создается скриптами обновления после обновления ZIP; содержит шаблоны сообщений для добавленных и удаленных иконок.
- `vite.config.ts` - library build для React-, data- и vanilla-entry points.
- `vite.playground.config.ts` - сборка internal playground в `dist-playground`.
- `playwright.config.ts` - e2e-конфиг; запускает `npm run playground:serve` на `http://localhost:4173`.
- `playwright.visual.config.ts` - visual snapshot-конфиг; запускает Chromium и хранит снимки в `tests/visual`.
- `tests/TESTING_README.md` - правила добавления и запуска e2e и visual snapshot-тестов.
- `eslint.config.js` - ESLint flat config.
- `tsconfig.json` - project references для typecheck.
- `tsconfig.lib.json` - генерация деклараций для library build.
- `tsconfig.node.json` - TypeScript-настройки для Node/config-файлов.
- `tsconfig.playground.json` - TypeScript-настройки playground.
- `tsconfig.storybook.json` - TypeScript-настройки Storybook.
- `.env.example` - пример локальных переменных окружения.
- `LICENSE` - лицензия пакета.

## Scripts

- `npm run icons:update` - распознает и распаковывает Pixso Plugin ZIP и отдельный ZIP флагов из `inputZip`, валидирует категории, обновляет `public/icons`, генерирует `commitMessages.txt`, затем запускает `build-meta`.
- `npm run icons:update:manual` - fallback: распаковывает ручные ZIP из `inputZipManual/<category>`, обновляет `public/icons`, генерирует `commitMessages.txt`, затем запускает `build-meta`.
- `npm run build-meta` - оптимизирует SVG в `build`, пересобирает `metadata.json`, `flags-metadata.json` и TS-экспорты.
- `npm run build` - запускает `build-meta`, Vite library build и генерацию `.d.ts`.
- `npm run test:exports` - собирает пакет, проверяет vanilla-утилиты, устанавливает tarball во временный проект и проверяет публичные ESM exports с React и без него.
- `npm run test:e2e` - собирает пакет и playground, затем запускает Playwright.
- `npm run test:e2e-ui` - то же, но в UI-режиме Playwright.
- `npm run test:visual` - собирает пакет и playground, затем запускает visual snapshot-тесты.
- `npm run test:visual:update` - пересобирает visual snapshot-эталоны.
- `npm run playground` - локальный Vite dev server для playground.
- `npm run playground:build` - production-сборка playground в `dist-playground`.
- `npm run playground:serve` - статическая раздача `dist-playground` на порту `4173`.
- `npm run storybook` - локальный Storybook на порту `6006`.
- `npm run storybook:build` - production-сборка Storybook.
- `npm run check:full` - форматирование, lint, typecheck, package exports, e2e и visual snapshot-тесты.
- `npm run check:fix` - автоформатирование и ESLint autofix.
- `npm run dev` - локальный Vite dev server для library/dev-сборки.
- `npm run pack:check` - dry-run npm tarball.
- `npm run release` - генерация версии и changelog через `standard-version`.

## Скрипты генерации

- `scripts/update_icons_from_single_zip.py`
  - читает ровно два ZIP из `inputZip` и определяет их по содержимому;
  - сверяет верхнеуровневые папки Pixso Plugin ZIP со всеми не-flag `pixsoFrameName` из `icon-categories.json`;
  - рекурсивно собирает SVG из отдельного ZIP флагов;
  - проверяет, что каждая категория содержит SVG после фильтрации;
  - безопасно распаковывает ZIP во временную папку `.tmp/pixso-icons`;
  - нормализует имена файлов;
  - пропускает файлы, начинающиеся с `Rectangle`;
  - полностью заменяет SVG в `public/icons/<category>`;
  - удаляет из `public/icons` категории, которых больше нет в `icon-categories.json`;
  - очищает `inputZip`;
  - создает `commitMessages.txt` со списками добавленных и удаленных иконок.
- `scripts/update_icons_from_zip.py`
  - читает ручные ZIP из `inputZipManual/<category>`;
  - сверяет папки `inputZipManual` с `value` из `icon-categories.json`;
  - распаковывает SVG;
  - нормализует имена файлов;
  - пропускает файлы, начинающиеся с `Rectangle`;
  - полностью заменяет SVG в `public/icons/<category>`;
  - очищает временные файлы в `inputZipManual`;
  - создает `commitMessages.txt` со списками добавленных и удаленных иконок.
- `scripts/icon-categories.cjs`
  - читает и валидирует `icon-categories.json`;
  - предоставляет общий список категорий для генераторов.
- `scripts/sync-icon-category-config.cjs`
  - генерирует `src/iconCategoryConfig.ts` из `icon-categories.json`.
- `scripts/formatSvg.cjs`
  - читает категории из `icon-categories.json` и SVG из `public/icons`;
  - оптимизирует SVG через SVGO;
  - удаляет размеры, добавляет `focusable=false`, префиксует id;
  - удаляет служебные пустые path;
  - сохраняет SVG в `build` с CamelCase-именами файлов.
- `scripts/createMetadata.js`
  - читает `build`;
  - генерирует `metadata.json`;
  - вызывает генерацию metadata для флагов.
- `scripts/createFlagsMetadata.js`
  - читает `build/flags`;
  - сопоставляет имена файлов со справочниками стран;
  - генерирует `flags-metadata.json`.
- `scripts/generate-svg-icon-exports.cjs`
  - читает категории из `icon-categories.json` и данные из `metadata.json`;
  - генерирует `src/icons/<category>.ts`;
  - преобразует SVG в типизированные описания и генерирует `src/data/<category>.ts`;
  - генерирует `src/index.ts` без `flags`;
  - генерирует `src/flags.ts` для отдельного React-subpath;
  - генерирует `src/data.ts` без `flags` и `src/flags-data.ts` для отдельного data-subpath.
- `scripts/test-vanilla-utilities.cjs`
  - импортирует собранные SVG-данные и vanilla-утилиты из `dist`;
  - проверяет создание DOM-элемента, рендеринг в контейнер и SSR-строку.
- `scripts/test-package-exports.cjs`
  - делает `npm pack`;
  - устанавливает tarball во временный проект;
  - проверяет `data`, `flags-data` и `vanilla` без React;
  - проверяет root import и flags import после установки React;
  - проверяет, что exports с префиксом `Flags` не попадают в root import.

## Сборка пакета

Library build настраивается в `vite.config.ts`:

- entry points: `src/index.ts`, `src/flags.ts`, `src/data.ts`, `src/flags-data.ts`, `src/vanilla.ts`;
- формат: ESM;
- output files: `dist/index.js`, `dist/flags.js`, `dist/data.js`, `dist/flags-data.js`, `dist/vanilla.js`;
- external dependencies: `react`, `react-dom`, `react/jsx-runtime`;
- SVG импортируются как React-компоненты через `vite-plugin-svgr`.

Декларации типов генерируются командой `tsc -p tsconfig.lib.json`.

## Playground и e2e

Playground нужен для consumer-like runtime-проверок:

- `playground/main.tsx` монтирует приложение playground.
- `playground/scenarios/index.ts` хранит реестр сценариев.
- `playground/scenarios/icon-gallery.tsx` строит галерею по `metadata.json`.
- Playwright ходит в сценарии через query-параметр `?scenario=...`.
- `tests/e2e/icons/icon-gallery.spec.ts` проверяет сценарий галереи и переключение темы в playground.
- Общие e2e helper-функции лежат в `tests/e2e/utils.ts`.
- Общие e2e константы лежат в `tests/e2e/constants.ts`.

Перед e2e пакет собирается как опубликованный entry point, затем собирается playground и поднимается статически.

Visual snapshot-тесты используют тот же production-like playground, но запускаются отдельной командой и конфигом `playwright.visual.config.ts`. Эталоны лежат рядом со spec в `tests/visual/icon.test.ts-snapshots/`.

## Storybook

Storybook используется как витрина и docs/a11y-слой:

- `.storybook/main.ts` - основной конфиг Storybook.
- `.storybook/preview.tsx` - глобальные decorators/parameters.
- `.storybook/storybookThemes.ts` и `DocsThemeContainer.tsx` - темы документации.
- `.storybook/preview.css` - глобальные стили preview.
- `src/stories/BundleSize.template.tsx` - документация по выбору entry point и влиянию импорта на bundle size.
- `src/stories/NativeSvg.template.tsx` - примеры использования SVG-данных и vanilla-утилит без React-компонентов.

Storybook не является runtime для e2e-тестов.

## CI и публикация

- `.github/workflows/build.yml`
  - запускается на push и pull request в `main`;
  - собирает Storybook для GitHub Pages;
  - выполняет `npm ci`, `format:check`, `lint`, `typecheck`, `test:exports`, `pack:check`;
  - запускает Playwright e2e и visual snapshot-тесты.
- `.github/workflows/npm_release.yaml`
  - запускается на published GitHub release или вручную;
  - сначала повторяет release-проверки;
  - затем собирает пакет и публикует в npm через `npm publish --provenance --access public`.
- `.github/dependabot.yml`
  - настройки Dependabot.

## Публикуемый состав npm-пакета

Поле `files` в `package.json` публикует:

- `dist`
- `README.md`

`LICENSE` и `package.json` добавляются npm автоматически. `package.json` также доступен через публичный export `@admiral-ds/admiral3-icons/package.json`.

Исходники `src`, `build`, `scripts`, `playground`, `tests`, Storybook, visual snapshots и CI-конфиги не входят в публикуемый пакет.

## Что редактировать вручную

- При обычном обновлении в `inputZip` кладутся Pixso Plugin ZIP с обычными иконками и отдельный ZIP флагов.
- Для fallback-обновления вручную кладутся только ZIP-архивы в `inputZipManual/<category>`.
- При изменении набора категорий вручную редактируется `icon-categories.json`.
- `src/iconCategoryConfig.ts`, `public/icons`, `build`, `metadata.json`, `flags-metadata.json`, `src/icons`, `src/data`, `src/index.ts`, `src/flags.ts`, `src/data.ts` и `src/flags-data.ts` должны обновляться через скрипты.
- `dist` и `dist-playground` являются build-артефактами и не редактируются вручную.
- При изменении package exports нужно обновлять `package.json`, сборку и `scripts/test-package-exports.cjs`.
- При изменении runtime-сценариев нужно синхронизировать `playground/scenarios` и `tests/e2e`.
