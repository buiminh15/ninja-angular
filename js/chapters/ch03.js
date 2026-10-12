registerChapter(3, {
  time: '20 phút',
  lead: 'Vì sao Angular chọn TypeScript? Chương này trả lời bằng ví dụ: kiểu giúp bạn bắt lỗi sớm, và — quan trọng hơn — giúp framework biết phải “tiêm” (inject) cái gì vào class của bạn.',
  sections: [
    {
      id: 'dynamic', title: 'JavaScript có kiểu động',
      html: `
<p>Trong JS, một biến có thể đổi kiểu bất cứ lúc nào, và hàm nhận “bất kỳ thứ gì” miễn là nó có thuộc tính hàm cần (còn gọi là <i>duck typing</i>).</p>
<textarea class="live" data-title="Linh hoạt… nhưng cũng nguy hiểm">
let pony = 'Rainbow Dash';
pony = 2;                       // vẫn chạy, không phàn nàn
console.log(typeof pony);

const pony2 = { name: 'Rainbow Dash', color: 'blue' };
const horse = { speed: 40, color: 'black' };
const printColor = animal => console.log(animal.color);

printColor(pony2);              // blue
printColor(horse);              // black
printColor({ colour: 'red' });  // gõ nhầm "colour" -> undefined, KHÔNG lỗi
printColor();                   // đây mới nổ
</textarea>
<p>Hai dòng cuối là vấn đề thật: lỗi chỉ lộ ra <b>khi chạy</b>, thậm chí không lộ (<code>undefined</code> lặng lẽ). Và khi gọi hàm của người khác, bạn phải đọc doc hoặc đọc code mới biết tham số trông ra sao.</p>`
    },
    {
      id: 'why', title: 'Kiểu tĩnh giúp gì? Thử ngay',
      html: `
<p>Với kiểu tĩnh, trình biên dịch và IDE <b>biết hình dạng dữ liệu</b> trước khi chạy: gợi ý code, báo lỗi ngay khi gõ, refactor an toàn. Bạn chọn một lời gọi hàm bên dưới để so sánh hai thế giới.</p>

<div class="widget" id="w-types">
  <h4>🧪 JS thường vs TypeScript</h4>
  <p class="hint">Hàm: <span class="mono">function printColor(animal: { color: string }) { console.log(animal.color); }</span></p>
  <div class="row" style="margin-bottom:10px">
    <label>Lời gọi: <select id="ty-call"></select></label>
  </div>
  <div class="grid2">
    <div><b>JavaScript</b><div id="ty-js" class="output" style="border-radius:8px;margin-top:6px"></div></div>
    <div><b>TypeScript (lúc gõ code)</b><div id="ty-ts" class="output" style="border-radius:8px;margin-top:6px"></div></div>
  </div>
</div>

<div class="box tip"><b>Điểm mấu chốt</b><p>TypeScript <b>không thay đổi cách chương trình chạy</b>. Nó chỉ kiểm tra trước, rồi <i>xoá kiểu đi</i> và sinh ra JavaScript thường. Kiểu là “hợp đồng” cho người và công cụ, không tồn tại lúc chạy.</p></div>`
    },
    {
      id: 'history', title: 'Enter TypeScript',
      html: `
<p>Google từng tính tạo <b>AtScript</b> (ES2015+ cộng chú thích kiểu và annotation). Sau đó họ làm việc cùng nhóm TypeScript của Microsoft; TypeScript 1.5 có đủ thứ Angular cần, AtScript bị bỏ, và <b>TypeScript trở thành cách chính thức để viết Angular</b>.</p>
<div class="flow">
  <div class="node">app.ts<small>code + kiểu</small></div><span class="arr">→</span>
  <div class="node hot">tsc<small>kiểm tra kiểu<br>+ xoá kiểu</small></div><span class="arr">→</span>
  <div class="node">app.js<small>JavaScript thường</small></div><span class="arr">→</span>
  <div class="node">Trình duyệt</div>
</div>
<ul>
<li><b>Kiểu là tuỳ chọn</b>: bạn thêm dần, hệ thống kiểu “giúp mà không cản đường”.</li>
<li><b>Superset của JS</b>: mọi JS hợp lệ đều là TS hợp lệ.</li>
<li>Mã nguồn mở, cộng đồng lớn; Angular được thiết kế để tận dụng nó.</li>
</ul>
<div class="box modern"><b>🆕 Hiện nay</b><p>TypeScript đã gần như là chuẩn chung của hệ sinh thái web (React, Vue, Node đều dùng rộng rãi). Ý tưởng đưa kiểu vào JS chuẩn vẫn đang được bàn trong TC39 nhưng chưa thành chuẩn, nên bạn vẫn cần bước biên dịch.</p></div>`
    },
    {
      id: 'di', title: 'Ví dụ thực tế: Dependency Injection',
      html: `
<p>Component <code>RaceList</code> cần danh sách cuộc đua từ <code>RaceService</code>. Có hai cách viết, và khác biệt lớn nhất lộ ra khi <b>kiểm thử</b>.</p>
<h3>Cách 1: tự <code>new</code> bên trong (khó test)</h3>
<textarea class="live" data-title="RaceList tự tạo RaceService – bị dính chặt vào bản thật">
class RaceService {
  list() {                                    // bản thật: gọi server
    return new Promise(r => setTimeout(() => r(['Race A', 'Race B']), 300));
  }
}
class RaceList {
  constructor() {
    this.raceService = new RaceService();     // cứng!
    this.raceService.list().then(races => (this.races = races));
  }
}
const rl = new RaceList();
// Muốn test thì sao? Không thay RaceService bằng bản giả được,
// mỗi lần test lại gọi "server" thật (chậm, không ổn định).
setTimeout(() => console.log(rl.races), 400);
</textarea>
<h3>Cách 2: được “tiêm” vào qua constructor</h3>
<textarea class="live" data-title="RaceList nhận service từ bên ngoài – test dễ dàng">
class RaceList {
  constructor(raceService) {                  // ai đó đưa vào cho tôi
    this.raceService = raceService;
    this.raceService.list().then(races => (this.races = races));
  }
}

// Trong test: đưa một bản giả (fake / mock)
const fakeService = { list: () => Promise.resolve(['Fake race']) };
const rl = new RaceList(fakeService);

await Promise.resolve();                      // chờ promise
console.log('races =', rl.races);             // kết quả hoàn toàn do ta kiểm soát
</textarea>
<div class="box info"><b>Ý chính</b><p>DI = <i>không tự tạo thứ mình cần, mà xin từ bên ngoài</i>. Framework chịu trách nhiệm tạo và đưa vào. Việc còn lại: framework biết cần đưa gì bằng cách nào?</p></div>`
    },
    {
      id: 'metadata', title: 'Framework biết cần tiêm gì bằng cách nào?',
      html: `
<p>AngularJS 1.x đọc <b>tên tham số</b>, nhưng khi minify (rút gọn code) tên đổi thành <code>a</code>, <code>b</code> nên hỏng — phải thêm metadata thủ công <code>RaceList.$inject = ['RaceService']</code>. Với TypeScript, <b>kiểu của tham số chính là metadata</b>: <code>constructor(raceService: RaceService)</code>.</p>

<div class="widget" id="w-di">
  <h4>🏭 Mini injector</h4>
  <p class="hint">Mô phỏng cách framework dùng metadata để lắp ghép. Bấm “Tạo RaceList”: injector đọc danh sách phụ thuộc, tự tạo từng cái rồi truyền vào.</p>
  <div class="row" style="margin-bottom:10px">
    <label>Môi trường:
      <select id="di-env"><option value="real">Chạy thật (RaceService thật)</option><option value="test">Đang test (FakeRaceService)</option></select></label>
    <button class="btn" id="di-go">⚙ Tạo RaceList</button>
  </div>
  <div class="flow" id="di-flow"></div>
  <div id="di-log" class="mono" style="font-size:13px;color:var(--muted);white-space:pre-wrap"></div>
</div>

<textarea class="live" data-title="Tự viết injector rất nhỏ (cùng ý tưởng với Angular)">
// "Metadata": mỗi class khai báo nó cần gì
class Http  { get() { return 'dữ liệu từ server'; } }
class RaceService {
  static deps = [Http];
  constructor(http) { this.http = http; }
  list() { return [this.http.get()]; }
}
class RaceList {
  static deps = [RaceService];
  constructor(raceService) { this.races = raceService.list(); }
}

// Injector: đọc deps, đệ quy tạo, truyền vào constructor
const providers = new Map();
function inject(Type) {
  const Impl = providers.get(Type) || Type;
  const args = (Impl.deps || []).map(inject);
  return new Impl(...args);
}

console.log(inject(RaceList).races);

// Test: đổi nhà cung cấp cho Http bằng một bản giả
providers.set(Http, class FakeHttp { get() { return 'dữ liệu GIẢ'; } });
console.log(inject(RaceList).races);
</textarea>
<textarea class="code" data-lang="ts" data-title="Cùng ý tưởng, viết bằng TypeScript + Angular">
@Injectable({ providedIn: 'root' })
class RaceService { list() { /* ... */ } }

class RaceList {
  races: Array<string> = [];
  constructor(private raceService: RaceService) {   // kiểu = metadata để inject
    this.raceService.list().then(races => (this.races = races));
  }
}
</textarea>
<div class="box modern"><b>🆕 Angular hiện đại</b>
<p>Ngoài <code>constructor(private raceService: RaceService)</code>, bạn thường thấy <code>inject()</code> — cùng cơ chế DI, không cần kiểu tham số:</p>
<textarea class="code" data-lang="ts">
class RaceList {
  private raceService = inject(RaceService);
  races = signal<string[]>([]);
}
</textarea>
<p>Chi tiết DI ở chương 10.</p></div>`
    },
    {
      id: 'next', title: 'Tiếp theo',
      html: `
<p>Bạn đã biết <b>vì sao</b> dùng TypeScript. Ba chương tới là <b>cách dùng</b>: chương 4 học cú pháp kiểu, enum, interface, class, decorator; chương 5 đi vào các kiểu nâng cao. Sau đó ta quay lại Angular.</p>`
    }
  ],
  quiz: [
    { q: 'Điều nào đúng về TypeScript?', options: ['Trình duyệt chạy trực tiếp file .ts', 'Được biên dịch thành JavaScript, kiểu bị xoá khi chạy', 'Thay thế hoàn toàn JavaScript'], answer: 1, why: 'tsc kiểm tra kiểu rồi sinh JS thường; kiểu chỉ có tác dụng lúc phát triển.' },
    { q: '<code>printColor({ colour: "red" })</code> (gõ sai) bị phát hiện khi nào?', options: ['Luôn lúc chạy, với JS', 'Ngay lúc gõ/biên dịch nếu tham số có kiểu { color: string }', 'Không bao giờ'], answer: 1, why: 'Kiểu tĩnh cho phép báo lỗi trước khi chạy; JS thuần chỉ trả undefined lặng lẽ.' },
    { q: 'Lợi ích lớn nhất của DI khi test?', options: ['Code chạy nhanh hơn', 'Thay được dependency thật bằng bản giả', 'Không cần viết class'], answer: 1, why: 'Vì class nhận dependency từ ngoài, test chỉ cần đưa vào một fake.' },
    { q: 'Angular biết cần tiêm gì vào constructor nhờ?', options: ['Tên tham số', 'Kiểu của tham số (hoặc inject()) làm metadata', 'Phép thuật'], answer: 1, why: 'Tên tham số bị minify làm hỏng; kiểu/token bền vững hơn.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);

    /* ===== JS vs TS ===== */
    const cases = [
      { call: "printColor({ color: 'blue' })", js: 'blue', jsOk: true, ts: '✓ Hợp lệ', tsOk: true },
      { call: "printColor({ colour: 'red' })", js: 'undefined  (gõ nhầm, không ai báo)', jsOk: false, ts: "✖ Lỗi: 'colour' không có trong { color: string }\n   Bạn có ý định gõ 'color'?", tsOk: false },
      { call: 'printColor()', js: "TypeError: Cannot read properties of undefined (reading 'color')\n(chỉ nổ khi chạy tới đây)", jsOk: false, ts: "✖ Lỗi: Cần 1 tham số nhưng nhận 0", tsOk: false },
      { call: "printColor('blue')", js: 'undefined  (chuỗi không có .color)', jsOk: false, ts: "✖ Lỗi: 'string' không gán được cho { color: string }", tsOk: false },
      { call: "printColor({ color: 42 })", js: '42  (chạy, nhưng sai ý)', jsOk: false, ts: "✖ Lỗi: 'number' không gán được cho 'string'", tsOk: false }
    ];
    const sel = $('#ty-call');
    sel.innerHTML = cases.map((c, i) => `<option value="${i}">${c.call}</option>`).join('');
    const paint = () => {
      const c = cases[+sel.value];
      $('#ty-js').innerHTML = `<span class="${c.jsOk ? 'ok' : 'err'}">${c.js.replace(/</g, '&lt;')}</span>`;
      $('#ty-ts').innerHTML = `<span class="${c.tsOk ? 'ok' : 'err'}">${c.ts.replace(/</g, '&lt;')}</span>`;
    };
    sel.onchange = paint; paint();

    /* ===== mini injector ===== */
    const flow = $('#di-flow'), log = $('#di-log');
    const draw = (active, env) => {
      const nodes = [
        ['RaceList', 'cần RaceService'],
        ['RaceService', env === 'test' ? 'THAY bằng FakeRaceService' : 'bản thật'],
        ['Http', env === 'test' ? '(không cần)' : 'bản thật']
      ];
      flow.innerHTML = nodes.map((n, i) => `${i ? '<span class="arr">→</span>' : ''}<div class="node fade ${i <= active ? 'hot' : ''}">${n[0]}<small>${n[1]}</small></div>`).join('');
    };
    draw(-1, 'real');
    $('#di-go').onclick = async () => {
      const env = $('#di-env').value, sleep = ms => new Promise(r => setTimeout(r, ms));
      log.textContent = ''; draw(-1, env);
      const lines = env === 'test'
        ? ['1. Injector đọc RaceList: cần RaceService', '2. Provider cho RaceService = FakeRaceService → tạo bản giả (không đụng Http)', '3. new RaceList(fakeRaceService) ✓  (test nhanh, không gọi server)']
        : ['1. Injector đọc RaceList: cần RaceService', '2. RaceService cần Http → tạo Http', '3. new RaceService(http) rồi new RaceList(raceService) ✓'];
      for (let i = 0; i < lines.length; i++) { await sleep(500); draw(i, env); log.textContent += lines[i] + '\n'; }
    };
  }
});
