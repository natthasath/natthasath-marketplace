# 🎉 mods-gitgraph

Mod that renders a full git commit-graph pane inside Claude Code, like SourceTree/GitKraken/VS Code Git Graph.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-gitgraph` | แสดง git commit graph แบบมีสีในแถบด้านข้าง เปิดอัตโนมัติตอนเริ่ม session ถ้า cwd เป็น git repository (ปิด/เปิดใหม่ได้ด้วย `/mods-gitgraph`) — เห็นทุก branch/tag เป็น pill สีตาม lane, branch ที่ checkout อยู่ตัวหนาพร้อม ●, tag สีทอง ◆, local+remote ของ branch เดียวกันรวม pill เดียว (`develop ⇄ origin`); คลิก commit เพื่อดู author/date/full message และไฟล์ที่เปลี่ยนพร้อม diffstat bar พร้อม action copy hash/checkout/cherry-pick/reset soft และสร้าง branch ใหม่จาก commit นั้น; right-click (หรือ ⋯ ใน detail) ที่ pill เปิดเมนู checkout/rename/push/merge/rebase/delete สำหรับ local branch, checkout-as-tracking/fetch/merge/delete-on-remote สำหรับ remote branch, push/delete สำหรับ tag — double-click pill เพื่อ checkout ทันที; push เลือกได้หลาย remote พร้อมกันหรือ all; action ที่ทำลายข้อมูลต้องกดยืนยันรอบสอง; ค้นหา commit ด้วย hash (4-40 hex) แล้วเลื่อนไปให้; มีปุ่ม fetch all และ refresh พร้อม auto-refresh หลังรันคำสั่ง git ผ่าน Bash tool และ poll ทุก 5 วินาที (reload เฉพาะตอน ref/status เปลี่ยนจริง); รองรับหลาย repo ในโฟลเดอร์เดียว (ลึกสุด 3 ระดับ) ด้วย dropdown เลือก repo; มีหน้า settings ตั้ง user.name/user.email แยก local/global และจัดการ remote (เพิ่ม/แก้ URL/fetch/ลบ) — **ไม่รวม** Git Flow bar |

### 🏆 Usage

```
/mods-gitgraph
```

เรียก `/mods-gitgraph` เพื่อเปิด/ปิดแผง Git Graph ด้วยตัวเอง ที่เหลือใช้เมาส์คลิกในแผงได้ทั้งหมด (คลิกซ้าย/ขวา/ดับเบิลคลิกที่ pill, คลิก commit, ปุ่มต่างๆ บน header)

### ⚙️ Config

| Field | ค่า default | คำอธิบาย |
|---|---|---|
| `autoOpen` | `true` | เปิดแผง Git Graph อัตโนมัติตอนเริ่ม session ถ้า cwd เป็น git repository |
| `badges` | `auto` | รูปแบบ pill ของ branch/tag — `auto` ใช้ Nerd Font ถ้าเครื่องมีฟอนต์ติดตั้งอยู่ ไม่งั้นใช้ `square`; เลือก `round` หรือ `square` เองได้ถ้า auto เดาผิด |
