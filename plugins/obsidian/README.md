# 🎉 obsidian

Plugin สำหรับ **คลังความรู้แบบ markdown ที่เก็บนอก repo** — เริ่มจาก skill `cookbook` (คลังเทคนิคการใช้งาน
AI CLI/Tools: Claude Code CLI, Claude Design, Codex CLI, Antigravity CLI) เก็บเป็นไฟล์ markdown ที่เปิดอ่านได้ตรงๆ
ใน Obsidian หรือ editor ที่ render markdown ได้ ไว้นอก repo ของ plugin เพื่อไม่ให้ข้อมูลหายเวลา plugin อัปเดต version

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `cookbook` | ดู เพิ่ม แก้ไข และค้นหาเทคนิคการใช้งาน CLI/AI tools ต่างๆ — เรียกผ่าน `/obsidian:cookbook` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/obsidian:cookbook
```

### 💾 ที่เก็บข้อมูล

เทคนิคทั้งหมดเก็บอยู่นอก repo นี้ ที่ path ซึ่งกำหนดไว้ใน `~/.config/claude-obsidian/settings.json`
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
