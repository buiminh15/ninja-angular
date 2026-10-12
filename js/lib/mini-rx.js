/* mini-rx: một bản RxJS thu nhỏ (~150 dòng) để chạy ví dụ ngay trong trang, không cần Internet.
   API trùng tên với RxJS: Observable, of, from, range, interval, timer, fromEvent, merge, throwError,
   Subject, BehaviorSubject, EventEmitter và các operator map/filter/take/tap/scan/reduce/
   debounceTime/delay/distinctUntilChanged/switchMap/catchError/startWith. */
globalThis.Rx = (function () {
  class Observable {
    constructor(subscribeFn) { this._sub = subscribeFn; }
    subscribe(observer) {
      const o = typeof observer === 'function' ? { next: observer } : (observer || {});
      let closed = false, teardown = null;
      const finish = () => { closed = true; if (teardown) { const t = teardown; teardown = null; t(); } };
      const safe = {
        next: v => { if (!closed && o.next) o.next(v); },
        error: e => { if (closed) return; closed = true; try { o.error ? o.error(e) : console.error('Unhandled error', e); } finally { finish(); } },
        complete: () => { if (closed) return; closed = true; try { o.complete && o.complete(); } finally { finish(); } },
        get closed() { return closed; }
      };
      try { const r = this._sub(safe); teardown = typeof r === 'function' ? r : (r && r.unsubscribe ? () => r.unsubscribe() : null); } catch (e) { safe.error(e); }
      if (closed) finish();
      return { get closed() { return closed; }, unsubscribe() { if (!closed) finish(); } };
    }
    pipe(...ops) { return ops.reduce((src, op) => op(src), this); }
  }
  const make = f => new Observable(f);

  /* ----- creation ----- */
  const of = (...vals) => make(o => { vals.forEach(v => o.next(v)); o.complete(); });
  const from = src => make(o => {
    if (src && typeof src.then === 'function') { src.then(v => { o.next(v); o.complete(); }, e => o.error(e)); return; }
    for (const v of src) { if (o.closed) return; o.next(v); } o.complete();
  });
  const range = (start, count) => make(o => { for (let i = 0; i < count; i++) o.next(start + i); o.complete(); });
  const interval = ms => make(o => { let i = 0; const id = setInterval(() => o.next(i++), ms); return () => clearInterval(id); });
  const timer = (ms, period) => make(o => {
    let i = 0, id2;
    const id = setTimeout(() => { o.next(i++); if (period == null) o.complete(); else id2 = setInterval(() => o.next(i++), period); }, ms);
    return () => { clearTimeout(id); clearInterval(id2); };
  });
  const fromEvent = (el, name) => make(o => { const h = e => o.next(e); el.addEventListener(name, h); return () => el.removeEventListener(name, h); });
  const merge = (...srcs) => make(o => {
    let left = srcs.length; const subs = srcs.map(s => s.subscribe({ next: v => o.next(v), error: e => o.error(e), complete: () => { if (--left === 0) o.complete(); } }));
    return () => subs.forEach(s => s.unsubscribe());
  });
  const throwError = e => make(o => o.error(e));
  const EMPTY = make(o => o.complete());

  /* ----- operators ----- */
  const op = f => src => make(o => src.subscribe(f(o)));
  const map = fn => op(o => { let i = 0; return { next: v => { let r; try { r = fn(v, i++); } catch (e) { return o.error(e); } o.next(r); }, error: e => o.error(e), complete: () => o.complete() }; });
  const filter = fn => op(o => { let i = 0; return { next: v => { let ok; try { ok = fn(v, i++); } catch (e) { return o.error(e); } if (ok) o.next(v); }, error: e => o.error(e), complete: () => o.complete() }; });
  const tap = fn => op(o => ({ next: v => { fn(v); o.next(v); }, error: e => o.error(e), complete: () => o.complete() }));
  const take = n => src => make(o => {
    if (n <= 0) { o.complete(); return; }
    let c = 0; const s = src.subscribe({ next: v => { o.next(v); if (++c >= n) o.complete(); }, error: e => o.error(e), complete: () => o.complete() });
    return () => s.unsubscribe();
  });
  const scan = (fn, seed) => op(o => { let acc = seed, i = 0; return { next: v => { acc = fn(acc, v, i++); o.next(acc); }, error: e => o.error(e), complete: () => o.complete() }; });
  const reduce = (fn, seed) => src => make(o => {
    let acc = seed, i = 0;
    const s = src.subscribe({ next: v => { acc = fn(acc, v, i++); }, error: e => o.error(e), complete: () => { o.next(acc); o.complete(); } });
    return () => s.unsubscribe();
  });
  const distinctUntilChanged = () => src => make(o => {
    let has = false, last; const s = src.subscribe({ next: v => { if (!has || v !== last) { has = true; last = v; o.next(v); } }, error: e => o.error(e), complete: () => o.complete() });
    return () => s.unsubscribe();
  });
  const startWith = v => src => make(o => { o.next(v); const s = src.subscribe(o); return () => s.unsubscribe(); });
  const delay = ms => src => make(o => {
    const ids = new Set(); const later = f => { const id = setTimeout(() => { ids.delete(id); f(); }, ms); ids.add(id); };
    const s = src.subscribe({ next: v => later(() => o.next(v)), error: e => o.error(e), complete: () => later(() => o.complete()) });
    return () => { s.unsubscribe(); ids.forEach(clearTimeout); };
  });
  const debounceTime = ms => src => make(o => {
    let id = null, last, has = false;
    const s = src.subscribe({
      next: v => { last = v; has = true; clearTimeout(id); id = setTimeout(() => { has = false; o.next(last); }, ms); },
      error: e => { clearTimeout(id); o.error(e); },
      complete: () => { clearTimeout(id); if (has) o.next(last); o.complete(); }
    });
    return () => { clearTimeout(id); s.unsubscribe(); };
  });
  const switchMap = fn => src => make(o => {
    let inner = null, outerDone = false, idx = 0;
    const s = src.subscribe({
      next: v => {
        inner && inner.unsubscribe();                       // hủy "cuộc gọi" cũ
        const obs = fn(v, idx++);
        const innerObs = obs && typeof obs.subscribe === 'function' ? obs : from(obs);
        inner = innerObs.subscribe({ next: x => o.next(x), error: e => o.error(e), complete: () => { inner = null; if (outerDone) o.complete(); } });
      },
      error: e => o.error(e),
      complete: () => { outerDone = true; if (!inner) o.complete(); }
    });
    return () => { s.unsubscribe(); inner && inner.unsubscribe(); };
  });
  const catchError = fn => src => make(o => {
    let inner = null;
    const s = src.subscribe({ next: v => o.next(v), error: e => { try { inner = fn(e).subscribe(o); } catch (x) { o.error(x); } }, complete: () => o.complete() });
    return () => { s.unsubscribe(); inner && inner.unsubscribe(); };
  });


  /* ----- higher-order & combination (chương 22) ----- */
  const toObs = r => (r && typeof r.subscribe === 'function' ? r : from(r));
  const mergeMap = fn => src => make(o => {
    const inners = new Set(); let outerDone = false, idx = 0;
    const check = () => { if (outerDone && inners.size === 0) o.complete(); };
    const s = src.subscribe({
      next: v => { const sub = { u: null }; inners.add(sub); sub.u = toObs(fn(v, idx++)).subscribe({ next: x => o.next(x), error: e => o.error(e), complete: () => { inners.delete(sub); check(); } }); },
      error: e => o.error(e), complete: () => { outerDone = true; check(); }
    });
    return () => { s.unsubscribe(); inners.forEach(i => i.u && i.u.unsubscribe()); };
  });
  const concatMap = fn => src => make(o => {
    const queue = []; let active = null, outerDone = false, idx = 0;
    const next = () => {
      if (active) return;
      if (!queue.length) { if (outerDone) o.complete(); return; }
      const v = queue.shift();
      active = { u: null };
      active.u = toObs(fn(v, idx++)).subscribe({ next: x => o.next(x), error: e => o.error(e), complete: () => { active = null; next(); } });
    };
    const s = src.subscribe({ next: v => { queue.push(v); next(); }, error: e => o.error(e), complete: () => { outerDone = true; next(); } });
    return () => { s.unsubscribe(); active && active.u && active.u.unsubscribe(); };
  });
  const exhaustMap = fn => src => make(o => {
    let inner = null, outerDone = false, idx = 0;
    const s = src.subscribe({
      next: v => { if (inner) return; inner = toObs(fn(v, idx++)).subscribe({ next: x => o.next(x), error: e => o.error(e), complete: () => { inner = null; if (outerDone) o.complete(); } }); },
      error: e => o.error(e), complete: () => { outerDone = true; if (!inner) o.complete(); }
    });
    return () => { s.unsubscribe(); inner && inner.unsubscribe(); };
  });
  const shareReplay = (n = 1) => src => {
    let buf = [], observers = new Set(), srcSub = null, done = false, err, hasErr = false;
    return make(o => {
      buf.forEach(v => o.next(v));
      if (done) { hasErr ? o.error(err) : o.complete(); return; }
      observers.add(o);
      if (!srcSub) {
        srcSub = {};
        srcSub = src.subscribe({
          next: v => { buf.push(v); if (buf.length > n) buf.shift(); [...observers].forEach(x => x.next(v)); },
          error: e => { done = true; hasErr = true; err = e; [...observers].forEach(x => x.error(e)); },
          complete: () => { done = true; [...observers].forEach(x => x.complete()); }
        });
      }
      return () => observers.delete(o);
    });
  };
  const combineLatest = list => make(o => {
    const vals = new Array(list.length), has = new Array(list.length).fill(false); let done = 0;
    const subs = list.map((s, i) => s.subscribe({ next: v => { vals[i] = v; has[i] = true; if (has.every(Boolean)) o.next([...vals]); }, error: e => o.error(e), complete: () => { if (++done === list.length) o.complete(); } }));
    return () => subs.forEach(s => s.unsubscribe());
  });
  const forkJoin = list => make(o => {
    const vals = new Array(list.length), has = new Array(list.length).fill(false); let done = 0;
    const subs = list.map((s, i) => s.subscribe({ next: v => { vals[i] = v; has[i] = true; }, error: e => o.error(e), complete: () => { if (++done === list.length) { if (has.every(Boolean)) o.next([...vals]); o.complete(); } } }));
    return () => subs.forEach(s => s.unsubscribe());
  });
  const finalize = fn => src => make(o => { const s = src.subscribe(o); return () => { s.unsubscribe(); fn(); }; });
  const takeUntil = notifier => src => make(o => {
    const n = notifier.subscribe({ next: () => o.complete() });
    const s = src.subscribe(o);
    return () => { n.unsubscribe(); s.unsubscribe(); };
  });

  const retry = (n = Infinity) => src => make(o => {
    let left = n, sub = null;
    const go = () => { sub = src.subscribe({ next: v => o.next(v), error: e => { if (left-- <= 0) o.error(e); else go(); }, complete: () => o.complete() }); };
    go(); return () => sub && sub.unsubscribe();
  });

  /* ----- Subject & co ----- */
  class Subject extends Observable {
    constructor() { super(o => { this.observers.add(o); if (this.stopped) { this.err !== undefined ? o.error(this.err) : o.complete(); } return () => this.observers.delete(o); }); this.observers = new Set(); this.stopped = false; }
    next(v) { if (!this.stopped) [...this.observers].forEach(o => o.next(v)); }
    error(e) { if (this.stopped) return; this.stopped = true; this.err = e; [...this.observers].forEach(o => o.error(e)); }
    complete() { if (this.stopped) return; this.stopped = true; [...this.observers].forEach(o => o.complete()); }
    asObservable() { return make(o => this.subscribe(o)); }
  }
  class BehaviorSubject extends Subject {
    constructor(v) { super(); this.value = v; const base = this._sub; this._sub = o => { o.next(this.value); return base(o); }; }
    next(v) { this.value = v; super.next(v); }
    getValue() { return this.value; }
  }
  class EventEmitter extends Subject { emit(v) { this.next(v); } }

  return { Observable, of, from, range, interval, timer, fromEvent, merge, throwError, EMPTY, map, filter, tap, take, scan, reduce, distinctUntilChanged, startWith, delay, debounceTime, switchMap, catchError, Subject, BehaviorSubject, EventEmitter, mergeMap, concatMap, exhaustMap, shareReplay, combineLatest, forkJoin, finalize, takeUntil, retry };
})();
