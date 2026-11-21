// Cấu hình gửi email dùng chung (đọc tài khoản từ file .env, KHÔNG ghi mật khẩu vào mã nguồn)
const nodemailer = require('nodemailer');
const env = require('./env');

if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('Chưa cấu hình SMTP_USER / SMTP_PASS trong file .env - chức năng gửi email sẽ báo lỗi.');
}

const transporter = nodemailer.createTransport({
    service: env.SMTP_SERVICE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
});

const MAIL_FROM = `"${env.MAIL_FROM_NAME}" <${env.SMTP_USER}>`;

module.exports = { transporter, MAIL_FROM };
