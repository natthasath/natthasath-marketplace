# Config, Status & Observability

หมวดนี้ต้องมีเกือบทุก CLI ที่ไม่ใช่ one-shot ง่ายๆ — โดยเฉพาะถ้า tool มี auth, external dependency หรือ
ค่า setting ที่ผู้ใช้ปรับได้

## Config

**ควรมีลำดับชั้นความสำคัญ (precedence) ที่ชัดเจนและสม่ำเสมอ** — codex เป็นตัวอย่างที่ดีของ config 3 ชั้น
ซ้อนกัน (จากความสำคัญน้อยไปมาก):

1. Default ในตัว tool เอง
2. ไฟล์ config กลาง `~/.codex/config.toml`
3. Profile overlay: `-p/--profile <name>` โหลด `$CODEX_HOME/<name>.config.toml` ทับไฟล์หลัก
4. Override ต่อครั้งผ่าน `-c key=value` (ใช้ dotted path เข้าถึง nested field ได้, parse เป็น TOML)

หลักการ: **ยิ่งใกล้ตัวตอนรัน (flag ต่อครั้ง) ยิ่งชนะค่าที่มาจากไฟล์** เสมอ และควรมี flag ปฏิเสธ config ที่ไม่รู้จัก
เพื่อความปลอดภัยตอน migrate เวอร์ชัน — codex มี `--strict-config` (error ทันทีถ้า config.toml มี field ที่
เวอร์ชันนี้ไม่รู้จัก แทนที่จะเงียบๆ ignore ไป)

## Status

Tool ที่มี auth/install/runtime dependency ควรมี command ตรวจสถานะแยกจากการรันงานจริง:
- `login status` — เช็คว่า auth ยังใช้ได้ไหม โดยไม่ต้องรันงานจริงเพื่อทดสอบ
- `doctor` — เช็ค install/config/auth/runtime health รวดเดียว พร้อม `--json` สำหรับ machine-readable report
  และ `--summary` สำหรับดูสรุปย่อ

## Log / Trace

- ระดับ verbosity ควรมีอย่างน้อย 2-3 ระดับ (`-v`/`-vv`/`--debug`) ไม่ใช่ all-or-nothing
- Log สำหรับ debug ไป stderr, ไม่ปนกับ output หลักที่ stdout
- ถ้า tool มี event stream แบบ real-time (agent ที่ทำงานหลายขั้นตอน) ควรมี `--json` mode ที่ print แต่ละ
  event เป็น JSONL บรรทัดละ event เพื่อให้ tool อื่น consume ต่อได้ (codex `exec --json`)

## Dependency / Runtime Check

`doctor`-style self-diagnostic ควร**บอกวิธีแก้ ไม่ใช่แค่บอกว่าอะไรพัง** — เช่นแทนที่จะบอกแค่
"git not found" ให้บอกด้วยว่าควรติดตั้งยังไงบน OS ปัจจุบัน (คำสั่งต่างกันระหว่าง Windows/macOS/Linux)

## Feature Flags

**แยกจาก Config ทั่วไป** — Config คือค่าตั้งค่าถาวรที่ผู้ใช้ตัดสินใจแล้ว, Feature Flag คือ toggle ของ
ความสามารถที่ยังทดลอง/เปิดปิดได้ระหว่างพัฒนา ไม่ควรปนกัน

codex แยกชัดด้วย `--enable <FEATURE>` / `--disable <FEATURE>` (เทียบเท่า `-c features.<name>=true/false`
แต่มี flag คู่แยกต่างหากเพื่อให้เข้าใจง่ายกว่า) — ใช้ pattern นี้เมื่อ tool มีความสามารถที่ยังไม่เสถียรพอจะเป็น
default แต่พร้อมให้คนกล้าเสี่ยงลองได้
