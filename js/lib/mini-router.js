/* mini-router: bộ định tuyến thu nhỏ mô phỏng Angular Router (cấu hình Routes, tham số :id, matrix/query params,
   redirect + pathMatch, children, route rỗng, '**', guard canActivate, resolver, lazy loadChildren, sự kiện điều hướng).
   Chỉ giữ trạng thái trong bộ nhớ — không đụng tới URL thật của trang. */
globalThis.MiniRouter = (function () {
  const R = globalThis.Rx;
  const first = v => {
    if (v && typeof v.subscribe === 'function') return new Promise((res, rej) => { let got = false; const s = v.subscribe({ next: x => { if (!got) { got = true; res(x); setTimeout(() => s && s.unsubscribe && s.unsubscribe(), 0); } }, error: rej, complete: () => { if (!got) rej(new Error('EmptyError: no elements in sequence')); } }); });
    return Promise.resolve(v);
  };

  class Router {
    constructor(config) { this.config = config; this.events = new R.Subject(); this.url = null; this.state = null; this.prevState = null; this.navId = 0; }
    emit(e) { this.events.next({ ...e }); }

    /* ---- URL ---- */
    parseUrl(str) {
      const [path, qs] = str.split('?'); const query = {};
      if (qs) qs.split('&').filter(Boolean).forEach(p => { const [k, v] = p.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
      const segments = path.split('/').filter(Boolean).map(s => {
        const [p, ...m] = s.split(';'); const params = {}; m.forEach(x => { const [k, v] = x.split('='); params[k] = v; });
        return { path: decodeURIComponent(p), params };
      });
      return { __urlTree: true, url: str, segments, query, toString() { return str; } };
    }
    serialize(segments, query) {
      const p = '/' + segments.map(s => encodeURIComponent(s.path) + Object.entries(s.params || {}).map(([k, v]) => `;${k}=${v}`).join('')).join('/');
      const q = Object.entries(query || {}).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      return p + (q ? '?' + q : '');
    }
    createUrlTree(commands, { queryParams } = {}) {
      const segs = [];
      commands.forEach(c => {
        if (c && typeof c === 'object') { const last = segs[segs.length - 1]; if (last) Object.assign(last.params, c); }
        else String(c).split('/').filter(Boolean).forEach(p => segs.push({ path: p, params: {} }));
      });
      return this.serialize(segs, queryParams);
    }
    navigate(commands, extras) { return this.navigateByUrl(this.createUrlTree(commands, extras)); }

    /* ---- nhận diện route ---- */
    async match(routes, segs, ctx) {
      for (const route of routes) { const r = await this.tryRoute(route, segs, ctx); if (r) return r; }
      return null;
    }
    async tryRoute(route, segs, ctx) {
      let consumed, params = {};
      if (route.path === '**') consumed = segs.length;
      else {
        const pat = route.path.split('/').filter(Boolean);
        if (pat.length > segs.length) return null;
        for (let i = 0; i < pat.length; i++) {
          if (pat[i].startsWith(':')) params[pat[i].slice(1)] = segs[i].path;
          else if (pat[i] !== segs[i].path) return null;
        }
        consumed = pat.length;
        if (consumed) Object.assign(params, segs[consumed - 1].params);          // matrix params của segment cuối
      }
      const rest = segs.slice(consumed), consumedPaths = segs.slice(0, consumed).map(s => s.path);
      if (route.redirectTo != null) {
        if (route.pathMatch === 'full' && rest.length) return null;
        const target = route.redirectTo.startsWith('/')
          ? route.redirectTo.split('/').filter(Boolean) : [...ctx.parentPath, ...route.redirectTo.split('/').filter(Boolean)];
        return { redirect: '/' + [...target, ...rest.map(s => s.path)].join('/'), from: route };
      }
      if (route.pathMatch === 'full' && rest.length) return null;
      let children = route.children;
      if (route.loadChildren && !route.__loaded) {
        this.emit({ type: 'RouteConfigLoadStart', route: route.path });
        children = await route.loadChildren(); route.children = children; route.__loaded = true;
        this.emit({ type: 'RouteConfigLoadEnd', route: route.path });
      }
      const node = { route, params, segs: segs.slice(0, consumed) };
      if (children) {
        const sub = await this.match(children, rest, { parentPath: [...ctx.parentPath, ...consumedPaths] });
        if (!sub) return null; if (sub.redirect) return sub;
        return { chain: [node, ...sub.chain] };
      }
      if (rest.length) return null;
      return { chain: [node] };
    }

    /* ---- điều hướng ---- */
    async navigateByUrl(urlStr) {
      const id = ++this.navId;
      this.emit({ type: 'NavigationStart', id, url: urlStr });
      const cancel = reason => { this.emit({ type: 'NavigationCancel', id, url: urlStr, reason }); return false; };
      let tree = this.parseUrl(urlStr), result = null;
      for (let d = 0; d < 10; d++) {
        result = await this.match(this.config, tree.segments, { parentPath: [] });
        if (id !== this.navId) return cancel('Đã có điều hướng mới thay thế (navigation id ' + id + ' ≠ ' + this.navId + ')');
        if (result && result.redirect) { this.emit({ type: 'Redirect', id, from: tree.url, to: result.redirect }); tree = this.parseUrl(result.redirect + (Object.keys(tree.query).length ? '?' + Object.entries(tree.query).map(([k, v]) => k + '=' + v).join('&') : '')); continue; }
        break;
      }
      if (!result) { this.emit({ type: 'NavigationError', id, url: urlStr, error: `Cannot match any routes. URL Segment: '${tree.segments.map(s => s.path).join('/')}'` }); return false; }
      const chain = result.chain.map(n => ({ ...n, data: { ...(n.route.data || {}) } }));
      this.emit({ type: 'RoutesRecognized', id, url: tree.url });
      const snap = n => ({ params: n.params, paramMap: { get: k => (k in n.params ? n.params[k] : null) }, data: n.data, queryParams: tree.query });
      const stateInfo = { url: tree.url };
      this.emit({ type: 'GuardsCheckStart', id });
      for (const n of chain) for (const g of (n.route.canActivate || [])) {
        const res = await first(g(snap(n), stateInfo));
        if (id !== this.navId) return cancel('Điều hướng bị thay thế khi đang kiểm tra guard');
        if (res === false) return cancel('Guard canActivate trả về false');
        if (res && res.__urlTree) { cancel('Guard chuyển hướng tới ' + res.url); this.navigateByUrl(res.url); return false; }
      }
      this.emit({ type: 'GuardsCheckEnd', id, shouldActivate: true });
      for (const n of chain) if (n.route.resolve) {
        this.emit({ type: 'ResolveStart', id });
        for (const [k, fn] of Object.entries(n.route.resolve)) {
          try { n.data[k] = await first(fn(snap(n), stateInfo)); }
          catch (e) { this.emit({ type: 'NavigationError', id, url: urlStr, error: `Resolver '${k}' thất bại: ${e && e.message ? e.message : e}` }); return false; }
        }
        this.emit({ type: 'ResolveEnd', id });
      }
      if (id !== this.navId) return cancel('Đã có điều hướng mới thay thế (navigation id ' + id + ' ≠ ' + this.navId + ')');
      this.prevState = this.state; this.url = tree.url;
      this.state = { chain: chain.map(n => ({ route: n.route, params: n.params, data: n.data })), query: tree.query, url: tree.url };
      this.emit({ type: 'NavigationEnd', id, url: tree.url });
      return true;
    }
  }
  return { Router };
})();
