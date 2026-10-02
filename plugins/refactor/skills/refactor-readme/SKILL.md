---
name: refactor-readme
description: >
  รีแฟกเตอร์ไฟล์ README.md ให้เป็น pattern มาตรฐานเดียวกัน อ่านง่าย ดู minimal
  แบบ open-source repo บน GitHub — จัดโครงสร้าง section, ใส่ emoji ตาม convention,
  เพิ่ม badges และจัด code block / table ให้ scan ได้เร็ว
  ใช้ skill นี้ทันทีเมื่อผู้ใช้แชร์หรือขอปรับปรุงไฟล์ README เช่น "ช่วยจัด README ให้หน่อย",
  "refactor readme นี้", "ทำ README ให้สวยแบบ github", "เขียน README สำหรับโปรเจกต์ FastAPI",
  "README ดูรก ช่วยจัดใหม่" เรียกใช้ผ่าน `/refactor-readme` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[path ของ README.md]"
disable-model-invocation: true
---

# README Standardizer

คุณทำหน้าที่รีแฟกเตอร์ไฟล์ `README.md` ให้เป็นมาตรฐานเดียวกันทุกโปรเจกต์ — อ่านง่าย ดู minimal และให้อารมณ์เหมือน repo open-source คุณภาพดีบน GitHub

README คือหน้าแรกที่คนเจอเมื่อเปิด repo — มันตัดสินใน 5 วินาทีแรกว่าโปรเจกต์นี้ดูน่าเชื่อถือและใช้งานง่ายไหม README ที่มีโครงสร้างสม่ำเสมอทำให้คนสแกนหาสิ่งที่ต้องการเจอเร็ว และทำให้ทุกโปรเจกต์ในองค์กรดูเป็นชุดเดียวกัน

## Core Rules (Non-negotiable)

1. **แก้ไฟล์ตรงๆ ในโปรเจกต์ ไม่ต้องตอบเป็น Artifact** — ผู้ใช้ทำงานใน Claude Code ที่มี filesystem อยู่แล้ว การให้ copy-paste กลับไปวางเองเป็นขั้นตอนเกินจำเป็นและเสี่ยงตกหล่นถ้าไฟล์ยาว
2. **ห้ามเขียนทับไฟล์โดยไม่แน่ใจว่าเนื้อหาตรงกับโปรเจกต์ที่กำลังทำงานอยู่จริง** — ถ้าไม่แน่ใจว่าเนื้อหานี้ควรไปแทนที่ไฟล์ไหน ให้ถามผู้ใช้ก่อนเสมอ (ดู Edge cases) การเขียนทับผิดไฟล์กู้คืนยาก
3. **ต้องระบุก่อนเสมอว่า README นี้เป็น Main/Root หรือ Sub-folder README** เพราะ `references/structure.md` มี 2 pattern แยกกัน ใช้ template ผิดระดับจะได้โครงที่ไม่ตรง
4. **รักษาเนื้อหาเดิมทั้งหมด** — จัดระเบียบและเปลี่ยนรูปแบบ ไม่ใช่ลบข้อมูลจริงทิ้ง ถ้าเนื้อหาเดิมมี command, endpoint, config ต้องคงไว้ครบ
5. **Header/Section title ต้องเป็นภาษาอังกฤษเสมอ** (ทำให้ repo ดู professional และ accessible กับ audience ที่กว้างกว่า) ส่วนเนื้อหาใน table/bullet ยังใช้ภาษาตาม context ของโปรเจกต์ได้
6. **ก่อนใส่ badge ต้องเช็ค repo visibility ก่อนเสมอ** — dynamic badge ที่พึ่ง GitHub API จะขึ้น "repo not found" ถ้า repo เป็น private เพราะ shields.io เรียก public API แบบไม่มี auth
7. **หลังเขียนไฟล์เสร็จ สรุปสั้นๆ 1-2 บรรทัดในแชทว่าปรับอะไรไปบ้าง** ไม่ต้องแปะเนื้อหาไฟล์ทั้งหมดซ้ำในแชท

## Workflow

### 1. อ่าน reference ที่เกี่ยวข้องก่อนเริ่ม
ก่อน generate ให้อ่าน 4 ไฟล์ใน Supporting files ด้านล่างเสมอ โดยเฉพาะ `references/structure.md` เพื่อดู
section order และ `references/example.md` เพื่อดู benchmark ของ tone

### 2. หา path ปลายทางและเลือกวิธีเขียน
- **หา path ปลายทาง** — ถ้าผู้ใช้ระบุ path มาให้ใช้ตามนั้น ถ้าไม่ระบุแต่ทำงานอยู่ใน project ที่มี `README.md` อยู่แล้ว (root หรือ sub-folder ตามบริบทของคำขอ) ให้ใช้ path ของไฟล์นั้น
- **มีไฟล์เดิมอยู่แล้ว** → อ่านด้วย Read ก่อนเสมอเพื่อดูเนื้อหาจริงทั้งหมด แล้วเขียนทับด้วย Write เพราะการรีแฟกเตอร์มักจัดลำดับ/โครง section ใหม่ทั้งไฟล์ ไม่ใช่แก้ทีละจุด — Edit (find/replace บางส่วน) จะไม่เหมาะกับงานที่โครงเปลี่ยนทั้งก้อนแบบนี้
- **ยังไม่มีไฟล์ README.md ในโปรเจกต์เลย** (โปรเจกต์ใหม่ หรือผู้ใช้บอกแค่ชื่อโปรเจกต์/tech stack) → สร้างไฟล์ `README.md` ใหม่ด้วย Write ที่ root ของโปรเจกต์ที่กำลังทำงานอยู่ (หรือ path ที่ผู้ใช้ระบุ) เลย ไม่ต้องถามเพิ่ม
- **ไม่มี context ของโปรเจกต์จริงๆ** (เช่น ผู้ใช้แปะเนื้อหา README มาในแชทล้วนๆ โดยไม่มี working directory ให้เขียนถึง) → ตอบเป็น markdown code block ในแชทแทน เพราะไม่มีไฟล์ให้เขียนถึงจริง

### 3. ระบุระดับของ README ก่อนเลือกโครง
เพราะ `references/structure.md` มี 2 pattern แยกกัน:

- **Main / Root README** — README เดียวของ repo หรือของโปรเจกต์ทั้งก้อน → ใช้โครงเต็มด้านล่าง (Section Order ใน structure.md)
- **Sub-folder README** — README ที่อยู่ในโฟลเดอร์ component ย่อยของ monorepo (เช่น `plugins/<name>/README.md`, `packages/<name>/README.md`) ที่ main README อื่นลิงก์เข้ามา → ใช้ **Sub-folder README Pattern** ใน structure.md แทน (กระชับกว่า: Title + Description + Skills/Components + Usage/Workflow เมื่อมี + extra สูงสุด 1 อัน — **ห้าม** ใส่ Badges, Installation, License หรือ section อื่นที่เป็นของระดับ repo ทั้งก้อน แม้จะมีเนื้อหาจริงก็ตาม)

สัญญาณว่าเป็น sub-folder README: ผู้ใช้ระบุ path ที่อยู่ในโฟลเดอร์ย่อยของ repo ที่มี README หลักอยู่แล้ว หรือพูดถึง "README ของ plugin/module/component นี้" โดยตรง — ถ้าไม่ชัดเจนให้ถามก่อน generate

### 4. จัดโครง Main README ตามมาตรฐาน

โครงของ Main README มาตรฐาน:

```
# 🎉 {Project Title}

{intro paragraph — 1-3 sentences in English: what this project is and what problem it solves}

![build](...) ![version](...) ![license](...)

### {emoji} {Section}
{เนื้อหา — code block / table / bullet}

### {emoji} {Section}
...
```

หลักการจัดโครงสร้าง:
1. **Title** — `# 🎉 {ชื่อโปรเจกต์}` เสมอ
2. **Intro** — 1-3 ประโยค **ภาษาอังกฤษ** บอกว่ามันคืออะไรและแก้ปัญหาอะไร (ดู tone จาก example)
3. **ก่อนใส่ badge ต้องเช็ค repo visibility ก่อนเสมอ** — dynamic badge ที่พึ่ง GitHub API (build status, release version, license, stars, last commit, open issues, Codecov) จะขึ้น "repo not found" ถ้า repo เป็น **private** เพราะ shields.io เรียก public API แบบไม่มี auth ไม่เห็นข้อมูล private repo วิธีเช็คและว่าควรทำยังไงต่อ ดูที่ `references/emoji.md` หัวข้อ "Public vs Private Repo"
4. **Badges** — วาง shields.io ใต้ intro ตามลำดับ 6 กลุ่มใน `references/emoji.md` (Project Health → Release → Compatibility → Distribution → License → Community/Activity) ใส่เฉพาะกลุ่มที่มีข้อมูลจริงของโปรเจกต์นั้นรองรับ ข้ามกลุ่มที่ไม่เกี่ยวไปเลย — ตัวอย่างในโครงด้านบนเป็นแค่ 3 กลุ่มตัวอย่าง ไม่ใช่ชุดตายตัว
5. **Sections** — ใช้ `### {emoji} {ชื่อ}` **ภาษาอังกฤษเท่านั้น** โดยเลือก emoji จาก `references/emoji.md` ตามความหมายของ section เสมอ ไม่สุ่ม
6. **เรียง section** ตามลำดับใน `references/structure.md` — ตัด section ที่ไม่มีเนื้อหาจริงทิ้ง ไม่ต้องใส่ placeholder ว่าง

**ทำไม header ต้องเป็น English:** header คือสิ่งแรกที่ GitHub visitor เห็น — English ทำให้ repo ดู professional และ accessible กับ audience ที่กว้างกว่า ส่วนเนื้อหาใน table / bullet ยังใช้ภาษาตาม context ของโปรเจกต์ได้

### 5. เขียนเนื้อหาให้ scan ได้เร็ว
- เลือก emoji จาก mapping ใน `references/emoji.md` ตามหน้าที่ของ section — ความสม่ำเสมอสำคัญกว่าความสวย
- code block ระบุภาษาเสมอ (` ```shell `, ` ```python `, ` ```yaml `) เพื่อให้ syntax highlight ทำงาน
- แปลงข้อมูลที่มี structure (เปรียบเทียบ, list ค่า) เป็น table หรือ bullet ให้ scan ได้เร็ว
- endpoint และ external tool ทำเป็น clickable link เสมอ
- **minimal** — ตัดคำฟุ่มเฟือย, ตัด section ที่ไม่มีเนื้อหาจริงทิ้ง, ไม่ต้องใส่ Table of Contents ถ้า README สั้น
- **เส้นคั่น `---` ใช้คั่นโซน ไม่ใช่คั่น section** — README แบ่งเป็น 4 โซนตามคำถามในใจคนอ่าน (Orientation → Setup → Operation → Project) ใส่เส้นที่รอยต่อโซนได้เฉพาะตอนที่ทั้งสองฝั่งมี section อย่างละ 3 อันขึ้นไป ดูตารางโซนและกฎ syntax ใน `references/structure.md` หัวข้อ "Horizontal Rule" — ระวังเคส `---` ติดใต้ข้อความที่จะกลายเป็นหัวข้อ H2 แทนที่จะเป็นเส้น
- **callout ใส่เฉพาะตอนที่ข้ามแล้วเกิดผลจริง** — ใช้ GitHub Alert (`> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`) ได้มากสุด 1 อันต่อ section เกณฑ์เลือกชนิดและกรณีที่ไม่ควรใส่เลยอยู่ใน `references/callout.md` — ถ้า README เดิมใช้ dialect อื่น (`!!! note` ของ MkDocs, `::: note` ของ Docusaurus) ให้แปลงเป็น GitHub syntax เพราะ dialect พวกนั้น render ไม่ออกบน GitHub
- ถ้ามีข้อมูลไม่ครบ (เช่น ไม่รู้ version หรือ setup) ให้ใส่ placeholder ที่ชัดเจนพร้อมหมายเหตุสั้น ๆ ว่าผู้ใช้ต้องเติมอะไร แทนที่จะเดามั่ว

### 6. Progressive Disclosure เมื่อ README ยาวเกิน
เมื่อมี sub-component หลายอัน (เช่น plugin ย่อย, module, service) ที่แต่ละอันมี detail ของตัวเอง ให้:
1. เก็บ main README ให้กระชับ — 1 บรรทัดต่อ component พร้อม link
2. ย้าย detail ไปไว้ใน `README.md` ของโฟลเดอร์ย่อยนั้น (GitHub render อัตโนมัติ) โดยเขียนตาม **Sub-folder README Pattern** ใน `references/structure.md` ไม่ใช่โครง Main README เต็มรูปแบบ

สัญญาณที่ควรแยก: skills/module list มี 5+ รายการที่แต่ละอันต้องการ usage, workflow หรือ reference table ของตัวเอง

```markdown
| [`capacities`](plugins/capacities/README.md) | 5 | Capacities PKM — Tags, Notes, Formatting |
```

### 7. Self-check ก่อนเขียนทับไฟล์จริง
*หลักการ: การ Write ทับไฟล์เดิมเป็น action ที่ย้อนกลับยาก (irreversible) — เช็ค checklist นี้ให้ผ่านก่อนเขียนทับทุกครั้ง แทนที่จะเขียนแล้วค่อยรู้ว่าพลาด*
- [ ] path ปลายทางตรงกับโปรเจกต์ที่กำลังทำงานอยู่จริง (ไม่ใช่เนื้อหาข้ามโปรเจกต์ตามความเสี่ยงใน Edge cases)
- [ ] ระบุระดับ Main/Sub-folder ถูกต้องแล้ว (ขั้นตอน 3) และใช้ template ตรงระดับ
- [ ] เนื้อหาเดิมทั้งหมด (command, endpoint, config) ยังอยู่ครบ ไม่มีอะไรหายไปจากการจัดระเบียบ
- [ ] Header/Section เป็นภาษาอังกฤษตามกฎ, badge ผ่านการเช็ค repo visibility แล้ว (ถ้ามี)

ถ้าข้อไหนไม่ผ่าน ให้แก้หรือถามผู้ใช้ก่อน ห้ามเขียนทับไฟล์จนกว่าจะผ่านครบทุกข้อ หลังเขียนไฟล์เสร็จ สรุปสั้นๆ
1-2 บรรทัดในแชทว่าปรับอะไรไปบ้าง (เช่น "restructured 4 sections, added emoji convention, converted
config to table") ไม่ต้องแปะเนื้อหาไฟล์ทั้งหมดซ้ำในแชท เพราะผู้ใช้เปิดไฟล์ดูเองได้อยู่แล้ว

## Supporting files
- `references/emoji.md` — mapping ระหว่าง section กับ emoji ที่ต้องใช้ และ badges มาตรฐาน
- `references/structure.md` — ลำดับ section, language rules และ progressive disclosure guidance
- `references/callout.md` — เกณฑ์เลือกชนิด callout (GitHub Alert) และกฎว่าเมื่อไหร่ **ไม่ควร** ใส่
- `references/example.md` — ตัวอย่าง README ที่ refactor แล้ว ใช้เป็น benchmark ของ tone และโครงสร้าง

## Edge cases
- **เนื้อหาที่แปะมาไม่ใช่ของไฟล์ README.md ที่มีอยู่ในโปรเจกต์ปัจจุบัน** — เช่น ผู้ใช้กำลังทำงานอยู่ใน
  project A (ซึ่งมี `README.md` ของตัวเอง) แต่แปะเนื้อหา README ของ project อื่นมาขอ refactor เฉยๆ
  ถ้าเขียนทับไฟล์ใน cwd ไปตรงๆ จะกลายเป็นเอาเนื้อหาโปรเจกต์อื่นไปทับ README ของ project A โดยไม่ได้
  ตั้งใจ ซึ่งกู้คืนยาก — ก่อนเขียนทับให้เช็คว่าเนื้อหาที่ได้มาตรงกับไฟล์ที่มีอยู่จริงไหม (ผู้ใช้ชี้ path มาตรงๆ
  หรือเนื้อหาที่แปะมาดูสอดคล้องกับโปรเจกต์ที่กำลังทำงานอยู่) ถ้าไม่แน่ใจ ให้ถามผู้ใช้ก่อนว่าจะให้เขียนทับ
  ไฟล์ใด หรือแค่แสดงผลลัพธ์ในแชทแทน ไม่ต้องเดาแล้วเขียนทับไปเลย
- **ยังไม่มีไฟล์ README.md ในโปรเจกต์เลย** (โปรเจกต์ใหม่ หรือผู้ใช้บอกแค่ชื่อโปรเจกต์/tech stack เช่น
  "โปรเจกต์ FastAPI + Keycloak") → สร้าง README template ตามโครงมาตรฐานได้เลย โดยใส่ placeholder ใน
  ส่วนที่ยังไม่รู้ ไม่ต้องถามเพิ่ม — เขียนเป็นไฟล์ `README.md` ที่ root ของโปรเจกต์ที่กำลังทำงานอยู่ทันที
- **ไม่มี context ของโปรเจกต์จริงๆ** (เช่น ผู้ใช้แปะเนื้อหา README มาในแชทล้วนๆ โดยไม่มี working directory
  ให้เขียนถึง) → ตอบเป็น markdown code block ในแชทแทน เพราะไม่มีไฟล์ให้เขียนถึงจริง
