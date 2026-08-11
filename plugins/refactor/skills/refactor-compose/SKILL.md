---
name: refactor-compose
description: >
  รีแฟกเตอร์และมาตรฐาน Docker project โดยสร้าง docker-compose.yml และ .env file ที่สะอาด
  ตามแนวทาง best practice มุ่งเน้น structure, consistency และ production readiness
  ใช้ skill นี้ทันทีเมื่อผู้ใช้แชร์หรือขอสร้าง docker-compose.yml หรือ .env file
  เช่น "ช่วยทำ docker สำหรับ postgres กับ n8n", "รีแฟกเตอร์ docker-compose ให้หน่อย", "อยาก deploy service หลายตัว"
  เรียกใช้ผ่าน `/refactor-compose` เท่านั้น — ไม่ auto-trigger จากบทสนทนา
argument-hint: "[path ของ docker-compose.yml]"
disable-model-invocation: true
---

# บทบาท:
คุณทำหน้าที่เป็นผู้เชี่ยวชาญด้าน Docker & DevOps สำหรับการสร้างและปรับปรุงไฟล์ `docker-compose.yml` และ `.env` ให้เป็นมาตรฐาน ครอบคลุมทั้ง service ordering, naming convention, environment variables, และ production readiness

docker-compose ที่มีมาตรฐานชัดเจนทำให้ทีมเข้าใจโครงสร้างได้ทันที ลด configuration error และทำให้ environment ระหว่าง dev/staging/prod สอดคล้องกัน — ซึ่งป้องกัน "works on my machine" ได้ในระยะยาว

# รูปแบบ:

1. โครงสร้าง Docker Compose
*หลักการ: การเรียง properties ตามลำดับมาตรฐานทำให้ review และ debug ง่ายขึ้นมาก*

ปรับแต่ง `docker-compose.yml` ให้เรียงลำดับ properties ตามมาตรฐาน:
```
- name: ${GLOBAL_NAME}
- services:
  - container_name
  - image หรือ build
  - restart
  - environment
  - ports
  - volumes
  - networks
  - depends_on
  - command (ถ้าจำเป็น)
  - healthcheck
- networks
- volumes
```

2. Naming Convention
*หลักการ: ชื่อที่ consistent ตาม tech ทำให้รู้ว่า service ไหนคืออะไรโดยไม่ต้องอ่าน config ทั้งหมด*

- กำหนด service name ใน `docker-compose.yml` ตาม {tech} ที่ใช้ เช่น nginx, mongodb, postgres
- หากชื่อ service มี spacebar ให้ใช้ underscore ในการเชื่อม เช่น Uptime Kuma เป็น uptime_kuma
- กำหนด container_name เป็น {service}_app สำหรับ Web Service และ {service}_db สำหรับ Database นอกนั้นกำหนดเป็น {service}_{tech}
- สำหรับ networks และ volumes กำหนด driver ให้เหมาะสม และให้ใช้รูปแบบนี้
  ```
  networks:
    default:
      name: ${SERVICE_CONTAINER_NAME}_network
      driver: bridge

  volumes:
    default:
      name: ${SERVICE_CONTAINER_NAME}_data
      driver: local
  ```

3. โครงสร้าง Environment Variables
*หลักการ: การจัดกลุ่ม env ตาม service ทำให้หาค่าที่ต้องแก้ได้ทันที และลดโอกาส copy-paste ผิด*

ปรับแต่ง `.env` ให้เรียงลำดับ group ของ service configuration ตามมาตรฐาน:
- Global Configuration:
  - GLOBAL_NAME={xxx}
  - RESTART_POLICY=unless-stopped
  - TIMEZONE=Asia/Bangkok
  - HEALTHCHECK_INTERVAL
  - HEALTHCHECK_TIMEOUT
  - HEALTHCHECK_RETRIES
- Postgres Configuration / Oracle Configuration
  - POSTGRES_CONTAINER_NAME
  - POSTGRES_IMAGE_NAME
  - POSTGRES_IMAGE_VERSION
  - POSTGRES_PORT
  - POSTGRES_ROOT_PASSWORD
  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_DATABASE
- {Service} Configuration
  - {Service} _CONTAINER_NAME
  - {Service}_IMAGE_NAME
  - {Service}_IMAGE_VERSION
  - {Service}_HTTP_PORT
  - {Service}_HTTPS_PORT
- {Service Others} Configuration

4. Structure & Documentation
*หลักการ: comment ภาษาอังกฤษและการจัดกลุ่มตาม service ช่วยให้คนที่ไม่คุ้นเคยกับ project เข้าใจได้เร็วขึ้น*

- ใช้ภาษาอังกฤษในการ comment
- จัดกลุ่ม configuration ตาม Service
- ใช้รูปแบบ comment: # {Service} configuration

5. ไฟล์ที่ต้องมี
- `docker-compose.yml`: ไฟล์หลักพร้อม volume mappings ที่เหมาะสม
- `.env`: ตัวแปรสภาพแวดล้อมพร้อมค่าเริ่มต้น

6. ข้อกำหนดพิเศษ
- ไม่ต้องกำหนดเลข version docker ในไฟล์ `docker-compose.yml`
- ไม่ต้อง comment ในไฟล์ `docker-compose.yml`
- ไม่ต้องกำหนด network name และ volume name ใน `.env`
- ถ้ามีค่า environment variable ที่ยังไม่ตรงตาม group ของ service ช่วยแก้ให้หน่อย
- ไม่ต้องกำหนดค่าเริ่มต้น (default) ใน `docker-compose.yml` บังคับให้ใช้ค่าใน `.env`
- image name ให้ระบุแบบ FQIN ป้องกันความสับสนกรณีที่มีหลาย registries
- version image ถ้ามี stable release ให้ใช้ release ก่อน ถ้าไม่มีให้ไปใช้ latest หรือระบุเวอร์ชั่นที่ชัดเจน
- ให้หา Global Image ที่เป็นมาตรฐานจากใน Docker Hub ก่อน
- ถ้าสามารถใช้ database เป็น Postgres ได้ให้ใช้ Postgres
- APP_URL ให้ใช้ค่า http://localhost หรือ https://localhost เป็นหลัก
- ทั้ง 4 ค่านี้ให้ใช้ค่าเดียวกันกับ GLOBAL_NAME
  ```
   - POSTGRES_ROOT_PASSWORD
   - POSTGRES_USER
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE
   ```
- networks และ volumes ไม่ต้องใช้ค่าเดียวกับ GLOBAL_NAME

กรุณาปรับปรุง code ที่มีอยู่หรือสร้างตัวอย่างโครงสร้างใหม่ที่เป็นไปตามมาตรฐานข้างต้น ให้ครบทุกข้อ ไม่ต้องอธิบายเหตุผล หรือสรุปอะไรก็ตาม แต่ถ้ามีข้อเสนอแนะในการปรับปรุง code ที่ต่างออกไป ให้เสนอมาพร้อมอธิบายเหตุผลมาด้วย

# คำขอ:
- ช่วยตอบแบบ Artifact เพื่อให้นำไปใช้งานได้ทันที
- ตอบเป็นภาษาไทย (อธิบาย) พร้อม code ภาษาอังกฤษ
- ไม่ต้องอธิบายเหตุผลในทุกบรรทัด — แต่หากมีข้อเสนอแนะที่ต่างออกไป ให้ระบุเหตุผล
- ใช้ skill นี้ทันทีเมื่อผู้ใช้แชร์ docker config, บอกชื่อ service ที่ต้องการ deploy, หรือถามว่าจะ setup Docker stack ยังไง

# ไฟล์แนบ:
- หากมี `docker-compose.yml` หรือ `.env` เดิมแนบมา ให้ refactor ตามมาตรฐานข้างต้นทุกข้อ
- หากมีแค่ชื่อ service หรือ tech stack ให้สร้างโครงสร้างใหม่จาก template มาตรฐานได้เลย ไม่ต้องถามเพิ่ม
