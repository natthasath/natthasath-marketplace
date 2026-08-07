# Licensing FAQ

go-gateway is licensed under the **Business Source License 1.1 (BUSL-1.1)**.
This page explains what that means and why it was chosen. The [LICENSE](LICENSE)
file is the binding document; this page is only a plain-language guide.

---

## The short version

- The source is public. Anyone can read it, fork it, modify it, and contribute.
- You can run it in production, commercially, for your own products and
  infrastructure — that is explicitly granted.
- You **cannot** take it and sell it back to the world as a hosted or managed
  API gateway service.
- On **2030-08-07** the code converts automatically to **Apache 2.0** and every
  restriction disappears. Later releases carry their own Change Date, which
  Acme advances at each release and which the license caps at four years after
  that version's first public distribution.

---

## Why BUSL and not something else

| License | Blocks a managed-service competitor? | Truly open source? | Verdict |
|---|---|---|---|
| **BUSL-1.1** | ✅ Yes, by the Additional Use Grant | ⏳ Becomes Apache 2.0 on the Change Date | **Chosen** |
| FSL-1.1-Apache-2.0 | ✅ Yes | ⏳ Becomes Apache 2.0 after 2 years | Strong runner-up |
| AGPL-3.0 | ❌ No — a provider can host it unmodified | ✅ Yes | Rejected: does not solve the stated problem |
| Elastic License 2.0 | ✅ Yes | ❌ Never converts | Rejected: no path back to openness |
| SSPL-1.0 | ✅ Yes, aggressively | ❌ No | Rejected: reputational cost, distros will not package it |
| MIT / Apache-2.0 | ❌ No | ✅ Yes | Rejected: no protection at all |

The frequent misunderstanding worth stating plainly: **AGPL does not stop a
cloud provider from offering your software as a managed service.** AGPL's
network clause only forces them to publish their *modifications*. Running
go-gateway unmodified as a paid service would be fully AGPL-compliant. AGPL
deters large providers by policy and reputation, not by its text. If the goal
is to actually prohibit that use, the restriction has to be written down —
which is what BUSL does.

BUSL was preferred over FSL mainly on recognition: MariaDB, HashiCorp,
Couchbase, Sentry, and Materialize have all shipped under it, so enterprise
legal teams already have a review precedent. FSL is a good, simpler
alternative if a shorter document and a two-year conversion are preferred.

---

## Common questions

**Is this open source?**
No. BUSL-1.1 is *source-available*. It is not OSI-approved. Please describe the
project as "source-available" rather than "open source" — the accuracy matters
to a lot of people, and getting it wrong is the fastest way to a bad thread.

**Can my company run go-gateway in production?**
Yes. The Additional Use Grant permits production use, including commercial use,
for operating your own applications, APIs, and internal infrastructure.

**Can my SaaS product use go-gateway to route its own traffic?**
Yes. Your product is not an API gateway service — go-gateway is a component
inside it.

**Can a cloud provider offer "Managed go-gateway"?**
Not without a commercial license from Acme Co., Ltd. Contact
licensing@acme.example.

**What happens on the Change Date?**
Version by version, the code becomes available under Apache 2.0. This is
automatic and irrevocable. The Change Date can be moved *earlier* by Acme, but
never later than four years after a version's first public release — that cap
is built into the license itself.

**Will accepting the license restrict my contributions later?**
No. Everything you contribute becomes Apache 2.0 on schedule alongside the rest
of the code.

**Are the dependencies compatible?**
Yes. `chi` (MIT), `go-redis` (BSD-2-Clause), and `zap` (MIT) are all permissive
and place no conditions on the terms under which go-gateway is distributed. See
[NOTICE](NOTICE).

---

## Operational notes for maintainers

- **Every release needs its Change Date reviewed.** BUSL applies per version.
  When cutting a release, either advance the Change Date to four years out or
  leave it as-is deliberately.
- **The CLA is load-bearing.** Because Acme is the licensor of a non-OSI
  license, inbound contributions must be assigned or broadly licensed to Acme,
  or Acme cannot sell commercial exceptions, dual-license, or move the Change
  License later. See [CONTRIBUTING.md](CONTRIBUTING.md).
- **This document is not legal advice.** Before the first public release, have
  the Additional Use Grant reviewed by counsel — its wording is the entire
  protection, and it is the part of BUSL that projects most often get wrong.
