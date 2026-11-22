# Phần mềm kế toán (Node.js + Express)

## Cấu trúc thư mục

```
pmkt/
├── server.js            # Điểm khởi động server (Express)
├── package.json         # Thư viện & lệnh chạy (npm start)
├── .env.example         # Mẫu cấu hình (PORT, tài khoản gửi email) -> chép thành .env
├── public/              # MỌI THỨ TRÌNH DUYỆT TẢI VỀ (chỉ thư mục này được phát lên web)
│   ├── index.html       #   Đăng nhập
│   ├── register.html    #   Đăng ký
│   ├── setup.html       #   Tạo dữ liệu kế toán
│   ├── admin.html       #   Quản trị
│   ├── dashboard.html   #   Khung màn hình chính (menu + chỗ đặt các phần bên dưới)
│   ├── views/           #   Mỗi màn hình (view-*) một file HTML
│   ├── modals/          #   Mỗi cửa sổ (modal) một file HTML
│   ├── css/             #   dashboard.css, in-phieu.css
│   └── js/              #   loader.js nạp views/ + modals/ rồi nạp các file nghiệp vụ:
│                        #   core, banhang, thuchi-muahang, danhmuc-doituong,
│                        #   danhmuc-vthh, import-excel, in-phieu, settings, sodu,
│                        #   accountManager
├── src/                 # Mã nguồn phía server
│   ├── config/          #   paths.js (đường dẫn), env.js (đọc .env), mail.js (gửi email)
│   ├── routes/          #   apiRouter, authRouter, adminRouter
│   ├── services/        #   Đọc/ghi dữ liệu từng nghiệp vụ
│   └── utils/           #   khoiTaoDuLieu.js (tạo data/ từ dữ liệu mẫu)
├── data-mau/            # Dữ liệu mẫu ban đầu (có trong git)
└── data/                # Dữ liệu chạy thật (KHÔNG commit - đã có trong .gitignore)
```

## Cài đặt và chạy

```bash
npm install          # cài thư viện (lần đầu hoặc sau khi đổi nhánh)
copy .env.example .env   # Windows (Linux/macOS: cp .env.example .env) rồi điền SMTP_*, SUPERADMIN_*
npm start            # chạy server
```

Mở trình duyệt: http://localhost:3000 (đăng nhập) hoặc http://localhost:3000/dashboard.html

## Dữ liệu

- Khi khởi động, nếu `data/` chưa có file nào thì server tự chép từ `data-mau/` sang.
  File đã có trong `data/` **không bao giờ bị ghi đè**.
- Tài khoản mẫu trong `data-mau/users.json`: MST `0200123456`, tên đăng nhập `admin`, mật khẩu `Demo@123`.
- Mật khẩu người dùng được lưu dạng mã hóa bcrypt. Mật khẩu cũ dạng chữ thường tự được mã hóa khi khởi động (mật khẩu đăng nhập không đổi).
- Tài khoản Quản trị hệ thống cấu hình trong `.env` (`SUPERADMIN_MST`, `SUPERADMIN_USERNAME`, `SUPERADMIN_PASSWORD_HASH`); chưa cấu hình thì bị tắt.
- Sao lưu dữ liệu: chép cả thư mục `data/` ra nơi khác.
- Người dùng ngoài không tải được `data/`, `src/`, `server.js` qua trình duyệt nữa:
  server chỉ phát thư mục `public/`.

## Thêm màn hình / cửa sổ mới trong dashboard

1. Tạo file `public/views/<ten>.html` (hoặc `public/modals/<ten>.html`) — chỉ HTML, không `<script>`.
2. Đặt `<div data-partial="views/<ten>.html"></div>` vào đúng vị trí trong `dashboard.html`.
3. Mã JS cần chạy khi trang mở: dùng `khiGiaoDienSanSang(() => { ... })` thay cho
   `DOMContentLoaded` (các phần HTML được nạp sau sự kiện này). File JS mới thì thêm
   vào danh sách `DANH_SACH_JS` trong `public/js/loader.js`.
