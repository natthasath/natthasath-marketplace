#!/usr/bin/env python3
"""Download a skill folder (or any subtree) from a public/private GitHub repo.

Usage: python fetch_skill_source.py <github-url-or-owner/repo[/path]> <output-dir> [ref]

Accepts any of these URL shapes:
  https://github.com/owner/repo/tree/<ref>/path/to/skill
  https://github.com/owner/repo/blob/<ref>/path/to/skill/SKILL.md   (downloads the containing folder)
  https://github.com/owner/repo                                     (whole repo, default branch)
  owner/repo/path/to/skill                                          (shorthand, default branch)

Tries `gh api` first (works when the user has run `gh auth login` -- higher rate
limit, works for private repos too), falls back to the plain unauthenticated
GitHub REST API so this still works on machines where gh isn't logged in.

Uses the Git Trees API (?recursive=1) to list the whole subtree in one call, then
fetches each file's content via the Git Blobs API (works regardless of file size
up to 100MB, unlike the Contents API which omits `content` for large files).

To avoid silently downloading an entire large repo when the user only meant to
point at one skill folder, this aborts if the matched subtree has more than
MAX_FILES files -- ask the user to pass a narrower path instead of raising the
limit.

Prints a single JSON object to stdout:
{"owner": ..., "repo": ..., "ref": ..., "path": ..., "source": "gh"|"api",
 "output_dir": ..., "files": ["SKILL.md", "references/foo.md", ...], "error": null|"..."}
"""
import base64
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

MAX_FILES = 200


def parse_url(ref: str) -> tuple[str, str, str | None, str]:
    """Returns (owner, repo, ref_or_None, path) -- path has no leading/trailing slash."""
    ref = ref.strip().rstrip("/")
    if ref.endswith(".git"):
        ref = ref[: -len(".git")]

    m = re.search(r"github\.com/([^/\s]+)/([^/\s]+)(?:/(tree|blob)/([^/\s]+)(?:/(.*))?)?$", ref)
    if m:
        owner, repo, kind, branch, path = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5) or ""
        if kind == "blob" and path:
            path = path.rsplit("/", 1)[0] if "/" in path else ""
        return owner, repo, branch, path.strip("/")

    m = re.match(r"^([^/\s]+)/([^/\s]+)(?:/(.*))?$", ref)
    if m:
        return m.group(1), m.group(2), None, (m.group(3) or "").strip("/")

    raise ValueError(f"ไม่สามารถแยก owner/repo จาก: {ref}")


def gh_json(path: str):
    out = subprocess.run(["gh", "api", path], capture_output=True, text=True, timeout=30)
    if out.returncode != 0:
        return None, out.stderr.strip()
    return json.loads(out.stdout), None


def api_json(path: str):
    req = urllib.request.Request(
        f"https://api.github.com/{path}",
        headers={"Accept": "application/vnd.github+json", "User-Agent": "copycat-skill"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8")), None
    except urllib.error.HTTPError as e:
        reason = "private repo หรือไม่มีอยู่จริง — ลอง gh auth login แล้วรันใหม่" if e.code in (401, 403, 404) else e.reason
        return None, f"HTTP {e.code} ({reason})"
    except Exception as e:
        return None, str(e)


def get_json(path: str, prefer_gh: bool):
    """Try gh first (if prefer_gh), fall back to the public API. Returns (data, source, error)."""
    if prefer_gh:
        data, err = gh_json(path)
        if data is not None:
            return data, "gh", None
        data, err2 = api_json(path)
        if data is not None:
            return data, "api", None
        return None, None, f"gh CLI ({err}) และ public API ({err2})"
    data, err = api_json(path)
    if data is not None:
        return data, "api", None
    return None, None, err


def has_gh() -> bool:
    try:
        subprocess.run(["gh", "auth", "status"], capture_output=True, timeout=10)
        return True
    except Exception:
        return False


def main():
    if len(sys.argv) not in (3, 4):
        print(json.dumps({"error": "usage: fetch_skill_source.py <github-url-or-owner/repo[/path]> <output-dir> [ref]"}))
        sys.exit(1)

    output_dir = sys.argv[2]
    cli_ref = sys.argv[3] if len(sys.argv) == 4 else None

    try:
        owner, repo, url_ref, path = parse_url(sys.argv[1])
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    ref = cli_ref or url_ref
    prefer_gh = has_gh()

    if ref is None:
        meta, source, err = get_json(f"repos/{owner}/{repo}", prefer_gh)
        if meta is None:
            print(json.dumps({"owner": owner, "repo": repo, "error": f"ดึงข้อมูล repo ไม่สำเร็จ: {err}"}))
            sys.exit(1)
        ref = meta.get("default_branch", "main")

    tree, source, err = get_json(f"repos/{owner}/{repo}/git/trees/{ref}?recursive=1", prefer_gh)
    if tree is None:
        print(json.dumps({"owner": owner, "repo": repo, "ref": ref, "error": f"ดึง tree ไม่สำเร็จ: {err}"}))
        sys.exit(1)

    prefix = f"{path}/" if path else ""
    blobs = [
        e for e in tree.get("tree", [])
        if e["type"] == "blob" and (not prefix or e["path"].startswith(prefix))
    ]

    if not blobs:
        print(json.dumps({
            "owner": owner, "repo": repo, "ref": ref, "path": path,
            "error": f"ไม่พบไฟล์ใต้ path '{path}' ใน {owner}/{repo}@{ref} — เช็คว่า path/ref ถูกต้องไหม",
        }))
        sys.exit(1)

    if len(blobs) > MAX_FILES:
        print(json.dumps({
            "owner": owner, "repo": repo, "ref": ref, "path": path,
            "error": f"เจอ {len(blobs)} ไฟล์ใต้ path นี้ (เกิน {MAX_FILES}) — น่าจะเป็น repo ทั้งก้อนไม่ใช่แค่ skill เดียว "
                     f"ลองระบุ path ที่แคบลงไปที่โฟลเดอร์ของ skill นั้นโดยตรง เช่น .../tree/main/skills/foo",
        }))
        sys.exit(1)

    files = []
    for entry in blobs:
        blob, _, blob_err = get_json(f"repos/{owner}/{repo}/git/blobs/{entry['sha']}", prefer_gh)
        if blob is None:
            print(json.dumps({
                "owner": owner, "repo": repo, "ref": ref, "path": path,
                "error": f"ดึงไฟล์ {entry['path']} ไม่สำเร็จ: {blob_err}",
            }))
            sys.exit(1)

        rel_path = entry["path"][len(prefix):] if prefix else entry["path"]
        dest = os.path.join(output_dir, rel_path)
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        content = base64.b64decode(blob["content"]) if blob.get("encoding") == "base64" else blob["content"].encode()
        with open(dest, "wb") as f:
            f.write(content)
        files.append(rel_path)

    print(json.dumps({
        "owner": owner, "repo": repo, "ref": ref, "path": path, "source": source,
        "output_dir": output_dir, "files": sorted(files), "error": None,
    }))


if __name__ == "__main__":
    main()
