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
