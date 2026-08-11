# Pattern ของ marketplace นี้

อ่านไฟล์นี้ก่อนเขียน SKILL.md ใหม่ทุกครั้ง — เป้าหมายคือ skill ที่ copycat สร้างต้องแยกไม่ออกจาก
skill อื่นๆ ในนี้ ถ้าใครมาเปิดอ่านทีหลังไม่ควรรู้สึกว่ามันถูก "แปะเข้ามา" จากที่อื่น

## 1. โครงสร้างไดเรกทอรี

```
plugins/<plugin>/skills/<skill-name>/
├── SKILL.md              (required)
├── references/           (optional — .md ที่โหลดเฉพาะตอนต้องใช้ ไม่ใช่ทุกครั้งที่ trigger)
├── scripts/               (optional — โค้ดที่รันซ้ำได้แน่นอน เช่น เรียก API, parse ไฟล์)
└── assets/                (optional — ไฟล์ที่เอาไปใช้ตรงๆ ใน output เช่น license text, template)
```

`<skill-name>` เป็น kebab-case และต้องตรงกับ field `name` ใน frontmatter เป๊ะๆ

**scripts/ — กฎการเขียน:**
- Python stdlib ล้วน ไม่พึ่ง pip package ภายนอก (ดู `plugins/github/skills/github-tag/scripts/fetch_repo.py`
  และ `scripts/fetch_skill_source.py` ในโฟลเดอร์นี้เป็นตัวอย่าง) — เหตุผลคือเครื่องผู้ใช้อาจไม่มี
  pip package ที่ script ต้องการ แต่ python stdlib มีอยู่แล้วเกือบทุกเครื่อง
- ในตัว SKILL.md ต้องสั่งให้ "ลองรัน `python3` → `py` → `python` ตามลำดับ จนกว่าจะได้ผลลัพธ์จริง"
  เพราะ Windows มักมี `python`/`python3` เป็น alias เปล่าที่ไม่ได้ติดตั้งจริง (เปิด Microsoft Store)
- ใช้ absolute path ต่อจาก base directory ของ skill (ที่ระบบแจ้งตอนโหลด skill) เสมอ ไม่พึ่ง
  relative path เพราะ working directory ตอนรันอาจไม่ใช่โฟลเดอร์ของ skill

## 2. Frontmatter ของ SKILL.md

```yaml
---
name: skill-name
description: >
  [ภาษาไทย] อธิบายว่า skill ทำอะไร แล้วปิดท้ายด้วย "เรียกใช้ผ่าน `/skill-name` เท่านั้น —
  ไม่ auto-trigger จากบทสนทนา"
disable-model-invocation: true
tools:
  - Bash
  - Read
---
```

- **นโยบายปัจจุบันของ marketplace นี้คือ manual-invoke-only ทุก skill** — ทุก skill ต้องใส่
  `disable-model-invocation: true` เสมอ (field มาตรฐานของ Claude Code ยืนยันแล้วว่าใช้ได้จริง:
  ปิด auto-trigger จากบทสนทนา แต่เรียกผ่าน `/skill-name` ได้ตามปกติ) ยกเว้น skill ใน plugin
  `projects` เท่านั้นที่ไม่ต้องใส่ (ยังคงพฤติกรรมเดิม)
- เพราะงั้น `description` **ไม่ต้อง** เขียนแบบ pushy บอกให้ auto-trigger เหมือนที่เอกสาร skill-creator
  ทั่วไปแนะนำ (นั่นออกแบบมาสำหรับ skill ที่ auto-trigger ได้) — แทนที่ด้วยการอธิบายว่าทำอะไร ใช้ตอนไหน
  ให้ผู้ใช้ (คน) อ่านแล้วรู้ว่าจะเรียกเมื่อไหร่ แล้วปิดท้ายด้วยประโยคบอกวิธีเรียกตรงๆ ดูตัวอย่างจริงใน
  `plugins/productive/skills/save-cost/SKILL.md` หรือ `plugins/session/skills/session-name/SKILL.md`
- ภาษาไทยเป็นหลัก คงศัพท์เทคนิค/ชื่อเฉพาะภาษาอังกฤษไว้ (เช่น "GitHub topics", "API")
- ใช้ `/skill-name` เปล่าๆ ในประโยคเรียกใช้ ยกเว้น plugin `guide`, `language`, `utility` ที่ต้องมี
  prefix ชื่อ plugin ด้วย (เช่น `/utility:os-design`) — เช็ค README ของ plugin ปลายทางก่อนเขียนเสมอ
  เพราะ convention นี้ไม่ได้เหมือนกันทุก plugin
- `tools:` เป็น optional list — ใส่เฉพาะตอนที่ skill ต้องใช้เครื่องมือนอกเหนือจากอ่าน/เขียนข้อความ
  ทั่วไป (เช่น `Bash` ถ้ามี script ที่ต้องรัน, `Write` ถ้าต้องสร้างไฟล์ผลลัพธ์, `Agent` ถ้าต้อง
  dispatch subagent)

## 3. โครงสร้าง body

Skill ส่วนใหญ่ในนี้ใช้หัวข้อภาษาไทยชุดนี้ (ไม่ต้องมีครบทุกหัวข้อ เลือกที่เกี่ยวข้อง):

| หัวข้อ | ใช้ทำอะไร |
|---|---|
| `# บทบาท:` | อธิบายว่า Claude รับบทบาทอะไร + ทำไมงานนี้ถึงมีคุณค่า (ย่อหน้าสั้นๆ ไม่ใช่แค่ "คุณคือ X") |
| `# ขั้นตอน:` หรือ `# รูปแบบ:` | ลำดับการทำงานเป็นข้อๆ หรือ spec ของ output แต่ละข้อควรมี *หลักการ: ...* กำกับสั้นๆ ว่าทำไมข้อนี้ถึงสำคัญ แทนการเขียน MUST/ห้าม แบบไม่มีเหตุผล |
| `## Output` | ถ้า output มีรูปแบบตายตัว ใส่ template ใน code fence พร้อมตัวอย่าง input → output จริงอย่างน้อย 1 ชุด |
| `# คำขอ:` | กฎที่ต้องทำตามเสมอ เขียนเป็น bullet คำสั่ง (imperative) |
| `# ไฟล์แนบ:` | บอกว่ามี reference/asset ไฟล์อะไรบ้าง และเมื่อไหร่ต้องเปิดอ่าน |

**หลักการเขียน:** อธิบาย "ทำไม" แทนการออกคำสั่งห้วนๆ แบบ ALWAYS/NEVER ตัวพิมพ์ใหญ่ทั้งหมด — ถ้าเจอ
ตัวเองกำลังเขียนแบบนั้น ให้ถอยกลับมาอธิบายเหตุผลแทน (ดู `plugins/session/skills/session-name/SKILL.md`
เป็นตัวอย่างของ skill สั้นๆ ที่ยังคงอธิบายเหตุผลไว้ในทุกข้อ)

**ห้ามเดาสิ่งที่ไม่รู้:** skill ต้นทางหลายตัวเขียนแบบเดาข้อมูลที่ขาดหายไปเอง แต่ pattern ในนี้คือ
ถ้าขาด input ที่จำเป็น (URL, path, ชื่อ, ตัวเลือก) ให้ **ถามผู้ใช้ก่อนเสมอ** อย่าสุ่มเดา
(ดู `plugins/github/skills/github-tag/SKILL.md` ขั้นตอนที่ 0 เป็นตัวอย่าง)

## 4. Checklist หลังสร้าง/แก้ skill (ทำให้ครบก่อน commit เสมอ)

1. **`plugins/<plugin>/.claude-plugin/plugin.json`** — bump version: skill ใหม่ → bump minor
   (0.1.0 → 0.2.0), แก้ไข skill เดิม → bump patch (0.2.0 → 0.2.1) และอัปเดต `description`/`keywords`
   ถ้าขอบเขตของ plugin เปลี่ยน
2. **`plugins/<plugin>/README.md`** — เพิ่มแถวในตาราง Skills และเพิ่มบรรทัด usage (`/skill-name <args>`)
3. **`README.md` (root)** — อัปเดตจำนวน skills ของ plugin นั้นในตาราง Plugins ถ้า plugin ใหม่เอี่ยม
   ต้องเพิ่มทั้งแถวในตาราง (เรียงตามตัวอักษร) และบรรทัด `/plugin install <name>@natthasath-marketplace`
   (เรียงตามตัวอักษรเช่นกัน) รวมถึงเลข plugins/skills badge ที่หัวไฟล์
4. **`.claude-plugin/marketplace.json` (root)** — plugin ใหม่ → เพิ่ม entry ใน `plugins[]` พร้อม
   name, description, source, category, keywords; plugin เดิม → sync keywords ให้ตรงกับ plugin.json
5. **Commit ทั้งหมดในครั้งเดียว** — ไฟล์ skill ใหม่ + marketplace.json + README (root และ plugin) +
   plugin.json ใน commit เดียวกัน แล้วถามผู้ใช้ก่อน push เสมอ (อย่า push เองโดยไม่ถาม)

ดูตัวอย่างจริงของ checklist นี้ทั้งหมดถูกทำครบได้จาก git log ของ commit ที่แก้ plugin `github`
และ `session` ใน repo นี้ (`git log --oneline -- plugins/github plugins/session`)
