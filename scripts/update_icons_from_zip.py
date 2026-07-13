import argparse
import shutil
import sys
import zipfile

from icon_update_common import (
    DST_ROOT_PATH,
    REPO_ROOT,
    collect_icon_paths,
    copy_svg_files_to_category,
    fail_category_mismatch,
    read_category_config,
    remove_unknown_categories,
    safe_extract,
    write_commit_messages,
)


# В ручном сценарии внутри inputZipManual ожидаются папки категорий, а уже в
# каждой такой папке может лежать ZIP с SVG для этой категории.
source_path = REPO_ROOT / "inputZipManual"


def parse_args():
    # Аргументов пока нет; argparse нужен для стандартного --help и будущего
    # расширения без изменения точки входа.
    parser = argparse.ArgumentParser(
        description="Update public/icons from manual per-category ZIP files in inputZipManual."
    )
    return parser.parse_args()


def validate_source_directories(expected_categories):
    # Перед обработкой сверяем структуру ручного входа с icon-categories.json.
    # Скрипт должен видеть ровно те же категории, иначе можно случайно удалить
    # папку из public/icons или оставить категорию без обновления.
    if not source_path.is_dir():
        sys.exit(f"source path is not a directory: {source_path}")
    if not DST_ROOT_PATH.is_dir():
        sys.exit(f"destination path is not a directory: {DST_ROOT_PATH}")

    expected_category_values = [category["value"] for category in expected_categories]
    expected_category_set = set(expected_category_values)

    # Скрытые папки игнорируются, чтобы .DS_Store-подобные артефакты и
    # служебные директории не воспринимались как категории.
    manual_categories = sorted(
        item.name for item in source_path.iterdir() if item.is_dir() and not item.name.startswith(".")
    )
    manual_category_set = set(manual_categories)

    unexpected_manual_categories = sorted(manual_category_set - expected_category_set)
    missing_manual_categories = sorted(expected_category_set - manual_category_set)

    if unexpected_manual_categories or missing_manual_categories:
        fail_category_mismatch("inputZipManual", unexpected_manual_categories, missing_manual_categories)

    return expected_category_values, expected_category_set


def process_category(category_name):
    # Обрабатывает одну категорию: распаковывает первый ZIP, находит SVG,
    # заменяет соответствующую папку в public/icons и очищает входную папку.
    category_dir = source_path / category_name
    print(f"\n=== Processing category: {category_dir.name} ===")

    zip_files = sorted(category_dir.glob("*.zip"))
    if zip_files:
        # Если ZIP несколько, берется первый по имени. Структурная проверка выше
        # гарантирует только наличие папок категорий, а не количество архивов.
        zip_file = zip_files[0]
        print(f"Found ZIP: {zip_file.name}")
        try:
            with zipfile.ZipFile(zip_file, "r") as zip_ref:
                # safe_extract не дает архиву записать файлы за пределы папки
                # текущей категории.
                safe_extract(zip_ref, category_dir, f"Manual ZIP {zip_file.name}")
            print("Unpacked ZIP")
        except Exception as error:
            # Ошибка одной категории не останавливает весь ручной импорт: скрипт
            # продолжит остальные папки, а проблемная категория останется как
            # есть во входной директории для повторной проверки.
            print(f"Failed to extract {zip_file.name}: {error}")
            return
    else:
        print("No ZIP found in", category_dir.name)

    # SVG ищутся рекурсивно, потому что внутри ZIP часто бывают вложенные папки.
    # Фильтрация Rectangle* и нормализация имен выполняются при копировании.
    svg_files = list(category_dir.rglob("*.svg"))
    print(f"Found {len(svg_files)} SVG files")

    dst_dir = DST_ROOT_PATH / category_dir.name.strip()
    if dst_dir.exists():
        # Категория заменяется полностью, чтобы удаленные из источника иконки не
        # оставались в public/icons.
        shutil.rmtree(dst_dir)

    copy_svg_files_to_category(svg_files, dst_dir)
    clean_category_source(category_dir)


def clean_category_source(category_dir):
    # После успешной обработки папка категории очищается от ZIP и распакованных
    # SVG. .gitkeep возвращается, чтобы пустая директория оставалась в Git.
    for item in category_dir.iterdir():
        if item.name == ".gitkeep":
            continue
        try:
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except Exception as error:
            print(f"Could not delete {item}: {error}")

    (category_dir / ".gitkeep").touch()


def main():
    parse_args()

    # В ручном режиме нужны только value из icon-categories.json: имена папок в
    # inputZipManual уже должны совпадать с именами категорий public/icons.
    expected_categories = read_category_config()
    expected_category_values, expected_category_set = validate_source_directories(expected_categories)
    existing_icons_before = collect_icon_paths(DST_ROOT_PATH)

    for category_name in expected_category_values:
        process_category(category_name)

    remove_unknown_categories(expected_category_set)

    print("\nDone. Icons updated from inputZipManual and source cleaned.")

    # После обновления формируем commitMessages.txt с добавленными и удаленными
    # SVG, чтобы упростить подготовку коммитов.
    existing_icons_after = collect_icon_paths(DST_ROOT_PATH)
    write_commit_messages(existing_icons_before, existing_icons_after)


if __name__ == "__main__":
    main()
