const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('../config/paths');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function docSoDuFile(filename) {
    const filePath = path.join(DATA_DIR, filename);
    try {
        if (!fs.existsSync(filePath)) return {};
        return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');
    } catch (e) {
        return {};
    }
}

function ghiSoDuFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function layTatCaSoDu() {
    return {
        tonKho: docSoDuFile('sodu_tonkho.json'),
        congNo: docSoDuFile('sodu_congno.json'),
        tien: docSoDuFile('sodu_tien.json')
    };
}

function luuSoDu(loai, data) {
    const mapFile = {
        kho: 'sodu_tonkho.json',
        congno: 'sodu_congno.json',
        tien: 'sodu_tien.json'
    };

    if (mapFile[loai]) {
        ghiSoDuFile(mapFile[loai], data);
        return { success: true, message: "Lưu số dư thành công!" };
    }
    throw new Error("Loại số dư không hợp lệ!");
}

module.exports = { layTatCaSoDu, luuSoDu };