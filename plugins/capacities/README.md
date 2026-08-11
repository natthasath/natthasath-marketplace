# 🎉 capacities

Plugin for **Capacities PKM** — designs Spaces, Object Types, Tags, Collections, Knowledge Notes, and Text Formatting into a consistent, fast-to-scan system.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `mood-tag` | วิเคราะห์อารมณ์จาก Daily Notes และแนะนำ Mood Tag ตาม Yale Mood Meter Framework — เรียกผ่าน `/mood-tag` เท่านั้น ไม่ auto-trigger |
| `movies-tag` | วิเคราะห์ genre/theme ของหนัง และแนะนำ Genre Tags สำหรับ Capacities — เรียกผ่าน `/movies-tag` เท่านั้น ไม่ auto-trigger |
| `spotify-tag` | จับคู่เพลงกับหมวด/Playlist ตามประเทศและ mood/แนวเพลง ค้นหาข้อมูลเพลงจากเว็บอัตโนมัติถ้าให้มาแค่ชื่อเพลง เสนอชื่อ Playlist ใหม่โทน Gen Z ถ้าไม่มีหมวดตรง — เรียกผ่าน `/spotify-tag` เท่านั้น ไม่ auto-trigger |
| `glossary` | อธิบายความหมายตัวย่อหรือศัพท์เทคนิค (Abbreviations / Acronyms) แบบ 1 paragraph — เรียกผ่าน `/glossary` เท่านั้น ไม่ auto-trigger |
| `knowledge` | สร้าง Knowledge Note พร้อม frontmatter และ sections ที่เป็นระบบ — เรียกผ่าน `/knowledge` เท่านั้น ไม่ auto-trigger |
| `highlight` | แปลงข้อความธรรมดาให้อ่านง่ายขึ้นด้วย bold, italic, code ที่ render จริงตรงในแชททันที ไม่ใช้ `==highlight==`/`<u>underline</u>` (render ไม่ได้จริง) ไม่มี Artifact แยกหน้า ไม่มี code block markdown ดิบต่อท้าย — เรียกผ่าน `/highlight` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/mood-tag <ข้อความ Daily Note>
/movies-tag <ชื่อหนังหรือคำอธิบายเนื้อเรื่อง>
/spotify-tag <ชื่อเพลง เนื้อเพลง หรือบรรยากาศที่ต้องการ>
/glossary <ตัวย่อหรือศัพท์เทคนิค>
/knowledge <คำศัพท์หรือหัวข้อที่ต้องการบันทึก>
/highlight <ข้อความที่ต้องการจัดรูปแบบ>
```

### 💎 Yale Mood Meter Zones

| โซน | Valence | Arousal | ตัวอย่าง |
|---|---|---|---|
| 🟡 Yellow | บวก | สูง | `#mood-joyful`, `#mood-excited` |
| 🔴 Red | ลบ | สูง | `#mood-stressed`, `#mood-frustrated` |
| 🟢 Green | บวก | ต่ำ | `#mood-calm`, `#mood-reflective` |
| 🔵 Blue | ลบ | ต่ำ | `#mood-sad`, `#mood-unsettled` |

### 💎 Highlight Formatting Guide

render ได้จริงในแชท Claude Code แค่ 3 แบบนี้ — ไม่ใช้ `==highlight==`/`<u>underline</u>` อีกต่อไปเพราะ chat renderer ไม่รองรับ (โผล่เป็นตัวอักษรดิบ ไม่ใช่สีเหลือง/ขีดเส้นใต้จริง)

| Formatting | Markdown | ใช้เมื่อ |
|---|---|---|
| **ตัวหนา** | `**text**` | คำสำคัญ, แนวคิดหลัก, ชื่อที่ต้องจำ, คำเตือน, deadline, ห้ามพลาด |
| *ตัวเอียง* | `*text*` | ชื่อสื่อ, คำต่างชาติ, นิยามครั้งแรก, proper noun พิเศษ |
| `code` | `` `text` `` | command, path, ค่า technical |
