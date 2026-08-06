# README Structure Reference

มี 2 pattern แยกกันตามระดับของ README:

- **Main / Root README** — README ของโปรเจกต์หรือ repo หลัก ใช้ **Section Order** ด้านล่างเต็มรูปแบบ
- **Sub-folder README** — README ของ component ย่อยภายใน monorepo (plugin, module, service) ที่ main README link ออกไป ใช้ pattern ที่กระชับกว่า ดู **Sub-folder README Pattern** ด้านล่าง — คนละบริบทกัน: sub-folder README ไม่ใช่ "หน้าแรกที่คนไม่รู้จักโปรเจกต์เจอ" แต่เป็นจุดที่คนรู้อยู่แล้วว่ากำลังดู component ไหน ต้องการแค่ reference lookup ที่เร็ว ไม่ใช่ landing page เต็มรูปแบบ

ทั้งสอง pattern ตัด section ที่ไม่มีเนื้อหาจริงออก ไม่ต้องใส่ placeholder ว่าง

## Section Order (Main / Root README)

emoji ในตารางนี้ต้องตรงกับ `references/emoji.md` เสมอ — ถ้าแก้ mapping ในไฟล์ใดไฟล์หนึ่งต้อง sync อีกไฟล์ด้วย

| # | Section | Emoji | Required | เมื่อใส่ |
|---|---|---|---|---|
| 1 | Project Name | 🎉 | ✅ | เสมอ (H1 title) |
| 2 | Description | — | ✅ | เสมอ (intro paragraph ใต้ title) |
| 3 | Repository / About | 💎 | เมื่อมี | ต้องการอธิบายโปรเจกต์เพิ่มเติมนอกจาก intro |
| 4 | Features | ✨ | เมื่อมี | มีฟีเจอร์เด่นที่ต้องการ highlight |
| 5 | Performance / Benchmarks | 🔥 | เมื่อมี | มีตัวเลขความเร็ว/ประสิทธิภาพที่ต้องการโชว์ |
| 6 | Tech Stack / Folder Structure | 🧊 | เมื่อมี | โปรเจกต์ซับซ้อนหรือมีหลาย module |
| 7 | Integrations / Plugins / Extensions | 🧩 | เมื่อมี | รองรับ plugin, extension หรือเชื่อมต่อกับระบบภายนอก |
| 8 | Requirements | ✅ | เมื่อมี | มี dependency หรือ environment ที่ต้องเตรียมก่อนติดตั้ง |
| 9 | Installation | 🚀 | ✅ | เสมอ (ถ้าไม่มีขั้นตอนให้ใส่คำสั่งเดียว) |
| 10 | Configuration | ⚙️ | เมื่อมี | มี `.env`, `config.json` หรือ env vars |
| 11 | API Key / Credentials | 🔑 | เมื่อมี | มี API key, token หรือ secret ที่ต้องตั้งค่า |
| 12 | Deployment | 🐳 | เมื่อมี | มีขั้นตอน deploy ขึ้น production เช่น Docker, CI/CD, cloud |
| 13 | Usage | 🏆 | ✅ | ตัวอย่างการใช้งาน + code snippet |
| 14 | Demo | 👉🏼 | เมื่อมี | มี live demo หรือ try-it-out link |
| 15 | Screenshots | 📸 | เมื่อมี | มี UI หรือ CLI output ที่ช่วยให้เห็นภาพ |
| 16 | API Reference | 📝 | เมื่อมี | มี endpoint หรือ public function หลัก |
| 17 | Schedule / Cron | 📅 | เมื่อมี | มีงานที่รันตามเวลา |
| 18 | Notifications / Webhooks / Alerts | 🔔 | เมื่อมี | มีฟีเจอร์แจ้งเตือนแบบ event-driven เช่น webhook, push notification — อยู่ต่อจาก Schedule / Cron เพราะเป็น automated behavior เหมือนกัน ต่างกันแค่ทริกเกอร์ด้วยเหตุการณ์แทนเวลา |
| 19 | Testing | 🧪 | เมื่อมี | มีวิธีรัน test suite หรือดู coverage |
| 20 | Troubleshooting | ⚠️ | เมื่อมี | มีปัญหาที่พบบ่อยและวิธีแก้ |
| 21 | Roadmap / Future Plans | 🦄 | เมื่อมี | มีแผนฟีเจอร์ในอนาคตที่ต้องการโชว์ |
| 22 | Contributors / Credits / Thanks | 🙏 | เมื่อมี | ขอบคุณ contributor, library ที่ใช้ หรือแรงบันดาลใจของโปรเจกต์ |
| 23 | Changelog | ⚡ | เมื่อมี | มีประวัติการอัปเดตที่ต้องการโชว์ |
| 24 | Security / Security Policy | 🛡️ | เมื่อมี | มี vulnerability reporting policy หรือ security best practices |
| 25 | License | 📜 | เมื่อมี | เขียนเป็นประโยคเดียวลิงก์ไปไฟล์ LICENSE ในรูปแบบตายตัว: `This project is licensed under the [{License Type}](LICENSE).` เช่น `This project is licensed under the [MIT License](LICENSE).` — โครงประโยคห้ามเปลี่ยน สลับได้แค่ `{License Type}` ตาม license จริงของโปรเจกต์ (MIT License, Apache License 2.0, GNU GPLv3 ฯลฯ) และชื่อไฟล์ที่ลิงก์ไปให้ตรงกับที่มีจริงใน repo (`LICENSE`, `LICENSE.md`, `LICENSE.txt`) |
| 26 | Contact / Author | ✉️ | เมื่อมี | เขียนเป็น 2 บรรทัดในรูปแบบตายตัว: `**{Name}** — {Title}, {Organization}` (เว้น 2 ช่องว่างท้ายบรรทัดนี้เพื่อขึ้นบรรทัดใหม่แบบ markdown hard break) ตามด้วยบรรทัดอีเมลเปล่าๆ เช่น `**Natthasath Saksupanara** — Computer Technical Officer, NIDA` แล้วบรรทัดถัดไปคือ `natthasath.sak@gmail.com` — โครงห้ามเปลี่ยน สลับได้แค่ `{Name}`, `{Title}`, `{Organization}` และอีเมลตามข้อมูลจริงของเจ้าของ repo นั้น (ดูจาก README เดิม, git config, หรือ CODEOWNERS) ถ้าไม่มีข้อมูลจริงให้ถามผู้ใช้แทนการเดา |
| 27 | Donate / Support / Sponsor | 🍺 | เมื่อมี | มีช่องทางรับ donate เช่น Ko-fi, Buy Me a Coffee, GitHub Sponsors |

## Horizontal Rule — เส้นคั่นระดับโซน

`---` ใช้คั่น **โซน** ไม่ใช่คั่น section — `### {emoji} {ชื่อ}` ทำหน้าที่แบ่ง section อยู่แล้ว
โดยเฉพาะ emoji ที่เป็นจุดสีสะดุดตา ถ้าคั่นทุกหัวข้อ README จะกลายเป็นลายทางและให้ผล
เท่ากับไม่คั่นเลย เพราะสายตาจะเรียนรู้ที่จะข้ามเส้นทั้งหมด — หลักเดียวกับ callout
คือของที่ขัดจังหวะได้ผลก็ต่อเมื่อมันหายาก

### 4 โซน

section ทั้ง 25 อันที่เป็น `### H3` แบ่งตามคำถามในใจคนอ่านซึ่งเปลี่ยนไปตามลำดับ:

| โซน | section | จำนวน | คนอ่านกำลังคิดอะไร |
|---|---|---|---|
| **1 Orientation** | 3–8 (About → Requirements) | 6 | "นี่คืออะไร ควรใช้ไหม" |
| **2 Setup** | 9–12 (Installation → Deployment) | 4 | "ทำยังไงให้มันรันได้" |
| **3 Operation** | 13–20 (Usage → Troubleshooting) | 8 | "ใช้งานมันยังไง" |
| **4 Project** | 21–27 (Roadmap → Donate) | 7 | "ใครทำ ใช้ได้แค่ไหน" |

รอยต่อทั้ง 3 จุดตรงกับจังหวะที่คนอ่านเปลี่ยนโหมดจริง:

```
Requirements    │ Installation     ← ตัดสินใจแล้วว่าจะใช้
Deployment      │ Usage            ← ติดตั้งเสร็จ เริ่มใช้งาน
Troubleshooting │ Roadmap          ← จบเรื่องการใช้ เข้าเรื่องตัวโปรเจกต์
```

โซน 2 กับ 3 แยกกันเพราะเป็นคนละโหมดการอ่าน — Setup คือของที่อ่านครั้งเดียวจบ
ส่วน Operation คือของที่กลับมาเปิดดูซ้ำเรื่อยๆ

### เมื่อไหร่ถึงใส่เส้น

> [!IMPORTANT]
> ใส่เส้นที่รอยต่อโซนได้ **ก็ต่อเมื่อโซนทั้งสองฝั่งของเส้นนั้นมี section อย่างละ 3 อันขึ้นไป**

เกณฑ์นี้อ่านจาก README ที่เขียนออกมาจริง ไม่ใช่เดาล่วงหน้าว่าจะยาวแค่ไหน — และมันกันเคส
ที่นับจำนวนรวมแล้วพลาด เช่น README ที่มี 8 section แต่กระจุกอยู่โซน 2 ทั้งหมด
ไม่มีรอยต่อให้คั่นสักจุด กฎที่นับจำนวนรวมจะสั่งให้ใส่เส้นทั้งที่ไม่มีที่ให้ใส่

| README | โซน 1 / 2 / 3 / 4 | ผล |
|---|---|---|
| เล็ก — Features \| Install, Usage \| License, Contact | 1 / 1 / 1 / 2 | 0 เส้น |
| กลาง — About, Features, Req \| Install, Config, Key \| Usage, API Ref, Fix \| License | 3 / 3 / 3 / 1 | 2 เส้น |
| ใหญ่ 18 section กระจายทุกโซน | 6 / 4 / 6 / 2 | 2 เส้น |
| กระจุกโซนเดียว — Install…Troubleshooting 8 อัน | 0 / 4 / 4 / 0 | 1 เส้น |

### กฎ syntax

> [!WARNING]
> `---` ที่อยู่**ติดใต้บรรทัดข้อความ** ไม่ใช่เส้นคั่น แต่กลายเป็น **Setext H2** —
> บรรทัดข้างบนจะถูกแปลงเป็นหัวข้อขนาดใหญ่แทน ต้องเว้นบรรทัดว่างก่อนเสมอ

```markdown
❌ Keycloak is an identity and access management solution.
   ---
   → ประโยคนั้นกลายเป็นหัวข้อ H2

✅ Keycloak is an identity and access management solution.

   ---
```

- เว้นบรรทัดว่าง **ทั้งบนและล่าง** ของ `---` เสมอ
- ใช้ `---` เท่านั้น ไม่ใช้ `***`, `___` หรือ `<hr>`
- ห้ามเป็นบรรทัดแรกของไฟล์ — ชนกับ YAML frontmatter delimiter
- ห้ามวางใต้ badges ทันที — GitHub ขีดเส้นใต้ `# H1` ให้เองอยู่แล้ว จะกลายเป็น 2 เส้นซ้อน
  (นี่คือเหตุผลที่เส้นคั่นมีที่ยืนใน pattern นี้ตั้งแต่แรก: section ที่นี่เป็น `### H3`
  ซึ่ง GitHub **ไม่**ขีดเส้นให้ ต่างจาก README ทั่วไปที่ใช้ `## H2`)

### Sub-folder README

ไม่ใช้เส้นคั่น — pattern นั้นมี section แค่ 4–6 อันและตัด Installation, Configuration,
Deployment ออกไปหมดแล้ว จึงไม่มีรอยต่อโซนให้คั่นตั้งแต่ต้น

## Progressive Disclosure — เมื่อ section ยาวเกินไป

เมื่อ README มีเนื้อหาที่ละเอียดมากในระดับ sub-component (เช่น plugin ย่อย, module, หรือ service แต่ละตัว) ให้แยกออกเป็น `README.md` ในโฟลเดอร์ย่อยนั้น แล้ว link กลับมาจาก main README

**สัญญาณที่ควรแยก:**
- Skills table หรือ component list มีมากกว่า 5 รายการที่แต่ละอันต้องการ detail ของตัวเอง
- มี Workflow, comparison table หรือ reference ที่เฉพาะกับ sub-component นั้น
- Main README มีเนื้อหาซ้ำซ้อนในหลาย section สำหรับ component เดียวกัน

**วิธีทำ:**
```
# แทนที่จะขยาย main README ให้ยาว:
main README → สรุป 1 บรรทัดต่อ component + link

# ตัวอย่าง main README:
| [`capacities`](plugins/capacities/README.md) | 5 | Capacities PKM — Tags, Notes, Formatting |

# ตัวอย่าง sub-folder README:
plugins/capacities/README.md → โครงตาม Sub-folder README Pattern ด้านล่าง (กระชับ ไม่ใช่ full 27-section)
```

## Sub-folder README Pattern

ใช้ pattern นี้กับ README.md ที่อยู่ใน component ย่อยของ monorepo (เช่น `plugins/<name>/README.md`) — ไม่ใช่ version ย่อของ main README แต่เป็นคนละจุดประสงค์: คนที่เปิดไฟล์นี้รู้อยู่แล้วว่ากำลังดู component ไหน ต้องการ reference ที่ scan เร็ว ไม่ใช่ pitch ที่ต้องโน้มน้าวว่าน่าเชื่อถือ

| # | Section | Emoji | Required | เมื่อใส่ |
|---|---|---|---|---|
| 1 | Component Name | 🎉 | ✅ | เสมอ (H1 title, emoji เดียวกับ main) |
| 2 | Description | — | ✅ | เสมอ — 1 บรรทัด บอกว่า component นี้ครอบคลุมอะไร |
| 3 | Skills / Components | ✨ | ✅ | เสมอ — ตาราง 2 คอลัมน์ (ชื่อ + วัตถุประสงค์สั้น) — mapping เดียวกับ Features ใน `emoji.md` เพราะ skills ของ plugin ก็คือ feature ที่มัน highlight |
| 4 | Usage | 🏆 | เมื่อมี | ตัวอย่างคำสั่งเรียกใช้สั้นๆ |
| 5 | Workflow | 🔁 | เมื่อมี | เฉพาะตอนที่ component ต้องเรียงลำดับกันเป็น flow (เช่น setup → implement → ship) |
| 6 | (extra) | เลือกตามความหมาย | สูงสุด 1 อัน | ข้อมูลเฉพาะของ component นี้จริงๆ ที่ไม่เข้า 5 อันบน (เช่น comparison table, files created) |

**ห้ามใส่แม้จะ "มีเนื้อหาจริง"** — section เหล่านี้เป็นของ main README เท่านั้น เพราะเป็นข้อมูลระดับ repo ทั้งก้อน ไม่ใช่ระดับ component เดียว: Badges, Requirements, Installation, Deployment, API Key/Credentials, Demo, Screenshots, Schedule/Cron, Testing, Troubleshooting, Roadmap, Changelog, Notifications, Security, License, Contact/Author, Donate

**สัญญาณว่าเกิน budget** (ต้องการมากกว่า 1 extra section) — component นั้นซับซ้อนพอที่ควรมี README ย่อยของตัวเองอีกชั้น (เช่น `plugins/<name>/skills/<skill>/README.md`) แทนที่จะยัดทุกอย่างไว้ที่ระดับ plugin

## Language Rules

- **Section headers**: English เท่านั้น — ไม่ใช้ภาษาไทยเป็นหัวข้อ (ใช้กับทั้ง main และ sub-folder README)
- **Project / Component description** (intro บรรทัดใต้ title): English เท่านั้น — ใช้กับทั้ง main และ sub-folder README
- **เนื้อหาใน table / bullet**: ใช้ภาษาตาม context ของโปรเจกต์ได้ (Thai หรือ English)
- **Code block / command**: English / syntax ของภาษานั้นๆ เสมอ

เหตุผล: header และ description เป็นสิ่งแรกที่คนอ่าน GitHub เจอ — English ทำให้ repo ดู professional และ accessible กับ audience ที่กว้างกว่า หลักการนี้ใช้เหมือนกันไม่ว่าจะเป็น main README หรือ sub-folder README เพราะทั้งคู่ยัง publish อยู่บน GitHub เหมือนกัน
