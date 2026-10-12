registerChapter(18, {
  time: '70 phút',
  lead: 'Router biến <b>URL thành trạng thái của ứng dụng</b>: mỗi URL biết component nào cần hiện, mà không tải lại trang. Trang này có một <b>router thu nhỏ chạy thật</b> (cùng cấu hình <code>Routes</code>, guard, resolver, lazy loading, sự kiện) — bạn bấm link, gõ URL, và nhìn nó nhận diện route, chạy guard/resolver, tạo hay tái sử dụng component.',
  sections: [
    {
      id: 'intro', title: 'Router để làm gì, và bắt đầu cấu hình',
      html: `
<p>Router của AngularJS 1.x (<code>ngRoute</code>) chỉ cho một view mỗi URL và không lồng nhau; cộng đồng dùng <code>ui-router</code>. Router của Angular (<code>@angular/router</code>) giải quyết cả hai: <b>URL có ý nghĩa</b>, <b>view lồng nhau</b>, và tất cả diễn ra <b>không tải lại trang, không gọi server</b> (Single Page Application).</p>
<textarea class="code" data-lang="ts" data-title="app.routes.ts">
export const ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'races', component: RacesComponent }
];
</textarea>
<textarea class="code" data-lang="ts" data-title="Đăng ký router: sách (NgModule) và hiện nay">
// Sách (Angular 11)
@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(ROUTES)],
  declarations: [AppComponent, HomeComponent, RacesComponent],
  bootstrap: [AppComponent]
})

// Hiện nay: app.config.ts
export const appConfig: ApplicationConfig = { providers: [provideRouter(ROUTES)] };
</textarea>
<p>Component của route được chèn vào chỗ đánh dấu bởi <code>&lt;router-outlet&gt;</code> trong template của component gốc; phần còn lại (header, footer) giữ nguyên:</p>
<textarea class="code" data-lang="html" data-title="app.component.html">
<header><nav>…</nav></header>
<main>
  <router-outlet></router-outlet>        <!-- component của route hiện tại nằm ngay sau đây -->
</main>
<footer>made with &lt;3 by Ninja Squad</footer>
</textarea>`
    },
    {
      id: 'lab', title: 'Phòng thí nghiệm Router (chạy thật)',
      html: `
<p>Ứng dụng PonyRacer thu nhỏ với cấu hình route đầy đủ như phía dưới. Quan sát <b>URL</b>, <b>chuỗi component lồng nhau</b> trong outlet, <b>sự kiện điều hướng</b>, và dòng nhãn <i>mới / tái sử dụng</i> của component.</p>

<div class="widget" id="w-rt">
  <h4>🧭 Router lab</h4>
  <div class="row" style="margin-bottom:8px">
    <button class="btn alt" id="rt-back">◀</button><button class="btn alt" id="rt-fwd">▶</button>
    <input type="text" id="rt-url" class="mono" style="flex:1;min-width:220px" placeholder="/races/1" spellcheck="false">
    <button class="btn" id="rt-go">Đi</button>
  </div>
  <div class="row" style="margin-bottom:8px"><b>routerLink:</b><span id="rt-links"></span></div>
  <div class="row" style="margin-bottom:10px">
    <label><input type="checkbox" id="rt-logged"> Đã đăng nhập (cho <code>LoggedInGuard</code>)</label>
    <label><input type="checkbox" id="rt-order"> Đảo thứ tự: <code>races/:raceId</code> đứng trước <code>races/new</code></label>
    <label>Resolver chậm: <select id="rt-lat"><option value="100">0,1s</option><option value="800" selected>0,8s</option><option value="2500">2,5s</option></select></label>
    <button class="btn alt" id="rt-reset">↺ Làm lại (quên bundle đã tải)</button>
  </div>
  <div class="grid2">
    <div>
      <b>Trang (outlet lồng nhau)</b>
      <div id="rt-page" style="border:1px solid var(--border);border-radius:10px;background:var(--surface);padding:10px;margin-top:6px;min-height:200px"></div>
    </div>
    <div>
      <b>Sự kiện router</b>
      <div class="output" id="rt-log" style="border-radius:8px;height:260px;overflow:auto;margin-top:6px"></div>
    </div>
  </div>
  <b style="display:block;margin-top:10px">Cấu hình đang dùng</b>
  <pre class="hl" id="rt-cfg" style="border-radius:8px;margin-top:6px;font-size:12px"></pre>
</div>
<div class="box tip"><b>Thử theo thứ tự</b><ol>
<li>Bấm <b>Races</b> khi chưa đăng nhập: guard <b>chuyển hướng</b> tới <code>/login</code> (sự kiện <code>NavigationCancel</code> + điều hướng mới). Đăng nhập rồi bấm lại.</li>
<li><b>Race 1</b> rồi <b>Race 2</b>: lần hai component <b>♻ được tái sử dụng</b> (không tạo lại, <code>ngOnInit</code> không chạy lại) — chỉ <code>paramMap</code> phát giá trị mới; resolver chạy lại.</li>
<li><b>Race 13</b>: resolver báo lỗi → <code>NavigationError</code>, URL <b>không đổi</b>, trang cũ được giữ.</li>
<li><b>New race</b> với thứ tự đúng hiển thị form tạo; bật <b>đảo thứ tự</b> thì <code>new</code> bị hiểu là <code>:raceId = 'new'</code> (route đầu tiên khớp thắng).</li>
<li><b>Pony 7</b>: URL tự đổi sang <code>/ponies/7/birth-certificate</code> (redirect của route con rỗng); component cha và con lồng nhau.</li>
<li><b>Admin</b>: sự kiện <code>RouteConfigLoadStart/End</code> — bundle được tải lười, lần thứ hai không tải lại.</li>
<li><code>/races/42;foo=bar</code> (matrix param) và <code>?sort=asc</code> (query param); <b>URL lạ</b> rơi vào <code>**</code>; <code>/home</code> bị <b>redirect</b> về <code>/</code>.</li></ol></div>`
    },
    {
      id: 'nav', title: 'Điều hướng: routerLink, Router.navigate, tham số',
      html: `
<p>Đừng dùng <code>&lt;a href&gt;</code> thường — nó tải lại cả trang và khởi động lại ứng dụng. Dùng <b><code>routerLink</code></b> (router tính <code>href</code> và chặn việc tải lại):</p>
<textarea class="code" data-lang="html">
<a routerLink="/">Home</a>                                          <!-- dấu / đầu: tính từ gốc -->
<a [routerLink]="['/races', race.id, 'ponies', pony.id]">Pony</a>   <!-- mảng: các đoạn + tham số -->
<a routerLink="/" routerLinkActive="selected-menu">Home</a>         <!-- thêm class khi link khớp URL hiện tại -->
</textarea>
<textarea class="code" data-lang="ts" data-title="Điều hướng bằng code">
constructor(private router: Router) {}
saveAndMoveBackToHome(): void {
  // ... lưu ...
  this.router.navigate(['/']);            // hoặc router.navigateByUrl('/')
}
</textarea>
<p>Thử cách router ghép URL từ mảng lệnh, ngay đây:</p>
<textarea class="live" data-title="createUrlTree: path, tham số, matrix param, query param">
const router = new MiniRouter.Router([]);

console.log(router.createUrlTree(['/races']));
console.log(router.createUrlTree(['/races', 42, 'ponies']));
console.log(router.createUrlTree(['/races', 42, { foo: 'bar', baz: 'wiz' }, 'ponies']));              // matrix param
console.log(router.createUrlTree(['/races', 42, 'ponies'], { queryParams: { foo: 'bar', baz: 'wiz' } })); // query param

console.log(JSON.stringify(router.parseUrl('/races/42;foo=bar;baz=wiz/ponies?sort=asc'), (k, v) => (typeof v === 'function' ? undefined : v)));
</textarea>
<div class="tablewrap"><table>
<tr><th></th><th>Matrix param</th><th>Query param</th></tr>
<tr><td>Hình dạng</td><td><code>/races/42;foo=bar;baz=wiz/ponies</code></td><td><code>/races/42/ponies?foo=bar&amp;baz=wiz</code></td></tr>
<tr><td>Phạm vi</td><td>Chỉ riêng <b>đoạn URL</b> chứa nó</td><td><b>Mọi</b> route trong URL đều thấy</td></tr>
<tr><td>Đọc</td><td><code>route.paramMap</code> (cùng với tham số <code>:id</code>)</td><td><code>route.queryParamMap</code></td></tr>
<tr><td>Độ phổ biến</td><td>Hiếm</td><td>Rất phổ biến (lọc, phân trang)</td></tr>
</table></div>
<h3>Đọc tham số: ActivatedRoute</h3>
<textarea class="code" data-lang="ts" data-title="snapshot — dùng được nếu component luôn được tạo mới">
ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('ponyId');
  this.ponyService.get(id).subscribe(pony => (this.pony = pony));
}
</textarea>
<div class="box warn"><b>Router TÁI SỬ DỤNG component!</b><p>Đi từ <code>/ponies/1</code> sang <code>/ponies/2</code> (nút “Next”): router giữ nguyên instance, <code>ngOnInit</code> <b>không</b> chạy lại. Hãy thử trong lab (Race 1 → Race 2). Muốn cập nhật phải <b>đăng ký</b> <code>paramMap</code>:</p></div>
<textarea class="code" data-lang="ts" data-title="paramMap + switchMap (cách gọn nhất)">
this.route.paramMap
  .pipe(
    map(params => params.get('ponyId')),
    switchMap(id => this.ponyService.get(id))            // huỷ cuộc gọi cũ khi đổi pony (chương 22)
  )
  .subscribe(pony => (this.pony = pony));
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
provideRouter(ROUTES, withComponentInputBinding());      // tham số route/query/data thành @Input của component

@Component({ ... })
export class PonyComponent {
  ponyId = input.required<string>();                      // /ponies/:ponyId → tự gán, đổi URL tự cập nhật
  pony = toSignal(toObservable(this.ponyId).pipe(switchMap(id => this.ponyService.get(id))));
}
</textarea></div>`
    },
    {
      id: 'matching', title: 'Redirect, matching và route lồng nhau',
      html: `
<h3>Redirect và <code>pathMatch</code></h3>
<textarea class="code" data-lang="ts">
{ path: '', pathMatch: 'full', redirectTo: '/breaking' }       // CHỈ khi URL đúng là rỗng
{ path: 'home', pathMatch: 'full', redirectTo: '/' }           // URL cũ → URL mới
</textarea>
<p>Chiến lược mặc định là <code>'prefix'</code>: route khớp khi URL <b>bắt đầu bằng</b> <code>path</code>. Mọi URL đều bắt đầu bằng chuỗi rỗng, nên route <code>path: ''</code> với <code>redirectTo</code> mà quên <code>pathMatch: 'full'</code> sẽ <b>nuốt mọi URL</b>.</p>
<h3>Thứ tự rất quan trọng</h3>
<p>Router lấy <b>route đầu tiên khớp</b>. Với <code>races/:id</code> đứng trước <code>races/new</code>, URL <code>races/new</code> bị hiểu là <code>id = 'new'</code>. Đặt route <b>cụ thể trước</b>, route có tham số sau, và <code>**</code> cuối cùng. (Bật “Đảo thứ tự” trong lab để thấy.)</p>
<h3>Route lồng nhau (children) và route đường dẫn rỗng</h3>
<p>Trang pony có phần đầu (tên, ảnh) chung và ba tab, mỗi tab một URL. Đặt <code>&lt;router-outlet&gt;</code> thứ hai trong template của <code>PonyComponent</code>:</p>
<textarea class="code" data-lang="ts">
{
  path: 'ponies/:ponyId',
  component: PonyComponent,                         // chứa router-outlet lồng
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'birth-certificate' },   // mặc định tab đầu (đường dẫn tương đối: không có /)
    { path: 'birth-certificate', component: BirthCertificateComponent },
    { path: 'track-record', component: TrackRecordComponent },
    { path: 'reviews', component: ReviewsComponent }
  ]
}
// Hoặc không redirect, hiển thị trực tiếp:  { path: '', component: BirthCertificateComponent }
</textarea>
<p>Route cha <b>không component</b>, <b>đường dẫn rỗng</b> (<code>{ path: '', canActivate: [...], children: [...] }</code>) không tiêu thụ đoạn URL nào nhưng cho phép <b>áp guard/resolver cho nhiều route con một lượt</b> — chính là cấu hình trong lab.</p>`
    },
    {
      id: 'guards', title: 'Guard: chặn hoặc chuyển hướng điều hướng',
      html: `
<p>Người dùng không đủ quyền vẫn có thể gõ URL thẳng vào thanh địa chỉ — ẩn link là chưa đủ (và server cũng phải kiểm tra quyền). <b>Guard</b> quyết định trước khi route được kích hoạt:</p>
<div class="tablewrap"><table>
<tr><th>Guard</th><th>Tác dụng</th></tr>
<tr><td><code>canActivate</code></td><td>Có được vào route này không? Có thể trả <b>UrlTree</b> để chuyển hướng (vd. tới <code>/login</code>)</td></tr>
<tr><td><code>canActivateChild</code></td><td>Chặn hàng loạt route con</td></tr>
<tr><td><code>canLoad</code></td><td>Chặn cả việc <b>tải bundle</b> lazy-load (mạnh hơn canActivate)</td></tr>
<tr><td><code>canDeactivate</code></td><td>Chặn việc <b>rời</b> route (xác nhận khi có form dở dang)</td></tr>
</table></div>
<p>Guard trả về <code>boolean</code>, <code>UrlTree</code>, hoặc Promise/Observable của chúng. <code>true</code> → vào; <code>false</code> → huỷ (<code>NavigationCancel</code>); <code>UrlTree</code> → huỷ và điều hướng tới đó. Mô phỏng (chạy được):</p>
<textarea class="live" data-time data-title="Guard canActivate + chuyển hướng bằng UrlTree">
const { Router } = MiniRouter;
let loggedIn = false;

const router = new Router([
  { path: 'login', component: 'Login' },
  { path: 'races', component: 'Races', canActivate: [() => loggedIn || router.parseUrl('/login')] },   // như LoggedInGuard
  { path: '**', component: 'NotFound' }
]);
router.events.subscribe(e => console.log(' ', e.type + (e.reason ? ' — ' + e.reason : '')));
const where = () => console.log('  → URL hiện tại:', router.url, '| component:', router.state.chain.map(n => n.route.component).join(' > '));

console.log('chưa đăng nhập, vào /races');
await router.navigateByUrl('/races');
await new Promise(r => setTimeout(r, 50));
where();

loggedIn = true;
console.log('đã đăng nhập, vào /races');
await router.navigateByUrl('/races');
where();
</textarea>
<textarea class="code" data-lang="ts" data-title="Angular: sách (class) và hiện nay (hàm)">
// Sách
@Injectable({ providedIn: 'root' })
export class LoggedInGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.userService.isLoggedIn() || this.router.parseUrl('/login');
  }
}
{ path: 'races', component: RacesComponent, canActivate: [LoggedInGuard] }

// Hiện nay: guard là hàm (CanActivateFn), dùng inject()
export const loggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserService).isLoggedIn() || router.parseUrl('/login');
};
// Áp cho nhiều route:  { path: '', canActivate: [loggedInGuard], children: [ …races, …ponies ] }
</textarea>`
    },
    {
      id: 'resolvers', title: 'Resolver: có dữ liệu rồi mới chuyển trang',
      html: `
<p>Nếu component tự tải dữ liệu, router chèn component và đổi URL <b>ngay</b>, trang trống một lúc rồi mới có dữ liệu — cảm giác nhanh nhưng template phải chịu được <code>null</code>, và nếu tải lỗi thì URL đã đổi mà trang vô nghĩa. <b>Resolver</b> tải dữ liệu <b>trước khi</b> kích hoạt route: lỗi thì ở nguyên trang cũ (thử “Race 13” trong lab).</p>
<textarea class="code" data-lang="ts">
@Injectable({ providedIn: 'root' })
export class RaceResolver implements Resolve<RaceModel> {
  constructor(private raceService: RaceService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<RaceModel> {
    return this.raceService.get(+route.paramMap.get('raceId')!);      // + đổi string → number
  }
}
{ path: 'races/:raceId', component: RaceComponent, resolve: { race: RaceResolver } }

// Trong component
ngOnInit() { this.route.data.subscribe(data => (this.race = data.race)); }   // subscribe vì component được tái sử dụng
</textarea>
<div class="tablewrap"><table>
<tr><th>Resolver</th><th>Component tự tải</th></tr>
<tr><td>Điều hướng “truyền thống”: xong dữ liệu mới đổi trang</td><td>Chuyển trang ngay, có thể hiện spinner</td></tr>
<tr><td>Component đơn giản, không lo <code>null</code></td><td>Template phải xử lý <code>null/undefined</code></td></tr>
<tr><td>Lỗi → ở lại trang cũ</td><td>Đã đổi URL dù không có dữ liệu</td></tr>
<tr><td>Tái sử dụng cho nhiều route</td><td>—</td></tr>
<tr><td>Nhược: bấm xong “không có gì xảy ra” nếu API chậm</td><td>Phản hồi tức thì</td></tr>
</table></div>
<p>Với API chậm, kết hợp <b>sự kiện router</b> để hiện thanh tiến trình toàn cục (xem tiếp).</p>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
export const raceResolver: ResolveFn<RaceModel> = route => inject(RaceService).get(+route.paramMap.get('raceId')!);
{ path: 'races/:raceId', component: RaceComponent, resolve: { race: raceResolver } }
// với withComponentInputBinding(): dữ liệu resolve chảy thẳng vào @Input() race
</textarea></div>`
    },
    {
      id: 'events', title: 'Sự kiện của router và data tĩnh',
      html: `
<p>Inject <code>Router</code> và subscribe <code>router.events</code>; lọc bằng <code>instanceof</code>. Bạn đã thấy chúng trôi qua trong khung nhật ký của lab:</p>
<div class="tablewrap"><table>
<tr><th>Sự kiện</th><th>Dùng để</th></tr>
<tr><td><code>NavigationStart</code></td><td>Bật spinner</td></tr>
<tr><td><code>NavigationEnd</code></td><td>Tắt spinner; gửi page-view cho analytics</td></tr>
<tr><td><code>NavigationCancel</code></td><td>Tắt spinner (vd. guard từ chối)</td></tr>
<tr><td><code>NavigationError</code></td><td>Tắt spinner, ghi log lỗi (vd. resolver thất bại)</td></tr>
<tr><td><code>RoutesRecognized</code>, <code>GuardsCheckStart/End</code>, <code>ResolveStart/End</code>, <code>RouteConfigLoadStart/End</code>, <code>Scroll</code>…</td><td>Chi tiết từng giai đoạn</td></tr>
</table></div>
<textarea class="code" data-lang="ts">
this.loading$ = this.router.events.pipe(
  filter(e => e instanceof NavigationStart || e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
  map(e => e instanceof NavigationStart)               // true khi đang chuyển trang
);
</textarea>
<h3>Dữ liệu tĩnh theo route</h3>
<textarea class="code" data-lang="ts">
{ path: 'races', component: RacesComponent, data: { allowDeletion: false } }     // cùng component dùng trong hai ngữ cảnh khác nhau
// đọc: this.route.snapshot.data.allowDeletion
</textarea>`
    },
    {
      id: 'lazy', title: 'Lazy loading: tải theo nhu cầu',
      html: `
<p>Ứng dụng lớn mà tải hết ngay thì bundle nặng và khởi động chậm; nhiều phần (khu vực admin) chỉ vài người dùng. <b>Lazy loading</b> tách ứng dụng thành nhiều bundle JS; router chỉ tải bundle khi người dùng đi tới route đó. Trong lab, bấm <b>Admin</b> và xem sự kiện <code>RouteConfigLoadStart/End</code> (chỉ lần đầu).</p>
<textarea class="code" data-lang="ts" data-title="Sách: lazy module / Hiện nay: lazy routes hoặc component">
// Sách (NgModule): AdminModule dùng RouterModule.forChild(ADMIN_ROUTES) — KHÔNG forRoot lần hai
{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }

// Hiện nay (standalone)
{ path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) }
{ path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) }
</textarea>
<ul>
<li>CLI đọc cấu hình route, tự sinh bundle riêng (<code>chunk</code>) và mã tải nó.</li>
<li>Muốn tải ngầm lúc rảnh: <code>provideRouter(ROUTES, withPreloading(PreloadAllModules))</code> hoặc chiến lược preload tuỳ biến.</li>
<li><code>canLoad</code> (nay <code>canMatch</code>) chặn cả việc tải bundle với người không có quyền.</li>
<li>Đổi lại bạn có thêm độ phức tạp (kể cả vài bẫy về DI): chỉ dùng khi đã có lý do (xem chương 25).</li>
</ul>
<div class="box info"><b>Các tuỳ chọn hiện đại khác</b><p><code>withViewTransitions()</code> (chuyển cảnh), <code>withRouterConfig({ onSameUrlNavigation })</code>, <code>scrollPositionRestoration</code>, <code>title</code> ngay trong route (<code>{ path: 'races', title: 'Races', ... }</code>) thay cho gọi <code>Title.setTitle</code> (chương 11).</p></div>`
    }
  ],
  quiz: [
    { q: 'Vì sao không nên dùng <code>&lt;a href="/races"&gt;</code> trong app Angular?', options: ['Không hoạt động', 'Gây tải lại trang và khởi động lại ứng dụng; dùng routerLink', 'Chậm hơn một chút'], answer: 1, why: 'routerLink điều hướng bằng History API mà không tải lại.' },
    { q: 'Điều hướng từ /ponies/1 sang /ponies/2, component?', options: ['Luôn được tạo mới', 'Được tái sử dụng; ngOnInit không chạy lại → cần subscribe paramMap', 'Bị huỷ'], answer: 1, why: 'Router tái sử dụng component khi route không đổi.' },
    { q: 'Vì sao route <code>{ path: "", redirectTo: "/breaking" }</code> không có pathMatch: "full" nguy hiểm?', options: ['Không nguy hiểm', 'prefix khớp mọi URL (mọi URL bắt đầu bằng chuỗi rỗng) nên mọi thứ redirect', 'Lỗi biên dịch'], answer: 1, why: 'Mặc định pathMatch là prefix.' },
    { q: 'Route <code>races/:id</code> đứng trước <code>races/new</code>: URL races/new cho?', options: ['Component tạo mới', 'Component của races/:id với id = "new"', 'Lỗi 404'], answer: 1, why: 'Route đầu tiên khớp thắng — đặt route cụ thể trước.' },
    { q: 'canActivate trả về một UrlTree sẽ làm gì?', options: ['Cho phép vào', 'Huỷ điều hướng hiện tại và điều hướng tới URL đó', 'Báo lỗi'], answer: 1, why: 'Thường dùng để chuyển hướng tới /login.' },
    { q: 'Resolver tải dữ liệu thất bại thì?', options: ['URL đổi, trang trống', 'NavigationError, ở lại trang cũ (URL không đổi)', 'Component tự thử lại'], answer: 1, why: 'Resolver chạy trước khi kích hoạt route.' },
    { q: 'Lazy loading dùng thuộc tính nào trong cấu hình route?', options: ['loadChildren (hoặc loadComponent)', 'lazy: true', 'async'], answer: 0, why: 'Với dynamic import: loadChildren: () => import(...).then(...).' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const R = Rx, alive = () => root.isConnected;
    let logged = false, lazyLoaded = false;
    const lat = () => +$('#rt-lat').value;
    let router, hist = [], hi = -1, instances = new Map(), instSeq = 0;

    const raceResolver = rt => {
      const id = +rt.paramMap.get('raceId');
      return R.timer(lat()).pipe(R.map(() => { if (id === 13) throw new Error('HTTP 404: race ' + id + ' not found'); return { id, name: ['London', 'Lyon', 'Paris', 'Rome'][id % 4], ponies: 4 + (id % 5) }; }));
    };
    const loggedIn = () => logged || router.parseUrl('/login');
    function buildConfig() {
      const races = [
        { path: 'races', component: 'Races' },
        { path: 'races/new', component: 'RaceCreation' },
        { path: 'races/:raceId', component: 'Race', resolve: { race: raceResolver }, data: { allowDeletion: false } }
      ];
      if ($('#rt-order').checked) [races[1], races[2]] = [races[2], races[1]];
      return [
        { path: '', pathMatch: 'full', component: 'Home' },
        { path: 'home', pathMatch: 'full', redirectTo: '/' },
        { path: 'login', component: 'Login' },
        { path: '', canActivate: [loggedIn], children: [
          ...races,
          { path: 'ponies/:ponyId', component: 'Pony', children: [
            { path: '', pathMatch: 'full', redirectTo: 'birth-certificate' },
            { path: 'birth-certificate', component: 'BirthCertificate' },
            { path: 'track-record', component: 'TrackRecord' },
            { path: 'reviews', component: 'Reviews' }] }] },
        { path: 'admin', loadChildren: () => new Promise(res => setTimeout(() => { res([{ path: '', component: 'Admin' }]); }, 900)) },
        { path: '**', component: 'NotFound' }
      ];
    }
    function cfgText() {
      const order = $('#rt-order').checked;
      return `[\n  { path: '', pathMatch: 'full', component: HomeComponent },\n  { path: 'home', pathMatch: 'full', redirectTo: '/' },\n  { path: 'login', component: LoginComponent },\n  { path: '', canActivate: [LoggedInGuard], children: [          // route cha rỗng, không component\n    { path: 'races', component: RacesComponent },\n` +
        (order ? `    { path: 'races/:raceId', component: RaceComponent, resolve: { race: RaceResolver } },   // ⚠ đứng TRƯỚC\n    { path: 'races/new', component: RaceCreationComponent },\n` : `    { path: 'races/new', component: RaceCreationComponent },\n    { path: 'races/:raceId', component: RaceComponent, resolve: { race: RaceResolver }, data: { allowDeletion: false } },\n`) +
        `    { path: 'ponies/:ponyId', component: PonyComponent, children: [\n      { path: '', pathMatch: 'full', redirectTo: 'birth-certificate' },\n      { path: 'birth-certificate', component: BirthCertificateComponent },\n      { path: 'track-record', component: TrackRecordComponent },\n      { path: 'reviews', component: ReviewsComponent } ] }\n  ] },\n  { path: 'admin', loadChildren: () => import('./admin/admin.routes') },\n  { path: '**', component: NotFoundComponent }\n]`;
    }

    /* ---- nhật ký ---- */
    const log = $('#rt-log');
    const COL = { NavigationStart: 'dim', NavigationEnd: 'ok', NavigationCancel: 'err', NavigationError: 'err' };
    function logEv(e) {
      if (!alive()) return;
      const d = document.createElement('div'); d.className = COL[e.type] || 'dim';
      const extra = e.url ? ' ' + e.url : e.to ? ` ${e.from} → ${e.to}` : e.reason ? ' — ' + e.reason : e.error ? ' — ' + e.error : e.route !== undefined ? ` '${e.route}' (bundle admin.chunk.js)` : '';
      d.textContent = (e.type === 'NavigationEnd' ? '✓ ' : e.type === 'NavigationCancel' ? '⊘ ' : e.type === 'NavigationError' ? '✖ ' : e.type === 'Redirect' ? '↪ ' : '• ') + e.type + (e.id ? ` #${e.id}` : '') + extra;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    }

    /* ---- hiển thị outlet lồng nhau ---- */
    const NAMES = { Home: '🏠 HomeComponent', Login: '🔑 LoginComponent', Races: '🏁 RacesComponent', RaceCreation: '➕ RaceCreationComponent', Race: '🏆 RaceComponent', Pony: '🐴 PonyComponent', BirthCertificate: '📜 BirthCertificateComponent', TrackRecord: '📈 TrackRecordComponent', Reviews: '⭐ ReviewsComponent', Admin: '🛠 AdminComponent', NotFound: '❓ NotFoundComponent' };
    function renderPage() {
      const st = router.state; if (!st) { $('#rt-page').innerHTML = '<i class="hint">(chưa điều hướng)</i>'; return; }
      const prev = router.prevState, chain = st.chain.filter(n => n.route.component);
      let html = '', depth = 0;
      const lines = chain.map((n, i) => {
        const p = prev && prev.chain.filter(x => x.route.component)[i];
        const reused = p && p.route === n.route;
        let inst = instances.get(n.route);
        if (!reused || !inst) { inst = { id: ++instSeq }; instances.set(n.route, inst); }
        return { n, reused, inst };
      });
      const open = (l, i) => {
        const n = l.n, pm = Object.entries(n.params).map(([k, v]) => `<span class="kv hit"><span class="k">${k}</span><span class="v">${esc(v)}</span></span>`).join('');
        const data = n.data && Object.keys(n.data).length ? `<div class="hint">data: <span class="mono">${esc(JSON.stringify(n.data))}</span></div>` : '';
        const q = i === 0 && Object.keys(st.query).length ? `<div class="hint">queryParams: <span class="mono">${esc(JSON.stringify(st.query))}</span></div>` : '';
        const tabs = n.route.component === 'Pony' ? '<div class="hint">[routerLink] birth-certificate · track-record · reviews</div>' : '';
        return `<div style="border:2px solid ${l.reused ? 'var(--ok)' : 'var(--accent)'};border-radius:10px;padding:8px 10px;margin:6px 0;background:var(--surface)">
          <b>${NAMES[n.route.component] || n.route.component}</b>
          <span class="pill ${l.reused ? 'fulfilled' : 'pending'}" style="font-size:11px">${l.reused ? '♻ tái sử dụng #' + l.inst.id + ' (ngOnInit không chạy lại)' : '✨ tạo mới #' + l.inst.id}</span>
          <div>${pm}</div>${data}${q}${tabs}`;
      };
      html = lines.map((l, i) => open(l, i)).join('') + '</div>'.repeat(lines.length);
      $('#rt-page').innerHTML = `<div class="hint" style="margin-bottom:4px">&lt;app-root&gt; → header · <b>&lt;router-outlet&gt;</b> · footer</div>` + html;
    }

    /* ---- điều hướng + lịch sử ---- */
    let skipPush = false;
    const btns = () => { $('#rt-back').disabled = hi <= 0; $('#rt-fwd').disabled = hi >= hist.length - 1; };
    function onEvent(e) {
      logEv(e);
      if (e.type === 'NavigationEnd') {
        if (!skipPush) { hist = hist.slice(0, hi + 1); hist.push(router.url); hi = hist.length - 1; }
        skipPush = false; $('#rt-url').value = router.url; renderPage(); btns();
      } else if (e.type === 'NavigationError' || e.type === 'NavigationCancel') setTimeout(() => { if (alive()) $('#rt-url').value = router.url || ''; }, 0);
    }
    function go(url, push = true) { skipPush = !push; return router.navigateByUrl(url); }
    function setup() {
      lazyLoaded = false; hist = []; hi = -1; instSeq = 0; instances = new Map(); log.innerHTML = '';
      router = new MiniRouter.Router(buildConfig());
      router.events.subscribe(onEvent);
      $('#rt-cfg').textContent = cfgText();
      $('#rt-page').innerHTML = '<i class="hint">(chưa điều hướng)</i>';
      go('/');
    }
    const LINKS = [['Home', '/'], ['Races', '/races'], ['Race 1', '/races/1'], ['Race 2', '/races/2'], ['Race 13 ✖', '/races/13'], ['New race', '/races/new'], ['Pony 7', '/ponies/7'], ['Pony 7 reviews', '/ponies/7/reviews'], ['Admin', '/admin'], ['/races/42;foo=bar;baz=wiz', '/races/42;foo=bar;baz=wiz'], ['/races/1?sort=asc', '/races/1?sort=asc'], ['/home', '/home'], ['/zzz', '/zzz']];
    $('#rt-links').innerHTML = LINKS.map(([t, u], i) => `<button class="btn alt" data-u="${u}" style="padding:3px 9px;margin:2px">${esc(t)}</button>`).join('');
    root.querySelectorAll('#rt-links button').forEach(b => (b.onclick = () => go(b.dataset.u)));
    $('#rt-go').onclick = () => go($('#rt-url').value.trim() || '/');
    $('#rt-url').onkeydown = e => { if (e.key === 'Enter') $('#rt-go').click(); };
    $('#rt-back').onclick = () => { if (hi > 0) { hi--; go(hist[hi], false); } };
    $('#rt-fwd').onclick = () => { if (hi < hist.length - 1) { hi++; go(hist[hi], false); } };
    $('#rt-logged').onchange = () => { logged = $('#rt-logged').checked; };
    $('#rt-order').onchange = setup; $('#rt-reset').onclick = setup;
    setup();
  }
});
