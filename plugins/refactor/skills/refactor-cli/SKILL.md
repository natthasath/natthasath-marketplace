---
name: refactor-cli
description: >
  ตรวจสอบและรีแฟกเตอร์โครงสร้าง command ของ CLI tool ให้ตรงมาตรฐาน (Command Hierarchy, Interactive/
  Non-interactive, Safety Model, Exit Code, Session/State Management, Resource CRUD, Shell Completion ฯลฯ)
  ตรวจสอบก่อนเสมอว่า CLI tool นั้นเขียนด้วยภาษาอะไร (Rust/Go/Python/Node ฯลฯ) แล้วแก้โค้ดจริงให้ตรง idiom
  ของภาษานั้น พร้อมอัปเดตไฟล์ที่เกี่ยวข้อง (README.md, shell completion script, CHANGELOG) ให้ตรงกับ
  โครงสร้างใหม่ รองรับ CLI ที่ต้องรันได้ทั้ง Windows, Linux, macOS
  เรียกใช้ผ่าน `/refactor-cli` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[path ของ CLI tool project หรือชื่อ command ที่ต้องการตรวจ]"
disable-model-invocation: true
---

# CLI Structure Refactorer

คุณทำหน้าที่ตรวจสอบและรีแฟกเตอร์ "โครงสร้าง command" ของ CLI tool ให้เป็นไปตามมาตรฐานการออกแบบ CLI ที่ดี —
ไม่ใช่แค่ปรับข้อความ `--help` แต่แก้โครงสร้างจริงของ command hierarchy, safety model, session/state,
input/output contract ฯลฯ ให้สม่ำเสมอ คาดเดาได้ และปลอดภัย

CLI ที่ดีคือ CLI ที่ผู้ใช้เดา behavior ได้ก่อนรัน — flag อันตรายชื่อต้องดูอันตราย, exit code ต้องมีความหมาย
สม่ำเสมอ, และ pattern ต้องเหมือนกันทั้งเครื่องมือ ไม่ใช่แต่ละ subcommand ออกแบบเอาเอง

## Core Rules (Non-negotiable)

1. **ต้องตรวจภาษา/framework ของ CLI ก่อนแตะโค้ดบรรทัดแรกเสมอ** — อ่าน `references/language-detection.md`
   ก่อน เพราะวิธีแก้ (เช่น "Dry Run flag" หน้าตาใน Rust clap กับ Python argparse ไม่เหมือนกัน) ขึ้นกับ
   ภาษา/framework ที่ใช้จริง ไม่ใช่เดาจาก pattern ทั่วไป
2. **แก้ไฟล์ตรงๆ ในโปรเจกต์ ไม่ต้องตอบเป็น Artifact**
3. **ห้ามทำ breaking change แบบเงียบๆ** — ถ้าจะเปลี่ยนชื่อ flag/subcommand ที่มีอยู่แล้ว (ผู้ใช้เดิมพิมพ์อยู่)
   ต้องอธิบายเหตุผลและถามก่อนเสมอ ไม่ใช่เปลี่ยนแล้วค่อยบอกทีหลัง
4. **ห้ามแก้โค้ดแล้วปล่อยเอกสารไม่ตรงของจริง** — README.md ของโปรเจกต์, shell completion script, CHANGELOG
   ต้อง sync กับโครงสร้างใหม่เสมอ
5. **`--help` ของทุก command ที่แก้ต้อง render ตรงตาม `references/help-text-format.md` เป็นภาษาอังกฤษเสมอ**
6. **ถ้า tool ไม่มี source code ให้แก้** (เช่น เป็น binary ที่ติดตั้งจากคนอื่น) **ห้ามพยายามแก้ไบนารี** —
   สลับเป็นโหมด audit-only แทน (ดู Edge cases)

## Workflow

### 1. อ่าน reference ที่เกี่ยวข้องก่อนเริ่ม
ก่อนแก้อะไร ให้อ่านไฟล์ที่เกี่ยวข้องก่อนเสมอ (รายละเอียดเต็มอยู่ใน Supporting files ด้านล่าง) โดยเฉพาะ
`references/language-detection.md` เพื่อตรวจภาษา/framework ก่อนเป็นอันดับแรก

### 2. ตรวจภาษาก่อนเสมอ
อ่าน `references/language-detection.md` แล้วยืนยันว่า CLI นี้เขียนด้วยภาษาอะไร ก่อนแตะโค้ดบรรทัดแรก
เพราะวิธีแก้ขึ้นกับภาษา/framework ที่ใช้จริง

### 3. สำรวจโครงสร้างปัจจุบันจริง
รัน `<tool> --help` และ subcommand help ที่สำคัญ (ไม่ใช่เดาจากโค้ดอย่างเดียว) เพื่อดูว่าตอนนี้ผู้ใช้เห็น
อะไรจริงๆ

### 4. จัดประเภท tool ก่อนเช็ค checklist
ตอบคำถามเหล่านี้เพื่อรู้ว่า reference กลุ่มไหนเกี่ยวข้องบ้าง (ไม่ต้องไล่เช็คทุกหมวดกับทุก tool):
- มี side effect (เขียน/ลบ/รันคำสั่ง) หรือ read-only? → เกี่ยวกับ `safety-and-trust.md`
- มี session/state ข้ามการเรียกใช้ไหม? → เกี่ยวกับ session/state ใน `interaction-and-automation.md`
- จัดการ "ทรัพยากร" ที่มีชื่อ/ตัวตนไหม (server, plugin, user)? → เกี่ยวกับ `resource-and-crud.md`
- ต้องรันใน script/CI ได้ไหม? → เกี่ยวกับ automation/output design ใน `io-contract.md`
- แจกจ่ายผ่าน package manager หลายตัวไหม? → เกี่ยวกับ `lifecycle-and-distribution.md`

### 5. เทียบกับ checklist แล้วหา gap
เฉพาะหมวดที่เกี่ยวข้องจากข้อ 4 เท่านั้น ไม่บังคับทุก tool ต้องมีครบ 8 กลุ่ม

### 6. แก้โค้ดจริง
ใช้ Edit สำหรับจุดที่แก้เฉพาะจุด และ Write เฉพาะตอนต้องจัดโครง command definition ใหม่ทั้งไฟล์ ระวัง
ไม่ให้ behavior ที่ทำงานถูกอยู่แล้วพังจากการ refactor

### 7. Sync ไฟล์ที่เกี่ยวข้อง
*หลักการ: เอกสารที่ต้อง sync มีหลายไฟล์พร้อมกัน ถ้าไล่เช็คเป็น checklist จะไม่พลาดไฟล์ไหนไป*
- [ ] README.md ของโปรเจกต์ (ส่วนที่อธิบาย command) ตรงกับโครงสร้างใหม่
- [ ] shell completion script (ถ้า tool generate ไว้) ตรงกับโครงสร้างใหม่
- [ ] CHANGELOG (ถ้ามี) ตรงกับโครงสร้างใหม่

ห้ามแก้โค้ดแล้วปล่อยข้อใดข้อหนึ่งไม่ตรงของจริง

### 8. Self-check: render `--help` แล้วเทียบ spec ก่อนส่งมอบ
*หลักการ: จุดนี้ตรวจสอบได้เองจาก spec ที่มีอยู่แล้ว ไม่ต้องรอผู้ใช้ทักว่า format ผิด — เช็คเอง แก้เอง
ก่อนส่งมอบ*
- หลังแก้โครงสร้างเสร็จ ต้องเช็คว่า `--help` ของทุก command ที่แก้ (ทั้ง top level และ subcommand) render
  ออกมาตรง format ใน `references/help-text-format.md` จริง (column alignment, `[aliases: x]`,
  `[possible values: ...]`, `-h/-V` ท้ายสุด ฯลฯ) เป็นภาษาอังกฤษทั้งหมด
- ถ้า framework ของภาษานั้นไม่ generate ให้ตรงเป๊ะโดย default ให้ปรับ help template ของ framework เอง
  (ดูวิธีต่อภาษาใน `help-text-format.md`)
- ถ้าเช็คแล้วพบว่า render ไม่ตรง spec ให้แก้ก่อน แล้วเช็คซ้ำอีกรอบจนตรง ก่อนค่อยสรุปผลให้ผู้ใช้เห็น

### 9. สรุปผล
หลังแก้เสร็จ สรุปสั้นๆ ว่าปรับหมวดไหนไปบ้างและทำไม (อธิบายเหตุผลเฉพาะจุดที่ deviate จาก standard หรือ
จุดที่ตัดสินใจเลือกอย่างใดอย่างหนึ่งระหว่าง 2 แนวทาง ไม่ต้องอธิบายทุกบรรทัดที่แก้) ไม่ต้องแปะโค้ดทั้งไฟล์
ซ้ำในแชท

## Supporting files
- `references/language-detection.md` — วิธีตรวจว่า CLI เขียนด้วยภาษาอะไร (จาก source manifest หรือจาก
  fingerprint ของ help text/binary ถ้าไม่มี source) และ idiom ของแต่ละภาษา (Rust clap / Python
  Click-Typer-argparse / Go Cobra / Node Commander-yargs)
- `references/identity-and-structure.md` — Command Identity, Command Hierarchy, Naming Convention, Alias
- `references/io-contract.md` — Input Design, Output Design, Exit Code, Error Handling
- `references/interaction-and-automation.md` — Interactive/Non-interactive, Automation/Scripting, Session
  Management, State Management
- `references/safety-and-trust.md` — Safety Model, Confirmation, Dry Run, Backup/Rollback, Permission/Privilege
- `references/config-and-observability.md` — Config, Status, Log/Trace, Dependency/Runtime Check, Feature Flags
- `references/resource-and-crud.md` — Resource Model, Core CRUD Operations, Auth/Identity
- `references/lifecycle-and-distribution.md` — Version/Compatibility, Update/Upgrade, Shell Completion,
  Uninstall/Cleanup, Cross-Platform Path/Env Handling
- `references/help-text-format.md` — รูปแบบการ render ข้อความ `--help` ที่แท้จริง (column alignment, ลำดับ
  Usage/Commands/Arguments/Options, `[aliases: x]`, `[possible values: ...]`, `[experimental]`) เขียนเป็น
  ภาษาอังกฤษเสมอ — ใช้ตอน render ผลลัพธ์สุดท้ายของทุก command ที่แก้

## Edge cases
- **Tool ไม่มี source code ให้แก้** (เช่น เป็น binary ที่ติดตั้งจากคนอื่น) → ห้ามพยายามแก้ไบนารี สลับเป็น
  โหมด audit: เทียบกับ checklist แล้วออกรายงาน gap + โครงสร้างที่ควรเป็น ไม่ต้องเดาว่ามีไฟล์ source ที่ไหน
- **มีแค่ output ของ `--help`** (paste มาเฉยๆ ไม่มี source ให้แก้) → แก้โค้ดไม่ได้จริง เปลี่ยนเป็นโหมด audit
  เหมือนกัน
- **กำลังออกแบบ CLI ใหม่ ยังไม่มี command จริง** → ใช้ checklist ใน references/ ออกแบบโครงสร้างเริ่มต้นให้เลย
  ตาม decision tree ในขั้นตอนที่ 4 (ไม่ต้องใส่ทุกหมวด ใส่เฉพาะที่ tool นี้ต้องใช้จริง)
