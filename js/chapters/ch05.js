registerChapter(5, {
  time: '30 phút',
  lead: 'Các kỹ thuật kiểu nâng cao: <code>readonly</code>, <code>keyof</code>, mapped type, union và type guard. Có thể bỏ qua nếu mới học TypeScript — nhưng bạn sẽ gặp chúng trong code Angular thực tế (đặc biệt <code>Partial</code>, <code>Pick</code> và union).',
  sections: [
    {
      id: 'readonly', title: 'readonly – chỉ đọc',
      html: `
<p><code>readonly</code> cấm gán lại thuộc tính. Trình biên dịch từ chối, nhưng <b>JS sinh ra vẫn gán được</b> (đây là kiểm tra lúc biên dịch).</p>
<textarea class="live" data-ts>
interface Config { readonly timeout: number; }

const config: Config = { timeout: 2000 };
// config.timeout = 3000;   // ← bỏ comment: error TS2540 Cannot assign to 'timeout' because it is a read-only property

class Race {
  constructor(public readonly id: number) {}
}
const race = new Race(1);
console.log(config.timeout, race.id);
</textarea>
<div class="box tip"><b>Dùng ở đâu?</b><p>Cấu hình, id, và dữ liệu bạn không muốn bị sửa nhầm. Với mảng: <code>ReadonlyArray&lt;T&gt;</code> hay <code>readonly T[]</code> không cho <code>push</code>.</p></div>`
    },
    {
      id: 'keyof', title: 'keyof – tên các thuộc tính thành một kiểu',
      html: `
<p><code>keyof PonyModel</code> chính là <code>'name' | 'color' | 'speed'</code>. Kết hợp generic, ta viết được hàm lấy thuộc tính <b>an toàn và giữ nguyên kiểu trả về</b>.</p>
<textarea class="live" data-ts data-title="Từ getProperty ngây thơ đến getProperty an toàn">
interface PonyModel { name: string; color: string; speed: number; }
const pony: PonyModel = { name: 'Rainbow Dash', color: 'blue', speed: 45 };

// Bản ngây thơ: key nào cũng nhận, trả về any
function getPropertyNaive(obj: any, key: string): any { return obj[key]; }

// Bản an toàn: K phải là một khoá của T, trả về đúng kiểu T[K]
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

type PonyKey = keyof PonyModel;               // 'name' | 'color' | 'speed'
let prop: PonyKey = 'name';
prop = 'speed';
// prop = 'other';     // ← lỗi biên dịch

const n = getProperty(pony, 'name');          // TypeScript biết: string
const s = getProperty(pony, 'speed');         // TypeScript biết: number
// getProperty(pony, 'wings');                // ← lỗi: không phải khoá của PonyModel
console.log(n.toUpperCase(), s + 1);
</textarea>
<div class="box info"><b>Hai con chim một phát đá</b><ul><li><code>key</code> chỉ nhận các khoá có thật.</li><li>Kiểu trả về được <b>suy ra</b> chính xác (<code>string</code> / <code>number</code>) thay vì <code>any</code>.</li></ul></div>`
    },
    {
      id: 'mapped', title: 'Mapped type – biến đổi cả một kiểu',
      html: `
<p>Muốn một kiểu giống <code>PonyModel</code> nhưng mọi thuộc tính đều tuỳ chọn? Thay vì viết lại tay, dùng <b>mapped type</b>: duyệt qua mọi khoá bằng <code>[P in keyof T]</code> và biến đổi.</p>
<textarea class="code" data-lang="ts" data-title="Partial tự định nghĩa (TypeScript đã có sẵn)">
type Partial<T> = {
  [P in keyof T]?: T[P];      // với mỗi khoá P của T: thêm ?, giữ kiểu cũ
};
</textarea>

<div class="widget" id="w-mapped">
  <h4>🧬 Sân chơi mapped type</h4>
  <p class="hint">Tích chọn các thuộc tính của <span class="mono">PonyModel</span> rồi chọn phép biến đổi để xem kiểu kết quả.</p>
  <div class="mono" style="background:var(--surface2);padding:8px 12px;border-radius:8px;margin-bottom:10px">
    interface PonyModel { name: string; color: string; speed: number; }
  </div>
  <div class="row" style="margin-bottom:8px">
    <b>Phép biến đổi:</b>
    <label><input type="radio" name="mt" value="Partial" checked> Partial</label>
    <label><input type="radio" name="mt" value="Readonly"> Readonly</label>
    <label><input type="radio" name="mt" value="Required"> Required</label>
    <label><input type="radio" name="mt" value="Pick"> Pick</label>
    <label><input type="radio" name="mt" value="Record"> Record</label>
  </div>
  <div class="row" id="mt-keys" style="margin-bottom:10px"></div>
  <div class="grid2">
    <div><b>Kiểu kết quả</b><pre class="hl" id="mt-type" style="border-radius:8px;margin-top:6px"></pre></div>
    <div><b>Ví dụ giá trị hợp lệ</b><pre class="hl" id="mt-val" style="border-radius:8px;margin-top:6px"></pre></div>
  </div>
  <p id="mt-note" class="hint" style="margin-top:10px"></p>
</div>

<textarea class="live" data-ts data-title="Dùng thật: Partial, Readonly, Pick, Record">
interface PonyModel { name: string; color: string; speed: number; }
interface FormValue { value: string; valid: boolean; }

const partial: Partial<PonyModel> = { name: 'Rainbow Dash' };               // thiếu cũng được
const frozen: Readonly<PonyModel> = { name: 'Dash', color: 'blue', speed: 45 };
// frozen.speed = 1;   // ← lỗi: readonly
const picked: Pick<PonyModel, 'name' | 'color'> = { name: 'Dash', color: 'blue' };  // không có speed
const form: Record<keyof PonyModel, FormValue> = {
  name:  { value: 'Rainbow Dash', valid: true },
  color: { value: 'blue',         valid: true },
  speed: { value: '45',           valid: true }
};
console.log(partial, picked);
console.log(Object.keys(form));
</textarea>
<div class="box modern"><b>🆕 Trong Angular</b><p><code>Partial&lt;T&gt;</code> hay gặp ở <code>formGroup.patchValue()</code>; <code>Pick&lt;T, ...&gt;</code> khi component chỉ cần vài trường của model; <code>Record&lt;K, V&gt;</code> để làm từ điển có khoá cố định.</p></div>`
    },
    {
      id: 'unions', title: 'Union type, type guard và thu hẹp kiểu',
      html: `
<p>Ứng dụng có người dùng đã đăng nhập và ẩn danh, mỗi loại có dữ liệu riêng. Ta xem 3 cách viết, từ kém đến tốt.</p>

<h3>Cách 1: ép kiểu bằng <code>as</code> (xấu)</h3>
<textarea class="code" data-lang="ts">
function onWebsiteSince(user: User): number {
  if (user.type === 'authenticated') return (user as AuthenticatedUser).loggedSince;
  else if (user.type === 'anonymous') return (user as AnonymousUser).visitingSince;
  return 0;     // TS không biết đã phủ hết các trường hợp
}
</textarea>

<h3>Cách 2: type guard (khá hơn)</h3>
<p>Hàm có kiểu trả về <code>user is AuthenticatedUser</code> “dạy” trình biên dịch thu hẹp kiểu.</p>
<textarea class="live" data-ts>
interface User { type: 'authenticated' | 'anonymous'; name: string; }
interface AuthenticatedUser extends User { type: 'authenticated'; loggedSince: number; }
interface AnonymousUser extends User { type: 'anonymous'; visitingSince: number; }

function isAuthenticated(user: User): user is AuthenticatedUser {
  return user.type === 'authenticated';
}
function onWebsiteSince(user: User): number {
  if (isAuthenticated(user)) {
    return user.loggedSince;         // ở đây user được hiểu là AuthenticatedUser
  }
  return (user as AnonymousUser).visitingSince;
}
console.log(onWebsiteSince({ type: 'authenticated', name: 'Ana', loggedSince: 2020 } as AuthenticatedUser));
</textarea>

<h3>Cách 3: discriminated union (tốt nhất)</h3>
<p>Mỗi biến thể có một trường “nhãn” (<code>type</code>) với giá trị literal riêng. TypeScript tự thu hẹp theo nhãn — <b>không cần ép kiểu, không cần return mặc định</b>.</p>

<div class="widget" id="w-union">
  <h4>🔀 Thu hẹp kiểu theo nhãn</h4>
  <p class="hint">Chọn một người dùng, xem nhánh <code>switch</code> nào chạy và TypeScript hiểu <code>user</code> là kiểu gì ở nhánh đó. Bật “thêm AdminUser” để thấy lợi ích của <code>switch</code> đầy đủ.</p>
  <div class="row" style="margin-bottom:10px">
    <label>Người dùng:
      <select id="un-user"></select></label>
    <label><input type="checkbox" id="un-admin"> Thêm AdminUser vào union (mô hình lớn lên)</label>
  </div>
  <pre class="hl" id="un-code" style="border-radius:8px"></pre>
  <div id="un-res" style="margin-top:10px"></div>
</div>

<textarea class="live" data-ts data-title="switch đầy đủ + kiểm tra “không sót” bằng never">
interface BaseUser { name: string; }
interface AuthenticatedUser extends BaseUser { type: 'authenticated'; loggedSince: number; }
interface AnonymousUser extends BaseUser { type: 'anonymous'; visitingSince: number; }
interface AdminUser extends BaseUser { type: 'admin'; adminSince: number; }
type User = AuthenticatedUser | AnonymousUser | AdminUser;

function assertNever(x: never): never { throw new Error('Chưa xử lý: ' + JSON.stringify(x)); }

function onWebsiteSince(user: User): number {
  switch (user.type) {
    case 'authenticated': return user.loggedSince;
    case 'anonymous':     return user.visitingSince;
    case 'admin':         return user.adminSince;
    default:              return assertNever(user);   // thêm biến thể mới mà quên case -> lỗi biên dịch ở đây
  }
}
const users: User[] = [
  { type: 'authenticated', name: 'Ana', loggedSince: 2019 },
  { type: 'anonymous', name: 'Guest', visitingSince: 2024 },
  { type: 'admin', name: 'Root', adminSince: 2015 }
];
users.forEach(u => console.log(u.name, '→', onWebsiteSince(u)));
</textarea>
<div class="box tip"><b>Mẹo thiết kế</b><p>Mỗi khi thêm biến thể mới vào union, mọi <code>switch</code> chưa xử lý sẽ <b>lỗi biên dịch</b> — trình biên dịch tự chỉ ra mọi chỗ cần sửa. Rất hợp để mô hình trạng thái UI: <code>loading | success | error</code>.</p></div>`
    }
  ],
  quiz: [
    { q: '<code>keyof PonyModel</code> (name, color, speed) là kiểu gì?', options: ["string", "'name' | 'color' | 'speed'", 'PonyModel[]'], answer: 1, why: 'keyof tạo union các tên thuộc tính.' },
    { q: 'Trong <code>getProperty&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K]</code>, gọi với key = "name" trả về kiểu gì?', options: ['any', 'string (kiểu của thuộc tính name)', 'K'], answer: 1, why: 'T[K] tra kiểu thuộc tính tương ứng nên kết quả được suy luận chính xác.' },
    { q: '<code>Partial&lt;PonyModel&gt;</code> làm gì?', options: ['Xoá thuộc tính', 'Biến mọi thuộc tính thành tuỳ chọn (?)', 'Làm mọi thuộc tính readonly'], answer: 1, why: 'Partial áp dụng ? cho mọi khoá.' },
    { q: 'Muốn kiểu chỉ có <code>name</code> và <code>color</code> của PonyModel?', options: ["Pick<PonyModel, 'name' | 'color'>", 'Record<PonyModel, string>', 'Readonly<PonyModel>'], answer: 0, why: 'Pick chọn tập khoá con của một kiểu.' },
    { q: 'Ưu điểm của discriminated union + switch?', options: ['Chạy nhanh hơn', 'Tự thu hẹp kiểu và báo lỗi nếu quên xử lý một biến thể', 'Không cần interface'], answer: 1, why: 'Trình biên dịch biết hết các nhãn có thể có nên kiểm tra đầy đủ được.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== mapped type ===== */
    const props = { name: 'string', color: 'string', speed: 'number' };
    const sampleVal = { name: "'Rainbow Dash'", color: "'blue'", speed: '45' };
    const keysBox = $('#mt-keys');
    keysBox.innerHTML = '<b>Thuộc tính (cho Pick):</b> ' + Object.keys(props).map(k => `<label><input type="checkbox" class="mt-k" value="${k}" checked> ${k}</label>`).join(' ');
    const notes = {
      Partial: 'Thêm ? vào mọi thuộc tính: ' + '`{ [P in keyof T]?: T[P] }`.',
      Readonly: 'Thêm readonly vào mọi thuộc tính: gán lại sẽ lỗi biên dịch.',
      Required: 'Ngược của Partial: gỡ dấu ? — mọi thuộc tính bắt buộc.',
      Pick: 'Chỉ giữ các khoá bạn chọn. Thuộc tính khác bị cấm khi tạo object literal.',
      Record: 'Giữ nguyên khoá nhưng đổi kiểu giá trị thành FormValue { value: string; valid: boolean }.'
    };
    function drawMapped() {
      const t = root.querySelector('input[name=mt]:checked').value;
      const picked = [...root.querySelectorAll('.mt-k')].filter(c => c.checked).map(c => c.value);
      keysBox.style.opacity = t === 'Pick' ? 1 : .4;
      let type, val;
      const all = Object.keys(props);
      if (t === 'Partial') { type = `{\n${all.map(k => `  ${k}?: ${props[k]};`).join('\n')}\n}`; val = `{ name: ${sampleVal.name} }  // thiếu cũng OK`; }
      else if (t === 'Readonly') { type = `{\n${all.map(k => `  readonly ${k}: ${props[k]};`).join('\n')}\n}`; val = `{ ${all.map(k => `${k}: ${sampleVal[k]}`).join(', ')} }\n// val.speed = 1  ✖ lỗi`; }
      else if (t === 'Required') { type = `{\n${all.map(k => `  ${k}: ${props[k]};`).join('\n')}\n}`; val = `{ ${all.map(k => `${k}: ${sampleVal[k]}`).join(', ')} }`; }
      else if (t === 'Pick') { type = picked.length ? `{\n${picked.map(k => `  ${k}: ${props[k]};`).join('\n')}\n}` : '{}'; val = `{ ${picked.map(k => `${k}: ${sampleVal[k]}`).join(', ')} }` + (picked.length < 3 ? `\n// thêm ${all.filter(k => !picked.includes(k))[0]} ✖ lỗi` : ''); }
      else { type = `{\n${all.map(k => `  ${k}: FormValue;`).join('\n')}\n}`; val = `{\n${all.map(k => `  ${k}: { value: ${sampleVal[k].replace(/^(\d+)$/, "'$1'")}, valid: true }`).join(',\n')}\n}`; }
      $('#mt-type').textContent = type; $('#mt-val').textContent = val;
      $('#mt-note').textContent = notes[t].replace(/`/g, '');
    }
    root.querySelectorAll('input[name=mt], .mt-k').forEach(i => i.onchange = drawMapped);
    drawMapped();

    /* ===== union narrowing ===== */
    const users = {
      authenticated: { type: 'authenticated', name: 'Ana', loggedSince: 2019, v: 'loggedSince' },
      anonymous: { type: 'anonymous', name: 'Guest', visitingSince: 2024, v: 'visitingSince' },
      admin: { type: 'admin', name: 'Root', adminSince: 2015, v: 'adminSince' }
    };
    const sel = $('#un-user'), admin = $('#un-admin');
    const fill = () => {
      const keep = sel.value;
      const list = Object.keys(users).filter(k => k !== 'admin' || admin.checked);
      sel.innerHTML = list.map(k => `<option value="${k}">${k} (${users[k].name})</option>`).join('');
      if (list.includes(keep)) sel.value = keep;
    };
    function drawUnion() {
      const withAdmin = admin.checked, u = users[sel.value];
      const cases = ['authenticated', 'anonymous'];
      const caseLines = c => `    case '${c}':\n      return user.${users[c].v};   // user: ${c[0].toUpperCase() + c.slice(1)}User`;
      let code = `type User = AuthenticatedUser | AnonymousUser${withAdmin ? ' | AdminUser' : ''};\n\nfunction onWebsiteSince(user: User): number {\n  switch (user.type) {\n${cases.map(caseLines).join('\n')}\n  }\n}`;
      $('#un-code').innerHTML = esc(code).replace(/(case '[a-z]+':)/g, m => `<span class="t-kw">${m}</span>`);
      const handled = cases.includes(u.type);
      let html;
      if (withAdmin) html = `<span class="pill rejected">✖ Lỗi biên dịch</span> <span class="mono" style="font-size:13px">TS2366: Function lacks ending return statement and return type does not include 'undefined'.<br>Ca 'admin' chưa được xử lý — trình biên dịch buộc bạn thêm <b>case 'admin'</b>.</span>`;
      else html = `<span class="pill fulfilled">✓ Biên dịch OK</span> Nhánh <b>case '${u.type}'</b> chạy; TypeScript hiểu <code>user</code> là <b>${u.type[0].toUpperCase() + u.type.slice(1)}User</b> nên đọc được <code>user.${u.v}</code> = <b>${u[u.v]}</b>.`;
      $('#un-res').innerHTML = html;
    }
    sel.onchange = drawUnion; admin.onchange = () => { fill(); drawUnion(); };
    fill(); drawUnion();
  }
});
