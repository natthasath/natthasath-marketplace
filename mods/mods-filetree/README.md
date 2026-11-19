# 🎉 mods-filetree

Mod that renders an IDE-style file tree pane inside Claude Code, showing what Claude reads and writes. Inspired by [data-goblin/claude-code-filetree](https://github.com/data-goblin/claude-code-filetree) (MIT); this is its own implementation of a subset of that project's features.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-filetree` | แสดง file tree ของโฟลเดอร์ที่ session เปิดอยู่ในแถบด้านข้าง หน้าตาตามแบบ plugin filetree (เปิดอัตโนมัติตอนเริ่ม session, ปิด/เปิดใหม่ด้วย `/mods-filetree`) — header มีชื่อ root ■ และปุ่ม ◫ สลับคอลัมน์ Modified/Size, ⊟ หุบทั้งหมด, ↻ refresh; แถว branch ⑂ พร้อมจำนวนไฟล์เปลี่ยน `?:n M:n D:n` หรือ `± no changes`; ช่องค้นหาใต้ header; หัวคอลัมน์ Name / Git / Modified; แถวโฟลเดอร์ ▸/▾ ■ สี accent ไฟล์ ∙ พร้อมสถานะ git ท้ายแถว (M/A/?/D/R/U สีตามสถานะ, ไฟล์ ignore แสดง ⊘ และจาง, ไฟล์ที่ลบขีดฆ่า) โฟลเดอร์แสดงจำนวนไฟล์เปลี่ยนในคอลัมน์ Git; คอลัมน์ขวาเป็นวันเวลาแก้ไขล่าสุด `YYYY-MM-DD HH:mm` (สลับเป็นขนาดไฟล์ได้); ไฟล์ที่ Claude อ่าน/เขียนติดสีราว 6 วินาที และ Follow Claude กางโฟลเดอร์แล้วเลื่อนไปหาให้; ค้นหาชื่อไฟล์ทั้ง repo แล้วคลิกผลลัพธ์เพื่อไปที่ไฟล์; คลิกเลือก (แถวที่เลือกมีพื้นและ ▎) ดับเบิลคลิกเปิดด้วยแอป default; footer แสดงจำนวนโฟลเดอร์และไฟล์ใน tree และ path ที่เลือก (คลิกเพื่อคัดลอก); auto-refresh ทุก 3 วินาทีและหลัง Claude รัน Bash/เขียนไฟล์ |

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
| `column` | `date` | ค่าในคอลัมน์ขวาตอนเปิดแผง — `date` (Modified วันเวลาแก้ไขล่าสุด) หรือ `size` (กดปุ่ม ◫ สลับในแผงได้) |

### 📦 Install

```
/plugin install mods-filetree@natthasath-marketplace
```

### 🚧 ยังไม่มี (เทียบกับต้นฉบับ)

ค้นหาเนื้อหาในไฟล์ (git grep), เลือกหลายไฟล์/ส่งเป็น context, preview, treemap, guards, diff, คีย์ลัด j/k, shimmer แบบเคลื่อนไหว และ icon แบบ Nerd Font
