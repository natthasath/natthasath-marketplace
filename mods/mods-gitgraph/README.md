# 🎉 mods-gitgraph

Mod that renders a colored git commit-graph pane inside Claude Code, like SourceTree/GitKraken.

### ✨ Mods

| Mod | วัตถุประสงค์ |
|---|---|
| `mods-gitgraph` | แสดง git commit graph แบบมีสีในแถบด้านข้าง (pane) เหมือน SourceTree/GitKraken — ดึง commit จากทุก branch (`git log --all`) มาคำนวณ lane และวาดเป็นเส้นสีต่อ lane พร้อมชื่อ branch/tag ที่ HEAD แต่ละสาย เปิดแผงอัตโนมัติตอนเริ่ม session ถ้า cwd เป็น git repository (ปิด/เปิดใหม่ได้ด้วย `/mods-gitgraph`) รีเฟรชอัตโนมัติหลังรันคำสั่ง git ที่เปลี่ยน history/ref (commit, merge, checkout, pull ฯลฯ) ผ่าน Bash tool และ poll เบาๆ เผื่อมีการ commit จาก terminal อื่น คลิก commit เพื่อดู full message และ `git show --stat` ของ commit นั้น |

### 🏆 Usage

```
/mods-gitgraph
```

เรียก `/mods-gitgraph` เพื่อเปิด/ปิดแผง Git Graph ด้วยตัวเอง — ปรับพฤติกรรมเพิ่มเติมได้ที่ `/config` ของปลั๊กอินนี้ (เปิดอัตโนมัติหรือไม่, จำนวน commit สูงสุดที่ดึงมาแสดง)

### ⚙️ Config

| Field | ค่า default | คำอธิบาย |
|---|---|---|
| `autoOpen` | `true` | เปิดแผง Git Graph อัตโนมัติตอนเริ่ม session ถ้า cwd เป็น git repository |
| `maxCommits` | `300` | จำนวน commit ล่าสุด (รวมทุก branch) ที่จะดึงมาคำนวณ/แสดงในแผง |
