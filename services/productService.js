const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../data');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Hàm đọc danh sách hàng hóa
function docDanhSachHangHoa() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
        return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8') || '[]');
    } catch (e) {
        console.error("Lỗi đọc file products.json:", e);
        return [];
    }
}

// Hàm ghi danh sách hàng hóa
function ghiDanhSachHangHoa(data) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 1. Lấy toàn bộ danh mục hàng hóa
function layDanhSachHangHoa() {
    return docDanhSachHangHoa();
}

// 2. Thêm mới hàng hóa
function themHangHoa(payload) {
    const { ma, ten, tinhChat, tkKho, dvt, ton, giaVon, giaBan, donViChuyenDoi } = payload;
    
    if (!ma || !ten) {
        throw new Error("Vui lòng nhập đầy đủ Mã và Tên hàng hóa!");
    }

    let danhSach = docDanhSachHangHoa();
    const maUpper = ma.trim().toUpperCase();

    // Kiểm tra trùng mã
    if (danhSach.find(h => h.ma.toUpperCase() === maUpper)) {
        throw new Error(`Mã hàng hóa [${maUpper}] đã tồn tại trên hệ thống!`);
    }

    danhSach.push({
        ma: maUpper,
        ten: ten.trim(),
        tinhChat: tinhChat || "hanghoa",
        tkKho: tkKho || "156",
        dvt: (dvt || "Cái").trim(),
        ton: parseFloat(ton) || 0,
        giaVon: parseFloat(giaVon) || 0,
        giaBan: parseFloat(giaBan) || 0,
        donViChuyenDoi: donViChuyenDoi || []
    });

    ghiDanhSachHangHoa(danhSach);
    return { success: true, message: "Thêm vật tư, hàng hóa thành công!" };
}

// 3. Cập nhật hàng hóa
function capNhatHangHoa(payload) {
    const { ma, ten, tinhChat, tkKho, dvt, ton, giaVon, giaBan, donViChuyenDoi } = payload;
    let danhSach = docDanhSachHangHoa();
    const index = danhSach.findIndex(h => h.ma.toUpperCase() === ma.toUpperCase());

    if (index === -1) {
        throw new Error("Không tìm thấy hàng hóa cần cập nhật!");
    }

    danhSach[index] = {
        ...danhSach[index],
        ten: ten ? ten.trim() : danhSach[index].ten,
        tinhChat: tinhChat || danhSach[index].tinhChat,
        tkKho: tkKho || danhSach[index].tkKho,
        dvt: dvt ? dvt.trim() : danhSach[index].dvt,
        ton: ton !== undefined ? parseFloat(ton) : danhSach[index].ton,
        giaVon: giaVon !== undefined ? parseFloat(giaVon) : danhSach[index].giaVon,
        giaBan: giaBan !== undefined ? parseFloat(giaBan) : danhSach[index].giaBan,
        donViChuyenDoi: donViChuyenDoi || danhSach[index].donViChuyenDoi
    };

    ghiDanhSachHangHoa(danhSach);
    return { success: true, message: "Cập nhật hàng hóa thành công!" };
}

// 4. Xóa một hàng hóa
function xoaHangHoa(maHang) {
    let danhSach = docDanhSachHangHoa();
    const danhSachMoi = danhSach.filter(h => h.ma.toUpperCase() !== maHang.toUpperCase());

    if (danhSach.length === danhSachMoi.length) {
        throw new Error("Không tìm thấy mã hàng cần xóa!");
    }

    ghiDanhSachHangHoa(danhSachMoi);
    return { success: true, message: `Đã xóa thành công hàng hóa [${maHang}]!` };
}

// 5. Xóa hàng loạt hàng hóa
function xoaNhieuHangHoa(danhSachMa) {
    let danhSach = docDanhSachHangHoa();
    const setXoa = new Set(danhSachMa.map(m => m.toUpperCase()));
    
    const danhSachMoi = danhSach.filter(h => !setXoa.has(h.ma.toUpperCase()));
    ghiDanhSachHangHoa(danhSachMoi);

    return { success: true, message: `Đã xóa thành công ${danhSach.length - danhSachMoi.length} mặt hàng!` };
}

// 6. Nhập khẩu Excel hàng loạt
function importHangHoa(duLieuExcel) {
    let danhSach = docDanhSachHangHoa();
    let count = 0;

    duLieuExcel.forEach(item => {
        if (!item.ma || !item.hopLe) return;
        const maUpper = item.ma.trim().toUpperCase();
        
        const existingIndex = danhSach.findIndex(h => h.ma.toUpperCase() === maUpper);
        if (existingIndex !== -1) {
            // Cập nhật nếu đã có
            danhSach[existingIndex] = { ...danhSach[existingIndex], ...item };
        } else {
            // Thêm mới nếu chưa có
            danhSach.push(item);
        }
        count++;
    });

    ghiDanhSachHangHoa(danhSach);
    return { success: true, message: `Đã nhập khẩu thành công ${count} mặt hàng vào hệ thống!` };
}

module.exports = {
    docDanhSachHangHoa,
    layDanhSachHangHoa,
    themHangHoa,
    capNhatHangHoa,
    xoaHangHoa,
    xoaNhieuHangHoa,
    importHangHoa
};