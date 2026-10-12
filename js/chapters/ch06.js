registerChapter(6, {
  time: '35 phút',
  lead: 'Bạn không cần biết Web Components để viết Angular. Nhưng nhiều lựa chọn của Angular (selector có dấu gạch, <code>:host</code>, <code>ViewEncapsulation.ShadowDom</code>, input/output…) sinh ra từ đây. Và điều tuyệt vời: <b>trình duyệt của bạn chạy được Web Components thật</b>, nên mọi ví dụ dưới đây là code thật, không phải mô phỏng.',
  sections: [
    {
      id: 'intro', title: 'Thế giới mới: component dùng lại và đóng gói',
      html: `
<p>Component luôn là giấc mơ của lập trình: lấy một thứ có sẵn thả vào app là chạy. Trước đây ta có “component” nhưng phải kéo theo cả jQuery, Dojo, AngularJS… — những thư viện bạn có thể không muốn. <b>Web Components</b> giải quyết bằng <b>chuẩn của trình duyệt</b>, gồm ba đặc tả:</p>
<div class="tablewrap"><table>
<tr><th>Đặc tả</th><th>Giải quyết gì</th><th>API chính</th></tr>
<tr><td><b>Custom Elements</b></td><td>Tự tạo phần tử HTML của riêng mình: <code>&lt;ns-pony&gt;</code></td><td><code>customElements.define()</code>, <code>HTMLElement</code></td></tr>
<tr><td><b>Shadow DOM</b></td><td>Đóng gói DOM và CSS: bên trong không rò ra ngoài và ngược lại</td><td><code>attachShadow()</code></td></tr>
<tr><td><b>Template</b></td><td>Khối HTML “ngủ đông”, nhân bản khi cần</td><td><code>&lt;template&gt;</code>, <code>importNode()</code></td></tr>
</table></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Sách viết khi Web Components “có thể phải chờ vài năm”. Giờ chúng được <b>mọi trình duyệt hiện đại</b> hỗ trợ và dùng thật (Lit, Stencil, các design system lớn…). Polyfill gần như không còn cần thiết.</p></div>`
    },
    {
      id: 'custom', title: 'Custom Elements',
      html: `
<p>Khai báo bằng <code>customElements.define(tên, class)</code>. Tên <b>phải có dấu gạch ngang</b> để trình duyệt biết đó là custom element. Class kế thừa <code>HTMLElement</code> và có các <b>callback vòng đời</b>:</p>
<div class="tablewrap"><table>
<tr><th>Callback</th><th>Khi nào</th></tr>
<tr><td><code>constructor()</code></td><td>Phần tử được tạo (chưa nên đụng vào thuộc tính/con)</td></tr>
<tr><td><code>connectedCallback()</code></td><td>Được <b>chèn vào DOM</b> — tương tự <code>ngOnInit</code></td></tr>
<tr><td><code>disconnectedCallback()</code></td><td>Bị <b>gỡ khỏi DOM</b> — tương tự <code>ngOnDestroy</code> (dọn dẹp)</td></tr>
<tr><td><code>attributeChangedCallback(tên, cũ, mới)</code></td><td>Một attribute trong <code>observedAttributes</code> đổi — tương tự <code>ngOnChanges</code></td></tr>
<tr><td><code>adoptedCallback()</code></td><td>Chuyển sang document khác (hiếm)</td></tr>
</table></div>
<textarea class="live" data-title="Custom element đầu tiên — chạy thật trong trình duyệt của bạn">
const tag = 'ns-pony-' + Math.random().toString(36).slice(2, 7);   // mỗi lần chạy dùng tên mới (không define lại được cùng tên)

class PonyComponent extends HTMLElement {
  constructor() { super(); console.log('constructor: "I\\'m a pony!"'); }
  connectedCallback() { console.log('connectedCallback: được chèn vào DOM'); this.innerHTML = '<h1>General Soda</h1>'; }
  disconnectedCallback() { console.log('disconnectedCallback: bị gỡ khỏi DOM'); }
}
customElements.define(tag, PonyComponent);

const el = document.createElement(tag);          // → constructor
console.log('trước khi chèn:', el.outerHTML);
document.body.appendChild(el);                    // → connectedCallback
console.log('sau khi chèn  :', el.outerHTML);
el.remove();                                      // → disconnectedCallback
</textarea>
<h3>Attribute và thuộc tính</h3>
<textarea class="live" data-title="observedAttributes + attributeChangedCallback (tương tự @Input + ngOnChanges)">
const tag = 'ns-pony-' + Math.random().toString(36).slice(2, 7);

class PonyComponent extends HTMLElement {
  static get observedAttributes() { return ['name']; }                 // chỉ theo dõi attribute khai báo ở đây
  attributeChangedCallback(attr, oldV, newV) {
    console.log('attributeChanged:', attr, JSON.stringify(oldV), '→', JSON.stringify(newV));
    this.textContent = 'Pony: ' + newV;
  }
  get name() { return this.getAttribute('name'); }                      // thuộc tính JS phản chiếu attribute
  set name(v) { this.setAttribute('name', v); }
}
customElements.define(tag, PonyComponent);

const el = document.createElement(tag);
el.setAttribute('name', 'Rainbow Dash');   // attribute → callback
el.name = 'Pinkie Pie';                    // thuộc tính JS → setAttribute → callback
console.log(el.outerHTML);
</textarea>
<div class="box info"><b>Vì sao Angular đặt selector kiểu <code>ns-pony</code>?</b><p>Chính là quy ước tên custom element: tiền tố riêng + dấu gạch ngang, không đụng thẻ HTML thật.</p></div>`
    },
    {
      id: 'shadow', title: 'Shadow DOM',
      html: `
<p>Nếu chỉ gán <code>innerHTML</code>, CSS và JavaScript của app có thể vô tình phá component. <b>Shadow DOM</b> đóng gói phần bên trong: bạn chỉ thấy <code>&lt;ns-pony&gt;&lt;/ns-pony&gt;</code>, còn nội dung nằm trong một <b>shadow root</b> — một rào chắn <b>hai chiều</b>:</p>
<ul>
<li>CSS của trang <b>không</b> áp vào bên trong; CSS bên trong <b>không</b> rò ra ngoài.</li>
<li><code>document.querySelector</code> từ bên ngoài <b>không thấy</b> các phần tử bên trong.</li>
</ul>
<textarea class="live" data-title="Rào chắn của Shadow DOM — kiểm chứng bằng code">
const tag = 'ns-pony-' + Math.random().toString(36).slice(2, 7);

class PonyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const title = document.createElement('h1');
    title.textContent = 'General Soda';
    shadow.appendChild(title);
  }
}
customElements.define(tag, PonyComponent);

// Style của trang nhắm vào MỌI h1 …
const pageStyle = document.createElement('style');
pageStyle.textContent = 'h1 { color: red !important; }';
document.head.appendChild(pageStyle);

const el = document.createElement(tag);
document.body.appendChild(el);

console.log('DOM nhìn từ ngoài :', el.outerHTML);                                  // không thấy h1
console.log('querySelector("h1") trong element:', el.querySelector('h1'));        // null — bị che
console.log('qua shadowRoot (mode open):', el.shadowRoot.querySelector('h1').textContent);
console.log('màu chữ h1 bên trong:', getComputedStyle(el.shadowRoot.querySelector('h1')).color, '(KHÔNG đỏ — style trang không lọt vào)');

pageStyle.remove(); el.remove();
</textarea>
<div class="box tip"><b>Nối với chương 15</b><p><code>ViewEncapsulation.ShadowDom</code> của Angular dùng chính cái này; <code>Emulated</code> giả lập nó bằng attribute <code>_ngcontent-xxx</code> cho trình duyệt cũ; <code>:host</code> là pseudo-class của Shadow DOM để style phần tử chủ. <code>mode: 'open'</code> cho phép <code>el.shadowRoot</code>; <code>'closed'</code> thì trả <code>null</code>.</p></div>`
    },
    {
      id: 'template', title: '&lt;template&gt;: khối HTML ngủ đông',
      html: `
<p>Nội dung trong <code>&lt;template&gt;</code> <b>không hiển thị và “chết”</b>: script không chạy, ảnh không tải, <code>getElementById</code> không tìm thấy. Chỉ khi <b>nhân bản</b> (<code>importNode(template.content, true)</code>) rồi gắn vào đâu đó nó mới sống. Đây là cách chuẩn dựng giao diện của Web Component:</p>
<textarea class="live" data-title="Template + Shadow DOM + custom element">
const tag = 'ns-pony-' + Math.random().toString(36).slice(2, 7);

const template = document.createElement('template');
template.innerHTML = '<style>h1 { color: orange; }</style><h1 id="inner-h1">General Soda</h1><img src="x.png" alt="pony">';
template.id = 'pony-template';
document.body.appendChild(template);

console.log('phần tử <template> có trong DOM:', !!document.getElementById('pony-template'));
console.log('nhưng nội dung bên trong thì inert → getElementById("inner-h1"):', document.getElementById('inner-h1'), '| template.content có h1:', !!template.content.querySelector('h1'));

class PonyComponent extends HTMLElement {
  constructor() {
    super();
    const tpl = document.querySelector('#pony-template');
    const cloned = document.importNode(tpl.content, true);     // nhân bản (true = cả cây con)
    this.attachShadow({ mode: 'open' }).appendChild(cloned);
  }
}
customElements.define(tag, PonyComponent);

const a = document.createElement(tag), b = document.createElement(tag);   // hai instance dùng chung một template
document.body.append(a, b);
console.log('instance a:', a.shadowRoot.innerHTML);
console.log('a và b khác nhau?', a.shadowRoot.firstElementChild !== b.shadowRoot.firstElementChild);

a.remove(); b.remove(); template.remove();
</textarea>`
    },
    {
      id: 'lab', title: 'Phòng thí nghiệm Web Component',
      html: `
<p>Một custom element <code>&lt;ns-pony-lab&gt;</code> thật (đã đăng ký trong trình duyệt) với attribute <code>name</code>/<code>color</code>. Có style “của trang” nhắm mọi <code>h1</code> trong khung bên dưới. Thử bật/tắt Shadow DOM và xem rào chắn hoạt động.</p>
<style>
#w-wc .stage h1 { text-decoration: underline; letter-spacing: 2px; }   /* "CSS của trang" */
#w-wc .stage { border: 1px dashed var(--border); border-radius: 10px; padding: 12px; background: var(--surface); }
</style>
<div class="widget" id="w-wc">
  <h4>🧬 &lt;ns-pony-lab&gt;</h4>
  <div class="row" style="margin-bottom:10px">
    <label><input type="checkbox" id="wc-shadow" checked> dùng Shadow DOM</label>
    <label><input type="checkbox" id="wc-tpl" checked> dựng từ &lt;template&gt;</label>
    <button class="btn" id="wc-make">＋ Tạo element &amp; chèn</button>
    <button class="btn alt" id="wc-rename">setAttribute('name', …)</button>
    <button class="btn alt" id="wc-color">setAttribute('color', …)</button>
    <button class="btn alt" id="wc-remove">Gỡ khỏi DOM</button>
    <button class="btn alt" id="wc-clear">Xoá hết</button>
  </div>
  <div class="grid2">
    <div><b>Sân khấu</b> <span class="hint">(CSS trang: <code>.stage h1 { underline; letter-spacing }</code>)</span><div class="stage" id="wc-stage" style="margin-top:6px;min-height:100px"></div>
      <div id="wc-q" class="hint" style="margin-top:8px"></div></div>
    <div><b>Callback vòng đời</b><div class="output" id="wc-log" style="border-radius:8px;height:200px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>
<div class="box tip"><b>Quan sát</b><ul>
<li><b>Có Shadow DOM</b>: tiêu đề màu theo attribute <code>color</code> và <b>không</b> bị gạch chân — style trang không lọt vào. Ô “truy vấn” cho thấy <code>stage.querySelector('h1')</code> trả <code>null</code>.</li>
<li><b>Không Shadow DOM</b>: tiêu đề bị gạch chân + giãn chữ (style trang tác động), và <code>querySelector('h1')</code> tìm thấy.</li>
<li><code>setAttribute</code> kích hoạt <code>attributeChangedCallback</code>; gỡ khỏi DOM kích hoạt <code>disconnectedCallback</code>.</li></ul></div>`
    },
    {
      id: 'frameworks', title: 'Thư viện trên nền Web Components, và Angular Elements',
      html: `
<p>Viết custom element bằng tay khá dài dòng. Các thư viện giúp: <b>Lit</b> (kế tục Polymer/LitElement), <b>Stencil</b>, X-Tag… Chúng thêm binding, thuộc tính phản ứng, sự kiện tuỳ chỉnh, lặp phần tử… Ví dụ Lit:</p>
<textarea class="code" data-lang="ts" data-title="Lit (tham khảo)">
@customElement('ns-pony')
class PonyElement extends LitElement {
  @property() name = 'General Soda';
  static styles = css\`h1 { color: orange; }\`;
  render() { return html\`<h1>\${this.name}</h1>\`; }
}
</textarea>
<p>Dùng component có sẵn từ cộng đồng rất dễ (<a href="https://www.webcomponents.org/" target="_blank" rel="noopener">webcomponents.org</a>): nạp script rồi dùng thẻ:</p>
<textarea class="code" data-lang="html">
<script type="module" src="google-map.js"></script>
<google-map latitude="45.780" longitude="4.842"></google-map>
</textarea>
<h3>Angular và Web Components</h3>
<div class="tablewrap"><table>
<tr><th>Web Components</th><th>Angular</th></tr>
<tr><td>Tên phần tử có dấu gạch (<code>ns-pony</code>)</td><td><code>selector: 'ns-pony'</code></td></tr>
<tr><td><code>connectedCallback</code> / <code>disconnectedCallback</code></td><td><code>ngOnInit</code> / <code>ngOnDestroy</code></td></tr>
<tr><td><code>observedAttributes</code> + <code>attributeChangedCallback</code></td><td><code>@Input()</code> + <code>ngOnChanges</code></td></tr>
<tr><td><code>dispatchEvent(new CustomEvent(...))</code></td><td><code>@Output()</code> + <code>EventEmitter</code></td></tr>
<tr><td>Shadow DOM, <code>:host</code></td><td><code>ViewEncapsulation.ShadowDom</code>, <code>:host</code></td></tr>
<tr><td><code>&lt;template&gt;</code></td><td>Template của component (biên dịch sang code)</td></tr>
</table></div>
<p>Angular được thiết kế để <b>dùng Web Components dễ dàng</b> (Angular chấp nhận phần tử và thuộc tính lạ khi bạn cho phép) và để <b>xuất component của bạn thành Web Component</b> bằng <b>Angular Elements</b>:</p>
<textarea class="code" data-lang="ts" data-title="Angular Elements">
import { createCustomElement } from '@angular/elements';

const PonyElement = createCustomElement(PonyComponent, { injector });   // Angular component → custom element
customElements.define('ns-pony', PonyElement);
// giờ dùng <ns-pony name="Rainbow Dash"></ns-pony> trong HTML thuần, React, Vue…
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
@Component({ selector: 'ns-host', schemas: [CUSTOM_ELEMENTS_SCHEMA], template: \`<google-map latitude="45.78" longitude="4.84"></google-map>\` })
// CUSTOM_ELEMENTS_SCHEMA: báo cho Angular rằng thẻ có dấu gạch có thể là custom element, đừng báo lỗi (xem AOT, chương 21)
</textarea></div>`
    }
  ],
  quiz: [
    { q: 'Ba đặc tả tạo nên Web Components?', options: ['Custom Elements, Shadow DOM, Template', 'HTML, CSS, JavaScript', 'Router, Forms, HTTP'], answer: 0, why: 'Mỗi cái lo một phần: phần tử riêng, đóng gói, khối HTML nhân bản.' },
    { q: 'Tên của custom element phải?', options: ['Viết hoa', 'Có dấu gạch ngang', 'Bắt đầu bằng ng-'], answer: 1, why: 'Để trình duyệt phân biệt với thẻ HTML gốc.' },
    { q: 'Callback nào chạy khi phần tử được chèn vào DOM?', options: ['constructor', 'connectedCallback', 'attributeChangedCallback'], answer: 1, why: 'Tương tự ngOnInit; disconnectedCallback tương tự ngOnDestroy.' },
    { q: 'Shadow DOM bảo vệ điều gì?', options: ['Nội dung và CSS bên trong không lẫn với trang (hai chiều)', 'Chỉ JavaScript', 'Chỉ mạng'], answer: 0, why: 'CSS không lọt vào/ra; querySelector từ ngoài không thấy bên trong.' },
    { q: 'Nội dung bên trong thẻ <template> thế nào?', options: ['Hiển thị bình thường', 'Inert (không hiển thị, không chạy) cho đến khi được nhân bản', 'Bị xoá'], answer: 1, why: 'Dùng importNode(template.content, true) để nhân bản.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const log = $('#wc-log'), stage = $('#wc-stage');
    const say = t => { if (!root.isConnected) return; const d = document.createElement('div'); d.textContent = t; d.className = 'dim'; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    globalThis.__ch6lab = say;                         // element dùng chung toàn trang; trỏ log về widget hiện tại
    if (!customElements.get('ns-pony-lab')) {
      customElements.define('ns-pony-lab', class extends HTMLElement {
        static get observedAttributes() { return ['name', 'color']; }
        constructor() { super(); globalThis.__ch6lab && globalThis.__ch6lab('constructor()'); }
        connectedCallback() { globalThis.__ch6lab && globalThis.__ch6lab('connectedCallback()  ← chèn vào DOM'); this.render(); }
        disconnectedCallback() { globalThis.__ch6lab && globalThis.__ch6lab('disconnectedCallback()  ← gỡ khỏi DOM'); }
        attributeChangedCallback(n, o, v) { globalThis.__ch6lab && globalThis.__ch6lab(`attributeChangedCallback('${n}', ${JSON.stringify(o)}, ${JSON.stringify(v)})`); if (this.isConnected) this.render(); }
        render() {
          const name = this.getAttribute('name') || 'General Soda', color = this.getAttribute('color') || 'orange';
          const root = this.hasAttribute('shadow') ? (this.shadowRoot || this.attachShadow({ mode: 'open' })) : this;
          const html = `<style>h1 { color: ${color}; margin: 0; }</style><h1>${name.replace(/</g, '&lt;')}</h1>`;
          if (this.hasAttribute('tpl')) { const t = document.createElement('template'); t.innerHTML = html; root.replaceChildren(document.importNode(t.content, true)); }
          else root.innerHTML = html;
        }
      });
    }
    const names = ['General Soda', 'Rainbow Dash', 'Pinkie Pie', 'Fluttershy'], colors = ['orange', 'dodgerblue', 'hotpink', 'seagreen'];
    let n = 0, c = 0, last = null;
    const query = () => { $('#wc-q').innerHTML = `stage.querySelector('h1') → <b>${stage.querySelector('h1') ? '&lt;h1&gt; (tìm thấy)' : 'null (bị Shadow DOM che)'}</b>`; };
    $('#wc-make').onclick = () => {
      const el = document.createElement('ns-pony-lab');
      if ($('#wc-shadow').checked) el.setAttribute('shadow', ''); if ($('#wc-tpl').checked) el.setAttribute('tpl', '');
      el.setAttribute('name', names[n % names.length]); el.setAttribute('color', colors[c % colors.length]);
      last = el; stage.appendChild(el); say('— đã appendChild'); query();
    };
    $('#wc-rename').onclick = () => { if (last) { last.setAttribute('name', names[++n % names.length]); query(); } };
    $('#wc-color').onclick = () => { if (last) last.setAttribute('color', colors[++c % colors.length]); };
    $('#wc-remove').onclick = () => { if (last) { last.remove(); say('— đã remove()'); query(); } };
    $('#wc-clear').onclick = () => { stage.replaceChildren(); last = null; query(); };
    query();
  }
});
