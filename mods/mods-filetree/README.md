# 🎉 mods-filetree

An IDE-style file tree for Claude Code that shows what Claude is doing and where in files. This mod is a fork of [data-goblin/claude-code-filetree](https://github.com/data-goblin/claude-code-filetree) 0.8.2 by Kurt Buhler, under the MIT License (see [`LICENSE`](LICENSE) and [`ACKNOWLEDGEMENTS.md`](ACKNOWLEDGEMENTS.md)); its design and behaviour are the original's, renamed to `mods-filetree` so it installs from this marketplace.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-filetree` | file tree แบบ IDE ในแถบด้านข้าง หน้าตาและการทำงานเหมือน filetree 0.8.2 ทุกอย่าง — tree ของ cwd หรือโฟลเดอร์ที่ pin ไว้ พร้อมคอลัมน์ Git, size, line count และ date; ค้นชื่อไฟล์และเนื้อหา (git grep / grep -r) แบบ case/regex; ไฟล์ที่ Claude อ่าน/เขียน/commit shimmer ใน tree พร้อม auto-collapse; guard ไฟล์/โฟลเดอร์จากการแก้ของ Claude และเตือนไฟล์ที่เขียนนอก repo; split preview โค้ด, Markdown, รูป, เฟรมวิดีโอ, PDF และ Word; treemap; diff; jump แบบ zoxide; เลือกหลายแถวส่งเป็น context; เปิดไฟล์ด้วยแอป default, editor ใน tmux/herdr หรือคำสั่งที่ตั้งเอง |

รายละเอียดแต่ละส่วนอยู่ใน [`docs/`](docs): [tree](docs/tree.md), [search](docs/search.md), [git](docs/git.md), [activity](docs/activity.md), [context](docs/context.md), [preview & treemap](docs/preview-treemap.md), [diff](docs/diff.md), [open](docs/open.md), [guards](docs/guards.md), [keys](docs/keys.md), [sidebar](docs/sidebar.md)

### 🏆 Usage

```
/mods-filetree
```

`/mods-filetree` เปิด/ปิดแผง, `/mods-filetree <path>` เปิดที่โฟลเดอร์นั้น, `/mods-filetree open` เปิดค้างไว้, `/mods-filetree keys` ตั้ง alt+l / alt+h ให้ย้ายคีย์บอร์ดเข้า-ออก tree — กด `?` ในแผงเพื่อดูคีย์ลัดทั้งหมด

ใช้คู่กับ `filetree@claude-code-filetree` ได้โดยคำสั่งไม่ชนกัน (ต้นฉบับใช้ `/filetree`) แต่ถ้าเปิดทั้งคู่จะมีแผง file tree สองแผง ในเอกสาร `docs/` คำสั่งยังเขียนว่า `/filetree` ใน mod นี้ให้ใช้ `/mods-filetree`

### ⚙️ Config

ตั้งค่าทั้งหมดได้ใน `/config` หัวข้อ mods-filetree — ชุดเดียวกับ filetree: Claude activity, Activity shimmer, Follow Claude, Jump moves Claude, Right-click copies, Follow work, Open at start, Focus on open, Right column (date/age/size/loc/files), Date format, Clock, Long file, Remote branch, Hints, Search spacing, Column headers, Auto-collapse, Shortcuts, Open with, Binary files, Edit with, Diff with, Diff groups, Terminal target, Ignore, Preview pane, Treemap, Palette และ Glyphs

### 📦 Install

```
/plugin install mods-filetree@natthasath-marketplace
```

ต้องใช้ Claude Code 2.1.306 ขึ้นไปและ git; ตัวเลือกเสริม: inotify-tools (Linux), ImageMagick หรือ ffmpeg, pdftoppm หรือ gs, soffice, pandoc และ pdftotext, tmux หรือ herdr, Nerd Fonts 3.2+
