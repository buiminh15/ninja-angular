registerChapter(10, {
  time: '45 phút',
  lead: 'Dependency Injection (DI) là xương sống của Angular: bạn chỉ khai báo “tôi cần gì”, framework tạo và đưa vào. Để hiểu tận gốc, ta tự viết một injector thu nhỏ chạy ngay trong trang, rồi đối chiếu với Angular thật.',
  sections: [
    {
      id: 'idea', title: 'DI là gì? (inversion of control)',
      html: `
<p>Một component cần một service (đó là <b>dependency</b>). Thay vì tự <code>new</code>, ta để <b>framework tạo và đưa vào</b> — gọi là <i>đảo ngược điều khiển</i>. Lợi ích:</p>
<div class="flow">
  <div class="node">Dễ phát triển<small>chỉ nói “tôi cần X”</small></div>
  <div class="node">Dễ test<small>thay X bằng bản giả</small></div>
  <div class="node">Dễ cấu hình<small>đổi cài đặt mà không sửa chỗ dùng</small></div>
</div>
<p>Để DI hoạt động cần hai thứ: (1) <b>đăng ký</b> thứ có thể tiêm (provider), (2) <b>khai báo</b> thứ cần ở nơi dùng. Phần còn lại là việc của <b>Injector</b>.</p>
<div class="flow">
  <div class="node">AppComponent<small>cần RaceService</small></div><span class="arr">→</span>
  <div class="node hot">Injector<small>registry: token → provider</small></div><span class="arr">→</span>
  <div class="node">RaceService<small>cần ApiService</small></div><span class="arr">→</span>
  <div class="node">ApiService</div>
</div>
<div class="box info"><b>Ôn lại</b><p>Chương 3 đã giới thiệu ý tưởng này bằng một mini-injector. Chương này đào sâu: provider, token, singleton, injector phân cấp.</p></div>`
    },
    {
      id: 'easy', title: 'Dễ phát triển: @Injectable và providedIn',
      html: `
<p>Giả sử đồng nghiệp viết <code>ApiService</code>. Bạn viết <code>RaceService</code> dùng nó, chỉ cần ghi kiểu trong constructor:</p>
<textarea class="code" data-lang="ts" data-title="api.service.ts">
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })      // đăng ký vào injector gốc
export class ApiService {
  get(path: string): Array<any> {
    return [];                           // todo: gọi backend
  }
}
</textarea>
<textarea class="code" data-lang="ts" data-title="race.service.ts">
@Injectable({ providedIn: 'root' })
export class RaceService {
  constructor(private apiService: ApiService) {}   // "tôi cần ApiService"

  list(): Array<RaceModel> {
    return this.apiService.get('/races');
  }
}
</textarea>
<textarea class="code" data-lang="ts" data-title="app.component.ts – dùng RaceService">
@Component({
  selector: 'ns-root',
  template: \`<h1>PonyRacer</h1><p>{{ list() }}</p>\`
})
export class AppComponent {
  constructor(private raceService: RaceService) {}
  list() { return this.raceService.list(); }
}
</textarea>
<p>Sơ đồ phụ thuộc (mũi tên = “phụ thuộc vào”): <b>AppComponent → RaceService → ApiService</b>. Bạn không bao giờ viết <code>new RaceService(new ApiService())</code>.</p>
<div class="box modern"><b>🆕 Hiện nay</b>
<p>Hai thay đổi nhỏ khi viết mới:</p>
<ul><li>Dùng hàm <code>inject()</code> thay cho constructor (đặc biệt tiện với hàm và kế thừa).</li>
<li>Không còn cần <code>NgModule</code>: <code>providedIn: 'root'</code> là mặc định; còn cấu hình toàn app nằm ở <code>providers</code> trong <code>app.config.ts</code>.</li></ul>
<textarea class="code" data-lang="ts">
@Injectable({ providedIn: 'root' })
export class RaceService {
  private apiService = inject(ApiService);
  list() { return this.apiService.get('/races'); }
}
</textarea></div>`
    },
    {
      id: 'mini', title: 'Tự viết injector để thấy nó hoạt động',
      html: `
<p>Injector thực chất là <b>một Map từ token → provider</b>, cộng thêm logic “tạo một lần, trả lại mãi” (singleton). Dưới đây là phiên bản ~20 dòng, <b>cùng ý tưởng với Angular</b>. Bấm chạy, rồi thử sửa.</p>
<textarea class="live" data-title="Injector thu nhỏ: token, provider, singleton">
class Injector {
  constructor(providers = []) {
    this.providers = new Map();   // token -> provider
    this.cache = new Map();       // token -> instance đã tạo
    providers.forEach(p => {
      const provider = typeof p === 'function' ? { provide: p, useClass: p } : p; // dạng viết tắt
      this.providers.set(provider.provide, provider);
    });
  }
  get(token) {
    if (this.cache.has(token)) return this.cache.get(token);          // singleton
    const p = this.providers.get(token);
    if (!p) throw new Error('No provider for ' + (token.name || String(token)));
    let instance;
    if ('useValue' in p) instance = p.useValue;
    else if (p.useFactory) instance = p.useFactory(...(p.deps || []).map(d => this.get(d)));
    else instance = new p.useClass(...(p.useClass.deps || []).map(d => this.get(d)));
    this.cache.set(token, instance);
    return instance;
  }
}

class ApiService { get(path) { return []; } }
class RaceService {
  static deps = [ApiService];                       // "kiểu tham số" của TypeScript
  constructor(apiService) { this.apiService = apiService; }
  list() { return this.apiService.get('/races'); }
}

const injector = new Injector([ApiService, RaceService]);
console.log(injector.get(RaceService));
console.log('cùng instance?', injector.get(RaceService) === injector.get(RaceService)); // singleton
</textarea>
<div class="box tip"><b>Điều rút ra</b><ul>
<li>Injector đọc phụ thuộc, tạo chúng <b>đệ quy</b> rồi truyền vào constructor.</li>
<li>Mỗi token chỉ được tạo <b>một lần</b> (singleton) → các component chia sẻ dữ liệu qua service và chắc chắn dùng cùng một instance.</li>
</ul></div>`
    },
    {
      id: 'config', title: 'Dễ cấu hình: token, provider và hoán đổi cài đặt',
      html: `
<p>Backend chưa xong? Muốn dữ liệu giả? Chỉ cần <b>đổi provider</b>, code dùng <code>RaceService</code> giữ nguyên. Dạng đầy đủ của <code>providers: [RaceService]</code> là:</p>
<textarea class="code" data-lang="ts">
providers: [
  { provide: RaceService, useClass: RaceService }   // token → class
]
</textarea>
<p><b>Token</b> không nhất thiết là chuỗi — thường là chính class (Type reference). Có thể dùng token khác và nhiều provider cho cùng một class:</p>
<textarea class="live" data-title="Cùng class, hai token → hai instance (như ví dụ trong sách)">
class Injector {
  constructor(providers = []) { this.providers = new Map(); this.cache = new Map();
    providers.forEach(p => { p = typeof p === 'function' ? { provide: p, useClass: p } : p; this.providers.set(p.provide, p); }); }
  get(token) {
    if (this.cache.has(token)) return this.cache.get(token);
    const p = this.providers.get(token);
    if (!p) throw new Error('No provider for ' + (token.name || String(token)));
    const i = 'useValue' in p ? p.useValue : p.useFactory ? p.useFactory(...(p.deps || []).map(d => this.get(d)))
      : new p.useClass(...(p.useClass.deps || []).map(d => this.get(d)));
    this.cache.set(token, i); return i;
  }
}
class ApiService {}
class RaceService { static deps = [ApiService]; constructor(api) { this.api = api; } }
const token = Symbol('RaceServiceToken');            // giống new InjectionToken(...)

const inj = new Injector([ApiService, { provide: RaceService, useClass: RaceService }, { provide: token, useClass: RaceService }]);

console.log(inj.get(RaceService));
console.log(inj.get(token));
console.log('cùng token → cùng instance :', inj.get(RaceService) === inj.get(RaceService));  // true
console.log('khác token → khác instance :', inj.get(RaceService) === inj.get(token));        // false
</textarea>

<h3>Thay bằng service giả</h3>
<textarea class="code" data-lang="ts" data-title="FakeRaceService – trả dữ liệu cố định">
@Injectable()
export class FakeRaceService {
  list(): Array<RaceModel> { return [{ name: 'London' }]; }
}

// trong cấu hình:
providers: [{ provide: RaceService, useClass: FakeRaceService }]
</textarea>
<p>Mọi nơi xin <code>RaceService</code> giờ nhận <code>FakeRaceService</code>. Thử các kiểu provider trong widget sau:</p>

<div class="widget" id="w-prov">
  <h4>🔌 Chọn cách cung cấp RaceService</h4>
  <p class="hint">Chọn kiểu provider. Widget chạy injector thu nhỏ thật và gọi <span class="mono">injector.get(RaceService).list()</span>.</p>
  <div class="row" style="margin-bottom:10px">
    <label>Kiểu provider: <select id="pv-kind"></select></label>
    <label id="pv-prodlbl"><input type="checkbox" id="pv-prod"> IS_PROD = true</label>
  </div>
  <pre class="hl" id="pv-code" style="border-radius:8px"></pre>
  <div id="pv-res" style="margin-top:10px"></div>
</div>`
    },
    {
      id: 'types', title: 'Các loại provider: useClass, useValue, useFactory, useExisting',
      html: `
<div class="tablewrap"><table>
<tr><th>Provider</th><th>Dùng khi</th><th>Ví dụ</th></tr>
<tr><td><code>useClass</code></td><td>Tạo bằng <code>new</code> một class (có tiêm phụ thuộc)</td><td><code>{ provide: RaceService, useClass: FakeRaceService }</code></td></tr>
<tr><td><code>useValue</code></td><td>Giá trị có sẵn (hằng, cấu hình, object)</td><td><code>{ provide: 'IS_PROD', useValue: true }</code></td></tr>
<tr><td><code>useFactory</code></td><td>Cần logic để tạo; khai báo <code>deps</code></td><td><code>{ provide: X, useFactory: (a) => ..., deps: [A] }</code></td></tr>
<tr><td><code>useExisting</code></td><td>Tạo <b>bí danh</b> cho token khác (cùng instance)</td><td><code>{ provide: Old, useExisting: New }</code></td></tr>
</table></div>

<textarea class="live" data-title="useFactory + deps + useValue (đúng như ví dụ IS_PROD trong sách)">
class Injector {
  constructor(providers = []) { this.providers = new Map(); this.cache = new Map();
    providers.forEach(p => { p = typeof p === 'function' ? { provide: p, useClass: p } : p; this.providers.set(p.provide, p); }); }
  get(token) {
    if (this.cache.has(token)) return this.cache.get(token);
    const p = this.providers.get(token);
    if (!p) throw new Error('No provider for ' + (token.name || String(token)));
    const i = 'useValue' in p ? p.useValue : p.useFactory ? p.useFactory(...(p.deps || []).map(d => this.get(d)))
      : p.useExisting ? this.get(p.useExisting) : new p.useClass(...(p.useClass.deps || []).map(d => this.get(d)));
    this.cache.set(token, i); return i;
  }
}
class ApiService { get() { return ['Paris (từ server)']; } }
class RaceService {
  static deps = [ApiService];
  constructor(api) { this.api = api; }
  list() { return this.api.get('/races'); }
}
class FakeRaceService { list() { return ['London (giả)']; } }

function build(isProd) {
  return new Injector([
    ApiService,
    { provide: 'IS_PROD', useValue: isProd },
    {
      provide: RaceService,
      // thứ tự tham số phải khớp thứ tự trong deps!
      useFactory: (IS_PROD, api) => IS_PROD ? new RaceService(api) : new FakeRaceService(),
      deps: ['IS_PROD', ApiService]
    }
  ]);
}
console.log('dev :', build(false).get(RaceService).list());
console.log('prod:', build(true).get(RaceService).list());
</textarea>
<div class="box warn"><b>Cẩn thận</b><p>Với <code>useFactory</code>, thứ tự trong mảng <code>deps</code> phải trùng thứ tự tham số của hàm factory.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Trong factory bạn có thể gọi <code>inject()</code> luôn, khỏi cần <code>deps</code>. Mẫu “bật/tắt theo môi trường” thường dùng <code>environment</code> hay token cấu hình thay vì hằng <code>IS_PROD</code> trong code.</p></div>`
    },
    {
      id: 'hier', title: 'Injector phân cấp (rất quan trọng)',
      html: `
<p>Angular <b>không có một injector mà nhiều</b>: một injector gốc (root) và mỗi component có injector riêng, <b>kế thừa từ cha</b>. Khi xin một dependency, Angular tìm ở injector hiện tại, không có thì đi lên cha, cứ thế đến root; không thấy thì ném lỗi.</p>
<ul>
<li><code>providedIn: 'root'</code> / <code>providers</code> của module / app config → đăng ký ở <b>root</b>, dùng được mọi nơi.</li>
<li><code>providers</code> trong <code>@Component</code> → đăng ký ở injector của <b>component đó</b> (và các con), tạo instance riêng.</li>
</ul>
<textarea class="code" data-lang="ts" data-title="RacesComponent có provider riêng">
@Component({
  selector: 'ns-races',
  providers: [{ provide: RaceService, useClass: FakeRaceService }],   // chỉ trong component này
  template: \`<strong>Races: {{ list() }}</strong>\`
})
export class RacesComponent {
  constructor(private raceService: RaceService) {}   // nhận FakeRaceService
}
</textarea>

<div class="widget" id="w-hier">
  <h4>🌳 Cây injector</h4>
  <p class="hint">Cây: <b>Root</b> → <b>AppComponent</b> → <b>RacesComponent</b>. Chọn nơi đăng ký RaceService ở từng tầng, rồi để cả hai component cùng xin RaceService. Quan sát <b>ai trả lời</b> và liệu hai nơi có chung instance không.</p>
  <div class="grid2" style="margin-bottom:10px">
    <div>
      <label>Root: <select id="hr-root"></select></label><br>
      <label>AppComponent: <select id="hr-app"></select></label><br>
      <label>RacesComponent: <select id="hr-races"></select></label>
    </div>
    <div><button class="btn" id="hr-go">▶ Cả hai cùng xin RaceService</button></div>
  </div>
  <div id="hr-tree"></div>
  <div id="hr-res" style="margin-top:10px"></div>
</div>

<div class="box warn"><b>Bẫy kinh điển</b><p>Nếu bạn khai báo cùng một service ở <b>cả</b> root và <code>providers</code> của component, sẽ có <b>hai instance riêng</b>. Thử trong widget: root = RaceService, RacesComponent = RaceService → hai instance khác nhau.</p></div>
<div class="box tip"><b>Quy tắc ngón tay cái</b><p>Chỉ một component dùng → cho vào <code>providers</code> của component. Cả app dùng → <code>providedIn: 'root'</code>.</p></div>
<div class="box info"><b>Công cụ điều chỉnh tìm kiếm</b><p><code>@Optional()</code> (không có thì cho null), <code>@Self()</code> (chỉ tìm ở injector hiện tại), <code>@SkipSelf()</code> (bỏ qua hiện tại, tìm từ cha), <code>@Host()</code>. Hiện nay dùng dạng option: <code>inject(X, { optional: true })</code>.</p></div>`
    },
    {
      id: 'notype', title: 'DI không cần kiểu: @Inject và InjectionToken',
      html: `
<p>Muốn tiêm một giá trị đơn giản (chuỗi URL, số, cờ…) thì không có “class” để làm token. Dùng <b><code>InjectionToken</code></b> và <code>@Inject()</code>:</p>
<textarea class="code" data-lang="ts" data-title="tokens.ts">
import { InjectionToken } from '@angular/core';
export const BACKEND_URL = new InjectionToken<string>('API URL');
</textarea>
<textarea class="code" data-lang="ts" data-title="Đăng ký giá trị">
providers: [{ provide: BACKEND_URL, useValue: 'http://localhost:8080' }]

// hoặc đăng ký ngay tại token (tree-shakable)
export const BACKEND_URL = new InjectionToken<string>('API URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8080'
});
</textarea>
<textarea class="code" data-lang="ts" data-title="Dùng">
@Injectable({ providedIn: 'root' })
export class RaceService {
  constructor(@Inject(BACKEND_URL) private url: string) {}
  // hiện đại: private url = inject(BACKEND_URL);
}
</textarea>
<p>Chính Angular dùng cơ chế này: ví dụ token <code>LOCALE_ID</code> quyết định ngôn ngữ định dạng số/ngày (chương 24):</p>
<textarea class="code" data-lang="ts">
providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }]
// {{ 1234.56 | number }}  →  1 234,56
</textarea>
<div class="box info"><b>Nên dùng env cho URL</b><p>Với địa chỉ backend, cách thông dụng hơn là file <code>environment</code> của Angular CLI (chương 26); <code>InjectionToken</code> thích hợp khi cần đổi giá trị trong test hoặc theo từng nhánh cây component.</p></div>`
    }
  ],
  quiz: [
    { q: 'Ưu điểm cốt lõi của DI?', options: ['Code chạy nhanh hơn', 'Dễ test và dễ hoán đổi cài đặt vì thứ cần dùng được đưa từ ngoài vào', 'Không cần class'], answer: 1, why: 'Component chỉ khai báo nhu cầu; framework chọn instance (thật hay giả).' },
    { q: 'Gọi injector.get(RaceService) hai lần, kết quả?', options: ['Hai instance khác nhau', 'Cùng một instance (singleton theo token)', 'Lỗi'], answer: 1, why: 'Injector tạo ở lần đầu cho mỗi token rồi trả lại chính nó.' },
    { q: '<code>{ provide: RaceService, useClass: FakeRaceService }</code> nghĩa là?', options: ['Ai xin RaceService sẽ nhận FakeRaceService', 'Tạo hai service', 'Xoá RaceService'], answer: 0, why: 'Token RaceService được liên kết với class FakeRaceService.' },
    { q: 'Service khai báo ở cả root và providers của một component. Kết quả?', options: ['Một instance dùng chung', 'Hai instance riêng (component dùng bản của nó)', 'Lỗi biên dịch'], answer: 1, why: 'Mỗi injector tạo instance riêng; component tìm thấy provider ở injector của nó trước.' },
    { q: 'Cần tiêm một chuỗi URL, nên dùng?', options: ['Một class bất kỳ', 'InjectionToken + @Inject() (hoặc inject(TOKEN))', 'Biến toàn cục'], answer: 1, why: 'Giá trị không có class làm token nên cần InjectionToken.' },
    { q: 'Provider nào phù hợp khi cần logic để quyết định tạo gì, kèm phụ thuộc?', options: ['useValue', 'useFactory với deps', 'useExisting'], answer: 1, why: 'useFactory chạy hàm tạo; deps cho biết các phụ thuộc truyền vào hàm.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ---- injector thu nhỏ (có cha) ---- */
    class Injector {
      constructor(name, providers = [], parent = null) {
        this.name = name; this.parent = parent; this.providers = new Map(); this.cache = new Map();
        providers.forEach(p => { p = typeof p === 'function' ? { provide: p, useClass: p } : p; this.providers.set(p.provide, p); });
      }
      owner(token) { return this.providers.has(token) ? this : this.parent ? this.parent.owner(token) : null; }
      get(token) {
        const o = this.owner(token);
        if (!o) throw new Error('NullInjectorError: No provider for ' + (token.name || String(token)));
        if (o.cache.has(token)) return o.cache.get(token);
        const p = o.providers.get(token);
        let i;
        if ('useValue' in p) i = p.useValue;
        else if (p.useFactory) i = p.useFactory(...(p.deps || []).map(d => o.get(d)));
        else if (p.useExisting) i = o.get(p.useExisting);
        else i = new p.useClass(...(p.useClass.deps || []).map(d => o.get(d)));
        o.cache.set(token, i); return i;
      }
    }
    let counter = 0;
    class ApiService { get() { return ['Paris (từ API)']; } }
    class RaceService { static deps = [ApiService]; constructor(api) { this.api = api; this.id = ++counter; this.label = 'RaceService'; } list() { return this.api.get('/races'); } }
    class FakeRaceService { constructor() { this.id = ++counter; this.label = 'FakeRaceService'; } list() { return ['London (giả)']; } }

    /* ===== widget: kiểu provider ===== */
    const kinds = [
      { n: 'useClass → FakeRaceService', code: "{ provide: RaceService, useClass: FakeRaceService }", mk: () => [{ provide: RaceService, useClass: FakeRaceService }] },
      { n: 'useValue → object có sẵn', code: "{ provide: RaceService,\n  useValue: { list: () => ['Berlin (useValue)'] } }", mk: () => [{ provide: RaceService, useValue: { label: 'object thuần', list: () => ['Berlin (useValue)'] } }] },
      { n: 'useFactory + deps + IS_PROD', code: "{ provide: 'IS_PROD', useValue: IS_PROD },\n{ provide: RaceService,\n  useFactory: (isProd, api) =>\n    isProd ? new RaceService(api) : new FakeRaceService(),\n  deps: ['IS_PROD', ApiService] }", prod: true,
        mk: prod => [{ provide: 'IS_PROD', useValue: prod }, { provide: RaceService, useFactory: (isProd, api) => isProd ? new RaceService(api) : new FakeRaceService(), deps: ['IS_PROD', ApiService] }] },
      { n: 'useExisting → bí danh', code: "FakeRaceService,\n{ provide: RaceService, useExisting: FakeRaceService }", mk: () => [FakeRaceService, { provide: RaceService, useExisting: FakeRaceService }] },
      { n: 'Mặc định (class chính nó)', code: "RaceService   // = { provide: RaceService, useClass: RaceService }", mk: () => [RaceService] }
    ];
    const ksel = $('#pv-kind');
    ksel.innerHTML = kinds.map((k, i) => `<option value="${i}">${k.n}</option>`).join('');
    function drawProv() {
      const k = kinds[+ksel.value]; counter = 0;
      $('#pv-prodlbl').style.display = k.prod ? '' : 'none';
      const prod = $('#pv-prod').checked;
      $('#pv-code').textContent = 'providers: [\n  ApiService,\n' + (k.prod ? `  // IS_PROD = ${prod}\n` : '') + k.code.split('\n').map(l => '  ' + l).join('\n') + '\n]';
      try {
        const inj = new Injector('root', [ApiService, ...k.mk(prod)]);
        const a = inj.get(RaceService), b = inj.get(RaceService);
        $('#pv-res').innerHTML = `<b>get(RaceService)</b> → <span class="pill fulfilled">${esc(a.label || a.constructor.name)}</span> &nbsp; <code>list()</code> = <span class="mono">${esc(JSON.stringify(a.list()))}</span><br>Hai lần get cùng instance? <b>${a === b}</b>`;
      } catch (e) { $('#pv-res').innerHTML = `<span class="pill rejected">${esc(e.message)}</span>`; }
    }
    ksel.onchange = $('#pv-prod').onchange = drawProv; drawProv();

    /* ===== widget: cây injector ===== */
    const opt = [['none', '— không đăng ký —'], ['real', 'RaceService (thật)'], ['fake', 'FakeRaceService']];
    ['root', 'app', 'races'].forEach(id => { $('#hr-' + id).innerHTML = opt.map(o => `<option value="${o[0]}">${o[1]}</option>`).join(''); });
    $('#hr-root').value = 'real';
    const prov = v => v === 'real' ? [{ provide: RaceService, useClass: RaceService }] : v === 'fake' ? [{ provide: RaceService, useClass: FakeRaceService }] : [];
    function runHier() {
      counter = 0;
      const v = { root: $('#hr-root').value, app: $('#hr-app').value, races: $('#hr-races').value };
      const rootI = new Injector('Root', [ApiService, ...prov(v.root)]);
      const appI = new Injector('AppComponent', prov(v.app), rootI);
      const racesI = new Injector('RacesComponent', prov(v.races), appI);
      const badge = (x) => x === 'none' ? '' : `<span class="pill ${x === 'fake' ? 'rejected' : 'fulfilled'}" style="font-size:11px">${x === 'fake' ? 'Fake' : 'Real'}RaceService</span>`;
      const ask = inj => { try { const s = inj.get(RaceService), o = inj.owner(RaceService); return { s, o }; } catch (e) { return { err: e.message }; } };
      const a = ask(appI), r = ask(racesI);
      const line = (name, lvl, res, indent) =>
        `<div style="margin-left:${indent}px;padding:6px 10px;border-left:3px solid ${res && res.o && res.o.name === name ? 'var(--accent)' : 'var(--border)'};margin-bottom:4px">
        <b>${name}</b> ${badge(lvl)} ${res ? (res.err ? `<span class="pill rejected">✖ NullInjectorError</span>` : `<span class="dim">xin → nhận <b>${res.s.label}#${res.s.id}</b> (từ injector “${res.o.name}”)</span>`) : ''}</div>`;
      $('#hr-tree').innerHTML = line('Root', v.root, null, 0) + line('AppComponent', v.app, a, 20) + line('RacesComponent', v.races, r, 40);
      let msg;
      if (a.err || r.err) msg = `<span class="pill rejected">Lỗi</span> Không injector nào trên đường lên có provider cho RaceService.`;
      else msg = (a.s === r.s)
        ? `<span class="pill fulfilled">Cùng 1 instance</span> ${a.s.label}#${a.s.id} được chia sẻ — thay đổi trong service thấy được ở cả hai component.`
        : `<span class="pill pending">Hai instance khác nhau</span> ${a.s.label}#${a.s.id} và ${r.s.label}#${r.s.id}. State bên trong KHÔNG được chia sẻ.`;
      $('#hr-res').innerHTML = msg;
    }
    $('#hr-go').onclick = runHier;
    root.querySelectorAll('#w-hier select').forEach(s => s.onchange = runHier);
    runHier();
  }
});
