---
name: save-cost
description: >
  ติดตั้ง CLI tools ที่ช่วยลดการใช้ token ระหว่าง Claude ทำงาน (เช่น gh, jq, ast-grep,
  uv, git-delta, duckdb) ตรวจจับ OS และ package manager อัตโนมัติ (Windows/macOS/Linux)
  เสนอ checklist ให้เลือกว่าจะติดตั้งตัวไหน ติดตั้งพร้อม config ที่จำเป็น (เช่น git pager)
  แล้วอัปเดต CLAUDE.md ให้ Claude รู้ว่ามี tool อะไรติดตั้งอยู่และควรใช้เมื่อไหร่ ใช้ skill นี้
  ทันทีเมื่อผู้ใช้พูดถึง "ติดตั้ง CLI tools ประหยัด token", "setup tools ให้ Claude ใช้",
  "ลด token usage", "ทำไม Claude กิน token เยอะ", "มี tool อะไรช่วยลด context บ้าง"
  หรือกำลังเริ่ม setup เครื่อง/โปรเจกต์ใหม่และถามหา best practice ด้าน tooling
  เรียกใช้ผ่าน `/save-cost` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
disable-model-invocation: true
---

# บทบาท:
คุณทำหน้าที่เป็นผู้ช่วยติดตั้งและตั้งค่า CLI tools ที่ช่วยลดการใช้ token ระหว่าง Claude ทำงานกับผู้ใช้
เป้าหมายไม่ใช่แค่ "ติดตั้งให้ครบ" แต่คือทำให้ Claude (ทั้ง session นี้และ session ในอนาคต) รู้ว่ามี tool อะไรพร้อมใช้ และควรเลือกใช้แทนวิธีเดิมเมื่อไหร่

ก่อนเริ่ม ให้อ่าน `references/tools.md` เพื่อเข้าใจ **กลุ่มเครื่องมือ A/B/C** ก่อนเสมอ — นี่คือหัวใจของ skill นี้: กลุ่ม C เป็นโปรแกรม interactive/long-running ที่ Claude ห้ามเรียกเองผ่าน Bash เด็ดขาด เพราะจะทำให้ session ค้าง

# รูปแบบ:

## ขั้นตอนที่ 1 — ตรวจสอบ OS และ package manager

ตรวจสอบ platform ที่กำลังรันอยู่ก่อน แล้วอ่าน reference file ของ OS นั้นเท่านั้น (ไม่ต้องอ่านทุกไฟล์):
- Windows → `references/install-windows.md` (ใช้ PowerShell tool, เช็ค `winget`/`scoop`)
- macOS → `references/install-macos.md` (ใช้ Bash tool, เช็ค `brew`)
- Linux → `references/install-linux.md` (ใช้ Bash tool, เช็ค `apt`/`dnf`/`pacman`)

เช็คด้วยว่า tool ไหนติดตั้งอยู่แล้วบ้าง (เช่น `command -v gh` หรือ `Get-Command gh -ErrorAction SilentlyContinue`) เพื่อไม่เสนอ checklist ซ้ำสำหรับของที่มีอยู่แล้ว — บอกผู้ใช้สั้นๆ ว่าอันไหนมีอยู่แล้วบ้าง

## ขั้นตอนที่ 2 — เสนอ Checklist ให้เลือก

แสดงตารางจาก `references/tools.md` เฉพาะกลุ่ม A และ B ที่ยังไม่ได้ติดตั้ง จัดกลุ่มตาม Priority ให้เห็นชัด แล้วถามผู้ใช้ว่าต้องการติดตั้งระดับไหน — ใช้ `AskUserQuestion` ถามเป็น tier แทนการถามทีละตัว (เพราะมีหลาย tool เกินจะถามทีละอันได้):

ตัวเลือกที่ควรมี:
- **Essential เท่านั้น** (⭐⭐⭐⭐⭐) — เช่น gh, jq, ast-grep, uv
- **Essential + Recommended** (⭐⭐⭐⭐ ขึ้นไป)
- **ติดตั้งทั้งหมด** (กลุ่ม A + B ทั้งหมด)
- **ให้เลือกเอง** — ถ้าเลือกตัวเลือกนี้ ให้แสดงตารางแบบมีเลขกำกับแล้วให้ผู้ใช้พิมพ์ตอบเป็นเลขหรือชื่อ tool ที่ต้องการ (เช่น "1,3,5-8" หรือ "gh, jq, duckdb")

**แยกถามกลุ่ม C ต่างหากเสมอ** — อธิบายให้ชัดว่าเป็น tool แบบ interactive (lazygit, fzf, watchexec) ที่มีไว้ให้ผู้ใช้เปิดเองในเทอร์มินัล ไม่ใช่ให้ Claude เรียก ถามว่าต้องการติดตั้งไว้ใช้เองไหม (ค่า default คือไม่ติดตั้ง ถ้าผู้ใช้ไม่ได้ระบุ)

## ขั้นตอนที่ 3 — ติดตั้ง

รันคำสั่งติดตั้งตาม reference file ของ OS นั้น ทีละ tool หรือ batch ตามที่ reference แนะนำ

**ถ้าคำสั่งติดตั้งล้มเหลว:**
1. ลองวิธีสำรอง (fallback) ที่ระบุไว้ใน reference file ก่อน (เช่น scoop แทน winget, cargo แทน apt)
2. ถ้ายังไม่สำเร็จ แจ้งผู้ใช้ตรงๆ ว่า tool ไหนติดตั้งไม่ได้และทำไม อย่าข้ามไปเงียบๆ
3. ห้ามเดา package ID มั่วๆ ถ้าไม่แน่ใจให้ลอง search ก่อน (เช่น `winget search <tool>`) ก่อนบอกว่าล้มเหลว

## ขั้นตอนที่ 4 — Config เพิ่มเติม

หลังติดตั้งเสร็จ ให้เซ็ต config ตามที่ reference file ของ OS นั้นระบุไว้ (เช่น `git config --global core.pager delta` สำหรับ `git-delta`)

**ก่อนแก้ shell profile ของผู้ใช้ (`.zshrc`, `.bashrc`, `$PROFILE`) ต้องถามอนุญาตก่อนเสมอ** — เป็นไฟล์ personal setup ของผู้ใช้ ไม่ใช่ config ของโปรเจกต์ การแก้โดยไม่ถามอาจไปชนกับของเดิมที่ผู้ใช้ตั้งไว้

## ขั้นตอนที่ 5 — อัปเดต CLAUDE.md

เขียนหรืออัปเดตหัวข้อ `## Token-Efficient CLI Tools` ใน `CLAUDE.md` ของโปรเจกต์ปัจจุบัน (ถ้าไม่มีไฟล์ ให้ถามผู้ใช้ก่อนว่าจะสร้างใหม่ไหม หรือจะใส่ใน global `~/.claude/CLAUDE.md` แทน)

ใช้ marker comment ครอบหัวข้อนี้ไว้เสมอ เพื่อให้รันซ้ำแล้ว**อัปเดต**ส่วนนี้แทนการเขียนซ้ำซ้อน:

```markdown
<!-- save-cost:start -->
## Token-Efficient CLI Tools

เครื่องนี้มี CLI tools ต่อไปนี้ติดตั้งไว้เพื่อลดการใช้ token — ให้ใช้แทนวิธีเดิมเมื่อเข้าเงื่อนไข:

| Tool | ใช้แทน | ใช้เมื่อ |
|---|---|---|
| `gh` | เปิด browser ไป GitHub | ต้องดู/สร้าง issue, PR, release, workflow run |
| `jq` | เขียน Python parse JSON | ต้องกรอง/query JSON output |
| ... | ... | ... |

**ห้ามเรียกตรงๆ ผ่าน Bash (interactive, จะทำให้ session ค้าง):** {รายชื่อ tool กลุ่ม C ที่ติดตั้งไป ถ้ามี} — tool เหล่านี้มีไว้ให้ผู้ใช้เปิดเองในเทอร์มินัลแยกเท่านั้น
<!-- save-cost:end -->
```

ตารางใน CLAUDE.md ให้ใส่**เฉพาะ tool ที่ผู้ใช้เลือกติดตั้งจริง**ในรอบนี้ (ไม่ใช่ copy ทั้งหมดจาก reference) และคอลัมน์ "ใช้เมื่อ" ให้เขียนสั้นๆ เจาะจงพอที่ Claude ในอนาคตอ่านแล้วรู้ทันทีว่าเมื่อไหร่ควรสลับไปใช้

ถ้าเจอ marker เดิมอยู่แล้วในไฟล์ (รันซ้ำ) ให้แทนที่เนื้อหาระหว่าง `<!-- save-cost:start -->` กับ `<!-- save-cost:end -->` ทั้งหมด ไม่ใช่เพิ่มต่อท้าย

## ขั้นตอนที่ 6 — สรุปผล

รายงานสรุปให้ผู้ใช้เห็นชัดเจน:
```
✅ ติดตั้งสำเร็จ: gh, jq, ast-grep, uv, git-delta
⚠️ ติดตั้งไม่สำเร็จ: {tool} — {เหตุผล}
⚙️ Config ที่ตั้งให้: git core.pager = delta
📄 อัปเดต CLAUDE.md แล้ว — เพิ่มหัวข้อ "Token-Efficient CLI Tools"
```

# คำขอ:
- อ่าน `references/tools.md` ก่อนเสมอเพื่อรู้ว่า tool ไหนอยู่กลุ่มไหน (A/B/C) — ห้ามข้ามขั้นตอนนี้
- **ห้าม Claude เรียกใช้ tool กลุ่ม C โดยตรงผ่าน Bash/PowerShell ไม่ว่ากรณีใด** (ยกเว้น `fzf --filter` ที่ไม่ใช่โหมด interactive)
- ถามก่อนแก้ shell profile ของผู้ใช้เสมอ (ไม่ auto-apply)
- ไม่เดา package ID/version มั่วๆ — ถ้าคำสั่งใน reference ใช้ไม่ได้ ให้ search หา ID ที่ถูกต้องก่อน
- อัปเดต CLAUDE.md ด้วย marker comment เสมอ เพื่อให้รันซ้ำได้โดยไม่ซ้ำซ้อน
- ตารางใน CLAUDE.md ใส่เฉพาะ tool ที่ติดตั้งจริงในรอบนั้น ไม่ copy ทั้ง reference

# ไฟล์แนบ:
- ถ้าผู้ใช้ระบุ OS หรือ package manager ที่ต้องการใช้มาแล้ว (เช่น "ใช้ scoop นะ") ให้ใช้ตามนั้นแทนตัวเลือกแรกที่แนะนำใน reference
