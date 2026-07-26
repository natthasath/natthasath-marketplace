# สัญญาณเทคโนโลยีที่มักเจอใน README

รายการ pattern ที่มักบ่งบอกภาษา/เทคโนโลยี/ประเภทงาน ใช้เป็นตัวช่วยสแกน ไม่ใช่กฎตายตัว —
เจอสัญญาณไหนที่เกี่ยวกับตัวโปรเจกต์จริงก็ดึงมาเป็น tag ให้ครบ ไม่ต้องกลัว tag เยอะ
ใช้วิจารณญาณกรองแค่กรณีที่สิ่งที่เจอไม่ได้เกี่ยวกับ stack จริงของโปรเจกต์เลย (เช่น พูดถึง
"PostgreSQL" ใน troubleshooting section ที่ยกตัวอย่างปัญหาของคนอื่น ไม่ใช่สิ่งที่โปรเจกต์นี้ใช้จริง)

## Badge (shields.io และอื่นๆ)

Badge มักอยู่ต้น README เป็น `![alt](url)` หรือ `<img alt="...">` — ข้อความใน `alt` มักบอกชื่อ
เทคโนโลยี/สถานะตรงๆ อยู่แล้ว เช่น `Build Status`, `npm version`, `Docker Pulls`, `License: MIT`,
`Python 3.11` — ดึงชื่อเทคโนโลยีจาก alt text หรือจาก path ของ badge (เช่น
`img.shields.io/badge/-Kubernetes-...` หรือ `img.shields.io/npm/v/next.svg` บ่งบอก npm/node)

## ไฟล์ dependency / config ที่ README กล่าวถึง

| ไฟล์ที่เจอในคำอธิบายหรือ code block | เทคโนโลยีที่บ่งบอก |
|---|---|
| `requirements.txt`, `pyproject.toml`, `Pipfile` | python |
| `package.json`, `.nvmrc` | node (และเช็คต่อว่า react/vue/express ฯลฯ) |
| `Dockerfile`, `docker-compose.yml` | docker |
| `go.mod` | go |
| `Cargo.toml` | rust |
| `pom.xml`, `build.gradle` | java (หรือ kotlin ถ้าเป็น gradle.kts) |
| `Gemfile` | ruby |
| `composer.json` | php |
| `*.csproj`, `*.sln` | dotnet / csharp |
| `.github/workflows/*.yml` | github-actions (ถ้าอยากลงรายละเอียด ci/cd) |

## หัวข้อที่มักบอก stack ตรงๆ

หัวข้อแบบ `## Tech Stack`, `## Built With`, `## Requirements`, `## Prerequisites` มักมี list
เทคโนโลยีตรงๆ ให้ดึงจากตรงนี้ก่อนเป็นอันดับแรกถ้ามี เพราะเจ้าของโปรเจกต์เขียนสรุปไว้ให้แล้ว

## Framework / library ที่ควรเป็น tag เมื่อเป็นแกนหลัก

พวกนี้ควรเป็น tag ก็ต่อเมื่อ README บอกว่าโปรเจกต์ "ใช้" หรือ "สร้างด้วย" มันจริง ไม่ใช่แค่เอ่ยถึง
ในตัวอย่างโค้ดหรือ integration เสริม: React, Vue, Angular, Svelte, Next.js, FastAPI, Django,
Flask, Express, Spring, Laravel, Rails, TensorFlow, PyTorch, Electron, Tauri, Kubernetes,
Terraform, PostgreSQL, MySQL, MongoDB, Redis, SQLite

## แยก "user-facing tech stack" ออกจาก "implementation detail ที่เอ่ยถึงผ่านๆ"

"เลือกให้ครบ" หมายถึงไม่พลาด tag ที่บอกว่าโปรเจกต์นี้คืออะไร/ใช้อะไรจริง ไม่ได้แปลว่าต้อง tag
ทุกคำนามทางเทคนิคที่ปรากฏในหน้า README — ตัวอย่างจริงที่เจอ: README ของ Next.js เขียนว่า
"integrating powerful Rust-based JavaScript tooling for the fastest builds" ซึ่งพูดถึง SWC
compiler ที่ทำงานอยู่ *ภายใน* Next.js เอง ไม่ใช่สิ่งที่คนใช้ Next.js ต้องรู้จักหรือค้นหากลับมาด้วยคำว่า
"Rust" — กรณีนี้ไม่ควร tag `#rust` เพราะไม่ใช่ identity ของโปรเจกต์ในสายตาผู้ใช้

วิธีแยก: ถามว่า "ถ้าจะค้นหา repo นี้กลับมาในอนาคต คนจะนึกถึงคำนี้ไหม" — ภาษา/framework/database/
ประเภทงานที่ README ใช้บรรยายตัวตนของโปรเจกต์ตรงๆ (มักอยู่ในย่อหน้าแรกหรือหัวข้อ Tech Stack)
ควร tag เสมอ ส่วนเทคโนโลยีที่โผล่มาเป็นรายละเอียดการ implement ภายใน (dependency ของ dependency,
tool ที่ maintainer ใช้ build แต่ผู้ใช้ทั่วไปไม่ได้แตะ) ไม่ต้อง tag เว้นแต่ตัวโปรเจกต์เองมีไว้เพื่อสิ่งนั้น
โดยตรง (เช่น repo ที่เป็น Rust bundler จริงๆ ย่อมต้อง tag `#rust`)

## ประเภทของโปรเจกต์ (ถ้า README ระบุชัดและยังไม่มี tag ครอบคลุมพอ)

ดูจากคำอธิบายตอนต้น README ว่าเป็น: cli-tool, library, framework, web-app, mobile-app,
browser-extension, vscode-extension, api, sdk, boilerplate, template — ใส่เป็น tag เฉพาะเมื่อ
ช่วยให้ค้นหากลับมาเจอง่ายขึ้นจริง ไม่ต้องฝืนใส่ถ้าไม่มีคำไหนเข้าเค้าเลย

## เมื่อ field `language` จาก GitHub API ขัดกับสิ่งที่ README บอก

`language` ที่ GitHub รายงานมาคำนวณจากจำนวนบรรทัด/byte ของโค้ดในทุกไฟล์ของ repo (Linguist)
ซึ่งบางทีเพี้ยนได้ เช่น repo ที่ตัวโปรแกรมจริงเป็น Node.js CLI แต่มี script ประกอบ/ทดสอบเป็น
Python เยอะกว่า ทำให้ GitHub รายงาน `language: "Python"` ทั้งที่ README มี badge "Node.js 18+"
และแจกจ่ายผ่าน npm ชัดเจน — กรณีแบบนี้ให้เชื่อสิ่งที่ README ระบุชัดเจนมากกว่า field `language`
ดิบๆ และใส่ tag ตามทั้งสองแหล่งถ้าทั้งคู่ดูมีมูล (เช่น ใส่ทั้ง `#node` ตาม README และเก็บ
`#python` ไว้ด้วยถ้า README ก็มีส่วนที่เขียนด้วย Python จริงๆ) อย่าเลือกแหล่งเดียวแบบไม่ดูบริบท
