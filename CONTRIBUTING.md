# Contributing: обновление иконок в admiral3-icons

Этот документ описывает рабочий процесс обновления иконок из Pixso до PR и релиза библиотеки.

## Навигация

- [Коротко](#коротко)
- [Источник правды по категориям](#источник-правды-по-категориям)
- [Структура исходных данных в Pixso](#структура-исходных-данных-в-pixso)
- [Основной workflow: Pixso Plugin ZIP](#основной-workflow-pixso-plugin-zip)
- [Fallback workflow: ручные ZIP по категориям](#fallback-workflow-ручные-zip-по-категориям)
- [Валидация и ошибки категорий](#валидация-и-ошибки-категорий)
- [Что синхронизируется скриптами](#что-синхронизируется-скриптами)
- [Стратегия коммитов](#стратегия-коммитов)
- [Визуальная проверка](#визуальная-проверка)
- [Проверка через Storybook](#проверка-через-storybook)
- [Pull Request и сборка](#pull-request-и-сборка)
- [Релиз](#релиз)
- [Шпаргалка](#шпаргалка)

## Коротко

Основной сценарий:

```bash
# 1. Положить один ZIP из Pixso Icons Plugin в inputZip/
# 2. Запустить обновление
npm run icons:update
```

Fallback-сценарий:

```bash
# 1. Положить ручные ZIP по категориям в inputZipManual/<category>/
# 2. Запустить ручное обновление
npm run icons:update:manual
```

После обновления проверить изменения и выполнить:

```bash
npm run check:full
```

## Источник правды по категориям

`icon-categories.json` - источник правды для:

- внутренних имен категорий в репозитории (`value`);
- подписей категорий для UI/Storybook (`label`);
- названий фреймов в Pixso Plugin ZIP (`pixsoFrameName`).

При добавлении, удалении или переименовании категории сначала обновляется `icon-categories.json`, и только потом запускается обновление иконок.

Текущая связь Pixso -> репозиторий:

| Pixso frame   | Repository category |
| ------------- | ------------------- |
| Category      | `category`          |
| Communication | `communication`     |
| Documents     | `documents`         |
| Finance       | `finance`           |
| Flags         | `flags`             |
| Location      | `location`          |
| Logo Icons    | `logo`              |
| Redact        | `redact`            |
| Security      | `security`          |
| Service       | `service`           |
| System        | `system`            |

## Структура исходных данных в Pixso

Ссылка на макет Pixso:
[макет иконок](https://pixso.t1-pixso.ru/app/design/ScdIpzGMpqFkDZMw7MDwbA?icon_type=1&page-id=1%3A93&editMode=coder&item-id=1089%3A1135)

### Page Icons

Содержит фреймы:

- System
- Service
- Category
- Documents
- Security
- Finance
- Communication
- Location
- Redact
- Logo Icons

### Page Banks

Содержит фреймы:

- Bank Icons

### Page Flags

Содержит фреймы:

- Flags

## Основной workflow: Pixso Plugin ZIP

Основной сценарий использует один полный ZIP, выгруженный через Pixso Icons Plugin.

1. Открыть макет Pixso и скопировать фреймы с иконками из страниц Icons и Flags в новый файл. Это нужно, потому что Pixso "Icons Plugin" работает только с файлами, к которым у пользователя есть права на редактирование; к исходному макету таких прав нет и не должно быть.
2. В новом файле открыть раздел Plugins и запустить плагин "Icons Plugin". Если плагин не установлен, установить его из [каталога плагинов Pixso](https://pixso.t1-pixso.ru/plugins/).
3. В плагине открыть вкладку Download, нажать кнопку выгрузки и дождаться, пока плагин сформирует ZIP. Вкладка Compare нужна для сравнения изменений: если всегда копировать фреймы в один и тот же рабочий файл, через нее можно отслеживать, что изменилось.
4. Положить ровно один `.zip` файл в `inputZip/`.
5. Запустить:

```bash
npm run icons:update
```

Команда запускает:

```bash
python3 scripts/update_icons_from_single_zip.py
npm run build-meta
```

После успешного выполнения:

- `public/icons/<category>` полностью синхронизируется с ZIP;
- `inputZip/` очищается, остается только `.gitkeep`;
- создается `commitMessages.txt` со списками добавленных и удаленных иконок;
- запускается генерация metadata и TypeScript exports.

## Fallback workflow: ручные ZIP по категориям

Ручной сценарий нужен как запасной путь, если полный ZIP из Pixso Icons Plugin временно недоступен.

ZIP-архивы вручную складываются в:

```text
inputZipManual/<category>/
```

Соответствие фреймов папкам:

| Pixso frame   | Manual input folder            |
| ------------- | ------------------------------ |
| System        | `inputZipManual/system`        |
| Service       | `inputZipManual/service`       |
| Category      | `inputZipManual/category`      |
| Documents     | `inputZipManual/documents`     |
| Security      | `inputZipManual/security`      |
| Finance       | `inputZipManual/finance`       |
| Communication | `inputZipManual/communication` |
| Location      | `inputZipManual/location`      |
| Redact        | `inputZipManual/redact`        |
| Logo Icons    | `inputZipManual/logo`          |
| Flags         | `inputZipManual/flags`         |

### Экспорт вручную из Pixso

1. Открыть макет и перейти на нужную страницу.
2. Выбрать нужный фрейм, например System.
3. Выделить все SVG в этом фрейме.
4. Справа открыть раздел Export.
5. Нажать "+", выбрать формат SVG.
6. Нажать Export Layers.
7. Сохранить ZIP в `inputZipManual/<category>`, например `inputZipManual/system`.

Повторить для всех категорий из `icon-categories.json`.

### Команда ручного запуска

```bash
npm run icons:update:manual
```

Команда запускает:

```bash
python3 scripts/update_icons_from_zip.py
npm run build-meta
```

После успешного выполнения папки в `inputZipManual/<category>` очищаются, в каждой остается `.gitkeep`.

## Валидация и ошибки категорий

Основной Pixso Plugin workflow останавливается до изменения `public/icons`, если:

- в `inputZip/` нет ZIP-файла или лежит больше одного `.zip`;
- в ZIP отсутствует фрейм, объявленный в `icon-categories.json`;
- в ZIP есть неизвестный верхнеуровневый фрейм;
- после фильтрации в категории не осталось ни одного SVG;
- после нормализации два SVG в одной категории получили одинаковое имя;
- ZIP содержит небезопасный путь для распаковки.

Оба workflow нормализуют имена SVG:

- обрезают пробелы в начале и конце;
- заменяют подряд идущие пробельные символы на один пробел;
- убирают пробел перед `.svg`;
- пропускают служебные файлы `Rectangle*.svg`.

Если в Pixso добавили или удалили категорию, скрипт завершится с сообщением вида:

```text
Icon category list changed in Pixso Plugin ZIP. Update icon-categories.json first.
Unexpected categories: ...
Missing categories: ...
```

Это означает, что сначала нужно явно обновить `icon-categories.json`, а затем повторить `npm run icons:update`.

## Что синхронизируется скриптами

Эти файлы и директории считаются script-synchronized outputs и не должны редактироваться вручную при обычном обновлении иконок:

- `src/iconCategoryConfig.ts` - генерируется из `icon-categories.json`;
- `public/icons/<category>` - обновляется из Pixso ZIP;
- `build/<category>` - генерируется из `public/icons`;
- `metadata.json` и `flags-metadata.json` - генерируются из `build`;
- `src/icons/<category>.ts` - генерируется по категориям из `icon-categories.json`;
- `src/index.ts` - генерируется для всех категорий, кроме `flags`;
- `src/flags.ts` - генерируется только для категории `flags`.

Root entry point `@admiral-ds/admiral3-icons` экспортирует все не-flag категории. Флаги доступны только через `@admiral-ds/admiral3-icons/flags`.

## Стратегия коммитов

После работы скрипта могут быть изменения:

1. Новые SVG-иконки
2. Удаленные SVG-иконки
3. Изменения в существующих иконках

Используем три отдельных коммита.

### 1. Коммит: новые иконки

Если новых иконок нет, шаг пропускается.

Включаем:

- только новые SVG-файлы;
- сгенерированные изменения, которые нужны для их экспорта.

Проверить: в Pixso -> Changelog -> проверить, что все иконки, указанные там, добавились в проект.

Commit message: использовать текст, сгенерированный скриптом в `commitMessages.txt`.

### 2. Коммит: удаленные иконки

Если удаленных иконок нет, шаг пропускается.

Включаем:

- только удаленные SVG-файлы;
- сгенерированные изменения, которые убирают их из exports и metadata.

Commit message: использовать текст, сгенерированный скриптом в `commitMessages.txt`.

### 3. Коммит: остальные изменения

Все остальные изменения существующих иконок.

Commit message:

```text
Update existing icons
```

## Визуальная проверка

Перед snapshot/e2e-тестами стоит запустить полную проверку:

```bash
npm run check:full
```

Эта команда запускает prettier, lint, typecheck, проверку package exports, e2e-тесты и visual snapshot-тесты.

Если нужно запустить только e2e:

```bash
npm run test:e2e
```

Если нужно проверить только визуальные snapshot-тесты:

```bash
npm run test:visual
```

Если изменения иконок ожидаемые, обновить эталоны:

```bash
npm run test:visual:update
```

Проверить:

1. каждую измененную иконку;
2. сравнить до/после;
3. проверить целостность, отсутствие артефактов.

## Проверка через Storybook

### Сборка

```bash
npm run storybook:build
```

### Локальный запуск

```bash
npm run storybook
```

### Проверяем

- все ли иконки видны;
- корректно ли отображение;
- нет ли битых путей;
- корректно ли работают темы через `@admiral-ds/admiral3-tokens`.

Если все хорошо, можно делать Pull Request.

## Pull Request и сборка

1. Собрать изменения в три отдельных коммита: новые -> удаленные -> изменения.
2. Создать Pull Request.
3. Проверить CI.

### После принятия PR

После принятия PR должны проходить:

1. сборка проекта;
2. проверка exports;
3. e2e-тесты;
4. публикация пакета по релизному процессу.

## Релиз

После мержа PR можно формировать релиз.

1. Выполнить:

```bash
npm run release
```

2. Скрипт автоматически сгенерирует:
   - Change Log;
   - Release Message со списком добавленных и удаленных иконок.

3. Проверить корректность текста релиза.
4. Создать релиз на GitHub. Публикация в npm произойдет автоматически после создания тега.

## Шпаргалка

1. Обновить `icon-categories.json`, если в Pixso изменился набор категорий.
2. Основной сценарий: положить один Pixso Plugin ZIP в `inputZip/`.
3. Запустить `npm run icons:update`.
4. Fallback: положить ручные ZIP в `inputZipManual/<category>/` и запустить `npm run icons:update:manual`.
5. Проверить `commitMessages.txt` и изменения иконок вручную.
6. Выполнить `npm run check:full`.
7. Подготовить три коммита.
8. Собрать Storybook через `npm run storybook:build`.
9. Проверить Storybook через `npm run storybook`.
10. Создать PR.
11. Принять PR.
12. Выполнить `npm run release`.
13. Создать релиз на GitHub.
