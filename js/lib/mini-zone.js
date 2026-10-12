/* mini-zone: Zone.js thu nhỏ. Vá setTimeout, clearTimeout và Promise.prototype.then (cách Zone.js làm) để biết khi nào
   các tác vụ bất đồng bộ bắt đầu/kết thúc trong một "zone". Hook: onInvoke(invoke), onHasTask({macroTask, microTask, change}),
   onHandleError(err), onFork(zone), onLeave() (mô phỏng onMicrotaskEmpty của NgZone).
   Lưu ý: async/await gốc KHÔNG đi qua then đã vá (Angular CLI hạ cấp async/await vì lý do này) — hãy dùng .then trong demo. */
globalThis.MiniZone = (function () {
  const nativeSetTimeout = globalThis.setTimeout.bind(globalThis), nativeClear = globalThis.clearTimeout.bind(globalThis);
  const nativeThen = Promise.prototype.then;
  let current = null, patched = false;
  const timers = new Map();
  class Zone {
    constructor(parent, spec = {}) { this.parent = parent; this.spec = spec; this.name = spec.name || '<anonymous>'; this._macro = 0; this._micro = 0; this._depth = 0; }
    static get current() { return current || Zone.root; }
    fork(spec = {}) { install(); const z = new Zone(this, spec); spec.onFork && spec.onFork(z); return z; }
    run(fn, thisArg, args) {
      const prev = current; current = this === Zone.root ? null : this; this._depth++;
      try {
        const invoke = () => fn.apply(thisArg, args || []);
        return this.spec.onInvoke ? this.spec.onInvoke(invoke) : invoke();
      } catch (e) {
        if (this.spec.onHandleError) { this.spec.onHandleError(e); return undefined; }
        throw e;
      } finally {
        current = prev; this._depth--;
        if (this._depth === 0 && this.spec.onLeave) this.spec.onLeave();
      }
    }
    _track(kind, d) {
      const key = kind === 'macro' ? '_macro' : '_micro', was = this[key] > 0; this[key] += d; const now = this[key] > 0;
      if (was !== now && this.spec.onHasTask) this.spec.onHasTask({ macroTask: this._macro > 0, microTask: this._micro > 0, change: kind === 'macro' ? 'macroTask' : 'microTask' });
    }
  }
  Zone.root = new Zone(null, { name: '<root>' });

  function install() {
    if (patched) return; patched = true;
    globalThis.setTimeout = function (cb, ms, ...args) {
      const z = current;
      if (!z || typeof cb !== 'function') return nativeSetTimeout(cb, ms, ...args);
      z._track('macro', +1);
      const id = nativeSetTimeout(() => { timers.delete(id); try { z.run(cb, this, args); } finally { z._track('macro', -1); } }, ms);
      timers.set(id, z); return id;
    };
    globalThis.clearTimeout = function (id) { const z = timers.get(id); if (z) { timers.delete(id); z._track('macro', -1); } return nativeClear(id); };
    Promise.prototype.then = function (onF, onR) {
      const z = current;
      if (!z) return nativeThen.call(this, onF, onR);
      z._track('micro', +1); let done = false;
      const fin = () => { if (!done) { done = true; z._track('micro', -1); } };
      const f = v => { try { return typeof onF === 'function' ? z.run(onF, undefined, [v]) : v; } finally { fin(); } };
      const r = e => { try { if (typeof onR === 'function') return z.run(onR, undefined, [e]); throw e; } finally { fin(); } };
      return nativeThen.call(this, f, r);
    };
  }
  return { Zone };
})();
