# 🎉 drive

Plugin สำหรับ **บันทึกไฟล์ไปยัง Google Drive โดยอัตโนมัติ** — มี skill `ebook-dl` ที่ค้นหาและดาวน์โหลด
ebook/PDF จากแหล่งที่ถูกกฎหมาย แล้วเซฟเข้า Google Drive ของผู้ใช้ผ่าน Google Apps Script โดยไม่ต้องให้ผู้ใช้
ดาวน์โหลด/อัปโหลดเองแม้แต่ขั้นตอนเดียว และคู่ skill `book-wishlist` / `book-owned` ที่ร่วมกันดูแลลิสต์หนังสือ
เดียวกันเป็นตาราง markdown บน Drive — เล่มที่อยากได้ใช้ `book-wishlist`, เล่มที่ซื้อแล้วใช้ `book-owned`

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `ebook-dl` | ค้นหาหนังสือ/เอกสาร PDF จากแหล่งที่ถูกกฎหมาย แล้วบันทึกเข้า Google Drive อัตโนมัติผ่าน Google Apps Script — ต้องตรวจสอบสิทธิ์เผยแพร่ก่อนดาวน์โหลดทุกครั้ง ต่างจาก `productive:ebook` ที่ดาวน์โหลดลงเครื่อง local — เรียกผ่าน `/drive:ebook-dl` เท่านั้น |
| `book-wishlist` | บันทึกรายชื่อหนังสือที่อยากได้ (wishlist เท่านั้น) ลงตาราง markdown ที่ `Automation/book/book-list.md` บน Drive พร้อมผู้เขียน จำนวนหน้า ลิงก์ และรูปปก โดยดึงข้อมูลจากหน้าสินค้าจริงบน SE-ED หรือ Naiin เท่านั้น — รับได้ทั้งพิมพ์ชื่อหนังสือหรือแนบรูปปกมา — เรียกผ่าน `/drive:book-wishlist` เท่านั้น |
| `book-owned` | บันทึกหนังสือที่ซื้อ/มีแล้วลงไฟล์ `book-list.md` เดียวกับ `book-wishlist` — ถ้าเล่มนั้นอยู่ในลิสต์แล้วจะเปลี่ยนสถานะเป็น `✅ Owned` ถ้ายังไม่มีจะเพิ่มแถวใหม่พร้อมค้นข้อมูลให้ครบเหมือนกัน รับได้ทั้งพิมพ์ชื่อ (หลายเล่มได้), แนบรูปปก, หรือถ่ายรูปใบเสร็จที่มีหลายเล่มในใบเดียว — เรียกผ่าน `/drive:book-owned` เท่านั้น |

### 🏆 Usage

```
/drive:ebook-dl <ชื่อหนังสือ หรือ URL ไฟล์ PDF หรือแนบรูปปกหนังสือ>
/drive:book-wishlist <ชื่อหนังสือ หรือแนบรูปปกหนังสือ>
/drive:book-owned <ชื่อหนังสือ (หลายเล่มได้) หรือแนบรูปปก หรือถ่ายรูปใบเสร็จ>
```

### 🔧 ต้อง Setup ก่อนใช้งานครั้งแรก

ทั้งสาม skill ต้องเชื่อมต่อ **Google Drive MCP connector** ก่อนใช้งาน

`ebook-dl` ต้อง deploy **Google Apps Script** ของผู้ใช้เองเพิ่มเติม
(สคริปต์อยู่ที่ `skills/ebook-dl/scripts/AppsScript.gs`) เพราะ Claude รันอยู่ใน sandbox ที่ fetch ไฟล์จาก
เว็บทั่วไปตรงๆ ไม่ได้ — Apps Script ทำหน้าที่รันบนเซิร์ฟเวอร์ Google เองแทน ดูขั้นตอนเต็มที่
[`skills/ebook-dl/references/setup-guide.md`](skills/ebook-dl/references/setup-guide.md) (ใช้เวลา ~5 นาที ทำครั้งเดียว) — โฟลเดอร์ปลายทางเริ่มต้นคือ `Automation/ebook` บน Drive

`book-wishlist` และ `book-owned` ไม่ต้อง setup เพิ่มเติมใดๆ — เขียนไฟล์ markdown ตรงผ่าน Drive MCP ได้เลย
โฟลเดอร์ปลายทางเริ่มต้นคือ `Automation/book` บน Drive (ไฟล์เดียวกัน ใช้ร่วมกันทั้งสอง skill)
