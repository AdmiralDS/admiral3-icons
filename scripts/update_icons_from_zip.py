import os
import re
import shutil
import sys
import zipfile
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
source_path = repo_root / "inputZip"
dst_root_path = repo_root / "public" / "icons"

if not source_path.is_dir():
    sys.exit(f"source path is not a directory: {source_path}")
if not dst_root_path.is_dir():
    sys.exit(f"destination path is not a directory: {dst_root_path}")


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

existing_icons_before = collect_icon_paths(dst_root_path)

for category_dir in source_path.iterdir():
    if not category_dir.is_dir():
        continue
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

print("\nDone. Icons updated from inputZip and source cleaned.")

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
