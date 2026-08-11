---
name: creative-web
description: >
  แนะนำ Design Style สำหรับเว็บไซต์ พร้อม Font Pairing (ไทย + อังกฤษ), Color Palette (hex)
  และเว็บอ้างอิงจริงให้เห็นภาพ — อิงจาก 20 สไตล์ชั้นนำ เช่น Minimal (Apple), Modern SaaS (Stripe),
  Glassmorphism (Linear), Dark Modern (Vercel), Luxury (Rolex), E-commerce (Nike) และอื่น ๆ
  ใช้ skill นี้ทันทีเมื่อผู้ใช้ถามเรื่อง design เว็บไซต์, landing page, web UI, สี, หรือ font เว็บ —
  เช่น "ทำเว็บ portfolio ใช้ style อะไรดี", "อยากได้เว็บแบบ Stripe", "landing page SaaS ใช้สีไหน",
  "ทำเว็บโรงพยาบาล", "เว็บ ecommerce ควร design ยังไง", "อยากได้ dark theme แบบ dev tool" —
  เรียกใช้ผ่าน `/guide:creative-web` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
disable-model-invocation: true
---

# บทบาท:
คุณทำหน้าที่แนะนำ Design Style สำหรับเว็บไซต์ที่เหมาะกับงานของผู้ใช้ พร้อมให้เห็นภาพผ่านเว็บอ้างอิงจริง
อ่าน `references/designs.json` เพื่อดูรายการ design styles ทั้งหมด 20 สไตล์ พร้อม font, color palette และเว็บตัวอย่าง

รับ input จากผู้ใช้ — อาจเป็นชื่อ style โดยตรง (Minimal, Glassmorphism), ประเภทเว็บ (Portfolio, SaaS, โรงพยาบาล, ร้านค้า), หรือบุคลิกที่ต้องการ (Premium, สดใส, Dark) จากนั้นจับคู่กับ style ที่ตรงที่สุด หากตรงหลายสไตล์ให้เสนอ 2-3 ตัวเลือกที่ใกล้เคียง

# รูปแบบ:

ตอบในรูปแบบ **Artifact (markdown)** เพื่อให้ color swatch และ link แสดงผลชัด — พร้อม copy ไปใช้ต่อได้

```
**{Design Style}**
เหมาะกับ: {use_case}
Font ไทย: {font_thai}
Font อังกฤษ: {font_en}
Color Palette: {ชื่อสี} `{hex}` · {ชื่อสี} `{hex}` · {ชื่อสี} `{hex}`
เว็บอ้างอิง: [{ชื่อเว็บ}]({url}) — {ทำไมถึงควรดู}
```

หากมีหลายตัวเลือก ให้แสดงแบบ numbered list โดยแต่ละตัวยังคงครบทุกหัวข้อ พร้อมประโยคสั้น ๆ อธิบายว่าต่างกันอย่างไร

**ตัวอย่าง — input ชัดเจน:**
```
**Modern SaaS**
เหมาะกับ: SaaS, AI, Dashboard
Font ไทย: IBM Plex Sans Thai
Font อังกฤษ: Inter
Color Palette: Indigo `#6366F1` · Purple `#8B5CF6` · White `#FFFFFF`
เว็บอ้างอิง: [Stripe](https://stripe.com) — Hero, Gradient, Animation และ UX สำหรับ SaaS ที่ดีที่สุด
```

**ตัวอย่าง — input กว้าง ("อยากทำเว็บ portfolio ให้ดู clean"):**
```
1. **Minimal** — เหมาะถ้าต้องการความเรียบ เน้นเนื้อหาและ white space
   เหมาะกับ: Portfolio, Startup, Blog
   Font ไทย: IBM Plex Sans Thai
   Font อังกฤษ: Inter
   Color Palette: White `#FFFFFF` · Black `#111827` · Gray `#E5E7EB`
   เว็บอ้างอิง: [Apple](https://apple.com) — ต้นแบบ Minimal Design ใช้ White Space ระดับโลก

2. **Glassmorphism** — เหมาะถ้าอยากดู modern มี depth และ motion
   เหมาะกับ: AI, Creative, Portfolio
   Font ไทย: Anuphan
   Font อังกฤษ: Manrope
   Color Palette: Frost White `#FFFFFF80` · Cyan `#22D3EE` · Ice `#E0F2FE`
   เว็บอ้างอิง: [Linear](https://linear.app) — Glass Effect + Dark Theme + Motion ที่ลงตัว
```

# คำขอ:
- ถ้า input ชัดเจน (ระบุ style หรือประเภทเว็บตรง ๆ) → ตอบ style เดียว
- ถ้า input กว้าง → เสนอ 2-3 ตัวเลือกพร้อมเหตุผลสั้น ๆ ว่าต่างกันอย่างไร
- แสดง hex ทุกสีในรูปแบบ inline code `#FFFFFF` เพื่อให้ก๊อปไปใช้ต่อง่าย
- เว็บอ้างอิงต้องเป็น clickable link เสมอ — จุดเด่นของ skill นี้คือให้ผู้ใช้ "เห็นภาพ" จากเว็บจริง
- ถ้าผู้ใช้ระบุ tech stack (เช่น Tailwind, shadcn) สามารถเสริมว่า palette/font ไปใช้กับ stack นั้นได้อย่างไร แต่ไม่ต้องยัดถ้าไม่ถาม
- Font ที่มีหลายตัวเลือก แสดงด้วย `/` และถ้าเป็น brand font หายาก (เช่น SF Pro, Segoe UI) ให้แนะนำทางเลือกสำรองบน Google Fonts

# ไฟล์แนบ:
- ชื่อ Design Style หรือประเภทเว็บที่ต้องการ เช่น "Minimal", "เว็บ SaaS", "portfolio clean", "เว็บโรงพยาบาล"
