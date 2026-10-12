registerChapter(4, {
  time: '45 phút',
  lead: 'TypeScript = JavaScript + hệ thống kiểu. Các khối “TS ▶” dưới đây được biên dịch thật bằng trình biên dịch TypeScript ngay trong trình duyệt (cần Internet lần đầu) — bấm “Xem JS sinh ra” để thấy kiểu biến mất ra sao.',
  sections: [
    {
      id: 'types', title: 'Kiểu cơ bản, suy luận kiểu, generic, any, union',
      html: `
<p>Cú pháp chung: <code>let tên: kiểu;</code>. Phần lớn lúc bạn không cần viết kiểu vì TypeScript <b>tự suy luận</b> (<i>type inference</i>) từ giá trị.</p>
<textarea class="live" data-ts data-title="Kiểu, suy luận, generic, union">
const ponyNumber: number = 0;
const ponyName: string = 'Rainbow Dash';
const inferred = 'tự suy ra là string';      // không cần ghi kiểu

class Pony { constructor(public name: string) {} }

const pony: Pony = new Pony('Dash');           // kiểu là một class của bạn
const ponies: Array<Pony> = [pony];            // generic: mảng chỉ chứa Pony
ponies.push(new Pony('Pinkie'));

let changing: any = 2;                         // any: "tắt" kiểm tra
changing = true;

let id: number | boolean = 2;                  // union type
id = true;

console.log(ponyNumber, ponyName, inferred, ponies.length, changing, id);
</textarea>

<div class="widget" id="w-errlab">
  <h4>🧯 Phòng thí nghiệm lỗi kiểu</h4>
  <p class="hint">Chọn một đoạn code sai để xem trình biên dịch phàn nàn thế nào <i>trước khi</i> bạn chạy.</p>
  <div class="row" style="margin-bottom:10px"><select id="el-sel"></select></div>
  <div class="codeblock"><pre class="hl" id="el-code"></pre><div class="output" id="el-msg"></div></div>
</div>

<div class="box warn"><b>Dùng <code>any</code> có chừng mực</b><p><code>any</code> là lối thoát khi bạn thật sự không biết kiểu, nhưng mỗi chỗ dùng là một chỗ mất bảo vệ. Ưu tiên <code>unknown</code> hoặc union.</p></div>`
    },
    {
      id: 'enums', title: 'Enum và union kiểu literal',
      html: `
<p>Một cuộc đua có thể ở trạng thái <i>Ready, Started, Done</i>. <code>enum</code> đặt tên cho các số (bắt đầu từ 0, hoặc bạn tự đặt, hoặc dùng chuỗi). Nhưng nhóm tác giả khuyên ưu tiên <b>union literal</b> vì đơn giản hơn.</p>
<textarea class="live" data-ts data-title="Ba cách mô tả “một trong vài giá trị”">
enum RaceStatus { Ready, Started, Done }          // 0, 1, 2
enum Medal { Gold = 1, Silver, Bronze }           // 1, 2, 3
enum Position { First = 'First', Second = 'Second' }

console.log(RaceStatus.Started, RaceStatus[1]);   // enum số có "tra ngược"
console.log(Medal.Silver, Position.First);

type Color = 'blue' | 'red' | 'green';            // union literal, không sinh code
let ponyColor: Color = 'blue';
// ponyColor = 'pink';   // ← bỏ comment: lỗi! 'pink' không thuộc Color
console.log(ponyColor);
</textarea>
<div class="box tip"><b>Bấm “Xem JS sinh ra”</b><p>Enum sinh ra một object thật (có code lúc chạy), còn <code>type Color</code> biến mất hoàn toàn. Đó là lý do union literal nhẹ hơn.</p></div>`
    },
    {
      id: 'return', title: 'Kiểu trả về và void',
      html: `
<p>Ghi kiểu trả về ngay sau danh sách tham số. Hàm không trả gì dùng <code>void</code>.</p>
<textarea class="live" data-ts>
enum RaceStatus { Ready, Started, Done }
interface Race { status: RaceStatus; }

function startRace(race: Race): Race {      // trả về Race
  race.status = RaceStatus.Started;
  return race;
}
function logRace(race: Race): void {         // không trả gì
  console.log('status =', RaceStatus[race.status]);
}
logRace(startRace({ status: RaceStatus.Ready }));
</textarea>`
    },
    {
      id: 'interfaces', title: 'Interface – “hình dạng” của object',
      html: `
<p>JS cho phép truyền mọi object có đúng thuộc tính cần. TypeScript gọi đó là <b>structural typing</b>: bạn mô tả hình dạng bằng <code>interface</code>, object nào khớp hình dạng là hợp lệ — không cần “khai báo implements”. Quy ước của sách: đặt hậu tố <code>Model</code> cho entity (vd. <code>PonyModel</code>).</p>

<div class="widget" id="w-iface">
  <h4>📐 Kiểm tra hình dạng</h4>
  <p class="hint">Interface: <span class="mono">interface PonyModel { name: string; speed: number; color?: string }</span> — <code>color</code> là tuỳ chọn. Sửa object bên dưới rồi xem kết quả.</p>
  <div class="row" id="if-presets" style="margin-bottom:8px"></div>
  <textarea id="if-in" rows="3" class="mono" style="width:100%" spellcheck="false"></textarea>
  <div id="if-out" style="margin-top:10px"></div>
</div>

<textarea class="live" data-ts data-title="Interface + hàm nhận “bất cứ thứ gì có score”">
interface HasScore { score: number; }

function addPointsToScore(player: HasScore, points: number): void {
  player.score += points;
}

const ana = { name: 'Ana', score: 10 };         // có thêm name: vẫn khớp
addPointsToScore(ana, 5);
console.log(ana);

interface PonyModel { name: string; speed: number; color?: string }
const pony: PonyModel = { name: 'Light Shoe', speed: 56 };
console.log(pony);
</textarea>`
    },
    {
      id: 'optional', title: 'Tham số tuỳ chọn, hàm làm thuộc tính',
      html: `
<p>Trong JS tham số nào cũng tuỳ chọn. Trong TS, thiếu tham số là lỗi trừ khi bạn thêm <code>?</code> (hoặc giá trị mặc định). Interface cũng mô tả được <b>method</b>.</p>
<textarea class="live" data-ts>
interface HasScore { score: number; }

function addPointsToScore(player: HasScore, points?: number): void {
  points = points || 0;                           // points có thể undefined
  player.score += points;
}
const p = { score: 1 };
addPointsToScore(p);           // OK vì points?
addPointsToScore(p, 4);
console.log(p.score);

// Interface mô tả method
interface CanRun { run(meters: number): void; }
function startRunning(pony: CanRun): void { pony.run(10); }

startRunning({ run: (meters: number) => console.log(\`pony runs \${meters}m\`) });
</textarea>`
    },
    {
      id: 'classes', title: 'Class: implements, public/private, tham số-thuộc tính',
      html: `
<p>Class có thể <code>implements</code> một hoặc nhiều interface — trình biên dịch buộc bạn cài đặt đúng chữ ký. Thuộc tính khai báo trực tiếp trong class (không chỉ trong constructor) là tính năng của TS. Mặc định là <code>public</code>; <code>private</code> giấu đi. Thêm <code>public/private</code> trước tham số constructor là <b>đường tắt tạo + gán thuộc tính</b> — bạn sẽ thấy cực nhiều trong Angular.</p>

<textarea class="live" data-ts data-title="Bấm “Xem JS sinh ra” để thấy phần tự gán this.name = name">
interface CanRun { run(meters: number): void; }
interface CanEat { eat(): void; }

class HungryPony implements CanRun, CanEat {
  speed = 10;                                     // thuộc tính khai báo trong class
  constructor(public name: string, private energy: number) {}   // đường tắt

  run(meters: number): void { console.log(\`\${this.name} chạy \${meters}m\`); }
  eat(): void { this.energy += 5; console.log(\`\${this.name} ăn, năng lượng = \${this.energy}\`); }
}

const pony = new HungryPony('Rainbow Dash', 10);
pony.run(20);
pony.eat();
console.log(pony.name);
// console.log(pony.energy);   // ← bỏ comment: lỗi biên dịch (private)
// (nhưng lúc chạy JS thì vẫn đọc được: private chỉ là kiểm tra lúc biên dịch)
</textarea>

<textarea class="code" data-lang="ts" data-title="Hai cách tương đương">
// Đường tắt
class NamedPony {
  constructor(public name: string, private speed: number) {}
}

// Dài dòng
class NamedPonyWithoutShortcut {
  public name: string;
  private speed: number;
  constructor(name: string, speed: number) {
    this.name = name;
    this.speed = speed;
  }
}
</textarea>
<div class="box info"><b>Interface có thể kế thừa interface</b>
<textarea class="code" data-lang="ts">
interface Animal extends CanRun, CanEat {}
class Pony implements Animal { /* phải có run() và eat() */ }
</textarea></div>
<div class="box modern"><b>🆕 Hiện nay</b><p>JS chuẩn nay đã có field trong class và <code>#private</code> thật sự (chặn cả lúc chạy). Trong Angular bạn còn gặp <code>readonly</code> và <code>protected</code> (dùng cho thuộc tính chỉ template cần truy cập).</p></div>`
    },
    {
      id: 'dts', title: 'Dùng thư viện JS có sẵn: file .d.ts',
      html: `
<p>Thư viện viết bằng JS không có kiểu? Cộng đồng viết sẵn file <b>khai báo kiểu</b> <code>.d.ts</code> (chỉ chứa chữ ký, không có code chạy), tập trung tại <b>DefinitelyTyped</b>.</p>
<textarea class="code" data-lang="bash">
npm install --save-dev @types/lodash
</textarea>
<textarea class="code" data-lang="ts" data-title="Ví dụ nội dung một file .d.ts">
declare function greet(name: string): string;
declare const VERSION: string;
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Phần lớn thư viện hiện đại <b>tự đóng gói kiểu</b> trong package (Angular làm vậy), nên bạn hiếm khi cần <code>@types/...</code> hay chú thích <code>/// &lt;reference&gt;</code> như trong sách.</p></div>`
    },
    {
      id: 'decorators', title: 'Decorator – gắn metadata cho class',
      html: `
<p>Decorator (bắt đầu bằng <code>@</code>) là hàm chạy khi class/method/thuộc tính/tham số được định nghĩa; nó có thể ghi metadata hoặc bọc lại hành vi. Angular dùng decorator để nói “class này là component”, “tham số này tuỳ chọn”…</p>

<h3>Tự viết <code>@Log()</code></h3>
<textarea class="live" data-ts data-title="Decorator method: bọc lại method gốc">
function Log() {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log(\`call to \${name}(\${args.join(', ')})\`);   // chạy mỗi lần gọi
      return original.apply(this, args);
    };
    return descriptor;
  };
}

class RaceService {
  @Log()
  getRaces() { return ['A', 'B']; }

  @Log()
  getRace(raceId: number) { return 'Race ' + raceId; }
}

const service = new RaceService();
service.getRaces();
console.log(service.getRace(1));
</textarea>

<h3>Cách Angular dùng decorator: ghi metadata, framework đọc sau</h3>
<textarea class="live" data-ts data-title="Mô phỏng @Component và “framework” đọc metadata">
const registry = new Map<Function, any>();       // nơi framework lưu metadata

function Component(config: { selector: string; template: string }) {
  return (target: Function) => { registry.set(target, config); };
}

@Component({ selector: 'ns-home', template: '<h1>Home</h1>' })
class HomeComponent {}

@Component({ selector: 'ns-about', template: '<h1>About</h1>' })
class AboutComponent {}

// "Framework" khởi động: quét registry và hiểu class nào là component
for (const [cls, meta] of registry) {
  console.log(\`\${cls.name} là component <\${meta.selector}> với template \${meta.template}\`);
}
</textarea>
<textarea class="code" data-lang="ts" data-title="Decorator thật của Angular">
@Component({ selector: 'ns-home', template: 'home' })
class HomeComponent {
  constructor(@Optional() hello: HelloService) {}   // decorator trên tham số
}
</textarea>
<div class="box modern"><b>🆕 Hiện nay</b><p>Decorator đã được đưa vào chuẩn JavaScript với cú pháp hơi khác. Angular vẫn dùng decorator kiểu TypeScript (<code>experimentalDecorators</code>), nên các ví dụ ở đây khớp với code Angular thực tế.</p></div>`
    }
  ],
  quiz: [
    { q: 'Dòng <code>const n = 5;</code> TypeScript suy ra kiểu gì?', options: ['any', 'number', 'string'], answer: 1, why: 'Suy luận kiểu từ giá trị: không cần ghi : number.' },
    { q: 'Ưu điểm của <code>type Color = "blue" | "red"</code> so với enum?', options: ['Nhanh hơn khi chạy vì không sinh code', 'Có thể dùng làm giá trị lúc chạy', 'Cho phép giá trị bất kỳ'], answer: 0, why: 'Union literal chỉ tồn tại lúc biên dịch nên không sinh JS.' },
    { q: 'Với <code>interface HasScore { score: number }</code>, object nào truyền được vào hàm nhận HasScore?', options: ['{ name: "A" }', '{ score: 3, name: "A" }', '{ score: "3" }'], answer: 1, why: 'Có đủ score kiểu number là khớp; thuộc tính thừa được chấp nhận khi truyền biến (không phải object literal trực tiếp).' },
    { q: '<code>constructor(public name: string, private speed: number) {}</code> làm gì?', options: ['Chỉ khai báo tham số', 'Tạo và gán luôn hai thuộc tính của class', 'Tạo interface'], answer: 1, why: 'Đây là “parameter properties”: đường tắt rất phổ biến trong Angular.' },
    { q: 'Từ khoá <code>private</code> của TypeScript bảo vệ lúc nào?', options: ['Lúc biên dịch', 'Cả lúc chạy', 'Không bảo vệ gì'], answer: 0, why: 'Sau khi sinh JS, thuộc tính vẫn truy cập được; chỉ trình biên dịch chặn.' },
    { q: 'Decorator trong Angular chủ yếu dùng để?', options: ['Tăng tốc code', 'Gắn metadata để framework hiểu vai trò của class', 'Thay thế interface'], answer: 1, why: '@Component, @Injectable… ghi metadata mà Angular đọc khi khởi động.' }
  ],
  mount(root) {
    const $ = s => root.querySelector(s);
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* ===== phòng thí nghiệm lỗi kiểu ===== */
    const errs = [
      { n: 'Push sai kiểu vào mảng', code: "const ponies: Array<Pony> = [new Pony()];\nponies.push('hello');", msg: "error TS2345: Argument of type 'string' is not assignable to parameter of type 'Pony'." },
      { n: 'Gán sai kiểu union', code: "let id: number | boolean = 2;\nid = 'abc';", msg: "error TS2322: Type 'string' is not assignable to type 'number | boolean'." },
      { n: 'Thiếu tham số', code: "function addPoints(player: HasScore, points: number) {}\naddPoints(player);", msg: "error TS2554: Expected 2 arguments, but got 1." },
      { n: 'Giá trị ngoài union literal', code: "type Color = 'blue' | 'red' | 'green';\nconst c: Color = 'pink';", msg: "error TS2322: Type '\"pink\"' is not assignable to type 'Color'." },
      { n: 'implements sai chữ ký', code: "class IllegalPony implements CanRun {\n  run(meters: string) {}\n}", msg: "error TS2420: Class 'IllegalPony' incorrectly implements interface 'CanRun'.\n  Types of property 'run' are incompatible." },
      { n: 'Truy cập private', code: "class P { constructor(private speed: number) {} }\nnew P(1).speed;", msg: "error TS2341: Property 'speed' is private and only accessible within class 'P'." }
    ];
    const sel = $('#el-sel');
    sel.innerHTML = errs.map((e, i) => `<option value="${i}">${e.n}</option>`).join('');
    const showErr = () => {
      const e = errs[+sel.value];
      $('#el-code').innerHTML = esc(e.code);
      $('#el-msg').innerHTML = `<span class="lbl">Trình biên dịch</span><span class="err">${esc(e.msg)}</span>`;
    };
    sel.onchange = showErr; showErr();

    /* ===== kiểm tra interface ===== */
    const spec = { name: 'string', speed: 'number', color: '?string' };
    const presets = [
      { n: 'Hợp lệ', v: { name: 'Light Shoe', speed: 56 } },
      { n: 'Có color tuỳ chọn', v: { name: 'Dash', speed: 60, color: 'blue' } },
      { n: 'Thiếu speed', v: { name: 'Dash' } },
      { n: 'Sai kiểu', v: { name: 'Dash', speed: '60' } },
      { n: 'Thuộc tính thừa', v: { name: 'Dash', speed: 60, wings: true } }
    ];
    const inp = $('#if-in'), out = $('#if-out');
    const check = () => {
      let obj;
      try { obj = JSON.parse(inp.value); } catch (e) { out.innerHTML = `<span class="pill rejected">JSON chưa hợp lệ</span>`; return; }
      const errsL = [];
      for (const [k, t] of Object.entries(spec)) {
        const opt = t[0] === '?', ty = opt ? t.slice(1) : t;
        if (!(k in obj)) { if (!opt) errsL.push(`Property '${k}' is missing in type but required in type 'PonyModel'.`); }
        else if (typeof obj[k] !== ty) errsL.push(`Type '${typeof obj[k]}' is not assignable to type '${ty}' (property '${k}').`);
      }
      for (const k of Object.keys(obj)) if (!(k in spec)) errsL.push(`Object literal may only specify known properties, and '${k}' does not exist in type 'PonyModel'.`);
      out.innerHTML = errsL.length
        ? `<span class="pill rejected">✖ Không khớp</span><ul>${errsL.map(e => `<li class="mono" style="font-size:13px">${esc(e)}</li>`).join('')}</ul>`
        : `<span class="pill fulfilled">✓ Khớp PonyModel</span>`;
    };
    const pr = $('#if-presets');
    presets.forEach(p => {
      const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = p.n;
      b.onclick = () => { inp.value = JSON.stringify(p.v); check(); };
      pr.appendChild(b);
    });
    inp.oninput = check;
    inp.value = JSON.stringify(presets[0].v); check();
  }
});
