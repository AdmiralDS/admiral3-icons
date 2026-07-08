import argparse
import shutil
import sys
import zipfile
from pathlib import Path

from icon_update_common import (
    DST_ROOT_PATH,
    REPO_ROOT,
    collect_icon_paths,
    copy_svg_files_to_category,
    fail_category_mismatch,
    normalize_file_name,
    read_category_config,
    remove_unknown_categories,
    safe_extract,
    skip_file,
    write_commit_messages,
)


# В этот каталог пользователь кладет ровно один ZIP, экспортированный
# Pixso Icons Plugin.
source_path = REPO_ROOT / "inputZip"

# Временная папка для распаковки. Она удаляется в finally, чтобы не оставлять
# промежуточные файлы после успешного импорта или ошибки.
tmp_extract_path = REPO_ROOT / ".tmp" / "pixso-plugin-icons"


def parse_args():
    # Сейчас у скрипта нет параметров, но argparse оставлен для единообразного
    # CLI-интерфейса и нормального вывода --help.
    parser = argparse.ArgumentParser(
        description="Update public/icons from a single Pixso Icons Plugin ZIP in inputZip."
    )
    return parser.parse_args()


def get_single_zip_file():
    # Автоматический сценарий ожидает один архив. Если ZIP несколько, скрипт не
    # угадывает нужный, чтобы случайно не смешать разные экспорты.
    if not source_path.is_dir():
        sys.exit(f"source path is not a directory: {source_path}")

    zip_files = sorted(source_path.glob("*.zip"))
    if len(zip_files) != 1:
        sys.exit(
            f"inputZip must contain exactly one .zip file from Pixso Icons Plugin. Found: {len(zip_files)}"
        )

    return zip_files[0]


def is_ignored_zip_entry(parts):
    # Служебные папки macOS и скрытые файлы не должны участвовать в проверке
    # структуры архива и в сопоставлении категорий.
    return not parts or parts[0] == "__MACOSX" or parts[0].startswith(".")


def get_zip_entries(zip_ref, include_dirs=False):
    # Возвращает записи архива вместе с разобранными компонентами пути.
    # include_dirs нужен при проверке верхнего уровня: там важны и папки, и
    # файлы, потому что любое имя первого уровня считается потенциальной
    # категорией Pixso-фрейма.
    entries = []

    for info in zip_ref.infolist():
        if info.is_dir() and not include_dirs:
            continue

        # Path(...).parts дает кортеж компонентов пути. Пустые элементы и "."
        # отбрасываются, чтобы одинаково обработать разные формы ZIP-путей.
        parts = [part for part in Path(info.filename).parts if part not in ("", ".")]
        if is_ignored_zip_entry(parts):
            continue

        entries.append((info, parts))

    return entries


def validate_zip_structure(zip_ref, categories):
    # Верхний уровень ZIP должен в точности совпадать с pixsoFrameName из
    # icon-categories.json. Это ловит ситуации, когда в Pixso переименовали,
    # добавили или удалили фрейм, но конфиг еще не обновили.
    expected_frames = {category["pixsoFrameName"] for category in categories}
    entries = get_zip_entries(zip_ref, include_dirs=True)
    top_level_names = {parts[0] for _, parts in entries}

    unexpected_frames = sorted(top_level_names - expected_frames)
    missing_frames = sorted(expected_frames - top_level_names)
    if unexpected_frames or missing_frames:
        fail_category_mismatch("Pixso Plugin ZIP", unexpected_frames, missing_frames)


def validate_extracted_icons(categories):
    # После безопасной распаковки собираем SVG по каждому Pixso-фрейму и снова
    # проверяем дубли уже на уровне файлов. Здесь мы работаем с реальной
    # файловой системой, потому что SVG могут лежать во вложенных папках.
    expected_frames = {category["pixsoFrameName"] for category in categories}
    svg_files_by_frame = {frame_name: [] for frame_name in expected_frames}
    normalized_names_by_frame = {frame_name: set() for frame_name in expected_frames}

    for frame_name in expected_frames:
        frame_dir = tmp_extract_path / frame_name
        if not frame_dir.is_dir():
            continue

        for svg_file in sorted(frame_dir.rglob("*.svg")):
            normalized_name = normalize_file_name(svg_file.name)
            if skip_file(normalized_name):
                continue

            if normalized_name in normalized_names_by_frame[frame_name]:
                # Проверка нужна до копирования в public/icons: иначе один SVG
                # мог бы незаметно перезаписать другой в той же категории.
                sys.exit(
                    f"Pixso Plugin ZIP contains duplicate SVG after normalization in {frame_name}: {normalized_name}"
                )

            normalized_names_by_frame[frame_name].add(normalized_name)
            svg_files_by_frame[frame_name].append(svg_file)

    # Категория без SVG почти всегда означает ошибку экспорта или неверный
    # фрейм. Скрипт не создает пустые категории, а просит исправить источник.
    empty_frames = sorted(frame_name for frame_name, entries in svg_files_by_frame.items() if not entries)
    if empty_frames:
        sys.exit(
            "Pixso Plugin ZIP categories must contain at least one SVG after filtering skipped files.\n"
            f"Empty categories: {', '.join(empty_frames)}"
        )

    return svg_files_by_frame


def update_icons(categories, svg_files_by_frame):
    # Основной шаг синхронизации: каждая категория полностью удаляется и
    # создается заново из текущего ZIP. Так старые иконки, которых больше нет в
    # экспорте, не остаются в public/icons.
    DST_ROOT_PATH.mkdir(parents=True, exist_ok=True)

    expected_category_values = {category["value"] for category in categories}
    existing_icons_before = collect_icon_paths(DST_ROOT_PATH)

    for category in categories:
        category_name = category["value"]
        frame_name = category["pixsoFrameName"]
        dst_dir = DST_ROOT_PATH / category_name

        if dst_dir.exists():
            shutil.rmtree(dst_dir)

        # frame_name связывает имя фрейма из Pixso с именем категории в
        # репозитории: например, "System icons" -> "system".
        copy_svg_files_to_category(svg_files_by_frame[frame_name], dst_dir)
        print(f"Updated {category_name} from Pixso frame {frame_name}")

    remove_unknown_categories(expected_category_values)

    existing_icons_after = collect_icon_paths(DST_ROOT_PATH)
    write_commit_messages(existing_icons_before, existing_icons_after)


def clean_input_zip():
    # После успешного обновления входная папка очищается, чтобы следующий запуск
    # требовал новый ZIP и не переиспользовал старый экспорт по ошибке.
    source_path.mkdir(parents=True, exist_ok=True)

    for item in source_path.iterdir():
        if item.name == ".gitkeep":
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()

    (source_path / ".gitkeep").touch()


def main():
    parse_args()

    # Для Pixso ZIP требуется pixsoFrameName, потому что именно эти имена
    # должны совпасть с верхнеуровневыми папками архива.
    categories = read_category_config(require_pixso_frame_name=True)
    zip_file = get_single_zip_file()

    if tmp_extract_path.exists():
        shutil.rmtree(tmp_extract_path)

    try:
        with zipfile.ZipFile(zip_file, "r") as zip_ref:
            # Сначала проверяем структуру архива без записи файлов, затем
            # распаковываем его безопасным способом во временную папку.
            validate_zip_structure(zip_ref, categories)
            safe_extract(zip_ref, tmp_extract_path, "Pixso Plugin ZIP")

        svg_files_by_frame = validate_extracted_icons(categories)
        update_icons(categories, svg_files_by_frame)
        clean_input_zip()
    finally:
        # Временная папка удаляется даже при ошибке, чтобы не загрязнять рабочее
        # дерево частично распакованными файлами.
        if tmp_extract_path.exists():
            shutil.rmtree(tmp_extract_path)

    print("\nDone. Icons updated from Pixso Plugin ZIP.")


if __name__ == "__main__":
    main()
