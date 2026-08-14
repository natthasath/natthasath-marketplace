# Lifecycle & Distribution

หมวดนี้ต้องมีเกือบทุก CLI ที่แจกจ่ายให้คนอื่นติดตั้งใช้ (ไม่ใช่ internal script ใช้คนเดียว) — สำคัญเป็นพิเศษ
เพราะเป็นหมวดที่กำหนดว่า "รองรับ Windows/Linux/macOS จริงไหม"

## Version / Compatibility

- `-V/--version` ต้องมีเสมอ และควรตาม semver (`MAJOR.MINOR.PATCH`)
- ถ้า tool มี config/state ที่ persist ข้าม version ต้องคิดเรื่อง forward/backward compatibility ของ schema
  — codex `--strict-config` (error ทันทีถ้าเจอ field ที่เวอร์ชันนี้ไม่รู้จัก) เป็นตัวอย่างของการทำให้
  incompatibility เห็นชัดทันที แทนที่จะ silent-ignore แล้วพฤติกรรมเพี้ยนแบบเงียบๆ

## Update / Upgrade

เลือกวิธีใดวิธีหนึ่งให้สอดคล้องกับช่องทางแจกจ่าย ไม่ใช่ทำทั้งคู่แบบขัดกัน:
- **Self-update command** (เช่น `codex update`) — เหมาะกับ tool ที่แจกจ่ายเป็น standalone binary/npm global
  install ที่ไม่ได้ผูกกับ system package manager
- **ปล่อยให้ package manager จัดการ** (`apt`/`brew`/`winget`/`choco`) — เหมาะกับ tool ที่แจกผ่าน
  distro/package repo อยู่แล้ว ไม่ควรมี self-update ซ้อนเพราะจะขัดกับการจัดการ dependency ของ package
  manager นั้น

## Shell Completion

ต้องรองรับ **ทั้ง POSIX shell และ PowerShell** ถ้าประกาศว่ารองรับ Windows — codex `completion [SHELL]`
รองรับ `bash, elvish, fish, powershell, zsh` ครบ (default `bash` ถ้าไม่ระบุ) นี่คือมาตรฐานขั้นต่ำที่ควรมี
ถ้า tool มี completion เลย: **ห้ามลืม powershell** เพราะเป็น shell หลักบน Windows ไม่ใช่ bash-compatible

## Uninstall / Cleanup

**Gap ที่เจอจริงใน codex: ไม่มี `uninstall` subcommand เลย** — สังเกตได้ว่าบาง tool ตั้งใจข้ามหมวดนี้เพราะ
ปล่อยให้ package manager ที่ติดตั้งมา (npm/brew/...) เป็นคนจัดการถอนการติดตั้งแทน ซึ่งเป็นทางเลือกที่ valid

**แต่ถ้า tool เขียน config/state ไว้นอก package manager's tracking** (เช่น `~/.codex/`, cache, session
files) **ต้องมีทางล้างข้อมูลเหล่านั้นด้วย** ไม่ว่าจะเป็น subcommand ของตัวเอง (`tool cleanup`/`tool uninstall`)
หรืออย่างน้อยเอกสารบอก path ทั้งหมดที่ต้องลบเองไว้ชัดเจน — ไม่งั้นผู้ใช้ uninstall ผ่าน package manager แล้ว
ยังมีไฟล์ค้างอยู่โดยไม่รู้ตัว

## Cross-Platform Path/Env Handling

ประเด็นสำคัญที่สุดสำหรับโจทย์ "รองรับ Windows, Linux, macOS":

- **Home directory**: `$HOME` (Linux/macOS) vs `%USERPROFILE%` (Windows) — ใช้ library ของภาษานั้นๆ หา home
  dir แทนอ่าน env var ตรงๆ (เช่น Rust `dirs` crate, Go `os.UserHomeDir()`, Python `pathlib.Path.home()`,
  Node `os.homedir()`) เพื่อไม่ต้องเขียน branch ต่อ OS เอง
- **Path separator**: ใช้ path-joining API ของภาษา (`path.join`, `filepath.Join`, `Path`/`PathBuf`) ไม่ใช่
  ต่อ string ด้วย `/` หรือ `\` ตรงๆ
- **Config location convention**: โดยทั่วไปควรเก็บที่ `~/.config/<tool>/` บน Linux/macOS ตาม XDG spec และ
  `%APPDATA%\<tool>\` บน Windows — หรือถ้าอยากง่ายกว่า ใช้ library ที่ resolve ให้อัตโนมัติ (Rust `directories`
  crate, Node `env-paths`, Python `platformdirs`) แทนเขียน logic เองทุกภาษา
- **Line ending / encoding**: ถ้า tool เขียนไฟล์ text ให้ผู้ใช้แก้ต่อ ระวัง CRLF (Windows) vs LF (Unix) โดย
  เฉพาะถ้า repo เดียวกันมีคนใช้ทั้งสอง OS ร่วมกัน
