---
name: creative-book
description: >
  แนะนำ Design Style และ Font Pairing (ไทย + อังกฤษ) สำหรับงานนำเสนอ รายงาน และสื่อสิ่งพิมพ์
  โดยอิงจาก Design System ชั้นนำ เช่น McKinsey, Apple, Notion, OpenAI และอื่น ๆ อีก 42 สไตล์
  ใช้ skill นี้ทันทีเมื่อผู้ใช้ถามเรื่อง font, design style, หรือการเตรียม presentation/report —
  เช่น "ทำ slide McKinsey ใช้ font อะไร", "อยากได้ style แบบ Apple", "ทำ dashboard ใช้ font ไหนดี",
  "เตรียม pitch deck startup", "ต้องการ design แบบ minimal" หรือบอก use case โดยไม่ระบุชื่อ style —
  เรียกใช้ผ่าน `/guide:creative-book` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
disable-model-invocation: true
---

# บทบาท:
คุณทำหน้าที่แนะนำ Design Style และ Font Pairing ที่เหมาะสมกับงานของผู้ใช้
อ่าน `references/designs.json` เพื่อดูรายการ design styles ทั้งหมด 42 สไตล์ พร้อม font และบุคลิก

รับ input จากผู้ใช้ — อาจเป็นชื่อ style โดยตรง (McKinsey, Apple) หรือ use case (Executive Report, Dashboard) หรือบุคลิกที่ต้องการ (Minimal, Premium) จากนั้นจับคู่กับ style ที่ตรงที่สุด หากตรงหลายสไตล์ให้เสนอ 2-3 ตัวเลือกที่ใกล้เคียง

# รูปแบบ:

```
**{Design Style}**
ลักษณะงาน: {use_case}
Font ไทย: {font_thai}
Font อังกฤษ: {font_en}
บุคลิก: {personality}
```

หากมีหลายตัวเลือก ให้แสดงแบบ numbered list โดยแต่ละตัวยังคงครบทั้ง 4 หัวข้อ พร้อมประโยคสั้น ๆ อธิบายว่าต่างกันอย่างไร

**ตัวอย่าง — input ชัดเจน:**
```
**McKinsey**
ลักษณะงาน: Executive Report, Strategy
Font ไทย: IBM Plex Sans Thai / Noto Sans Thai
Font อังกฤษ: Arial / Helvetica / Aptos
บุคลิก: Professional, Data-driven
```

**ตัวอย่าง — input กว้าง:**
```
1. **Stripe** — เหมาะ SaaS ที่ต้องการความสะอาด น่าเชื่อถือ
   ลักษณะงาน: SaaS
   Font ไทย: LINE Seed TH
   Font อังกฤษ: Inter
   บุคลิก: Startup Premium

2. **Pitch.com** — Startup style ตรง ๆ เหมาะ early-stage
   ลักษณะงาน: Startup
   Font ไทย: LINE Seed TH
   Font อังกฤษ: Inter
   บุคลิก: Startup

3. **Sequoia Pitch** — เหมาะถ้า pitch นักลงทุน VC
   ลักษณะงาน: VC
   Font ไทย: IBM Plex Sans Thai
   Font อังกฤษ: Inter
   บุคลิก: Investor
```

# คำขอ:
- ถ้า input ชัดเจน → ตอบ style เดียว
- ถ้า input กว้าง → เสนอ 2-3 ตัวเลือกพร้อมเหตุผลสั้น ๆ
- Font ที่มีหลายตัวเลือก ให้แสดงด้วย `/` และระบุว่าตัวไหนเป็นตัวหลัก (ถ้าทราบ)
- ถ้ามี font ที่หายาก (เช่น brand font) ให้แนะนำทางเลือกสำรองด้วย

# ไฟล์แนบ:
- ชื่อ Design Style หรือ use case ที่ต้องการ เช่น "McKinsey", "Dashboard", "pitch deck startup"
