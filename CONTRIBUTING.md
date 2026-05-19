# Contributing: обновление иконок в admiral3-icons

Этот документ описывает полный рабочий процесс обновления иконок из макета Pixso до PR и релиза библиотеки.

---

## Структура исходных данных в Pixso

Ссылка на макет Pixso:
[макет иконок](https://pixso.t1-pixso.ru/app/design/ScdIpzGMpqFkDZMw7MDwbA?icon_type=1&page-id=1%3A93&editMode=coder&item-id=1089%3A1135)

---

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

---

## Соответствие фреймов папкам в репозитории

ZIP-архивы вручную складываются в корневой каталог:

`inputZip/`

### Page Icons

System -> `inputZip/system`  
Service -> `inputZip/service`  
Category -> `inputZip/category`  
Documents -> `inputZip/documents`  
Security -> `inputZip/security`  
Finance -> `inputZip/finance`  
Communication -> `inputZip/communication`  
Location -> `inputZip/location`  
Redact -> `inputZip/redact`  
Logo icons -> `inputZip/logo`

### Page Banks

Bank Icons -> `inputZip/bank`

### Page Flags

Flags -> `inputZip/flags`

---

## Экспорт иконок из Pixso

1. Открыть макет и перейти на нужную страницу.
2. Выбрать нужный фрейм, например System.
3. Выделить все SVG в этом фрейме.
4. Справа открыть раздел Export.
5. Нажать "+", выбрать формат SVG.
6. Нажать Export Layers.
7. Сохранить ZIP, имя архива неважно, в `inputZip/<категория>`, например `inputZip/system`.

Повторить для всех фреймов.

---

## Скрипт обновления иконок

### Что делает скрипт

1. Находит ZIP в `inputZip`.
2. Распаковывает архивы по категориям.
3. Нормализует имена файлов:
   - обрезает пробелы в начале и конце
   - заменяет подряд идущие пробелы на одиночный
   - убирает пробел перед `.svg`
4. Кладет SVG в `public/icons/<категория>`.
5. Очищает временные файлы в `inputZip`, оставляя `.gitkeep`.
6. Генерирует `commitMessages.txt`:
   - добавленные иконки, если есть
   - удаленные иконки, если есть

### Команда запуска

```bash
npm run icons:update
```

Команда запускает:

```bash
python3 scripts/update_icons_from_zip.py
npm run build-meta
```

После выполнения проверьте изменения в:

- `public/icons`
- `build`
- `metadata.json`
- `flags-metadata.json`
- `src/icons`
- `src/index.ts`
- `src/flags.ts`

---

## Стратегия коммитов

После работы скрипта могут быть изменения:

1. Новые SVG-иконки
2. Удаленные SVG-иконки
3. Изменения в существующих иконках

Используем три отдельных коммита.

---

### 1. Коммит: новые иконки

Если новых иконок нет, шаг пропускается.

Включаем:

- только новые SVG-файлы
- сгенерированные изменения, которые нужны для их экспорта

Проверить:  
в Pixso -> Changelog -> проверить, что все иконки, указанные там, добавились в проект.

Commit message:  
использовать текст, сгенерированный скриптом в `commitMessages.txt`.

---

### 2. Коммит: удаленные иконки

Если удаленных иконок нет, шаг пропускается.

Включаем:

- только удаленные SVG-файлы
- сгенерированные изменения, которые убирают их из exports и metadata

Commit message:  
использовать текст, сгенерированный скриптом в `commitMessages.txt`.

---

### 3. Коммит: остальные изменения

Все остальные изменения существующих иконок.

Commit message:

```text
Update existing icons
```

---

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

1. каждую измененную иконку
2. сравнить до/после
3. проверить целостность, отсутствие артефактов

---

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

- все ли иконки видны
- корректно ли отображение
- нет ли битых путей
- корректно ли работают темы через `@admiral-ds/admiral3-tokens`

Если все хорошо, можно делать Pull Request.

---

## Pull Request и сборка

1. Собираем изменения в три отдельных коммита: новые -> удаленные -> изменения.
2. Создаем Pull Request.
3. Проверяем CI.

### После принятия PR

После принятия PR должны проходить:

1. сборка проекта
2. проверка exports
3. e2e-тесты
4. публикация пакета по релизному процессу

---

## Релиз

После мержа PR можно формировать релиз.

1. Выполнить:

```bash
npm run release
```

2. Скрипт автоматически сгенерирует:
   - Change Log
   - Release Message со списком добавленных и удаленных иконок

3. Проверить корректность текста релиза.
4. Создать релиз на GitHub. Публикация в npm произойдет автоматически после создания тега.

---

## Шпаргалка

1. Экспортировать ZIP -> `inputZip/<категория>`
2. Запустить `npm run icons:update`
3. Проверить изменения иконок вручную
4. Выполнить `npm run check:full`
5. Подготовить три коммита
6. Собрать Storybook через `npm run storybook:build`
7. Проверить Storybook через `npm run storybook`
8. Создать PR
9. Принять PR
10. Выполнить `npm run release`
11. Создать релиз на GitHub
