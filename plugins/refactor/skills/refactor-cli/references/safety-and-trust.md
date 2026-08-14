# Safety & Trust

หมวดนี้**เกี่ยวเฉพาะ tool ที่มี side effect** (เขียน/ลบไฟล์, รันคำสั่งระบบ, เปลี่ยนสถานะภายนอก) — tool
read-only ล้วน (เช่น viewer, formatter แบบ dry-only) ข้ามหมวดนี้ไปได้เกือบทั้งหมด ยกเว้น Permission/Privilege
ถ้ามีการอ่านข้อมูล sensitive

## Safety Model

รูปแบบที่แนะนำคือ **2 แกนแยกกัน** ไม่ผูกเป็น flag เดียว — codex ทำแบบนี้และเป็นตัวอย่างที่ดี:

1. **สิทธิ์ที่ทำได้ (sandbox)** — `-s, --sandbox <read-only|workspace-write|danger-full-access>` คุมว่า
   "แตะอะไรได้บ้าง"
2. **เมื่อไหร่ต้องถามคน (approval)** — `-a, --ask-for-approval <untrusted|on-request|never>` คุมว่า
   "ต้องหยุดถามก่อนไหม"

แยกสองแกนนี้ทำให้ผสม config ได้ยืดหยุ่น (เช่น "แก้ไฟล์ได้เองแต่ต้องถามก่อนรันคำสั่งที่ไม่รู้จัก") ดีกว่ายัดรวมเป็น
`--mode aggressive|safe` เดียวที่บังคับเลือกทั้งคู่พร้อมกัน

## Safety / Confirmation

- Default ควรเป็น "ถามก่อนทำลาย" เสมอสำหรับ action ที่ irreversible
- มี flag ข้าม confirmation ได้ (`--yes`/`-y`/`--force`) สำหรับ non-interactive/automation แต่ชื่อ flag ต้อง
  หาเจอง่ายและมาตรฐาน (`-y`/`--yes` เป็น convention ที่กว้างที่สุดข้าม ecosystem)
- ในโหมด non-interactive ถ้าไม่มี `--yes` และคำสั่งต้องการ confirmation ต้อง **fail ทันทีพร้อมข้อความชัดเจน**
  ไม่ใช่ hang รอ input ที่ไม่มีวันมา (เชื่อมกับ `interaction-and-automation.md`)

## Dry Run

- `--dry-run` (หรือ `plan` mode แบบ codex ที่ resume ใช้) ต้องแสดง**สิ่งที่จะเกิดขึ้นจริง** ไม่ใช่แค่ echo
  คำสั่งที่จะรัน — รูปแบบ output ของ dry-run ควรใกล้เคียงกับ summary ของการรันจริง เพื่อให้เชื่อถือได้ว่า
  "ดู dry-run แล้วพอเดาผลจริงได้"
- ถ้า tool มี multi-step operation ที่ affect หลายจุด dry-run ควรแสดงลำดับขั้นตอนทั้งหมด ไม่ใช่แค่ขั้นแรก

## Backup / Rollback

- ถ้า tool ทำงานในโปรเจกต์ที่มักอยู่ใต้ git อยู่แล้ว **ให้พึ่ง git แทนการเขียนระบบ backup ของตัวเอง** — codex
  `apply` เอา diff ที่ agent สร้างไป `git apply` เข้า working tree ตรงๆ ทำให้ rollback = `git checkout`/
  `git stash` ตามปกติ ไม่ต้องมี custom `.bak` format ให้ผู้ใช้เรียนรู้เพิ่ม
- ถ้า tool ทำงานนอก git repo ได้ด้วย (เช่น แก้ system config) ต้องมี backup mechanism ของตัวเองจริงๆ — บอก
  path ที่ backup ไปชัดเจนใน output ทุกครั้ง ไม่ใช่ backup เงียบๆ

## Permission / Privilege

- Flag ที่ข้าม safety guard ทั้งหมดต้อง**ตั้งชื่อให้ดูอันตรายตามระดับความเสี่ยงจริง** — codex ตั้งชื่อ
  `--dangerously-bypass-approvals-and-sandbox` ยาวและมีคำว่า "dangerously" นำหน้าตรงตัว ไม่ใช่ทำให้สั้น/ดูปกติ
  (เทียบกับ `--force` เฉยๆ ซึ่งดูไม่อันตรายพอสำหรับ action ระดับนี้)
- อย่าตั้ง default ให้ตรงกับ privilege สูงสุด — ต้อง opt-in เท่านั้น
- ถ้าต้องรันด้วยสิทธิ์ผู้ดูแลระบบ (`sudo`/Administrator) ให้ตรวจสอบและแจ้งเตือนก่อนรันจริง ไม่ใช่ปล่อยให้ fail
  แบบ error ที่ไม่บอกสาเหตุ
