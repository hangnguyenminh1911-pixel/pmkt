const express = require('express');
const router = express.Router();
const authService = require('./services/authService');

// API Đăng nhập
router.post('/api/login', async (req, res) => {
    try {
        const { mst, username, password } = req.body;
        if (!mst || !username || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Mã số thuế, Tên đăng nhập và Mật khẩu!" });
        }

        const foundUser = await authService.xuLyDangNhap(mst, username, password);
        if (foundUser) {
            return res.json({ success: true, message: "Đăng nhập thành công!", role: foundUser.role });
        } else {
            return res.status(401).json({ success: false, message: "Mã số thuế, tài khoản hoặc mật khẩu không đúng!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// API Yêu cầu cấp tài khoản (Giao phó hoàn toàn cho authService xử lý)
router.post('/api/request-account', async (req, res) => {
    try {
        const result = await authService.taoYeuCauDangKy(req.body);
        return res.json(result);
    } catch (error) {
        // Sửa lại cấu trúc trả về chuẩn 1 tầng duy nhất
        return res.status(400).json({ success: false, message: error.message });
    }
});

// API Quên mật khẩu & Tự động cấp mật khẩu mới gửi qua email
router.post('/api/forgot-password', async (req, res) => {
    try {
        const { mst, username } = req.body;
        if (!mst || !username) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập Mã số thuế và Tên đăng nhập!" });
        }

        const result = await authService.xuLyQuenMatKhau(mst, username);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;