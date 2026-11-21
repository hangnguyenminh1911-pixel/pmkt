const fs = require('fs');
const path = require('path');

const { DATA_DIR: CONFIG_DIR } = require('../config/paths');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function docFileJson(filename, defaultValue) {
    const filePath = path.join(CONFIG_DIR, filename);
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
            return defaultValue;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8') || JSON.stringify(defaultValue));
    } catch (e) {
        return defaultValue;
    }
}

function ghiFileJson(filename, data) {
    const filePath = path.join(CONFIG_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Các hàm nghiệp vụ cấu hình
function layToanBoCauHinh() {
    return {
        dinhDang: docFileJson('setting_dinhdang.json', {}),
        doanhNghiep: docFileJson('setting_doanhnghiep.json', {}),
        ruiRo: docFileJson('setting_ruiro.json', {}),
        thaoTacNhanh: docFileJson('setting_thaotacnhanh.json', {}),
        databases: docFileJson('databases.json', [
            { id: "db_2026", ten: "KETOAN_2026", ngayTao: "01/01/2026", cheDo: "TT152", dangLamViec: true }
        ])
    };
}

function luuCauHinh(loai, data) {
    const mapFile = {
        dinhDang: 'setting_dinhdang.json',
        doanhNghiep: 'setting_doanhnghiep.json',
        ruiRo: 'setting_ruiro.json',
        thaoTacNhanh: 'setting_thaotacnhanh.json',
        databases: 'databases.json'
    };

    if (mapFile[loai]) {
        ghiFileJson(mapFile[loai], data);
        return { success: true, message: "Lưu cấu hình thành công!" };
    }
    throw new Error("Loại cấu hình không hợp lệ!");
}

module.exports = { layToanBoCauHinh, luuCauHinh };