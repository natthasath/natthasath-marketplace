---
name: add-task
description: เพิ่ม task ใหม่เข้า backlog พร้อม Acceptance Criteria โดยร่าง, ขอ confirm แล้วค่อยบันทึก ใช้ skill นี้เมื่อต้องการเพิ่มงานใหม่เข้าโปรเจค เช่น "เพิ่ม task", "อยากทำเรื่อง...", "บันทึก feature ใหม่"
argument-hint: "[task-description]"
tools:
  - Read
  - Write
  - Edit
  - Bash
---

!`cat .claude/config/task-format.md 2>/dev/null`

เพิ่ม task ใหม่เข้า backlog: $ARGUMENTS

1. **เรียบเรียงความต้องการ** — วิเคราะห์ `$ARGUMENTS` แล้วร่าง task draft:
   - **ชื่อ task**: กระชับ ≤ 60 ตัวอักษร บอก action + object ชัดเจน
   - **Description**: ขยายความว่าต้องทำอะไร ทำไม และขอบเขตคืออะไร (2-4 ประโยค)
   - **Acceptance Criteria**: 2-4 ข้อที่ตรวจสอบได้จริง (testable, specific)
   - **Priority**: ประเมินจาก context (High / Medium / Low)
   - **Estimate**: ประเมินชั่วโมงหรือ story points ที่ต้องใช้

2. **แสดง draft ให้ confirm** ในรูปแบบนี้:

   ```
   📋 Task Draft

   ชื่อ: <ชื่อ task>
   Priority: <High/Medium/Low>
   Estimate: <X> hour(s)

   Description:
   <description>

   Acceptance Criteria:
   - [ ] <criteria 1>
   - [ ] <criteria 2>
   ...
   ```

   แล้วถามว่า "ต้องการแก้ไขส่วนไหนไหม หรือ OK ให้เพิ่มลง backlog เลย?"

3. **รอ confirm** — ถ้าผู้ใช้บอก OK หรือ ยืนยัน ถึงไปขั้นต่อไป ถ้าต้องการแก้ให้แก้แล้วแสดง draft ใหม่

4. อ่าน format จาก output ของ `!cat` ด้านบน (บรรทัด `format:`) แล้วกำหนด ID ตามนี้:

   **format: phase** → อ่าน `phase:` จาก `.claude/config/current-phase.md` แล้วเปิด `context/tasks/backlog/phase_<N>_*.md` หา ID สูงสุด generate ต่อ
   - ตัวอย่าง: phase 1, ID ล่าสุด `TSK-1-008` → ID ใหม่ `TSK-1-009`

   **format: global** → สแกน backlog ทุกไฟล์ใน `context/tasks/backlog/` หา ID ตัวเลขสูงสุดทั่วทั้งโปรเจค
   - ตัวอย่าง: ถ้ามี `TSK-012` อยู่แล้ว → ID ใหม่ `TSK-013`

5. เพิ่ม entry ต่อท้าย backlog file ของ phase ปัจจุบัน:

   ```
   ## <ID ใหม่> — <ชื่อ task ที่ confirm แล้ว>

   **Priority:** <priority>
   **Estimate:** <X> hour(s)
   **Status:** Backlog

   **Description:**
   <description>

   **Acceptance Criteria:**
   - [ ] <criteria 1>
   - [ ] <criteria 2>

   ---
   ```

6. แจ้ง task ID ที่ได้ แล้วปิดท้ายด้วยบรรทัดนี้เสมอ:

   ```
   ─────────────────────────────
   ถัดไป → /start-task <ID>
   ─────────────────────────────
   ```
