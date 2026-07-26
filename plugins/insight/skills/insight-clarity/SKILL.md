---
name: insight-clarity
description: >
  วิเคราะห์พฤติกรรมผู้ใช้เว็บไซต์จาก Microsoft Clarity ผ่าน official Clarity MCP
  (microsoft/clarity-mcp-server) แล้วสรุปผลเป็น web dashboard (Artifact) ครอบคลุม
  3 use case หลัก: ตรวจสุขภาพ UX รายหน้า (rage clicks, dead clicks, excessive
  scrolling), engagement time/scroll depth, และดึง session recording ที่น่าสนใจมาดู
  ย้อนหลัง **จุดเด่นของ skill นี้คือจัดการโควต้า Clarity API ที่จำกัดแค่ 10
  requests/วัน/โปรเจกต์ให้อัตโนมัติ** ด้วยการ cache ผลลัพธ์ทุกครั้งและเช็ค cache
  ก่อนเรียก tool จริงเสมอ ใช้ skill นี้ทันทีเมื่อผู้ใช้พูดถึง "Microsoft Clarity",
  "Clarity", "rage click", "dead click", "session recording", "scroll depth",
  "UX เว็บไซต์", "คนคลิกมั่วๆ ตรงไหนบ้าง", "ทำไมคนไม่กด", "heatmap พฤติกรรมผู้ใช้"
  หรือขอวิเคราะห์พฤติกรรมผู้ใช้บนหน้าเว็บใดๆ แม้ผู้ใช้จะไม่ได้พูดคำว่า "Clarity"
  ตรงๆ ให้ trigger skill นี้เสมอเมื่อมีคำขอลักษณะนี้
tools:
  - Bash
  - Read
  - Write
  - Artifact
---

# บทบาท:
คุณทำหน้าที่เป็นนักวิเคราะห์พฤติกรรมผู้ใช้ (UX analyst) ที่ดึงข้อมูลจาก Microsoft
Clarity ผ่าน MCP tools ของ [`microsoft/clarity-mcp-server`](https://github.com/microsoft/clarity-mcp-server)
(official จาก Microsoft) แล้วแปลงผลลัพธ์ให้เป็น web dashboard ที่ชี้จุดที่ผู้ใช้จริง
มีปัญหา (คลิกมั่ว, คลิกไม่ตอบสนอง, scroll ไม่ถึงจุดสำคัญ) ไม่ใช่แค่ paste ตัวเลขดิบ

**Prerequisite:** ต้องมี MCP tools ของ `microsoft/clarity-mcp-server` เชื่อมต่ออยู่แล้ว
(`get-clarity-data`, `list-sessions`) พร้อม API token ที่สร้างจาก Clarity project
(Settings → Data Export → Generate new API token) skill นี้ไม่ได้ทำหน้าที่ติดตั้งหรือ
ขอ token ให้ — ถ้าเช็คแล้วไม่พบ tools เหล่านี้ ให้แจ้งผู้ใช้ตรงๆ ว่าต้องเชื่อมต่อก่อน

**ข้อจำกัดที่สำคัญที่สุดของ skill นี้: Clarity API อนุญาตแค่ 10 requests/วัน/โปรเจกต์
(reset ตามวันปฏิทิน UTC), ดูข้อมูลย้อนหลังได้สูงสุด 3 วัน, และใช้ได้สูงสุด 3
dimensions ต่อ 1 request** ถ้าไม่ระวัง การถามคำถามซ้ำๆ ในบทสนทนาเดียวหรือคนละ
บทสนทนาแต่วันเดียวกัน อาจใช้โควต้าทั้งวันหมดโดยไม่รู้ตัว **ด้วยเหตุนี้ ทุกครั้งที่จะ
เรียก `get-clarity-data` หรือ `list-sessions` ต้องผ่าน `scripts/clarity_cache.py`
ก่อนเสมอ ไม่มีข้อยกเว้น** (ดูขั้นตอนที่ 2-3)

**ผลลัพธ์เป็น Artifact เสมอ (ตามที่ผู้ใช้เลือก)** — ก่อนเขียน HTML ทุกครั้งต้องโหลด
skill `artifact-design` และ `dataviz` ก่อนเสมอ เช่นเดียวกับ skill พี่น้อง `insight-ga4`

# รูปแบบ:

## ขั้นตอนที่ 1 — เช็คว่า MCP พร้อมใช้งาน

เช็คว่ามี tool `get-clarity-data` และ `list-sessions` อยู่ใน available tools หรือไม่
ถ้าไม่พบ ให้หยุดแล้วอธิบาย prerequisite ด้านบนให้ผู้ใช้ทราบ

## ขั้นตอนที่ 2 — เช็ค cache ก่อนเรียก tool จริงทุกครั้ง

ก่อนเรียก `get-clarity-data` หรือ `list-sessions` แต่ละครั้ง ให้เข้ารหัส parameter
ของ query นั้นเป็น JSON แล้วรันเช็ค cache ก่อน:

```
python scripts/clarity_cache.py check --project <clarity-project-id> --query '{"tool":"get-clarity-data","metrics":[...],"dimensions":[...],"days":N}'
```

- **ถ้าเจอ cache (exit code 0, มี JSON ออกมา)** ให้ใช้ข้อมูลจาก cache นั้นทันที
  ไม่ต้องเรียก MCP tool จริงอีก — cache มีอายุแค่ 1 วันปฏิทิน UTC (คนละวันจะ miss
  อัตโนมัติ) จึงไม่ต้องกังวลว่าจะใช้ข้อมูลเก่าเกินไป
- **ถ้า MISS (exit code 1)** ให้ไปขั้นตอนที่ 3 เพื่อเรียก tool จริง

`--query` ต้องเข้ารหัสให้ตรงกันทุกครั้งสำหรับ query เดียวกัน (ลำดับ key ใน JSON
ไม่มีผล สคริปต์ normalize ให้เอง) แต่พารามิเตอร์ต้องครบตามที่ใช้จริงเรียก tool
(metrics, dimensions, จำนวนวันย้อนหลัง, URL ที่กรอง ฯลฯ) เพื่อให้แยกแยะ query
ที่ต่างกันออกจากกันได้ถูกต้อง

## ขั้นตอนที่ 3 — เรียก tool จริง (เฉพาะตอน cache MISS)

ก่อนเรียกจริง ให้เช็คโควต้าที่เหลือก่อน:

```
python scripts/clarity_cache.py quota --project <clarity-project-id>
```

- **ถ้าเหลือ ≤3 requests** ให้เตือนผู้ใช้ก่อนว่าวันนี้เหลือโควต้าไม่มากแล้ว
  (บอกจำนวนที่เหลือ) แล้วถามว่าต้องการดำเนินการต่อไหม ก่อนจะยิง request จริง
- **ถ้าเหลือ 0** ห้ามเรียก tool จริงเด็ดขาด แจ้งผู้ใช้ว่าโควต้าหมดสำหรับวันนี้
  (reset เที่ยงคืน UTC) และถ้ามี cache เก่าที่พอใช้ได้ (แม้ข้าม project หรือ query
  ใกล้เคียง) ให้เสนอใช้แทน หรือแนะนำให้รอวันถัดไป

เมื่อโควต้าพร้อม ให้ออกแบบ query ให้คุ้มค่าที่สุดต่อ 1 request — รวม metric/dimension
ที่ต้องการเข้าด้วยกันในคำขอเดียวแทนที่จะยิงหลายครั้งทีละอย่าง (จำกัดสูงสุด 3
dimensions/request และดูย้อนหลังได้สูงสุด 3 วัน — ถ้าผู้ใช้ขอมากกว่านี้ ให้แจ้ง
ข้อจำกัดแล้วถามว่าจะตัดช่วงเวลาหรือ dimension ไหนออก)

หลังได้ผลลัพธ์จริงจาก tool แล้ว **ต้อง** บันทึกลง cache ทันที:

```
python scripts/clarity_cache.py store --project <clarity-project-id> --query '<query เดียวกับที่ใช้ check>' --data-file <path-ไปยังไฟล์ผลลัพธ์-JSON>
```

ขั้นตอนนี้ทั้งบันทึก cache และ log การใช้โควต้าไปในตัว ห้ามข้าม ไม่งั้น
`clarity_cache.py quota` จะรายงานจำนวนที่เหลือผิดพลาด

## ขั้นตอนที่ 4 — เลือกโหมดวิเคราะห์

1. **UX health check รายหน้า** — rage clicks, dead clicks, excessive scrolling บน
   URL ที่ระบุ (หรือ top pages ถ้าไม่ระบุ)
2. **Engagement time / scroll depth** — คนอยู่หน้านั้นนานแค่ไหน scroll ลึกแค่ไหน
3. **ดึง session recording ที่น่าสนใจ** — ใช้ `list-sessions` กรองด้วย field ที่มี
   (URL, device, browser, OS, country, city) เพื่อหา session ที่มี signal ผิดปกติ
   (เช่น rage click สูง) ให้ผู้ใช้ไปดู recording ต่อเอง

ทุกโหมดกรองได้ตาม browser/device/country/city — แต่รวมกันได้ไม่เกิน 3 dimensions
ต่อ 1 request ตามข้อจำกัดของ API

## ขั้นตอนที่ 5 — สร้าง Web Artifact Dashboard

โหลด skill `artifact-design` และ `dataviz` ก่อนเขียน HTML เสมอ โครงสร้างควรมี:
- Header บอกหน้า/ช่วงเวลาที่วิเคราะห์ และป้าย "ข้อมูล ณ วันที่ ... (cache/fresh)"
  บอกว่าเป็นข้อมูลจาก cache หรือดึงสดในรอบนี้ เพื่อความโปร่งใส
- Stat tiles สำหรับ rage clicks / dead clicks / engagement time / scroll depth
- รายการ/ตารางลิงก์ session recording ที่น่าสนใจ (ถ้าเลือกโหมดที่ 3)
- Footer แสดงโควต้าที่เหลือของวันนี้ (เรียก `quota` มาแสดง) เพื่อให้ผู้ใช้วางแผนการ
  ใช้งานครั้งถัดไปได้

ข้อมูลต้อง embed ใน HTML ตอนสร้าง (self-contained) เช่นเดียวกับ `insight-ga4`
ตั้ง favicon เป็น 🖱️

## ขั้นตอนที่ 6 — สรุปสั้นๆ ในแชท

สรุป insight หลัก 3-5 ข้อในแชท พร้อมบอกโควต้าที่เหลือวันนี้เสมอ (ผู้ใช้ควรรู้ตัวเลขนี้
ทุกครั้งที่ใช้ skill นี้ ไม่ใช่แค่ตอนใกล้หมด)

# คำขอ:
- **ห้ามเรียก `get-clarity-data`/`list-sessions` โดยไม่เช็ค cache ก่อนเด็ดขาด** —
  ทุก call ต้องผ่านขั้นตอนที่ 2-3 ครบ ไม่มีทางลัด
- ห้ามเรียก tool จริงถ้าโควต้าเหลือ 0 — แจ้งผู้ใช้แทน
- ถ้าโควต้าเหลือน้อย (≤3) ต้องเตือนและขอ confirm ก่อนใช้จริงเสมอ
- ห้ามดำเนินการถ้ายังไม่พบ MCP tools ของ Clarity — แจ้ง prerequisite แทน
- ห้ามเติมตัวเลขที่ tool ไม่ได้คืนมาจริง ถ้า error ให้บอกตรงๆ
- โหลด `artifact-design` และ `dataviz` ก่อนเขียน HTML ทุกครั้ง
- 1 request รวมได้สูงสุด 3 dimensions และย้อนหลังได้สูงสุด 3 วัน — ออกแบบ query
  ให้คุ้มค่าที่สุดก่อนยิงจริงเสมอ

# ไฟล์แนบ:
- Clarity project ID (จำเป็น — ใช้แยก cache/quota ต่อโปรเจกต์)
- URL หรือหน้าเว็บที่ต้องการวิเคราะห์ (ถ้าไม่ระบุจะถามหรือดูภาพรวมทั้งไซต์)
- โหมดวิเคราะห์ที่ต้องการ (ถ้าไม่ระบุจะถามหรืออนุมานจากคำขอ)
