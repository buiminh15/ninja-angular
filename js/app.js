/* Ninja Angular — bộ máy hiển thị chương, chạy code, quiz, tiến độ. Không cần build. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const chapters = TOC.filter(t => t.n);

  /* ---------- lưu trữ an toàn ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ }
    }
  };
  let done = store.get('ninja.done', {});

  /* ---------- tô màu cú pháp (regex đơn giản) ---------- */
  const KW = 'abstract|any|as|async|await|boolean|break|case|catch|class|const|constructor|continue|declare|default|delete|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|keyof|let|new|null|number|of|private|protected|public|readonly|return|set|static|string|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|yield';
  const RULES = {
    js: new RegExp('(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)|\\b(' + KW + ')\\b|\\b(\\d+(?:\\.\\d+)?)\\b|([A-Za-z_$][\\w$]*)(?=\\()', 'g'),
    html: /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w-]+|\/?&gt;)|("[^"]*"|'[^']*')|([\w:@.#*()\[\]-]+)(?==)|(\{\{[\s\S]*?\}\})/g,
    bash: /(#[^\n]*)|("[^"]*"|'[^']*')|\b(ng|npm|npx|node|git|cd|install|serve|build|test|new|generate)\b/g
  };
  function highlight(code, lang) {
    lang = (lang || 'js').toLowerCase();
    if (lang === 'ts' || lang === 'typescript' || lang === 'json') lang = 'js';
    let src = esc(code);
    const re = RULES[lang];
    if (!re) return src;
    re.lastIndex = 0;
    if (lang === 'js') {
      return src.replace(re, (m, com, str, kw, num, fn) =>
        com ? `<span class="t-com">${m}</span>` : str ? `<span class="t-str">${m}</span>` :
        kw ? `<span class="t-kw">${m}</span>` : num ? `<span class="t-num">${m}</span>` : `<span class="t-fn">${m}</span>`);
    }
    if (lang === 'html') {
      return src.replace(re, (m, com, tag, str, attr, interp) =>
        com ? `<span class="t-com">${m}</span>` : tag ? `<span class="t-tag">${m}</span>` :
        str ? `<span class="t-str">${m}</span>` : attr ? `<span class="t-attr">${m}</span>` : `<span class="t-fn">${m}</span>`);
    }
    return src.replace(re, (m, com, str, kw) =>
      com ? `<span class="t-com">${m}</span>` : str ? `<span class="t-str">${m}</span>` : `<span class="t-kw">${m}</span>`);
  }

  /* ---------- định dạng giá trị như console ---------- */
  function fmt(v, depth = 0, top = true) {
    if (typeof v === 'string') return top ? v : `'${v}'`;
    if (v === null || v === undefined || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
    if (typeof v === 'symbol') return v.toString();
    if (typeof v === 'function') return /^class\s/.test(Function.prototype.toString.call(v)) ? `[class ${v.name}]` : `[Function: ${v.name || 'anonymous'}]`;
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Promise) return 'Promise {…}';
    if (depth > 3) return '[…]';
    if (Array.isArray(v)) return '[' + v.map(x => fmt(x, depth + 1, false)).join(', ') + ']';
    if (v instanceof Map) return `Map(${v.size}) {` + [...v].map(([k, x]) => `${fmt(k, depth + 1, false)} => ${fmt(x, depth + 1, false)}`).join(', ') + '}';
    if (v instanceof Set) return `Set(${v.size}) {` + [...v].map(x => fmt(x, depth + 1, false)).join(', ') + '}';
    const name = v.constructor && v.constructor.name && v.constructor.name !== 'Object' ? v.constructor.name + ' ' : '';
    const keys = Object.keys(v);
    if (!keys.length) return name + '{}';
    return name + '{ ' + keys.map(k => `${k}: ${fmt(v[k], depth + 1, false)}`).join(', ') + ' }';
  }
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  /* ---------- khối code chỉ đọc ---------- */
  function buildStatic(ta) {
    const lang = ta.dataset.lang || 'js';
    const wrap = document.createElement('div');
    wrap.className = 'codeblock';
    const code = ta.value.replace(/^\n/, '').replace(/\s+$/, '');
    wrap.innerHTML =
      `<div class="codebar"><span class="lang">${esc(lang)}</span><span class="ttl">${esc(ta.dataset.title || '')}</span><span class="sp"></span><button class="btn ghost">Copy</button></div>` +
      `<pre class="hl"><code>${highlight(code, lang)}</code></pre>`;
    $('button', wrap).onclick = e => {
      navigator.clipboard && navigator.clipboard.writeText(code);
      e.target.textContent = 'Đã copy ✓'; setTimeout(() => (e.target.textContent = 'Copy'), 1200);
    };
    ta.replaceWith(wrap);
  }

  /* ---------- TypeScript nạp lười từ CDN (chỉ khi cần) ---------- */
  let tsPromise = null;
  function loadTS() {
    if (window.ts) return Promise.resolve(window.ts);
    return tsPromise || (tsPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.4.5/typescript.min.js';
      s.onload = () => res(window.ts);
      s.onerror = () => { tsPromise = null; rej(new Error('Không tải được trình biên dịch TypeScript (cần Internet).')); };
      document.head.appendChild(s);
    }));
  }
  async function toJS(src) {
    const ts = await loadTS();
    return ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, experimentalDecorators: true, useDefineForClassFields: false } }).outputText;
  }

  /* ---------- khối code chạy được ---------- */
  function buildLive(ta) {
    const initial = ta.value.replace(/^\n/, '').replace(/\s+$/, '');
    const timed = ta.hasAttribute('data-time');
    const isTS = ta.hasAttribute('data-ts');
    const isTest = ta.hasAttribute('data-test');
    const wrap = document.createElement('div');
    wrap.className = 'codeblock';
    wrap.innerHTML =
      `<div class="codebar"><span class="lang">${isTest ? 'TEST ▶ Jasmine mini' : isTS ? 'TS ▶ chạy được' : 'JS ▶ chạy được'}</span><span class="ttl">${esc(ta.dataset.title || 'Sửa code rồi bấm Chạy (Ctrl+Enter)')}</span><span class="sp"></span>` +
      `${isTS ? '<button class="btn ghost showjs">Xem JS sinh ra</button>' : ''}<button class="btn ghost reset">Khôi phục</button><button class="btn run">▶ Chạy</button></div>` +
      `<textarea class="editor" spellcheck="false"></textarea><div class="output"><span class="lbl">Kết quả</span><span class="out dim">Bấm “Chạy” để xem kết quả…</span></div>`;
    const ed = $('textarea', wrap), out = $('.out', wrap);
    const fit = () => { ed.rows = Math.min(28, Math.max(3, ed.value.split('\n').length)); };
    ed.value = initial; fit();
    ed.addEventListener('input', fit);
    ed.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('  ', s, ed.selectionEnd, 'end'); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
    });
    let runId = 0;
    async function run() {
      const id = ++runId; out.className = 'out'; out.textContent = '';
      const t0 = performance.now();
      const write = (txt, cls) => {
        if (id !== runId) return;
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.textContent = (timed ? `[+${String(Math.round(performance.now() - t0)).padStart(4)}ms] ` : '') + txt;
        out.appendChild(line);
      };
      const con = {
        log: (...a) => write(a.map(x => fmt(x)).join(' ')),
        info: (...a) => write(a.map(x => fmt(x)).join(' ')),
        warn: (...a) => write('⚠ ' + a.map(x => fmt(x)).join(' ')),
        error: (...a) => write('✖ ' + a.map(x => fmt(x)).join(' '), 'err'),
        table: a => write(fmt(a))
      };
      try {
        let src = ed.value;
        if (isTS) src = await toJS(src);
        if (isTest) {
          const J = MiniJasmine(), names = Object.keys(J.scope);
          await new AsyncFunction('console', ...names, src)(con, ...names.map(n => J.scope[n]));
          await J.run(r => {
            const pad = '  '.repeat(r.depth || 0);
            if (r.kind === 'suite') write(pad + r.name);
            else if (r.kind === 'spec') { write(pad + (r.status === 'passed' ? '✓ ' : r.status === 'pending' ? '○ (bỏ qua) ' : '✗ ') + r.name, r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'err' : 'dim'); r.messages.forEach(m => write(pad + '    ' + m, 'err')); }
            else write(`
${r.total} spec${r.total > 1 ? 's' : ''}, ${r.failed} failure${r.failed !== 1 ? 's' : ''}${r.pending ? ', ' + r.pending + ' pending' : ''}`, r.failed ? 'err' : 'ok');
          });
        } else await new AsyncFunction('console', src)(con);
        if (!out.childNodes.length) { out.innerHTML = '<span class="dim">(không có console.log nào)</span>'; }
      } catch (e) { write(`${e.name}: ${e.message}`, 'err'); }
    }
    $('.run', wrap).onclick = run;
    if (isTS) $('.showjs', wrap).onclick = async () => {
      runId++; out.className = 'out';
      try { out.textContent = '// JavaScript do TypeScript sinh ra (kiểu đã bị xoá):\n' + await toJS(ed.value); }
      catch (e) { out.textContent = e.message; out.className = 'out err'; }
    };
    $('.reset', wrap).onclick = () => { ed.value = initial; fit(); runId++; out.innerHTML = '<span class="dim">Đã khôi phục code gốc.</span>'; };
    ta.replaceWith(wrap);
  }

  /* ---------- quiz ---------- */
  function buildQuiz(list) {
    const box = document.createElement('div');
    let right = 0, answered = 0;
    const score = document.createElement('div'); score.className = 'score';
    list.forEach((item, qi) => {
      const q = document.createElement('div'); q.className = 'quiz';
      q.innerHTML = `<div class="q">${qi + 1}. ${item.q}</div>` +
        item.options.map((o, i) => `<label data-i="${i}"><input type="radio" name="q${qi}" hidden> ${o}</label>`).join('') +
        `<div class="why">💡 ${item.why || ''}</div>`;
      $$('label', q).forEach(l => l.onclick = () => {
        if (q.classList.contains('answered')) return;
        q.classList.add('answered'); answered++;
        const pick = +l.dataset.i;
        $$('label', q).forEach((x, i) => { if (i === item.answer) x.classList.add('right'); });
        if (pick === item.answer) right++; else l.classList.add('wrong');
        score.textContent = `Điểm: ${right}/${list.length}` + (answered === list.length ? (right === list.length ? ' 🎉 Tuyệt vời!' : ' — xem lại phần giải thích nhé') : '');
      });
      box.appendChild(q);
    });
    box.appendChild(score);
    return box;
  }

  /* ---------- tiến độ & sidebar ---------- */
  function updateProgress() {
    const built = chapters.filter(c => c.file).length;
    const n = chapters.filter(c => done[c.n]).length;
    $('#progressText').textContent = `Hoàn thành ${n}/${chapters.length} chương`;
    return { n, built };
  }
  function renderSidebar(active) {
    $('#sidebar').innerHTML = TOC.map(t => t.group ? `<div class="grp">${t.group}</div>` :
      `<a href="#/ch/${t.n}" class="${t.n === active ? 'active ' : ''}${t.file ? '' : 'soon'}"><span class="n">${t.n}</span><span>${t.title}${t.file ? '' : ' <small>(sắp có)</small>'}</span>${done[t.n] ? '<span class="done">✓</span>' : ''}</a>`).join('');
  }

  /* ---------- trang chủ ---------- */
  function renderHome() {
    const p = updateProgress();
    const pct = Math.round(p.n / chapters.length * 100);
    $('#content').innerHTML =
      `<div class="hero"><h1>🥷 Trở thành Ninja Angular</h1><p>Học theo sách “Become a Ninja with Angular” (Ninja Squad) bằng ví dụ trực quan: đọc ngắn, <b>sửa code và chạy ngay trên trang</b>, có widget tương tác và quiz cuối mỗi chương.</p>` +
      `<div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div></div>` +
      TOC.map(t => t.group ? `</div><h3>${t.group}</h3><div class="cards">` :
        `<a class="card ${t.file ? '' : 'soon'}" href="#/ch/${t.n}"><div class="n">CHƯƠNG ${t.n} ${done[t.n] ? '✓' : ''}</div><div class="t">${t.title}</div><div class="d">${t.desc || '&nbsp;'}</div></a>`).join('').replace(/^<\/div>/, '') + '</div>' +
      `<div class="box info"><b>Cách dùng</b><p>Mở <code>index.html</code> trực tiếp bằng trình duyệt (không cần cài gì). Các chương Angular thật sự chạy được sẽ có hướng dẫn tạo project bằng Angular CLI; phần còn lại là mô phỏng thuần HTML/CSS/JS để bạn thấy cơ chế hoạt động.</p></div>`;
    document.title = 'Ninja Angular — học qua ví dụ';
    delete $('#content').dataset.ch;
  }

  /* ---------- trang chương ---------- */
  function loadChapter(n) {
    return new Promise((res, rej) => {
      if (CHAPTER_DATA[n]) return res(CHAPTER_DATA[n]);
      const s = document.createElement('script');
      s.src = `js/chapters/ch${String(n).padStart(2, '0')}.js`;
      s.onload = () => res(CHAPTER_DATA[n]); s.onerror = () => rej(new Error('Chưa có nội dung'));
      document.head.appendChild(s);
    });
  }
  async function renderChapter(n) {
    const meta = chapters.find(c => c.n === n);
    const root = $('#content');
    if (!meta) { location.hash = '#/'; return; }
    let data;
    try { if (!meta.file) throw 0; data = await loadChapter(n); } catch (e) {
      root.innerHTML = `<h1>Chương ${n}. ${meta.title}</h1><div class="box warn"><b>Sắp có</b><p>Chương này chưa được làm. Hãy yêu cầu làm tiếp chương ${n} để thêm nội dung.</p></div>${pager(n)}`;
      return;
    }
    const secs = data.sections;
    root.innerHTML =
      `<span class="chip">Chương ${n}/${chapters.length}</span>${data.time ? `<span class="chip">⏱ ${data.time}</span>` : ''}` +
      `<h1>${meta.title}</h1><p class="lead">${data.lead || ''}</p>` +
      `<div class="toc-inline">${secs.map((s, i) => `<a href="#/ch/${n}/${s.id}">${i + 1}. ${s.title}</a>`).join('')}${data.quiz ? `<a href="#/ch/${n}/quiz">✍ Quiz</a>` : ''}</div>` +
      secs.map((s, i) => `<section id="s-${s.id}"><h2><span class="num">${n}.${i + 1}</span>${s.title}</h2>${s.html}</section>`).join('') +
      (data.quiz ? `<section id="s-quiz"><h2>✍ Kiểm tra nhanh</h2><div id="quizHost"></div></section>` : '') +
      `<button class="btn done-btn" id="doneBtn"></button>` + pager(n);
    $$('textarea.code', root).forEach(buildStatic);
    $$('textarea.live', root).forEach(buildLive);
    if (data.quiz) $('#quizHost').appendChild(buildQuiz(data.quiz));
    if (data.mount) data.mount(root);
    const btn = $('#doneBtn');
    const paint = () => { btn.textContent = done[n] ? '✓ Đã hoàn thành (bấm để bỏ)' : 'Đánh dấu đã học xong chương này'; btn.className = 'btn done-btn' + (done[n] ? ' alt' : ''); };
    btn.onclick = () => { done[n] = !done[n]; store.set('ninja.done', done); paint(); renderSidebar(n); updateProgress(); };
    paint();
    document.title = `Chương ${n}. ${meta.title} — Ninja Angular`;
  }
  function pager(n) {
    const p = chapters.find(c => c.n === n - 1), x = chapters.find(c => c.n === n + 1);
    return `<div class="pager">${p ? `<a href="#/ch/${p.n}"><small>← Chương trước</small>${p.n}. ${p.title}</a>` : '<span></span>'}${x ? `<a class="next" href="#/ch/${x.n}"><small>Chương sau →</small>${x.n}. ${x.title}</a>` : ''}</div>`;
  }

  /* ---------- router ---------- */
  async function route() {
    document.body.classList.remove('menu-open');
    const m = location.hash.match(/^#\/ch\/(\d+)(?:\/([\w-]+))?/);
    if (!m) { renderSidebar(0); renderHome(); window.scrollTo(0, 0); return; }
    const n = +m[1];
    renderSidebar(n);
    if (!(m[2] && $('#content h1') && $('#content').dataset.ch == n)) {
      $('#content').dataset.ch = n;
      await renderChapter(n);
    }
    updateProgress();
    if (m[2]) { const t = document.getElementById('s-' + m[2]); t && t.scrollIntoView(); } else window.scrollTo(0, 0);
  }

  /* ---------- giao diện ---------- */
  const theme = store.get('ninja.theme', null);
  if (theme) document.documentElement.dataset.theme = theme;
  $('#themeBtn').onclick = () => {
    const dark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const t = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; store.set('ninja.theme', t);
  };
  $('#menuBtn').onclick = () => document.body.classList.toggle('menu-open');
  window.addEventListener('hashchange', route);
  route();
})();
