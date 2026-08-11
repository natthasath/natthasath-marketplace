# 🎉 language

Plugin for **language tools** — continuous interpretation with no extra commentary, plus an English Mentor for language learning.

> [!NOTE]
> ทุก skill ใน plugin นี้เรียกใช้ผ่าน slash command เท่านั้น (`disable-model-invocation: true`) — ไม่ auto-trigger จากบทสนทนา

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `translate` | ล่ามแปลภาษาแบบต่อเนื่องระหว่าง 2 ภาษา ตรวจจับภาษาอัตโนมัติ แปลอย่างเดียวไม่มีคำอธิบาย |
| `mentor-english` | ครู English ส่วนตัว รองรับ 5 โหมด: แปล, ตรวจแกรมมา, คิดประโยคตอบกลับ, ปรับ tone, คลังคำศัพท์ |

### 🏆 Usage

```
/language:translate
/language:translate ไทย ↔ ญี่ปุ่น
/language:mentor-english --translation
/language:mentor-english --grammar
/language:mentor-english --reply
/language:mentor-english --tone
/language:mentor-english --vocab
```

### 💎 translate vs mentor-english

| ด้าน | `/language:translate` | `/language:mentor-english` |
|---|---|---|
| เป้าหมาย | แปลอย่างเดียว รวดเร็ว | สอนและอธิบายภาษา |
| Output | คำแปลเท่านั้น | คำแปล + word choice + ทางเลือก |
| ใช้เมื่อ | ต้องการล่ามระหว่างสนทนา | ต้องการเรียนรู้ภาษา |
