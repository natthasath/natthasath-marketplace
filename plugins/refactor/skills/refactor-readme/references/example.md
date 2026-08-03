# 📄 README Example — Standard Pattern

ตัวอย่าง README ที่ refactor แล้วตาม pattern มาตรฐาน ใช้เป็น benchmark สำหรับ tone, ความหนาแน่น และโครงสร้าง

สังเกต 3 อย่าง: (1) intro paragraph สั้น อธิบายว่าโปรเจกต์คืออะไร ไม่ใช่ประวัติยาว (2) แต่ละ section คั่นชัด H3 + emoji (3) code block ระบุภาษาเสมอ และใช้ table/bullet ให้ข้อมูล scan ได้เร็ว

---

```markdown
# 🎉 Template Python FastAPI Keycloak

Keycloak is an open-source identity and access management solution providing Single Sign-On (SSO), user federation, identity brokering, and social login. It supports OAuth 2.0, OpenID Connect, and SAML protocols, with customizable authentication and user management.

![build](https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/ci.yml)
![version](https://img.shields.io/github/v/release/{owner}/{repo})
![license](https://img.shields.io/github/license/{owner}/{repo})

### 🚀 Setup

```shell
echo API_KEY | sha256sum
```

| Reason                                 | Refresh Token | Access Token |
|----------------------------------------|--------------|--------------|
| Used to authenticate user sessions     | ✅ Yes       | ❌ No        |
| Has a short lifespan (short-lived)     | ❌ No        | ✅ Yes       |
| Can be used to revoke all tokens       | ✅ Yes       | ❌ No        |
| Prevents Token Reuse Attack            | ✅ Yes       | ❌ No        |

### 🏆 Run

- [http://localhost:8000/docs](http://localhost:8000/docs)
- [http://localhost:8000/subapi/docs](http://localhost:8000/subapi/docs)

```shell
docker-compose up -d
```

### 👉🏻 Try it out

- [Oauth Tools](https://oauth.tools/)
```

---

## ลำดับ Section ที่แนะนำ

ไม่ตายตัว — เลือกเฉพาะที่มีเนื้อหาจริง ตัด section ว่างทิ้ง แต่ถ้ามี ให้เรียงตาม flow ของคนที่เพิ่งเจอ repo:

1. `# 🎉 {Title}` + intro paragraph + badges
2. `### ⭐ Features` — จุดขายสั้น ๆ เป็น bullet (ถ้ามี)
3. `### ✅ Requirements` — สิ่งที่ต้องมีก่อน
4. `### 🔑 Configuration` — env / config ที่ต้องตั้ง
5. `### 🚀 Setup` — ขั้นตอนติดตั้ง
6. `### 🏆 Run` — วิธีรันและ endpoint
7. `### 👉🏻 Try it out` — ลิงก์ demo / playground
8. `### 🔨 Fix Error` — ปัญหาที่พบบ่อย (ถ้ามี)
9. `### 💎 Document` — ลิงก์เอกสารเพิ่มเติม (ถ้ามี)

## หลักการเขียนแต่ละส่วน

- **Intro**: 1–3 ประโยค บอกว่ามันคืออะไรและแก้ปัญหาอะไร — เขียนให้คนที่ไม่รู้จักโปรเจกต์เข้าใจได้ทันที
- **Code block**: ระบุภาษาเสมอ (` ```shell `, ` ```python `) เพื่อให้ syntax highlight ทำงาน
- **Table**: ใช้เมื่อเปรียบเทียบหรือ list ค่าที่มี structure ชัด — อ่านเร็วกว่าย่อหน้า
- **Link**: endpoint และ external tool ทำเป็น clickable link เสมอ
- **ความ minimal**: ตัดคำฟุ่มเฟือย ไม่ต้องมี "Table of Contents" ถ้า README สั้น ไม่ต้องมี section ที่ไม่มีเนื้อหา
