registerChapter(21, {
  time: '30 phút',
  lead: 'Điều ít framework làm: Angular <b>không bao giờ đưa HTML template của bạn cho trình duyệt đọc trực tiếp</b>. Nó <b>biên dịch</b> mỗi template thành code JavaScript. Câu hỏi là <i>biên dịch ở đâu và lúc nào</i>: trong trình duyệt khi khởi động (<b>JIT</b>) hay ngay lúc build (<b>AOT</b>). Bạn sẽ tự chạy một “trình biên dịch template” thu nhỏ để thấy code được sinh ra.',
  sections: [
    {
      id: 'codegen', title: 'Template được sinh thành code như thế nào',
      html: `
<p>Khi biên dịch, Angular làm ba bước: <b>phân tích</b> template thành <b>cây cú pháp trừu tượng (AST)</b> → <b>sinh code</b> một “component definition” cho mỗi component (đặt trong một field tĩnh của class) → code đó chứa <b>hàm template</b>. Hàm này có hai phần:</p>
<ul>
<li><b>Create</b> (chạy <b>một lần</b>): dựng DOM — <code>elementStart</code>, <code>element</code>, <code>text</code>, <code>elementEnd</code>.</li>
<li><b>Update</b> (chạy ở <b>mỗi lần change detection</b>, chương 20): với mỗi chỗ động, lấy giá trị mới và gọi hàm của framework kèm chỉ số phần tử (<code>advance</code>, <code>property</code>, <code>textInterpolate</code>); framework so với giá trị cũ và chỉ ghi DOM khi khác.</li>
</ul>
<p>Hãy sửa template và xem code được sinh (bản rút gọn của trình biên dịch Ivy), rồi chạy thử create/update:</p>

<div class="widget" id="w-comp">
  <h4>🛠 Trình biên dịch template thu nhỏ</h4>
  <div class="grid2">
    <div><b>Template</b><textarea id="cp-tpl" rows="7" class="mono" style="width:100%;margin-top:6px" spellcheck="false"></textarea></div>
    <div><b>Component (state + method)</b><textarea id="cp-ctx" rows="7" class="mono" style="width:100%;margin-top:6px" spellcheck="false"></textarea></div>
  </div>
  <div id="cp-err" style="color:var(--err);margin:6px 0"></div>
  <div class="row" style="margin:8px 0">
    <button class="btn" id="cp-create">① Create (dựng DOM, chạy 1 lần)</button>
    <button class="btn" id="cp-update">② Update (change detection)</button>
    <button class="btn alt" id="cp-rename">Đổi tên pony</button>
    <button class="btn alt" id="cp-color">Đổi màu pony</button>
  </div>
  <div class="grid2">
    <div><b>Code được sinh</b><pre class="hl" id="cp-code" style="border-radius:8px;margin-top:6px;font-size:12.5px;max-height:330px;overflow:auto"></pre></div>
    <div><b>DOM kết quả</b><pre class="hl" id="cp-dom" style="border-radius:8px;margin-top:6px;font-size:12.5px;min-height:70px"></pre>
      <b style="display:block;margin-top:8px">Nhật ký update</b><div class="output" id="cp-log" style="border-radius:8px;height:130px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử</b><ol>
<li>Bấm <b>Create</b> rồi <b>Update</b>: lần đầu mọi binding được ghi vào DOM.</li>
<li>Bấm <b>Update</b> lần nữa mà không đổi gì: các binding <b>không đổi nên bị bỏ qua</b> (không ghi DOM) — chính là điều Angular làm sau mỗi sự kiện.</li>
<li>Bấm <b>Đổi tên pony</b> rồi <b>Update</b>: chỉ binding <code>textInterpolate</code> ghi DOM; <code>property('src')</code> không đổi nên bỏ qua.</li>
<li>Thêm một binding vào template (ví dụ <code>[title]="ponyModel.name"</code>) và xem code sinh thêm lệnh <code>property</code>.</li></ol></div>
<div class="box info"><b>Về “Ivy”</b><p>Code kiểu <code>elementStart / property / advance</code> là của trình render <b>Ivy</b> (Angular 8–9+, thế hệ renderer thứ ba; bản đầu đã được viết lại ở Angular 4). Mỗi thế hệ cải thiện hiệu năng và/hoặc kích thước bundle mà cú pháp template giữ nguyên, nên hầu như bạn không để ý.</p></div>`
    },
    {
      id: 'jitaot', title: 'JIT hay AOT: biên dịch ở đâu?',
      html: `
<p>Phần sinh code này tốn thời gian. Nếu làm <b>lúc ứng dụng khởi động trong trình duyệt</b> thì gọi là <b>JIT (Just in Time)</b>. Nếu làm <b>trước, lúc build</b> thì là <b>AOT (Ahead of Time)</b> — bằng trình biên dịch <code>ngc</code> mà Angular CLI gọi hộ.</p>
<div class="flow">
  <div class="node">JIT<small>TS → JS (build)</small></div><span class="arr">→</span>
  <div class="node">gửi JS + HTML + <b>compiler</b></div><span class="arr">→</span>
  <div class="node hot">trình duyệt biên dịch<br>HTML → JS khi khởi động</div>
</div>
<div class="flow">
  <div class="node">AOT<small>HTML → TS (ngc) → JS</small></div><span class="arr">→</span>
  <div class="node">gửi JS đã biên dịch<br>(không cần compiler)</div><span class="arr">→</span>
  <div class="node hot">chạy ngay</div>
</div>
<div class="tablewrap"><table>
<tr><th></th><th>JIT</th><th>AOT</th></tr>
<tr><td>Khởi động</td><td>Chậm hơn: mọi người dùng trả giá biên dịch ở mỗi lần tải</td><td>Nhanh: template đã biên dịch sẵn</td></tr>
<tr><td>Gửi compiler cho người dùng</td><td>Có (lớn)</td><td>Không</td></tr>
<tr><td>Kích thước code</td><td>Template (HTML) gọn</td><td>Code sinh ra thường <b>lớn hơn</b> HTML</td></tr>
<tr><td>Bắt lỗi template</td><td>Lúc chạy</td><td><b>Lúc build</b></td></tr>
</table></div>
<p>Kết quả hơi bất ngờ: bỏ compiler giúp bundle nhỏ đi, nhưng code sinh ra lớn hơn HTML gốc. App nhỏ → AOT nhỏ hơn; app lớn → AOT thường lớn hơn JIT. Muốn vừa AOT vừa nhỏ: dùng <b>lazy-loading</b> (chương 18, 25). Thử với con số minh hoạ:</p>

<div class="widget" id="w-jit">
  <h4>⚖ So sánh JIT và AOT</h4>
  <p class="hint">Giả định minh hoạ (không đo thật): compiler ≈ 250 KB; mỗi component có template 2 KB (HTML) hoặc 5 KB (code AOT sinh ra); biên dịch JIT ≈ 0,8 ms mỗi component trên máy tính, ×4 trên điện thoại.</p>
  <div class="grid2">
    <div>
      <label>Số component: <b id="jt-nv">60</b></label><input type="range" id="jt-n" min="5" max="600" step="5" value="60" style="width:100%">
      <label>Thiết bị: <select id="jt-dev"><option value="1">Máy tính</option><option value="4" selected>Điện thoại tầm trung (×4 chậm)</option></select></label><br>
      <label>Mạng: <select id="jt-net"><option value="9">4G (9 Mbps)</option><option value="0.4">3G chậm (0,4 Mbps)</option><option value="100">Cáp quang</option></select></label>
    </div>
    <div id="jt-out"></div>
  </div>
</div>`
    },
    {
      id: 'errors', title: 'AOT bắt lỗi template ngay lúc build',
      html: `
<p>Lợi ích lớn nhất của AOT không chỉ là tốc độ: ngoài việc sinh JS, <code>ngc</code> sinh <b>TypeScript</b> từ template, rồi cho TypeScript kiểm tra — nên lỗi trong template hiện ra <b>lúc build</b>:</p>
<textarea class="code" data-lang="html" data-title="Gõ nhầm tên method">
<figure>
  <img [src]="getPonyImageUr()">          <!-- thiếu chữ l -->
  <figcaption>{{ ponyModel.name }}</figcaption>
</figure>
</textarea>
<textarea class="code" data-lang="bash">
ng build
error TS2551: Property 'getPonyImageUr' does not exist on type 'PonyComponent'. Did you mean 'getPonyImageUrl'?
</textarea>
<p>Bạn refactor đổi tên method/field → build gãy ngay chỗ template cần sửa. Ngược lại một số thứ chạy tốt ở JIT nhưng <b>hỏng ở AOT</b>. Chọn một tình huống và chế độ:</p>

<div class="widget" id="w-aot">
  <h4>🧪 Lỗi nào bị bắt ở đâu?</h4>
  <div class="row" style="margin-bottom:10px"><label>Chế độ: <select id="ao-mode"><option value="jit">JIT (biên dịch lúc chạy)</option><option value="aot" selected>AOT</option><option value="strict">AOT + strictTemplates</option></select></label></div>
  <div class="tablewrap"><table id="ao-table"></table></div>
</div>
<div class="box warn"><b>AOT nghiêm khắc hơn JIT</b><p>Template được biên dịch thành code TypeScript đặt <b>ở ngoài</b> class, nên nó chỉ truy cập được thành viên <b>public</b>. Một <code>@Input()</code> hay field dùng trong template mà khai báo <code>private</code> chạy ổn với JIT (JavaScript không có <code>private</code> thật) nhưng <b>làm hỏng build AOT</b>. Nên dùng <code>protected</code>/<code>public</code> cho thứ template cần truy cập.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><ul>
<li>AOT là <b>mặc định</b> từ Angular 9, cả khi <code>ng serve</code> (trước đó thường dùng JIT khi dev) và trong build production; JIT chủ yếu còn cho vài trường hợp đặc biệt (một số test cũ, component biên dịch động).</li>
<li>Trình biên dịch Ivy tăng dần mức kiểm tra: <code>fullTemplateTypeCheck</code> → <code>strictTemplates</code> (chương 26), được bật mặc định ở project mới.</li>
<li>Template cũng có thể kiểm tra trong IDE nhờ <i>Angular Language Service</i>.</li>
<li>Các tối ưu thêm của build hiện đại (tree-shaking tốt hơn nhờ Ivy, esbuild, <code>@defer</code>, hydration) làm bundle AOT nhỏ hơn rất nhiều so với thời sách viết.</li></ul></div>`
    }
  ],
  quiz: [
    { q: 'HTML template của component được trình duyệt đọc trực tiếp?', options: ['Có', 'Không — Angular biên dịch nó thành code JavaScript (hàm template)', 'Chỉ khi dùng JIT'], answer: 1, why: 'Mỗi template được biên dịch thành component definition với phần create và update.' },
    { q: 'Phần “update” của hàm template chạy khi nào?', options: ['Một lần lúc khởi động', 'Mỗi lần change detection; chỉ ghi DOM nếu giá trị đổi', 'Không bao giờ'], answer: 1, why: 'Nó lấy giá trị biểu thức và so với giá trị cũ.' },
    { q: 'AOT khác JIT ở điểm cốt lõi nào?', options: ['AOT biên dịch template lúc build; JIT biên dịch trong trình duyệt khi khởi động', 'AOT dùng JavaScript, JIT dùng TypeScript', 'Không khác'], answer: 0, why: 'Lúc biên dịch là khác biệt chính.' },
    { q: 'Lợi ích của AOT?', options: ['Khởi động nhanh, không gửi compiler, bắt lỗi template lúc build', 'Luôn tạo bundle nhỏ hơn', 'Không cần TypeScript'], answer: 0, why: 'Bundle có thể lớn hơn với app lớn (code sinh ra); lazy-loading bù lại.' },
    { q: 'Vì sao một @Input() private có thể chạy ở JIT nhưng hỏng ở AOT?', options: ['JavaScript không có private thật; code TypeScript sinh ra từ template đặt ngoài class nên không truy cập được thành viên private', 'Do lỗi', 'Vì AOT không hỗ trợ @Input'], answer: 0, why: 'Template AOT truy cập thành viên từ bên ngoài class.' },
    { q: 'Từ Angular 9 chế độ biên dịch mặc định là?', options: ['JIT', 'AOT', 'Không biên dịch'], answer: 1, why: 'AOT là mặc định, cả khi ng serve.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== trình biên dịch template ===== */
    $('#cp-tpl').value = '<figure>\n  <img [src]="getPonyImageUrl()" alt="pony">\n  <figcaption>{{ ponyModel.name }}</figcaption>\n</figure>';
    $('#cp-ctx').value = "{\n  ponyModel: { name: 'Rainbow Dash', color: 'blue' },\n  getPonyImageUrl() { return 'images/pony-' + this.ponyModel.color + '.png'; }\n}";
    let prog = null, ctx = null;
    const colors = ['blue', 'pink', 'green', 'orange'], names = ['Rainbow Dash', 'Pinkie Pie', 'Fluttershy', 'Applejack'];
    const pre = e => e.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(^|[^\w.$])([A-Za-z_$][\w$]*)/g, (m, str, p, id) => (str ? str : (['true', 'false', 'null', 'undefined'].includes(id) ? m : p + 'ctx.' + id)));
    const ev = (c, expr) => new Function('c', `with(c){return (${expr})}`)(c);

    function compile(tpl) {
      const doc = new DOMParser().parseFromString('<body>' + tpl + '</body>', 'text/html');
      const create = [], update = [], binds = []; let idx = 0, last = 0;
      const pad = d => '    '.repeat(d);
      const plan = [];                                   // mô tả cây để dựng DOM thật
      function walk(parent, depth, out) {
        for (const n of [...parent.childNodes]) {
          if (n.nodeType === 1) {
            const i = idx++, tag = n.localName, st = [], pr = [], ls = [];
            [...n.attributes].forEach(a => { if (/^\[.*\]$/.test(a.name)) pr.push([a.name.slice(1, -1), a.value]); else if (/^\(.*\)$/.test(a.name)) ls.push([a.name.slice(1, -1), a.value]); else st.push([a.name, a.value]); });
            const kids = [...n.childNodes].some(c => c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim()));
            create.push(pad(depth) + `${kids ? 'elementStart' : 'element'}(${i}, '${tag}'${st.length ? ', [' + st.map(([k, v]) => `'${k}', '${v}'`).join(', ') + ']' : ''});`);
            ls.forEach(([e, c]) => create.push(pad(depth + 1) + `listener('${e}', function () { return ${pre(c)}; });`));
            const node = { i, tag, st, ls, kids: [] }; out.push(node);
            pr.forEach(([name, expr]) => { binds.push({ i, kind: 'prop', name, expr, last: undefined }); });
            walk(n, depth + 1, node.kids);
            if (kids) create.push(pad(depth) + 'elementEnd();');
          } else if (n.nodeType === 3 && n.textContent.trim()) {
            const i = idx++, text = n.textContent.replace(/\s+/g, ' ').trim(), parts = text.split(/(\{\{[\s\S]*?\}\})/).filter(Boolean);
            const dyn = parts.some(p => /^\{\{/.test(p));
            create.push(pad(depth) + (dyn ? `text(${i});` : `text(${i}, '${text}');`));
            if (dyn) binds.push({ i, kind: 'text', parts: parts.map(p => (/^\{\{/.test(p) ? { e: p.slice(2, -2).trim() } : { s: p })), last: undefined });
            out.push({ i, text: dyn ? '' : text });
          }
        }
      }
      walk(doc.body, 3, plan);
      binds.forEach(b => {
        const d = b.i - last; last = b.i; if (d) update.push(pad(3) + `advance(${d});`);
        if (b.kind === 'prop') update.push(pad(3) + `property('${b.name}', ${pre(b.expr)});`);
        else { const dynParts = b.parts; update.push(pad(3) + (dynParts.length === 1 ? `textInterpolate(${pre(dynParts[0].e)});` : `textInterpolate${dynParts.filter(p => p.e).length}(${dynParts.map(p => (p.e ? pre(p.e) : `'${p.s}'`)).join(', ')});`)); }
      });
      const code = 'template: (rf, ctx) => {\n  if (rf & 1 /* Create */) {\n' + create.map(l => '  ' + l.slice(6)).join('\n') + '\n  }\n  if (rf & 2 /* Update */) {\n' + update.map(l => '  ' + l.slice(6)).join('\n') + '\n  }\n}';
      return { code, plan, binds };
    }
    function createDom(p, ctx, host) {
      const nodes = [];
      const build = (n, parent) => {
        if (n.tag) {
          const el = document.createElement(n.tag); n.st.forEach(([k, v]) => el.setAttribute(k, v));
          n.ls.forEach(([e, c]) => el.addEventListener(e, () => ev(ctx, c)));
          nodes[n.i] = el; parent.appendChild(el); n.kids.forEach(k => build(k, el));
        } else { const t = document.createTextNode(n.text); nodes[n.i] = t; parent.appendChild(t); }
      };
      host.innerHTML = ''; p.plan.forEach(n => build(n, host)); p.binds.forEach(b => (b.last = undefined)); return nodes;
    }
    let nodes = null; const host = document.createElement('div');
    const log = $('#cp-log'), say = (t, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    function show() { $('#cp-dom').textContent = nodes ? host.innerHTML.replace(/></g, '>\n<') : '(chưa Create)'; }
    function recompile() {
      $('#cp-err').textContent = '';
      try { prog = compile($('#cp-tpl').value); $('#cp-code').textContent = prog.code; ctx = new Function('return (' + $('#cp-ctx').value + ')')(); }
      catch (e) { $('#cp-err').textContent = 'Lỗi: ' + e.message; prog = null; return; }
      nodes = null; log.innerHTML = ''; show();
    }
    $('#cp-tpl').oninput = $('#cp-ctx').oninput = recompile;
    $('#cp-create').onclick = () => { if (!prog) return; nodes = createDom(prog, ctx, host); say('Create: dựng ' + nodes.filter(Boolean).length + ' node (chạy 1 lần)', 'ok'); show(); };
    $('#cp-update').onclick = () => {
      if (!prog) return; if (!nodes) return say('(hãy Create trước)', 'dim');
      let writes = 0, evals = 0;
      prog.binds.forEach(b => {
        try {
          if (b.kind === 'prop') {
            const v = ev(ctx, b.expr); evals++;
            if (v !== b.last) { nodes[b.i][b.name] = v; if (v != null && typeof v !== 'object') nodes[b.i].setAttribute(b.name, v); say(`property('${b.name}'): ${JSON.stringify(b.last)} → ${JSON.stringify(v)}  ✍ ghi DOM`, 'ok'); b.last = v; writes++; }
            else say(`property('${b.name}'): không đổi → bỏ qua`, 'dim');
          } else {
            const s = b.parts.map(p => (p.e ? ev(ctx, p.e) : p.s)).join(''); evals++;
            if (s !== b.last) { nodes[b.i].textContent = s; say(`textInterpolate: ${JSON.stringify(b.last)} → ${JSON.stringify(s)}  ✍ ghi DOM`, 'ok'); b.last = s; writes++; }
            else say('textInterpolate: không đổi → bỏ qua', 'dim');
          }
        } catch (e) { say('Lỗi biểu thức: ' + e.message, 'err'); }
      });
      say(`— ${evals} biểu thức được đánh giá, ${writes} lần ghi DOM`, 'dim'); show();
    };
    $('#cp-rename').onclick = () => { if (!ctx || !ctx.ponyModel) return; ctx.ponyModel.name = names[(names.indexOf(ctx.ponyModel.name) + 1) % names.length]; say('(code) ponyModel.name = ' + ctx.ponyModel.name, 'dim'); };
    $('#cp-color').onclick = () => { if (!ctx || !ctx.ponyModel) return; ctx.ponyModel.color = colors[(colors.indexOf(ctx.ponyModel.color) + 1) % colors.length]; say('(code) ponyModel.color = ' + ctx.ponyModel.color, 'dim'); };
    recompile();

    /* ===== JIT vs AOT ===== */
    function jit() {
      const n = +$('#jt-n').value, dev = +$('#jt-dev').value, mbps = +$('#jt-net').value; $('#jt-nv').textContent = n;
      const base = 450 + 2 * n, compiler = 250;
      const sizeJ = base + compiler + 2 * n, sizeA = base + 5 * n, comp = 0.3;
      const dl = kb => 3 * 70 + kb * comp * 1024 * 8 / (mbps * 1e6) * 1000, parse = kb => kb * 0.6 * dev;
      const J = { kb: sizeJ, dl: dl(sizeJ), parse: parse(sizeJ), compile: 0.8 * n * dev }, A = { kb: sizeA, dl: dl(sizeA), parse: parse(sizeA), compile: 0 };
      [J, A].forEach(x => (x.total = x.dl + x.parse + x.compile));
      const f = ms => (ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : Math.round(ms) + ' ms');
      const max = Math.max(J.total, A.total), bar = x => `<div class="timeline" style="height:30px"><div class="bar" style="left:0;width:${x.dl / max * 100}%;background:#3aa0ff">tải</div><div class="bar" style="left:${x.dl / max * 100}%;width:${x.parse / max * 100}%;background:#f39b3d">parse</div><div class="bar" style="left:${(x.dl + x.parse) / max * 100}%;width:${x.compile / max * 100}%;background:#e5484d">biên dịch</div></div>`;
      const cross = Math.round(compiler / 3);
      $('#jt-out').innerHTML = `<table><tr><th></th><th>JIT</th><th>AOT</th></tr>
        <tr><td>JS gửi đi</td><td>${Math.round(J.kb)} KB</td><td>${Math.round(A.kb)} KB</td></tr>
        <tr><td>Tải</td><td>${f(J.dl)}</td><td>${f(A.dl)}</td></tr><tr><td>Parse JS</td><td>${f(J.parse)}</td><td>${f(A.parse)}</td></tr>
        <tr><td>Biên dịch template</td><td>${f(J.compile)}</td><td>0</td></tr><tr><td><b>Tổng đến khi chạy</b></td><td><b>${f(J.total)}</b></td><td><b>${f(A.total)}</b></td></tr></table>
        <div>JIT</div>${bar(J)}<div>AOT</div>${bar(A)}
        <p class="hint">Kích thước: AOT lớn hơn JIT khi số component &gt; ~${cross} (code sinh ra 5 KB so với HTML 2 KB mỗi component, bù bởi compiler 250 KB). Nhưng thời gian khởi động của AOT vẫn thấp hơn vì không phải biên dịch.</p>`;
    }
    root.querySelectorAll('#w-jit input, #w-jit select').forEach(e => (e.oninput = e.onchange = jit)); jit();

    /* ===== lỗi AOT ===== */
    const CASES = [
      { t: '<img [src]="getPonyImageUr()">', d: 'Gõ nhầm tên method', need: 1, aot: "error TS2551: Property 'getPonyImageUr' does not exist on type 'PonyComponent'.", jit: 'Lỗi chỉ xuất hiện lúc chạy: TypeError: ctx.getPonyImageUr is not a function' },
      { t: '@Input() private pony  →  {{ pony.name }}', d: '@Input private dùng trong template', need: 1, aot: "error TS2341: Property 'pony' is private and only accessible within class 'PonyComponent'.", jit: 'Chạy bình thường (JS không có private thật)' },
      { t: '<ns-ponny [pony]="p"></ns-ponny>', d: 'Gõ nhầm tên selector', need: 1, aot: "error NG8001: 'ns-ponny' is not a known element.", jit: 'Chỉ cảnh báo/ lỗi ở console lúc chạy; phần tử không hiển thị' },
      { t: '<img [srcc]="url">', d: 'Binding vào thuộc tính không tồn tại', need: 1, aot: "error NG8002: Can't bind to 'srcc' since it isn't a known property of 'img'.", jit: 'Lỗi lúc chạy khi tạo view' },
      { t: '<ns-pony [pony]="\'yes\'">  <!-- pony: PonyModel -->', d: 'Truyền sai kiểu vào @Input', need: 2, aot: "error TS2322: Type 'string' is not assignable to type 'PonyModel'.", jit: 'Không phát hiện: lỗi logic âm thầm' },
      { t: '<input (input)="save($event.target.value)">', d: '$event.target có thể null', need: 2, aot: "error TS2531: Object is possibly 'null'. ($event.target)", jit: 'Chạy được' }
    ];
    function aot() {
      const m = $('#ao-mode').value, lvl = m === 'jit' ? 0 : m === 'aot' ? 1 : 2;
      $('#ao-table').innerHTML = '<tr><th>Template</th><th>Tình huống</th><th>Kết quả</th></tr>' + CASES.map(c => {
        const ok = lvl >= c.need;
        return `<tr><td class="mono" style="font-size:12.5px">${esc(c.t)}</td><td>${c.d}</td><td>${ok ? `<span class="pill fulfilled">✓ lúc build</span><div class="mono hint" style="font-size:12px;margin-top:4px">${esc(c.aot)}</div>` : `<span class="pill rejected">✖ lọt qua build</span><div class="hint" style="margin-top:4px">${esc(lvl === 0 ? c.jit : (c.need === 2 ? 'AOT mặc định không kiểm tra kiểu input/sự kiện: ' + c.jit : c.jit))}</div>`}</td></tr>`;
      }).join('');
    }
    $('#ao-mode').onchange = aot; aot();
  }
});
