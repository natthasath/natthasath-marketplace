#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""encryption — archive a folder, encrypt it with GPG symmetric AES-256, and
generate a separate random passphrase for secure file exchange.

Usage:
    uv run --script secure_send.py <source_dir> <archive_output_path> <passphrase_output_dir>

archive_output_path is a full file path (the caller picks the archive's
name). passphrase_output_dir is a *directory* -- the passphrase always gets
written there as a fixed filename (passphrase.txt), never whatever name the
caller might have been tempted to give it, so every run produces the same
predictable filename for tooling/humans to look for.

Besides the encrypted archive and the passphrase file, this also writes a
Thai-language "how to decrypt" instructions file (HOW-TO-DECRYPT.md) next to
the archive, filled in from assets/decrypt-instructions.md, so a
non-technical recipient knows how to install gpg and run the decrypt command
themselves. That file has no secret in it (no passphrase, no file listing)
so it's fine to hand to the recipient over the same channel as the archive.

Design notes (see plugins/productive/skills/encryption/SKILL.md for the full
security design discussion):

- The passphrase is generated here, used in-memory only, and never touches
  argv or stdout except as the final JSON summary's *paths* (never its
  content). It is passed to gpg via stdin (`--passphrase-fd 0`), never as a
  command-line argument, so it cannot leak into `ps` output or shell history.
- Passphrase is random characters from an unambiguous 54-character alphabet
  (no 0/O/1/l/I), not a diceware wordlist. A hand-built wordlist bundled with
  this skill couldn't be verified for duplicates/typos without extra tooling,
  and since the passphrase is written to a file rather than read aloud or
  typed by hand, wordlist readability isn't worth that risk.
- Round-trip validation decrypts the freshly-encrypted archive right back and
  compares SHA-256 hashes with the plaintext archive. This catches passphrase
  handling bugs (e.g. stray newline/CRLF picked up somewhere in the pipe)
  before the user hands a possibly-broken file to someone else.
- All intermediate plaintext (the unencrypted archive, the round-trip decrypt
  copy) lives in a single temp directory that is always removed in `finally`,
  success or failure.
- stdout is a single JSON object. It never contains the passphrase or a
  listing of files inside the archive.
"""
from __future__ import annotations

import hashlib
import json
import os
import secrets
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

# Alphabet excludes classic look-alike characters: 0/O, 1/l/I.
_ALPHABET = (
    "ABCDEFGHJKMNPQRSTUVWXYZ"  # 23 uppercase (no I, L, O)
    "abcdefghjkmnpqrstuvwxyz"  # 23 lowercase (no i, l, o)
    "23456789"  # 8 digits (no 0, 1)
)
_GROUP_SIZE = 4
_GROUP_COUNT = 6  # 24 chars * log2(54) ~= 138 bits of entropy

# Max coded S2K iteration count gpg accepts -- strongest available KDF work factor.
_S2K_COUNT = "65011712"

_INSTRUCTIONS_TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "decrypt-instructions.md"
_PASSPHRASE_FILENAME = "passphrase.txt"
_INSTRUCTIONS_FILENAME = "HOW-TO-DECRYPT.md"


def fail(message: str) -> None:
    print(json.dumps({"status": "error", "message": message}))
    sys.exit(1)


def generate_passphrase() -> str:
    chars = [secrets.choice(_ALPHABET) for _ in range(_GROUP_SIZE * _GROUP_COUNT)]
    groups = [
        "".join(chars[i : i + _GROUP_SIZE])
        for i in range(0, len(chars), _GROUP_SIZE)
    ]
    return "-".join(groups)


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def chmod_best_effort(path: Path, mode: int) -> None:
    try:
        os.chmod(path, mode)
    except OSError:
        pass  # Best-effort on platforms/filesystems that don't support POSIX modes.


def write_decrypt_instructions(archive_output: Path) -> Path:
    """Writes a Thai-language, non-secret 'how to decrypt' file next to the
    archive so the recipient (who may not know gpg) can follow along. Always
    named HOW-TO-DECRYPT.md -- a fixed, predictable name -- so re-running the
    skill for a later transfer in the same folder just refreshes it in place;
    it has no secret content, so overwriting it is harmless."""
    archive_name = archive_output.name
    decrypted_name = archive_name[: -len(".gpg")] if archive_name.endswith(".gpg") else f"{archive_name}.decrypted"

    template = _INSTRUCTIONS_TEMPLATE.read_text(encoding="utf-8")
    content = template.replace("__ARCHIVE_NAME__", archive_name).replace("__DECRYPTED_NAME__", decrypted_name)

    instructions_output = archive_output.parent / _INSTRUCTIONS_FILENAME
    instructions_output.write_text(content, encoding="utf-8", newline="\n")
    return instructions_output


def run_gpg(args: list[str], passphrase: str) -> None:
    proc = subprocess.run(
        ["gpg", *args],
        input=passphrase.encode("utf-8"),
        capture_output=True,
    )
    if proc.returncode != 0:
        stderr = proc.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"gpg exited {proc.returncode}: {stderr}")


def main() -> None:
    if len(sys.argv) != 4:
        fail("usage: secure_send.py <source_dir> <archive_output_path> <passphrase_output_dir>")

    source_dir = Path(sys.argv[1]).expanduser().resolve()
    archive_output = Path(sys.argv[2]).expanduser().resolve()
    passphrase_dir = Path(sys.argv[3]).expanduser().resolve()
    passphrase_output = passphrase_dir / _PASSPHRASE_FILENAME

    if not source_dir.is_dir():
        fail(f"source_dir ไม่ใช่โฟลเดอร์หรือไม่พบ: {source_dir}")

    if shutil.which("gpg") is None:
        fail("ไม่พบ gpg บนเครื่องนี้ — ต้องติดตั้งก่อนเรียก script นี้ (SKILL.md เป็นคนเช็ค/ติดตั้งก่อนหน้านี้แล้ว)")

    archive_output.parent.mkdir(parents=True, exist_ok=True)
    passphrase_dir.mkdir(parents=True, exist_ok=True)

    if archive_output == passphrase_output:
        fail("archive_output_path จะไปทับไฟล์ passphrase.txt ในโฟลเดอร์เดียวกัน — เลือกโฟลเดอร์อื่นสำหรับ passphrase")

    if archive_output.name == _INSTRUCTIONS_FILENAME:
        fail(f"archive_output_path ต้องไม่ชื่อ {_INSTRUCTIONS_FILENAME} เพราะจะไปทับไฟล์คำแนะนำ decrypt")

    source_file_count = 0
    source_total_bytes = 0
    for root, _dirs, files in os.walk(source_dir):
        for name in files:
            fp = Path(root) / name
            source_file_count += 1
            try:
                source_total_bytes += fp.stat().st_size
            except OSError:
                pass

    if source_file_count == 0:
        fail(f"ไม่พบไฟล์ใดๆ ใน source_dir: {source_dir}")

    tmp_dir = Path(tempfile.mkdtemp(prefix="encryption-skill-"))
    plaintext_archive = tmp_dir / "archive.tar.gz"
    roundtrip_copy = tmp_dir / "roundtrip.tar.gz"

    try:
        with tarfile.open(plaintext_archive, "w:gz") as tar:
            tar.add(source_dir, arcname=source_dir.name)
        chmod_best_effort(plaintext_archive, 0o600)

        passphrase = generate_passphrase()

        gpg_common = [
            "--batch",
            "--yes",
            "--pinentry-mode", "loopback",
            "--no-symkey-cache",
        ]

        run_gpg(
            [
                *gpg_common,
                "--symmetric",
                "--cipher-algo", "AES256",
                "--s2k-cipher-algo", "AES256",
                "--s2k-digest-algo", "SHA512",
                "--s2k-count", _S2K_COUNT,
                "--passphrase-fd", "0",
                "--output", str(archive_output),
                str(plaintext_archive),
            ],
            passphrase,
        )

        run_gpg(
            [
                *gpg_common,
                "--decrypt",
                "--passphrase-fd", "0",
                "--output", str(roundtrip_copy),
                str(archive_output),
            ],
            passphrase,
        )
        chmod_best_effort(roundtrip_copy, 0o600)

        if sha256_of(plaintext_archive) != sha256_of(roundtrip_copy):
            fail("round-trip validation ล้มเหลว: decrypt กลับมาแล้ว hash ไม่ตรงกับต้นฉบับ — ไม่ส่งไฟล์นี้ต่อ")

        passphrase_output.write_text(passphrase + "\n", encoding="utf-8", newline="\n")
        chmod_best_effort(passphrase_output, 0o600)

        instructions_output = write_decrypt_instructions(archive_output)

        print(json.dumps({
            "status": "ok",
            "source_dir": str(source_dir),
            "archive_output": str(archive_output),
            "passphrase_output": str(passphrase_output),
            "instructions_output": str(instructions_output),
            "file_count": source_file_count,
            "total_bytes": source_total_bytes,
            "archive_bytes": archive_output.stat().st_size,
            "validation": "hash_match",
        }))
    except RuntimeError as e:
        fail(str(e))
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
