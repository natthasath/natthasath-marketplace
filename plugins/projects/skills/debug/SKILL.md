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

วิเคราะห์และแก้ bug: $ARGUMENTS

อ่าน `../../references/commit-emoji.md` เพื่อดู emoji convention ก่อน commit

---

## โหมด --hotfix (Production Emergency)

ถ้า `$ARGUMENTS` มีคำว่า `--hotfix` ให้ใช้ขั้นตอนนี้แทน:

**เป้าหมาย:** แก้เร็วที่สุด กระทบ codebase น้อยที่สุด

1. **Branch** — สร้าง `hotfix/<slug>` จาก main ทันที: `git checkout -b hotfix/<slug> main`
2. **Fix** — แก้เฉพาะจุดที่พัง ห้ามแตะโค้ดอื่น ถ้า fix เกิน ~50 บรรทัดให้หยุดและบอกฉัน
3. **Test** — รันเฉพาะ test ที่เกี่ยวข้องโดยตรง ไม่รัน full suite
4. **Commit** — `🚑️ fix(<scope>): <สิ่งที่แก้> [hotfix]`
5. **ยืนยันก่อนทำ** — แสดง branch name + commit message ให้ฉัน approve ก่อนทุกครั้ง

> ⚠️ ห้าม force push, ห้าม refactor, ห้ามแก้ปัญหาอื่นที่เห็นระหว่างทาง

---

## โหมดปกติ (Careful)

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

**ขั้นที่ 4 — Fix:**
- แก้เฉพาะ root cause ไม่แก้ครอบคลุมเกินจำเป็น
- เพิ่ม test ที่ reproduce bug ก่อน fix (ควร fail ก่อน แล้วผ่านหลัง fix)
- รัน **test** command (จาก tech-stack.md ด้านบน) หลังแก้

**ขั้นที่ 5 — Document:**
- อธิบายว่าแก้อะไรและทำไม (สำหรับ commit message รูปแบบ `🐛 fix(<scope>): <คำอธิบาย>`)
