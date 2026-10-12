registerChapter(26, {
  time: '35 phút',
  lead: 'Ứng dụng chạy tốt trên máy bạn rồi — giờ đưa nó ra thế giới. Bạn sẽ nắm: <b>cấu hình theo môi trường</b> (<code>environment</code>, <code>fileReplacements</code>), <b>kiểm tra kiểu template</b> nghiêm ngặt, <b>build production</b> làm những gì, và bước hay bị quên nhất: <b>cấu hình server cho SPA</b>.',
  sections: [
    {
      id: 'env', title: 'Environment và configuration',
      html: `
<p>Trong project CLI bạn thấy <code>environment.ts</code> và <code>environment.prod.ts</code>. Lạ ở chỗ: <b>code chỉ import <code>environment.ts</code></b>. Khi build với <i>configuration</i> khác, CLI <b>thay file</b> lúc biên dịch (<code>fileReplacements</code> trong <code>angular.json</code>).</p>
<textarea class="code" data-lang="ts" data-title="environment.ts / environment.prod.ts">
// src/environments/environment.ts          (mặc định, dùng khi ng serve)
export const environment = { production: false, apiUrl: 'http://localhost:8080' };

// src/environments/environment.prod.ts     (thay vào khi build production)
export const environment = { production: true, apiUrl: 'https://api.ponyracer.com' };

// main.ts
import { environment } from './environments/environment';      // luôn import file này
if (environment.production) { enableProdMode(); }
</textarea>
<textarea class="code" data-lang="json" data-title="angular.json (rút gọn)">
"configurations": {
  "production": {
    "fileReplacements": [{ "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }],
    "optimization": true, "outputHashing": "all", "sourceMap": false, "extractLicenses": true, "buildOptimizer": true,
    "budgets": [
      { "type": "initial",           "maximumWarning": "500kb", "maximumError": "1mb" },
      { "type": "anyComponentStyle", "maximumWarning": "2kb",   "maximumError": "4kb" }
    ]
  }
}
</textarea>
<p>Bạn tạo bao nhiêu configuration cũng được (ví dụ <code>preprod</code> với <code>environment.preprod.ts</code>). Từ CLI 9 còn <b>gộp nhiều configuration</b>: <code>ng build --configuration=production,preprod</code> — các cấu hình sau <b>ghi đè</b> thuộc tính của cấu hình trước. Thử:</p>

<div class="widget" id="w-env">
  <h4>⚙ Chọn configuration, xem cấu hình cuối cùng</h4>
  <div class="row" style="margin-bottom:10px">
    <b>Configuration (theo thứ tự):</b>
    <label><input type="checkbox" id="en-prod"> production</label>
    <label><input type="checkbox" id="en-pre"> preprod</label>
    <button class="btn alt" id="en-swap">⇄ Đổi thứ tự</button>
  </div>
  <pre class="hl" id="en-cmd" style="border-radius:8px;margin-bottom:10px"></pre>
  <div class="grid2">
    <div><b>Tuỳ chọn build sau khi gộp</b><div class="tablewrap"><table id="en-opts"></table></div></div>
    <div><b>environment mà code nhìn thấy</b><pre class="hl" id="en-envfile" style="border-radius:8px;margin-top:6px"></pre><div id="en-eff" style="margin-top:8px"></div></div>
  </div>
</div>
<div class="box tip"><b>Dùng cho gì?</b><p>Địa chỉ API khác nhau theo môi trường, bật/tắt log, khoá API công khai. Cơ chế thay thế cũng dùng được cho <code>assets</code> và <code>styles</code> (đổi theme theo configuration). <b>Đừng</b> để bí mật (mật khẩu, khoá riêng) trong environment: mọi thứ trong bundle đều lộ ra cho người dùng.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><p><code>ng build</code> mặc định đã dùng configuration <b>production</b>; <code>ng serve</code> dùng <b>development</b>. Project mới không tạo sẵn thư mục <code>environments</code> — chạy <code>ng generate environments</code> khi cần. Alias <code>--prod</code> trong sách đã bị bỏ.</p></div>`
    },
    {
      id: 'typecheck', title: 'fullTemplateTypeCheck và strictTemplates',
      html: `
<p>Khi biên dịch <b>AOT</b> (mặc định từ Angular 9), compiler kiểm tra template. Mức mặc định chỉ kiểm tra nhẹ. Bạn có thể bật:</p>
<textarea class="code" data-lang="json" data-title="tsconfig.json">
"angularCompilerOptions": {
  "fullTemplateTypeCheck": true,     // kiểm tra cả bên trong *ngIf, *ngFor, template ref
  "strictTemplates": true            // kiểm tra kiểu input, sự kiện DOM, ref… (Angular 9+)
}
</textarea>
<p>Mỗi mức bắt được nhiều lỗi hơn <b>ngay lúc build</b> thay vì để người dùng gặp lúc chạy. Chọn mức và xem lỗi nào bị chặn:</p>

<div class="widget" id="w-tc">
  <h4>🛡 Kiểm tra kiểu template</h4>
  <div class="row" style="margin-bottom:10px">
    <label>Chế độ: <select id="tc-lvl">
      <option value="0">JIT / không kiểm tra AOT</option>
      <option value="1" selected>AOT cơ bản (mặc định cũ)</option>
      <option value="2">fullTemplateTypeCheck</option>
      <option value="3">strictTemplates</option></select></label>
  </div>
  <div class="tablewrap"><table id="tc-table"></table></div>
</div>
<div class="box modern"><b>🆕 Hiện nay</b><p><code>ng new</code> bật <b>strict mode</b> (gồm <code>strictTemplates</code>) từ Angular 12. Dự án mới nên để nguyên — bạn sẽ gặp lỗi sớm và code an toàn hơn. Với dự án cũ, bật dần.</p></div>`
    },
    {
      id: 'build', title: 'Đóng gói: ng build làm gì?',
      html: `
<textarea class="code" data-lang="bash">
ng build                         # production mặc định (bản cũ: ng build --prod / --configuration=production)
# kết quả nằm trong dist/<tên-project>/  (với app mới: dist/<tên>/browser/)
</textarea>
<div class="tablewrap"><table>
<tr><th>Tuỳ chọn</th><th>Tác dụng</th></tr>
<tr><td><code>fileReplacements</code></td><td>Thay <code>environment.ts</code> bằng bản production</td></tr>
<tr><td><code>optimization</code> + <code>buildOptimizer</code></td><td>Tree-shaking, minify, bỏ code chết (chương 25)</td></tr>
<tr><td><code>sourceMap: false</code></td><td>Không sinh source map — không tiết lộ mã nguồn gốc, build nhanh hơn</td></tr>
<tr><td><code>outputHashing: "all"</code></td><td>Tên file có hash nội dung → cache lâu mà không sợ cũ (cache busting)</td></tr>
<tr><td><code>extractLicenses</code>, <code>vendorChunk: false</code></td><td>Giảm dung lượng JS</td></tr>
<tr><td><code>budgets</code></td><td>Cảnh báo/lỗi khi bundle phình quá ngưỡng</td></tr>
</table></div>

<div class="widget" id="w-bud">
  <h4>📏 Budgets: hàng rào chống phình bundle</h4>
  <p class="hint">Ngưỡng mặc định: <code>initial</code> 500kb cảnh báo / 1mb lỗi; <code>anyComponentStyle</code> 2kb / 4kb.</p>
  <div class="grid2">
    <div>
      <label>Bundle ban đầu: <b id="bu-av">480</b> kb</label><input type="range" id="bu-a" min="100" max="1400" step="10" value="480" style="width:100%">
      <label>CSS lớn nhất của một component: <b id="bu-bv">1.5</b> kb</label><input type="range" id="bu-b" min="0.5" max="6" step="0.1" value="1.5" style="width:100%">
    </div>
    <div id="bu-out"></div>
  </div>
</div>
<div class="box warn"><b>Không dùng <code>ng serve</code> trên production</b><p>Nó chỉ là công cụ phát triển: không tối ưu, không an toàn. Production là <b>thư mục build tĩnh</b> đặt trên Nginx, Apache, CDN, Firebase, Netlify… (hoặc Node nếu dùng SSR).</p></div>

<h3>Polyfill và “differential loading” (lịch sử)</h3>
<p>Polyfill là file giả lập tính năng mà trình duyệt cũ thiếu. Từ CLI 8, CLI sinh <b>hai bộ bundle</b> nếu <code>.browserslistrc</code> nhắm trình duyệt cũ: bản hiện đại (ES2015) và bản cũ (ES5), nhúng vào <code>index.html</code> sao cho trình duyệt hiện đại <b>không tải</b> bản cũ:</p>
<textarea class="code" data-lang="html">
<script src="main-es2015.js" type="module"></script>      <!-- trình duyệt hiện đại: chạy -->
<script src="main-es5.js" nomodule defer></script>          <!-- trình duyệt hiện đại: BỎ QUA hoàn toàn -->
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Angular đã bỏ hỗ trợ IE, nên <b>differential loading không còn</b>: chỉ còn một bộ bundle nhắm trình duyệt hiện đại (<code>.browserslistrc</code> / <code>target</code> ES2022). Polyfill (mặc định chỉ <code>zone.js</code>) khai báo trong <code>polyfills</code> của <code>angular.json</code>; khi chạy zoneless thậm chí không cần.</p></div>`
    },
    {
      id: 'server', title: 'Cấu hình server: mọi route phải trả về index.html',
      html: `
<p>Có ba việc cho server: <b>nén</b> (gzip/Brotli), <b>cache lâu</b> cho file có hash (<b>trừ</b> <code>index.html</code>), và việc hay bị quên nhất: <b>mọi URL của router phải trả về <code>index.html</code></b>.</p>
<p>Vì sao? Bạn deploy tại <code>https://ponyracer.com</code>, mọi người điều hướng trong app tới <code>/races</code> — chạy ngon vì Angular router tự xử lý trong trình duyệt, <b>không</b> gọi server. Nhưng nếu ai đó nhấn F5 hay mở link <code>/races</code> trực tiếp, trình duyệt <b>hỏi server</b> file <code>/races</code> — và server tĩnh trả <b>404</b>.</p>

<div class="widget" id="w-spa">
  <h4>🛰 Mô phỏng server tĩnh</h4>
  <p class="hint">Server có các file: <code>/index.html</code>, <code>/main.3f9a1c.js</code>, <code>/styles.b72e0d.css</code>. Router của app biết các route: <code>/</code>, <code>/races</code>, <code>/races/5</code>.</p>
  <div class="row" style="margin-bottom:10px">
    <label>URL: <select id="sp-url"><option>/</option><option selected>/races</option><option>/races/5</option><option>/khong-co</option></select></label>
    <label><input type="checkbox" id="sp-fb"> Server có <b>fallback về index.html</b> (<code>try_files … /index.html</code>)</label>
  </div>
  <div class="row" style="margin-bottom:10px">
    <button class="btn" id="sp-nav">🖱 Bấm link trong app (điều hướng client)</button>
    <button class="btn alt" id="sp-f5">⟳ F5 / mở link trực tiếp</button>
  </div>
  <div class="output" id="sp-log" style="border-radius:8px;min-height:130px"></div>
  <div id="sp-res" style="margin-top:10px;font-size:18px;font-weight:700"></div>
</div>
<div class="box tip"><b>Nhận xét</b><ul>
<li>Bấm link trong app: <b>không có request</b> tới server — Angular router đổi URL bằng History API.</li>
<li>F5 trên <code>/races</code> không có fallback: <b>404</b>. Bật fallback: server trả <code>index.html</code>, Angular khởi động lại, router đọc URL và hiện đúng trang.</li>
<li>URL không tồn tại trong app (<code>/khong-co</code>): với fallback, server vẫn trả <code>index.html</code> (status 200), nên trang “404” phải do <b>router</b> hiển thị (route <code>**</code>).</li></ul></div>

<h3>Cấu hình thực tế</h3>
<textarea class="code" data-lang="bash" data-title="nginx">
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;

  # file có hash trong tên: cache 1 năm
  location ~* \\.(?:js|css|png|jpg|svg|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; }
  # index.html: không cache, vì nó trỏ tới file mới nhất
  location = /index.html { add_header Cache-Control "no-cache"; }
  # mọi route khác: nếu không có file thật thì trả index.html
  location / { try_files $uri $uri/ /index.html; }
}
</textarea>
<textarea class="code" data-lang="bash" data-title="Apache (.htaccess)">
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
</textarea>
<textarea class="code" data-lang="bash" data-title="Netlify (_redirects) / Firebase (firebase.json)">
/*    /index.html   200

"rewrites": [ { "source": "**", "destination": "/index.html" } ]
</textarea>
<textarea class="code" data-lang="bash" data-title="Docker + nginx">
FROM node:22 AS build
WORKDIR /app
COPY . .
RUN npm ci && npx ng build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/pony-racer/browser /usr/share/nginx/html
</textarea>
<div class="box info"><b>Khác: HashLocationStrategy</b><p>Nếu không sửa được server, router có thể dùng URL dạng <code>/#/races</code> (<code>withHashLocation()</code>) — phần sau <code>#</code> không bao giờ gửi tới server. Xấu hơn và kém SEO; chỉ là phương án cuối.</p></div>`
    },
    {
      id: 'checklist', title: 'Danh sách kiểm tra trước khi lên production',
      html: `
<p>Tích các mục bạn đã làm (trạng thái được nhớ trong trình duyệt của bạn):</p>
<div class="widget" id="w-chk">
  <div id="ck-bar" style="height:10px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:6px"><div id="ck-fill" style="height:100%;width:0;background:var(--ok);transition:width .3s"></div></div>
  <div class="hint" id="ck-txt" style="margin-bottom:10px"></div>
  <div id="ck-list"></div>
</div>
<p>Nếu bạn dùng Angular CLI, hầu hết các tối ưu đã được cấu hình sẵn — đó là lý do sách khuyên nên dùng CLI. Tự dùng webpack/rollup thì bạn phải tái hiện tất cả bằng tay.</p>`
    }
  ],
  quiz: [
    { q: 'Làm sao code Angular dùng đúng địa chỉ API ở production?', options: ['Sửa tay trước khi build', 'Import environment.ts; configuration production thay nó bằng environment.prod.ts (fileReplacements)', 'Dùng biến toàn cục window.API'], answer: 1, why: 'CLI thay file lúc biên dịch.' },
    { q: '<code>ng build --configuration=production,preprod</code> nghĩa là?', options: ['Chạy hai build riêng', 'Gộp hai configuration; preprod ghi đè thuộc tính của production', 'Lỗi vì không cho phép'], answer: 1, why: 'Từ CLI 9 cho phép gộp; cấu hình sau thắng.' },
    { q: 'Người dùng F5 tại /races và nhận 404. Nguyên nhân?', options: ['Bug trong Angular router', 'Server tĩnh chưa cấu hình trả index.html cho mọi route', 'Thiếu enableProdMode'], answer: 1, why: 'F5 là request tới server cho file /races; cần fallback về index.html.' },
    { q: 'Vì sao đặt cache lâu cho mọi file ngoại trừ index.html?', options: ['index.html nặng nhất', 'File khác có hash trong tên nên đổi tên khi đổi nội dung; index.html trỏ tới tên mới', 'Trình duyệt không cache HTML'], answer: 1, why: 'Cache busting bằng hash, và index.html phải luôn tươi.' },
    { q: 'strictTemplates giúp gì?', options: ['Build nhanh hơn', 'Compiler kiểm tra kiểu input, sự kiện, biến tham chiếu trong template ngay lúc build', 'Giảm kích thước bundle'], answer: 1, why: 'Bắt lỗi template sớm thay vì lúc chạy.' },
    { q: 'Vì sao tắt sourceMap ở production?', options: ['Không tiết lộ mã nguồn gốc và build nhanh hơn', 'Để dùng được ng serve', 'Bắt buộc bởi AOT'], answer: 0, why: 'Bạn không debug trên production và không muốn công khai mã nguồn chưa minify.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== environment ===== */
    const BASE = { optimization: false, outputHashing: 'none', sourceMap: true, buildOptimizer: false, extractLicenses: false, budgets: 'không' };
    const CFG = {
      production: { opts: { optimization: true, outputHashing: 'all', sourceMap: false, buildOptimizer: true, extractLicenses: true, budgets: 'initial 500kb/1mb; style 2kb/4kb' }, file: 'environment.prod.ts', env: { production: true, apiUrl: 'https://api.ponyracer.com' } },
      preprod: { opts: { sourceMap: true }, file: 'environment.preprod.ts', env: { production: true, apiUrl: 'https://staging.ponyracer.com' } }
    };
    let order = ['production', 'preprod'];
    function drawEnv() {
      const sel = order.filter(k => $(k === 'production' ? '#en-prod' : '#en-pre').checked);
      $('#en-cmd').textContent = sel.length ? `ng build --configuration=${sel.join(',')}` : 'ng build --configuration=development    # (mặc định khi ng serve)';
      const opts = { ...BASE }; let file = 'environment.ts', env = { production: false, apiUrl: 'http://localhost:8080' }, overridden = {};
      sel.forEach(k => { Object.entries(CFG[k].opts).forEach(([o, v]) => { if (opts[o] !== undefined && sel.indexOf(k) > 0 && o in overridden) overridden[o] = k; overridden[o] = overridden[o] || k; opts[o] = v; }); file = CFG[k].file; env = CFG[k].env; });
      $('#en-opts').innerHTML = '<tr><th>Tuỳ chọn</th><th>Giá trị</th></tr>' + Object.entries(opts).map(([o, v]) => `<tr><td><code>${o}</code></td><td>${esc(String(v))}${overridden[o] ? ` <span class="pill ${sel.length > 1 && o === 'sourceMap' ? 'pending' : 'fulfilled'}" style="font-size:11px">${overridden[o]}</span>` : ''}</td></tr>`).join('');
      $('#en-envfile').textContent = `// thay: environment.ts → ${file}\nexport const environment = {\n  production: ${env.production},\n  apiUrl: '${env.apiUrl}'\n};`;
      $('#en-eff').innerHTML = `<div>${env.production ? '✅ <code>enableProdMode()</code> được gọi' : '🛠 <code>enableProdMode()</code> KHÔNG được gọi (chế độ dev)'}</div><div>API: <code>${env.apiUrl}</code></div>` +
        (sel.length > 1 ? `<div class="hint" style="margin-top:6px">Cấu hình sau (<b>${sel[sel.length - 1]}</b>) ghi đè cái trước: ${sel[sel.length - 1] === 'preprod' ? 'sourceMap bật lại, API trỏ staging.' : 'sourceMap tắt, API production.'}</div>` : '');
    }
    root.querySelectorAll('#w-env input').forEach(e => (e.onchange = drawEnv));
    $('#en-prod').checked = true; $('#en-pre').checked = true;
    $('#en-swap').onclick = () => { order = order.slice().reverse(); drawEnv(); };
    drawEnv();

    /* ===== kiểm tra kiểu template ===== */
    const CASES = [
      { t: '{{ nme }}', d: 'Gõ nhầm tên thuộc tính của component (cấp cao nhất)', need: 1, rt: 'Hiển thị rỗng, không lỗi' },
      { t: '<ns-pony [pony]="p"></ns-pony>  <!-- chưa khai báo/import -->', d: 'Phần tử chưa được khai báo', need: 1, rt: 'Component không hiện, chỉ cảnh báo console' },
      { t: '<li *ngFor="let p of ponies">{{ p.nme }}</li>', d: 'Sai thuộc tính bên trong *ngFor', need: 2, rt: 'Hiển thị rỗng cho mỗi dòng' },
      { t: '<div *ngIf="loginCtrl.hasEror(\'required\')">…</div>', d: 'Gõ nhầm method của template ref', need: 2, rt: 'TypeError khi người dùng gõ vào ô' },
      { t: '<ns-pony [selected]="\'yes\'"></ns-pony>  <!-- selected: boolean -->', d: 'Truyền sai kiểu vào @Input', need: 3, rt: 'Truthy "yes" làm sai logic âm thầm' },
      { t: '<input (input)="save($event.target.value)">', d: '$event.target có thể null / không có .value', need: 3, rt: 'Chạy được nhưng không an toàn kiểu' }
    ];
    function drawTc() {
      const lvl = +$('#tc-lvl').value;
      $('#tc-table').innerHTML = '<tr><th>Template</th><th>Lỗi</th><th>Kết quả</th></tr>' + CASES.map(c => {
        const caught = lvl >= c.need && lvl > 0;
        return `<tr><td class="mono" style="font-size:12.5px">${esc(c.t)}</td><td>${c.d}</td><td>${caught ? '<span class="pill fulfilled">✓ báo lỗi lúc build</span>' : `<span class="pill rejected">✖ lọt qua</span><div class="hint" style="margin-top:4px">${c.rt}</div>`}</td></tr>`;
      }).join('');
    }
    $('#tc-lvl').onchange = drawTc; drawTc();

    /* ===== budgets ===== */
    function drawBud() {
      const a = +$('#bu-a').value, b = +$('#bu-b').value; $('#bu-av').textContent = a; $('#bu-bv').textContent = b.toFixed(1);
      const st = (v, w, e) => v >= e ? ['rejected', '✖ LỖI — build thất bại'] : v >= w ? ['pending', '⚠ Cảnh báo'] : ['fulfilled', '✓ OK'];
      const A = st(a, 500, 1000), B = st(b, 2, 4);
      $('#bu-out').innerHTML = `<div style="margin-bottom:8px"><b>initial</b> ${a}kb <span class="pill ${A[0]}">${A[1]}</span></div><div><b>anyComponentStyle</b> ${b.toFixed(1)}kb <span class="pill ${B[0]}">${B[1]}</span></div>
        <p class="hint" style="margin-top:8px">${A[0] === 'rejected' || B[0] === 'rejected' ? 'Build dừng: hãy giảm kích thước hoặc tách lazy-load trước khi nới ngưỡng.' : 'Chỉnh ngưỡng trong angular.json → budgets.'}</p>`;
    }
    $('#bu-a').oninput = $('#bu-b').oninput = drawBud; drawBud();

    /* ===== server SPA ===== */
    const FILES = ['/index.html', '/main.3f9a1c.js', '/styles.b72e0d.css'], ROUTES = ['/', '/races', '/races/5'];
    const slog = $('#sp-log'), sres = $('#sp-res');
    const L = (t, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = t; slog.appendChild(d); };
    $('#sp-nav').onclick = () => {
      slog.innerHTML = ''; const u = $('#sp-url').value;
      L(`Router.navigateByUrl('${u}')  → history.pushState()`); L('(không có request nào tới server)', 'dim');
      ROUTES.includes(u) ? (L(`Router khớp route '${u}' → hiển thị component`, 'ok'), sres.innerHTML = '✅ Trang hiển thị') : (L(`Không route nào khớp '${u}' → route ** (trang 404 của app)`, 'dim'), sres.innerHTML = '✅ App hiển thị trang “không tìm thấy”');
    };
    $('#sp-f5').onclick = () => {
      slog.innerHTML = ''; const u = $('#sp-url').value, fb = $('#sp-fb').checked;
      L(`Trình duyệt: GET ${u}`);
      if (FILES.includes(u)) { L(`Server: có file ${u} → 200`, 'ok'); }
      else if (u === '/' ) { L('Server: / → index.html → 200', 'ok'); }
      else if (fb) { L(`Server: không có file '${u}' → fallback → trả index.html (200)`, 'ok'); }
      else { L(`Server: không có file '${u}' → 404 Not Found`, 'err'); sres.innerHTML = '❌ 404 — người dùng thấy lỗi của server'; return; }
      L('Trình duyệt: GET /main.3f9a1c.js, /styles.b72e0d.css → 200 (cache được)', 'dim');
      L('Angular khởi động lại từ đầu; router đọc URL ' + u, 'dim');
      ROUTES.includes(u) ? (L(`Router khớp '${u}' → hiển thị đúng trang`, 'ok'), sres.innerHTML = '✅ Trang hiển thị') : (L('Không route khớp → route ** (404 do app hiển thị, status HTTP vẫn 200)', 'dim'), sres.innerHTML = '⚠ Trang “không tìm thấy” của app, nhưng HTTP 200');
    };

    /* ===== checklist ===== */
    const ITEMS = [
      'Build bằng ng build (production), không dùng ng serve',
      'environment production đúng (API URL, enableProdMode)',
      'Bật strictTemplates / strict mode',
      'sourceMap tắt (hoặc không công khai) ở production',
      'Budgets đã đặt; bundle ban đầu nằm trong ngưỡng',
      'Server bật nén gzip hoặc Brotli',
      'File có hash được cache lâu; index.html thì không (no-cache)',
      'Mọi route trả về index.html (fallback SPA) + có route ** cho 404',
      'Chạy qua HTTPS; không có bí mật trong bundle',
      'Đã đo Lighthouse / DevTools trên bản production'
    ];
    let checked = {};
    try { checked = JSON.parse(localStorage.getItem('ninja.ch26') || '{}'); } catch (e) { checked = {}; }
    function drawChk() {
      $('#ck-list').innerHTML = ITEMS.map((t, i) => `<label style="display:block;padding:5px 0"><input type="checkbox" data-i="${i}" ${checked[i] ? 'checked' : ''}> ${t}</label>`).join('');
      const n = Object.values(checked).filter(Boolean).length;
      $('#ck-fill').style.width = n / ITEMS.length * 100 + '%'; $('#ck-txt').textContent = `${n}/${ITEMS.length} mục` + (n === ITEMS.length ? ' — sẵn sàng 🚀' : '');
      root.querySelectorAll('#ck-list input').forEach(c => (c.onchange = () => { checked[c.dataset.i] = c.checked; try { localStorage.setItem('ninja.ch26', JSON.stringify(checked)); } catch (e) { /* bỏ qua */ } drawChk(); }));
    }
    drawChk();
  }
});
