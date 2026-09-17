# 🎉 natthasath-marketplace

A Claude Code plugin marketplace bundling 17 plugins, 70 skills, and 2 agents across PKM, project planning, session management, content writing, language, design, productivity, and legal/regulatory research — install with a single command and start using slash commands right away.

![plugins](https://img.shields.io/badge/plugins-17-blue)
![skills](https://img.shields.io/badge/skills-70-brightgreen)
![agents](https://img.shields.io/badge/agents-2-orange)
![Claude Code](https://img.shields.io/badge/Claude_Code-marketplace-8A63D2)
![license](https://img.shields.io/github/license/natthasath/natthasath-marketplace)

### ✨ Plugins

| Plugin | Skills | วัตถุประสงค์ |
|---|---|---|
| [`compliance`](plugins/compliance/README.md) | 2 agents | ค้นและสรุปกฎหมาย ระเบียบ ข้อบังคับจากแหล่งทางการ — Regulation Researcher (กฎหมายทั่วไป) และ Procurement Advisor (ระเบียบจัดซื้อจัดจ้างภาครัฐ) |
| [`capacities`](plugins/capacities/README.md) | 7 | จัดการ PKM บน Capacities — Tags, Knowledge Notes และ Text Formatting |
| [`creative`](plugins/creative/README.md) | 3 | แนะนำแนวทางออกแบบ — Design Style, Font Pairing, Web Design และ Note-taking |
| [`document`](plugins/document/README.md) | 2 | จัดการเอกสารภาษาไทย — ตรวจสอบหนังสือราชการ และ blind ข้อมูล sensitive |
| [`drive`](plugins/drive/README.md) | 1 | บันทึกไฟล์ไปยัง Google Drive อัตโนมัติ — ค้นหาและดาวน์โหลด ebook/PDF จากแหล่งถูกกฎหมายผ่าน Google Apps Script |
| [`github`](plugins/github/README.md) | 2 | จัดการงาน GitHub repo — เลือก/ติดตั้ง License และแนะนำ Tag สำหรับเก็บ repo ลง Capacities |
| [`insight`](plugins/insight/README.md) | 2 | วิเคราะห์ web analytics — Google Analytics 4 และ Microsoft Clarity ผ่าน MCP |
| [`language`](plugins/language/README.md) | 2 | จัดการงานด้านภาษา — ล่ามแปลต่อเนื่อง และ English Mentor |
| [`masterplan`](plugins/masterplan/README.md) | 5 | วางแผนโปรเจกต์ซอฟต์แวร์ — Requirement, Architecture และ Database Design |
| [`obsidian`](plugins/obsidian/README.md) | 1 | คลังความรู้แบบ markdown ที่เก็บนอก repo — เริ่มจาก Cookbook เทคนิคการใช้งาน AI CLI/Tools (Claude Code CLI, Claude Design, Codex CLI, Antigravity CLI) |
| [`productive`](plugins/productive/README.md) | 17 | เพิ่มประสิทธิภาพการทำงาน — สรุปประชุม, ดาวน์โหลด PDF, ประเมินงาน IT, สร้าง Flashcard, แปลงข้อความ/รูปเป็น ASCII art, สัมภาษณ์แบบ Socratic, ดัดแปลง skill จากที่อื่น, เข้ารหัสไฟล์สำหรับส่งต่ออย่างปลอดภัย, วิเคราะห์ Single Point of Failure, วางแผนรับมือสถานการณ์หน้างาน และบันทึก event ลง Google Calendar |
| [`projects`](plugins/projects/README.md) | 15 | จัดการ development project — scaffold workflow ตั้งแต่ setup จนถึง ship |
| [`refactor`](plugins/refactor/README.md) | 5 | ปรับปรุงโครงสร้างไฟล์ — Docker, Shell Script, README และโครงสร้าง command ของ CLI tool |
| [`roleplay`](plugins/roleplay/README.md) | 4 | จำลองบทบาทเพื่อฝึกทักษะ — สัมภาษณ์งาน, สอบสวน, กลยุทธ์ และภาษาอังกฤษ |
| [`session`](plugins/session/README.md) | 2 | จัดการ Session ของ Claude Code — ตั้งชื่อ บันทึกจุดประสงค์ และเขียนเอกสารส่งไม้ต่อตอนจบ session |
| [`social`](plugins/social/README.md) | 2 | สร้างโพสต์โซเชียลมีเดีย — Facebook และ LinkedIn |
| [`utility`](plugins/utility/README.md) | 2 | จัดการระบบปฏิบัติการ — OS Setup และ Config Snapshot |

### 🧩 Community Plugins

Plugin จากนักพัฒนาอื่นที่แนะนำ — ไม่ได้ bundle อยู่ใน marketplace นี้ ต้องติดตั้งแยกจาก repo ต้นทางเอง

| Plugin | Author | วัตถุประสงค์ |
|---|---|---|
| [`diagram-design`](https://github.com/cathrynlavery/diagram-design) | Cathryn Lavery | สร้างไดอะแกรมสไตล์ editorial 38 แบบ (architecture, flowchart, ER, Gantt, Sankey ฯลฯ) ส่งออกเป็นไฟล์ standalone HTML/SVG/PNG |

### 🚀 Install

```shell
# 1. เพิ่ม marketplace
/plugin marketplace add natthasath/natthasath-marketplace

# 2. ติดตั้ง plugin ที่ต้องการ
/plugin install compliance@natthasath-marketplace
/plugin install capacities@natthasath-marketplace
/plugin install creative@natthasath-marketplace
/plugin install document@natthasath-marketplace
/plugin install drive@natthasath-marketplace
/plugin install github@natthasath-marketplace
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
