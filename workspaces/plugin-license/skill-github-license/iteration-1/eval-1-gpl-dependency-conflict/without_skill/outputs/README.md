# 🎉 invoice-report

Generate branded PDF invoices with embedded QR payment codes.

### 🏆 Usage

```shell
npm start -- --input orders.json --out ./invoices
```

### 📄 License

The first-party source in this repository (`src/`) is released under the
[MIT License](LICENSE) — Copyright (c) 2026 Natthasath Saksri.

> [!WARNING]
> **This repository as a whole cannot currently be distributed under MIT.**
> It bundles `vendor/libqr` (`libqr` 2.1.0), which is licensed
> **GPL-3.0-only** ([`vendor/libqr/LICENSE`](vendor/libqr/LICENSE)) with no
> linking exception. `src/index.js` calls it via `require("libqr")`, so any
> copy you publish, ship, or hand to a customer is a combined work and the
> GPL-3.0 terms attach to that whole distribution — including the obligation
> to offer the complete corresponding source under GPL-3.0.
>
> Using it privately, in-house, without distributing it is unaffected.
>
> To make the project genuinely MIT end-to-end, replace `vendor/libqr` with a
> permissively licensed QR library (e.g. one under MIT/Apache-2.0), then
> change the `license` field in `package.json` back to plain `"MIT"`.

`package.json` therefore declares `MIT AND GPL-3.0-only`, which describes what
is actually in the tree today rather than claiming MIT over GPL code.

Licenses of the registry dependencies (`pdfkit`, `dayjs`) were **not** verified
— there is no `node_modules/` or lockfile in this repository to read them from.
