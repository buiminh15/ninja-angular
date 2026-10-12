registerChapter(14, {
  time: '60 phút',
  lead: 'Component và directive là hai viên gạch chính của Angular. Bạn sẽ học: <b>selector</b> (khi nào được kích hoạt), <b>input</b> (dữ liệu đi xuống), <b>output</b> (sự kiện đi lên), và <b>vòng đời</b>. Mọi thứ đều có widget để bấm thử.',
  sections: [
    {
      id: 'intro', title: 'Directive và component khác nhau thế nào?',
      html: `
<p><b>Directive</b> giống component nhưng <b>không có template</b>: nó gắn <i>hành vi</i> vào một phần tử có sẵn trong DOM (như “decorator cho HTML”). Một phần tử có thể mang nhiều directive. <b>Component</b> thực chất là một directive <i>có thêm template</i> (class <code>Component</code> kế thừa <code>Directive</code>).</p>
<div class="flow">
  <div class="node">Directive<small>@Directive({ selector })<br>chỉ hành vi</small></div><span class="arr">+ template (+ style)</span>
  <div class="node hot">Component<small>@Component({ selector, template })<br>hành vi + giao diện</small></div>
</div>
<p>Vì vậy mọi thứ về directive (selector, input, output, vòng đời, providers) cũng đúng cho component. Ta học trên directive trước.</p>

<h3>Angular “biên dịch” template thực chất làm gì?</h3>
<p>Trực giác đơn giản: với mỗi directive, Angular tìm các phần tử khớp <b>selector</b> rồi tạo một instance của class, truyền phần tử vào. Chạy thử phiên bản mini:</p>
<textarea class="live" data-title="Mini “compiler”: selector → instance của directive">
const root = document.createElement('div');
root.innerHTML = '<p highlight="gold">Hello</p><p>Plain</p><p highlight="pink">Ninja</p>';

class HighlightDirective {
  constructor(el) { this.el = el; }                       // Angular tiêm ElementRef
  set color(c) { this.el.style.backgroundColor = c; }      // input
}

function compile(root, selector, Directive, inputAttr) {
  root.querySelectorAll(selector).forEach(el => {          // 1. tìm phần tử khớp selector
    const d = new Directive(el);                           // 2. tạo instance
    d.color = el.getAttribute(inputAttr);                  // 3. gán input
  });
}
compile(root, '[highlight]', HighlightDirective, 'highlight');
console.log(root.innerHTML);
</textarea>
<div class="box info"><b>Vì sao phần tử &lt;p&gt; thứ hai không có style?</b><p>Nó không có attribute <code>highlight</code>, nên không khớp selector — không có instance nào được tạo cho nó.</p></div>`
    },
    {
      id: 'selectors', title: 'Selector: khi nào directive được kích hoạt',
      html: `
<p>Selector là chuỗi CSS (chỉ một tập con): <b>phần tử</b> <code>footer</code>, <b>class</b> <code>.alert</code>, <b>attribute</b> <code>[color]</code> (phổ biến nhất cho directive), <b>attribute có giá trị</b> <code>[color=red]</code>, <b>kết hợp</b> <code>footer[color=red]</code>, <b>hoặc</b> bằng dấu phẩy, và <code>:not(...)</code>.</p>

<div class="widget" id="w-sel">
  <h4>🎯 Bộ thử selector</h4>
  <p class="hint">Chọn (hoặc gõ) selector. Các phần tử khớp sẽ sáng xanh — đó là nơi Angular sẽ tạo directive.</p>
  <div class="row" style="margin-bottom:8px" id="sel-presets"></div>
  <input type="text" id="sel-in" class="mono" style="width:100%;margin-bottom:10px" spellcheck="false">
  <div id="sel-els"></div>
  <p id="sel-msg" class="hint"></p>
</div>

<textarea class="code" data-lang="ts" data-title="Directive đơn giản kích hoạt bởi attribute">
@Directive({ selector: '[doNothing]' })
export class DoNothingDirective {
  constructor() { console.log('Do nothing directive'); }
}
// <div doNothing>Click me</div>   ← được kích hoạt
</textarea>
<div class="box warn"><b>Hai lỗi phổ biến nhất</b><p>(1) quên đăng ký directive/component (<code>declarations</code> trong NgModule, hoặc <code>imports</code> với standalone), (2) viết sai selector. Nếu “không có gì xảy ra”, kiểm tra hai thứ này trước.</p></div>
<div class="box info"><b>Giới hạn</b><p>Không hỗ trợ selector con cháu, anh em, id, <code>*</code>, hoặc pseudo-class khác ngoài <code>:not()</code>. Đừng bắt đầu tên attribute bằng <code>bind-</code>, <code>on-</code>, <code>let-</code>, <code>ref-</code> (có nghĩa đặc biệt).</p></div>`
    },
    {
      id: 'inputs', title: 'Input: dữ liệu chảy xuống',
      html: `
<p><b>Input</b> là các thuộc tính cho phép cha truyền dữ liệu vào con bằng property binding <code>[tên]="biểu_thức"</code>. Khai báo bằng decorator <code>@Input()</code>:</p>
<textarea class="code" data-lang="ts" data-title="Component con nhận pony">
@Component({
  selector: 'ns-pony',
  template: \`<div>{{ pony.name }}</div>\`
})
export class PonyComponent {
  @Input() pony: PonyModel;           // input cùng tên thuộc tính
}

// Component cha
@Component({
  selector: 'ns-ponies',
  template: \`
    <h2>Ponies</h2>
    <ns-pony *ngFor="let currentPony of ponies" [pony]="currentPony"></ns-pony>\`
})
export class PoniesComponent {
  ponies: Array<PonyModel> = [{ id: 1, name: 'Rainbow Dash' }, { id: 2, name: 'Pinkie Pie' }];
}
</textarea>
<h3>Các cách khai báo input (cùng một ý nghĩa)</h3>
<textarea class="code" data-lang="ts">
// 1) trong metadata (kiểu cũ): inputs: ['text: logText']  →  thuộc tính "text", binding "logText"
@Directive({ selector: '[loggable]', inputs: ['text: logText'] })

// 2) @Input với tên binding khác tên thuộc tính
@Input('logText') text: string;

// 3) cùng tên
@Input() logText: string;

// 4) trên setter: được gọi mỗi khi giá trị đổi
@Input() set logText(value: string) { console.log(value); }
</textarea>
<p>Binding hoạt động với chuỗi tĩnh, nội suy và biểu thức, kể cả pipe:</p>
<textarea class="code" data-lang="html">
<div loggable logText="Some text">Hello</div>
<div loggable logText="{{ expression }}">Hello</div>
<div loggable [logText]="expression | uppercase">Hello</div>
</textarea>
<div class="box modern"><b>🆕 Hiện nay (Angular 17.1+)</b><p>Input dạng <b>hàm signal</b>, bắt buộc hoặc có giá trị mặc định, đọc bằng <code>pony()</code>:</p>
<textarea class="code" data-lang="ts">
export class PonyComponent {
  pony = input.required<PonyModel>();           // <ns-pony [pony]="p" />
  size = input(10);                              // có mặc định
  label = computed(() => this.pony().name.toUpperCase());
}
// kiểu decorator vẫn dùng được: @Input({ required: true }) pony!: PonyModel;
</textarea></div>`
    },
    {
      id: 'outputs', title: 'Output: sự kiện chảy lên (Input ↓ / Output ↑)',
      html: `
<p>Quy tắc vàng của Angular: <b>dữ liệu đi vào component qua <u>property</u>, đi ra qua <u>event</u></b>. Component con không sửa dữ liệu của cha; nó <i>báo</i> cho cha bằng sự kiện tuỳ chỉnh, cha quyết định làm gì.</p>
<div class="flow">
  <div class="node">PonyRacer<small>PoniesComponent (cha)</small></div><span class="arr">[pony] ↓</span>
  <div class="node hot">ns-pony<small>PonyComponent (con)</small></div><span class="arr">↑ (ponySelected)</span>
  <div class="node">PonyRacer</div>
</div>

<div class="widget" id="w-io">
  <h4>🔁 Thử Input &amp; Output</h4>
  <p class="hint">Component con nhận pony qua <code>[pony]</code>; khi bạn <b>bấm vào con</b>, nó <code>emit(pony)</code> lên cha. Thử đổi tên ở cha để thấy input chảy xuống.</p>
  <div class="row" style="margin-bottom:10px">
    <button class="btn alt" id="io-rename">✎ Cha đổi tên pony đầu</button>
    <button class="btn alt" id="io-add">＋ Cha thêm pony</button>
    <button class="btn alt" id="io-clear">Xóa nhật ký</button>
  </div>
  <div class="grid2">
    <div>
      <div class="box info" style="margin:0 0 10px"><b>👪 PoniesComponent (cha)</b>
        <div id="io-parent" style="margin-top:8px"></div>
        <p style="margin:8px 0 0">Đang đặt cược cho: <b id="io-bet">—</b></p>
      </div>
    </div>
    <div><b>Luồng dữ liệu</b><div class="output" id="io-log" style="border-radius:8px;height:200px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>

<textarea class="code" data-lang="ts" data-title="Component con phát sự kiện">
@Component({
  selector: 'ns-pony',
  template: \`<div (click)="selectPony()">{{ pony.name }}</div>\`
})
export class SelectablePonyComponent {
  @Input() pony: PonyModel;
  @Output() readonly ponySelected = new EventEmitter<PonyModel>();   // 1. khai báo + 2. tạo emitter

  selectPony(): void {
    this.ponySelected.emit(this.pony);                               // 3. phát sự kiện
  }
}
</textarea>
<textarea class="code" data-lang="html" data-title="Cha lắng nghe: $event chính là giá trị được emit">
<ns-pony [pony]="pony" (ponySelected)="betOnPony($event)"></ns-pony>
</textarea>
<textarea class="code" data-lang="ts">
betOnPony(pony: PonyModel): void { /* làm gì đó với pony được chọn */ }

// Tên sự kiện khác tên emitter:
@Output('ponySelected') readonly emitter = new EventEmitter<PonyModel>();
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
export class SelectablePonyComponent {
  pony = input.required<PonyModel>();
  ponySelected = output<PonyModel>();                 // thay @Output + EventEmitter
  select() { this.ponySelected.emit(this.pony()); }
}
</textarea><p>Và <code>model()</code> cho binding hai chiều <code>[(value)]</code>.</p></div>`
    },
    {
      id: 'lifecycle', title: 'Vòng đời (lifecycle)',
      html: `
<p>Điều quan trọng nhất cần nhớ: <b>input chưa có giá trị trong constructor</b>. Muốn dùng input (ví dụ để tải dữ liệu) hãy chờ một hook vòng đời:</p>
<div class="tablewrap"><table>
<tr><th>Hook</th><th>Khi nào</th><th>Dùng để</th></tr>
<tr><td><code>ngOnChanges(changes)</code></td><td>Mỗi khi input đổi (trước ngOnInit lần đầu). Có <code>previousValue / currentValue / isFirstChange()</code></td><td>Phản ứng khi nhiều input đổi</td></tr>
<tr><td><code>ngOnInit()</code></td><td>Một lần, sau lần đổi input đầu tiên</td><td><b>Khởi tạo</b> (tải dữ liệu…)</td></tr>
<tr><td><code>ngOnDestroy()</code></td><td>Khi component bị gỡ</td><td><b>Dọn dẹp</b> (interval, subscription)</td></tr>
<tr><td><code>ngDoCheck</code></td><td>Mỗi chu kỳ change detection</td><td>Nâng cao, hiếm dùng</td></tr>
<tr><td><code>ngAfterContentInit / Checked</code></td><td>Sau khi nội dung được chiếu vào (ng-content) kiểm tra</td><td>Chương 23</td></tr>
<tr><td><code>ngAfterViewInit / Checked</code></td><td>Sau khi template của component kiểm tra xong</td><td>Thao tác DOM/focus phần tử</td></tr>
</table></div>

<div class="widget" id="w-life">
  <h4>🔄 Vòng đời trực quan</h4>
  <p class="hint">Bấm <b>Tạo</b>, rồi <b>đổi input</b>, rồi <b>Hủy</b>. Component này có một <code>setInterval</code> in “hello”. Thử huỷ khi bỏ tích ô “dọn dẹp” để thấy rò rỉ.</p>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="lf-create">▶ Tạo component</button>
    <label>Input pony: <select id="lf-pony"><option>Rainbow Dash</option><option>Pinkie Pie</option><option>Fluttershy</option></select></label>
    <button class="btn alt" id="lf-change">↻ Áp dụng input mới</button>
    <button class="btn alt" id="lf-destroy">✖ Hủy component</button>
    <label><input type="checkbox" id="lf-clean" checked> ngOnDestroy có <code>clearInterval</code></label>
    <button class="btn alt" id="lf-reset">Dọn sạch</button>
  </div>
  <div id="lf-hooks" class="row" style="margin-bottom:10px"></div>
  <div class="output" id="lf-log" style="border-radius:8px;height:230px;overflow:auto"></div>
  <p class="hint" id="lf-leak" style="margin-top:8px"></p>
</div>

<textarea class="code" data-lang="ts" data-title="ngOnInit, ngOnChanges, ngOnDestroy">
@Directive({ selector: '[initDirective]' })
export class OnInitDirective implements OnInit, OnChanges, OnDestroy {
  @Input() pony: string;
  sayHello?: number;

  constructor() { console.log(\`inputs are \${this.pony}\`); }     // "undefined" – luôn luôn!

  ngOnChanges(changes: SimpleChanges): void {
    const c = changes['pony'];
    console.log(\`changed from \${c.previousValue} to \${c.currentValue}, first? \${c.isFirstChange()}\`);
  }
  ngOnInit(): void {
    console.log(\`inputs are \${this.pony}\`);                     // đã có giá trị
    this.sayHello = window.setInterval(() => console.log('hello'), 1000);
  }
  ngOnDestroy(): void {
    window.clearInterval(this.sayHello);                           // tránh rò rỉ bộ nhớ
  }
}
</textarea>
<div class="box tip"><b>Chỉ muốn phản ứng khi một input đổi?</b><p>Dùng setter: <code>@Input() set pony(v: string) { ... }</code>. <code>ngOnChanges</code> hữu ích khi theo dõi nhiều input cùng lúc.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Với signals: dùng <code>computed()</code> thay <code>ngOnChanges</code> cho giá trị suy ra, <code>effect()</code> cho tác dụng phụ, và <code>inject(DestroyRef).onDestroy(...)</code> hoặc <code>takeUntilDestroyed()</code> thay cho <code>ngOnDestroy</code> thủ công.</p></div>`
    },
    {
      id: 'component', title: 'Phần dành riêng cho component',
      html: `
<p>Component có thêm những tuỳ chọn mà directive không có:</p>
<div class="tablewrap"><table>
<tr><th>Tuỳ chọn</th><th>Ý nghĩa</th></tr>
<tr><td><code>template</code> / <code>templateUrl</code></td><td>HTML inline hoặc file riêng (không dùng cả hai). Ngắn (1–2 dòng) → inline; dài → file cùng thư mục: <code>templateUrl: './pony.component.html'</code>.</td></tr>
<tr><td><code>styles</code> / <code>styleUrls</code></td><td>CSS của riêng component (mảng chuỗi / mảng file). Xem chương 15.</td></tr>
<tr><td><code>providers</code></td><td>Service tiêm được vào component <b>và các con</b> (chương 10).</td></tr>
<tr><td><code>viewProviders</code></td><td>Giống providers nhưng <b>chỉ</b> cho view của component, không cho nội dung được chiếu vào.</td></tr>
</table></div>
<textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-styled-pony',
  template: '<div class="pony">{{ pony.name }}</div>',
  styles: ['.pony { color: red; }']
})
export class StyledPonyComponent { @Input() pony: any; }
</textarea>
<textarea class="code" data-lang="ts" data-title="Directive cũng có providers">
@Directive({ selector: '[providersDirective]', providers: [PoniesService] })
export class ProvidersDirective {
  constructor(poniesService: PoniesService) { console.log(poniesService.list()); }
}
</textarea>
<div class="box modern"><b>🆕 Standalone (mặc định từ Angular 19)</b>
<p>Không còn <code>declarations</code> trong NgModule; component khai báo thứ nó dùng ngay trong <code>imports</code>:</p>
<textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-ponies',
  imports: [PonyComponent, NgFor],         // hoặc dùng @for và không cần NgFor
  template: \`@for (p of ponies; track p.id) { <ns-pony [pony]="p" (ponySelected)="bet($event)" /> }\`
})
export class PoniesComponent { ponies = [...]; bet(p: PonyModel) {} }
</textarea><p>Mẫu cũ <code>moduleId: module.id</code> mà sách nhắc không còn cần nữa.</p></div>`
    },
    {
      id: 'cheat', title: 'Bảng tóm tắt',
      html: `
<div class="tablewrap"><table>
<tr><th>Mình muốn…</th><th>Dùng</th></tr>
<tr><td>Gắn hành vi vào phần tử có sẵn</td><td><code>@Directive({ selector: '[tên]' })</code></td></tr>
<tr><td>Tạo khối giao diện tái sử dụng</td><td><code>@Component({ selector: 'ns-tên', template })</code></td></tr>
<tr><td>Cha → con</td><td>Input: <code>[prop]="x"</code></td></tr>
<tr><td>Con → cha</td><td>Output: <code>(event)="f($event)"</code></td></tr>
<tr><td>Dùng giá trị input để khởi tạo</td><td><code>ngOnInit</code> (không phải constructor)</td></tr>
<tr><td>Dọn timer/subscription</td><td><code>ngOnDestroy</code></td></tr>
</table></div>
<p>Bạn có thể luyện đúng bài này với bài tập <b>Pony component</b> và <b>Race detail</b> trong Pro Pack của sách. Tiếp theo (chương 15): style và đóng gói CSS cho component.</p>`
    }
  ],
  quiz: [
    { q: 'Khác biệt chính giữa directive và component?', options: ['Component có template, directive thì không', 'Directive nhanh hơn', 'Component không có selector'], answer: 0, why: 'Component = directive + template (và style).' },
    { q: 'Selector <code>footer:not(.alert)</code> khớp phần tử nào?', options: ['Mọi footer', 'footer không có class alert', 'Mọi phần tử có class alert'], answer: 1, why: ':not() loại trừ những phần tử có class alert.' },
    { q: 'Dữ liệu đi từ cha xuống con bằng?', options: ['Output', 'Input (property binding)', 'Constructor'], answer: 1, why: 'Property binding [x]="..." cho @Input.' },
    { q: 'Con báo cho cha rằng một pony được chọn bằng cách?', options: ['Sửa trực tiếp biến của cha', '@Output EventEmitter.emit(pony)', 'Gọi constructor của cha'], answer: 1, why: 'Dữ liệu ra khỏi component qua event.' },
    { q: 'Vì sao đọc <code>this.pony</code> trong constructor luôn là undefined?', options: ['Do lỗi TypeScript', 'Input được gán sau khi constructor chạy', 'Do pony là private'], answer: 1, why: 'Angular tạo instance rồi mới gán input; dùng ngOnInit để truy cập.' },
    { q: 'Hook nào để dọn <code>setInterval</code>?', options: ['ngOnInit', 'ngOnChanges', 'ngOnDestroy'], answer: 2, why: 'ngOnDestroy chạy khi component bị gỡ — chỗ đúng để clearInterval / unsubscribe.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    /* ===== bộ thử selector ===== */
    const sels = ['footer', '.alert', '[color]', '[color=red]', 'footer[color=red]', '[color],footer.alert', 'footer:not(.alert)', '[doNothing]', 'div.loggable[logText]:not([notLoggable=true])'];
    const els = [
      '<footer>', '<footer class="alert">', '<footer color="red">', '<footer color="blue" class="alert">', '<span class="alert">',
      '<div doNothing>Click me</div>', '<div class="loggable" logText="text">Hello</div>', '<div class="loggable" logText="text" notLoggable="true">Hello</div>'
    ];
    const box = document.createElement('div');
    const nodes = els.map(h => { box.innerHTML = h; return box.firstElementChild; });
    const sin = $('#sel-in'), pre = $('#sel-presets');
    function selDraw() {
      let err = null, n = 0;
      const rows = nodes.map((el, i) => {
        let ok = false;
        try { ok = el.matches(sin.value); } catch (e) { err = e; }
        if (ok) n++;
        const code = esc(els[i].replace(/><\/\w+>$/, '>'));
        return `<div class="kv ${ok ? 'hit' : 'miss'}" style="display:flex"><span class="k">${ok ? '✓' : '·'}</span><span class="v mono" style="font-weight:400">${code}</span></div>`;
      }).join('');
      $('#sel-els').innerHTML = rows;
      $('#sel-msg').textContent = err ? 'Selector không hợp lệ.' : `${n}/${nodes.length} phần tử khớp — directive sẽ được tạo ${n} lần.`;
    }
    sels.forEach(s => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = s.length > 26 ? s.slice(0, 24) + '…' : s; b.title = s; b.onclick = () => { sin.value = s; selDraw(); }; pre.appendChild(b); });
    sin.oninput = selDraw; sin.value = sels[4]; selDraw();

    /* ===== input / output ===== */
    let ponies = [{ id: 1, name: 'Rainbow Dash' }, { id: 2, name: 'Pinkie Pie' }], nextId = 3;
    const names = ['Fluttershy', 'Applejack', 'Twilight', 'Rarity', 'Spike'];
    const iolog = $('#io-log');
    const say = (t, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; iolog.appendChild(d); iolog.scrollTop = iolog.scrollHeight; };
    const R = Rx;
    const children = new Map();     // id -> { emitter, el, pony }
    function renderParent() {
      const host = $('#io-parent');
      ponies.forEach(p => {
        let c = children.get(p.id);
        if (!c) {
          const el = document.createElement('div');
          el.style.cssText = 'border:2px dashed var(--accent);border-radius:10px;padding:8px 12px;margin:6px 0;cursor:pointer;background:var(--surface)';
          const emitter = new R.EventEmitter();
          c = { el, emitter, pony: null }; children.set(p.id, c);
          el.onclick = () => { say(`↑ (ponySelected) emit(${JSON.stringify(c.pony)})`, 'ok'); c.emitter.emit(c.pony); };
          emitter.subscribe(v => { $('#io-bet').textContent = v.name; say(`  cha: betOnPony($event) → ${v.name}`); });
          host.appendChild(el);
        }
        if (c.pony !== p) {                               // input thay đổi → con render lại
          const first = c.pony === null;
          say(`↓ [pony]="${p.name}"` + (first ? '  (tạo ns-pony)' : '  (ngOnChanges)'), 'dim');
          c.pony = p; c.el.innerHTML = `<small class="mono">&lt;ns-pony&gt;</small> <b>${esc(p.name)}</b> <small>(bấm để chọn)</small>`;
        }
      });
    }
    $('#io-rename').onclick = () => { ponies = ponies.map((p, i) => (i === 0 ? { ...p, name: names[Math.floor(Math.random() * names.length)] } : p)); renderParent(); };
    $('#io-add').onclick = () => { ponies = [...ponies, { id: nextId++, name: names[Math.floor(Math.random() * names.length)] }]; renderParent(); };
    $('#io-clear').onclick = () => { iolog.innerHTML = ''; };
    renderParent();

    /* ===== lifecycle ===== */
    const HOOKS = ['constructor', 'ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'];
    const lflog = $('#lf-log'), hooksBox = $('#lf-hooks');
    hooksBox.innerHTML = HOOKS.map(h => `<span class="pill" data-h="${h}" style="background:var(--surface2);color:var(--muted);font-size:12px">${h}</span>`).join('');
    let comp = null, ticks = 0, leaked = new Set(), lfBusy = false;
    const lline = (t, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; lflog.appendChild(d); lflog.scrollTop = lflog.scrollHeight; };
    const flash = async h => { const p = hooksBox.querySelector(`[data-h="${h}"]`); p.style.background = 'var(--accent)'; p.style.color = '#fff'; await sleep(220); p.style.background = 'var(--okbg)'; p.style.color = 'var(--ok)'; };
    const resetPills = () => hooksBox.querySelectorAll('.pill').forEach(p => { p.style.background = 'var(--surface2)'; p.style.color = 'var(--muted)'; });
    const leak = () => { $('#lf-leak').innerHTML = leaked.size ? `⚠ <b>${leaked.size}</b> interval đang rò rỉ (component đã bị hủy nhưng vẫn in “hello”). Bấm “Dọn sạch”.` : ''; };
    async function run(hook, msg, cls) { lline(`${hook}()  ${msg || ''}`, cls); await flash(hook); }
    $('#lf-create').onclick = async () => {
      if (comp || lfBusy) return lline('(component đang tồn tại — hãy hủy trước)', 'dim');
      lfBusy = true; resetPills(); const pony = $('#lf-pony').value;
      comp = { pony: undefined, timer: null };
      await run('constructor', '→ this.pony = undefined  ❌ input chưa có', 'err');
      const prev = comp.pony; comp.pony = pony;
      await run('ngOnChanges', `→ pony: ${prev} ➜ ${pony}  (isFirstChange = true)`);
      await run('ngOnInit', `→ this.pony = "${pony}" ✓ bắt đầu setInterval`, 'ok');
      comp.timer = setInterval(() => lline(`   hello (${comp && comp.timer ? 'component' : 'RÒ RỈ'}) #${++ticks}`, 'dim'), 1000); comp.id = comp.timer; leaked.add(comp.timer);
      for (const h of ['ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked']) await run(h);
      leaked.delete(comp.timer); lfBusy = false; leak();
    };
    $('#lf-change').onclick = async () => {
      if (!comp || lfBusy) return lline('(chưa có component để đổi input)', 'dim');
      const pony = $('#lf-pony').value;
      if (pony === comp.pony) return lline('(giá trị input không đổi → KHÔNG gọi ngOnChanges)', 'dim');
      lfBusy = true; const prev = comp.pony; comp.pony = pony;
      await run('ngOnChanges', `→ pony: ${prev} ➜ ${pony}  (isFirstChange = false)`);
      for (const h of ['ngDoCheck', 'ngAfterContentChecked', 'ngAfterViewChecked']) await run(h);
      lfBusy = false;
    };
    $('#lf-destroy').onclick = async () => {
      if (!comp || lfBusy) return lline('(chưa có component để hủy)', 'dim');
      lfBusy = true; const c = comp; comp = null;
      const clean = $('#lf-clean').checked;
      await run('ngOnDestroy', clean ? '→ clearInterval(...) ✓ dọn sạch' : '→ (bạn QUÊN clearInterval!)', clean ? 'ok' : 'err');
      if (clean) clearInterval(c.timer); else { c.timer = null; leaked.add(c.id); }
      lfBusy = false; leak();
    };
    $('#lf-reset').onclick = () => { leaked.forEach(clearInterval); leaked.clear(); if (comp) clearInterval(comp.timer); comp = null; lfBusy = false; lflog.innerHTML = ''; resetPills(); leak(); };
  }
});
