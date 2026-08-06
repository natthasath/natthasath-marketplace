# 🎉 GitHub Emoji Reference

GitHub รองรับการใช้ emoji ผ่าน colon-syntax เช่น `:tada:` → 🎉 ได้ทั้งใน commit message, issue, PR comment และไฟล์ markdown

ในการ refactor README ให้เลือก emoji ตาม **ความหมายของ section** ไม่ใช่ตามความชอบ — เพราะ emoji ที่สม่ำเสมอทำให้ผู้อ่านสแกนโครงสร้างได้เร็วและทุก repo ดูเป็น pattern เดียวกัน mapping ด้านล่างใช้กับ emoji หน้าหัวข้อ `### H3` ใน README เท่านั้น

ถ้าเจอ section ที่ไม่ตรงกับ mapping หลักเลย ให้เลือก emoji ที่สื่อความหมายของ section นั้นตรงที่สุดด้วยเหตุผล ไม่ใช่หยิบจากลิสต์ตายตัว

> [!NOTE]
> Commit message emoji convention ย้ายไปอยู่ที่ `plugins/projects/references/commit-emoji.md` แล้ว (ใช้โดย skill ที่สร้าง git commit จริง เช่น `checkpoint`, `debug`, `setup`)

## 🎖️ Badges มาตรฐาน (วางใต้ intro paragraph)

Badge มี 2 แบบ: **dynamic** (ดึงข้อมูลจริงจาก endpoint ของ shields.io — อัปเดตอัตโนมัติ) และ **static** (พิมพ์ label/message/color เอง ไม่ผูกกับข้อมูลจริง) — เลือก dynamic ก่อนเสมอถ้ามี endpoint รองรับ **และ repo เป็น public** (ดูหัวข้อ "Public vs Private Repo" ด้านล่างก่อนเลือก)

### 🔒 Public vs Private Repo

Dynamic badge กลุ่มที่ endpoint ขึ้นต้นด้วย `img.shields.io/github/...` หรือ `img.shields.io/codecov/...` ทำงานโดยให้ shields.io ไปเรียก GitHub API / Codecov API แบบ**ไม่มี auth** — ถ้า repo เป็น **private** เรียกไม่ได้ badge จะขึ้นข้อความ "repo not found" แทนที่จะขึ้นข้อมูลจริง ก่อนวาง badge กลุ่มนี้จึงต้องเช็คก่อนเสมอว่า repo public หรือ private

**วิธีเช็ค** (เรียงตามลำดับที่เชื่อถือได้สุดก่อน):
1. ถ้ามี `gh` CLI และ login อยู่แล้ว: `gh repo view --json isPrivate -q .isPrivate` ในโฟลเดอร์ของโปรเจกต์ — เชื่อผลนี้ได้เลยเพราะเรียก API แบบ authenticated
2. ถ้าไม่มี `gh` หรือไม่ได้ login: ดึง `{owner}/{repo}` จาก `git remote get-url origin` แล้ว fetch `https://api.github.com/repos/{owner}/{repo}` — ได้ `"private": false` = public, ได้ 404 = private **หรือ** repo ไม่เคย push/พิมพ์ผิด (แยกสองกรณีนี้ไม่ได้จาก response เฉยๆ)
3. ถ้าเช็คไม่ได้เลย (ไม่มี remote, ไม่มี network, หรือ 404 แบบไม่ชัดเจนจากข้อ 2) → **ถามผู้ใช้ตรงๆ** ว่า repo นี้ public หรือ private ห้ามเดา

**ถ้า public** — ใช้ dynamic badge ได้ตามตารางด้านล่างปกติ

**ถ้า private** — badge กลุ่มที่พึ่ง GitHub/Codecov API (Build/CI, Tests, Code coverage, Release version, Go version, License, Stars, Last commit, Open issues) เรียกไม่ได้จริง ให้แยกตามว่าข้อมูลนั้น **verify ได้จากไฟล์ในโปรเจกต์เองไหม**:
   - **แทนด้วย static ได้** เฉพาะข้อมูลที่อ่านได้จริงจากไฟล์ในโปรเจกต์ ณ ตอนเขียน README — **version** (จาก `package.json` / `pyproject.toml` / git tag ล่าสุด), **license** (จากไฟล์ `LICENSE`) และ **Go version** (จากไฟล์ `go.mod`) เพราะเป็นข้อเท็จจริงที่ยืนยันได้ ไม่ใช่การเดา
   - **ตัดทิ้งไปเลย ไม่ใส่** สำหรับ metric ที่ต้องเดาหรือถามผู้ใช้ถึงจะรู้ (build/CI status, tests, coverage, stars, last commit, open issues) — badge แถวที่ขาดไปแต่ไม่มีข้อมูลเท็จ ดีกว่า badge ที่พิมพ์เดาแล้วโกหกผู้อ่าน ซึ่งขัดกับกฎ "ห้ามสร้าง badge ที่ไม่มี metric วัดได้จริงรองรับ" ด้านล่าง
   - badge กลุ่ม **Distribution** (npm, PyPI, Docker Hub, Homebrew, VSCode Marketplace) ยังใช้ dynamic ได้ปกติแม้ repo source จะ private เพราะ endpoint พวกนี้ query registry สาธารณะแยกต่างหากจาก GitHub repo — ใช้ได้ถ้า package ถูก publish จริง

ตัวอย่าง static badge สำหรับ private repo (แทนที่ dynamic ที่เข้าไม่ได้):
```markdown
![version](https://img.shields.io/badge/version-1.2.0-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![go version](https://img.shields.io/badge/go-1.22-00ADD8)
```

นอกเหนือจากนี้ (เช่น shields.io private badge token, self-hosted shields server) ถือว่าอยู่นอกขอบเขตของ skill นี้ — ไม่ต้องแนะนำผู้ใช้ไปตั้งค่าเพิ่ม

### ลำดับการวาง Badge (Badge Order)

เรียง badge เป็น 6 กลุ่มตามคำถามที่คนอ่าน README มักถามตามลำดับธรรมชาติ (โปรเจกต์นี้ยังทำงานอยู่ไหม → เวอร์ชันอะไร → ใช้กับอะไรได้ → หาโหลดจากไหน → สิทธิ์การใช้งาน → ความนิยม/ความเคลื่อนไหว) — **ใส่เฉพาะกลุ่มที่มีข้อมูลจริงของโปรเจกต์นั้นรองรับ ข้ามกลุ่มที่ไม่เกี่ยวไปเลย** (เช่น script ส่วนตัวที่ไม่ได้ publish ที่ไหนก็ไม่ต้องมีกลุ่ม Distribution)

| ลำดับ | กลุ่ม | ตัวอย่าง Badge | เหตุผล |
| ---: | --- | --- | --- |
| 1 | **Project Health** | Build, CI, Tests, Coverage | คนเปิด README อยากรู้ก่อนว่าโปรเจกต์ยังไม่พัง |
| 2 | **Release** | Latest Version, Package Version | จะติดตั้งได้เวอร์ชันอะไร |
| 3 | **Compatibility** | Python / Node.js / Go version, Platform / OS | บอกว่าใช้กับอะไรได้บ้าง |
| 4 | **Distribution** | npm, PyPI, Docker Hub, Homebrew, VSCode Marketplace | ช่องทางการติดตั้ง |
| 5 | **License** | MIT, Apache-2.0 | เรื่องสิทธิ์การใช้งาน |
| 6 | **Community / Activity** | Stars, Downloads, Last Commit, Open Issues, Discord | ความนิยมและความเคลื่อนไหว |

ภายในกลุ่มเดียวกัน ถ้ามีหลาย badge ให้เรียงตามลำดับที่ปรากฏในตาราง Dynamic ด้านล่าง (บนลงล่าง)

### Dynamic (แนะนำ — ใช้เมื่อมีข้อมูลจริงให้ดึง)

แถวที่มี ⚠️ คือ badge ที่พึ่ง GitHub/Codecov API — ใช้ได้เฉพาะ repo **public** เท่านั้น ถ้า repo private ให้ทำตาม "Public vs Private Repo" ด้านบนแทน (ตัดทิ้งหรือแทนด้วย static เฉพาะที่ verify ได้จากไฟล์)

| Badge | กลุ่ม | URL Pattern | ใช้เมื่อ |
| --- | --- | --- | --- |
| ⚠️ Build / CI status | Project Health | `https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/{workflow}.yml` | มี GitHub Actions |
| ⚠️ Tests | Project Health | `https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/{test-workflow}.yml` | มี workflow แยกไว้สำหรับรัน test โดยเฉพาะ (คนละไฟล์กับ build/deploy) |
| ⚠️ Code coverage | Project Health | `https://img.shields.io/codecov/c/github/{owner}/{repo}` | ใช้ Codecov |
| ⚠️ Release version | Release | `https://img.shields.io/github/v/release/{owner}/{repo}` | มี GitHub release/tag |
| npm version | Release | `https://img.shields.io/npm/v/{package}` | เป็น npm package |
| PyPI version | Release | `https://img.shields.io/pypi/v/{package}` | เป็น PyPI package |
| Python versions | Compatibility | `https://img.shields.io/pypi/pyversions/{package}` | ต้องการโชว์ Python version ที่รองรับ (อ่านจาก PyPI classifiers) |
| Node engine version | Compatibility | `https://img.shields.io/node/v/{package}` | ต้องการโชว์ Node version ที่รองรับ (อ่านจาก `engines` ใน package.json) |
| ⚠️ Go version | Compatibility | `https://img.shields.io/github/go-mod/go-version/{owner}/{repo}` | อ่านจาก `go.mod` |
| Docker pulls | Distribution | `https://img.shields.io/docker/pulls/{owner}/{repo}` | มี image บน Docker Hub |
| Homebrew version | Distribution | `https://img.shields.io/homebrew/v/{formula}` | มี Homebrew formula |
| VSCode Marketplace version | Distribution | `https://img.shields.io/visual-studio-marketplace/v/{publisher.extension}` | เป็น VSCode extension |
| ⚠️ License | License | `https://img.shields.io/github/license/{owner}/{repo}` | มีไฟล์ LICENSE |
| Downloads | Community / Activity | `https://img.shields.io/npm/dm/{package}` | เป็น npm package |
| ⚠️ Stars | Community / Activity | `https://img.shields.io/github/stars/{owner}/{repo}` | ต้องการโชว์ popularity จริง |
| ⚠️ Last commit | Community / Activity | `https://img.shields.io/github/last-commit/{owner}/{repo}` | โชว์ว่า repo ยัง active |
| ⚠️ Open issues | Community / Activity | `https://img.shields.io/github/issues/{owner}/{repo}` | โชว์สถานะ maintenance |
| Discord | Community / Activity | `https://img.shields.io/discord/{server_id}` | มี Discord server และอยากโชว์ยอด online |

### Static (ใช้เฉพาะเมื่อไม่มี endpoint จริงรองรับ)

```markdown
![platform](https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey)
![status](https://img.shields.io/badge/status-active-brightgreen)
```

Platform/OS (กลุ่ม Compatibility) ไม่มี dynamic endpoint จริงรองรับ — ไม่มี service ไหน query ได้ว่า repo รองรับ OS ไหนบ้าง จึงใช้ static ได้ตามข้อยกเว้นนี้ ต่างจาก version/license/build ที่มี endpoint จริงรองรับแล้วต้องใช้ dynamic เสมอ

> [!WARNING]
> **ห้าม** ใช้ static badge แทน dynamic เมื่อมี endpoint จริงรองรับอยู่แล้ว (เช่น version, license, build status) และ **ห้ามสร้าง badge ที่ไม่มี metric ใดวัดได้จริงรองรับเลย** (เช่น `rating-★★★★★` ที่ไม่มี service ไหนให้ query คะแนน repo ได้จริง) เพราะจะกลายเป็น vanity badge ที่ทำให้ README ดูไม่น่าเชื่อถือ — **อีกข้อยกเว้น**: endpoint มีจริงแต่เข้าไม่ได้เพราะ repo เป็น private (ดู "Public vs Private Repo" ด้านบน) ตอนนั้นใช้ static แทนได้ แต่ **เฉพาะ** field ที่ verify ได้จากไฟล์ในโปรเจกต์เอง (version, license) — field ที่ต้องเดา (build status, stars, ฯลฯ) ยังห้ามใส่แบบ static อยู่ดี เพราะเป็นการเดา ไม่ใช่ข้อเท็จจริง

---

## 🏷️ Section Headers (สำหรับ H3 ในไฟล์ README)

ใช้ mapping นี้เพื่อเลือก emoji ให้ตรงกับหน้าที่ของ section เสมอ:

ลำดับด้านล่างตรงกับลำดับ section จริงใน `references/structure.md`:

| Emoji | Code | Section |
| --- | --- | --- |
| 🎉 Party Popper | `:tada:` | Title (H1) / Initial Commit |
| 💎 Gem | `:gem:` | Repository / About |
| ✨ Sparkles | `:sparkles:` | Features |
| 🔥 Fire | `:fire:` | Performance / Benchmarks |
| 🧊 Ice | `:ice:` | Tech Stack / Folder Structure |
| 🧩 Puzzle Piece | `:jigsaw:` | Integrations / Plugins / Extensions |
| ✅ Check Mark Button | `:white_check_mark:` | Requirements / Prerequisites |
| 🚀 Rocket | `:rocket:` | Setup / Installation |
| ⚙️ Gear | `:gear:` | Configuration / Environment |
| 🔑 Key | `:key:` | API Key / Credentials / Secrets |
| 🐳 Docker | `:whale:` | Deployment |
| 🏆 Trophy | `:trophy:` | Run / Usage |
| 👉🏼 Backhand Index Pointing Right | `:point_right:` | Try it out / Demo |
| 📸 Camera with Flash | `:camera_with_flash:` | Screenshots |
| 📝 Memo | `:memo:` | Document / API Reference |
| 📅 Calendar | `:calendar:` | Schedule / Cron |
| 🔔 Bell | `:bell:` | Notifications / Webhooks / Alerts |
| 🧪 Test Tube | `:test_tube:` | Testing |
| ⚠️ Warning | `:warning:` | Fix Error / Troubleshooting |
| 🦄 Unicorn | `:unicorn:` | Roadmap / Future Plans |
| 🙏 Pray | `:pray:` | Contributors / Credits / Thanks |
| ⚡ High Voltage | `:zap:` | New Updates / Changelog |
| 🛡️ Shield | `:shield:` | Security / Security Policy |
| 📜 Scroll | `:scroll:` | License |
| ✉️ Envelope | `:envelope:` | Contact / Author |
| 🍺 Beer Mug | `:beer:` | Donate / Support / Sponsor |

