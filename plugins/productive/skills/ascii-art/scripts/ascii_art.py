#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "pyfiglet>=1.0.2",
#     "pillow>=10.0.0",
# ]
# ///
"""ascii-art — convert English text or images into ASCII art.

Self-contained: run with `uv run --script ascii_art.py` and uv installs
pyfiglet + pillow into a throwaway env. Nothing to install by hand, which is
why this exists instead of shelling out to figlet/toilet/jp2a (those are Unix
packages with no reliable Windows build).

Text modes : figlet, toilet, lolcat, cowsay, box
Image modes: jp2a, chafa, braille
"""

from __future__ import annotations

import argparse
import colorsys
import json
import math
import os
import sys
import textwrap

RESET = "\033[0m"

# Box-drawing and Braille characters are outside the default Windows console
# codepage (cp874 on a Thai locale), which raises UnicodeEncodeError mid-render.
# Force UTF-8 on the streams so output is identical on every platform.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

# --------------------------------------------------------------------------
# Catalog — the single source of truth for what this script can do.
# `--list` prints it as JSON so the caller can build a menu without having to
# read this file or guess at option names.
# --------------------------------------------------------------------------

FONTS = {
    "standard": "ค่าเริ่มต้นของ figlet อ่านง่าย ใช้ได้ทุกงาน",
    "slant": "ตัวเอียง คลาสสิก",
    "big": "ตัวใหญ่ หนา อ่านชัด",
    "block": "ตัวอักษรบล็อกทึบ",
    "banner": "ตัวสูงทำจาก # เหมาะกับหัวข้อ",
    "banner3": "banner เวอร์ชันหนากว่า",
    "shadow": "มีเงาด้านล่าง",
    "ansi_shadow": "บล็อกทึบ + เงา ยอดนิยมที่สุดสำหรับ header",
    "doom": "สไตล์โลโก้เกม DOOM",
    "starwars": "สไตล์ Star Wars",
    "colossal": "ใหญ่มาก เต็มจอ",
    "3-d": "ตัวอักษรสามมิติ",
    "isometric1": "สามมิติแบบ isometric",
    "larry3d": "สามมิติโค้งมน",
    "epic": "ตัวหนาใหญ่แบบ fantasy",
    "bloody": "ตัวหยดเลือด สไตล์ horror",
    "poison": "ตัวหนามีขอบหนาม",
    "graffiti": "สไตล์พ่นสีข้างกำแพง",
    "script": "ลายมือเขียนหวัด",
    "small": "เล็ก กะทัดรัด เหมาะกับที่แคบ",
    "digital": "ตัวอักษรจอ LCD ในกรอบ",
    "electronic": "สไตล์วงจรอิเล็กทรอนิกส์",
    "cyberlarge": "สไตล์ futuristic ตัวใหญ่",
    "cybermedium": "futuristic ขนาดกลาง",
    "dos_rebel": "สไตล์ DOS ยุค 90",
    "delta_corps_priest_1": "ตัวหนา อลังการ",
    "sub-zero": "ตัวหนาสไตล์เกมต่อสู้",
    "elite": "สไตล์ hacker/demoscene",
    "pagga": "บล็อกเตี้ยแน่น (ฟอนต์เด่นของ toilet)",
    "bubble": "ตัวอักษรในวงกลม",
    "rounded": "ตัวมนกลม",
    "stop": "ตัวหนาแบบป้ายจราจร",
    "varsity": "สไตล์เสื้อทีมมหาวิทยาลัย",
    "georgia11": "ตัวเซอริฟใหญ่ หรูหรา",
    "speed": "ตัวเอียงแรง สื่อความเร็ว",
    "ghost": "ตัวโปร่งบางเบา",
    "gothic": "สไตล์กอธิก",
    "impossible": "ลวงตาแบบ MC Escher",
    "alligator": "ตัวหนามีลาย",
    "fire_font-k": "สไตล์เปลวไฟ",
    "the_edge": "ตัวคมมีมุม",
    "trek": "สไตล์ Star Trek",
    "puffy": "ตัวอ้วนนุ่ม",
    "wavy": "ตัวเป็นคลื่น",
}

COLORS = {
    "none": "ไม่ใส่สี — ASCII ล้วน",
    "rainbow": "ไล่สีรุ้งตามแนวทแยง (แบบ lolcat)",
    "pride": "แถบสีรุ้งแนวนอน ทีละบรรทัด (ฟิลเตอร์ gay ของ toilet)",
    "metal": "ไล่เทา→ฟ้าเงิน ดูเป็นโลหะ (ฟิลเตอร์ metal ของ toilet)",
    "fire": "ไล่แดง→ส้ม→เหลือง จากล่างขึ้นบน",
    "ocean": "ไล่น้ำเงินเข้ม→ฟ้าอ่อน",
    "matrix": "ไล่เขียวเข้ม→เขียวสว่าง",
    "gold": "ไล่ทองอำพัน",
    "red": "แดงล้วน",
    "green": "เขียวล้วน",
    "yellow": "เหลืองล้วน",
    "blue": "น้ำเงินล้วน",
    "magenta": "ม่วงบานเย็นล้วน",
    "cyan": "ฟ้าครามล้วน",
    "white": "ขาวล้วน",
    "image": "ใช้สีจริงจากรูปต้นฉบับ (เฉพาะโหมด jp2a)",
}

BORDERS = {
    "single": "─│┌┐└┘ เส้นเดี่ยว",
    "double": "═║╔╗╚╝ เส้นคู่",
    "rounded": "มุมโค้ง ╭╮╰╯",
    "bold": "เส้นหนา ┏┓┗┛",
    "ascii": "+-| ล้วน ปลอดภัยกับทุกเทอร์มินัล",
    "dots": "จุดไข่ปลา ┈┊",
    "stars": "ล้อมด้วย *",
    "hash": "ล้อมด้วย #",
}

RAMPS = {
    "classic": " .:-=+*#%@",
    "detailed": " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    "blocks": " ░▒▓█",
    "simple": " .*#@",
    "binary": " 01",
}

CHARACTERS = {
    "cow": r"""
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||""",
    "tux": r"""
   \
    \
        .--.
       |o_o |
       |:_/ |
      //   \ \
     (|     | )
    /'\_   _/`\
    \___)=(___/""",
    "dragon": r"""
      \                    / \  //\
       \    |\___/|      /   \//  \\
            /0  0  \__  /    //  | \ \
           /     /  \/_/    //   |  \  \
           @_^_@'/   \/_   //    |   \   \
           //_^_/     \/_ //     |    \    \
        ( //) |        \///      |     \     \
      ( / /) _|_ /   )  //       |      \     _\
    ( // /) '/,_ _ _/  ( ; -.    |    _ _\.-~        .-~~~^-.
  (( / / )) ,-{        _      `-.|.-~-.           .~         `.
 (( // / ))  '/\      /                 ~-. _ .-~      .-~^-.  \
 (( /// ))      `.   {            }                   /      \  \
  (( / ))     .----~-.\        \-'                 .~         \  `.
             ///.----..>        \             _ -~             `.  ^-.
               ///-._ _ _ _ _ _ _}^ - - - - ~                     ~-- ,.-~""",
    "stegosaurus": r"""
     \                             .       .
      \                           / `.   .' "
       \                  .---.  <    > <    >  .---.
        \                 |    \  \ - ~ ~ - /  /    |
              _____          ..-~             ~-..-~
             |     |   \~~~\.'                    `./~~~/
            ---------   \__/                        \__/
           .'  O    \     /               /       \  "
          (_____,    `._.'               |         }  \/~~~/
           `----.          /       }     |        /    \__/
                 `-.      |       /      |       /      `. ,~~|
                     ~-.__|      /_ - ~ ^|      /- _      `..-'
                          |     /        |     /     ~-.     `-. _  _  _
                          |_____|        |_____|         ~ - . _ _ _ _ _>""",
    "sheep": r"""
      \
       \
           __
          UooU\.'@@@@@@`.
          \__/(@@@@@@@@@@)
               (@@@@@@@@)
               `YY~~~~YY'
                ||    ||""",
    "ghost": r"""
      \
       \
        .-.
       (o o)
       | O \
        \   \
         `~~~'""",
    "bunny": r"""
     \
      \   \
           \ /\
           ( )
         .( o ).""",
    "turtle": r"""
      \                                  ___-------___
       \                             _-~~             ~~-_
        \                         _-~                    /~-_
               /^\__/^\         /~  \                   /    \
             /|  O|| O|        /      \_______________/        \
            | |___||__|      /       /                \          \
            |          \    /      /                    \          \
            |   (_______) /______/                        \_________ \
            |         / /         \                      /            \
             \         \^\\         \                  /               \     /
               \         ||           \______________/      _-_       //\__//
                 \       ||------_-~~-_ ------------- \ --/~   ~\    || __/
                   ~-----||====/~     |==================|       |/~~~~~
                    (_(__/  ./     /                    \_\      \.
                           (_(___/                         \_____)_)""",
}


def catalog() -> dict:
    return {
        "modes": {
            "figlet": {
                "input": "text",
                "desc": "แปลงข้อความเป็นตัวอักษรใหญ่ (banner) เลือกฟอนต์ได้ 571 แบบ",
                "options": ["--font", "--color", "--width"],
            },
            "toilet": {
                "input": "text",
                "desc": "banner + ฟิลเตอร์สีและกรอบ แบบเดียวกับคำสั่ง toilet",
                "options": ["--font", "--color", "--border", "--width"],
            },
            "lolcat": {
                "input": "text",
                "desc": "ระบายสีรุ้งทับข้อความธรรมดา (ไม่ขยายตัวอักษร)",
                "options": ["--color", "--width"],
            },
            "cowsay": {
                "input": "text",
                "desc": "ตัวการ์ตูนพูดข้อความในกรอบคำพูด",
                "options": ["--character", "--color", "--width"],
            },
            "box": {
                "input": "text",
                "desc": "ล้อมข้อความด้วยกรอบ",
                "options": ["--border", "--color", "--width", "--align"],
            },
            "jp2a": {
                "input": "image",
                "desc": "รูป → ASCII ตามระดับความสว่าง (เทียบเท่า jp2a)",
                "options": ["--ramp", "--color", "--width", "--invert"],
            },
            "chafa": {
                "input": "image",
                "desc": "รูป → บล็อกสีจริง 24-bit ความละเอียดสูงสุด (เทียบเท่า chafa)",
                "options": ["--width"],
            },
            "braille": {
                "input": "image",
                "desc": "รูป → อักขระ Braille ความละเอียดสูงกว่า jp2a 8 เท่าต่อตัวอักษร",
                "options": ["--color", "--width", "--invert", "--threshold"],
            },
        },
        "fonts": FONTS,
        "colors": COLORS,
        "borders": BORDERS,
        "ramps": {k: v for k, v in RAMPS.items()},
        "characters": {k: "" for k in CHARACTERS},
    }


# --------------------------------------------------------------------------
# Coloring
# --------------------------------------------------------------------------

SOLID = {
    "red": (255, 60, 60),
    "green": (60, 220, 60),
    "yellow": (255, 220, 60),
    "blue": (80, 130, 255),
    "magenta": (230, 80, 230),
    "cyan": (60, 220, 220),
    "white": (240, 240, 240),
}

GRADIENTS = {
    "fire": [(255, 240, 120), (255, 160, 30), (230, 60, 20)],
    "ocean": [(120, 230, 255), (40, 140, 240), (20, 50, 160)],
    "matrix": [(180, 255, 180), (60, 230, 90), (20, 110, 40)],
    "gold": [(255, 240, 170), (240, 190, 60), (170, 110, 20)],
    "metal": [(245, 245, 245), (150, 165, 185), (70, 95, 130)],
}


def _fg(rgb) -> str:
    return "\033[38;2;{};{};{}m".format(*rgb)


def _lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _gradient_at(stops, t):
    """Sample a multi-stop gradient at t in [0, 1]."""
    t = min(max(t, 0.0), 1.0)
    if len(stops) == 1:
        return stops[0]
    span = 1.0 / (len(stops) - 1)
    idx = min(int(t / span), len(stops) - 2)
    return _lerp(stops[idx], stops[idx + 1], (t - idx * span) / span)


def colorize(lines, color: str):
    """Apply a color scheme to already-rendered ASCII lines.

    Whitespace stays uncolored so the escape sequences don't bloat the output
    with codes nobody can see.
    """
    if color == "none" or not lines:
        return lines
    if color not in SOLID and color not in GRADIENTS and color not in ("rainbow", "pride"):
        die("ไม่รู้จักชุดสี '{}' — เลือกจาก: {}".format(color, ", ".join(COLORS)))

    if color in SOLID:
        rgb = SOLID[color]
        return [_fg(rgb) + ln + RESET if ln.strip() else ln for ln in lines]

    height = max(len(lines), 1)
    width = max((len(ln) for ln in lines), default=1)
    out = []

    for y, line in enumerate(lines):
        if not line.strip():
            out.append(line)
            continue
        buf = []
        prev = None
        for x, ch in enumerate(line):
            if ch == " ":
                if prev is not None:
                    buf.append(RESET)
                    prev = None
                buf.append(ch)
                continue

            if color == "rainbow":
                hue = ((x / max(width, 1)) * 1.4 + (y / height) * 0.5) % 1.0
                rgb = tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hue, 0.95, 1.0))
            elif color == "pride":
                # Horizontal bands: six stripes down the height of the block.
                hue = (math.floor(y / height * 6) / 6.0) % 1.0
                rgb = tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hue, 0.9, 1.0))
            elif color in GRADIENTS:
                t = y / max(height - 1, 1)
                if color == "fire":
                    t = 1.0 - t  # fire is brightest at the top
                rgb = _gradient_at(GRADIENTS[color], t)
            else:
                rgb = (240, 240, 240)

            if rgb != prev:
                buf.append(_fg(rgb))
                prev = rgb
            buf.append(ch)
        if prev is not None:
            buf.append(RESET)
        out.append("".join(buf))
    return out


# --------------------------------------------------------------------------
# Input validation — English only.
# FIGlet fonts define glyphs for ASCII 32-126 only. Thai (or any non-Latin)
# text renders as blank boxes, so failing loudly beats emitting garbage.
# --------------------------------------------------------------------------


def require_ascii(text: str):
    bad = sorted({ch for ch in text if ord(ch) > 126 and ch not in "\n\t"})
    if bad:
        sample = " ".join(bad[:12])
        die(
            "ข้อความมีอักขระที่ไม่ใช่ภาษาอังกฤษ: {}\n"
            "ฟอนต์ ASCII art รองรับเฉพาะ A-Z a-z 0-9 และเครื่องหมายพื้นฐานเท่านั้น\n"
            "กรุณาส่งข้อความเป็นภาษาอังกฤษ".format(sample)
        )


def die(msg: str, code: int = 2):
    print("error: " + msg, file=sys.stderr)
    sys.exit(code)


# --------------------------------------------------------------------------
# Text modes
# --------------------------------------------------------------------------


def render_figlet(text: str, font: str, width: int):
    import pyfiglet

    try:
        rendered = pyfiglet.figlet_format(text, font=font, width=width)
    except pyfiglet.FontNotFound:
        die(
            "ไม่พบฟอนต์ '{}' — ดูรายการฟอนต์ทั้งหมดด้วย --list-fonts".format(font)
        )
    lines = rendered.rstrip("\n").split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        die("ฟอนต์ '{}' ไม่มี glyph สำหรับข้อความนี้ ลองฟอนต์อื่น".format(font))
    return lines


def wrap_border(lines, style: str, align: str = "left", pad: int = 1):
    chars = {
        "single": "─│┌┐└┘",
        "double": "═║╔╗╚╝",
        "rounded": "─│╭╮╰╯",
        "bold": "━┃┏┓┗┛",
        "ascii": "-|++++",
        "dots": "┈┊┌┐└┘",
        "stars": "******" + "*",
        "hash": "######",
    }.get(style)
    if chars is None:
        die("ไม่รู้จักกรอบ '{}' — เลือกจาก: {}".format(style, ", ".join(BORDERS)))

    h, v, tl, tr, bl, br = chars[0], chars[1], chars[2], chars[3], chars[4], chars[5]
    inner = max((len(ln) for ln in lines), default=0)
    spacer = " " * pad

    def justify(ln):
        gap = inner - len(ln)
        if align == "center":
            left = gap // 2
            return " " * left + ln + " " * (gap - left)
        if align == "right":
            return " " * gap + ln
        return ln + " " * gap

    top = tl + h * (inner + pad * 2) + tr
    bottom = bl + h * (inner + pad * 2) + br
    body = [v + spacer + justify(ln) + spacer + v for ln in lines]
    return [top] + body + [bottom]


def render_cowsay(text: str, character: str, width: int):
    art = CHARACTERS.get(character)
    if art is None:
        die(
            "ไม่รู้จักตัวละคร '{}' — เลือกจาก: {}".format(
                character, ", ".join(CHARACTERS)
            )
        )

    wrapped = []
    for para in text.split("\n"):
        wrapped.extend(textwrap.wrap(para, max(width - 4, 10)) or [""])
    inner = max(len(ln) for ln in wrapped)

    bubble = [" " + "_" * (inner + 2)]
    if len(wrapped) == 1:
        bubble.append("< {} >".format(wrapped[0].ljust(inner)))
    else:
        for i, ln in enumerate(wrapped):
            left, right = ("/", "\\") if i == 0 else (
                ("\\", "/") if i == len(wrapped) - 1 else ("|", "|")
            )
            bubble.append("{} {} {}".format(left, ln.ljust(inner), right))
    bubble.append(" " + "-" * (inner + 2))

    return bubble + art.strip("\n").split("\n")


# --------------------------------------------------------------------------
# Image modes
# --------------------------------------------------------------------------

# Terminal cells are roughly twice as tall as they are wide, so vertical
# sampling gets halved to keep the picture from stretching.
CELL_ASPECT = 0.5


def load_image(path: str):
    from PIL import Image, ImageOps

    if not os.path.isfile(path):
        die("ไม่พบไฟล์รูป: {}".format(path))
    try:
        img = Image.open(path)
    except Exception as exc:  # noqa: BLE001 - surface PIL's message verbatim
        die("เปิดรูปไม่ได้: {}".format(exc))
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
        img = Image.alpha_composite(bg, img)
    return img.convert("RGB")


def fit(img, width: int, vscale: float = CELL_ASPECT):
    w, h = img.size
    height = max(int(round(width * (h / w) * vscale)), 1)
    from PIL import Image

    return img.resize((width, height), Image.LANCZOS)


def render_jp2a(path: str, width: int, ramp_name: str, invert: bool, color: str):
    ramp = RAMPS.get(ramp_name)
    if ramp is None:
        die("ไม่รู้จัก ramp '{}' — เลือกจาก: {}".format(ramp_name, ", ".join(RAMPS)))
    if invert:
        ramp = ramp[::-1]

    img = fit(load_image(path), width)
    gray = img.convert("L")
    px = gray.load()
    rgb = img.load()
    steps = len(ramp) - 1

    lines = []
    colored = color == "image"
    for y in range(img.height):
        buf = []
        prev = None
        for x in range(img.width):
            ch = ramp[round(px[x, y] / 255 * steps)]
            if colored:
                c = rgb[x, y]
                if c != prev:
                    buf.append(_fg(c))
                    prev = c
            buf.append(ch)
        if colored:
            buf.append(RESET)
        lines.append("".join(buf))

    # `--color image` already painted per-pixel; anything else falls through to
    # the shared colorizer below.
    return lines, colored


def render_chafa(path: str, width: int):
    """Half-block rendering: '▀' paints the top pixel as foreground and the
    bottom pixel as background, so one cell carries two pixels of vertical
    resolution."""
    img = fit(load_image(path), width, vscale=1.0)
    if img.height % 2:
        from PIL import Image

        img = img.resize((img.width, img.height + 1), Image.LANCZOS)
    px = img.load()

    lines = []
    for y in range(0, img.height, 2):
        buf = []
        prev_top = prev_bot = None
        for x in range(img.width):
            top = px[x, y]
            bot = px[x, y + 1]
            # Flat regions (sky, background) repeat the same pair for dozens of
            # cells; re-emitting the escape only on change shrinks the output
            # several-fold without changing a single rendered pixel.
            if top != prev_top:
                buf.append("\033[38;2;{};{};{}m".format(*top))
                prev_top = top
            if bot != prev_bot:
                buf.append("\033[48;2;{};{};{}m".format(*bot))
                prev_bot = bot
            buf.append("▀")
        buf.append(RESET)
        lines.append("".join(buf))
    return lines


BRAILLE_DOTS = [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2), (0, 3), (1, 3)]


def render_braille(path: str, width: int, invert: bool, threshold: int):
    """Braille cells hold a 2x4 dot matrix, giving 8x the detail of one ASCII
    character. Floyd-Steinberg dithering keeps gradients readable at 1 bit."""
    from PIL import Image

    img = load_image(path)
    w, h = img.size
    cols = width
    rows = max(int(round(cols * (h / w) * CELL_ASPECT)), 1)
    img = img.resize((cols * 2, rows * 4), Image.LANCZOS).convert("L")

    if threshold >= 0:
        img = img.point(lambda v: 255 if v >= threshold else 0, mode="L")
    else:
        img = img.convert("1")  # Floyd-Steinberg by default

    px = img.load()
    lines = []
    for ry in range(rows):
        buf = []
        for rx in range(cols):
            bits = 0
            for i, (dx, dy) in enumerate(BRAILLE_DOTS):
                lit = px[rx * 2 + dx, ry * 4 + dy] > 127
                if invert:
                    lit = not lit
                if lit:
                    bits |= 1 << i
            buf.append(chr(0x2800 + bits))
        lines.append("".join(buf).rstrip() or " ")
    return lines


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------


def build_parser():
    p = argparse.ArgumentParser(
        prog="ascii-art",
        description="แปลงข้อความภาษาอังกฤษหรือรูปภาพเป็น ASCII art",
    )
    p.add_argument("--mode", help="figlet|toilet|lolcat|cowsay|box|jp2a|chafa|braille")
    p.add_argument("--text", help="ข้อความ (ภาษาอังกฤษเท่านั้น)")
    p.add_argument("--image", help="path ของไฟล์รูป")
    p.add_argument("--font", default="standard", help="ชื่อฟอนต์ figlet")
    p.add_argument("--color", default="none", help="ชื่อชุดสี (ดู --list)")
    p.add_argument("--border", default="single", help="สไตล์กรอบ")
    p.add_argument("--character", default="cow", help="ตัวละครสำหรับ cowsay")
    p.add_argument("--ramp", default="classic", help="ชุดอักขระไล่ความสว่างของ jp2a")
    p.add_argument("--align", default="left", choices=["left", "center", "right"])
    p.add_argument("--width", type=int, default=80, help="ความกว้างสูงสุด (คอลัมน์)")
    p.add_argument("--invert", action="store_true", help="กลับด้านมืด/สว่าง")
    p.add_argument(
        "--threshold",
        type=int,
        default=-1,
        help="เกณฑ์ 0-255 สำหรับ braille (ไม่ใส่ = ใช้ dithering)",
    )
    p.add_argument("--list", action="store_true", help="พิมพ์ catalog เป็น JSON")
    p.add_argument("--list-fonts", nargs="?", const="", help="พิมพ์ฟอนต์ทั้งหมด (กรองด้วยคำค้นได้)")
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)

    if args.list:
        print(json.dumps(catalog(), ensure_ascii=False, indent=2))
        return 0

    if args.list_fonts is not None:
        import pyfiglet

        names = sorted(pyfiglet.FigletFont.getFonts())
        if args.list_fonts:
            needle = args.list_fonts.lower()
            names = [n for n in names if needle in n.lower()]
        print("\n".join(names))
        print("\n({} ฟอนต์)".format(len(names)), file=sys.stderr)
        return 0

    if not args.mode:
        die("ต้องระบุ --mode (ดูตัวเลือกทั้งหมดด้วย --list)")

    mode = args.mode.lower()
    text_modes = {"figlet", "toilet", "lolcat", "cowsay", "box"}
    image_modes = {"jp2a", "chafa", "braille"}

    if mode in text_modes:
        if not args.text:
            die("โหมด '{}' ต้องใช้ --text".format(mode))
        require_ascii(args.text)
    elif mode in image_modes:
        if not args.image:
            die("โหมด '{}' ต้องใช้ --image".format(mode))
    else:
        die(
            "ไม่รู้จักโหมด '{}' — เลือกจาก: {}".format(
                mode, ", ".join(sorted(text_modes | image_modes))
            )
        )

    if args.width < 10 or args.width > 400:
        die("--width ต้องอยู่ระหว่าง 10 ถึง 400")

    color = args.color.lower()
    pre_colored = False

    if mode == "figlet":
        lines = render_figlet(args.text, args.font, args.width)
    elif mode == "toilet":
        lines = render_figlet(args.text, args.font, args.width - 4)
        # Border first, then color: wrap_border measures len() and ANSI escapes
        # would inflate those counts into a crooked frame.
        lines = wrap_border(lines, args.border, args.align)
        if color == "none":
            color = "rainbow"  # toilet's whole point is the color filter
    elif mode == "lolcat":
        lines = args.text.split("\n")
        if color == "none":
            color = "rainbow"
    elif mode == "cowsay":
        lines = render_cowsay(args.text, args.character, args.width)
    elif mode == "box":
        body = []
        for para in args.text.split("\n"):
            body.extend(textwrap.wrap(para, max(args.width - 4, 10)) or [""])
        lines = wrap_border(body, args.border, args.align)
    elif mode == "jp2a":
        lines, pre_colored = render_jp2a(
            args.image, args.width, args.ramp, args.invert, color
        )
    elif mode == "chafa":
        lines = render_chafa(args.image, args.width)
        pre_colored = True
    else:  # braille
        lines = render_braille(args.image, args.width, args.invert, args.threshold)

    if not pre_colored:
        lines = colorize(lines, color)

    # Terminal only, by design: the point of this skill is seeing the art the
    # moment it runs. Writing a file would just hand back a path to go open.
    sys.stdout.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
