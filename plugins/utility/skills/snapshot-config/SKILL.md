---
name: snapshot-config
description: >
  Export และ snapshot การตั้งค่า (config) ของโปรแกรมบนเครื่องผู้ใช้ พร้อมแนะนำการตั้งค่าที่เหมาะสม
  รองรับ Windows 11, macOS, Linux Ubuntu — ครอบคลุม editor, terminal, shell, package manager, dev tools
  ใช้ skill นี้ทันทีเมื่อผู้ใช้พูดถึง "export config", "backup settings", "snapshot การตั้งค่า",
  "สำรอง config", "เซฟ settings", "ย้าย config ไปเครื่องใหม่", "แนะนำ settings" ของโปรแกรมใดก็ตาม
  เรียกใช้ผ่าน `/utility:snapshot-config` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[ชื่อโปรแกรม]"
disable-model-invocation: true
---

# Snapshot Config — Export และแนะนำการตั้งค่าโปรแกรม

คุณทำหน้าที่ช่วย export config ของโปรแกรม พร้อมแนะนำการตั้งค่าที่เหมาะสมตาม OS และ workflow ของผู้ใช้
ผลลัพธ์คือ snapshot ที่สามารถนำไป restore บนเครื่องใหม่ได้ทันที ปฏิบัติตามกฎทุกข้อด้านล่างอย่างเคร่งครัด

## Core Rules (Non-negotiable)

1. **ตรวจสอบ config path ก่อนเสมอ** — อ่าน `~/.config/claude-utility/settings.json` ทุกครั้ง ไม่ hardcode
   `~/.claude/claude-utility/snapshots/` ยกเว้นเป็น default ที่ผู้ใช้เลือก
2. **ถามก่อนถ้าไม่รู้ชื่อโปรแกรม** — อย่าเดาชื่อโปรแกรมเอง
3. **ห้ามแตะ/บันทึก sensitive data เด็ดขาด** — ถ้า config มี token, password, private key ต้องระบุว่า
   "ไม่ควร snapshot ค่านี้" และ redact ออกก่อน save ทุกครั้ง ไม่มีข้อยกเว้น
4. **อธิบายเหตุผลทุกคำแนะนำ** — ไม่แนะนำแบบ "ควรตั้งค่านี้" โดยไม่มีเหตุผลประกอบ
5. **แยก must / nice-to-have ให้ชัดเจนเสมอ** — บอกชัดว่าอันไหนสำคัญ อันไหนแล้วแต่ preference
6. **บอก path เต็มที่ save snapshot ให้ผู้ใช้ทราบเสมอ** หลังบันทึกสำเร็จ

## Supporting files
- **Config File** — บันทึก path ที่ผู้ใช้กำหนดไว้ที่ `~/.config/claude-utility/settings.json`
  รูปแบบ:
  ```json
  {
    "snapshots_base_path": "/path/to/snapshots/",
    "os_profile_path": "/path/to/os-profile.md"
  }
  ```
- `references/config-paths.md` — หา config file location ของโปรแกรม
- `references/install-paths.md` — หา recommended installation path ต่อ OS
- `os-profile.md` (จาก `utility:os-design`) — context เรื่อง OS/path/software ของผู้ใช้ ถ้ามี

## Workflow

### 1. รับชื่อโปรแกรม

ถ้าผู้ใช้ยังไม่ได้บอกชื่อโปรแกรม ให้ถาม (Core Rules ข้อ 2):
> "ต้องการ snapshot config ของโปรแกรมอะไร?"

### 2. ตรวจสอบ Path + โหลด Context

#### ขั้นตอนตรวจสอบ path (ทำก่อนดาวน์โหลดทุกครั้ง)
1. อ่านไฟล์ `~/.config/claude-utility/settings.json`
2. ถ้า **ไม่มีไฟล์** (ใช้ครั้งแรก) → ถามผู้ใช้ว่าต้องการบันทึก snapshot ที่ folder ไหน พร้อมบอก default ว่า `~/.claude/claude-utility/snapshots/` แล้ว **สร้าง config file** บันทึก path ที่เลือก จากนั้นดำเนินการต่อ (ไม่ใช้ path ใต้ `plugins/utility/` เพราะโฟลเดอร์นั้นอยู่ใน plugin cache ที่ถูกแทนที่ทุกครั้งที่อัปเดต version)
3. ถ้า **มีไฟล์แล้ว** → ใช้ `snapshots_base_path` จาก config โดยตรง ไม่ต้องถามซ้ำ
4. ถ้าผู้ใช้ระบุ path ในข้อความ (เช่น "snapshot ไปไว้ที่ D:/Backup") → ใช้ path นั้นสำหรับครั้งนี้เท่านั้น ไม่ overwrite config

#### เปลี่ยน Snapshot Path
trigger เมื่อผู้ใช้พูดถึง: "เปลี่ยน path", "บันทึก snapshot ที่อื่น", "set snapshot path", "ย้าย folder snapshot" หรือคล้ายกัน

ขั้นตอน:
1. แสดง path ปัจจุบันจาก config (ถ้ามี)
2. ถามว่าต้องการเปลี่ยนเป็น path ใด
3. อัปเดต `~/.config/claude-utility/settings.json` ด้วย path ใหม่
4. ยืนยันว่าเปลี่ยนสำเร็จและแสดง path ใหม่

#### โหลด OS Context

อ่าน os-profile.md จาก `os_profile_path` ใน config (ถ้ามี) เพื่อทำความเข้าใจ:
- ผู้ใช้ใช้ OS อะไรบ้าง
- Path สำคัญของแต่ละ OS
- Software ที่ติดตั้งอยู่

ถ้าไฟล์ยังไม่มี → แจ้งผู้ใช้:
> "ยังไม่พบ os-profile.md แนะนำให้รัน `utility:os-design` ก่อนเพื่อบันทึกข้อมูลระบบของคุณ
> หรือบอก OS ที่ใช้อยู่ตอนนี้มาได้เลย"

### 3. ระบุ OS เป้าหมาย

ถามว่าต้องการ snapshot บน OS ไหน (ถ้าไม่ชัดเจนจาก context):
> "ต้องการ snapshot บน OS ไหน?
> 1. Windows 11
> 2. macOS
> 3. Linux Ubuntu
> 4. ทั้งหมดที่มีโปรแกรมนี้"

### 4. ค้นหา Config Path และ Install Path

อ่านไฟล์ reference ทั้งสองพร้อมกัน:
- `references/config-paths.md` — หา config file location ของโปรแกรมนั้น
- `references/install-paths.md` — หา recommended installation path สำหรับ OS ที่ใช้

ถ้าไม่พบในรายการ → ใช้ความรู้ทั่วไปหา config path แล้วแจ้งผู้ใช้ว่าอนุมานจากความรู้ทั่วไป

### 5. ตรวจสอบ Config ที่มีอยู่

พยายามอ่านไฟล์ config จริงใน path ที่ระบุ:
- **อ่านได้** → วิเคราะห์ค่าที่ตั้งอยู่ปัจจุบัน ไปยัง Step 6
- **อ่านไม่ได้** (ต่าง OS หรือ path ไม่ตรง) → แสดงคำสั่ง export ให้ผู้ใช้รันเอง แล้วขอให้ paste ผลลัพธ์กลับมา

### 6. แนะนำการตั้งค่า

เมื่อแนะนำการตั้งค่า ให้คำนึงถึง:
- **Installation Path** — อ่าน `references/install-paths.md` เพื่อตรวจสอบว่า binary/SDK ติดตั้งอยู่ใน
  ตำแหน่งที่เหมาะสมสำหรับโปรแกรมและ OS นั้นๆ ครอบคลุม Windows, macOS, Ubuntu — เช่น อยู่ใน root
  drive ไหม, ต้องการ admin ในการ update ไหม, มีช่องว่างใน path ไหม — แนะนำตำแหน่งที่ดีกว่าพร้อม
  move/reinstall command เสมอถ้าพบปัญหา
- **Performance** — ค่าที่ช่วยให้โปรแกรมทำงานเร็วขึ้นบน hardware ของผู้ใช้
- **Workflow** — ค่าที่เข้ากับ naming convention และ path จาก os-profile.md
- **Cross-platform consistency** — ถ้าใช้หลาย OS ให้แนะนำค่าที่ sync ได้ง่าย
- **Best practices** — ค่า default ที่ community แนะนำกันโดยทั่วไป
- **Security** — ค่าที่เกี่ยวกับความปลอดภัย เช่น SSH, Git signing

วิเคราะห์ config ปัจจุบัน (ถ้ามี) และแนะนำ:

**รูปแบบการแนะนำ:**
```
## การตั้งค่าปัจจุบัน
[สรุปค่าสำคัญที่ตั้งอยู่]

## แนะนำ Installation Path
[ตรวจสอบว่า binary/SDK ติดตั้งอยู่ในตำแหน่งที่เหมาะสมไหม]

| หัวข้อ | ปัจจุบัน | แนะนำ | เหตุผล |
|--------|---------|-------|--------|

ข้ามส่วนนี้ถ้าโปรแกรมไม่มี SDK/binary path ที่ต้องตรวจสอบ (เช่น extension หรือ web app)

## แนะนำให้เปลี่ยน
| Setting | ค่าปัจจุบัน | แนะนำ | เหตุผล |
|---------|------------|-------|--------|

## แนะนำให้เพิ่ม
| Setting | ค่าแนะนำ | เหตุผล |
|---------|---------|--------|

## ดีอยู่แล้ว
[สิ่งที่ตั้งค่าถูกต้องแล้ว]
```

### 7. Self-check แล้วบันทึก Snapshot

*Checklist ก่อนเขียนไฟล์ลงดิสก์ — ทำครบทุกข้อก่อนเสมอ เพราะไฟล์ snapshot อาจถูกย้าย/แชร์ต่อ
และการบันทึก secret ลงไฟล์เป็นความเสียหายที่แก้คืนไม่ได้ง่ายๆ:*
- [ ] สแกนเนื้อหาที่กำลังจะเขียนทุกไฟล์ (snapshot.md, settings.json, extensions.txt) หา token,
      password, private key หรือค่าที่ดูเหมือน secret — ถ้าเจอ ต้อง redact ออกก่อนตาม Core Rules ข้อ 3
      (ไม่ใช่แค่เตือนแล้วเขียนไปเหมือนเดิม)
- [ ] คำแนะนำใน Step 6 มีเหตุผลประกอบครบทุกข้อ (Core Rules ข้อ 4)
- [ ] แยก must / nice-to-have ชัดเจนแล้ว (Core Rules ข้อ 5)

เขียนไฟล์ได้ก็ต่อเมื่อผ่านครบทุกข้อ บันทึกผลลัพธ์ที่ `<snapshots_base_path>/<program-name>/<YYYY-MM-DD>/`
โดย `snapshots_base_path` อ่านจาก `~/.config/claude-utility/settings.json` — ไม่ hardcode path ยกเว้นเป็น default ที่ผู้ใช้เลือก

โครงสร้างไฟล์ใน snapshot:
```
snapshots/vscode/2024-07-18/
├── snapshot.md          ← สรุป config ทั้งหมด + คำแนะนำ
├── settings.json        ← config จริง (ถ้าอ่านได้)
├── extensions.txt       ← รายการ extensions (ถ้ามี)
└── restore-guide.md     ← วิธี restore บนเครื่องใหม่
```

**รูปแบบ snapshot.md:**
```markdown
# Config Snapshot: <Program>
_Date: YYYY-MM-DD_
_OS: <OS>_
_Version: <program version ถ้าทราบ>_

## Config Location
<path ที่เก็บ config>

## Current Settings Summary
<สรุปค่าสำคัญ>

## Recommendations
<คำแนะนำจาก Step 6>

## How to Export
<คำสั่งสำหรับ export เพื่ออ้างอิงในอนาคต>

## How to Restore
<คำสั่งหรือขั้นตอนสำหรับ restore>
```

