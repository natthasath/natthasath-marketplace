#!/usr/bin/env python3
"""Fetch a GitHub repo's README, topics, primary language, and description.

Usage: python fetch_repo.py <github-url-or-owner/repo>

Tries `gh api` first (works well when the user has run `gh auth login` -- higher
rate limit, works for private repos too). Falls back to the plain unauthenticated
GitHub REST API (github.com/settings -> 60 requests/hour per IP, public repos only)
so the skill still works on machines where gh isn't logged in.

Prints a single JSON object to stdout:
{"owner": ..., "repo": ..., "topics": [...], "language": ..., "description": ...,
 "readme": "...", "source": "gh"|"api", "error": null|"..."}
"""
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request


def parse_owner_repo(ref: str) -> tuple[str, str]:
    ref = ref.strip().rstrip("/")
    if ref.endswith(".git"):
        ref = ref[: -len(".git")]
    m = re.search(r"github\.com[:/]([^/\s]+)/([^/\s]+)$", ref)
    if m:
        return m.group(1), m.group(2)
    m = re.match(r"^([^/\s]+)/([^/\s]+)$", ref)
    if m:
        return m.group(1), m.group(2)
    raise ValueError(f"ไม่สามารถแยก owner/repo จาก: {ref}")


def try_gh(owner: str, repo: str):
    def gh_json(path: str):
        out = subprocess.run(
            ["gh", "api", path],
            capture_output=True, text=True, timeout=20,
        )
        if out.returncode != 0:
            return None, out.stderr.strip()
        return json.loads(out.stdout), None

    def gh_raw(path: str):
        out = subprocess.run(
            ["gh", "api", path, "-H", "Accept: application/vnd.github.raw+json"],
            capture_output=True, text=True, timeout=20,
        )
        if out.returncode != 0:
            return None, out.stderr.strip()
        return out.stdout, None

    meta, err = gh_json(f"repos/{owner}/{repo}")
    if meta is None:
        return None, err
    readme, err = gh_raw(f"repos/{owner}/{repo}/readme")
    if readme is None:
        return None, err
    return {
        "topics": meta.get("topics", []),
        "language": meta.get("language"),
        "description": meta.get("description"),
        "readme": readme,
    }, None


def try_public_api(owner: str, repo: str):
    def get(url: str, accept: str) -> str:
        req = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": "github-tag-skill"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8")

    try:
        meta = json.loads(get(f"https://api.github.com/repos/{owner}/{repo}", "application/vnd.github+json"))
        readme = get(f"https://api.github.com/repos/{owner}/{repo}/readme", "application/vnd.github.raw+json")
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code} ({'private repo หรือไม่มีอยู่จริง — ลอง gh auth login แล้วรันใหม่' if e.code in (401, 403, 404) else e.reason})"
    except Exception as e:
        return None, str(e)

    return {
        "topics": meta.get("topics", []),
        "language": meta.get("language"),
        "description": meta.get("description"),
        "readme": readme,
    }, None


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "usage: fetch_repo.py <github-url-or-owner/repo>"}))
        sys.exit(1)

    try:
        owner, repo = parse_owner_repo(sys.argv[1])
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    data, gh_err = try_gh(owner, repo)
    source = "gh"
    if data is None:
        data, api_err = try_public_api(owner, repo)
        source = "api"
        if data is None:
            print(json.dumps({
                "owner": owner, "repo": repo, "error":
                    f"ดึงข้อมูลไม่สำเร็จทั้ง gh CLI ({gh_err}) และ public API ({api_err})",
            }))
            sys.exit(1)

    print(json.dumps({
        "owner": owner, "repo": repo, "source": source, "error": None, **data,
    }))


if __name__ == "__main__":
    main()
