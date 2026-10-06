# 🎉 drive

Plugin สำหรับ **บันทึกไฟล์ไปยัง Google Drive โดยอัตโนมัติ** — มี skill `ebook-dl` ที่ค้นหาและดาวน์โหลด
ebook/PDF จากแหล่งที่ถูกกฎหมาย แล้วเซฟเข้า Google Drive ของผู้ใช้ผ่าน Google Apps Script โดยไม่ต้องให้ผู้ใช้
ดาวน์โหลด/อัปโหลดเองแม้แต่ขั้นตอนเดียว

> งานดูแลลิสต์หนังสือ (อยากได้/ซื้อแล้ว/ค้นว่าเคยซื้อรึยัง) ที่เคยแยกเป็น `book-wishlist` / `book-owned` /
> `book-search` ในปลั๊กอินนี้ ถูกรวมเป็น skill เดียวชื่อ `cobook` และย้ายไปอยู่ใน
> [`productive`](../productive/README.md) แทนแล้ว — ไฟล์ `book-list.md` บน Drive ยังใช้รูปแบบเดิม
> ไม่ต้อง migrate ข้อมูลใดๆ

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `ebook-dl` | ค้นหาหนังสือ/เอกสาร PDF จากแหล่งที่ถูกกฎหมาย แล้วบันทึกเข้า Google Drive อัตโนมัติผ่าน Google Apps Script — ต้องตรวจสอบสิทธิ์เผยแพร่ก่อนดาวน์โหลดทุกครั้ง ต่างจาก `productive:ebook` ที่ดาวน์โหลดลงเครื่อง local — เรียกผ่าน `/drive:ebook-dl` เท่านั้น |

### 🏆 Usage

```
/drive:ebook-dl <ชื่อหนังสือ หรือ URL ไฟล์ PDF หรือแนบรูปปกหนังสือ>
```

### 🔧 ต้อง Setup ก่อนใช้งานครั้งแรก

ต้องเชื่อมต่อ **Google Drive MCP connector** ก่อนใช้งาน และต้อง deploy **Google Apps Script** ของผู้ใช้
เองเพิ่มเติม (สคริปต์อยู่ที่ `skills/ebook-dl/scripts/AppsScript.gs`) เพราะ Claude รันอยู่ใน sandbox ที่
fetch ไฟล์จากเว็บทั่วไปตรงๆ ไม่ได้ — Apps Script ทำหน้าที่รันบนเซิร์ฟเวอร์ Google เองแทน ดูขั้นตอนเต็มที่
[`skills/ebook-dl/references/setup-guide.md`](skills/ebook-dl/references/setup-guide.md) (ใช้เวลา ~5 นาที ทำครั้งเดียว) — โฟลเดอร์ปลายทางเริ่มต้นคือ `Automation/ebook` บน Drive
