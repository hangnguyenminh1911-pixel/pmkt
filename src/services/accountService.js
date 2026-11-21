const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config/paths');

const bankFile = path.join(DATA_DIR, 'bankAccounts.json');
const chartFile = path.join(DATA_DIR, 'chartOfAccounts.json');

// --- Quản lý Tài khoản Ngân hàng ---
function layDanhSachNganHang() {
    if (!fs.existsSync(bankFile)) return [];
    const data = fs.readFileSync(bankFile, 'utf8');
    return JSON.parse(data || '[]');
}

function themTaiKhoanNganHang(newItem) {
    const list = layDanhSachNganHang();
    if (list.some(item => item.stk === newItem.stk)) {
        return { success: false, message: "Số tài khoản ngân hàng này đã tồn tại!" };
    }
    list.push(newItem);
    fs.writeFileSync(bankFile, JSON.stringify(list, null, 4), 'utf8');
    return { success: true, message: "Thêm tài khoản ngân hàng thành công!" };
}

function xoaTaiKhoanNganHang(stk) {
    let list = layDanhSachNganHang();
    const initialLength = list.length;
    list = list.filter(item => item.stk !== stk);
    if (list.length === initialLength) {
        return { success: false, message: "Không tìm thấy số tài khoản cần xóa!" };
    }
    fs.writeFileSync(bankFile, JSON.stringify(list, null, 4), 'utf8');
    return { success: true, message: "Xóa tài khoản ngân hàng thành công!" };
}
// Thêm hàm cập nhật tài khoản ngân hàng
function suaTaiKhoanNganHang(updatedItem) {
    let list = layDanhSachNganHang();
    const index = list.findIndex(item => item.stk === updatedItem.stk);
    if (index === -1) {
        return { success: false, message: "Không tìm thấy số tài khoản cần sửa!" };
    }
    list[index] = updatedItem;
    fs.writeFileSync(bankFile, JSON.stringify(list, null, 4), 'utf8');
    return { success: true, message: "Cập nhật tài khoản ngân hàng thành công!" };
}

// --- Quản lý Hệ thống Tài khoản Kế toán ---
function layHeThongTaiKhoan() {
    if (!fs.existsSync(chartFile)) return [];
    const data = fs.readFileSync(chartFile, 'utf8');
    return JSON.parse(data || '[]');
}

module.exports = {
    layDanhSachNganHang,
    themTaiKhoanNganHang,
    suaTaiKhoanNganHang,
    xoaTaiKhoanNganHang,
    layHeThongTaiKhoan
};