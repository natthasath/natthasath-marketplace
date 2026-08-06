# 🎉 license

Plugin for choosing and installing an open source license — the GitHub "Add license" flow, but it interviews you in plain language first, so you never have to know what "copyleft" means to pick the right one.

### ⭐ Skills

| Skill | Description |
|---|---|
| `github-license` | Interview-driven license picker — asks 3-5 plain-language questions, checks dependency compatibility, then writes `LICENSE`, `NOTICE`, SPDX headers, the README License section and badge, and the `license` field in project metadata |

### 🏆 Usage

```
/github-license                            # สัมภาษณ์แล้วเลือกให้
/github-license MIT                        # รู้อยู่แล้วว่าจะใช้ตัวไหน — ข้ามการสัมภาษณ์
/github-license <path ของโปรเจกต์>          # ระบุโปรเจกต์ปลายทาง
```

### 💎 License Coverage

23 ฉบับ เก็บข้อความจริงไว้ใน `skills/github-license/assets/licenses/` (GitHub Licenses API · SPDX · Creative Commons)

| กลุ่ม | ตัวเลือก |
|---|---|
| Permissive | `MIT` `ISC` `BSD-2-Clause` `BSD-3-Clause` `Apache-2.0` `BSL-1.0` `Zlib` |
| Public Domain | `Unlicense` `CC0-1.0` |
| Weak Copyleft | `MPL-2.0` `LGPL-3.0` `LGPL-2.1` `EPL-2.0` |
| Strong Copyleft | `GPL-3.0` `GPL-2.0` `AGPL-3.0` |
| Creative Commons | `CC-BY-4.0` `CC-BY-SA-4.0` `CC-BY-NC-4.0` |
| Source-available | `BUSL-1.1` `Elastic-2.0` `SSPL-1.0` `PolyForm-Noncommercial-1.0.0` |

เกณฑ์การตัดสินใจอยู่ใน [`references/interview.md`](skills/github-license/references/interview.md) · รายละเอียดรายตัวอยู่ใน [`references/catalog.md`](skills/github-license/references/catalog.md)

> [!NOTE]
> กลุ่ม Source-available และ `CC-BY-NC-4.0` ไม่ใช่ open source ตามนิยามของ OSI — skill จะแจ้งเตือนเสมอเมื่อเลือกกลุ่มนี้ และไม่เขียนคำว่า "open source" ลง README ให้
