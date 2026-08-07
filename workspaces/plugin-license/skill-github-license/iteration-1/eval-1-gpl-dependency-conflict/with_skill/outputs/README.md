# 🎉 invoice-report

Generate branded PDF invoices with embedded QR payment codes.

### 🏆 Usage

```shell
npm start -- --input orders.json --out ./invoices
```

### 📜 License

ยังไม่ได้กำหนด license — ต้องตัดสินใจก่อนว่าจะทำอย่างไรกับ `vendor/libqr` ซึ่งเป็น **GPL-3.0-only**
และถูกรวมเข้ากับโค้ดนี้โดยตรง ทำให้ทั้งโปรเจกต์ใช้ license แบบ permissive (เช่น MIT) ไม่ได้ถ้ามีการแจกจ่าย
ทางเลือกคือ ใช้ GPL-3.0 ตาม · เปลี่ยนไปใช้ QR library ที่เป็น MIT · หรือจำกัดการใช้งานไว้ภายในองค์กรเท่านั้น
