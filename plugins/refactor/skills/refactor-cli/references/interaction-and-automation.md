# Interaction Model

หมวดนี้**ขึ้นกับ purpose ของ tool** — ไม่ใช่ทุก CLI ต้องมีทั้ง 4 หมวดย่อย ใช้ decision tree ใน SKILL.md
หลักตัดสินก่อนว่าเกี่ยวไหม

## Interactive vs Non-interactive

Tool ที่มีทั้งสองโหมดควรแยกให้ชัดว่าอันไหนเป็น default — codex: ไม่ใส่ subcommand = เข้า TUI แบบ interactive
ทันที, ใส่ `exec` = non-interactive ชัดเจน (`Run Codex non-interactively`)

**สำคัญกว่าการมี flag แยก:** ต้อง**ตรวจจับ non-interactive context อัตโนมัติ**ด้วย ไม่ใช่พึ่ง flag อย่างเดียว
— ถ้า stdin ไม่ใช่ TTY (เช่นถูกเรียกจาก CI/cron/pipe) ไม่ควรค้างรอ interactive prompt โดยไม่มีทางออก ต้อง
fail เร็วพร้อมข้อความชัดเจน หรือ fallback เป็น non-interactive อัตโนมัติ

## Automation / Scripting

Flag ที่ทำให้ tool ใช้ใน CI/script ได้จริง:
- `--json` / `--output-format` — ให้ output ที่ parse ได้แน่นอน (ดู `io-contract.md`)
- `--output-schema <FILE>` — บอกรูปร่างผลลัพธ์ล่วงหน้า เป็น pattern ขั้นสูงที่ codex มีจริงใน `exec`
- flag แบบ `--yes`/`--non-interactive` เพื่อข้าม confirmation prompt ที่จะทำให้ CI ค้าง (เชื่อมกับ
  `safety-and-trust.md` เรื่อง Confirmation)
- Exit code ต้อง**เชื่อถือได้ 100%** เพราะ CI ใช้ exit code ตัดสิน pass/fail โดยตรง

## Session Management

**เกี่ยวเฉพาะ tool ที่มีบทสนทนา/งานแบบหลายรอบต่อเนื่องกัน** (เช่น AI agent, REPL, long-running task) — tool
แบบ stateless one-shot (linter, formatter) ไม่ต้องมีหมวดนี้เลย

codex มี pattern ครบชุดที่ใช้เป็นต้นแบบได้:

| Command | ทำอะไร |
|---|---|
| `resume [SESSION_ID]` | กลับไปทำ session เดิมต่อ (มี picker ถ้าไม่ระบุ id, `--last` ข้าม picker) |
| `fork [SESSION_ID]` | แตก session ใหม่จาก state เดิม โดยไม่กระทบของเดิม |
| `archive` | เก็บ session ไว้ไม่ให้ขึ้นใน list ปกติ (แต่ไม่ลบ) |
| `unarchive` | เอากลับมาจาก archive |
| `delete` | ลบถาวร |

หลักการ: แยก "เก็บไว้เฉยๆ" (archive) กับ "ลบถาวร" (delete) ให้ชัด อย่าใช้ verb เดียวกันสองความหมาย

## State Management

- ตัดสินใจให้ชัดว่า state อยู่ที่ไหน: user-home (`~/.codex/`) แบบ global, project-local (`.codex/` ใน
  repo) แบบต่อโปรเจกต์, หรือไม่ persist เลย
- ควรมี flag ปิดการ persist ไว้เผื่อกรณีทดสอบ/CI — codex มี `--ephemeral` (รันโดยไม่บันทึก session ลง disk เลย)
- ถ้า state persist ข้าม version ได้ ต้องคิดเรื่อง schema compatibility ด้วย (ดู `lifecycle-and-distribution.md`
  หัวข้อ Version/Compatibility)
