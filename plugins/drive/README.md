# 🎉 drive

Plugin สำหรับ **บันทึกไฟล์ไปยัง Google Drive โดยอัตโนมัติ** — เริ่มจาก skill `ebook-drive` ที่ค้นหาและดาวน์โหลด
ebook/PDF จากแหล่งที่ถูกกฎหมาย แล้วเซฟเข้า Google Drive ของผู้ใช้ผ่าน Google Apps Script โดยไม่ต้องให้ผู้ใช้
ดาวน์โหลด/อัปโหลดเองแม้แต่ขั้นตอนเดียว

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `ebook-drive` | ค้นหาหนังสือ/เอกสาร PDF จากแหล่งที่ถูกกฎหมาย แล้วบันทึกเข้า Google Drive อัตโนมัติผ่าน Google Apps Script — ต้องตรวจสอบสิทธิ์เผยแพร่ก่อนดาวน์โหลดทุกครั้ง ต่างจาก `productive:ebook` ที่ดาวน์โหลดลงเครื่อง local — เรียกผ่าน `/drive:ebook-drive` เท่านั้น |

### 🏆 Usage

```
/drive:ebook-drive <ชื่อหนังสือ หรือ URL ไฟล์ PDF หรือแนบรูปปกหนังสือ>
```

### 🔧 ต้อง Setup ก่อนใช้งานครั้งแรก

`ebook-drive` ต้องเชื่อมต่อ **Google Drive MCP connector** และ deploy **Google Apps Script** ของผู้ใช้เอง
(สคริปต์อยู่ที่ `skills/ebook-drive/scripts/AppsScript.gs`) เพราะ Claude รันอยู่ใน sandbox ที่ fetch ไฟล์จาก
เว็บทั่วไปตรงๆ ไม่ได้ — Apps Script ทำหน้าที่รันบนเซิร์ฟเวอร์ Google เองแทน ดูขั้นตอนเต็มที่
[`skills/ebook-drive/references/setup-guide.md`](skills/ebook-drive/references/setup-guide.md) (ใช้เวลา ~5 นาที ทำครั้งเดียว)
