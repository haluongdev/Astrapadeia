# Báo cáo rà soát Giai đoạn 3 — Scholyx

## Bản gốc
- Frontend React + Vite, state tập trung tại `src/context/AppContext.tsx` (~63 KB).
- Form đăng ký `AuthRegisterScreen.tsx`: email, họ tên, lớp, mật khẩu và đồng ý chính sách; chưa có backend.
- `AuthOtpScreen.tsx`, `AuthLoginScreen.tsx`, `AuthForgotPasswordScreen.tsx`: mô phỏng.
- `SystemAdminModule.tsx`: quản trị tài khoản, audit, giao dịch hiển thị từ dữ liệu mẫu/state.
- `src/routes/screenRegistry.ts`: mapping màn hình; giao diện và điều hướng giữ nguyên.
- Hệ thống chưa có CSDL bền vững, API xác thực hay RBAC máy chủ.
- Dữ liệu mẫu/demo không đáp ứng nghiệm thu thật với OTP, phiên và audit.

## Các hạng mục cần chỉnh cho từng chức năng
| Hạng mục | Ưu tiên | Vị trí giao diện | Backend/API |
|---|---|---|---|
| Đăng ký/OTP | P0 | AuthRegisterScreen, AuthOtpScreen | accounts, one_time_codes, `/api/auth/register`, `/activate` |
| Đăng nhập/phiên | P0 | AuthLoginScreen, AppContext | sessions, `/api/auth/login`, `/me`, `/logout` |
| Quên/đổi mật khẩu | P0 | AuthForgotPasswordScreen, Profile | token khôi phục, revoke phiên |
| Hồ sơ/mục tiêu | P1 | UserProfileModal, OnboardingScreen | student_profiles, deletion_requests |
| Quản trị tài khoản | P1 | SystemAdminModule | `/api/admin/accounts` và admin mutation cần RBAC |
| Vai trò/quyền | P0 | SystemAdminModule | roles, permissions, role_permissions và middleware |
| Audit/config | P1 | SystemAdminModule | audit_logs append-only, config table |
| PRE/VIP | P2 | VIPPaymentModal, SystemAdminModule | packages, transactions, verified payment webhook |

## Đã bổ sung trong gói này
1. `backend/sql/001_auth.sql` — mô hình PostgreSQL bước đầu.
2. `backend/src/server.js` — API mẫu đăng ký, OTP, đăng nhập/đăng xuất, hồ sơ, một số truy vấn admin.
3. `src/services/authApi.ts` — lớp gọi API có type, dùng cookie credentials.
4. `backend/README.md` — hướng dẫn và những điểm **chưa an toàn để production**.

## Ranh giới hiện trạng
Các màn hình mock **chưa tự động chuyển sang backend**; thiết kế gốc và luồng demo còn nguyên. Không tuyên bố Giai đoạn 3 đã nghiệm thu.
Cần hoàn thiện các hạng mục chưa có, kiểm thử tích hợp và review quyền riêng tư/bảo mật trước khi sử dụng dữ liệu học sinh thật.
