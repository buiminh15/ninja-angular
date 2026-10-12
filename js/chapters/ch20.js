registerChapter(20, {
  time: '60 phút',
  lead: 'Bạn gõ một giá trị và mọi thứ trên màn hình cập nhật “như phép thuật”. Chương này mở nắp ca-pô: <b>(1)</b> làm sao framework biết có sự kiện xảy ra (<b>Zone.js</b>), và <b>(2)</b> làm sao nó biết phải cập nhật phần DOM nào (<b>change detection</b>). Có mô phỏng chạy thật cho vòng <i>digest</i> của AngularJS, một <i>Zone.js thu nhỏ</i>, và cây component được duyệt một lượt.',
  sections: [
    {
      id: 'problem', title: 'Bài toán: biết khi nào đổi, biết đổi gì',
      html: `
<p>Mọi framework JavaScript đều làm cùng việc: phản ứng với sự kiện, cập nhật trạng thái, rồi làm DOM khớp trạng thái. Mỗi framework giải theo cách riêng:</p>
<div class="tablewrap"><table>
<tr><th>Framework</th><th>Cách biết cái gì đã đổi</th></tr>
<tr><td>Ember</td><td>Bạn phải dùng <b>setter</b> để đổi dữ liệu → framework chặn được lời gọi</td></tr>
<tr><td>React</td><td>Tính lại <b>virtual DOM</b> sau mỗi thay đổi rồi áp phần khác biệt lên DOM thật</td></tr>
<tr><td>AngularJS 1.x</td><td><b>Dirty checking</b>: vòng <i>digest</i> so sánh mọi biểu thức đã theo dõi (watcher)</td></tr>
<tr><td>Angular</td><td><b>Zone.js</b> báo khi tác vụ bất đồng bộ xong + <b>một lượt duyệt cây component</b> so sánh biểu thức</td></tr>
</table></div>
<p>Angular không dùng setter, cũng không dùng virtual DOM. “Phép thuật” gồm hai nửa:</p>
<div class="flow">
  <div class="node hot">① Kích hoạt<small>Khi nào chạy change detection?<br>(sự kiện, timer, HTTP… → Zone.js)</small></div><span class="arr">→</span>
  <div class="node hot">② Phát hiện thay đổi<small>Cái gì đã đổi, cập nhật DOM thế nào?<br>(duyệt cây component)</small></div>
</div>
<p>Để thấy Angular khôn ở đâu, ta bắt đầu từ cách AngularJS làm.</p>`
    },
    {
      id: 'digest', title: 'AngularJS 1.x: vòng digest',
      html: `
<p>Để biết sự kiện đã xảy ra, AngularJS <b>bắt bạn dùng</b> directive và service của nó: <code>ng-click</code>, <code>ng-model</code>, <code>$http</code>, <code>$timeout</code>. Với mỗi biểu thức động trong template nó tạo một <b>watcher</b> (trí nhớ của framework). Sau mỗi sự kiện nó chạy <b>vòng digest</b>: đánh giá <b>mọi</b> watcher, so với giá trị cũ; có đổi thì gọi callback — mà callback lại có thể đổi model → nên phải <b>lặp lại cho tới khi ổn định</b> (tối đa 10 lần, quá thì ném lỗi vòng lặp vô hạn).</p>
<p>Nếu bạn dùng thư viện ngoài (không qua <code>$http</code>), phải tự gọi <code>$scope.$apply()</code> để bắt đầu digest. Thử mô phỏng:</p>

<div class="widget" id="w-dg">
  <h4>🔁 Digest cycle</h4>
  <p class="hint">Watchers: <code>user.name</code>, <code>user.password</code> (callback tính <code>passwordStrength</code> = 3 × độ dài), <code>passwordStrength</code>. Gõ vào ô password.</p>
  <div class="row" style="margin-bottom:8px">
    <label>Name <input type="text" id="dg-name" value="Cédric" style="width:120px"></label>
    <label>Password <input type="text" id="dg-pw" placeholder="gõ vào đây…" style="width:160px" autocomplete="off"></label>
    <label>Thêm watchers: <select id="dg-extra"><option value="0">0</option><option value="100">100</option><option value="500">500</option></select></label>
    <label><input type="checkbox" id="dg-loop"> thêm watcher “xấu” (callback luôn đổi model)</label>
    <button class="btn alt" id="dg-reset">↺</button>
  </div>
  <div class="grid2">
    <div><b>Lần digest gần nhất</b><div id="dg-iters" style="margin-top:6px"></div></div>
    <div><b>Thống kê (tích luỹ)</b><div id="dg-stats" style="margin-top:6px"></div></div>
  </div>
  <div id="dg-msg" style="margin-top:8px"></div>
</div>
<div class="box tip"><b>Quan sát</b><ul>
<li>Mỗi lần gõ, digest chạy <b>ít nhất 2 lần</b> (lần 1 phát hiện đổi + callback đổi <code>passwordStrength</code>; lần 2 xác nhận ổn định; chỉ lúc đó DOM được cập nhật).</li>
<li>Thêm 500 watcher: số phép đánh giá nhân lên hàng nghìn <b>sau mỗi phím</b>. Angular chỉ duyệt <b>một lượt</b>.</li>
<li>Bật watcher “xấu”: sau 10 vòng AngularJS bỏ cuộc với lỗi <code>10 $digest() iterations reached</code>.</li></ul></div>`
    },
    {
      id: 'zones', title: 'Nửa thứ nhất: Zone.js — biết khi nào chạy',
      html: `
<p>Angular không bắt bạn dùng service riêng. Thay vào đó <b>Zone.js</b> (dự án do đội Angular viết, dùng được độc lập) <b>vá</b> mọi API bất đồng bộ của trình duyệt: <code>setTimeout</code>, <code>setInterval</code>, <code>Promise</code>, <code>XMLHttpRequest</code>, <code>addEventListener</code>, <code>WebSocket</code>… Nhờ vậy nó biết lúc nào một tác vụ bắt đầu và <b>kết thúc</b>, kể cả khi bạn dùng thư viện ngoài.</p>
<p>Một <b>zone</b> là một ngữ cảnh thực thi; code chạy trong zone (đồng bộ hay bất đồng bộ) được nó theo dõi, với các hook:</p>
<ul>
<li><code>onInvoke</code> — trước khi chạy code trong zone</li>
<li><code>onHasTask</code> — khi trạng thái “còn tác vụ bất đồng bộ không” thay đổi</li>
<li><code>onHandleError</code> — khi code ném lỗi</li>
<li><code>onFork</code> — khi zone được tạo</li>
</ul>
<h3>Ví dụ: đo thời gian của thao tác bất đồng bộ</h3>
<p>Đo kiểu thường chỉ tính phần đồng bộ (<code>stopTimer()</code> chạy trước khi hàm async xong). Zone đo đúng:</p>
<textarea class="live" data-title="Zone thu nhỏ (cùng hook như Zone.js) — chạy được">
const { Zone } = MiniZone;                          // Zone.js thật: import 'zone.js'
let t0 = performance.now();
const ms = () => Math.round(performance.now() - t0) + 'ms';

const computeScore = () => { console.log('computeScore: new score: 1000'); return 1000; };
const updatePlayer = (p, score) => setTimeout(() => console.log('updatePlayer: player 1 has ' + score + ' points  @' + ms()), 80);   // bất đồng bộ

// Cách ngây thơ: stop chạy quá sớm
console.log('— đo ngây thơ');
computeScore(); updatePlayer(1, 1000);
console.log('stop: ' + ms() + '  ← sai! chưa tính thao tác async');

setTimeout(() => {
  console.log('— đo bằng zone');
  t0 = performance.now();                              // đo lại từ lúc bắt đầu
  const scoreZone = Zone.current.fork({
    name: 'scoreZone',
    onInvoke(invoke) { console.log('start'); return invoke(); },
    onHasTask(state) { if (!state.macroTask && !state.microTask) console.log('stop: ' + ms() + '  ← đúng: sau khi MỌI tác vụ async xong'); }
  });
  scoreZone.run(() => { const score = computeScore(); updatePlayer(1, score); });
}, 300);
</textarea>
<h3>Angular dùng zone để kích hoạt change detection</h3>
<p>Về bản chất, Angular làm: <code>angularZone = Zone.current.fork({ onHasTask: triggerChangeDetection })</code> rồi chạy toàn bộ code của bạn trong đó. Khi một tác vụ bất đồng bộ xong → <b>change detection</b> chạy. Mô phỏng: <b>model</b> (field trong component) và <b>view</b> (cái hiện trên màn hình) chỉ đồng bộ khi change detection chạy.</p>

<div class="widget" id="w-zone">
  <h4>🧭 Zone &amp; change detection</h4>
  <div class="row" style="margin-bottom:10px">
    <label><input type="checkbox" id="zn-on" checked> Zone.js có mặt (<code>NgZone</code> bật)</label>
    <button class="btn alt" id="zn-reset">↺ Làm lại</button>
  </div>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="zn-timeout">setTimeout(+1) trong zone</button>
    <button class="btn" id="zn-promise">Promise.then(+1) trong zone</button>
    <button class="btn" id="zn-chain">Chuỗi timeout → then → timeout</button>
    <button class="btn alt" id="zn-out">setTimeout(+1) NGOÀI Angular</button>
    <button class="btn alt" id="zn-click">Một click bất kỳ</button>
    <button class="btn alt" id="zn-manual">detectChanges() thủ công</button>
  </div>
  <div class="grid2">
    <div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="border:2px solid var(--accent);border-radius:10px;padding:8px 14px"><div class="hint">model (component.count)</div><b id="zn-model" style="font-size:28px">0</b></div>
        <div style="border:2px solid var(--ok);border-radius:10px;padding:8px 14px"><div class="hint">view ({{ count }} trên màn hình)</div><b id="zn-view" style="font-size:28px">0</b></div>
        <div style="border:2px solid var(--border);border-radius:10px;padding:8px 14px"><div class="hint">lần change detection</div><b id="zn-cd" style="font-size:28px">0</b></div>
      </div>
      <p id="zn-stale" style="margin-top:8px"></p>
    </div>
    <div><b>Hook của zone</b><div class="output" id="zn-log" style="border-radius:8px;height:170px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử</b><ol>
<li>setTimeout / Promise.then <b>trong zone</b>: model +1, hook <code>onHasTask</code> báo, change detection chạy → view khớp model.</li>
<li><b>Ngoài Angular</b>: model +1 nhưng <b>không</b> có change detection → view cũ (⚠). Bấm “Một click bất kỳ” (event handler chạy trong zone): CD chạy và view bắt kịp.</li>
<li>Bỏ tích “Zone.js có mặt”: không còn gì tự động — phải bấm <b>detectChanges()</b> thủ công (giống <code>$scope.$apply()</code> của AngularJS).</li></ol></div>
<div class="box info"><b>Dùng khi nào “ngoài Angular”?</b><p>Khi có sự kiện bắn dồn dập mà không cần cập nhật giao diện mỗi lần (đồng hồ 10ms, <code>mousemove</code>, animation). <code>NgZone.runOutsideAngular(() => ...)</code> — xem chương 25.</p></div>`
    },
    {
      id: 'cd', title: 'Nửa thứ hai: change detection — duyệt cây một lượt',
      html: `
<p>Ứng dụng Angular là một <b>cây component</b>. Khi change detection chạy, Angular đi từ <b>gốc xuống lá</b>, với mỗi component so sánh giá trị các biểu thức trong template với giá trị cũ; chỗ nào khác thì cập nhật DOM của đúng chỗ đó. Khác AngularJS:</p>
<ul>
<li>Duyệt <b>đúng một lần</b> (AngularJS: M watcher × N vòng; Angular: M).</li>
<li>Change detection <b>không được sửa model</b> (watcher của AngularJS thì được) → không còn thay đổi lan truyền, không còn vòng lặp vô hạn.</li>
<li><b>Luồng dữ liệu một chiều</b>: component có thể đổi state của mình và của con, nhưng <b>không được đổi state của tổ tiên</b>.</li>
<li>Ở chế độ dev, Angular duyệt <b>lần hai</b> chỉ để kiểm tra có ai vi phạm quy tắc không — nếu có, ném <code>ExpressionChangedAfterItHasBeenCheckedError</code>.</li>
</ul>

<div class="widget" id="w-tree">
  <h4>🌲 Duyệt cây component</h4>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="tr-run">▶ Chạy change detection</button>
    <label><input type="checkbox" id="tr-dev" checked> chế độ dev (duyệt lần 2 để kiểm tra)</label>
    <label><input type="checkbox" id="tr-bad"> PonyComponent (con) sửa <code>counter</code> của <b>cha</b> khi đang được kiểm tra</label>
  </div>
  <div id="tr-tree"></div>
  <div id="tr-msg" style="margin-top:10px"></div>
</div>
<div class="box tip"><b>Thử</b><ol>
<li>Chạy bình thường: mỗi component được kiểm tra <b>một lần</b> theo thứ tự cha → con.</li>
<li>Bật ô “Pony sửa counter của cha”: <code>HeaderComponent</code> đã in <code>counter = 0</code> trước đó, rồi Pony mới đổi nó thành 1 → ở lượt dev thứ hai, Angular thấy giá trị đã đổi sau khi được kiểm tra và ném <b>ExpressionChangedAfterItHasBeenCheckedError</b>. Tắt chế độ dev: không lỗi, nhưng <b>view hiển thị sai âm thầm</b> (Header vẫn là 0).</li></ol></div>

<h3>Vì sao nhanh hơn? Hàm so sánh sinh riêng cho từng component</h3>
<p>AngularJS dùng <b>một hàm tổng quát</b> so sánh mọi loại watcher; Angular <b>sinh mã</b> một hàm riêng cho mỗi component, giống như bạn viết tay:</p>
<textarea class="code" data-lang="ts">
(view) => {
  const component = view.component;
  const currVal = component.name;
  if (currVal !== view.oldValue) { view.oldValue = currVal; updateView(view, 'p', currVal); }
}
</textarea>
<p>Trình duyệt tối ưu code như vậy rất tốt nhờ <b>inline caching</b>: nếu hàm luôn nhận object cùng “hình dạng” (monomorphic) thì truy cập thuộc tính cực nhanh; nhiều hình dạng khác nhau (polymorphic) chậm hơn; quá nhiều (megamorphic) thì bỏ cache. Hàm tổng quát của AngularJS là megamorphic. Mô phỏng ý tưởng và tự đo:</p>
<textarea class="live" data-title="Hàm so sánh tổng quát vs hàm sinh riêng cho từng “hình dạng” (kết quả phụ thuộc trình duyệt)">
const SHAPES = 12, PER_SHAPE = 25;
const keySets = Array.from({ length: SHAPES }, (_, s) => ['id', 'name', 'x' + s, 'y' + s, 'z' + (s % 3)]);    // 12 hình dạng khác nhau
const objs = [];
keySets.forEach((keys, s) => { for (let i = 0; i < PER_SHAPE; i++) objs.push(Object.fromEntries(keys.map(k => [k, k + i]))); });

// 1) Một hàm tổng quát cho mọi watcher (như AngularJS): truy cập động o[key]
const watchers = objs.map((o, i) => ({ o, keys: Object.keys(o), last: {} }));
function genericCheck() {
  let changed = 0;
  for (const w of watchers) for (const k of w.keys) { const v = w.o[k]; if (v !== w.last[k]) { w.last[k] = v; changed++; } }
  return changed;
}
// 2) Hàm sinh riêng cho mỗi hình dạng (như Angular): truy cập trực tiếp o.id, o.name…
const generated = keySets.map(keys => new Function('o', 'l', 'let ch=0;' + keys.map(k => \`if(o.\${k}!==l.\${k}){l.\${k}=o.\${k};ch++}\`).join('') + 'return ch;'));
const lasts = objs.map(() => ({}));
const shapeOf = i => Math.floor(i / PER_SHAPE);
function generatedCheck() { let c = 0; for (let i = 0; i < objs.length; i++) c += generated[shapeOf(i)](objs[i], lasts[i]); return c; }

const ROUNDS = 4000;
function time(fn) { fn(); const t = performance.now(); for (let r = 0; r < ROUNDS; r++) fn(); return performance.now() - t; }
const g = time(genericCheck), s = time(generatedCheck);
console.log('Tổng quát :', g.toFixed(1), 'ms cho', ROUNDS, 'lượt x', objs.length, 'đối tượng');
console.log('Sinh riêng:', s.toFixed(1), 'ms');
console.log('Tỉ lệ     :', (g / s).toFixed(2) + '×  (chạy vài lần — số liệu dao động)');
</textarea>`
    },
    {
      id: 'now', title: 'Hiện nay: signals và zoneless',
      html: `
<p>Zone.js rất tiện nhưng có cái giá: nó vá mọi API bất đồng bộ (tăng kích thước và overhead), mọi tác vụ đều kéo theo một lượt kiểm tra toàn cây, <code>async/await</code> gốc phải bị hạ cấp xuống Promise, và gây khó khi debug. Angular hiện nay đi theo hướng <b>biết chính xác cái gì đã đổi</b> thay vì “có gì đó đã xảy ra”:</p>
<div class="tablewrap"><table>
<tr><th></th><th>Zone.js (sách)</th><th>Signals + zoneless</th></tr>
<tr><td>Cách biết cần cập nhật</td><td>Tác vụ bất đồng bộ nào xong cũng kích hoạt</td><td>Signal nào được đọc trong template bị <code>set()</code> → chỉ view đó bị đánh dấu</td></tr>
<tr><td>Phạm vi kiểm tra</td><td>Cả cây (trừ nhánh OnPush)</td><td>Chỉ các component bị ảnh hưởng</td></tr>
<tr><td>Phụ thuộc</td><td>Phải nạp <code>zone.js</code></td><td>Không cần zone.js</td></tr>
</table></div>
<textarea class="code" data-lang="ts">
// app.config.ts — chạy không cần Zone.js
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()]       // tên có thể là provideExperimentalZonelessChangeDetection ở bản cũ hơn
};

@Component({ template: \`{{ count() }} <button (click)="count.update(c => c + 1)">+1</button>\` })
export class CounterComponent { count = signal(0); }
// bấm nút → signal đổi → Angular biết view nào phụ thuộc vào nó → cập nhật đúng chỗ đó
</textarea>
<ul>
<li><code>NgZone</code> (<code>run</code>, <code>runOutsideAngular</code>) và <code>ChangeDetectorRef</code> (<code>markForCheck</code>, <code>detectChanges</code>) vẫn tồn tại; chương 25 dùng chúng.</li>
<li>Zoneless đang trở thành cấu hình chính của Angular; ứng dụng hiện có vẫn chạy với zone.js như trong sách. Bạn có thể chuyển dần: dùng <code>OnPush</code> + signals/<code>async</code> pipe trước, rồi bỏ zone.js.</li>
<li>Hiểu zone vẫn quan trọng: nhiều thư viện và code cũ dựa vào nó, và nó giải thích vì sao “đổi biến trong <code>setTimeout</code> mà view không cập nhật” (khi chạy ngoài zone).</li>
</ul>`
    }
  ],
  quiz: [
    { q: 'Hai nửa của “phép thuật” Angular là gì?', options: ['Kích hoạt (khi nào kiểm tra) và Phát hiện thay đổi (cái gì đổi)', 'Compile và bundle', 'Router và Form'], answer: 0, why: 'Zone.js lo phần kích hoạt; duyệt cây component lo phần phát hiện.' },
    { q: 'Vì sao digest của AngularJS chạy ít nhất 2 lần mỗi sự kiện?', options: ['Do lỗi', 'Callback của watcher có thể đổi model nên phải lặp đến khi ổn định', 'Để tăng tốc'], answer: 1, why: 'Lần 2 xác nhận không còn thay đổi mới.' },
    { q: 'Zone.js làm gì?', options: ['Biên dịch template', 'Vá API bất đồng bộ để biết khi nào tác vụ bắt đầu/kết thúc', 'Quản lý route'], answer: 1, why: 'Nhờ đó Angular tự chạy change detection sau mỗi tác vụ.' },
    { q: 'Đổi biến trong setTimeout được chạy ngoài Angular zone thì?', options: ['Giao diện cập nhật ngay', 'Giao diện không tự cập nhật cho đến lần change detection kế tiếp', 'Lỗi'], answer: 1, why: 'Không có tác vụ nào được zone theo dõi để kích hoạt CD.' },
    { q: 'Change detection của Angular duyệt cây thế nào?', options: ['Từ lá lên gốc, nhiều lần', 'Từ gốc xuống lá, một lần (dev: thêm một lần kiểm tra)', 'Ngẫu nhiên'], answer: 1, why: 'Luồng một chiều cha → con, không sửa model khi duyệt.' },
    { q: 'ExpressionChangedAfterItHasBeenCheckedError xảy ra khi?', options: ['Một component đổi state của tổ tiên sau khi tổ tiên đã được kiểm tra', 'Hết bộ nhớ', 'Quên subscribe'], answer: 0, why: 'Lượt kiểm tra thứ hai ở chế độ dev phát hiện giá trị đã đổi.' },
    { q: 'Ưu điểm cốt lõi của hướng signals + zoneless?', options: ['Biết chính xác phần giao diện nào cần cập nhật, không cần vá API bất đồng bộ', 'Không cần TypeScript', 'Bundle luôn nhỏ hơn 1KB'], answer: 0, why: 'Cập nhật dựa trên phụ thuộc của signal thay vì kiểm tra cả cây.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const alive = () => root.isConnected, sleep = ms => new Promise(r => setTimeout(r, ms));

    /* ===== digest ===== */
    let scope, watchers, tot;
    function dgReset() {
      scope = { name: $('#dg-name').value, password: '', passwordStrength: 0, counter: 0 };
      watchers = [
        { expr: 'user.name', get: () => scope.name },
        { expr: 'user.password', get: () => scope.password, cb: v => { scope.passwordStrength = String(v).length * 3; } },
        { expr: 'passwordStrength', get: () => scope.passwordStrength }
      ];
      if ($('#dg-loop').checked) watchers.push({ expr: 'counter (xấu)', get: () => scope.counter, bad: true, cb: () => { scope.counter++; } });
      for (let i = 0; i < +$('#dg-extra').value; i++) watchers.push({ expr: 'item[' + i + '].label', get: () => 'x', hidden: true });
      watchers.forEach(w => (w.last = w.bad ? -1 : w.get()));
      tot = { events: 0, angularjs: 0, angular: 0, iters: 0 };
      $('#dg-pw').value = ''; $('#dg-iters').innerHTML = '<i class="hint">(gõ gì đó…)</i>'; $('#dg-msg').innerHTML = ''; dgStats();
    }
    function digest() {
      const iters = []; let dirty, n = 0;
      do {
        dirty = false; n++; const rows = [];
        for (const w of watchers) { const nv = w.get(); const changed = nv !== w.last; if (!w.hidden) rows.push({ expr: w.expr, old: w.last, nv, changed }); tot.angularjs++; if (changed) { w.last = nv; dirty = true; w.cb && w.cb(nv); } }
        iters.push(rows);
        if (n >= 10 && dirty) { iters.error = true; break; }
      } while (dirty);
      return iters;
    }
    function dgStats() {
      $('#dg-stats').innerHTML = `<table><tr><th></th><th>AngularJS (digest)</th><th>Angular (1 lượt)</th></tr><tr><td>Sự kiện</td><td colspan="2">${tot.events}</td></tr><tr><td>Phép đánh giá biểu thức</td><td><b>${tot.angularjs}</b></td><td><b>${tot.angular}</b></td></tr></table>`;
    }
    function dgInput() {
      scope.name = $('#dg-name').value; scope.password = $('#dg-pw').value; tot.events++;
      tot.angular += watchers.length;
      const before = tot.angularjs, iters = digest();
      $('#dg-iters').innerHTML = iters.map((rows, i) => `<div style="margin-bottom:6px"><b>Vòng ${i + 1}</b>` + rows.map(r => `<div class="hint mono" style="font-size:12px;margin-left:8px">${esc(r.expr)}: ${esc(JSON.stringify(r.old))} → ${esc(JSON.stringify(r.nv))} ${r.changed ? '<span class="pill pending" style="font-size:10px">đã đổi → gọi callback</span>' : '<span class="pill fulfilled" style="font-size:10px">ổn</span>'}</div>`).join('') + '</div>').join('');
      $('#dg-msg').innerHTML = iters.error ? '<div class="box warn" style="margin:0"><b>Error: 10 $digest() iterations reached. Aborting!</b><p>Watchers không bao giờ ổn định → AngularJS bỏ cuộc.</p></div>'
        : `<span class="pill fulfilled">Ổn định sau ${iters.length} vòng</span> ${tot.angularjs - before} phép đánh giá cho phím này (Angular: ${watchers.length}). Giao diện: strength = <b>${scope.passwordStrength}</b>`;
      dgStats();
    }
    $('#dg-pw').oninput = $('#dg-name').oninput = dgInput; $('#dg-reset').onclick = $('#dg-extra').onchange = $('#dg-loop').onchange = dgReset; dgReset();

    /* ===== zone ===== */
    const { Zone } = MiniZone; const zl = $('#zn-log');
    const zlog = (t, c) => { if (!alive()) return; const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; zl.appendChild(d); zl.scrollTop = zl.scrollHeight; };
    let model = 0, view = 0, cd = 0, ngZone;
    function znDraw() { $('#zn-model').textContent = model; $('#zn-view').textContent = view; $('#zn-cd').textContent = cd; $('#zn-stale').innerHTML = model === view ? '<span class="pill fulfilled">view khớp model</span>' : '<span class="pill rejected">⚠ view CŨ — chưa có change detection</span>'; }
    function changeDetection(why) { if (!alive()) return; cd++; view = model; zlog('⟳ change detection chạy' + (why ? ' (' + why + ')' : ''), 'ok'); znDraw(); }
    function znSetup() {
      model = view = cd = 0; zl.innerHTML = '';
      ngZone = Zone.current.fork({
        name: 'angular',
        onHasTask: s => zlog(`onHasTask → macroTask:${s.macroTask} microTask:${s.microTask}`, 'dim'),
        onLeave: () => { if ($('#zn-on').checked) changeDetection('zone ổn định sau một tác vụ'); }
      });
      znDraw();
    }
    const inZone = fn => ngZone.run(fn);
    $('#zn-timeout').onclick = () => inZone(() => { zlog('setTimeout() lập lịch trong zone “angular”'); setTimeout(() => { model++; zlog('  callback: model++'); }, 500); });
    $('#zn-promise').onclick = () => inZone(() => { zlog('Promise.then() lập lịch trong zone'); Promise.resolve().then(() => { model++; zlog('  then: model++'); }); });
    $('#zn-chain').onclick = () => inZone(() => { zlog('chuỗi: timeout → then → timeout'); setTimeout(() => { model++; zlog('  timeout#1: model++'); Promise.resolve().then(() => { model++; zlog('  then: model++'); setTimeout(() => { model++; zlog('  timeout#2: model++'); }, 400); }); }, 400); });
    $('#zn-out').onclick = () => Zone.root.run(() => { zlog('runOutsideAngular: setTimeout lập lịch NGOÀI zone', 'err'); setTimeout(() => { model++; zlog('  callback ngoài zone: model++ (không ai biết!)', 'err'); znDraw(); }, 500); });
    $('#zn-click').onclick = () => inZone(() => zlog('event handler (click) chạy trong zone'));
    $('#zn-manual').onclick = () => changeDetection('gọi tay: cdRef.detectChanges()');
    $('#zn-reset').onclick = $('#zn-on').onchange = znSetup; znSetup();

    /* ===== cây component ===== */
    const state = { title: 'PonyRacer', counter: 0, races: 2 };
    const NODES = [
      { name: 'AppComponent', d: 0, bind: () => 'title = ' + state.title },
      { name: 'HeaderComponent', d: 1, bind: () => 'counter = ' + state.counter },
      { name: 'MainComponent', d: 1, bind: () => 'races = ' + state.races },
      { name: 'RaceComponent', d: 2, bind: () => 'race #1' },
      { name: 'PonyComponent', d: 3, bind: () => 'Rainbow Dash', bad: true },
      { name: 'PonyComponent', d: 3, bind: () => 'Pinkie Pie', bad: true },
      { name: 'FooterComponent', d: 1, bind: () => 'made with <3' }
    ];
    const treeEl = $('#tr-tree');
    function trDraw() {
      treeEl.innerHTML = NODES.map((n, i) => `<div data-i="${i}" style="margin-left:${n.d * 22}px;border:1px solid var(--border);border-radius:8px;padding:5px 10px;margin:3px 0;background:var(--surface)"><b>${n.name}</b> <span class="mono hint">${esc(n.shown || '(chưa render)')}</span> <span class="pill" style="font-size:10.5px;background:var(--surface2)">check: <b>${n.checks || 0}</b></span></div>`).join('');
    }
    $('#tr-run').onclick = async () => {
      state.counter = 0; $('#tr-msg').innerHTML = ''; NODES.forEach(n => { n.checks = 0; n.shown = null; n.stored = null; }); trDraw();
      const dev = $('#tr-dev').checked, bad = $('#tr-bad').checked;
      for (let pass = 1; pass <= (dev ? 2 : 1); pass++) {
        for (let i = 0; i < NODES.length; i++) {
          const n = NODES[i], el = treeEl.children[i];
          el.style.borderColor = 'var(--accent)'; el.style.background = 'color-mix(in srgb, var(--accent) 12%, var(--surface))';
          await sleep(pass === 1 ? 280 : 90); if (!alive()) return;
          const v = n.bind();
          if (pass === 1) { n.checks++; n.shown = v; n.stored = v; if (n.bad && bad && n.name === 'PonyComponent' && state.counter < 1) state.counter++; }
          else if (v !== n.stored) {
            trDraw(); $('#tr-msg').innerHTML = `<div class="box warn" style="margin:0"><b>ExpressionChangedAfterItHasBeenCheckedError</b><p>${n.name}: Expression has changed after it was checked. Previous value: <code>'${esc(n.stored)}'</code>. Current value: <code>'${esc(v)}'</code>.<br>Một component con đã sửa state của tổ tiên sau khi tổ tiên được kiểm tra.</p></div>`; return;
          }
          trDraw(); await sleep(0);
        }
        if (pass === 1 && dev) await sleep(250);
      }
      const evals = NODES.length * (dev ? 2 : 1);
      const stale = NODES[1].shown !== NODES[1].bind();
      $('#tr-msg').innerHTML = `<span class="pill fulfilled">Xong</span> ${NODES.length} component, mỗi cái kiểm tra 1 lượt${dev ? ' (+1 lượt kiểm tra dev, không cập nhật DOM)' : ''}.` + (stale ? ` <span class="pill rejected">⚠ Header vẫn hiển thị “${esc(NODES[1].shown)}” nhưng state là counter = ${state.counter}</span>` : '');
    };
    trDraw();
  }
});
