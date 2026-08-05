อ่าน README.md ของ `E:\code\prod\claude-marketplace` แล้ว สรุปว่าโปรเจกต์นี้คือ **natthasath-marketplace** — Claude Code plugin marketplace ที่รวม 13 plugins / 58 skills ครอบคลุม PKM, project planning, DevOps, content writing, language, design และ productivity ติดตั้งผ่านคำสั่ง `/plugin marketplace add` และ `/plugin install`

ถ้าจะบันทึกโน้ตนี้ลง Capacities แนะนำ tag ดังนี้ครับ

## Tag หลัก (ต้องมี)

- `#claude-code` — ตัวตนหลักของโปรเจกต์ ทุกอย่างสร้างมาเพื่อขยายความสามารถของ Claude Code โดยเฉพาะ
- `#plugin-marketplace` — โครงสร้างเป็น marketplace ที่รวม plugin หลายตัวไว้ให้ติดตั้งผ่านคำสั่งเดียว ตรงกับรูปแบบ note ที่น่าจะเจอซ้ำถ้ามีการเก็บ marketplace อื่นๆ ไว้เทียบกัน
- `#ai-agent` — เนื้อหาทั้งหมดคือ skill/agent behavior สำหรับ LLM ไม่ใช่แอปทั่วไป

## Tag รอง (ตามหมวดของ plugin ที่มีอยู่จริงในโปรเจกต์)

- `#pkm` — ตรงกับ plugin `capacities` (จัดการ Tags, Knowledge Notes, Text Formatting) ซึ่งเป็นหมวดที่ใหญ่และตรงกับสิ่งที่คุณกำลังใช้ Capacities อยู่แล้ว
- `#devops` — ตรงกับ plugin `devops`, `refactor` (Docker, Shell script) และ `insight` (analytics)
- `#productivity` — ตรงกับ plugin `productive` (สรุปประชุม, flashcard, indicator, scorecard ฯลฯ) ซึ่งมี skill มากที่สุด (10 skills)
- `#software-planning` — ตรงกับ plugin `masterplan` และ `projects` (requirement, architecture, database design, scaffold workflow)
- `#design-guide` — ตรงกับ plugin `guide` (design style, font pairing, note-taking)
- `#thai-content` — เนื้อหา README และหลาย skill (เช่น เอกสารราชการใน `document`, roleplay สอบสวน) เขียนเป็นภาษาไทยและอิงบริบทไทยโดยเฉพาะ เหมาะเป็น tag แยกถ้าคุณมีโน้ตทั้งภาษาไทย/อังกฤษปนกันใน Capacities

## เหตุผลในการเลือก

ผมยึดหลัก 2 ชั้น: **tag ตัวตน** (สิ่งนี้คืออะไรในเชิงเทคโนโลยี — Claude Code plugin) กับ **tag หมวดหมู่เนื้อหา** (อิงตามตารางหมวด plugin ที่ระบุไว้ตรงๆ ใน README เช่น PKM, DevOps, Design, Productivity) เพื่อให้ค้นเจอได้ทั้งจากมุม "นี่คือเครื่องมือ AI อะไร" และมุม "อยู่ในหมวดงานไหนของฉัน" ไม่แนะนำให้ tag แยกทีละ 13 plugin เพราะจะทำให้ note นี้ (ซึ่งพูดถึงภาพรวมทั้ง repo) มี tag เยอะเกินไปโดยไม่ช่วยการค้นคืนจริง — ให้เก็บ tag ระดับ plugin ย่อยไว้ใช้ตอนสร้างโน้ตเจาะจงราย skill/plugin แทน
