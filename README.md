# 🏥 MediCore – Hospital Management System

## 📌 1. Tên và Mô Tả

**MediCore** là một ứng dụng web toàn diện để quản lý các hoạt động của bệnh viện. Nó cung cấp giao diện thân thiện cho bác sĩ, bệnh nhân, nhân viên hành chính và quản trị viên để quản lý thông tin bệnh nhân, cuộc hẹn, hồ sơ y tế, chuyên khoa, và các tác vụ quản lý bệnh viện khác.

Ứng dụng được xây dựng với:

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + TailwindCSS
- **Xác thực**: JWT (Access Token & Refresh Token cookie-based)
- **Bảo mật**: Hash mật khẩu bcrypt, Role-based Access Control

---

## 🚀 2. Tính Năng Chính

✅ **Xác thực & Phân quyền**

- Đăng ký/đăng nhập với email + mật khẩu
- Xác thực JWT với access token + refresh token
- Phân quyền theo vai trò: Bệnh nhân, Bác sĩ, Admin

✅ **Quản lý hồ sơ y tế**

- Tạo, xem, cập nhật, xóa hồ sơ bệnh nhân
- Giới hạn truy cập dựa trên vai trò
- Lưu trữ dữ liệu y tế an toàn

✅ **Quản lý bác sĩ & khoa**

- Thêm/chỉnh sửa thông tin bác sĩ
- Quản lý các chuyên khoa
- Xem danh sách bệnh nhân (cho bác sĩ)

✅ **Quản lý lịch hẹn**

- Đặt lịch hẹn ngoại trú
- Xem/hủy lịch hẹn
- Thông báo tự động

✅ **Dashboard thống kê**

- Thống kê bệnh nhân mới
- Biểu đồ lịch hẹn hàng tháng
- Quản lý doanh thu (cho admin)

✅ **Giao diện người dùng hiện đại**

- Responsive design trên tất cả thiết bị
- Giao diện trực quan dễ sử dụng

---

## 🖼️ 3. Ảnh Demo

_Thêm ảnh demo tại đây_

| Tính năng                | Mô tả                                 |
| ------------------------ | ------------------------------------- |
| 📱 Giao diện Bệnh nhân   | Trang chủ, đặt hẹn, xem hồ sơ         |
| 👨‍⚕️ Dashboard Bác sĩ      | Quản lý bệnh nhân, hồ sơ y tế         |
| 👨‍💼 Bảng điều khiển Admin | Quản lý người dùng, bác sĩ, doanh thu |

---

## 📥 4. Hướng Dẫn Cài Đặt

### 4.1 Yêu cầu hệ thống

- **Node.js**: v18+
- **npm**: v9+
- **MongoDB**: v5+ (chạy local hoặc cloud Atlas)
- **Git**: để clone repository

### 4.2 Cài đặt Backend

```bash
# 1. Vào thư mục backend
cd backend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
cp .env.example .env

# 4. Cấu hình biến môi trường trong .env
```

**File `.env` mẫu:**

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medicore

# JWT
ACCESS_TOKEN_SECRET=your-super-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key

# Email (tùy chọn)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API URL
API_URL=http://localhost:3000
```

```bash
# 5. Chạy backend (development mode)
npm run dev

# hoặc chạy trên production
npm start
```

Backend sẽ chạy trên `http://localhost:3000`

### 4.3 Cài đặt Frontend

```bash
# 1. Vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev -- --host
```

Frontend sẽ chạy trên `http://localhost:5173`

### 4.4 Seed dữ liệu (tùy chọn)

```bash
cd backend

# Seed người dùng
node scripts/seedUsers.js

# Seed bác sĩ
node scripts/seedDoctors.js

# Seed chuyên khoa
node scripts/seedSpecialties.js
```

---

## 💡 5. Cách Sử Dụng

### 5.1 Đăng ký & Đăng nhập

1. Truy cập trang Home
2. Nhấp **"Đăng nhập"** → **"Đăng ký"**
3. Nhập email, mật khẩu, vai trò
4. Xác thực email (nếu có)

### 5.2 Cho Bệnh nhân

- **Trang chủ**: Xem danh sách bác sĩ, chuyên khoa
- **Đặt lịch hẹn**: Chọn bác sĩ → Ngày & giờ → Xác nhận
- **Hồ sơ y tế**: Xem lịch sử khẩu, đơn thuốc, kết quả
- **Thanh toán**: Thanh toán online qua các phương thức
- **Tư vấn trực tuyến**: Chat với bác sĩ

### 5.3 Cho Bác sĩ

- **Dashboard**: Xem thống kê bệnh nhân hôm nay
- **Danh sách bệnh nhân**: Xem toàn bộ bệnh nhân của mình
- **Tạo hồ sơ y tế**: Ghi chép, đơn thuốc, chẩn đoán
- **Quản lý lịch hẹn**: Xác nhận/hủy cuộc hẹn
- **Thông tin cá nhân**: Cập nhật bộ hồ sơ, ảnh đại diện

### 5.4 Cho Admin

- **Quản lý người dùng**: Thêm/xóa/cấm người dùng
- **Quản lý bác sĩ**: Thêm bác sĩ mới, chỉnh sửa thông tin
- **Quản lý chuyên khoa**: Tạo/sửa chuyên khoa
- **Báo cáo**: Xem doanh thu, thống kê hàng tháng

### 5.5 API Endpoints chính

| Phương thức | Route                | Mô tả               |
| ----------- | -------------------- | ------------------- |
| POST        | `/api/auth/Sign_up`  | Đăng ký tài khoản   |
| POST        | `/api/auth/Sign_in`  | Đăng nhập           |
| POST        | `/api/auth/Sign_out` | Đăng xuất           |
| GET         | `/api/medical`       | Lấy danh sách hồ sơ |
| POST        | `/api/medical`       | Tạo hồ sơ mới       |
| PUT         | `/api/medical/:id`   | Cập nhật hồ sơ      |
| DELETE      | `/api/medical/:id`   | Xóa hồ sơ           |
| GET         | `/api/doctors`       | Danh sách bác sĩ    |
| GET         | `/api/appointments`  | Danh sách lịch hẹn  |
| POST        | `/api/appointments`  | Đặt lịch hẹn        |

---

## 🛠️ 6. Công Nghệ Sử Dụng

### Backend

| Công nghệ         | Phiên bản | Mục đích                   |
| ----------------- | --------- | -------------------------- |
| **Node.js**       | 18+       | Runtime JavaScript         |
| **Express**       | 4.x       | Web framework              |
| **MongoDB**       | 5.x       | Database                   |
| **Mongoose**      | 7.x       | ODM (Object Data Modeling) |
| **JWT**           | -         | Xác thực & phân quyền      |
| **bcrypt**        | 5.x       | Hash mật khẩu              |
| **cookie-parser** | 1.x       | Quản lý cookies            |
| **dotenv**        | 16.x      | Quản lý biến môi trường    |
| **Nodemon**       | 3.x       | Auto-reload development    |

### Frontend

| Công nghệ        | Phiên bản | Mục đích             |
| ---------------- | --------- | -------------------- |
| **React**        | 18.x      | UI library           |
| **Vite**         | 4.x       | Build tool           |
| **TailwindCSS**  | 3.x       | CSS framework        |
| **Material-UI**  | 5.x       | UI component library |
| **Axios**        | 1.x       | HTTP client          |
| **React Router** | 6.x       | Routing              |

### Tools & Deployment

- **Git**: Version control
- **npm**: Package manager
- **Postman**: API testing

---

## 👨‍💻 7. Tác Giả

**Phát triển bởi**: [Tên của bạn / Tên nhóm]

📧 **Email**: your-email@example.com  
🌐 **Website**: https://your-website.com  
💼 **LinkedIn**: https://linkedin.com/in/your-profile

---

## 📝 Ghi chú phát triển

### Cấu trúc thư mục

```
MediCore/
├── backend/              # API Server
│   ├── config/          # Database & config
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/       # Auth & validation
│   ├── services/        # Email services
│   └── scripts/         # Seed data
├── frontend/            # React App
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   └── styles/      # CSS styles
│   └── public/          # Static assets
└── README.md            # Documentation
```

### Lệnh hữu ích

**Backend:**

```bash
npm run dev      # Development mode với hot reload
npm start        # Production mode
npm run lint     # Kiểm tra linting
```

**Frontend:**

```bash
npm run dev      # Development server
npm run build    # Build production
npm run preview  # Preview build
npm run lint     # Kiểm tra code quality
```

---

## 📋 License

Dự án này được cấp phép dưới MIT License - xem file `LICENSE` để chi tiết.

---

## 🎯 Roadmap tương lai

- [ ] Thanh toán online (Stripe, VNPay)
- [ ] Tư vấn trực tuyến (WebRTC)
- [ ] Mobile app (React Native)
- [ ] Đa ngôn ngữ (i18n)
- [ ] Dark mode
- [ ] Push notifications

---

**Cảm ơn bạn đã sử dụng MediCore! Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ.** 💪
