registerChapter(9, {
  time: '75 phút',
  lead: 'Template là cách bạn nói với Angular “phần nào của HTML là động”. Mỗi cú pháp có ký hiệu riêng: <code>{{ }}</code> nội suy, <code>[ ]</code> property binding, <code>( )</code> sự kiện, <code>#</code> biến cục bộ, <code>*</code> directive cấu trúc. Mọi “sân chơi” dưới đây chạy <b>một bộ render template thật</b> (cùng cú pháp Angular): sửa template và state, bấm nút, xem kết quả và lỗi.',
  sections: [
    {
      id: 'interp', title: 'Nội suy {{ }}',
      html: `
<p>Component có một field, template hiển thị nó bằng <b>nội suy</b> (“ria mép” <code>{{ }}</code>). Khi Angular gặp <code>&lt;ns-root&gt;</code> nó tạo một instance của class — instance này là <b>ngữ cảnh đánh giá</b> của mọi biểu thức trong template. Giá trị đổi → template tự cập nhật (change detection).</p>
<div class="play" data-tpl="<h1>PonyRacer</h1>
<h2>Welcome {{ user?.name }}</h2>
<p>{{ numberOfUsers }} users</p>" data-ctx="{
  user: undefined,        // thử: { name: 'Cédric' }
  numberOfUsers: 146
}"></div>
<div class="box tip"><b>Thử</b><ul>
<li>Đổi <code>user?.name</code> thành <code>user.name</code> khi <code>user</code> là <code>undefined</code>: lỗi. <code>?.</code> (<b>safe navigation</b>) tránh lỗi khi dữ liệu chưa về (ví dụ đang gọi server).</li>
<li>Gõ nhầm <code>{{ users.name }}</code> (thừa chữ s): báo lỗi ngay, thay vì im lặng như AngularJS 1.x — nguyên nhân số một khiến người mới mất thời gian.</li>
<li>Biến không tồn tại/ <code>null</code> được hiển thị là chuỗi rỗng, không phải chữ “undefined”.</li></ul></div>`
    },
    {
      id: 'components', title: 'Dùng component khác trong template',
      html: `
<p>Muốn hiển thị <code>RacesComponent</code> trong <code>AppComponent</code>, chỉ cần viết thẻ khớp selector của nó. Nhưng chưa đủ: Angular phải <b>biết</b> component đó — nó phải nằm trong <code>declarations</code> của module (hoặc <code>imports</code> của component standalone). Tích/bỏ tích dưới đây:</p>
<div class="play" data-tpl="<h1>PonyRacer</h1>
<ns-races></ns-races>" data-ctx="{}" data-comp="races"></div>
<textarea class="code" data-lang="ts">
// Sách (NgModule)
@NgModule({ imports: [BrowserModule], declarations: [AppComponent, RacesComponent], bootstrap: [AppComponent] })
// Hiện nay (standalone): @Component({ selector: 'ns-root', imports: [RacesComponent], ... })
</textarea>`
    },
    {
      id: 'property', title: 'Property binding [ ]',
      html: `
<p>Nội suy chỉ là <b>đường tắt</b> của thứ cốt lõi: <b>property binding</b>. Mọi <b>thuộc tính DOM</b> đều ghi được qua một attribute đặt trong ngoặc vuông (HTML hợp lệ — attribute có thể bắt đầu bằng gần như bất cứ ký tự nào). Ví dụ: <code>{{ user.name }}</code> chính là <code>[textContent]="user.name"</code>. Tên phân biệt hoa thường (<code>textContent</code>, không phải <code>textcontent</code>).</p>
<h3>Vì sao thuộc tính (property) chứ không phải attribute?</h3>
<p>Mỗi attribute chuẩn có property tương ứng trên node DOM, nhưng property có <b>giá trị cập nhật</b> và có thể là <b>boolean</b>. Kiểm chứng trên DOM thật:</p>
<textarea class="live" data-title="Attribute (HTML) vs property (DOM)">
const input = document.createElement('input');
input.setAttribute('value', 'hello');
console.log('attribute value:', input.getAttribute('value'), '| property value:', input.value);

input.value = 'người dùng gõ vào';                 // giống người dùng gõ: chỉ property đổi
console.log('attribute value:', input.getAttribute('value'), '| property value:', input.value, '← attribute vẫn là "hello"');

const select = document.createElement('select');
select.innerHTML = '<option selected="false">Rainbow Dash</option><option>Pinkie Pie</option>';
console.log('option 0 (attribute selected="false") vẫn được chọn?', select.options[0].selected);   // true: attribute chỉ cần "có mặt"
select.options[0].selected = false;                // property boolean: đặt đúng giá trị
console.log('sau khi đặt property selected = false:', select.options[0].selected);
</textarea>
<p>Vì dùng <b>property</b>, Angular làm được những việc từng cần một directive riêng ở AngularJS (<code>ng-src</code>, <code>ng-hide</code>…):</p>
<div class="play" data-tpl="<p [style.color]=&quot;foreground&quot;>Friendship is Magic</p>
<div [hidden]=&quot;isHidden&quot;>Ẩn hay hiện?</div>
<input [value]=&quot;pony.name&quot; [disabled]=&quot;isHidden&quot;>
<img [alt]=&quot;pony.name&quot; [title]=&quot;'Pony ' + pony.name&quot; src=&quot;&quot;>
<button (click)=&quot;isHidden = !isHidden&quot;>Đổi isHidden</button>
<button (click)=&quot;foreground = foreground === 'green' ? 'crimson' : 'green'&quot;>Đổi màu</button>" data-ctx="{
  foreground: 'green',
  isHidden: false,
  pony: { name: 'Rainbow Dash' }
}"></div>
<div class="tablewrap"><table>
<tr><th>Cách viết</th><th>Tương đương</th></tr>
<tr><td><code>name="Rainbow Dash"</code></td><td>Giá trị tĩnh (không phải binding)</td></tr>
<tr><td><code>[name]="pony.name"</code></td><td>Biểu thức (cách nên dùng)</td></tr>
<tr><td><code>name="{{ pony.name }}"</code></td><td>Giống hệt dòng trên</td></tr>
<tr><td><code>name="Pony {{ pony.name }}"</code> ≡ <code>[name]="'Pony ' + pony.name"</code></td><td>Ghép chuỗi</td></tr>
<tr><td><code>[name]="pony.fullName()"</code></td><td>Gọi hàm (cẩn thận hiệu năng, chương 25)</td></tr>
<tr><td><code>[style.color]</code>, <code>[class.x]</code>, <code>[attr.data-k]</code></td><td>Binding vào style/class/attribute con</td></tr>
</table></div>
<div class="box info"><b>Cũng dùng được với Web Components thật</b><p><code>&lt;ns-pony [name]="pony.name"&gt;</code> hoạt động dù <code>ns-pony</code> là component Angular hay Web Component bên thứ ba — cú pháp không phụ thuộc cách nhà phát triển thiết kế component (chương 6).</p></div>`
    },
    {
      id: 'events', title: 'Sự kiện ( )',
      html: `
<p>Phản ứng với tương tác của người dùng bằng <code>(tên-sự-kiện)="câu lệnh"</code>. Không còn một directive cho mỗi sự kiện (<code>ng-click</code>, <code>ng-keyup</code>…). Hoạt động với sự kiện DOM chuẩn <b>và</b> sự kiện tuỳ chỉnh của component/Web Component.</p>
<div class="play" data-tpl="<button (click)=&quot;refreshRaces()&quot;>Refresh the races list</button>
<p>{{ races.length }} races</p>

<div (click)=&quot;log('div bắt được click (event bubbling)')&quot;>
  <button (click)=&quot;log('button: ' + $event.type)&quot;>Bấm — sự kiện nổi bọt lên div</button>
</div>

<textarea (keydown.space)=&quot;log('đã nhấn Space')&quot; (keydown.alt.enter)=&quot;log('Alt+Enter')&quot;>Gõ Space hoặc Alt+Enter</textarea>

<button (click)=&quot;firstName = 'Cédric'; lastName = 'Exbrayat'&quot;>Nhiều câu lệnh: {{ firstName }} {{ lastName }}</button>
<ul><li *ngFor=&quot;let l of logs&quot;>{{ l }}</li></ul>" data-ctx="{
  races: [],
  firstName: 'Nobody', lastName: 'Nobody',
  logs: [],
  refreshRaces() { this.races = [{ name: 'London' }, { name: 'Lyon' }]; },
  log(m) { this.logs = [...this.logs, m]; }
}"></div>
<ul>
<li>Câu lệnh có thể là lời gọi hàm (nên làm vậy: dễ test, template gọn) hoặc <b>nhiều câu lệnh</b> cách nhau <code>;</code> (kể cả gán — nhưng không khuyến khích).</li>
<li><code>$event</code> là đối tượng sự kiện: <code>event.preventDefault()</code>, <code>event.stopPropagation()</code>. Sự kiện <b>nổi bọt</b>: listener ở phần tử cha vẫn được gọi.</li>
<li>Sự kiện bàn phím có bộ lọc: <code>(keydown.space)</code>, <code>(keydown.alt.space)</code>, <code>(keyup.enter)</code>…</li>
<li>Sự kiện tuỳ chỉnh: <code>&lt;ns-races (newRaceAvailable)="onNewRace()"&gt;</code> (chương 14).</li></ul>`
    },
    {
      id: 'exprstmt', title: 'Expression khác statement',
      html: `
<p><code>[property]="doSomething()"</code> và <code>(event)="doSomething()"</code> trông giống nhau nhưng khác bản chất:</p>
<ul>
<li><b>Expression</b> (trong <code>[ ]</code> và <code>{{ }}</code>): chạy <b>ở mỗi lần change detection</b> để xem property có cần cập nhật không → phải <b>nhanh</b>, <b>đơn lẻ</b> (không nối bằng <code>;</code>), <b>không có tác dụng phụ</b> (không gán), <b>không có từ khoá</b> (<code>if</code>, <code>var</code>…).</li>
<li><b>Statement</b> (trong <code>( )</code>): chạy <b>chỉ khi sự kiện xảy ra</b>; có thể gán, nối nhiều câu lệnh, dùng từ khoá — vì mục đích của nó là <i>làm cho điều gì đó xảy ra</i>.</li>
</ul>
<div class="widget" id="w-es">
  <h4>🔍 Bộ kiểm tra expression / statement</h4>
  <div class="row" style="margin-bottom:8px"><button class="btn alt es-ex" data-c="user.name">user.name</button><button class="btn alt es-ex" data-c="user = 'Cédric'">user = 'Cédric'</button><button class="btn alt es-ex" data-c="a(); b()">a(); b()</button><button class="btn alt es-ex" data-c="if (x) y()">if (x) y()</button><button class="btn alt es-ex" data-c="count + 1">count + 1</button><button class="btn alt es-ex" data-c="x = 1; y = 2">x = 1; y = 2</button></div>
  <div class="row" style="margin-bottom:8px">
    <label>Dùng trong: <select id="es-kind"><option value="prop">[property]="…" — expression</option><option value="event">(event)="…" — statement</option></select></label>
    <input type="text" id="es-code" class="mono" style="flex:1;min-width:240px" value="user = 'Cédric'" spellcheck="false">
  </div>
  <div id="es-res"></div>
  <div class="hint" id="es-cd" style="margin-top:8px"></div>
</div>`
    },
    {
      id: 'refs', title: 'Biến cục bộ #',
      html: `
<p>Angular tìm biến không chỉ trong instance của component mà còn trong <b>biến cục bộ</b> do bạn khai báo ngay trong template bằng <code>#tên</code>. Biến tham chiếu tới <b>phần tử DOM</b> (hoặc instance của component/Web Component) và dùng được ở <b>bất cứ đâu trong template</b>:</p>
<div class="play" data-tpl="<input type=&quot;text&quot; #name placeholder=&quot;gõ gì đó&quot;>
<button (click)=&quot;name.focus()&quot;>Focus ô nhập</button>
<p>Bạn đã gõ: <b>{{ name.value }}</b></p>" data-ctx="{}"></div>
<p>Rất hợp để gọi method của phần tử khác (<code>name.focus()</code>) hay của một component con (<code>&lt;google-youtube #player&gt;&lt;/google-youtube&gt; &lt;button (click)="player.play()"&gt;</code>) mà không cần viết directive như thời AngularJS. Ở chương 19 bạn sẽ gặp <code>#userForm="ngForm"</code> để lấy directive thay vì phần tử.</p>`
    },
    {
      id: 'structural', title: 'Directive cấu trúc: *ngIf, *ngFor, ngSwitch',
      html: `
<p>Property và event binding không đổi được <b>cấu trúc DOM</b> (thêm/bớt phần tử). Việc đó thuộc về <b>directive cấu trúc</b>, đánh dấu bằng <code>*</code>. Chúng dựa vào <code>&lt;ng-template&gt;</code> (nội dung không hiển thị, chỉ được dùng khi directive quyết định). Dạng <code>*ngIf="cond"</code> là cú pháp tắt của <code>&lt;ng-template [ngIf]="cond"&gt;…&lt;/ng-template&gt;</code> — bạn gần như luôn dùng dạng tắt.</p>
<h3>*ngIf (có else)</h3>
<div class="play" data-tpl="<div *ngIf=&quot;races.length > 0; else empty&quot;><h2>Races</h2></div>
<ng-template #empty><h2>No races.</h2></ng-template>
<button (click)=&quot;races = races.length ? [] : [{name:'London'}]&quot;>Đảo danh sách</button>" data-ctx="{ races: [] }"></div>
<h3>*ngFor và các biến xuất ra</h3>
<div class="play" data-tpl="<button (click)=&quot;refreshPonies()&quot;>Refresh</button>
<ul>
  <li *ngFor=&quot;let pony of ponies; index as i; even as isEven&quot; [style.color]=&quot;isEven ? 'green' : 'black'&quot;>
    {{ i }} - {{ pony.name }}
  </li>
</ul>" data-ctx="{
  ponies: [{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }, { name: 'Applejack' }],
  refreshPonies() { this.ponies = [{ name: 'Fluttershy' }, { name: 'Rarity' }]; }
}"></div>
<p>Biến xuất ra: <code>index</code>, <code>even</code>, <code>odd</code>, <code>first</code>, <code>last</code> (gán bằng <code>index as i</code>). <code>*ngFor="let race of races"</code> là <b>microsyntax</b> của dạng dài <code>&lt;ng-template ngFor let-race [ngForOf]="races"&gt;</code> mà bạn sẽ không bao giờ dùng.</p>
<h3>ngSwitch</h3>
<div class="play" data-tpl="<div [ngSwitch]=&quot;messageCount&quot;>
  <p *ngSwitchCase=&quot;0&quot;>You have no message</p>
  <p *ngSwitchCase=&quot;1&quot;>You have a message</p>
  <p *ngSwitchDefault>You have some messages</p>
</div>
<button (click)=&quot;messageCount = messageCount + 1&quot;>+1 ({{ messageCount }})</button>" data-ctx="{ messageCount: 0 }"></div>
<div class="box modern"><b>🆕 Hiện nay: control flow trong template (Angular 17+)</b>
<textarea class="code" data-lang="html">
@if (races.length > 0) { <h2>Races</h2> } @else { <h2>No races.</h2> }

@for (pony of ponies; track pony.id; let i = $index, isEven = $even) {
  <li [style.color]="isEven ? 'green' : 'black'">{{ i }} - {{ pony.name }}</li>
} @empty { <li>Không có pony</li> }

@switch (messageCount) { @case (0) { <p>You have no message</p> } @case (1) { <p>You have a message</p> } @default { <p>You have some messages</p> } }
</textarea><p>Không cần import <code>NgIf</code>/<code>NgFor</code>; <code>@for</code> bắt buộc có <code>track</code>; nhanh hơn và có <code>@empty</code>. Còn có <code>@let</code> (khai báo biến trong template) và <code>@defer</code>. <code>*ngIf/*ngFor</code> vẫn chạy nhưng dần bị thay thế.</p></div>`
    },
    {
      id: 'styleclass', title: 'ngStyle và ngClass',
      html: `
<p>Một style/class: <code>[style.color]="foreground"</code>, <code>[class.awesome-div]="isAwesome()"</code>. Nhiều cái cùng lúc: <b><code>ngStyle</code></b> và <b><code>ngClass</code></b> nhận một <b>object</b> (khoá có thể camelCase hoặc dash-case):</p>
<div class="play" data-tpl="<div [ngStyle]=&quot;{fontWeight: weight, 'font-size': size + 'px', color: color}&quot;>I've got style</div>
<div [ngClass]=&quot;{'awesome-div': isAwesome, 'colored-div': isColored}&quot; [class.extra]=&quot;isAwesome&quot;>Xem class trong DOM</div>
<button (click)=&quot;isAwesome = !isAwesome&quot;>isAwesome = {{ isAwesome }}</button>
<button (click)=&quot;isColored = !isColored; size = size + 4&quot;>isColored + cỡ chữ</button>" data-ctx="{ weight: 'bold', size: 18, color: 'crimson', isAwesome: true, isColored: false }"></div>`
    },
    {
      id: 'canonical', title: 'Cú pháp canonical',
      html: `
<p>Mọi ký hiệu đều có dạng dài tương đương — hữu ích nếu hệ thống template phía server vướng <code>[]</code>/<code>()</code>, hoặc bạn không ưa chúng:</p>
<div class="tablewrap"><table>
<tr><th>Ngắn</th><th>Canonical</th></tr>
<tr><td><code>[name]="pony.name"</code></td><td><code>bind-name="pony.name"</code></td></tr>
<tr><td><code>(click)="onButtonClick()"</code></td><td><code>on-click="onButtonClick()"</code></td></tr>
<tr><td><code>#name</code></td><td><code>ref-name</code></td></tr>
</table></div>
<div class="play" data-tpl="<input type=&quot;text&quot; ref-name>
<button on-click=&quot;name.focus()&quot;>Focus (on-click, ref-name)</button>
<p bind-hidden=&quot;isHidden&quot; bind-textContent=&quot;'bind-textContent = ' + 'xin chào'&quot;></p>" data-ctx="{ isHidden: false }"></div>`
    },
    {
      id: 'summary', title: 'Tổng kết và ví dụ hoàn chỉnh',
      html: `
<div class="tablewrap"><table>
<tr><th>Ký hiệu</th><th>Ý nghĩa</th></tr>
<tr><td><code>{{ }}</code></td><td>Nội suy</td></tr>
<tr><td><code>[ ]</code></td><td>Property binding (dữ liệu đi vào)</td></tr>
<tr><td><code>( )</code></td><td>Event binding (sự kiện đi ra)</td></tr>
<tr><td><code>#</code></td><td>Khai báo biến cục bộ</td></tr>
<tr><td><code>*</code></td><td>Directive cấu trúc</td></tr>
</table></div>
<p>Cú pháp này cho phép tương tác với Web Components chuẩn như không framework nào khác, và vì không có nhập nhằng giữa các nghĩa, công cụ/IDE ngày càng cảnh báo chính xác. Mất chút thời gian để quen, rồi bạn sẽ đọc/viết rất nhanh.</p>
<h3>Ví dụ hoàn chỉnh: PoniesComponent</h3>
<p>Danh sách chỉ hiện khi không rỗng, dòng chẵn có màu, và nút làm mới:</p>
<div class="play" data-tpl="<button (click)=&quot;refreshPonies()&quot;>Refresh</button>
<button (click)=&quot;ponies = []&quot;>Xoá hết</button>
<ul *ngIf=&quot;ponies.length > 0; else none&quot;>
  <li *ngFor=&quot;let pony of ponies; even as isEven&quot; [style.color]=&quot;isEven ? 'green' : 'black'&quot;>
    {{ pony.name }}
  </li>
</ul>
<ng-template #none><p>Chưa có pony nào.</p></ng-template>" data-ctx="{
  ponies: [{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }],
  refreshPonies() { this.ponies = [{ name: 'Fluttershy' }, { name: 'Rarity' }, { name: 'Applejack' }]; }
}"></div>
<p>Dữ liệu vẫn cứng; sau khi học dependency injection ta sẽ lấy chúng từ server qua service HTTP (chương 10, 11, 17).</p>`
    }
  ],
  quiz: [
    { q: '<code>{{ user.name }}</code> thực chất là đường tắt của?', options: ['[textContent]="user.name"', '(click)="user.name"', '*ngIf="user.name"'], answer: 0, why: 'Nội suy là property binding vào textContent.' },
    { q: 'Safe navigation operator?', options: ['user?.name — không lỗi khi user là undefined/null', 'user!.name', 'user||name'], answer: 0, why: 'Hữu ích khi dữ liệu đến từ server và ban đầu chưa có.' },
    { q: 'Vì sao Angular bind vào thuộc tính DOM (property) mà không phải attribute?', options: ['Property có giá trị cập nhật và có thể boolean; attribute chỉ là giá trị khởi tạo', 'Property nhanh hơn một chút', 'Không có lý do'], answer: 0, why: 'Ví dụ value và selected.' },
    { q: 'Câu nào đúng về expression và statement?', options: ['Expression chạy mỗi lần change detection, không được có tác dụng phụ; statement chạy khi có sự kiện và có thể gán', 'Giống nhau', 'Statement chạy mỗi lần change detection'], answer: 0, why: '[prop]="expr" khác (event)="stmt".' },
    { q: '<code>*ngFor="let pony of ponies; index as i"</code> cho bạn?', options: ['Biến i là chỉ số phần tử (bắt đầu từ 0)', 'Biến i là pony', 'Sắp xếp danh sách'], answer: 0, why: 'Các biến xuất ra: index, even, odd, first, last.' },
    { q: 'Dấu * trước ngIf có nghĩa là?', options: ['Directive cấu trúc (cú pháp tắt của ng-template)', 'Nhân', 'Bắt buộc'], answer: 0, why: 'Nó thêm/bớt phần tử khỏi DOM.' },
    { q: 'Control flow hiện đại thay *ngIf bằng?', options: ['@if { } @else { }', 'v-if', '[if]'], answer: 0, why: 'Từ Angular 17: @if, @for (bắt buộc track), @switch.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== sân chơi template ===== */
    const decode = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
    root.querySelectorAll('.play').forEach(el => {
      const tpl0 = decode(el.dataset.tpl), ctx0 = decode(el.dataset.ctx), withComp = el.dataset.comp === 'races';
      el.className = 'widget'; el.style.margin = '14px 0';
      el.innerHTML = `<div class="grid2"><div><b>Template</b><textarea class="pl-tpl mono" rows="${Math.min(14, tpl0.split('\n').length + 1)}" style="width:100%;margin-top:6px" spellcheck="false"></textarea></div>
        <div><b>Component (state + method)</b><textarea class="pl-ctx mono" rows="${Math.min(14, ctx0.split('\n').length + 1)}" style="width:100%;margin-top:6px" spellcheck="false"></textarea></div></div>
        ${withComp ? '<label style="display:block;margin:8px 0"><input type="checkbox" class="pl-decl"> <code>RacesComponent</code> có trong <code>declarations</code></label>' : ''}
        <div class="row" style="margin:8px 0"><b>Kết quả</b><button class="btn alt pl-reset" style="margin-left:auto">↺ Khôi phục state</button><label><input type="checkbox" class="pl-dom"> xem DOM</label></div>
        <div class="pl-out" style="border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--surface);min-height:50px"></div>
        <pre class="hl pl-domv" style="display:none;border-radius:8px;margin-top:8px;font-size:12px"></pre>
        <div class="pl-err" style="margin-top:6px"></div>`;
      const tplEl = el.querySelector('.pl-tpl'), ctxEl = el.querySelector('.pl-ctx'), out = el.querySelector('.pl-out'), errEl = el.querySelector('.pl-err'), domv = el.querySelector('.pl-domv'), decl = el.querySelector('.pl-decl');
      tplEl.value = tpl0; ctxEl.value = ctx0;
      const comps = { 'ns-races': { declared: false, cls: class {}, template: '<h2>Races</h2>' } };
      let view = null;
      function showErrs() {
        errEl.innerHTML = view.errors.length ? view.errors.map(m => `<div style="color:var(--err);font-size:13px;font-family:monospace">✖ ${esc(m)}</div>`).join('') : '';
        if (el.querySelector('.pl-dom').checked) { domv.style.display = ''; domv.textContent = out.innerHTML.replace(/></g, '>\n<'); } else domv.style.display = 'none';
      }
      function build() {
        let ctx; try { ctx = new Function('return (' + ctxEl.value + ')')(); } catch (e) { errEl.innerHTML = `<div style="color:var(--err)">✖ State không hợp lệ: ${esc(e.message)}</div>`; return; }
        if (decl) comps['ns-races'].declared = decl.checked;
        view = new MiniTemplate.View(out, tplEl.value, ctx, { components: withComp ? comps : {}, onRender: showErrs });
        view.render();
      }
      tplEl.oninput = () => { if (view) { view.setTemplate(tplEl.value); view.render(); } };
      ctxEl.oninput = build; el.querySelector('.pl-reset').onclick = () => { ctxEl.value = ctx0; build(); };
      el.querySelector('.pl-dom').onchange = () => view && showErrs(); if (decl) decl.onchange = () => { build(); };
      out.addEventListener('input', () => view && view.render());
      build();
    });

    /* ===== expression vs statement ===== */
    function es() {
      const kind = $('#es-kind').value, code = $('#es-code').value;
      let msg, ok;
      if (kind === 'prop') { const bad = MiniTemplate.checkExpr(code); ok = !bad; msg = bad || 'Hợp lệ. Biểu thức sẽ được đánh giá ở MỖI lần change detection (vì vậy phải nhanh và không đổi trạng thái).'; }
      else { try { new Function('with({}){' + code.replace(/\b(\w+)\s*=\s*/g, '$1=') + '}'); ok = true; msg = 'Hợp lệ. Câu lệnh chỉ chạy KHI sự kiện xảy ra; được phép gán, nối nhiều câu lệnh bằng ;, dùng từ khoá.'; } catch (e) { ok = false; msg = 'Parser Error: ' + e.message; } }
      $('#es-res').innerHTML = `<span class="pill ${ok ? 'fulfilled' : 'rejected'}">${ok ? '✓ Hợp lệ' : '✖ Lỗi'}</span> <span class="mono" style="font-size:13px">${esc(msg)}</span>`;
      $('#es-cd').textContent = kind === 'prop' ? 'Mô phỏng 5 lần change detection → biểu thức được đánh giá 5 lần (kể cả khi chẳng có gì đổi).' : 'Mô phỏng 5 lần change detection → statement chạy 0 lần; chỉ chạy khi người dùng thực sự kích hoạt sự kiện.';
    }
    $('#es-kind').onchange = $('#es-code').oninput = es;
    root.querySelectorAll('.es-ex').forEach(b => (b.onclick = () => { $('#es-code').value = b.dataset.c; es(); })); es();
  }
});
