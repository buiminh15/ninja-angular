registerChapter(13, {
  time: '45 phút',
  lead: 'Lập trình phản ứng: mọi thứ là một <b>dòng sự kiện theo thời gian</b> (stream) mà bạn đăng ký lắng nghe. Angular dùng RxJS khắp nơi — HTTP, form, router, sự kiện component. Các ví dụ chạy trên <b>mini-rx</b>, một bản RxJS thu nhỏ có cùng tên hàm với thư viện thật.',
  sections: [
    {
      id: 'idea', title: 'Stream, observable, observer',
      html: `
<p>Trong lập trình phản ứng, dữ liệu đến dưới dạng <b>stream</b>: một chuỗi sự kiện có thứ tự theo thời gian. Mỗi sự kiện có thể là:</p>
<div class="flow">
  <div class="node">🟢 giá trị<small>next</small></div>
  <div class="node">🔴 lỗi<small>error – kết thúc stream</small></div>
  <div class="node">⚪ hoàn thành<small>complete – kết thúc stream</small></div>
</div>
<ul>
<li><b>Observable</b> = stream (nguồn phát).</li>
<li><b>Observer</b> = bên lắng nghe: có ba hàm xử lý <code>next</code>, <code>error</code>, <code>complete</code>.</li>
<li><b>subscribe()</b> = bắt đầu lắng nghe, trả về <code>Subscription</code> để <code>unsubscribe()</code>.</li>
</ul>
<div class="flow" style="font-size:14px">
  <div class="node">Producer<small>HTTP, click, WebSocket, timer…</small></div><span class="arr">— next, next, … complete →</span>
  <div class="node hot">Observable<small>+ operator (map, filter…)</small></div><span class="arr">→</span>
  <div class="node">Observer<small>subscribe({ next, error, complete })</small></div>
</div>
<h3>Khác Promise ở đâu?</h3>
<div class="tablewrap"><table>
<tr><th></th><th>Promise</th><th>Observable</th></tr>
<tr><td>Số giá trị</td><td>Đúng 1 (hoặc lỗi)</td><td>0, 1 hoặc nhiều, theo thời gian</td></tr>
<tr><td>Khi nào chạy</td><td>Chạy ngay khi tạo</td><td>Chỉ chạy khi có <code>subscribe</code> (lazy)</td></tr>
<tr><td>Huỷ</td><td>Không huỷ được</td><td><code>unsubscribe()</code></td></tr>
<tr><td>Toán tử</td><td>then / catch</td><td>Hàng chục operator: map, filter, debounceTime, switchMap…</td></tr>
</table></div>
<p>Cách dễ nhớ: <b>Observable giống mảng, nhưng các phần tử đến theo thời gian</b>.</p>`
    },
    {
      id: 'array', title: 'Từ mảng đến observable',
      html: `
<p>Các hàm quen thuộc <code>map</code>, <code>filter</code> của mảng có bản “theo thời gian” trong RxJS. Cùng một phép biến đổi, hai thế giới:</p>
<textarea class="live" data-title="Mảng và Observable cho cùng kết quả">
const { from, map, filter } = Rx;       // trong dự án thật: import { from } from 'rxjs'

// Mảng: có tất cả giá trị ngay lập tức
[1, 2, 3, 4, 5]
  .map(x => x * 2)
  .filter(x => x > 5)
  .forEach(x => console.log('mảng      :', x));

// Observable: cùng phép biến đổi, dùng pipe(...)
from([1, 2, 3, 4, 5])
  .pipe(
    map(x => x * 2),
    filter(x => x > 5)
  )
  .subscribe(x => console.log('observable:', x));
</textarea>
<textarea class="code" data-lang="ts" data-title="RxJS thật (v7+)">
import { from, map, filter } from 'rxjs';     // v7.2+: operator import thẳng từ 'rxjs'
// (sách dùng: import { filter, map } from 'rxjs/operators')

from([1, 2, 3, 4, 5])
  .pipe(map(x => x * 2), filter(x => x > 5))
  .subscribe(x => console.log(x));            // 6, 8, 10
</textarea>`
    },
    {
      id: 'marble', title: 'Nhìn stream bằng “marble diagram”',
      html: `
<p>Marble diagram là cách chuẩn để vẽ stream: trục thời gian nằm ngang, mỗi chấm là một sự kiện, <code>|</code> là hoàn thành, <code>✖</code> là lỗi. Widget dưới chạy observable <b>thật</b> theo thời gian thực — chọn nguồn và xếp tối đa 3 operator rồi bấm chạy.</p>

<div class="widget" id="w-marble">
  <h4>🔮 Marble lab</h4>
  <div class="row" style="margin-bottom:10px">
    <label>Nguồn: <select id="mb-src">
      <option value="steady">Đều đặn: 1,2,3,4,5 mỗi 400ms</option>
      <option value="burst">Chùm nhanh (như gõ phím): 3 giá trị liền nhau, nghỉ, 2 giá trị, nghỉ, 1</option>
    </select></label>
  </div>
  <div class="row" style="margin-bottom:10px">
    <label>① <select class="mb-op"></select></label>
    <label>② <select class="mb-op"></select></label>
    <label>③ <select class="mb-op"></select></label>
    <button class="btn" id="mb-go">▶ Chạy</button>
  </div>
  <pre class="hl" id="mb-code" style="border-radius:8px;margin-bottom:10px"></pre>
  <b>Nguồn</b><div class="timeline" id="mb-top" style="height:40px"></div>
  <b>Kết quả sau các operator</b><div class="timeline" id="mb-bot" style="height:40px"></div>
  <div class="hint" id="mb-info"></div>
</div>
<div class="box tip"><b>Thử ngay</b><ul>
<li>Nguồn “chùm nhanh” + <code>debounceTime(300)</code>: chỉ giá trị cuối mỗi chùm được giữ lại — nền tảng của ô tìm kiếm.</li>
<li>Nguồn đều + <code>scan(cộng dồn)</code>: 1,3,6,10,15.</li>
<li><code>take(3)</code> hoàn thành sớm (dấu <code>|</code>) và tự huỷ nguồn.</li>
<li><code>delay(600)</code> chỉ dịch cả stream sang phải.</li></ul></div>
<p>Muốn xem đầy đủ operator dưới dạng marble: <a href="https://rxmarbles.com" target="_blank" rel="noopener">rxmarbles.com</a>.</p>`
    },
    {
      id: 'create', title: 'Tự tạo Observable, xử lý lỗi và hoàn thành',
      html: `
<p><code>new Observable(observer => ...)</code> nhận một hàm; bạn gọi <code>observer.next()</code>, <code>error()</code>, <code>complete()</code>. Hàm trả về (nếu có) là <b>hàm dọn dẹp</b>, chạy khi unsubscribe/kết thúc.</p>
<textarea class="live" data-title="Observable tự viết">
const { Observable } = Rx;

const hello$ = new Observable(observer => {
  observer.next('hello');
  observer.next('world');
  observer.complete();                       // sau complete, next bị bỏ qua
  observer.next('không bao giờ tới');
  return () => console.log('(dọn dẹp)');     // teardown
});

hello$.subscribe({
  next: v => console.log('next', v),
  error: e => console.log('error', e),
  complete: () => console.log('complete')
});
</textarea>
<textarea class="live" data-title="Lỗi kết thúc stream; operator ném lỗi → vào error">
const { range, map, filter } = Rx;

range(1, 5)
  .pipe(
    map(x => {
      if (x % 2 === 1) throw new Error('something went wrong');   // x = 1 → lỗi ngay
      return x;
    }),
    filter(x => x > 5)
  )
  .subscribe({
    next: x => console.log(x),
    error: e => console.log('lỗi:', e.message),
    complete: () => console.log('done')        // KHÔNG chạy vì stream đã lỗi
  });

range(1, 5).pipe(map(x => x * 2), filter(x => x > 5))
  .subscribe({ next: x => console.log(x), complete: () => console.log('done') });   // 6, 8, 10, done
</textarea>
<div class="box info"><b>Quy tắc</b><p>Sau <code>error</code> hoặc <code>complete</code>, stream <b>kết thúc</b> — không có thêm sự kiện nào. Và nên truyền một <b>object</b> <code>{ next, error, complete }</code> vào <code>subscribe</code> thay vì nhiều hàm rời (dạng nhiều tham số đã bị loại bỏ).</p></div>`
    },
    {
      id: 'time', title: 'Observable theo thời gian: interval, hủy đăng ký',
      html: `
<p>Sức mạnh thật nằm ở thời gian. <code>interval(500)</code> phát 0, 1, 2… mỗi 500ms <b>mãi mãi</b> — nếu không <code>unsubscribe</code> nó sẽ chạy hoài (rò rỉ!). Tiền tố <code>[+ms]</code> bên dưới cho thấy mốc thời gian.</p>
<textarea class="live" data-time data-title="interval + take, và hủy thủ công">
const { interval, take, map } = Rx;

// take(3): tự hoàn thành sau 3 giá trị
interval(300).pipe(take(3), map(i => 'tick ' + i))
  .subscribe({ next: console.log, complete: () => console.log('take xong') });

// hủy thủ công sau 1 giây
const sub = interval(250).subscribe(i => console.log('  nhanh', i));
setTimeout(() => { sub.unsubscribe(); console.log('  → unsubscribe, ngừng nhận'); }, 1000);
</textarea>
<div class="box warn"><b>Rò rỉ subscription</b><p>Quên unsubscribe một stream không tự kết thúc (interval, sự kiện DOM, Subject…) là nguồn lỗi bộ nhớ số một. Angular giải quyết bằng: pipe <code>async</code> (tự hủy), <code>takeUntilDestroyed()</code>, hoặc stream tự kết thúc như HTTP (phát 1 giá trị rồi complete).</p></div>`
    },
    {
      id: 'subject', title: 'EventEmitter và Subject: phát cho nhiều người nghe',
      html: `
<p>Observable thường <b>unicast</b> (mỗi subscribe chạy riêng). <b>Subject</b> vừa là observable vừa là observer: bạn gọi <code>next()</code> và <b>mọi subscriber đang nghe</b> đều nhận — dạng <b>multicast</b>. Angular có <code>EventEmitter</code> là Subject có thêm <code>emit()</code>; bạn sẽ dùng nó để phát sự kiện từ component (chương 14).</p>

<div class="widget" id="w-subj">
  <h4>📡 Phòng thí nghiệm Subject / EventEmitter</h4>
  <div class="row" style="margin-bottom:10px">
    <button class="btn alt" id="sj-subA">subscribe A</button>
    <button class="btn alt" id="sj-subB">subscribe B</button>
    <button class="btn" id="sj-emit">emit(…)</button>
    <button class="btn alt" id="sj-unA">A.unsubscribe()</button>
    <button class="btn alt" id="sj-unB">B.unsubscribe()</button>
    <button class="btn alt" id="sj-complete">complete()</button>
    <button class="btn alt" id="sj-error">error()</button>
    <button class="btn alt" id="sj-reset">↺ Làm lại</button>
  </div>
  <div class="row" style="margin-bottom:10px">Đang có <b id="sj-count">0</b> subscriber: <span id="sj-who"></span></div>
  <div class="output" id="sj-log" style="border-radius:8px;max-height:220px;overflow:auto"></div>
</div>

<textarea class="live" data-title="EventEmitter y như trong sách">
const { EventEmitter } = Rx;

const emitter = new EventEmitter();
const subscription = emitter.subscribe({
  next: value => console.log('next:', value),
  error: err => console.log('error:', err),
  complete: () => console.log('done')
});

emitter.emit('hello');
subscription.unsubscribe();       // ngừng nghe
emitter.emit('there');            // không ai nhận
console.log('(chỉ "hello" được in)');
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Với component, Angular mới có <code>output()</code> thay cho <code>@Output() + EventEmitter</code>. Subject vẫn là công cụ chính trong service để phát sự kiện; <code>BehaviorSubject</code> giữ “giá trị hiện tại” cho người đến sau; và có thể chuyển sang signal bằng <code>toSignal()</code>.</p></div>`
    },
    {
      id: 'typeahead', title: 'Ví dụ thực tế: ô tìm kiếm',
      html: `
<p>Bài toán kinh điển: gõ vào ô và hiện kết quả từ server. Cách ngây thơ gọi server <b>ở mỗi phím</b>, và kết quả cũ (chậm) có thể về <b>sau</b> kết quả mới → hiển thị sai. Bốn operator giải quyết gọn: <code>debounceTime</code> (đợi ngừng gõ), <code>distinctUntilChanged</code> (bỏ trùng), <code>switchMap</code> (hủy yêu cầu cũ khi có yêu cầu mới).</p>

<div class="widget" id="w-ta">
  <h4>🔎 Tìm pony (server giả, độ trễ ngẫu nhiên 200–900ms)</h4>
  <div class="row" style="margin-bottom:8px">
    <label><input type="radio" name="tam" value="naive"> Ngây thơ (mỗi phím một request)</label>
    <label><input type="radio" name="tam" value="rx" checked> RxJS (debounce 300 + distinct + switchMap)</label>
  </div>
  <input type="text" id="ta-in" placeholder="gõ: rainbow, pinkie, apple…" style="width:100%;margin-bottom:8px" autocomplete="off">
  <div class="row" style="margin-bottom:8px"><b>Đã gửi:</b> <span id="ta-sent">0</span> · <b>Đã huỷ:</b> <span id="ta-cancel">0</span> · <b>Đã hiển thị:</b> <span id="ta-shown">0</span> lần
    <button class="btn alt" id="ta-clear" style="margin-left:auto">Xóa</button></div>
  <div class="grid2">
    <div><b>Nhật ký request</b><div class="output" id="ta-log" style="border-radius:8px;height:180px;overflow:auto;margin-top:6px"></div></div>
    <div><b>Kết quả hiển thị</b><div id="ta-res" style="margin-top:6px"></div></div>
  </div>
</div>
<textarea class="code" data-lang="ts" data-title="Mã Angular/RxJS thật tương đương">
this.results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.ponyService.search(query))   // hủy request cũ khi có query mới
);
// template: <li *ngFor="let p of results$ | async">{{ p.name }}</li>
</textarea>
<div class="box tip"><b>Thử trong widget</b><p>Chế độ ngây thơ: gõ “rainbow” nhanh rồi xem nhật ký — nhiều request, và có lúc kết quả cũ về sau ghi đè kết quả mới. Chuyển sang RxJS và gõ lại: một request, request cũ bị <b>huỷ</b>.</p></div>`
    },
    {
      id: 'angular', title: 'Reactive programming trong Angular',
      html: `
<div class="tablewrap"><table>
<tr><th>Nơi dùng</th><th>Observable ở đâu</th><th>Chương</th></tr>
<tr><td>HTTP</td><td><code>http.get()</code> trả <code>Observable</code> (1 giá trị rồi complete)</td><td>17</td></tr>
<tr><td>Form</td><td><code>control.valueChanges</code></td><td>19</td></tr>
<tr><td>Router</td><td><code>route.params</code>, <code>router.events</code></td><td>18</td></tr>
<tr><td>Component</td><td><code>EventEmitter</code> / <code>output()</code></td><td>14</td></tr>
<tr><td>Template</td><td>pipe <code>async</code></td><td>12, 22</td></tr>
</table></div>
<textarea class="live" data-title="Promise vs Observable: lazy và nhiều giá trị">
const { Observable } = Rx;

// Promise: chạy NGAY khi tạo, 1 giá trị
const p = new Promise(resolve => { console.log('promise: chạy ngay'); resolve(1); });

// Observable: lazy, chạy MỖI LẦN subscribe, nhiều giá trị
const o$ = new Observable(observer => { console.log('observable: bắt đầu'); observer.next(1); observer.next(2); observer.complete(); });

console.log('--- chưa subscribe');
o$.subscribe(v => console.log('A nhận', v));
o$.subscribe(v => console.log('B nhận', v));      // chạy lại từ đầu (cold)
</textarea>
<p>Ở chương 22 ta đi sâu vào operator (<code>switchMap</code>, <code>mergeMap</code>, <code>combineLatest</code>…), chọn đúng operator và cách tự tạo Observable chuyên nghiệp.</p>
<div class="box modern"><b>🆕 Signals và RxJS</b><p>Angular hiện có <b>signals</b> cho “giá trị hiện tại” (đồng bộ) còn RxJS cho “dòng sự kiện theo thời gian”. Hai thế giới nối bằng <code>toSignal()</code> / <code>toObservable()</code>, và <code>firstValueFrom()</code> để dùng <code>await</code> với observable.</p></div>`
    }
  ],
  quiz: [
    { q: 'Điểm khác biệt cốt lõi giữa Observable và Promise?', options: ['Observable có thể phát nhiều giá trị theo thời gian và huỷ được', 'Promise nhanh hơn', 'Observable chỉ dùng cho HTTP'], answer: 0, why: 'Promise chỉ 1 giá trị, không huỷ; Observable 0..n giá trị và có unsubscribe.' },
    { q: 'Observable chỉ bắt đầu chạy khi nào?', options: ['Khi được tạo', 'Khi có subscribe()', 'Khi trang tải xong'], answer: 1, why: 'Observable là lazy: không subscribe thì không có gì xảy ra.' },
    { q: 'Sau khi observable phát <code>error</code>?', options: ['Tiếp tục phát giá trị', 'Stream kết thúc, complete không được gọi', 'Tự khởi động lại'], answer: 1, why: 'error và complete đều là sự kiện kết thúc, loại trừ nhau.' },
    { q: 'Quên unsubscribe khỏi interval(1000) sẽ?', options: ['Không sao cả', 'Nó chạy mãi và rò rỉ bộ nhớ', 'Tự dừng sau 10 giây'], answer: 1, why: 'interval không bao giờ complete.' },
    { q: 'Operator nào hủy request cũ khi có giá trị mới?', options: ['map', 'switchMap', 'filter'], answer: 1, why: 'switchMap chuyển sang observable mới và unsubscribe observable trước đó.' },
    { q: 'EventEmitter của Angular là?', options: ['Một Subject có thêm emit()', 'Sự kiện DOM thuần', 'Một Promise'], answer: 0, why: 'Nó kế thừa Subject (một Observable) và có emit() để phát giá trị.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const R = Rx;

    /* ===== marble lab ===== */
    const SPAN = 5000, COLORS = ['#3aa0ff', '#ff6fb1', '#f39b3d', '#a77bff', '#2fb67c', '#e0b400'];
    const OPS = {
      none: { label: '— (không)', code: null },
      map: { label: 'map(x => x * 10)', code: 'map(x => x * 10)', make: () => R.map(x => x * 10) },
      filter: { label: 'filter(x => x % 2 === 1)  (giữ số lẻ)', code: 'filter(x => x % 2 === 1)', make: () => R.filter(x => x % 2 === 1) },
      take: { label: 'take(3)', code: 'take(3)', make: () => R.take(3) },
      scan: { label: 'scan((tổng, x) => tổng + x, 0)', code: 'scan((tổng, x) => tổng + x, 0)', make: () => R.scan((a, x) => a + x, 0) },
      delay: { label: 'delay(600)', code: 'delay(600)', make: () => R.delay(600) },
      debounce: { label: 'debounceTime(300)', code: 'debounceTime(300)', make: () => R.debounceTime(300) },
      distinct: { label: 'distinctUntilChanged()', code: 'distinctUntilChanged()', make: () => R.distinctUntilChanged() }
    };
    const SRC = {
      steady: { name: 'source$', events: [[0, 1], [400, 2], [800, 3], [1200, 4], [1600, 5]], end: 1700 },
      burst: { name: 'keystrokes$', events: [[0, 1], [100, 2], [200, 3], [1000, 4], [1100, 5], [2000, 6]], end: 2150 }
    };
    const sels = [...root.querySelectorAll('.mb-op')];
    sels.forEach((s, i) => { s.innerHTML = Object.entries(OPS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join(''); if (i === 0) s.value = 'map'; });
    let marbleSub = null;
    function drawCode() {
      const chosen = sels.map(s => OPS[s.value].code).filter(Boolean);
      const name = SRC[$('#mb-src').value].name;
      $('#mb-code').textContent = `${name}\n  .pipe(${chosen.length ? '\n    ' + chosen.join(',\n    ') + '\n  ' : ''})\n  .subscribe(...)`;
    }
    const dot = (track, t, label, kind, i) => {
      const d = document.createElement('div');
      d.className = 'bar';
      const left = Math.min(t / SPAN * 100, 97);
      d.style.cssText = `left:${left}%;top:6px;height:26px;width:auto;min-width:26px;text-align:center;border-radius:99px;padding:3px 6px;` +
        (kind === 'complete' ? 'background:var(--text);width:4px;min-width:4px;padding:0;border-radius:2px;top:3px;height:32px;' :
         kind === 'error' ? 'background:var(--err);' : `background:${COLORS[i % COLORS.length]};`);
      d.textContent = kind === 'next' ? label : kind === 'error' ? '✖' : '';
      track.appendChild(d);
    };
    function runMarble() {
      marbleSub && marbleSub.unsubscribe();
      const top = $('#mb-top'), bot = $('#mb-bot'); top.innerHTML = bot.innerHTML = '';
      const src = SRC[$('#mb-src').value], t0 = performance.now(), now = () => performance.now() - t0;
      const source$ = new R.Observable(o => {
        const ids = src.events.map(([t, v]) => setTimeout(() => o.next(v), t));
        ids.push(setTimeout(() => o.complete(), src.end));
        return () => ids.forEach(clearTimeout);
      });
      const ops = sels.map(s => OPS[s.value].make && OPS[s.value].make()).filter(Boolean);
      const tapped = source$.pipe(R.tap(v => dot(top, now(), v, 'next', v - 1)));
      let n = 0;
      let doneTop = false;
      const topDone = source$.subscribe({ complete: () => dot(top, now(), '', 'complete') });   // vạch kết thúc của nguồn
      $('#mb-info').textContent = 'Đang chạy…';
      marbleSub = tapped.pipe(...ops).subscribe({
        next: v => dot(bot, now(), Number.isInteger(v) ? v : +(+v).toFixed(2), 'next', n++),
        error: e => { dot(bot, now(), '', 'error'); $('#mb-info').textContent = 'Lỗi: ' + e.message; },
        complete: () => { dot(bot, now(), '', 'complete'); $('#mb-info').textContent = 'Hoàn thành (vạch đen = complete). Có ' + n + ' sự kiện ở đầu ra.'; }
      });
      const orig = marbleSub.unsubscribe.bind(marbleSub);
      marbleSub.unsubscribe = () => { orig(); topDone.unsubscribe(); };
    }
    root.querySelectorAll('#w-marble select').forEach(s => s.onchange = drawCode);
    $('#mb-go').onclick = runMarble; drawCode();

    /* ===== subject lab ===== */
    const log = $('#sj-log');
    let subj, subs, seq;
    const say = (t, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    const refresh = () => { const names = Object.keys(subs).filter(k => subs[k] && !subs[k].closed); $('#sj-count').textContent = names.length; $('#sj-who').innerHTML = names.map(n => `<span class="pill fulfilled">${n}</span>`).join(' ') || '<i>không ai</i>'; };
    function resetSubj() {
      subj = new R.EventEmitter(); subs = {}; seq = 0; log.innerHTML = '';
      say('const emitter = new EventEmitter();', 'dim'); refresh();
    }
    const sub = n => { if (subs[n] && !subs[n].closed) return say(`${n} đã đăng ký rồi`, 'dim'); subs[n] = subj.subscribe({ next: v => say(`  ${n} nhận: ${v}`, 'ok'), error: e => say(`  ${n} nhận lỗi: ${e}`, 'err'), complete: () => say(`  ${n}: complete`, 'dim') }); say(`${n} = emitter.subscribe(...)`); refresh(); };
    const unsub = n => { if (subs[n] && !subs[n].closed) { subs[n].unsubscribe(); say(`${n}.unsubscribe()`); } else say(`${n} chưa đăng ký / đã hủy`, 'dim'); refresh(); };
    $('#sj-subA').onclick = () => sub('A'); $('#sj-subB').onclick = () => sub('B');
    $('#sj-unA').onclick = () => unsub('A'); $('#sj-unB').onclick = () => unsub('B');
    $('#sj-emit').onclick = () => { const v = 'msg#' + ++seq; say(`emitter.emit('${v}')`); subj.emit(v); if (!subj.observers.size) say('  (không ai nghe)', 'dim'); };
    $('#sj-complete').onclick = () => { say('emitter.complete()'); subj.complete(); refresh(); };
    $('#sj-error').onclick = () => { say("emitter.error('boom')"); subj.error('boom'); refresh(); };
    $('#sj-reset').onclick = resetSubj; resetSubj();

    /* ===== typeahead ===== */
    const ponies = ['Rainbow Dash', 'Rainbow Blitz', 'Pinkie Pie', 'Pinkie Hope', 'Applejack', 'Apple Bloom', 'Fluttershy', 'Twilight Sparkle', 'Rarity'];
    const taLog = $('#ta-log'), taRes = $('#ta-res');
    let sent = 0, cancelled = 0, shown = 0, mode = 'rx';
    const stat = () => { $('#ta-sent').textContent = sent; $('#ta-cancel').textContent = cancelled; $('#ta-shown').textContent = shown; };
    const tlog = (t, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; taLog.appendChild(d); taLog.scrollTop = taLog.scrollHeight; };
    function search(q) {
      return new R.Observable(o => {
        const ms = 200 + Math.floor(Math.random() * 700), t0 = performance.now(); let done = false;
        sent++; stat(); tlog(`→ GET ?q=${q}  (sẽ mất ${ms}ms)`);
        const id = setTimeout(() => { done = true; o.next({ q, list: ponies.filter(p => p.toLowerCase().includes(q.toLowerCase())) }); o.complete(); tlog(`✓ về '${q}' sau ${Math.round(performance.now() - t0)}ms`, 'ok'); }, ms);
        return () => { clearTimeout(id); if (!done) { cancelled++; stat(); tlog(`✖ HUỶ '${q}'`, 'err'); } };
      });
    }
    const show = r => { shown++; stat(); taRes.innerHTML = `<div class="hint">kết quả cho “${esc(r.q)}”</div>` + (r.list.map(p => `<div class="kv hit"><span class="k">🐴</span><span class="v">${esc(p)}</span></div>`).join('') || '<i>không có</i>'); };
    const input = $('#ta-in');
    // mode naive: mỗi phím một subscription riêng, không hủy
    R.fromEvent(input, 'input').subscribe(() => { if (mode === 'naive' && input.value.trim()) search(input.value.trim()).subscribe(show); });
    // mode rx: pipeline đúng chuẩn
    R.fromEvent(input, 'input').pipe(
      R.map(() => input.value.trim()), R.filter(() => mode === 'rx'),
      R.debounceTime(300), R.distinctUntilChanged(), R.filter(q => q.length > 0),
      R.switchMap(q => search(q))
    ).subscribe(show);
    root.querySelectorAll('input[name=tam]').forEach(r => r.onchange = () => { mode = r.value; if (!r.checked) return; });
    root.querySelectorAll('input[name=tam]').forEach(r => r.onclick = () => { mode = r.value; });
    $('#ta-clear').onclick = () => { taLog.innerHTML = ''; taRes.innerHTML = ''; sent = cancelled = shown = 0; stat(); };
  }
});
