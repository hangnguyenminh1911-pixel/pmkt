const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService'); // Điều chỉnh đường dẫn tương ứng với thư mục của bạn

// 1. API lấy danh sách toàn bộ yêu cầu đăng ký chờ duyệt
router.get('/api/admin/requests', (req, res) => {
    try {
        const data = adminService.layDanhSachYeuCau();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 2. API lấy danh sách toàn bộ khách hàng (đang hoạt động / đã kích hoạt)
router.get('/api/admin/customers', (req, res) => {
    try {
        const data = adminService.layDanhSachKhachHang();
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 3. API phê duyệt và cấp tài khoản (Viết thoáng để không bị lỗi 400 Bad Request)
router.post('/api/admin/approve-request', async (req, res) => {
    try {
        console.log("Yêu cầu cấp tài khoản cho:", req.body && req.body.requestId);
        const { requestId, goiCuoc, password } = req.body;

        const result = await adminService.pheDuyetVaCapTaiKhoan(requestId, goiCuoc, password);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 4. API thêm mới hoặc cập nhật thông tin khách hàng từ trang Admin
router.post('/api/admin/save-customer', async (req, res) => {
    try {
        const customerData = req.body;
        if (!customerData.mst || !customerData.tenDoanhNghiep) {
            return res.status(400).json({ success: false, message: 'Mã số thuế và Tên doanh nghiệp là bắt buộc!' });
        }
        const result = await adminService.luuKhachHang(customerData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});
// API xóa khách hàng theo Mã số thuế (MST)
router.delete('/api/admin/delete-customer/:mst', (req, res) => {
    try {
        const mstXoa = req.params.mst;
        
        // Gọi thông qua adminService hoặc định nghĩa hàm đọc file an toàn tại chỗ
        const result = adminService.xoaKhachHangTheoMST(mstXoa);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
