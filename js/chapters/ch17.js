registerChapter(17, {
  time: '55 phút',
  lead: 'Gọi API là công việc hằng ngày của front-end. Angular có <code>HttpClient</code>: trả về <b>Observable</b>, tự parse JSON, có <b>interceptor</b> và dễ <b>test</b>. Trên trang này có một <b>máy chủ giả</b> và một bản <code>HttpClient</code> thu nhỏ (cùng API) để bạn gửi request thật, xem “network panel”, thử lỗi, retry, huỷ và interceptor.',
  sections: [
    {
      id: 'why', title: 'Vì sao dùng HttpClient?',
      html: `
<p>Bạn hoàn toàn có thể dùng <code>fetch</code> hay thư viện khác (nhờ Zone.js, Angular vẫn biết khi dữ liệu về để cập nhật giao diện). Nhưng <code>HttpClient</code> có những ưu điểm đáng kể:</p>
<ul>
<li>Trả về <b>Observable</b> → huỷ được (<code>unsubscribe</code>), <code>retry</code>, ghép với operator RxJS.</li>
<li>Tự <b>parse JSON</b> phản hồi và <b>serialize</b> body gửi đi.</li>
<li><b>Interceptor</b> để gắn header/bắt lỗi cho mọi request.</li>
<li><b>Dễ test</b>: giả backend và trả phản hồi tuỳ ý (phần cuối chương).</li>
</ul>
<textarea class="code" data-lang="ts" data-title="Cài đặt: sách (NgModule) và hiện nay (provideHttpClient)">
// Sách (Angular 11)
@NgModule({ imports: [BrowserModule, HttpClientModule], declarations: [AppComponent], bootstrap: [AppComponent] })
export class AppModule {}

// Hiện nay: app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))]
};

// Dùng ở bất cứ đâu
@Injectable({ providedIn: 'root' })
export class RaceService {
  private http = inject(HttpClient);          // hoặc constructor(private http: HttpClient) {}
}
</textarea>
<div class="box info"><b>Cold observable</b><p>Gọi <code>http.get(...)</code> <b>chưa gửi gì</b>. Request chỉ đi khi bạn <code>subscribe</code> (hoặc dùng pipe <code>async</code>) — và mỗi lần subscribe là một request mới (chương 22). Bạn sẽ tự kiểm chứng trong phòng thí nghiệm dưới đây.</p></div>`
    },
    {
      id: 'lab', title: 'Phòng thí nghiệm HTTP (máy chủ giả + network panel)',
      html: `
<p>Máy chủ giả có API REST nhỏ: <code>/api/races</code> (GET, POST, PUT, DELETE, có <code>sort</code> và <code>page</code>), <code>/api/secret</code> (cần token), <code>/api/flaky</code> (lỗi 500 hai lần đầu rồi mới thành công), <code>/api/slow</code> (3 giây). Còn có một yêu cầu tới <b>mạng thật</b> (jsonplaceholder).</p>

<div class="widget" id="w-http">
  <h4>🌐 Gửi request</h4>
  <div class="row" style="margin-bottom:8px">
    <label>Request: <select id="ht-req" style="max-width:360px"></select></label>
    <label>retry(<select id="ht-retry"><option>0</option><option>1</option><option selected>2</option><option>3</option></select>)</label>
  </div>
  <div id="ht-bodyrow" style="margin-bottom:8px"><label>Body (JSON): <input type="text" id="ht-body" class="mono" style="width:70%"></label></div>
  <div class="row" style="margin-bottom:8px"><b>Interceptor:</b>
    <label><input type="checkbox" id="ht-auth"> AuthInterceptor (gắn <code>Authorization: Bearer …</code>)</label>
    <label><input type="checkbox" id="ht-err"> ErrorInterceptor (401 → /login)</label>
  </div>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="ht-send">▶ subscribe()</button>
    <button class="btn alt" id="ht-cold">Tạo observable nhưng KHÔNG subscribe</button>
    <button class="btn alt" id="ht-cancel">✖ unsubscribe() (huỷ)</button>
    <button class="btn alt" id="ht-reset">↺ Reset server &amp; log</button>
  </div>
  <b>Mã tương đương</b>
  <pre class="hl" id="ht-code" style="border-radius:8px;margin:6px 0 10px"></pre>
  <div class="grid2">
    <div><b>Kết quả (<code>next</code> / <code>error</code>)</b><pre class="hl" id="ht-res" style="border-radius:8px;margin-top:6px;min-height:90px;white-space:pre-wrap"></pre></div>
    <div><b>Đường đi qua interceptor</b><div class="output" id="ht-trace" style="border-radius:8px;min-height:90px;margin-top:6px"></div></div>
  </div>
  <b style="display:block;margin-top:10px">Network panel</b>
  <div class="tablewrap"><table id="ht-net"></table></div>
</div>
<div class="box tip"><b>Thử theo thứ tự</b><ol>
<li>GET <code>/api/races</code> với <b>subscribe</b>, rồi với nút <b>không subscribe</b>: chỉ lần đầu có dòng trong network panel.</li>
<li>Chọn <b>params</b>: URL tự thêm <code>?sort=ascending&amp;page=1</code>, và kết quả chỉ 2 cuộc đua.</li>
<li>Chọn <b>observe: 'response'</b>: bạn nhận <code>HttpResponse</code> (status, headers, body) thay vì chỉ body.</li>
<li><code>/api/races/99</code> → <b>404</b>: observable <b>phát lỗi</b> <code>HttpErrorResponse</code> (mọi status ngoài 2xx/3xx đều là lỗi).</li>
<li><code>/api/secret</code>: 401 → bật <b>AuthInterceptor</b>, nhưng nó chỉ gắn token khi bạn đã “đăng nhập” (xem mã bên dưới) → bấm lại.</li>
<li><code>/api/flaky</code> với <code>retry(0)</code> thất bại; <code>retry(2)</code> thành công ở lần thứ 3 (3 dòng trong network).</li>
<li><code>/api/slow</code> rồi bấm <b>unsubscribe</b> trong 3 giây: dòng chuyển sang <b>cancelled</b> — request thật sự bị huỷ.</li>
<li>Request tới <b>mạng thật</b> (nếu có Internet): dùng <code>fetch</code> + <code>AbortController</code> nên cũng huỷ được.</li></ol></div>`
    },
    {
      id: 'basics', title: 'GET, POST, PUT, DELETE và kiểu của phản hồi',
      html: `
<p><code>HttpClient</code> có <code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code>, <code>patch</code>, <code>head</code>, <code>jsonp</code>… Tất cả trả về <b>Observable</b> (khác <code>$http</code> của AngularJS dùng Promise).</p>
<textarea class="live" data-time data-title="Lấy và gửi dữ liệu với HttpClient thu nhỏ">
const { createClient, FakeBackend } = MiniHttp;       // dự án thật: import { HttpClient } from '@angular/common/http'
const http = createClient({ backend: new FakeBackend({ latency: 150 }) });

// GET: body được parse JSON tự động
http.get('/api/races').subscribe(races => console.log('GET  →', races.map(r => r.name)));

// POST: object được tự serialize; phản hồi là cuộc đua vừa tạo
setTimeout(() => http.post('/api/races', { name: 'Rome' }).subscribe(r => console.log('POST →', r)), 400);

// Lỗi: mọi status ngoài 2xx/3xx → error (HttpErrorResponse)
setTimeout(() => http.get('/api/races/99').subscribe({
  next: () => {},
  error: e => console.log('ERROR →', e.status, e.statusText, '|', e.message)
}), 800);
</textarea>
<div class="box warn"><b>Kiểu generic chỉ là lời hứa</b><p><code>http.get&lt;Array&lt;RaceModel&gt;&gt;(url)</code> không kiểm tra JSON server trả về thật sự khớp <code>RaceModel</code> — nó chỉ giúp TypeScript. Bạn có trách nhiệm giữ interface đồng bộ với API.</p></div>
<textarea class="code" data-lang="ts" data-title="Angular thật">
http.get<Array<RaceModel>>(\`\${baseUrl}/api/races\`).subscribe(races => console.log(races));

// toàn bộ phản hồi (status, headers…)
http.get<Array<RaceModel>>(url, { observe: 'response' })
  .subscribe((res: HttpResponse<Array<RaceModel>>) => console.log(res.status, res.headers.keys()));

http.post<RaceModel>(\`\${baseUrl}/api/races\`, newRace);     // body tự thành JSON, phản hồi là RaceModel
</textarea>`
    },
    {
      id: 'service', title: 'Đặt trong service và dùng RxJS (retry, catchError)',
      html: `
<p>Đặt các lời gọi HTTP trong một <b>service</b> (<code>RaceService</code>); component chỉ <code>subscribe</code> mà không biết chuyện gì bên dưới. Sức mạnh RxJS: <code>retry</code>, <code>map</code>, <code>catchError</code>, <code>switchMap</code>…</p>
<textarea class="live" data-time data-title="Service + retry + catchError (endpoint /api/flaky lỗi 2 lần đầu)">
const { createClient, FakeBackend } = MiniHttp;
const { retry, map, catchError, of, tap } = Rx;

class RaceService {
  constructor(http) { this.http = http; }
  status() { return this.http.get('/api/flaky').pipe(map(r => r.message)); }
}
const http = createClient({ backend: new FakeBackend({ latency: 100 }), interceptors: [{
  intercept(req, next) { console.log('  →', req.method, req.urlWithParams); return next.handle(req); }       // nhìn thấy mỗi lần thử
}] });
const service = new RaceService(http);

console.log('— không retry:');
service.status().pipe(catchError(e => of('❌ thất bại: ' + e.status))).subscribe(console.log);

setTimeout(() => {
  console.log('— retry(3):');
  service.status().pipe(retry(3), catchError(e => of('❌ thất bại: ' + e.status))).subscribe(v => console.log('✓', v));
}, 700);
</textarea>
<div class="box info"><b>Cẩn thận với retry</b><p>Chỉ nên retry các request <b>idempotent</b> (GET). Retry <code>POST</code> có thể tạo bản ghi hai lần. Nên thêm thời gian chờ tăng dần (<code>retry({ count, delay })</code> ở RxJS 7.3+).</p></div>`
    },
    {
      id: 'options', title: 'Tuỳ chọn: params, headers, và JSONP',
      html: `
<p>Mỗi method nhận một object tuỳ chọn. Hai cái hay dùng nhất:</p>
<textarea class="code" data-lang="ts">
// params → query string:  GET /api/races?sort=ascending&page=1
http.get<Array<RaceModel>>(\`\${baseUrl}/api/races\`, { params: { sort: 'ascending', page: '1' } });

// headers → ví dụ xác thực JWT
http.get<Array<RaceModel>>(\`\${baseUrl}/api/races\`, { headers: { Authorization: \`Bearer \${token}\` } });
</textarea>
<p>Dùng <code>params</code> thay vì tự ghép chuỗi: Angular lo việc mã hoá ký tự đặc biệt (<code>encodeURIComponent</code>). Thử trong lab phía trên.</p>
<h3>JSONP (lịch sử)</h3>
<p>Một số web service cũ không bật CORS nên trả JSON bọc trong một hàm callback; phản hồi là <b>script</b> (không bị Same Origin Policy chặn). <code>http.jsonp(url, 'callback')</code> làm việc đó. Hiện nay gần như bạn không cần nữa vì <b>CORS</b> đã là chuẩn — server chỉ cần gửi header <code>Access-Control-Allow-Origin</code>. JSONP còn có rủi ro bảo mật (chạy script từ bên thứ ba).</p>
<div class="box modern"><b>🆕 Hiện nay</b><p><code>HttpClientJsonpModule</code> phải import riêng nếu cần JSONP. Trong <code>provideHttpClient()</code> bạn dùng <code>withJsonpSupport()</code>. Với tải xuống/lên có thể theo dõi tiến trình: <code>{ reportProgress: true, observe: 'events' }</code>. Và có <code>httpResource()</code> (thử nghiệm) tích hợp với signals.</p></div>`
    },
    {
      id: 'interceptors', title: 'Interceptor: chặn mọi request/response',
      html: `
<p>Interceptor là “middleware” của HTTP: mỗi request đi qua chuỗi interceptor trước khi ra mạng, và phản hồi đi ngược lại. Dùng để gắn token, log, xử lý lỗi chung… Request là <b>bất biến</b> nên phải <code>clone()</code> để sửa.</p>
<div class="flow">
  <div class="node">Component<small>http.get()</small></div><span class="arr">→ req</span>
  <div class="node hot">AuthInterceptor<small>clone + header</small></div><span class="arr">→</span>
  <div class="node hot">ErrorInterceptor<small>catchError</small></div><span class="arr">→</span>
  <div class="node">Backend</div>
</div>
<textarea class="live" data-time data-title="Interceptor thu nhỏ: cùng hình dạng intercept(req, next)">
const { createClient, FakeBackend } = MiniHttp;
const { catchError, throwError } = Rx;

const authInterceptor = {
  intercept(req, next) {
    if (req.url.includes('/api/secret')) {
      const clone = req.clone({ setHeaders: { Authorization: 'Bearer ninja-token' } });   // phải clone
      console.log('  Auth: đã gắn token');
      return next.handle(clone);
    }
    return next.handle(req);                                                              // request khác: đi thẳng
  }
};
const errorInterceptor = {
  intercept(req, next) {
    return next.handle(req).pipe(catchError(err => {
      if (err.status === 401) console.log('  Error: 401 → điều hướng tới /login');
      else console.log('  Error: thông báo cho người dùng:', err.status);
      return throwError(err);                                                             // vẫn ném lỗi tiếp cho nơi gọi
    }));
  }
};

const http = createClient({ backend: new FakeBackend({ latency: 100 }), interceptors: [authInterceptor, errorInterceptor] });
http.get('/api/secret').subscribe(r => console.log('secret:', r.secret));
setTimeout(() => http.get('/api/races/99').subscribe({ error: e => console.log('lỗi tới component:', e.status) }), 400);
</textarea>
<textarea class="code" data-lang="ts" data-title="Angular thật (sách: class + HTTP_INTERCEPTORS)">
@Injectable()
export class GithubAPIInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('api.github.com')) {
      return next.handle(req.clone({ setHeaders: { Authorization: \`token \${OAUTH_TOKEN}\` } }));
    }
    return next.handle(req);
  }
}
providers: [{ provide: HTTP_INTERCEPTORS, useClass: GithubAPIInterceptor, multi: true }]   // multi: true!
</textarea>
<div class="box modern"><b>🆕 Hiện nay: interceptor dạng hàm</b><textarea class="code" data-lang="ts">
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }) : req);
};
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]));
</textarea><p>Thứ tự trong mảng chính là thứ tự request đi qua (phản hồi đi ngược lại).</p></div>`
    },
    {
      id: 'tests', title: 'Test: HttpTestingController',
      html: `
<p>Unit test không được gọi server thật. Thay <code>HttpClient</code> bằng bản giả (<code>HttpClientTestingModule</code> / <code>provideHttpClientTesting()</code>) rồi dùng <b><code>HttpTestingController</code></b>: <code>expectOne(url)</code> kiểm tra request đúng, <code>flush(dữ liệu)</code> trả lời, <code>verify()</code> đảm bảo không còn request nào bị bỏ sót. Chạy thử (Jasmine thu nhỏ của chương 16):</p>
<textarea class="live" data-test data-title="RaceService + HttpTestingController (bản thu nhỏ)">
const { testing, HttpClient, HttpTestingController } = MiniHttp;

class RaceService {
  static providedIn = 'root';
  static deps = [HttpClient];
  constructor(http) { this.http = http; }
  list() { return this.http.get('/api/races'); }
  create(race) { return this.http.post('/api/races', race); }
}

describe('RaceService', () => {
  let raceService, http;
  beforeEach(() => {
    const t = testing();
    TestBed.configureTestingModule({ providers: [{ provide: HttpClient, useValue: t.client }, { provide: HttpTestingController, useValue: t.controller }] });
    raceService = TestBed.inject(RaceService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());                     // không còn request nào treo

  it('should return an Observable of 2 races', () => {
    const hardcodedRaces = [{ name: 'London' }, { name: 'Lyon' }];
    let actualRaces = [];
    raceService.list().subscribe(races => (actualRaces = races));

    http.expectOne('/api/races').flush(hardcodedRaces);    // kiểm tra URL + trả lời giả

    expect(actualRaces.length).toBe(2);
  });

  it('should POST the race and surface a 400 error', () => {
    let error;
    raceService.create({}).subscribe({ error: e => (error = e) });

    const req = http.expectOne('/api/races');
    expect(req.request.method).toBe('POST');
    req.flush({ error: 'name is required' }, { status: 400 });

    expect(error.status).toBe(400);
  });
});
</textarea>
<div class="box tip"><b>Thử làm hỏng</b><p>Đổi URL trong <code>expectOne('/api/race')</code> để xem thông báo “Expected one matching request…”. Bỏ dòng <code>flush</code> để <code>verify()</code> báo “Expected no open requests”.</p></div>
<textarea class="code" data-lang="ts" data-title="Angular thật">
TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });   // sách: imports: [HttpClientTestingModule]
const http = TestBed.inject(HttpTestingController);
afterEach(() => http.verify());
http.expectOne('/api/races').flush(hardcodedRaces);
</textarea>`
    }
  ],
  quiz: [
    { q: 'http.get() trả về?', options: ['Promise', 'Observable (cold: chỉ gửi request khi subscribe)', 'Dữ liệu ngay lập tức'], answer: 1, why: 'Observable cold; không subscribe thì không có request.' },
    { q: 'Phản hồi 404 làm gì?', options: ['next với status 404', 'Observable phát error (HttpErrorResponse)', 'Bị bỏ qua'], answer: 1, why: 'Mọi status ngoài 2xx/3xx là lỗi.' },
    { q: 'Cách đúng để thêm query string ?sort=asc&page=1?', options: ['Tự ghép chuỗi URL', "Tuỳ chọn { params: { sort: 'asc', page: '1' } }", 'Dùng headers'], answer: 1, why: 'params lo việc mã hoá ký tự.' },
    { q: 'Vì sao phải req.clone() trong interceptor?', options: ['Để chạy nhanh hơn', 'Request là bất biến, không thể sửa trực tiếp', 'Vì cú pháp bắt buộc'], answer: 1, why: 'Immutable: tạo bản sao với header/body mới.' },
    { q: 'Hủy một request HTTP đang chạy bằng?', options: ['Không thể', 'subscription.unsubscribe()', 'try/catch'], answer: 1, why: 'Hủy đăng ký sẽ hủy XHR/fetch bên dưới.' },
    { q: 'Để test service gọi HTTP, bạn?', options: ['Gọi server thật', 'Dùng HttpTestingController để expectOne(url) rồi flush(dữ liệu giả), và verify()', 'Bỏ qua test'], answer: 1, why: 'Unit test không gọi mạng thật.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const R = Rx, H = MiniHttp, alive = () => root.isConnected;
    const backend = new H.FakeBackend({ latency: 500 });
    const trace = [], net = [];
    const say = t => { trace.push(t); $('#ht-trace').innerHTML = trace.map(x => `<div>${x}</div>`).join(''); };
    const drawNet = () => { $('#ht-net').innerHTML = '<tr><th>#</th><th>Method</th><th>URL</th><th>Trạng thái</th><th>Thời gian</th></tr>' + (net.slice(-12).map(e => `<tr><td>${e.n}</td><td>${e.method}</td><td class="mono" style="font-size:12px">${esc(e.url)}</td><td>${e.state === 'pending' ? '<span class="pill pending">pending…</span>' : e.state === 'cancelled' ? '<span class="pill rejected">cancelled</span>' : `<span class="pill ${e.status >= 200 && e.status < 400 ? 'fulfilled' : 'rejected'}">${e.status || 'ERR'}</span>`}</td><td>${e.ms != null ? e.ms + ' ms' : ''}</td></tr>`).join('') || '<tr><td colspan="5" class="hint">(chưa có request)</td></tr>'); };
    let netN = 0, loggedIn = true;

    const logging = { intercept(req, next) {
      return new R.Observable(o => {
        const e = { n: ++netN, method: req.method, url: req.urlWithParams, state: 'pending', t0: performance.now() }; net.push(e); drawNet();
        const s = next.handle(req).subscribe({
          next: r => { e.status = r.status; o.next(r); },
          error: err => { e.status = err.status; e.state = 'error'; e.ms = Math.round(performance.now() - e.t0); drawNet(); o.error(err); },
          complete: () => { e.state = 'done'; e.ms = Math.round(performance.now() - e.t0); drawNet(); o.complete(); }
        });
        return () => { if (e.state === 'pending') { e.state = 'cancelled'; e.ms = Math.round(performance.now() - e.t0); drawNet(); } s.unsubscribe(); };
      });
    } };
    const auth = { intercept(req, next) {
      if (!$('#ht-auth').checked) return next.handle(req);
      if (req.url.includes('/api/secret') && loggedIn) { say('→ AuthInterceptor: clone(setHeaders: Authorization)'); return next.handle(req.clone({ setHeaders: { Authorization: 'Bearer ninja-token' } })); }
      say('→ AuthInterceptor: không gắn token (URL không cần)'); return next.handle(req);
    } };
    const errI = { intercept(req, next) {
      if (!$('#ht-err').checked) return next.handle(req);
      return next.handle(req).pipe(R.catchError(err => { say(err.status === 401 ? '← ErrorInterceptor: 401 → router.navigateByUrl(\'/login\')' : `← ErrorInterceptor: lỗi ${err.status} → thông báo người dùng`); return R.throwError(err); }));
    } };
    const real = H.fetchBackend;
    const http = H.createClient({ backend: req => (/^https?:/.test(req.url) ? real(req) : backend.handle(req)), interceptors: [logging, auth, errI] });

    const REQS = [
      { l: 'GET /api/races', m: 'get', u: '/api/races' },
      { l: 'GET /api/races com params (sort, page)', m: 'get', u: '/api/races', o: { params: { sort: 'ascending', page: '1' } } },
      { l: "GET /api/races  { observe: 'response' }", m: 'get', u: '/api/races', o: { observe: 'response' } },
      { l: 'GET /api/races/2', m: 'get', u: '/api/races/2' },
      { l: 'GET /api/races/99  → 404', m: 'get', u: '/api/races/99' },
      { l: 'POST /api/races  (tạo)', m: 'post', u: '/api/races', body: '{"name":"Rome","ponies":4}' },
      { l: 'POST /api/races  (thiếu name → 400)', m: 'post', u: '/api/races', body: '{}' },
      { l: 'PUT /api/races/1', m: 'put', u: '/api/races/1', body: '{"name":"London (đã sửa)"}' },
      { l: 'DELETE /api/races/1', m: 'delete', u: '/api/races/1' },
      { l: 'GET /api/secret  (cần token)', m: 'get', u: '/api/secret' },
      { l: 'GET /api/flaky  (500 hai lần đầu)', m: 'get', u: '/api/flaky' },
      { l: 'GET /api/slow  (3 giây — thử huỷ)', m: 'get', u: '/api/slow' },
      { l: '🌍 GET jsonplaceholder (mạng thật)', m: 'get', u: 'https://jsonplaceholder.typicode.com/posts', o: { params: { _limit: '2' } } }
    ];
    $('#ht-req').innerHTML = REQS.map((r, i) => `<option value="${i}">${r.l.replace(' com ', ' với ')}</option>`).join('');
    const cur = () => REQS[+$('#ht-req').value];
    const hasBody = r => ['post', 'put'].includes(r.m);
    function code() {
      const r = cur(), n = +$('#ht-retry').value;
      const opts = r.o ? ', ' + JSON.stringify(r.o).replace(/"(\w+)":/g, '$1: ').replace(/"/g, "'") : '';
      const call = hasBody(r) ? `http.${r.m}('${r.u}', ${$('#ht-body').value || '{}'}${opts})` : `http.${r.m}('${r.u}'${opts})`;
      const pre = r.u.includes('flaky') && n ? `\n  .pipe(retry(${n}))` : '';
      $('#ht-code').textContent = `${call}${pre}\n  .subscribe({ next: v => …, error: (e: HttpErrorResponse) => … });` + (r.u.includes('secret') ? `\n// interceptor ${$('#ht-auth').checked ? 'bật' : 'tắt'}; người dùng ${loggedIn ? 'ĐÃ' : 'CHƯA'} đăng nhập` : '');
    }
    $('#ht-req').onchange = () => { const r = cur(); $('#ht-bodyrow').style.display = hasBody(r) ? '' : 'none'; $('#ht-body').value = r.body || ''; code(); };
    $('#ht-retry').onchange = $('#ht-auth').onchange = $('#ht-body').oninput = code;
    $('#ht-req').onchange();

    let sub = null;
    const build = () => {
      const r = cur(); let body = null;
      if (hasBody(r)) { try { body = JSON.parse($('#ht-body').value || '{}'); } catch (e) { throw new Error('Body không phải JSON hợp lệ'); } }
      let obs = hasBody(r) ? http[r.m](r.u, body, r.o) : http[r.m](r.u, r.o);
      if (r.u.includes('flaky') && +$('#ht-retry').value) obs = obs.pipe(R.retry(+$('#ht-retry').value));
      return obs;
    };
    $('#ht-send').onclick = () => {
      trace.length = 0; $('#ht-trace').innerHTML = ''; $('#ht-res').textContent = '… đang chờ';
      let obs; try { obs = build(); } catch (e) { $('#ht-res').textContent = e.message; return; }
      sub && sub.unsubscribe();
      sub = obs.subscribe({
        next: v => { if (alive()) $('#ht-res').textContent = '✓ next:\n' + JSON.stringify(v, (k, x) => (x && x.headers && x.headers.map ? { status: x.status, statusText: x.statusText, headers: x.headers.keys(), body: x.body } : x), 2); },
        error: e => { if (alive()) $('#ht-res').textContent = `✖ error (HttpErrorResponse):\n  status: ${e.status}\n  statusText: ${e.statusText}\n  message: ${e.message}\n  error: ${JSON.stringify(e.error && e.error.message ? e.error.message : e.error)}`; },
        complete: () => {}
      });
    };
    $('#ht-cold').onclick = () => { try { build(); $('#ht-res').textContent = 'Đã tạo observable (đã gọi http.' + cur().m + '(...)) nhưng CHƯA subscribe.\n→ Không có request nào trong network panel.'; } catch (e) { $('#ht-res').textContent = e.message; } };
    $('#ht-cancel').onclick = () => { if (sub) { sub.unsubscribe(); $('#ht-res').textContent = 'unsubscribe() → request bị huỷ (xem cột “cancelled”).'; } };
    $('#ht-reset').onclick = () => { sub && sub.unsubscribe(); backend.reset(); net.length = 0; netN = 0; trace.length = 0; $('#ht-trace').innerHTML = ''; $('#ht-res').textContent = ''; drawNet(); };
    drawNet();
  }
});
