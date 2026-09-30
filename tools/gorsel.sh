#!/bin/sh
# Headless Edge ile PNG üretir, ardından Python/Pillow ile ICO ve küçük boyutlar.
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
cek() { "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=$2,$3 --virtual-time-budget=2000 --default-background-color=00000000 --screenshot="$(cygpath -w "$PWD/$4")" "file:///$(cygpath -m "$PWD/tools/$1")" 2>/dev/null; }
cek og.html 1200 630 public/og.png
cek ikon.html 512 512 tools/_ikon.png
cek ikon-kare.html 512 512 public/icon-512.png
python - <<'PY'
from PIL import Image
im = Image.open("tools/_ikon.png").convert("RGBA")
im.resize((192,192), Image.LANCZOS).save("public/favicon-192.png")
im.resize((48,48), Image.LANCZOS).save("public/favicon-48.png")
Image.open("public/icon-512.png").convert("RGB").resize((180,180), Image.LANCZOS).save("public/apple-touch-icon.png")
im.save("public/favicon.ico", sizes=[(16,16),(32,32),(48,48)])
PY
rm -f tools/_ikon.png
ls -la public/*.png public/*.ico
