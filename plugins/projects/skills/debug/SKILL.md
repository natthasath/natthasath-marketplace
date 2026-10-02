---
name: debug
description: วิเคราะห์และแก้ bug ด้วย root cause analysis รองรับทั้งโหมดปกติและ --hotfix สำหรับ production emergency ใช้ skill นี้เมื่อมี bug หรือ error เช่น "แก้ bug นี้หน่อย", "production error", "debug ให้หน่อย"
argument-hint: "[bug-description] [--hotfix]"
tools:
  - Read
  - Grep
  - Bash
  - Edit
---

!`cat .claude/config/tech-stack.md 2>/dev/null`

# Debug

วิเคราะห์และแก้ bug: $ARGUMENTS

อ่าน `../../references/commit-emoji.md` เพื่อดู emoji convention ก่อน commit

## Core Rules (Non-negotiable)

1. **ตรวจจับโหมดก่อนเริ่มเสมอ** — ถ้า `$ARGUMENTS` มีคำว่า `--hotfix` ให้ใช้ Hotfix Mode แทน Normal Mode เสมอ
2. **Hotfix Mode ห้าม force push, ห้าม refactor, ห้ามแก้ปัญหาอื่นที่เห็นระหว่างทาง** — แก้เฉพาะจุดที่พังจริงเท่านั้น
3. **Hotfix Mode ต้องยืนยันก่อนทำทุกครั้ง** — แสดง branch name + commit message ให้ผู้ใช้ approve ก่อนเสมอ
4. **Normal Mode ต้องแก้ที่ root cause ไม่ใช่แค่ symptom** และต้องรายงาน root cause ให้ผู้ใช้เห็นก่อนลงมือแก้
5. **Normal Mode ต้องผ่าน test ที่เกี่ยวข้องก่อนรายงานว่าเสร็จ** — เพิ่ม test ที่ reproduce bug ก่อน fix (ควร fail ก่อน แล้วผ่านหลัง fix)

## Workflow

### Mode Detection
ถ้า `$ARGUMENTS` มีคำว่า `--hotfix` ให้ใช้ Hotfix Mode ด้านล่างแทน Normal Mode

### Hotfix Mode (Production Emergency)
**เป้าหมาย:** แก้เร็วที่สุด กระทบ codebase น้อยที่สุด

1. **Branch** — สร้าง `hotfix/<slug>` จาก main ทันที: `git checkout -b hotfix/<slug> main`
2. **Fix** — แก้เฉพาะจุดที่พัง ห้ามแตะโค้ดอื่น ถ้า fix เกิน ~50 บรรทัดให้หยุดและบอกฉัน
3. **Test** — รันเฉพาะ test ที่เกี่ยวข้องโดยตรง ไม่รัน full suite
4. **Commit** — `🚑️ fix(<scope>): <สิ่งที่แก้> [hotfix]`
5. **ยืนยันก่อนทำ** — แสดง branch name + commit message ให้ฉัน approve ก่อนทุกครั้ง

> ⚠️ ห้าม force push, ห้าม refactor, ห้ามแก้ปัญหาอื่นที่เห็นระหว่างทาง

### Normal Mode (Careful)

**ขั้นที่ 1 — Reproduce ปัญหา:**
- อธิบายขั้นตอนที่ทำให้เกิด bug
- Expected behavior คืออะไร
- Actual behavior คืออะไร
- Error message (ถ้ามี) คืออะไร

**ขั้นที่ 2 — Gather evidence (รัน tools):**
- ค้นหา error message ใน codebase ด้วย Grep
- อ่านไฟล์ที่เกี่ยวข้อง
- ดู git log เพื่อหาว่า bug เกิดขึ้นตั้งแต่ commit ไหน: `git log --oneline -20`

**ขั้นที่ 3 — Root cause analysis:**
- ระบุ root cause (ไม่ใช่แค่ symptom)
- อธิบายว่า bug เกิดขึ้นได้อย่างไร
- รายงานให้ฉันเห็นก่อนแก้

**ขั้นที่ 4 — Fix แล้ว self-correct จนผ่าน test:**
*หลักการ: ผลลัพธ์ของขั้นนี้ (test ผ่านหรือไม่) ตรวจสอบได้เองจากการรันคำสั่งจริง ไม่ต้องรอผู้ใช้ยืนยัน — ทำ → รัน test → ถ้ายังไม่ผ่านให้แก้ต่อ → รันซ้ำจนผ่าน ดีกว่าเชื่อว่าการแก้ครั้งแรกถูกต้องแล้วรายงานไปเลย*
- แก้เฉพาะ root cause ไม่แก้ครอบคลุมเกินจำเป็น
- เพิ่ม test ที่ reproduce bug ก่อน fix (ควร fail ก่อน แล้วผ่านหลัง fix)
- รัน **test** command (จาก tech-stack.md ด้านบน) หลังแก้ — ถ้ายังไม่ผ่าน ให้แก้ต่อแล้วรันซ้ำจนผ่าน ห้ามรายงานว่าแก้เสร็จจนกว่า test จะผ่านจริง

**ขั้นที่ 5 — Document:**
- อธิบายว่าแก้อะไรและทำไม (สำหรับ commit message รูปแบบ `🐛 fix(<scope>): <คำอธิบาย>`)
