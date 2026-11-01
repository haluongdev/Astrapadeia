# SCHOLYX — BẢN CHỈNH SỬA FRONTEND GỐC

## Những thay đổi đã thực hiện
- Giữ nguyên React + TypeScript + Vite, giao diện vũ trụ, CSS và toàn bộ component gốc.
- Khi đổi vai trò demo, tự chuyển tới màn hình phù hợp: Khách → home; Học sinh → overview-free; QTND → cms-lessons; QTV → admin-overview.
- Xóa `screenParams` của trang cũ khi điều hướng không có tham số và khi dùng hash navigation.
- Thêm `npm run audit:screens` để đối chiếu 30 ID, đường dẫn duy nhất và nhánh render tại `App.tsx`.
- Đổi tên package thành `scholyx-frontend`.

## Kết quả kiểm tra
- `npm run audit:screens`: PASS — 30 màn hình đăng ký, ID/đường dẫn không trùng, 30 nhánh render có mặt.
- Chưa kiểm chứng được TypeScript build/Preview trong môi trường hiện tại: thiếu `node_modules`; `npm install --offline` thất bại vì npm cache thiếu dependency `@google/genai`. Do đó KHÔNG thể khẳng định các luồng đã chạy đúng thực tế.

## Chạy trên máy cá nhân
Yêu cầu Node.js tương thích Vite 8.
```bash
npm install
npm run audit:screens
npm run lint
npm run build
npm run dev
```
Mở http://localhost:3000.

## Hạng mục cần tiếp tục trước khi coi là bản hoàn thiện
1. Kiểm thử thủ công toàn bộ đường đi, nút và form của 30 màn hình theo 4 vai trò.
2. Chạy TypeScript và production build sau khi cài dependencies.
3. Kiểm tra giao diện ở 360px, tablet và desktop, đối chiếu bộ ảnh thiết kế.
4. Rà soát luyện tập/thi thử (đếm giờ, nộp bài, kết quả), AI mô phỏng, lưu dữ liệu.
5. Chưa tích hợp backend, bảo mật xác thực thật, chấm điểm phía máy chủ, RAG hoặc thanh toán. Các hành vi phía trình duyệt chỉ phục vụ bản demo.
