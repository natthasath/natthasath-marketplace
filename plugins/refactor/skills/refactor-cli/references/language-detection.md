# Language Detection

ต้องรู้ภาษา/framework ก่อนแก้โค้ดบรรทัดแรกเสมอ เพราะทุกหมวดใน `references/` อื่นๆ ต้องแปลงเป็น idiom ของ
ภาษานั้น — "Dry Run flag" ใน Rust clap หน้าตาไม่เหมือนใน Python argparse

## กรณีที่ 1: มี source code ให้ดู

เช็ค manifest file ที่ root ของ project ก่อนตรงๆ — เร็วและชัวร์ที่สุด:

| Manifest file | ภาษา | Framework parsing arg ที่พบบ่อย |
|---|---|---|
| `Cargo.toml` | Rust | `clap` (derive หรือ builder), `structopt` (เก่า) |
| `package.json` | Node.js / TypeScript | `commander`, `yargs`, `oclif` |
| `pyproject.toml` / `setup.py` | Python | `click`, `typer`, `argparse` (stdlib) |
| `go.mod` | Go | `cobra`, `urfave/cli`, `flag` (stdlib) |
| `Gemfile` | Ruby | `thor`, `optparse` |
| `*.csproj` / `*.sln` | C# / .NET | `System.CommandLine`, `Spectre.Console.Cli` |
| `pom.xml` / `build.gradle` | Java / Kotlin | `picocli`, `Cobra-like` |

ถ้ามีหลาย manifest ในโปรเจกต์เดียว (เช่น Rust core + Node wrapper สำหรับแจกจ่ายผ่าน npm) **ให้ตามหา
implementation จริงของ command parsing ไม่ใช่ตัว wrapper** — wrapper มักเป็นแค่ shell script ที่ download/
exec binary จริงอีกที (ดูกรณีตัวอย่างด้านล่าง)

## กรณีที่ 2: มีแค่ binary ที่ติดตั้งแล้ว ไม่มี source

ใช้ 2 สัญญาณร่วมกัน:

**1. `file <binary path>`** — บอกชนิดไฟล์จริง (ELF = Linux compiled, Mach-O = macOS compiled, PE = Windows
`.exe`, หรือ "POSIX shell script"/"Python script"/"Node.js script" ถ้าเป็น text-based wrapper)

**2. Fingerprint ของ `--help` text เอง** — แต่ละ framework มี "ลายเซ็น" ของตัวเองที่ต่างกันชัด:

| Framework | ภาษา | ลายเซ็นที่สังเกตได้ |
|---|---|---|
| `clap` | Rust | หัวข้อ `Usage:` / `Commands:` / `Options:` / `Arguments:` แยกกันชัด, `[possible values: a, b, c]` ต่อท้าย enum flag, `-h, --help` คู่กับ `-V, --version` เสมอ |
| `Click` / `Typer` | Python | `Usage: prog [OPTIONS] COMMAND [ARGS]...`, ท้ายบรรทัดมี `[required]` ต่อท้าย option ที่บังคับ, error message ขึ้นต้นด้วย `Error: ` |
| `argparse` (stdlib) | Python | `usage: prog [-h] ...` (ตัวพิมพ์เล็กทั้งหมด), ส่วน `positional arguments:` กับ `options:`/`optional arguments:` |
| `Cobra` | Go | `Usage:\n  prog [command]`, มี `Flags:` แยกจาก `Global Flags:` ชัดเจน, subcommand list มักมี alias ต่อท้ายในวงเล็บ |
| `Commander.js` | Node | `Usage: prog [options] [command]`, ใช้ `-V, --version` (V ใหญ่) เหมือน clap แต่ไม่มี `[possible values]` |
| `System.CommandLine` | C# | `Usage:\n  prog [command] [options]`, error format แบบ `Required argument missing for command: ...` |

**ตัวอย่างจริง:** `codex --help` ให้ output แบบ `Usage:/Commands:/Options:/Arguments:` พร้อม
`[possible values: read-only, workspace-write, danger-full-access]` และ `-h, --help`/`-V, --version` —
เข้าเงื่อนไข clap ทุกจุด สรุปได้ว่า core เขียนด้วย **Rust** แม้ binary ที่ติดตั้งจริงบนเครื่อง (ผ่าน npm)
จะเป็นแค่ POSIX shell script ที่ห่อ Rust binary ไว้อีกที — นี่คือตัวอย่างของ "wrapper ไม่ใช่ implementation จริง"
ที่ต้องระวังตามกรณีที่ 1

## หลังจากรู้ภาษาแล้ว

จดภาษา + framework ไว้เป็น context ตลอดงาน แล้วใช้มันเลือกว่าจะเปิดไฟล์ไหนต่อ (เช่น Rust clap → หา
`#[derive(Parser)]` หรือ `Command::new(...)`, Go Cobra → หา `&cobra.Command{...}`, Python Click → หา
`@click.group()`/`@click.command()`) — ไฟล์ reference อื่นๆ ใน skill นี้จะอ้างอิง idiom ของภาษาเหล่านี้ต่อ
