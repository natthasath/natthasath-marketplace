# Apply — ขั้นตอนติดตั้ง license ลงโปรเจกต์จริง

หลังผู้ใช้เลือก license แล้ว ทำตามลำดับนี้ ข้อ 1 บังคับ ข้อ 2-5 ทำเท่าที่โปรเจกต์มีของให้แก้

**สารบัญ**
1. [เขียนไฟล์ LICENSE](#1-เขียนไฟล์-license)
2. [เติม placeholder](#2-เติม-placeholder)
3. [ไฟล์ประกอบเพิ่มเติม](#3-ไฟล์ประกอบเพิ่มเติม)
4. [README — section และ badge](#4-readme--section-และ-badge)
5. [metadata ของโปรเจกต์](#5-metadata-ของโปรเจกต์)
6. [SPDX header ในไฟล์ source](#6-spdx-header-ในไฟล์-source)
7. [สรุปให้ผู้ใช้](#7-สรุปให้ผู้ใช้)

---

## 1. เขียนไฟล์ LICENSE

คัดลอกไฟล์จาก `assets/licenses/{SPDX-ID}.txt` ไปเป็น `LICENSE` ที่ root ของ repo
**คัดลอกไฟล์ ห้ามพิมพ์ข้อความ license เอง** — ข้อความ license ต้อง verbatim ตัวต่อตัว พิมพ์เองมีโอกาสตกหล่นและทำให้ไม่มีผลตามที่ตั้งใจ

```shell
cp "{skill}/assets/licenses/MIT.txt" LICENSE
```

**ชื่อไฟล์:** ใช้ `LICENSE` ไม่มีนามสกุล — GitHub ตรวจจับได้และแสดงป้าย license ที่หน้า repo ให้อัตโนมัติ
(`LICENSE.txt`, `LICENSE.md`, `COPYING` ก็ตรวจจับได้เหมือนกัน แต่ `LICENSE` เป็นแบบที่พบมากที่สุด)

**ตำแหน่ง:** root ของ repo เสมอ ไม่ใช่ในโฟลเดอร์ย่อย
ถ้าเป็น monorepo ที่แต่ละ package มี license ต่างกัน ให้วางที่ root เป็นตัวหลัก แล้ววาง `LICENSE` ของ package ที่ต่างออกไปในโฟลเดอร์นั้นเพิ่ม

**ถ้ามีไฟล์ LICENSE อยู่แล้ว** — อ่านของเดิมก่อนเสมอ แล้วบอกผู้ใช้ว่าจะเขียนทับตัวไหนด้วยตัวไหน ก่อนลงมือ
การเปลี่ยน license เป็นเรื่องที่มีผลทางกฎหมาย ไม่ใช่การแก้ไฟล์ธรรมดา

---

## 2. เติม placeholder

ตรวจสอบตามตารางนี้เท่านั้น ไฟล์ที่ไม่อยู่ในตาราง = คัดลอกแล้วจบ ห้ามแก้อะไรทั้งสิ้น

| ไฟล์ | ต้องแทนที่ | แทนด้วย |
|---|---|---|
| `MIT.txt` | `[year]` `[fullname]` | ปีปัจจุบัน · ชื่อเจ้าของ |
| `ISC.txt` | `[year]` `[fullname]` | เหมือนกัน |
| `BSD-2-Clause.txt` | `[year]` `[fullname]` | เหมือนกัน |
| `BSD-3-Clause.txt` | `[year]` `[fullname]` | เหมือนกัน |
| `Zlib.txt` | `[year]` `[fullname]` | เหมือนกัน |
| `Apache-2.0.txt` | `[yyyy]` `[name of copyright owner]` (อยู่ในส่วน APPENDIX ท้ายไฟล์) | ปีปัจจุบัน · ชื่อเจ้าของ |
| `BUSL-1.1.txt` | ทั้ง 7 ค่าในบล็อก Parameters | ดูตารางด้านล่าง |

**ห้ามแตะ placeholder ใน `GPL-*.txt`, `AGPL-3.0.txt`, `LGPL-*.txt`**
`<year>`, `<name of author>`, `<program>`, `<signature of Ty Coon>` ในไฟล์เหล่านั้นอยู่ในภาคผนวก "How to Apply These Terms"
ซึ่งเป็น**คำแนะนำสำหรับผู้นำไปใช้** ไม่ใช่ช่องให้กรอก — ตระกูล GPL กำหนดให้ตัวบท license คงข้อความเดิมทุกตัวอักษร
ชื่อเจ้าของลิขสิทธิ์ของตระกูลนี้ไปอยู่ใน header ของไฟล์ source แทน (ดูข้อ 6)

### ค่าที่ต้องกรอกของ `BUSL-1.1`

| Placeholder | ใส่อะไร |
|---|---|
| `[Licensor Name]` (2 จุด) | ชื่อคนหรือบริษัทที่เป็นเจ้าของ |
| `[Licensed Work Name]` | ชื่อโปรเจกต์ |
| `[year]` | ปีปัจจุบัน |
| `[Additional Use Grant]` | ข้อยกเว้นที่ยอมให้ใช้ในงานจริงได้ฟรี — ถ้าไม่มีให้ใส่คำว่า `None` |
| `[Change Date]` | วันที่จะกลายเป็น open source รูปแบบ `YYYY-MM-DD` (ปกติ 4 ปีนับจากวันนี้) |
| `[Change License]` | license ปลายทาง ต้องเข้ากับ GPL-2.0 ขึ้นไป — `Apache-2.0` หรือ `MPL-2.0` เป็นตัวเลือกที่ใช้กันมาก |
| `[Contact Info]` | อีเมลสำหรับติดต่อซื้อ commercial license |

BUSL ที่ปล่อย placeholder ค้างไว้ = license ที่ไม่สมบูรณ์และบังคับใช้ไม่ได้ ตรวจให้ครบทุกช่องก่อนจบงาน

### รูปแบบปีและชื่อ

- **โปรเจกต์ใหม่** → ปีปัจจุบันตัวเดียว เช่น `2026`
- **มี LICENSE เดิมอยู่แล้ว** → คงปีเริ่มต้นเดิมไว้ ต่อท้ายเป็นช่วง เช่น `2023-2026` เพราะปีในประกาศลิขสิทธิ์บอกว่างานเริ่มเผยแพร่เมื่อไหร่
- **ชื่อ** → ชื่อจริงของคนหรือชื่อนิติบุคคล ไม่ใช่ username บน GitHub เพราะเป็นเอกสารที่อ้างสิทธิ์ตามกฎหมาย
  เอาค่าตั้งต้นจาก `git config user.name` แล้วให้ผู้ใช้ยืนยัน — ถ้าเป็นงานในนามบริษัท ใส่ชื่อบริษัท

---

## 3. ไฟล์ประกอบเพิ่มเติม

### `NOTICE` — เฉพาะ `Apache-2.0`

Apache-2.0 ข้อ 4(d) กำหนดว่า ถ้างานมีไฟล์ `NOTICE` ผู้ที่นำไปใช้ต่อต้องส่งต่อเนื้อหานั้นด้วย
เป็นที่เดียวที่ประกาศลิขสิทธิ์ของคุณจะเดินทางไปกับโค้ดเสมอ — สร้างไว้ถึงจะไม่บังคับ

```
{ชื่อโปรเจกต์}
Copyright {ปี} {ชื่อเจ้าของ}

This product includes software developed at
{ชื่อองค์กร หรือ ตัด 2 บรรทัดนี้ทิ้งถ้าเป็นงานส่วนตัว}.
```

ถ้าโปรเจกต์รวมโค้ดของคนอื่นที่มี NOTICE มาด้วย ต้องนำข้อความของเขามาต่อท้ายในไฟล์นี้

### `LICENSE.GPL` — เฉพาะ `LGPL-3.0`

ข้อความ LGPL-3.0 ไม่สมบูรณ์ในตัวเอง — มันเขียนไว้ว่า "license นี้ผนวกเงื่อนไขของ GNU GPL version 3 เข้ามาด้วย"
ถ้าแนบแค่ไฟล์ LGPL ผู้รับจะไม่มีทางรู้เงื่อนไขจริงทั้งหมด ต้องแนบทั้งสองไฟล์:

```shell
cp "{skill}/assets/licenses/LGPL-3.0.txt" LICENSE
cp "{skill}/assets/licenses/GPL-3.0.txt"  LICENSE.GPL
```

(ธรรมเนียมของ FSF ใช้ชื่อ `COPYING.LESSER` + `COPYING` ซึ่งถูกต้องเหมือนกัน แต่ `LICENSE` ทำให้ GitHub แสดงป้าย license ให้)

### `LICENSE-docs` — เมื่อเอกสารใช้ license ต่างจากโค้ด

ถ้าผู้ใช้ตกลงว่าโค้ดเป็นอย่างหนึ่ง เอกสารเป็น CC อีกอย่าง ให้วางไฟล์ CC ไว้ในโฟลเดอร์เอกสาร
แล้วเขียนบอกให้ชัดใน README ว่าส่วนไหนใช้อะไร ไม่งั้นคนอ่านจะสับสนว่าตกลงทั้ง repo ใช้ตัวไหน

---

## 4. README — section และ badge

ตามธรรมเนียม README ของ repo นี้ (ดู `refactor-readme`) section license ใช้ emoji 📜 และอยู่ท้ายไฟล์

```markdown
### 📜 License

This project is licensed under the [MIT License](LICENSE).
```

ข้อความสำหรับ license ที่มีเงื่อนไขพิเศษ ต้องบอกเงื่อนไขนั้นตรงนี้ด้วย เพราะไม่มีใครเปิดไฟล์ LICENSE อ่าน:

| License | ข้อความที่ควรใช้ |
|---|---|
| `Apache-2.0` | `Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution requirements.` |
| `AGPL-3.0` | `Licensed under the [GNU AGPL v3.0](LICENSE). If you run a modified version as a network service, you must make the source available to its users.` |
| `BUSL-1.1` | `Licensed under the [Business Source License 1.1](LICENSE). Not an open source license — it converts to {Change License} on {Change Date}.` |
| `Elastic-2.0` | `Licensed under the [Elastic License 2.0](LICENSE). Not an open source license — you may not provide this software as a hosted or managed service.` |
| `SSPL-1.0` | `Licensed under the [Server Side Public License](LICENSE). Not an OSI-approved open source license.` |
| `PolyForm-Noncommercial-1.0.0` | `Licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE) — free for noncommercial use. Contact {email} for a commercial license.` |
| `CC-BY-NC-4.0` | `Licensed under [CC BY-NC 4.0](LICENSE) — free to share and adapt for noncommercial purposes with attribution.` |

**สำหรับกลุ่ม source-available ห้ามเขียนคำว่า "open source"** เพราะไม่จริงตามนิยามของ OSI
การเขียนผิดตรงนี้ทำให้ผู้ใช้เข้าใจผิดและเป็นประเด็นที่ชุมชนจับผิดกันจริง

### Badge

วางรวมกับ badge อื่นใต้ intro paragraph ไม่ใช่ใน section license

```markdown
![license](https://img.shields.io/github/license/{owner}/{repo})
```

badge แบบ dynamic นี้อ่านค่าจาก GitHub API — จะขึ้น "repo not found" ถ้า repo เป็น **private** หรือถ้า license เป็นตัวที่ GitHub ตรวจจับไม่ได้ (กลุ่ม source-available หลายตัว)
กรณีเหล่านั้นให้ใช้ badge แบบคงที่แทน:

```markdown
![license](https://img.shields.io/badge/license-BUSL--1.1-orange)
```

ขีดกลางในชื่อ license ต้อง escape เป็น `--` ในรูปแบบ badge แบบคงที่ ไม่งั้น shields.io จะตัดข้อความผิด

---

## 5. metadata ของโปรเจกต์

ใส่ **SPDX ID** เป๊ะ ๆ (ตัวพิมพ์เล็กใหญ่ตรงตามตารางใน `catalog.md`) เพราะ registry และเครื่องมือสแกน license อ่านค่านี้แบบตรงตัว

| ไฟล์ | field ที่ต้องแก้ |
|---|---|
| `package.json` | `"license": "MIT"` |
| `pyproject.toml` | `license = "MIT"` และ `license-files = ["LICENSE"]` (PEP 639 — สำหรับโปรเจกต์ใหม่)<br>โปรเจกต์เก่าที่ยังใช้รูปแบบเดิม: `license = {file = "LICENSE"}` + Trove classifier |
| `Cargo.toml` | `license = "MIT"` |
| `composer.json` | `"license": "MIT"` |
| `*.gemspec` | `spec.license = "MIT"` |
| `pom.xml` | บล็อก `<licenses><license><name>…</name><url>…</url></license></licenses>` |
| `build.gradle(.kts)` | บล็อก `licenses` ใน `publishing { publications { … pom { … } } }` |
| `*.csproj` | `<PackageLicenseExpression>MIT</PackageLicenseExpression>` |
| `go.mod` | ไม่มี field — Go ใช้ไฟล์ `LICENSE` อย่างเดียว |
| `pubspec.yaml` | ไม่มี field — ใช้ไฟล์ `LICENSE` อย่างเดียว |

**license ที่ไม่ใช่ open source** — SPDX ID ของ `BUSL-1.1`, `Elastic-2.0`, `SSPL-1.0`, `PolyForm-Noncommercial-1.0.0` ใช้ได้ปกติในทุก field ข้างต้น
แต่ npm จะเตือนตอน publish ให้ใช้ `"license": "SEE LICENSE IN LICENSE"` แทนได้ถ้าอยากเลี่ยงคำเตือน

**แก้เฉพาะไฟล์ที่มีอยู่จริง** — ห้ามสร้าง `package.json` ขึ้นมาใหม่เพียงเพื่อจะใส่ field license

---

## 6. SPDX header ในไฟล์ source

บรรทัดเดียวบนหัวไฟล์ที่ทำให้เครื่องมือสแกน license อ่านออกว่าไฟล์นี้อยู่ใต้ license อะไร
มีประโยชน์จริงเมื่อไฟล์ถูกคัดลอกแยกออกไปจาก repo — ซึ่งเกิดขึ้นตลอดเวลา

```
SPDX-FileCopyrightText: {ปี} {ชื่อเจ้าของ}
SPDX-License-Identifier: {SPDX-ID}
```

| ภาษา | รูปแบบ comment |
|---|---|
| Python, Shell, Ruby, YAML, R | `# SPDX-License-Identifier: MIT` |
| JS, TS, Go, Rust, Java, C, C++, C#, PHP, Swift, Kotlin | `// SPDX-License-Identifier: MIT` |
| CSS, บล็อก comment ของ C-family | `/* SPDX-License-Identifier: MIT */` |
| HTML, XML, Markdown | `<!-- SPDX-License-Identifier: MIT -->` |
| SQL, Haskell, Lua | `-- SPDX-License-Identifier: MIT` |

**ต้องขออนุญาตผู้ใช้ก่อนเสมอ พร้อมบอกจำนวนไฟล์จริง** — การเติม header เป็นการแก้ไฟล์จำนวนมากพร้อมกัน
ซึ่งทำให้ diff บวมและกลับคืนยากถ้าผู้ใช้ไม่ได้ตั้งใจ:

> "จะใส่บรรทัดประกาศ license ที่หัวไฟล์ source ให้ไหมครับ — มี 47 ไฟล์ที่จะถูกแก้
> มีประโยชน์ตอนมีคนก๊อปไฟล์เดี่ยว ๆ ไปใช้ แต่ถ้าไม่ใส่ก็ไม่ผิดอะไร ไฟล์ LICENSE ก็เพียงพอแล้ว"

ถ้าผู้ใช้ตกลง: ข้ามไฟล์ที่มี header อยู่แล้ว, ข้าม vendor / `node_modules` / build output / ไฟล์ที่ถูก generate, และรักษา shebang กับ encoding declaration ให้อยู่บรรทัดแรกเสมอ (แทรก SPDX ไว้บรรทัดถัดไป)

**สำหรับตระกูล GPL/AGPL/LGPL ควรใส่เสมอ** เพราะ license ตระกูลนี้ระบุให้แจ้งลิขสิทธิ์ที่ตัวไฟล์ และเป็นที่เดียวที่ชื่อเจ้าของจะปรากฏ (ไฟล์ LICENSE เป็นข้อความมาตรฐานที่ไม่มีชื่อใคร)

---

## 7. สรุปให้ผู้ใช้

จบงานด้วยสรุปสั้น ๆ ที่ตอบ 3 อย่าง — เลือกอะไร แปลว่าอะไรในชีวิตจริง และแตะไฟล์ไหนไปบ้าง

```
เลือก: MIT License

แปลว่า:
  ✅ ใครก็เอาไปใช้ แก้ ขายต่อ หรือใส่ในสินค้าปิดโค้ดได้
  ✅ เขาต้องคงประกาศลิขสิทธิ์ของคุณไว้
  ⚠️ ถ้าโปรแกรมพัง คุณไม่ต้องรับผิดชอบ

แก้ไฟล์:
  + LICENSE               (ใหม่)
  ~ README.md             (เพิ่ม section 📜 License + badge)
  ~ package.json          ("license": "MIT")
```

**ปิดท้ายด้วยข้อจำกัดเสมอ:** ข้อมูลนี้ช่วยให้เลือกได้เร็วและถูกต้องในกรณีทั่วไป แต่ไม่ใช่คำปรึกษาทางกฎหมาย
ถ้าเป็นงานที่มีเงินหรือสัญญาเข้ามาเกี่ยวข้องจริงจัง ควรให้ทนายดูอีกรอบ
