# Scholyx Giai đoạn 3 — backend nền tảng (chưa sẵn sàng production)

Bản bổ sung này **không thay thế** luồng mock đang dùng trong frontend. Thư mục backend cung cấp các endpoint ban đầu để phát triển có kiểm soát.

## Chạy local
1. Cài Node.js và PostgreSQL; tạo DB trống `scholyx`.
2. Sao chép `backend/.env.example` thành `backend/.env`; chỉnh `DATABASE_URL`.
3. Chạy SQL `backend/sql/001_auth.sql` vào PostgreSQL, ví dụ `psql -d scholyx -f backend/sql/001_auth.sql`.
4. `cd backend && npm install && npm run dev`.
5. Frontend đặt `VITE_API_BASE_URL=http://localhost:4000` nếu dùng adapter `src/services/authApi.ts`.

## Đã có mã nền tảng
- Đăng ký email, mật khẩu Argon2id, điều khoản/chính sách + phiên bản + thời điểm.
- Tạo tài khoản pending; mã OTP 6 số băm SHA-256, hết hạn 10 phút, 5 lần thử.
- Kích hoạt, đăng nhập, khóa tạm 15 phút sau 5 lần sai.
- Cookie HttpOnly, Secure tại production, SameSite Lax; phiên rỗi 30 phút.
- Hồ sơ cơ bản, yêu cầu xóa, danh sách tài khoản và audit (chỉ QTV), guard vai trò phía máy chủ.

## CHƯA hoàn thiện — KHÔNG triển khai công khai
- Email/SMS provider: OTP hiện chỉ in ra console **khi development**; production chưa gửi OTP.
- Đăng ký SĐT, khôi phục/đổi mật khẩu, xác minh định danh mới.
- CSRF protection đầy đủ, session ngoại lệ khi thi, session rotation, refresh/revoke tất cả thiết bị.
- RBAC theo quyền chi tiết, vai trò tùy chỉnh, ràng buộc QTV cuối cùng.
- Admin CRUD/khóa/gỡ khóa, audit filter/CSV, thông số cấu hình thực.
- Gói VIP/PRE, gateway có ký callback, đối soát, hoàn tiền, báo cáo.
- Kiểm tra đầu vào sâu, test tích hợp PostgreSQL và kiểm toán an ninh.

**Không dùng localStorage để lưu mật khẩu, OTP, token hoặc dữ liệu cá nhân thật.**
Giữ nguyên giao diện V3 để phát triển theo từng module và thay các hàm mock trong `AppContext.tsx` dần bằng API.
