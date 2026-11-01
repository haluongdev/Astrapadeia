# Scholyx V3 – Khắc phục nền trắng

## Nguyên nhân xác nhận
`src/index.css` bản V2 chỉ khai báo Tailwind và các kiểu chữ bài học.
Các class tự định nghĩa `cosmic-card`, `cosmic-glass`, `cosmic-grid`,
`font-space`, `animate-fadeIn`, `box-lift`, `interactive-bounce`,
`animated-cosmic-gradient` được sử dụng trong component nhưng thiếu CSS.
Vì vậy trình duyệt hiển thị nền mặc định sáng và thẻ trong suốt.

## Đã thay đổi
- Thêm định nghĩa theme tối và các utility tự định nghĩa vào `src/index.css`.
- Đặt `lang=vi`, `class=dark`, tên và mô tả đúng Scholyx trong `index.html`.
- Thay `__dirname` bằng `fileURLToPath(new URL('.', import.meta.url))` trong `vite.config.ts`.
- Cập nhật `esbuild` để tương thích Vite 8 và khai báo `canvas-confetti` cùng types.

## Chạy trên Windows PowerShell
`npm.cmd install --include=dev`
`npm.cmd run dev`
`npm.cmd run build`

Nếu thay đổi thủ công vào bản V2 đang cài đặt, có thể giữ `node_modules` và package-lock.json,
sau đó chạy `npm.cmd install` để đồng bộ dependency.

## Kiểm thử
Đã xác nhận lỗi thiếu CSS bằng rà soát toàn bộ mã nguồn.
Không thể hoàn tất npm install/build trong môi trường kiểm tra vì cache npm
không có `@google/genai`; chưa xác nhận render trên trình duyệt thực.
Giữ nguyên các component React và luồng màn hình của V2.
