/* mini-http: HttpClient thu nhỏ (cùng API: get/post/put/delete, params, headers, observe, interceptor,
   HttpErrorResponse) chạy trên mini-rx, kèm "máy chủ giả" trong trang và HttpTestingController giả. */
globalThis.MiniHttp = (function () {
  const R = globalThis.Rx;
  const STATUS = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 500: 'Internal Server Error', 0: 'Unknown Error' };

  class HttpHeaders {
    constructor(init = {}) { this.map = new Map(Object.entries(init).map(([k, v]) => [k.toLowerCase(), v])); }
    keys() { return [...this.map.keys()]; }
    get(k) { const v = this.map.get(k.toLowerCase()); return v === undefined ? null : v; }
    has(k) { return this.map.has(k.toLowerCase()); }
  }
  class HttpResponse {
    constructor({ body = null, status = 200, statusText, headers = {}, url = null } = {}) {
      Object.assign(this, { body, status, statusText: statusText || STATUS[status] || '', headers: new HttpHeaders(headers), url, ok: status >= 200 && status < 300 });
    }
  }
  class HttpErrorResponse {
    constructor({ status = 0, statusText, url = null, error = null, headers = {} } = {}) {
      Object.assign(this, { name: 'HttpErrorResponse', status, statusText: statusText || STATUS[status] || '', url, error, headers: new HttpHeaders(headers), ok: false });
      this.message = status === 0 ? `Http failure response for ${url}: 0 ${this.statusText}` : `Http failure response for ${url}: ${status} ${this.statusText}`;
    }
  }
  class HttpRequest {
    constructor(method, url, body = null, headers = {}, params = {}) { Object.assign(this, { method, url, body, headers, params }); }
    get urlWithParams() {
      const q = Object.entries(this.params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      return q ? this.url + (this.url.includes('?') ? '&' : '?') + q : this.url;
    }
    clone(u = {}) { return new HttpRequest(u.method || this.method, u.url || this.url, 'body' in u ? u.body : this.body, { ...this.headers, ...(u.setHeaders || {}) }, { ...this.params, ...(u.setParams || {}) }); }
  }

  class HttpClient {
    constructor(handler) { this.handler = handler; }
    request(method, url, body, opts = {}) {
      const req = new HttpRequest(method, url, body, opts.headers || {}, opts.params || {});
      const obs = R.of(req).pipe(R.concatMap(r => this.handler(r)));      // lazy: interceptor chạy mỗi lần subscribe
      return opts.observe === 'response' ? obs : obs.pipe(R.map(r => r.body));
    }
    get(url, o) { return this.request('GET', url, null, o); }
    post(url, body, o) { return this.request('POST', url, body, o); }
    put(url, body, o) { return this.request('PUT', url, body, o); }
    patch(url, body, o) { return this.request('PATCH', url, body, o); }
    delete(url, o) { return this.request('DELETE', url, null, o); }
  }
  class HttpTestingController { }

  /* ---- máy chủ giả ---- */
  class FakeBackend {
    constructor({ latency = 300 } = {}) { this.latency = latency; this.reset(); }
    reset() { this.flaky = 0; this.nextId = 4; this.races = [{ id: 1, name: 'London', ponies: 6 }, { id: 2, name: 'Lyon', ponies: 5 }, { id: 3, name: 'Paris', ponies: 8 }]; }
    handle = req => new R.Observable(o => {
      let done = false;
      const r = this.route(req);
      const id = setTimeout(() => {
        done = true;
        if (r.status >= 200 && r.status < 400) { o.next(new HttpResponse({ body: JSON.parse(JSON.stringify(r.body === undefined ? null : r.body)), status: r.status, headers: { 'content-type': 'application/json' }, url: req.urlWithParams })); o.complete(); }
        else o.error(new HttpErrorResponse({ status: r.status, url: req.urlWithParams, error: r.body }));
      }, r.latency != null ? r.latency : this.latency);
      return () => { if (!done) clearTimeout(id); };
    });
    route(req) {
      const url = new URL(req.urlWithParams, 'http://x'), path = url.pathname, m = req.method;
      let mm;
      if (path === '/api/races' && m === 'GET') {
        let list = this.races.slice(); const sort = url.searchParams.get('sort'), page = +url.searchParams.get('page');
        if (sort === 'ascending') list.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === 'descending') list.sort((a, b) => b.name.localeCompare(a.name));
        if (page) list = list.slice((page - 1) * 2, page * 2);
        return { status: 200, body: list };
      }
      if (path === '/api/races' && m === 'POST') {
        if (!req.body || !String(req.body.name || '').trim()) return { status: 400, body: { error: 'name is required' } };
        const race = { id: this.nextId++, ponies: 0, ...req.body }; this.races.push(race); return { status: 201, body: race };
      }
      if ((mm = /^\/api\/races\/(\d+)$/.exec(path))) {
        const i = this.races.findIndex(r => r.id === +mm[1]);
        if (i < 0) return { status: 404, body: { error: 'race not found' } };
        if (m === 'GET') return { status: 200, body: this.races[i] };
        if (m === 'PUT') { this.races[i] = { ...this.races[i], ...req.body, id: +mm[1] }; return { status: 200, body: this.races[i] }; }
        if (m === 'DELETE') { this.races.splice(i, 1); return { status: 204, body: null }; }
      }
      if (path === '/api/secret') return req.headers.Authorization === 'Bearer ninja-token' ? { status: 200, body: { secret: 'Pony n°7 va gagner 🏆' } } : { status: 401, body: { error: 'Unauthorized' } };
      if (path === '/api/flaky') return (this.flaky++ % 3) < 2 ? { status: 500, body: { error: 'temporary failure' }, latency: 200 } : { status: 200, body: { ok: true, message: 'cette fois ça marche' } };
      if (path === '/api/slow') return { status: 200, body: { done: true }, latency: 3000 };
      return { status: 404, body: { error: 'no such endpoint' } };
    }
  }
  /* ---- backend thật qua fetch (huỷ được nhờ AbortController) ---- */
  const fetchBackend = req => new R.Observable(o => {
    const ac = new AbortController();
    fetch(req.urlWithParams, { method: req.method, headers: req.headers, body: req.body ? JSON.stringify(req.body) : undefined, signal: ac.signal })
      .then(async r => {
        let body = null; try { body = await r.json(); } catch (e) { /* không phải JSON */ }
        if (r.ok) { o.next(new HttpResponse({ body, status: r.status, url: r.url, headers: { 'content-type': r.headers.get('content-type') } })); o.complete(); }
        else o.error(new HttpErrorResponse({ status: r.status, statusText: r.statusText, url: r.url, error: body }));
      })
      .catch(e => { if (e.name !== 'AbortError') o.error(new HttpErrorResponse({ status: 0, url: req.urlWithParams, error: e })); });
    return () => ac.abort();
  });

  function createClient({ backend, interceptors = [] } = {}) {
    const last = backend && backend.handle ? backend.handle : backend;
    const handler = interceptors.reduceRight((next, ic) => req => ic.intercept(req, { handle: next }), last);
    return new HttpClient(handler);
  }

  /* ---- HttpTestingController ---- */
  function testing() {
    let open = [];
    const handler = req => new R.Observable(o => {
      const tr = {
        request: req,
        flush(body, opts = {}) {
          const status = opts.status || 200; open = open.filter(x => x !== tr);
          if (status >= 200 && status < 400) { o.next(new HttpResponse({ body, status, statusText: opts.statusText, url: req.urlWithParams })); o.complete(); }
          else o.error(new HttpErrorResponse({ status, statusText: opts.statusText, url: req.urlWithParams, error: body }));
        },
        error(err) { open = open.filter(x => x !== tr); o.error(new HttpErrorResponse({ status: 0, url: req.urlWithParams, error: err })); }
      };
      open.push(tr);
      return () => { open = open.filter(x => x !== tr); };
    });
    const match = m => (typeof m === 'string' ? open.filter(t => t.request.urlWithParams === m) : open.filter(t => m(t.request)));
    const label = m => (typeof m === 'string' ? `Match URL: ${m}` : 'Match by function');
    const controller = Object.assign(new HttpTestingController(), {
      expectOne(m) {
        const found = match(m);
        if (found.length !== 1) throw new Error(`Expected one matching request for criteria "${label(m)}", found ${found.length}.`);
        open = open.filter(x => x !== found[0]); return found[0];
      },
      expectNone(m) { const f = match(m); if (f.length) throw new Error(`Expected zero matching requests for criteria "${label(m)}", found ${f.length}.`); },
      verify() { if (open.length) throw new Error(`Expected no open requests, found ${open.length}: ${open.map(t => t.request.method + ' ' + t.request.urlWithParams).join(', ')}`); }
    });
    return { client: new HttpClient(handler), controller };
  }

  return { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpErrorResponse, HttpTestingController, FakeBackend, fetchBackend, createClient, testing };
})();
