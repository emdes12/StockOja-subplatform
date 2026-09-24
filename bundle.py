#!/usr/bin/env python3
import os
import shutil
import zipfile

def create_bundle():
    project_root = os.path.dirname(os.path.abspath(__file__))
    zip_filename = "stockoja-commerce-platform.zip"
    output_path = os.path.join(project_root, zip_filename)
    public_dir = os.path.join(project_root, "public")
    os.makedirs(public_dir, exist_ok=True)
    public_output_path = os.path.join(public_dir, zip_filename)

    exclude_dirs = {
        "node_modules",
        "dist",
        ".git",
        ".cache",
        "__pycache__",
        ".aistudio",
        ".tmp",
        "tmp"
    }

    exclude_files = {
        ".DS_Store",
        "Thumbs.db",
        zip_filename
    }

    file_count = 0
    print(f"📦 Bundling StockỌja Commerce Platform into {zip_filename}...")

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_root):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]

            for f in files:
                if f in exclude_files or f.endswith(".zip") or f.endswith(".tar.gz") or f.endswith(".pyc"):
                    continue

                abs_file_path = os.path.join(root, f)
                rel_path = os.path.relpath(abs_file_path, project_root)

                # Skip if file is inside public and is the zip itself
                if rel_path == os.path.join("public", zip_filename):
                    continue

                zipf.write(abs_file_path, rel_path)
                file_count += 1

    # Copy to public folder for static Vite serving
    shutil.copyfile(output_path, public_output_path)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Successfully bundled {file_count} files into {zip_filename} ({size_kb:.1f} KB)")
    print(f"📍 Root archive: {output_path}")
    print(f"📍 Public archive: {public_output_path}")

if __name__ == "__main__":
    create_bundle()
