// Khởi tạo thư mục data/ khi chạy lần đầu:
// - Tạo data/ nếu chưa có
// - Chép các file mẫu từ data-mau/ sang data/ NẾU file đó chưa tồn tại
//   (không bao giờ ghi đè dữ liệu thật đang có trong data/)
const fs = require('fs');
const path = require('path');
const { DATA_DIR, SEED_DIR } = require('../config/paths');

function khoiTaoDuLieu() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SEED_DIR)) return [];

    const daChep = [];
    for (const ten of fs.readdirSync(SEED_DIR)) {
        if (!ten.endsWith('.json')) continue;
        const dich = path.join(DATA_DIR, ten);
        if (!fs.existsSync(dich)) {
            fs.copyFileSync(path.join(SEED_DIR, ten), dich);
            daChep.push(ten);
        }
    }
    if (daChep.length > 0) {
        console.log(`Khởi tạo dữ liệu mẫu vào data/: ${daChep.join(', ')}`);
    }
    return daChep;
}

module.exports = { khoiTaoDuLieu };
