# Contributing to go-gateway

Thanks for your interest. Issues, discussions, and pull requests are all
welcome.

## Before you start

go-gateway is **source-available** under the
[Business Source License 1.1](LICENSE), not open source. Please read
[LICENSING.md](LICENSING.md) so there are no surprises about what you can and
cannot do with the code. Every version converts to Apache 2.0 on its Change
Date, so your contribution does become open source — on a schedule.

## Contributor License Agreement (CLA)

All contributors must agree to the [CLA](CLA.md) before their first pull
request is merged. In short, you keep the copyright in your contribution and
grant Acme Co., Ltd. a broad licence to use, relicense, and distribute it.

This is required because Acme is the licensor of a non-OSI licence. Without it,
Acme could not sell commercial exceptions, dual-licence the project, or bring
the Change Date forward — all of which are things the project needs to be able
to do.

To agree, add a line to your first pull request:

```
I have read and agree to the CLA in CLA.md.
```

Every commit must also carry a `Signed-off-by:` trailer (`git commit -s`),
certifying the [Developer Certificate of Origin](https://developercertificate.org/).

## Development

```shell
go build ./...
go test ./...
go vet ./...
gofmt -l .
```

## Pull requests

- One logical change per pull request.
- Include tests for behaviour changes.
- New source files should carry the SPDX header:

  ```go
  // SPDX-License-Identifier: BUSL-1.1
  // Copyright (c) 2026 Acme Co., Ltd.
  ```

- Do not add dependencies under copyleft licences (GPL, AGPL, LGPL) or under
  other source-available licences without raising an issue first — they can
  conflict with the terms under which go-gateway is distributed. Permissive
  licences (MIT, BSD, Apache-2.0, ISC) are fine.

## Security

Please do not open public issues for security problems. Email
security@acme.example instead.
