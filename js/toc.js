/* Mục lục theo sách "Become a Ninja with Angular" (Ninja Squad).
   `file: true` = chương đã được làm. */
window.TOC = [
  { group: 'Nền tảng (các chương khái niệm)' },
  { n: 1,  title: 'Giới thiệu', desc: 'Bản đồ học tập và app PonyRacer', file: true },
  { n: 2,  title: 'ECMAScript 2015+', desc: 'let, destructuring, class, Promise, async/await, module', file: true },
  { n: 3,  title: 'Vượt xa ES2015+', desc: 'Kiểu tĩnh, TypeScript, DI qua ví dụ', file: true },
  { n: 4,  title: 'Đào sâu TypeScript', desc: 'Types, enum, interface, class, decorator', file: true },
  { n: 5,  title: 'TypeScript nâng cao', desc: 'readonly, keyof, mapped type, union', file: true },
  { n: 6,  title: 'Web Components', desc: 'Custom element, Shadow DOM, template' },
  { group: 'Bắt đầu với Angular' },
  { n: 7,  title: 'Triết lý của Angular', desc: 'Component, kiến trúc tổng quan' },
  { n: 8,  title: 'Từ số 0 đến có gì đó', desc: 'CLI, cấu trúc project, component đầu tiên' },
  { n: 9,  title: 'Cú pháp template', desc: 'Binding, event, *ngIf, *ngFor' },
  { n: 10, title: 'Dependency Injection', desc: 'Provider, injector phân cấp', file: true },
  { n: 11, title: 'Service', desc: 'Title, Meta, tự viết service', file: true },
  { n: 12, title: 'Pipe', desc: 'json, slice, date, async, pipe tự viết' },
  { n: 13, title: 'Lập trình phản ứng', desc: 'Observable và RxJS' },
  { group: 'Xây dựng ứng dụng' },
  { n: 14, title: 'Component & Directive', desc: 'Input, Output, directive tự viết' },
  { n: 15, title: 'Style & encapsulation', desc: 'Shadow DOM, Emulated, None' },
  { n: 16, title: 'Kiểm thử', desc: 'Unit test, fake dependency, e2e' },
  { n: 17, title: 'HTTP', desc: 'Gọi API, interceptor' },
  { n: 18, title: 'Router', desc: 'Route, guard, resolver, lazy loading' },
  { n: 19, title: 'Form', desc: 'Template-driven, reactive, validator' },
  { group: 'Chủ đề nâng cao' },
  { n: 20, title: 'Zone & phép màu Angular', desc: 'Change detection' },
  { n: 21, title: 'Biên dịch JIT vs AOT', desc: '' },
  { n: 22, title: 'Observable nâng cao', desc: 'Operator, tự tạo Observable' },
  { n: 23, title: 'Component nâng cao', desc: 'ViewChild, ng-content, HostListener' },
  { n: 24, title: 'Đa ngôn ngữ (i18n)', desc: '' },
  { n: 25, title: 'Hiệu năng', desc: 'Tải lần đầu, runtime, profiling' },
  { n: 26, title: 'Đưa lên production', desc: 'Environment, build, server' },
  { n: 27, title: 'Kết thúc', desc: 'Tổng kết hành trình' }
];
window.CHAPTER_DATA = {};
window.registerChapter = function (n, data) { window.CHAPTER_DATA[n] = data; };
