const express = require('express');
const path = require('path');
const fs = require('fs');
const { PORT } = require('./src/config/env'); // nạp .env trước tiên
const { PUBLIC_DIR, DATA_DIR } = require('./src/config/paths');
const { khoiTaoDuLieu } = require('./src/utils/khoiTaoDuLieu');
const app = express();

// Tạo data/ và chép dữ liệu mẫu (data-mau/) cho các file còn thiếu - không ghi đè dữ liệu thật
khoiTaoDuLieu();

// Chứng từ dùng chung kho data/vouchers.json; khách hàng & hàng hóa dùng data/ (cùng file với src/services)
const DATA_FILE = path.join(DATA_DIR, 'vouchers.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Chỉ phát thư mục public/ lên web (không lộ data/, src/, server.js, package.json...)
app.use(express.static(PUBLIC_DIR));

// --- TÍCH HỢP PHÂN HỆ AUTH ROUTER (Mục 3) ---
const authRouter = require('./src/routes/authRouter');
const apiRouter = require('./src/routes/apiRouter');
app.use(authRouter);
app.use(apiRouter);

// --- TÍCH HỢP ADMINROUTER ---
const adminRouter = require('./src/routes/adminRouter'); // Đường dẫn đến file router trên
app.use(adminRouter);

// --- 1. XỬ LÝ CHỨNG TỪ (data.json) ---
function docDuLieuTuFile() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
    } catch (e) { return []; }
}
function ghiDuLieuVaoFile(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Lỗi ghi data.json:", e);
    }
}
let danhSachChungTu = docDuLieuTuFile();

// --- 2. XỬ LÝ KHÁCH HÀNG (customers.json) ---
function docDanhSachKH() {
    try {
        if (!fs.existsSync(CUSTOMERS_FILE)) {
            const initKH = [
                { ma: "KH001", ten: "Công ty TNHH Thực phẩm Sạch Miền Bắc", mst: "0102030405", diaChi: "Hải Phòng", phanLoai: "Khách hàng" },
                { ma: "NCC001", ten: "Công ty CP Chế biến Hải sản Hải Phòng", mst: "0203040506", diaChi: "Hải Phòng", phanLoai: "Nhà cung cấp" }
            ];
            fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(initKH, null, 2));
            return initKH;
        }
        return JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf-8') || '[]');
    } catch (e) { return []; }
}
function ghiDanhSachKH(data) {
    try {
        fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Lỗi ghi customers.json:", e);
    }
}

// --- 3. XỬ LÝ HÀNG HÓA (products.json) ---
function docDanhSachHH() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            const initHH = [
                { ma: "SP001", ten: "Tôm viên JJ SCC 500g", dvt: "Túi", ton: 25, giaBan: 60000, giaVon: 45000, tinhChat: "hanghoa", tkKho: "156" },
                { ma: "SP002", ten: "Bò viên JJ SCC 500g", dvt: "Túi", ton: 18, giaBan: 65000, giaVon: 48000, tinhChat: "hanghoa", tkKho: "156" },
                { ma: "HHC01", ten: "Hàng hóa A", dvt: "Cái", ton: 10, giaBan: 300000, giaVon: 200000, tinhChat: "hanghoa", tkKho: "156" },
                { ma: "HHC02", ten: "Hàng hóa B", dvt: "Cái", ton: 10, giaBan: 300000, giaVon: 200000, tinhChat: "hanghoa", tkKho: "156" }
            ];
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initHH, null, 2));
            return initHH;
        }
        return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8') || '[]');
    } catch (e) { return []; }
}
function ghiDanhSachHH(data) {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Lỗi ghi products.json:", e);
    }
}

// --- API KHÁCH HÀNG ---
app.get('/api/danh-sach-doi-tuong', (req, res) => res.json({ success: true, data: docDanhSachKH() }));
app.post('/api/them-doi-tuong', (req, res) => {
    const newDT = req.body;
    if (!newDT || !newDT.ma || !newDT.ten) {
        return res.status(400).json({ success: false, message: "Mã và Tên đối tượng là bắt buộc!" });
    }
    let list = docDanhSachKH();
    if (list.some(i => i.ma === newDT.ma)) {
        return res.status(400).json({ success: false, message: "Mã đối tượng đã tồn tại!" });
    }
    list.push(newDT);
    ghiDanhSachKH(list);
    res.json({ success: true, message: "Thêm thành công!", data: list });
});

// --- API HÀNG HÓA ---
app.get('/api/danh-sach-hang-hoa', (req, res) => res.json({ success: true, data: docDanhSachHH() }));
app.post('/api/them-hang-hoa', (req, res) => {
    const newHH = req.body;
    if (!newHH || !newHH.ma || !newHH.ten) {
        return res.status(400).json({ success: false, message: "Mã và Tên hàng hóa là bắt buộc!" });
    }
    let list = docDanhSachHH();
    if (list.some(i => i.ma === newHH.ma)) {
        return res.status(400).json({ success: false, message: "Mã hàng đã tồn tại!" });
    }
    list.push(newHH);
    ghiDanhSachHH(list);
    res.json({ success: true, message: "Thêm hàng hóa thành công!", data: list });
});

// --- API CHỨNG TỪ BÁN HÀNG ---
app.get('/api/danh-sach-chung-tu', (req, res) => {
    danhSachChungTu = docDuLieuTuFile();
    res.json({ success: true, data: danhSachChungTu });
});
app.post('/api/luu-chung-tu', (req, res) => {
    const duLieu = req.body;
    if (!duLieu || !duLieu.soChungTu) {
        return res.status(400).json({ success: false, message: "Thiếu số chứng từ!" });
    }
    const viTri = danhSachChungTu.findIndex(item => item.soChungTu === duLieu.soChungTu);
    if (viTri !== -1) {
        danhSachChungTu[viTri] = duLieu;
    } else {
        danhSachChungTu.push(duLieu);
    }
    ghiDuLieuVaoFile(danhSachChungTu);
    res.json({ success: true, message: "Lưu chứng từ thành công!" });
});
app.delete('/api/xoa-chung-tu/:soChungTu', (req, res) => {
    const soCT = req.params.soChungTu;
    danhSachChungTu = danhSachChungTu.filter(i => i.soChungTu !== soCT);
    ghiDuLieuVaoFile(danhSachChungTu);
    res.json({ success: true, message: `Đã xóa chứng từ ${soCT}!` });
});

// API Cập nhật/Sửa thông tin hàng hóa
app.post('/api/cap-nhat-hang-hoa', (req, res) => {
    const updatedHH = req.body;
    if (!updatedHH || !updatedHH.ma) {
        return res.status(400).json({ success: false, message: "Thiếu mã hàng hóa cần sửa!" });
    }
    let list = docDanhSachHH();
    const index = list.findIndex(i => i.ma === updatedHH.ma);
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hàng hóa để sửa!" });
    }
    list[index] = { ...list[index], ...updatedHH };
    ghiDanhSachHH(list);
    res.json({ success: true, message: "Cập nhật hàng hóa thành công!", data: list });
});

// API Cập nhật/Sửa thông tin đối tượng (Khách hàng / NCC)
app.post('/api/cap-nhat-doi-tuong', (req, res) => {
    const updatedDT = req.body;
    if (!updatedDT || !updatedDT.ma) {
        return res.status(400).json({ success: false, message: "Thiếu mã đối tượng cần sửa!" });
    }
    let list = docDanhSachKH();
    const index = list.findIndex(i => i.ma === updatedDT.ma);
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đối tượng để sửa!" });
    }
    list[index] = { ...list[index], ...updatedDT };
    ghiDanhSachKH(list);
    res.json({ success: true, message: "Cập nhật đối tượng thành công!", data: list });
});

// API Xóa đối tượng
app.delete('/api/xoa-doi-tuong/:ma', (req, res) => {
    const ma = (req.params.ma || '').trim().toUpperCase();
    const danhSachChungTu = docDuLieuTuFile();
    const chungTuLienQuan = danhSachChungTu.find(ct => {
        const maKHTrongPhieu = (ct.maDoiTuong || ct.maKhachHang || ct.doiTuong || '').trim().toUpperCase();
        return maKHTrongPhieu === ma;
    });
    if (chungTuLienQuan) {
        const soCT = chungTuLienQuan.soChungTu || chungTuLienQuan.soPhieu || 'đã lập';
        return res.status(400).json({
            success: false,
            message: `Không thể xóa đối tượng [${ma}] do đã có phát sinh trên chứng từ "${soCT}"!`
        });
    }
    let list = docDanhSachKH();
    const truocKhiXoa = list.length;
    list = list.filter(i => (i.ma || '').trim().toUpperCase() !== ma);
    if (list.length === truocKhiXoa) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đối tượng để xóa!" });
    }
    ghiDanhSachKH(list);
    res.json({ success: true, message: `Đã xóa đối tượng [${ma}] thành công!` });
});

// API Xóa hàng hóa
app.delete('/api/xoa-hang-hoa/:ma', (req, res) => {
    const ma = (req.params.ma || '').trim().toUpperCase();
    const danhSachChungTu = docDuLieuTuFile();
    const chungTuLienQuan = danhSachChungTu.find(ct => {
        const danhSachDongHang = ct.chiTiet || ct.chiTietHangHoa || ct.hangHoa || ct.danhSachHangHoa || ct.items || [];
        return Array.isArray(danhSachDongHang) && danhSachDongHang.some(dong => {
            const maDong = (dong.maHang || dong.ma || dong.maVatTu || dong.sku || '').trim().toUpperCase();
            return maDong === ma;
        });
    });
    if (chungTuLienQuan) {
        const soCT = chungTuLienQuan.soChungTu || chungTuLienQuan.soPhieu || 'đã lập';
        return res.status(400).json({
            success: false,
            message: `Không thể xóa hàng hóa [${ma}] do đã phát sinh trên chứng từ "${soCT}"!`
        });
    }
    let list = docDanhSachHH();
    const tongSoBanDau = list.length;
    list = list.filter(item => (item.ma || '').trim().toUpperCase() !== ma);
    if (list.length === tongSoBanDau) {
        return res.status(404).json({ success: false, message: "Không tìm thấy hàng hóa để xóa!" });
    }
    ghiDanhSachHH(list);
    res.json({ success: true, message: `Đã xóa hàng hóa [${ma}] thành công!` });
});

// API Nhập Hàng hóa hàng loạt
app.post('/api/import-hang-hoa', (req, res) => {
    const dsMoi = req.body;
    if (!Array.isArray(dsMoi) || dsMoi.length === 0) {
        return res.status(400).json({ success: false, message: "Dữ liệu nhập rỗng!" });
    }
    let listHienTai = docDanhSachHH();
    const setMa = new Set(listHienTai.map(h => (h.ma || '').trim().toUpperCase()));
    const itemTrung = dsMoi.find(item => setMa.has((item.ma || '').trim().toUpperCase()));
    if (itemTrung) {
        return res.status(400).json({
            success: false,
            message: `Mã hàng hóa [${itemTrung.ma}] đã tồn tại trên hệ thống, không được phép nạp trùng!`
        });
    }
    dsMoi.forEach(item => {
        listHienTai.push({
            ma: item.ma.trim().toUpperCase(),
            ten: item.ten.trim(),
            tinhChat: item.tinhChat || "hanghoa",
            tkKho: item.tkKho || "156",
            dvt: item.dvt || "Cái",
            ton: parseFloat(item.ton) || 0,
            giaVon: parseFloat(item.giaVon) || 0,
            giaBan: parseFloat(item.giaBan) || 0,
            donViChuyenDoi: Array.isArray(item.donViChuyenDoi) ? item.donViChuyenDoi : []
        });
    });
    ghiDanhSachHH(listHienTai);
    res.json({ success: true, message: `Đã nạp thành công ${dsMoi.length} mặt hàng vào danh mục!` });
});

// API Nhập Đối tượng hàng loạt
app.post('/api/import-doi-tuong', (req, res) => {
    const dsMoi = req.body;
    if (!Array.isArray(dsMoi) || dsMoi.length === 0) {
        return res.status(400).json({ success: false, message: "Dữ liệu nhập rỗng!" });
    }
    let listHienTai = docDanhSachKH();
    const setMa = new Set(listHienTai.map(k => (k.ma || '').trim().toUpperCase()));
    const itemTrung = dsMoi.find(item => setMa.has((item.ma || '').trim().toUpperCase()));
    if (itemTrung) {
        return res.status(400).json({
            success: false,
            message: `Mã đối tượng [${itemTrung.ma}] đã tồn tại trên hệ thống, không được phép nạp trùng!`
        });
    }
    dsMoi.forEach(item => {
        listHienTai.push({
            ma: item.ma.trim().toUpperCase(),
            ten: item.ten.trim(),
            loaiHinh: item.loaiHinh || "to_chuc",
            phanLoai: item.phanLoai || "Khách hàng",
            mst: item.mst || "",
            maCQHNS: item.maCQHNS || "",
            dienThoai: item.dienThoai || "",
            diaChi: item.diaChi || "",
            nguoiLienHe: item.nguoiLienHe || "",
            email: item.email || "",
            soTKNH: item.soTKNH || "",
            nganHang: item.nganHang || ""
        });
    });
    ghiDanhSachKH(listHienTai);
    res.json({ success: true, message: `Đã nạp thành công ${dsMoi.length} đối tượng vào danh mục!` });
});

// API Xóa nhiều hàng hóa cùng lúc
app.post('/api/xoa-nhieu-hang-hoa', (req, res) => {
    const { danhSachMa } = req.body;
    if (!Array.isArray(danhSachMa) || danhSachMa.length === 0) {
        return res.status(400).json({ success: false, message: "Chưa chọn hàng hóa nào để xóa!" });
    }
    const danhSachChungTu = docDuLieuTuFile();
    let listHH = docDanhSachHH();
    let daXoa = [];
    let biChan = [];
    danhSachMa.forEach(maRaw => {
        const ma = (maRaw || '').trim().toUpperCase();
        const coPhatSinh = danhSachChungTu.some(ct => {
            const chiTiet = ct.chiTiet || ct.chiTietHangHoa || ct.hangHoa || ct.items || [];
            return chiTiet.some(dong => (dong.maHang || dong.ma || '').trim().toUpperCase() === ma);
        });
        if (coPhatSinh) {
            biChan.push(ma);
        } else {
            daXoa.push(ma);
        }
    });
    if (daXoa.length > 0) {
        listHH = listHH.filter(item => !daXoa.includes((item.ma || '').trim().toUpperCase()));
        ghiDanhSachHH(listHH);
    }
    let thongBao = `Đã xóa thành công ${daXoa.length} mặt hàng.`;
    if (biChan.length > 0) {
        thongBao += `\nKhông thể xóa ${biChan.length} mặt hàng do đã phát sinh chứng từ: [${biChan.join(', ')}]`;
    }
    res.json({ success: true, message: thongBao, daXoa, biChan });
});

app.listen(PORT, () => {
    console.log(`Phần mềm kế toán đang chạy tại: http://localhost:${PORT}/dashboard.html`);
});