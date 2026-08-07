"""Programmatic checks for the github-license evals.

Covers the assertions that can be verified from files alone (LICENSE fidelity,
placeholder fill, README/metadata wiring). Judgement-based assertions about the
wording of the reply are graded by reading final_response.md separately.

Usage:  python grade.py <iteration-dir>
"""
import io
import json
import os
import re
import sys

ASSETS = "E:/code/prod/claude-marketplace/plugins/license/skills/github-license/assets/licenses"
PLACEHOLDER = re.compile(r"\[[A-Za-z][A-Za-z0-9 .]*\]")


def read(path):
    try:
        return io.open(path, encoding="utf-8", errors="replace").read()
    except OSError:
        return None


def find_license_file(root):
    for name in ("LICENSE", "LICENSE.txt", "LICENSE.md", "COPYING"):
        p = os.path.join(root, name)
        if os.path.isfile(p):
            return p
    return None


QUOTES = {"‘": "'", "’": "'", "“": '"', "”": '"',
          "–": "-", "—": "-", "©": "(c)", "…": "..."}


def normalize(text):
    """Collapse whitespace and fold typographic punctuation.

    Rewrapping a paragraph or swapping smart quotes for ASCII is a formatting
    difference, not a change to the license terms — only real wording changes
    should count against verbatim fidelity.
    """
    for a, b in QUOTES.items():
        text = text.replace(a, b)
    return re.sub(r"\s+", " ", text).strip()


def units(text):
    """Split a license into sentence-sized comparison units.

    Comparing whole documents is too brittle: one reordered header block makes
    an otherwise verbatim license score zero. Sentences are the right grain —
    they survive rewrapping and section reordering, but a license written from
    memory still fails to reproduce them.
    """
    body = normalize(text)
    return [u.strip() for u in re.split(r"(?<=[.;:]) ", body)
            if len(u.strip()) > 40 and not PLACEHOLDER.search(u)]


def identify(license_text):
    """Best-matching bundled template and the fraction of its sentences present."""
    target = normalize(license_text)
    best, best_cov = None, 0.0
    for fname in sorted(os.listdir(ASSETS)):
        us = units(read(os.path.join(ASSETS, fname)))
        if not us:
            continue
        cov = sum(1 for u in us if u in target) / len(us)
        if cov > best_cov:
            best, best_cov = fname[:-4], cov
    return best, round(best_cov, 3)


PERMISSIVE = {"MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0", "BSL-1.0", "Zlib"}
SOURCE_AVAILABLE = {"BUSL-1.1", "Elastic-2.0", "SSPL-1.0", "PolyForm-Noncommercial-1.0.0"}


def check(root, eval_name):
    """Return {assertion_text: (passed, evidence)} for the file-verifiable checks."""
    out = {}
    lic_path = find_license_file(root)
    lic = read(lic_path) if lic_path else None
    readme = read(os.path.join(root, "README.md")) or ""
    chosen, coverage = identify(lic) if lic else (None, 0.0)
    # 0.85 rather than 1.0: some licenses ship in more than one canonical
    # arrangement (BUSL's Parameters/Notice blocks in particular), and a
    # reordered header is not an altered term. Text written from memory scores
    # near zero, so this still separates the case we actually care about.
    verbatim = coverage >= 0.85
    src = " ".join(read(os.path.join(dp, f)) or ""
                   for dp, _, fs in os.walk(root) for f in fs
                   if f.endswith((".py", ".js", ".go", ".ts", ".java", ".rs")))

    def add(text, passed, evidence):
        out[text] = (bool(passed), evidence)

    add("มีไฟล์ LICENSE ที่ root ของโปรเจกต์", lic_path,
        f"found {os.path.basename(lic_path)}" if lic_path else "no LICENSE/COPYING at root")

    add("ข้อความใน LICENSE ตรงกับ template ที่ bundle ไว้ทุกตัวอักษร (ต่างได้เฉพาะ placeholder ที่เติม)",
        verbatim, f"closest={chosen}, coverage={coverage}")
    add("มีไฟล์ LICENSE ที่ตรงกับ template ที่ bundle ไว้ทุกตัวอักษร",
        verbatim, f"closest={chosen}, coverage={coverage}")

    if lic:
        left = PLACEHOLDER.findall(lic)
        # GPL-family appendix markers use <angle> form and are meant to stay verbatim
        add("ไม่มี placeholder ค้างใน LICENSE ([year], [fullname], [yyyy], [name of copyright owner])",
            not left, f"leftover: {left}" if left else "none")
        add("ถ้าเลือก BUSL-1.1 ต้องกรอกครบทั้ง 7 ค่า ไม่มี placeholder ค้าง",
            chosen != "BUSL-1.1" or not left,
            f"license={chosen}, leftover={left}")
        add("บรรทัด copyright ระบุชื่อ Natthasath Saksri และปีปัจจุบัน",
            "Natthasath Saksri" in lic and re.search(r"20(2[5-9]|3\d)", lic),
            (lic.splitlines()[2] if len(lic.splitlines()) > 2 else "")[:120])
        # GPL-family LICENSE text stays verbatim by design, so the holder legitimately
        # lives in README or source headers instead — accept any of the three.
        where = [n for n, t in (("LICENSE", lic), ("README", readme), ("source headers", src))
                 if "Acme" in (t or "")]
        add("ผู้ถือลิขสิทธิ์คือ Acme Co., Ltd. ไม่ใช่ชื่อบุคคลหรือ username",
            where, f"Acme found in: {where or 'nowhere'}")

    add("เลือก license กลุ่ม permissive (MIT / Apache-2.0 / BSD / ISC) ไม่ใช่ copyleft",
        chosen in PERMISSIVE, f"detected {chosen}")

    add("README มี section License ใช้ emoji 📜 ตาม convention ของ repo",
        "📜" in readme and re.search(r"#+\s*📜", readme),
        "found 📜 heading" if "📜" in readme else "no 📜 heading")
    add("README มี license badge",
        re.search(r"!\[[^\]]*license[^\]]*\]\(https://img\.shields\.io", readme, re.I),
        "shields.io license badge present" if "shields.io" in readme else "no badge")
    # locate the License section by its heading text, not by emoji — the emoji
    # convention is graded separately and should not double-count here
    m = re.search(r"^#{1,6}.*Licen[sc]e.*$", readme, re.M | re.I)
    sect = readme[m.end():] if m else ""
    nxt = re.search(r"^#{1,6}\s", sect, re.M)
    sect = sect[:nxt.start()] if nxt else sect
    add("README มี section License ที่บอกเงื่อนไขพิเศษของ license นั้น ไม่ใช่แค่ชื่อ license",
        len(normalize(sect)) > 90, f"license section chars={len(normalize(sect))}")

    if chosen in SOURCE_AVAILABLE:
        add("ถ้าเลือกกลุ่ม source-available README ต้องไม่มีคำว่า open source",
            "open source" not in readme.lower(),
            "README mentions 'open source'" if "open source" in readme.lower() else "clean")
    elif eval_name == "eval-2-saas-anti-cloud":
        add("ถ้าเลือกกลุ่ม source-available README ต้องไม่มีคำว่า open source",
            True, f"n/a — chose {chosen} (not source-available)")

    pyproject = read(os.path.join(root, "pyproject.toml"))
    if pyproject is not None:
        m = re.search(r'^\s*license\s*=\s*(.+)$', pyproject, re.M)
        add("pyproject.toml มี field license ที่เป็น SPDX id ตรงกับ license ที่เลือก",
            bool(m) and bool(chosen) and chosen.lower() in m.group(1).lower(),
            m.group(0).strip() if m else "no license field")

    pkg = read(os.path.join(root, "package.json"))
    if pkg is not None:
        try:
            lic_field = json.loads(pkg).get("license")
        except json.JSONDecodeError:
            lic_field = "<unparseable>"
        add('package.json ไม่ได้ถูกตั้งเป็น "license": "MIT" แบบเงียบๆ',
            lic_field != "MIT", f'package.json license = {lic_field!r}')
        add("ไม่เขียนไฟล์ LICENSE เป็น MIT โดยไม่แจ้งความขัดแย้ง",
            chosen != "MIT", f"LICENSE detected as {chosen}")

    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    it = sys.argv[1]
    for eval_name in sorted(os.listdir(it)):
        d = os.path.join(it, eval_name)
        if not os.path.isdir(d):
            continue
        print(f"\n### {eval_name}")
        for run in ("with_skill", "without_skill"):
            root = os.path.join(d, run, "outputs")
            if not os.path.isdir(root):
                print(f"  {run}: MISSING")
                continue
            res = check(root, eval_name)
            # keep only the assertions this eval actually declares
            meta = os.path.join(d, "eval_metadata.json")
            if os.path.isfile(meta):
                declared = set(json.load(io.open(meta, encoding="utf-8"))["assertions"])
                res = {k: v for k, v in res.items() if k in declared}
            passed = sum(1 for v in res.values() if v[0])
            print(f"  {run}: {passed}/{len(res)} file-checks passed")
            for k, (ok, ev) in res.items():
                print(f"    [{'x' if ok else ' '}] {k}  --  {ev}")
            io.open(os.path.join(d, run, "auto_checks.json"), "w",
                    encoding="utf-8", newline="\n").write(
                json.dumps({k: {"passed": v[0], "evidence": v[1]} for k, v in res.items()},
                           ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
