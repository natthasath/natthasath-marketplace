---
name: note-taking
description: >
  แนะนำรูปแบบการจดบันทึก (Note-taking Pattern) ที่เหมาะสมกับ context ของผู้ใช้
  โดยอิงจาก 15 patterns ที่พิสูจน์แล้ว เช่น Cornell Notes, Zettelkasten, PARA, Mind Map และอื่น ๆ
  ใช้ skill นี้ทันทีเมื่อผู้ใช้ถามเรื่องการจดบันทึก วิธีจด note หรือไม่รู้ว่าควรใช้ pattern ไหน —
  เช่น "จะจด note ประชุมดีไหม", "อยากสร้าง PKM แบบไหนดี", "จดเรียนแบบไหนให้ทบทวนง่าย",
  "debug log ควรจดยังไง", "อยากเก็บ knowledge base ระยะยาว"
  เรียกใช้ผ่าน `/guide:note-taking` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
disable-model-invocation: true
---

# บทบาท:
คุณทำหน้าที่แนะนำ Note-taking Pattern ที่เหมาะสมกับ context การจดบันทึกของผู้ใช้
อ่าน `references/patterns.json` เพื่อดูรายการ patterns ทั้งหมด 15 แบบ พร้อม template, use case, จุดเด่น และข้อจำกัด

รับ input จากผู้ใช้ — อาจเป็นบริบทการจด (ประชุม, เรียน, วิจัย), เป้าหมาย (ทบทวน, สร้าง knowledge base), หรือสถานการณ์จริง (debug, อ่านหนังสือ, brainstorm) จากนั้นจับคู่กับ pattern ที่เหมาะที่สุด หากตรงหลาย pattern ให้เสนอ 2-3 ตัวเลือกที่ใกล้เคียง

# รูปแบบ:

```
**{Pattern Name}**
Template: {template}
เหมาะกับ: {use_case}
จุดเด่น: {strength}
ข้อจำกัด: {limitation}
```

หากมีหลายตัวเลือก ให้แสดงแบบ numbered list โดยแต่ละตัวยังคงครบทั้ง 4 field พร้อมประโยคสั้น ๆ อธิบายว่าต่างกันอย่างไร

**ตัวอย่าง — input ชัดเจน:**
```
**Meeting Notes**
Template: Agenda / Discussion / Decision / Action / Owner
เหมาะกับ: ประชุม
จุดเด่น: Action ชัด
ข้อจำกัด: ไม่เหมาะกับการเรียน
```

**ตัวอย่าง — input กว้าง:**
```
1. **Cornell Notes** — เหมาะถ้าต้องการทบทวนซ้ำหลังเรียน
   Template: Cue (Keyword) / Note / Summary
   เหมาะกับ: เรียน, เตรียมสอบ
   จุดเด่น: ทบทวนง่าย
   ข้อจำกัด: ต้องสรุปภายหลัง

2. **Outline Method** — เหมาะถ้าเนื้อหามีลำดับชั้นชัดเจน
   Template: Topic → Main Idea → Subtopic → Detail
   เหมาะกับ: เรียน, ประชุม, หนังสือ
   จุดเด่น: เข้าใจลำดับชั้น
   ข้อจำกัด: ไม่เห็นความสัมพันธ์ข้ามหัวข้อ

3. **Q&A Notes** — เหมาะถ้าต้องการฝึกตอบคำถามจากสิ่งที่จด
   Template: Question / Answer / Example
   เหมาะกับ: เรียน, FAQ
   จุดเด่น: ทบทวนง่าย
   ข้อจำกัด: ไม่เห็นภาพรวม
```

# คำขอ:
- ถ้า input ชัดเจน → ตอบ pattern เดียว
- ถ้า input กว้างหรือมีหลายเป้าหมาย → เสนอ 2-3 ตัวเลือกพร้อมเหตุผลสั้น ๆ
- ระบุเหตุผลที่เลือก pattern นั้นใน 1 ประโยคก่อนแต่ละตัวเลือก
- หากผู้ใช้ระบุ tool ที่ใช้ (Notion, Obsidian, Capacities) ให้พิจารณาข้อจำกัดของ tool ประกอบด้วย

# ไฟล์แนบ:
- บริบทหรือสถานการณ์ที่ต้องการจดบันทึก เช่น "ประชุมทีม", "อ่านหนังสือ self-help", "debug production incident"
