#!/usr/bin/env bash
# ascii-art — entry point for the ascii-art skill.
#
# Wraps ascii_art.py, which declares its dependencies inline (PEP 723) so
# `uv run --script` builds a throwaway env on demand. That keeps the skill
# self-contained: no figlet/toilet/jp2a install, no pip, no venv to maintain.
#
# Usage:
#   ascii-art.sh --mode figlet --text "Hello" --font slant --color rainbow
#   ascii-art.sh --mode chafa --image ./photo.png --width 100
#   ascii-art.sh --list
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PY_SCRIPT="$SCRIPT_DIR/ascii_art.py"

if [ ! -f "$PY_SCRIPT" ]; then
  echo "error: ไม่พบ $PY_SCRIPT" >&2
  exit 1
fi

if command -v uv >/dev/null 2>&1; then
  exec uv run --quiet --script "$PY_SCRIPT" "$@"
fi

# No uv: fall back to a Python that already has pyfiglet and pillow. Probing
# each candidate for the imports (not just for existence) matters on Windows,
# where `python`/`python3` are often Microsoft Store alias stubs that exist on
# PATH but cannot run anything.
for PY in python3 py python; do
  if command -v "$PY" >/dev/null 2>&1 &&
     "$PY" -c "import pyfiglet, PIL" >/dev/null 2>&1; then
    exec "$PY" "$PY_SCRIPT" "$@"
  fi
done

cat >&2 <<'EOF'
error: ต้องมี uv เพื่อรัน skill นี้ (แนะนำ) หรือ Python ที่ติดตั้ง pyfiglet + pillow ไว้แล้ว

ติดตั้ง uv:
  Windows : winget install astral-sh.uv
  macOS   : brew install uv
  Linux   : curl -LsSf https://astral.sh/uv/install.sh | sh

หรือติดตั้ง dependency ตรงๆ:
  pip install pyfiglet pillow
EOF
exit 1
