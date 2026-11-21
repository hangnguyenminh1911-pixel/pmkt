const fs = require('fs');
const path = require('path');

// Định nghĩa đường dẫn tới thư mục data dùng chung
const { DATA_DIR } = require('../config/paths');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Đảm bảo thư mục data luôn tồn tại
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Hàm đọc file JSON an toàn
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Hàm ghi file JSON an toàn
function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Gửi email: cấu hình tài khoản SMTP trong file .env (xem .env.example)
const { transporter, MAIL_FROM } = require('../config/mail');

const adminService = {
    // 1. Lấy danh sách yêu cầu đăng ký đang chờ
    layDanhSachYeuCau: () => {
        return readJsonFile(REQUESTS_FILE);
    },

    // 2. Lấy danh sách khách hàng đang hoạt động
    layDanhSachKhachHang: () => {
        return readJsonFile(USERS_FILE);
    },

    // --- CẬP NHẬT HÀM LƯU / THÊM MỚI KHÁCH HÀNG (CHẶN TRÙNG MST) ---
    // --- HÀM LƯU / THÊM MỚI & SỬA KHÁCH HÀNG (PHÂN BIỆT THÊM MỚI VÀ CHỈNH SỬA) ---
    luuKhachHang: (khData) => {
        let users = readJsonFile(USERS_FILE);
        const mstMoi = String(khData.mst || '').trim();
        const originalMst = String(khData.originalMst || '').trim();

        if (!mstMoi) {
            return { success: false, message: 'Mã số thuế không được để trống!' };
        }

        // 1. Kiểm tra xem MST mới đã tồn tại trong danh sách chính thức (users.json) hay chưa
        const existingUserIndex = users.findIndex(u => String(u.mst || '').trim() === mstMoi);

        if (existingUserIndex !== -1) {
            // Nếu MST đã tồn tại trên hệ thống:
            // Kiểm tra xem có phải đang chỉnh sửa chính bản ghi đó không (dựa vào originalMst)
            if (originalMst && originalMst === mstMoi) {
                // ĐANG SỬA CHÍNH KHÁCH HÀNG ĐÓ -> Cho phép cập nhật đè thông tin mới
                users[existingUserIndex] = {
                    ...users[existingUserIndex],
                    hoTen: khData.hoTen,
                    sdt: khData.sdt,
                    email: khData.email,
                    mst: mstMoi,
                    tenDoanhNghiep: khData.tenDoanhNghiep,
                    goiCuoc: khData.goiCuoc,
                    trangThai: khData.trangThai || users[existingUserIndex].trangThai,
                    password: khData.password || users[existingUserIndex].password
                };
                writeJsonFile(USERS_FILE, users);
                return { success: true, message: 'Cập nhật thông tin khách hàng thành công!' };
            } else {
                // ĐANG THÊM MỚI HOẶC ĐỔI TRÙNG VỚI MST CỦA NGƯỜI KHÁC -> CHẶN
                return { 
                    success: false, 
                    message: `Thất bại! Mã số thuế "${mstMoi}" đã tồn tại trên hệ thống cho đơn vị "${users[existingUserIndex].tenDoanhNghiep}". Vui lòng kiểm tra lại!` 
                };
            }
        }

        // 2. Trường hợp đang sửa nhưng người dùng có thay đổi MST sang một mã mới hoàn toàn
        if (originalMst && originalMst !== mstMoi) {
            const oldIndex = users.findIndex(u => String(u.mst || '').trim() === originalMst);
            if (oldIndex !== -1) {
                users[oldIndex] = {
                    ...users[oldIndex],
                    hoTen: khData.hoTen,
                    sdt: khData.sdt,
                    email: khData.email,
                    mst: mstMoi,
                    tenDoanhNghiep: khData.tenDoanhNghiep,
                    goiCuoc: khData.goiCuoc,
                    trangThai: khData.trangThai || users[oldIndex].trangThai,
                    password: khData.password || users[oldIndex].password
                };
                writeJsonFile(USERS_FILE, users);
                return { success: true, message: 'Cập nhật thông tin và mã số thuế thành công!' };
            }
        }

        // 3. Nếu là thêm mới hoàn toàn
        const newCustomer = {
            ngayDangKy: khData.ngayDangKy || new Date().toISOString().split('T')[0],
            hoTen: khData.hoTen || 'Khách hàng',
            sdt: khData.sdt || '',
            email: khData.email || '',
            mst: mstMoi,
            username: 'admin',
            tenDoanhNghiep: khData.tenDoanhNghiep,
            goiCuoc: khData.goiCuoc || 'Gói chuẩn',
            trangThai: khData.trangThai || 'Đang hoạt động',
            password: khData.password || 'Bizmate@2026'
        };
        users.unshift(newCustomer);

        writeJsonFile(USERS_FILE, users);
        return { success: true, message: 'Thêm mới khách hàng thành công!' };
    },

        // 3. Phê duyệt yêu cầu và cấp tài khoản (Đã tích hợp cơ chế tự động dọn dẹp yêu cầu trùng MST)
    pheDuyetVaCapTaiKhoan: async (requestId, goiCuoc, password) => {
        console.log("==> Server nhận được yêu cầu cấp TK với requestId:", requestId);
        let requests = readJsonFile(REQUESTS_FILE);
        let users = readJsonFile(USERS_FILE);
        
        let reqItem = null;
        let targetMst = null;
        
        // 1. Tìm kiếm trong danh sách chờ duyệt (requests.json) theo mst hoặc id
        const reqIndex = requests.findIndex(r => String(r.mst).trim() === String(requestId).trim() || String(r.id).trim() === String(requestId).trim());
        
        if (reqIndex !== -1) {
            reqItem = requests[reqIndex];
            targetMst = reqItem.mst;
            
            // XÓA BỎ TOÀN BỘ CÁC DÒNG YÊU CẦU CÓ CÙNG MST NÀY KHỎI REQUESTS.JSON (Làm sạch triệt để)
            requests = requests.filter(r => String(r.mst).trim() !== String(targetMst).trim());
            writeJsonFile(REQUESTS_FILE, requests);
        } else {
            // 2. Nếu không có trong requests, tìm trực tiếp trong users.json
            const userIndex = users.findIndex(u => String(u.mst).trim() === String(requestId).trim() || String(u.username).trim() === String(requestId).trim());
            if (userIndex !== -1) {
                reqItem = users[userIndex];
                targetMst = reqItem.mst;
            }
        }

        if (!reqItem || !targetMst) {
            return { success: false, message: `Không tìm thấy thông tin yêu cầu hoặc khách hàng với mã số thuế: ${requestId}` };
        }

        // Sinh mật khẩu ngẫu nhiên hoàn toàn mới và cố định tên đăng nhập là admin
        const randomPassword = 'Bizmate@' + Math.floor(1000 + Math.random() * 9000);
        const usernameMacDinh = 'admin';

        let existingUser = users.find(u => String(u.mst).trim() === String(targetMst).trim());
        if (!existingUser) {
            const newUser = {
                ngayKichHoat: new Date().toISOString().split('T')[0],
                hoTen: reqItem.hoTen || 'Khách hàng',
                sdt: reqItem.sdt || reqItem.dienThoai || '',
                email: reqItem.email,
                mst: targetMst,
                username: usernameMacDinh, 
                tenDoanhNghiep: reqItem.tenDoanhNghiep || reqItem.donVi || 'Doanh nghiệp',
                goiCuoc: goiCuoc || reqItem.goiCuoc || reqItem.goiDangKy || 'Gói chuẩn',
                trangThai: 'Đang hoạt động',
                password: randomPassword
            };
            users.unshift(newUser);
            reqItem = newUser;
        } else {
            existingUser.trangThai = 'Đang hoạt động';
            existingUser.username = usernameMacDinh;
            existingUser.goiCuoc = goiCuoc || existingUser.goiCuoc;
            existingUser.password = randomPassword;
            reqItem = existingUser;
        }

        writeJsonFile(USERS_FILE, users);

        // Chuẩn bị nội dung gửi email xác thực kèm Footer chuyên nghiệp
        const mailOptions = {
            from: MAIL_FROM,
            to: reqItem.email,
            subject: `[Bizmate SaaS] Thông tin tài khoản phần mềm kế toán cho MST: ${reqItem.mst}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                    <h2 style="color: #b45309; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-top: 0;">Kính gửi Quý đơn vị: ${reqItem.tenDoanhNghiep}</h2>
                    <p>Tài khoản sử dụng phần mềm kế toán <b>Bizmate SaaS</b> của quý khách đã được kích hoạt thành công.</p>
                    
                    <ul style="background: #fdf8f6; padding: 15px 25px; border-left: 4px solid #b45309; list-style: none; border-radius: 4px; margin: 20px 0;">
                        <li style="margin-bottom: 8px;"><b>Mã số thuế:</b> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${reqItem.mst}</span></li>
                        <li style="margin-bottom: 8px;"><b>Tên đăng nhập:</b> <span style="font-family: monospace; color: #1e3a8a; font-weight: bold;">admin</span></li>
                        <li style="margin-bottom: 8px;"><b>Mật khẩu:</b> <span style="font-family: monospace; font-weight: bold;">${reqItem.password}</span></li>
                        <li style="margin-bottom: 8px;"><b>Gói dịch vụ:</b> ${reqItem.goiCuoc}</li>
                        <li><b>Đường dẫn truy cập:</b> <a href="http://localhost:3000" target="_blank" style="color: #2563eb; text-decoration: none;">http://localhost:3000</a></li>
                    </ul>

                    <p style="margin-top: 20px;">Quý khách vui lòng đăng nhập vào hệ thống để bắt đầu sử dụng. Nếu cần hỗ trợ trong quá trình thao tác, xin vui lòng liên hệ với chúng tôi.</p>

                    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                        <p style="margin: 0 0 5px 0; font-weight: bold; color: #b45309;">BIZMATE ACCOUNTING & TAX SOFTWARE</p>
                        <p style="margin: 0 0 5px 0;">Hệ thống phần mềm quản lý bán hàng và hóa đơn điện tử chuyên nghiệp</p>
                        <p style="margin: 0 0 10px 0;">Hotline hỗ trợ: <b>0986.383.346</b> | Email: <b>hangnguyenminh1911@gmail.com</b></p>
                        <p style="margin: 0; color: #9ca3af;">© 2026 Bizmate SaaS. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return { success: true, message: 'Đã kích hoạt tài khoản, dọn dẹp các yêu cầu trùng lặp và gửi email thành công!' };
        } catch (error) {
            console.error("Lỗi gửi email thực tế:", error);
            return { success: false, message: 'Kích hoạt tài khoản thành công nhưng gửi email thất bại do cấu hình SMTP!' };
        }
    },
// 5. Xóa khách hàng theo MST
    xoaKhachHangTheoMST: (mstXoa) => {
        let users = readJsonFile(USERS_FILE);
        let requests = readJsonFile(REQUESTS_FILE);

        const initialLen = users.length;
        users = users.filter(u => String(u.mst || '').trim() !== String(mstXoa).trim());
        requests = requests.filter(r => String(r.mst || '').trim() !== String(mstXoa).trim());

        if (users.length === initialLen) {
            return { success: false, message: 'Không tìm thấy khách hàng cần xóa trên hệ thống!' };
        }

        writeJsonFile(USERS_FILE, users);
        writeJsonFile(REQUESTS_FILE, requests);

        return { success: true, message: 'Xóa khách hàng thành công!' };
    }
};

module.exports = adminService;
