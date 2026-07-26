"""Local cache + daily quota tracker for the Microsoft Clarity Data Export API.

Clarity's API allows only 10 requests per day per project (UTC calendar day),
with a maximum 3-day lookback and 3 dimensions per request. Because Claude
calls the Clarity MCP tools directly (this script never touches the API
itself), the only way to avoid silently burning through that quota is to
make every call go through a local cache and log first.

Usage:
    python clarity_cache.py check --project <project-id> --query '<json>'
    python clarity_cache.py store --project <project-id> --query '<json>' --data-file result.json
    python clarity_cache.py quota --project <project-id>

`check` exits 0 and prints the cached JSON on a hit; exits 1 and prints
"MISS" on a miss (including if the cached entry is from a previous UTC day).
`store` saves the response and appends one line to today's quota log — call
it immediately after a REAL Clarity MCP tool call, never after a cache hit.
`quota` reports how many of today's 10 requests have been used.
"""
import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

DAILY_LIMIT = 10
CACHE_ROOT = Path.home() / ".insight-clarity-cache"


def today_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def query_hash(query):
    normalized = json.dumps(json.loads(query), sort_keys=True)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


def project_dir(project):
    d = CACHE_ROOT / project
    d.mkdir(parents=True, exist_ok=True)
    return d


def cache_path(project, query):
    return project_dir(project) / f"{today_str()}_{query_hash(query)}.json"


def log_path(project):
    return project_dir(project) / f"{today_str()}_quota.jsonl"


def cmd_check(args):
    path = cache_path(args.project, args.query)
    if path.exists():
        print(path.read_text(encoding="utf-8"))
        return 0
    print("MISS")
    return 1


def cmd_store(args):
    data = Path(args.data_file).read_text(encoding="utf-8")
    cache_path(args.project, args.query).write_text(data, encoding="utf-8")
    with open(log_path(args.project), "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "query": json.loads(args.query),
        }) + "\n")
    used = count_used(args.project)
    print(f"Stored. {used}/{DAILY_LIMIT} requests used today (UTC), {max(0, DAILY_LIMIT - used)} remaining.")
    return 0


def count_used(project):
    path = log_path(project)
    if not path.exists():
        return 0
    return sum(1 for _ in path.open(encoding="utf-8"))


def cmd_quota(args):
    used = count_used(args.project)
    remaining = max(0, DAILY_LIMIT - used)
    print(f"{used}/{DAILY_LIMIT} requests used today (UTC), {remaining} remaining.")
    return 0 if remaining > 0 else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_check = sub.add_parser("check", help="Look up a cached response for today")
    p_check.add_argument("--project", required=True)
    p_check.add_argument("--query", required=True, help="JSON-encoded query parameters")
    p_check.set_defaults(func=cmd_check)

    p_store = sub.add_parser("store", help="Cache a fresh API response and log quota usage")
    p_store.add_argument("--project", required=True)
    p_store.add_argument("--query", required=True, help="JSON-encoded query parameters")
    p_store.add_argument("--data-file", required=True, help="Path to a file containing the raw API response")
    p_store.set_defaults(func=cmd_store)

    p_quota = sub.add_parser("quota", help="Show today's quota usage")
    p_quota.add_argument("--project", required=True)
    p_quota.set_defaults(func=cmd_quota)

    args = parser.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
