# 🎉 cookbook

Plugin สำหรับ **คลังเทคนิคการใช้งาน AI CLI/Tools** — เก็บไฟล์ markdown แยกโฟลเดอร์ตาม tool (Claude Code CLI,
Claude Design, Codex CLI, Antigravity CLI) ไว้นอก repo ของ plugin เพื่อไม่ให้ข้อมูลหายเวลา plugin อัปเดต version
เพิ่มเทคนิคใหม่ได้เรื่อยๆ ทั้งพิมพ์เพิ่มเองหรือสั่งให้ Claude ไปค้น/อัพเดทให้

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `cookbook` | ดู เพิ่ม แก้ไข และค้นหาเทคนิคการใช้งาน CLI/AI tools ต่างๆ — เรียกผ่าน `/cookbook:cookbook` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/cookbook:cookbook
```

### 💾 ที่เก็บข้อมูล

เทคนิคทั้งหมดเก็บอยู่นอก repo นี้ ที่ path ซึ่งกำหนดไว้ใน `~/.config/claude-cookbook/settings.json`
(ถามผู้ใช้ตอนเรียกใช้ครั้งแรก) แต่ละ tool มีโฟลเดอร์ของตัวเอง พร้อม `README.md` เป็น index:

```
<storage_path>/
├── claude-code/
├── claude-design/
├── codex-cli/
├── antigravity-cli/
└── <tool ใหม่ที่เพิ่มภายหลัง>/
```

รูปแบบไฟล์เทคนิคแต่ละไฟล์ (frontmatter + heading order) ดูได้ที่ `skills/cookbook/references/template.md`
