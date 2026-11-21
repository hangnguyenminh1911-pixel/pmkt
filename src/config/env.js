// Nạp biến môi trường từ file .env ở thư mục gốc (nếu có) - dùng tính năng sẵn có của Node >= 20.12
const path = require('path');
const { ROOT_DIR } = require('./paths');

try {
    process.loadEnvFile(path.join(ROOT_DIR, '.env'));
} catch (e) {
    // Không có file .env thì dùng giá trị mặc định / biến môi trường hệ thống
}

module.exports = {
    PORT: parseInt(process.env.PORT, 10) || 3000,
    SMTP_SERVICE: process.env.SMTP_SERVICE || 'gmail',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Bizmate Software'
};
