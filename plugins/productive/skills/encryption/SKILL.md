---
name: encryption
description: >
  เตรียมไฟล์สำคัญ (configuration files, deployment files, documentation, ข้อมูลการเข้าถึงระบบที่ผู้ใช้มีสิทธิ์
  ใช้งานอยู่แล้ว) สำหรับส่งต่ออย่างปลอดภัยผ่านช่องทางที่อาจไม่ปลอดภัย — รวมไฟล์ในโฟลเดอร์ที่ผู้ใช้ระบุเป็น
  tar.gz เดียว เข้ารหัสด้วย GPG symmetric AES-256 สร้าง passphrase แบบสุ่มแยกไฟล์ต่างหาก ตรวจสอบว่า decrypt
  กลับได้จริงก่อนส่งมอบ และแนะนำให้ส่ง encrypted file กับ passphrase คนละช่องทางกัน
  เรียกใช้ผ่าน `/encryption` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
tools:
  - Bash
  - PowerShell
  - Read
  - AskUserQuestion
disable-model-invocation: true
---

# Secure File Exchange Preparer

คุณทำหน้าที่เตรียมไฟล์สำคัญของผู้ใช้ให้พร้อมส่งต่ออย่างปลอดภัย โดยรวมเป็น archive เดียว เข้ารหัสด้วย GPG
symmetric AES-256 และสร้าง passphrase แยกต่างหาก skill นี้จัดการเฉพาะไฟล์ที่ผู้ใช้ระบุเองและมีสิทธิ์เข้าถึง
อยู่แล้วเท่านั้น ไม่พยายามเข้าถึงระบบ, account หรือ credential อื่นใดที่ผู้ใช้ไม่ได้ระบุ ปฏิบัติตามกฎทุกข้อ
ด้านล่างอย่างเคร่งครัด

## Core Rules (Non-negotiable)

ทั้งหมดนี้คือเหตุผลที่ script ทำงานแบบ scripted แทนการให้ Claude รันคำสั่งเองทีละขั้น:

1. **Passphrase ต้องไม่ถูก print ลงข้อความใดๆ และไม่ผ่าน command-line argument เด็ดขาด** — ข้อความในแชท
   ของ Claude Code ถูกบันทึกลง session transcript ถาวรบนดิสก์ ส่วน argument จะหลุดเข้า `ps`/shell history
   ทั้งสองทางถือเป็นการ leak ที่ขัดกับเป้าหมายของ skill นี้โดยตรง — ห้ามเปิดไฟล์ passphrase มาอ่านเองด้วย
2. **ห้าม list ชื่อไฟล์ภายใน archive ออกมาแสดงผล** โดยไม่จำเป็น
3. **ถามครบทั้ง 3 path ทุกครั้งที่รัน** ห้ามจำ/นำ path จาก session ก่อนหน้ามาใช้ซ้ำ หรือ default เอาเอง
4. **เช็ค gpg ใหม่ทุกครั้ง** แม้เพิ่งเช็คไปในบทสนทนาเดียวกัน (เผื่อผู้ใช้ถอนการติดตั้งหรือสลับเครื่อง)
5. **ขอ confirm ผู้ใช้ก่อนรันคำสั่งติดตั้งเสมอ** ไม่ auto-install เงียบๆ
6. **ถ้า script คืน error ให้หยุดและแจ้งผู้ใช้ตรงๆ พร้อมเหตุผล** ไม่เดาสาเหตุหรือ retry เอง
7. **ไม่พยายามเข้าถึงไฟล์/ระบบ/credential ใดๆ ที่ผู้ใช้ไม่ได้ระบุมาชัดเจนใน source path**

## Workflow

### 1. Checklist: ถาม path ทั้งสามจากผู้ใช้เสมอ
*หลักการ: การเข้ารหัสคือ action ที่เขียนไฟล์จริงและกระทบที่อยู่ของ passphrase — ต้องไล่เช็คครบทั้ง 3 path ก่อนรัน script เสมอ ห้ามปล่อยให้ path ไหนขาดหรือเดาเอาเอง*
ห้าม default เอาเองหรือจำ path จากบทสนทนาก่อนหน้า ต้องถามทุกครั้งที่รัน:
- [ ] **Source path** — โฟลเดอร์ที่จะเข้ารหัส
- [ ] **Output path สำหรับ encrypted archive** — เป็น path ไฟล์เต็ม (ผู้ใช้เลือกชื่อ archive เองได้)
- [ ] **Output โฟลเดอร์สำหรับไฟล์ passphrase** — ต้องเป็น**โฟลเดอร์** ไม่ใช่ชื่อไฟล์ เพราะ script จะเขียนไฟล์ชื่อ
   `passphrase.txt` ลงในโฟลเดอร์นี้เสมอ (ชื่อไฟล์ตายตัว ไม่ใช้ชื่อที่ผู้ใช้ตั้ง) เพื่อให้คาดเดาได้ทุกครั้งว่า
   passphrase อยู่ไฟล์ไหน

ตรวจสอบว่า source path มีอยู่จริงและเป็นโฟลเดอร์ก่อนไปขั้นต่อไป (`Test-Path -PathType Container` บน
PowerShell หรือ `[ -d ... ]` บน Bash) ถ้าไม่เจอ แจ้งผู้ใช้และหยุด

### 2. ตรวจสอบ gpg เสมอ ห้าม assume ว่ามี
เช็คใหม่ทุกครั้ง แม้เคยเช็คไปแล้วก่อนหน้านี้ในบทสนทนาเดียวกัน (เผื่อผู้ใช้ถอนการติดตั้งหรือสลับเครื่อง):
- Windows (PowerShell): `Get-Command gpg -ErrorAction SilentlyContinue`
- macOS/Linux (Bash): `command -v gpg`

ถ้าไม่พบ ให้บอกผู้ใช้ตรงๆ ว่ากำลังจะรันคำสั่งอะไร แล้ว **ขอ confirm ก่อนรันเสมอ** — ห้าม auto-install
เงียบๆ:

| OS | คำสั่งติดตั้ง | หมายเหตุ |
|---|---|---|
| Windows | `winget install GnuPG.Gpg4win` | ปกติไม่ต้อง elevate สำหรับ per-user install |
| macOS | `brew install gnupg` | ถ้าไม่มี Homebrew (`command -v brew` ไม่เจอ) ให้แจ้งผู้ใช้ไปติดตั้ง Homebrew เองก่อน — ห้าม auto-install Homebrew เพราะเปลี่ยน system เกินขอบเขตของ skill นี้ |
| Linux | เช็ค package manager ก่อน (`command -v apt`/`dnf`/`pacman`) แล้วใช้ `sudo apt install -y gnupg` / `sudo dnf install -y gnupg2` / `sudo pacman -S --noconfirm gnupg` ตามที่เจอ | ต้อง `sudo` — เตือนผู้ใช้ว่าอาจมี password prompt แทรกขึ้นมา |

ติดตั้งเสร็จแล้วเช็คซ้ำอีกครั้งว่าเจอ `gpg` ก่อนไปขั้นต่อไป ถ้ายังไม่เจอให้หยุดและแจ้งผู้ใช้ตรงๆ ว่าติดตั้ง
ไม่สำเร็จ พร้อมเหตุผลที่เห็นจาก output ของคำสั่ง อย่าเดาสาเหตุเอง

### 3. รัน script หลัก (มี Self-correction loop ในตัว)
*หลักการ: script ตรวจสอบผลลัพธ์ของตัวเองก่อนส่งมอบอยู่แล้ว — decrypt กลับมาเทียบ hash ทันทีหลังเข้ารหัส แทนที่จะเชื่อว่าเข้ารหัสสำเร็จเฉยๆ นี่คือ self-correction loop แบบ ทำ → ตรวจ (decrypt+compare) → (ถ้าไม่ตรง จะไม่ส่งมอบ) ซึ่งเหมาะสมเพราะผลลัพธ์ตรวจสอบได้เองจากไฟล์ที่เพิ่งสร้าง ไม่ต้องพึ่งข้อมูลภายนอก*
เรียก `scripts/secure_send.py` ด้วย `uv run --script` ส่ง 3 argument (path ไม่ใช่ข้อมูลลับ ส่งผ่าน argument
ได้ตามปกติ — ที่ห้ามผ่าน argument คือ passphrase เท่านั้น ซึ่ง script จัดการผ่าน stdin ให้แล้ว) argument ที่ 3
ต้องเป็น**โฟลเดอร์** ตามขั้นตอนที่ 1:

```bash
uv run --script scripts/secure_send.py "<source_dir>" "<archive_output_path>" "<passphrase_output_dir>"
```

script จะทำครบในตัวเอง: สร้าง passphrase สุ่ม (ดูเหตุผลที่ไม่ใช้ diceware wordlist ในขั้นตอนที่ 5), tar+gzip
source_dir, เข้ารหัสด้วย gpg (ผ่าน `--passphrase-fd 0` ไม่ผ่าน argv), **decrypt กลับมาเทียบ sha256 ทันทีเพื่อ
ยืนยันว่า decrypt ได้จริงก่อนส่งมอบ** (self-correction step), เขียน passphrase ลงไฟล์ `passphrase.txt` ในโฟลเดอร์ที่ระบุ, สร้างไฟล์
คำแนะนำการ decrypt ภาษาไทยชื่อ `HOW-TO-DECRYPT.md` (จัดรูปแบบสไตล์ README ตาม skill `/refactor-readme` —
title มี emoji, header เป็นภาษาอังกฤษ, code block ระบุภาษา, ตารางสำหรับคำสั่งติดตั้งแต่ละ OS) จากเทมเพลต
`assets/decrypt-instructions.md` ไว้ข้างๆ archive ให้ผู้รับที่ไม่คุ้น gpg ทำตามได้เอง และลบไฟล์ temp ทั้งหมด
ใน `finally` เสมอไม่ว่าจะสำเร็จหรือ error

ไฟล์คำแนะนำนี้**ไม่มี passphrase หรือข้อมูลลับอยู่เลย** (มีแค่ชื่อไฟล์ archive กับคำสั่งติดตั้ง/decrypt ทั่วไป)
จึงส่งไปพร้อมกับ archive ทางช่องทางเดียวกันได้ตามปกติ — ที่ต้องแยกช่องทางมีแค่ไฟล์ passphrase เท่านั้น

script พิมพ์ผลลัพธ์เป็น JSON บรรทัดเดียวเท่านั้น (ไม่มี passphrase หรือชื่อไฟล์ภายใน archive ปนอยู่) —
**อ่านผลลัพธ์นี้แล้วรายงานต่อผู้ใช้โดยไม่เพิ่มเติมเนื้อหาที่ script ไม่ได้ให้มา** โดยเฉพาะห้ามเปิดไฟล์
passphrase มาอ่านแล้ว print ลงแชท

ถ้า JSON คืน `"status": "error"` ให้แจ้งผู้ใช้ตรงๆ ตาม `message` แล้วหยุด อย่า retry เงียบๆ หรือลองวิธีอื่นเอง
โดยไม่บอกผู้ใช้ก่อน — นี่คือ error จาก action ที่มีผลข้างเคียงจริง จึงต้องให้ผู้ใช้ตัดสินใจต่อ ไม่ใช่ให้ Claude
เดาวิธีแก้เอง

### 4. สรุปผลให้ผู้ใช้
รายงานเฉพาะข้อมูลที่ไม่ sensitive จาก JSON:

```
✅ เข้ารหัสสำเร็จ
📦 Archive: <archive_output> (<file_count> ไฟล์, <total_bytes> bytes)
🔑 Passphrase: บันทึกไว้ที่ <passphrase_output> (ไม่แสดงในแชทนี้)
📄 คำแนะนำการ decrypt (ภาษาไทย): บันทึกไว้ที่ <instructions_output>
✓ ตรวจสอบ round-trip แล้ว: decrypt กลับมาได้ตรงกับต้นฉบับ (hash match)
```

แล้วแนะนำผู้ใช้เสมอ:
- **ส่ง 2 ไฟล์นี้ไปพร้อมกันได้ตามปกติ**: encrypted archive (`<archive_output>`) กับไฟล์คำแนะนำการ decrypt
  (`<instructions_output>`) — ไฟล์คำแนะนำไม่มีข้อมูลลับ ผู้รับจะได้รู้ทันทีว่าต้องติดตั้งอะไรและรันคำสั่งไหน
- **ส่งไฟล์ passphrase แยกช่องทาง/คนละข้อความจาก 2 ไฟล์ข้างต้นเสมอ** เช่น archive+คำแนะนำทาง email,
  passphrase ทาง SMS หรือแอปแชทคนละอัน
- แนะนำให้ลบไฟล์ passphrase ออกจากเครื่องหลังส่งสำเร็จ หรือย้ายเข้า password manager แทนการเก็บเป็นไฟล์
  ข้อความไว้เฉยๆ

### 5. ถ้าผู้ใช้ถามว่าทำไม passphrase ไม่ใช่ diceware wordlist
ตอบตรงๆ ว่า passphrase สร้างจาก random character (alphabet 54 ตัวอักษร ตัดตัวที่สับสนง่ายออก เช่น `0/O`,
`1/l/I`) แทน diceware wordlist โดยตั้งใจ เพราะ passphrase ในระบบนี้ถูกส่งผ่านไฟล์ ไม่ใช่การอ่านออกเสียงหรือ
พิมพ์ด้วยมือ ความยาวจึงไม่ใช่ปัญหาด้าน usability และ wordlist ที่เขียนขึ้นเองโดยไม่ผ่านการตรวจสอบอัตโนมัติ
(duplicate/typo) มีความเสี่ยงต่อความปลอดภัยมากกว่าประโยชน์ด้าน readability ที่จะได้

## Supporting files
- ไม่มีไฟล์แนบจากผู้ใช้ — path ทั้งหมดถามแบบ interactive ในขั้นตอนที่ 1
- `scripts/secure_send.py` — สคริปต์หลักที่ทำ tar+gzip, เข้ารหัส gpg, self-check decrypt, เขียน passphrase/คำแนะนำ
- `assets/decrypt-instructions.md` — เทมเพลตสร้างไฟล์ `HOW-TO-DECRYPT.md`

## Edge cases
- หา `gpg` ไม่เจอและติดตั้งไม่สำเร็จ → หยุดและแจ้งผู้ใช้ตรงๆ พร้อมเหตุผลจาก output จริง ไม่เดาสาเหตุเอง
- ไม่มี Homebrew บน macOS → แจ้งให้ผู้ใช้ไปติดตั้ง Homebrew เองก่อน ห้าม auto-install Homebrew
- source path ไม่มีอยู่จริงหรือไม่ใช่โฟลเดอร์ → แจ้งผู้ใช้และหยุดตั้งแต่ขั้นตอนที่ 1 ไม่ไปต่อ
- script คืน `"status": "error"` → แจ้งผู้ใช้ตรงๆ ตาม `message` แล้วหยุด ไม่ retry เงียบๆ หรือลองวิธีอื่นเอง
