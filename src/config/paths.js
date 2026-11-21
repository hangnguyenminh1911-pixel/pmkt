// Đường dẫn dùng chung cho toàn bộ server (tính từ thư mục gốc dự án)
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

module.exports = {
    ROOT_DIR,
    PUBLIC_DIR: path.join(ROOT_DIR, 'public'),   // Giao diện: chỉ thư mục này được phát lên web
    DATA_DIR: path.join(ROOT_DIR, 'data'),       // Dữ liệu chạy thật (không commit lên git)
    SEED_DIR: path.join(ROOT_DIR, 'data-mau')    // Dữ liệu mẫu ban đầu (có trong git)
};
