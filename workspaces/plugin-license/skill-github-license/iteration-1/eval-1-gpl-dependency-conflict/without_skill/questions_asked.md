# Questions I would have asked

I could not ask interactively, so these are the open questions, followed by the
call I made in the absence of answers.

## 1. Do you actually distribute this repo, or is it in-house only?

GPL-3.0 obligations attach on **distribution** (publishing to npm/GitHub,
shipping a build to a customer, handing over a tarball). If `invoice-report`
only ever runs on your own machines and is never conveyed to a third party,
the GPL-3.0 dependency imposes no source-disclosure duty and the question is
mostly cosmetic.

**Assumption made:** you intend to publish it (you asked for a license file on
"this repo", which usually means it is going somewhere public). So I treated
distribution as the case to be safe against.

## 2. Is `vendor/libqr` replaceable with a permissively licensed QR library?

`vendor/libqr/index.js` is a three-line stub that throws
`"native binding not built"`, so the vendored copy in the tree does no real
work as it stands. If the real `libqr` can be swapped for an MIT/Apache-2.0 QR
renderer, the conflict disappears entirely and the repo becomes cleanly MIT.

**Assumption made:** I did not swap or remove it — that is a code change you did
not ask for, and I have no network access to pick a replacement. I flagged it as
the recommended fix instead.

## 3. Is the `GPL-3.0-only` label on the vendored copy accurate?

`vendor/libqr/package.json` says `"license": "GPL-3.0-only"` and the full
GPL-3 text sits in `vendor/libqr/LICENSE`. There is no linking exception and no
dual-licensing note. But a vendored copy can be stale, or you may hold a
separate commercial license from the upstream author.

**Assumption made:** the license files present in the tree govern. That is also
what the task scoped me to — determine licenses from files present.

## 4. Do you want the root `LICENSE` to cover only your code, or the whole tree?

**Assumption made:** only your first-party code (`src/`). The root `LICENSE` is
standard unmodified MIT text (so GitHub/npm license detection still works), and
the scope limitation plus the GPL warning live in `README.md`.

## 5. Should `package.json` say `"MIT"`?

**Assumption made: no — and this is the one judgment call I would most want you
to review.** I set it to the SPDX expression `"MIT AND GPL-3.0-only"`. A bare
`"MIT"` is the string npm, GitHub, and every downstream license scanner read as
"this package is MIT", and this package ships GPL-3.0-only code that its own
entry point `require()`s. Writing plain `"MIT"` there would be an inaccurate
claim about the distributable artifact, not just a stylistic choice.

If you confirm you never distribute it, or you replace `libqr`, plain `"MIT"`
becomes correct and it is a one-line change.

## 6. Copyright year?

**Assumption made:** `2026` (current year). Adjust to the year of first
publication, or to a range like `2024-2026`, if the project is older.
