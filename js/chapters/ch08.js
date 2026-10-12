registerChapter(8, {
  time: '40 phút',
  lead: 'Tạo ứng dụng Angular đầu tiên với Angular CLI, đọc hiểu từng file nó sinh ra, và theo dõi chính xác cách ứng dụng khởi động: từ <code>index.html</code> → <code>main.ts</code> → module → component gốc. Trang này không cài được CLI cho bạn, nên có <b>trình khám phá project</b>, <b>máy sinh tên file</b> và <b>bộ mô phỏng bootstrap</b> để thực hành.',
  sections: [
    {
      id: 'tools', title: 'Node.js, NPM và Angular CLI',
      html: `
<p>Gần như mọi công cụ JavaScript hiện đại chạy trên <b>Node.js</b> và <b>NPM</b>. Cài Node.js bản LTS từ nodejs.org rồi kiểm tra:</p>
<textarea class="code" data-lang="bash">
node --version        # cần đủ mới so với bản Angular bạn dùng
npm --version
</textarea>
<p>Có thể tự cấu hình mọi thứ (TypeScript, bundler, test, linter, preprocessor CSS…) nhưng rất cồng kềnh. <b>Angular CLI</b> là công cụ dòng lệnh của đội Angular: tạo project đã cấu hình sẵn build, test, đóng gói. (Ý tưởng mượn từ <code>ember-cli</code>.) Nó là cách <b>chuẩn de facto</b> để tạo và build ứng dụng Angular.</p>
<textarea class="code" data-lang="bash" data-title="Tạo và chạy ứng dụng">
npm install -g @angular/cli
ng new ponyracer --prefix ns --defaults --strict      # tạo thư mục ponyracer
cd ponyracer
ng serve                                               # http://localhost:4200, tự build lại + reload khi bạn lưu file
</textarea>
<div class="tablewrap"><table>
<tr><th>Lệnh</th><th>Việc</th></tr>
<tr><td><code>ng new &lt;tên&gt;</code></td><td>Tạo project. <code>--prefix ns</code>: tiền tố selector; <code>--strict</code>: bật kiểm tra kiểu nghiêm ngặt</td></tr>
<tr><td><code>ng serve</code></td><td>Server phát triển với hot reload</td></tr>
<tr><td><code>ng generate component|service|pipe|directive|… &lt;tên&gt;</code> (<code>ng g c</code>)</td><td>Sinh file đúng quy ước và đăng ký vào module</td></tr>
<tr><td><code>ng build</code></td><td>Đóng gói ra thư mục <code>dist/</code> (chương 26)</td></tr>
<tr><td><code>ng test</code></td><td>Chạy unit test (chương 16)</td></tr>
<tr><td><code>ng add &lt;thư viện&gt;</code></td><td>Cài và cấu hình thư viện (vd. <code>@angular/localize</code>)</td></tr>
<tr><td><code>ng update</code></td><td>Nâng cấp Angular, tự chạy các migration</td></tr>
</table></div>
<div class="box info"><b>Phiên bản</b><p>Sách dùng Angular 11.2 / CLI 11.2. CLI cài về sẽ là bản mới nhất nên file sinh ra có khác chút (nhất là từ Angular 17+: standalone, không còn <code>app.module.ts</code>). Bạn chuyển qua lại giữa hai kiểu ở khám phá dưới đây.</p></div>`
    },
    {
      id: 'structure', title: 'Cấu trúc ứng dụng',
      html: `
<p>Bấm vào từng file để xem nội dung và vai trò. Đổi giữa <b>kiểu sách (NgModule)</b> và <b>kiểu hiện đại (standalone)</b>.</p>
<style>
#w-fs .tree div { padding: 3px 8px; border-radius: 6px; cursor: pointer; font-family: ui-monospace, Consolas, monospace; font-size: 13.5px; white-space: nowrap; }
#w-fs .tree div:hover { background: var(--surface2); } #w-fs .tree div.sel { background: var(--accent); color: #fff; }
#w-fs .tree .dir { color: var(--muted); cursor: default; } #w-fs .tree .dir:hover { background: none; }
</style>
<div class="widget" id="w-fs">
  <h4>📁 ponyracer/</h4>
  <div class="row" style="margin-bottom:10px">
    <label><input type="radio" name="fsm" value="old" checked> Kiểu sách (Angular 11, NgModule)</label>
    <label><input type="radio" name="fsm" value="new"> Kiểu hiện đại (standalone)</label>
  </div>
  <div class="grid2" style="grid-template-columns: 250px 1fr">
    <div class="tree" id="fs-tree"></div>
    <div><div id="fs-why" class="hint" style="margin-bottom:6px"></div><pre class="hl" id="fs-code" style="border-radius:8px;font-size:12.5px;max-height:380px;overflow:auto"></pre></div>
  </div>
</div>
<ul>
<li><b>package.json</b>: các gói <code>@angular/*</code>, <b>rxjs</b> (lập trình phản ứng, chương 13), <b>zone.js</b> (phát hiện thay đổi, chương 20), và gói dev (CLI, TypeScript, công cụ test).</li>
<li><b>tsconfig.json</b>: tuỳ chọn TypeScript — bật <i>decorators</i> (<code>experimentalDecorators</code>, <code>emitDecoratorMetadata</code>), <i>source map</i> (debug code TypeScript ngay trong trình duyệt)…</li>
<li><b>angular.json</b>: cấu hình CLI (build, serve, test, môi trường, i18n…).</li>
<li>Công cụ test: <b>karma.conf.js</b> (kiểu sách); lint: TSLint (nay là ESLint).</li>
</ul>`
    },
    {
      id: 'component', title: 'Component đầu tiên',
      html: `
<p>Component = <b>view</b> (template) + <b>logic</b> (class TypeScript). CLI đã tạo sẵn <code>app.component.ts</code>:</p>
<textarea class="code" data-lang="ts" data-title="src/app/app.component.ts">
import { Component } from '@angular/core';           // phải import decorator

@Component({
  selector: 'ns-root',                               // tìm phần tử <ns-root> trong HTML
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ponyracer';
}
</textarea>
<ul>
<li><code>@Component</code> báo cho Angular đây là một component (nhớ <code>import</code> — quên thì compiler la ngay). Hầu hết thứ cần dùng nằm trong <code>@angular/core</code>; phần khác ở gói riêng: <code>@angular/router</code>, <code>@angular/forms</code>, <code>@angular/common/http</code>…</li>
<li><b><code>selector</code></b>: mỗi khi Angular gặp phần tử khớp selector trong HTML, nó tạo <b>một instance</b> của class và <b>thay nội dung phần tử bằng template</b>.</li>
<li>Template inline (<code>template: '…'</code>) hay file riêng (<code>templateUrl</code>): ngắn thì inline, dài thì tách file. Template của app: <code>&lt;span&gt;{{ title }} app is running!&lt;/span&gt;</code>.</li>
</ul>
<div class="box tip"><b>Quy ước đặt tên (CLI áp dụng sẵn)</b><p>Class kết thúc bằng <code>Component</code>, file kết thúc bằng <code>.component.ts</code>. Selector nên có <b>tiền tố</b> riêng để tránh đụng thư viện ngoài (Ninja Squad dùng <code>ns</code> → <code>ns-pony</code>). Đặt tiền tố mặc định khi <code>ng new --prefix ns</code>.</p></div>

<div class="widget" id="w-gen">
  <h4>🪄 ng generate sẽ sinh gì?</h4>
  <div class="row" style="margin-bottom:10px">
    <label>Loại: <select id="gn-type"><option value="component">component</option><option value="service">service</option><option value="pipe">pipe</option><option value="directive">directive</option></select></label>
    <label>Tên: <input type="text" id="gn-name" value="pony-list" class="mono"></label>
    <label>Tiền tố: <input type="text" id="gn-prefix" value="ns" class="mono" style="width:60px"></label>
    <label><input type="radio" name="gnm" value="old"> NgModule</label><label><input type="radio" name="gnm" value="new" checked> standalone</label>
  </div>
  <pre class="hl" id="gn-cmd" style="border-radius:8px"></pre>
  <div class="grid2"><div><b>File được tạo</b><pre class="hl" id="gn-files" style="border-radius:8px;margin-top:6px"></pre></div>
    <div><b>Nội dung chính &amp; đăng ký</b><pre class="hl" id="gn-code" style="border-radius:8px;margin-top:6px;font-size:12.5px"></pre></div></div>
</div>`
    },
    {
      id: 'module', title: 'Module đầu tiên (NgModule)',
      html: `
<p>Component được gom vào các <b>Angular Module</b> — khác với ES module (file có <code>import</code>/<code>export</code>). Ứng dụng luôn có ít nhất một <b>module gốc</b> (<code>app.module.ts</code>, class gắn <code>@NgModule</code>):</p>
<textarea class="code" data-lang="ts" data-title="src/app/app.module.ts (kiểu sách)">
@NgModule({
  declarations: [AppComponent],        // component/directive/pipe THUỘC module này
  imports: [BrowserModule],            // các module khác mà module này dùng
  providers: [],                       // service (chương 10)
  bootstrap: [AppComponent]            // component gốc, được khởi động đầu tiên
})
export class AppModule {}
</textarea>
<div class="tablewrap"><table>
<tr><th></th><th>ES module (import/export)</th><th>Angular module (NgModule)</th></tr>
<tr><td>Là gì</td><td>Tính năng ngôn ngữ: file xuất/nhập các thứ</td><td>Khái niệm của Angular: gom component, directive, pipe, provider</td></tr>
<tr><td><code>import</code> nghĩa là</td><td>Cho phép dùng class/hàm trong code; khai báo phụ thuộc cho bundler</td><td>Cho template của bạn dùng mọi thứ module đó <b>exports</b></td></tr>
<tr><td>Trình biên dịch TypeScript</td><td>Hiểu</td><td>Không biết gì</td></tr>
</table></div>
<ul>
<li><code>BrowserModule</code> (vì app chạy trên trình duyệt; có thể là module khác khi render trên server) cung cấp <code>*ngIf</code>, <code>*ngFor</code>…</li>
<li>Thêm component thứ hai → phải <b>import class</b> (ES) <b>và</b> thêm vào <code>declarations</code> (Angular), nhưng <b>không</b> vào <code>bootstrap</code>.</li>
</ul>
<div class="box modern"><b>🆕 Hiện nay: không còn NgModule bắt buộc</b>
<p>Component <b>standalone</b> tự khai báo thứ nó dùng, và ứng dụng khởi động trực tiếp bằng component:</p>
<textarea class="code" data-lang="ts">
// app.config.ts
export const appConfig: ApplicationConfig = { providers: [provideRouter(routes)] };

// app.component.ts
@Component({ selector: 'app-root', imports: [RouterOutlet, RacesComponent], templateUrl: './app.component.html' })
export class AppComponent { title = 'ponyracer'; }

// main.ts
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
</textarea>
<p><code>declarations</code> biến mất; <code>imports</code> nằm ngay trên component. Nội dung các chương sau vẫn đúng, chỉ khác chỗ khai báo.</p></div>`
    },
    {
      id: 'bootstrap', title: 'Khởi động ứng dụng (bootstrap)',
      html: `
<textarea class="code" data-lang="ts" data-title="src/main.ts (kiểu sách)">
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) { enableProdMode(); }                 // chương 25, 26

platformBrowserDynamic().bootstrapModule(AppModule)               // khởi động module gốc
  .catch(err => console.error(err));
</textarea>
<p><code>platformBrowserDynamic</code> nằm ở gói riêng (không phải <code>@angular/core</code>) vì Angular chạy được ở nơi khác trình duyệt (server, web worker) với cách bootstrap khác. Còn <code>index.html</code> thì không có thẻ <code>&lt;script&gt;</code>: khi <code>ng serve</code>, CLI biên dịch TypeScript, đóng gói rồi <b>tự chèn thẻ script</b> vào.</p>
<textarea class="code" data-lang="html" data-title="src/index.html">
<body>
  <ns-root></ns-root>        <!-- Angular tìm phần tử khớp selector 'ns-root' của component gốc -->
</body>
</textarea>
<p>Khi “không có gì hiện ra”, nguyên nhân gần như luôn là một trong vài lỗi cấu hình. Bộ mô phỏng sau chạy đúng chuỗi các bước và cho biết bước nào hỏng:</p>

<div class="widget" id="w-boot">
  <h4>🚀 Vì sao component của tôi không hiện?</h4>
  <div class="grid2">
    <div>
      <label>Phần tử trong index.html: <select id="bt-el"><option>ns-root</option><option>app-root</option><option value="">(không có)</option></select></label><br>
      <label>selector của AppComponent: <select id="bt-sel"><option>ns-root</option><option>app-root</option></select></label><br>
      <label><input type="checkbox" id="bt-decl" checked> AppComponent có trong <code>declarations</code></label><br>
      <label><input type="checkbox" id="bt-boot" checked> AppComponent có trong <code>bootstrap</code></label><br>
      <label><input type="checkbox" id="bt-bm" checked> <code>imports: [BrowserModule]</code></label><br>
      <label><input type="checkbox" id="bt-rd"> RacesComponent (<code>&lt;ns-races&gt;</code> dùng trong template) có trong <code>declarations</code></label>
    </div>
    <div><b>Các bước</b><div id="bt-steps" style="margin-top:6px"></div></div>
  </div>
  <div id="bt-res" style="margin-top:10px"></div>
</div>
<div class="box tip"><b>Hai lỗi phổ biến nhất</b><p>(1) Quên khai báo component (<code>declarations</code>/<code>imports</code>); (2) selector không khớp tên thẻ. Gặp “không có gì xảy ra” thì kiểm tra hai thứ này trước. Thử thêm <code>&lt;ns-races&gt;</code> chưa khai báo: lỗi <code>NG8001</code>.</p></div>`
    }
  ],
  quiz: [
    { q: 'Angular CLI dùng để?', options: ['Tạo, chạy, build, test project và sinh code theo quy ước', 'Chỉ biên dịch TypeScript', 'Chỉ cài thư viện'], answer: 0, why: 'ng new / serve / generate / build / test / add / update.' },
    { q: 'selector: "ns-root" nghĩa là?', options: ['Angular tạo instance của component mỗi khi gặp phần tử <ns-root> và thay nội dung bằng template', 'Component chỉ dùng trong file CSS', 'Tên file'], answer: 0, why: 'Selector khớp phần tử trong HTML.' },
    { q: 'Khác biệt giữa import của ES module và import của NgModule?', options: ['Giống hệt', 'ES import: dùng được class trong code; NgModule imports: làm cho template dùng được các component/directive/pipe module đó export', 'NgModule import dành cho CSS'], answer: 1, why: 'Hai khái niệm trùng tên nhưng khác nghĩa.' },
    { q: 'Component thứ hai (RacesComponent) cần ở đâu trong module kiểu sách?', options: ['declarations (không cần bootstrap)', 'bootstrap', 'providers'], answer: 0, why: 'Chỉ component gốc mới vào bootstrap.' },
    { q: 'Vì sao index.html mặc định không có thẻ script?', options: ['Không cần script', 'CLI tự chèn thẻ script sau khi biên dịch và đóng gói', 'Trình duyệt tự tìm'], answer: 1, why: 'Webpack/esbuild tạo bundle rồi CLI ghi vào index.html.' },
    { q: 'Từ Angular hiện đại, ứng dụng khởi động bằng?', options: ['bootstrapApplication(AppComponent, appConfig)', 'bootstrapModule(AppModule) bắt buộc', 'ng start'], answer: 0, why: 'Standalone: không cần NgModule gốc.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== khám phá project ===== */
    const OLD = {
      'package.json': ['Khai báo phụ thuộc của dự án.', `{\n  "name": "ponyracer",\n  "scripts": { "start": "ng serve", "build": "ng build", "test": "ng test" },\n  "dependencies": {\n    "@angular/common": "~11.2.3",\n    "@angular/compiler": "~11.2.3",\n    "@angular/core": "~11.2.3",\n    "@angular/forms": "~11.2.3",\n    "@angular/platform-browser": "~11.2.3",\n    "@angular/platform-browser-dynamic": "~11.2.3",\n    "@angular/router": "~11.2.3",\n    "rxjs": "~6.6.0",\n    "tslib": "^2.0.0",\n    "zone.js": "~0.10.2"\n  },\n  "devDependencies": { "@angular/cli": "~11.2.1", "typescript": "~4.1.2", "karma": "~6.1.0", "jasmine-core": "~3.6.0" }\n}`],
      'tsconfig.json': ['Tuỳ chọn trình biên dịch TypeScript.', `{\n  "compilerOptions": {\n    "baseUrl": "./",\n    "outDir": "./dist/out-tsc",\n    "sourceMap": true,\n    "declaration": false,\n    "experimentalDecorators": true,   // cho phép @Component, @Input…\n    "emitDecoratorMetadata": true,\n    "moduleResolution": "node",\n    "target": "es2015",\n    "lib": ["es2018", "dom"],\n    "strict": true\n  },\n  "angularCompilerOptions": { "strictTemplates": true }\n}`],
      'angular.json': ['Cấu hình Angular CLI: nơi đặt tiền tố, đầu vào/ra của build, môi trường…', `{\n  "projects": {\n    "ponyracer": {\n      "prefix": "ns",\n      "architect": {\n        "build": { "options": { "outputPath": "dist/ponyracer", "index": "src/index.html", "main": "src/main.ts",\n                                 "styles": ["src/styles.css"] } },\n        "serve": { "options": { "browserTarget": "ponyracer:build" } },\n        "test": { "options": { "karmaConfig": "karma.conf.js" } }\n      }\n    }\n  }\n}`],
      'src/index.html': ['Trang HTML duy nhất. CLI tự chèn thẻ script.', `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Ponyracer</title>\n  <base href="/">\n</head>\n<body>\n  <ns-root></ns-root>\n</body>\n</html>`],
      'src/main.ts': ['Điểm khởi động: tạo platform trình duyệt và khởi động module gốc.', `import { enableProdMode } from '@angular/core';\nimport { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\nimport { AppModule } from './app/app.module';\nimport { environment } from './environments/environment';\n\nif (environment.production) {\n  enableProdMode();\n}\n\nplatformBrowserDynamic().bootstrapModule(AppModule)\n  .catch(err => console.error(err));`],
      'src/app/app.module.ts': ['Module gốc: khai báo component, import module khác, chọn component khởi động.', `import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\n\n@NgModule({\n  declarations: [AppComponent],\n  imports: [BrowserModule],\n  providers: [],\n  bootstrap: [AppComponent]\n})\nexport class AppModule {}`],
      'src/app/app.component.ts': ['Component gốc: class + metadata.', `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'ns-root',\n  templateUrl: './app.component.html',\n  styleUrls: ['./app.component.css']\n})\nexport class AppComponent {\n  title = 'ponyracer';\n}`],
      'src/app/app.component.html': ['Template: HTML + cú pháp Angular (chương 9).', `<span>{{ title }} app is running!</span>`],
      'src/app/app.component.css': ['Style chỉ áp cho component này (chương 15).', `/* trống */`],
      'src/app/app.component.spec.ts': ['Unit test (chương 16).', `describe('AppComponent', () => {\n  beforeEach(() => TestBed.configureTestingModule({ declarations: [AppComponent] }));\n  it('should create the app', () => {\n    const fixture = TestBed.createComponent(AppComponent);\n    expect(fixture.componentInstance).toBeTruthy();\n  });\n});`]
    };
    const NEW = {
      'package.json': ['Phụ thuộc: không còn cần nhiều gói riêng lẻ.', `{\n  "name": "ponyracer",\n  "scripts": { "start": "ng serve", "build": "ng build", "test": "ng test" },\n  "dependencies": {\n    "@angular/common": "^19.0.0",\n    "@angular/compiler": "^19.0.0",\n    "@angular/core": "^19.0.0",\n    "@angular/forms": "^19.0.0",\n    "@angular/platform-browser": "^19.0.0",\n    "@angular/router": "^19.0.0",\n    "rxjs": "~7.8.0",\n    "tslib": "^2.3.0",\n    "zone.js": "~0.15.0"\n  },\n  "devDependencies": { "@angular/cli": "^19.0.0", "@angular/compiler-cli": "^19.0.0", "typescript": "~5.6.2" }\n}\n// Angular zoneless có thể bỏ zone.js (chương 20)`],
      'tsconfig.json': ['Cấu hình TypeScript — strict mặc định.', `{\n  "compilerOptions": {\n    "outDir": "./dist/out-tsc",\n    "strict": true,\n    "noImplicitOverride": true,\n    "experimentalDecorators": true,\n    "target": "ES2022",\n    "module": "ES2022",\n    "moduleResolution": "bundler"\n  },\n  "angularCompilerOptions": {\n    "strictInjectionParameters": true,\n    "strictInputAccessModifiers": true,\n    "strictTemplates": true\n  }\n}`],
      'angular.json': ['Cấu hình CLI: builder mặc định là application (esbuild + Vite).', `{\n  "projects": {\n    "ponyracer": {\n      "prefix": "app",\n      "architect": {\n        "build": { "builder": "@angular-devkit/build-angular:application",\n                   "options": { "outputPath": "dist/ponyracer", "browser": "src/main.ts", "styles": ["src/styles.css"] } },\n        "serve": { "builder": "@angular-devkit/build-angular:dev-server" },\n        "test": { "builder": "@angular-devkit/build-angular:karma" }\n      }\n    }\n  }\n}`],
      'src/index.html': ['Trang HTML duy nhất.', `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Ponyracer</title>\n  <base href="/">\n</head>\n<body>\n  <app-root></app-root>\n</body>\n</html>`],
      'src/main.ts': ['Khởi động trực tiếp component gốc — không có AppModule.', `import { bootstrapApplication } from '@angular/platform-browser';\nimport { appConfig } from './app/app.config';\nimport { AppComponent } from './app/app.component';\n\nbootstrapApplication(AppComponent, appConfig)\n  .catch(err => console.error(err));`],
      'src/app/app.config.ts': ['Thay cho phần providers/imports toàn cục của AppModule.', `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';\nimport { provideRouter } from '@angular/router';\nimport { routes } from './app.routes';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]\n};`],
      'src/app/app.routes.ts': ['Cấu hình router (chương 18).', `import { Routes } from '@angular/router';\n\nexport const routes: Routes = [];`],
      'src/app/app.component.ts': ['Component standalone: tự khai báo thứ nó dùng trong imports.', `import { Component } from '@angular/core';\nimport { RouterOutlet } from '@angular/router';\n\n@Component({\n  selector: 'app-root',\n  imports: [RouterOutlet],\n  templateUrl: './app.component.html',\n  styleUrl: './app.component.css'\n})\nexport class AppComponent {\n  title = 'ponyracer';\n}\n// Angular 20+ có thể sinh tên file/class ngắn hơn (app.ts, class App) theo style guide mới.`],
      'src/app/app.component.html': ['Template có thể dùng control flow mới (chương 9).', `<h1>{{ title }}</h1>\n<router-outlet />`],
      'src/app/app.component.css': ['Style của component.', `/* trống */`]
    };
    const fsTree = $('#fs-tree'); let cur = 'src/app/app.component.ts';
    const draw = () => {
      const D = root.querySelector('input[name=fsm]:checked').value === 'old' ? OLD : NEW;
      const files = Object.keys(D); if (!D[cur]) cur = 'src/app/app.component.ts';
      const dirs = [['ponyracer/', 0], ['', 0]];
      let html = '<div class="dir">📁 ponyracer/</div>';
      const groups = {}; files.forEach(f => { const parts = f.split('/'); const dir = parts.slice(0, -1).join('/'); (groups[dir] = groups[dir] || []).push(f); });
      ['', 'src', 'src/app'].forEach(d => {
        if (d) html += `<div class="dir" style="padding-left:${8 + (d.split('/').length) * 12}px">📁 ${d.split('/').pop()}/</div>`;
        (groups[d] || []).forEach(f => { html += `<div class="${f === cur ? 'sel' : ''}" data-f="${f}" style="padding-left:${8 + (d ? d.split('/').length + 1 : 1) * 12}px">${f.split('/').pop()}</div>`; });
      });
      fsTree.innerHTML = html;
      fsTree.querySelectorAll('[data-f]').forEach(e => (e.onclick = () => { cur = e.dataset.f; draw(); }));
      $('#fs-why').innerHTML = '<b>' + esc(cur) + '</b> — ' + esc(D[cur][0]); $('#fs-code').textContent = D[cur][1];
    };
    root.querySelectorAll('input[name=fsm]').forEach(r => (r.onchange = draw)); draw();

    /* ===== ng generate ===== */
    const pascal = s => s.split(/[-_ ]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('');
    const camel = s => { const p = pascal(s); return p ? p[0].toLowerCase() + p.slice(1) : ''; };
    function gen() {
      const type = $('#gn-type').value, name = ($('#gn-name').value.trim() || 'pony-list').toLowerCase().replace(/[^a-z0-9-]/g, '-'), pre = $('#gn-prefix').value.trim() || 'ns';
      const standalone = root.querySelector('input[name=gnm]:checked').value === 'new', P = pascal(name), C = camel(name);
      const alias = { component: 'c', service: 's', pipe: 'p', directive: 'd' }[type];
      $('#gn-cmd').textContent = `ng generate ${type} ${name}        # hoặc: ng g ${alias} ${name}`;
      const ext = type;
      const files = [`src/app/${name}/${name}.${ext}.ts`]; if (type === 'component') files.push(`src/app/${name}/${name}.component.html`, `src/app/${name}/${name}.component.css`);
      files.push(`src/app/${name}/${name}.${ext}.spec.ts`);
      if (type === 'service') { files[0] = `src/app/${name}.service.ts`; files[1] = `src/app/${name}.service.spec.ts`; }
      else if (type !== 'component') { files[0] = `src/app/${name}.${ext}.ts`; files[1] = `src/app/${name}.${ext}.spec.ts`; }
      $('#gn-files').textContent = files.join('\n') + (type === 'component' && !standalone ? '\n\n✎ cập nhật: src/app/app.module.ts' : '');
      let code;
      if (type === 'component') code = `@Component({\n  selector: '${pre}-${name}',                  // ${pre}-${name}\n  ${standalone ? 'imports: [],\n  ' : ''}templateUrl: './${name}.component.html',\n  styleUrls: ['./${name}.component.css']\n})\nexport class ${P}Component {}\n\n` + (standalone ? `// để dùng: thêm ${P}Component vào "imports" của component cha\n// rồi viết <${pre}-${name}></${pre}-${name}> trong template cha` : `// app.module.ts được CLI sửa:\nimport { ${P}Component } from './${name}/${name}.component';\n@NgModule({ declarations: [AppComponent, ${P}Component], … })`);
      else if (type === 'service') code = `@Injectable({ providedIn: 'root' })\nexport class ${P}Service {}\n\n// tiêm: constructor(private ${C}Service: ${P}Service) {}   (chương 10, 11)`;
      else if (type === 'pipe') code = `@Pipe({ name: '${C}' })\nexport class ${P}Pipe implements PipeTransform {\n  transform(value: unknown): unknown { return value; }\n}\n// template: {{ x | ${C} }}`;
      else code = `@Directive({ selector: '[${pre}${P}]' })\nexport class ${P}Directive {}\n// template: <div ${pre}${P}></div>`;
      $('#gn-code').textContent = code;
    }
    root.querySelectorAll('#w-gen input, #w-gen select').forEach(e => (e.oninput = e.onchange = gen)); gen();

    /* ===== mô phỏng bootstrap ===== */
    function boot() {
      const el = $('#bt-el').value, sel = $('#bt-sel').value, decl = $('#bt-decl').checked, bs = $('#bt-boot').checked, bm = $('#bt-bm').checked, rd = $('#bt-rd').checked;
      const steps = []; let ok = true, dom = '';
      const step = (t, state, note) => steps.push(`<div style="margin:4px 0"><span class="pill ${state}" style="font-size:11px">${state === 'fulfilled' ? '✓' : state === 'rejected' ? '✖' : '–'}</span> ${t}${note ? `<div class="hint mono" style="font-size:12px;margin-left:30px;color:${state === 'rejected' ? 'var(--err)' : 'var(--muted)'}">${esc(note)}</div>` : ''}</div>`);
      step('ng serve: biên dịch TypeScript, đóng gói, chèn <script> vào index.html', 'fulfilled');
      step('Trình duyệt tải index.html và các bundle, chạy main.ts', 'fulfilled');
      step('platformBrowserDynamic().bootstrapModule(AppModule)', 'fulfilled');
      if (!bs) { step('AppModule.bootstrap = [ ] — không có component gốc để khởi động', 'rejected', 'Không có gì được khởi động. (Angular: "AppModule does not have any bootstrap components")'); ok = false; }
      else if (!decl) { step('Kiểm tra AppComponent thuộc module', 'rejected', "Component AppComponent is not part of any NgModule or the module has not been imported into your module (thêm vào declarations)."); ok = false; }
      else step('AppComponent thuộc declarations ✓', 'fulfilled');
      if (ok) {
        if (!el || el !== sel) { step(`Tìm phần tử khớp selector '${sel}' trong index.html`, 'rejected', `The selector "${sel}" did not match any elements` + (el ? ` (index.html có <${el}>)` : ' (index.html không có phần tử nào)')); ok = false; }
        else step(`Tìm thấy <${el}> khớp selector '${sel}' → tạo instance AppComponent`, 'fulfilled');
      }
      if (ok && !bm) { step('Render template: *ngIf, *ngFor, … cần module của trình duyệt', 'rejected', 'BrowserModule (CommonModule) chưa được import → directive/pipe cơ bản không dùng được'); ok = false; }
      else if (ok) step('BrowserModule được import ✓', 'fulfilled');
      if (ok) {
        step('Render template AppComponent: <h1>PonyRacer</h1><ns-races></ns-races>', 'fulfilled');
        if (!rd) { step("Phần tử <ns-races>", 'rejected', "NG8001: 'ns-races' is not a known element — RacesComponent chưa có trong declarations"); dom = `<${el}>\n  <h1>PonyRacer</h1>\n  <ns-races></ns-races>   ← phần tử lạ, không có nội dung\n</${el}>`; }
        else { step("Phần tử <ns-races> → tạo RacesComponent", 'fulfilled'); dom = `<${el}>\n  <h1>PonyRacer</h1>\n  <ns-races>\n    <h2>Races</h2>\n  </ns-races>\n</${el}>`; }
      }
      $('#bt-steps').innerHTML = steps.join('');
      $('#bt-res').innerHTML = ok && rd ? `<span class="pill fulfilled">✓ Chạy tốt</span><pre class="hl" style="border-radius:8px;margin-top:6px">${esc(dom)}</pre>` : ok ? `<span class="pill pending">⚠ Chạy một phần</span><pre class="hl" style="border-radius:8px;margin-top:6px">${esc(dom)}</pre>` : '<span class="pill rejected">✖ Không có gì hiển thị</span>';
    }
    root.querySelectorAll('#w-boot input, #w-boot select').forEach(e => (e.onchange = boot)); boot();
  }
});
