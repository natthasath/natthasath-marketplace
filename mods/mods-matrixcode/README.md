# 🎉 mods-matrixcode

Mod that draws a Matrix-style digital rain panel inside Claude Code — green neon katakana characters falling on a pure-black background, like the hacker-movie effect, whose intensity reacts to how hard Claude is working.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-matrixcode` | แสดง Matrix code-rain ในแถบด้านขวา (เปิดอัตโนมัติตอนเริ่ม session, เปิด/ปิดเองได้ด้วย `/matrix`) — ตัวอักษร half-width katakana สุ่มสีเขียว neon ไหลจากบนลงล่าง หัวตัวอักษรสว่างขาว-เขียวไล่เฉดเข้มจนจาง พื้นหลังดำสนิทแบบ dark theme; **ไม่มีงานให้ทำ = ไม่มีตัวอักษรใหม่เกิด** (สายที่ไหลอยู่จะไหลจนจบแล้วหยุดไปเอง), พอ Claude เริ่มเทิร์นใหม่สายฝนก็เริ่มไหล และทุกครั้งที่เรียก tool จะเพิ่ม "heat" ที่ค่อย ๆ decay ลง — **ยิ่งเรียก tool ถี่/หนักแค่ไหน คอลัมน์จะเกิดถี่ขึ้น ยาวขึ้น และไหลเร็วขึ้นตามไปด้วย** |

### 🏆 Usage

```
/matrix
```

เรียก `/matrix` เพื่อเปิด/ปิดแผง Matrix เองได้ นอกจากนั้นแผงนี้ทำงานเองทั้งหมดตามสถานะการทำงานของ Claude ไม่ต้องกดอะไรเพิ่ม
