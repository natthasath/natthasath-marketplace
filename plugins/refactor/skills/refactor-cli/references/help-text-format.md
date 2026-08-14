# `--help` Text Rendering Format

หมวดอื่นๆ ใน `references/` กำหนด**โครงสร้างเชิง concept** ของ command (hierarchy, safety model, CRUD ฯลฯ)
ไฟล์นี้กำหนด**หน้าตาข้อความ `--help` ที่ render ออกมาจริง** — ทุก command ที่แก้เสร็จตาม checklist อื่นแล้ว
ต้อง render ผลลัพธ์สุดท้ายให้ตรง template นี้ด้วย ไม่ว่า framework ของภาษานั้นจะ generate ให้เองแบบไหนโดย
default (บาง framework ต้อง custom help template เพิ่มถ้า default ไม่ตรง)

**ทุกคำอธิบายใน `--help` เขียนเป็นภาษาอังกฤษเสมอ** ไม่ว่า SKILL.md นี้จะเป็นภาษาไทย — เป็น convention มาตรฐาน
ของ CLI ทั้ง industry (clap/cobra/click ทุกตัว generate เป็นอังกฤษโดย default) ทำให้ tool อ่านง่ายกับ audience
ที่กว้างที่สุด

## Template เต็ม

```
{Tool Name} CLI

{หนึ่งบรรทัด อธิบาย default behavior เมื่อไม่ใส่ subcommand — ใส่เฉพาะถ้า tool มี default behavior แบบนั้นจริง
เช่น "If no subcommand is specified, options will be forwarded to the interactive CLI."}

Usage: {tool} [OPTIONS] [POSITIONAL]
       {tool} [OPTIONS] <COMMAND> [ARGS]

Commands:
  {cmd}            {One-line description, imperative form} [aliases: {alias}]
  {cmd}            {One-line description}
  {cmd}            [experimental] {One-line description}
  help             Print this message or the help of the given subcommand(s)

Arguments:
  [POSITIONAL]
          {Description, indented under the arg name}

Options:
  -c, --config <VALUE>
          {Short description on its own line, not on the same line as the flag}

          {Optional extended paragraph or examples — separated by a blank line}

  -s, --sandbox <MODE>
          {Description}

          [possible values: value-a, value-b, value-c]

  -a, --approval <POLICY>
          {Description}

          Possible values:
          - value-a: {what it means}
          - value-b: {what it means}

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

## กฎการจัด format (annotate ทีละส่วน)

| ส่วน | กฎ |
|---|---|
| **บรรทัดแรก** | ชื่อ tool + " CLI" หรือคำอธิบายสั้นสุด 1 บรรทัดว่า tool นี้คืออะไร |
| **บรรทัด default behavior** | ใส่เฉพาะถ้า bare invocation (ไม่ใส่ subcommand) มีพฤติกรรมเฉพาะจริง — ถ้าไม่ใส่ subcommand แล้ว error/แสดง help เฉยๆ ไม่ต้องมีบรรทัดนี้ |
| **`Usage:`** | แสดงทุกรูปแบบการเรียกที่เป็นไปได้ บรรทัดต่อมา align กับคำว่า `Usage: ` (เว้น indent เท่ากับความยาว `Usage: `) |
| **`Commands:`** | คอลัมน์ชื่อ command align กันทุกแถว (padding ตามชื่อที่ยาวที่สุด) คำอธิบายเป็น imperative form ("Run", "Manage", "Print" ไม่ใช่ "Runs", "Running") |
| **`[aliases: x]`** | ต่อท้ายคำอธิบายเฉพาะ command ที่มี alias จริง ไม่ใส่เผื่อ |
| **`[experimental]`** | นำหน้าคำอธิบายของ subcommand ที่ยังไม่เสถียร/อาจเปลี่ยน API — ให้ผู้ใช้เห็นความเสี่ยงตั้งแต่ list แรก ไม่ต้องเปิด subcommand help ก่อนถึงจะรู้ |
| **`help` command** | เป็น pseudo-command ตัวสุดท้ายเสมอใน `Commands:` list |
| **`Arguments:`** | มีเฉพาะตอนที่ tool รับ positional argument จริง — คำอธิบายเยื้อง 10 spaces อยู่บรรทัดถัดจากชื่อ arg ไม่ใช่บรรทัดเดียวกัน |
| **`Options:` — บรรทัดแรกของแต่ละ flag** | มีแค่ `-short, --long <PLACEHOLDER>` เท่านั้น ไม่มีคำอธิบายต่อท้ายบรรทัดเดียวกัน (ต่างจาก Python `argparse` ที่มักเขียนคำอธิบายต่อท้ายบรรทัดเดียวกับ flag) |
| **`Options:` — คำอธิบาย** | อยู่บรรทัดถัดไป เยื้อง 10 spaces ถ้ามีย่อหน้าขยายความ/ตัวอย่างเพิ่ม คั่นด้วยบรรทัดว่าง |
| **`[possible values: ...]`** | สำหรับ enum ที่แต่ละค่าไม่ต้องอธิบายเพิ่ม (ชื่อค่าสื่อความหมายอยู่แล้ว) |
| **`Possible values:` แบบ bullet** | สำหรับ enum ที่แต่ละค่าต้องอธิบายความหมายเพิ่ม (เช่น policy/mode ที่ชื่อสั้นแต่ผลต่างกันมาก) |
| **`-h, --help` / `-V, --version`** | อยู่ท้ายสุดของ `Options:` เสมอ ตามลำดับนี้ (help ก่อน version) ทุก subcommand ต้องมีคู่นี้ครบ ไม่ใช่แค่ top level |

## เมื่อ framework ไม่ generate format นี้ให้อัตโนมัติ

Framework หลักส่วนใหญ่ generate ใกล้เคียง template นี้อยู่แล้วโดย default (โดยเฉพาะ Rust `clap`) แต่บาง
framework ต้องปรับ:

- **Python `argparse`** — default เขียนคำอธิบาย flag ต่อท้ายบรรทัดเดียวกับ flag ไม่แยกบรรทัด ต้อง custom
  `HelpFormatter` หรือย้ายไป `Click`/`Typer` ถ้าอยากได้ layout ใกล้เคียง template นี้มากกว่า
- **Node `Commander.js`** — ไม่มี `[possible values]`/`[aliases]` แบบ auto-annotate ต้องเขียนต่อท้าย
  description string เอง หรือ custom `.helpInformation()`
- **Go `Cobra`** — ใกล้เคียง template นี้อยู่แล้ว แต่ต้องเพิ่ม `[experimental]` เองเพราะไม่มี built-in flag
  บอกความไม่เสถียรของ subcommand

ถ้า framework ปรับ format ไม่ได้ตรงเป๊ะ (หรือปรับได้แต่เสีย idiom ปกติของ framework นั้นไปมาก) ให้เลือก
**ใกล้เคียงที่สุดเท่าที่ยังเป็น idiomatic ของภาษานั้น** ดีกว่าฝืน custom ทุกจุดจนโค้ด maintain ยาก — บอกเหตุผล
สั้นๆ ให้ผู้ใช้รู้ว่าจุดไหนที่ต่างจาก template เพราะข้อจำกัดของ framework
