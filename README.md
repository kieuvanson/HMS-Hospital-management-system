# HSM Hospital Management System

He thong quan ly benh vien voi kien truc monorepo gom backend Node.js/Express/MongoDB va frontend React/Vite.

## Tong quan

Du an ho tro 3 nhom nguoi dung chinh:
- Patient: dat lich kham, xem thong tin ca nhan, theo doi cac trang nghiep vu.
- Doctor: quan ly lich hen, kham benh, cap nhat ho so va lich lam viec.
- Admin: dashboard quan tri, quan ly bac si va cac trang van hanh.

## Chuc nang da co

### 1. Xac thuc va phien dang nhap
- Dang ky tai khoan patient (`POST /api/auth/Sign_up`).
- Dang nhap, dang xuat (`POST /api/auth/Sign_in`, `POST /api/auth/Sign_out`).
- Refresh access token bang cookie refresh token (`POST /api/auth/refresh_token`).
- Hash mat khau voi bcrypt, JWT access token va luu refresh token theo session.

### 2. Quan ly nguoi dung va ho so ca nhan
- Lay thong tin profile nguoi dung dang nhap (`GET /api/user/profile`).
- Cap nhat profile + upload avatar (`PUT /api/user/profile`).
- Tu dong tach thu muc avatar theo role:
  - `uploads/patient/avatars`
  - `uploads/doctor/avatars`
- Backend expose static file avatar qua `GET /uploads/...`.

### 3. Quan ly bac si
- Admin tao tai khoan bac si (`POST /api/auth/admin/create-doctor`).
- Lay danh sach bac si, loc theo khoa/chuyen khoa:
  - `GET /api/doctor/all`
  - `GET /api/doctor/by-department`
  - `GET /api/doctor/by-specialty`
- Ho so bac si:
  - `GET /api/doctor/profile/current`
  - `GET /api/doctor/profile/:doctorId`
  - `POST /api/doctor/profile`
  - `PUT /api/doctor/profile`
  - `DELETE /api/doctor/profile`
- Bac si xem danh sach benh nhan cua minh (`GET /api/doctor/patients`).

### 4. Quan ly lich lam viec, nghi phep va luong bac si
- Lich lam viec:
  - `GET /api/doctor/work-schedule`
  - `PUT /api/doctor/work-schedule`
  - `GET /api/doctor/work-calendar`
- Nghi phep theo thang:
  - `GET /api/doctor/monthly-leaves`
  - `POST /api/doctor/monthly-leaves`
  - `DELETE /api/doctor/monthly-leaves/:leaveId`
- Tong quan luong:
  - `GET /api/doctor/salary-overview`
  - `GET /api/doctor/salary-overview-yearly`
  - `PUT /api/doctor/salary-account`

### 5. Thu tuc hanh chinh cho bac si
- Lay danh sach template don tu dong (`GET /api/doctor/administrative-templates`).
- Tao don, luu nhap, nop duyet va cap nhat don:
  - `GET /api/doctor/administrative-requests`
  - `POST /api/doctor/administrative-requests`
  - `PUT /api/doctor/administrative-requests/:requestId`
- Da co nhieu mau don noi bo (nghi phep, doi lich, de nghi thiet bi, cong tac, dao tao, ...).

### 6. Quan ly lich hen va quy trinh kham
- Patient dat lich kham (`POST /api/appointment/book`).
- Kiem tra slot trong theo ngay/bac si (`GET /api/appointment/available-slots`).
- Lay danh sach lich hen:
  - Patient: `GET /api/appointment/list`
  - Doctor: `GET /api/appointment/my-appointments`
  - Doctor xem lich hen theo benh nhan: `GET /api/appointment/patient/:patientId`
  - Chi tiet lich hen: `GET /api/appointment/:id`
- Bac si cap nhat trang thai/huy lich:
  - `PUT /api/appointment/:id`
  - `DELETE /api/appointment/:id`
- Module kham benh (doctor):
  - `GET /api/appointment/examinations/today`
  - `PUT /api/appointment/:id/start`
  - `PUT /api/appointment/:id/complete`
  - `GET /api/appointment/:id/detail`
  - `PUT /api/appointment/:id/medical-record`

### 7. Ho so y te
- Tao ho so y te (`POST /api/medical/records`) - role doctor.
- Xem danh sach ho so theo role (`GET /api/medical/records`) - filter tu dong theo middleware.
- Benh nhan xem ho so cua minh (`GET /api/medical/records/patient`).
- Cap nhat/xoa ho so:
  - `PUT /api/medical/records/:recordId`
  - `DELETE /api/medical/records/:recordId`

### 8. Khoa va chuyen khoa
- CRUD khoa phong (`/api/department`).
- Lay danh sach chuyen khoa cong khai (`GET /api/specialty`).

### 9. Email
- Gui email xac nhan lich hen sau khi dat thanh cong.
- Co ham gui nhac lich hen trong `backend/services/emailService.js`.

## Frontend hien co

### Patient
- Auth (dang nhap, dang ky).
- Trang home benh nhan (banner, article suc khoe, CTA dat lich).
- Dat lich kham voi form day du thong tin va lay slot trong.
- Trang profile benh nhan (cap nhat thong tin + avatar).
- Co san cac trang: visits, results, prescriptions, payments, notifications, telemedicine, reviews, articles, examinations.

### Doctor
- Dashboard bac si.
- Quan ly lich hen (table + lich tuan + loc trang thai).
- Danh sach benh nhan va xem lich su lich hen theo benh nhan.
- Trang kham benh (bat dau/hoan thanh kham, nhap chi so, chan doan, don thuoc, ghi chu, tai kham).
- Tao ho so benh nhan moi.
- Cap nhat profile bac si.
- Dang ky lich lam viec, nghi phep va theo doi luong.
- Thu tuc hanh chinh (tao/luu nhap/nop don).

### Admin
- Admin dashboard (UI thong ke tong quan).
- Quan ly bac si (tao tai khoan bac si va xem danh sach).
- Co route cho Admin Nurses, Admin Expenses, User Management (mot so trang dang o muc phat trien giao dien/noi dung mau).

## Cong nghe su dung

### Backend
- Node.js, Express, MongoDB, Mongoose
- JWT, bcrypt, cookie-parser, cors, multer, nodemailer

### Frontend
- React, React Router, Vite, TailwindCSS
- Axios, React Toastify, Lucide React, ApexCharts

## Cau truc thu muc

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  scripts/
  services/
  uploads/
frontend/
  src/
    components/
    pages/
    routes/
    services/
README.md
```

## Cai dat va chay du an

### 1. Backend

```bash
cd backend
npm install
```

Tao file `.env` (vi du):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hsm_hospital
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Chay backend:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh: `http://localhost:5173`

## Scripts huu ich

### Backend
- `npm run dev`: chay backend voi nodemon.
- `npm start`: chay backend production.
- `npm run seed:medications`: seed danh sach thuoc.
- `npm run seed:medications:large`: seed danh sach thuoc so luong lon.

### Frontend
- `npm run dev`: chay local.
- `npm run build`: build production.
- `npm run preview`: preview ban build.
- `npm run lint`: kiem tra eslint.

## Trang thai tinh nang

- Da hoat dong thuc te: auth, profile/avatar, doctor scheduling, appointment flow, examination flow, medical records, administrative forms, doctor creation by admin, department/specialty APIs.
- Dang trong qua trinh hoan thien (chu yeu frontend/noi dung): mot so trang admin (`AdminNurses`, `AdminExpenses`, `UserManagement`) va mot so trang patient mo rong (payments, telemedicine, reviews...).

## Ghi chu

- Du an dang su dung endpoint backend tai `http://localhost:5000` trong frontend services.
- Nen dong bo CORS origin trong `backend/server.js` theo cong frontend thuc te khi deploy.

## Deploy Vercel + Railway

Neu frontend deploy tren Vercel va backend deploy tren Railway, can set dung bien moi truong o ca 2 ben:

### Frontend (Vercel)

Tao bien moi truong:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

Luu y: `VITE_API_URL` phai co `/api` o cuoi de khop voi router backend.

### Backend (Railway)

Tao bien moi truong:

```env
FRONTEND_URL=https://your-frontend.vercel.app,https://your-custom-domain.com
FRONTEND_URL_REGEX=^https:\/\/.*\.vercel\.app$
```

Giai thich:
- `FRONTEND_URL`: danh sach origin cho phep (tach boi dau phay).
- `FRONTEND_URL_REGEX`: regex cho phep preview domain tren Vercel (neu ban dung preview deployments).

Sau khi cap nhat bien moi truong, can redeploy ca frontend va backend.
