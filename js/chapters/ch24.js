registerChapter(24, {
  time: '50 phút',
  lead: 'Quốc tế hoá (i18n) gồm hai việc: <b>định dạng</b> theo vùng miền (số, tiền, ngày — pipe + <code>LOCALE_ID</code>) và <b>dịch văn bản</b> (thuộc tính <code>i18n</code>, file XLIFF, build ra một bản app cho mỗi ngôn ngữ). Bạn có thể thử cả hai bằng widget: một “máy thử locale” và một dây chuyền <b>đánh dấu → trích xuất → dịch → build</b>.',
  sections: [
    {
      id: 'locale', title: 'Locale và LOCALE_ID: định dạng theo vùng miền',
      html: `
<p>Dấu thập phân là chấm hay phẩy? Tháng một là “January” hay “janvier”? Pipe <code>number</code>, <code>percent</code>, <code>currency</code>, <code>date</code> quyết định dựa trên token <b><code>LOCALE_ID</code></b> — <b>không phải</b> ngôn ngữ trình duyệt. Mặc định là <code>'en-US'</code>.</p>

<div class="widget" id="w-loc">
  <h4>🌍 Máy thử locale</h4>
  <p class="hint">Dùng <code>Intl</code> của trình duyệt để mô phỏng kết quả mà pipe Angular sẽ cho với từng <code>LOCALE_ID</code>.</p>
  <div class="row" style="margin-bottom:10px">
    <label>LOCALE_ID: <select id="lc-loc"></select></label>
    <label>DEFAULT_CURRENCY_CODE: <select id="lc-cur"><option>USD</option><option>EUR</option><option>VND</option><option>JPY</option><option>GBP</option></select></label>
  </div>
  <div class="tablewrap"><table id="lc-table"></table></div>
</div>

<textarea class="code" data-lang="ts" data-title="Đọc LOCALE_ID (phải dùng @Inject vì nó là chuỗi, không có kiểu riêng)">
@Component({
  selector: 'ns-locale',
  template: \`
    <p>The locale is {{ locale }}</p>               <!-- 'en-US' -->
    <p>{{ 1234.56 | number }}</p>                    <!-- 1,234.56 -->\`
})
class DefaultLocaleComponent {
  constructor(@Inject(LOCALE_ID) public locale: string) {}
}
</textarea>
<h3>Đổi locale của cả ứng dụng</h3>
<p>Locale là <b>hằng số</b> sau khi app chạy; muốn đổi phải cung cấp giá trị khác <b>trước khi khởi động</b>, và nạp thêm <b>dữ liệu locale</b> (tên tháng, quy tắc số…) vì Angular chỉ đóng gói sẵn <code>en-US</code>:</p>
<textarea class="code" data-lang="ts" data-title="app.config.ts">
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);                                    // nạp dữ liệu locale 'fr'

export const appConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }          // khỏi ghi 'EUR' mỗi lần dùng currency
  ]
};
// {{ 1234.56 | number }}  →  1 234,56        {{ 1234.56 | currency }}  →  1 234,56 €
</textarea>
<p>Mọi pipe định dạng đều nhận <b>locale làm tham số cuối</b> nếu bạn muốn ghi đè tại chỗ:</p>
<textarea class="code" data-lang="html">
<p>{{ 1234.56 | number: '1.0-3':'fr-FR' }}</p>      <!-- 1 234,56 dù LOCALE_ID là en-US -->
</textarea>
<div class="box info"><b>Chỉ cần một ngôn ngữ khác en-US?</b><p>Nếu app chỉ có một locale thì đặt <code>LOCALE_ID</code> như trên là đủ. Nhưng thường bạn muốn <b>dịch</b> luôn văn bản — phần dưới.</p></div>`
    },
    {
      id: 'approach', title: 'Dịch văn bản: chiến lược compile-time',
      html: `
<p>Thư viện kiểu <code>angular-translate</code> (AngularJS) dịch <b>lúc chạy</b>: gặp khoá <code>'home.welcome'</code> thì tra bảng ngôn ngữ hiện tại. Angular dùng cùng ý tưởng khoá/bản dịch nhưng thực hiện <b>lúc biên dịch (compile-time)</b>:</p>
<div class="flow">
  <div class="node">Template<small>i18n markers</small></div><span class="arr">→</span>
  <div class="node hot">Compiler + file dịch<small>messages.fr.xlf</small></div><span class="arr">→</span>
  <div class="node">Bản app tiếng Pháp<small>văn bản đã thay sẵn</small></div>
</div>
<div class="tablewrap"><table>
<tr><th>Hệ quả</th><th>Chi tiết</th></tr>
<tr><td>❌ Không đổi ngôn ngữ lúc chạy</td><td>Muốn đổi ngôn ngữ phải tải lại bản app khác</td></tr>
<tr><td>✅ Chạy nhanh hơn</td><td>Không phải tra khoá liên tục</td></tr>
<tr><td>📦 Một bản app cho mỗi locale</td><td>Build một lần → CLI sinh N bản (rất nhanh); bạn triển khai cả N bản</td></tr>
</table></div>
<p>Cần gói <code>@angular/localize</code> (cung cấp hàm toàn cục <code>$localize</code> chạy ngầm): <code>ng add @angular/localize</code>.</p>
<div class="box modern"><b>🆕 Cần đổi ngôn ngữ ngay trong app?</b><p>Compile-time không làm được. Nhiều dự án chọn thư viện dịch <b>lúc chạy</b> như <b>Transloco</b> hoặc <b>ngx-translate</b> (đánh đổi: nhanh hơn khi triển khai một bản, chậm hơn một chút lúc chạy, mất kiểm tra lúc build). Chọn theo nhu cầu; phần còn lại của chương nói về cách chính thức của Angular.</p></div>`
    },
    {
      id: 'workflow', title: 'Dây chuyền: đánh dấu → trích xuất → dịch → build',
      html: `
<p>Bạn không phải viết lại template. Quy trình 4 bước:</p>
<ol>
<li><b>Đánh dấu</b> phần cần dịch bằng thuộc tính <code>i18n</code>.</li>
<li><b>Trích xuất</b> ra file: <code>ng extract-i18n --output-path src/locale/</code> → <code>messages.xlf</code>.</li>
<li><b>Dịch</b>: dịch giả tạo <code>messages.fr.xlf</code> (điền vào <code>&lt;target&gt;</code>).</li>
<li><b>Build</b> với locale + file dịch: compiler thay văn bản đã đánh dấu bằng bản dịch.</li>
</ol>

<div class="widget" id="w-i18n">
  <h4>🏭 Dây chuyền i18n thu nhỏ</h4>
  <p class="hint">Sửa template (có các marker <code>i18n</code>), xem file XLIFF được trích xuất, điền bản dịch (đã có sẵn gợi ý), rồi xem bản <b>build</b> cho từng ngôn ngữ.</p>
  <label><b>① Template (đã đánh dấu)</b></label>
  <textarea id="x-tpl" rows="9" class="mono" style="width:100%;margin:6px 0 10px" spellcheck="false"></textarea>
  <div class="grid2">
    <div>
      <b>② messages.xlf (trích xuất)</b>
      <pre class="hl" id="x-xlf" style="border-radius:8px;margin-top:6px;font-size:12px;max-height:340px;overflow:auto"></pre>
    </div>
    <div>
      <div class="row" style="margin-bottom:6px"><b>③ Bản dịch</b>
        <label>Ngôn ngữ: <select id="x-lang"><option value="fr">Français (fr)</option><option value="es">Español (es)</option><option value="vi">Tiếng Việt (vi)</option></select></label></div>
      <div id="x-units" style="max-height:340px;overflow:auto"></div>
    </div>
  </div>
  <p style="margin:12px 0 4px"><b>④ Kết quả build</b> <span class="hint" id="x-note"></span></p>
  <div class="grid2">
    <div><span class="pill pending">en-US (gốc)</span><div id="x-out-en" style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:6px;background:var(--surface)"></div></div>
    <div><span class="pill fulfilled" id="x-lbl">fr</span><div id="x-out" style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:6px;background:var(--surface)"></div></div>
  </div>
</div>
<div class="box tip"><b>Thử</b><ul>
<li>Xoá phần <code>@@home.title</code> khỏi <code>i18n="@@home.title"</code> rồi sửa thêm một dấu chấm sau “Ponyracer”: <b>id tự sinh thay đổi</b> → mất bản dịch. Đó là lý do nên tự đặt id.</li>
<li>Chọn tiếng Việt: bản dịch đổi thứ tự <code>lastName</code> trước <code>firstName</code> — dịch giả được phép sắp xếp lại các placeholder.</li>
<li>Thêm <code>i18n-title="@@x"</code> cho một thuộc tính khác để thấy đơn vị dịch thuộc tính.</li></ul></div>

<h3>Các cách đánh dấu</h3>
<textarea class="code" data-lang="html">
<h1 i18n>Welcome to Ponyracer</h1>                                         <!-- id tự sinh từ nội dung (mong manh) -->
<h1 i18n="@@home.title">Welcome to Ponyracer</h1>                           <!-- id do bạn đặt ✓ -->
<h1 i18n="welcome title|the title of the home page@@home.fullTitle">…</h1>   <!-- meaning | description @@ id -->

<p i18n="@@home.welcome">Welcome {{ user.firstName }} {{ user.lastName }}!</p>   <!-- có nội suy -->
<img alt="running pony" i18n-alt="@@home.ponyImage.alt" />                     <!-- thuộc tính: i18n-<tên> -->
<ng-container i18n="@@home.startMessage">Let's start playing.</ng-container>   <!-- văn bản trần: bọc ng-container (không vào DOM) -->
</textarea>
<div class="box warn"><b>Lỗi phổ biến của dịch giả</b><p>Đừng ghi đè <code>&lt;source&gt;</code> bằng bản dịch. Bản dịch phải nằm trong thẻ <code>&lt;target&gt;</code>; <code>&lt;source&gt;</code> giữ nguyên làm gốc để đối chiếu.</p></div>

<h3>Cấu hình và build</h3>
<textarea class="code" data-lang="json" data-title="angular.json">
"projects": { "i18n": {
  "i18n": {
    "sourceLocale": "en-US",
    "locales": { "fr": "src/locale/messages.fr.xlf" }
  },
  "architect": { "build": { "options": { "localize": true } } }
} }
</textarea>
<textarea class="code" data-lang="bash">
ng build --localize                      # sinh dist/.../en-US và dist/.../fr (mỗi locale một bản)
ng serve --configuration=fr              # chạy thử một locale (cần định nghĩa configuration "fr")
</textarea>
<p>Sau đó phải <b>chọn bản nào phục vụ cho ai</b>: ở server (đọc header <code>Accept-Language</code>), theo hồ sơ người dùng, hoặc theo URL (<code>/en</code>, <code>/fr</code>, <code>/es</code>, hay tên miền riêng).</p>`
    },
    {
      id: 'code', title: 'Dịch chuỗi trong code với $localize',
      html: `
<p>Có chuỗi nằm trong TypeScript (ví dụ trạng thái cuộc đua <code>PENDING</code>)? Dùng <b>tagged template</b> <code>$localize</code> (nhớ bài tagged template ở chương 2). Khi build, lời gọi được thay bằng bản dịch.</p>
<textarea class="code" data-lang="ts">
status = $localize\`PENDING\`;
greetings = $localize\`:@@home.greetings:Welcome \${this.user.firstName}!\`;   // :@@id: đặt id, \${…} là placeholder
</textarea>
<p>Cơ chế bên trong rất giống một hàm tag thường. Mô phỏng thật (chạy được) với bảng dịch và id:</p>
<textarea class="live" data-title="Một $localize thu nhỏ">
const translations = {
  fr: { 'home.greetings': ['Bonjour ', ' !'], 'status.pending': ['EN ATTENTE'] },
  vi: { 'home.greetings': ['Xin chào ', '!'], 'status.pending': ['ĐANG CHỜ'] }
};
let LOCALE = 'en';

function $localize(strings, ...values) {
  // Tiền tố  ":@@id:"  ở đầu chuỗi đầu tiên là metadata, phần sau là văn bản gốc
  const m = /^:(?:[^@|:]*\\|)?(?:[^@:]*)?@@([^:]+):/.exec(strings[0]);
  const id = m ? m[1] : null;
  const src = strings.map((s, i) => (i === 0 && m ? s.slice(m[0].length) : s));   // chuỗi gốc
  const tr = id && translations[LOCALE] && translations[LOCALE][id];
  const parts = tr || src;                                                         // không có bản dịch → dùng gốc
  return parts.reduce((out, p, i) => out + p + (i < values.length ? values[i] : ''), '');
}

const user = { firstName: 'Ana' };
for (LOCALE of ['en', 'fr', 'vi']) {
  console.log(LOCALE.padEnd(3), '|', $localize\`:@@home.greetings:Welcome \${user.firstName}!\`, '|', $localize\`:@@status.pending:PENDING\`);
}
</textarea>
<div class="box info"><b>Trích xuất</b><p><code>ng extract-i18n</code> cũng lấy cả các lời gọi <code>$localize</code> trong code. Placeholder xuất hiện dạng <code>&lt;x id="PH" .../&gt;</code> trong file XLF và dịch giả có thể đặt chúng ở vị trí khác nhau trong câu.</p></div>`
    },
    {
      id: 'plural', title: 'Số nhiều (pluralization) và ICU',
      html: `
<p>“0 cuộc đua / 1 cuộc đua / N cuộc đua” — mỗi ngôn ngữ có <b>quy tắc số nhiều riêng</b> (tiếng Nga có 4 dạng: <code>one / few / many / other</code>; tiếng Nhật chỉ 1). Angular dùng cú pháp <b>ICU</b> ngay trong template:</p>
<textarea class="code" data-lang="html">
<p i18n="@@home.racesPlanned">
  Hello, {racesPlanned, plural, =0 {no race is planned} =1 {only one race is planned}
  other {{{ racesPlanned }} races are planned}}.
</p>
</textarea>

<div class="widget" id="w-plural">
  <h4>🔢 Bộ đánh giá ICU plural</h4>
  <p class="hint">Chọn ngôn ngữ để nạp một mẫu, kéo số và xem nhánh nào được chọn (<code>=0</code>/<code>=1</code> khớp chính xác, còn lại theo quy tắc CLDR của ngôn ngữ qua <code>Intl.PluralRules</code>).</p>
  <div class="row" style="margin-bottom:8px">
    <label>Ngôn ngữ: <select id="pl-lang"></select></label>
    <label>racesPlanned: <input type="range" id="pl-n" min="0" max="30" value="1" style="vertical-align:middle"> <b id="pl-nv">1</b></label>
  </div>
  <textarea id="pl-icu" rows="3" class="mono" style="width:100%" spellcheck="false"></textarea>
  <div style="margin-top:10px;font-size:20px;font-weight:700" id="pl-out"></div>
  <div class="hint" id="pl-cat" style="margin-top:4px"></div>
  <div class="tablewrap"><table id="pl-tbl"></table></div>
</div>
<div class="box warn"><b>Điều khó chịu</b><p>Extract ra <b>hai</b> đơn vị dịch: câu bao quanh và bản thân khối ICU (id tự sinh). Dịch giả phải <b>giữ đúng cú pháp ICU</b> và thêm các nhánh ngôn ngữ cần (vd. <code>few</code>, <code>many</code> cho tiếng Nga).</p></div>`
    },
    {
      id: 'tips', title: 'Quy tắc vàng khi làm i18n',
      html: `
<div class="tablewrap"><table>
<tr><th>✅ Nên</th><th>Vì sao</th></tr>
<tr><td>Luôn đặt <b>id duy nhất, có ý nghĩa</b>, có tiền tố theo component (<code>home.title</code>)</td><td>id tự sinh đổi khi sửa dấu cách/chấm, và hai câu giống nhau không thể có hai bản dịch khác nhau</td></tr>
<tr><td>Lưu file dịch trong <b>git</b></td><td>Mỗi nhánh có thêm bản dịch riêng, so sánh giữa các release</td></tr>
<tr><td>Chấp nhận <b>trùng lặp</b> (“Save” ở hai trang dùng hai id)</td><td>Sau này có thể đổi thành “Lưu nháp”/“Lưu và đóng”, hoặc ngôn ngữ khác cần từ khác nhau (“free” = miễn phí / tự do)</td></tr>
<tr><td>Dùng <b>một câu có placeholder</b></td><td>Thứ tự từ mỗi ngôn ngữ mỗi khác</td></tr>
<tr><td>Phân biệt <b>ngôn ngữ</b> với <b>quốc gia</b></td><td>Đừng dùng cờ để chọn ngôn ngữ: Bỉ có 3 ngôn ngữ, tiếng Anh nói ở nhiều nước</td></tr>
</table></div>
<h3>Đừng nối chuỗi</h3>
<textarea class="live" data-title="Nối chuỗi vs một câu có placeholder">
// "Welcome {first} {last}!" — tiếng Việt/Nhật đặt HỌ trước TÊN
const first = 'Ana', last = 'Nguyen';

// ❌ Ghép nhiều khoá: đối số luôn đi theo thứ tự (first, rồi last) → dịch giả không đổi chỗ được
const parts = { en: ['Welcome ', ' ', '!'], vi: ['Chào mừng ', ' ', '!'] };
console.log('nối chuỗi en:', parts.en[0] + first + parts.en[1] + last + parts.en[2]);
console.log('nối chuỗi vi:', parts.vi[0] + first + parts.vi[1] + last + parts.vi[2], ' ← sai thứ tự họ/tên');

// ✅ Một khoá có placeholder: dịch giả sắp xếp tự do
const good = {
  en: (f, l) => \`Welcome \${f} \${l}!\`,
  vi: (f, l) => \`Chào mừng \${l} \${f}!\`,          // họ trước tên
  ja: (f, l) => \`\${l} \${f}さん、ようこそ!\`
};
for (const [lang, fn] of Object.entries(good)) console.log(lang, '|', fn(first, last));
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Quy trình (<code>i18n</code> attribute, <code>ng extract-i18n</code>, XLIFF, <code>--localize</code>) vẫn đúng. Khác biệt chủ yếu ở cấu hình: <code>sourceLocale</code>/<code>locales</code> trong <code>angular.json</code> (không còn cờ riêng cho <code>ng build</code>), thư mục output theo từng locale, và <code>$localize</code> đã ổn định. Hầu hết locale data nạp bằng <code>registerLocaleData</code>.</p></div>`
    }
  ],
  quiz: [
    { q: 'Pipe number/currency/date quyết định định dạng dựa vào đâu?', options: ['Ngôn ngữ ưu tiên của trình duyệt', 'Token LOCALE_ID (mặc định en-US)', 'Múi giờ máy'], answer: 1, why: 'LOCALE_ID là giá trị tiêm được; bạn đặt nó trước khi app khởi động.' },
    { q: 'Vì sao đặt LOCALE_ID = "fr-FR" mà chưa đủ?', options: ['Cần nạp dữ liệu locale (registerLocaleData) vì Angular chỉ đóng gói sẵn en-US', 'Cần cài thêm trình duyệt', 'Không cần gì thêm'], answer: 0, why: 'Tên tháng, quy tắc số… nằm trong dữ liệu locale phải được nạp.' },
    { q: 'i18n của Angular dịch vào lúc nào?', options: ['Lúc chạy, theo từng khoá', 'Lúc biên dịch: mỗi locale một bản app', 'Lúc cài đặt npm'], answer: 1, why: 'Compile-time: nhanh nhưng không đổi ngôn ngữ lúc chạy.' },
    { q: 'Bản dịch phải điền vào đâu trong file XLF?', options: ['Thay thẻ <source>', 'Trong thẻ <target>, giữ nguyên <source>', 'Trong tên file'], answer: 1, why: 'Source là gốc để đối chiếu; chỉ thêm target.' },
    { q: 'Vì sao nên tự đặt id (i18n="@@home.title")?', options: ['id tự sinh đổi khi nội dung đổi nhỏ, làm mất bản dịch', 'Để file nhỏ hơn', 'Bắt buộc về cú pháp'], answer: 0, why: 'id tự sinh là hàm băm của nội dung, rất mong manh.' },
    { q: 'Cách dịch văn bản trần không nằm trong phần tử nào?', options: ['Không thể dịch', 'Bọc trong <ng-container i18n="...">', 'Dùng i18n trên <body>'], answer: 1, why: 'ng-container không sinh ra phần tử trong DOM.' },
    { q: 'Nên dịch “Hello, my name is X and I’m Y years old” thế nào?', options: ['Ba khoá nối lại', 'Một khoá có hai placeholder', 'Không dịch'], answer: 1, why: 'Thứ tự từ mỗi ngôn ngữ khác nhau; một câu cho dịch giả tự do sắp xếp.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

    /* ===== máy thử locale ===== */
    const LOCS = ['en-US', 'fr-FR', 'de-DE', 'es-ES', 'vi-VN', 'ja-JP', 'pt-BR', 'ar-EG'];
    $('#lc-loc').innerHTML = LOCS.map(l => `<option>${l}</option>`).join('');
    const sampleDate = new Date(2026, 9, 12, 15, 30);
    function drawLoc() {
      const l = $('#lc-loc').value, cur = $('#lc-cur').value;
      const rows = [
        ['{{ 1234567.891 | number }}', new Intl.NumberFormat(l, { maximumFractionDigits: 3 }).format(1234567.891)],
        ['{{ 0.256 | percent }}', new Intl.NumberFormat(l, { style: 'percent' }).format(0.256)],
        ['{{ 1234.56 | currency }}', new Intl.NumberFormat(l, { style: 'currency', currency: cur }).format(1234.56)],
        ["{{ d | date:'longDate' }}", new Intl.DateTimeFormat(l, { dateStyle: 'long' }).format(sampleDate)],
        ["{{ d | date:'shortDate' }}", new Intl.DateTimeFormat(l, { dateStyle: 'short' }).format(sampleDate)],
        ["{{ d | date:'shortTime' }}", new Intl.DateTimeFormat(l, { timeStyle: 'short' }).format(sampleDate)],
        ["{{ d | date:'EEEE, MMMM' }}", new Intl.DateTimeFormat(l, { weekday: 'long', month: 'long' }).format(sampleDate)]
      ];
      $('#lc-table').innerHTML = `<tr><th>Template</th><th>Kết quả với <code>LOCALE_ID = '${l}'</code></th></tr>` + rows.map(r => `<tr><td><code>${esc(r[0])}</code></td><td style="font-size:17px">${esc(r[1])}</td></tr>`).join('');
    }
    $('#lc-loc').onchange = $('#lc-cur').onchange = drawLoc; drawLoc();

    /* ===== dây chuyền i18n ===== */
    const TPL = `<h1 i18n="@@home.title">Welcome to Ponyracer</h1>
<p i18n="@@home.welcome">Welcome to Ponyracer {{ user.firstName }} {{ user.lastName }}!</p>
<img src="/img/pony.gif" alt="running pony" i18n-alt="@@home.ponyImage.alt"
     title="Ponies are cool, aren't they?" i18n-title="@@home.ponyImage.title" />
<ng-container i18n="@@home.startMessage">Let's start playing.</ng-container>`;
    const DICT = {
      fr: { 'home.title': 'Bienvenue dans Ponyracer', 'home.welcome': 'Bienvenue dans Ponyracer {{ user.firstName }} {{ user.lastName }} !', 'home.ponyImage.alt': 'poney qui court', 'home.ponyImage.title': "Les poneys, c'est cool, non ?", 'home.startMessage': 'Commençons à jouer.' },
      es: { 'home.title': 'Bienvenido a Ponyracer', 'home.welcome': '¡Bienvenido a Ponyracer {{ user.firstName }} {{ user.lastName }}!', 'home.ponyImage.alt': 'poni corriendo', 'home.ponyImage.title': 'Los ponis son geniales, ¿verdad?', 'home.startMessage': 'Empecemos a jugar.' },
      vi: { 'home.title': 'Chào mừng đến với Ponyracer', 'home.welcome': 'Chào mừng {{ user.lastName }} {{ user.firstName }} đến với Ponyracer!', 'home.ponyImage.alt': 'chú pony đang chạy', 'home.ponyImage.title': 'Pony thật tuyệt phải không?', 'home.startMessage': 'Bắt đầu chơi nào.' }
    };
    const SAMPLE = { firstName: 'Ana', lastName: 'Nguyen' };
    $('#x-tpl').value = TPL;
    let edits = {};   // { lang: { id: text } }
    const hash = s => { let h = 5381n; for (const c of s) h = (h * 33n + BigInt(c.charCodeAt(0))) & 0xffffffffffffffffn; return h.toString(); };
    function parseMeta(v) {
      const k = v.indexOf('@@'); const id = k >= 0 ? v.slice(k + 2).trim() : null; const rest = k >= 0 ? v.slice(0, k) : v;
      let meaning = '', desc = rest; if (rest.includes('|')) [meaning, desc] = rest.split('|'); return { id, meaning, desc };
    }
    const srcXml = u => {
      if (u.kind !== 'text') return u.src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      let n = 0;
      return u.src.split(/(\{\{\s*[^}]+?\s*\}\})/).map(p => { const m = /^\{\{\s*([^}]+?)\s*\}\}$/.exec(p); if (m) { const id = 'INTERPOLATION' + (n ? '_' + n : ''); n++; return `<x id="${id}" equiv-text="{{ ${m[1]} }}"/>`; } return p.replace(/</g, '&lt;'); }).join('');
    };
    const toX = html => { let n = 0; return html.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, e) => `<x id="INTERPOLATION${n++ ? '_' + (n - 1) : ''}" equiv-text="{{ ${e} }}"/>`); };
    function extract(doc) {
      const units = [];
      doc.body.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => {
        if (a.name === 'i18n') { const src = el.innerHTML; const m = parseMeta(a.value); units.push({ el, kind: 'text', src, id: m.id || hash(src), auto: !m.id, desc: m.desc, meaning: m.meaning, line: units.length + 1 }); }
        else if (a.name.startsWith('i18n-')) { const at = a.name.slice(5), src = el.getAttribute(at) || ''; const m = parseMeta(a.value); units.push({ el, kind: 'attr', attr: at, src, id: m.id || hash(src), auto: !m.id, desc: m.desc, meaning: m.meaning, line: units.length + 1 }); }
      }));
      return units;
    }
    function applyTr(units, tr, doc) {
      units.forEach(u => {
        const t = tr[u.id]; if (!t) return;
        const out = t.replace(/\{\{\s*user\.(\w+)\s*\}\}/g, (m, k) => SAMPLE[k] || m);
        if (u.kind === 'text') u.el.innerHTML = out; else u.el.setAttribute(u.attr, out);
      });
      doc.body.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => { if (a.name.startsWith('i18n')) el.removeAttribute(a.name); }));
    }
    function pipeline(rebuildInputs) {
      const lang = $('#x-lang').value; edits[lang] = edits[lang] || {};
      const mk = () => new DOMParser().parseFromString('<body>' + $('#x-tpl').value + '</body>', 'text/html');
      const doc = mk(), units = extract(doc);
      // XLF
      const xlf = '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">\n  <file source-language="en-US" datatype="plaintext" original="ng2.template">\n    <body>\n' +
        units.map(u => `      <trans-unit id="${esc(u.id)}" datatype="html">\n        <source>${srcXml(u)}</source>${u.desc ? `\n        <note priority="1" from="description">${esc(u.desc)}</note>` : ''}${u.meaning ? `\n        <note priority="1" from="meaning">${esc(u.meaning)}</note>` : ''}\n      </trans-unit>`).join('\n') + '\n    </body>\n  </file>\n</xliff>';
      $('#x-xlf').textContent = xlf;
      // inputs
      if (rebuildInputs) {
        $('#x-units').innerHTML = units.map((u, i) => `<div style="margin-bottom:8px"><div class="hint mono" style="font-size:12px">${esc(u.id.length > 24 ? u.id.slice(0, 10) + '…' + ' (tự sinh)' : u.id)} · ${u.kind === 'attr' ? u.attr : 'text'}</div>
          <div style="font-size:13px;opacity:.8">${esc(u.src.trim().slice(0, 70))}</div>
          <input type="text" data-id="${esc(u.id)}" style="width:100%" value="${esc(edits[lang][u.id] != null ? edits[lang][u.id] : (DICT[lang][u.id] || ''))}" placeholder="(chưa có bản dịch cho id này)"></div>`).join('');
        root.querySelectorAll('#x-units input').forEach(inp => (inp.oninput = () => { edits[lang][inp.dataset.id] = inp.value; build(units, lang); }));
      }
      build(units, lang);
      // ghi chú id tự sinh
      const autos = units.filter(u => u.auto).length;
      $('#x-note').textContent = autos ? `⚠ ${autos} đơn vị dùng id tự sinh — sửa nội dung sẽ đổi id và mất bản dịch.` : '✓ mọi đơn vị đều có id tự đặt.';
    }
    function build(units, lang) {
      const tr = {}; units.forEach(u => { tr[u.id] = edits[lang][u.id] != null ? edits[lang][u.id] : DICT[lang][u.id]; });
      const mk = () => new DOMParser().parseFromString('<body>' + $('#x-tpl').value + '</body>', 'text/html');
      const en = mk(), enUnits = extract(en); applyTr(enUnits, Object.fromEntries(enUnits.map(u => [u.id, u.kind === 'text' ? u.src : u.src])), en);
      $('#x-out-en').innerHTML = en.body.innerHTML.replace(/\{\{\s*user\.(\w+)\s*\}\}/g, (m, k) => SAMPLE[k] || m);
      const fr = mk(), frUnits = extract(fr); applyTr(frUnits, tr, fr);
      $('#x-out').innerHTML = fr.body.innerHTML; $('#x-lbl').textContent = lang;
    }
    $('#x-tpl').oninput = () => pipeline(true);
    $('#x-lang').onchange = () => pipeline(true);
    pipeline(true);

    /* ===== ICU plural ===== */
    const ICU = {
      en: '{racesPlanned, plural, =0 {no race is planned} =1 {only one race is planned} other {{{ racesPlanned }} races are planned}}',
      fr: "{racesPlanned, plural, =0 {aucune course n'est planifiée} =1 {seule une course est planifiée} other {{{ racesPlanned }} courses sont planifiées}}",
      ru: '{racesPlanned, plural, one {запланирована {{ racesPlanned }} гонка} few {запланировано {{ racesPlanned }} гонки} many {запланировано {{ racesPlanned }} гонок} other {запланировано {{ racesPlanned }} гонки}}',
      ja: '{racesPlanned, plural, =0 {予定されているレースはありません} other {{{ racesPlanned }} 件のレースが予定されています}}',
      vi: '{racesPlanned, plural, =0 {không có cuộc đua nào được lên kế hoạch} =1 {chỉ có một cuộc đua được lên kế hoạch} other {có {{ racesPlanned }} cuộc đua được lên kế hoạch}}',
      ar: '{racesPlanned, plural, zero {لا توجد سباقات} one {سباق واحد} two {سباقان} few {{{ racesPlanned }} سباقات} many {{{ racesPlanned }} سباقًا} other {{{ racesPlanned }} سباق}}'
    };
    $('#pl-lang').innerHTML = Object.keys(ICU).map(l => `<option value="${l}">${l}</option>`).join('');
    const matchBrace = (s, i) => { let d = 0; for (let k = i; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}' && --d === 0) return k; } return -1; };
    function evalIcu(src, n, lang) {
      const t = src.trim(); if (t[0] !== '{') throw new Error('ICU phải bắt đầu bằng {');
      const end = matchBrace(t, 0); if (end < 0) throw new Error('Thiếu dấu } đóng');
      const m = /^\{\s*(\w+)\s*,\s*plural\s*,/.exec(t); if (!m) throw new Error('Cú pháp: {biến, plural, …}');
      let i = m[0].length; const cases = {};
      while (i < end) {
        const rest = t.slice(i); const km = /^\s*(=\d+|\w+)\s*\{/.exec(rest); if (!km) { if (!rest.slice(0, end - i).trim()) break; throw new Error('Không đọc được nhánh gần: ' + rest.slice(0, 15)); }
        const open = i + km[0].length - 1, close = matchBrace(t, open); if (close < 0) throw new Error('Thiếu } trong nhánh ' + km[1]);
        cases[km[1]] = t.slice(open + 1, close); i = close + 1;
      }
      const cat = new Intl.PluralRules(lang).select(n);
      const key = cases['=' + n] != null ? '=' + n : cases[cat] != null ? cat : 'other';
      if (cases[key] == null) throw new Error("Thiếu nhánh 'other'");
      return { text: cases[key].replace(/\{\{\s*\w+\s*\}\}/g, n), key, cat };
    }
    function drawPl() {
      const lang = $('#pl-lang').value, n = +$('#pl-n').value; $('#pl-nv').textContent = n;
      try { const r = evalIcu($('#pl-icu').value, n, lang); $('#pl-out').textContent = r.text; $('#pl-cat').innerHTML = `Nhánh được chọn: <code>${esc(r.key)}</code> · danh mục CLDR của ${n} trong “${lang}”: <code>${r.cat}</code>`; }
      catch (e) { $('#pl-out').textContent = '⚠ ' + e.message; $('#pl-cat').textContent = ''; }
      const nums = [0, 1, 2, 3, 5, 11, 21, 101];
      $('#pl-tbl').innerHTML = `<tr><th>Danh mục của “${lang}”</th>${nums.map(x => `<th>${x}</th>`).join('')}</tr><tr><td>Intl.PluralRules</td>${nums.map(x => `<td>${new Intl.PluralRules(lang).select(x)}</td>`).join('')}</tr>`;
    }
    $('#pl-lang').onchange = () => { $('#pl-icu').value = ICU[$('#pl-lang').value]; drawPl(); };
    $('#pl-n').oninput = $('#pl-icu').oninput = drawPl;
    $('#pl-icu').value = ICU.en; drawPl();
  }
});
