# Resource Model & CRUD

หมวดนี้**เกี่ยวเฉพาะ tool ที่จัดการ "ทรัพยากร" ที่มีชื่อ/ตัวตนหลายตัว** (server, plugin, user, session,
container) — tool ที่ทำงานเดี่ยวๆ ไม่มีของให้ list/add/remove ข้ามหมวดนี้ได้เลย

## Resource Model

ถ้า tool มี resource มากกว่า 1 ประเภท ให้แต่ละประเภทเป็น noun group แยกกันที่ top level (ดู
`identity-and-structure.md` เรื่อง Command Hierarchy) — codex มี resource เดียวชัดเจนคือ MCP server เลยจัด
เป็น `codex mcp <verb>` กลุ่มเดียว ถ้ามีหลาย resource ประเภท (เช่น ต้องจัดการทั้ง server และ plugin) ให้แยก
เป็น `tool mcp <verb>` กับ `tool plugin <verb>` คนละกลุ่ม ไม่ยัดรวม

## Core CRUD Operations

ใช้ verb set เดียวกันทุก resource group ในทั้ง tool — ตัวอย่าง verb set มาตรฐานจาก `codex mcp`:

| Verb | ความหมาย |
|---|---|
| `list` | แสดงทั้งหมด |
| `get` | ดูรายละเอียดของตัวเดียว |
| `add` | สร้างใหม่ |
| `remove` | ลบ |
| `login` / `logout` | ถ้า resource นั้นต้อง auth แยกต่างหาก (ดู Auth/Identity ด้านล่าง) |

หลักการเลือก verb: `list` ไม่ใช่ `ls`, `add` ไม่ใช่ `create` (เลือกอย่างใดอย่างหนึ่งแล้วใช้ให้สม่ำเสมอทั้ง
tool), `remove` ไม่ใช่ `delete`/`rm` ปนกัน — ถ้า refactor tool ที่มีหลาย resource group ใช้ verb ไม่ตรงกัน
(บาง group ใช้ `ls` บาง group ใช้ `list`) **นี่คือจุดที่ควรรวมให้เป็นชุดเดียวเป็นอันดับแรก**

`update`/`set` เพิ่มได้ถ้า resource นั้นแก้ไขได้หลัง add แล้ว (ไม่ต้อง remove แล้ว add ใหม่)

## Auth / Identity

แยกจาก CRUD ทั่วไปเพราะเป็นคนละคำถาม — CRUD คือ "จัดการทรัพยากรยังไง" ส่วน Auth คือ "คุณเป็นใคร"

Pattern มาตรฐาน: `login` / `logout` / `login status` (หรือ `whoami`) — codex มีทั้งระดับ tool เอง
(`codex login`/`codex logout`/`codex login status`) และระดับ resource ย่อย (`codex mcp login`/
`codex mcp logout` สำหรับ MCP server แต่ละตัวที่ต้อง auth เอง) — ถ้า tool มีทั้งสองระดับ ให้แยกให้ชัดว่า
auth ระดับไหนกำลังถูกจัดการอยู่ อย่าใช้ชื่อ command เดียวกันแล้วให้บริบทตัดสินเอง
