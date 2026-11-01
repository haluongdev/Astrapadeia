# Scholyx frontend – hướng dẫn tiếp tục phát triển

## Mục tiêu
Giữ nguyên giao diện cosmic của remix-app; hoàn thiện điều hướng và cấu trúc frontend hiện có, chưa tạo backend thực.

## Những phần đã tổ chức
- `src/routes/screenRegistry.ts`: nguồn sự thật cho 30 ID màn hình, URL và quyền truy cập.
- `src/routes/navigation.ts`: hàm chuyển đổi URL/hash và nhóm liên kết theo vai trò, dành cho việc sử dụng lại.
- `src/context/AppContext.tsx`: state và điều hướng demo; tự đồng bộ với hash trình duyệt.
- `src/components/common/RichLessonContent.tsx`: Markdown + LaTeX an toàn cho nội dung bài học.
- `src/components/LearningModule.tsx`: giữ chính xác ID bài học khi chuyển trang, render Markdown/công thức.
- `src/data/mockData.ts`: dữ liệu demo hiện có (không phải API thật).

## Luồng điều hướng mong muốn
Khách: Home → Login/Register → OTP → Onboarding → Overview.
Học sinh: Home/Overview → Lessons → Lesson detail → Practice → Result; Exam catalog → Exam room → Exam result; AI; Progress → Roadmap; Profile/VIP.
QTND: CMS Lessons → Questions → Matrix → Grading → RAG → Feedback.
QTV: Admin Overview → Roles → Config/Audit.
Mọi truy cập được kiểm tra theo `canAccessScreen` ở lớp frontend **chỉ dành cho demo**; backend tương lai bắt buộc kiểm tra lại quyền.

## Chạy và kiểm tra
```sh
npm install
npm run audit:screens
npm run audit:architecture
npm run lint
npm run build
npm run dev
```
Kiểm tra thủ công back/forward của trình duyệt, F5 ở từng route, chuyển vai trò và các tương tác bài học/thi thử.
Chỉ công nhận tính năng hoàn tất khi đã kiểm thử trực tiếp, không chỉ dựa vào nhãn `Hoàn thành` trong registry.

## Khi xây dựng backend
Tách `AppContext` thành các service theo domain: auth, content, practice, exam, progress, AI, CMS và admin;
API layer trả kiểu dữ liệu trong `src/types/index.ts`. Không gửi đáp án thi chưa nộp, khóa API,
hoặc kiểm tra quyền VIP chỉ bằng frontend; tất cả phải được kiểm tra trên máy chủ.

## Giới hạn bản bàn giao
Chưa có kiểm thử E2E trình duyệt. Chưa xác minh được build nếu thiếu kết nối npm.
Dữ liệu, đăng nhập và quyền truy cập vẫn là mô phỏng, chưa có tính bảo mật sản xuất.
