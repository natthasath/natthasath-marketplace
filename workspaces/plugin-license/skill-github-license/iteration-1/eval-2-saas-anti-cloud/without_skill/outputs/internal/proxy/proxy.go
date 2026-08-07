// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Acme Co., Ltd.
//
// Use of this file is governed by the Business Source License 1.1 in the
// LICENSE file at the root of this repository. On the Change Date it becomes
// available under the Apache License, Version 2.0.

package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"go.uber.org/zap"
)

type Proxy struct {
	upstream *url.URL
	log      *zap.Logger
}

func New(upstream string, log *zap.Logger) (*Proxy, error) {
	u, err := url.Parse(upstream)
	if err != nil {
		return nil, err
	}
	return &Proxy{upstream: u, log: log}, nil
}

func (p *Proxy) Handler() http.Handler {
	return httputil.NewSingleHostReverseProxy(p.upstream)
}
