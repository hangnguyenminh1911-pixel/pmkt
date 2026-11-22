// Tiện ích mật khẩu: mã hóa bằng bcrypt, so sánh, và chuyển mật khẩu dạng chữ thường (cũ) sang mã hóa
const fs = require('fs');
const bcrypt = require('bcrypt');

const SO_VONG_BAM = 10;
const MAU_BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function laMatKhauDaMaHoa(giaTri) {
    return MAU_BCRYPT.test(String(giaTri || ''));
}

async function maHoaMatKhau(matKhau) {
    return bcrypt.hash(String(matKhau), SO_VONG_BAM);
}

// So sánh mật khẩu người dùng nhập với giá trị đang lưu.
// Hỗ trợ cả dữ liệu cũ chưa mã hóa (trả về canNangCap = true để mã hóa lại ngay).
async function kiemTraMatKhau(matKhauNhap, giaTriLuu) {
    const nhap = String(matKhauNhap || '');
    const luu = String(giaTriLuu || '');
    if (!nhap || !luu) return { dung: false, canNangCap: false };
    if (laMatKhauDaMaHoa(luu)) {
        return { dung: await bcrypt.compare(nhap, luu), canNangCap: false };
    }
    return { dung: nhap === luu.trim(), canNangCap: true };
}

// Bỏ trường mật khẩu trước khi trả dữ liệu người dùng về trình duyệt
function boMatKhau(user) {
    if (!user || typeof user !== 'object') return user;
    const { password, ...conLai } = user;
    return conLai;
}

// Chạy khi khởi động: mã hóa mọi mật khẩu còn ở dạng chữ thường trong users.json
// (người dùng vẫn đăng nhập bằng đúng mật khẩu cũ)
function maHoaMatKhauCu(duongDanUsers) {
    if (!fs.existsSync(duongDanUsers)) return 0;
    let users;
    try {
        users = JSON.parse(fs.readFileSync(duongDanUsers, 'utf8') || '[]');
    } catch (e) {
        console.error('Không đọc được users.json để mã hóa mật khẩu:', e.message);
        return 0;
    }
    if (!Array.isArray(users)) return 0;

    let soLuong = 0;
    users.forEach(u => {
        if (u && u.password && !laMatKhauDaMaHoa(u.password)) {
            u.password = bcrypt.hashSync(String(u.password).trim(), SO_VONG_BAM);
            soLuong++;
        }
    });
    if (soLuong > 0) {
        fs.writeFileSync(duongDanUsers, JSON.stringify(users, null, 2), 'utf8');
        console.log(`Đã mã hóa ${soLuong} mật khẩu cũ trong users.json (bcrypt).`);
    }
    return soLuong;
}

module.exports = { laMatKhauDaMaHoa, maHoaMatKhau, kiemTraMatKhau, boMatKhau, maHoaMatKhauCu };
