registerChapter(11, {
  time: '25 phút',
  lead: 'Service = một class thường mà bạn có thể tiêm vào class khác. Angular có sẵn vài service (<code>Title</code>, <code>Meta</code>…), và bạn tự viết service để gom logic và <b>chia sẻ state</b> giữa các component.',
  sections: [
    {
      id: 'what', title: 'Service là gì?',
      html: `
<p>Về cú pháp, service chỉ là một <b>class</b>. Điều làm nó đặc biệt là cách dùng: nó được <b>tiêm</b> (chương 10) và là <b>singleton</b> — một instance duy nhất cho mỗi injector.</p>
<div class="flow">
  <div class="node">Component A</div><span class="arr">↘</span>
  <div class="node hot">Service<small>1 instance duy nhất</small></div><span class="arr">↗</span>
  <div class="node">Component B</div>
</div>
<p>Service thích hợp để: gọi HTTP, chứa logic nghiệp vụ, lưu state dùng chung, bọc API của trình duyệt (title, localStorage…), và để dễ thay bằng bản giả khi test. <b>Component nên mỏng</b>: chủ yếu hiển thị, còn việc nặng giao cho service.</p>`
    },
    {
      id: 'title', title: 'Title service – đổi tiêu đề trang',
      html: `
<p>Hỏi nhiều nhất: “làm sao đổi title của trang?”. Inject <code>Title</code> từ <code>@angular/platform-browser</code>, có <code>getTitle()</code> và <code>setTitle()</code>.</p>
<textarea class="code" data-lang="ts" data-title="app.component.ts">
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({ selector: 'ns-root', template: \`<h1>PonyRacer</h1>\` })
export class AppComponent {
  constructor(title: Title) {
    title.setTitle('PonyRacer - Bet on ponies');
  }
}
</textarea>

<div class="widget" id="w-title">
  <h4>🏷 Thử đổi title thật của tab trình duyệt</h4>
  <p class="hint">Mô phỏng <code>Title</code> bằng cách bọc <code>document.title</code>. Nhìn lên tab trình duyệt khi bấm.</p>
  <div class="row">
    <input type="text" id="ti-in" value="PonyRacer - Bet on ponies" style="min-width:260px">
    <button class="btn" id="ti-set">setTitle()</button>
    <button class="btn alt" id="ti-reset">Khôi phục</button>
  </div>
  <p style="margin-top:10px">getTitle() → <span class="mono" id="ti-out"></span></p>
</div>
<div class="box tip"><b>Dùng thực tế</b><p>Mỗi trang (route) nên có title riêng — tốt cho SEO và người dùng. Router của Angular hiện hỗ trợ đặt <code>title</code> ngay trong cấu hình route (chương 18).</p></div>`
    },
    {
      id: 'meta', title: 'Meta service – thẻ &lt;meta&gt;',
      html: `
<p><code>Meta</code> quản lý các thẻ <code>&lt;meta&gt;</code> trong <code>&lt;head&gt;</code>: mô tả trang, tác giả, thẻ cho mạng xã hội…</p>
<textarea class="code" data-lang="ts">
import { Meta } from '@angular/platform-browser';

constructor(meta: Meta) {
  meta.addTag({ name: 'author', content: 'Ninja Squad' });
  meta.updateTag({ name: 'description', content: 'Bet on ponies!' });
  const tag = meta.getTag('name="author"');
  meta.removeTag('name="author"');
}
</textarea>

<div class="widget" id="w-meta">
  <h4>🧾 Thử thêm thẻ meta vào &lt;head&gt;</h4>
  <p class="hint">Mô phỏng <code>addTag</code> / <code>updateTag</code> / <code>removeTag</code>. Danh sách dưới hiển thị các thẻ do widget này tạo ra.</p>
  <div class="row" style="margin-bottom:10px">
    <input type="text" id="me-name" value="author" style="width:120px">
    <input type="text" id="me-content" value="Ninja Squad" style="width:200px">
    <button class="btn" id="me-add">addTag</button>
    <button class="btn alt" id="me-upd">updateTag</button>
    <button class="btn alt" id="me-rm">removeTag</button>
  </div>
  <pre class="hl" id="me-list" style="border-radius:8px;min-height:44px"></pre>
</div>`
    },
    {
      id: 'own', title: 'Tự viết service',
      html: `
<p>Đơn giản như viết một class. Nếu service <b>có phụ thuộc</b>, cần <code>@Injectable()</code> để Angular sinh metadata và đăng ký bằng <code>providedIn: 'root'</code>.</p>
<textarea class="code" data-lang="ts" data-title="races.service.ts – gọi HTTP">
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RacesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Array<RaceModel>> {
    return this.http.get<Array<RaceModel>>('/api/races');
  }
}
</textarea>
<p>Vì <code>HttpClient</code> được tiêm, trong test ta thay nó bằng bản giả. Mô phỏng bằng JS thuần — chú ý <b>cùng một <code>RacesService</code> chạy với “http thật” hoặc “http giả” mà không sửa dòng nào</b>:</p>
<textarea class="live" data-time data-title="Service + HttpClient giả có độ trễ">
// "HttpClient" thật sẽ gọi mạng; ở đây giả lập độ trễ 400ms
class FakeHttpClient {
  get(url) { return new Promise(r => setTimeout(() => r([{ name: 'London' }, { name: 'Paris' }]), 400)); }
}
class RacesService {
  constructor(http) { this.http = http; }          // nhận http từ bên ngoài (DI)
  list() { return this.http.get('/api/races'); }
}

const service = new RacesService(new FakeHttpClient());
console.log('đang tải...');
const races = await service.list();
console.log('nhận được', races.length, 'cuộc đua:', races.map(r => r.name).join(', '));
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b>
<textarea class="code" data-lang="ts">
@Injectable({ providedIn: 'root' })
export class RacesService {
  private http = inject(HttpClient);
  list() { return this.http.get<RaceModel[]>('/api/races'); }
}
// HttpClient được cung cấp bởi provideHttpClient() trong app.config.ts
</textarea></div>`
    },
    {
      id: 'share', title: 'Chia sẻ state giữa các component',
      html: `
<p>Vì service là singleton, hai component <b>không liên quan nhau</b> (không cha–con) vẫn có thể chia sẻ dữ liệu qua nó. Thử ngay: hai “component” dưới đây dùng chung <code>BetService</code>.</p>

<div class="widget" id="w-share">
  <h4>🎰 BetService dùng chung</h4>
  <p class="hint">Bên trái là component <b>BetButtons</b> (đặt cược), bên phải là <b>BetSummary</b> (hiện tổng). Chuyển chế độ đăng ký để thấy vì sao vị trí đăng ký quan trọng.</p>
  <div class="row" style="margin-bottom:12px">
    <label><input type="radio" name="sh" value="root" checked> <code>providedIn: 'root'</code> (1 instance chung)</label>
    <label><input type="radio" name="sh" value="own"> <code>providers: [BetService]</code> trong từng component (mỗi nơi 1 instance)</label>
  </div>
  <div class="grid2">
    <div class="widget" style="margin:0">
      <b>BetButtons</b>
      <div class="row" style="margin:8px 0" id="sh-btns"></div>
    </div>
    <div class="widget" style="margin:0">
      <b>BetSummary</b>
      <div id="sh-sum" style="margin-top:8px"></div>
    </div>
  </div>
  <p id="sh-note" class="hint" style="margin-top:10px"></p>
</div>

<textarea class="live" data-title="Service giữ state + cho component “đăng ký lắng nghe” (ý tưởng của Observable, chương 13)">
class BetService {
  bets = [];
  listeners = [];
  place(pony, amount) {
    this.bets = [...this.bets, { pony, amount }];     // tạo mảng mới, không sửa mảng cũ
    this.listeners.forEach(fn => fn(this.bets));       // báo cho mọi nơi đang lắng nghe
  }
  subscribe(fn) { this.listeners.push(fn); fn(this.bets); }
}

const shared = new BetService();                       // singleton

// Hai "component" độc lập cùng dùng service
const summary = bets => console.log('Summary thấy', bets.length, 'cược, tổng', bets.reduce((s, b) => s + b.amount, 0), '€');
shared.subscribe(summary);                             // component B lắng nghe

shared.place('Rainbow Dash', 10);                      // component A đặt cược
shared.place('Pinkie Pie', 25);
</textarea>
<div class="box warn"><b>Chú ý khi chia sẻ state</b><p>Cập nhật bằng cách <b>tạo giá trị mới</b> (<code>[...bets, bet]</code>) thay vì sửa tại chỗ giúp Angular phát hiện thay đổi dễ hơn. Ở chương 13 ta thay phần “listeners” tự viết này bằng <b>Observable/RxJS</b>.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>Service giữ state thường dùng <b>signals</b>: <code>bets = signal&lt;Bet[]&gt;([])</code> và <code>total = computed(...)</code>; component đọc trực tiếp, không cần tự quản lý listener.</p></div>`
    },
    {
      id: 'tips', title: 'Quy tắc nhanh khi viết service',
      html: `
<div class="tablewrap"><table>
<tr><th>Việc</th><th>Làm thế nào</th></tr>
<tr><td>Service dùng chung cả app</td><td><code>@Injectable({ providedIn: 'root' })</code></td></tr>
<tr><td>Service có phụ thuộc</td><td>Phải có <code>@Injectable</code> (hoặc <code>inject()</code>)</td></tr>
<tr><td>Service riêng cho một component</td><td><code>providers: [X]</code> trong <code>@Component</code></td></tr>
<tr><td>Đặt tên file</td><td><code>races.service.ts</code>, class <code>RacesService</code></td></tr>
<tr><td>Test</td><td>Thay dependency bằng giả; hoặc tạo service trực tiếp <code>new RacesService(fakeHttp)</code></td></tr>
</table></div>
<p>Tiếp theo trong sách: <b>Pipe</b> (chương 12) — biến đổi dữ liệu ngay trong template.</p>`
    }
  ],
  quiz: [
    { q: 'Service trong Angular về bản chất là gì?', options: ['Một loại file đặc biệt', 'Một class thường có thể được tiêm, mặc định là singleton', 'Một component không có template'], answer: 1, why: 'Chỉ là class; điều đặc biệt đến từ cách đăng ký & tiêm.' },
    { q: 'Service nào đổi tiêu đề của tab?', options: ['Meta', 'Title', 'Document'], answer: 1, why: 'Title.setTitle(). Meta dùng cho các thẻ <meta>.' },
    { q: 'Khi nào service BẮT BUỘC cần @Injectable?', options: ['Luôn luôn', 'Khi chính nó có phụ thuộc cần tiêm', 'Không bao giờ'], answer: 1, why: 'Decorator giúp Angular có metadata để tiêm phụ thuộc cho service đó.' },
    { q: 'Hai component dùng chung state qua service nhưng cập nhật không đồng bộ. Nguyên nhân hay gặp?', options: ['Service được khai báo providers ở từng component nên mỗi nơi 1 instance', 'Angular bị lỗi', 'Quên import CSS'], answer: 0, why: 'Provider ở component tạo instance riêng; muốn chung phải đăng ký ở root.' },
    { q: 'Vì sao nên tiêm HttpClient vào service thay vì tự tạo?', options: ['Để dễ thay bằng bản giả khi test', 'Để code dài hơn', 'Vì bắt buộc bởi TypeScript'], answer: 0, why: 'DI cho phép thay dependency khi test hoặc cấu hình.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== Title ===== */
    class Title { getTitle() { return document.title; } setTitle(t) { document.title = t; } }
    const title = new Title(); let original = null; const tout = $('#ti-out');
    const showT = () => (tout.textContent = JSON.stringify(title.getTitle()));
    $('#ti-set').onclick = () => { if (original === null) original = document.title; title.setTitle($('#ti-in').value); showT(); };
    $('#ti-reset').onclick = () => { if (original !== null) title.setTitle(original); showT(); };
    showT();

    /* ===== Meta ===== */
    class Meta {
      getTag(name) { return document.head.querySelector(`meta[name="${name}"][data-ninja]`); }
      addTag(def) { const m = document.createElement('meta'); m.setAttribute('data-ninja', ''); m.name = def.name; m.content = def.content; document.head.appendChild(m); }
      updateTag(def) { const m = this.getTag(def.name); if (m) m.content = def.content; else this.addTag(def); }
      removeTag(name) { const m = this.getTag(name); if (m) m.remove(); }
    }
    const meta = new Meta();
    document.head.querySelectorAll('meta[data-ninja]').forEach(m => m.remove());
    const draw = () => {
      const tags = [...document.head.querySelectorAll('meta[data-ninja]')];
      $('#me-list').textContent = tags.length ? tags.map(t => `<meta name="${t.name}" content="${t.content}">`).join('\n') : '<!-- chưa có thẻ nào -->';
    };
    const def = () => ({ name: $('#me-name').value.trim(), content: $('#me-content').value });
    $('#me-add').onclick = () => { const d = def(); if (d.name) meta.addTag(d); draw(); };
    $('#me-upd').onclick = () => { const d = def(); if (d.name) meta.updateTag(d); draw(); };
    $('#me-rm').onclick = () => { meta.removeTag(def().name); draw(); };
    draw();

    /* ===== chia sẻ state ===== */
    class BetService {
      constructor() { this.bets = []; this.listeners = []; this.id = ++BetService.n; }
      place(pony, amount) { this.bets = [...this.bets, { pony, amount }]; this.listeners.forEach(f => f(this.bets)); }
      subscribe(f) { this.listeners.push(f); f(this.bets); }
    }
    BetService.n = 0;
    let svcButtons, svcSummary, note = $('#sh-note');
    const ponies = [['🐴 Rainbow Dash', 10], ['🦄 Pinkie Pie', 25], ['🐎 Applejack', 50]];
    function setup() {
      BetService.n = 0;
      const mode = root.querySelector('input[name=sh]:checked').value;
      const shared = new BetService();
      svcButtons = shared; svcSummary = mode === 'root' ? shared : new BetService();
      if (mode === 'own') svcButtons = new BetService();
      $('#sh-sum').innerHTML = '';
      svcSummary.subscribe(bets => {
        const total = bets.reduce((s, b) => s + b.amount, 0);
        $('#sh-sum').innerHTML = `<div><b>${bets.length}</b> cược — tổng <b>${total} €</b></div>` + bets.map(b => `<div class="kv hit"><span class="k">${b.pony}</span><span class="v">${b.amount}€</span></div>`).join('');
      });
      note.innerHTML = mode === 'root'
        ? `Cả hai component nhận <b>cùng</b> BetService#${svcButtons.id}. Bấm cược bên trái → bên phải cập nhật.`
        : `BetButtons dùng BetService#${svcButtons.id}, BetSummary dùng BetService#${svcSummary.id} — <b>hai instance khác nhau</b>, nên bên phải không bao giờ thấy cược. Đây chính là lỗi “đăng ký sai chỗ”.`;
    }
    $('#sh-btns').innerHTML = ponies.map((p, i) => `<button class="btn alt" data-i="${i}">${p[0]} +${p[1]}€</button>`).join('');
    root.querySelectorAll('#sh-btns button').forEach(b => b.onclick = () => { const p = ponies[+b.dataset.i]; svcButtons.place(p[0], p[1]); });
    root.querySelectorAll('input[name=sh]').forEach(r => r.onchange = setup);
    setup();
  }
});
