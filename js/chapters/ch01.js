registerChapter(1, {
  time: '10 phút',
  lead: 'Bản đồ của cả hành trình: bạn sẽ học gì, theo thứ tự nào, và ứng dụng PonyRacer (đua ngựa pony) mà cuốn sách xây dựng từng mảnh một.',
  sections: [
    {
      id: 'roadmap', title: 'Lộ trình: từ JavaScript đến ninja',
      html: `
<p>Cuốn sách của Ninja Squad không nhảy vào Angular ngay. Tác giả cố ý dành <b>6 chương đầu</b> cho các “chương khái niệm” – những thứ Angular xây trên đó. Hiểu chúng rồi, Angular sẽ bớt “phép thuật” rất nhiều.</p>

<div class="flow">
  <div class="node">① Nền tảng<small>ES2015+, TypeScript, Web Components<br>(Chương 2–6)</small></div><span class="arr">→</span>
  <div class="node hot">② Angular cơ bản<small>Component, template, DI, service, pipe, RxJS<br>(Chương 7–13)</small></div><span class="arr">→</span>
  <div class="node">③ Xây app thật<small>Component/directive, test, HTTP, router, form<br>(Chương 14–19)</small></div><span class="arr">→</span>
  <div class="node">④ Nâng cao<small>Zone, AOT, i18n, hiệu năng, production<br>(Chương 20–26)</small></div>
</div>

<div class="widget" id="w-roadmap">
  <h4>Bạn đang ở đâu? Chọn mục tiêu để xem nên đọc chương nào</h4>
  <p class="hint">Bấm một trình độ của bạn:</p>
  <div class="row" id="lvlBtns">
    <button class="btn alt" data-l="0">Mới học web</button>
    <button class="btn alt" data-l="1">Biết JS cũ (ES5)</button>
    <button class="btn alt" data-l="2">Biết JS hiện đại, chưa biết TypeScript</button>
    <button class="btn alt" data-l="3">Đã dùng AngularJS / React / Vue</button>
  </div>
  <p id="lvlOut" style="margin-top:12px"></p>
</div>

<div class="box info"><b>Mẹo</b><p>Nếu bạn chắc ES2015+ rồi, tác giả cũng khuyên bỏ qua chương 2. Nhưng với app này, mỗi chương có ví dụ chạy được ngay — thử 5 phút là biết bạn có cần học lại không.</p></div>`
    },
    {
      id: 'ponyracer', title: 'PonyRacer – ứng dụng xuyên suốt',
      html: `
<p>Trong gói “Pro” của sách, bạn xây <b>PonyRacer</b>: website đặt cược các cuộc đua pony. Nó đủ đầy để là app thật: component, form, test, router, gọi HTTP API và cả WebSocket. Chúng ta không có bản gốc, nên đây là <b>phiên bản mini thuần JavaScript</b> để cảm nhận “đích đến”.</p>

<div class="widget" id="w-pony">
  <h4>🐴 PonyRacer mini</h4>
  <p class="hint">Chọn pony để cược rồi bấm “Bắt đầu đua”. Mỗi pony có tốc độ ngẫu nhiên.</p>
  <div class="row" style="margin-bottom:10px">
    <label>Cược cho: <select id="pr-pick"></select></label>
    <button class="btn" id="pr-go">🏁 Bắt đầu đua</button>
    <span id="pr-msg" style="font-weight:700"></span>
  </div>
  <div id="pr-track"></div>
</div>

<p>Sau này ở các chương Angular, mỗi phần của mini-app trên sẽ tương ứng với một khái niệm:</p>
<div class="tablewrap"><table>
<tr><th>Thành phần trong mini-app</th><th>Khái niệm Angular</th><th>Chương</th></tr>
<tr><td>Hộp chọn pony + nút bấm</td><td>Template, binding, event</td><td>9</td></tr>
<tr><td>Một dòng đường đua (pony + thanh chạy)</td><td>Component có <code>@Input</code></td><td>14</td></tr>
<tr><td>Danh sách pony lấy từ server</td><td>HTTP + Observable</td><td>13, 17</td></tr>
<tr><td>Trang danh sách ↔ trang chi tiết đua</td><td>Router</td><td>18</td></tr>
<tr><td>Form đăng ký / đăng nhập</td><td>Form + validator</td><td>19</td></tr>
<tr><td>Tính tiền cược, định dạng tiền</td><td>Service + Pipe</td><td>11, 12</td></tr>
</table></div>

<p>Mã nguồn của phần mini-app này nằm ngay trong file <code>js/chapters/ch01.js</code> (hàm <code>mount</code>) — bạn có thể mở ra đọc, nó dùng DOM thuần.</p>`
    },
    {
      id: 'history', title: 'AngularJS, Angular 2 và “Angular” ngày nay',
      html: `
<p>Tên gọi gây rối cho người mới, nên nắm ngay:</p>
<div class="tablewrap"><table>
<tr><th>Tên</th><th>Là gì</th><th>Ghi chú</th></tr>
<tr><td><b>AngularJS</b> (1.x)</td><td>Bản gốc 2010, viết bằng JavaScript</td><td>Đã hết hỗ trợ (cuối 2021). Đừng học mới.</td></tr>
<tr><td><b>Angular 2</b></td><td>Viết lại hoàn toàn, TypeScript, component</td><td>Không tương thích ngược với 1.x</td></tr>
<tr><td><b>Angular</b> (4, 5, … hiện nay)</td><td>Cùng một framework với Angular 2, ra bản lớn mỗi ~6 tháng</td><td>Nâng cấp giữa các bản lớn khá êm</td></tr>
</table></div>

<div class="box warn"><b>Phiên bản trong sách</b><p>Sách dùng <b>Angular 11.2.3</b>. Các khái niệm cốt lõi (component, DI, router, form, RxJS) vẫn đúng, nhưng cú pháp đã đổi khá nhiều. App này sẽ có hộp “Cập nhật hiện đại” ở những chỗ khác biệt.</p></div>

<div class="box modern"><b>🆕 Cập nhật hiện đại (Angular 17+)</b>
<p>Những thay đổi lớn bạn sẽ gặp khi đọc code mới:</p>
<ul>
<li><b>Standalone components</b> thay <code>NgModule</code>: component tự khai báo <code>imports</code> (từ v19 là mặc định).</li>
<li><b>Signals</b> (<code>signal()</code>, <code>computed()</code>, <code>effect()</code>) là cách quản lý state mới, nhẹ hơn nhiều so với suy nghĩ theo Zone.</li>
<li><b>Control flow mới</b> trong template: <code>@if</code>, <code>@for</code>, <code>@switch</code> thay <code>*ngIf</code>, <code>*ngFor</code>.</li>
<li><b>inject()</b> bên cạnh constructor injection; <b>input()/output()</b> dạng hàm; Vite/esbuild làm builder mặc định.</li>
</ul>
<p>Chúng ta vẫn học theo sách (kiến thức nền không đổi), rồi đối chiếu cách viết mới ở từng chương.</p></div>`
    },
    {
      id: 'setup', title: 'Chuẩn bị môi trường (khi tới chương 8)',
      html: `
<p>Các chương 2–6 chỉ cần trình duyệt: chạy code ngay trên trang này. Từ chương 8 bạn sẽ muốn chạy Angular thật. Chuẩn bị sớm cho khỏi bỡ ngỡ:</p>
<textarea class="code" data-lang="bash" data-title="Cài đặt một lần">
# 1) Cài Node.js LTS từ https://nodejs.org rồi kiểm tra
node -v
npm -v

# 2) Cài Angular CLI
npm install -g @angular/cli

# 3) Tạo project mới và chạy thử
ng new pony-racer
cd pony-racer
ng serve
# mở http://localhost:4200
</textarea>
<div class="box tip"><b>Trình soạn thảo</b><p>VS Code + extension <i>Angular Language Service</i> là bộ đôi phổ biến nhất: gợi ý code ngay trong template.</p></div>`
    }
  ],
  quiz: [
    { q: 'Vì sao sách dành nhiều chương đầu cho ES2015+ và TypeScript?', options: ['Để đủ số trang', 'Angular được thiết kế xoay quanh các tính năng đó (class, module, decorator…)', 'Vì Angular không dùng JavaScript'], answer: 1, why: 'Component, service, module trong Angular đều là class/module ES2015+ có thêm kiểu TypeScript.' },
    { q: 'AngularJS và Angular quan hệ thế nào?', options: ['Cùng một thứ, chỉ khác tên', 'Angular là bản viết lại hoàn toàn, không tương thích ngược với AngularJS 1.x', 'Angular chỉ là plugin của AngularJS'], answer: 1, why: 'Angular 2 là bản viết lại. Từ bản 2 trở đi, các bản lớn mới chỉ là tiến hoá, không viết lại.' },
    { q: 'Ứng dụng xuyên suốt của sách tên gì?', options: ['TodoMVC', 'PonyRacer', 'AngularShop'], answer: 1, why: 'PonyRacer – đặt cược đua pony, dùng component, form, router, HTTP, WebSocket.' },
    { q: 'Control flow nào là cú pháp mới của Angular hiện đại?', options: ['*ngIf', '@if', 'v-if'], answer: 1, why: '@if/@for/@switch ra mắt từ Angular 17, thay thế dần *ngIf/*ngFor.' }
  ],
  mount(root) {
    // --- bản đồ trình độ ---
    const advice = [
      'Đọc <b>tuần tự từ chương 2</b>. Dành thời gian cho chương 2–5, đây là nền móng. Cũng nên ôn HTML/CSS/DOM cơ bản.',
      'Bắt đầu ở <b>chương 2</b> (let/const, class, arrow function, Promise là thứ cần nhất), rồi sang TypeScript chương 3–5.',
      'Đọc lướt chương 2, tập trung <b>chương 3–5 (TypeScript)</b> rồi vào Angular từ chương 7.',
      'Đọc lướt 2–6, vào <b>chương 7</b> để nắm triết lý, chú ý chương 13 (RxJS) và 20 (Zone) vì khác hẳn thói quen cũ.'
    ];
    const out = root.querySelector('#lvlOut');
    root.querySelectorAll('#lvlBtns button').forEach(b => b.onclick = () => {
      root.querySelectorAll('#lvlBtns button').forEach(x => x.classList.remove('active'));
      out.innerHTML = '👉 ' + advice[+b.dataset.l];
    });

    // --- PonyRacer mini ---
    const ponies = ['Rainbow Dash', 'Pinkie Pie', 'Fluttershy', 'Applejack', 'Twilight'];
    const colors = ['#3aa0ff', '#ff6fb1', '#f6d84a', '#f39b3d', '#a77bff'];
    const pick = root.querySelector('#pr-pick'), track = root.querySelector('#pr-track');
    const go = root.querySelector('#pr-go'), msg = root.querySelector('#pr-msg');
    pick.innerHTML = ponies.map((p, i) => `<option value="${i}">${p}</option>`).join('');
    track.innerHTML = ponies.map((p, i) => `<div style="margin:6px 0"><small>${p}</small>
      <div class="timeline"><div class="bar" id="pr-bar${i}" style="left:0;width:48px;background:${colors[i]}">🐴</div></div></div>`).join('');
    let timer = null;
    go.onclick = () => {
      clearInterval(timer); msg.textContent = '';
      const pos = ponies.map(() => 0);
      const max = track.querySelector('.timeline').clientWidth - 48;
      timer = setInterval(() => {
        ponies.forEach((p, i) => { pos[i] += Math.random() * 14; root.querySelector('#pr-bar' + i).style.left = Math.min(pos[i], max) + 'px'; });
        const w = pos.findIndex(x => x >= max);
        if (w >= 0) {
          clearInterval(timer);
          msg.textContent = (w === +pick.value ? '🎉 Thắng cược! ' : '😢 Thua rồi. ') + ponies[w] + ' về nhất.';
        }
      }, 60);
    };
  }
});
