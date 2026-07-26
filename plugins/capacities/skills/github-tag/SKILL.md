---
name: github-tag
description: >
  วิเคราะห์ README.md ของ GitHub repo (จาก URL หรือ path ในเครื่อง) แล้วแนะนำ tag
  สำหรับบันทึกลง Capacities โดยดึง GitHub topics ที่ repo นั้นตั้งไว้อยู่แล้วมาเป็น
  tag หลัก แล้วเสริมด้วย tag ภาษา/เทคโนโลยีที่เจอใน README แต่ยังไม่มีใน topics
  รูปแบบ tag เป็นแบบเปลือยเหมือน GitHub topic เช่น `#python` `#docker` `#cli-tool`
  ใช้ skill นี้ทันทีเมื่อผู้ใช้ต้องการ tag repo, จัดหมวด project บน GitHub ลง Capacities,
  หรือถามว่า repo นี้ควร tag ว่าอะไร เช่น "ช่วย tag repo นี้หน่อย", "อยากเก็บ repo นี้ลง
  Capacities ต้องใส่ tag อะไรบ้าง", "ดู README แล้วบอก tag ให้หน่อย" — ถ้าผู้ใช้ยังไม่ได้
  แนบลิงก์ GitHub repo หรือ path ในเครื่องมาด้วย ต้องถามก่อนเสมอ ห้ามเดา repo เอง
tools:
  - Bash
  - Read
---

# บทบาท:
คุณทำหน้าที่เป็นผู้แนะนำ tag สำหรับเก็บ GitHub repo ไว้ใน Capacities
โดยอ่านทั้งข้อมูลที่ repo นั้นมีอยู่แล้วบน GitHub (topics, primary language) และเนื้อหาใน README
แล้วสรุปออกมาเป็นชุด tag ที่ครบและตรงกับตัวโปรเจกต์จริง

**เหตุผลที่ใช้ topics ของ GitHub เป็นฐาน:** เจ้าของ repo มักตั้ง topics ไว้อย่างตั้งใจแล้วว่า
โปรเจกต์นี้เกี่ยวกับอะไร (ภาษา, framework, ประเภทงาน) — การใช้ของเดิมก่อนแม่นยำกว่าการเดาใหม่ทั้งหมด
ส่วน README ใช้เสริมเฉพาะจุดที่ topics คนตั้งอาจตกหล่นไป เช่น dependency หรือ framework ที่ใช้จริง
แต่ไม่ได้ใส่เป็น topic ไว้

# ขั้นตอน:

## 0. เช็คว่ามีลิงก์ repo หรือ path มาหรือยัง

ถ้าข้อความของผู้ใช้ยังไม่มี GitHub URL (เช่น `https://github.com/owner/repo`) หรือ path ในเครื่อง
ที่ชี้ไปยัง README.md ให้ **ถามก่อนเสมอ** อย่าเดาหรือค้นหา repo เอง เพราะอาจ tag ผิดโปรเจกต์
ตัวอย่างคำถาม: "มีลิงก์ GitHub repo หรือ path ของโปรเจกต์นี้ในเครื่องไหม จะได้ดึง README มาอ่านให้"

## 1. ดึงข้อมูล repo

**กรณี GitHub URL หรือพิมพ์แค่ `owner/repo`:**

รันสคริปต์ที่ bundle มากับ skill นี้ — มันจัดการ parsing URL, ลอง `gh api` ก่อน
(ได้ rate limit สูงกว่าและใช้ได้กับ private repo ถ้า login ไว้แล้ว) แล้ว fallback เป็น
public GitHub API แบบไม่ต้อง auth ให้อัตโนมัติถ้า `gh` ยังไม่ได้ login:

```bash
python3 <base-directory-ของ-skill-นี้>/scripts/fetch_repo.py "<url-หรือ-owner/repo>"
```

ใช้ path แบบ absolute โดยเอา base directory ของ skill นี้ (ที่ระบบแจ้งไว้ตอนโหลด skill) มาต่อกับ
`scripts/fetch_repo.py` — อย่าพึ่ง relative path เพราะ working directory ตอนรันอาจไม่ใช่โฟลเดอร์
ของ skill นี้

ลองรันตามลำดับ `python3` → `py` → `python` จนกว่าจะได้ JSON กลับมาจริง (ไม่ใช่ error พวก
"command not found" หรือ "Python was not found; run without arguments to install from the
Microsoft Store" ซึ่งเป็น alias เปล่าบน Windows ที่ไม่มี Python ใช้งานจริง — เจอแบบนี้ให้ข้ามไป
ลองตัวถัดไปในลำดับทันที) บน Windows ที่ไม่มี `python3`/`python` ใช้งานจริง `py` มักเป็นตัวที่ใช้ได้

ผลลัพธ์เป็น JSON บรรทัดเดียว: `{owner, repo, topics, language, description, readme, source, error}`

ถ้า `error` ไม่ใช่ null แปลว่าดึงไม่สำเร็จ — สาเหตุที่พบบ่อยที่สุดคือ repo เป็น private
และเครื่องนี้ยังไม่ได้ `gh auth login` บอกสาเหตุกับผู้ใช้ตรงๆ และแนะนำให้ล็อกอินหรือ
วางเนื้อหา README มาให้แทน

**กรณี path ในเครื่อง:** อ่านไฟล์ README.md ตรงๆ ด้วย Read tool จาก path ที่ผู้ใช้ให้มา
จากนั้นเช็คว่า path นั้นอยู่ใน git repo ที่มี remote เป็น GitHub หรือไม่ (จะได้ topics มาด้วย):

```bash
git -C "<path>" remote get-url origin
```

ถ้าได้ URL ที่เป็น `github.com/...` กลับมา ให้เอาไปรันสคริปต์ข้างบนต่อเพื่อดึง topics/language
มาประกอบ (ไม่ต้องใช้ `readme` จากสคริปต์ในกรณีนี้ เพราะอ่านจากไฟล์ในเครื่องแล้ว — เอาแค่
`topics` และ `language`) ถ้าไม่ใช่ git repo หรือไม่มี remote GitHub ก็ข้ามขั้นนี้ไปเลย
แล้ววิเคราะห์จาก README อย่างเดียว โดยบอกผู้ใช้ว่าไม่มีข้อมูล topics มาประกอบ

## 2. สร้างรายการ tag

1. **Topics ที่มีอยู่แล้ว** → ใช้เป็น tag ตรงๆ ทุกตัว ในรูปแบบ `#{topic}` (topics ของ GitHub
   เป็นตัวพิมพ์เล็กและคั่นด้วย `-` อยู่แล้ว ไม่ต้องแปลงอะไรเพิ่ม)
2. **ภาษาโปรแกรมหลัก** (field `language` จากสคริปต์) → ถ้ายังไม่มี tag ภาษานี้ใน topics
   ให้เพิ่มเป็น tag ใหม่ เช่น `language: "Python"` แต่ไม่มี `#python` ใน topics → เพิ่ม `#python`
3. **สแกน README หาสัญญาณภาษา/เทคโนโลยีเพิ่มเติมให้ครบ** — อ่าน `references/tech-signals.md`
   สำหรับ pattern ที่ใช้บ่อย (badge, ชื่อไฟล์ dependency, หัวข้อ "Built with", code fence
   language) แล้วดึงทุกเทคโนโลยี/ประเภทงานที่ README เอ่ยถึงจริงและยังไม่มีใน tag ที่รวบรวม
   มาแล้ว **เลือกให้ครบ ไม่จำกัดจำนวน** เหมือน movies-tag และ spotify-tag ในปลั๊กอินเดียวกัน —
   ยิ่ง tag ครบ ยิ่งค้นหากลับมาเจอง่ายใน Capacities ใช้วิจารณญาณแค่กรองสิ่งที่ README เอ่ยถึง
   แบบผ่านๆ ไม่เกี่ยวกับตัวโปรเจกต์จริง (เช่น ชื่อเทคโนโลยีที่โผล่มาในตัวอย่าง troubleshooting
   ของคนอื่นที่แปะไว้ใน issue link) ออกไป ไม่ใช่กรองเพราะกลัว tag เยอะเกินไป
4. **ตัดตัวซ้ำ** — ถ้า tag เดียวกันมาจากทั้ง topics และ README ให้นับครั้งเดียว และถือว่ามาจาก
   topics เพราะเป็นแหล่งที่แม่นกว่า

## Output

```
**Tags:**
`#tag1` `#tag2` `#tag3` ⭐

**ที่มา:**
- `#tag1` — มาจาก GitHub topics ของ repo
- `#tag2` — primary language ของ repo (ยังไม่มีใน topics)
- `#tag3` — เจอใน README ว่าใช้ {เทคโนโลยี} เป็น {บทบาท เช่น web framework/database} แต่ไม่มีใน topics เดิม ⭐
```

ใช้ ⭐ กำกับ tag ทุกตัวที่ไม่ได้อยู่ใน topics เดิมของ repo — ทั้ง tag ภาษาโปรแกรมหลักที่เพิ่มเข้ามา
(ข้อ 2) และ tag ที่ได้จากการวิเคราะห์ README (ข้อ 3) นับเป็น "เสนอเพิ่ม" ทั้งคู่ เพื่อให้ผู้ใช้เห็น
ชัดเจนว่า tag ไหนมาจาก GitHub topics ของเดิม ไม่ต้องตรวจสอบซ้ำ กับ tag ไหนที่ Claude วิเคราะห์เพิ่มเอง
ควรกลับไปดูว่าตรงกับความเป็นจริงหรือเปล่า

ถ้า repo ไม่มี topics ตั้งไว้เลย ให้บอกผู้ใช้สั้นๆ ก่อน output ว่า "repo นี้ยังไม่มี GitHub topics
เลย ทุก tag ด้านล่างมาจากการวิเคราะห์ README" แล้ว tag ทุกตัวจะมี ⭐ กำกับหมด

## ตัวอย่าง

**Input:** `https://github.com/vercel/next.js`

**Output:**
```
**Tags:**
`#blog` `#browser` `#compiler` `#components` `#hybrid` `#nextjs` `#node` `#react`
`#server-rendering` `#ssg` `#static` `#static-site-generator` `#universal` `#vercel`
`#javascript` ⭐

**ที่มา:**
- `#blog` `#browser` `#compiler` `#components` `#hybrid` `#nextjs` `#node` `#react`
  `#server-rendering` `#ssg` `#static` `#static-site-generator` `#universal` `#vercel`
  — มาจาก GitHub topics ของ repo ทั้งหมด
- `#javascript` — primary language ของ repo (ยังไม่มีใน topics) ⭐
```

---

**Input:** path ในเครื่อง `E:\code\side-projects\invoice-cli` (มี remote เป็น
`github.com/user/invoice-cli` แต่ repo นี้ไม่เคยตั้ง topics ไว้เลย, README บอกว่าเขียนด้วย
Go และใช้ SQLite เก็บข้อมูล)

**Output:**
```
repo นี้ยังไม่มี GitHub topics เลย ทุก tag ด้านล่างมาจากการวิเคราะห์ README

**Tags:**
`#go` `#sqlite` `#cli-tool` ⭐

**ที่มา:**
- `#go` — primary language ของ repo ⭐
- `#sqlite` — README ระบุว่าใช้ SQLite เก็บข้อมูล ⭐
- `#cli-tool` — README อธิบายว่าเป็นเครื่องมือรันจาก command line ⭐
```

# คำขอ:
- Topic ที่มีอยู่แล้วใน repo → ใช้ตรงๆ ไม่แปลงชื่อ ไม่ใส่ prefix เพิ่ม
- Tag ใหม่จาก README → ใช้รูปแบบเดียวกับ GitHub topic คือตัวพิมพ์เล็กทั้งหมด คั่นคำด้วย `-`
  ไม่ใส่ prefix แบบ `#lang-` หรือ `#tech-`
- ไม่ต้องถามผู้ใช้ก่อนรันสคริปต์ดึงข้อมูล — รันได้เลยทันทีที่มี URL/path แล้ว
  ถามผู้ใช้เฉพาะตอนที่ยังไม่มี URL/path มาให้ตั้งแต่แรก หรือดึงข้อมูลแล้วเจอ error ที่แก้เองไม่ได้
  (เช่น private repo ที่ยังไม่ auth)
- เลือก tag ให้ครบ ไม่จำกัดจำนวน — โปรเจกต์ 1 ตัวมักมีหลายมิติปนกัน (ภาษา + framework +
  database + ประเภทงาน) การ tag ครบทำให้ค้นหากลับมาเจอง่ายกว่า อย่ากรอง tag ทิ้งเพราะ
  กลัวว่าจะเยอะเกินไป กรองเฉพาะสิ่งที่ไม่ได้เกี่ยวกับตัวโปรเจกต์จริงๆ เท่านั้น

# ไฟล์แนบ:
- ลิงก์ GitHub repo (เช่น `https://github.com/owner/repo` หรือ `owner/repo`) หรือ path ของ
  โปรเจกต์ในเครื่องที่มีไฟล์ README.md
