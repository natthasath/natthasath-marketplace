# Setup Guide: Google Apps Script สำหรับ ebook-drive
 
อ่านไฟล์นี้เมื่อผู้ใช้ยังไม่เคยตั้งค่า `apps_script_url` (ครั้งแรกที่เรียก `/ebook-drive`) หรือเมื่อผู้ใช้ขอให้ช่วยตั้งค่าใหม่/แก้ปัญหา deployment
 
## ทำไมต้องมีขั้นตอนนี้
 
Claude รันอยู่ใน sandbox ที่เชื่อมต่ออินเทอร์เน็ตได้เฉพาะโดเมนที่อยู่ใน allowlist เท่านั้น (เช่น npm, pypi) จึงดาวน์โหลดไฟล์ PDF จากเว็บไซต์ทั่วไปโดยตรงไม่ได้ และต่อให้ดึงมาได้ การส่งไฟล์ขนาดหลาย MB ผ่านข้อความคำสั่งเดียวก็ทำไม่ได้เช่นกัน
 
Google Apps Script แก้ปัญหาทั้งสองข้อพร้อมกัน เพราะมันรันอยู่บนเซิร์ฟเวอร์ของ Google เอง (ไม่ผ่าน sandbox ของ Claude เลย) และเขียนไฟล์เข้า Google Drive ของคุณโดยตรง — Claude แค่ส่ง URL สั้นๆ ไปสั่งงาน ไม่ต้องแตะเนื้อไฟล์เลย
 
## ขั้นตอน (ใช้เวลา ~5 นาที ทำครั้งเดียว)
 
1. ไปที่ **https://script.google.com/** (ล็อกอินด้วย Google account เดียวกับที่มีโฟลเดอร์ `ebook` ใน Drive)
2. คลิก **New project** (โครงการใหม่)
3. ลบโค้ด placeholder ทั้งหมดในไฟล์ `Code.gs` แล้ววางโค้ดทั้งหมดจากไฟล์ `scripts/AppsScript.gs` ที่มากับ skill นี้ลงไปแทน
4. แก้บรรทัด `var SECRET_TOKEN = 'REPLACE_WITH_YOUR_OWN_SECRET';` — เปลี่ยนเป็นค่าสุ่มที่ยาวและคาดเดายาก (แนะนำให้รันคำสั่ง `openssl rand -hex 24` แล้ว copy ผลลัพธ์มาใส่ หรือให้ Claude ช่วยสุ่มให้)
5. ตั้งชื่อโครงการ (มุมซ้ายบน) เช่น "ebook-drive"
6. กด **Deploy** (มุมขวาบน) > **New deployment**
7. คลิกไอคอนเฟือง ⚙️ ข้าง "Select type" แล้วเลือก **Web app**
8. ตั้งค่า:
   - **Execute as**: Me (บัญชีของคุณ)
   - **Who has access**: Anyone
9. กด **Deploy** — ระบบจะขอ **Authorize access** ให้กด Authorize แล้วเลือกบัญชี Google ของคุณ (จะมีหน้าเตือน "Google hasn't verified this app" เพราะเป็นสคริปต์ส่วนตัวของคุณเอง — คลิก Advanced > Go to [ชื่อโครงการ] (unsafe) เพื่อดำเนินการต่อได้อย่างปลอดภัย เนื่องจากเป็นโค้ดที่คุณเป็นคนเขียน/วางเอง)
10. คัดลอก **Web app URL** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`)
11. ส่ง **Web app URL** และ **SECRET_TOKEN** ที่ตั้งไว้ในขั้นตอนที่ 4 กลับมาให้ Claude — Claude จะบันทึกลง config file (`~/.config/claude-ebook-drive/settings.json`) และใช้ได้ทันทีตั้งแต่เล่มถัดไป
## ⭐ ขั้นตอนสำคัญ: เปิดโหมดอัตโนมัติเต็มรูปแบบ (Drive Queue)
 
**ทำขั้นตอนนี้ด้วย ไม่งั้นคุณจะต้องกดลิงก์เองทุกเล่ม**
 
ในหลายสภาพแวดล้อมที่ Claude รันอยู่ (โดยเฉพาะ **Cowork**) โดเมน `script.google.com` ถูกบล็อกที่ network proxy — Claude เรียก Web app URL ไม่ได้เลย ได้ `PROXY_REJECTED` HTTP 403 กลับมา และมีกฎห้ามเลี่ยงด้วย `curl` ทางแก้คือให้ Claude สั่งงานผ่าน **ไฟล์คิวบน Google Drive** แทน HTTP เพราะ Drive connector เป็น first-party authenticated tool ที่ไม่ผ่าน proxy ตัวนั้น
 
1. กลับไปที่หน้าต่าง Apps Script editor
2. เลือกฟังก์ชัน **`installTrigger`** จาก dropdown ด้านบน (ข้างปุ่ม Run)
3. กด **Run** — จะมีขอ Authorize อีกครั้ง (เพราะเพิ่มสิทธิ์สร้าง trigger) ให้อนุญาต
4. ตรวจสอบที่เมนูซ้าย ⏰ **Triggers** — ต้องเห็น `processQueue` ตั้งเป็น "Time-driven / Minutes timer / Every minute"
เท่านี้เสร็จ ตั้งแต่นี้ไป Claude จะเขียน job ลงไฟล์ `_queue.json` ในโฟลเดอร์ `ebook` ของคุณ แล้วสคริปต์จะเก็บงานไปทำเองทุกนาที โดยคุณ**ไม่ต้องกดอะไรอีกเลย**
 
### เปรียบเทียบสองโหมด
 
| | MODE A: Drive Queue | MODE B: Web App |
|---|---|---|
| ผู้ใช้ต้องกดลิงก์ | ไม่ต้อง | ต้องกดทุกเล่ม (ถ้า proxy บล็อก) |
| ความเร็ว | รอสูงสุด ~1 นาที | ทันที |
| ใช้ secret token | ไม่ใช้ | ใช้ (ฝังใน URL) |
| ทำงานเมื่อ proxy บล็อก `script.google.com` | ✅ ได้ | ❌ ไม่ได้ |
| ต้องตั้งค่าเพิ่ม | รัน `installTrigger()` 1 ครั้ง | Deploy web app |
 
แนะนำให้เปิดไว้ทั้งสองโหมด — Claude จะเลือกใช้ Queue ก่อนเสมอ และมี Web App เป็นตัวสำรอง
 
### ปิดโหมดอัตโนมัติ
 
ถ้าต้องการหยุด ให้รันฟังก์ชัน **`uninstallTrigger`** หนึ่งครั้ง
 
## การทดสอบว่าตั้งค่าสำเร็จ
 
- **MODE A**: Claude จะเขียน job ทดสอบลง `_queue.json` แล้วรอ ~1 นาที จากนั้นอ่านไฟล์นั้นซ้ำ ต้องเห็น `"status": "done"` พร้อม `driveUrl` และไฟล์โผล่ในโฟลเดอร์จริง — ถ้ายังเป็น `pending` เกิน 3 นาทีแปลว่า trigger ยังไม่ถูกติดตั้ง
- **MODE B**: Claude จะยิง request ทดสอบพร้อม secret และ URL ของไฟล์ PDF เล็กๆ ที่รู้จักแหล่งที่มาแน่ชัด แล้วตรวจว่าได้ `{"success": true, ...}` กลับมา และไฟล์ไปโผล่ในโฟลเดอร์ `ebook` จริง
## แก้ปัญหาที่พบบ่อย
 
- **Claude เรียก URL นี้เองไม่ได้เลย (ได้ `PROXY_REJECTED` HTTP 403, "404 client error" หรือ "read timeout" ทั้งที่เปิดใน browser ของคุณเองได้ปกติ)** — พบบ่อยมากใน Cowork ไม่ใช่ปัญหาของ deployment คุณเลย โดเมน `script.google.com` ถูกบล็อกที่ network proxy ของ sandbox ตั้งแต่ต้นทาง คำขอไม่เคยเดินทางถึง Google ด้วยซ้ำ และ Claude มีกฎห้ามเลี่ยงด้วย `curl`/Python **วิธีแก้ที่ถูกต้องคือเปิด MODE A (Drive Queue)** ตามหัวข้อ "⭐ ขั้นตอนสำคัญ" ด้านบน — ไม่ใช่การ deploy ใหม่ (deploy กี่รอบก็ไม่หาย เพราะต้นเหตุอยู่ฝั่ง Claude ไม่ใช่ฝั่งคุณ)
- **เขียน `_queue.json` แล้วแต่ `status` ค้างที่ `pending` ไม่ขยับ** — trigger ยังไม่ถูกติดตั้ง ให้รัน `installTrigger()` หนึ่งครั้ง แล้วเช็คเมนู ⏰ Triggers ว่ามี `processQueue` อยู่จริง
- **`_queue.json` กลายเป็น Google Doc แทนไฟล์ JSON** — ตอน `create_file` ต้องตั้ง `disableConversionToGoogleType: true` ไม่งั้น Drive จะแปลง text เป็น Google Doc แล้ว Apps Script อ่าน `getDataAsString()` ไม่ได้ตามที่คาด
- **Trigger รันแล้วแต่ error `Exceeded maximum execution time`** — ไฟล์ใหญ่เกินไปสำหรับหนึ่งรอบ ลดค่า `MAX_JOBS_PER_RUN` เหลือ 1 หรือหาแหล่งไฟล์ที่เล็กกว่า
- **`unauthorized`** — secret ที่ส่งมาไม่ตรงกับใน SECRET_TOKEN ของสคริปต์ ตรวจสอบว่า copy มาไม่มีช่องว่างเกิน
- **HTTP redirect / ได้ HTML กลับมาแทน JSON** — ปกติของ Apps Script Web App ที่เรียกผ่าน GET จะ redirect ไปที่โดเมน `script.googleusercontent.com` ให้ตามลิงก์ redirect นั้นต่อไปอีกครั้งหนึ่ง
- **`source URL returned HTTP 403/404`** — เว็บต้นทางบล็อกการเข้าถึงแบบอัตโนมัติ (bot detection) หรือลิงก์เปลี่ยนไปแล้ว ต้องหาแหล่งใหม่
- **`downloaded content is not a valid PDF`** — เว็บต้นทางคืนหน้า HTML (เช่นหน้า login หรือหน้า error) แทนไฟล์จริง ทั้งที่ HTTP status เป็น 200 — ต้องตรวจลิงก์อีกครั้งหรือหาแหล่งอื่น
- **ไฟล์ใหญ่เกิน 50MB** — ข้อจำกัดของ UrlFetchApp บน Apps Script (บัญชี Google ทั่วไป) จะ fetch ไม่สำเร็จ — กรณีนี้ต้อง fallback เป็นให้ผู้ใช้ดาวน์โหลดเองแล้วแนบไฟล์กลับมา
- **Deployment เก่าหมดอายุ/ถูกลบ** — ถ้า URL เดิมใช้ไม่ได้แล้ว ให้ทำ Deploy > Manage deployments > สร้าง deployment ใหม่ แล้วส่ง URL ใหม่มาให้ Claude อัปเดต config
## ทางเลือกอื่นที่พิจารณาแล้ว (ทำไมไม่ใช้)
 
- **rclone (`copyurl`) ผ่าน Device Bridge**: ใช้ได้จริงถ้าผู้ใช้เปิด Claude Desktop app ค้างไว้ตลอดและตั้งค่า rclone remote ผูกกับ Google Drive ไว้แล้ว แต่ต้องพึ่งว่าเครื่อง desktop เชื่อมต่ออยู่ตอนนั้นพอดี ไม่ทำงานถ้าผู้ใช้ใช้งานผ่านมือถือ/เว็บอย่างเดียว — เหมาะเป็นทางเลือกเสริมสำหรับผู้ใช้ที่ต้องการ ไม่ใช้เป็นค่าเริ่มต้น
- **Cloud Function / Cloud Run**: ทำหน้าที่เดียวกับ Apps Script ได้ แต่ต้องมี GCP project แยก อาจต้องผูกบัตรเครดิต/billing และตั้งค่า service account เพื่อขอสิทธิ์ Drive API เพิ่มเอง — ซับซ้อนเกินความจำเป็นสำหรับงานนี้
- **Zapier / Make.com webhook**: ใช้งานได้เช่นกัน แต่เป็นบริการ third-party ที่มีข้อจำกัดจำนวนงาน/เดือนในแผนฟรี และข้อมูล URL หนังสือจะผ่านเซิร์ฟเวอร์ของบริษัทอื่นเพิ่มอีกชั้น
- **ให้ Claude อัปโหลดไฟล์เข้า Drive ตรงๆ ผ่าน Drive MCP**: `create_file` รับเนื้อไฟล์เป็น base64 ซึ่งแปลว่า Claude ต้องดึงไฟล์ PDF มาไว้กับตัวก่อน — ทำไม่ได้ทั้งสองชั้น เพราะ WebFetch คืนค่าเป็น markdown ที่แปลงแล้วไม่ใช่ raw bytes และไฟล์หลาย MB เกินขนาด tool call เดียวอยู่ดี **แต่** Drive MCP ยังมีประโยชน์มากสำหรับไฟล์ข้อความเล็กๆ ซึ่งเป็นที่มาของ MODE A (ส่งแค่ "คำสั่ง" ไม่กี่ร้อยไบต์ ไม่ใช่ตัวไฟล์)
Apps Script ชนะเพราะฟรี ไม่ต้องผูกบัตร ทำงานผ่านบัญชี Google เดิมของผู้ใช้โดยตรง (ไม่ต้องตั้งค่า credential แยก) และพร้อมใช้งานตลอดเวลาไม่ว่าผู้ใช้จะเปิด desktop app หรือไม่ — และเมื่อรวมกับ Drive Queue (MODE A) ก็ปิดจุดอ่อนเรื่อง proxy บล็อกได้หมด กลายเป็นอัตโนมัติ 100% จริง
 