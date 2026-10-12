/* Bộ pipe thu nhỏ (en-US) mô phỏng các pipe của Angular để chạy trong widget. */
globalThis.NinjaPipes = (function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const p2 = n => String(n).padStart(2, '0');
  const NAMED = { short: 'M/d/yy, h:mm a', medium: 'MMM d, y, h:mm:ss a', shortDate: 'M/d/yy', mediumDate: 'MMM d, y', longDate: 'MMMM d, y', fullDate: 'EEEE, MMMM d, y', shortTime: 'h:mm a', mediumTime: 'h:mm:ss a' };

  function digits(fmt, defMinInt, defMinFrac, defMaxFrac) {
    let minInt = defMinInt, minFrac = defMinFrac, maxFrac = defMaxFrac;
    if (fmt) {
      const m = /^(\d+)?\.((\d+)(-(\d+))?)?$/.exec(fmt);
      if (!m) throw new Error(`${fmt} is not a valid digit info`);
      if (m[1]) minInt = +m[1];
      if (m[3]) minFrac = +m[3];
      if (m[5]) maxFrac = +m[5]; else if (m[3]) maxFrac = Math.max(minFrac, defMaxFrac);
    }
    return { minInt, minFrac, maxFrac };
  }
  const pipes = {
    json: v => JSON.stringify(v, null, 2),
    slice: (v, s, e) => (v == null ? v : v.slice(s, e)),
    keyvalue: (v, cmp) => {
      if (v == null) return v;
      const ents = (v instanceof Map ? [...v] : Object.entries(v)).map(([key, value]) => ({ key, value }));
      return ents.sort(cmp || ((a, b) => (typeof a.key === 'number' && typeof b.key === 'number' ? a.key - b.key : String(a.key) < String(b.key) ? -1 : String(a.key) > String(b.key) ? 1 : 0)));
    },
    uppercase: v => (v == null ? v : String(v).toUpperCase()),
    lowercase: v => (v == null ? v : String(v).toLowerCase()),
    titlecase: v => (v == null ? v : String(v).replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase())),
    number: (v, fmt) => {
      const d = digits(fmt, 1, 0, 3);
      return new Intl.NumberFormat('en-US', { minimumIntegerDigits: d.minInt, minimumFractionDigits: d.minFrac, maximumFractionDigits: d.maxFrac }).format(v);
    },
    percent: (v, fmt) => {
      const d = digits(fmt, 1, 0, 0);
      return new Intl.NumberFormat('en-US', { style: 'percent', minimumIntegerDigits: d.minInt, minimumFractionDigits: d.minFrac, maximumFractionDigits: d.maxFrac }).format(v);
    },
    currency: (v, code = 'USD', display = 'symbol', fmt) => {
      const cd = { symbol: 'symbol', code: 'code', 'symbol-narrow': 'narrowSymbol' }[display] || 'symbol';
      const base = new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).resolvedOptions();
      const d = digits(fmt, 1, base.minimumFractionDigits, base.maximumFractionDigits);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: cd, minimumIntegerDigits: d.minInt, minimumFractionDigits: d.minFrac, maximumFractionDigits: d.maxFrac }).format(v).replace(/ /g, '');
    },
    date: (v, fmt = 'mediumDate') => {
      if (v == null) return v;
      const d = v instanceof Date ? v : new Date(v);
      if (isNaN(d)) throw new Error('InvalidPipeArgument: Unable to convert to a date');
      fmt = NAMED[fmt] || fmt;
      const h12 = d.getHours() % 12 || 12;
      const map = {
        yyyy: d.getFullYear(), yy: p2(d.getFullYear() % 100), y: d.getFullYear(),
        MMMM: MONTHS[d.getMonth()], MMM: MONTHS[d.getMonth()].slice(0, 3), MM: p2(d.getMonth() + 1), M: d.getMonth() + 1,
        EEEE: DAYS[d.getDay()], EEE: DAYS[d.getDay()].slice(0, 3),
        dd: p2(d.getDate()), d: d.getDate(), HH: p2(d.getHours()), H: d.getHours(), hh: p2(h12), h: h12,
        mm: p2(d.getMinutes()), ss: p2(d.getSeconds()), a: d.getHours() < 12 ? 'AM' : 'PM'
      };
      return fmt.replace(/'[^']*'|yyyy|yy|y|MMMM|MMM|MM|M|EEEE|EEE|dd|d|HH|H|hh|h|mm|ss|a/g, t => (t[0] === "'" ? t.slice(1, -1) : map[t]));
    }
  };

  /* tách theo ký tự ngoài dấu nháy */
  function splitTop(s, ch) {
    const out = []; let cur = '', q = null, depth = 0;
    for (const c of s) {
      if (q) { cur += c; if (c === q) q = null; continue; }
      if (c === "'" || c === '"') { q = c; cur += c; continue; }
      if ('([{'.includes(c)) depth++; if (')]}'.includes(c)) depth--;
      if (c === ch && depth === 0) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur); return out.map(x => x.trim());
  }
  /* chạy "pipe1:a:b | pipe2" lên giá trị; trả về các bước */
  function run(value, chain, scope = {}) {
    const steps = [{ name: '(giá trị gốc)', out: value }];
    let cur = value;
    const names = Object.keys(scope), vals = Object.values(scope);
    for (const seg of splitTop(chain, '|').filter(Boolean)) {
      const [name, ...argSrc] = splitTop(seg, ':');
      const fn = pipes[name];
      if (!fn) throw new Error(`NG0302: The pipe '${name}' could not be found`);
      const args = argSrc.map(a => new Function(...names, 'return (' + a + ')')(...vals));
      cur = fn(cur, ...args);
      steps.push({ name: seg, out: cur });
    }
    return steps;
  }
  return { pipes, run, splitTop };
})();

registerChapter(12, {
  time: '40 phút',
  lead: 'Pipe là các “ống” biến đổi dữ liệu ngay trong template: <code>{{ price | currency }}</code>. Chương này có một <b>phòng thí nghiệm pipe</b> chạy thật (bộ pipe en-US thu nhỏ), và bạn sẽ tự viết pipe <code>fromNow</code>.',
  sections: [
    {
      id: 'intro', title: 'Pipe là gì và cách dùng',
      html: `
<p>Dữ liệu thô thường không phải thứ ta muốn hiển thị: cần lọc, cắt, định dạng. AngularJS gọi là “filter”; Angular gọi là <b>pipe</b>. Cú pháp: <code>giá_trị | tên_pipe : đối_số1 : đối_số2</code>. Có thể <b>xích</b> nhiều pipe: kết quả của pipe trước vào pipe sau.</p>
<textarea class="code" data-lang="html" data-title="Cú pháp">
<p>{{ ponies | json }}</p>
<p>{{ ponies | slice:0:2 | json }}</p>           <!-- xích 2 pipe -->
<p [textContent]="ponies | json"></p>            <!-- dùng được trong property binding -->
</textarea>
<div class="box warn"><b>Không dùng pipe trong event binding</b><p>Pipe dùng ở interpolation và property binding, <u>không</u> dùng trong câu lệnh sự kiện <code>(click)="..."</code>.</p></div>

<div class="widget" id="w-lab">
  <h4>🧪 Phòng thí nghiệm pipe</h4>
  <p class="hint">Nhập một <b>biểu thức JavaScript</b> làm giá trị và chuỗi pipe như trong template. Hoặc bấm một ví dụ mẫu. Mỗi bước trung gian được hiển thị.</p>
  <div class="row" id="lab-presets" style="margin-bottom:10px"></div>
  <label>Giá trị:</label>
  <input type="text" id="lab-val" class="mono" style="width:100%;margin-bottom:8px" spellcheck="false">
  <label>Pipes:</label>
  <input type="text" id="lab-chain" class="mono" style="width:100%;margin-bottom:10px" spellcheck="false">
  <div class="mono" style="background:var(--surface2);border-radius:8px;padding:8px 12px;margin-bottom:10px" id="lab-tpl"></div>
  <div id="lab-out"></div>
</div>
<p>Các phần tiếp theo đi qua từng pipe có sẵn; bạn có thể quay lại phòng thí nghiệm bất cứ lúc nào để thử.</p>`
    },
    {
      id: 'json', title: 'json – nhìn dữ liệu khi debug',
      html: `
<p>Tương đương <code>JSON.stringify</code>. Hữu ích khi debug: <code>{{ ponies }}</code> chỉ in <code>[object Object]</code>, còn <code>{{ ponies | json }}</code> in nội dung thật.</p>
<textarea class="live">
const ponies = [{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }];
console.log('Không pipe :', String(ponies));            // [object Object],[object Object]
console.log('Có json   :', JSON.stringify(ponies, null, 2));
</textarea>`
    },
    {
      id: 'slice', title: 'slice – cắt mảng hoặc chuỗi',
      html: `
<p>Giống <code>slice</code> của JS: <code>slice:bắt_đầu:kết_thúc</code>. Số âm tính từ cuối. Hợp với <code>*ngFor</code> để chỉ hiển thị vài phần tử đầu.</p>
<div class="tablewrap"><table>
<tr><th>Template</th><th>Kết quả</th></tr>
<tr><td><code>'Ninja Squad' | slice:0:5</code></td><td>Ninja</td></tr>
<tr><td><code>'Ninja Squad' | slice:3</code></td><td>ja Squad</td></tr>
<tr><td><code>'Ninja Squad' | slice:-5</code></td><td>Squad</td></tr>
<tr><td><code>'Ninja Squad' | slice:2:-2</code></td><td>nja Squ</td></tr>
</table></div>
<textarea class="code" data-lang="ts" data-title="Dùng với ngFor, đối số có thể là biến">
@Component({
  selector: 'ns-ponies',
  template: \`
    <div *ngFor="let pony of ponies | slice: 0:size as total; index as i">
      {{ i + 1 }}/{{ total.length }}: {{ pony.name }}
    </div>\`
})
export class PoniesComponent {
  size = 2;
  ponies = [{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }, { name: 'Fluttershy' }];
}
</textarea>
<div class="box tip"><b>Thử trong phòng thí nghiệm</b><p>Bấm ví dụ “slice chuỗi” ở widget phía trên.</p></div>`
    },
    {
      id: 'keyvalue', title: 'keyvalue – lặp qua object hoặc Map',
      html: `
<p>Biến object/Map thành mảng <code>{ key, value }</code> <b>có sắp xếp theo khoá</b> (chuỗi theo từ điển, số theo giá trị). Có thể truyền hàm so sánh riêng.</p>
<textarea class="live" data-title="Tương đương pipe keyvalue">
const ponies = new Map();
ponies.set(103, { name: 'Rainbow Dash' });
ponies.set(56, { name: 'Pinkie Pie' });

const entries = [...ponies].map(([key, value]) => ({ key, value }))
                           .sort((a, b) => a.key - b.key);   // sắp theo khoá số
for (const entry of entries) console.log(entry.key + ' - ' + entry.value.name);
</textarea>
<textarea class="code" data-lang="html">
<li *ngFor="let entry of ponies | keyvalue">{{ entry.key }} - {{ entry.value.name }}</li>
<li *ngFor="let e of poniesWithScore | keyvalue: ponyComparator">{{ e.key.name }} - {{ e.value }}</li>
</textarea>`
    },
    {
      id: 'case', title: 'uppercase, lowercase, titlecase',
      html: `
<div class="tablewrap"><table>
<tr><th>Template</th><th>Kết quả</th></tr>
<tr><td><code>'Ninja Squad' | uppercase</code></td><td>NINJA SQUAD</td></tr>
<tr><td><code>'Ninja Squad' | lowercase</code></td><td>ninja squad</td></tr>
<tr><td><code>'ninja squad' | titlecase</code></td><td>Ninja Squad</td></tr>
</table></div>`
    },
    {
      id: 'numbers', title: 'number, percent, currency – định dạng số',
      html: `
<p><code>number</code> nhận chuỗi định dạng <b><code>{số_chữ_số_nguyên}.{tối_thiểu_thập_phân}-{tối_đa_thập_phân}</code></b>, mọi phần đều tuỳ chọn:</p>
<div class="tablewrap"><table>
<tr><th>Template</th><th>Kết quả</th><th>Ý nghĩa</th></tr>
<tr><td><code>12345 | number</code></td><td>12,345</td><td>nhóm hàng nghìn</td></tr>
<tr><td><code>12345 | number:'6.'</code></td><td>012,345</td><td>đệm 0 cho đủ 6 chữ số nguyên</td></tr>
<tr><td><code>12345 | number:'.2'</code></td><td>12,345.00</td><td>tối thiểu 2 số thập phân</td></tr>
<tr><td><code>12345.16 | number:'.1-1'</code></td><td>12,345.2</td><td>đúng 1 số thập phân (làm tròn)</td></tr>
<tr><td><code>0.8 | percent</code></td><td>80%</td><td></td></tr>
<tr><td><code>0.8 | percent:'.3'</code></td><td>80.000%</td><td></td></tr>
<tr><td><code>10.6 | currency:'CAD'</code></td><td>CA$10.60</td><td>mặc định USD nếu bỏ qua mã</td></tr>
<tr><td><code>10.6 | currency:'CAD':'symbol-narrow'</code></td><td>$10.60</td><td></td></tr>
<tr><td><code>10.6 | currency:'EUR':'code':'.3'</code></td><td>EUR10.600</td><td></td></tr>
</table></div>
<div class="box info"><b>Chuẩn ISO 4217</b><p><code>currency</code> biết số chữ số thập phân của từng loại tiền: peso Chile 0 chữ số, dinar Tunisia 3 chữ số.</p></div>
<textarea class="live" data-title="Cùng ý tưởng bằng Intl (API chuẩn của trình duyệt)">
console.log(new Intl.NumberFormat('en-US').format(12345));                        // 12,345
console.log(new Intl.NumberFormat('en-US', { style: 'percent' }).format(0.8));   // 80%
console.log(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' }).format(10.6));
console.log(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(1500000));
console.log(new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234.5));
</textarea>
<div class="box info"><b>Ngôn ngữ (locale)</b><p>Mặc định pipe dùng <code>en-US</code>. Đổi ngôn ngữ cho cả app sẽ học ở chương 24 (token <code>LOCALE_ID</code>, đã thấy ở chương 10).</p></div>`
    },
    {
      id: 'date', title: 'date – định dạng ngày giờ',
      html: `
<p>Nhận <code>Date</code> hoặc số mili-giây. Định dạng: mẫu tự đặt (<code>'dd/MM/yyyy'</code>, <code>'HH:mm'</code>) hoặc tên có sẵn (<code>'short'</code>, <code>'longDate'</code>, <code>'shortTime'</code>…).</p>
<div class="widget" id="w-date">
  <h4>📅 Thử định dạng ngày</h4>
  <div class="row" style="margin-bottom:10px">
    <input type="datetime-local" id="dt-in" value="1986-07-16T15:30">
    <input type="text" id="dt-fmt" class="mono" value="dd/MM/yyyy HH:mm" style="min-width:200px">
  </div>
  <div class="row" id="dt-presets" style="margin-bottom:10px"></div>
  <div class="mono" id="dt-tpl" style="background:var(--surface2);border-radius:8px;padding:8px 12px;margin-bottom:8px"></div>
  <div style="font-size:20px;font-weight:700" id="dt-out"></div>
  <p class="hint" style="margin-top:8px">Ký hiệu: <code>yyyy</code> năm, <code>MMMM/MMM/MM/M</code> tháng, <code>EEEE/EEE</code> thứ, <code>dd/d</code> ngày, <code>HH/H</code> giờ 24h, <code>hh/h</code> giờ 12h, <code>mm</code> phút, <code>ss</code> giây, <code>a</code> AM/PM.</p>
</div>`
    },
    {
      id: 'async', title: 'async – hiển thị dữ liệu bất đồng bộ',
      html: `
<p><code>async</code> nhận <b>Promise hoặc Observable</b>, trả về chuỗi rỗng/<code>null</code> cho tới khi dữ liệu về, rồi hiển thị giá trị và <b>tự kích hoạt cập nhật giao diện</b>. Với Observable, nó còn <b>tự huỷ đăng ký</b> khi component bị huỷ — tránh rò rỉ bộ nhớ.</p>
<div class="widget" id="w-async">
  <h4>⏳ <code>{{ greeting | async }}</code></h4>
  <div class="row" style="margin-bottom:10px">
    <label>Độ trễ: <select id="as-delay"><option value="800">0.8 giây</option><option value="2000" selected>2 giây</option></select></label>
    <label><input type="checkbox" id="as-fail"> Promise bị reject</label>
    <button class="btn" id="as-go">▶ Tạo Promise</button>
  </div>
  <div class="mono" style="background:var(--surface2);border-radius:8px;padding:8px 12px;margin-bottom:8px">&lt;div&gt;{{ greeting | async }}&lt;/div&gt;</div>
  <div style="font-size:20px;min-height:32px"><span id="as-out"></span></div>
  <div class="hint" id="as-state"></div>
</div>
<textarea class="code" data-lang="ts">
@Component({
  selector: 'ns-user',
  template: \`<div *ngIf="asyncUser | async as user">{{ user.name }}</div>\`   // "as" lưu kết quả, đăng ký 1 lần
})
export class UserComponent {
  asyncUser = new Promise<UserModel>(resolve => setTimeout(() => resolve({ name: 'Cédric' }), 1000));
}
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="html">
@if (user$ | async; as user) {
  <p>{{ user.name }}</p>
}
</textarea><p>Và với signals, nhiều trường hợp bạn đọc thẳng <code>user()</code> trong template mà không cần <code>async</code>.</p></div>`
    },
    {
      id: 'code', title: 'Dùng pipe trong code TypeScript',
      html: `
<p>Pipe cũng gọi được từ code: tiêm pipe (phải có trong <code>providers</code>) rồi gọi <code>transform()</code>; hoặc dùng thẳng các hàm định dạng (từ Angular 6) như <code>formatNumber</code>, <code>formatDate</code>.</p>
<textarea class="code" data-lang="ts" data-title="Cách 1: tiêm pipe">
import { DecimalPipe } from '@angular/common';

@Component({ selector: 'ns-pony', template: \`<p>{{ formattedSpeed }}</p>\`, providers: [DecimalPipe] })
export class PonyComponent {
  formattedSpeed: string;
  constructor(decimalPipe: DecimalPipe, @Inject(LOCALE_ID) locale: string) {
    this.formattedSpeed = decimalPipe.transform(15, '.2', locale)!;   // "15.00"
  }
}
</textarea>
<textarea class="code" data-lang="ts" data-title="Cách 2 (gọn hơn): hàm định dạng">
import { formatNumber } from '@angular/common';
this.formattedSpeed = formatNumber(15, locale, '.2');
</textarea>`
    },
    {
      id: 'custom', title: 'Tự viết pipe: fromNow',
      html: `
<p>Ví dụ kinh điển: hiển thị “12 giây trước”, “3 ngày trước”. Một pipe là class <code>implements PipeTransform</code> với phương thức <code>transform()</code>, gắn <code>@Pipe({ name: 'fromNow' })</code>. Hãy chạy thử logic <code>transform</code> (dùng <code>Intl.RelativeTimeFormat</code> thay cho date-fns):</p>
<textarea class="live" data-title="Logic của FromNowPipe – sửa thử">
class FromNowPipe {
  transform(value) {
    const diffSec = Math.round((new Date(value) - Date.now()) / 1000);   // âm = quá khứ
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
    const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    for (const [unit, secs] of units) {
      if (Math.abs(diffSec) >= secs || unit === 'second') return rtf.format(Math.round(diffSec / secs), unit);
    }
  }
}
const pipe = new FromNowPipe();
const ago = s => new Date(Date.now() - s * 1000).toISOString();
console.log(pipe.transform(ago(12)));          // 12 seconds ago
console.log(pipe.transform(ago(3 * 3600)));    // 3 hours ago
console.log(pipe.transform(ago(3 * 86400)));   // 3 days ago
console.log(pipe.transform(ago(-90)));         // in 2 minutes (tương lai)
</textarea>
<textarea class="code" data-lang="ts" data-title="from-now.pipe.ts (Angular thật, dùng date-fns)">
import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

@Pipe({ name: 'fromNow' })
export class FromNowPipe implements PipeTransform {
  transform(value: string): string {
    return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
  }
}
// Template: {{ race.startInstant | fromNow }}
</textarea>
<div class="box warn"><b>Đừng quên đăng ký</b><p>Sách (Angular 11): thêm pipe vào <code>declarations</code> của <code>NgModule</code>. Hiện nay: pipe là <b>standalone</b>, bạn thêm vào <code>imports</code> của component dùng nó.</p></div>
<textarea class="code" data-lang="ts" data-title="Hiện đại">
@Component({ selector: 'ns-races', imports: [FromNowPipe, DatePipe], template: \`{{ start | fromNow }}\` })
</textarea>

<h3>Vì sao pipe tốt hơn gọi hàm trong template?</h3>
<p>Pipe mặc định là <b>thuần (pure)</b>: chỉ chạy lại khi <i>đầu vào đổi</i>. Còn gọi hàm trong template chạy lại ở <b>mỗi lần kiểm tra thay đổi</b>. Đếm thử:</p>
<textarea class="live" data-title="Mô phỏng 5 lần kiểm tra thay đổi của Angular">
let calls = { method: 0, purePipe: 0 };
const expensive = n => { return n * 2; };

// Gọi hàm trong template: chạy mỗi lần
const methodInTemplate = n => { calls.method++; return expensive(n); };

// Pipe thuần: nhớ đầu vào lần trước
function purePipe(fn) {
  let last, result, has = false;
  return n => { if (!has || n !== last) { calls.purePipe++; result = fn(n); last = n; has = true; } return result; };
}
const pipe = purePipe(expensive);

for (let cycle = 1; cycle <= 5; cycle++) {       // 5 lần change detection, input không đổi
  methodInTemplate(21); pipe(21);
}
console.log('Gọi hàm  :', calls.method, 'lần');
console.log('Pipe thuần:', calls.purePipe, 'lần');
</textarea>`
    }
  ],
  quiz: [
    { q: 'Cú pháp đúng để xích pipe?', options: ['{{ ponies | slice:0:2 | json }}', '{{ ponies slice(0,2) json }}', '{{ json(slice(ponies)) }}'], answer: 0, why: 'Dùng | giữa các pipe, đối số cách nhau bằng dấu :.' },
    { q: "<code>'Ninja Squad' | slice:2:-2</code> cho kết quả?", options: ['nja Squ', 'Ninja', 'ja Squad'], answer: 0, why: 'Từ vị trí 2 đến trước 2 ký tự cuối: "nja Squ".' },
    { q: "<code>12345 | number:'.2'</code> hiển thị?", options: ['12,345', '12,345.00', '012,345'], answer: 1, why: "'.2' = tối thiểu 2 chữ số thập phân." },
    { q: 'Pipe async trả về gì trước khi Promise resolve?', options: ['Lỗi', 'Chuỗi rỗng / null', 'undefined và dừng ứng dụng'], answer: 1, why: 'Nó trả về giá trị rỗng tới khi dữ liệu về, rồi tự cập nhật giao diện.' },
    { q: 'Ưu điểm khi dùng pipe thuần thay vì gọi hàm trong template?', options: ['Chỉ tính lại khi đầu vào đổi', 'Chạy nhanh hơn vì viết bằng ngôn ngữ khác', 'Có thể dùng trong (click)'], answer: 0, why: 'Hàm trong template chạy lại ở mọi lần change detection; pipe thuần được memoize.' },
    { q: 'Để tự viết pipe cần?', options: ['@Pipe({ name }) + implements PipeTransform + transform()', 'Chỉ cần một hàm bất kỳ', 'Một Directive'], answer: 0, why: 'Decorator @Pipe cho Angular biết tên dùng trong template.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const { run } = NinjaPipes;

    /* ===== phòng thí nghiệm ===== */
    const presets = [
      ['json', "[{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }]", 'json'],
      ['xích slice | json', "[{ name: 'Rainbow Dash' }, { name: 'Pinkie Pie' }, { name: 'Fluttershy' }]", 'slice:0:2 | json'],
      ['slice chuỗi', "'Ninja Squad'", 'slice:2:-2'],
      ['keyvalue', "new Map([[103, { name: 'Rainbow Dash' }], [56, { name: 'Pinkie Pie' }]])", 'keyvalue | json'],
      ['titlecase', "'ninja squad'", 'titlecase'],
      ['number', '12345.16', "number:'.1-1'"],
      ['percent', '0.8', "percent:'.3'"],
      ['currency', '10.6', "currency:'EUR':'code':'.3'"],
      ['date', 'new Date(1986, 6, 16, 15, 30)', "date:'longDate'"],
      ['pipe không tồn tại', "'abc'", 'reverse']
    ];
    const val = $('#lab-val'), chain = $('#lab-chain');
    const show = v => typeof v === 'string' ? v : v instanceof Date ? v.toString() : (() => { try { return JSON.stringify(v); } catch (e) { return String(v); } })();
    function lab() {
      $('#lab-tpl').textContent = `{{ ${val.value} | ${chain.value.trim()} }}`.replace(' |  }}', ' }}');
      try {
        const value = new Function('return (' + val.value + ')')();
        const steps = run(value, chain.value);
        const last = steps[steps.length - 1];
        $('#lab-out').innerHTML = `<div class="flow">${steps.map((s, i) =>
          `${i ? '<span class="arr">→</span>' : ''}<div class="node ${i === steps.length - 1 ? 'hot' : ''}" style="max-width:260px"><small>${esc(s.name)}</small><span class="mono" style="font-size:12.5px;word-break:break-all;white-space:pre-wrap">${esc(show(s.out)).slice(0, 220)}</span></div>`).join('')}</div>` +
          `<div><b>Hiển thị trong trang:</b></div><pre class="hl" style="border-radius:8px;margin-top:6px">${esc(show(last.out))}</pre>`;
      } catch (e) { $('#lab-out').innerHTML = `<span class="pill rejected">${esc(e.message)}</span>`; }
    }
    const pr = $('#lab-presets');
    presets.forEach(p => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = p[0]; b.onclick = () => { val.value = p[1]; chain.value = p[2]; lab(); }; pr.appendChild(b); });
    val.oninput = chain.oninput = lab;
    val.value = presets[1][1]; chain.value = presets[1][2]; lab();

    /* ===== date ===== */
    const dtPre = [['dd/MM/yyyy', 'dd/MM/yyyy'], ['longDate', 'longDate'], ['fullDate', 'fullDate'], ['HH:mm', 'HH:mm'], ['shortTime', 'shortTime'], ['short', 'short']];
    const dtp = $('#dt-presets');
    const drawDate = () => {
      const f = $('#dt-fmt').value;
      $('#dt-tpl').textContent = `{{ birthday | date:'${f}' }}`;
      try { $('#dt-out').textContent = NinjaPipes.pipes.date(new Date($('#dt-in').value), f); } catch (e) { $('#dt-out').textContent = e.message; }
    };
    dtPre.forEach(p => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = p[0]; b.onclick = () => { $('#dt-fmt').value = p[1]; drawDate(); }; dtp.appendChild(b); });
    $('#dt-in').oninput = $('#dt-fmt').oninput = drawDate; drawDate();

    /* ===== async ===== */
    let token = 0;
    $('#as-go').onclick = () => {
      const my = ++token, out = $('#as-out'), st = $('#as-state');
      const ms = +$('#as-delay').value, fail = $('#as-fail').checked;
      out.textContent = ''; st.innerHTML = '<span class="pill pending">pending</span> async trả về chuỗi rỗng…';
      new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error('Server error')) : res('hello')), ms)).then(
        v => { if (my === token) { out.textContent = v; st.innerHTML = '<span class="pill fulfilled">fulfilled</span> async nhận giá trị và kích hoạt cập nhật giao diện.'; } },
        e => { if (my === token) { st.innerHTML = `<span class="pill rejected">rejected</span> ${esc(e.message)} — async ném lỗi lên ErrorHandler; template không hiển thị gì.`; } });
    };
  }
});
