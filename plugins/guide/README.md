# 🎉 guide

Plugin for **recommendations and matching the right choice** — Design Style, Font Pairing, Web Design, Note-taking Pattern, and Diagram Design.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `creative-book` | แนะนำ Design Style + Font Pairing (ไทย/อังกฤษ) สำหรับ presentation, report, สื่อสิ่งพิมพ์ — 42 สไตล์ — เรียกผ่าน `/guide:creative-book` เท่านั้น ไม่ auto-trigger |
| `creative-web` | แนะนำ Design Style สำหรับเว็บไซต์ พร้อม Font, Color Palette (hex) และเว็บอ้างอิงจริง — 20 สไตล์ — เรียกผ่าน `/guide:creative-web` เท่านั้น ไม่ auto-trigger |
| `creative-diagram` | สร้างไดอะแกรม 39 ชนิด (architecture, flowchart, sequence, ER, Gantt, Sankey, Wardley ฯลฯ) เป็น HTML/SVG แบบ self-contained ตาม editorial design system ปรับแบรนด์ได้ รองรับ import จาก .drawio/Mermaid — เรียกผ่าน `/guide:creative-diagram` เท่านั้น ไม่ auto-trigger |
| `note-taking` | แนะนำ Pattern การจดโน้ตที่เหมาะกับงาน เช่น Cornell, Zettelkasten, PARA, Outline — เรียกผ่าน `/guide:note-taking` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/guide:creative-book
/guide:creative-web
/guide:creative-diagram
/guide:note-taking
```

### 💎 creative-book vs creative-web

| ด้าน | `/guide:creative-book` | `/guide:creative-web` |
|---|---|---|
| เป้าหมาย | งานสิ่งพิมพ์/นำเสนอ (slide, report) | เว็บไซต์ (landing page, web UI) |
| Output | Design Style + Font Pairing | Design Style + Font + Color Palette (hex) + เว็บอ้างอิง |
| ใช้เมื่อ | ทำ slide/report/pitch deck | ออกแบบเว็บให้เห็นภาพจากเว็บจริง |

### 💎 Web Design Styles

| Style | เหมาะกับ | เว็บอ้างอิง |
|---|---|---|
| Minimal | Portfolio, Startup, Blog | [Apple](https://apple.com) |
| Modern SaaS | SaaS, AI, Dashboard | [Stripe](https://stripe.com) |
| Glassmorphism | AI, Creative, Portfolio | [Linear](https://linear.app) |
| Dark Modern | Dashboard, AI | [Vercel](https://vercel.com) |
| Luxury | Jewelry, Hotel | [Rolex](https://www.rolex.com) |
| E-commerce | Shopping | [Nike](https://www.nike.com) |
