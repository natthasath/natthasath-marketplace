# 🎉 mods-filetree

Mod that renders an IDE-style file tree pane inside Claude Code, showing what Claude reads and writes. Inspired by [data-goblin/claude-code-filetree](https://github.com/data-goblin/claude-code-filetree) (MIT); this is its own implementation of a subset of that project's features.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-filetree` | แสดง file tree ของโฟลเดอร์ที่ session เปิดอยู่ในแถบด้านข้าง เปิดอัตโนมัติตอนเริ่ม session (ปิด/เปิดใหม่ได้ด้วย `/mods-filetree`) — โฟลเดอร์ก่อนไฟล์ คลิกเพื่อกาง/หุบ; สถานะ git ต่อไฟล์ (M แก้ไข, A เพิ่ม, ? untracked, D ลบ, R rename, U conflict) พร้อมสีตามสถานะ โฟลเดอร์ที่มีไฟล์เปลี่ยนติดสถานะด้วย ไฟล์ที่ถูก ignore แสดงจาง; คอลัมน์ขวาสลับ size/date ได้; ไฟล์ที่ Claude อ่าน (Read) หรือเขียน (Write/Edit/NotebookEdit) ติดไฮไลต์ ◆ สีฟ้าเขียว/เหลืองราว 6 วินาที และ Follow Claude จะกางโฟลเดอร์แล้วเลื่อนไปหาไฟล์นั้นให้; ค้นหาไฟล์ตามชื่อทั้ง repo (รวมโฟลเดอร์ที่ยังไม่ได้กาง) แล้วคลิกผลลัพธ์เพื่อเปิดไปที่ไฟล์ใน tree; คลิกไฟล์เพื่อเลือก ดับเบิลคลิกเพื่อเปิดด้วยแอป default, footer มีปุ่ม copy path (relative/absolute) และ open; ปุ่ม collapse all และ refresh บน header พร้อม auto-refresh ทุก 3 วินาทีและหลัง Claude รัน Bash/เขียนไฟล์; ใน terminal แบบ dock header และ footer ติดอยู่กับที่ ส่วน tree เลื่อนในตัว |

### 🏆 Usage

```
/mods-filetree
```

เรียก `/mods-filetree` เพื่อเปิด/ปิดแผง File Tree ด้วยตัวเอง ที่เหลือใช้เมาส์คลิกในแผงได้ทั้งหมด (คลิกโฟลเดอร์/ไฟล์, ดับเบิลคลิกเปิดไฟล์, ปุ่มบน header และ footer)

### ⚙️ Config

| Field | ค่า default | คำอธิบาย |
|---|---|---|
| `autoOpen` | `true` | เปิดแผง File Tree อัตโนมัติตอนเริ่ม session |
| `followClaude` | `true` | กางโฟลเดอร์และเลื่อนไปหาไฟล์ที่ Claude กำลังอ่านหรือเขียน |
| `column` | `size` | ค่าในคอลัมน์ขวาตอนเปิดแผง — `size` หรือ `date` (กดสลับในแผงได้) |

### 📦 Install

```
/plugin install mods-filetree@natthasath-marketplace
```

### 🚧 ยังไม่มี (เทียบกับต้นฉบับ)

ค้นหาเนื้อหาในไฟล์ (git grep), เลือกหลายไฟล์/ส่งเป็น context, preview, treemap, guards, diff, คีย์ลัด j/k, shimmer แบบเคลื่อนไหว และ icon แบบ Nerd Font
