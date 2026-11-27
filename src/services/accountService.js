const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config/paths');
const { layCheDoHienHanh } = require('./settingService');

const bankFile = path.join(DATA_DIR, 'bankAccounts.json');
const defaultChartFile = path.join(DATA_DIR, 'chartOfAccounts.json');

const CHE_DO_HOP_LE = ['TT152', 'TT88', 'TT133', 'TT99'];

function docJsonAnToan(filePath, fallback = []) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const raw = fs.readFileSync(filePath, 'utf8');
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.error(`Lỗi đọc file JSON (${filePath}):`, e.message);
        return fallback;
    }
}

function ghiJsonAnToan(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

// --- Quản lý Tài khoản Ngân hàng ---
function layDanhSachNganHang() {
    const list = docJsonAnToan(bankFile, []);
    return Array.isArray(list) ? list : [];
}

function themTaiKhoanNganHang(newItem) {
    const list = layDanhSachNganHang();
    if (list.some(item => item.stk === newItem.stk)) {
        return { success: false, message: "Số tài khoản ngân hàng này đã tồn tại!" };
    }
    list.push(newItem);
    ghiJsonAnToan(bankFile, list);
    return { success: true, message: "Thêm tài khoản ngân hàng thành công!" };
}

function xoaTaiKhoanNganHang(stk) {
    const list = layDanhSachNganHang();
    const filtered = list.filter(item => item.stk !== stk);
    if (filtered.length === list.length) {
        return { success: false, message: "Không tìm thấy số tài khoản cần xóa!" };
    }
    ghiJsonAnToan(bankFile, filtered);
    return { success: true, message: "Xóa tài khoản ngân hàng thành công!" };
}

function suaTaiKhoanNganHang(updatedItem) {
    const list = layDanhSachNganHang();
    const index = list.findIndex(item => item.stk === updatedItem.stk);
    if (index === -1) {
        return { success: false, message: "Không tìm thấy số tài khoản cần sửa!" };
    }
    list[index] = updatedItem;
    ghiJsonAnToan(bankFile, list);
    return { success: true, message: "Cập nhật tài khoản ngân hàng thành công!" };
}

// --- Quản lý Hệ thống Tài khoản Kế toán theo chế độ (TT152, TT88, TT133, TT99) ---
function layHeThongTaiKhoan(cheDoTruyenVao) {
    const cheDoHienTai = CHE_DO_HOP_LE.includes(cheDoTruyenVao)
        ? cheDoTruyenVao
        : layCheDoHienHanh().cheDo;

    const fileTheoCheDo = path.join(DATA_DIR, `chartOfAccounts_${cheDoHienTai}.json`);
    if (fs.existsSync(fileTheoCheDo)) {
        const list = docJsonAnToan(fileTheoCheDo, []);
        return Array.isArray(list) ? list : [];
    }

    const listMacDinh = docJsonAnToan(defaultChartFile, []);
    if (!Array.isArray(listMacDinh)) return [];

    // Nếu chartOfAccounts.json có gắn trường cheDo (hoặc mảng cheDo), lọc theo chế độ hiện tại;
    // nếu bản ghi không khai báo chế độ thì trả về toàn bộ danh sách mặc định để tương thích ngược.
    const coGanCheDo = listMacDinh.some(tk => tk.cheDo || Array.isArray(tk.cheDos));
    if (!coGanCheDo) return listMacDinh;

    return listMacDinh.filter(tk =>
        tk.cheDo === cheDoHienTai ||
        (Array.isArray(tk.cheDos) && tk.cheDos.includes(cheDoHienTai))
    );
}

module.exports = {
    layDanhSachNganHang,
    themTaiKhoanNganHang,
    suaTaiKhoanNganHang,
    xoaTaiKhoanNganHang,
    layHeThongTaiKhoan
};