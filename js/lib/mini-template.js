/* mini-template: bộ render template Angular thu nhỏ (cú pháp thật: {{ }}, [prop], (event), #ref, *ngIf/else, *ngFor,
   ngSwitch, ngStyle, ngClass, [style.x], [class.x], [attr.x], cú pháp canonical bind-/on-/ref-, component con theo selector).
   Mỗi lần có sự kiện: chạy "change detection" = dựng lại DOM từ state (giữ giá trị ô nhập + focus). Chỉ dùng cho học tập. */
globalThis.MiniTemplate = (function () {
  const KW = /\b(if|else|var|let|const|for|while|function|return|new|delete|typeof)\b/;
  const checkExpr = src => {
    const e = src.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "''");   // bỏ nội dung chuỗi trước khi kiểm tra
    if (/;/.test(e)) return 'Parser Error: Unexpected token ; — một expression phải đơn lẻ, không nối bằng dấu ;';
    if (/(^|[^=!<>])=(?!=|>)/.test(e)) return 'Parser Error: Bindings cannot contain assignments';
    if (KW.test(e)) return 'Parser Error: expression không được chứa từ khoá (if, var, for…)';
    return null;
  };
  const evalExpr = (ctx, scope, expr) => new Function('c', 's', `with(c){with(s){return (${expr})}}`)(ctx, scope);
  const runStmt = (ctx, scope, code, $event) => new Function('c', 's', '$event', `with(c){with(s){${code}}}`)(ctx, scope, $event);
  const KEYS = { space: ' ', enter: 'Enter', escape: 'Escape', esc: 'Escape', tab: 'Tab', arrowup: 'ArrowUp', arrowdown: 'ArrowDown' };
  /* HTML parser hạ chữ thường tên attribute; Angular thì phân biệt hoa/thường → mã hoá chữ hoa trước khi parse */
  const enc = n => n.replace(/[A-Z]/g, c => '§' + c.toLowerCase()), dec = n => n.replace(/§(.)/g, (m, c) => c.toUpperCase());
  function encodeTpl(t) {
    let out = '', i = 0;
    while (i < t.length) {
      if (t[i] === '<' && /[a-zA-Z]/.test(t[i + 1] || '')) {
        let j = i + 1; while (j < t.length && !/[\s>\/]/.test(t[j])) j++; out += t.slice(i, j); i = j;
        while (i < t.length && t[i] !== '>') {
          if (/\s/.test(t[i]) || t[i] === '/') { out += t[i++]; continue; }
          let k = i; while (k < t.length && !/[\s=>\/]/.test(t[k])) k++; out += enc(t.slice(i, k)); i = k;
          if (t[i] === '=') { out += '='; i++; if (t[i] === '"' || t[i] === "'") { const q = t[i]; let e = t.indexOf(q, i + 1); if (e < 0) e = t.length - 1; out += t.slice(i, e + 1); i = e + 1; } else { let e = i; while (e < t.length && !/[\s>]/.test(t[e])) e++; out += t.slice(i, e); i = e; } }
        }
        out += t[i] || ''; i++;
      } else out += t[i++];
    }
    return out;
  }
  const norm = n => (n.startsWith('bind-') ? `[${n.slice(5)}]` : n.startsWith('on-') ? `(${n.slice(3)})` : n.startsWith('ref-') ? `#${n.slice(4)}` : n);

  class View {
    constructor(host, tpl, ctx, opts = {}) {
      this.host = host; this.ctx = ctx; this.opts = opts; this.components = opts.components || {}; this.children = new Map(); this.errors = [];
      this.setTemplate(tpl);
    }
    setTemplate(tpl) { const t = document.createElement('template'); t.innerHTML = encodeTpl(tpl); this.src = t.content; }
    err(m) { if (!this.errors.includes(m)) this.errors.push(m); }
    /* ---- giữ trạng thái ô nhập qua mỗi lần dựng lại ---- */
    capture() {
      const els = [...this.host.querySelectorAll('*')], a = document.activeElement, idx = els.indexOf(a);
      return { vals: els.map(e => (/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) ? { v: e.value, c: e.checked } : null)), idx, tag: a && a.tagName, sel: a && a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null };
    }
    restore(s) {
      const els = [...this.host.querySelectorAll('*')];
      els.forEach((e, i) => { if (s.vals[i] && e.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) { if (e.type === 'checkbox' || e.type === 'radio') e.checked = s.vals[i].c; else if (e.value !== s.vals[i].v && !e.hasAttribute('data-bound-value')) e.value = s.vals[i].v; } });
      if (s.idx >= 0 && els[s.idx] && els[s.idx].tagName === s.tag) { els[s.idx].focus(); if (s.sel) try { els[s.idx].setSelectionRange(...s.sel); } catch (e) { /* bỏ qua */ } }
    }
    render() {
      const st = this.capture(); this.errors = []; this.refs = {}; this.tpls = {}; this.late = [];
      this.host.replaceChildren();
      this.buildChildren(this.src, this.host, {}, 'r');
      this.restore(st);                                   // khôi phục giá trị ô nhập trước (binding có thể đọc #ref.value)
      this.late.forEach(f => f());                       // binding dùng #ref chạy sau khi dựng xong
      this.opts.onRender && this.opts.onRender(this);
    }
    buildChildren(srcParent, out, scope, path) {
      [...srcParent.childNodes].forEach((n, i) => this.build(n, out, scope, path + '.' + i));
    }
    build(n, out, scope, path) {
      if (n.nodeType === 3) {
        const text = n.textContent;
        if (!/\{\{/.test(text)) { out.appendChild(document.createTextNode(text)); return; }
        const t = document.createTextNode(''); out.appendChild(t);
        const parts = text.split(/(\{\{[\s\S]*?\}\})/);
        this.late.push(() => { t.textContent = parts.map(p => { if (!/^\{\{/.test(p)) return p; const e = p.slice(2, -2).trim(); try { const v = evalExpr(this.ctx, { ...scope, ...this.refs }, e); return v == null ? '' : v; } catch (x) { this.err(`Lỗi trong {{ ${e} }}: ${x.message}`); return ''; } }).join(''); });
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.localName, attrs = [...n.attributes].map(a => [norm(dec(a.name)), a.value]);
      const get = k => (attrs.find(a => a[0] === k) || [])[1];
      // ---- directive cấu trúc ----
      const ngIf = get('*ngIf'), ngFor = get('*ngFor'), sCase = get('*ngSwitchCase'), sDef = attrs.some(a => a[0] === '*ngSwitchDefault');
      const rest = () => { const c = n.cloneNode(true); ['*ngIf', '*ngFor', '*ngSwitchCase', '*ngSwitchDefault'].forEach(k => c.removeAttribute(enc(k))); return c; };
      if (ngFor != null) {
        const m = /^\s*let\s+(\w+)\s+of\s+([^;]+)(.*)$/.exec(ngFor);
        if (!m) { this.err('Cú pháp *ngFor không hợp lệ: ' + ngFor); return; }
        let list = []; try { list = evalExpr(this.ctx, { ...scope, ...this.refs }, m[2].trim()) || []; } catch (x) { this.err(`Lỗi trong *ngFor="${m[2].trim()}": ${x.message}`); }
        const extras = [...m[3].matchAll(/(?:;|,)\s*(?:let\s+(\w+)\s*=\s*(\w+)|(\w+)\s+as\s+(\w+))/g)].map(x => (x[1] ? [x[2], x[1]] : [x[3], x[4]]));
        const base = n.cloneNode(true); base.removeAttribute(enc('*ngFor'));
        [...list].forEach((item, idx, arr) => {
          const s = { ...scope, [m[1]]: item }, ex = { index: idx, even: idx % 2 === 0, odd: idx % 2 === 1, first: idx === 0, last: idx === arr.length - 1, count: arr.length };
          extras.forEach(([k, v]) => { if (k in ex) s[v] = ex[k]; });
          this.build(base, out, s, path + '#' + idx);
        });
        return;
      }
      if (ngIf != null) {
        const [cond, elsePart] = ngIf.split(/;\s*else\s+/); let ok = false;
        try { ok = !!evalExpr(this.ctx, { ...scope, ...this.refs }, cond); } catch (x) { this.err(`Lỗi trong *ngIf="${cond}": ${x.message}`); }
        if (ok) this.build(rest(), out, scope, path + '?');
        else if (elsePart) { const tpl = this.tpls[elsePart.trim()] || this.findTpl(elsePart.trim()); if (tpl) this.buildChildren(tpl.content || tpl, out, scope, path + 'e'); else this.err(`Không tìm thấy <ng-template #${elsePart.trim()}>`); }
        return;
      }
      if (sCase != null || sDef) {
        const sw = scope.$switch; if (!sw) { this.err('*ngSwitchCase phải nằm trong phần tử có [ngSwitch]'); return; }
        let show;
        if (sDef) show = !sw.anyMatch; else { try { show = evalExpr(this.ctx, { ...scope, ...this.refs }, sCase) === sw.value; } catch (x) { show = false; } }
        if (show) this.build(rest(), out, scope, path + 'w');
        return;
      }
      if (tag === 'ng-template') { const r = attrs.find(a => a[0].startsWith('#')); if (r) this.tpls[r[0].slice(1)] = n; return; }
      if (tag === 'ng-container') { this.buildChildren(n, out, scope, path); return; }
      // ---- component con ----
      const Comp = this.components[tag];
      if (Comp && !Comp.declared) { this.err(`NG8001: '${tag}' is not a known element — hãy khai báo component trong declarations/imports của module`); const el = document.createElement(tag); out.appendChild(el); return; }
      const el = document.createElement(tag); out.appendChild(el);
      const props = {}, sw = {};
      attrs.forEach(([name, val]) => {
        if (name.startsWith('#')) { this.refs[name.slice(1)] = Comp ? el : el; return; }
        if (name.startsWith('[') && name.endsWith(']')) {
          const prop = name.slice(1, -1), bad = checkExpr(val);
          if (bad) { this.err(`[${prop}]="${val}" → ${bad}`); return; }
          if (prop === 'ngSwitch') { try { sw.value = evalExpr(this.ctx, { ...scope, ...this.refs }, val); } catch (x) { this.err(x.message); } return; }
          this.late.push(() => this.applyBinding(el, prop, val, scope, Comp, props));
        } else if (name.startsWith('(') && name.endsWith(')')) {
          const ev = name.slice(1, -1), [type, ...mods] = ev.split('.');
          el.addEventListener(type, e => {
            if (mods.length) { const want = mods.map(m => KEYS[m] || m); const keyOk = want.filter(w => !['alt', 'ctrl', 'shift', 'meta'].includes(w)).every(w => e.key === w || e.key.toLowerCase() === w); const modOk = ['alt', 'ctrl', 'shift', 'meta'].every(m => !want.includes(m) || e[m + 'Key']); if (!keyOk || !modOk) return; }
            try { runStmt(this.ctx, { ...scope, ...this.refs }, val, e); } catch (x) { this.err(`Lỗi trong (${ev})="${val}": ${x.message}`); }
            this.render();
          });
        } else if (/\{\{/.test(val)) {
          this.late.push(() => { const v = val.replace(/\{\{([\s\S]*?)\}\}/g, (m, e) => { try { const r = evalExpr(this.ctx, { ...scope, ...this.refs }, e.trim()); return r == null ? '' : r; } catch (x) { this.err(`Lỗi trong ${name}="${val}": ${x.message}`); return ''; } }); this.applyBinding(el, name, JSON.stringify(v), {}, Comp, props, true); });
        } else if (!name.startsWith('*')) { el.setAttribute(name, val); }
      });
      if (attrs.some(a => a[0] === '[ngSwitch]')) {
        const cases = [...n.children].map(c => c.getAttribute(enc('*ngSwitchCase'))).filter(x => x != null);
        sw.anyMatch = cases.some(c => { try { return evalExpr(this.ctx, { ...scope, ...this.refs }, c) === sw.value; } catch (x) { return false; } });
        scope = { ...scope, $switch: sw };
      }
      if (Comp) {                                      // component con: có instance + view riêng, giữ state theo vị trí
        const key = path; let child = this.children.get(key);
        if (!child) { const inst = new Comp.cls(); child = { inst, view: new View(el, Comp.template, inst, { components: this.components }) }; this.children.set(key, child); }
        else child.view.host = el;
        this.late.push(() => { Object.assign(child.inst, props); child.view.render(); child.view.errors.forEach(m => this.err(`<${tag}>: ${m}`)); });
        return;
      }
      this.buildChildren(n, el, scope, path);
    }
    findTpl(name) { let found = null; const walk = n => { [...n.childNodes].forEach(c => { if (c.nodeType === 1) { if (c.localName === 'ng-template' && [...c.attributes].some(a => dec(a.name) === '#' + name || dec(a.name) === 'ref-' + name)) found = c; walk(c.content || c); } }); }; walk(this.src); return found; }
    applyBinding(el, prop, expr, scope, Comp, props, literal) {
      let v;
      try { v = literal ? JSON.parse(expr) : evalExpr(this.ctx, { ...scope, ...this.refs }, expr); } catch (x) { this.err(`Lỗi trong [${prop}]="${expr}": ${x.message}`); return; }
      if (Comp) { props[prop] = v; return; }
      if (prop === 'ngClass') { const o = typeof v === 'string' ? { [v]: true } : Array.isArray(v) ? Object.fromEntries(v.map(c => [c, true])) : v || {}; Object.entries(o).forEach(([c, on]) => c.split(/\s+/).filter(Boolean).forEach(k => el.classList.toggle(k, !!on))); return; }
      if (prop === 'ngStyle') { Object.entries(v || {}).forEach(([k, x]) => { el.style[k.includes('-') ? k.replace(/-(\w)/g, (m, c) => c.toUpperCase()) : k] = x; }); return; }
      if (prop.startsWith('style.')) { const [, s, unit] = prop.split('.'); el.style[s.replace(/-(\w)/g, (m, c) => c.toUpperCase())] = v == null ? '' : v + (unit || ''); return; }
      if (prop.startsWith('class.')) { el.classList.toggle(prop.slice(6), !!v); return; }
      if (prop.startsWith('attr.')) { v == null ? el.removeAttribute(prop.slice(5)) : el.setAttribute(prop.slice(5), v); return; }
      if (prop === 'value' || prop === 'checked') el.setAttribute('data-bound-value', '');
      if (!(prop in el)) { this.err(`NG8002: Can't bind to '${prop}' since it isn't a known property of '${el.localName}'`); return; }
      el[prop] = v;
      if (prop === 'src' || prop === 'alt' || prop === 'title') { if (v != null) el.setAttribute(prop, v); }
    }
  }
  return { View, checkExpr, evalExpr };
})();
