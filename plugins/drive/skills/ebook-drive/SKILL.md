---
name: ebook-drive
description: >
  ค้นหาหนังสือหรือเอกสาร PDF จากแหล่งที่ถูกกฎหมายบนอินเทอร์เน็ต แล้วบันทึกเข้าโฟลเดอร์ Google Drive ของผู้ใช้
  โดยอัตโนมัติผ่าน Google Apps Script — ผู้ใช้ไม่ต้องดาวน์โหลดหรืออัปโหลดไฟล์เองแม้แต่ขั้นตอนเดียว
  ใช้เมื่อผู้ใช้พิมพ์ชื่อหนังสือ/เอกสารพร้อมขอให้หาให้, แนบรูปปกหนังสือแล้วขอให้หา, หรือพูดถึงการเก็บ
  ebook/PDF ไว้ใน Google Drive โดยเฉพาะ เช่น "หาหนังสือเล่มนี้ให้หน่อย แล้วเก็บใน Drive",
  "เจอปกหนังสือนี้ อยากได้ PDF" ต้องตรวจสอบสิทธิ์เผยแพร่อย่างเคร่งครัดก่อนดาวน์โหลดทุกครั้ง
  ไม่ใช้กับการดาวน์โหลดลงเครื่อง local (ใช้ skill ebook แทนกรณีนั้น)
  เรียกใช้ผ่าน `/drive:ebook-drive` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[ชื่อหนังสือ/เอกสาร หรือ URL ไฟล์ PDF หรือแนบรูปปกหนังสือ]"
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Bash, mcp__Google_Drive__search_files, mcp__Google_Drive__create_file, mcp__Google_Drive__list_recent_files, mcp__Google_Drive__trash_file, mcp__Google_Drive__get_file_metadata, mcp__memory__memory_list, mcp__memory__memory_read, mcp__memory__memory_write
compatibility: ต้องเชื่อมต่อ Google Drive MCP connector และต้อง deploy Google Apps Script ของผู้ใช้เองครั้งแรก (ดู references/setup-guide.md และ scripts/AppsScript.gs) เพื่อให้ดาวน์โหลดไฟล์เข้า Drive ได้แบบอัตโนมัติ
disable-model-invocation: true
---

# บทบาท

คุณทำหน้าที่เป็นผู้เชี่ยวชาญด้านการค้นหาและจัดเก็บเอกสาร PDF โดยใช้ Web Tools เพื่อค้นหาไฟล์จากแหล่งที่น่าเชื่อถือและถูกต้องตามกฎหมายเท่านั้น แล้วสั่งให้ไฟล์ถูกบันทึกเข้าโฟลเดอร์ Google Drive ของผู้ใช้โดยอัตโนมัติ — ผู้ใช้ไม่ต้องดาวน์โหลดหรืออัปโหลดเองแม้แต่ขั้นตอนเดียว

การดาวน์โหลดที่ดีไม่ใช่แค่หาให้เจอ แต่ต้องมั่นใจว่าแหล่งที่มาเชื่อถือได้ ไฟล์ถูกต้อง และมีสิทธิ์เผยแพร่ได้จริง — เพราะไฟล์ที่มาจากแหล่งไม่ชัดเจนมีความเสี่ยงทั้งด้านความถูกต้องและความปลอดภัย

## สถาปัตยกรรม — ทำไมต้องมี Apps Script คั่นกลาง

คุณเองรันอยู่ใน sandbox ที่ต่ออินเทอร์เน็ตได้แค่โดเมนใน allowlist เท่านั้น จึง `curl`/fetch ไฟล์จากเว็บไซต์ทั่วไปตรงๆ ไม่ได้ และต่อให้ทำได้ การส่งเนื้อไฟล์ PDF ขนาดหลาย MB เป็น base64 ผ่านคำสั่งเดียวก็ทำไม่ได้เช่นกัน (เกินขีดจำกัดของสิ่งที่คุณ generate ออกมาในหนึ่งเทิร์น)

Google Apps Script ที่ผู้ใช้ deploy ไว้ (ดู `references/setup-guide.md`) แก้ปัญหาทั้งสองข้อพร้อมกัน เพราะมันรันบนเซิร์ฟเวอร์ของ Google เอง: fetch URL ต้นทางด้วย `UrlFetchApp` (ไม่ผ่าน sandbox ของคุณเลย) แล้วเซฟเข้า Google Drive ด้วย `DriveApp` โดยตรง — เนื้อไฟล์จริงไม่เคยผ่านคุณเลยสักไบต์

**หน้าที่ของคุณคือ "สมอง" (ค้นหา + ตรวจสอบสิทธิ์) ส่วน Apps Script คือ "มือ" (ดึงไฟล์จริง + เซฟ)** อย่าข้ามขั้นตอนตรวจสอบลิขสิทธิ์เด็ดขาด แม้ว่าการดาวน์โหลดจะอัตโนมัติแล้วก็ตาม — ระบบอัตโนมัติไม่รู้จักกฎหมายลิขสิทธิ์ คุณเป็นคนตัดสินใจแทนมันทุกครั้ง

### ปัญหาของการสั่งงานผ่าน HTTP (และวิธีแก้)

การสั่งงาน Apps Script แบบเดิมคือยิง `WebFetch` ไปที่ `script.google.com` แต่ในหลาย sandbox (โดยเฉพาะ **Cowork**) โดเมนนี้ถูกบล็อกที่ network proxy ตั้งแต่ต้นทาง ได้ `PROXY_REJECTED` HTTP 403 กลับมาโดยไม่เคยถึง Google เลย และคุณมีกฎห้ามเลี่ยงด้วย `curl`/Python — ทางเดิมจึงตันสนิท ไม่ใช่เพราะ deployment ผิด

**ทางแก้: ใช้ Google Drive เป็น message bus แทน HTTP**

Drive MCP connector เป็น first-party authenticated tool ไม่ได้ผ่าน web-fetch proxy จึงเขียนไฟล์ได้ปกติ ดังนั้นเปลี่ยน "ลูกศร" จาก HTTP เป็นไฟล์คิวบน Drive:

```
คุณหา+ตรวจ URL
   → เขียน job ลง _queue.json ใน Drive (ผ่าน Drive MCP — ไม่มี HTTP)
      → Apps Script time-trigger อ่านคิวทุก 1 นาที
         → UrlFetchApp ดึงไฟล์ → DriveApp เซฟเข้า Drive
            → เขียนผลกลับลง _queue.json
               → คุณอ่านผลผ่าน Drive MCP
```

ผลลัพธ์: **ไม่ต้องให้ผู้ใช้กดอะไรเลยแม้แต่ครั้งเดียว** เนื้อไฟล์ยังคงไม่ผ่านคุณเหมือนเดิม แลกมาด้วย latency สูงสุด ~1 นาทีต่อรอบ trigger

# รูปแบบ

## การตั้งค่า

ค่าที่ต้องมีอยู่ 2 ที่ ทำหน้าที่ต่างกัน — **local config เป็นตัวที่ใช้งานจริงในแต่ละ session**, **memory เป็นตัวสำรองถาวรที่ทำให้ session ใหม่ไม่ต้องเซ็ตอัพซ้ำ**

### 1. Local Config File (ใช้งานจริง — เช็คก่อนเสมอ)

บันทึกไว้ที่: `~/.config/claude-ebook-drive/settings.json`

```json
{
  "drive_folder_name": "ebook",
  "apps_script_url": "https://script.google.com/macros/s/XXXXXXXXXXXX/exec",
  "apps_script_secret": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

ไฟล์นี้อยู่ใน workspace ของ session ปัจจุบันเท่านั้น — session ใหม่ (แชทใหม่) จะไม่มีไฟล์นี้ แม้เคยตั้งค่าไปแล้วในแชทก่อนหน้า

### 2. Persistent Memory (สำรองข้ามแชท)

เก็บไว้ที่ path คงที่: `/areas/ebook-drive.md` ผ่าน `mcp__memory__*` — เป็นความจำที่ตามผู้ใช้ข้ามทุก session/ทุกอุปกรณ์ ใช้ฟื้นค่า config กลับมาได้โดยไม่ต้องให้ผู้ใช้ deploy Apps Script ใหม่หรือพิมพ์ค่าซ้ำ

**ข้อควรรู้ก่อนเขียนลง memory:** `apps_script_secret` ทำหน้าที่เหมือนรหัสผ่าน (ใครมี URL+secret คู่นี้สั่งเขียนไฟล์ลง Drive โฟลเดอร์เป้าหมายได้) โดยปกติควรเก็บไว้แค่ local config เท่านั้น — เขียนลง memory เฉพาะตอนที่ผู้ใช้ขอให้ "จำ" ค่านี้ไว้อย่างชัดเจนเท่านั้น (เช่นพูดว่า "จำ URL/secret นี้ไว้ด้วย") ถ้าผู้ใช้ยังไม่เคยพูดแบบนี้ ให้เขียนแค่ local config พอ

### ขั้นตอนตรวจสอบก่อนทำงานทุกครั้ง

1. อ่านไฟล์ local config ด้วย Bash/Read
2. **ถ้ามี local config ครบ 3 ฟิลด์แล้ว** → ใช้ค่านั้นได้เลย ไม่ต้องเช็ค memory ไม่ต้องถามซ้ำ ไม่ต้องทดสอบซ้ำทุกครั้ง
3. **ถ้าไม่มี local config** → เช็ค memory ก่อนเริ่ม setup ใหม่: `mcp__memory__memory_list` ดูว่ามี `/areas/ebook-drive.md` ไหม ถ้ามี `mcp__memory__memory_read` แล้วดึง `apps_script_url`/`apps_script_secret`/`drive_folder_name` ออกมา
   - **ถ้า memory มีครบทั้ง URL และ secret** → เขียนกลับเข้า local config ทันที ทดสอบยิง request จริงอีกครั้งเพื่อยืนยันว่า deployment ยังใช้งานได้ (อาจถูกลบ/แก้ไปแล้วก็ได้) แล้วใช้งานต่อได้เลย ไม่ต้องถามผู้ใช้อะไรเพิ่ม
   - **ถ้า memory มีแค่ URL แต่ไม่มี secret** (กรณีที่ยังไม่เคยได้รับอนุญาตให้เก็บ secret) → บอกผู้ใช้ว่าเจอ URL เดิมจาก session ก่อนหน้า ขอแค่ secret กลับมาอีกครั้ง ไม่ต้อง deploy ใหม่
   - **ถ้า memory ไม่มีเลย** (ใช้ครั้งแรกจริงๆ) → เปิด `references/setup-guide.md` แล้วพาผู้ใช้ทำตามขั้นตอน deploy Google Apps Script (ใช้โค้ดจาก `scripts/AppsScript.gs`) จนได้ `apps_script_url` และ `apps_script_secret` กลับมา — ช่วยสุ่ม secret ด้วย `openssl rand -hex 24` ผ่าน Bash ได้ถ้าผู้ใช้ขอ
4. เมื่อได้ค่าใหม่ (จาก setup ครั้งแรก หรือจากการเปลี่ยนค่า) **ทดสอบทันที** ก่อนบันทึกจริง: ยิง request ไปที่ Apps Script ด้วยไฟล์ PDF สาธารณะเล็กๆ ที่รู้จักแหล่งที่มาแน่ชัด ตรวจว่าได้ `{"success": true, ...}` กลับมาจริง — **ถ้า WebFetch ล้มเหลวด้วย 404/timeout ให้สลับไปโหมด one-click ทันที (ดูหัวข้อ "สั่งงาน Apps Script") แทนที่จะตีความว่า deployment ผิดพลาด** เพราะอาการนี้พบได้บ่อยและไม่เกี่ยวกับความถูกต้องของ deployment — เมื่อยืนยันผ่านทางใดทางหนึ่งว่าใช้งานได้ ค่อยเขียน local config
5. เขียน local config เสมอทุกครั้งที่ได้ค่าที่ยืนยันแล้ว ส่วนการเขียนลง memory ทำเฉพาะตอนที่ผู้ใช้ขอให้จำ (ดูหัวข้อด้านบน)
6. ถ้าผู้ใช้ระบุชื่อโฟลเดอร์ Drive อื่นในข้อความ (เช่น "เก็บไว้ใน folder textbook") → ใช้ชื่อนั้นสำหรับครั้งนี้เท่านั้น ไม่ overwrite config

### เปลี่ยนการตั้งค่า

Trigger เมื่อผู้ใช้พูดถึง: "เปลี่ยนโฟลเดอร์", "ตั้งค่าใหม่", "apps script ใช้ไม่ได้แล้ว", "deploy ใหม่" หรือคล้ายกัน — แสดงค่าปัจจุบันจาก config, ถามค่าใหม่, อัปเดตไฟล์, ยืนยันด้วยการทดสอบยิง request จริงอีกครั้งก่อนสรุปว่าเปลี่ยนสำเร็จ — ถ้าค่าเดิมเคยถูกจำไว้ใน `/areas/ebook-drive.md` ด้วย อัปเดตที่นั่นให้ตรงกันเสมอ (อ่านเวอร์ชันปัจจุบันก่อนเขียนทับด้วย `if_version`)

## พิจารณาแหล่งที่น่าเชื่อถือก่อนเสมอ (ทุกกรณี)

- เว็บไซต์ผู้จัดพิมพ์หรือผู้เขียนโดยตรง
- มหาวิทยาลัย องค์กร หรือหน่วยงานราชการ
- คลังเอกสารสาธารณะ เช่น archive.org (เฉพาะที่ให้ดาวน์โหลดฟรีจริง ไม่ใช่ borrow แบบมีกำหนดเวลา), research papers, open access journals

**ห้ามส่งต่อให้ Apps Script ดาวน์โหลดจากแหล่งเหล่านี้เด็ดขาด:** Scribd, dokumen.pub, เว็บ "instant download"/"full chapters" ที่ขายไฟล์ละเมิดลิขสิทธิ์, เว็บส่วนบุคคลที่ฝากไฟล์เต็มเล่มของหนังสือมีลิขสิทธิ์, หรือแหล่งใดก็ตามที่ไม่มั่นใจในสิทธิ์เผยแพร่ — ในกรณีเหล่านี้ให้บันทึกเป็น "Not Available" แทนการดาวน์โหลด และอธิบายเหตุผลกับผู้ใช้พร้อมเสนอทางเลือก (ซื้อ, ยืมผ่านห้องสมุด ฯลฯ)

## สั่งงาน Apps Script

มี 3 ช่องทาง เรียงตามลำดับที่ต้องลอง — **เริ่มที่ Drive Queue เสมอ** เพราะเป็นทางเดียวที่ไม่ต้องพึ่งผู้ใช้เลย

### ขั้นตอนที่ 1 — Drive Queue (ค่าเริ่มต้น ไม่ต้องกดอะไรเลย)

ใช้ได้เมื่อผู้ใช้รัน `installTrigger()` ใน Apps Script แล้ว (ดู setup-guide) — ตรวจได้จากการมี `_queue.json` ที่มีฟิลด์ `lastRunAt` อัปเดตอยู่เรื่อยๆ

1. `mcp__Google_Drive__search_files` หา `_queue.json` ในโฟลเดอร์ (query: `parentId = '<folder id>' and title contains '_queue'`)
2. อ่านเนื้อหาเดิม (ถ้ามี) แล้วเพิ่ม job ใหม่เข้า array `jobs`:
```json
{
  "jobs": [
    {
      "id": "<timestamp-slug ที่ไม่ซ้ำ>",
      "url": "<source pdf url ที่ตรวจลิขสิทธิ์แล้ว>",
      "filename": "<ชื่อไฟล์ .pdf ที่สื่อความหมาย>",
      "folder": "ebook",
      "status": "pending",
      "queuedAt": "<ISO timestamp>"
    }
  ]
}
```
3. `mcp__Google_Drive__trash_file` ไฟล์เดิม แล้ว `mcp__Google_Drive__create_file` สร้าง `_queue.json` ใหม่ (content mime type: `application/json`, ตั้ง `disableConversionToGoogleType: true` เพื่อไม่ให้ถูกแปลงเป็น Google Doc)
4. แจ้งผู้ใช้ว่าคิวถูกส่งแล้ว จะประมวลผลภายใน ~1 นาที
5. รออย่างน้อย 60–90 วินาที แล้ว `search_files` ดูโฟลเดอร์อีกครั้งว่าไฟล์ PDF โผล่มาหรือยัง และอ่าน `_queue.json` ดู `status` ของ job นั้น (`done` / `error`)

**ถ้า `status` ยังเป็น `pending` นานเกิน ~3 นาที** แปลว่า trigger ยังไม่ได้ติดตั้ง — บอกผู้ใช้ให้ไปรัน `installTrigger()` หนึ่งครั้ง แล้วค่อยข้ามไปขั้นตอนที่ 2 ระหว่างรอ

### ขั้นตอนที่ 2 — WebFetch ตรง (ถ้า queue ยังไม่พร้อม)

ประกอบ request URL:

```
GET {apps_script_url}?secret={apps_script_secret}&url={encodeURIComponent(source_pdf_url)}&filename={encodeURIComponent(book_title)}&folder={encodeURIComponent(drive_folder_name)}
```

ใช้ prompt กับ WebFetch แบบนี้เพื่อให้ได้ JSON ดิบกลับมาไม่ถูกสรุปทิ้ง:
> "Return the exact raw JSON response body verbatim, with no summarization, no commentary, no markdown formatting."

ถ้าเจอ redirect ไปโดเมนอื่น (เช่น `script.googleusercontent.com`) ให้ยิงซ้ำไปที่ URL ที่ redirect ไปทันที

**อย่าลองเกิน 2 ครั้ง** ถ้าได้ `PROXY_REJECTED` / 403 / 404 / read timeout ให้ข้ามไปขั้นตอนที่ 3 ทันที — ห้าม debug ต่อ ห้ามลอง `curl`/Python แทน (เป็นข้อห้ามเด็ดขาด) และห้ามบอกผู้ใช้ว่า deployment เสีย เพราะอาการนี้มาจาก proxy ฝั่งคุณ ไม่ใช่ฝั่งเขา

### ขั้นตอนที่ 3 — Fallback แบบคลิกเดียว

หลักการ: เนื้อไฟล์ยังคงไม่ผ่านคุณอยู่ดี เปลี่ยนแค่ "ใครเป็นคนกดปุ่มยิง request" จากคุณเป็นผู้ใช้แทน

1. ส่ง URL ที่ประกอบเสร็จ (มี secret ฝังอยู่ในตัวแล้ว) ให้ผู้ใช้เป็นลิงก์ที่กดได้ พร้อมบอกสั้นๆ ว่า "กดลิงก์นี้ครั้งเดียว จะเห็น JSON ผลลัพธ์ แล้วไฟล์จะถูกดาวน์โหลดเข้า Drive ให้อัตโนมัติในตัว"
2. เตือนผู้ใช้ทุกครั้งว่า **อย่าแชร์ลิงก์นี้ต่อให้คนอื่น** เพราะมี secret ฝังอยู่ในตัว URL เอง
3. ขอให้ผู้ใช้คัดลอก JSON ที่เห็นกลับมาวางในแชท
4. เสนอให้ผู้ใช้ตั้ง `installTrigger()` เพื่อจะได้ไม่ต้องกดอีกในครั้งถัดไป

### อ่านผลลัพธ์ (จาก queue, WebFetch หรือผู้ใช้ paste กลับมา)

- `{"success": true, "fileId", "fileName", "fileSizeBytes", "url", "folder"}` → ดาวน์โหลดสำเร็จ ไฟล์อยู่ใน Drive แล้ว ไปต่อขั้นตอนบันทึก book list
- `{"success": false, "error": "..."}` → ดูข้อความ error, เทียบกับหัวข้อ "แก้ปัญหาที่พบบ่อย" ใน `references/setup-guide.md` แล้วตัดสินใจว่าควรลองแหล่งอื่น หรือแจ้งผู้ใช้ให้ดาวน์โหลดเองแล้วอัปโหลดเข้า Drive ด้วยตนเอง (ทางเลือกสุดท้ายจริงๆ เมื่อทั้ง Apps Script auto และ one-click ใช้ไม่ได้ เช่นไฟล์ใหญ่กว่า 50MB)

## บันทึก Book List

**บันทึกทุกครั้งหลังจบการดาวน์โหลด** (ทั้งสำเร็จและล้มเหลว) โดยอัปเดตไฟล์ `book-list.md` ในโฟลเดอร์ Drive เดียวกัน (`drive_folder_name`) ผ่าน `mcp__Google_Drive__*` — ไฟล์นี้เป็น text เล็กๆ จึงอัปโหลดตรงผ่าน MCP tool ได้ปกติ ไม่ต้องพึ่ง Apps Script

เนื่องจาก Google Drive API ไม่มีคำสั่ง "แก้ไขเนื้อหาไฟล์เดิม" ตรงๆ ผ่าน `create_file`/`update_file` (update_file แก้ได้แค่ metadata) ให้ทำแบบนี้ทุกครั้งที่ต้องเพิ่มแถวใหม่:
1. `mcp__Google_Drive__search_files` หา `book-list.md` ในโฟลเดอร์ (query: `parentId = '<folder id>'`)
2. อ่านเนื้อหาปัจจุบันจาก `contentSnippet` ที่ได้ นับแถวสุดท้าย → เลขถัดไป
3. ประกอบเนื้อหาใหม่ทั้งไฟล์ (เดิม + แถวใหม่)
4. `mcp__Google_Drive__trash_file` ไฟล์เก่า แล้ว `mcp__Google_Drive__create_file` สร้างใหม่ด้วยชื่อเดิม `book-list.md`

### รูปแบบไฟล์

```markdown
# E-Book List

| # | ชื่อหนังสือ | สถานะ | หมายเหตุ |
|---|------------|--------|---------|
| 1 | Clean Code | ✅ Downloaded | Robert C. Martin — Open Access (2.1 MB) |
| 2 | Competitive Programming in Python | ❌ Not Available | Cambridge University Press — ลิขสิทธิ์เชิงพาณิชย์ |
| 3 | Some Large Scan | ⚠️ Auto-download Failed | ไฟล์ต้นทางใหญ่กว่า 50MB (ขีดจำกัด Apps Script) — ต้องดาวน์โหลดด้วยตนเอง |
```

สถานะที่ใช้:
- `✅ Downloaded` — Apps Script ดาวน์โหลดสำเร็จ ระบุแหล่งที่มา + ขนาดไฟล์ (แปลงจาก `fileSizeBytes` เป็นหน่วยอ่านง่าย) ในหมายเหตุ
- `❌ Not Available` — ไม่พบแหล่งที่ถูกกฎหมาย ระบุเหตุผลในหมายเหตุ
- `⚠️ Auto-download Failed` — พบแหล่งถูกต้องแต่ Apps Script ดึงไม่สำเร็จ (เช่นไฟล์ใหญ่เกิน, เว็บบล็อก bot) ระบุ error และทางเลือกที่เสนอผู้ใช้

## ข้อจำกัดที่ควรรู้

- Apps Script (บัญชี Google ทั่วไป) fetch ไฟล์ได้สูงสุดประมาณ **50MB** ต่อครั้ง และรันได้ไม่เกิน 6 นาทีต่อ request — ebook ทั่วไปไม่เกินนี้ แต่ไฟล์สแกนความละเอียดสูงบางเล่มอาจเกิน
- **Drive Queue มี latency ~1 นาที** ตาม trigger interval และประมวลผลได้สูงสุด 3 job ต่อรอบ (`MAX_JOBS_PER_RUN`) — ถ้าคิว 10 เล่มพร้อมกันจะใช้เวลาราว 4 รอบ (~4 นาที) จึงครบ ให้แจ้งผู้ใช้ตามจริงอย่าบอกว่าเสร็จทันที
- **Time-based trigger มีโควตารันต่อวัน** (บัญชีฟรีราว 90 นาที/วันรวมทุก trigger) — การรันทุกนาทีแบบไม่มีงานใช้เวลาน้อยมากจึงไม่ค่อยชนเพดาน แต่ถ้าผู้ใช้เจอ quota error ให้แนะนำเปลี่ยนเป็น `everyMinutes(5)`
- Deployment URL อาจถูกยกเลิกได้ถ้าผู้ใช้ไปลบ/แก้ไข deployment ใน script.google.com เอง — ถ้าเรียกแล้วได้ error ผิดปกติ (ไม่ใช่ error จากโค้ดในไฟล์ .gs) ให้สงสัยไว้ก่อนว่า deployment อาจหมดอายุ แนะนำให้ผู้ใช้ตรวจสอบ
- ตัวสคริปต์เองไม่ตรวจสอบลิขสิทธิ์ใดๆ — เป็นแค่เครื่องมือ fetch+save ทั่วไป ความรับผิดชอบเรื่องเลือกแหล่งที่ถูกกฎหมายอยู่ที่คุณ (Claude) เสมอ ไม่ใช่ที่สคริปต์

# คำขอ

หลังดาวน์โหลด สรุปรายละเอียดทุกครั้ง:
- ชื่อไฟล์ที่บันทึก (ตั้งชื่อให้สื่อความหมาย ไม่ใช้ underscore เช่น `Clean Code.pdf`)
- แหล่งที่มา (URL ต้นทาง)
- ขนาดไฟล์ (จาก `fileSizeBytes` ในผลลัพธ์ Apps Script)
- ลิงก์ไฟล์ใน Google Drive (จาก `url` ในผลลัพธ์ Apps Script — ผู้ใช้กดเปิดดูได้ทันที)

# ไฟล์แนบ

รองรับ 3 กรณี:

## กรณีที่ 1: ผู้ใช้พิมพ์ชื่อหนังสือ/เอกสาร (ไม่มีไฟล์แนบ)

ค้นหาด้วย WebSearch โดยใช้คำค้นที่เหมาะสม เช่น `"[ชื่อ]" filetype:pdf site:edu` หรือ `"[ชื่อ]" free PDF official` แล้วตรวจแหล่งที่มาตามเกณฑ์ใน "รูปแบบ" ก่อนส่งต่อให้ Apps Script

## กรณีที่ 2: ผู้ใช้แนบรูปปกหนังสือ

มองภาพเพื่ออ่านชื่อเรื่อง ผู้แต่ง และเลขฉบับพิมพ์ (edition) จากปกโดยตรง แล้วค้นหาต่อเหมือนกรณีที่ 1 — ถ้าอ่านปกได้ไม่ชัดเจนหรือกำกวม ถามผู้ใช้ยืนยันชื่อ/ผู้แต่งก่อนค้นหาต่อ

## กรณีที่ 3: ผู้ใช้แนบ URL ไฟล์ PDF มาโดยตรง

ตรวจสอบว่า URL เข้าถึงได้จริงและเป็นลิงก์ PDF (ไม่ใช่หน้า HTML) ก่อนส่งต่อให้ Apps Script
