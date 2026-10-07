# 🎉 productive

Plugin for **boosting work productivity** — covers Tech Explainer, Meetings, PDF, Workplace Communication, IT Scorecard, KPI, Flashcard, and Activity Report.

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `breakdown` | อธิบายคำศัพท์หรือเทคโนโลยีแบบเจาะลึกผ่าน 6 มิติ: TL;DR, Problem, Solution, Use Cases, Compare, Key Takeaway — เรียกผ่าน `/breakdown` เท่านั้น ไม่ auto-trigger |
| `comeet` | สรุปการประชุมเป็นโครงสร้างมาตรฐาน: Objective, Key Topics, Discussions, Decisions, Action Items และ Next Step — เรียกผ่าน `/comeet` เท่านั้น ไม่ auto-trigger |
| `perspective` | ให้มุมมองและข้อคิดจากหัวข้ออบรม เขียนในเสียงของ Senior Engineer — เจ็บแต่จริง ไม่ใช่สไตล์ HR — เรียกผ่าน `/perspective` เท่านั้น ไม่ auto-trigger |
| `ebook` | ค้นหาและดาวน์โหลดไฟล์ PDF จากแหล่งที่น่าเชื่อถือและถูกกฎหมาย รองรับทั้งค้นหาจากชื่อและดาวน์โหลดจาก URL — เรียกผ่าน `/ebook` เท่านั้น ไม่ auto-trigger |
| `laura-whaley` | Workplace communication coach สไตล์ Corporate Laura — แปลงสถานการณ์ในที่ทำงานเป็น script มืออาชีพ พร้อมใช้ได้ทันที — เรียกผ่าน `/laura-whaley` เท่านั้น ไม่ auto-trigger |
| `scorecard` | ประเมินระดับความยากง่ายของงาน IT ทุกสายงาน (Infrastructure, Network, Database, Developer, Security, Cloud, DevOps) พร้อม scorecard 6 มิติ — เรียกผ่าน `/scorecard` เท่านั้น ไม่ auto-trigger |
| `indicator` | ออกแบบ KPI และตัวชี้วัดสำหรับ Action Plan — แนะนำตัวชี้วัด เกณฑ์ความสำเร็จ 3 ระดับ และข้อควรระวังในการวัดผล — เรียกผ่าน `/indicator` เท่านั้น ไม่ auto-trigger |
| `flashcard` | สร้าง Flashcard website (LexiCard) สำหรับเรียนคำศัพท์ รองรับหลายภาษา พร้อมระบบ Flip Card, Quiz และการออกเสียง — เรียกผ่าน `/flashcard` เท่านั้น ไม่ auto-trigger |
| `activity-report` | สรุปความคืบหน้ากิจกรรมในแผนการปฏิบัติงานประจำปีของสำนัก — ถามข้อมูลครบ 5W (แผน / ทำ / ได้ / ติด / ต่อ) แล้วสรุปเป็น 1 paragraph ภาษาทางการ — เรียกผ่าน `/activity-report` เท่านั้น ไม่ auto-trigger |
| `save-cost` | ติดตั้ง CLI tools ที่ลดการใช้ token (gh, jq, ast-grep, uv, git-delta, duckdb ฯลฯ) พร้อม config และอัปเดต CLAUDE.md ให้ Claude รู้ว่าควรใช้ tool ไหนเมื่อไหร่ — เรียกผ่าน `/save-cost` เท่านั้น ไม่ auto-trigger |
| `grill-me` | สัมภาษณ์ผู้ใช้อย่างเข้มข้นเพื่อ stress-test แผน การตัดสินใจ หรือไอเดีย — แตกเป็น design tree ถามเป็นรอบตาม frontier พร้อมคำตอบแนะนำทุกข้อ เรียกผ่าน `/grill-me` เท่านั้น ไม่ auto-trigger |
| `copycat` | คัดลอกและดัดแปลง skill จากที่อื่น (GitHub, marketplace อื่น) ให้ตรงกับ pattern ของ marketplace นี้ — สรุปต้นทาง เช็ค dependency/license เสนอการปรับ แล้วถามก่อนเสมอว่าจะใส่ plugin ไหน — เรียกผ่าน `/copycat` เท่านั้น ไม่ auto-trigger |
| `encryption` | เตรียมไฟล์สำคัญสำหรับส่งต่ออย่างปลอดภัย — รวมโฟลเดอร์เป็น tar.gz เดียว เข้ารหัสด้วย GPG symmetric AES-256 สร้าง `passphrase.txt` แยกไฟล์ พร้อมไฟล์คำแนะนำการ decrypt สไตล์ README ชื่อ `HOW-TO-DECRYPT.md` แนบไปกับ archive ตรวจสอบ decrypt ได้จริงก่อนส่งมอบ และแนะนำให้ส่ง archive กับ passphrase คนละช่องทางกัน — เรียกผ่าน `/encryption` เท่านั้น ไม่ auto-trigger |
| `spof` | วิเคราะห์หา Single Point of Failure ในระบบหรือสถาปัตยกรรม ครอบคลุม Infrastructure, Network, Database, Application, Third-party/Vendor และ Human/Process พร้อมระดับความเสี่ยง (Impact × Likelihood) และแนวทางแก้ไข — เรียกผ่าน `/spof` เท่านั้น ไม่ auto-trigger |
| `scenario` | วางแผนรับมือสถานการณ์หน้างาน (Event, ร้านค้า, Call Center, โรงพยาบาล, คลังสินค้า) จัดหมวดหมู่สถานการณ์ที่พบบ่อย 12 แบบ (Capacity, Missing Info, Identity, Duplicate, Registration, Walk-in, Group, Wrong Target, Special Case, Timing, Queue, Manual Override) พร้อมแผนรับมือ 3 ระดับ Plan A/B/C — เรียกผ่าน `/scenario` เท่านั้น ไม่ auto-trigger |
| `coevent` | บันทึก Event ลง Google Calendar แบบครบขั้นตอน — เลือกปฏิทิน ตั้งชื่อ วันเวลาสถานที่ สถานะว่าง/ไม่ว่าง description (ถามและร่างให้ถ้าต้องการ) ผู้เข้าร่วม เพิ่ม Google Meet และการแจ้งเตือน (default ล่วงหน้า 1 วันตอน 05:00 น. บวกอีกรอบ 15 นาทีก่อนเริ่มถ้าเป็นการประชุม) ค้นเว็บให้เองถ้าไม่ระบุวันเวลา/สถานที่ รองรับ event จัดหลายวันแบบ all-day และเทศกาล/ฤดูกาลที่กินเวลายาวนาน (ถามผู้ใช้ก่อนเสมอว่าจะทำเป็น all-day ช่วงเดียวหรือแยกเป็น 2 event วันแรก/วันสุดท้ายของเทศกาล) รองรับบันทึกหลาย event พร้อมกัน (โหมด Bulk) โดยถามค่าที่ใช้ร่วมกันทั้งชุดเพียงรอบเดียวแล้วสรุปเป็นตารางเดียวให้ยืนยันครั้งเดียวจบ — เรียกผ่าน `/coevent` เท่านั้น ไม่ auto-trigger |
| `upskill-reskill` | บันทึกทักษะใหม่ที่พัฒนา/เรียนรู้ไปพร้อมกับ Claude ลงไฟล์ `Upskill-Reskill-Log.md` สะสมต่อเนื่องบน Google Drive ครอบคลุมสายงาน Computer Technical Officer แบบกว้างๆ (Network, Server, Database, DevOps, Frontend, Backend, API, Cloud, Security, Automation) และทักษะ AI/LLM ทุกชนิด (Claude, ChatGPT, Grok ฯลฯ) — ใน Claude Code auto-trigger เองทันทีหลัง push code ขึ้น git สำเร็จถ้าเนื้อหาเข้าข่ายทักษะใหม่ ใน Claude Chat/Cowork trigger เมื่อพิมพ์ `upskill & reskill` หรือเรียกตรงผ่าน `/upskill-reskill [ชื่อทักษะ]` ได้ทุกที่ — **ข้อยกเว้นเดียว**ในปลั๊กอินนี้ที่ auto-trigger ได้ |
| `tradeoff` | วิเคราะห์ "ได้อย่างเสียอย่าง" (Trade-off / Opportunity Cost Analysis) สำหรับการตัดสินใจสำคัญ 2 ทางเลือกขึ้นไปที่ใช้ทรัพยากรเดียวกัน ครอบคลุมนโยบายสาธารณะ/งบประมาณรัฐ, ย้ายงาน/เปลี่ยนอาชีพ, ลงทุนขยายธุรกิจเทียบ R&D, ซื้ออสังหาริมทรัพย์ (บ้านมือ1/มือ2, คอนโด/บ้าน) — เทียบทางเลือกใน 6 มิติ (ได้ เสีย Opportunity Cost ความเสี่ยง กลับตัวได้ไหม กรอบเวลาเห็นผล) ค้นเว็บหาตัวเลข/ข้อเท็จจริงมาอ้างอิงเมื่อเกี่ยวข้องกับงบประมาณ เงินเดือน หรือราคาตลาด แล้วสรุปคำแนะนำแบบมีเงื่อนไข — เรียกผ่าน `/tradeoff` เท่านั้น ไม่ auto-trigger |
| `rename` | สร้างชื่อ Chat/Task บน Claude Website (claude.ai) ให้กระชับ เป็นภาษาอังกฤษ ไม่เกิน 8 คำ พร้อม prefix บอกประเภทงาน (เช่น `[Debug]`, `[Design]`, `[Report]`) และมีชื่อเฉพาะของระบบ/เทคโนโลยีที่เกี่ยวข้อง เพื่อให้ search เจอง่ายในอนาคต — รับคำอธิบายสั้นๆ ว่ากำลังทำอะไร คืนชื่อเดียวที่ดีที่สุดให้ copy ไปเปลี่ยนชื่อเองบน claude.ai — เรียกผ่าน `/rename <คำอธิบายสิ่งที่กำลังทำ>` เท่านั้น ไม่ auto-trigger |
| `cobook` | ดูแลลิสต์หนังสือเดียว (รวม `book-wishlist`/`book-owned`/`book-search` เดิมจาก plugin `drive`) ลงตาราง markdown ที่ `Automation/book/book-list.md` บน Google Drive — รับชื่อหนังสือ รูปปก หรือรูปใบเสร็จ เช็คก่อนว่ามีในลิสต์แล้วหรือยัง ถ้าเจอเป็น Wishlist จะถามว่าซื้อแล้วหรือยังก่อนเปลี่ยนเป็น Owned ถ้าไม่เจอจะถามว่าต้องการค้นหาและบันทึกไหม แล้วดึงผู้เขียน/จำนวนหน้า/ลิงก์/ปกจาก SE-ED หรือ Naiin เท่านั้น พร้อมย่อลิงก์และรูปปกด้วย Bitly ก่อนถามว่าจะบันทึกเป็น Wishlist หรือ Owned — รูปใบเสร็จข้ามคำถามไปบันทึกเป็น Owned ได้เลยเพราะถือเป็นหลักฐานการซื้อในตัว — เรียกผ่าน `/cobook` เท่านั้น ไม่ auto-trigger |
| `broadcast` | Draft หรือ rewrite ข้อความประชาสัมพันธ์/ประกาศขององค์กร แบ่งตามระดับความเป็นทางการ (Formal: หนังสือราชการ/ข่าวประกาศ, Semi-formal: Facebook Page/LINE OA/ข่าวกิจกรรม, Informal: Social Media/Community) คูณกับเจตนา 10 แบบ (Informative, Persuasive, Promotional, Engagement, Awareness, Reputation, Relationship Building, Advocacy, Crisis Communication, Internal Communication) — ถามระดับความเป็นทางการและเจตนาทุกครั้งที่เรียก ไม่เดาเอง เตือนก่อนร่างถ้า pairing เสี่ยง (เช่น Crisis Communication คู่กับ Informal) — เรียกผ่าน `/broadcast` เท่านั้น ไม่ auto-trigger |
| `socratic` | ชวนคิดวิเคราะห์แบบโสเครตีส (Socratic Method) — ถามคำถามนำทางทีละขั้นแทนการบอกคำตอบตรงๆ เพื่อให้ผู้ใช้ค้นพบคำตอบหรือจุดบอดของตัวเอง ไม่จำกัดโดเมน เลือกประเภทคำถามจาก 6 ประเภทของ Paul & Elder (clarification, assumptions, evidence & reasoning, viewpoints, implications, meta-question) ตามคำตอบจริงของผู้ใช้ในแต่ละรอบ ถามทีละคำถามเดียว ต่างจาก `grill-me` ที่ถามเป็นชุด — เป็นโหมดสนทนาต่อเนื่องจนกว่าผู้ใช้จะออกจากโหมดเอง — เรียกผ่าน `/socratic` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/breakdown <ชื่อเทคโนโลยีหรือแนวคิด>
/comeet
/perspective <หัวข้ออบรม>
/ebook <ชื่อหนังสือหรือ URL>
/laura-whaley <สถานการณ์ในที่ทำงาน>
/scorecard <งาน IT ที่ต้องการประเมิน>
/indicator <กิจกรรมหรือโปรเจกต์ที่ต้องการวางตัวชี้วัด>
/flashcard <ภาษาและหมวดคำศัพท์ที่ต้องการ>
/activity-report <ชื่อกิจกรรม>
/save-cost
/grill-me <แผน การตัดสินใจ หรือไอเดียที่อยากให้ช่วย stress-test>
/copycat <ลิงก์ GitHub หรือเนื้อหา skill ที่อยากเอามาปรับใช้>
/encryption
/spof <ระบบหรือสถาปัตยกรรมที่ต้องการวิเคราะห์>
/scenario <งานหรือกระบวนการปฏิบัติงานที่ต้องการวางแผนรับมือสถานการณ์>
/coevent <รายละเอียด event ที่ต้องการบันทึก>
/upskill-reskill [ชื่อทักษะใหม่ที่ต้องการบันทึก]
/tradeoff <สถานการณ์หรือทางเลือกที่ต้องการเทียบ>
/rename <คำอธิบายสิ่งที่กำลังจะทำ>
/cobook <ชื่อหนังสือ (หลายเล่มได้) หรือแนบรูปปก หรือถ่ายรูปใบเสร็จ>
/broadcast <หัวข้อข่าวที่ต้องการ draft หรือข้อความเดิมที่ต้องการ rewrite>
/socratic <หัวข้อ ความเชื่อ หรือคำถามที่อยากคิดผ่าน>
```

### 🔧 ต้อง Setup ก่อนใช้งานครั้งแรก

`cobook` ต้องเชื่อมต่อ **Google Drive MCP connector** และ **Bitly MCP connector** ก่อนใช้งาน (ไม่ต้อง
deploy หรือตั้งค่าอะไรฝั่ง Bitly เอง — ใช้ default group/domain ของบัญชีที่เชื่อมต่อไว้ได้เลย) ใช้ไฟล์
`Automation/book/book-list.md` ไฟล์เดียวกับที่ `book-wishlist`/`book-owned`/`book-search` เดิมใน plugin
`drive` เคยสร้างไว้ ไม่ต้อง migrate ข้อมูลใดๆ
