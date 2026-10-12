registerChapter(2, {
  time: '45–60 phút',
  lead: 'JavaScript hiện đại (ES2015+) là ngôn ngữ nền của Angular. Mọi ví dụ dưới đây <b>chạy được ngay trên trang</b>: sửa code, bấm “Chạy”, quan sát.',
  sections: [
    {
      id: 'transpiler', title: 'Transpiler: viết mới, chạy ở đâu cũng được',
      html: `
<p>Trình duyệt cũ không hiểu cú pháp mới. <b>Transpiler</b> (Babel, và TypeScript trong Angular) đọc code ES2015+ rồi sinh ra ES5 chạy được mọi nơi, kèm <i>source map</i> để bạn debug trên code gốc.</p>
<div class="flow">
  <div class="node">Code của bạn<small>ES2015+ / TypeScript</small></div><span class="arr">→</span>
  <div class="node hot">Transpiler<small>Babel / tsc</small></div><span class="arr">→</span>
  <div class="node">ES5 + source map<small>chạy mọi trình duyệt</small></div>
</div>
<textarea class="code" data-lang="js" data-title="Trước → sau khi transpile (minh hoạ)">
// ES2015+
const double = n => n * 2;

// ES5 sinh ra
var double = function (n) { return n * 2; };
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Hầu hết trình duyệt đang dùng đã hỗ trợ ES2015+ gần đầy đủ. Angular CLI vẫn transpile TypeScript, nhưng mục tiêu mặc định là JavaScript hiện đại (không còn “differential loading” như sách nhắc ở chương 26).</p></div>`
    },
    {
      id: 'let', title: 'let – biến có phạm vi khối',
      html: `
<p><code>var</code> bị “hoisting”: khai báo luôn bị kéo lên đầu hàm, và biến sống cả ngoài khối <code>if</code>. <code>let</code> chỉ sống trong khối <code>{ }</code> chứa nó – đúng như các ngôn ngữ khác. <b>Quy tắc: bỏ <code>var</code>, dùng <code>let</code>.</b></p>
<textarea class="live" data-title="var rò rỉ ra ngoài khối, let thì không">
function withVar(isChampion) {
  if (isChampion) {
    var name = 'Champion';
  }
  return name;            // vẫn truy cập được (hoisting)
}
function withLet(isChampion) {
  if (isChampion) {
    let name = 'Champion';
  }
  try { return name; } catch (e) { return 'Lỗi: ' + e.message; }
}
console.log('var :', withVar(false));  // undefined (không lỗi!)
console.log('let :', withLet(true));
</textarea>
<h3>Bẫy kinh điển: vòng lặp + setTimeout</h3>
<textarea class="live" data-title="Cả 3 lần in ra gì? Đổi var thành let rồi chạy lại">
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var i =', i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let j =', j), 0);
}
</textarea>
<div class="box tip"><b>Vì sao?</b><p><code>var i</code> chỉ có <b>một</b> biến dùng chung cho cả vòng lặp, nên khi timer chạy thì <code>i</code> đã là 3. <code>let j</code> tạo <b>một biến mới cho mỗi vòng</b>.</p></div>`
    },
    {
      id: 'const', title: 'const – hằng số (nhưng không “đóng băng”)',
      html: `
<p><code>const</code> bắt buộc gán giá trị ngay và <b>không cho gán lại</b>. Nhưng nếu giá trị là object/array, bạn vẫn sửa được <i>nội dung bên trong</i>.</p>
<textarea class="live">
const PONIES = [];
PONIES.push({ color: 'blue' });     // OK: sửa nội dung
console.log(PONIES);

try {
  PONIES = [];                      // gán lại -> lỗi
} catch (e) {
  console.log('Lỗi:', e.message);
}

const frozen = Object.freeze({ color: 'red' });
frozen.color = 'green';             // bị bỏ qua (im lặng)
console.log(frozen.color);
</textarea>
<div class="box info"><b>Thói quen tốt</b><p>Mặc định dùng <code>const</code>, chỉ đổi sang <code>let</code> khi thật sự cần gán lại. Angular style guide cũng khuyên vậy.</p></div>`
    },
    {
      id: 'shorthand', title: 'Viết tắt khi tạo object',
      html: `
<p>Khi tên thuộc tính trùng tên biến, chỉ cần viết một lần. Method cũng có cú pháp gọn.</p>
<textarea class="live">
function createPony() {
  const name = 'Rainbow Dash';
  const color = 'blue';
  return {
    name,            // = name: name
    color,           // = color: color
    run() {          // = run: function () {...}
      return name + ' is running!';
    }
  };
}
const pony = createPony();
console.log(pony);
console.log(pony.run());
</textarea>`
    },
    {
      id: 'destructuring', title: 'Destructuring – bóc dữ liệu ra biến',
      html: `
<p>Thay vì viết <code>const a = obj.a; const b = obj.b;</code>, bạn “bóc” nhiều thuộc tính cùng lúc. <b>Vế trái là khuôn (pattern)</b>, vế phải là dữ liệu.</p>

<div class="widget" id="w-destr">
  <h4>🔬 Máy soi destructuring</h4>
  <p class="hint">Chọn một ví dụ hoặc tự sửa khuôn. Các biến tạo ra sẽ hiện bên phải; thuộc tính được dùng sẽ sáng xanh.</p>
  <div class="row" id="ds-presets" style="margin-bottom:10px"></div>
  <div class="grid2">
    <div>
      <b>Dữ liệu (JSON)</b><br>
      <textarea id="ds-data" rows="5" style="width:100%" class="mono" spellcheck="false"></textarea>
    </div>
    <div>
      <b>Khuôn:</b> <span class="mono">const</span><br>
      <input type="text" id="ds-pat" class="mono" style="width:100%" spellcheck="false">
    </div>
  </div>
  <div style="margin-top:12px"><b>Biến được tạo:</b><div id="ds-out"></div></div>
  <div id="ds-src" style="margin-top:8px"></div>
</div>

<textarea class="live" data-title="Thử trực tiếp: lồng nhau, giá trị mặc định, đổi tên, rest">
const httpOptions = { timeout: 2000, isCache: true, cache: { age: 2 } };

const { timeout, isCache } = httpOptions;               // cùng tên
const { timeout: httpTimeout } = httpOptions;          // đổi tên
const { cache: { age } } = httpOptions;                // lồng nhau
const { retries = 3 } = httpOptions;                   // mặc định khi thiếu
const [first, ...others] = [1000, 2000, 3000];         // mảng + rest

console.log(timeout, isCache, httpTimeout, age, retries);
console.log(first, others);

// Trả về nhiều giá trị
function randomPonyInRace() { return { pony: { name: 'Rainbow Dash' }, position: 2 }; }
const { pony, position } = randomPonyInRace();
console.log(pony.name, 'đang ở vị trí', position);
</textarea>
<div class="box info"><b>Trong Angular</b><p>Bạn sẽ gặp destructuring liên tục, ví dụ lấy tham số route: <code>const { id } = params;</code>.</p></div>`
    },
    {
      id: 'defaults', title: 'Tham số mặc định',
      html: `
<p>Cách cũ <code>size = size || 10</code> có lỗi ngầm: giá trị “falsy” như <code>0</code> cũng bị thay. Tham số mặc định ES2015 chỉ thay khi giá trị là <code>undefined</code>.</p>
<textarea class="live" data-title="So sánh cách cũ và mới – chú ý số 0">
function oldWay(size, page) {
  size = size || 10;
  page = page || 1;
  return { size, page };
}
function newWay(size = 10, page = 1) {
  return { size, page };
}
console.log('cũ , không tham số:', oldWay());
console.log('mới, không tham số:', newWay());
console.log('cũ , size=0 :', oldWay(0));   // 0 bị thay thành 10 (bug)
console.log('mới, size=0 :', newWay(0));   // giữ nguyên 0

// Mặc định có thể là biểu thức hoặc dựa vào tham số trước
const defaultSize = () => 20;
function paged(size = defaultSize(), page = size - 1) { return { size, page }; }
console.log(paged(), paged(5));
</textarea>`
    },
    {
      id: 'rest', title: 'Rest và Spread (...)',
      html: `
<p>Dấu <code>...</code> có hai vai trò “đối nghịch” nhau:</p>
<table>
<tr><th>Tên</th><th>Nằm ở đâu</th><th>Làm gì</th></tr>
<tr><td><b>Rest</b></td><td>Khai báo tham số / vế trái destructuring</td><td><b>Gom</b> nhiều giá trị thành 1 mảng</td></tr>
<tr><td><b>Spread</b></td><td>Khi gọi hàm / trong mảng, object literal</td><td><b>Rải</b> 1 mảng thành nhiều giá trị</td></tr>
</table>
<textarea class="live">
// REST: gom
function addPonies(...ponies) {            // ponies là mảng thật
  const race = [];
  for (const pony of ponies) race.push(pony);
  return race;
}
console.log(addPonies('Rainbow Dash', 'Pinkie Pie', 'Applejack'));

const [winner, ...losers] = ['Dash', 'Pinkie', 'Apple'];
console.log('winner:', winner, '| losers:', losers);

// SPREAD: rải
const prices = [12, 3, 4];
console.log('min =', Math.min(...prices));

// Copy & gộp (không sửa bản gốc)
const a = [1, 2], b = [3];
console.log([...a, ...b, 99]);
const base = { color: 'blue', speed: 10 };
console.log({ ...base, speed: 20 });       // ghi đè một thuộc tính
</textarea>
<div class="box tip"><b>Rất hay dùng trong Angular</b><p>Spread cho object/array là cách cập nhật state mà <b>không mutate</b> – nền tảng của <code>OnPush</code> và NgRx sau này.</p></div>`
    },
    {
      id: 'classes', title: 'Class – nền tảng của component',
      html: `
<p>Một component, service, directive Angular… <b>đều là một class</b>. Nắm chắc: constructor, method, static, getter/setter, kế thừa và <code>super</code>.</p>
<textarea class="live" data-title="Class cơ bản, static, getter/setter">
class Pony {
  static defaultSpeed() { return 10; }          // gọi trên class

  constructor(color) {
    this.color = color;
    this._speed = Pony.defaultSpeed();
  }
  get speed() { console.log('(get speed)'); return this._speed; }
  set speed(v) { console.log('(set speed ' + v + ')'); this._speed = v; }
  toString() { return \`\${this.color} pony\`; }
}
const bluePony = new Pony('blue');
console.log(bluePony.toString());
bluePony.speed = 15;
console.log(bluePony.speed);
console.log(Pony.defaultSpeed());
</textarea>
<h3>Kế thừa</h3>
<textarea class="live" data-title="extends, override và super">
class Animal {
  constructor(speed) { this.speed = speed; }
  describe() { return 'Chạy ' + this.speed + ' km/h'; }
}
class Pony extends Animal {
  constructor(speed, color) {
    super(speed);                 // gọi constructor lớp cha
    this.color = color;
  }
  describe() {                    // override
    return super.describe() + ' – ngựa ' + this.color;
  }
}
const pony = new Pony(20, 'blue');
console.log(pony.describe());
console.log(pony instanceof Animal, pony instanceof Pony);
</textarea>
<div class="box warn"><b>Lưu ý</b><p>Khai báo class <b>không được hoisting</b>: phải khai báo trước khi dùng.</p></div>`
    },
    {
      id: 'promises', title: 'Promise – bỏ “địa ngục callback”',
      html: `
<p>Promise là đối tượng đại diện cho kết quả <i>chưa có ngay</i>. Nó có 3 trạng thái: <span class="pill pending">pending</span> (đang chờ) → <span class="pill fulfilled">fulfilled</span> (thành công) hoặc <span class="pill rejected">rejected</span> (thất bại). Đã ra khỏi pending thì không đổi nữa.</p>

<div class="widget" id="w-promise">
  <h4>⛓ Chuỗi Promise: getUser → getRights → updateMenu</h4>
  <p class="hint">Chọn bước sẽ thất bại, rồi bấm “Chạy chuỗi”. Xem lỗi “nhảy” thẳng tới <code>.catch</code> và bỏ qua các bước còn lại.</p>
  <div class="row" style="margin-bottom:10px">
    <label>Thất bại ở:
      <select id="pm-fail">
        <option value="-1">Không bước nào (thành công hết)</option>
        <option value="0">getUser</option>
        <option value="1">getRights</option>
        <option value="2">updateMenu</option>
      </select></label>
    <button class="btn" id="pm-run">▶ Chạy chuỗi</button>
  </div>
  <div class="flow" id="pm-flow"></div>
  <div id="pm-log" class="mono" style="font-size:13px;color:var(--muted)"></div>
</div>

<textarea class="live" data-time data-title="Thử thật: sửa fail = true để thấy .catch">
const fail = false;
const wait = ms => new Promise(r => setTimeout(r, ms));

const getUser = login => wait(300).then(() => {
  if (fail) throw new Error('No user');
  return { login, id: 1 };
});
const getRights = user => wait(300).then(() => ['read', 'write']);

getUser('cedric')
  .then(user => { console.log('user:', user); return getRights(user); })
  .then(rights => console.log('rights:', rights))
  .catch(e => console.log('Bắt lỗi chung:', e.message))
  .finally(() => console.log('xong (dù thành công hay lỗi)'));

console.log('dòng này in TRƯỚC – vì promise không chặn code');
</textarea>

<h3>Tự tạo Promise</h3>
<textarea class="live" data-title="resolve / reject">
const getUser = login => new Promise((resolve, reject) => {
  setTimeout(() => {
    login === 'cedric' ? resolve({ login }) : reject('No user');
  }, 200);
});
getUser('cedric').then(u => console.log('OK', u));
getUser('???').then(
  u => console.log('OK', u),
  err => console.log('Rejected:', err)
);
</textarea>`
    },
    {
      id: 'arrow', title: 'Arrow function và “this” biết điều',
      html: `
<p>Hai ưu điểm: <b>ngắn gọn</b> (return ngầm khi không có <code>{ }</code>) và <b><code>this</code> không bị thay đổi</b> – nó giữ nguyên <code>this</code> của nơi định nghĩa.</p>
<textarea class="live" data-title="Cú pháp">
const double = n => n * 2;                 // 1 tham số, return ngầm
const add = (a, b) => a + b;              // nhiều tham số
const tag = n => { const s = 'No.' + n; return s; };  // có block => phải return
const makePony = name => ({ name });       // trả object: bọc trong ( )

console.log(double(4), add(2, 3), tag(7), makePony('Dash'));
console.log([1, 2, 3].map(n => n * n));
</textarea>
<h3>Vấn đề kinh điển với this</h3>
<textarea class="live" data-title="function thường làm mất this; arrow giữ lại">
const brokenFinder = {
  max: 0,
  find(numbers) {
    numbers.forEach(function (element) {   // this ở đây KHÔNG phải brokenFinder
      if (element > this.max) { this.max = element; }
    });
  }
};
try {
  brokenFinder.find([2, 3, 4]);
  console.log('function thường -> max =', brokenFinder.max, '(sai! đáng lẽ là 4)');
} catch (e) { console.log('function thường -> lỗi:', e.message); }

const goodFinder = {
  max: 0,
  find(numbers) {
    numbers.forEach(element => {            // arrow: this = goodFinder
      if (element > this.max) { this.max = element; }
    });
  }
};
goodFinder.find([2, 3, 4]);
console.log('arrow -> max =', goodFinder.max);
</textarea>
<div class="box info"><b>Trong Angular</b><p>Bạn sẽ viết <code>this.http.get(url).subscribe(data => this.ponies = data)</code> — nhờ arrow, <code>this</code> vẫn là component.</p></div>`
    },
    {
      id: 'async', title: 'async / await – code bất đồng bộ trông như đồng bộ',
      html: `
<p><code>await</code> (ES2017) tạm dừng hàm <code>async</code> đến khi Promise xong, nhưng <b>không chặn trình duyệt</b>. Lỗi bắt bằng <code>try/catch</code> quen thuộc.</p>
<textarea class="live" data-time data-title="Tuần tự: tổng thời gian = tổng các bước">
const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));

async function load() {
  try {
    const user = await wait(300, { login: 'cedric' });
    console.log('có user', user);
    const rights = await wait(300, ['read']);
    console.log('có rights', rights);
  } catch (e) {
    console.log('lỗi', e);
  }
}
await load();
console.log('load() đã xong');
</textarea>

<div class="widget" id="w-async">
  <h4>⏱ Tuần tự hay song song?</h4>
  <p class="hint">3 request chạy 600ms, 400ms và 800ms. Nếu chúng độc lập, đừng <code>await</code> từng cái một!</p>
  <button class="btn" id="as-run">▶ So sánh</button>
  <p style="margin:12px 0 2px"><b>Tuần tự</b> <code>await a(); await b(); await c();</code> <span id="as-t1" class="mono"></span></p>
  <div class="timeline" id="as-seq"></div>
  <p style="margin:12px 0 2px"><b>Song song</b> <code>await Promise.all([a(), b(), c()])</code> <span id="as-t2" class="mono"></span></p>
  <div class="timeline" id="as-par"></div>
</div>

<textarea class="live" data-time data-title="Promise.all thật sự chạy nhanh hơn">
const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
const t0 = Date.now();
const [a, b, c] = await Promise.all([wait(600, 'A'), wait(400, 'B'), wait(800, 'C')]);
console.log(a, b, c, '— tổng', Date.now() - t0, 'ms (≈ 800, không phải 1800)');
</textarea>
<div class="box info"><b>Trong Angular</b><p>HTTP của Angular trả về <b>Observable</b> (chương 13), không phải Promise; nhưng bạn có thể đổi bằng <code>firstValueFrom(obs$)</code> để dùng <code>await</code>.</p></div>`
    },
    {
      id: 'collections', title: 'Map và Set',
      html: `
<p>Hai bộ sưu tập thật sự: <b>Map</b> (khoá → giá trị, khoá có thể là bất kỳ kiểu nào) và <b>Set</b> (tập giá trị không trùng).</p>
<textarea class="live">
const cedric = { id: 1, name: 'Cedric' };

const users = new Map();
users.set(cedric.id, cedric);
console.log(users.has(1), users.size, users.get(1));

const tags = new Set(['a', 'b', 'a', 'c', 'b']);   // tự loại trùng
console.log(tags, tags.size);
tags.add('d'); tags.delete('a');

for (const t of tags) console.log('tag', t);       // for ... of

// Mẹo: bỏ phần tử trùng trong mảng
console.log([...new Set([3, 1, 3, 2, 1])]);
</textarea>
<div class="box info"><b>Trong Angular</b><p>Cú pháp <code>for ... of</code> chính là thứ Angular chọn cho template: <code>*ngFor="let pony of ponies"</code> (và <code>@for (pony of ponies; track pony.id)</code> ở bản mới).</p></div>`
    },
    {
      id: 'template', title: 'Template literal – chuỗi dùng dấu huyền',
      html: `
<p>Dùng dấu huyền <code>\`</code> để chèn biểu thức bằng <code>\${ }</code> và viết chuỗi nhiều dòng. Đây là cách viết template HTML cho component ngay trong code.</p>
<textarea class="live">
const firstname = 'Rainbow', lastname = 'Dash';
console.log(\`Miss \${firstname} \${lastname}\`);
console.log(\`1 + 2 = \${1 + 2}\`);

const template = \`<div>
  <h1>Hello \${firstname}</h1>
</div>\`;
console.log(template);
</textarea>
<h3>Tagged template (nâng cao)</h3>
<p>Đặt tên hàm ngay trước dấu huyền: hàm nhận phần chuỗi tĩnh và các giá trị. Thư viện như <code>lit</code>, <code>styled-components</code> dùng kỹ thuật này.</p>
<textarea class="live">
const uppercaseNames = (strings, ...values) =>
  strings.map((s, i) => s + (values[i] ? values[i].toUpperCase() : '')).join('');

const person1 = 'Cedric', person2 = 'Agnes';
console.log(uppercaseNames\`Hello \${person1}! Where is \${person2}?\`);
</textarea>`
    },
    {
      id: 'modules', title: 'Module – chia code thành file',
      html: `
<p>Mỗi file là một module; thứ gì <code>export</code> mới dùng được ở file khác bằng <code>import</code>. Trong Angular, <b>mỗi component/service thường là một class trong file riêng, export rồi import</b> ở nơi cần.</p>
<div class="flow">
  <div class="node">pony.ts<small>export default class Pony</small></div><span class="arr">→</span>
  <div class="node hot">races.service.ts<small>import Pony<br>export bet(), start()</small></div><span class="arr">→</span>
  <div class="node">race.component.ts<small>import { bet, start }</small></div>
</div>
<textarea class="code" data-lang="js" data-title="races.service.js – named export">
export function bet(race, pony) { /* ... */ }
export function start(race) { /* ... */ }
</textarea>
<textarea class="code" data-lang="js" data-title="Các cách import">
import { bet, start } from './races.service';          // chọn từng cái
import { start as startRace } from './races.service';  // đổi tên (alias)
import * as racesService from './races.service';       // lấy tất cả vào 1 tên
racesService.bet(race, pony1);
</textarea>
<textarea class="code" data-lang="js" data-title="default export – mỗi file một thứ chính">
// pony.js
export default class Pony {}

// nơi khác – KHÔNG có dấu { }
import Pony from './pony';
</textarea>
<div class="box info"><b>Thực tế trong Angular</b><textarea class="code" data-lang="ts">
import { Component } from '@angular/core';
import { RaceService } from './race.service';
</textarea></div>
<div class="box warn"><b>Vì sao không chạy được trên trang này?</b><p>Code trong ô “chạy được” chạy như một hàm, không phải file module. Bạn sẽ chạy <code>import/export</code> thật khi tạo project Angular ở chương 8.</p></div>`
    },
    {
      id: 'summary', title: 'Tổng kết: ES2015+ xuất hiện ở đâu trong Angular?',
      html: `
<div class="tablewrap"><table>
<tr><th>Tính năng</th><th>Bạn sẽ thấy ở…</th></tr>
<tr><td><code>class</code>, <code>extends</code></td><td>Mọi component, service, directive, pipe</td></tr>
<tr><td><code>import / export</code></td><td>Mọi file TypeScript của Angular</td></tr>
<tr><td>Arrow function</td><td>Callback của <code>subscribe</code>, <code>map</code>, <code>filter</code></td></tr>
<tr><td>Destructuring</td><td>Lấy tham số route, props của Input</td></tr>
<tr><td>Spread</td><td>Cập nhật state bất biến</td></tr>
<tr><td>Template literal</td><td>Template/style inline của component</td></tr>
<tr><td>Promise / async-await</td><td>Guard, resolver, tích hợp thư viện bên ngoài</td></tr>
<tr><td><code>for ... of</code></td><td>Ý tưởng đằng sau <code>*ngFor</code>, <code>@for</code></td></tr>
</table></div>
<p>Muốn sâu hơn: <a href="https://exploringjs.com/" target="_blank" rel="noopener">Exploring JS</a> (Axel Rauschmayer) và <a href="https://developer.mozilla.org/vi/docs/Web/JavaScript" target="_blank" rel="noopener">MDN JavaScript</a>. Chương tiếp theo: thêm <b>kiểu</b> vào JavaScript = TypeScript.</p>`
    }
  ],
  quiz: [
    { q: 'Đoạn <code>for (var i=0;i&lt;3;i++) setTimeout(()=>console.log(i))</code> in ra gì?', options: ['0 1 2', '3 3 3', 'Lỗi'], answer: 1, why: 'var chỉ có một biến i dùng chung; khi timer chạy i đã bằng 3. Dùng let sẽ ra 0 1 2.' },
    { q: 'Với <code>const PONIES = []</code>, dòng nào gây lỗi?', options: ['PONIES.push(1)', 'PONIES = [1]', 'console.log(PONIES)'], answer: 1, why: 'const cấm gán lại biến, nhưng vẫn cho sửa nội dung mảng/object.' },
    { q: '<code>function f(size = 10){return size}</code>; <code>f(0)</code> trả về?', options: ['10', '0', 'undefined'], answer: 1, why: 'Mặc định chỉ thay khi undefined. Cách cũ size || 10 thì 0 bị thay thành 10.' },
    { q: 'Với <code>const { pony } = { pony: "Dash", position: 2 }</code>, biến nào được tạo?', options: ['pony và position', 'chỉ pony', 'object'], answer: 1, why: 'Khuôn chỉ liệt kê pony nên chỉ bóc pony.' },
    { q: 'Trong <code>async function</code>, <code>await</code> làm gì?', options: ['Chặn toàn bộ trình duyệt', 'Tạm dừng hàm đó đến khi Promise xong, trình duyệt vẫn xử lý việc khác', 'Biến Promise thành callback'], answer: 1, why: 'await không chặn thread; chỉ hàm async đó được tạm dừng và tiếp tục sau.' },
    { q: 'Ba request độc lập, muốn nhanh nhất thì dùng?', options: ['await từng cái liên tiếp', 'await Promise.all([...])', 'setTimeout'], answer: 1, why: 'Promise.all chạy song song, tổng thời gian bằng request chậm nhất.' },
    { q: 'Vì sao arrow function hữu ích trong callback của class?', options: ['Chạy nhanh hơn', 'this giữ nguyên là đối tượng bên ngoài', 'Không cần return'], answer: 1, why: 'Arrow không tạo this riêng nên this vẫn trỏ tới component/object chứa nó.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);

    /* ===== máy soi destructuring ===== */
    const presets = [
      { n: 'Cơ bản', data: { timeout: 2000, isCache: true }, pat: '{ timeout, isCache }' },
      { n: 'Đổi tên', data: { timeout: 2000, isCache: true }, pat: '{ timeout: httpTimeout, isCache: httpCache }' },
      { n: 'Lồng nhau', data: { timeout: 2000, cache: { age: 2 } }, pat: '{ cache: { age } }' },
      { n: 'Mặc định', data: { timeout: 2000 }, pat: '{ timeout, retries = 3 }' },
      { n: 'Mảng + rest', data: [1000, 2000, 3000], pat: '[shortTimeout, ...others]' }
    ];
    const dsData = $('#ds-data'), dsPat = $('#ds-pat'), dsOut = $('#ds-out'), dsSrc = $('#ds-src');
    const names = pat => pat.replace(/\.\.\./g, '').split(/[{}\[\],]/).map(t => t.trim()).filter(Boolean)
      .map(t => { if (t.includes(':')) t = t.split(':').pop(); return t.split('=')[0].trim(); })
      .filter(t => /^[A-Za-z_$][\w$]*$/.test(t));
    const keysUsed = pat => pat.split(/[{}\[\],]/).map(t => t.trim()).filter(Boolean).map(t => t.split(/[:=]/)[0].replace('...', '').trim());
    function runDs() {
      try {
        const data = JSON.parse(dsData.value), pat = dsPat.value;
        const vars = names(pat);
        const res = new Function('data', `const ${pat} = data; return { ${vars.join(', ')} };`)(data);
        dsOut.innerHTML = vars.map(v => `<span class="kv hit"><span class="k">${v}</span><span class="v">${JSON.stringify(res[v])}</span></span>`).join('') || '<i>(không có biến)</i>';
        const used = keysUsed(pat);
        dsSrc.innerHTML = '<b>Dữ liệu gốc:</b> ' + (Array.isArray(data)
          ? data.map((v, i) => `<span class="kv ${i < vars.length || pat.includes('...') ? 'hit' : 'miss'}"><span class="k">[${i}]</span><span class="v">${v}</span></span>`).join('')
          : Object.keys(data).map(k => `<span class="kv ${used.includes(k) ? 'hit' : 'miss'}"><span class="k">${k}</span><span class="v">${JSON.stringify(data[k])}</span></span>`).join(''));
      } catch (e) { dsOut.innerHTML = `<span class="pill rejected">${e.message}</span>`; dsSrc.innerHTML = ''; }
    }
    const pr = $('#ds-presets');
    presets.forEach(p => {
      const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = p.n;
      b.onclick = () => { dsData.value = JSON.stringify(p.data); dsPat.value = p.pat; runDs(); };
      pr.appendChild(b);
    });
    dsData.oninput = dsPat.oninput = runDs;
    dsData.value = JSON.stringify(presets[0].data); dsPat.value = presets[0].pat; runDs();

    /* ===== chuỗi Promise ===== */
    const steps = ['getUser()', '.then(getRights)', '.then(updateMenu)', '.catch(log)'];
    const flow = $('#pm-flow'), log = $('#pm-log');
    const drawFlow = states => {
      flow.innerHTML = steps.map((s, i) =>
        `${i ? '<span class="arr">→</span>' : ''}<div class="node fade" style="${states[i] === 'ok' ? 'border-color:var(--ok);background:var(--okbg)' : states[i] === 'err' ? 'border-color:var(--err);background:var(--errbg)' : states[i] === 'skip' ? 'opacity:.4' : ''}">${s}<small>${states[i] === 'ok' ? '✓ fulfilled' : states[i] === 'err' ? '✖ rejected' : states[i] === 'skip' ? 'bị bỏ qua' : 'chờ'}</small></div>`).join('');
    };
    drawFlow([]);
    $('#pm-run').onclick = async () => {
      const failAt = +$('#pm-fail').value, st = [], sleep = ms => new Promise(r => setTimeout(r, ms));
      log.textContent = '';
      drawFlow(['', '', '', '']);
      let failed = false;
      for (let i = 0; i < 3; i++) {
        await sleep(450);
        if (failed) st[i] = 'skip';
        else if (i === failAt) { st[i] = 'err'; failed = true; log.textContent += `✖ Bước ${i + 1} ném lỗi → nhảy tới .catch\n`; }
        else { st[i] = 'ok'; log.textContent += `✓ Bước ${i + 1} xong\n`; }
        drawFlow([...st, '']);
      }
      await sleep(450);
      st[3] = failed ? 'ok' : 'skip';
      if (failed) log.textContent += '✓ .catch xử lý lỗi, chuỗi kết thúc êm\n';
      drawFlow(st);
    };

    /* ===== tuần tự vs song song ===== */
    $('#as-run').onclick = () => {
      const durs = [600, 400, 800], cols = ['#3aa0ff', '#ff6fb1', '#f39b3d'], total = 1800;
      const seq = $('#as-seq'), par = $('#as-par');
      let off = 0;
      const mk = (el, starts) => {
        el.innerHTML = durs.map((d, i) => `<div class="bar" style="left:${starts[i] / total * 100}%;width:0;background:${cols[i]};transition:width ${d}ms linear ${starts[i]}ms">${'ABC'[i]} ${d}ms</div>`).join('');
        requestAnimationFrame(() => requestAnimationFrame(() => el.querySelectorAll('.bar').forEach((b, i) => (b.style.width = durs[i] / total * 100 + '%'))));
      };
      mk(seq, durs.map(d => { const s = off; off += d; return s; }));
      mk(par, durs.map(() => 0));
      $('#as-t1').textContent = '= 1800ms'; $('#as-t2').textContent = '= 800ms';
    };
  }
});
