registerChapter(7, {
  time: '20 phút',
  lead: 'Trước khi gõ code, hiểu <b>triết lý</b> của Angular: ứng dụng là một <b>cây component</b>, mỗi component là cặp <i>template + logic</i>, gom thành <i>module</i>, kết nối bằng <i>dependency injection</i>, và framework tự lo <i>change detection</i>. Bạn sẽ khám phá cây component của PonyRacer và chạy một “Angular thu nhỏ” 40 dòng.',
  sections: [
    {
      id: 'components', title: 'Hướng component',
      html: `
<p>Angular <b>hướng component</b>: bạn viết nhiều component nhỏ, ghép lại thành ứng dụng. Component là một nhóm phần tử HTML trong <b>template</b>, phụ trách một việc, cùng <b>logic</b> đi kèm (nạp dữ liệu, phản ứng sự kiện). Với người dùng AngularJS 1.x: giống cặp <i>template + controller</i>, hay một <i>directive</i>.</p>
<p>Xu hướng này giờ phổ biến khắp front-end: React làm vậy từ đầu, Ember, Vue, Svelte… đều xoay quanh component nhỏ. Điểm riêng của Angular: sớm quan tâm tới <b>Web Components</b> chuẩn (chương 6).</p>
<p>Các component xếp <b>thành cây</b>, như DOM: component gốc có con, con lại có con. Hiển thị một cuộc đua pony: app <code>Ponyracer</code> hiện menu <code>Menu</code> (có <code>User</code> đang đăng nhập) và một view <code>Race</code> chứa các <code>Pony</code>. Hãy khám phá:</p>

<style>
#w-tree .nd { border: 2px solid var(--border); border-radius: 10px; padding: 8px 10px; margin: 6px 0; background: var(--surface); cursor: pointer; }
#w-tree .nd.sel { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
#w-tree .nd:hover { border-color: var(--accent); }
#w-tree .tag { font-size: 11px; padding: 1px 8px; border-radius: 99px; margin-left: 4px; }
</style>
<div class="widget" id="w-tree">
  <h4>🌳 Cây component PonyRacer</h4>
  <div class="row" style="margin-bottom:10px">
    <b>Xem theo:</b>
    <label><input type="radio" name="tv" value="comp" checked> Component</label>
    <label><input type="radio" name="tv" value="flow"> Luồng dữ liệu</label>
    <label><input type="radio" name="tv" value="mod"> Module</label>
    <label><input type="radio" name="tv" value="di"> Dependency injection</label>
    <button class="btn alt" id="tv-add">＋ Pony</button><button class="btn alt" id="tv-del">− Pony</button>
  </div>
  <div class="grid2">
    <div id="tv-tree"></div>
    <div><div id="tv-detail"></div><div id="tv-stat" class="hint" style="margin-top:8px"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử</b><ul>
<li>Bấm vào từng component để xem <b>class</b> và <b>template</b> của nó.</li>
<li>“Luồng dữ liệu”: dữ liệu đi <b>xuống</b> bằng <code>[input]</code>, sự kiện đi <b>lên</b> bằng <code>(output)</code> (chương 14).</li>
<li>“Module” cho thấy cách gom component thành đơn vị (một module có thể được lazy-load).</li>
<li>“Dependency injection”: service nào được tiêm vào component nào (chương 10).</li>
<li>Bấm <b>＋ Pony</b>: thêm một phần tử trong mảng <code>race.ponies</code> → thêm một instance <code>PonyComponent</code>. Số instance thay đổi theo dữ liệu.</li></ul></div>`
    },
    {
      id: 'code', title: 'Viết component: class + decorator + template',
      html: `
<p>Angular tận dụng <b>ES2015+</b> và cả <b>decorator</b> (chương 2–4). Component là một class có decorator <code>@Component</code> ghi metadata:</p>
<textarea class="code" data-lang="ts" data-title="race.component.ts">
import { Component } from '@angular/core';
import { RacesService } from './services';

@Component({
  selector: 'ns-race',
  templateUrl: './race.component.html'
})
export class RaceComponent {
  race: any;
  constructor(racesService: RacesService) {          // DI: "tôi cần RacesService"
    racesService.get().then(race => (this.race = race));
  }
}
</textarea>
<textarea class="code" data-lang="html" data-title="race.component.html">
<div>
  <h2>{{ race.name }}</h2>
  <div>{{ race.status }}</div>
  <div *ngFor="let pony of race.ponies">
    <ns-pony [pony]="pony"></ns-pony>      <!-- component con, nhận dữ liệu qua [pony] -->
  </div>
</div>
</textarea>
<p>Người từng dùng AngularJS thấy quen với <code>{{ }}</code>; còn <code>ng-repeat</code> đã được thay bằng <code>*ngFor</code>. Bây giờ, để thấy “phép màu” bên dưới chỉ là những khái niệm đơn giản, đây là <b>một Angular thu nhỏ</b>: đăng ký component theo selector, dựng cây, truyền input, lặp <code>*ngFor</code>.</p>
<textarea class="live" data-title="Angular thu nhỏ: đăng ký component theo selector → dựng cây → in HTML">
const registry = new Map();                                      // selector -> class
const Component = (selector, template) => Cls => { Cls.selector = selector; Cls.template = template; registry.set(selector, Cls); return Cls; };
let instances = 0;

const ev = (inst, scope, expr) => new Function('c', 's', 'with(c){with(s){return (' + expr + ')}}')(inst, scope);

function render(host, Cls, inputs = {}) {                        // dựng một component vào phần tử host
  const inst = Object.assign(new Cls(), inputs); instances++;
  host.innerHTML = Cls.template;
  process(host, inst, {});
}
function process(node, inst, scope) {
  for (const el of [...node.children]) {
    const loop = el.getAttribute('*ngFor');
    if (loop) {                                                  // *ngFor="let pony of race.ponies"
      const m = /let (\\w+) of (.+)/.exec(loop); el.removeAttribute('*ngFor');
      ev(inst, scope, m[2]).forEach(item => { const c = el.cloneNode(true); el.before(c); process({ children: [c] }, inst, { ...scope, [m[1]]: item }); });
      el.remove(); continue;
    }
    const Child = registry.get(el.localName);
    if (Child) {                                                 // phần tử khớp selector của một component → tạo nó
      const inputs = {};
      [...el.attributes].filter(a => /^\\[.*\\]$/.test(a.name)).forEach(a => (inputs[a.name.slice(1, -1)] = ev(inst, scope, a.value)));
      render(el, Child, inputs);
    } else { process(el, inst, scope); }
    [...el.childNodes].filter(n => n.nodeType === 3).forEach(t => (t.textContent = t.textContent.replace(/\\{\\{(.*?)\\}\\}/g, (x, e) => ev(inst, scope, e))));
  }
}

// ---- ứng dụng ----
const Pony = Component('ns-pony', '<span>🐴 {{ pony.name }}</span>')(class PonyComponent {});
const Race = Component('ns-race', '<h2>{{ race.name }}</h2><div *ngFor="let p of race.ponies"><ns-pony [pony]="p"></ns-pony></div>')(
  class RaceComponent { race = { name: 'London', ponies: [{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }, { name: 'Fluttershy' }] }; });
const App = Component('ns-root', '<h1>Ponyracer</h1><ns-race></ns-race>')(class AppComponent {});

const host = document.createElement('div');
render(host, App);                                               // "bootstrap" component gốc
console.log(host.innerHTML.replace(/></g, '>\\n<'));
console.log('\\nSố instance component được tạo:', instances, '(1 App + 1 Race + 3 Pony)');
</textarea>
<div class="box info"><b>Bài học</b><p>Ứng dụng của bạn <b>cũng chỉ là một component</b> như mọi component khác (<code>AppComponent</code> — gốc cây). Bootstrap = tạo component gốc rồi để cây tự dựng theo selector và dữ liệu.</p></div>`
    },
    {
      id: 'pieces', title: 'Các mảnh ghép còn lại của triết lý',
      html: `
<div class="tablewrap"><table>
<tr><th>Khái niệm</th><th>Ý tưởng</th><th>Chương</th></tr>
<tr><td><b>Module</b> (Angular Module, khác ES module)</td><td>Gom component/directive/pipe/service thành đơn vị gắn kết; có thể lấy module của cộng đồng (UI, kéo thả, validation…) cắm vào app</td><td>8, 18</td></tr>
<tr><td><b>Dependency Injection</b></td><td>Khai báo cái bạn cần, framework cung cấp. Cốt lõi, và là chìa khoá để <b>test</b> dễ dàng</td><td>10, 16</td></tr>
<tr><td><b>Template</b></td><td>HTML mở rộng: binding, sự kiện, <code>*ngIf</code>, <code>*ngFor</code></td><td>9</td></tr>
<tr><td><b>Change detection</b></td><td>Vẫn “phép màu” như v1 (sửa dữ liệu → giao diện tự cập nhật) nhưng cách làm hoàn toàn khác, nhờ <b>zones</b></td><td>20</td></tr>
<tr><td><b>Pin đầy đủ</b> (“batteries included”)</td><td>Form, HTTP, router, animation, test, i18n, tích hợp thư viện… đều có sẵn</td><td>17–19, 24</td></tr>
</table></div>
<div class="box modern"><b>🆕 Hiện nay</b>
<ul>
<li><b>Standalone components</b> là mặc định: bạn gom thứ cần dùng ngay trong <code>imports</code> của component; <code>NgModule</code> chỉ còn ở code cũ.</li>
<li><b>Signals</b> thay phần lớn “phép màu” change detection bằng cách theo dõi chính xác dữ liệu nào ảnh hưởng view nào (chương 20, 25).</li>
<li><b>inject()</b>, <b>input()/output()</b>, control flow <code>@if</code>/<code>@for</code>, <b>@defer</b>… là cách viết hiện đại — nhưng tư duy cốt lõi (cây component, DI, template, một chiều dữ liệu) vẫn y nguyên.</li>
</ul></div>
<p>Còn nhiều thứ phải học! Hãy bắt đầu từ đầu: khởi động một ứng dụng và viết component đầu tiên (chương 8).</p>`
    }
  ],
  quiz: [
    { q: 'Angular xây ứng dụng từ?', options: ['Một file HTML lớn', 'Cây các component nhỏ, mỗi cái một việc', 'Chỉ các service'], answer: 1, why: 'Component-oriented: ghép nhiều component nhỏ.' },
    { q: 'Một component gồm?', options: ['Template + logic (class)', 'Chỉ CSS', 'Chỉ route'], answer: 0, why: 'Giống cặp template/controller của AngularJS.' },
    { q: 'Ứng dụng của bạn (AppComponent) so với các component khác?', options: ['Đặc biệt, không phải component', 'Cũng chỉ là một component, ở gốc cây', 'Là một module'], answer: 1, why: '“Your app is a component like the others.”' },
    { q: 'Module trong Angular khác ES module ở chỗ?', options: ['Giống hệt', 'Angular Module gom component/service… thành một đơn vị chức năng', 'Chỉ dành cho CSS'], answer: 1, why: 'Hai khái niệm trùng tên nhưng khác nhau.' },
    { q: 'Dữ liệu chảy trong cây component thế nào?', options: ['Xuống bằng [input], lên bằng (output) sự kiện', 'Hai chiều tự do', 'Chỉ qua biến toàn cục'], answer: 0, why: 'Luồng một chiều rõ ràng giúp dễ suy luận.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    let ponies = ['Rainbow Dash', 'Pinkie Pie', 'Fluttershy'], sel = 'root';
    const MOD = { root: 'AppModule', menu: 'AppModule', user: 'AppModule', race: 'RacesModule (lazy)', pony: 'RacesModule (lazy)' };
    const MC = { AppModule: 'fulfilled', 'RacesModule (lazy)': 'pending' };
    const INFO = {
      root: { tag: 'ns-root', cls: 'AppComponent', inputs: [], tpl: '<ns-menu [user]="user"></ns-menu>\n<router-outlet></router-outlet>   <!-- hiện RaceComponent -->', di: ['UserService'], flow: 'cung cấp [user] cho Menu' },
      menu: { tag: 'ns-menu', cls: 'MenuComponent', inputs: ['user'], tpl: '<nav>\n  <ns-user [user]="user"></ns-user>\n</nav>', di: [], flow: 'nhận [user] từ App → chuyển tiếp cho User' },
      user: { tag: 'ns-user', cls: 'UserComponent', inputs: ['user'], tpl: '<span>{{ user.name }}</span>', di: [], flow: 'nhận [user] từ Menu' },
      race: { tag: 'ns-race', cls: 'RaceComponent', inputs: [], tpl: '<h2>{{ race.name }}</h2>\n<ns-pony *ngFor="let p of race.ponies"\n         [pony]="p" (ponyClicked)="bet($event)"></ns-pony>', di: ['RacesService'], flow: 'tải race (service) → [pony] cho từng Pony; nghe (ponyClicked)' },
      pony: { tag: 'ns-pony', cls: 'PonyComponent', inputs: ['pony'], outputs: ['ponyClicked'], tpl: '<img [alt]="pony.name" (click)="ponyClicked.emit(pony)">', di: [], flow: 'nhận [pony]; phát (ponyClicked) lên Race khi bấm' }
    };
    const view = () => root.querySelector('input[name=tv]:checked').value;
    function node(id, label, depth, extra = '') {
      const v = view(), i = INFO[id];
      let tags = `<span class="tag pill fulfilled">&lt;${i.tag}&gt;</span>`;
      if (v === 'flow') tags += i.inputs.map(x => `<span class="tag pill pending">↓ [${x}]</span>`).join('') + (i.outputs || []).map(x => `<span class="tag pill rejected">↑ (${x})</span>`).join('');
      if (v === 'mod') tags += `<span class="tag pill ${MC[MOD[id]]}">${MOD[id]}</span>`;
      if (v === 'di') tags += i.di.map(x => `<span class="tag pill" style="background:var(--infobg);color:var(--info)">💉 ${x}</span>`).join('');
      return `<div class="nd ${sel === id ? 'sel' : ''}" data-id="${id}" style="margin-left:${depth * 18}px"><b>${label}</b> ${tags}${extra}</div>`;
    }
    function draw() {
      $('#tv-tree').innerHTML = node('root', 'Ponyracer', 0) + node('menu', 'Menu', 1) + node('user', 'User', 2) + node('race', 'Race', 1) +
        ponies.map((p, i) => node('pony', `Pony <span class="hint">#${i + 1} ${esc(p)}</span>`, 2)).join('');
      root.querySelectorAll('#tv-tree .nd').forEach(n => (n.onclick = () => { sel = n.dataset.id; draw(); }));
      const i = INFO[sel], v = view();
      $('#tv-detail').innerHTML = `<div class="box info" style="margin:0"><b>${i.cls}</b>
        <textarea class="code" data-lang="ts" style="display:none"></textarea>
        <pre class="hl" style="border-radius:8px;margin:6px 0;font-size:12.5px">@Component({
  selector: '${i.tag}',
  template: \`
${i.tpl.split('\n').map(l => '    ' + l).join('\n')}
  \`
})
export class ${i.cls} {${i.inputs.map(x => `\n  @Input() ${x}: ${x === 'user' ? 'UserModel' : 'PonyModel'};`).join('')}${(i.outputs || []).map(x => `\n  @Output() ${x} = new EventEmitter<PonyModel>();`).join('')}${i.di.length ? `\n  constructor(${i.di.map(d => `private ${d[0].toLowerCase() + d.slice(1)}: ${d}`).join(', ')}) {}` : ''}
}</pre>
        <div class="hint">${v === 'flow' ? '↔ ' + i.flow : v === 'mod' ? 'Module: ' + MOD[sel] : v === 'di' ? (i.di.length ? 'Tiêm: ' + i.di.join(', ') : 'Không tiêm service nào') : ''}</div></div>`;
      $('#tv-stat').textContent = `Instance component: ${4 + ponies.length} (App, Menu, User, Race + ${ponies.length} Pony).`;
    }
    root.querySelectorAll('input[name=tv]').forEach(r => (r.onchange = draw));
    const more = ['Applejack', 'Rarity', 'Twilight', 'Spike'];
    $('#tv-add').onclick = () => { if (ponies.length < 7) ponies = [...ponies, more[ponies.length % more.length]]; draw(); };
    $('#tv-del').onclick = () => { if (ponies.length > 0) ponies = ponies.slice(0, -1); draw(); };
    draw();
  }
});
