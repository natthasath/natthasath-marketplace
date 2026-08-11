---
name: os-design
description: >
  สัมภาษณ์ผู้ใช้เพื่อสร้างหรืออัปเดต my-setup.md ซึ่งเป็น reference ส่วนตัวที่บอก Claude ว่าระบบของผู้ใช้มีโครงสร้างอย่างไร
  ครอบคลุม Windows 11, macOS, Linux — drive layout, partition, important paths, naming convention, software ที่ใช้ และ shared conventions
  ใช้ skill นี้ทันทีเมื่อผู้ใช้พูดถึง "โครงสร้าง OS", "บอก Claude เรื่อง setup", "my-setup", "อัปเดต setup",
  "จด drive layout", "บันทึก path ที่ใช้", "ตั้งค่า naming convention", "สอน Claude เรื่องเครื่องฉัน"
  เรียกใช้ผ่าน `/utility:os-design` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
disable-model-invocation: true
---

# OS Design — สัมภาษณ์และสร้าง os-profile.md

## บทบาท
คุณทำหน้าที่เป็นผู้ช่วยที่สัมภาษณ์ผู้ใช้เพื่อทำความเข้าใจโครงสร้าง OS และ workflow ส่วนตัวของพวกเขา
เป้าหมายคือสร้างไฟล์ `os-profile.md` (ตำแหน่งตาม path จาก Step 0) ที่ skill อื่นๆ ใน plugin utility จะใช้เป็น context

## ขั้นตอนการทำงาน

### Step 0: ตรวจสอบ Save Path

## Config File
บันทึก path ที่ผู้ใช้กำหนดไว้ที่: `~/.config/claude-utility/settings.json`

รูปแบบ:
```json
{
  "os_profile_path": "/path/to/os-profile.md"
}
```

## ขั้นตอนตรวจสอบ path (ทำก่อนทุกครั้ง)
1. อ่านไฟล์ `~/.config/claude-utility/settings.json`
2. ถ้า **ไม่มีไฟล์** (ใช้ครั้งแรก) → ถามผู้ใช้ว่าต้องการบันทึก `os-profile.md` ที่ folder ไหน พร้อมบอก default ว่า `~/.claude/claude-utility/os-profile.md` แล้ว **สร้าง config file** บันทึก path ที่เลือก จากนั้นดำเนินการต่อ

   > **ทำไมไม่ default ไปที่โฟลเดอร์ของ plugin เอง:** plugin ที่ติดตั้งจริงจะถูกเก็บไว้ใต้ `~/.claude/plugins/cache/<marketplace>/utility/<version>/` — path นี้เปลี่ยนทุกครั้งที่อัปเดต version และไฟล์ทั้งโฟลเดอร์จะถูกแทนที่/ลบตอน reinstall ถ้าเก็บ os-profile.md (ข้อมูลส่วนตัวของผู้ใช้) ไว้ในนั้น ข้อมูลจะหายเมื่อ plugin อัปเดต จึงต้องเก็บไว้ในตำแหน่งที่ผู้ใช้เป็นเจ้าของและคงอยู่ข้าม version แทน
3. ถ้า **มีไฟล์แล้ว** → ใช้ `os_profile_path` จาก config โดยตรง ไม่ต้องถามซ้ำ

## เปลี่ยน Save Path
trigger เมื่อผู้ใช้พูดถึง: "เปลี่ยน path", "บันทึกที่อื่น", "set profile path", "ย้าย os-profile" หรือคล้ายกัน

ขั้นตอน:
1. แสดง path ปัจจุบันจาก config (ถ้ามี)
2. ถามว่าต้องการเปลี่ยนเป็น path ใด
3. อัปเดต `~/.config/claude-utility/settings.json` ด้วย path ใหม่
4. ยืนยันว่าเปลี่ยนสำเร็จและแสดง path ใหม่

---

### Step 1: ตรวจสอบสถานะ

ก่อนเริ่ม ให้ตรวจสอบว่าไฟล์ที่ `os_profile_path` (จาก config ใน Step 0) มีอยู่แล้วหรือไม่

- **ถ้ายังไม่มี** → แจ้งผู้ใช้ว่าจะเริ่มสร้างใหม่ ดำเนินการ Phase 1 ทั้งหมด
- **ถ้ามีแล้ว** → ถามผู้ใช้:
  > "พบ os-profile.md เดิมอยู่แล้ว ต้องการ:
  > 1. อัปเดตเฉพาะบางส่วน (ระบุว่าส่วนไหน)
  > 2. เขียนใหม่ทั้งหมด"

### Step 2: เลือก OS ที่จะ configure

ถามผู้ใช้ว่าต้องการ configure OS ใด:
> "ต้องการ configure OS ใดบ้าง?
> 1. Windows 11
> 2. macOS
> 3. Linux Ubuntu
> 4. ทั้งหมด"

จากนั้นดำเนินการถาม Phase ที่เกี่ยวข้องตามที่ผู้ใช้เลือก

---

## Phase A: Windows 11

### A1 — Drive Layout
```
Windows ของคุณมีกี่ Drive? แต่ละ Drive (C:, D:, E: ฯลฯ) ใช้ทำอะไรบ้าง?
ตัวอย่าง:
- C: → ระบบปฏิบัติการ + โปรแกรม
- D: → Projects และ Code
- E: → ไฟล์ส่วนตัว Media, Backup
```

### A2 — Important Paths
```
มี Path สำคัญที่ใช้บ่อยใน Windows ไหม?
ตัวอย่าง: D:\code\, C:\Users\username\Documents\, E:\backup\
```

### A3 — Development Setup (ถ้ามี)
```
ใช้ tool พวกนี้ใน Windows ไหม?
- WSL (Windows Subsystem for Linux) — ถ้าใช้ distro อะไร?
- Package manager (winget, chocolatey, scoop)?
- Runtime managers (nvm, pyenv, sdkman)?
```

---

## Phase B: macOS

### B1 — Disk Layout
```
Mac มี external drive หรือ volume เพิ่มเติมไหม นอกจาก Macintosh HD?
ถ้ามี แต่ละอันใช้ทำอะไร?
```

### B2 — Important Paths
```
มี path สำคัญในเครื่อง Mac ไหม?
ตัวอย่าง: ~/Developer/, ~/Projects/, ~/Documents/Work/
```

### B3 — Development Setup
```
ใช้ tool พวกนี้ใน Mac ไหม?
- Homebrew?
- Runtime managers (nvm, pyenv, rbenv, mise)?
- Container (Docker Desktop, OrbStack)?
- Terminal ที่ใช้ (Terminal, iTerm2, Warp)?
- Shell ที่ใช้ (zsh, bash, fish)?
```

---

## Phase C: Linux Ubuntu Desktop 24.04

### C1 — Partition Layout
```
Ubuntu partition เป็นยังไง?
ตัวอย่าง:
- / (root) → 50GB
- /home → 200GB
- swap → 8GB
- /data → external drive
```

### C2 — Important Paths
```
มี path สำคัญที่ใช้บ่อยใน Ubuntu ไหม?
ตัวอย่าง: ~/projects/, /opt/, /mnt/data/
```

### C3 — Development Setup
```
ใช้ tool พวกนี้ใน Ubuntu ไหม?
- Package manager เพิ่มเติม (snap, flatpak, nix)?
- Runtime managers?
- Desktop Environment (GNOME, KDE, อื่นๆ)?
- Terminal ที่ใช้ (GNOME Terminal, Kitty, Alacritty)?
```

---

## Phase D: Naming Convention

อ่าน `references/naming-conventions.md` ก่อน แล้วนำตัวอย่างมาแสดงให้ผู้ใช้เห็นขณะถาม

### D1 — Folder Naming
```
ชื่อ folder ทั่วไปใช้ style ไหน?
(แสดงตัวอย่างจาก naming-conventions.md)

ตัวอย่าง: kebab-case → my-project-folder
          snake_case → my_project_folder
          PascalCase → MyProjectFolder
```

### D2 — File Naming
```
ชื่อไฟล์ทั่วไปใช้ style ไหน? แยกตามประเภทไฟล์ได้เลย
เช่น:
- Code files: ?
- Config files: ?
- Document files: ?
- Log/Backup files: ?
```

### D3 — Project Naming
```
ชื่อ project (repo) ใช้ style ไหน?
มี prefix/suffix พิเศษไหม?
ตัวอย่าง: [company]-[project]-[type] → acme-website-api
```

### D4 — Branch & Commit
```
ถ้าใช้ Git มี convention สำหรับ branch name และ commit message ไหม?
ตัวอย่าง branch: feature/user-auth, fix/login-bug
ตัวอย่าง commit: feat(auth): add JWT validation
```

### D5 — Environment Variables & Constants
```
ตัวแปร constant หรือ ENV variable ใช้ style ไหน?
ส่วนใหญ่จะเป็น SCREAMING_SNAKE_CASE แต่มี exception ไหม?
```

---

## Phase E: Software Inventory

### E1 — Cross-Platform Software
```
Software ที่ใช้บนทุก OS (หรือหลาย OS) มีอะไรบ้าง?
ตัวอย่าง: VSCode, Docker, Git, Obsidian, 1Password
```

### E2 — OS-Specific Software
```
Software ที่ใช้เฉพาะบาง OS มีอะไรบ้าง?
- Windows only: ?
- macOS only: ?
- Ubuntu only: ?
```

---

## Phase F: Shared Conventions

### F1 — Project Location
```
Projects/Code อยู่ที่ path ไหนในแต่ละ OS?
- Windows: ?
- macOS: ?
- Ubuntu: ?
```

### F2 — Backup Strategy
```
มี backup strategy ไหม?
ตัวอย่าง: Time Machine, external drive, cloud (iCloud, Google Drive, OneDrive)
```

### F3 — Sync Between Machines
```
ซิงค์ไฟล์ระหว่างเครื่องยังไง?
ตัวอย่าง: Git, cloud storage, Syncthing, ไม่ได้ซิงค์
```

---

## Step 3: สร้าง my-setup.md

หลังจากถามครบทุก Phase ที่ผู้ใช้เลือกแล้ว สร้างไฟล์ที่ `<os_profile_path จาก Step 0>`
โดยใช้โครงสร้างนี้:

```markdown
# My Personal Setup Reference
_Last updated: YYYY-MM-DD_

## Overview
[สรุป OS ที่ใช้และบทบาทของแต่ละเครื่อง]

---

## Windows 11
### Drive Layout
| Drive | Label | Purpose |
|-------|-------|---------|
| C:\   |       |         |

### Important Paths
| Path | Purpose |
|------|---------|

### Development Setup
[รายละเอียด tools]

### Notes
[ข้อสังเกตพิเศษ]

---

## macOS (Mac Mini M4)
[โครงสร้างเดียวกัน]

---

## Linux Ubuntu Desktop 24.04
### Partition Layout
| Partition | Mount | Size | Purpose |
|-----------|-------|------|---------|

### Important Paths
[...]

### Development Setup
[...]

---

## Naming Conventions

### Folders
- Style ที่ใช้: [style]
- ตัวอย่าง: [example]

### Files
| ประเภทไฟล์ | Style | ตัวอย่าง |
|-----------|-------|---------|

### Projects (Repos)
- Pattern: [pattern]
- ตัวอย่าง: [example]

### Git
- Branch: [pattern]
- Commit: [pattern]

### Constants / ENV
- Style: [style]

---

## Software

### Cross-Platform
| Software | Windows | macOS | Ubuntu | Notes |
|----------|---------|-------|--------|-------|

### OS-Specific
**Windows only:**
**macOS only:**
**Ubuntu only:**

---

## Shared Conventions

### Project Locations
| OS | Path |
|----|------|

### Backup Strategy
[รายละเอียด]

### Sync Between Machines
[รายละเอียด]
```

---

## หลักการสำคัญ

- **ถามทีละ Phase** อย่าถามทีเดียวทุก Phase — ทำให้ user ล้นข้อมูล
- **แสดงตัวอย่างเสมอ** ก่อนถาม โดยเฉพาะ naming convention — อ่านจาก `references/naming-conventions.md`
- **ยืดหยุ่น** ถ้า user บอกว่าไม่มีหรือไม่ใช้บาง section ให้ข้ามไปได้
- **สรุปก่อน save** หลังถามครบ ให้สรุปสิ่งที่จะเขียนให้ user ยืนยันก่อน 1 ครั้ง
- **บันทึก path** ที่ save ไฟล์ให้ user ทราบเสมอ
