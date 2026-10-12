registerChapter(25, {
  time: '75 phút',
  lead: 'Quy tắc vàng: <b>đừng tối ưu sớm, hãy đo trước và sau</b>. Chương này chia hiệu năng làm ba loại — <b>tải lần đầu</b>, <b>tải lại</b>, <b>chạy lúc runtime</b> — và có các bộ mô phỏng để bạn tận mắt thấy change detection, <code>OnPush</code>, <code>trackBy</code>, pure pipe và <code>ChangeDetectorRef</code> làm gì.',
  sections: [
    {
      id: 'rules', title: 'Ba luật tối ưu và ba loại hiệu năng',
      html: `
<div class="box tip"><b>Ba luật của tối ưu hoá</b><ol><li>Đừng làm.</li><li>Đừng làm… <i>chưa</i>.</li><li>Đo (profile) trước khi tối ưu — rồi đo lại để biết có cải thiện thật không.</li></ol>
<p>“Premature optimization is the root of all evil.” — Donald Knuth. Cũng đừng tin benchmark trên mạng: dễ nặn ra con số tác giả muốn.</p></div>
<div class="flow">
  <div class="node">① Tải lần đầu<small>mở app lần đầu: kích thước, mạng</small></div>
  <div class="node">② Tải lại<small>quay lại app: cache</small></div>
  <div class="node hot">③ Runtime<small>app đang chạy: change detection, DOM</small></div>
</div>
<p>Không phải loại nào cũng quan trọng với bạn: web mobile, thương mại điện tử và app nội bộ CRUD có nhu cầu khác nhau. Và nhiều khuyến nghị dưới đây áp dụng cho <b>mọi framework</b> — nút thắt hiếm khi nằm ở framework.</p>`
    },
    {
      id: 'firstload', title: '① Tải lần đầu',
      html: `
<p>Trình duyệt tải <code>index.html</code>, rồi tải các script/asset nó tham chiếu, rồi <b>phân tích (parse)</b> và <b>chạy</b> JS. Nhiều file thì chậm, file lớn thì chậm — nhất là trên mạng yếu: bạn test bằng cáp quang, nhưng người dùng thật có thể đang dùng 3G.</p>

<div class="widget" id="w-load">
  <h4>📦 Ước tính thời gian tải bundle</h4>
  <p class="hint">Con số mang tính minh hoạ (không phải đo thật) — để thấy từng kỹ thuật ảnh hưởng thế nào.</p>
  <div class="grid2">
    <div>
      <label>JS ban đầu (chưa nén): <b id="ld-sizeV">800</b> KB</label>
      <input type="range" id="ld-size" min="100" max="3000" step="50" value="800" style="width:100%">
      <label>Mạng: <select id="ld-net"><option value="fiber">Cáp quang (100 Mbps, RTT 10ms)</option><option value="4g" selected>4G (9 Mbps, RTT 70ms)</option><option value="3g">3G chậm (0,4 Mbps, RTT 400ms)</option></select></label><br>
      <label>Nén: <select id="ld-comp"><option value="1">Không nén</option><option value="0.3" selected>gzip (~30%)</option><option value="0.25">Brotli (~25%)</option></select></label><br>
      <label>Lazy-loading: <select id="ld-lazy"><option value="1">Không — tải hết ngay</option><option value="0.4" selected>Tách: ban đầu còn 40%</option><option value="0.2">Tách mạnh: ban đầu còn 20%</option></select></label>
    </div>
    <div>
      <div style="font-size:30px;font-weight:800" id="ld-total"></div>
      <div class="timeline" style="height:44px;margin-top:8px" id="ld-bar"></div>
      <div class="hint" id="ld-detail" style="margin-top:8px"></div>
    </div>
  </div>
</div>

<h3>Các kỹ thuật (theo thứ tự nên nghĩ tới)</h3>
<div class="tablewrap"><table>
<tr><th>Kỹ thuật</th><th>Làm gì</th><th>Trong Angular</th></tr>
<tr><td><b>Bundle</b></td><td>Gom hàng trăm file thành vài file</td><td>Angular CLI lo hết (webpack, nay là esbuild)</td></tr>
<tr><td><b>Tree-shaking</b></td><td>Chỉ giữ code thật sự được import</td><td>Bỏ import thừa; dùng <code>providedIn: 'root'</code></td></tr>
<tr><td><b>Minify + dead code</b></td><td>Đổi tên ngắn, bỏ code chết</td><td>Terser/esbuild trong build production</td></tr>
<tr><td><b>Asset khác</b></td><td>Ảnh, font, CSS cũng phải nhỏ</td><td>Nhiều MB ảnh làm phí công tối ưu JS</td></tr>
<tr><td><b>Nén</b> gzip/Brotli</td><td>Server gửi bản nén, trình duyệt giải nén</td><td>Bật trên server/CDN — bắt buộc</td></tr>
<tr><td><b>Lazy-loading</b></td><td>Chia nhỏ bundle, tải khi cần</td><td>Router: <code>loadChildren</code> / <code>loadComponent</code> (chương 18)</td></tr>
<tr><td><b>AOT</b></td><td>Biên dịch template lúc build, khỏi gửi compiler</td><td>Mặc định ở production (chương 21)</td></tr>
<tr><td><b>SSR</b></td><td>Dựng sẵn HTML trên server (SEO, xem trước mạng xã hội)</td><td><code>@angular/ssr</code> — chỉ khi thật sự cần</td></tr>
</table></div>

<h3>Tree-shaking: chạy thử “bundler” thu nhỏ</h3>
<p>Bundler đi từ <b>entry</b>, theo các import <i>thật sự được dùng</i>, và bỏ phần còn lại — kể cả một export không dùng trong cùng file.</p>
<textarea class="live" data-title="Đồ thị phụ thuộc → thứ gì lọt vào bundle?">
// Mỗi export có kích thước (KB) và các thứ nó phụ thuộc
const modules = {
  'models.ts':        { PonyModel: { kb: 2, deps: [] }, RaceModel: { kb: 3, deps: [] } },
  'race.service.ts':  { RaceService: { kb: 8, deps: ['models.ts#RaceModel'] } },
  'pony.service.ts':  { PonyService: { kb: 6, deps: ['models.ts#PonyModel'] } },
  'chart-lib':        { drawChart: { kb: 220, deps: [] } },          // thư viện nặng, đã quên xoá
};

// Entry (main.ts) chỉ import những thứ này:
const entry = ['race.service.ts#RaceService'];

const included = new Set();
(function visit(key) {
  if (included.has(key)) return;
  included.add(key);
  const [file, name] = key.split('#');
  modules[file][name].deps.forEach(visit);
})(entry[0]);

let total = 0, all = 0;
for (const [file, exp] of Object.entries(modules)) for (const [name, e] of Object.entries(exp)) {
  const key = file + '#' + name; all += e.kb;
  if (included.has(key)) { total += e.kb; console.log('✓ trong bundle ', key.padEnd(30), e.kb + ' KB'); }
  else console.log('✗ bị loại      ', key.padEnd(30), e.kb + ' KB');
}
console.log('\\nBundle:', total, 'KB trên tổng', all, 'KB');
// Thử: thêm 'pony.service.ts#PonyService' vào entry, hoặc nhúng chart-lib vào deps của RaceService
</textarea>
<div class="box warn"><b>Hai bẫy trong Angular</b><ul>
<li>Thêm <code>NgModule</code> của một thư viện vào <code>imports</code> rồi quên xoá → <b>thư viện vẫn nằm trong bundle</b> dù không dùng.</li>
<li>Service khai báo trong <code>providers</code> của NgModule luôn bị đưa vào bundle. Dùng <code>@Injectable({ providedIn: 'root' })</code> thì service không ai dùng sẽ bị loại.</li></ul></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Trình build mặc định là <b>esbuild + Vite</b> (nhanh hơn nhiều), có <code>@defer</code> trong template để lazy-load từng khối giao diện, <code>NgOptimizedImage</code> cho ảnh, và <b>SSR + hydration</b> tích hợp thẳng vào CLI (<code>ng add @angular/ssr</code>). “Differential loading” trong sách đã bỏ vì không còn hỗ trợ trình duyệt cũ.</p></div>`
    },
    {
      id: 'reload', title: '② Tải lại: cache và Service Worker',
      html: `
<p><b>Cache</b> luôn nên bật cho asset (JS, CSS, ảnh) bằng header <code>Cache-Control</code>/<code>ETag</code> hoặc CDN. Vấn đề: làm sao báo “có bản mới”? Đáp án: <b>cache busting</b> — đổi tên file mỗi khi nội dung đổi.</p>
<div class="flow">
  <div class="node">main.js<small>nội dung A</small></div><span class="arr">hash(nội dung)</span>
  <div class="node hot">main.3f9a1c.js<small>cache 1 năm</small></div><span class="arr">deploy bản mới</span>
  <div class="node">main.b72e0d.js<small>tên mới → tải lại</small></div>
</div>
<p>Angular CLI (production) tự gắn hash vào tên file và cập nhật <code>index.html</code>. Vậy bạn có thể cache <b>mọi thứ ngoại trừ <code>index.html</code></b> (vì nó chứa link tới các file mới).</p>
<textarea class="live" data-title="Cache busting: tên file suy ra từ nội dung">
// Băm đơn giản (minh hoạ) – CLI dùng thuật toán thật
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padStart(8, '0').slice(0, 6);
const name = (base, content) => base + '.' + hash(content) + '.js';

console.log(name('main', 'console.log("v1")'));
console.log(name('main', 'console.log("v1")'));   // cùng nội dung → cùng tên → dùng cache
console.log(name('main', 'console.log("v2")'));   // đổi nội dung → tên mới → trình duyệt tải bản mới
</textarea>
<h3>Service Worker</h3>
<p>Service worker là “proxy” trong trình duyệt: mọi GET đi qua nó, nó quyết định lấy từ cache hay từ mạng. Có thể cache cả <code>index.html</code> → khởi động nhanh nhất, thậm chí chạy <b>offline</b>. Khi có bản mới, nó phục vụ bản cũ trước rồi báo cập nhật.</p>
<textarea class="code" data-lang="bash">
ng add @angular/pwa          # thêm @angular/service-worker + manifest + cấu hình ngsw-config.json
ng build                     # sinh ngsw-worker.js, cache tài nguyên tĩnh
</textarea>
<textarea class="code" data-lang="json" data-title="ngsw-config.json (rút gọn)">
{
  "index": "/index.html",
  "assetGroups": [
    { "name": "app", "installMode": "prefetch", "resources": { "files": ["/index.html", "/*.css", "/*.js"] } }
  ],
  "dataGroups": [
    { "name": "api", "urls": ["/api/**"], "cacheConfig": { "strategy": "freshness", "maxAge": "1h", "timeout": "5s", "maxSize": 100 } }
  ]
}
</textarea>
<p>Chiến lược dữ liệu: <code>freshness</code> (ưu tiên mạng, rơi về cache) hoặc <code>performance</code> (ưu tiên cache). Đây cũng là một bước để làm <b>Progressive Web App</b> và đạt điểm cao trên <b>Lighthouse</b>.</p>`
    },
    {
      id: 'profiling', title: 'Đo trước khi tối ưu: profiling',
      html: `
<p>Công cụ chính: <b>DevTools</b> của trình duyệt (tab Performance: ghi lại, giả lập CPU chậm / mạng 3G, xem từng lời gọi hàm tốn bao lâu) và <b>Lighthouse</b>. Angular có thêm <code>ng.profiler</code> để đo <b>một vòng change detection tốn bao lâu</b>:</p>
<textarea class="code" data-lang="ts" data-title="main.ts (chế độ dev)">
bootstrapApplication(AppComponent).then(appRef => {
  enableDebugTools(appRef.components[0]);        // bật ng.profiler trong console
});
// Trong console của trình duyệt:
// > ng.profiler.timeChangeDetection()
// ran 489 change detection cycles
// 1.02 ms per check
</textarea>
<p>Đội Angular khuyên giữ <b>dưới ~3 ms mỗi lần check</b>, để còn chỗ cho logic app, cập nhật giao diện và render trong khung hình 16 ms (60 FPS). Với cùng một trang, đo → áp dụng một mẹo → đo lại → so sánh.</p>
<div class="box info"><b>Ghi lại CPU profile</b><p><code>ng.profiler.timeChangeDetection({ record: true })</code> để xem chi tiết hàm nào chậm trong tab Performance.</p></div>`
    },
    {
      id: 'prod', title: '③ Runtime: chế độ production',
      html: `
<p>Ở chế độ <b>dev</b>, Angular chạy change detection <b>hai lần</b> mỗi thay đổi để chắc bạn không cập nhật dữ liệu sai quy tắc (luồng một chiều); nếu vi phạm, nó ném lỗi <code>ExpressionChangedAfterItHasBeenChecked</code>. Chế độ <b>production</b> tắt lần kiểm tra thứ hai và làm DOM “nhẹ” hơn (ít attribute debug).</p>
<textarea class="code" data-lang="ts" data-title="main.ts do CLI sinh sẵn">
if (environment.production) {
  enableProdMode();         // chỉ khi build với cấu hình production
}
</textarea>
<div class="box warn"><b>Nhớ build production</b><p>Đo hiệu năng bằng <code>ng serve</code> là sai lệch: luôn đo bản <code>ng build</code> (production). Từ các bản mới, bản build production tự bật các tối ưu này, bạn không cần gọi <code>enableProdMode()</code> bằng tay trừ khi tuỳ biến.</p></div>
<p>Phần còn lại của chương xoay quanh một ý: <b>giúp Angular làm ít việc hơn</b> — kiểm tra ít component hơn và tạo/xoá ít DOM hơn.</p>`
    },
    {
      id: 'trackby', title: 'trackBy trong *ngFor',
      html: `
<p>Angular nhớ <b>nút DOM nào ứng với object nào theo tham chiếu</b>. Khi bạn tải lại danh sách từ server — nội dung y hệt nhưng <b>object mới</b> — Angular tưởng mọi phần tử đã đổi → <b>huỷ hết DOM và tạo lại</b>. Có <code>trackBy</code> (theo <code>id</code>) thì nó chỉ tạo lại khi id đổi.</p>

<div class="widget" id="w-track">
  <h4>🧱 Mỗi dòng có “số DOM” (#n) — số đổi nghĩa là nút bị tạo lại</h4>
  <div class="row" style="margin-bottom:10px">
    <label><input type="checkbox" id="tk-on"> dùng <code>trackBy: ponyById</code></label>
    <button class="btn" id="tk-refresh">⟳ Tải lại từ server (cùng dữ liệu, object mới)</button>
    <button class="btn alt" id="tk-rename">✎ Đổi tên pony 2</button>
    <button class="btn alt" id="tk-add">＋ Thêm pony</button>
  </div>
  <div class="grid2">
    <ul id="tk-list" style="list-style:none;margin:0;padding:0"></ul>
    <div><div id="tk-stat" style="font-size:18px;font-weight:700"></div><div class="hint" id="tk-total" style="margin-top:6px"></div></div>
  </div>
</div>
<textarea class="code" data-lang="ts">
ponyById(index: number, pony: PonyModel): number { return pony.id; }
// <li *ngFor="let pony of ponies; trackBy: ponyById">{{ pony.name }}</li>
</textarea>
<div class="box info"><b>Không có nhược điểm</b><p>Rẻ để làm và thường nên làm. Cũng bắt buộc nếu bạn muốn <b>animation</b>: không có trackBy, phần tử bị thay thế nên “chuyển động từ giá trị cũ sang mới” không bao giờ xảy ra.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="html">
@for (pony of ponies; track pony.id) {
  <li>{{ pony.name }}</li>
}
</textarea><p>Cú pháp <code>@for</code> <b>bắt buộc</b> có <code>track</code> — Angular nhắc bạn đừng quên.</p></div>`
    },
    {
      id: 'onpush', title: 'Change detection: Default và OnPush',
      html: `
<p>Mặc định Angular kiểm tra <b>mọi component</b>, từ gốc xuống lá, sau mỗi sự kiện/timer/HTTP. Với <code>ChangeDetectionStrategy.OnPush</code>, template của component chỉ được kiểm tra khi:</p>
<ul><li>một <b>input đổi tham chiếu</b> (không phải mutate bên trong), hoặc</li><li>một <b>event handler của chính component</b> chạy (hoặc <code>async</code> pipe nhận giá trị, hoặc bạn gọi <code>markForCheck()</code>).</li></ul>

<div class="widget" id="w-cd">
  <h4>🌲 Mô phỏng cây component: Race → Pony ×2 → Img</h4>
  <p class="hint">Mỗi component có <code>check()</code> ghi log (như ví dụ trong sách). Đổi strategy, rồi bấm các hành động và xem <b>ai được kiểm tra</b> và <b>giao diện có đúng không</b>.</p>
  <div class="row" style="margin-bottom:8px">
    <label>Pony: <select id="cd-sp"><option>Default</option><option>OnPush</option></select></label>
    <label>Img: <select id="cd-si"><option>Default</option><option>OnPush</option></select></label>
    <label><input type="checkbox" id="cd-dev"> chế độ dev (kiểm tra 2 lần)</label>
    <label><input type="checkbox" id="cd-mark"> <code>markForCheck()</code> trong timer</label>
    <button class="btn alt" id="cd-reset">↺ Làm lại</button>
  </div>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="cd-mutate">① Đổi màu pony 1 bằng <b>mutate</b> (click trong Race)</button>
    <button class="btn" id="cd-replace">② Đổi màu bằng <b>object mới</b> (click trong Race)</button>
    <button class="btn alt" id="cd-other">③ Sự kiện không liên quan</button>
    <button class="btn alt" id="cd-timer">④ setInterval trong Pony 1 (mutate)</button>
  </div>
  <div class="grid2">
    <div><div id="cd-tree"></div></div>
    <div><b>Log lần check vừa rồi</b><div class="output" id="cd-log" style="border-radius:8px;height:220px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử theo thứ tự</b><ol>
<li>Mặc định (Default): hành động ①–③ đều kiểm tra tất cả → đúng nhưng tốn.</li>
<li>Chuyển Pony và Img sang <b>OnPush</b>, bấm ③: chỉ <code>Race</code> được check — tiết kiệm.</li>
<li>Bấm ① (mutate): giao diện vẫn <b>sai</b> (⚠ hiển thị cũ) vì tham chiếu input không đổi — <b>bẫy mutability</b>.</li>
<li>Bấm ② (object mới): đúng và chỉ Pony 1 + Img 1 được check.</li>
<li>Bấm ④ với OnPush: sai; bật <code>markForCheck()</code> rồi thử lại: đúng.</li></ol></div>
<textarea class="code" data-lang="ts" data-title="Sửa bẫy mutate: tạo object mới">
changeColor(): void {
  const pony = this.ponies[0];
  this.ponies[0] = { ...pony, color: this.randomColor() };   // tham chiếu mới → OnPush thấy thay đổi
}
</textarea>
<h4>OnPush + Observable + async pipe</h4>
<p>Component OnPush đăng ký observable đổi mỗi giây rồi gán vào field → template <b>không</b> cập nhật (không có input đổi, không có event). Dùng <code>async</code> pipe: nó tự đánh dấu component cần kiểm tra mỗi khi có giá trị mới (và tự huỷ đăng ký).</p>
<textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-pony',
  template: \`<img *ngIf="color | async as c" [src]="'pony-' + c + '.gif'" [alt]="c" />\`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PonyComponent {
  color: Observable<string>;
  constructor(colorService: ColorService) { this.color = colorService.get(); }
}
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p><b>Signals</b> giải quyết đúng bài toán này: component chỉ được kiểm tra lại khi một signal nó đọc trong template thay đổi — và có thể chạy <b>zoneless</b> (không cần Zone.js). Với signal, “bẫy mutate” gần như biến mất vì bạn luôn <code>set()</code>/<code>update()</code>. Dự án mới nên ưu tiên <code>OnPush</code> + signals.</p></div>`
    },
    {
      id: 'cdref', title: 'ChangeDetectorRef: tự điều khiển',
      html: `
<p>Trường hợp nâng cao: một observable phát <b>100 lần/giây</b> (đồng hồ mỗi 10ms). Mắt người không thấy được, mà mỗi lần phát lại kích hoạt change detection cho <b>cả ứng dụng</b>. Có thể cho component “thoát” khỏi cơ chế tự động. <code>ChangeDetectorRef</code> có: <code>detach()</code>, <code>detectChanges()</code>, <code>markForCheck()</code>, <code>reattach()</code>.</p>

<div class="widget" id="w-clock">
  <h4>⏱ Đồng hồ 10ms: bao nhiêu lần change detection?</h4>
  <div class="row" style="margin-bottom:10px">
    <label>Cách làm: <select id="ck-mode">
      <option value="default">Mặc định: mỗi lần phát → change detection</option>
      <option value="detach">detach() + detectChanges() mỗi 1 giây</option>
      <option value="outside">NgZone.runOutsideAngular + tự cập nhật DOM mỗi 1 giây</option></select></label>
    <button class="btn" id="ck-start">▶ Chạy 3 giây</button>
  </div>
  <div class="grid2">
    <div>Giá trị phát ra (<code>time</code>): <b id="ck-emit" class="mono">0</b> ms (<span id="ck-n">0</span> lần phát)<br>
      Giao diện đang hiển thị: <b id="ck-shown" class="mono" style="font-size:22px">0</b><br>
      Số lần change detection: <b id="ck-cd" style="font-size:22px;color:var(--accent)">0</b></div>
    <div class="hint">Ở chế độ mặc định, mỗi lần phát (10ms) kéo theo một vòng kiểm tra toàn ứng dụng: ~300 vòng/3 giây. Hai chế độ còn lại chỉ ~3 vòng, mà người dùng vẫn thấy đồng hồ chạy mỗi giây.</div>
  </div>
</div>
<textarea class="code" data-lang="ts" data-title="detach + detectChanges">
constructor(private ref: ChangeDetectorRef) {}
start(): void {
  this.ref.detach();                                   // ngừng kiểm tra tự động component này
  this.timeSubscription = interval(10).pipe(take(1001), map(t => t * 10)).subscribe(time => {
    this.time = time;                                  // field vẫn đổi 100 lần/giây
    if (time % 1000 === 0) this.ref.detectChanges();   // nhưng giao diện chỉ cập nhật mỗi giây
  });
}
</textarea>
<textarea class="code" data-lang="ts" data-title="Chạy ngoài Zone, tự sửa DOM">
@ViewChild('clock') clock: ElementRef<HTMLParagraphElement>;
constructor(private zone: NgZone) {}
start(): void {
  this.zone.runOutsideAngular(() => {                  // Zone.js không biết → không kích hoạt change detection
    interval(10).pipe(take(1001), map(t => t * 10)).subscribe(time => {
      if (time % 1000 === 0) this.clock.nativeElement.textContent = \`\${time}\`;
    });
  });
}
</textarea>
<p><code>markForCheck()</code> thì ngược lại: cho component OnPush “giơ tay” xin được kiểm tra ở lần change detection sau (dùng với <code>setInterval</code>, không dùng được async pipe):</p>
<textarea class="code" data-lang="ts">
ngOnInit(): void {
  this.intervalId = window.setInterval(() => {
    this.ponyModel.color = this.randomColor();
    this.ref.markForCheck();               // báo cho Angular: lần tới hãy kiểm tra tôi
  }, 1000);
}
</textarea>`
    },
    {
      id: 'pure', title: 'Pure pipe thay vì gọi hàm trong template',
      html: `
<p>Hàm trong template chạy <b>mỗi lần change detection</b>. Pipe <b>thuần (pure)</b> — mặc định — chỉ chạy lại khi <b>tham chiếu đầu vào hoặc đối số đổi</b> (giống OnPush cho component). Nhưng đó cũng là bẫy: <b>mutate</b> object thì pipe thuần không chạy lại.</p>

<div class="widget" id="w-pure">
  <h4>🧮 Hàm vs pipe thuần vs pipe không thuần</h4>
  <p class="hint">Template dùng giá trị hai lần: <code>{{ user | displayName }}</code>. Đếm số lần <code>transform</code>/hàm được gọi.</p>
  <div class="row" style="margin-bottom:10px">
    <button class="btn alt" id="pp-cd">Chạy change detection ×1</button>
    <button class="btn alt" id="pp-mut">Mutate: user.firstName = …</button>
    <button class="btn alt" id="pp-new">Thay user bằng object mới</button>
    <button class="btn alt" id="pp-reset">↺</button>
  </div>
  <div class="tablewrap"><table id="pp-table"></table></div>
</div>
<textarea class="code" data-lang="ts">
@Pipe({ name: 'displayName' })                    // pure: true là mặc định
export class DisplayNamePipe implements PipeTransform {
  transform(user: UserModel): string { return \`\${user.title} \${user.firstName} \${user.lastName}\`; }
}
@Pipe({ name: 'displayName', pure: false })       // chạy mỗi lần: luôn đúng, nhưng mất lợi thế hiệu năng
</textarea>
<div class="box tip"><b>Chọn cái nào?</b><p>Dùng pipe thuần với dữ liệu <b>bất biến</b> (tạo object mới khi đổi). Chỉ dùng <code>pure: false</code> khi bạn không kiểm soát được việc mutate.</p></div>`
    },
    {
      id: 'split', title: 'Chia nhỏ template + @Attribute',
      html: `
<h3>Chia template cho đúng (smart / dumb)</h3>
<p>Một component có ô tìm kiếm (debounce) và danh sách kết quả lớn. Dù danh sách chỉ đổi mỗi 500ms, <b>mỗi phím gõ</b> lại kích hoạt change detection và kiểm tra lại toàn bộ danh sách (thử <code>console.log</code> trong <code>resultsTitle()</code>). Tách danh sách thành component con <b>OnPush</b> chỉ nhận <code>@Input() results</code>:</p>
<textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-results',
  template: \`<input [formControl]="search" /> <ns-results-list [results]="results"></ns-results-list>\`
})
export class ResultsComponent { /* smart: lấy dữ liệu, debounce, switchMap */ }

@Component({
  selector: 'ns-results-list',
  template: \`<h1>{{ resultsTitle() }}</h1><div *ngFor="let result of results">{{ result }}</div>\`,
  changeDetection: ChangeDetectionStrategy.OnPush         // dumb: chỉ hiển thị
})
export class ResultsListComponent { @Input() results: Array<string> = []; resultsTitle() { return \`\${this.results.length} results\`; } }
</textarea>
<p>Component “dumb” có template lớn nhưng chỉ đổi khi cha truyền input mới → tiết kiệm rất nhiều lần tính biểu thức.</p>
<h3><code>@Attribute</code>: giá trị tĩnh, chỉ gán một lần</h3>
<p><code>@Input()</code> khiến Angular luôn theo dõi giá trị có thể đổi. Với chuỗi cố định (kiểu nút <code>primary</code>/<code>success</code>), dùng <code>@Attribute</code> để “bind một lần”:</p>
<textarea class="code" data-lang="ts">
@Component({ selector: 'ns-button', template: \`<button class="btn btn-{{ btnType }}"><ng-content></ng-content></button>\` })
export class ButtonComponent {
  constructor(@Attribute('btnType') public btnType: string) {}     // <ns-button btnType="primary">
}
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Hàm <code>inject(new HostAttributeToken('btnType'))</code>, hoặc đơn giản dùng <code>input()</code> với signal (rẻ và theo dõi chính xác). Đây là tối ưu rất nhỏ — chỉ dùng khi đã đo.</p></div>`
    },
    {
      id: 'summary', title: 'Bảng tổng kết',
      html: `
<div class="tablewrap"><table>
<tr><th>Vấn đề</th><th>Mẹo</th><th>Mức ưu tiên</th></tr>
<tr><td>Bundle lớn</td><td>Tree-shaking, bỏ import thừa, <code>providedIn: 'root'</code>, nén, lazy-loading</td><td>Cao (hầu hết app)</td></tr>
<tr><td>Tải lại chậm</td><td>Cache + hash trong tên file, Service Worker</td><td>Cao</td></tr>
<tr><td>Danh sách giật</td><td><code>trackBy</code> / <code>track</code></td><td>Cao, gần như miễn phí</td></tr>
<tr><td>Quá nhiều lần kiểm tra</td><td><code>OnPush</code>, smart/dumb, signals, dữ liệu bất biến</td><td>Trung bình — khi đo thấy chậm</td></tr>
<tr><td>Sự kiện bắn dồn dập</td><td><code>ChangeDetectorRef</code>, <code>runOutsideAngular</code>, debounce</td><td>Thấp, trường hợp đặc biệt</td></tr>
<tr><td>Logic trong template</td><td>Pipe thuần thay hàm</td><td>Trung bình</td></tr>
</table></div>
<p>Cuối cùng, nhắc lại ba luật: <b>đừng, đừng… chưa, đo trước khi tối ưu</b>. Giữ code đơn giản, đúng và dễ đọc; chỉ tối ưu khi có vấn đề hiệu năng đã được chứng minh.</p>`
    }
  ],
  quiz: [
    { q: 'Điều đầu tiên cần làm trước khi tối ưu hiệu năng?', options: ['Thêm OnPush khắp nơi', 'Đo (profile) để biết nút thắt thật sự', 'Viết lại bằng framework khác'], answer: 1, why: 'Premature optimization is the root of all evil — đo trước và sau.' },
    { q: 'Tree-shaking nghĩa là?', options: ['Loại code không được import/dùng khỏi bundle', 'Nén file bằng gzip', 'Chia bundle thành nhiều phần'], answer: 0, why: 'Bundler bắt đầu từ entry và chỉ giữ những gì được tham chiếu.' },
    { q: 'Vì sao nên cache mọi asset ngoại trừ index.html?', options: ['Vì index.html nhỏ', 'Vì index.html chứa link tới các file (đã có hash) mới nhất', 'Vì trình duyệt không cache được HTML'], answer: 1, why: 'Asset đổi tên khi nội dung đổi nên cache được lâu; index.html trỏ tới tên mới.' },
    { q: 'Khi nào component OnPush được kiểm tra lại?', options: ['Mọi lúc', 'Khi tham chiếu input đổi, event của nó chạy, async pipe/markForCheck', 'Chỉ khi reload trang'], answer: 1, why: 'Đó là các điều kiện của OnPush.' },
    { q: 'Mutate <code>this.ponies[0].color = ...</code> trong component con OnPush gây ra điều gì?', options: ['Giao diện cập nhật ngay', 'Giao diện không cập nhật vì tham chiếu input không đổi', 'Lỗi biên dịch'], answer: 1, why: 'Cần tạo object mới ({ ...pony, color }) hoặc markForCheck().' },
    { q: 'Tác dụng của <code>trackBy</code> (hoặc <code>track</code> trong @for)?', options: ['Sắp xếp danh sách', 'Giữ lại nút DOM cho cùng id khi danh sách được thay bằng object mới', 'Lọc danh sách'], answer: 1, why: 'Tránh huỷ và tạo lại DOM không cần thiết.' },
    { q: 'Pure pipe chạy lại khi nào?', options: ['Mỗi lần change detection', 'Khi tham chiếu đầu vào hoặc đối số đổi', 'Không bao giờ'], answer: 1, why: 'Pure pipe được memoize theo tham chiếu đầu vào.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const alive = () => root.isConnected;

    /* ===== ước tính tải ===== */
    const NET = { fiber: { mbps: 100, rtt: 10 }, '4g': { mbps: 9, rtt: 70 }, '3g': { mbps: 0.4, rtt: 400 } };
    function load() {
      const kb = +$('#ld-size').value; $('#ld-sizeV').textContent = kb;
      const n = NET[$('#ld-net').value], comp = +$('#ld-comp').value, lazy = +$('#ld-lazy').value;
      const initial = kb * lazy, bytes = initial * comp * 1024;
      const dl = n.rtt * 3 + bytes * 8 / (n.mbps * 1e6) * 1000;       // 3 RTT (kết nối + TLS + request) + truyền
      const parse = initial * 0.6;                                      // ~0,6ms/KB trên máy tầm trung
      const total = dl + parse, fmt = ms => ms >= 1000 ? (ms / 1000).toFixed(1) + ' s' : Math.round(ms) + ' ms';
      $('#ld-total').textContent = '≈ ' + fmt(total);
      $('#ld-total').style.color = total < 2000 ? 'var(--ok)' : total < 5000 ? 'var(--warn)' : 'var(--err)';
      const max = Math.max(total, 1);
      $('#ld-bar').innerHTML = `<div class="bar" style="left:0;width:${dl / max * 100}%;background:#3aa0ff">tải ${fmt(dl)}</div><div class="bar" style="left:${dl / max * 100}%;width:${parse / max * 100}%;background:#f39b3d">parse ${fmt(parse)}</div>`;
      $('#ld-detail').textContent = `JS ban đầu ${Math.round(initial)} KB → truyền ${Math.round(initial * comp)} KB (sau nén).`;
    }
    root.querySelectorAll('#w-load select, #w-load input').forEach(e => (e.oninput = e.onchange = load)); load();

    /* ===== trackBy ===== */
    const names = ['Rainbow Dash', 'Pinkie Pie', 'Fluttershy', 'Applejack', 'Rarity', 'Twilight'];
    let serial = 0, created = 0, destroyed = 0, data = [1, 2, 3].map(id => ({ id, name: names[id - 1] })), nodes = new Map(), lastStat = '';
    const list = $('#tk-list');
    const nextId = () => Math.max(0, ...data.map(p => p.id)) + 1;
    function renderList() {
      const track = $('#tk-on').checked; let c = 0, d = 0;
      const keyOf = p => (track ? p.id : p);
      const newKeys = new Set(data.map(keyOf));
      nodes.forEach((n, k) => { if (!newKeys.has(k)) { n.el.remove(); nodes.delete(k); d++; } });
      data.forEach((p, i) => {
        const k = keyOf(p); let n = nodes.get(k);
        if (!n) { const el = document.createElement('li'); el.style.cssText = 'padding:6px 10px;border:1px solid var(--border);border-radius:8px;margin:4px 0;background:var(--surface);display:flex;gap:8px'; n = { el, serial: ++serial }; nodes.set(k, n); c++; el.style.borderColor = 'var(--accent)'; setTimeout(() => (el.style.borderColor = ''), 700); }
        n.el.innerHTML = `<span class="kv hit"><span class="k">DOM</span><span class="v">#${n.serial}</span></span><span>${esc(p.name)}</span>`;
        if (list.children[i] !== n.el) list.insertBefore(n.el, list.children[i] || null);
      });
      created += c; destroyed += d;
      lastStat = `Lần này: tạo <b>${c}</b> nút, huỷ <b>${d}</b> nút`;
      $('#tk-stat').innerHTML = lastStat; $('#tk-total').textContent = `Tổng: ${created} nút được tạo, ${destroyed} nút bị huỷ.`;
    }
    $('#tk-refresh').onclick = () => { data = data.map(p => ({ ...p })); renderList(); };
    $('#tk-rename').onclick = () => { data = data.map(p => (p.id === 2 ? { ...p, name: names[Math.floor(Math.random() * names.length)] } : p)); renderList(); };
    $('#tk-add').onclick = () => { const id = nextId(); data = [...data, { id, name: names[(id - 1) % names.length] }]; renderList(); };
    $('#tk-on').onchange = () => { nodes.forEach(n => n.el.remove()); nodes = new Map(); created = destroyed = 0; renderList(); };
    renderList();

    /* ===== change detection simulator ===== */
    const COL = { green: '#2fb67c', orange: '#f39b3d', blue: '#3aa0ff', pink: '#ff6fb1' }, ORDER = Object.keys(COL);
    let ponies, comps, timerId = null;
    const rnd = prev => { const o = ORDER.filter(c => c !== prev); return o[Math.floor(Math.random() * o.length)]; };
    function resetCD() {
      ponies = [{ id: 1, color: 'green' }, { id: 2, color: 'orange' }];
      comps = { race: { n: 0, tick: 0 }, p: [0, 1].map(i => ({ n: 0, tick: 0, ref: null, view: null, dirty: false, i })), im: [0, 1].map(() => ({ n: 0, tick: 0, src: null, view: null, dirty: false })) };
      $('#cd-log').innerHTML = ''; runTick({ first: true });
    }
    function runTick({ first = false, event = false, mark = null } = {}) {
      const passes = $('#cd-dev').checked && !first ? 2 : 1, sp = $('#cd-sp').value, si = $('#cd-si').value, log = [];
      comps.p.forEach(p => (p.tick = 0)); comps.im.forEach(im => (im.tick = 0)); comps.race.tick = 0;
      if (mark != null) comps.p[mark].dirty = true;
      for (let pass = 0; pass < passes; pass++) {
        comps.race.n++; comps.race.tick++; log.push('race component view checked');
        comps.p.forEach((p, i) => {
          const input = ponies[i];
          if (sp === 'Default' || first || p.ref !== input || p.dirty) {
            p.n++; p.tick++; p.dirty = false; p.ref = input; p.view = input.color; log.push(`pony ${i + 1} component view checked`);
            const src = `pony-${p.view}.gif`, im = comps.im[i];
            if (si === 'Default' || first || im.src !== src || im.dirty) { im.n++; im.tick++; im.src = src; im.view = p.view; im.dirty = false; log.push(`image ${i + 1} component view checked`); }
          } else if (si === 'Default' && false) { /* sous-arbre ignoré */ }
        });
      }
      draw(log);
    }
    function draw(log) {
      const sp = $('#cd-sp').value, si = $('#cd-si').value;
      const dot = c => `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${COL[c] || '#999'};vertical-align:middle"></span>`;
      const card = (title, strat, c, extra, indent) => `<div style="margin-left:${indent}px;border:1px solid ${c.tick ? 'var(--accent)' : 'var(--border)'};background:${c.tick ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)'};border-radius:8px;padding:6px 10px;margin:4px 0">
        <b>${title}</b> <span class="pill" style="font-size:11px;background:var(--surface2)">${strat}</span> <span class="hint">check: <b>${c.n}</b>${c.tick ? ` (+${c.tick})` : ''}</span><div>${extra}</div></div>`;
      let h = card('RaceComponent', 'Default', comps.race, `màu thật: ${ponies.map(p => dot(p.color)).join(' ')}`, 0);
      comps.p.forEach((p, i) => {
        const stale = p.view !== ponies[i].color;
        h += card(`PonyComponent ${i + 1}`, sp, p, `hiển thị ${dot(p.view)} ${stale ? '<span class="pill rejected" style="font-size:11px">⚠ hiển thị cũ! (thật: ' + ponies[i].color + ')</span>' : '<span class="pill fulfilled" style="font-size:11px">đúng</span>'}`, 20);
        const im = comps.im[i];
        h += card(`ImageComponent ${i + 1}`, si, im, `<span class="mono" style="font-size:12px">${im.src}</span>`, 40);
      });
      $('#cd-tree').innerHTML = h;
      const lg = $('#cd-log'); lg.innerHTML = log.length ? log.map(l => `<div>${l}</div>`).join('') : '<span class="dim">(không component nào được kiểm tra)</span>';
    }
    $('#cd-mutate').onclick = () => { ponies[0].color = rnd(ponies[0].color); runTick({ event: true }); };
    $('#cd-replace').onclick = () => { ponies[0] = { ...ponies[0], color: rnd(ponies[0].color) }; runTick({ event: true }); };
    $('#cd-other').onclick = () => runTick({});
    $('#cd-timer').onclick = () => {
      clearTimeout(timerId); $('#cd-log').innerHTML = '<span class="dim">timer 1 giây…</span>';
      timerId = setTimeout(() => { if (!alive()) return; ponies[0].color = rnd(ponies[0].color); runTick({ mark: $('#cd-mark').checked ? 0 : null }); }, 1000);
    };
    $('#cd-reset').onclick = resetCD;
    root.querySelectorAll('#w-cd select').forEach(s => (s.onchange = resetCD)); resetCD();

    /* ===== đồng hồ ===== */
    let clockId = null;
    $('#ck-start').onclick = () => {
      clearInterval(clockId);
      const mode = $('#ck-mode').value; let emitted = 0, cd = 0;
      $('#ck-emit').textContent = '0'; $('#ck-n').textContent = '0'; $('#ck-shown').textContent = '0'; $('#ck-cd').textContent = '0';
      clockId = setInterval(() => {
        if (!alive()) return clearInterval(clockId);
        const time = emitted * 10; emitted++;
        $('#ck-emit').textContent = time; $('#ck-n').textContent = emitted;
        if (mode === 'default') { cd++; $('#ck-shown').textContent = time; }
        else if (time % 1000 === 0) { if (mode === 'detach') cd++; $('#ck-shown').textContent = time; }
        $('#ck-cd').textContent = cd;
        if (emitted > 300) clearInterval(clockId);
      }, 10);
    };

    /* ===== pure pipe ===== */
    let user, calls, lastPureRef, pureCache;
    const dn = u => `${u.title} ${u.firstName} ${u.lastName}`;
    function resetPure() { user = { title: 'Miss', firstName: 'Jane', lastName: 'Doe' }; calls = { m: 0, p: 0, i: 0 }; lastPureRef = null; pureCache = null; cdPure(); }
    function cdPure() {
      for (let k = 0; k < 2; k++) {                       // template dùng 2 lần
        calls.m++; dn(user);
        calls.i++; dn(user);
        if (lastPureRef !== user) { calls.p++; pureCache = dn(user); lastPureRef = user; }
      }
      const real = dn(user);
      const row = (name, cnt, val) => `<tr><td>${name}</td><td><b>${cnt}</b></td><td>${esc(val)} ${val === real ? '' : '<span class="pill rejected" style="font-size:11px">⚠ cũ</span>'}</td></tr>`;
      $('#pp-table').innerHTML = '<tr><th>Cách viết</th><th>Số lần chạy</th><th>Hiển thị</th></tr>' +
        row('<code>{{ userName() }}</code> (hàm)', calls.m, real) + row('<code>{{ user | displayName }}</code> (pure)', calls.p, pureCache) + row('<code>pure: false</code>', calls.i, real);
    }
    $('#pp-cd').onclick = cdPure;
    $('#pp-mut').onclick = () => { user.firstName = ['Jane', 'Mary', 'Anna', 'Lily'][Math.floor(Math.random() * 4)] + Math.floor(Math.random() * 10); cdPure(); };
    $('#pp-new').onclick = () => { user = { ...user, firstName: ['Jane', 'Mary', 'Anna', 'Lily'][Math.floor(Math.random() * 4)] + Math.floor(Math.random() * 10) }; cdPure(); };
    $('#pp-reset').onclick = resetPure; resetPure();
  }
});
