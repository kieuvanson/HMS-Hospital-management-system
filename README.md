# HMS – Hospital Management System

Ứng dụng quản lý bệnh viện gồm backend Node.js/Express + MongoDB và frontend React/Vite. Hỗ trợ xác thực JWT, lưu refresh token qua cookie, và CRUD hồ sơ y tế cho bác sĩ/admin.

## Kiến trúc & công nghệ
- Backend: Node.js, Express, Mongoose, JWT, bcrypt, cookie-parser, dotenv.
- Frontend: React 18, Vite, MUI, TailwindCSS, Axios.
- CSDL: MongoDB (kết nối qua `MONGODB_URI`).
- Triển khai dev: backend chạy trên `PORT` (mặc định 3000), frontend trỏ tới `http://localhost:3000/api` (xem `frontend/src/services/api.js`).

## Cấu trúc thư mục
- `backend/`: API, middleware, models, routes, utils.
- `frontend/`: mã nguồn React (components/pages/services).
- `package.json` (root): meta; dependency chính nằm trong từng ứng dụng con.

## Thiết lập nhanh (local)
1) Yêu cầu: Node.js 18+ và MongoDB đang chạy.
2) Backend  
   ```bash
   cd backend
   cp .env.example .env   # nếu chưa có file, tạo mới theo mẫu dưới
   npm install
   npm run dev            # dùng nodemon, hoặc npm start để chạy thường
   ```
   Mẫu `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hms
   ACCESS_TOKEN_SECRET=your-strong-secret
   NODE_ENV=development
   ```
3) Frontend  
   ```bash
   cd frontend
   npm install
   npm run dev -- --host
   ```
   Giao diện sẽ chạy trên cổng do Vite cấp (thường 5173); API mặc định gọi `http://localhost:3000/api`.

## Tính năng chính
- Đăng ký / đăng nhập bằng email + mật khẩu, hash mật khẩu bằng bcrypt.
- Sinh access token (15 phút) và refresh token lưu ở cookie (`withCredentials` bật sẵn trong Axios).
- Quản lý hồ sơ y tế: tạo, đọc, cập nhật, xóa; giới hạn truy cập theo vai trò (bác sĩ chỉ xem hồ sơ của mình, admin xem tất cả).
- Giao diện bác sĩ: bảng bệnh nhân, thống kê, form đăng nhập/đăng ký.

## API chính (tham khảo nhanh)
- `POST /api/auth/Sign_up` — đăng ký.
- `POST /api/auth/Sign_in` — đăng nhập, trả access token và set refresh token cookie.
- `POST /api/auth/Sign_out` — đăng xuất, thu hồi refresh token.
- `GET /api/medical` — lấy danh sách hồ sơ (theo quyền).
- `POST /api/medical` — tạo hồ sơ mới.
- `GET /api/medical/:id` — xem chi tiết.
- `PUT /api/medical/:id` — cập nhật.
- `DELETE /api/medical/:id` — xóa.

## Phát triển & lưu ý
- Kiểm tra lại `ACCESS_TOKEN_SECRET` đủ mạnh trước khi deploy.
- Trong production bật HTTPS để bảo vệ cookie `refreshToken`.
- Nếu cần thay API URL cho frontend, sửa hằng `API_URL` trong `frontend/src/services/api.js`.

## Scripts hữu ích
- Backend: `npm run dev` (hot reload), `npm start`.
- Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.