import os
import re
import json
import shutil
import sys
import zipfile
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
source_path = repo_root / "inputZipManual"
dst_root_path = repo_root / "public" / "icons"
category_config_path = repo_root / "icon-categories.json"

if not source_path.is_dir():
    sys.exit(f"source path is not a directory: {source_path}")
if not dst_root_path.is_dir():
    sys.exit(f"destination path is not a directory: {dst_root_path}")


def read_category_config():
    with category_config_path.open(encoding="utf-8") as config_file:
        categories = json.load(config_file)

    if not isinstance(categories, list):
        sys.exit("icon-categories.json must contain an array.")

    values = []
    for index, category in enumerate(categories):
        value = category.get("value") if isinstance(category, dict) else None
        if not isinstance(value, str) or not value.strip():
            sys.exit(f"icon-categories.json item {index} is missing value.")
        values.append(value)

    return values


def fail_category_mismatch(source, unexpected, missing):
    lines = [
        f"Icon category list changed in {source}. Update icon-categories.json first.",
        f"Unexpected categories: {', '.join(unexpected) if unexpected else 'none'}",
        f"Missing categories: {', '.join(missing) if missing else 'none'}",
    ]
    sys.exit("\n".join(lines))


def collect_icon_paths(root: Path):
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*.svg"))


def format_list(items, prefix):
    if not items:
        return "- none"
    return "\n".join(f"{prefix}{item}" for item in items)

def normalize_file_name(fileName):
    ret = fileName.strip()
    ret = re.sub(r'\s+', ' ', ret)
    ret = re.sub(r' \.svg$','.svg', ret)
    return ret

def skip_file(fileName):
    return fileName.startswith("Rectangle")

expected_categories = read_category_config()
expected_category_set = set(expected_categories)
manual_categories = sorted(item.name for item in source_path.iterdir() if item.is_dir() and not item.name.startswith("."))
manual_category_set = set(manual_categories)
unexpected_manual_categories = sorted(manual_category_set - expected_category_set)
missing_manual_categories = sorted(expected_category_set - manual_category_set)

if unexpected_manual_categories or missing_manual_categories:
    fail_category_mismatch("inputZipManual", unexpected_manual_categories, missing_manual_categories)

existing_icons_before = collect_icon_paths(dst_root_path)

for category_name in expected_categories:
    category_dir = source_path / category_name
    print(f"\n=== Processing category: {category_dir.name} ===")

    # 1. Поиск zip-файла
    zip_files = list(category_dir.glob("*.zip"))
    if zip_files:
        zip_file = zip_files[0]
        print(f"Found ZIP: {zip_file.name}")
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(category_dir)
            print("Unpacked ZIP")
        except Exception as e:
            print(f"Failed to extract {zip_file.name}: {e}")
            continue
    else:
        print("No ZIP found in", category_dir.name)

    # 2. Поиск SVG после распаковки
    svg_files = list(category_dir.rglob("*.svg"))
    print(f"Found {len(svg_files)} SVG files")

    # 3. Папка назначения
    dst_dir = dst_root_path / category_dir.name.strip()
    dst_dir.mkdir(parents=True, exist_ok=True)

    # 4. Удаляем старые SVG в целевой папке
    for old_svg in dst_dir.rglob("*.svg"):
        old_svg.unlink()

    # 5. Копируем и переименовываем
    for file in svg_files:
        if skip_file(file.name):
            continue
        new_name = normalize_file_name(file.name)
        dst_file = dst_dir / new_name
        dst_file.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, dst_file)

    # 6. Очистка исходной папки
    for item in category_dir.iterdir():
        if item.name == ".gitkeep":
            continue
        try:
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except Exception as e:
            print(f"⚠️ Could not delete {item}: {e}")

for existing_category_dir in dst_root_path.iterdir():
    if existing_category_dir.is_dir() and existing_category_dir.name not in expected_category_set:
        shutil.rmtree(existing_category_dir)

print("\nDone. Icons updated from inputZipManual and source cleaned.")

existing_icons_after = collect_icon_paths(dst_root_path)
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
