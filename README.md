# 🎉 natthasath-marketplace

A Claude Code plugin marketplace bundling 15 plugins and 66 skills across PKM, project planning, session management, content writing, language, design, and productivity — install with a single command and start using slash commands right away.

![plugins](https://img.shields.io/badge/plugins-15-blue)
![skills](https://img.shields.io/badge/skills-66-brightgreen)
![Claude Code](https://img.shields.io/badge/Claude_Code-marketplace-8A63D2)
![license](https://img.shields.io/github/license/natthasath/natthasath-marketplace)

### ✨ Plugins

| Plugin | Skills | วัตถุประสงค์ |
|---|---|---|
| [`capacities`](plugins/capacities/README.md) | 6 | จัดการ PKM บน Capacities — Tags, Knowledge Notes และ Text Formatting |
| [`document`](plugins/document/README.md) | 2 | จัดการเอกสารภาษาไทย — ตรวจสอบหนังสือราชการ และ blind ข้อมูล sensitive |
| [`github`](plugins/github/README.md) | 2 | จัดการงาน GitHub repo — เลือก/ติดตั้ง License และแนะนำ Tag สำหรับเก็บ repo ลง Capacities |
| [`guide`](plugins/guide/README.md) | 3 | แนะนำแนวทางออกแบบ — Design Style, Font Pairing, Web Design และ Note-taking |
| [`insight`](plugins/insight/README.md) | 2 | วิเคราะห์ web analytics — Google Analytics 4 และ Microsoft Clarity ผ่าน MCP |
| [`language`](plugins/language/README.md) | 2 | จัดการงานด้านภาษา — ล่ามแปลต่อเนื่อง และ English Mentor |
| [`masterplan`](plugins/masterplan/README.md) | 5 | วางแผนโปรเจกต์ซอฟต์แวร์ — Requirement, Architecture และ Database Design |
| [`obsidian`](plugins/obsidian/README.md) | 1 | คลังความรู้แบบ markdown ที่เก็บนอก repo — เริ่มจาก Cookbook เทคนิคการใช้งาน AI CLI/Tools (Claude Code CLI, Claude Design, Codex CLI, Antigravity CLI) |
| [`productive`](plugins/productive/README.md) | 13 | เพิ่มประสิทธิภาพการทำงาน — สรุปประชุม, ดาวน์โหลด PDF, ประเมินงาน IT, สร้าง Flashcard, แปลงข้อความ/รูปเป็น ASCII art, สัมภาษณ์แบบ Socratic และดัดแปลง skill จากที่อื่น |
| [`projects`](plugins/projects/README.md) | 15 | จัดการ development project — scaffold workflow ตั้งแต่ setup จนถึง ship |
| [`refactor`](plugins/refactor/README.md) | 5 | ปรับปรุงโครงสร้างไฟล์ — Docker, Shell Script, README และโครงสร้าง command ของ CLI tool |
| [`roleplay`](plugins/roleplay/README.md) | 4 | จำลองบทบาทเพื่อฝึกทักษะ — สัมภาษณ์งาน, สอบสวน, กลยุทธ์ และภาษาอังกฤษ |
| [`session`](plugins/session/README.md) | 2 | จัดการ Session ของ Claude Code — ตั้งชื่อ บันทึกจุดประสงค์ และเขียนเอกสารส่งไม้ต่อตอนจบ session |
| [`social`](plugins/social/README.md) | 2 | สร้างโพสต์โซเชียลมีเดีย — Facebook และ LinkedIn |
| [`utility`](plugins/utility/README.md) | 2 | จัดการระบบปฏิบัติการ — OS Setup และ Config Snapshot |

### 🚀 Install

```shell
# 1. เพิ่ม marketplace
/plugin marketplace add natthasath/natthasath-marketplace

# 2. ติดตั้ง plugin ที่ต้องการ
/plugin install capacities@natthasath-marketplace
/plugin install document@natthasath-marketplace
/plugin install github@natthasath-marketplace
/plugin install guide@natthasath-marketplace
/plugin install insight@natthasath-marketplace
/plugin install language@natthasath-marketplace
/plugin install masterplan@natthasath-marketplace
/plugin install obsidian@natthasath-marketplace
/plugin install productive@natthasath-marketplace
/plugin install projects@natthasath-marketplace
/plugin install refactor@natthasath-marketplace
/plugin install roleplay@natthasath-marketplace
/plugin install session@natthasath-marketplace
/plugin install social@natthasath-marketplace
/plugin install utility@natthasath-marketplace
```

### 📜 License

This project is licensed under the [MIT License](LICENSE).
