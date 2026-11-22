// Nạp biến môi trường từ file .env ở thư mục gốc (nếu có) - dùng tính năng sẵn có của Node >= 20.12
const path = require('path');
const { ROOT_DIR } = require('./paths');

try {
    process.loadEnvFile(path.join(ROOT_DIR, '.env'));
} catch (e) {
    // Không có file .env thì dùng giá trị mặc định / biến môi trường hệ thống
}

const SUPERADMIN_USERNAME = (process.env.SUPERADMIN_USERNAME || '').trim();
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || '';
const SUPERADMIN_PASSWORD_HASH = (process.env.SUPERADMIN_PASSWORD_HASH || '').trim();
const SUPERADMIN_ENABLED = !!(SUPERADMIN_USERNAME && (SUPERADMIN_PASSWORD || SUPERADMIN_PASSWORD_HASH));
if (!SUPERADMIN_ENABLED) {
    console.warn('Chưa cấu hình SUPERADMIN_USERNAME và SUPERADMIN_PASSWORD_HASH (hoặc SUPERADMIN_PASSWORD) trong file .env - đăng nhập Quản trị hệ thống đang TẮT.');
}

module.exports = {
    PORT: parseInt(process.env.PORT, 10) || 3000,
    SMTP_SERVICE: process.env.SMTP_SERVICE || 'gmail',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Bizmate Software',
    // Tài khoản Quản trị hệ thống (đăng nhập ở trang chủ với ô MST = SUPERADMIN_MST)
    SUPERADMIN_ENABLED,
    SUPERADMIN_MST: (process.env.SUPERADMIN_MST || 'admin').trim(),
    SUPERADMIN_USERNAME,
    SUPERADMIN_PASSWORD,
    SUPERADMIN_PASSWORD_HASH
};
