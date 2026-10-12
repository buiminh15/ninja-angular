registerChapter(15, {
  time: '30 phút',
  lead: 'CSS vốn “chảy” (cascade) khắp trang — đôi khi bạn muốn, đôi khi không. Angular có <b>style encapsulation</b>: style của component chỉ áp dụng cho component đó. Trong chương này, bạn sẽ chạy <b>cả ba chiến lược thật</b> trong trình duyệt và nhìn DOM bên dưới.',
  sections: [
    {
      id: 'why', title: 'Vấn đề: CSS chảy tứ tung',
      html: `
<p>Muốn tô đỏ phần tử được chọn trong một danh sách, bạn viết selector thật hẹp (<code>li.selected</code>, hay quy ước BEM) để khỏi ảnh hưởng chỗ khác. Angular làm hộ việc này: style bạn khai báo trong component (<code>styles</code> hoặc <code>styleUrls</code>) được <b>giới hạn trong component đó</b>.</p>
<p>Cách thức phụ thuộc thuộc tính <code>encapsulation</code> của <code>@Component</code>:</p>
<div class="tablewrap"><table>
<tr><th>Giá trị</th><th>Cách làm</th><th>Ghi chú</th></tr>
<tr><td><code>Emulated</code> (mặc định)</td><td>Viết lại selector + gắn attribute duy nhất vào phần tử</td><td>Hoạt động mọi trình duyệt, giả lập Shadow DOM</td></tr>
<tr><td><code>ShadowDom</code></td><td>Dùng Shadow DOM thật của trình duyệt</td><td>Cô lập hoàn toàn cả hai chiều</td></tr>
<tr><td><code>None</code></td><td>Không bọc gì, style thành toàn cục</td><td>Style “chảy” vào con và cả chỗ khác</td></tr>
</table></div>
<textarea class="code" data-lang="ts" data-title="Component dùng ví dụ trong sách">
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ns-pony',
  template: \`<div class="red">{{ name }}</div>\`,
  styles: [\`.red { color: red; }\`],
  encapsulation: ViewEncapsulation.Emulated      // mặc định; có thể đổi ShadowDom / None
})
export class PonyComponent { name = 'Rainbow Dash'; }
</textarea>
<div class="box info"><b>Lưu ý lịch sử</b><p>Sách còn nhắc <code>ViewEncapsulation.Native</code> (Shadow DOM v0) — đã bị loại bỏ. Chỉ còn ba giá trị ở bảng trên.</p></div>`
    },
    {
      id: 'lab', title: 'Phòng thí nghiệm encapsulation (chạy thật)',
      html: `
<p>Hai component lồng nhau, <b>cùng dùng class <code>.red</code></b> nhưng style khác nhau:</p>
<div class="flow">
  <div class="node">ns-parent<small>.red { color: red; font-weight: bold }<br>:host { border: solid }</small></div><span class="arr">chứa</span>
  <div class="node">ns-child<small>.red { background: gold }<br>:host { border: dashed }</small></div>
</div>
<p>Chọn chiến lược cho từng component và xem: (1) giao diện thật, (2) DOM mà Angular tạo ra, (3) CSS sau khi xử lý.</p>

<div class="widget" id="w-enc">
  <h4>🧪 Chọn chiến lược</h4>
  <div class="row" style="margin-bottom:10px">
    <label>ns-parent: <select id="en-p"></select></label>
    <label>ns-child: <select id="en-c"></select></label>
    <label><input type="checkbox" id="en-g"> Thêm style toàn cục <code>.red { text-decoration: underline }</code> (như <code>styles.css</code>)</label>
  </div>
  <div class="row" style="margin-bottom:12px" id="en-presets"></div>
  <b>① Kết quả hiển thị</b>
  <div id="en-mount" style="padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);margin:6px 0 14px"></div>
  <b>② DOM (như trong DevTools)</b>
  <pre class="hl" id="en-dom" style="border-radius:8px;margin:6px 0 14px;font-size:12.5px"></pre>
  <b>③ &lt;style&gt; được chèn vào &lt;head&gt;</b>
  <pre class="hl" id="en-css" style="border-radius:8px;margin:6px 0 0;font-size:12.5px"></pre>
  <div id="en-note" class="box info" style="margin-top:12px"></div>
</div>
<div class="box tip"><b>Thử theo thứ tự này</b><ol>
<li><b>Emulated + Emulated</b>: parent chữ đỏ đậm, child chỉ nền vàng. Quan sát các attribute <code>_ngcontent-…</code> và selector đã bị viết lại.</li>
<li><b>None + None</b>: giờ child cũng đỏ đậm, parent cũng nền vàng — style rò rỉ lẫn nhau. <code>:host</code> không hoạt động.</li>
<li><b>ShadowDom + ShadowDom</b>: kết quả giống Emulated nhưng DOM có <code>#shadow-root</code>; style nằm <i>bên trong</i> mỗi component, không có gì trong <code>&lt;head&gt;</code>.</li>
<li>Bật <b>style toàn cục</b> rồi so sánh: Emulated/None bị gạch chân, ShadowDom thì <b>không</b> (Shadow DOM chặn cả style từ ngoài vào).</li></ol></div>`
    },
    {
      id: 'emulated', title: 'Emulated – cách hoạt động',
      html: `
<p>Angular lấy CSS của component, <b>viết lại selector</b> thêm một attribute duy nhất, rồi nhét vào <code>&lt;head&gt;</code>. Đồng thời mọi phần tử trong template của component được gắn đúng attribute đó:</p>
<textarea class="code" data-lang="html" data-title="Kết quả (từ sách)">
<head>
  <style>.red[_ngcontent-dvb-3] { color: red }</style>
</head>
<body>
  <ns-pony _ngcontent-dvb-2="" _nghost-dvb-3="">
    <div _ngcontent-dvb-3="" class="red">Rainbow Dash</div>
  </ns-pony>
</body>
</textarea>
<ul>
<li><code>.red</code> ➜ <code>.red[_ngcontent-dvb-3]</code>: chỉ khớp phần tử có cả class lẫn attribute.</li>
<li><code>_ngcontent-dvb-2</code>: định danh của component <b>cha</b> (vì <code>&lt;ns-pony&gt;</code> nằm trong template của cha).</li>
<li><code>_nghost-dvb-3</code>: định danh của chính host — dùng cho <code>:host</code>.</li>
</ul>
<p>Hàm viết lại selector (rút gọn) chính là thứ chạy trong widget phía trên — thử riêng:</p>
<textarea class="live" data-title="Viết lại selector như Angular Emulated (rút gọn)">
function rewrite(selector, id) {
  return selector.split(',').map(sel =>
    sel.trim().split(/(\s*[>+~]\s*|\s+)/).map((part, i) => {
      if (i % 2) return part;                                   // dấu nối giữa các phần
      return part.startsWith(':host') ? part.replace(':host', '[_nghost-' + id + ']')
                                      : part + '[_ngcontent-' + id + ']';
    }).join('')
  ).join(', ');
}
console.log(rewrite('.red', 'dvb-3'));
console.log(rewrite(':host', 'dvb-3'));
console.log(rewrite('ul li.selected', 'dvb-3'));
console.log(rewrite('.a > .b, .c', 'dvb-3'));
</textarea>`
    },
    {
      id: 'shadow', title: 'ShadowDom – Shadow DOM thật',
      html: `
<p>Với <code>ShadowDom</code>, Angular gọi <code>host.attachShadow()</code>, đặt <code>&lt;style&gt;</code> và template vào trong <b>shadow root</b>. Trình duyệt tự cô lập: style bên trong không thoát ra, style bên ngoài không lọt vào. Xem trực tiếp:</p>
<textarea class="live" data-title="Shadow DOM bằng JavaScript thuần">
const host = document.createElement('ns-pony');
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = '<style>.red { color: red }</style><div class="red">Rainbow Dash</div>';
document.body.appendChild(host);                       // gắn tạm vào trang

console.log('tìm .red từ bên ngoài  :', host.querySelector('.red'));              // null – bị che
console.log('tìm .red trong shadow  :', shadow.querySelector('.red').textContent);
console.log('màu chữ tính toán      :', getComputedStyle(shadow.querySelector('.red')).color);

// Style toàn cục KHÔNG lọt vào shadow root
const global = document.createElement('style');
global.textContent = '.red { text-decoration: underline }';
document.head.appendChild(global);
console.log('gạch chân từ style ngoài:', getComputedStyle(shadow.querySelector('.red')).textDecorationLine);  // none

// Nhưng CSS custom properties thì "xuyên" qua được
host.style.setProperty('--pony-color', 'purple');
shadow.innerHTML = '<style>.p { color: var(--pony-color, black) }</style><div class="p">themed</div>';
console.log('qua CSS variable        :', getComputedStyle(shadow.querySelector('.p')).color);

global.remove(); host.remove();                         // dọn dẹp
</textarea>
<div class="box tip"><b>Mẹo theme</b><p>Muốn component dễ tuỳ biến từ bên ngoài mà vẫn cô lập, hãy để lộ <b>CSS custom properties</b> (<code>--pony-color</code>). Đó là “cửa sổ” hợp lệ xuyên qua Shadow DOM — và cách làm design system hiện đại.</p></div>`
    },
    {
      id: 'host', title: 'Style cho host: :host',
      html: `
<p>Phần tử host (<code>&lt;ns-pony&gt;</code>) là phần tử tuỳ chỉnh, mặc định <code>display: inline</code>. Dùng <code>:host</code> trong CSS component để định kiểu cho chính nó:</p>
<textarea class="code" data-lang="css">
:host {
  display: block;           /* thường là việc đầu tiên bạn làm */
  border: 1px solid #ccc;
}
:host(.selected) { background: #eef; }      /* khi host có class selected */
:host-context(.dark) { color: white; }      /* khi một tổ tiên có class dark */
</textarea>
<ul>
<li>ShadowDom: giữ nguyên <code>:host</code>.</li>
<li>Emulated: viết lại thành <code>[_nghost-xxx]</code> (xem widget).</li>
<li>None: <b>không</b> được viết lại → <code>:host</code> vô tác dụng.</li>
</ul>
<div class="box warn"><b>Phá encapsulation: <code>::ng-deep</code></b><p>Muốn style của cha “chọc” xuống con (khi Emulated) người ta dùng <code>:host ::ng-deep .child-class { ... }</code>. Tính năng này <b>được đánh dấu deprecated</b> nhưng vẫn còn dùng nhiều (nhất là khi tuỳ biến thư viện UI). Ưu tiên: CSS variables, hoặc thêm <code>@Input</code> để con tự đổi style.</p></div>
<div class="box info"><b>Cấu hình toàn cục</b><p>Style cho cả app đặt trong <code>styles.css</code> (khai báo ở <code>angular.json</code>). Có thể đổi chiến lược mặc định cho cả app qua <code>bootstrapApplication</code>/provider, hoặc từng component qua <code>encapsulation</code>.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-pony',
  templateUrl: './pony.component.html',
  styleUrl: './pony.component.css'        // dạng số ít (v17+), thay styleUrls: [...]
})
</textarea></div>`
    }
  ],
  quiz: [
    { q: 'Chiến lược encapsulation mặc định?', options: ['None', 'Emulated', 'ShadowDom'], answer: 1, why: 'Emulated: an toàn mọi trình duyệt, giả lập Shadow DOM bằng attribute duy nhất.' },
    { q: 'Với Emulated, <code>.red</code> bị viết lại thành?', options: ['.red[_ngcontent-xxx]', '#red', '.red-xxx'], answer: 0, why: 'Thêm attribute duy nhất; phần tử trong template cũng được gắn attribute đó.' },
    { q: 'Với None, điều gì xảy ra với style của component?', options: ['Chỉ áp dụng cho component đó', 'Trở thành style toàn cục, có thể rò rỉ sang chỗ khác', 'Bị bỏ qua'], answer: 1, why: 'None không bọc/viết lại gì — như CSS thường.' },
    { q: 'Style toàn cục <code>.red { text-decoration: underline }</code> có tác động tới component ShadowDom?', options: ['Có', 'Không (Shadow DOM chặn style từ ngoài)', 'Chỉ với :host'], answer: 1, why: 'Shadow DOM cô lập hai chiều; chỉ CSS custom properties xuyên qua được.' },
    { q: 'Để style chính phần tử host của component, dùng?', options: [':host', '::root', ':self'], answer: 0, why: ':host đến từ chuẩn Web Components; Emulated viết lại thành [_nghost-xxx].' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const SUF = 'dvb';

    const COMPS = {
      parent: { tag: 'ns-parent', id: 2, tpl: '<div class="red">Parent: Rainbow Dash</div><ns-child></ns-child>',
        css: ':host { display: block; border: 2px solid #5b6cff; padding: 8px; }\n.red { color: red; font-weight: bold; }' },
      child: { tag: 'ns-child', id: 3, tpl: '<div class="red">Child: Pinkie Pie</div>',
        css: ':host { display: block; border: 2px dashed #2fb67c; padding: 6px; margin-top: 6px; }\n.red { background: gold; }' }
    };
    const STRATS = ['Emulated', 'ShadowDom', 'None'];
    ['#en-p', '#en-c'].forEach(id => { $(id).innerHTML = STRATS.map(s => `<option>${s}</option>`).join(''); });

    function rewriteSel(sel, id) {
      return sel.split(',').map(s => s.trim().split(/(\s*[>+~]\s*|\s+)/).map((p, i) =>
        i % 2 ? p : p.startsWith(':host') ? p.replace(':host', `[_nghost-${SUF}-${id}]`) : `${p}[_ngcontent-${SUF}-${id}]`).join('')).join(', ');
    }
    function rewriteCss(css, id) { return css.replace(/([^{}]+)\{([^}]*)\}/g, (m, sel, body) => `${rewriteSel(sel, id)} {${body}}
`).trim(); }

    const clearStyles = () => document.head.querySelectorAll('style[data-enc]').forEach(s => s.remove());
    // dọn khi rời trang để style None không rò rỉ sang chương khác
    if (!window.__encCleanup) { window.__encCleanup = true; window.addEventListener('hashchange', clearStyles); }

    const headStyles = [];
    function renderComp(key, hostEl, strategy, parentId) {
      const c = COMPS[key];
      let container = hostEl, css = c.css;
      if (strategy === 'Emulated') {
        hostEl.setAttribute(`_nghost-${SUF}-${c.id}`, '');
        css = rewriteCss(c.css, c.id);
      }
      if (parentId && strategy !== 'ShadowDom') { /* attr cha đã gắn khi tạo host */ }
      if (strategy === 'ShadowDom') {
        container = hostEl.attachShadow({ mode: 'open' });
        const st = document.createElement('style'); st.textContent = c.css; container.appendChild(st);
      } else {
        const st = document.createElement('style'); st.setAttribute('data-enc', c.tag); st.textContent = css; document.head.appendChild(st);
        headStyles.push(`/* ${c.tag} — ${strategy} */\n${css}`);
      }
      const wrap = document.createElement('div'); wrap.innerHTML = c.tpl;
      const nodes = [...wrap.childNodes];
      nodes.forEach(n => { if (n.nodeType === 1 && strategy === 'Emulated') { n.setAttribute(`_ngcontent-${SUF}-${c.id}`, ''); n.querySelectorAll('*').forEach(e => e.setAttribute(`_ngcontent-${SUF}-${c.id}`, '')); } container.appendChild(n); });
      return container;
    }

    const dump = (node, ind = 0) => {
      const pad = '  '.repeat(ind); let out = '';
      if (node.nodeType === 3) { const t = node.textContent.trim(); return t ? pad + t + '\n' : ''; }
      if (node.nodeType !== 1) return '';
      const attrs = [...node.attributes].map(a => ` ${a.name}="${a.value}"`).join('');
      out += `${pad}<${node.localName.toLowerCase()}${attrs}>\n`;
      if (node.shadowRoot) { out += `${pad}  #shadow-root (open)\n`; node.shadowRoot.childNodes.forEach(n => (out += dump(n, ind + 2))); }
      node.childNodes.forEach(n => (out += dump(n, ind + 1)));
      return out;
    };

    function draw() {
      clearStyles(); headStyles.length = 0;
      const sp = $('#en-p').value, sc = $('#en-c').value, mount = $('#en-mount');
      mount.innerHTML = '';
      if ($('#en-g').checked) { const g = document.createElement('style'); g.setAttribute('data-enc', 'global'); g.textContent = '.red { text-decoration: underline; }'; document.head.appendChild(g); headStyles.push('/* styles.css (toàn cục) */\n.red { text-decoration: underline; }'); }

      const pHost = document.createElement('ns-parent');
      if (sp === 'Emulated' || sc === 'Emulated') pHost.setAttribute(`_ngcontent-${SUF}-1`, '');    // host nằm trong template của root
      mount.appendChild(pHost);
      const pBody = renderComp('parent', pHost, sp);
      const cHost = pBody.querySelector('ns-child');
      if (sp === 'Emulated') cHost.setAttribute(`_ngcontent-${SUF}-${COMPS.parent.id}`, '');        // cha cung cấp attribute cho host của con
      renderComp('child', cHost, sc);

      $('#en-dom').textContent = '<app-root>\n' + dump(pHost, 1);
      $('#en-css').textContent = headStyles.length ? headStyles.join('\n\n') : '/* (không có <style> nào trong <head> — style nằm trong shadow root) */';

      const notes = [];
      if (sp === 'None' || sc === 'None') notes.push('<b>None</b>: CSS không bị viết lại → thành toàn cục, nên <code>.red</code> của parent và child đè lên nhau; <code>:host</code> không được hỗ trợ (host không có border).');
      if (sp === 'Emulated' || sc === 'Emulated') notes.push('<b>Emulated</b>: selector bị thêm <code>[_ngcontent-' + SUF + '-n]</code>; <code>:host</code> thành <code>[_nghost-' + SUF + '-n]</code>. Phần tử của component khác không khớp nên không bị ảnh hưởng. Style toàn cục vẫn chảy vào.');
      if (sp === 'ShadowDom' || sc === 'ShadowDom') notes.push('<b>ShadowDom</b>: style và template nằm trong <code>#shadow-root</code>; không rò ra ngoài, và style toàn cục không lọt vào.');
      $('#en-note').innerHTML = notes.join('<br>');
    }
    const sets = [['Emulated + Emulated', 'Emulated', 'Emulated'], ['None + None', 'None', 'None'], ['ShadowDom + ShadowDom', 'ShadowDom', 'ShadowDom'], ['Parent None, Child Emulated', 'None', 'Emulated']];
    sets.forEach(s => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = s[0]; b.onclick = () => { $('#en-p').value = s[1]; $('#en-c').value = s[2]; draw(); }; $('#en-presets').appendChild(b); });
    root.querySelectorAll('#w-enc select, #w-enc input').forEach(e => (e.onchange = draw));
    draw();
  }
});
