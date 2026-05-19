# Project Map

Пакет `@admiral-ds/admiral3-icons` публикует SVG-иконки Admiral 3.0 как React-компоненты.

## Назначение проекта

- Основной entry point `@admiral-ds/admiral3-icons` экспортирует React-компоненты всех категорий, кроме флагов.
- Subpath `@admiral-ds/admiral3-icons/flags` экспортирует только флаги.

## Основной поток данных

```text
inputZip/<category>/*.zip
  -> scripts/update_icons_from_zip.py
  -> public/icons/<category>/*.svg
  -> scripts/formatSvg.cjs
  -> build/<category>/*.svg
  -> scripts/createMetadata.js
  -> metadata.json + flags-metadata.json
  -> scripts/generate-svg-icon-exports.cjs
  -> src/icons/<category>.ts + src/index.ts + src/flags.ts
  -> vite build + tsc
  -> dist/*.js + dist/*.d.ts
```

## Категории иконок

Категории должны быть синхронны между `inputZip`, `public/icons`, `build` и `src/icons`:

- `bank`
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

Флаги входят в `metadata.json`, но не экспортируются из root entry point.

## Каталоги

- `inputZip/<category>` - временные папки для ZIP-архивов из Pixso. После `npm run icons:update` скрипт очищает содержимое категории, оставляя `.gitkeep`.
- `public/icons/<category>` - исходные SVG по категориям. Это источник для оптимизации, не часть публичного API пакета.
- `build/<category>` - оптимизированные SVG после SVGO. Генерируется из `public/icons`, используется для сборки React-компонентов и не является публичным API пакета.
- `src/icons/<category>.ts` - сгенерированные React-экспорты категории через `vite-plugin-svgr`.
- `src/index.ts` - root entry point, реэкспортирует все `src/icons/*`, кроме `flags`.
- `src/flags.ts` - отдельный entry point для `@admiral-ds/admiral3-icons/flags`.
- `dist/` - результат library build: ESM entry points и `.d.ts`. Генерируется, не редактируется вручную.
- `playground/` - internal Vite-приложение для browser/runtime-проверок.
- `playground/scenarios/` - сценарии playground. `index.ts` собирает реестр, `icon-gallery.tsx` показывает данные из `metadata.json`.
- `tests/e2e/` - Playwright e2e/smoke-тесты playground.
- `.storybook/` - конфигурация Storybook, темы и preview-настройки.
- `.github/workflows/` - CI и npm release workflows.
- `scripts/` - генераторы, проверка package exports и утилиты обновления иконок.
- `scripts/constants/` - справочники стран для генерации `flags-metadata.json`.

## Ключевые файлы

- `package.json` - package exports, npm scripts, peer dependencies и список файлов для публикации.
- `README.md` - краткая пользовательская документация пакета.
- `CONTRIBUTING.md` - процесс обновления иконок из Pixso, проверки, PR и релиза.
- `metadata.json` - сгенерированная metadata по всем категориям: имя, путь, SVG и тип `outline`/`solid`.
- `flags-metadata.json` - сгенерированная metadata флагов: path, ISO-код, английское и русское название страны.
- `commitMessages.txt` - создается `scripts/update_icons_from_zip.py` после обновления ZIP; содержит шаблоны сообщений для добавленных и удаленных иконок.
- `vite.config.ts` - library build для `src/index.ts` и `src/flags.ts`.
- `vite.playground.config.ts` - сборка internal playground в `dist-playground`.
- `playwright.config.ts` - e2e-конфиг; запускает `npm run playground:serve` на `http://localhost:4173`.
- `eslint.config.js` - ESLint flat config.
- `tsconfig.json` - project references для typecheck.
- `tsconfig.lib.json` - генерация деклараций для library build.
- `tsconfig.node.json` - TypeScript-настройки для Node/config-файлов.
- `tsconfig.playground.json` - TypeScript-настройки playground.
- `tsconfig.storybook.json` - TypeScript-настройки Storybook.
- `.env.example` - пример локальных переменных окружения.
- `LICENSE` - лицензия пакета.

## Scripts

- `npm run icons:update` - распаковывает ZIP из `inputZip`, обновляет `public/icons`, генерирует `commitMessages.txt`, затем запускает `build-meta`.
- `npm run build-meta` - оптимизирует SVG в `build`, пересобирает `metadata.json`, `flags-metadata.json` и TS-экспорты.
- `npm run build` - запускает `build-meta`, Vite library build и генерацию `.d.ts`.
- `npm run test:exports` - собирает пакет, устанавливает tarball во временный проект и проверяет публичные ESM exports.
- `npm run test:e2e` - собирает пакет и playground, затем запускает Playwright.
- `npm run test:e2e-ui` - то же, но в UI-режиме Playwright.
- `npm run playground` - локальный Vite dev server для playground.
- `npm run playground:build` - production-сборка playground в `dist-playground`.
- `npm run playground:serve` - статическая раздача `dist-playground` на порту `4173`.
- `npm run storybook` - локальный Storybook на порту `6006`.
- `npm run storybook:build` - production-сборка Storybook.
- `npm run check:full` - форматирование, lint, typecheck, package exports, e2e и visual snapshot-тесты.
- `npm run check:fix` - автоформатирование и ESLint autofix.
- `npm run pack:check` - dry-run npm tarball.
- `npm run release` - генерация версии и changelog через `standard-version`.

## Скрипты генерации

- `scripts/update_icons_from_zip.py`
  - читает ZIP из `inputZip/<category>`;
  - распаковывает SVG;
  - нормализует имена файлов;
  - пропускает файлы, начинающиеся с `Rectangle`;
  - полностью заменяет SVG в `public/icons/<category>`;
  - очищает временные файлы в `inputZip`;
  - создает `commitMessages.txt` со списками добавленных и удаленных иконок.
- `scripts/formatSvg.cjs`
  - читает `public/icons`;
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
  - читает `metadata.json`;
  - генерирует `src/icons/<category>.ts`;
  - генерирует `src/index.ts` без `flags`;
  - генерирует `src/flags.ts` для отдельного subpath.
- `scripts/test-package-exports.cjs`
  - делает `npm pack`;
  - устанавливает tarball во временный проект;
  - проверяет root import и flags import;
  - проверяет, что exports с префиксом `Flags` не попадают в root import.

## Сборка пакета

Library build настраивается в `vite.config.ts`:

- entry points: `src/index.ts`, `src/flags.ts`;
- формат: ESM;
- output files: `dist/index.js`, `dist/flags.js`;
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

## Storybook

Storybook используется как витрина и docs/a11y-слой:

- `.storybook/main.ts` - основной конфиг Storybook.
- `.storybook/preview.tsx` - глобальные decorators/parameters.
- `.storybook/storybookThemes.ts` и `DocsThemeContainer.tsx` - темы документации.
- `.storybook/preview.css` - глобальные стили preview.

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

`LICENSE` и `package.json` добавляются npm автоматически.

Исходники `src`, `build`, `scripts`, `playground`, `tests`, Storybook и CI-конфиги не входят в публикуемый пакет.

## Что редактировать вручную

- При обновлении иконок вручную кладутся только ZIP-архивы в `inputZip/<category>`.
- `public/icons`, `build`, `metadata.json`, `flags-metadata.json`, `src/icons`, `src/index.ts` и `src/flags.ts` должны обновляться через скрипты.
- `dist` и `dist-playground` являются build-артефактами и не редактируются вручную.
- При изменении package exports нужно обновлять `package.json`, сборку и `scripts/test-package-exports.cjs`.
- При изменении runtime-сценариев нужно синхронизировать `playground/scenarios` и `tests/e2e`.
