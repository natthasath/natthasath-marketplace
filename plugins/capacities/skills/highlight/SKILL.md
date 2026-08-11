---
name: highlight
description: >
  แปลงข้อความธรรมดาให้อ่านง่ายขึ้นด้วย Markdown formatting สำหรับ Capacities —
  ครอบคลุม ตัวหนา (**bold**), ตัวเอียง (*italic*), code block, ==highlight==, และขีดเส้นใต้
  แสดงผลเป็น Interactive Artifact ที่ render สีและ style เลียนแบบ Capacities จริง พร้อมปุ่ม
  Copy Markdown สำหรับก็อปไปวางต่อได้ทันที
  ใช้ skill นี้ทันทีเมื่อผู้ใช้วางข้อความธรรมดาแล้วต้องการให้อ่านง่ายขึ้น, ขอให้ "highlight",
  "format", "เน้นสิ่งสำคัญ", "จัด note", "ทำตัวหนา", "เพิ่ม bold/italic", "จัด formatting"
  หรือส่งข้อความมาพร้อมบอกว่าอยากให้ readable มากขึ้น —
  เรียกใช้ผ่าน `/highlight` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[ข้อความที่ต้องการจัดรูปแบบ]"
disable-model-invocation: true
tools:
  - Write
  - Artifact
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

ตอบเป็น **Interactive Artifact (HTML) เสมอ** ไม่ว่าข้อความ input จะสั้นหรือยาวแค่ไหน — เหตุผลที่ใช้ HTML
แทน markdown เฉยๆ คือให้ผู้ใช้เห็นว่า bold/italic/highlight/underline จะ**หน้าตาจริงเป็นยังไง**เมื่อ paste
ลง Capacities แล้ว (สีเหลืองของ highlight, น้ำหนักของ bold ฯลฯ) ไม่ใช่แค่เห็น syntax ดิบเฉยๆ — แต่ผู้ใช้ก็ยัง
ต้องได้ syntax ดิบไปวางใน Capacities ด้วย ดังนั้นทุก Artifact ต้องมีปุ่ม **Copy Markdown** เสมอ

### ขั้นตอนสร้าง Artifact

1. ตัดสินใจ formatting ตามกฎด้านบนเหมือนเดิม แล้วประกอบ **markdown ดิบ** ของข้อความทั้งหมดไว้ก่อน
   (นี่คือสิ่งที่ปุ่ม Copy Markdown จะ copy ออกไป)
2. อ่าน `assets/template.html` — เป็น template ที่ออกแบบให้เลียนแบบสีและ style ของ Capacities จริงไว้ครบแล้ว
   (สีเหลือง highlight, bold, italic, code, underline, ปุ่ม copy พร้อม JS) ไม่ต้องออกแบบใหม่หรือแก้ CSS/JS
   ในนั้น แค่แทนที่ placeholder 3 ตัว:
   - `{{TITLE}}` — ชื่อสั้นๆ ของ artifact เช่น หัวข้อของข้อความ หรือ "Formatted Note" ถ้าไม่มีหัวข้อชัดเจน
   - `{{CONTENT_HTML}}` — แปลง markdown ดิบจากข้อ 1 เป็น HTML: ห่อแต่ละย่อหน้าด้วย `<p>`, แปลง
     `**text**` → `<strong>text</strong>`, `*text*` → `<em>text</em>`, `` `text` `` → `<code>text</code>`,
     `==text==` → `<mark>text</mark>`, `<u>text</u>` คงไว้เหมือนเดิม (เป็น HTML tag อยู่แล้ว)
   - `{{RAW_MARKDOWN_JSON}}` — markdown ดิบจากข้อ 1 ผ่าน JSON string escaping ให้ถูกต้อง (หนี double quote,
     backslash, newline) เพราะจะถูกฝังอยู่ใน `<script type="application/json">` ที่ปุ่ม copy อ่านค่าไป ตัวอย่าง
     ถ้า raw markdown คือ `**Kubernetes** คือ\nระบบจัดการ container` ต้องแทนที่ด้วย
     `"**Kubernetes** คือ\\nระบบจัดการ container"` (ครอบด้วย double quote, newline เป็น `\n` ตัวอักษร)
3. เขียนไฟล์ผลลัพธ์ (หลังแทน placeholder ครบแล้ว) ลง scratchpad ด้วย Write tool
4. เรียก Artifact tool publish ไฟล์นั้น — ใส่ `favicon: "🖍️"` เสมอ (คงที่ทุกครั้งตามกฎ favicon ของ Artifact tool)
   และ `description` สั้นๆ บอกว่าเป็นข้อความที่ format แล้วสำหรับ Capacities

หลัง Artifact ให้แสดง **1 paragraph สั้นๆ** อธิบายสิ่งที่เปลี่ยนแปลงหลัก เช่น:

> "เพิ่ม **bold** ให้คำสำคัญ 3 คำ (X, Y, Z) ==highlight== ที่ deadline และใส่ `code` สำหรับ command ทั้งหมด — ข้อความที่เหลือคง plain text ไว้เพื่อไม่ให้ formatting ดูหนักเกินไป"

# คำขอ:

- ต้องเลือก formatting ตามตารางและลำดับความสำคัญด้านบนเสมอ ไม่ใช่ตามความชอบ
- ==highlight== ใช้น้อยมาก (0–2 ครั้งต่อ note) เพื่อรักษาความหมาย "สำคัญที่สุด" ไว้จริง ๆ
- ตอบเป็น Interactive Artifact (HTML) เสมอ ห้ามตอบแบบ inline text ธรรมดา และห้ามตอบเป็น markdown
  artifact แบบเดิม — ต้องผ่าน `assets/template.html` เท่านั้น เพื่อให้ทุกครั้งหน้าตาเหมือนกัน
- ปุ่ม Copy Markdown ต้อง copy ได้ markdown ดิบที่ตรงกับสิ่งที่ render ไว้ในหน้าเป๊ะๆ ห้ามลืมอัปเดต
  `{{RAW_MARKDOWN_JSON}}` ให้ตรงกับ `{{CONTENT_HTML}}`
- หลัง Artifact ต้องมี 1 paragraph สรุปว่าปรับ formatting อะไรไปบ้าง

# ไฟล์แนบ:

- ข้อความธรรมดาที่ต้องการ format
- `assets/template.html` — template ของ Interactive Artifact ที่ออกแบบเลียนแบบ Capacities ไว้แล้ว
  ต้องอ่านและใช้ทุกครั้ง ไม่ต้องออกแบบ HTML/CSS ใหม่เอง
