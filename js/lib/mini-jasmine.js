/* mini-jasmine: Jasmine thu nhỏ + TestBed giả để chạy test ngay trong trang.
   API: describe/fdescribe/xdescribe, it/fit/xit, beforeEach/afterEach, expect (+ not),
   spyOn, jasmine.createSpyObj/any/objectContaining, TestBed (configureTestingModule, inject,
   createComponent, overrideTemplate), By. */
globalThis.MiniJasmine = function () {
  const pp = v => {
    if (typeof v === 'string') return `'${v}'`;
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return v.and ? 'Spy' : `Function ${v.name || ''}`.trim();
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return '[ ' + v.map(pp).join(', ') + ' ]';
    if (v instanceof Map) return `Map(${[...v].map(([k, x]) => pp(k) + ' => ' + pp(x))})`;
    if (v && typeof v === 'object') { const n = v.constructor && v.constructor.name !== 'Object' ? v.constructor.name + ' ' : ''; return n + '{ ' + Object.keys(v).map(k => `${k}: ${pp(v[k])}`).join(', ') + ' }'; }
    return String(v);
  };
  /* ---------- so sánh sâu ---------- */
  const asym = [];
  function eq(a, b) {
    if (b && b.__asym) return b.match(a);
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') return isNaN(a) && isNaN(b);
    if (a instanceof Date && b instanceof Date) return +a === +b;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => eq(v, b.get(k)));
      if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every(v => b.has(v));
      const ka = Object.keys(a), kb = Object.keys(b);
      return ka.length === kb.length && ka.every(k => k in b && eq(a[k], b[k]));
    }
    return false;
  }

  /* ---------- trạng thái ---------- */
  let failures = [], spies = [], current = null;
  const root = { type: 'suite', name: '', children: [], befores: [], afters: [], parent: null };
  let cur = root, focused = false;

  const jasmine = {
    any: T => ({ __asym: true, match: v => (T === String ? typeof v === 'string' : T === Number ? typeof v === 'number' : T === Boolean ? typeof v === 'boolean' : v instanceof T), toString: () => `<jasmine.any(${T.name})>` }),
    objectContaining: o => ({ __asym: true, match: v => v && Object.keys(o).every(k => eq(v[k], o[k])), toString: () => `<objectContaining ${pp(o)}>` }),
    createSpyObj: (name, methods) => {
      const o = {}; (Array.isArray(methods) ? methods : Object.keys(methods)).forEach(m => { o[m] = makeSpy(() => undefined, `${name}.${m}`); if (!Array.isArray(methods)) o[m].and.returnValue(methods[m]); }); return o;
    }
  };
  function makeSpy(orig, name) {
    let strategy = () => undefined; const log = [];
    const spy = function (...args) { const r = strategy.apply(this, args); log.push({ args, returnValue: r }); return r; };
    spy.and = {
      returnValue: v => { strategy = () => v; return spy; },
      returnValues: (...vs) => { let i = 0; strategy = () => vs[i++]; return spy; },
      callFake: f => { strategy = f; return spy; },
      callThrough: () => { strategy = function (...a) { return orig.apply(this, a); }; return spy; },
      throwError: e => { strategy = () => { throw (e instanceof Error ? e : new Error(e)); }; return spy; },
      stub: () => { strategy = () => undefined; return spy; }
    };
    spy.calls = { all: () => log.slice(), count: () => log.length, argsFor: i => log[i] && log[i].args, mostRecent: () => log[log.length - 1], first: () => log[0], reset: () => { log.length = 0; }, any: () => log.length > 0 };
    spy.__name = name; return spy;
  }
  function spyOn(obj, name) {
    if (!obj || typeof obj[name] !== 'function') throw new Error(`<spyOn> : ${name}() method does not exist`);
    const orig = obj[name], spy = makeSpy(orig, name);
    obj[name] = spy; spies.push(() => { obj[name] = orig; }); return spy;
  }

  /* ---------- expect ---------- */
  function expect(actual) {
    const mk = neg => {
      const check = (pass, msg, negMsg) => { if (neg ? pass : !pass) failures.push(neg ? negMsg : msg); };
      const m = {
        toBe: e => check(Object.is(actual, e) || actual === e, `Expected ${pp(actual)} to be ${pp(e)}.`, `Expected ${pp(actual)} not to be ${pp(e)}.`),
        toEqual: e => check(eq(actual, e), `Expected ${pp(actual)} to equal ${pp(e)}.`, `Expected ${pp(actual)} not to equal ${pp(e)}.`),
        toBeTruthy: () => check(!!actual, `Expected ${pp(actual)} to be truthy.`, `Expected ${pp(actual)} not to be truthy.`),
        toBeFalsy: () => check(!actual, `Expected ${pp(actual)} to be falsy.`, `Expected ${pp(actual)} not to be falsy.`),
        toBeNull: () => check(actual === null, `Expected ${pp(actual)} to be null.`, 'Expected value not to be null.'),
        toBeUndefined: () => check(actual === undefined, `Expected ${pp(actual)} to be undefined.`, 'Expected value not to be undefined.'),
        toBeDefined: () => check(actual !== undefined, 'Expected undefined to be defined.', 'Expected value not to be defined.'),
        toBeGreaterThan: e => check(actual > e, `Expected ${pp(actual)} to be greater than ${pp(e)}.`, `Expected ${pp(actual)} not to be greater than ${pp(e)}.`),
        toBeLessThan: e => check(actual < e, `Expected ${pp(actual)} to be less than ${pp(e)}.`, `Expected ${pp(actual)} not to be less than ${pp(e)}.`),
        toBeCloseTo: (e, d = 2) => check(Math.abs(actual - e) < Math.pow(10, -d) / 2, `Expected ${pp(actual)} to be close to ${pp(e)}.`, `Expected ${pp(actual)} not to be close to ${pp(e)}.`),
        toContain: e => check(actual && (typeof actual === 'string' ? actual.includes(e) : [...actual].some(x => eq(x, e))), `Expected ${pp(actual)} to contain ${pp(e)}.`, `Expected ${pp(actual)} not to contain ${pp(e)}.`),
        toMatch: re => check(new RegExp(re).test(actual), `Expected ${pp(actual)} to match ${re}.`, `Expected ${pp(actual)} not to match ${re}.`),
        toHaveSize: n => check(actual && (actual.length === n || actual.size === n), `Expected ${pp(actual)} to have size ${n}.`, `Expected ${pp(actual)} not to have size ${n}.`),
        toThrow: () => { let threw = false; try { actual(); } catch (e) { threw = true; } check(threw, 'Expected function to throw an exception.', 'Expected function not to throw.'); },
        toThrowError: msg => { let err = null; try { actual(); } catch (e) { err = e; } check(err && (msg === undefined || (msg instanceof RegExp ? msg.test(err.message) : err.message === msg)), `Expected function to throw an Error${msg ? ' with message ' + pp(String(msg)) : ''}${err ? ', but it threw ' + pp(err.message) : ''}.`, 'Expected function not to throw an Error.'); },
        toHaveBeenCalled: () => check(actual.calls && actual.calls.count() > 0, `Expected spy ${actual.__name || ''} to have been called.`, `Expected spy ${actual.__name || ''} not to have been called.`),
        toHaveBeenCalledTimes: n => check(actual.calls.count() === n, `Expected spy ${actual.__name || ''} to have been called ${n} times. It was called ${actual.calls.count()} times.`, `Expected spy not to have been called ${n} times.`),
        toHaveBeenCalledWith: (...args) => check(actual.calls.all().some(c => eq(c.args, args)), `Expected spy ${actual.__name || ''} to have been called with ${pp(args)} but actual calls were ${pp(actual.calls.all().map(c => c.args))}.`, `Expected spy ${actual.__name || ''} not to have been called with ${pp(args)}.`)
      };
      return m;
    };
    const o = mk(false); o.not = mk(true); return o;
  }

  /* ---------- đăng ký suite/spec ---------- */
  function describe(name, fn, mode) {
    const s = { type: 'suite', name, children: [], befores: [], afters: [], parent: cur, mode };
    cur.children.push(s); const prev = cur; cur = s; if (mode === 'f') focused = true;
    try { fn(); } catch (e) { s.error = e; } cur = prev;
  }
  const it = (name, fn, mode) => { cur.children.push({ type: 'spec', name, fn, mode, parent: cur }); if (mode === 'f') focused = true; };
  const beforeEach = fn => cur.befores.push(fn), afterEach = fn => cur.afters.push(fn);

  /* ---------- chạy ---------- */
  async function runFn(fn) {
    if (!fn) return;
    if (fn.length > 0) { await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('Timeout: done() không được gọi sau 2 giây')), 2000); const done = () => { clearTimeout(t); res(); }; done.fail = e => { clearTimeout(t); rej(new Error(String(e))); }; try { fn(done); } catch (e) { rej(e); } }); }
    else await fn();
  }
  const chain = n => { const a = []; for (let p = n; p; p = p.parent) a.unshift(p); return a; };
  async function run(report) {
    let total = 0, failed = 0, pending = 0;
    const hasFocus = (n) => chain(n).some(x => x.mode === 'f');
    async function walk(node, depth) {
      for (const c of node.children) {
        if (c.type === 'suite') {
          report({ kind: 'suite', depth, name: c.name });
          if (c.error) { failed++; total++; report({ kind: 'spec', depth: depth + 1, name: '(lỗi trong describe)', status: 'failed', messages: [String(c.error.message || c.error)] }); }
          await walk(c, depth + 1);
        } else {
          total++;
          const skipped = chain(c).some(x => x.mode === 'x') || (focused && !hasFocus(c));
          if (skipped) { pending++; report({ kind: 'spec', depth, name: c.name, status: 'pending', messages: [] }); continue; }
          failures = []; spies = []; current = c;
          try {
            for (const s of chain(c.parent)) for (const b of s.befores) await runFn(b);
            await runFn(c.fn);
            for (const s of chain(c.parent).reverse()) for (const a of s.afters) await runFn(a);
          } catch (e) { failures.push(`Error: ${e && e.message ? e.message : e}`); }
          spies.forEach(r => r()); spies = [];
          const bad = failures.length > 0; if (bad) failed++;
          report({ kind: 'spec', depth, name: c.name, status: bad ? 'failed' : 'passed', messages: failures.slice() });
        }
      }
    }
    await walk(root, 0);
    report({ kind: 'summary', total, failed, pending });
    return { total, failed, pending };
  }

  /* ---------- TestBed giả ---------- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const evalIn = (inst, expr, scope) => new Function('c', 's', `with(c){with(s){return (${expr})}}`)(inst, scope || {});
  const TB = { providers: new Map(), comps: [], cache: new Map(), overrides: new Map() };
  const TestBed = {
    configureTestingModule(cfg = {}) {
      TB.providers = new Map(); TB.cache = new Map(); TB.overrides = new Map(); TB.comps = (cfg.declarations || []).concat(cfg.imports || []);
      (cfg.providers || []).forEach(p => { p = typeof p === 'function' ? { provide: p, useClass: p } : p; TB.providers.set(p.provide, p); });
      return TestBed;
    },
    inject(token) {
      if (TB.cache.has(token)) return TB.cache.get(token);
      let p = TB.providers.get(token);
      if (!p && typeof token === 'function' && token.providedIn === 'root') p = { provide: token, useClass: token };
      if (!p) throw new Error(`NullInjectorError: No provider for ${token && token.name || String(token)}!`);
      const inst = 'useValue' in p ? p.useValue : p.useFactory ? p.useFactory(...(p.deps || []).map(TestBed.inject)) : p.useExisting ? TestBed.inject(p.useExisting) : new p.useClass(...(p.useClass.deps || []).map(TestBed.inject));
      TB.cache.set(token, inst); return inst;
    },
    overrideTemplate(Comp, tpl) { TB.overrides.set(Comp, tpl); return TestBed; },
    createComponent(Comp) {
      const host = document.createElement('div');
      const inst = new Comp(...(Comp.deps || []).map(TestBed.inject));
      const fixture = {
        componentInstance: inst, nativeElement: host,
        detectChanges() { renderInto(host, Comp, inst); },
        get debugElement() { return debug(host); }
      };
      return fixture;
    }
  };
  function process(node, scope, inst, kids) {
    if (node.nodeType === 3) { node.textContent = node.textContent.replace(/\{\{([\s\S]*?)\}\}/g, (m, e) => { try { const v = evalIn(inst, e, scope); return v == null ? '' : v; } catch (err) { return ''; } }); return; }
    if (node.nodeType !== 1) return;
    const ngIf = node.getAttribute('*ngIf'), ngFor = node.getAttribute('*ngFor');
    if (ngFor) {
      const m = /^\s*let\s+(\w+)\s+of\s+([\s\S]+)$/.exec(ngFor); node.removeAttribute('*ngFor');
      const list = evalIn(inst, m[2], scope) || [], parent = node.parentNode, anchor = node.nextSibling;
      node.remove();
      list.forEach(item => { const c = node.cloneNode(true); parent.insertBefore(c, anchor); process(c, { ...scope, [m[1]]: item }, inst); });
      return;
    }
    if (ngIf) { node.removeAttribute('*ngIf'); let ok = false; try { ok = !!evalIn(inst, ngIf, scope); } catch (e) { /* faux */ } if (!ok) { node.remove(); return; } }
    const Child = TB.comps.find(C => C.selector && C.selector === node.localName);
    [...node.attributes].forEach(a => {
      if (a.name.startsWith('[') && a.name.endsWith(']')) {
        const prop = a.name.slice(1, -1); let v; try { v = evalIn(inst, a.value, scope); } catch (e) { v = undefined; } node.removeAttribute(a.name);
        if (Child) { node.__pending = node.__pending || {}; node.__pending[prop] = v; }
        else { try { node[prop] = v; } catch (e) { /* ignore */ } if (v != null && typeof v !== 'object') node.setAttribute(prop, v); }
      } else if (a.name.startsWith('(') && a.name.endsWith(')')) {
        const ev = a.name.slice(1, -1), code = a.value; node.removeAttribute(a.name);
        node.addEventListener(ev, $event => evalIn(inst, code, { ...scope, $event }));
      }
    });
    if (Child) {
      const ci = node.__ng || (node.__ng = new Child(...(Child.deps || []).map(TestBed.inject)));
      Object.assign(ci, node.__pending || {}); renderInto(node, Child, ci); return;
    }
    [...node.childNodes].forEach(c => process(c, scope, inst));
  }
  function renderInto(host, Comp, inst) {
    const tpl = TB.overrides.has(Comp) ? TB.overrides.get(Comp) : Comp.template;
    host.innerHTML = typeof tpl === 'function' ? tpl(inst) : tpl;
    [...host.childNodes].forEach(c => process(c, {}, inst));
  }
  function debug(host) {
    const wrap = el => ({ nativeElement: el, componentInstance: el.__ng, query: p => wrap(el.querySelector(p)), queryAll: p => qAll(el, p) });
    const qAll = (el, pred) => [...el.querySelectorAll('*')].filter(pred).map(wrap);
    return { nativeElement: host, query: pred => qAll(host, pred)[0], queryAll: pred => qAll(host, pred), children: [...host.children].map(wrap) };
  }
  const By = { css: sel => el => el.matches(sel), directive: C => el => el.__ng instanceof C };
  const waitForAsync = fn => async () => { await fn(); await new Promise(r => setTimeout(r, 0)); };

  const scope = {
    describe: (n, f) => describe(n, f), fdescribe: (n, f) => describe(n, f, 'f'), xdescribe: (n, f) => describe(n, f, 'x'),
    it: (n, f) => it(n, f), fit: (n, f) => it(n, f, 'f'), xit: (n, f) => it(n, f, 'x'),
    beforeEach, afterEach, expect, spyOn, jasmine, TestBed, By, waitForAsync,
    EventEmitter: globalThis.Rx ? Rx.EventEmitter : undefined
  };
  return { scope, run };
};
