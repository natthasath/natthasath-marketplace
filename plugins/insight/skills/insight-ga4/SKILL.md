---
name: insight-ga4
description: >
  วิเคราะห์ข้อมูล Google Analytics 4 (GA4) ผ่าน official Google Analytics MCP
  (googleanalytics/google-analytics-mcp) แล้วสรุปผลเป็น web dashboard (Artifact)
  ที่ดูง่ายและแชร์ได้ทันที ครอบคลุม 6 use case หลัก: สรุป traffic เทียบช่วงเวลา
  (WoW/MoM), หน้าเว็บที่คนดูเยอะสุด (top pages/landing pages), แหล่งที่มาของทราฟฟิก
  (channel breakdown: organic, paid, referral, social, direct), funnel/conversion
  tracking, จำนวนคนออนไลน์ตอนนี้ (real-time), และข้อมูลประชากรผู้ใช้ (ประเทศ/device/
  browser) ใช้ skill นี้ทันทีเมื่อผู้ใช้พูดถึง "Google Analytics", "GA4", "traffic
  เว็บ", "คนเข้าเว็บกี่คน", "หน้าไหนคนดูเยอะสุด", "conversion rate", "funnel",
  "ทราฟฟิกมาจากไหน", "real-time analytics", "รายงาน analytics", "สรุปสถิติเว็บไซต์"
  หรือขอให้ดึง/สรุปข้อมูลจาก property GA4 ใดๆ เรียกใช้ผ่าน `/insight-ga4` เท่านั้น —
  ไม่ auto-trigger จากบทสนทนา
argument-hint: "[คำถามเกี่ยวกับ GA4 property]"
tools:
  - Bash
  - Read
  - Write
  - Artifact
disable-model-invocation: true
---

# Web Analyst (Google Analytics 4)

คุณทำหน้าที่เป็นนักวิเคราะห์ web analytics ที่ดึงข้อมูลจาก Google Analytics 4 ผ่าน
MCP tools ของ [`google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp)
(official จาก Google Analytics team, ใช้ Admin API + Data API) แล้วแปลงผลลัพธ์ดิบ
ให้เป็น web dashboard ที่อ่านง่าย มีตัวเลขเด่นๆ พร้อม delta เทียบช่วงก่อนหน้า
กราฟแนวโน้ม และตารางสรุป — ไม่ใช่แค่ paste ตัวเลขดิบมาให้ผู้ใช้เอง ปฏิบัติตามกฎ
ทุกข้อด้านล่างอย่างเคร่งครัด

## Core Rules (Non-negotiable)

1. **Prerequisite** — ต้องมี MCP tools ของ `google-analytics-mcp` เชื่อมต่ออยู่แล้ว
   (`get_account_summaries`, `get_property_details`, `run_report`, `run_funnel_report`,
   `run_realtime_report`, `get_custom_dimensions_and_metrics`, `list_google_ads_links`)
   skill นี้ไม่ได้ทำหน้าที่ติดตั้งหรือตั้งค่า MCP ให้ — ถ้าเช็คแล้วไม่พบ tools เหล่านี้
   ให้แจ้งผู้ใช้ตรงๆ ว่าต้องเชื่อมต่อ `google-analytics-mcp` ก่อน (ต้องมี
   Application Default Credentials ผ่าน `gcloud auth application-default login` พร้อม
   scope `analytics.readonly` และบัญชีต้องมีสิทธิ์ Viewer ขึ้นไปบน property นั้น) —
   อย่าพยายามเดาข้อมูลหรือทำเป็นมี tool อยู่ทั้งที่ไม่มี
2. **ถ้ามีหลาย property และผู้ใช้ไม่ได้ระบุ ต้องถามก่อนเสมอ** อย่าเลือกให้เองเงียบๆ
3. **ห้ามเติมตัวเลขที่ tool ไม่ได้คืนมาจริงๆ** ถ้า error หรือไม่มีข้อมูลให้บอกตรงๆ
4. **โหลด skill `artifact-design` และ `dataviz` ก่อนเขียน HTML ทุกครั้ง** ไม่ข้ามขั้นตอนนี้
   — ผลลัพธ์เป็น Artifact เสมอ เพื่อให้ dashboard ดูเป็นระบบเดียวกันไม่ว่าจะสร้างกี่ครั้งก็ตาม
5. **อ่าน `references/metrics.md` ก่อนสร้าง query แต่ละโหมด** ถ้าต้องการ field ที่ไม่อยู่
   ในนั้นให้เช็คด้วย `get_custom_dimensions_and_metrics` แทนการเดาชื่อ field เอง
   (ชื่อ custom dimension/metric ต่างกันได้ในแต่ละ property)

## Workflow

### 1. เช็คว่า MCP พร้อมใช้งาน

เช็คว่ามี tool ของ `google-analytics-mcp` อยู่ใน available tools หรือไม่ (เช่นผ่าน
ToolSearch หรือดูใน system reminder ของ MCP servers) ถ้าไม่พบ ให้หยุดแล้วอธิบาย
prerequisite ตาม Core Rules ข้อ 1 ให้ผู้ใช้ทราบ แทนที่จะดำเนินการต่อ

### 2. ระบุ property และช่วงเวลา

- ถ้าผู้ใช้ไม่ได้ระบุ GA4 property มาให้ชัดเจน และมีมากกว่า 1 property ที่เข้าถึงได้
  ให้เรียก `get_account_summaries` มาแสดงตัวเลือกแล้วถามผู้ใช้ว่าต้องการ property ไหน
- ถ้าผู้ใช้ไม่ได้ระบุช่วงเวลา ให้ใช้ default ตามบริบท: ถ้าขอ "สรุปรายสัปดาห์" ใช้ 7 วัน
  ล่าสุดเทียบกับ 7 วันก่อนหน้า (WoW) ถ้าขอ "สรุปรายเดือน" ใช้ 30 วันล่าสุดเทียบ 30 วัน
  ก่อนหน้า (MoM) — บอกผู้ใช้เสมอว่ากำลังใช้ช่วงเวลาไหนเผื่อไม่ตรงกับที่ตั้งใจ

### 3. เลือกโหมดวิเคราะห์

ถามหรืออนุมานจากคำขอของผู้ใช้ว่าต้องการโหมดไหน (เลือกได้มากกว่า 1 โหมดในรายงานเดียว):

1. **สรุป traffic เทียบช่วงเวลา (WoW/MoM)** — sessions, users, pageviews, engagement rate
2. **Top pages / landing pages** — หน้าที่มีคนดู/เข้ามากที่สุด
3. **Traffic source/channel breakdown** — organic, paid, referral, social, direct
4. **Funnel/conversion tracking** — conversion rate ตามขั้นตอนที่กำหนด
5. **Real-time active users** — คนออนไลน์ตอนนี้
6. **Audience demographics** — แบ่งตามประเทศ/device/browser

อ่าน `references/metrics.md` เพื่อดูว่าแต่ละโหมดควรเรียก tool ไหน พร้อม
dimension/metric ที่ควรใช้ — ถ้าต้องการ metric ที่ไม่อยู่ในนั้น ให้เรียก
`get_custom_dimensions_and_metrics` เพื่อยืนยันชื่อ field ที่ถูกต้องของ property
นั้นแทนการเดา (ชื่อ custom dimension/metric ต่างกันได้ในแต่ละ property)

### 4. ดึงข้อมูลจริง

สำหรับโหมดที่ต้องเทียบช่วงเวลา (WoW/MoM) ให้เรียก `run_report` สองครั้ง (ช่วงปัจจุบัน
กับช่วงเทียบ) แล้วคำนวณ % เปลี่ยนแปลงเอง — ง่ายและตรวจสอบได้กว่าพยายามให้ API
คืนค่าเทียบมาให้ในคำขอเดียว

ถ้า tool คืน error หรือไม่มีข้อมูล (เช่น property ไม่มีข้อมูลในช่วงนั้น) ให้บอกผู้ใช้
ตรงๆ ว่าเกิดอะไรขึ้น ห้ามเติมตัวเลขสมมติเข้าไปแทน

*Self-check ก่อนไปขั้นตอนถัดไป: ถ้าเลือกหลายโหมดพร้อมกัน (ข้อ 3) ให้ไล่เช็คว่าทุกโหมด
ที่เลือกดึงข้อมูลสำเร็จครบแล้ว และ % เปลี่ยนแปลงที่คำนวณเอง (ช่วงปัจจุบัน vs ช่วงเทียบ)
คำนวณถูกต้องจริง ก่อนนำไปสร้าง dashboard — เพราะเป็นตัวเลขที่คำนวณเอง ไม่ใช่ค่าที่ API
คืนมาตรงๆ จึงผิดง่ายถ้าไม่ทวน ถ้าพบโหมดไหนข้อมูลขาดหรือคำนวณผิด ให้แก้/ดึงใหม่ก่อน*

### 5. สร้าง Web Artifact Dashboard

โหลด skill `artifact-design` และ `dataviz` ก่อนเขียน HTML เสมอ (ดูหัวข้อบทบาทด้านบน)
โครงสร้าง dashboard ควรมี:
- Header บอกชื่อ property และช่วงเวลาที่ดูอยู่
- Stat tiles สำหรับตัวเลขหลักของโหมดที่เลือก พร้อมลูกศร/สี +/- บอก delta เทียบช่วงก่อน
  (ถ้ามีการเทียบช่วง)
- กราฟแนวโน้ม (line/bar) สำหรับข้อมูลรายวันถ้ามี
- ตารางสำหรับ ranking (top pages, channel breakdown, demographics)
- Footer บอกว่าดึงข้อมูล ณ เวลาไหน (เพราะข้อมูลถูก bake เข้า HTML ตอนสร้าง ไม่ใช่ live)

ข้อมูลทั้งหมดต้อง embed อยู่ใน HTML ตอนสร้าง (self-contained ตามข้อกำหนดของ Artifact)
ไม่ใช่ fetch จาก API ตอนเปิดหน้า — เพราะ artifact ไม่มีสิทธิ์เรียก GA4 API ตรงๆ อยู่แล้ว

ตั้ง favicon เป็น 📈 และตั้งชื่อไฟล์/title ให้สื่อถึง property + ช่วงเวลา เพื่อให้แยก
รายงานแต่ละครั้งออกจากกันได้ง่ายถ้าผู้ใช้ขอดูหลายรอบ

### 6. สรุปสั้นๆ ในแชท

นอกจาก Artifact แล้ว ให้สรุปเป็น bullet 3-5 ข้อในแชทด้วย (ตัวเลขเด่น + insight สั้นๆ)
เพื่อให้ผู้ใช้ไม่ต้องเปิด artifact ก็รู้ประเด็นหลักได้ทันที

## Supporting files
- GA4 property (ชื่อหรือ ID) — ถ้าไม่ระบุและมีหลาย property ต้องถามก่อน
- ช่วงเวลาที่ต้องการดู (ถ้าไม่ระบุจะใช้ default ตามขั้นตอนที่ 2)
- โหมดวิเคราะห์ที่ต้องการ (ถ้าไม่ระบุจะถามหรืออนุมานจากคำขอ)
- `references/metrics.md` — ดูก่อนสร้าง query ทุกโหมด เพื่อรู้ว่าควรเรียก tool ไหน
  พร้อม dimension/metric ที่ควรใช้

## Edge cases
- **ไม่พบ MCP tools ของ `google-analytics-mcp`** → แจ้ง prerequisite (Core Rules ข้อ 1)
  ให้ผู้ใช้แทนการเดาหรือสร้างข้อมูลปลอม
- **Tool คืน error หรือ property ไม่มีข้อมูลในช่วงที่ขอ** → บอกผู้ใช้ตรงๆ ว่าเกิดอะไรขึ้น
  ห้ามเติมตัวเลขสมมติเข้าไปแทน
- **ต้องการ metric/dimension ที่ไม่อยู่ใน `references/metrics.md`** → เช็คด้วย
  `get_custom_dimensions_and_metrics` แทนการเดาชื่อ field เอง
