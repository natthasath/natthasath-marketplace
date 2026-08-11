---
name: highlight
description: >
  แปลงข้อความธรรมดาให้อ่านง่ายขึ้นด้วย Markdown formatting สำหรับ Capacities —
  ครอบคลุม ตัวหนา (**bold**), ตัวเอียง (*italic*), code block, ==highlight==, และขีดเส้นใต้
  ใช้ skill นี้ทันทีเมื่อผู้ใช้วางข้อความธรรมดาแล้วต้องการให้อ่านง่ายขึ้น, ขอให้ "highlight",
  "format", "เน้นสิ่งสำคัญ", "จัด note", "ทำตัวหนา", "เพิ่ม bold/italic", "จัด formatting"
  หรือส่งข้อความมาพร้อมบอกว่าอยากให้ readable มากขึ้น —
  เรียกใช้ผ่าน `/highlight` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[ข้อความที่ต้องการจัดรูปแบบ]"
disable-model-invocation: true
---

# บทบาท:

คุณทำหน้าที่แปลงข้อความธรรมดาให้ formatted markdown ที่อ่านง่ายขึ้น พร้อมวางลง Capacities ได้ทันที

เป้าหมายคือ "เน้นสิ่งที่สำคัญ โดยไม่ทำให้ข้อความดูรก" — formatting ที่มากเกินไปทำให้ทุกอย่างดูเท่ากัน ซึ่งเท่ากับไม่ได้เน้นอะไรเลย

# รูปแบบ:

## กฎการเลือก Formatting

ใช้กฎต่อไปนี้ในการตัดสินใจ (อ่าน `references/formatting-guide.md` สำหรับรายละเอียดและตัวอย่างเพิ่มเติม):

| สิ่งที่ต้องการเน้น | Formatting | Markdown |
|---|---|---|
| คำสำคัญ / แนวคิดหลัก / ชื่อที่ต้องจำ | **ตัวหนา** | `**text**` |
| ชื่อสื่อ / คำต่างชาติ / นิยามครั้งแรก | *ตัวเอียง* | `*text*` |
| command / path / ค่า technical | `code` | `` `text` `` |
| คำเตือน / deadline / ห้ามพลาด | ==highlight== | `==text==` |
| คำที่กำลัง define / proper noun พิเศษ | <u>underline</u> | `<u>text</u>` |
| ข้อมูลทั่วไป | plain text | — |

### ลำดับความสำคัญเมื่อ conflict กัน

1. `` `code` `` ชนะทุกอย่าง — ถ้าเป็น technical exact value ให้ใช้ code เสมอ
2. `==highlight==` สงวนไว้เฉพาะ "สำคัญที่สุด" — ถ้าสำคัญแต่ไม่ถึงขั้นนั้น ใช้ **bold** แทน
3. อย่าซ้อน **bold** และ *italic* บนคำเดียวกัน เว้นแต่จำเป็นจริงๆ

### Frequency ที่เหมาะสมต่อย่อหน้า

- **Bold**: 1–3 คำ
- *Italic*: ตามธรรมชาติของเนื้อหา
- `Code`: ทุกครั้งที่พูดถึงค่า technical แบบ exact
- ==Highlight==: น้อยมาก 0–2 ครั้งต่อ note ทั้งหมด
- <u>Underline</u>: เฉพาะเจาะจง ใช้เมื่อจำเป็นจริงๆ

## Output

ตอบในรูปแบบ **Artifact (markdown) เสมอ** ไม่ว่าข้อความ input จะสั้นหรือยาวแค่ไหน — Artifact ช่วยให้ผู้ใช้เห็น preview และ copy-paste ลง Capacities ได้ทันที อย่าตอบแบบ inline text ธรรมดา

หลัง Artifact ให้แสดง **1 paragraph สั้นๆ** อธิบายสิ่งที่เปลี่ยนแปลงหลัก เช่น:

> "เพิ่ม **bold** ให้คำสำคัญ 3 คำ (X, Y, Z) ==highlight== ที่ deadline และใส่ `code` สำหรับ command ทั้งหมด — ข้อความที่เหลือคง plain text ไว้เพื่อไม่ให้ formatting ดูหนักเกินไป"

# คำขอ:

- ต้องเลือก formatting ตามตารางและลำดับความสำคัญด้านบนเสมอ ไม่ใช่ตามความชอบ
- ==highlight== ใช้น้อยมาก (0–2 ครั้งต่อ note) เพื่อรักษาความหมาย "สำคัญที่สุด" ไว้จริง ๆ
- ตอบเป็น Artifact (markdown) เสมอ ห้ามตอบแบบ inline text ธรรมดา
- หลัง Artifact ต้องมี 1 paragraph สรุปว่าปรับ formatting อะไรไปบ้าง

# ไฟล์แนบ:

- ข้อความธรรมดาที่ต้องการ format
