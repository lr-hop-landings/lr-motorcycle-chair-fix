"""Package the exact plugin directory; never includes workbench tools or secrets."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

p = argparse.ArgumentParser()
p.add_argument('--plugin', required=True)
p.add_argument('--out', required=True)
a = p.parse_args()
source = Path(a.plugin).resolve(strict=True)
target = Path(a.out).resolve()
if source.name != 'lenremont-page-importer' or not (source / 'lenremont-page-importer.php').is_file():
    p.error('Expected the lenremont-page-importer plugin root')
if source == target or source in target.parents:
    p.error('Archive must be outside the plugin root')
allowed = {'assets', 'blocks', 'examples', 'includes', 'patterns'}
files = []
for item in source.rglob('*'):
    if item.is_symlink():
        p.error('Symlinks are not permitted in a release')
    if not item.is_file():
        continue
    relative = item.relative_to(source)
    if relative.parts[0] not in allowed and str(relative) not in {'lenremont-page-importer.php', 'README.md', 'AGENT-GUIDE.md', 'BLOCK-LIBRARY.md'}:
        continue
    if any(part.startswith('.') or part in {'node_modules', '__pycache__'} for part in relative.parts):
        p.error('Unexpected hidden/dependency file in plugin runtime')
    if item.suffix.lower() in {'.zip', '.sql', '.log', '.pem', '.key'}:
        p.error('Unexpected archive, log or secret in plugin runtime')
    files.append((item, Path(source.name) / relative))
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, 'x', compression=ZIP_DEFLATED) as archive:
    for item, relative in sorted(files):
        archive.write(item, relative.as_posix())
with ZipFile(target) as archive:
    if archive.testzip() is not None:
        raise RuntimeError('ZIP integrity check failed')
print(f'PASS {len(files)} files: {target}')
