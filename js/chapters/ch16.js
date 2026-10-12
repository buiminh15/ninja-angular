registerChapter(16, {
  time: '60 phút',
  lead: 'Test tự động là lưới an toàn duy nhất khi bạn sửa code. Ở đây bạn <b>chạy test thật ngay trên trang</b>: mọi khối “TEST ▶” dùng một bản Jasmine thu nhỏ (kèm TestBed giả) — hãy sửa code cho test xanh, hoặc cố tình làm nó đỏ để xem thông báo lỗi.',
  sections: [
    {
      id: 'kinds', title: 'Hai loại test: unit và end-to-end',
      html: `
<p><b>Unit test</b> kiểm tra một đơn vị nhỏ (component, service, pipe) <b>cô lập</b>, các phụ thuộc được thay bằng bản giả (mock/spy). <b>End-to-end (e2e)</b> chạy ứng dụng thật trong trình duyệt và giả lập người dùng bấm, gõ, rồi kiểm tra trang.</p>
<div class="tablewrap"><table>
<tr><th></th><th>Unit test</th><th>End-to-end</th></tr>
<tr><td>Tốc độ</td><td>Rất nhanh: hàng trăm test trong vài giây</td><td>Chậm: vài giây mỗi test</td></tr>
<tr><td>Phạm vi</td><td>Một đơn vị nhỏ</td><td>Cả hệ thống</td></tr>
<tr><td>Ca biên (edge case)</td><td>Dễ phủ</td><td>Khó</td></tr>
<tr><td>Độ tin cậy “mọi thứ ghép đúng”</td><td>Thấp</td><td>Cao</td></tr>
</table></div>
<div class="flow">
  <div class="node">🔺 E2E<small>ít, chậm, đường đi quan trọng</small></div>
  <div class="node hot">🔷 Test component / tích hợp<small>vừa phải</small></div>
  <div class="node">🟩 Unit test<small>nhiều, nhanh, ca biên</small></div>
</div>
<p>Không phải chọn một trong hai: dùng cả hai để vừa phủ rộng vừa có đảm bảo cả app chạy đúng.</p>`
    },
    {
      id: 'jasmine', title: 'Jasmine: describe, it, expect',
      html: `
<p>Jasmine cho ba khối chính: <code>describe()</code> (nhóm test), <code>it()</code> (một test), <code>expect()</code> (một khẳng định, nối với matcher như <code>toBe</code>, <code>toEqual</code>, <code>toBeGreaterThan</code>… và phủ định bằng <code>.not</code>). File test thường đặt tên <code>pony.spec.ts</code> cạnh file cần test.</p>
<textarea class="live" data-test data-title="Test đầu tiên (từ sách) — bấm Chạy">
class Pony {
  constructor(name, speed) { this.name = name; this.speed = speed; }
  isFasterThan(speed) { return this.speed > speed; }
}

describe('My first test suite', () => {
  it('should construct a Pony', () => {
    const pony = new Pony('Rainbow Dash', 10);
    expect(pony.name).toBe('Rainbow Dash');
    expect(pony.speed).not.toBe(1);
    expect(pony.isFasterThan(8)).toBe(true);
  });
});
</textarea>
<p><code>beforeEach()</code> chuẩn bị bối cảnh (“fixture”) trước mỗi test, khỏi copy/paste. Thử thêm một test thất bại để xem thông báo (bỏ comment dòng cuối):</p>
<textarea class="live" data-test data-title="beforeEach + một test có thể đỏ">
class Pony {
  constructor(name, speed) { this.name = name; this.speed = speed; }
}
describe('Pony', () => {
  let pony;
  beforeEach(() => { pony = new Pony('Rainbow Dash', 10); });      // chạy trước MỖI it()

  it('should have a name', () => { expect(pony.name).toBe('Rainbow Dash'); });
  it('should have a speed', () => {
    expect(pony.speed).not.toBe(1);
    expect(pony.speed).toBeGreaterThan(9);
  });
  // it('đỏ để xem lỗi', () => { expect(pony.speed).toBe(99); });
});
</textarea>
<div class="box tip"><b>Tập trung hoặc bỏ qua</b><p><code>fdescribe</code>/<code>fit</code> chỉ chạy suite/test đó (f = focus); <code>xdescribe</code>/<code>xit</code> bỏ qua. Thử: đổi một <code>it</code> thành <code>fit</code>, các test khác thành “pending”.</p></div>

<h3>Bài tập: làm test chuyển xanh</h3>
<p>Test dưới đây đang <b>đỏ</b> vì hàm có lỗi. Sửa <code>isFasterThan</code> (và chỉ một chỗ), rồi chạy lại. Nguyên tắc vàng: <b>cho test thất bại trước</b> để chắc rằng bạn đang kiểm tra đúng thứ.</p>
<textarea class="live" data-test data-title="Kata: tìm lỗi">
class Pony {
  constructor(name, speed) { this.name = name; this.speed = speed; }
  isFasterThan(speed) { return this.speed >= speed; }          // 🐞 sửa chỗ này
}
describe('Pony.isFasterThan', () => {
  const pony = new Pony('Rainbow Dash', 10);
  it('is faster than a slower pony', () => { expect(pony.isFasterThan(8)).toBe(true); });
  it('is NOT faster than a pony with the same speed', () => { expect(pony.isFasterThan(10)).toBe(false); });
  it('is not faster than a faster pony', () => { expect(pony.isFasterThan(12)).toBe(false); });
});
</textarea>`
    },
    {
      id: 'spies', title: 'Spy: giả hàm và kiểm tra cuộc gọi',
      html: `
<p>Jasmine tạo đồ giả (spy) cho một method — hoặc <b>theo dõi method thật</b>. Spy cho bạn biết hàm có được gọi không (<code>toHaveBeenCalled</code>), với tham số nào (<code>toHaveBeenCalledWith</code>), bao nhiêu lần, và cho phép quy định giá trị trả về (<code>.and.returnValue()</code>, <code>.and.callFake()</code>, <code>.and.throwError()</code>, <code>.and.callThrough()</code>).</p>
<textarea class="live" data-test data-title="Race gọi run() trên từng pony (ví dụ trong sách)">
class Pony {
  constructor(name) { this.name = name; }
  run(speed) { return true; }
}
class Race {
  constructor(ponies) { this.ponies = ponies; }
  start() { return this.ponies.filter(pony => pony.run(10)); }     // chỉ giữ pony chịu chạy
}

describe('Race', () => {
  let rainbowDash, pinkiePie, race;
  beforeEach(() => {
    rainbowDash = new Pony('Rainbow Dash');
    spyOn(rainbowDash, 'run').and.returnValue(true);      // đồng ý chạy
    pinkiePie = new Pony('Pinkie Pie');
    spyOn(pinkiePie, 'run').and.returnValue(false);       // từ chối chạy
    race = new Race([rainbowDash, pinkiePie]);
  });

  it('should make the ponies run when it starts', () => {
    const runningPonies = race.start();
    expect(pinkiePie.run).toHaveBeenCalled();
    expect(rainbowDash.run).toHaveBeenCalledWith(10);
    expect(rainbowDash.run).toHaveBeenCalledTimes(1);
    expect(runningPonies).toEqual([rainbowDash]);         // toEqual so sánh sâu
  });
});
</textarea>
<div class="box info"><b>toBe vs toEqual</b><p><code>toBe</code> so sánh bằng <code>===</code> (cùng tham chiếu); <code>toEqual</code> so sánh <b>nội dung</b> (mảng/object). <code>expect({a:1}).toBe({a:1})</code> sẽ đỏ, <code>toEqual</code> thì xanh.</p></div>
<div class="box tip"><b>Test nhỏ và dễ đọc</b><p>Mỗi test nên ngắn, một ý. Đặt tên như câu mô tả hành vi (“should …”).</p></div>`
    },
    {
      id: 'karma', title: 'Chạy test: Karma (và các lựa chọn hiện nay)',
      html: `
<p>Jasmine chỉ <b>viết</b> test. Cần một <b>test runner</b> để chạy: sách dùng <b>Karma</b> — mở một hoặc nhiều trình duyệt thật, chạy test, theo dõi file để chạy lại mỗi lần lưu (phản hồi gần như tức thì).</p>
<textarea class="code" data-lang="bash">
ng test                  # Angular CLI + Karma: mở Chrome, chạy mọi *.spec.ts, watch
ng test --code-coverage  # kèm báo cáo độ phủ
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Karma đã được đánh dấu <b>ngừng phát triển</b>; cộng đồng chuyển dần sang <b>Jest</b> hoặc <b>Vitest</b> (Angular CLI đang tích hợp Vitest). API <code>describe/it/expect</code> gần như giống nhau, spy thì đổi tên (<code>jest.fn()</code>, <code>vi.fn()</code>, <code>vi.spyOn</code>) nên kiến thức ở chương này chuyển sang rất dễ. Công cụ trên trang này (Jasmine thu nhỏ) chạy trực tiếp trên trình duyệt, không cần Karma.</p></div>`
    },
    {
      id: 'di', title: 'Test service: TestBed và dependency injection',
      html: `
<p>Service có thể <code>new</code> tay, nhưng dùng <b>DI của Angular</b> tiện hơn — nhất là khi service có phụ thuộc. <code>TestBed</code> tạo một “module test”: <code>configureTestingModule({ providers })</code> khai báo cái gì tiêm được, <code>TestBed.inject(Token)</code> lấy ra (<code>TestBed.get</code> cũ đã deprecated vì không an toàn kiểu).</p>
<textarea class="live" data-test data-title="Thay LocalStorageService bằng đồ giả (useClass)">
class LocalStorageService { get(key) { return JSON.parse(localStorage.getItem(key)); } }   // thật: dùng localStorage

class RaceService {
  static providedIn = 'root';                         // = @Injectable({ providedIn: 'root' })
  static deps = [LocalStorageService];                // = kiểu tham số constructor
  constructor(localStorage) { this.localStorage = localStorage; }
  list() { return this.localStorage.get('races'); }
}

class FakeLocalStorage { get(key) { return [{ name: 'Lyon' }, { name: 'London' }]; } }

describe('RaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [{ provide: LocalStorageService, useClass: FakeLocalStorage }]
  }));

  it('should return 2 races from localStorage', () => {
    const service = TestBed.inject(RaceService);
    const races = service.list();
    expect(races.length).toBe(2);
  });
});
</textarea>
<p>Viết lớp giả bằng tay thì mệt. <code>jasmine.createSpyObj</code> tạo đối tượng giả có sẵn các method là spy, và cho phép kiểm tra <b>cách</b> service gọi nó:</p>
<textarea class="live" data-test data-title="createSpyObj + useValue: kiểm tra cả key được truyền">
class LocalStorageService { get(key) {} }
class RaceService {
  static providedIn = 'root'; static deps = [LocalStorageService];
  constructor(ls) { this.ls = ls; }
  list() { return this.ls.get('races'); }
}

describe('RaceService', () => {
  const localStorage = jasmine.createSpyObj('LocalStorageService', ['get']);
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: LocalStorageService, useValue: localStorage }] }));

  it('should return 2 races from localStorage', () => {
    localStorage.get.and.returnValue([{ name: 'Lyon' }, { name: 'London' }]);
    const races = TestBed.inject(RaceService).list();
    expect(races.length).toBe(2);
    expect(localStorage.get).toHaveBeenCalledWith('races');       // đúng key chưa?
  });
});
</textarea>
<h3>Bất đồng bộ: waitForAsync</h3>
<p>Nếu <code>list()</code> trả về Observable thì <code>expect</code> nằm trong <code>subscribe</code>. Bọc test bằng <code>waitForAsync()</code> — nó chạy test trong một <b>zone</b> (chương 20) và đợi mọi tác vụ bất đồng bộ xong, nên khẳng định không bị bỏ lỡ.</p>
<textarea class="live" data-test data-title="Test observable">
const { of, timer, map } = Rx;       // mini-rx; trong dự án thật: import { of } from 'rxjs'

class RaceService {
  static providedIn = 'root';
  list() { return timer(100).pipe(map(() => [{ name: 'London' }, { name: 'Lyon' }])); }   // giả lập HTTP trễ 100ms
}

describe('RaceService', () => {
  it('should return an observable of 2 races', waitForAsync(() => {
    TestBed.inject(RaceService).list().subscribe(races => {
      expect(races.length).toBe(2);              // chạy trong subscribe
    });
  }));
});
</textarea>
<div class="box warn"><b>Không dùng waitForAsync thì sao?</b><p>Test kết thúc ngay; <code>expect</code> trong <code>subscribe</code> chạy sau khi test đã “xanh” — lỗi bị bỏ sót âm thầm. Hãy thử xoá <code>waitForAsync(...)</code> và đổi <code>toBe(2)</code> thành <code>toBe(99)</code>: test vẫn xanh (sai!) nhưng thông báo lỗi có thể xuất hiện trễ.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><textarea class="code" data-lang="ts">
TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
const http = TestBed.inject(HttpTestingController);
service.list().subscribe(races => expect(races.length).toBe(2));
http.expectOne('/api/races').flush([{ name: 'London' }, { name: 'Lyon' }]);   // trả lời request giả
http.verify();

// hoặc test đồng bộ về thời gian:
it('...', fakeAsync(() => { service.run(); tick(1000); expect(...); }));
// hoặc async/await + firstValueFrom(obs$)
</textarea></div>`
    },
    {
      id: 'component', title: 'Test component: TestBed.createComponent',
      html: `
<p>Component <b>không tiêm</b> được vào test, nên ta tạo nó bằng <code>TestBed.createComponent()</code> → <code>ComponentFixture</code> (có <code>componentInstance</code>, <code>nativeElement</code>). Quy ước <b>Given / When / Then</b>:</p>
<ul>
<li><b>Given</b> — dựng bối cảnh: tạo component, gán input (như cha truyền xuống).</li>
<li><b>When</b> — hành động: <b>tự gọi</b> <code>fixture.detectChanges()</code> (trong test, change detection không tự chạy!) hoặc bắn sự kiện.</li>
<li><b>Then</b> — khẳng định: truy vấn DOM bằng <code>querySelector</code>.</li>
</ul>
<textarea class="live" data-test data-title="PonyComponent — chạy bằng TestBed giả (cú pháp template giống Angular)">
class PonyComponent {
  static selector = 'ns-pony';
  static template = '<img [src]="\\'./images/pony-\\' + pony.color.toLowerCase() + \\'.png\\'" [alt]="pony.name" (click)="clickOnPony()">';
  ponyClicked = new EventEmitter();                  // @Output()
  clickOnPony() { this.ponyClicked.emit(this.pony); }
}

describe('PonyComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ declarations: [PonyComponent] }));

  it('should have an image', () => {
    const fixture = TestBed.createComponent(PonyComponent);
    // Given
    fixture.componentInstance.pony = { name: 'Rainbow Dash', color: 'BLUE' };
    // When
    fixture.detectChanges();
    // Then
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toBe('./images/pony-blue.png');
    expect(img.getAttribute('alt')).toBe('Rainbow Dash');
  });

  it('should emit an event on click', () => {
    const fixture = TestBed.createComponent(PonyComponent);
    const ponyComponent = fixture.componentInstance;
    ponyComponent.pony = { name: 'Rainbow Dash', color: 'BLUE' };
    spyOn(ponyComponent.ponyClicked, 'emit');               // thay emit bằng spy
    fixture.detectChanges();                                 // render trước để có <img> và listener

    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('click'));

    expect(ponyComponent.ponyClicked.emit).toHaveBeenCalledWith({ name: 'Rainbow Dash', color: 'BLUE' });
  });
});
</textarea>
<div class="box info"><b>Khác Angular thật</b><p>TestBed ở đây là bản giả: component viết dưới dạng class có <code>static template</code> và <code>static selector</code>. Với Angular thật bạn dùng <code>@Component</code> và <code>declarations</code>/<code>imports</code>; với Ivy, <code>createComponent</code> đã có template, và trong sách <code>click</code> được bắn trước <code>detectChanges()</code> vì view đã tạo sẵn. Mô hình tư duy (Given/When/Then, <code>detectChanges</code>, spy trên <code>emit</code>) giống hệt.</p></div>

<h3>Component có component con: By.directive</h3>
<textarea class="live" data-test data-title="RaceComponent chứa PonyComponent (ngFor)">
class PonyComponent {
  static selector = 'ns-pony';
  static template = '<img [alt]="pony.name">';
}
class RaceComponent {
  static selector = 'ns-race';
  static template = '<div><h1>{{ race.name }}</h1><ns-pony *ngFor="let currentPony of race.ponies" [pony]="currentPony"></ns-pony></div>';
}

describe('RaceComponent', () => {
  let fixture;
  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [RaceComponent, PonyComponent] });
    fixture = TestBed.createComponent(RaceComponent);
  });

  it('should have a name and a list of ponies', () => {
    fixture.componentInstance.race = { name: 'London', ponies: [{ name: 'Rainbow Dash', color: 'BLUE' }] };
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('London');
    const ponies = fixture.debugElement.queryAll(By.directive(PonyComponent));   // chỉ phần tử do Angular quản lý
    expect(ponies.length).toBe(1);
    expect(ponies[0].componentInstance.pony.name).toBe('Rainbow Dash');         // kiểm tra input của con
  });
});
</textarea>
<div class="box tip"><b>query() khác querySelector()</b><p><code>debugElement.query/queryAll</code> (với <code>By.css</code> hoặc <code>By.directive</code>) trả về <b>DebugElement</b> có <code>componentInstance</code> — bạn đọc được input của component con. <code>querySelector</code> chỉ trả DOM thuần.</p></div>`
    },
    {
      id: 'override', title: 'Ghi đè template, provider… trong test',
      html: `
<p>Đôi khi bạn muốn thử component với một template đơn giản hơn, hoặc thay component con nặng bằng một cái “câm”. <code>TestBed.overrideComponent(Comp, { set: { template, providers, styles } })</code> làm được; trường hợp phổ biến nhất có lối tắt <code>TestBed.overrideTemplate(Comp, '…')</code> (gọi trước <code>createComponent</code>).</p>
<textarea class="live" data-test data-title="overrideTemplate: chỉ kiểm tra tên cuộc đua">
class PonyComponent { static selector = 'ns-pony'; static template = '<img [alt]="pony.name">'; }
class RaceComponent {
  static selector = 'ns-race';
  static template = '<div><h1>{{ race.name }}</h1><ns-pony *ngFor="let p of race.ponies" [pony]="p"></ns-pony></div>';
}

describe('RaceComponent (template ghi đè)', () => {
  let fixture;
  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [RaceComponent, PonyComponent] });
    TestBed.overrideTemplate(RaceComponent, '<h2>{{ race.name }}</h2>');       // bỏ danh sách pony
    fixture = TestBed.createComponent(RaceComponent);
  });

  it('should have a name', () => {
    fixture.componentInstance.race = { name: 'London' };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('London');
    expect(fixture.nativeElement.querySelector('ns-pony')).toBeNull();
  });
});
</textarea>`
    },
    {
      id: 'speculoos', title: 'Test ngắn gọn hơn: ngx-speculoos và Testing Library',
      html: `
<p>Test component thô rất dài dòng: <code>querySelector</code> trả <code>any</code>, tự <code>dispatchEvent</code>, tự <code>detectChanges</code>, lặp selector. Thư viện <b>ngx-speculoos</b> (do tác giả sách viết) bọc lại bằng class “tester” có kiểu:</p>
<textarea class="code" data-lang="ts" data-title="Trước (thuần) → Sau (ngx-speculoos)">
// Trước
const select = fixture.nativeElement.querySelector('#country');   // any
select.selectedIndex = 2;
select.dispatchEvent(new Event('change'));
fixture.detectChanges();

// Sau
class UserComponentTester extends ComponentTester<UserComponent> {
  constructor() { super(UserComponent); }
  get country() { return this.select('#country'); }                // TestSelect, không phải any
  get city() { return this.select('#city'); }
}
tester.country.selectLabel('France');                               // tự dispatchEvent + detectChanges
expect(tester.city.optionLabels).toEqual(['', 'Paris', 'Lyon']);
expect(tester.name).toHaveValue('Doe');                             // matcher riêng
expect(tester.newsletter).toBeChecked();
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Cùng tinh thần, bạn còn có <b>Angular Testing Library</b> (truy vấn theo vai trò/nhãn như người dùng thấy: <code>screen.getByRole('button')</code>) và <b>Component Harnesses</b> của Angular Material/CDK. Quy tắc chung: test theo <b>hành vi nhìn thấy</b>, đừng bám vào chi tiết cài đặt.</p></div>`
    },
    {
      id: 'e2e', title: 'End-to-end (e2e)',
      html: `
<p>E2E chạy ứng dụng <b>thật</b> trong trình duyệt và điều khiển như người dùng. Chậm hơn (vài giây/test) và khó phủ ca biên, nhưng cho bạn đảm bảo cả hệ thống ghép đúng. Sách dùng <b>Protractor</b>:</p>
<textarea class="code" data-lang="ts" data-title="Protractor (trong sách)">
describe('Home', () => {
  it('should display title, tagline and logo', async () => {
    await browser.get('/');
    expect(await element.all(by.css('img')).count()).toEqual(1);
    expect(await $('h1').getText()).toContain('PonyRacer');
  });
});
</textarea>
<div class="box warn"><b>Protractor đã bị loại bỏ</b><p>Protractor hết hỗ trợ (Angular 15 bỏ khỏi CLI). Thay thế phổ biến: <b>Playwright</b> hoặc <b>Cypress</b>. Cú pháp khác nhưng ý tưởng y hệt: mở trang → tìm phần tử → thao tác → khẳng định.</p></div>
<textarea class="code" data-lang="ts" data-title="Playwright">
import { test, expect } from '@playwright/test';

test('should display title, tagline and logo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('PonyRacer');
  await expect(page.locator('small')).toHaveText('Always a pleasure to bet on ponies');
});
</textarea>
<p>Nhờ e2e bạn còn có thể thử nhiều trình duyệt, chụp ảnh màn hình mỗi khi test hỏng, ghi video… Kết hợp unit test (nhanh, nhiều) và e2e (ít, đường đi chính) là công thức vững nhất.</p>`
    }
  ],
  quiz: [
    { q: 'Unit test khác e2e ở điểm cốt lõi nào?', options: ['Unit test cô lập một đơn vị với phụ thuộc giả; e2e chạy app thật qua trình duyệt', 'Unit test chậm hơn', 'e2e không cần trình duyệt'], answer: 0, why: 'Unit: nhanh, cô lập. E2E: chậm, toàn hệ thống.' },
    { q: 'Khác nhau giữa toBe và toEqual?', options: ['Không khác gì', 'toBe so sánh ===, toEqual so sánh nội dung sâu', 'toEqual chỉ dùng cho số'], answer: 1, why: 'Hai object giống nội dung nhưng khác tham chiếu: toBe đỏ, toEqual xanh.' },
    { q: 'Làm sao thay LocalStorageService bằng đồ giả trong test?', options: ['Sửa trực tiếp code service thật', 'TestBed.configureTestingModule({ providers: [{ provide: LocalStorageService, useValue/useClass: fake }] })', 'Không thể'], answer: 1, why: 'DI cho phép hoán đổi provider trong module test.' },
    { q: 'Vì sao phải gọi fixture.detectChanges() trong test component?', options: ['Trong test, change detection không tự chạy; ta phải kích hoạt để template cập nhật', 'Để biên dịch TypeScript', 'Để chạy lại beforeEach'], answer: 0, why: 'Test kiểm soát khi nào view được cập nhật.' },
    { q: 'Tác dụng của waitForAsync?', options: ['Làm test chạy chậm đi', 'Đợi các tác vụ bất đồng bộ trong test xong trước khi kết thúc', 'Bỏ qua test'], answer: 1, why: 'Chạy trong zone và theo dõi tác vụ chưa xong.' },
    { q: 'Công cụ nào hiện thay Protractor cho e2e?', options: ['Karma', 'Playwright / Cypress', 'Jasmine'], answer: 1, why: 'Protractor đã bị loại bỏ khỏi Angular CLI.' }
  ],
  mount() { /* chương này dùng các khối TEST ▶ làm tương tác chính */ }
});
