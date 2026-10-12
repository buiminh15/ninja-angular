# Ninja Angular – học qua ví dụ

Web app học theo sách *Become a Ninja with Angular* (Ninja Squad). HTML/CSS/JS thuần, không cần build.

**Chạy:** mở `index.html` bằng trình duyệt.

## Cấu trúc
- `js/toc.js` – mục lục 27 chương (`file: true` = đã làm)
- `js/app.js` – router, tô màu code, chạy code, quiz, tiến độ
- `js/chapters/chNN.js` – nội dung mỗi chương (`registerChapter(n, {...})`)

## Viết chương mới
- `<textarea class="code" data-lang="ts|js|html|bash">` – code chỉ đọc
- `<textarea class="live">` – code sửa và chạy được (`data-time` để in mốc thời gian)
- `mount(root)` – gắn widget tương tác; `quiz` – mảng câu hỏi
