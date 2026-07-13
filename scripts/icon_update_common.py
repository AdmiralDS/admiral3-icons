import json
import re
import shutil
import sys
from pathlib import Path


# Корень репозитория вычисляется относительно этого файла, чтобы скрипты можно
# было запускать из любой текущей директории.
REPO_ROOT = Path(__file__).resolve().parent.parent
CATEGORY_CONFIG_PATH = REPO_ROOT / "icon-categories.json"
DST_ROOT_PATH = REPO_ROOT / "public" / "icons"
COMMIT_MESSAGES_PATH = REPO_ROOT / "commitMessages.txt"


def read_category_config(require_pixso_frame_name=False):
    """Читает и валидирует список категорий иконок.

    icon-categories.json является единственным источником правды для набора
    категорий. В обычном ручном режиме достаточно поля value, а для ZIP из
    Pixso-плагина дополнительно требуется pixsoFrameName, потому что категории
    внутри архива называются по именам фреймов Pixso.
    """
    with CATEGORY_CONFIG_PATH.open(encoding="utf-8") as config_file:
        categories = json.load(config_file)

    # Конфиг должен быть массивом объектов, чтобы порядок категорий был
    # стабильным и мог использоваться при последовательной обработке папок.
    if not isinstance(categories, list):
        sys.exit("icon-categories.json must contain an array.")

    normalized_categories = []
    values = set()
    pixso_frame_names = set()

    for index, category in enumerate(categories):
        if not isinstance(category, dict):
            sys.exit(f"icon-categories.json item {index} must be an object.")

        # value — имя папки в public/icons. Пустые и повторяющиеся значения
        # запрещены, иначе одна категория могла бы перезаписать другую.
        value = category.get("value")
        if not isinstance(value, str) or not value.strip():
            sys.exit(f"icon-categories.json item {index} is missing value.")
        if value in values:
            sys.exit(f"icon-categories.json contains duplicate value: {value}")

        normalized_category = {"value": value}

        pixso_frame_name = category.get("pixsoFrameName")
        if require_pixso_frame_name:
            # pixsoFrameName нужен только для автоматического импорта из одного
            # ZIP: по нему скрипт сопоставляет верхнеуровневые папки архива с
            # внутренними категориями дизайн-системы.
            if not isinstance(pixso_frame_name, str) or not pixso_frame_name.strip():
                sys.exit(f"icon-categories.json item {index} is missing pixsoFrameName.")
            if pixso_frame_name in pixso_frame_names:
                sys.exit(f"icon-categories.json contains duplicate pixsoFrameName: {pixso_frame_name}")
            pixso_frame_names.add(pixso_frame_name)
            normalized_category["pixsoFrameName"] = pixso_frame_name

        values.add(value)
        normalized_categories.append(normalized_category)

    return normalized_categories


def fail_category_mismatch(source, unexpected, missing):
    # Единый текст ошибки для случаев, когда источник импорта содержит другой
    # набор категорий, чем icon-categories.json. Скрипт останавливается, чтобы
    # не удалить или не пропустить категорию молча.
    lines = [
        f"Icon category list changed in {source}. Update icon-categories.json first.",
        f"Unexpected categories: {', '.join(unexpected) if unexpected else 'none'}",
        f"Missing categories: {', '.join(missing) if missing else 'none'}",
    ]
    sys.exit("\n".join(lines))


def collect_icon_paths(root: Path):
    # Собирает относительные пути всех SVG до и после обновления. Эти списки
    # используются только для commitMessages.txt: так видно, какие иконки были
    # добавлены или удалены.
    if not root.is_dir():
        return []
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*.svg"))


def format_list(items, prefix):
    # Форматирует список для commitMessages.txt. Для удалений prefix содержит
    # BREAKING CHANGE, чтобы итоговое сообщение можно было использовать в
    # conventional commits.
    if not items:
        return "- none"
    return "\n".join(f"{prefix}{item}" for item in items)


def normalize_file_name(file_name):
    # Нормализация исправляет типичные артефакты экспорта:
    # - лишние пробелы по краям;
    # - несколько пробелов подряд внутри имени;
    # - пробел перед расширением ".svg".
    # Содержимое SVG при этом не меняется.
    ret = file_name.strip()
    ret = re.sub(r"\s+", " ", ret)
    ret = re.sub(r" \.svg$", ".svg", ret)
    return ret


def skip_file(file_name):
    # Pixso/Figma иногда экспортируют технические прямоугольники-подложки.
    # Они не являются иконками, поэтому файлы Rectangle* не копируются.
    return file_name.startswith("Rectangle")


def safe_extract(zip_ref, target_dir, source_name):
    # Защита от Zip Slip: перед распаковкой проверяем каждый путь из архива.
    # Если внутри ZIP есть имя вроде ../../some-file, оно могло бы записать файл
    # за пределы target_dir. В таком случае импорт прерывается.
    target_dir.mkdir(parents=True, exist_ok=True)
    target_root = target_dir.resolve()

    for info in zip_ref.infolist():
        destination = (target_dir / info.filename).resolve()
        if target_root != destination and target_root not in destination.parents:
            sys.exit(f"{source_name} contains unsafe path: {info.filename}")

    zip_ref.extractall(target_dir)


def copy_svg_files_to_category(svg_files, dst_dir):
    # Полностью наполняет одну категорию SVG-файлами из переданного списка.
    # Имена нормализуются уже при копировании, поэтому проверка дублей тоже идет
    # по нормализованным именам.
    dst_dir.mkdir(parents=True, exist_ok=True)

    normalized_names = set()
    copied_count = 0

    for svg_file in sorted(svg_files):
        normalized_name = normalize_file_name(svg_file.name)
        if skip_file(normalized_name):
            continue
        if normalized_name in normalized_names:
            # Два разных исходных файла могут превратиться в одно имя после
            # нормализации, например "Icon  .svg" и "Icon .svg". Это опасно,
            # потому что один файл перезаписал бы другой.
            sys.exit(f"Duplicate SVG after normalization in {dst_dir.name}: {normalized_name}")

        normalized_names.add(normalized_name)
        shutil.copy2(svg_file, dst_dir / normalized_name)
        copied_count += 1

    return copied_count


def remove_unknown_categories(expected_category_values):
    # Удаляет из public/icons папки категорий, которых больше нет в конфиге.
    # Это синхронизирует результат с icon-categories.json, а не только добавляет
    # новые файлы поверх старой структуры.
    if not DST_ROOT_PATH.is_dir():
        return

    for existing_category_dir in DST_ROOT_PATH.iterdir():
        if existing_category_dir.is_dir() and existing_category_dir.name not in expected_category_values:
            shutil.rmtree(existing_category_dir)


def write_commit_messages(existing_icons_before, existing_icons_after):
    # Генерирует заготовки commit message на основе разницы файлов до и после
    # импорта. Измененные SVG здесь не перечисляются: логика фиксирует именно
    # добавления и удаления путей.
    added_icons = sorted(set(existing_icons_after) - set(existing_icons_before))
    removed_icons = sorted(set(existing_icons_before) - set(existing_icons_after))

    commit_messages_content = f"""feat(icons): add new icons

Added icons:
{format_list(added_icons, "- ")}


feat(icons): remove outdated icons

Removed icons:
{format_list(removed_icons, "BREAKING CHANGE: removed ")}
"""

    COMMIT_MESSAGES_PATH.write_text(commit_messages_content, encoding="utf-8")
