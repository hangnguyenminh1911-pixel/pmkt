const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config/paths');

const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

// Hàm đọc danh sách đối tượng
function docDanhSachDoiTuong() {
    try {
        if (!fs.existsSync(CUSTOMERS_FILE)) {
            fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
        return JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf-8') || '[]');
    } catch (e) {
        console.error("Lỗi đọc file customers.json:", e);
        return [];
    }
}

// Hàm ghi danh sách đối tượng
function ghiDanhSachDoiTuong(data) {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. Lấy toàn bộ danh sách đối tượng
function layDanhSachDoiTuong() {
    return docDanhSachDoiTuong();
}

// 2. Thêm mới đối tượng
function themDoiTuong(payload) {
    const { ma, ten, mst, diaChi, phanLoai, loaiHinh, maCQHNS, dienThoai, nguoiLienHe, email, soTKNH, nganHang } = payload;

    if (!ma || !ten) {
        throw new Error("Vui lòng nhập đầy đủ Mã và Tên đối tượng!");
    }

    let danhSach = docDanhSachDoiTuong();
    const maUpper = ma.trim().toUpperCase();

    if (danhSach.find(d => d.ma.toUpperCase() === maUpper)) {
        throw new Error(`Mã đối tượng [${maUpper}] đã tồn tại trên hệ thống!`);
    }

    danhSach.push({
        ma: maUpper,
        ten: ten.trim(),
        mst: (mst || "").trim(),
        diaChi: (diaChi || "").trim(),
        phanLoai: phanLoai || "Khách hàng",
        loaiHinh: loaiHinh || "to_chuc",
        maCQHNS: (maCQHNS || "").trim(),
        dienThoai: (dienThoai || "").trim(),
        nguoiLienHe: (nguoiLienHe || "").trim(),
        email: (email || "").trim(),
        soTKNH: (soTKNH || "").trim(),
        nganHang: (nganHang || "").trim()
    });

    ghiDanhSachDoiTuong(danhSach);
    return { success: true, message: "Thêm đối tượng thành công!" };
}

// 3. Cập nhật đối tượng
function capNhatDoiTuong(payload) {
    const { ma, ten, mst, diaChi, phanLoai, loaiHinh, maCQHNS, dienThoai, nguoiLienHe, email, soTKNH, nganHang } = payload;
    let danhSach = docDanhSachDoiTuong();
    const index = danhSach.findIndex(d => d.ma.toUpperCase() === ma.toUpperCase());

    if (index === -1) {
        throw new Error("Không tìm thấy thông tin đối tượng cần cập nhật!");
    }

    danhSach[index] = {
        ...danhSach[index],
        ten: ten ? ten.trim() : danhSach[index].ten,
        mst: mst !== undefined ? mst.trim() : danhSach[index].mst,
        diaChi: diaChi !== undefined ? diaChi.trim() : danhSach[index].diaChi,
        phanLoai: phanLoai || danhSach[index].phanLoai,
        loaiHinh: loaiHinh || danhSach[index].loaiHinh,
        maCQHNS: maCQHNS !== undefined ? maCQHNS.trim() : danhSach[index].maCQHNS,
        dienThoai: dienThoai !== undefined ? dienThoai.trim() : danhSach[index].dienThoai,
        nguoiLienHe: nguoiLienHe !== undefined ? nguoiLienHe.trim() : danhSach[index].nguoiLienHe,
        email: email !== undefined ? email.trim() : danhSach[index].email,
        soTKNH: soTKNH !== undefined ? soTKNH.trim() : danhSach[index].soTKNH,
        nganHang: nganHang !== undefined ? nganHang.trim() : danhSach[index].nganHang
    };

    ghiDanhSachDoiTuong(danhSach);
    return { success: true, message: "Cập nhật thông tin đối tượng thành công!" };
}

// 4. Xóa đối tượng
function xoaDoiTuong(maDT) {
    let danhSach = docDanhSachDoiTuong();
    const danhSachMoi = danhSach.filter(d => d.ma.toUpperCase() !== maDT.toUpperCase());

    if (danhSach.length === danhSachMoi.length) {
        throw new Error("Không tìm thấy đối tượng cần xóa!");
    }

    ghiDanhSachDoiTuong(danhSachMoi);
    return { success: true, message: `Đã xóa thành công đối tượng [${maDT}]!` };
}

// 5. Xóa hàng loạt đối tượng
function xoaNhieuDoiTuong(danhSachMa) {
    let danhSach = docDanhSachDoiTuong();
    const setXoa = new Set(danhSachMa.map(m => m.toUpperCase()));

    const danhSachMoi = danhSach.filter(d => !setXoa.has(d.ma.toUpperCase()));
    ghiDanhSachDoiTuong(danhSachMoi);

    return { success: true, message: `Đã xóa thành công ${danhSach.length - danhSachMoi.length} đối tượng!` };
}

// 6. Nhập khẩu Excel đối tượng hàng loạt
function importDoiTuong(duLieuExcel) {
    let danhSach = docDanhSachDoiTuong();
    let count = 0;

    duLieuExcel.forEach(item => {
        if (!item.ma || !item.hopLe) return;
        const maUpper = item.ma.trim().toUpperCase();

        const existingIndex = danhSach.findIndex(d => d.ma.toUpperCase() === maUpper);
        if (existingIndex !== -1) {
            danhSach[existingIndex] = { ...danhSach[existingIndex], ...item };
        } else {
            danhSach.push(item);
        }
        count++;
    });

    ghiDanhSachDoiTuong(danhSach);
    return { success: true, message: `Đã nhập khẩu thành công ${count} đối tượng vào hệ thống!` };
}

module.exports = {
    docDanhSachDoiTuong,
    layDanhSachDoiTuong,
    themDoiTuong,
    capNhatDoiTuong,
    xoaDoiTuong,
    xoaNhieuDoiTuong,
    importDoiTuong
};