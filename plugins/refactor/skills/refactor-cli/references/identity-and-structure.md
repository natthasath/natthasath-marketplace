# Command Identity & Structure

หมวดนี้ต้องมีแทบทุก CLI — เป็นพื้นฐานที่ทุกหมวดอื่นวางอยู่บน

## Command Identity

Binary name ควรตรงกับชื่อ package/repo (ไม่ใช่คนละชื่อกันจนหาไม่เจอ) และ bare `--help` (ไม่มี subcommand)
ต้องบอกได้ใน 1 บรรทัดว่า tool นี้ทำอะไร — ตัวอย่าง codex: บรรทัดแรกของ `codex --help` คือ `Codex CLI` ตามด้วย
คำอธิบาย behavior เมื่อไม่ระบุ subcommand (`forwarded to the interactive CLI`) ทันที

## Command Hierarchy

**ความลึกไม่ควรเกิน 2 ชั้น** สำหรับ tool ส่วนใหญ่ (`tool <verb>` หรือ `tool <noun> <verb>`) — ลึกกว่านั้นจำยาก
และพิมพ์เยอะเกินไป

สังเกตจาก codex: ใช้ทั้งสองแบบผสมกันอย่างมีเหตุผล ไม่ใช่มั่ว —
- **verb ตรงๆ ที่ top level** สำหรับ action หลักของ tool: `exec`, `review`, `login`, `logout`, `apply`
- **noun ที่มี verb ลูก** สำหรับกลุ่มที่จัดการ "ทรัพยากร" ที่มีหลายตัว: `codex mcp list/get/add/remove/login/logout`

กติกา: ถ้า action นั้นทำกับ "ทรัพยากรที่มีหลายตัวและมีชื่อ" (MCP server, plugin, session) ให้จัดเป็น noun
group ที่มี CRUD verb ข้างใน (ดูรายละเอียดที่ `resource-and-crud.md`) ถ้า action นั้นเป็น "การกระทำเดี่ยว
ของ tool เอง" ให้เป็น verb ตรงๆ ที่ top level

## Naming Convention

- Subcommand และ flag แบบหลายคำ ใช้ **kebab-case** เสมอ (`--dangerously-bypass-approvals-and-sandbox` ไม่ใช่
  `--dangerouslyBypassApprovalsAndSandbox` หรือ `--dangerously_bypass_approvals_and_sandbox`)
- ใช้ verb set เดียวกันทุก resource group — ถ้าเลือก `list/get/add/remove` แล้ว ห้ามมีอีก group ใช้
  `ls/show/create/delete` แทน (ความไม่สม่ำเสมอแบบนี้คือสัญญาณอันดับ 1 ที่ต้อง refactor)
- ชื่อ flag ที่ตรงข้ามกันต้องสมมาตร (`--enable`/`--disable`, ไม่ใช่ `--enable`/`--no-enable` แบบสุ่ม)

## Alias

Alias สั้นๆ ให้เฉพาะ command ที่เรียกบ่อยที่สุด — codex ให้ `e` กับ `exec` และ `a` กับ `apply` เท่านั้น
ไม่ใช่ทุก subcommand มี alias

**กฎความปลอดภัย: ห้าม alias คำสั่งที่ทำลายข้อมูลให้สั้นจนพิมพ์พลาดง่าย** (เช่น `rm`/`del` แบบตัวอักษรเดียว)
เพราะเพิ่มความเสี่ยง fat-finger — ยิ่งอันตราย ยิ่งควรพิมพ์ยาว ไม่ใช่สั้น (ดูเพิ่มที่ `safety-and-trust.md`
เรื่อง naming ของ dangerous flag)

## Idiom ต่อภาษา

| ภาษา/Framework | นิยาม subcommand + alias |
|---|---|
| Rust (clap derive) | `#[derive(Subcommand)]` enum, `#[command(visible_alias = "e")]` บน variant |
| Python (Click) | `@cli.command(name="exec")` แล้ว `@click.command(name="exec", aliases=["e"])` (ต้อง extension เพราะ Click core ไม่รองรับ alias ตรงๆ) หรือใช้ Typer + custom group |
| Python (argparse) | `subparsers.add_parser("exec", aliases=["e"])` — stdlib รองรับ alias ตรงๆ |
| Go (Cobra) | `&cobra.Command{Use: "exec", Aliases: []string{"e"}}` |
| Node (Commander) | `program.command("exec").alias("e")` |
