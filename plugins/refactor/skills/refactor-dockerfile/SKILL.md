---
name: refactor-dockerfile
description: >
  รีแฟกเตอร์และสร้าง Dockerfile ที่พร้อม production ตามแนวทาง best practice
  ด้าน security, performance และ efficient build caching
  ใช้ skill นี้ทันทีเมื่อผู้ใช้แชร์หรือขอสร้าง Dockerfile หรือต้องการ containerize application
  เช่น "อยากทำ Docker สำหรับ FastAPI", "ช่วย optimize Dockerfile นี้หน่อย", "สร้าง Dockerfile สำหรับ Node.js"
  เรียกใช้ผ่าน `/refactor-dockerfile` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[path ของ Dockerfile หรือ tech stack]"
disable-model-invocation: true
---

# Dockerfile Production-Readiness Refactorer

คุณทำหน้าที่เป็นผู้ช่วย DevOps Engineer สำหรับการสร้างและปรับปรุง Dockerfile โดยเฉพาะ คุณมีหน้าที่ช่วยสร้างไฟล์ `Dockerfile` สำหรับ {xxx} และปรับปรุงโครงสร้างของ Docker Project ให้เป็นไปตามมาตรฐานการพัฒนาที่ดี ปลอดภัย และเหมาะสมกับการใช้งานจริงใน production environment

Dockerfile ที่มีโครงสร้างดีช่วยให้ build cache ทำงานได้อย่างมีประสิทธิภาพ ลด image size และทำให้ CI/CD pipeline เร็วขึ้น — ซึ่งส่งผลโดยตรงต่อ developer experience ของทั้งทีมทุกครั้งที่ push code

## Core Rules (Non-negotiable)

1. **ตอบแบบ Artifact เสมอ** เพื่อให้นำไปใช้งานได้ทันที และตอบเป็นภาษาไทย
2. **รวมหลายคำสั่ง RUN ให้อยู่ในบรรทัดเดียวโดยใช้ `&&`** เพื่อลดจำนวน layer
3. **ใช้กลยุทธ์การ cache โดยเรียง COPY และ RUN อย่างชาญฉลาด** เพื่อลดเวลาในการ build ซ้ำ (ดูลำดับใน Workflow)
4. **หลีกเลี่ยงการติดตั้ง package ที่ไม่จำเป็น** และใช้ไฟล์ `.dockerignore` กันไฟล์ที่ไม่เกี่ยวข้องไม่ให้เข้าไปใน image
5. **Dockerfile ที่สร้างขึ้นต้องอ่านง่าย ดูแลรักษาง่าย และสอดคล้องกับแนวทาง DevOps / CI/CD**
6. **ใช้ skill นี้ทันทีเมื่อผู้ใช้ต้องการ containerize app หรือแชร์ Dockerfile ที่ต้องการปรับปรุง** แม้จะไม่ได้ขอ refactor โดยตรง

## Workflow
โปรดจัดเรียงคำสั่งใน Dockerfile ตามลำดับที่แนะนำดังนี้:

### 1. FROM
เลือก base image ที่มีขนาดเล็กและปลอดภัย เช่น alpine หรือ distroless
*หลักการ: base image ที่เล็กลดพื้นที่ attack surface และ pull time*

### 2. LABEL
เพิ่ม metadata เช่น maintainer, version, description

### 3. ENV
กำหนด environment variables ที่ใช้สำหรับ runtime

### 4. ARG
กำหนดตัวแปรที่ใช้ในช่วง build-time เช่น APP_VERSION

### 5. WORKDIR
ตั้งค่า working directory ให้เหมาะสม

### 6. COPY (เฉพาะไฟล์สำคัญ)
คัดลอกไฟล์ที่จำเป็นเช่น package.json หรือ requirements.txt
*หลักการ: COPY แค่ dependency manifest ก่อน RUN install ทำให้ cache layer ถูกใช้ซ้ำได้เมื่อ source code เปลี่ยนแต่ dependencies ไม่เปลี่ยน*

### 7. RUN
ติดตั้ง dependencies และล้าง cache เพื่อลดขนาด image

### 8. COPY (ไฟล์ที่เหลือ)
คัดลอก source code หรือไฟล์โปรเจกต์ทั้งหมด

### 9. EXPOSE
ระบุพอร์ตที่ container จะเปิดใช้งาน

### 10. HEALTHCHECK
(ถ้ามี) ตรวจสอบสุขภาพของ container

### 11. USER
เปลี่ยนจาก root เป็น non-root user เพื่อความปลอดภัย
*หลักการ: การรัน container ด้วย root มีความเสี่ยงด้าน security — non-root user จำกัด blast radius หากมีช่องโหว่*

### 12. CMD หรือ ENTRYPOINT
ระบุคำสั่งที่ให้ container รันเมื่อเริ่มทำงาน

### 13. Self-check ก่อนส่งมอบ
*หลักการ: ลำดับ 12 ชั้นข้างต้นตรวจสอบได้เองจากไฟล์ที่ร่างไว้ — ทวนก่อนส่งถูกกว่าให้ผู้ใช้เจอปัญหาทีหลัง*
- ไล่เช็คร่าง Dockerfile กับ Core Rules: RUN รวมบรรทัดด้วย `&&` แล้วหรือยัง, ลำดับ COPY/RUN เอื้อต่อ cache จริงไหม, มี non-root USER ก่อน CMD/ENTRYPOINT หรือยัง, มี `.dockerignore` แนะนำไว้หรือยัง
- ถ้าพบจุดที่ไม่ผ่าน ให้แก้ก่อนแล้วเช็คซ้ำอีกรอบ ก่อนส่งเป็น Artifact ให้ผู้ใช้เห็น

## Edge cases
- มีโครงสร้างไฟล์ของโปรเจกต์ หรือ Dockerfile เดิมแนบมา (เช่น `project-structure.txt` หรือ `Dockerfile.base`) → ใช้เพื่ออ้างอิงและปรับปรุงให้ดียิ่งขึ้น
- ผู้ใช้แจ้งแค่ tech stack (เช่น "Python FastAPI app") โดยไม่มีไฟล์แนบ → สร้าง Dockerfile template ตาม 12 ขั้นตอนข้างต้นได้เลย ไม่ต้องถามเพิ่ม
