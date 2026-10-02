---
name: highlight
description: >
  แปลงข้อความธรรมดาให้อ่านง่ายขึ้นด้วยการเน้นจุดสำคัญ — render เป็นภาพจริงในแชททันทีผ่าน HTML widget
  (bold, italic, code, ไฮไลต์สีจริง) ห้ามแก้ไขข้อความต้นฉบับ ใช้ทันทีเมื่อผู้ใช้วางข้อความธรรมดาแล้ว
  ต้องการให้อ่านง่ายขึ้น หรือขอให้ "highlight", "format", "เน้นสิ่งสำคัญ", "จัด note", "ทำตัวหนา"
  เรียกใช้ผ่าน `/highlight` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[ข้อความที่ต้องการจัดรูปแบบ]"
disable-model-invocation: true
---

# Highlight Formatter

ใส่ formatting ทับข้อความต้นฉบับเพื่อเน้นจุดสำคัญ — **ห้ามแก้คำ ลำดับ หรือเนื้อหาเดิม** ใส่ได้แค่ tag ครอบทับ
เป้าหมาย: เน้นเฉพาะสิ่งที่สำคัญจริง — ใส่มากเกินไปเท่ากับไม่ได้เน้นอะไรเลย

## Core Rules (Non-negotiable)

1. **ห้ามแก้คำ ลำดับ หรือเนื้อหาต้นฉบับเด็ดขาด** — ใส่ได้แค่ tag ครอบทับเท่านั้น
2. **Render ผ่าน `visualize:show_widget` เท่านั้น** — เรียก `visualize:read_me` โมดูล `mockup` ก่อนครั้งแรกในเซสชัน chat ปกติไม่ render markdown/`==highlight==` เป็นภาพจริงเสมอไป ห้ามใช้ `create_file`/Artifact
3. **ก่อนเรียก widget เขียนนำสั้นๆ 1 บรรทัด** (เช่น "ไฮไลต์ให้แล้วครับ") ห้ามอธิบายรายละเอียดหรือพิมพ์ข้อความซ้ำนอก widget
4. **ห้ามใส่หัวข้อ/คำนำ/คำอธิบายใน widget** — มีแต่ข้อความ format แล้วเท่านั้น

## Workflow

### 1. เลือก tag ตามกฎ

| เน้นอะไร | Tag | ความถี่/ย่อหน้า |
|---|---|---|
| command / path / ศัพท์เทคนิคเฉพาะทาง / ค่าที่ต้องตรงเป๊ะ | `<code>` | ทุกครั้งที่พบ |
| ประโยค/วลีที่เป็นใจความสำคัญที่สุดของย่อหน้า (คำเตือน/ข้อสรุป) | `<mark>` | 0–1 |
| ชื่อเรื่อง/entity หลัก/คำสำคัญรอง | `<strong>` | 3–6 คำ |
| ชื่อสื่อ/คำต่างชาติ/คำที่กำลังนิยาม/ชื่อเฉพาะ | `<em>` | ตามเนื้อหา |
| อื่นๆ | plain text | — |

ลำดับเมื่อ conflict: `code` > `mark` > `strong` > `em`. อย่าซ้อน tag บนคำเดียวกันเว้นแต่จำเป็นจริงๆ

### 2. จัดโครงสร้าง widget

```html
<h2 class="sr-only">[สรุป 1 ประโยค]</h2>
<div style="font-family: var(--font-sans); font-size: 16px; line-height: 1.8; color: var(--text-primary);">
  ...ข้อความเดิม + <strong>, <em>,
  <code style="background: var(--surface-1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 14px;">...</code>,
  <mark style="background: var(--bg-warning); color: var(--text-warning); padding: 1px 4px; border-radius: 3px;">...</mark>
</div>
```

### 3. Self-check ก่อน render
*หลักการ: ตรวจทานได้เองก่อนเรียก widget จริง เป็นการเทียบข้อความที่ใส่ tag แล้วกับต้นฉบับ ไม่มีผลข้างเคียง ต้นทุนต่ำ*
ก่อนเรียก `visualize:show_widget` ให้ตรวจทวนว่า: ข้อความใน widget ตรงกับต้นฉบับทุกคำ (ไม่มีคำไหนถูกแก้/เพิ่ม/ตัด), ลำดับ tag เป็นไปตามกฎ conflict (`code` > `mark` > `strong` > `em`), ไม่มี tag ซ้อนทับกันโดยไม่จำเป็น, ไม่มีหัวข้อ/คำนำ/คำอธิบายหลุดเข้าไปใน widget — ถ้าพบจุดผิด ให้แก้ก่อนเรียก widget

### 4. ส่งมอบผลลัพธ์
เขียนนำสั้นๆ 1 บรรทัดก่อนเรียก widget แล้ว render ผ่าน widget เท่านั้น ห้ามใช้ raw markdown ในคำตอบ ห้ามเปิด Artifact

## Supporting files
- ข้อความธรรมดาที่ต้องการ format
