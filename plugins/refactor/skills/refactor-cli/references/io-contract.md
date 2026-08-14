# Input/Output Contract

หมวดนี้ต้องมีแทบทุก CLI — กำหนดว่า tool "รับข้อมูลยังไง" และ "ส่งผลลัพธ์ยังไง" ให้ทั้งคนและ script อ่านได้

## Input Design

- Input สั้นๆ ใช้ positional argument หรือ flag ได้ตามปกติ
- **Input ที่อาจยาว/มี special character ต้องรองรับ stdin หรือไฟล์ด้วย** ไม่ใช่บังคับพิมพ์เป็น inline arg
  อย่างเดียว — codex `exec [PROMPT]` ถ้าไม่ใส่ arg (หรือใส่ `-`) จะอ่านจาก stdin แทน วิธีนี้เลี่ยงปัญหา shell
  escaping และ argument length limit ของแต่ละ OS (Windows มี limit สั้นกว่า Linux/macOS ชัดเจน — ทำให้ input
  ยาวๆ พังบน Windows ก่อนถ้าไม่รองรับ stdin)
- ถ้า stdin ถูก pipe เข้ามาพร้อมกับมี arg ด้วย ให้กำหนดพฤติกรรมชัดเจนว่ารวมกันยังไง (codex: stdin ถูก append
  เป็น block ต่อท้าย prompt ที่ให้มาเป็น arg ไม่ใช่เขียนทับ)

## Output Design

- **Default = human-readable**, มี `--json`/`--output-format` แยกสำหรับ machine consumption — อย่าสลับ
  default เป็น JSON เพราะคนส่วนใหญ่รันแบบ interactive ก่อน
- `--color always|never|auto` เป็น pattern มาตรฐาน (`auto` = detect terminal, ปิดสีอัตโนมัติเมื่อ output
  ถูก pipe/redirect) — codex ใช้ pattern นี้ตรงๆ
- **ห้ามผสม human text กับ JSON ในสตรีมเดียวกัน** เมื่อเปิด `--json` — ข้อความแจ้งเตือนที่เป็น human-readable
  ต้องไปที่ stderr เท่านั้น เพื่อให้ `tool --json | jq ...` ไม่พังจาก noise ปนมา

## Exit Code

ไม่มี standard สากลที่ทุก tool ต้องตามเป๊ะ แต่ควร**สม่ำเสมอภายใน tool เดียวกัน**และหลีกเลี่ยงชนกับความหมาย
ที่ shell ใช้เองอยู่แล้ว:

| Exit Code | ความหมายที่แนะนำ |
|---|---|
| `0` | สำเร็จ |
| `1` | error ทั่วไป (unhandled/unexpected) |
| `2` | usage/argument ผิด (มักเป็นค่า default ของ argparse/clap เองอยู่แล้วเมื่อ parse ไม่ผ่าน) |
| `126` | หลีกเลี่ยง — POSIX ใช้หมายถึง "เจอคำสั่งแต่รันไม่ได้" |
| `127` | หลีกเลี่ยง — POSIX ใช้หมายถึง "ไม่เจอคำสั่ง" |
| `130` | หลีกเลี่ยง — คือ SIGINT (Ctrl+C) โดย convention |
| custom range (เช่น 10-19) | error เฉพาะ domain ของ tool เอง เอกสารไว้ให้ชัดว่าเลขไหนหมายถึงอะไร |

Exit code มักไม่โผล่ใน `--help` เอง — ถ้า refactor ต้องเพิ่มเอกสารไว้ใน README ของโปรเจกต์ (ดู "sync ไฟล์ที่
เกี่ยวข้อง" ใน SKILL.md หลัก) ไม่ใช่ปล่อยให้ผู้ใช้เดาเอง

## Error Handling

- Error ไปที่ **stderr เสมอ** ไม่ใช่ stdout (กัน pipe พังเวลาต่อ tool อื่น)
- โหมดปกติ: ข้อความสั้น เข้าใจง่าย บอกวิธีแก้ถ้าเป็นไปได้ — โหมด `--json`: error เป็น structured object ที่มี
  field คงที่ (เช่น `code`, `message`) ให้ script parse ได้แน่นอน
- **ห้าม leak stack trace/panic ดิบให้ผู้ใช้เห็นโดย default** — ควรมี flag แยก (`--verbose`/`-v`/`RUST_BACKTRACE=1`
  เป็นต้น) สำหรับดู raw trace ตอน debug เท่านั้น

## Idiom ต่อภาษา (exit code)

| ภาษา | วิธี set exit code |
|---|---|
| Rust | `std::process::exit(code)` หรือ return `ExitCode::from(code)` จาก `fn main() -> ExitCode` |
| Python | `sys.exit(code)` — `argparse` เองจะ exit code `2` อัตโนมัติเมื่อ parse ผิด |
| Go | `os.Exit(code)` (ระวัง: `defer` จะไม่รันถ้าเรียก `os.Exit` ตรงๆ ต้อง cleanup ก่อนเรียก) |
| Node.js | `process.exit(code)` หรือ set `process.exitCode = code` แล้วปล่อยให้ event loop จบเอง (แนะนำกว่าเพราะ
  ไม่ตัด async cleanup ทิ้งกลางคัน) |
