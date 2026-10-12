registerChapter(23, {
  time: '50 phút',
  lead: 'Bốn công cụ để component/directive “nói chuyện” với DOM và với nội dung được truyền vào: <b>view query</b> (<code>@ViewChild</code>), <b>content projection</b> (<code>&lt;ng-content&gt;</code>) cùng <b>content query</b> (<code>@ContentChildren</code>), và <b>host</b> (<code>@HostListener</code>, <code>@HostBinding</code>). Mỗi phần có mô phỏng chạy trên DOM thật.',
  sections: [
    {
      id: 'viewquery', title: 'View query: @ViewChild và @ViewChildren',
      html: `
<p>Biến cục bộ trong template (<code>#myInput</code>) chỉ dùng được trong template. Muốn lấy tham chiếu <b>trong code</b> thì dùng <b>view query</b>:</p>
<textarea class="code" data-lang="ts" data-title="Focus ô nhập ngay khi component hiện ra">
@Component({
  selector: 'ns-login',
  template: \`<input #loginInput name="login" [(ngModel)]="credentials.login" required />\`
})
export class LoginComponent implements AfterViewInit {
  credentials = { login: '' };
  @ViewChild('loginInput') loginInput: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.loginInput.nativeElement.focus();     // view đã được tạo → phần tử có thật
  }
}
</textarea>
<ul>
<li>Selector có thể là <b>tên biến cục bộ</b> hoặc <b>một kiểu</b>: <code>@ViewChild(NgForm) form</code>.</li>
<li>Giá trị là <code>ElementRef&lt;T&gt;</code>; DOM thật ở <code>.nativeElement</code>.</li>
<li>Phải dùng trong <code>ngAfterViewInit</code>, <b>không phải</b> <code>ngOnInit</code> (view chưa tạo). Cờ <code>static: true</code> chỉ cho trường hợp rất hiếm.</li>
<li>Query là <b>động</b>: nếu phần tử bị gỡ khỏi template, trường trở thành <code>undefined</code>.</li>
<li><code>@ViewChildren</code> lấy <b>tất cả</b> phần tử khớp → <code>QueryList</code> với <code>first</code>, <code>last</code>, <code>length</code>, <code>toArray()</code>, <code>map()</code>… và <code>changes</code> (observable phát khi thêm/bớt/đổi chỗ).</li>
</ul>

<div class="widget" id="w-vq">
  <h4>🔍 Khi nào query có giá trị?</h4>
  <p class="hint">Bấm “Tạo component” để xem thứ tự: <code>ngOnInit</code> chạy khi chưa có view; <code>ngAfterViewInit</code> thì query đã sẵn sàng. Rồi thêm/bớt pony để xem <code>QueryList.changes</code>.</p>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="vq-create">▶ Tạo component</button>
    <button class="btn alt" id="vq-add">＋ Thêm pony</button>
    <button class="btn alt" id="vq-del">− Bớt pony</button>
    <button class="btn alt" id="vq-destroy">✖ Hủy</button>
  </div>
  <div class="grid2">
    <div><b>View của component</b><div id="vq-view" style="border:2px dashed var(--accent);border-radius:10px;padding:10px;margin-top:6px;min-height:80px"><i class="hint">(chưa tạo)</i></div></div>
    <div><b>Nhật ký</b><div class="output" id="vq-log" style="border-radius:8px;height:170px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>

<textarea class="code" data-lang="ts" data-title="@ViewChildren + QueryList.changes">
@Component({ selector: 'ns-race', templateUrl: './race.component.html' })
export class RaceComponent implements AfterViewInit {
  @Input() raceModel: RaceModel;
  @ViewChildren(PonyComponent) ponies: QueryList<PonyComponent>;

  ngAfterViewInit(): void {
    this.ponies.changes.subscribe(newList => console.log(newList.length));
  }
}
</textarea>
<p>Tạo directive để dùng lại “tự focus” trên nhiều nơi: directive tiêm <code>ElementRef</code> của chính phần tử mang nó. Mô phỏng chạy thật:</p>
<textarea class="live" data-title="FocusDirective: ElementRef = phần tử chủ (host)">
class FocusDirective {
  constructor(element) { this.element = element; }       // Angular tiêm ElementRef<HTMLElement>
  ngAfterViewInit() { this.element.nativeElement.focus(); }
}

const input = document.createElement('input');
document.body.appendChild(input);                        // gắn tạm để focus được
const dir = new FocusDirective({ nativeElement: input });
dir.ngAfterViewInit();
console.log('input đang được focus?', document.activeElement === input);
input.remove();
</textarea>
<div class="box warn"><b>Truy cập nativeElement</b><p>Chạm trực tiếp DOM sẽ không chạy khi render phía server hoặc trong Web Worker. Ưu tiên API của Angular (binding, <code>Renderer2</code>) khi có thể.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
loginInput = viewChild.required<ElementRef<HTMLInputElement>>('loginInput');   // signal
ponies = viewChildren(PonyComponent);                                          // signal chứa mảng
constructor() { afterNextRender(() => this.loginInput().nativeElement.focus()); }
</textarea><p>Query dạng signal cập nhật tự động, không cần <code>QueryList.changes</code> hay chờ <code>ngAfterViewInit</code> thủ công.</p></div>`
    },
    {
      id: 'content', title: 'Content projection: &lt;ng-content&gt;',
      html: `
<p>Muốn component “thẻ card” nhận cả HTML tuỳ ý từ nơi dùng? Dùng <code>&lt;ng-content&gt;</code> (trong AngularJS gọi là transclusion). Nội dung bạn đặt <b>giữa thẻ mở và thẻ đóng</b> của component được “chiếu” vào chỗ <code>ng-content</code>.</p>
<textarea class="code" data-lang="html" data-title="Card với một slot, rồi hai slot có select">
<!-- card.component.html -->
<div class="card"><div class="card-body">
  <h4 class="card-title"><ng-content select=".title"></ng-content></h4>
  <p class="card-text"><ng-content select=".content"></ng-content></p>
</div></div>

<!-- nơi dùng -->
<ns-card>
  <p class="title">Card <strong>title</strong></p>
  <p class="content">Some quick <strong>example</strong> text</p>
</ns-card>
</textarea>

<style>
#w-proj .card { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); box-shadow: var(--shadow); }
#w-proj .card-body { padding: 12px; } #w-proj .card-title { margin: 0 0 6px; color: var(--accent); }
#w-proj .footer { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 6px; color: var(--muted); }
</style>
<div class="widget" id="w-proj">
  <h4>🎁 Máy chiếu nội dung</h4>
  <p class="hint">Sửa phần nội dung đặt trong <code>&lt;ns-card&gt;</code> và chọn template của card. Widget chiếu thật các node vào đúng <code>ng-content</code>.</p>
  <div class="row" style="margin-bottom:8px"><label>Template của card: <select id="pj-tpl"></select></label></div>
  <div class="grid2">
    <div><b>Nội dung bên trong &lt;ns-card&gt;…&lt;/ns-card&gt;</b>
      <textarea id="pj-in" rows="8" class="mono" style="width:100%;margin-top:6px" spellcheck="false"></textarea>
      <b style="display:block;margin-top:8px">Template card.component.html</b>
      <pre class="hl" id="pj-tpl-code" style="border-radius:8px;margin-top:6px;font-size:12.5px"></pre></div>
    <div><b>Kết quả hiển thị</b><div id="pj-out" style="margin-top:6px"></div>
      <b style="display:block;margin-top:8px">DOM thu được</b>
      <pre class="hl" id="pj-dom" style="border-radius:8px;margin-top:6px;font-size:12.5px"></pre>
      <div id="pj-warn"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử</b><ul>
<li>Đổi class của một thẻ từ <code>content</code> thành <code>other</code> khi dùng template hai slot: nó <b>biến mất</b> (không khớp slot nào, và không có slot mặc định).</li>
<li>Chọn template “hai slot + mặc định”: phần dư rơi vào <code>&lt;ng-content&gt;</code> không có <code>select</code>.</li></ul></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Cú pháp <code>&lt;ng-content select&gt;</code> vẫn nguyên. Ngoài ra có <code>ngProjectAs</code> để “giả danh” selector, và <code>@defer</code> để hoãn tải phần nội dung nặng.</p></div>`
    },
    {
      id: 'contentquery', title: 'Content query: @ContentChild / @ContentChildren',
      html: `
<p>Nội dung được chiếu <b>không</b> nằm trong view của component nên <code>@ViewChild(Ren)</code> không thấy. Muốn đọc chúng dùng <b>content query</b>. Ví dụ component tab: <code>&lt;ns-tabs&gt;</code> cần biết bao nhiêu <code>&lt;ns-tab&gt;</code> được đặt bên trong để dựng thanh tab.</p>
<textarea class="code" data-lang="ts">
@Directive({ selector: 'ns-tab' })
export class TabDirective { @Input() title: string; }

@Component({
  selector: 'ns-tabs',
  template: \`
    <ul class="nav nav-tabs">
      <li class="nav-item" *ngFor="let tab of tabs"><a class="nav-link">{{ tab.title }}</a></li>
    </ul>\`
})
export class TabsComponent {
  @ContentChildren(TabDirective) tabs: QueryList<TabDirective>;   // đọc trong ngAfterContentInit
}
</textarea>
<p>Mặc định chỉ lấy <b>con trực tiếp</b>; thêm <code>{ descendants: true }</code> để lấy cả cháu chắt. Thử:</p>

<div class="widget" id="w-tabs">
  <h4>🗂 Content query</h4>
  <div class="row" style="margin-bottom:8px" id="tb-presets"></div>
  <label><input type="checkbox" id="tb-desc"> <code>{ descendants: true }</code></label>
  <div class="grid2" style="margin-top:8px">
    <div><b>Template của nơi dùng</b><textarea id="tb-in" rows="9" class="mono" style="width:100%;margin-top:6px" spellcheck="false"></textarea></div>
    <div><b>QueryList tìm được</b><div id="tb-found" style="margin-top:6px"></div>
      <b style="display:block;margin-top:10px">Thanh tab được dựng</b>
      <div id="tb-nav" style="margin-top:6px"></div></div>
  </div>
</div>
<div class="box info"><b>Lưu ý thời điểm</b><p>Giống view query: <code>QueryList</code> chưa có trong constructor/<code>ngOnInit</code>. Dùng <code>ngAfterContentInit</code> (hoặc <code>ngAfterContentChecked</code>). Cũng có <code>QueryList.changes</code> khi nội dung đổi.</p></div>
<div class="box warn"><b>Chú ý khi lồng wrapper</b><p>Sách (thời ViewEngine) mô tả chi tiết ranh giới là component khác; trong Angular hiện tại, quy tắc thực tế là “<b>con trực tiếp</b> trừ khi <code>descendants: true</code>”. Gặp “không tìm thấy gì” hãy thử bật <code>descendants</code>.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
tabs = contentChildren(TabDirective, { descendants: true });   // signal
// template: @for (tab of tabs(); track tab) { <a>{{ tab.title() }}</a> }
</textarea></div>`
    },
    {
      id: 'host', title: 'Host: @HostListener và @HostBinding',
      html: `
<p>Directive thường cần <b>nghe sự kiện</b> và <b>đổi thuộc tính</b> của phần tử chủ (host):</p>
<div class="tablewrap"><table>
<tr><th>Decorator</th><th>Chiều</th><th>Ví dụ</th></tr>
<tr><td><code>@HostListener('dblclick')</code></td><td>host → directive (sự kiện)</td><td>Double-click xoá ô nhập; <code>'window:resize', ['$event']</code> cho sự kiện toàn cục</td></tr>
<tr><td><code>@HostBinding('class.is-required')</code></td><td>directive → host (thuộc tính)</td><td>Thêm/bớt class, <code>aria-*</code>, <code>value</code>…</td></tr>
</table></div>
<textarea class="code" data-lang="ts" data-title="InputClearDirective + WindowResizeDirective">
@Directive({ selector: '[nsInputClear]' })
export class InputClearDirective {
  constructor(private element: ElementRef<HTMLInputElement>) {}
  @HostListener('dblclick')
  clearContent(): void { this.element.nativeElement.value = ''; }
}

@Directive({ selector: '[nsWindowResize]' })
export class WindowResizeDirective {
  @HostListener('window:resize', ['$event'])
  resize(event: Event): void {
    console.log(\`The screen is being resized to \${(event.target as Window).innerWidth}\`);
  }
}
</textarea>
<textarea class="code" data-lang="ts" data-title="AddClassIfRequiredDirective: tiêm directive khác trên cùng phần tử">
@Directive({ selector: '[nsAddClassIfRequired]' })
export class AddClassIfRequiredDirective {
  constructor(private control: NgControl) {}     // NgModel / FormControlName đều kế thừa NgControl

  @HostBinding('class.is-required')
  get isRequired(): boolean { return this.control.hasError('required'); }
}
// <input [(ngModel)]="user.name" required nsAddClassIfRequired>
</textarea>
<div class="box info"><b>Vì sao tiêm <code>NgControl</code> mà không tiêm <code>NgModel</code>?</b><p>Một ô nhập chỉ dùng <code>ngModel</code> <i>hoặc</i> <code>formControlName</code>; tiêm cả hai thì cái vắng mặt gây lỗi (có thể chữa bằng <code>@Optional()</code>). Cả hai cùng kế thừa <code>NgControl</code>, nên tiêm lớp cha chung là sạch nhất.</p></div>

<style>
#w-host input { padding: 8px 12px; border: 2px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font: inherit; width: 100%; }
#w-host input.is-required { border-color: var(--err); background: var(--errbg); }
</style>
<div class="widget" id="w-host">
  <h4>🎛 Dùng thử hai directive và một listener toàn cục</h4>
  <p class="hint">Các directive dưới đây được gắn vào phần tử bằng một “runtime” mini (nghe sự kiện, rồi chạy lại các host binding). Tắt tích để gỡ directive.</p>
  <div style="margin-bottom:14px">
    <label><input type="checkbox" id="ho-clear" checked> <code>nsInputClear</code> — double-click ô dưới để xoá</label>
    <input type="text" id="ho-in1" value="Double-click vào đây" style="margin-top:6px">
  </div>
  <div style="margin-bottom:14px">
    <label><input type="checkbox" id="ho-req" checked> <code>nsAddClassIfRequired</code> — ô bắt buộc, trống thì thêm class <code>is-required</code></label>
    <input type="text" id="ho-in2" value="" placeholder="xoá hết chữ để thấy class" style="margin-top:6px">
    <div class="mono hint" id="ho-cls" style="margin-top:4px"></div>
  </div>
  <div style="margin-bottom:10px">
    <label><input type="checkbox" id="ho-resize" checked> <code>window:resize</code> — kéo đổi kích thước cửa sổ trình duyệt</label>
    <div>innerWidth hiện tại: <b id="ho-w"></b> px</div>
  </div>
  <div class="output" id="ho-log" style="border-radius:8px;height:110px;overflow:auto"></div>
</div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Style guide mới khuyên dùng thuộc tính <code>host</code> trong decorator thay cho <code>@HostListener/@HostBinding</code> (cùng tác dụng, nhưng gom ở một chỗ):</p>
<textarea class="code" data-lang="ts">
@Directive({
  selector: '[nsInputClear]',
  host: { '(dblclick)': 'clearContent()', '[class.is-required]': 'isRequired' }
})
</textarea></div>`
    }
  ],
  quiz: [
    { q: 'Vì sao đọc <code>@ViewChild</code> trong <code>ngOnInit</code> thường là undefined?', options: ['View chưa được tạo; phải đợi ngAfterViewInit', 'ViewChild bị lỗi', 'Chỉ chạy trên server'], answer: 0, why: 'ngOnInit chạy trước khi template được dựng; ngAfterViewInit chạy sau.' },
    { q: 'QueryList.changes là gì?', options: ['Một mảng', 'Observable phát khi các phần tử khớp được thêm/bớt/đổi chỗ', 'Một hàm'], answer: 1, why: 'Subscribe vào nó để biết số phần tử đổi.' },
    { q: '<code>&lt;ng-content select=".title"&gt;</code> chiếu cái gì?', options: ['Mọi nội dung', 'Chỉ phần tử con có class title', 'Chỉ text'], answer: 1, why: 'select chọn phần nội dung khớp selector CSS cho slot đó.' },
    { q: 'Muốn component đọc các <code>&lt;ns-tab&gt;</code> được đặt bên trong nó, dùng?', options: ['@ViewChildren', '@ContentChildren', '@Input'], answer: 1, why: 'Nội dung được chiếu cần content query.' },
    { q: '<code>@HostBinding("class.is-required")</code> dùng để?', options: ['Nghe sự kiện trên host', 'Bật/tắt class trên phần tử host theo giá trị của directive', 'Tiêm service'], answer: 1, why: 'HostBinding liên kết thuộc tính của host với field/getter của directive.' },
    { q: 'Làm sao nghe sự kiện resize của cửa sổ trong directive?', options: ["@HostListener('window:resize', ['$event'])", '@HostBinding("window")', 'Không thể'], answer: 0, why: 'Tiền tố window: / document: / body: cho phép nghe sự kiện toàn cục.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const mkLog = el => (t, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; el.appendChild(d); el.scrollTop = el.scrollHeight; };

    /* ===== view query ===== */
    const vqLog = mkLog($('#vq-log')), vqView = $('#vq-view'), names = ['Rainbow Dash', 'Pinkie Pie', 'Fluttershy', 'Applejack', 'Rarity'];
    let vq = null;
    const queryPonies = () => [...vqView.querySelectorAll('li')];
    $('#vq-create').onclick = () => {
      if (vq) return vqLog('(đã có component)', 'dim');
      vq = { loginInput: undefined, ponies: [] };
      vqLog('constructor()');
      vqLog('ngOnInit(): this.loginInput = ' + vq.loginInput + '  ❌ view chưa tạo', 'err');
      vqView.innerHTML = '<input class="mono" placeholder="login (#loginInput)" style="width:100%;padding:6px 10px"><ul style="margin:8px 0 0;padding-left:20px"></ul>';
      names.slice(0, 2).forEach(n => { const li = document.createElement('li'); li.textContent = n; vqView.querySelector('ul').appendChild(li); });
      vq.loginInput = vqView.querySelector('input');
      vqLog('— Angular dựng view —', 'dim');
      vqLog('ngAfterViewInit(): loginInput = <input> ✓ → nativeElement.focus()', 'ok');
      vq.loginInput.focus();
      vqLog(`ponies.length = ${queryPonies().length} (@ViewChildren)`, 'ok');
    };
    const change = () => vqLog(`ponies.changes → newList.length = ${queryPonies().length}`, 'ok');
    $('#vq-add').onclick = () => { if (!vq) return vqLog('(hãy tạo component trước)', 'dim'); const n = queryPonies().length; const li = document.createElement('li'); li.textContent = names[n % names.length]; vqView.querySelector('ul').appendChild(li); change(); };
    $('#vq-del').onclick = () => { if (!vq) return vqLog('(hãy tạo component trước)', 'dim'); const l = queryPonies(); if (l.length) { l[l.length - 1].remove(); change(); } };
    $('#vq-destroy').onclick = () => { if (!vq) return; vqView.innerHTML = '<i class="hint">(đã hủy)</i>'; vq = null; vqLog('ngOnDestroy() — các query không còn giá trị', 'dim'); };

    /* ===== ng-content ===== */
    const TPLS = [
      ['Một slot', '<div class="card">\n  <div class="card-body">\n    <ng-content></ng-content>\n  </div>\n</div>'],
      ['Hai slot (select)', '<div class="card">\n  <div class="card-body">\n    <h4 class="card-title">\n      <ng-content select=".title"></ng-content>\n    </h4>\n    <p class="card-text">\n      <ng-content select=".content"></ng-content>\n    </p>\n  </div>\n</div>'],
      ['Hai slot + mặc định', '<div class="card">\n  <div class="card-body">\n    <h4 class="card-title"><ng-content select=".title"></ng-content></h4>\n    <ng-content select=".content"></ng-content>\n    <div class="footer"><ng-content></ng-content></div>\n  </div>\n</div>']
    ];
    $('#pj-tpl').innerHTML = TPLS.map((t, i) => `<option value="${i}">${t[0]}</option>`).join('');
    $('#pj-tpl').value = '1';
    $('#pj-in').value = '<p class="title">Card <strong>title</strong></p>\n<p class="content">Some quick <strong>example</strong> text</p>\n<small>ghi chú không có class</small>';
    function project() {
      const tplHtml = TPLS[+$('#pj-tpl').value][1];
      $('#pj-tpl-code').textContent = tplHtml;
      const card = document.createElement('div'); card.innerHTML = tplHtml;
      const content = document.createElement('div'); content.innerHTML = $('#pj-in').value;
      const nodes = [...content.childNodes];
      const slots = [...card.querySelectorAll('ng-content')];
      const selectors = slots.map(s => s.getAttribute('select')).filter(Boolean);
      const hasDefault = slots.some(s => !s.getAttribute('select'));
      const used = new Set();
      slots.forEach(slot => {
        const sel = slot.getAttribute('select');
        const mine = nodes.filter(n => !used.has(n) && (sel ? n.nodeType === 1 && n.matches(sel) : !(n.nodeType === 1 && selectors.some(s => n.matches(s)))));
        mine.forEach(n => used.add(n));
        slot.replaceWith(...mine.map(n => n.cloneNode(true)));
      });
      $('#pj-out').innerHTML = card.innerHTML;
      $('#pj-dom').textContent = card.innerHTML.replace(/></g, '>\n<');
      const lost = nodes.filter(n => !used.has(n) && (n.nodeType === 1 || n.textContent.trim()));
      $('#pj-warn').innerHTML = lost.length ? `<div class="box warn" style="margin-top:8px"><b>${lost.length} node bị bỏ</b><p>Không khớp slot nào và template không có <code>&lt;ng-content&gt;</code> mặc định: ${lost.map(n => '<code>' + esc(n.nodeType === 1 ? '<' + n.localName + '>' : n.textContent.trim()) + '</code>').join(', ')}</p></div>` : '';
    }
    $('#pj-tpl').onchange = $('#pj-in').oninput = project; project();

    /* ===== content children ===== */
    const TB = [
      ['Trực tiếp', '<ns-tabs>\n  <ns-tab title="Races"></ns-tab>\n  <ns-tab title="About"></ns-tab>\n</ns-tabs>'],
      ['Bọc trong div', '<ns-tabs>\n  <div>\n    <ns-tab title="Races"></ns-tab>\n  </div>\n  <ns-tab title="About"></ns-tab>\n</ns-tabs>'],
      ['Trong ns-tabgroup', '<ns-tabs>\n  <ns-tab title="Races"></ns-tab>\n  <ns-tabgroup>\n    <ns-tab title="About"></ns-tab>\n  </ns-tabgroup>\n</ns-tabs>']
    ];
    TB.forEach(t => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = t[0]; b.onclick = () => { $('#tb-in').value = t[1]; tabs(); }; $('#tb-presets').appendChild(b); });
    function tabs() {
      const wrap = document.createElement('div'); wrap.innerHTML = $('#tb-in').value;
      const host = wrap.querySelector('ns-tabs');
      if (!host) { $('#tb-found').innerHTML = '<span class="pill rejected">không có &lt;ns-tabs&gt;</span>'; $('#tb-nav').innerHTML = ''; return; }
      const direct = [...host.children].filter(c => c.localName === 'ns-tab');
      const all = [...host.querySelectorAll('ns-tab')];
      const list = $('#tb-desc').checked ? all : direct;
      $('#tb-found').innerHTML = `<div>tabs.length = <b>${list.length}</b> <span class="hint">(${all.length} ns-tab trong template)</span></div>` +
        list.map(t => `<span class="kv hit"><span class="k">ns-tab</span><span class="v">${esc(t.getAttribute('title') || '')}</span></span>`).join('') +
        (list.length < all.length ? '<div class="pill pending" style="margin-top:6px">⚠ bỏ sót ' + (all.length - list.length) + ' tab — thử bật descendants</div>' : '');
      $('#tb-nav').innerHTML = '<ul style="display:flex;gap:4px;list-style:none;padding:0;margin:0;border-bottom:2px solid var(--border)">' +
        (list.map((t, i) => `<li style="padding:6px 14px;border:1px solid var(--border);border-bottom:none;border-radius:8px 8px 0 0;background:${i ? 'var(--surface2)' : 'var(--surface)'};font-weight:${i ? 400 : 700}">${esc(t.getAttribute('title') || '')}</li>`).join('') || '<li class="hint">(không có tab)</li>') + '</ul>';
    }
    $('#tb-in').value = TB[1][1]; $('#tb-in').oninput = $('#tb-desc').onchange = tabs; tabs();

    /* ===== host listener / binding: runtime mini ===== */
    const hLog = mkLog($('#ho-log'));
    class InputClear {
      static hostListeners = [['dblclick', 'clearContent']];
      constructor(el) { this.el = el; }
      clearContent() { this.el.value = ''; hLog("nsInputClear: dblclick → value = ''", 'ok'); }
    }
    class AddClassIfRequired {
      static hostBindings = [{ cls: 'is-required', get: i => i.el.value.trim() === '' }];
      constructor(el) { this.el = el; }
    }
    class WindowResize {
      static hostListeners = [['window:resize', 'resize']];
      constructor(el) { this.el = el; }
      resize(e) { $('#ho-w').textContent = e.target.innerWidth; hLog(`resize → ${e.target.innerWidth}px`, 'dim'); }
    }
    const attached = {};
    function attach(key, el, Dir, events) {
      detach(key);
      const inst = new Dir(el), offs = [];
      const check = () => (Dir.hostBindings || []).forEach(b => { el.classList.toggle(b.cls, !!b.get(inst)); if (key === 'req') $('#ho-cls').textContent = `class = "${el.className}"`; });
      (Dir.hostListeners || []).forEach(([ev, m]) => {
        const global = ev.startsWith('window:'), target = global ? window : el, name = global ? ev.slice(7) : ev;
        const h = e => { inst[m](e); check(); };
        target.addEventListener(name, h); offs.push(() => target.removeEventListener(name, h));
      });
      (events || []).forEach(ev => { el.addEventListener(ev, check); offs.push(() => el.removeEventListener(ev, check)); });
      check(); attached[key] = () => { offs.forEach(f => f()); (Dir.hostBindings || []).forEach(b => el.classList.remove(b.cls)); };
    }
    function detach(key) { attached[key] && attached[key](); delete attached[key]; if (key === 'req') $('#ho-cls').textContent = 'class = ""'; }
    const wire = (cb, key, el, Dir, events) => { cb.onchange = () => { cb.checked ? attach(key, el, Dir, events) : detach(key); hLog(`${Dir.name} ${cb.checked ? 'được gắn' : 'bị gỡ'}`, 'dim'); }; if (cb.checked) attach(key, el, Dir, events); };
    $('#ho-w').textContent = window.innerWidth;
    wire($('#ho-clear'), 'clear', $('#ho-in1'), InputClear);
    wire($('#ho-req'), 'req', $('#ho-in2'), AddClassIfRequired, ['input']);
    wire($('#ho-resize'), 'resize', $('#ho-w'), WindowResize);
  }
});
