# 🎉 productive

Plugin for **boosting work productivity** — covers Tech Explainer, Meetings, PDF, Workplace Communication, IT Scorecard, KPI, Flashcard, Activity Report, and ASCII Art.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `isolate` | อธิบายคำศัพท์หรือเทคโนโลยีแบบเจาะลึกผ่าน 6 มิติ: TL;DR, Problem, Solution, Use Cases, Compare, Key Takeaway — เรียกผ่าน `/isolate` เท่านั้น ไม่ auto-trigger |
| `comeet` | สรุปการประชุมเป็นโครงสร้างมาตรฐาน: Objective, Key Topics, Discussions, Decisions, Action Items และ Next Step — เรียกผ่าน `/comeet` เท่านั้น ไม่ auto-trigger |
| `perspective` | ให้มุมมองและข้อคิดจากหัวข้ออบรม เขียนในเสียงของ Senior Engineer — เจ็บแต่จริง ไม่ใช่สไตล์ HR — เรียกผ่าน `/perspective` เท่านั้น ไม่ auto-trigger |
| `ebook` | ค้นหาและดาวน์โหลดไฟล์ PDF จากแหล่งที่น่าเชื่อถือและถูกกฎหมาย รองรับทั้งค้นหาจากชื่อและดาวน์โหลดจาก URL — เรียกผ่าน `/ebook` เท่านั้น ไม่ auto-trigger |
| `laura-whaley` | Workplace communication coach สไตล์ Corporate Laura — แปลงสถานการณ์ในที่ทำงานเป็น script มืออาชีพ พร้อมใช้ได้ทันที — เรียกผ่าน `/laura-whaley` เท่านั้น ไม่ auto-trigger |
| `scorecard` | ประเมินระดับความยากง่ายของงาน IT ทุกสายงาน (Infrastructure, Network, Database, Developer, Security, Cloud, DevOps) พร้อม scorecard 6 มิติ — เรียกผ่าน `/scorecard` เท่านั้น ไม่ auto-trigger |
| `indicator` | ออกแบบ KPI และตัวชี้วัดสำหรับ Action Plan — แนะนำตัวชี้วัด เกณฑ์ความสำเร็จ 3 ระดับ และข้อควรระวังในการวัดผล — เรียกผ่าน `/indicator` เท่านั้น ไม่ auto-trigger |
| `flashcard` | สร้าง Flashcard website (LexiCard) สำหรับเรียนคำศัพท์ รองรับหลายภาษา พร้อมระบบ Flip Card, Quiz และการออกเสียง — เรียกผ่าน `/flashcard` เท่านั้น ไม่ auto-trigger |
| `activity-report` | สรุปความคืบหน้ากิจกรรมในแผนการปฏิบัติงานประจำปีของสำนัก — ถามข้อมูลครบ 5W (แผน / ทำ / ได้ / ติด / ต่อ) แล้วสรุปเป็น 1 paragraph ภาษาทางการ — เรียกผ่าน `/activity-report` เท่านั้น ไม่ auto-trigger |
| `save-cost` | ติดตั้ง CLI tools ที่ลดการใช้ token (gh, jq, ast-grep, uv, git-delta, duckdb ฯลฯ) พร้อม config และอัปเดต CLAUDE.md ให้ Claude รู้ว่าควรใช้ tool ไหนเมื่อไหร่ — เรียกผ่าน `/save-cost` เท่านั้น ไม่ auto-trigger |
| `ascii-art` | แปลงข้อความอังกฤษหรือรูปภาพเป็น ASCII art — 8 โหมด (figlet, toilet, lolcat, cowsay, box, jp2a, chafa, braille) 571 ฟอนต์ พร้อมชุดสี ถามทีละคำถามตามลำดับ (โหมด → ฟอนต์ → สี → กรอบ) แสดงผลในเทอร์มินัลทันที และทำ HTML Artifact ให้ด้วยเมื่อผลลัพธ์มีสี — เรียกผ่าน `/ascii-art` เท่านั้น ไม่ auto-trigger |
| `grill-me` | สัมภาษณ์ผู้ใช้อย่างเข้มข้นเพื่อ stress-test แผน การตัดสินใจ หรือไอเดีย — แตกเป็น design tree ถามเป็นรอบตาม frontier พร้อมคำตอบแนะนำทุกข้อ เรียกผ่าน `/grill-me` เท่านั้น ไม่ auto-trigger |
| `copycat` | คัดลอกและดัดแปลง skill จากที่อื่น (GitHub, marketplace อื่น) ให้ตรงกับ pattern ของ marketplace นี้ — สรุปต้นทาง เช็ค dependency/license เสนอการปรับ แล้วถามก่อนเสมอว่าจะใส่ plugin ไหน — เรียกผ่าน `/copycat` เท่านั้น ไม่ auto-trigger |
| `encryption` | เตรียมไฟล์สำคัญสำหรับส่งต่ออย่างปลอดภัย — รวมโฟลเดอร์เป็น tar.gz เดียว เข้ารหัสด้วย GPG symmetric AES-256 สร้าง `passphrase.txt` แยกไฟล์ พร้อมไฟล์คำแนะนำการ decrypt สไตล์ README ชื่อ `HOW-TO-DECRYPT.md` แนบไปกับ archive ตรวจสอบ decrypt ได้จริงก่อนส่งมอบ และแนะนำให้ส่ง archive กับ passphrase คนละช่องทางกัน — เรียกผ่าน `/encryption` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/isolate <ชื่อเทคโนโลยีหรือแนวคิด>
/comeet
/perspective <หัวข้ออบรม>
/ebook <ชื่อหนังสือหรือ URL>
/laura-whaley <สถานการณ์ในที่ทำงาน>
/scorecard <งาน IT ที่ต้องการประเมิน>
/indicator <กิจกรรมหรือโปรเจกต์ที่ต้องการวางตัวชี้วัด>
/flashcard <ภาษาและหมวดคำศัพท์ที่ต้องการ>
/activity-report <ชื่อกิจกรรม>
/save-cost
/ascii-art <ข้อความภาษาอังกฤษ หรือ path ของไฟล์รูป>
/grill-me <แผน การตัดสินใจ หรือไอเดียที่อยากให้ช่วย stress-test>
/copycat <ลิงก์ GitHub หรือเนื้อหา skill ที่อยากเอามาปรับใช้>
/encryption
```
