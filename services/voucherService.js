const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../data');
// Đảm bảo tệp vouchers.json nằm trong thư mục data hoặc thư mục gốc tùy theo cấu trúc của bạn
const VOUCHERS_FILE = path.join(DATA_DIR, 'vouchers.json'); 

// Hàm đọc danh sách chứng từ
function docDanhSachChungTu() {
    try {
        if (!fs.existsSync(VOUCHERS_FILE)) {
            fs.writeFileSync(VOUCHERS_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
        return JSON.parse(fs.readFileSync(VOUCHERS_FILE, 'utf-8') || '[]');
    } catch (e) {
        console.error("Lỗi đọc file vouchers.json:", e);
        return [];
    }
}

// Hàm ghi danh sách chứng từ
function ghiDanhSachChungTu(data) {
    fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. Lấy toàn bộ danh sách chứng từ
function layDanhSachChungTu() {
    return docDanhSachChungTu();
}

// 2. Lưu hoặc Cập nhật chứng từ (Phiếu bán hàng)
function luuChungTu(payload) {
    const { soChungTu, ngayChungTu, maDoiTuong, doiTuong, diaChi, dienGiai, ckHd, chiTiet, tongThanhToan, loaiChungTu, nguoiNopNhan } = payload;

    if (!soChungTu || !ngayChungTu || !chiTiet || chiTiet.length === 0) {
        throw new Error("Thiếu thông tin bắt buộc của chứng từ!");
    }

    let danhSach = docDanhSachChungTu();
    const soCTChuan = soChungTu.trim().toUpperCase();

    // Kiểm tra xem chứng từ đã tồn tại chưa (để phân biệt Thêm mới hay Sửa)
    const index = danhSach.findIndex(item => (item.soChungTu || "").trim().toUpperCase() === soCTChuan);

    const chungTuMoi = {
        soChungTu: soCTChuan,
        ngayChungTu,
        maDoiTuong: maDoiTuong || "",
        doiTuong: doiTuong || "",
        diaChi: diaChi || "",
        dienGiai: dienGiai || "",
        ckHd: ckHd || "",
        chiTiet: chiTiet || [],
        tongThanhToan: tongThanhToan || "0 đ",
        ngayCapNhat: new Date().toISOString()
    };

    // Phiếu thu (PT), phiếu chi (PC), phiếu mua hàng (PN): lưu thêm loại chứng từ và người nộp/nhận.
    // Phiếu bán hàng không gửi loaiChungTu nên dữ liệu lưu giữ nguyên như cũ.
    if (loaiChungTu) {
        chungTuMoi.loaiChungTu = String(loaiChungTu).trim().toUpperCase();
        chungTuMoi.nguoiNopNhan = nguoiNopNhan || "";
    }

    if (index !== -1) {
        // Cập nhật (Sửa phiếu cũ)
        danhSach[index] = chungTuMoi;
    } else {
        // Thêm mới phiếu
        danhSach.push(chungTuMoi);
    }

    ghiDanhSachChungTu(danhSach);
    return { success: true, message: `Lưu thành công chứng từ số: ${soCTChuan}` };
}

// 3. Xóa một chứng từ theo số chứng từ
function xoaChungTu(soChungTu) {
    let danhSach = docDanhSachChungTu();
    const soCTChuan = decodeURIComponent(soChungTu).trim().toUpperCase();

    const danhSachMoi = danhSach.filter(item => (item.soChungTu || "").trim().toUpperCase() !== soCTChuan);

    if (danhSach.length === danhSachMoi.length) {
        throw new Error(`Không tìm thấy chứng từ số [${soCTChuan}] để xóa!`);
    }

    ghiDanhSachChungTu(danhSachMoi);
    return { success: true, message: `Đã xóa thành công chứng từ ${soCTChuan}!` };
}

module.exports = {
    layDanhSachChungTu,
    luuChungTu,
    xoaChungTu
};