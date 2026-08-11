# 🎉 masterplan

Plugin for **software project planning and analysis** — covers everything from Requirements through Architecture and Database Design, ready for implementation.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `kickoff` | ช่วยนักพัฒนาวางแผนไอเดียแอปผ่านการสนทนา และสร้าง `masterplan.md` — เรียกผ่าน `/kickoff` เท่านั้น ไม่ auto-trigger |
| `gather` | เก็บรวบรวม Business และ Technical Requirements จาก Stakeholders อย่างเป็นระบบ — เรียกผ่าน `/gather` เท่านั้น ไม่ auto-trigger |
| `analyze` | แปลง Business Needs เป็น Functional และ Technical System Requirements — เรียกผ่าน `/analyze` เท่านั้น ไม่ auto-trigger |
| `architect` | เลือกและกำหนด IT Architecture ที่จะใช้ ครอบคลุม Infrastructure, Application และ Integration Strategy — เรียกผ่าน `/architect` เท่านั้น ไม่ auto-trigger |
| `database` | ออกแบบ Database Schema สำหรับ PostgreSQL และ Laravel พร้อม Migration-ready guidance — เรียกผ่าน `/database` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

ทั้ง 5 skill เรียงตามลำดับที่ใช้จริงในโปรเจกต์หนึ่งตัว — เริ่มจากไอเดีย จบที่ schema ที่ migrate ได้

```
/kickoff <ไอเดียแอปหรือระบบที่อยากทำ>
/gather <ขอบเขตระบบที่ต้องเก็บ requirement>
/analyze <business needs ที่ต้องแปลงเป็น requirement>
/architect <ระบบที่ต้องเลือก architecture และ tech stack>
/database <ระบบที่ต้องออกแบบ schema>
```

### 💎 /kickoff vs /init

| ด้าน | `/kickoff` | `/init` (Claude Code built-in) |
|---|---|---|
| **Input** | Idea ในหัว ยังไม่มีโค้ด | Codebase ที่มีอยู่แล้ว |
| **Output** | `masterplan.md` (blueprint สำหรับ developer) | `CLAUDE.md` (ให้ Claude เข้าใจ repo) |
| **Stage** | ก่อนเริ่ม code เลย | หลัง project มีอยู่แล้ว |
| **วัตถุประสงค์** | วางแผน project ใหม่จากศูนย์ | Document codebase ที่มี |

> `/kickoff` คือสิ่งที่ทำ **ก่อน** `/init` — เปลี่ยน idea ให้เป็นแผน แล้วค่อย init repo
