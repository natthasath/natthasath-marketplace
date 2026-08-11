# 🎉 session

Plugin for **managing Claude Code sessions** — names, tracks purpose, and preserves context across a working session.

> [!NOTE]
> ทุก skill ใน plugin นี้เรียกใช้ผ่าน slash command เท่านั้น (`disable-model-invocation: true`) — ไม่ auto-trigger จากบทสนทนา

### ⭐ Skills

| Skill | วัตถุประสงค์ |
|---|---|
| `session-name` | ตั้งชื่อ session ปัจจุบัน บันทึกลง memory และแสดง context สำหรับอ้างอิงในการสนทนา |
| `handoff` | สรุปบทสนทนาปัจจุบันเป็นเอกสารส่งไม้ต่อให้ agent/session ใหม่ทำต่อ บันทึกที่ temp directory ของ OS พร้อม suggested skills และ redact ข้อมูลอ่อนไหวเสมอ เรียกผ่าน `/handoff` เท่านั้น ไม่ auto-trigger |

### 🏆 Usage

```
/session-name <ชื่อ session>
/handoff [สิ่งที่ session ถัดไปจะโฟกัส]
```
