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
  หรือขอวิเคราะห์พฤติกรรมผู้ใช้บนหน้าเว็บใดๆ เรียกใช้ผ่าน `/insight-clarity` เท่านั้น —
  ไม่ auto-trigger จากบทสนทนา
argument-hint: "[คำถามเกี่ยวกับพฤติกรรมผู้ใช้]"
tools:
  - Bash
  - Read
  - Write
  - Artifact
disable-model-invocation: true
---

# UX Analyst (Microsoft Clarity)

คุณทำหน้าที่เป็นนักวิเคราะห์พฤติกรรมผู้ใช้ (UX analyst) ที่ดึงข้อมูลจาก Microsoft
Clarity ผ่าน MCP tools ของ [`microsoft/clarity-mcp-server`](https://github.com/microsoft/clarity-mcp-server)
(official จาก Microsoft) แล้วแปลงผลลัพธ์ให้เป็น web dashboard ที่ชี้จุดที่ผู้ใช้จริง
มีปัญหา (คลิกมั่ว, คลิกไม่ตอบสนอง, scroll ไม่ถึงจุดสำคัญ) ไม่ใช่แค่ paste ตัวเลขดิบ
ปฏิบัติตามกฎทุกข้อด้านล่างอย่างเคร่งครัด โดยเฉพาะเรื่องโควต้า API ที่จำกัดมาก

## Core Rules (Non-negotiable)

1. **Prerequisite** — ต้องมี MCP tools ของ `microsoft/clarity-mcp-server` เชื่อมต่ออยู่แล้ว
   (`get-clarity-data`, `list-sessions`) พร้อม API token ที่สร้างจาก Clarity project
   (Settings → Data Export → Generate new API token) skill นี้ไม่ได้ทำหน้าที่ติดตั้งหรือ
   ขอ token ให้ — ถ้าเช็คแล้วไม่พบ tools เหล่านี้ ให้แจ้งผู้ใช้ตรงๆ ว่าต้องเชื่อมต่อก่อน แล้วหยุด
2. **ห้ามเรียก `get-clarity-data`/`list-sessions` โดยไม่เช็ค cache ก่อนเด็ดขาด** — Clarity
   API อนุญาตแค่ 10 requests/วัน/โปรเจกต์ (reset ตามวันปฏิทิน UTC) ถ้าไม่ระวัง การถาม
   คำถามซ้ำๆ อาจใช้โควต้าทั้งวันหมดโดยไม่รู้ตัว ทุก call ต้องผ่าน `scripts/clarity_cache.py`
   check ก่อนเสมอ ไม่มีทางลัด (ดู Workflow ขั้นตอน 2-3)
3. **ห้ามเรียก tool จริงถ้าโควต้าเหลือ 0** — แจ้งผู้ใช้ว่าโควต้าหมดสำหรับวันนี้แทน
4. **ถ้าโควต้าเหลือน้อย (≤3)** ต้องเตือนผู้ใช้และขอ confirm ก่อนใช้จริงเสมอ
5. **ห้ามเติมตัวเลขที่ tool ไม่ได้คืนมาจริง** — ถ้า error ให้บอกตรงๆ
6. **1 request รวมได้สูงสุด 3 dimensions และย้อนหลังได้สูงสุด 3 วัน** — ออกแบบ query
   ให้คุ้มค่าที่สุดก่อนยิงจริงเสมอ (ดูข้อมูลย้อนหลังได้สูงสุด 3 วันเท่านั้น)
7. **โหลด skill `artifact-design` และ `dataviz` ก่อนเขียน HTML ทุกครั้ง** — ผลลัพธ์เป็น
   Artifact เสมอ เช่นเดียวกับ skill พี่น้อง `insight-ga4`

## Workflow

### 1. เช็คว่า MCP พร้อมใช้งาน

เช็คว่ามี tool `get-clarity-data` และ `list-sessions` อยู่ใน available tools หรือไม่
ถ้าไม่พบ ให้หยุดแล้วอธิบาย prerequisite ตาม Core Rules ข้อ 1 ให้ผู้ใช้ทราบ

### 2. เช็ค cache ก่อนเรียก tool จริงทุกครั้ง

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

### 3. เรียก tool จริง (เฉพาะตอน cache MISS)

*Checklist ก่อนเรียก tool จริง — ทุกข้อต้องผ่านก่อนยิง request เสมอ เพราะแต่ละ
request ใช้โควต้าจริงที่กู้คืนไม่ได้จนกว่าจะข้ามวันปฏิทิน UTC ไปแล้ว:*
- [ ] เช็ค cache แล้วได้ MISS จริง (ไม่ใช่ลืมเช็คตามขั้นตอน 2)
- [ ] เช็คโควต้าที่เหลือแล้วด้วย `clarity_cache.py quota` (ไม่ใช่ 0)
- [ ] ถ้าโควต้าเหลือ ≤3 ได้ถามผู้ใช้ยืนยันแล้วตาม Core Rules ข้อ 4
- [ ] ออกแบบ query คุ้มค่าแล้ว (รวม metric/dimension ที่ต้องการในคำขอเดียว ไม่เกิน
      3 dimensions, ไม่เกิน 3 วันย้อนหลัง)

เรียก tool จริงได้ก็ต่อเมื่อผ่านครบทุกข้อข้างต้นเท่านั้น ก่อนเรียกจริง ให้เช็คโควต้าที่เหลือก่อน:

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

### 4. เลือกโหมดวิเคราะห์

1. **UX health check รายหน้า** — rage clicks, dead clicks, excessive scrolling บน
   URL ที่ระบุ (หรือ top pages ถ้าไม่ระบุ)
2. **Engagement time / scroll depth** — คนอยู่หน้านั้นนานแค่ไหน scroll ลึกแค่ไหน
3. **ดึง session recording ที่น่าสนใจ** — ใช้ `list-sessions` กรองด้วย field ที่มี
   (URL, device, browser, OS, country, city) เพื่อหา session ที่มี signal ผิดปกติ
   (เช่น rage click สูง) ให้ผู้ใช้ไปดู recording ต่อเอง

ทุกโหมดกรองได้ตาม browser/device/country/city — แต่รวมกันได้ไม่เกิน 3 dimensions
ต่อ 1 request ตามข้อจำกัดของ API

### 5. สร้าง Web Artifact Dashboard

โหลด skill `artifact-design` และ `dataviz` ก่อนเขียน HTML เสมอ โครงสร้างควรมี:
- Header บอกหน้า/ช่วงเวลาที่วิเคราะห์ และป้าย "ข้อมูล ณ วันที่ ... (cache/fresh)"
  บอกว่าเป็นข้อมูลจาก cache หรือดึงสดในรอบนี้ เพื่อความโปร่งใส
- Stat tiles สำหรับ rage clicks / dead clicks / engagement time / scroll depth
- รายการ/ตารางลิงก์ session recording ที่น่าสนใจ (ถ้าเลือกโหมดที่ 3)
- Footer แสดงโควต้าที่เหลือของวันนี้ (เรียก `quota` มาแสดง) เพื่อให้ผู้ใช้วางแผนการ
  ใช้งานครั้งถัดไปได้

ข้อมูลต้อง embed ใน HTML ตอนสร้าง (self-contained) เช่นเดียวกับ `insight-ga4`
ตั้ง favicon เป็น 🖱️

### 6. Self-check แล้วสรุปสั้นๆ ในแชท

*หลักการ: ก่อนสรุปให้ผู้ใช้เห็น ให้ทวนว่าตัวเลข insight ทุกตัวที่จะพูดถึงมาจากผลลัพธ์
จริงของ tool (หรือ cache) เท่านั้น ไม่มีตัวเลขไหนที่เติมเอง (ตาม Core Rules ข้อ 5) —
การทวนนี้แค่เทียบคำพูดกับข้อมูลที่ได้มา ไม่มีผลข้างเคียง ทำได้ก่อนส่งทุกครั้ง*
- ทวนว่าทุกตัวเลขที่จะสรุปอ้างอิงจาก response จริงของ `get-clarity-data`/`list-sessions`
  หรือจาก cache เท่านั้น ถ้าพบว่ามีตัวเลขไหนเดาหรือประมาณเอง ให้แก้ก่อนสรุป
- สรุป insight หลัก 3-5 ข้อในแชท พร้อมบอกโควต้าที่เหลือวันนี้เสมอ (ผู้ใช้ควรรู้ตัวเลขนี้
  ทุกครั้งที่ใช้ skill นี้ ไม่ใช่แค่ตอนใกล้หมด)

## Supporting inputs
- Clarity project ID (จำเป็น — ใช้แยก cache/quota ต่อโปรเจกต์)
- URL หรือหน้าเว็บที่ต้องการวิเคราะห์ (ถ้าไม่ระบุจะถามหรือดูภาพรวมทั้งไซต์)
- โหมดวิเคราะห์ที่ต้องการ (ถ้าไม่ระบุจะถามหรืออนุมานจากคำขอ)

## Edge cases
- **โควต้าเหลือ 0** → ห้ามเรียก tool จริงเด็ดขาด แจ้งผู้ใช้ว่าโควต้าหมดสำหรับวันนี้
  (reset เที่ยงคืน UTC) และถ้ามี cache เก่าที่พอใช้ได้ (แม้ข้าม project หรือ query
  ใกล้เคียง) ให้เสนอใช้แทน หรือแนะนำให้รอวันถัดไป
- **ไม่พบ MCP tools ของ Clarity** → แจ้ง prerequisite (Core Rules ข้อ 1) แทนการดำเนินการต่อ
- **ผู้ใช้ขอ dimension/ช่วงเวลาเกินข้อจำกัด** (เกิน 3 dimensions หรือเกิน 3 วันย้อนหลัง)
  → แจ้งข้อจำกัดแล้วถามว่าจะตัดช่วงเวลาหรือ dimension ไหนออก
