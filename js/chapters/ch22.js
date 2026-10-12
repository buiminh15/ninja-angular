registerChapter(22, {
  time: '60 phút',
  lead: 'Quay lại RxJS với những thứ bạn gặp mỗi ngày trong app thật: observable <b>cold</b> và <b>hot</b>, tránh rò rỉ subscription, cái bẫy của pipe <code>async</code> dùng hai lần, chọn đúng <b>operator làm phẳng</b> (<code>switchMap</code>, <code>concatMap</code>…), và tự tạo Observable. Chạy trên <b>mini-rx</b> (xem chương 13).',
  sections: [
    {
      id: 'hotcold', title: 'Cold và Hot observable',
      html: `
<p><b>Cold</b> = chỉ phát khi có người subscribe, và <b>mỗi subscriber được một lần chạy riêng</b> (như nhấn Play một video YouTube). <code>HttpClient.get()</code> là cold: không subscribe thì không có request.</p>
<p><b>Hot</b> = phát ngay từ lúc tạo, ai đến sau chỉ nhận phần <b>từ lúc mình đến</b> (như truyền hình trực tiếp). <code>FormControl.valueChanges</code>, sự kiện click, <code>Subject</code> là hot.</p>

<div class="widget" id="w-hc">
  <h4>📺 YouTube vs truyền hình</h4>
  <p class="hint">Cả hai nguồn phát 0, 1, 2, … mỗi 0,7 giây. Đăng ký “sau” vài giây để thấy khác biệt.</p>
  <div class="grid2">
    <div>
      <b>❄ Cold</b> <code>interval(700)</code> (mỗi subscribe chạy lại)
      <div class="row" style="margin:8px 0"><button class="btn alt" data-c="cold" data-n="1">Subscribe 1</button><button class="btn alt" data-c="cold" data-n="2">Subscribe 2</button></div>
      <div id="hc-cold"></div>
    </div>
    <div>
      <b>🔥 Hot</b> <code>Subject</code> được một interval chung đẩy vào
      <div class="row" style="margin:8px 0"><button class="btn alt" data-c="hot" data-n="1">Subscribe 1</button><button class="btn alt" data-c="hot" data-n="2">Subscribe 2</button>
        <span class="pill pending">live: <b id="hc-tick">0</b></span></div>
      <div id="hc-hot"></div>
    </div>
  </div>
  <div class="row" style="margin-top:8px"><button class="btn alt" id="hc-reset">↺ Làm lại</button></div>
</div>

<textarea class="live" data-time data-title="Cold chạy lại cho từng subscriber; hot thì dùng chung">
const { Observable, Subject, interval, take } = Rx;

let producers = 0;
const cold$ = new Observable(o => {                 // mỗi subscribe → chạy hàm này một lần
  const id = ++producers; let i = 0;
  const t = setInterval(() => o.next('cold#' + id + ' → ' + i++), 250);
  return () => clearInterval(t);
});
const a = cold$.subscribe(v => console.log('A', v));
setTimeout(() => { const b = cold$.subscribe(v => console.log('   B', v)); setTimeout(() => b.unsubscribe(), 500); }, 500);
setTimeout(() => a.unsubscribe(), 900);
setTimeout(() => console.log('số lần producer chạy:', producers, '(mỗi subscriber một lần)'), 1000);
</textarea>
<div class="box tip"><b>Biến cold thành “dùng chung”</b><p>Operator <code>share()</code> / <code>shareReplay()</code> làm nhiều subscriber dùng chung một lần chạy (dùng ở phần dưới để tránh gọi HTTP hai lần).</p></div>`
    },
    {
      id: 'unsub', title: 'subscribe, lỗi, hoàn thành và unsubscribe',
      html: `
<p><code>subscribe</code> nhận tối đa ba hàm: <code>next</code>, <code>error</code>, <code>complete</code>. Hai điều cần nhớ:</p>
<ul>
<li><b>Lỗi là sự kiện kết thúc</b>: sau <code>error</code>, stream chết, không phát gì nữa. Muốn stream sống tiếp, phải bắt lỗi (<code>catchError</code>) <b>trước khi nó chạm vào stream chính</b>.</li>
<li><b>Phải unsubscribe</b> các stream không tự kết thúc khi component bị huỷ, nếu không <code>next</code> vẫn chạy mãi → rò rỉ bộ nhớ.</li>
</ul>
<textarea class="live" data-title="Lỗi giết stream — bắt lỗi ở vòng trong thì stream chính sống tiếp">
const { Subject, switchMap, of, throwError, catchError } = Rx;

const call = q => q === 'bad' ? throwError(new Error('HTTP 500')) : of('kết quả cho ' + q);

// 1) Không bắt lỗi ở trong: lỗi "giết" cả stream
const s1 = new Subject();
s1.pipe(switchMap(call)).subscribe({ next: v => console.log('[1]', v), error: e => console.log('[1] 💥 stream chết:', e.message) });
s1.next('a'); s1.next('bad'); s1.next('c');             // 'c' không bao giờ được xử lý
console.log('--');

// 2) catchError nằm BÊN TRONG switchMap: chỉ cuộc gọi hỏng bị thay thế
const s2 = new Subject();
s2.pipe(switchMap(q => call(q).pipe(catchError(() => of('(lỗi, trả về rỗng)'))))).subscribe(v => console.log('[2]', v));
s2.next('a'); s2.next('bad'); s2.next('c');             // 'c' vẫn chạy
</textarea>
<h3>Quy tắc unsubscribe</h3>
<div class="tablewrap"><table>
<tr><th>Nguồn</th><th>Có cần unsubscribe?</th></tr>
<tr><td>HTTP (phát 1 giá trị rồi complete)</td><td>Không</td></tr>
<tr><td>Observable của Router (<code>params</code>…)</td><td>Không, router tự dọn</td></tr>
<tr><td><code>interval</code>, WebSocket, Subject, <code>valueChanges</code>, sự kiện DOM…</td><td><b>Có</b></td></tr>
<tr><td>Dùng pipe <code>async</code></td><td>Không, pipe tự huỷ khi component bị huỷ</td></tr>
</table></div>
<textarea class="code" data-lang="ts" data-title="Cách thủ công (sách)">
export class RaceComponent implements OnInit, OnDestroy {
  positionsSubscription?: Subscription;

  ngOnInit() { this.positionsSubscription = this.raceService.live(id).subscribe(p => (this.positions = p)); }
  ngOnDestroy() { this.positionsSubscription?.unsubscribe(); }     // kiểm tra tồn tại trước khi gọi
}
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
// Tự huỷ khi component bị huỷ, không cần ngOnDestroy
this.raceService.live(id).pipe(takeUntilDestroyed()).subscribe(p => (this.positions = p));

// Hoặc chuyển thành signal (tự subscribe/unsubscribe)
positions = toSignal(this.raceService.live(id), { initialValue: [] });
</textarea></div>`
    },
    {
      id: 'async', title: 'Pipe async dùng hai lần = hai lần subscribe',
      html: `
<p>Pipe <code>async</code> tiện (tự subscribe, tự huỷ) nhưng có bẫy: <b>mỗi lần xuất hiện trong template là một subscription mới</b>. Với observable cold từ HTTP, nghĩa là <b>gọi server hai lần</b>:</p>
<textarea class="code" data-lang="ts">
template: \`
  <h2>{{ (race | async)?.name }}</h2>
  <small>{{ (race | async)?.date }}</small>\`      // 2 lần async → 2 request!
</textarea>

<div class="widget" id="w-as">
  <h4>📡 Đếm số request</h4>
  <p class="hint">Chọn cách viết template, bấm Render. “Server” có độ trễ 400ms.</p>
  <div class="row" style="margin-bottom:10px">
    <label><input type="radio" name="asm" value="twice" checked> <code>(race | async)?.name</code> và <code>(race | async)?.date</code></label>
    <label><input type="radio" name="asm" value="share"> cùng cách trên nhưng <code>race = get().pipe(shareReplay())</code></label>
    <label><input type="radio" name="asm" value="as"> <code>*ngIf="race | async as r"</code></label>
    <button class="btn" id="as-render">▶ Render template</button>
  </div>
  <div class="grid2">
    <div><b>Giao diện</b><div id="as-view" style="padding:10px;border:1px solid var(--border);border-radius:8px;margin-top:6px;min-height:60px"></div></div>
    <div><b>Request đã gửi tới server</b><div id="as-req" style="font-size:28px;font-weight:800;margin-top:6px">0</div><div id="as-sub" class="hint"></div></div>
  </div>
</div>
<textarea class="code" data-lang="ts" data-title="Ba cách khắc phục / tránh">
// 1) Chia sẻ subscription
this.race = this.raceService.get().pipe(shareReplay());

// 2) Một async duy nhất + "as" (đẹp nhất trong template)
<div *ngIf="race | async as raceModel">
  <h2>{{ raceModel.name }}</h2><small>{{ raceModel.date }}</small>
</div>

// 3) Tách "smart" (lấy dữ liệu) và "dumb" (chỉ hiển thị qua @Input)
<ns-race *ngIf="race | async as r" [raceModel]="r"></ns-race>
</textarea>
<div class="box info"><b>Smart / dumb component</b><p>Component <b>container</b> (smart) lo gọi service, xử lý lỗi (<code>catchError(() => { this.error = true; return EMPTY; })</code>). Component <b>presentational</b> (dumb) chỉ nhận <code>@Input</code> và hiển thị — dễ test, dễ tái sử dụng. Đừng áp dụng máy móc ở mọi nơi.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="html">
@if (race$ | async; as race) {
  <h2>{{ race.name }}</h2><small>{{ race.date }}</small>
}
<!-- hoặc với signal: race = toSignal(race$)  →  {{ race()?.name }} (không còn lo subscribe nhiều lần) -->
</textarea></div>`
    },
    {
      id: 'flatten', title: 'Làm phẳng: switchMap, concatMap, mergeMap, exhaustMap',
      html: `
<p>Khi mỗi giá trị của stream ngoài lại cần <b>gọi một observable khác</b> (mỗi lần gõ → gọi HTTP), nếu lồng <code>subscribe</code> trong <code>subscribe</code> thì giống “địa ngục callback”. Các “*Map” gộp stream trong vào stream ngoài — khác nhau ở <b>cách xử lý khi cuộc gọi cũ chưa xong</b>:</p>
<div class="tablewrap"><table>
<tr><th>Operator</th><th>Khi có giá trị mới mà cuộc gọi cũ chưa xong</th><th>Dùng cho</th></tr>
<tr><td><code>switchMap</code></td><td><b>Huỷ</b> cuộc gọi cũ, chỉ giữ cái mới nhất</td><td>Tìm kiếm, điều hướng (kết quả cũ vô nghĩa)</td></tr>
<tr><td><code>concatMap</code></td><td><b>Xếp hàng</b>, chạy lần lượt, giữ nguyên thứ tự</td><td>Ghi tuần tự, thứ tự quan trọng</td></tr>
<tr><td><code>mergeMap</code></td><td>Chạy <b>song song</b>, kết quả về theo thứ tự ai xong trước</td><td>Nhiều việc độc lập</td></tr>
<tr><td><code>exhaustMap</code></td><td><b>Bỏ qua</b> giá trị mới cho tới khi cái cũ xong</td><td>Nút “Lưu”/đăng nhập (chống bấm đúp)</td></tr>
</table></div>
<textarea class="live" data-time data-title="Nguồn phát 1, 2, 3 cách nhau 100ms; mỗi giá trị gọi “server” mất 300ms">
const { Observable, timer, map, switchMap, concatMap, mergeMap, exhaustMap } = Rx;

const source$ = () => new Observable(o => {
  [1, 2, 3].forEach((v, i) => setTimeout(() => o.next(v), i * 100));
  setTimeout(() => o.complete(), 250);
});
const server = v => timer(300).pipe(map(() => 'kết quả ' + v));

const ops = { switchMap, concatMap, mergeMap, exhaustMap };
let offset = 0;
for (const [name, op] of Object.entries(ops)) {
  setTimeout(() => {
    console.log('— ' + name);
    source$().pipe(op(server)).subscribe({ next: r => console.log('  ' + name + ':', r), complete: () => console.log('  (xong)') });
  }, offset);
  offset += 1500;
}
</textarea>
<p class="hint">Đọc mốc thời gian: <b>mergeMap</b> ra r1,r2,r3 gần như song song; <b>concatMap</b> mất ~900ms vì xếp hàng; <b>switchMap</b> chỉ còn kết quả 3; <b>exhaustMap</b> chỉ còn kết quả 1.</p>`
    },
    {
      id: 'typeahead', title: 'Xây ô tìm kiếm từng bước (có mô phỏng)',
      html: `
<p>Ô tìm kiếm tốt cần: chỉ tìm khi đủ ký tự, <b>không tìm mỗi phím</b>, không lặp cùng yêu cầu, kết quả luôn khớp với ô nhập, và <b>không chết</b> khi server lỗi. Mỗi tính năng là một operator. Widget dưới chạy một <b>kịch bản gõ phím cố định</b> để bạn bật/tắt từng thứ và quan sát.</p>

<div class="widget" id="w-ta2">
  <h4>⌨ Kịch bản gõ phím &amp; “server” giả</h4>
  <p class="hint">Kịch bản: gõ <code>p, pi, pin, pink</code> → ngừng → sửa <code>pinkx</code> → xoá về <code>pink</code> → <code>pinkie</code> (server có thể báo lỗi) → rồi gõ <code>r, ra, rai, rain</code>. Server giả: <b>câu càng ngắn trả lời càng chậm</b> (để lộ lỗi kết quả cũ về sau).</p>
  <div class="row" style="margin-bottom:8px">
    <label>Làm phẳng bằng: <select id="t2-flat">
      <option value="nested">subscribe lồng nhau (không operator)</option>
      <option value="mergeMap">mergeMap</option>
      <option value="concatMap">concatMap</option>
      <option value="switchMap" selected>switchMap</option>
      <option value="exhaustMap">exhaustMap</option></select></label>
  </div>
  <div class="row" style="margin-bottom:8px">
    <label><input type="checkbox" id="t2-filter"> <code>filter(q.length ≥ 3)</code></label>
    <label><input type="checkbox" id="t2-debounce"> <code>debounceTime(400)</code></label>
    <label><input type="checkbox" id="t2-distinct"> <code>distinctUntilChanged()</code></label>
    <label><input type="checkbox" id="t2-catch"> <code>catchError</code> (bên trong)</label>
    <label><input type="checkbox" id="t2-fail"> server lỗi với “pinkie”</label>
  </div>
  <pre class="hl" id="t2-code" style="border-radius:8px;margin-bottom:10px"></pre>
  <div class="row" style="margin-bottom:8px"><button class="btn" id="t2-run">▶ Chạy kịch bản (≈6 giây)</button><span id="t2-state" class="hint"></span></div>
  <div class="grid2">
    <div><b>Nhật ký</b><div class="output" id="t2-log" style="border-radius:8px;height:260px;overflow:auto;margin-top:6px"></div></div>
    <div><b>Kết quả hiển thị (theo thứ tự)</b><div class="output" id="t2-shown" style="border-radius:8px;height:200px;overflow:auto;margin-top:6px"></div><div id="t2-verdict" style="margin-top:8px"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử theo thứ tự</b><ol>
<li><b>Không bật gì + mergeMap</b>: request mỗi phím; kết quả về ngược thứ tự → kết thúc ở “r” (sai!).</li>
<li>Đổi sang <b>switchMap</b>: các request cũ bị <b>huỷ</b>, kết quả cuối đúng; nhưng vẫn gửi quá nhiều.</li>
<li>Bật <b>filter</b>, rồi <b>debounceTime</b>: số request giảm mạnh.</li>
<li>Bật <b>distinctUntilChanged</b>: “pink” lặp lại không gửi lần hai.</li>
<li>Bật “server lỗi với pinkie” <b>mà không</b> bật catchError: stream chết, “rain” không bao giờ được tìm. Bật <b>catchError</b>: sống tiếp.</li>
<li><b>concatMap</b>: xếp hàng nên mọi request phải chờ nhau — đến lúc kiểm tra vẫn chưa tới “rain” (quá trễ); <b>exhaustMap</b>: bỏ qua các phím mới nên kết quả sai.</li></ol></div>
<textarea class="code" data-lang="ts" data-title="Phiên bản hoàn chỉnh (5 dòng)">
this.input.valueChanges
  .pipe(
    filter(query => query.length >= 3),
    debounceTime(400),
    distinctUntilChanged(),
    switchMap(value => this.ponyService.search(value).pipe(catchError(() => of([]))))
  )
  .subscribe(results => (this.ponies = results));
</textarea>`
    },
    {
      id: 'create', title: 'Tự tạo Observable (bọc thư viện không có Observable)',
      html: `
<p>Thư viện bên thứ ba dùng callback? Bọc lại bằng <code>new Observable(observer => ...)</code>. Hàm truyền vào gọi <code>next/error/complete</code>, và <b>trả về hàm dọn dẹp</b> chạy khi unsubscribe. Vì <code>setInterval</code> chỉ tạo khi subscribe nên đây là <b>cold observable</b>.</p>
<textarea class="live" data-time data-title="HelloService: phát “hello” định kỳ, dọn dẹp khi unsubscribe">
const { Observable } = Rx;

class HelloService {
  get() {
    return new Observable(observer => {
      const interval = setInterval(() => observer.next('hello'), 300);
      console.log('(bắt đầu setInterval)');
      return () => { clearInterval(interval); console.log('(dọn dẹp: clearInterval)'); };
    });
  }
}

const sub = new HelloService().get().subscribe(v => console.log(v));
setTimeout(() => sub.unsubscribe(), 1000);     // không có dòng này → chạy mãi
</textarea>
<textarea class="live" data-time data-title="Bọc API dùng callback (ví dụ geolocation giả)">
const { Observable } = Rx;

// Thư viện cũ: hàm watchPosition(onOk, onError) trả về id để clear
const fakeLib = {
  watch(ok, fail) { let n = 0; const id = setInterval(() => ok({ lat: 10 + n++ * 0.1, lng: 106 }), 200); return id; },
  clear(id) { clearInterval(id); }
};

const position$ = new Observable(observer => {
  const id = fakeLib.watch(pos => observer.next(pos), err => observer.error(err));
  return () => fakeLib.clear(id);                 // teardown
});

const s = position$.subscribe(p => console.log('vị trí', p.lat.toFixed(1), p.lng));
setTimeout(() => s.unsubscribe(), 700);
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Nhiều trường hợp có sẵn: <code>fromEvent</code>, <code>from(promise)</code>, <code>defer</code>, <code>webSocket</code>. Và bạn có thể cần <code>combineLatest</code>/<code>forkJoin</code> để gộp nhiều nguồn — thử trong code bên dưới.</p></div>
<textarea class="live" data-time>
const { combineLatest, forkJoin, timer, map } = Rx;
const user$ = timer(200).pipe(map(() => ({ name: 'Ana' })));
const races$ = timer(500).pipe(map(() => ['London', 'Paris']));

forkJoin([user$, races$]).subscribe(([u, r]) => console.log('forkJoin   (đợi cả hai xong):', u.name, r.length));
combineLatest([user$, races$]).subscribe(([u, r]) => console.log('combineLatest (mỗi khi có giá trị mới):', u.name, r.length));
</textarea>`
    }
  ],
  quiz: [
    { q: 'Observable từ HttpClient.get() thuộc loại?', options: ['Hot', 'Cold: chỉ gọi server khi subscribe', 'Không phải observable'], answer: 1, why: 'Cold: mỗi subscribe chạy lại một request.' },
    { q: 'Dùng <code>(race | async)</code> hai lần trong template (observable HTTP, không chia sẻ) sẽ?', options: ['Gọi HTTP một lần', 'Gọi HTTP hai lần', 'Báo lỗi'], answer: 1, why: 'Mỗi async là một subscription riêng. Dùng shareReplay hoặc "async as".' },
    { q: 'Sau khi một observable phát lỗi?', options: ['Vẫn tiếp tục phát', 'Stream kết thúc', 'Tự thử lại'], answer: 1, why: 'Lỗi là sự kiện kết thúc; cần catchError (đặt bên trong switchMap) để stream chính sống tiếp.' },
    { q: 'Operator hợp nhất cho ô tìm kiếm (bỏ kết quả cũ)?', options: ['mergeMap', 'concatMap', 'switchMap'], answer: 2, why: 'switchMap huỷ cuộc gọi cũ khi có giá trị mới.' },
    { q: 'Nút "Lưu" muốn chống bấm đúp trong khi đang lưu, nên dùng?', options: ['exhaustMap', 'switchMap', 'concatMap'], answer: 0, why: 'exhaustMap bỏ qua sự kiện mới cho đến khi cuộc gọi hiện tại xong.' },
    { q: 'Hàm trả về trong <code>new Observable(observer => { ... return fn })</code> dùng để?', options: ['Phát giá trị', 'Dọn dẹp khi unsubscribe/kết thúc', 'Bắt lỗi'], answer: 1, why: 'Đó là teardown: clearInterval, removeEventListener…' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const R = Rx;
    const alive = () => root.isConnected;

    /* ===== cold vs hot ===== */
    const lanes = { cold: [], hot: [] };
    let tick = 0, hotSubj, hotTimer, coldSubs = [];
    const lane = (kind, n) => { const el = document.createElement('div'); el.className = 'row'; el.style.margin = '4px 0'; el.innerHTML = `<b style="min-width:70px">Sub ${n}</b>`; $('#hc-' + kind).appendChild(el); return el; };
    const chip = (el, v) => { const c = document.createElement('span'); c.className = 'kv hit'; c.innerHTML = `<span class="k">${v}</span>`; el.appendChild(c); };
    function startHot() {
      clearInterval(hotTimer); tick = 0; $('#hc-tick').textContent = 0;
      hotSubj = new R.Subject();
      hotTimer = setInterval(() => { if (!alive()) return clearInterval(hotTimer); hotSubj.next(tick); tick++; $('#hc-tick').textContent = tick; }, 700);
    }
    function resetHC() { coldSubs.forEach(s => s.unsubscribe()); coldSubs = []; $('#hc-cold').innerHTML = ''; $('#hc-hot').innerHTML = ''; startHot(); }
    root.querySelectorAll('#w-hc button[data-c]').forEach(b => b.onclick = () => {
      const kind = b.dataset.c, el = lane(kind, b.dataset.n);
      const src = kind === 'cold' ? R.interval(700) : hotSubj;
      const s = src.subscribe(v => { if (!alive()) return s && s.unsubscribe(); chip(el, v); });
      coldSubs.push(s);
    });
    $('#hc-reset').onclick = resetHC; resetHC();

    /* ===== async pipe x2 ===== */
    $('#as-render').onclick = () => {
      let requests = 0, subs = 0;
      const mode = root.querySelector('input[name=asm]:checked').value;
      const upd = () => { $('#as-req').textContent = requests; $('#as-req').style.color = requests > 1 ? 'var(--err)' : 'var(--ok)'; $('#as-sub').textContent = `${subs} subscription${subs > 1 ? 's' : ''} tới observable`; };
      let race$ = new R.Observable(o => { requests++; upd(); const t = setTimeout(() => { o.next({ name: 'Grand Prix', date: '12/10/2026' }); o.complete(); }, 400); return () => clearTimeout(t); });
      if (mode === 'share') race$ = race$.pipe(R.shareReplay());
      const view = $('#as-view'); view.innerHTML = '<i>đang tải…</i>'; requests = 0; upd();
      const sub = () => { subs++; return race$; };
      let name = '', date = '', box = null;
      const paint = () => { view.innerHTML = box ? `<h3 style="margin:0">${esc(box.name)}</h3><small>${esc(box.date)}</small>` : `<h3 style="margin:0">${esc(name)}</h3><small>${esc(date)}</small>`; };
      if (mode === 'as') sub().subscribe(r => { box = r; paint(); });
      else { sub().subscribe(r => { name = r.name; paint(); }); sub().subscribe(r => { date = r.date; paint(); }); }
      upd();
    };

    /* ===== typeahead simulator ===== */
    const PON = ['Pinkie Pie', 'Pinky Hope', 'Pink Star', 'Rainbow Dash', 'Rain Cloud', 'Raindrop'];
    const SCRIPT = [[0, 'p'], [100, 'pi'], [200, 'pin'], [300, 'pink'], [900, 'pinkx'], [1000, 'pink'], [2000, 'pinkie'], [2800, 'r'], [2900, 'ra'], [3000, 'rai'], [3100, 'rain']];
    const latency = q => Math.max(150, 1000 - 200 * (q.length - 1));
    const flatSel = $('#t2-flat'), tlog = $('#t2-log'), tshown = $('#t2-shown');
    const checks = { filter: $('#t2-filter'), debounce: $('#t2-debounce'), distinct: $('#t2-distinct'), catchE: $('#t2-catch'), fail: $('#t2-fail') };
    function codeText() {
      const f = flatSel.value, lines = [];
      if (f === 'nested') lines.push('valueChanges.pipe(' + [checks.filter.checked && 'filter(q => q.length >= 3)', checks.debounce.checked && 'debounceTime(400)', checks.distinct.checked && 'distinctUntilChanged()'].filter(Boolean).join(', ') + ')');
      else {
        const ops = [];
        if (checks.filter.checked) ops.push('filter(q => q.length >= 3)');
        if (checks.debounce.checked) ops.push('debounceTime(400)');
        if (checks.distinct.checked) ops.push('distinctUntilChanged()');
        ops.push(`${f}(q => search(q)${checks.catchE.checked ? '.pipe(catchError(() => of([])))' : ''})`);
        lines.push('valueChanges.pipe(\n  ' + ops.join(',\n  ') + '\n)');
      }
      lines.push(f === 'nested' ? '.subscribe(q => search(q).subscribe(show))' : '.subscribe(show)');
      $('#t2-code').textContent = lines.join('\n');
    }
    root.querySelectorAll('#w-ta2 select, #w-ta2 input').forEach(e => (e.onchange = codeText)); codeText();

    let runSub = null, verdictTimer = null, runTimers = [];
    $('#t2-run').onclick = () => {
      runSub && runSub.unsubscribe(); clearTimeout(verdictTimer); runTimers.forEach(clearTimeout); runTimers = [];
      tlog.innerHTML = tshown.innerHTML = ''; $('#t2-verdict').innerHTML = '';
      const t0 = performance.now(), ms = () => String(Math.round(performance.now() - t0)).padStart(4);
      const log = (t, cls) => { if (!alive()) return; const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = `[${ms()}] ${t}`; tlog.appendChild(d); tlog.scrollTop = tlog.scrollHeight; };
      let requests = 0, cancelled = 0, lastShown = null, dead = false;
      const search = q => new R.Observable(o => {
        requests++; const lat = latency(q); let done = false;
        log(`→ request '${q}' (server ${lat}ms)`);
        const id = setTimeout(() => {
          done = true;
          if (checks.fail.checked && q === 'pinkie') { log(`✖ server LỖI cho '${q}'`, 'err'); o.error(new Error('500')); }
          else { log(`← về '${q}'`, 'ok'); o.next({ q, list: PON.filter(p => p.toLowerCase().includes(q.toLowerCase())) }); o.complete(); }
        }, lat);
        return () => { clearTimeout(id); if (!done) { cancelled++; log(`⊘ huỷ '${q}'`, 'dim'); } };
      });
      const show = r => { lastShown = r.q; if (!alive()) return; const d = document.createElement('div'); d.textContent = `“${r.q}” → ${r.list.length} kết quả`; tshown.appendChild(d); tshown.scrollTop = tshown.scrollHeight; };

      const keys$ = new R.Observable(o => {
        const ids = SCRIPT.map(([t, q]) => setTimeout(() => { log(`⌨ gõ '${q}'`, 'dim'); o.next(q); }, t));
        ids.push(setTimeout(() => o.complete(), 3300));
        return () => ids.forEach(clearTimeout);
      });
      const ops = [];
      if (checks.filter.checked) ops.push(R.filter(q => q.length >= 3));
      if (checks.debounce.checked) ops.push(R.debounceTime(400));
      if (checks.distinct.checked) ops.push(R.distinctUntilChanged());
      const flat = flatSel.value;
      const inner = q => { const s = search(q); return checks.catchE.checked ? s.pipe(R.catchError(() => R.of({ q, list: [] }))) : s; };
      const pre = keys$.pipe(...ops);
      if (flat === 'nested') runSub = pre.subscribe({ next: q => search(q).subscribe({ next: show, error: () => log('(lỗi không ai xử lý ở subscribe trong)', 'err') }) });
      else runSub = pre.pipe(R[flat](inner)).subscribe({ next: show, error: () => { dead = true; log('💥 STREAM CHẾT do lỗi chưa được bắt — các phím sau bị bỏ qua', 'err'); } });

      $('#t2-state').textContent = 'đang chạy…';
      verdictTimer = setTimeout(() => {
        if (!alive()) return;
        runSub && runSub.unsubscribe();
        const ok = lastShown === 'rain' || (lastShown === 'rai' && false);
        $('#t2-state').textContent = 'xong';
        $('#t2-verdict').innerHTML = `<div class="${ok ? 'box tip' : 'box warn'}" style="margin:0"><b>${ok ? '✓ Đúng' : '✖ Sai'}</b><p>Ô nhập cuối cùng là <code>rain</code>; giao diện cuối hiển thị kết quả cho <code>${esc(lastShown ?? '(không có gì)')}</code>${dead ? ' (stream đã chết)' : ''}.<br>Tổng <b>${requests}</b> request, <b>${cancelled}</b> bị huỷ.</p></div>`;
      }, 6000);
    };
  }
});
