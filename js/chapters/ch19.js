registerChapter(19, {
  time: '80 phút',
  lead: 'Form trong Angular được chăm chút đặc biệt: validation, hiển thị lỗi, trạng thái từng ô, phản ứng khi giá trị đổi, và test được. Trang này dùng một bản <b>Reactive Forms thu nhỏ</b> (<code>FormControl</code>, <code>FormGroup</code>, <code>Validators</code>, <code>valueChanges</code>…) chạy trên <code>&lt;input&gt;</code> thật để bạn tự bấm, gõ và xem trạng thái thay đổi.',
  sections: [
    {
      id: 'two', title: 'Hai cách viết form, và khái niệm FormControl / FormGroup',
      html: `
<p>Angular cho <b>hai cách</b> xây form:</p>
<div class="tablewrap"><table>
<tr><th></th><th>Template-driven</th><th>Code-driven (Reactive)</th></tr>
<tr><td>Mô tả form ở đâu</td><td>Trong template, bằng directive (<code>ngModel</code>, <code>required</code>…)</td><td>Trong component (<code>FormGroup</code>/<code>FormControl</code>), template chỉ gắn vào</td></tr>
<tr><td>Module</td><td><code>FormsModule</code></td><td><code>ReactiveFormsModule</code></td></tr>
<tr><td>Mạnh ở</td><td>Form đơn giản, ít validation; có two-way binding</td><td>Validation tuỳ biến, nhóm lồng nhau, form động, <b>dễ test</b></td></tr>
<tr><td>Nhược</td><td>Validator tuỳ biến phải viết thành directive; khó test</td><td>Dài dòng hơn</td></tr>
</table></div>
<p>Cả hai đều tạo cùng một “biểu diễn” bên dưới:</p>
<ul>
<li><b><code>FormControl</code></b> — một ô (input/select/textarea): giữ <b>giá trị</b> và <b>trạng thái</b>.</li>
<li><b><code>FormGroup</code></b> — nhóm control (cả form cũng là một group): hợp nhất trạng thái các con.</li>
</ul>
<div class="tablewrap"><table>
<tr><th>Thuộc tính</th><th>Ý nghĩa</th></tr>
<tr><td><code>value</code>, <code>valueChanges</code></td><td>Giá trị hiện tại; Observable phát mỗi khi đổi</td></tr>
<tr><td><code>valid</code> / <code>invalid</code>, <code>errors</code></td><td>Có hợp lệ không; object lỗi (<code>null</code> nếu ổn)</td></tr>
<tr><td><code>pristine</code> / <code>dirty</code></td><td>Người dùng đã sửa giá trị chưa</td></tr>
<tr><td><code>untouched</code> / <code>touched</code></td><td>Người dùng đã vào rồi rời ô (blur) chưa</td></tr>
<tr><td><code>pending</code></td><td>Đang chờ validator bất đồng bộ</td></tr>
<tr><td><code>hasError('required')</code>, <code>get('username')</code></td><td>Kiểm tra một lỗi cụ thể; lấy control con</td></tr>
</table></div>
<textarea class="live" data-title="FormControl và FormGroup thuần JS (không cần giao diện)">
const { FormControl, FormGroup, Validators } = MiniForms;      // dự án thật: import từ '@angular/forms'

const password = new FormControl();
console.log('dirty:', password.dirty, '| value:', password.value, '| hasError(required):', password.hasError('required'));

const name = new FormControl('Cédric');
console.log('value:', name.value);

const form = new FormGroup({
  username: new FormControl('Cédric'),
  password: new FormControl('', Validators.required)
});
console.log('form.value:', form.value, '| valid:', form.valid);
form.get('password').setValue('s3cret');
console.log('sau setValue → valid:', form.valid, '| value:', form.value);
</textarea>

<h3>Phòng thí nghiệm một FormControl</h3>
<p>Gõ vào ô, bấm ra ngoài, bấm các nút — xem <b>các class <code>ng-*</code></b> tự gắn vào phần tử, lỗi, và log <code>valueChanges</code>.</p>
<style>
#w-ctrl input.lab, #w-reg input { padding: 8px 12px; border: 3px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font: inherit; width: 100%; }
#w-ctrl input.ng-invalid.ng-dirty, #w-reg input.ng-invalid.ng-dirty { border-color: var(--err); }
#w-ctrl input.ng-valid.ng-dirty, #w-reg input.ng-valid.ng-dirty { border-color: var(--ok); }
#w-ctrl input.ng-pending, #w-reg input.ng-pending { border-color: var(--warn); }
</style>
<div class="widget" id="w-ctrl">
  <h4>🔬 Một FormControl</h4>
  <div class="row" style="margin-bottom:8px"><b>Validators:</b>
    <label><input type="checkbox" data-v="required" checked> required</label>
    <label><input type="checkbox" data-v="min3"> minLength(3)</label>
    <label><input type="checkbox" data-v="email"> email</label>
    <label><input type="checkbox" data-v="pattern"> pattern(chữ thường)</label>
    <label><input type="checkbox" data-v="nospace"> noSpaces (tự viết)</label>
    <label><input type="checkbox" data-v="async"> bất đồng bộ: “admin” đã dùng</label>
  </div>
  <div class="row" style="margin-bottom:8px"><label>updateOn: <select id="ct-upd"><option>change</option><option>blur</option></select></label>
    <button class="btn alt" id="ct-set">setValue('Cédric')</button><button class="btn alt" id="ct-touch">markAsTouched()</button><button class="btn alt" id="ct-reset">reset()</button></div>
  <div id="ct-host" style="margin-bottom:10px"></div>
  <div class="grid2">
    <div><div id="ct-classes" style="margin-bottom:8px"></div><div class="mono" style="font-size:13px" id="ct-info"></div></div>
    <div><b>valueChanges</b><div class="output" id="ct-log" style="border-radius:8px;height:120px;overflow:auto;margin-top:6px"></div></div>
  </div>
</div>`
    },
    {
      id: 'template', title: 'Template-driven: ngModel, ngForm và two-way binding',
      html: `
<p>Import <code>FormsModule</code>; thêm <code>ngModel</code> (và thuộc tính <code>name</code> bắt buộc) vào mỗi ô — Angular tự dựng <code>FormControl</code> và <code>FormGroup</code>. Biến cục bộ <code>#userForm="ngForm"</code> cho bạn truy cập form:</p>
<textarea class="code" data-lang="html" data-title="register-form.component.html">
<h2>Sign up</h2>
<form (ngSubmit)="register(userForm.value)" #userForm="ngForm">
  <div><label>Username</label><input name="username" ngModel required minlength="3" #username="ngModel">
       <div *ngIf="username.dirty && username.hasError('required')">Username is required</div></div>
  <div><label>Password</label><input type="password" name="password" ngModel required></div>
  <button type="submit" [disabled]="userForm.invalid">Register</button>
</form>
</textarea>
<h3>Two-way binding <code>[(ngModel)]</code> — “hộp chuối”</h3>
<p><code>[(ngModel)]="user.username"</code> là đường tắt của <b>hai</b> binding: model → ô (<code>[ngModel]</code>) và ô → model (<code>(ngModelChange)</code>). Nhớ: <code>[( )]</code> là “banana in a box”. Thử:</p>
<div class="widget" id="w-banana">
  <h4>🍌 [(ngModel)]</h4>
  <div class="grid2">
    <div><label>Username <input type="text" id="bn-in" style="width:100%"></label>
      <div class="row" style="margin-top:8px"><button class="btn alt" id="bn-code">Code đổi model: user.username = 'Rainbow'</button></div></div>
    <div><b>user (model trong component)</b><pre class="hl" id="bn-model" style="border-radius:8px;margin-top:6px"></pre><div id="bn-msg" style="margin-top:6px"></div></div>
  </div>
</div>
<textarea class="code" data-lang="html">
<input name="username" [(ngModel)]="user.username">
<!-- tương đương: -->
<input name="username" [ngModel]="user.username" (ngModelChange)="user.username = $event">
<small>{{ user.username }} is an awesome username!</small>
</textarea>`
    },
    {
      id: 'code', title: 'Code-driven: FormBuilder, formGroup, formControlName',
      html: `
<p>Import <code>ReactiveFormsModule</code>. Dựng form trong component bằng <code>FormBuilder</code> (viết tắt của <code>new FormControl/FormGroup</code>), rồi gắn vào template bằng <code>[formGroup]</code> và <code>formControlName</code>:</p>
<textarea class="code" data-lang="ts" data-title="register-form.component.ts">
export class RegisterFormComponent {
  userForm: FormGroup;
  usernameCtrl: FormControl;
  passwordCtrl: FormControl;

  constructor(fb: FormBuilder) {
    this.usernameCtrl = fb.control('', [Validators.required, Validators.minLength(3)]);
    this.passwordCtrl = fb.control('', Validators.required);
    this.userForm = fb.group({ username: this.usernameCtrl, password: this.passwordCtrl });
  }
  reset(): void { this.usernameCtrl.setValue(''); this.passwordCtrl.setValue(''); }
  register(): void { console.log(this.userForm.value); }
}
</textarea>
<textarea class="code" data-lang="html" data-title="register-form.component.html">
<form (ngSubmit)="register()" [formGroup]="userForm">
  <div><label>Username</label><input formControlName="username">
    <div *ngIf="usernameCtrl.dirty && usernameCtrl.hasError('required')">Username is required</div>
    <div *ngIf="usernameCtrl.dirty && usernameCtrl.hasError('minlength')">Username should be 3 characters min</div></div>
  <div><label>Password</label><input type="password" formControlName="password"></div>
  <button type="submit" [disabled]="userForm.invalid">Register</button>
</form>
</textarea>
<div class="box warn"><b>Tên sai = lỗi</b><p><code>formControlName="usernmae"</code> (gõ nhầm) báo lỗi vì không có control tên đó. Truyền chuỗi thì không có dấu <code>[ ]</code>; truyền biểu thức (<code>[formGroup]="userForm"</code>) thì có.</p></div>
<div class="box modern"><b>🆕 Hiện nay: form có kiểu (typed forms)</b><textarea class="code" data-lang="ts">
private fb = inject(NonNullableFormBuilder);
form = this.fb.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  password: ['', Validators.required]
});
// form.value.username: string | undefined ; form.controls.username.value: string — TypeScript biết kiểu
@Component({ imports: [ReactiveFormsModule] , ... })
</textarea></div>`
    },
    {
      id: 'reg', title: 'Form đăng ký đầy đủ: validation, validator tự viết, nhóm, async, valueChanges',
      html: `
<p>Gộp mọi thứ vào form đăng ký PonyRacer. Bạn có thể thử từng loại validation:</p>
<ul>
<li><b>Validator dựng sẵn</b>: <code>required</code>, <code>minLength</code>, <code>maxLength</code>, <code>email</code>, <code>min</code>, <code>max</code>, <code>pattern</code>.</li>
<li><b>Validator tự viết</b> <code>isOldEnough</code> (trên ngày sinh): hàm nhận control, trả <code>null</code> nếu ổn hoặc object lỗi <code>{ tooYoung: true }</code>.</li>
<li><b>Validator bất đồng bộ</b> (kiểm tra username có sẵn trên server): trả Observable; class <code>ng-pending</code> hiện trong lúc chờ.</li>
<li><b>Nhóm lồng nhau</b> <code>passwordForm</code> có validator <b>cấp nhóm</b> <code>passwordMatch</code> (so khớp mật khẩu và xác nhận).</li>
<li><b>valueChanges</b> + <code>debounceTime</code> + <code>distinctUntilChanged</code> để tính độ mạnh mật khẩu.</li>
<li><b>updateOn</b>: cập nhật giá trị/validity khi <code>change</code> (mặc định), <code>blur</code> hoặc <code>submit</code>.</li>
</ul>

<div class="widget" id="w-reg">
  <h4>📝 Sign up</h4>
  <div class="row" style="margin-bottom:10px">
    <label>Hiện lỗi khi: <select id="rg-show"><option value="dirty">dirty (sách)</option><option value="touched">touched</option><option value="submitted">touched hoặc đã submit</option></select></label>
    <label>updateOn (cả form): <select id="rg-upd"><option>change</option><option>blur</option><option>submit</option></select></label>
    <span class="hint">Username bị chiếm: <code>admin</code>, <code>pony</code>, <code>ninja</code></span>
  </div>
  <div class="grid2">
    <form id="rg-form" novalidate>
      <div style="margin-bottom:10px"><label>Username</label><input id="rg-user" autocomplete="off"><div class="rg-err" data-c="username"></div></div>
      <div style="margin-bottom:10px"><label>Birth date</label><input id="rg-birth" type="date"><div class="rg-err" data-c="birthdate"></div></div>
      <div style="border:1px dashed var(--border);border-radius:10px;padding:10px;margin-bottom:10px">
        <div class="hint">formGroupName="passwordForm"</div>
        <div style="margin-bottom:8px"><label>Password</label><input id="rg-pw" type="password" autocomplete="new-password"><div class="rg-err" data-c="passwordForm.password"></div>
          <div class="hint">Strength (debounce 400ms): <b id="rg-strength">0</b> <span id="rg-strbar" style="display:inline-block;height:8px;width:0;background:var(--ok);border-radius:4px;vertical-align:middle"></span></div></div>
        <div><label>Confirm password</label><input id="rg-cf" type="password" autocomplete="new-password"><div class="rg-err" data-c="passwordForm.confirm"></div></div>
        <div class="rg-err" data-c="passwordForm" data-group="1"></div>
      </div>
      <button class="btn" id="rg-submit" type="submit">Register</button> <button class="btn alt" id="rg-reset" type="button">reset()</button>
      <div id="rg-out" class="hint" style="margin-top:8px"></div>
    </form>
    <div><b>Trạng thái form (cập nhật trực tiếp)</b><div id="rg-state" class="mono" style="font-size:12.5px;margin-top:6px"></div></div>
  </div>
</div>
<textarea class="code" data-lang="ts" data-title="Mã tương ứng (Angular)">
static isOldEnough(control: FormControl): { tooYoung: true } | null {
  const birthDatePlus18 = new Date(control.value);
  birthDatePlus18.setFullYear(birthDatePlus18.getFullYear() + 18);
  return birthDatePlus18 < new Date() ? null : { tooYoung: true };
}
static passwordMatch(group: AbstractControl): { matchingError: true } | null {
  return group.get('password')!.value === group.get('confirm')!.value ? null : { matchingError: true };
}

constructor(fb: FormBuilder, private userService: UserService) {
  this.usernameCtrl = fb.control('', [Validators.required, Validators.minLength(3)],
    control => this.userService.isUsernameAvailable(control.value).pipe(map(ok => (ok ? null : { alreadyUsed: true }))));   // bất đồng bộ
  this.birthdateCtrl = fb.control('', [Validators.required, RegisterFormComponent.isOldEnough]);
  this.passwordForm = fb.group({ password: this.passwordCtrl, confirm: this.confirmCtrl }, { validators: RegisterFormComponent.passwordMatch });
  this.userForm = fb.group({ username: this.usernameCtrl, birthdate: this.birthdateCtrl, passwordForm: this.passwordForm }, { updateOn: 'blur' });

  this.passwordCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
    .subscribe(v => (this.passwordStrength = v.length));
}
</textarea>
<textarea class="code" data-lang="html" data-title="Template: formGroupName cho nhóm lồng nhau">
<div formGroupName="passwordForm">
  <input type="password" formControlName="password">
  <input type="password" formControlName="confirm">
  <div *ngIf="passwordForm.dirty && passwordForm.hasError('matchingError')">Your password does not match</div>
</div>
</textarea>
<div class="box tip"><b>Thử theo thứ tự</b><ol>
<li>Gõ vào Username: <b>required → minlength → alreadyUsed</b> (khi gõ “admin”, thấy viền vàng <code>ng-pending</code> rồi lỗi sau ~0,6s).</li>
<li>Ngày sinh gần đây → <code>tooYoung</code>. Chọn ngày hợp lệ (trước 18 năm).</li>
<li>Password khác Confirm → lỗi <b>của nhóm</b> (<code>matchingError</code>); nút Register bị khoá khi form <code>invalid</code>/<code>pending</code>.</li>
<li>Đặt <b>updateOn = blur</b>: giá trị/validity chỉ cập nhật khi rời ô. <b>submit</b>: chỉ khi bấm Register.</li>
<li>Đổi “Hiện lỗi khi” sang <code>touched</code>/submitted để thấy hai quy ước hiển thị lỗi.</li></ol></div>`
    },
    {
      id: 'style', title: 'CSS tự động: ng-valid, ng-invalid, ng-dirty, ng-touched…',
      html: `
<p>Dù bạn viết form kiểu nào, Angular <b>tự thêm/bớt class</b> trên mỗi ô và cả form — bạn chỉ việc viết CSS. Trong các lab phía trên, viền đỏ/xanh/vàng chính là:</p>
<textarea class="code" data-lang="css">
input.ng-invalid.ng-dirty  { border: 3px solid red; }    /* sai và đã sửa */
input.ng-valid.ng-dirty    { border: 3px solid green; }
input.ng-pending           { border: 3px solid orange; } /* validator bất đồng bộ đang chạy */
</textarea>
<div class="tablewrap"><table>
<tr><th>Class</th><th>Khi nào</th></tr>
<tr><td><code>ng-valid</code> / <code>ng-invalid</code></td><td>Mọi validator đạt / có validator thất bại</td></tr>
<tr><td><code>ng-pristine</code> / <code>ng-dirty</code></td><td>Người dùng chưa / đã đổi giá trị</td></tr>
<tr><td><code>ng-untouched</code> / <code>ng-touched</code></td><td>Chưa / đã vào-rồi-rời ô (kể cả không đổi giá trị)</td></tr>
<tr><td><code>ng-pending</code></td><td>Đang chờ validator bất đồng bộ</td></tr>
</table></div>
<p>Vòng đời điển hình của một ô bắt buộc: <code>ng-pristine ng-untouched ng-invalid</code> → (rời ô) <code>ng-pristine ng-touched ng-invalid</code> → (gõ sai) <code>ng-dirty ng-touched ng-invalid</code> → (gõ đúng) <code>ng-dirty ng-touched ng-valid</code>. Thử lại bằng lab FormControl ở trên!</p>`
    },
    {
      id: 'updateon', title: 'updateOn, ngx-valdemort và tổng kết',
      html: `
<h3>updateOn: change, blur, submit</h3>
<textarea class="code" data-lang="ts">
this.passwordCtrl = new FormControl('', { validators: Validators.required, updateOn: 'blur' });     // một ô
this.userForm = new FormGroup({ username: this.usernameCtrl, password: this.passwordCtrl }, { updateOn: 'blur' });   // cả nhóm
// template-driven:
//   <input name="username" [(ngModel)]="user.username" [ngModelOptions]="{ updateOn: 'blur' }">
//   <form [ngFormOptions]="{ updateOn: 'blur' }">
</textarea>
<h3>Bớt lặp khi hiển thị lỗi: ngx-valdemort</h3>
<p>Mỗi ô lặp lại một đống <code>*ngIf</code> cho từng loại lỗi. Thư viện nhỏ <b>ngx-valdemort</b> (của tác giả sách) gọn hơn nhiều, và cho khai báo thông điệp mặc định một lần:</p>
<textarea class="code" data-lang="html">
<input id="email" formControlName="email" type="email" />
<val-errors controlName="email" label="The email"></val-errors>

<val-default-errors>
  <ng-template valError="required" let-label>{{ label || 'This field' }} is required</ng-template>
  <ng-template valError="email" let-label>{{ label || 'This field' }} must be a valid email address</ng-template>
</val-default-errors>
</textarea>
<h3>Tổng kết: chọn cách nào?</h3>
<div class="box info"><p>Cách thực dụng: bắt đầu với <b>template-driven + two-way binding</b> cho form nhỏ. Ngay khi cần truy cập <code>FormGroup</code>/<code>FormControl</code> — validator tuỳ biến, phản ứng khi đổi giá trị, nhóm, form động — hãy khai báo những gì cần trong component và gắn vào template bằng <code>formControlName</code>. Với form phức tạp, <b>code-driven</b> là lựa chọn chính.</p></div>
<div class="box modern"><b>🆕 Hiện nay</b><p><b>Typed forms</b> (v14), <code>NonNullableFormBuilder</code>, hàm <code>takeUntilDestroyed()</code> khi subscribe <code>valueChanges</code>, template dùng <code>@if</code> thay <code>*ngIf</code>. Đội Angular cũng đang phát triển <b>Signal Forms</b> (cách viết form dựa trên signals); khái niệm validation/trạng thái ở trên vẫn là nền tảng.</p></div>`
    }
  ],
  quiz: [
    { q: 'Điểm khác biệt chính giữa template-driven và code-driven?', options: ['Cách mô tả form: trong template bằng directive vs trong component bằng FormGroup/FormControl', 'Cái nào chạy nhanh hơn', 'Chỉ khác tên'], answer: 0, why: 'Cả hai cùng tạo FormControl/FormGroup bên dưới.' },
    { q: '<code>dirty</code> và <code>touched</code> khác nhau thế nào?', options: ['dirty = giá trị đã bị sửa; touched = đã vào rồi rời ô', 'Giống nhau', 'dirty = hợp lệ'], answer: 0, why: 'Có thể touched mà vẫn pristine (vào rồi rời, không sửa).' },
    { q: 'Validator tự viết trả về gì khi hợp lệ?', options: ['true', 'null', 'undefined'], answer: 1, why: 'null = hợp lệ; ngược lại trả object lỗi, ví dụ { tooYoung: true }.' },
    { q: 'Vì sao so khớp mật khẩu/xác nhận đặt validator ở FormGroup?', options: ['Vì cần xem nhiều control cùng lúc', 'Vì control không có validator', 'Vì nhanh hơn'], answer: 0, why: 'Validator của control chỉ thấy một giá trị; validator nhóm thấy cả hai.' },
    { q: 'class <code>ng-pending</code> xuất hiện khi nào?', options: ['Form bị lỗi', 'Validator bất đồng bộ đang chạy', 'Người dùng chưa gõ'], answer: 1, why: 'Dùng để hiện spinner khi đang kiểm tra với server.' },
    { q: '<code>updateOn: "blur"</code> làm gì?', options: ['Giá trị và validity chỉ cập nhật khi ô mất focus', 'Làm mờ ô nhập', 'Tắt validation'], answer: 0, why: 'Mặc định là change (mỗi lần gõ).' },
    { q: '<code>[(ngModel)]="user.name"</code> tương đương?', options: ['[ngModel]="user.name" (ngModelChange)="user.name = $event"', '(ngModel)="user.name"', 'ngModel="user.name"'], answer: 0, why: 'Hộp chuối: model → view và view → model.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const F = MiniForms, V = F.Validators, R = Rx, alive = () => root.isConnected;
    const CLS = ['ng-pristine', 'ng-dirty', 'ng-untouched', 'ng-touched', 'ng-valid', 'ng-invalid', 'ng-pending'];

    /* ===== lab 1 control ===== */
    const ctLog = $('#ct-log'); let ctrl, input;
    const lg = t => { const d = document.createElement('div'); d.textContent = t; ctLog.appendChild(d); ctLog.scrollTop = ctLog.scrollHeight; };
    const noSpaces = c => (c.value && /\s/.test(c.value) ? { noSpaces: true } : null);
    function ctBuild(keep) {
      const val = keep && ctrl ? ctrl.value : '';
      const on = k => root.querySelector(`#w-ctrl [data-v=${k}]`).checked, list = [];
      if (on('required')) list.push(V.required); if (on('min3')) list.push(V.minLength(3)); if (on('email')) list.push(V.email);
      if (on('pattern')) list.push(V.pattern('[a-z]+')); if (on('nospace')) list.push(noSpaces);
      const asyncV = on('async') ? c => R.timer(600).pipe(R.map(() => (String(c.value).toLowerCase() === 'admin' ? { alreadyUsed: true } : null))) : null;
      ctrl = new F.FormControl(val, { validators: list, asyncValidators: asyncV, updateOn: $('#ct-upd').value });
      $('#ct-host').innerHTML = '<input class="lab" autocomplete="off" placeholder="gõ gì đó…">'; input = $('#ct-host input');
      F.bind(input, ctrl);
      ctrl.valueChanges.subscribe(v => alive() && lg('valueChanges → ' + JSON.stringify(v)));
      ctrl.onStateChange(ctDraw); ctDraw();
    }
    function ctDraw() {
      $('#ct-classes').innerHTML = CLS.map(c => `<span class="pill ${input.classList.contains(c) ? (c.includes('invalid') ? 'rejected' : c.includes('pending') ? 'pending' : 'fulfilled') : ''}" style="margin:2px;font-size:11px;${input.classList.contains(c) ? '' : 'background:var(--surface2);color:var(--muted)'}">${c}</span>`).join('');
      $('#ct-info').innerHTML = `value: ${esc(JSON.stringify(ctrl.value))}<br>status: <b>${ctrl.status}</b><br>errors: ${esc(JSON.stringify(ctrl.errors))}`;
    }
    root.querySelectorAll('#w-ctrl [data-v], #ct-upd').forEach(e => (e.onchange = () => { ctLog.innerHTML = ''; ctBuild(true); }));
    $('#ct-set').onclick = () => { ctrl.setValue('Cédric'); lg('setValue("Cédric") → code đổi giá trị'); };
    $('#ct-touch').onclick = () => ctrl.markAsTouched();
    $('#ct-reset').onclick = () => { ctrl.reset(''); lg('reset()'); };
    ctBuild(false);

    /* ===== banana ===== */
    const model = { username: '' }, bin = $('#bn-in');
    const bdraw = () => { $('#bn-model').textContent = JSON.stringify(model, null, 2); $('#bn-msg').textContent = model.username ? `${model.username} is an awesome username!` : ''; };
    bin.oninput = () => { model.username = bin.value; bdraw(); };                  // (ngModelChange)
    $('#bn-code').onclick = () => { model.username = 'Rainbow'; bin.value = model.username; bdraw(); };   // [ngModel]
    bdraw();

    /* ===== form đăng ký ===== */
    const TAKEN = ['admin', 'pony', 'ninja'];
    const MSG = { 'username:required': 'Username is required', 'username:minlength': 'Username should be 3 characters min', 'username:alreadyUsed': 'This username is already used',
      'birthdate:required': 'Birth date is required', 'birthdate:tooYoung': "You're way too young to be betting on pony races",
      'passwordForm.password:required': 'Password is required', 'passwordForm.confirm:required': 'Confirm your password', 'passwordForm:matchingError': 'Your password does not match' };
    let form, submitted = false, strength = 0, subs = [];
    const isOldEnough = c => { if (!c.value) return null; const d = new Date(c.value); d.setFullYear(d.getFullYear() + 18); return d < new Date() ? null : { tooYoung: true }; };
    const passwordMatch = g => (g.get('password').value === g.get('confirm').value ? null : { matchingError: true });
    function build() {
      subs.forEach(s => s.unsubscribe()); subs = []; submitted = false; strength = 0;
      const upd = $('#rg-upd').value;
      const user = new F.FormControl('', [V.required, V.minLength(3)], c => R.timer(600).pipe(R.map(() => (TAKEN.includes(String(c.value).toLowerCase()) ? { alreadyUsed: true } : null))));
      const birth = new F.FormControl('', [V.required, isOldEnough]);
      const pw = new F.FormControl('', V.required), cf = new F.FormControl('', V.required);
      const pf = new F.FormGroup({ password: pw, confirm: cf }, { validators: passwordMatch });
      form = new F.FormGroup({ username: user, birthdate: birth, passwordForm: pf }, { updateOn: upd });
      // thay các input bằng bản mới để bỏ listener cũ
      ['rg-user', 'rg-birth', 'rg-pw', 'rg-cf'].forEach(id => { const el = $('#' + id), c = el.cloneNode(false); el.replaceWith(c); });
      const formEl = $('#rg-form'); const clone = formEl.cloneNode(true); formEl.replaceWith(clone);   // bỏ listener submit cũ
      F.bind($('#rg-user'), user, { form: $('#rg-form') }); F.bind($('#rg-birth'), birth, { form: $('#rg-form') });
      F.bind($('#rg-pw'), pw, { form: $('#rg-form') }); F.bind($('#rg-cf'), cf, { form: $('#rg-form') });
      subs.push(pw.valueChanges.pipe(R.debounceTime(400), R.distinctUntilChanged()).subscribe(v => { if (!alive()) return; strength = String(v).length; draw(); }));
      form.onStateChange(draw);
      $('#rg-form').addEventListener('submit', e => {
        e.preventDefault(); submitted = true; form.markAllAsTouched(); draw();
        $('#rg-out').innerHTML = form.valid ? `✅ register() → <span class="mono">${esc(JSON.stringify(form.value))}</span>` : `<span style="color:var(--err)">❌ Form chưa hợp lệ (${form.status}) — nút Register đáng lẽ bị khoá.</span>`;
      });
      $('#rg-reset').onclick = () => { form.reset(); submitted = false; $('#rg-out').textContent = ''; draw(); };
      $('#rg-out').textContent = ''; draw();
    }
    function showErr(path) {
      const mode = $('#rg-show').value, c = path ? form.get(path) : form;
      return mode === 'dirty' ? c.dirty : mode === 'touched' ? c.touched : (c.touched || submitted);
    }
    function draw() {
      root.querySelectorAll('#rg-form .rg-err').forEach(box => {
        const path = box.dataset.c, c = form.get(path);
        const msgs = c.errors ? Object.keys(c.errors).map(k => MSG[path + ':' + k]).filter(Boolean) : [];
        box.innerHTML = showErr(path) ? msgs.map(m => `<div style="color:var(--err);font-size:13px">${m}</div>`).join('') : '';
      });
      const btn = $('#rg-submit'); btn.disabled = form.invalid || form.pending; btn.title = btn.disabled ? 'form.invalid || form.pending' : '';
      $('#rg-strength').textContent = strength; $('#rg-strbar').style.width = Math.min(strength * 12, 120) + 'px';
      const row = (name, c, ind) => `<div style="margin-left:${ind * 14}px;padding:3px 0;border-bottom:1px dotted var(--border)"><b>${name}</b> <span class="pill ${c.valid ? 'fulfilled' : c.pending ? 'pending' : 'rejected'}" style="font-size:10.5px">${c.status}</span>
        ${c.dirty ? '<span class="pill pending" style="font-size:10.5px">dirty</span>' : ''}${c.touched ? '<span class="pill" style="font-size:10.5px;background:var(--infobg);color:var(--info)">touched</span>' : ''}
        <div class="hint" style="font-size:12px">errors: ${esc(JSON.stringify(c.errors))}${c.controls ? '' : ' · value: ' + esc(JSON.stringify(c.value))}</div></div>`;
      const g = form.controls;
      $('#rg-state').innerHTML = row('userForm', form, 0) + row('username', g.username, 1) + row('birthdate', g.birthdate, 1) + row('passwordForm', g.passwordForm, 1) + row('password', g.passwordForm.controls.password, 2) + row('confirm', g.passwordForm.controls.confirm, 2) +
        `<div class="hint" style="margin-top:6px">form.value = ${esc(JSON.stringify(form.value))}</div>`;
    }
    root.querySelectorAll('#rg-show').forEach(e => (e.onchange = draw));
    $('#rg-upd').onchange = build;
    build();
  }
});
