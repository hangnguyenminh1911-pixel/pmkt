const express = require('express');
const router = express.Router();

// 1. Nhập (import) các tầng Service vào để sử dụng
const productService = require('../services/productService');
const customerService = require('../services/customerService');

// ==========================================
// A. CÁC API CHO VẬT TƯ HÀNG HÓA (VTHH)
// ==========================================

// API: Lấy danh sách hàng hóa
router.get('/api/danh-sach-hang-hoa', (req, res) => {
    try {
        const data = productService.layDanhSachHangHoa();
        return res.json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Thêm mới hàng hóa
router.post('/api/them-hang-hoa', (req, res) => {
    try {
        const result = productService.themHangHoa(req.body);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// API: Xóa một hàng hóa theo mã
router.delete('/api/xoa-hang-hoa/:ma', (req, res) => {
    try {
        const result = productService.xoaHangHoa(req.params.ma);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// API: Xóa hàng loạt hàng hóa
router.post('/api/xoa-nhieu-hang-hoa', (req, res) => {
    try {
        const { danhSachMa } = req.body;
        const result = productService.xoaNhieuHangHoa(danhSachMa || []);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});


// ==========================================
// B. CÁC API CHO ĐỐI TƯỢNG (KHÁCH HÀNG / NCC)
// ==========================================

// API: Lấy danh sách đối tượng
router.get('/api/danh-sach-doi-tuong', (req, res) => {
    try {
        const data = customerService.layDanhSachDoiTuong();
        return res.json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Thêm mới đối tượng
router.post('/api/them-doi-tuong', (req, res) => {
    try {
        const result = customerService.themDoiTuong(req.body);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// API: Xóa một đối tượng theo mã
router.delete('/api/xoa-doi-tuong/:ma', (req, res) => {
    try {
        const result = customerService.xoaDoiTuong(req.params.ma);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// API: Xóa hàng loạt đối tượng
router.post('/api/xoa-nhieu-doi-tuong', (req, res) => {
    try {
        const { danhSachMa } = req.body;
        const result = customerService.xoaNhieuDoiTuong(danhSachMa || []);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

module.exports = router;
const settingService = require('../services/settingService');
const soduService = require('../services/soduService');

// --- API Cấu hình ---
router.get('/api/cau-hinh', (req, res) => {
    try {
        res.json({ success: true, data: settingService.layToanBoCauHinh() });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/api/cau-hinh/luu', (req, res) => {
    try {
        const { loai, data } = req.body;
        res.json(settingService.luuCauHinh(loai, data));
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

// --- API Số dư đầu kỳ ---
router.get('/api/so-du', (req, res) => {
    try {
        res.json({ success: true, data: soduService.layTatCaSoDu() });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/api/so-du/luu', (req, res) => {
    try {
        const { loai, data } = req.body;
        res.json(soduService.luuSoDu(loai, data));
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});
const voucherService = require('../services/voucherService');

// --- API PHIẾU BÁN HÀNG (VOUCHERS) ---

// API: Lấy danh sách chứng từ
router.get('/api/danh-sach-chung-tu', (req, res) => {
    try {
        const data = voucherService.layDanhSachChungTu();
        return res.json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Lưu hoặc cập nhật chứng từ
router.post('/api/luu-chung-tu', (req, res) => {
    try {
        const result = voucherService.luuChungTu(req.body);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// API: Xóa chứng từ
router.delete('/api/xoa-chung-tu/:soCT', (req, res) => {
    try {
        const result = voucherService.xoaChungTu(req.params.soCT);
        return res.json(result);
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});
// --- BỔ SUNG API CHO TÀI KHOẢN NGÂN HÀNG & HỆ THỐNG TÀI KHOẢN ---
const accountService = require('../services/accountService');

// 1. Lấy danh sách tài khoản ngân hàng công ty
router.get('/api/danh-sach-ngan-hang', (req, res) => {
    try {
        res.json({ success: true, data: accountService.layDanhSachNganHang() });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 2. Thêm mới tài khoản ngân hàng
router.post('/api/them-ngan-hang', (req, res) => {
    try {
        const result = accountService.themTaiKhoanNganHang(req.body);
        res.json(result);
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

// 3. Xóa tài khoản ngân hàng theo số tài khoản (STK)
router.delete('/api/xoa-ngan-hang/:stk', (req, res) => {
    try {
        const result = accountService.xoaTaiKhoanNganHang(req.params.stk);
        res.json(result);
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});
// 4. Sửa tài khoản ngân hàng
router.post('/api/sua-ngan-hang', (req, res) => {
    try {
        const result = accountService.suaTaiKhoanNganHang(req.body);
        res.json(result);
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

// 5. Lấy hệ thống tài khoản kế toán
router.get('/api/he-thong-tai-khoan', (req, res) => {
    try {
        res.json({ success: true, data: accountService.layHeThongTaiKhoan() });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});