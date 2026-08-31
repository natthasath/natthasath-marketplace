# 🔐 How to Decrypt

This file was encrypted with GPG (OpenPGP) using symmetric AES-256 encryption. You need the passphrase the sender gave you through a **separate channel** to decrypt it — no key exchange or account setup required.

### ✅ Requirements

ตรวจสอบว่ามี `gpg` อยู่ในเครื่องหรือยัง:

```powershell
Get-Command gpg -ErrorAction SilentlyContinue
```

```shell
command -v gpg
```

### 🚀 Install GPG

ถ้าไม่พบ `gpg` ให้ติดตั้งก่อนตามระบบปฏิบัติการของคุณ:

| OS | Command |
|---|---|
| Windows | `winget install GnuPG.Gpg4win` |
| macOS | `brew install gnupg` (ติดตั้ง [Homebrew](https://brew.sh) ก่อนถ้ายังไม่มี) |
| Linux (Debian/Ubuntu) | `sudo apt install -y gnupg` |
| Linux (Fedora) | `sudo dnf install -y gnupg2` |
| Linux (Arch) | `sudo pacman -S gnupg` |

### 🔓 Decrypt

เปิด Terminal/PowerShell ในโฟลเดอร์ที่มีไฟล์ `__ARCHIVE_NAME__` แล้วรัน:

```shell
gpg --output __DECRYPTED_NAME__ --decrypt __ARCHIVE_NAME__
```

โปรแกรมจะถามหา passphrase — ใส่ passphrase ที่ได้รับจากผู้ส่ง (ผ่านอีกช่องทางหนึ่ง) แล้วกด Enter

### 📦 Extract

```shell
tar -xzf __DECRYPTED_NAME__
```

รองรับทั้ง Windows (มี `tar` มาให้ตั้งแต่ build 1803), macOS และ Linux — จะได้โฟลเดอร์เนื้อหาต้นฉบับกลับมาครบตามที่ผู้ส่งเตรียมไว้

### 🛡️ Security Notes

- อย่าพิมพ์หรือส่งต่อ passphrase ในแชทหรืออีเมลเดียวกับไฟล์นี้ — เก็บไว้คนละช่องทางเสมอ
- หลังถอดรหัสและใช้งานเสร็จ แนะนำให้ลบไฟล์ `__ARCHIVE_NAME__` และ passphrase ที่ได้รับออกจากเครื่อง หรือย้ายไปเก็บใน password manager แทนการเก็บเป็นไฟล์ข้อความไว้เฉยๆ
