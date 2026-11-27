const fs = require('fs');
const path = require('path');

const { DATA_DIR: CONFIG_DIR } = require('../config/paths');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

const DEFAULT_DATABASES = [
    { id: "db_2026", ten: "KETOAN_2026", ngayTao: "01/01/2026", cheDo: "TT152", dangLamViec: true }
];

function docFileJson(filename, defaultValue) {
    const filePath = path.join(CONFIG_DIR, filename);
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
            return defaultValue;
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

function ghiFileJson(filename, data) {
    const filePath = path.join(CONFIG_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        throw new Error(`Không thể ghi file cấu hình ${filename}: ${e.message}`);
    }
}

// Các hàm nghiệp vụ cấu hình
function layToanBoCauHinh() {
    const databases = docFileJson('databases.json', DEFAULT_DATABASES);
    return {
        dinhDang: docFileJson('setting_dinhdang.json', {}),
        doanhNghiep: docFileJson('setting_doanhnghiep.json', {}),
        ruiRo: docFileJson('setting_ruiro.json', {}),
        thaoTacNhanh: docFileJson('setting_thaotacnhanh.json', {}),
        databases: Array.isArray(databases) && databases.length > 0 ? databases : DEFAULT_DATABASES
    };
}

function layCheDoHienHanh() {
    const dbs = docFileJson('databases.json', DEFAULT_DATABASES);
    const activeDb = (Array.isArray(dbs) ? dbs : DEFAULT_DATABASES).find(db => db.dangLamViec) || DEFAULT_DATABASES[0];
    return {
        dbId: activeDb.id,
        tenDb: activeDb.ten,
        cheDo: activeDb.cheDo || 'TT152'
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

    if (!mapFile[loai]) {
        throw new Error("Loại cấu hình không hợp lệ!");
    }

    if (loai === 'databases' && (!Array.isArray(data) || data.length === 0)) {
        throw new Error("Danh sách cơ sở dữ liệu không được để trống!");
    }

    ghiFileJson(mapFile[loai], data);
    return { success: true, message: "Lưu cấu hình thành công!" };
}

module.exports = { layToanBoCauHinh, layCheDoHienHanh, luuCauHinh };