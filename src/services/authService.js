const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu

// Gửi email: cấu hình tài khoản SMTP trong file .env (xem .env.example)
const { transporter, MAIL_FROM } = require('../config/mail');

// Trỏ đường dẫn đến thư mục data an toàn
const { DATA_DIR } = require('../config/paths');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Hàm ghi file JSON an toàn
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- 1. QUẢN LÝ TỆP REQUESTS.JSON ---
function docDanhSachRequests() {
    try {
        if (!fs.existsSync(REQUESTS_FILE)) {
            fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
        const fileContent = fs.readFileSync(REQUESTS_FILE, 'utf-8');
        return JSON.parse(fileContent || '[]');
    } catch (e) {
        console.error("Lỗi đọc file requests.json:", e);
        return [];
    }
}

function ghiDanhSachRequests(data) {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// --- 2. QUẢN LÝ TỆP USERS.JSON ---
function docDanhSachUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([
                { username: "admin", password: "123456", role: "admin" }
            ], null, 2));
        }
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
    } catch (e) {
        return [];
    }
}

function ghiDanhSachUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// --- 3. CÁC HÀM NGHIỆP VỤ (SERVICE METHODS) ---

// Xử lý đăng nhập trong authService.js
async function xuLyDangNhap(mst, username, password) {
    const users = readJsonFile(USERS_FILE); // Đọc từ users.json
    
    const cleanMst = String(mst || '').trim();
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    // Kiểm tra tài khoản Quản trị hệ thống cứng (nếu có)
    if (cleanMst === 'admin' && cleanUser === 'admin' && cleanPass === 'Bizmate@2026') {
        return { role: 'super_admin', tenDoanhNghiep: 'Super Admin System' };
    }

    // Dò tìm trong danh sách khách hàng chính thức
    const foundUser = users.find(u => 
        String(u.mst || '').trim() === cleanMst && 
        String(u.username || '').trim() === cleanUser && 
        String(u.password || '').trim() === cleanPass
    );

    if (!foundUser) {
        return null;
    }

    // Kiểm tra trạng thái tài khoản bị khóa
    if (foundUser.trangThai === 'Đã khóa' || foundUser.trangThai === 'Tạm khóa') {
        throw new Error("Tài khoản của đơn vị này đã bị khóa. Vui lòng liên hệ quản trị viên!");
    }

    return {
        mst: foundUser.mst,
        username: foundUser.username,
        tenDoanhNghiep: foundUser.tenDoanhNghiep,
        role: 'customer'
    };
}
// Hàm đọc file JSON an toàn
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
}

// Xử lý quên mật khẩu và gửi email cấp lại
async function xuLyQuenMatKhau(mst, username) {
    let users = readJsonFile(USERS_FILE);
    const cleanMst = String(mst || '').trim();
    const cleanUser = String(username || '').trim();

    const userIndex = users.findIndex(u => 
        String(u.mst || '').trim() === cleanMst && 
        String(u.username || '').trim() === cleanUser
    );

    if (userIndex === -1) {
        return { success: false, message: "Không tìm thấy tài khoản tương ứng với Mã số thuế và Tên đăng nhập đã nhập!" };
    }

    // Sinh mật khẩu mới ngẫu nhiên
    const newPassword = 'Bizmate@' + Math.floor(1000 + Math.random() * 9000);
    users[userIndex].password = newPassword;

    // Lưu lại vào users.json
    writeJsonFile(USERS_FILE, users);

    const targetUser = users[userIndex];

    // Gửi email chứa mật khẩu mới cho khách hàng
    const mailOptions = {
        from: MAIL_FROM,
        to: targetUser.email,
        subject: `[Bizmate SaaS] Cấp lại mật khẩu đăng nhập cho MST: ${targetUser.mst}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #b45309; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-top: 0;">Khôi phục mật khẩu - Bizmate SaaS</h2>
                <p>Xin chào quý đơn vị: <b>${targetUser.tenDoanhNghiep}</b>,</p>
                <p>Hệ thống đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản của bạn.</p>
                
                <ul style="background: #fdf8f6; padding: 15px 25px; border-left: 4px solid #b45309; list-style: none; border-radius: 4px; margin: 20px 0;">
                    <li style="margin-bottom: 8px;"><b>Mã số thuế:</b> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${targetUser.mst}</span></li>
                    <li style="margin-bottom: 8px;"><b>Tên đăng nhập:</b> <span style="font-family: monospace; color: #1e3a8a; font-weight: bold;">${targetUser.username}</span></li>
                    <li style="margin-bottom: 8px;"><b>Mật khẩu mới:</b> <span style="font-family: monospace; color: #dc2626; font-weight: bold;">${newPassword}</span></li>
                </ul>

                <p>Quý khách vui lòng dùng mật khẩu mới này để đăng nhập vào hệ thống tại <a href="http://localhost:3000" target="_blank" style="color: #2563eb; text-decoration: none;">http://localhost:3000</a>.</p>

                <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #b45309;">BIZMATE ACCOUNTING & TAX SOFTWARE</p>
                    <p style="margin: 0 0 5px 0;">Hệ thống phần mềm quản lý bán hàng và hóa đơn điện tử</p>
                    <p style="margin: 0; color: #9ca3af;">© 2026 Bizmate SaaS. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: `Mật khẩu mới đã được tự động cấp và gửi thành công đến email: ${targetUser.email}!` };
    } catch (error) {
        console.error("Lỗi gửi email reset mật khẩu:", error);
        return { success: false, message: "Đã tạo mật khẩu mới nhưng việc gửi email thông báo thất bại do cấu hình SMTP!" };
    }
}

// Tiếp nhận yêu cầu cấp tài khoản (Đã tích hợp kiểm soát chống trùng MST thông minh)
async function taoYeuCauDangKy(payload) {
    const hoTenVal = payload.hoTen || payload.ten || payload.nguoiLienHe || "";
    const emailVal = payload.email || "";
    const sdtVal = payload.dienThoai || payload.sdt || payload.phone || "";
    const mstVal = payload.mst || payload.maSoThue || "";
    const donViVal = payload.donVi || payload.tenDoanhNghiep || payload.tenDonVi || "";

    if (!hoTenVal || !emailVal || !sdtVal || !mstVal || !donViVal) {
        throw new Error("Vui lòng nhập đầy đủ tất cả các trường thông tin bắt buộc!");
    }

    let users = docDanhSachUsers();
    // 1. Chặn tuyệt đối nếu MST đã có tài khoản chính thức đang hoạt động
    const daTonTaiChinhThuc = users.find(u => String(u.mst).trim() === String(mstVal).trim());
    if (daTonTaiChinhThuc) {
        throw new Error("Mã số thuế này đã được đăng ký và kích hoạt sử dụng trên hệ thống!");
    }

    let requests = docDanhSachRequests();
    // 2. Kiểm tra xem MST này đã có yêu cầu đang chờ duyệt chưa
    const dangChoDuyet = requests.find(r => String(r.mst).trim() === String(mstVal).trim() && r.trangThai === "cho_duyet");

    const requestId = "REQ" + Math.floor(Math.random() * 900000 + 100000);
    const ngayHienTai = new Date().toISOString().split('T')[0];

    if (dangChoDuyet) {
        // Nếu đã có yêu cầu chờ duyệt -> Cập nhật đè thông tin mới nhất vào yêu cầu đó (tránh sinh dòng rác)
        dangChoDuyet.hoTen = hoTenVal.trim();
        dangChoDuyet.email = emailVal.trim().toLowerCase();
        dangChoDuyet.dienThoai = sdtVal.trim();
        dangChoDuyet.sdt = sdtVal.trim();
        dangChoDuyet.donVi = donViVal.trim();
        dangChoDuyet.tenDoanhNghiep = donViVal.trim();
        dangChoDuyet.ngayYeuCau = ngayHienTai;
        ghiDanhSachRequests(requests);
        
        return { 
            success: true, 
            message: "Hệ thống đã ghi nhận thông tin và cập nhật lại yêu cầu đăng ký của bạn!" 
        };
    }

    // Nếu chưa có thì thêm mới vào danh sách chờ duyệt
    requests.unshift({
        id: requestId,
        hoTen: hoTenVal.trim(),
        email: emailVal.trim().toLowerCase(),
        dienThoai: sdtVal.trim(),
        sdt: sdtVal.trim(),
        mst: mstVal.trim(),
        donVi: donViVal.trim(),
        tenDoanhNghiep: donViVal.trim(),
        ngayYeuCau: ngayHienTai,
        ngayDangKy: ngayHienTai,
        goiCuoc: payload.goiCuoc || payload.goiDangKy || 'Gói chuẩn',
        trangThai: "cho_duyet"
    });

    ghiDanhSachRequests(requests);
    return { 
        success: true, 
        message: "Gửi yêu cầu cấp tài khoản thành công! Quản trị viên sẽ xem xét và phê duyệt." 
    };
}

// Lấy danh sách yêu cầu cho Admin
function layDanhSachYeuCau() {
    return docDanhSachRequests();
}

// Phê duyệt yêu cầu và cấp tài khoản tự động
async function pheDuyetYeuCau(requestId) {
    let requests = docDanhSachRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);

    if (reqIndex === -1) {
        throw new Error("Không tìm thấy thông tin yêu cầu này!");
    }

    const targetRequest = requests[reqIndex];
    if (targetRequest.trangThai === "da_duyet") {
        throw new Error("Yêu cầu này đã được phê duyệt trước đó rồi!");
    }

    const username = targetRequest.email.split('@')[0].toLowerCase();
    const rawPassword = Math.floor(100000 + Math.random() * 900000).toString();

    let users = docDanhSachUsers();
    let finalUsername = username;
    let userExist = users.find(u => u.username === finalUsername);
    if (userExist) {
        finalUsername = username + Math.floor(10 + Math.random() * 90);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    users.push({
        username: finalUsername,
        password: hashedPassword,
        role: "user",
        hoTen: targetRequest.hoTen,
        email: targetRequest.email,
        mst: targetRequest.mst
    });
    ghiDanhSachUsers(users);

    requests[reqIndex].trangThai = "da_duyet";
    ghiDanhSachRequests(requests);

    return {
        success: true,
        message: `Đã phê duyệt thành công! Tài khoản được tạo là: Tên đăng nhập: [${finalUsername}] - Mật khẩu tạm thời: [${rawPassword}]`
    };
}

module.exports = {
    xuLyDangNhap,
    taoYeuCauDangKy,
    layDanhSachYeuCau,
    pheDuyetYeuCau,
    xuLyQuenMatKhau
};