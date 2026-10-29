# Template และตัวอย่างคู่มือ

ไฟล์นี้มี template โครงสร้างเต็ม (คัดลอกไปปรับใช้ได้ตรงๆ) ตามด้วยตัวอย่างคู่มือที่เขียนเสร็จ
2 ชิ้นซึ่งทำตามกฎครบ ให้ใช้เป็นต้นแบบเรื่องความสั้น กระชับ น้ำเสียง และการจัดวาง

สิ่งสำคัญ: คู่มือนี้ต้อง **สั้นกว่าบทความบล็อกทั่วไปมาก** — ไม่มีคำนำ ไม่มี Prerequisites,
Verification, References เป็น section แยก ทุกขั้นตอน (ติดตั้ง/ตั้งค่า/ตรวจสอบ) อยู่ในลำดับเลข
เดียวกันต่อเนื่องกันไปทั้งไฟล์ โดยแต่ละขั้นตอนมีคำอธิบายแค่ 1-2 ประโยค ไม่ใช่พารากราฟยาว

---

## Template เปล่า

```markdown
---
type: 'Command'
title: <Short Title>
---

# <Short Title>

#### 1. <ชื่อขั้นตอนสั้นๆ ภาษาไทย>

<คำอธิบาย 1-2 ประโยคภาษาไทย: ขั้นตอนนี้ทำอะไร>

```bash
<คำสั่งจริง>
```

#### 2. <ขั้นตอนถัดไป>

<คำอธิบาย 1-2 ประโยคภาษาไทย>

```bash
<คำสั่งจริง>
```
```

---

## ตัวอย่างที่ 1 — ติดตั้งและตั้งค่า NTP (chrony) บน Oracle Linux

```markdown
---
type: 'Command'
title: NTP (chrony) - Oracle Linux
---

# NTP (chrony) - Oracle Linux

#### 1. ตรวจสอบว่ามี chrony ติดตั้งอยู่แล้วหรือยัง

Oracle Linux ส่วนใหญ่ติดตั้ง `chrony` มาให้ตั้งแต่แรกเป็น NTP client/server มาตรฐานแทน `ntpd`

```bash
rpm -q chrony
```

#### 2. ติดตั้ง chrony (ถ้ายังไม่มี)

```bash
sudo dnf install -y chrony
```

#### 3. เปิดใช้งาน service ให้เริ่มอัตโนมัติทุกครั้งที่บูต

```bash
sudo systemctl enable --now chronyd
```

#### 4. กำหนด NTP server ที่ต้องการ sync

เปิดไฟล์ `/etc/chrony.conf` แล้วเพิ่ม/แก้บรรทัด `pool` ให้ชี้ไปยัง NTP source ที่ต้องการ

```bash
sudo vi /etc/chrony.conf
```

```
pool 2.oracle.pool.ntp.org iburst
```

#### 5. รีสตาร์ท service ให้ config ใหม่มีผล

```bash
sudo systemctl restart chronyd
```

#### 6. เปิด firewall สำหรับ UDP port 123

ข้ามขั้นตอนนี้ได้ถ้าเครื่องนี้เป็น client อย่างเดียว ไม่ได้ทำหน้าที่เป็น NTP server ให้เครื่องอื่น

```bash
sudo firewall-cmd --add-service=ntp --permanent
sudo firewall-cmd --reload
```

#### 7. ตรวจสอบว่า sync เวลาสำเร็จ

ค่า `Leap status` ต้องเป็น `Normal` จึงถือว่า sync สำเร็จ

```bash
chronyc tracking
```
```

---

## ตัวอย่างที่ 2 — Set Alias for Python บน Ubuntu (zsh)

```markdown
---
type: 'Command'
title: Python Alias - Ubuntu
---

# Python Alias - Ubuntu

#### 1. ตรวจสอบว่ามี python3 อยู่จริง

```bash
which python3
```

#### 2. เปิดไฟล์ config ของ zsh

ถ้า shell เป็น `bash` ให้ใช้ `~/.bashrc` แทน `~/.zshrc` ในทุกขั้นตอนนี้

```bash
nano ~/.zshrc
```

#### 3. เพิ่ม alias ต่อท้ายไฟล์

```bash
alias python="python3"
```

#### 4. โหลด config ใหม่โดยไม่ต้องเปิด terminal ใหม่

```bash
source ~/.zshrc
```

#### 5. ตรวจสอบว่า alias ทำงานถูกต้อง

ต้องขึ้นเวอร์ชันของ python3 ไม่ใช่ error

```bash
python --version
```
```
