import argparse
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

# Корень репозитория вычисляется относительно текущего скрипта, чтобы запуск
# работал из любой директории, а не только из корня проекта.
repo_root = Path(__file__).resolve().parent.parent

# inputZip должен содержать ровно один ZIP, экспортированный из Pixso Icons Plugin.
source_path = repo_root / "inputZip"

# В эту директорию попадает актуальный набор SVG, который использует сайт/пакет.
dst_root_path = repo_root / "public" / "icons"

# Конфиг задает связь между внутренним названием категории и названием фрейма в Pixso.
category_config_path = repo_root / "icon-categories.json"

# Временная папка нужна, чтобы сначала безопасно распаковать ZIP, проверить его
# содержимое, и только после этого перезаписывать public/icons.
tmp_extract_path = repo_root / ".tmp" / "pixso-plugin-icons"


def parse_args():
    # Сейчас у скрипта нет аргументов, но argparse оставлен для единообразного
    # CLI-интерфейса и понятного описания при запуске с --help.
    parser = argparse.ArgumentParser(
        description="Update public/icons from a single Pixso Icons Plugin ZIP in inputZip."
    )
    return parser.parse_args()


def read_category_config():
    # Загружаем список категорий из JSON. Ожидается массив объектов вида:
    # {"value": "category-folder-name", "pixsoFrameName": "Pixso frame name"}.
    with category_config_path.open(encoding="utf-8") as config_file:
        categories = json.load(config_file)

    # Если структура конфига неожиданно изменилась, дальнейшая синхронизация
    # может удалить или разложить иконки не туда, поэтому завершаем работу сразу.
    if not isinstance(categories, list):
        sys.exit("icon-categories.json must contain an array.")

    # normalized_categories возвращается в минимальном ожидаемом формате,
    # values и pixso_frame_names нужны для проверки дублей.
    normalized_categories = []
    values = set()
    pixso_frame_names = set()

    for index, category in enumerate(categories):
        # Каждый элемент должен быть объектом, чтобы ниже безопасно читать поля.
        if not isinstance(category, dict):
            sys.exit(f"icon-categories.json item {index} must be an object.")

        value = category.get("value")
        pixso_frame_name = category.get("pixsoFrameName")

        # value становится именем директории внутри public/icons.
        if not isinstance(value, str) or not value.strip():
            sys.exit(f"icon-categories.json item {index} is missing value.")

        # pixsoFrameName должен совпадать с названием верхнеуровневой папки/фрейма
        # в ZIP, который экспортирует Pixso Icons Plugin.
        if not isinstance(pixso_frame_name, str) or not pixso_frame_name.strip():
            sys.exit(f"icon-categories.json item {index} is missing pixsoFrameName.")

        # Дубли в value приведут к перезаписи одной и той же папки назначения.
        if value in values:
            sys.exit(f"icon-categories.json contains duplicate value: {value}")

        # Дубли в pixsoFrameName означают, что один фрейм Pixso мапится на две
        # категории, и результат копирования станет неоднозначным.
        if pixso_frame_name in pixso_frame_names:
            sys.exit(f"icon-categories.json contains duplicate pixsoFrameName: {pixso_frame_name}")

        values.add(value)
        pixso_frame_names.add(pixso_frame_name)
        normalized_categories.append({"value": value, "pixsoFrameName": pixso_frame_name})

    return normalized_categories


def fail_category_mismatch(unexpected, missing):
    # Единое сообщение для случая, когда набор фреймов в ZIP не совпадает с
    # icon-categories.json. Это защищает от тихого удаления/пропуска категорий.
    lines = [
        "Icon category list changed in Pixso Plugin ZIP. Update icon-categories.json first.",
        f"Unexpected categories: {', '.join(unexpected) if unexpected else 'none'}",
        f"Missing categories: {', '.join(missing) if missing else 'none'}",
    ]
    sys.exit("\n".join(lines))


def collect_icon_paths(root: Path):
    # Возвращаем относительные пути всех SVG. Такой список удобно сравнивать
    # до и после обновления, чтобы сформировать commitMessages.txt.
    if not root.is_dir():
        return []
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*.svg"))


def format_list(items, prefix):
    # commitMessages.txt должен оставаться читаемым даже если добавлений или
    # удалений нет, поэтому для пустого списка явно пишем "- none".
    if not items:
        return "- none"
    return "\n".join(f"{prefix}{item}" for item in items)


def normalize_file_name(file_name):
    # Pixso иногда добавляет лишние пробелы в имена файлов. Нормализация делает
    # имена стабильными, чтобы не плодить "новые" иконки из-за пробелов.
    ret = file_name.strip()
    # Несколько пробельных символов внутри имени схлопываются в один пробел.
    ret = re.sub(r"\s+", " ", ret)
    # Убираем пробел перед расширением: "icon .svg" -> "icon.svg".
    ret = re.sub(r" \.svg$", ".svg", ret)
    return ret


def skip_file(file_name):
    # Rectangle: технические слои/заглушки из Pixso, их не нужно публиковать
    # как иконки.
    return file_name.startswith("Rectangle")


def get_single_zip_file():
    # Скрипт рассчитан на один полный ZIP из Pixso Icons Plugin. Если ZIP-файлов
    # нет или их несколько, непонятно какой источник считать актуальным.
    if not source_path.is_dir():
        sys.exit(f"source path is not a directory: {source_path}")

    zip_files = sorted(source_path.glob("*.zip"))
    if len(zip_files) != 1:
        sys.exit(
            f"inputZip must contain exactly one .zip file from Pixso Icons Plugin. Found: {len(zip_files)}"
        )

    return zip_files[0]


def is_ignored_zip_entry(parts):
    # Игнорируем системные артефакты macOS и скрытые верхнеуровневые записи,
    # чтобы они не ломали проверку списка категорий.
    return not parts or parts[0] == "__MACOSX" or parts[0].startswith(".")


def get_zip_entries(zip_ref, include_dirs=False):
    entries = []

    for info in zip_ref.infolist():
        # По умолчанию нужны только файлы. Для проверки верхнеуровневых фреймов
        # передаем include_dirs=True, чтобы директории тоже попали в анализ.
        if info.is_dir() and not include_dirs:
            continue

        # Path(...).parts разбивает путь из ZIP на компоненты. Пустые и текущие
        # директории отбрасываем, чтобы дальше сравнивать чистые имена.
        parts = [part for part in Path(info.filename).parts if part not in ("", ".")]
        if is_ignored_zip_entry(parts):
            continue

        entries.append((info, parts))

    return entries


def safe_extract(zip_ref, target_dir):
    target_dir.mkdir(parents=True, exist_ok=True)
    target_root = target_dir.resolve()

    for info in zip_ref.infolist():
        # Проверяем каждый путь до распаковки: файл из ZIP не должен выйти за
        # пределы target_dir через "../" или абсолютный путь.
        destination = (target_dir / info.filename).resolve()
        if target_root != destination and target_root not in destination.parents:
            sys.exit(f"Pixso Plugin ZIP contains unsafe path: {info.filename}")

    # Распаковываем только после проверки всех путей.
    zip_ref.extractall(target_dir)


def validate_zip_structure(zip_ref, categories):
    # Ожидаемые верхнеуровневые папки берутся из pixsoFrameName, потому что ZIP
    # из плагина группирует иконки по фреймам Pixso.
    expected_frames = {category["pixsoFrameName"] for category in categories}
    entries = get_zip_entries(zip_ref, include_dirs=True)
    top_level_names = {parts[0] for _, parts in entries}

    # Любое расхождение означает, что в Pixso поменяли категории, а конфиг еще
    # не обновлен. В таком случае лучше остановиться, чем удалить часть иконок.
    unexpected_frames = sorted(top_level_names - expected_frames)
    missing_frames = sorted(expected_frames - top_level_names)
    if unexpected_frames or missing_frames:
        fail_category_mismatch(unexpected_frames, missing_frames)


def validate_extracted_icons(categories):
    # Подготавливаем словари по каждому ожидаемому фрейму: список файлов для
    # копирования и множество нормализованных имен для проверки дублей.
    expected_frames = {category["pixsoFrameName"] for category in categories}
    svg_files_by_frame = {frame_name: [] for frame_name in expected_frames}
    normalized_names_by_frame = {frame_name: set() for frame_name in expected_frames}

    for frame_name in expected_frames:
        frame_dir = tmp_extract_path / frame_name
        # Отсутствие директории уже должно быть поймано validate_zip_structure,
        # но оставляем защиту на случай нестандартной структуры архива.
        if not frame_dir.is_dir():
            continue

        for svg_file in sorted(frame_dir.rglob("*.svg")):
            # Сохраняем рядом исходный путь и нормализованное имя: копировать
            # нужно исходный файл, а в public/icons класть уже стабильное имя.
            normalized_name = normalize_file_name(svg_file.name)
            if skip_file(normalized_name):
                continue

            # После нормализации два разных файла могут получить одно имя.
            # Например, "add.svg" и " add .svg" стали бы конфликтом.
            if normalized_name in normalized_names_by_frame[frame_name]:
                sys.exit(
                    f"Pixso Plugin ZIP contains duplicate SVG after normalization in {frame_name}: {normalized_name}"
                )

            normalized_names_by_frame[frame_name].add(normalized_name)
            svg_files_by_frame[frame_name].append((svg_file, normalized_name))

    # Каждая категория должна содержать хотя бы одну публикуемую SVG-иконку.
    # Иначе можно случайно стереть целую категорию в public/icons.
    empty_frames = sorted(frame_name for frame_name, entries in svg_files_by_frame.items() if not entries)
    if empty_frames:
        sys.exit(
            "Pixso Plugin ZIP categories must contain at least one SVG after filtering skipped files.\n"
            f"Empty categories: {', '.join(empty_frames)}"
        )

    return svg_files_by_frame


def write_commit_messages(existing_icons_before, existing_icons_after):
    # Сравниваем снапшоты public/icons до и после обновления. Пути относительные,
    # поэтому diff подходит напрямую для текста будущих commit-сообщений.
    added_icons = sorted(set(existing_icons_after) - set(existing_icons_before))
    removed_icons = sorted(set(existing_icons_before) - set(existing_icons_after))

    commit_messages_path = repo_root / "commitMessages.txt"
    commit_messages_content = f"""feat(icons): add new icons

Added icons:
{format_list(added_icons, "- ")}


feat(icons): remove outdated icons

Removed icons:
{format_list(removed_icons, "BREAKING CHANGE: removed ")}
"""

    commit_messages_path.write_text(commit_messages_content, encoding="utf-8")


def update_icons(categories, svg_files_by_frame):
    dst_root_path.mkdir(parents=True, exist_ok=True)

    # expected_category_values нужен ниже, чтобы удалить из public/icons папки,
    # которых больше нет в icon-categories.json.
    expected_category_values = {category["value"] for category in categories}
    existing_icons_before = collect_icon_paths(dst_root_path)

    for category in categories:
        category_name = category["value"]
        frame_name = category["pixsoFrameName"]
        dst_dir = dst_root_path / category_name

        # Категория обновляется атомарно на уровне папки: сначала удаляем старый
        # набор SVG, затем создаем папку заново и копируем актуальные файлы.
        if dst_dir.exists():
            shutil.rmtree(dst_dir)
        dst_dir.mkdir(parents=True)

        # Копируем с copy2, чтобы сохранить метаданные файла там, где это возможно.
        for svg_file, normalized_name in svg_files_by_frame[frame_name]:
            shutil.copy2(svg_file, dst_dir / normalized_name)

        print(f"Updated {category_name} from Pixso frame {frame_name}")

    # Если категорию удалили из конфига, соответствующую папку тоже удаляем из
    # public/icons, чтобы результат полностью соответствовал icon-categories.json.
    for existing_category_dir in dst_root_path.iterdir():
        if existing_category_dir.is_dir() and existing_category_dir.name not in expected_category_values:
            shutil.rmtree(existing_category_dir)

    # После копирования формируем подсказку для двух коммитов: добавленные и
    # удаленные иконки отдельно.
    existing_icons_after = collect_icon_paths(dst_root_path)
    write_commit_messages(existing_icons_before, existing_icons_after)


def clean_input_zip():
    # После успешного обновления очищаем inputZip, чтобы при следующем запуске
    # случайно не переиспользовать старый архив.
    source_path.mkdir(parents=True, exist_ok=True)

    for item in source_path.iterdir():
        # .gitkeep оставляем, чтобы пустая директория сохранялась в репозитории.
        if item.name == ".gitkeep":
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()

    (source_path / ".gitkeep").touch()


def main():
    # parse_args вызывается даже без аргументов, чтобы argparse обработал --help
    # и будущие CLI-опции в одном месте.
    parse_args()

    categories = read_category_config()
    zip_file = get_single_zip_file()

    # Удаляем временную папку от предыдущего неудачного запуска, если она осталась.
    if tmp_extract_path.exists():
        shutil.rmtree(tmp_extract_path)

    try:
        with zipfile.ZipFile(zip_file, "r") as zip_ref:
            # Сначала проверяем набор категорий в ZIP, затем безопасно распаковываем.
            validate_zip_structure(zip_ref, categories)
            safe_extract(zip_ref, tmp_extract_path)

        # После распаковки проверяем SVG, обновляем public/icons и очищаем inputZip.
        svg_files_by_frame = validate_extracted_icons(categories)
        update_icons(categories, svg_files_by_frame)
        clean_input_zip()
    finally:
        # Временная папка удаляется и при успехе, и при ошибке.
        if tmp_extract_path.exists():
            shutil.rmtree(tmp_extract_path)

    print("\nDone. Icons updated from Pixso Plugin ZIP.")


if __name__ == "__main__":
    main()
