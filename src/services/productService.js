const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../config/paths');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function docDanhSachHangHoa() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
        const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Lỗi đọc file products.json:", e);
        return [];
    }
}

function ghiDanhSachHangHoa(data) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function chuanHoaSo(val, fallback = 0) {
    if (val === undefined || val === null || val === '') return fallback;
    const num = parseFloat(String(val).replace(/,/g, ''));
    return Number.isNaN(num) ? fallback : num;
}

function layDanhSachHangHoa() {
    return docDanhSachHangHoa();
}

function themHangHoa(payload = {}) {
    const { ma, ten, tinhChat, tkKho, dvt, ton, giaVon, giaBan, donViChuyenDoi } = payload;

    if (!ma || !ten || !String(ma).trim() || !String(ten).trim()) {
        throw new Error("Vui lòng nhập đầy đủ Mã và Tên hàng hóa!");
    }

    const danhSach = docDanhSachHangHoa();
    const maUpper = String(ma).trim().toUpperCase();

    if (danhSach.some(h => String(h.ma || '').toUpperCase() === maUpper)) {
        throw new Error(`Mã hàng hóa [${maUpper}] đã tồn tại trên hệ thống!`);
    }

    danhSach.push({
        ma: maUpper,
        ten: String(ten).trim(),
        tinhChat: tinhChat || "hanghoa",
        tkKho: tkKho || "156",
        dvt: String(dvt || "Cái").trim() || "Cái",
        ton: chuanHoaSo(ton, 0),
        giaVon: chuanHoaSo(giaVon, 0),
        giaBan: chuanHoaSo(giaBan, 0),
        donViChuyenDoi: Array.isArray(donViChuyenDoi) ? donViChuyenDoi : []
    });

    ghiDanhSachHangHoa(danhSach);
    return { success: true, message: "Thêm vật tư, hàng hóa thành công!" };
}

function capNhatHangHoa(payload = {}) {
    const { ma, ten, tinhChat, tkKho, dvt, ton, giaVon, giaBan, donViChuyenDoi } = payload;
    if (!ma || !String(ma).trim()) {
        throw new Error("Thiếu mã hàng hóa cần cập nhật!");
    }

    const danhSach = docDanhSachHangHoa();
    const maUpper = String(ma).trim().toUpperCase();
    const index = danhSach.findIndex(h => String(h.ma || '').toUpperCase() === maUpper);

    if (index === -1) {
        throw new Error("Không tìm thấy hàng hóa cần cập nhật!");
    }

    danhSach[index] = {
        ...danhSach[index],
        ten: ten !== undefined && String(ten).trim() ? String(ten).trim() : danhSach[index].ten,
        tinhChat: tinhChat || danhSach[index].tinhChat || "hanghoa",
        tkKho: tkKho || danhSach[index].tkKho || "156",
        dvt: dvt !== undefined && String(dvt).trim() ? String(dvt).trim() : (danhSach[index].dvt || "Cái"),
        ton: chuanHoaSo(ton, danhSach[index].ton ?? 0),
        giaVon: chuanHoaSo(giaVon, danhSach[index].giaVon ?? 0),
        giaBan: chuanHoaSo(giaBan, danhSach[index].giaBan ?? 0),
        donViChuyenDoi: Array.isArray(donViChuyenDoi) ? donViChuyenDoi : (danhSach[index].donViChuyenDoi || [])
    };

    ghiDanhSachHangHoa(danhSach);
    return { success: true, message: "Cập nhật hàng hóa thành công!" };
}

function xoaHangHoa(maHang) {
    if (!maHang || !String(maHang).trim()) {
        throw new Error("Thiếu mã hàng cần xóa!");
    }

    const danhSach = docDanhSachHangHoa();
    const maUpper = String(maHang).trim().toUpperCase();
    const danhSachMoi = danhSach.filter(h => String(h.ma || '').toUpperCase() !== maUpper);

    if (danhSach.length === danhSachMoi.length) {
        throw new Error("Không tìm thấy mã hàng cần xóa!");
    }

    ghiDanhSachHangHoa(danhSachMoi);
    return { success: true, message: `Đã xóa thành công hàng hóa [${maUpper}]!` };
}

function xoaNhieuHangHoa(danhSachMa) {
    if (!Array.isArray(danhSachMa) || danhSachMa.length === 0) {
        throw new Error("Danh sách mã hàng xóa không hợp lệ!");
    }

    const danhSach = docDanhSachHangHoa();
    const setXoa = new Set(danhSachMa.map(m => String(m || '').trim().toUpperCase()).filter(Boolean));
    const danhSachMoi = danhSach.filter(h => !setXoa.has(String(h.ma || '').toUpperCase()));
    const soDaXoa = danhSach.length - danhSachMoi.length;

    ghiDanhSachHangHoa(danhSachMoi);
    return { success: true, message: `Đã xóa thành công ${soDaXoa} mặt hàng!` };
}

function importHangHoa(duLieuExcel = []) {
    if (!Array.isArray(duLieuExcel)) {
        throw new Error("Dữ liệu nhập khẩu không hợp lệ!");
    }

    const danhSach = docDanhSachHangHoa();
    let count = 0;

    duLieuExcel.forEach(item => {
        if (!item || !item.ma || !item.hopLe) return;
        const maUpper = String(item.ma).trim().toUpperCase();
        const existingIndex = danhSach.findIndex(h => String(h.ma || '').toUpperCase() === maUpper);

        const chuanHoaItem = {
            ma: maUpper,
            ten: item.ten ? String(item.ten).trim() : (existingIndex !== -1 ? danhSach[existingIndex].ten : maUpper),
            tinhChat: item.tinhChat || (existingIndex !== -1 ? danhSach[existingIndex].tinhChat : "hanghoa"),
            tkKho: item.tkKho || (existingIndex !== -1 ? danhSach[existingIndex].tkKho : "156"),
            dvt: item.dvt ? String(item.dvt).trim() : (existingIndex !== -1 ? danhSach[existingIndex].dvt : "Cái"),
            ton: chuanHoaSo(item.ton, existingIndex !== -1 ? danhSach[existingIndex].ton : 0),
            giaVon: chuanHoaSo(item.giaVon, existingIndex !== -1 ? danhSach[existingIndex].giaVon : 0),
            giaBan: chuanHoaSo(item.giaBan, existingIndex !== -1 ? danhSach[existingIndex].giaBan : 0),
            donViChuyenDoi: Array.isArray(item.donViChuyenDoi)
                ? item.donViChuyenDoi
                : (existingIndex !== -1 ? (danhSach[existingIndex].donViChuyenDoi || []) : [])
        };

        if (existingIndex !== -1) {
            danhSach[existingIndex] = { ...danhSach[existingIndex], ...chuanHoaItem };
        } else {
            danhSach.push(chuanHoaItem);
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