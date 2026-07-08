import argparse
import os
import re
import json
import shutil
import sys
import zipfile
from pathlib import Path

# Корень репозитория вычисляется относительно скрипта, поэтому запуск не зависит
# от текущей рабочей директории в терминале.
repo_root = Path(__file__).resolve().parent.parent

# В inputZipManual ожидается ручная структура: по папке на каждую категорию,
# внутри каждой папки может лежать ZIP с SVG этой категории.
source_path = repo_root / "inputZipManual"

# Финальная директория, которую использует проект для опубликованных иконок.
dst_root_path = repo_root / "public" / "icons"

# Конфиг с разрешенным списком категорий. Для ручного сценария нужен только value.
category_config_path = repo_root / "icon-categories.json"


def parse_args():
    # Сейчас у скрипта нет пользовательских аргументов, но argparse дает понятный
    # --help и оставляет место для будущих опций без смены точки входа.
    parser = argparse.ArgumentParser(
        description="Update public/icons from manual per-category ZIP files in inputZipManual."
    )
    return parser.parse_args()


def read_category_config():
    # Читаем icon-categories.json и достаем список value: это имена категорий
    # и одновременно имена папок в inputZipManual/public/icons.
    with category_config_path.open(encoding="utf-8") as config_file:
        categories = json.load(config_file)

    # Если конфиг не массив, дальнейшие операции с категориями небезопасны:
    # можно пропустить или удалить неправильные директории.
    if not isinstance(categories, list):
        sys.exit("icon-categories.json must contain an array.")

    values = []
    for index, category in enumerate(categories):
        # Для этого скрипта достаточно поля value. Проверяем тип элемента, чтобы
        # не вызвать .get() у строки/числа/null.
        value = category.get("value") if isinstance(category, dict) else None
        if not isinstance(value, str) or not value.strip():
            sys.exit(f"icon-categories.json item {index} is missing value.")
        values.append(value)

    return values


def fail_category_mismatch(source, unexpected, missing):
    # Останавливаем обновление, если набор папок в inputZipManual не совпадает
    # с icon-categories.json. Так скрипт не удалит категорию из public/icons
    # только из-за случайно забытой папки.
    lines = [
        f"Icon category list changed in {source}. Update icon-categories.json first.",
        f"Unexpected categories: {', '.join(unexpected) if unexpected else 'none'}",
        f"Missing categories: {', '.join(missing) if missing else 'none'}",
    ]
    sys.exit("\n".join(lines))


def collect_icon_paths(root: Path):
    # Собираем относительные пути SVG до и после обновления, чтобы позже понять,
    # какие иконки были добавлены или удалены.
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*.svg"))


def format_list(items, prefix):
    # Форматирует список для commitMessages.txt. Если список пустой, явно пишем
    # "- none", чтобы файл не выглядел оборванным.
    if not items:
        return "- none"
    return "\n".join(f"{prefix}{item}" for item in items)

def normalize_file_name(fileName):
    # Pixso может экспортировать имена с лишними пробелами. Нормализуем имя
    # перед копированием, чтобы итоговые пути были стабильными.
    ret = fileName.strip()
    # Несколько пробелов/табов/переводов строк внутри имени заменяем одним пробелом.
    ret = re.sub(r'\s+', ' ', ret)
    # Убираем пробел перед расширением: "name .svg" становится "name.svg".
    ret = re.sub(r' \.svg$','.svg', ret)
    return ret

def skip_file(fileName):
    # Rectangle: служебные слои из Pixso, их не публикуем как реальные иконки.
    return fileName.startswith("Rectangle")


# Запускаем argparse в начале, чтобы сработал --help и будущая валидация аргументов.
parse_args()

# Проверяем входную и выходную директории до любых изменений на диске.
if not source_path.is_dir():
    sys.exit(f"source path is not a directory: {source_path}")
if not dst_root_path.is_dir():
    sys.exit(f"destination path is not a directory: {dst_root_path}")

# expected_categories сохраняет порядок из icon-categories.json. В этом же порядке
# категории будут обрабатываться и выводиться в терминал.
expected_categories = read_category_config()
expected_category_set = set(expected_categories)

# В ручном сценарии каждая категория должна быть отдельной папкой в inputZipManual.
# Скрытые папки игнорируются, чтобы служебные директории не считались категориями.
manual_categories = sorted(item.name for item in source_path.iterdir() if item.is_dir() and not item.name.startswith("."))
manual_category_set = set(manual_categories)

# Сравниваем фактические папки с конфигом в обе стороны: неожиданные папки и
# отсутствующие папки одинаково означают, что источник не соответствует проекту.
unexpected_manual_categories = sorted(manual_category_set - expected_category_set)
missing_manual_categories = sorted(expected_category_set - manual_category_set)

if unexpected_manual_categories or missing_manual_categories:
    fail_category_mismatch("inputZipManual", unexpected_manual_categories, missing_manual_categories)

# Снимок текущего состояния public/icons нужен для генерации commitMessages.txt.
existing_icons_before = collect_icon_paths(dst_root_path)

for category_name in expected_categories:
    # Берем папку категории именно из конфига, а не из os.listdir, чтобы порядок
    # и набор категорий полностью контролировались icon-categories.json.
    category_dir = source_path / category_name
    print(f"\n=== Processing category: {category_dir.name} ===")

    # 1. Поиск ZIP-файла внутри папки категории.
    # Если ZIP есть, берем первый найденный. Предполагается, что в папке лежит
    # только один актуальный архив для этой категории.
    zip_files = list(category_dir.glob("*.zip"))
    if zip_files:
        zip_file = zip_files[0]
        print(f"Found ZIP: {zip_file.name}")
        try:
            # Распаковываем ZIP прямо в папку категории. После этого ниже ищем
            # все SVG рекурсивно, включая вложенные папки из архива.
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(category_dir)
            print("Unpacked ZIP")
        except Exception as e:
            # Если конкретный ZIP не распаковался, пропускаем категорию и идем
            # дальше, чтобы остальные категории могли обновиться.
            print(f"Failed to extract {zip_file.name}: {e}")
            continue
    else:
        print("No ZIP found in", category_dir.name)

    # 2. Поиск SVG после распаковки.
    # rglob находит файлы на любой глубине: это важно, если архив содержит
    # вложенную папку с именем категории или дополнительную структуру.
    svg_files = list(category_dir.rglob("*.svg"))
    print(f"Found {len(svg_files)} SVG files")

    # 3. Папка назначения.
    # Название берется из папки категории, пробелы по краям убираются для защиты
    # от случайно созданной директории с лишним пробелом.
    dst_dir = dst_root_path / category_dir.name.strip()
    dst_dir.mkdir(parents=True, exist_ok=True)

    # 4. Удаляем старые SVG в целевой папке.
    # После этого категория будет содержать только файлы из текущего ручного ZIP.
    for old_svg in dst_dir.rglob("*.svg"):
        old_svg.unlink()

    # 5. Копируем и переименовываем.
    # На этом шаге технические Rectangle-файлы отбрасываются, а имена остальных
    # SVG приводятся к стабильному виду.
    for file in svg_files:
        if skip_file(file.name):
            continue
        new_name = normalize_file_name(file.name)
        dst_file = dst_dir / new_name
        # На случай, если normalized name когда-нибудь будет включать подпапку,
        # создаем родительскую директорию перед копированием.
        dst_file.parent.mkdir(parents=True, exist_ok=True)
        # copy2 копирует содержимое и, где возможно, метаданные исходного файла.
        shutil.copy2(file, dst_file)

    # 6. Очистка исходной папки.
    # После успешной обработки удаляем ZIP и распакованные файлы, чтобы следующий
    # запуск не переиспользовал старые SVG.
    for item in category_dir.iterdir():
        # .gitkeep оставляем, чтобы пустая папка категории сохранялась в git.
        if item.name == ".gitkeep":
            continue
        try:
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except Exception as e:
            print(f"⚠️ Could not delete {item}: {e}")

    # Если .gitkeep отсутствовал, создаем его заново после очистки.
    (category_dir / ".gitkeep").touch()

# Удаляем из public/icons директории, которых больше нет в icon-categories.json.
# Так итоговый набор категорий в public/icons синхронизируется с конфигом.
for existing_category_dir in dst_root_path.iterdir():
    if existing_category_dir.is_dir() and existing_category_dir.name not in expected_category_set:
        shutil.rmtree(existing_category_dir)

print("\nDone. Icons updated from inputZipManual and source cleaned.")

# Повторно собираем SVG и сравниваем со снимком до обновления.
existing_icons_after = collect_icon_paths(dst_root_path)
added_icons = sorted(set(existing_icons_after) - set(existing_icons_before))
removed_icons = sorted(set(existing_icons_before) - set(existing_icons_after))

# commitMessages.txt содержит две заготовки: для добавления новых иконок и для
# удаления старых. Удаления помечаются BREAKING CHANGE.
commit_messages_path = repo_root / "commitMessages.txt"
commit_messages_content = f"""feat(icons): add new icons

Added icons:
{format_list(added_icons, "- ")}


feat(icons): remove outdated icons

Removed icons:
{format_list(removed_icons, "BREAKING CHANGE: removed ")}
"""

commit_messages_path.write_text(commit_messages_content, encoding="utf-8")
