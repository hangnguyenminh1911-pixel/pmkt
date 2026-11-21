// ==============================================================
// LOGIC XỬ LÝ PHÂN HỆ CẤU HÌNH HỆ THỐNG & QUẢN LÝ DỮ LIỆU (SETTINGS.JS)
// ==============================================================

// Biến toàn cục lưu trữ toàn bộ cấu hình tải từ Server
window.serverCauHinhCache = {
    dinhDang: {},
    doanhNghiep: {},
    ruiRo: {},
    thaoTacNhanh: {},
    databases: []
};

// 1. Tải toàn bộ cấu hình từ Server khi mở tab Cấu hình
async function taiCauHinhTuServer() {
    try {
        const res = await fetch('/api/cau-hinh');
        const result = await res.json();
        if (result.success) {
            window.serverCauHinhCache = result.data;
        }
    } catch (e) {
        console.error("Lỗi kết nối tải cấu hình từ server:", e);
    }
}

// Chuyển đổi qua lại giữa các tab con trong menu Cấu hình
async function chuyenTabCauHinh(tab) {
    const subDulieu = document.getElementById('subview-dulieu');
    const subThongtin = document.getElementById('subview-thongtin');
    const subTuychon = document.getElementById('subview-tuychon');

    const btnDulieu = document.getElementById('tab-btn-dulieu');
    const btnThongtin = document.getElementById('tab-btn-thongtin');
    const btnTuychon = document.getElementById('tab-btn-tuychon');

    if (!subDulieu || !subThongtin || !subTuychon) return;

    // Ẩn tất cả
    subDulieu.classList.add('hidden');
    subThongtin.classList.add('hidden');
    subTuychon.classList.add('hidden');

    if (btnDulieu) btnDulieu.className = "text-gray-500 hover:text-gray-800 pb-1 px-1 transition";
    if (btnThongtin) btnThongtin.className = "text-gray-500 hover:text-gray-800 pb-1 px-1 transition";
    if (btnTuychon) btnTuychon.className = "text-gray-500 hover:text-gray-800 pb-1 px-1 transition";

    // Đồng bộ tải dữ liệu mới nhất từ server trước khi render
    await taiCauHinhTuServer();

    if (tab === 'dulieu') {
        subDulieu.classList.remove('hidden');
        if (btnDulieu) btnDulieu.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-1 transition font-bold";
        renderDanhSachDatabase();
    } else if (tab === 'thongtin') {
        subThongtin.classList.remove('hidden');
        if (btnThongtin) btnThongtin.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-1 transition font-bold";
        napDuLieuCauHinhVaoForm();
    } else if (tab === 'tuychon') {
        subTuychon.classList.remove('hidden');
        if (btnTuychon) btnTuychon.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-1 transition font-bold";
        napTuyChonDinhDang();
        napKiemSoatRuiRo();
        napTuyChonThaoTacNhanh();
    }
}

// Lưu cấu hình định dạng lên Server
async function luuTuyChonDinhDang() {
    const cauHinhFormat = {
        dongTien: document.getElementById('opt-dongtien')?.value || 'VND',
        decTien: document.getElementById('opt-dec-tien')?.value || '0',
        decSoLuong: document.getElementById('opt-dec-soluong')?.value || '2',
        decDonGia: document.getElementById('opt-dec-dongia')?.value || '2',
        decTyGia: document.getElementById('opt-dec-tygia')?.value || '2'
    };

    try {
        const res = await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'dinhDang', data: cauHinhFormat })
        });
        const result = await res.json();
        if (result.success) {
            alert("Đã lưu tùy chọn định dạng lên server thành công!");
        } else {
            alert(result.message || "Lỗi khi lưu cấu hình định dạng!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi lưu định dạng!");
    }
}

// Nạp cấu hình định dạng khi mở tab
function napTuyChonDinhDang() {
    const data = window.serverCauHinhCache.dinhDang || {};
    if (document.getElementById('opt-dongtien')) document.getElementById('opt-dongtien').value = data.dongTien || 'VND';
    if (document.getElementById('opt-dec-tien')) document.getElementById('opt-dec-tien').value = data.decTien || '0';
    if (document.getElementById('opt-dec-soluong')) document.getElementById('opt-dec-soluong').value = data.decSoLuong || '2';
    if (document.getElementById('opt-dec-dongia')) document.getElementById('opt-dec-dongia').value = data.decDonGia || '2';
    if (document.getElementById('opt-dec-tygia')) document.getElementById('opt-dec-tygia').value = data.decTyGia || '2';
}

// 2. Quản lý danh sách cơ sở dữ liệu / kỳ kế toán từ Server
function layDanhSachDatabase() {
    let dbs = window.serverCauHinhCache.databases;
    if (!dbs || !Array.isArray(dbs) || dbs.length === 0) {
        dbs = [
            { id: "db_2026", ten: "KETOAN_2026", ngayTao: "01/01/2026", cheDo: "TT152", dangLamViec: true }
        ];
    }
    return dbs;
}

// Render danh sách cơ sở dữ liệu dạng thẻ card
function renderDanhSachDatabase() {
    const container = document.getElementById('grid-danh-sach-dulieu');
    if (!container) return;
    container.innerHTML = "";

    const dbs = layDanhSachDatabase();

    dbs.forEach(db => {
        const isCurrent = db.dangLamViec;
        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-xl border transition shadow-sm relative flex flex-col justify-between ${isCurrent ? 'border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/10' : 'border-gray-200'}`;
        
        const tenCheDoMap = { 'TT152': 'Thông tư 152 (Hộ KD)', 'TT133': 'Thông tư 133 (DNNVV)', 'TT99': 'Thông tư 99 (Doanh nghiệp)' };
        const tenGiaXuatMap = { 'BinhQuanCuoiKy': 'Bình quân cuối kỳ', 'GiaDichDanh': 'Giá đích danh', 'BinhQuanTucThoi': 'Bình quân tức thời', 'NhapTruocXuatTruoc': 'FIFO (Nhập trước xuất trước)' };
        const tenThueMap = { 'KhauTru': 'Phương pháp khấu trừ', 'TrucTiep': 'Trực tiếp trên doanh thu' };

        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-3">
                    <div class="w-10 h-10 rounded-lg ${isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} flex items-center justify-center font-bold">
                        <i class="fa-solid fa-database"></i>
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded-full font-semibold ${isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
                        ${isCurrent ? 'Đang làm việc' : 'Không làm việc'}
                    </span>
                </div>
                <h4 class="font-bold text-gray-900 text-base mb-1">${db.ten}</h4>
                <div class="space-y-1 text-xs text-gray-600 mt-2 border-t pt-2">
                    <p>Ngày tạo: <b class="text-gray-800">${db.ngayTao}</b></p>
                    <p>Chế độ: <b class="text-orange-900">${tenCheDoMap[db.cheDo] || db.cheDo}</b></p>
                    <p>Giá xuất kho: <b class="text-gray-800">${tenGiaXuatMap[db.phuongPhapGiaXuat] || 'Bình quân cuối kỳ'}</b></p>
                    <p>Thuế GTGT: <b class="text-gray-800">${tenThueMap[db.phuongPhapThueGTGT] || 'Phương pháp khấu trừ'}</b></p>
                </div>
            </div>

            <div class="mt-5 pt-3 border-t flex justify-between items-center text-xs">
                ${!isCurrent ? `
                    <button onclick="chuyenKyLamViec('${db.id}')" class="text-emerald-700 hover:underline font-bold flex items-center">
                        <i class="fa-solid fa-right-to-bracket mr-1"></i> Chọn làm việc
                    </button>
                    <button onclick="xoaCoSoDuLieu('${db.id}')" class="text-red-500 hover:text-red-700" title="Xóa dữ liệu">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                ` : `<span class="text-emerald-700 font-bold italic">Kỳ kế toán hiện tại đang làm việc</span>`}
            </div>
        `;
        container.appendChild(card);
    });
}

async function chuyenKyLamViec(dbId) {
    let dbs = layDanhSachDatabase();
    let cheDoMoi = 'TT152';
    dbs = dbs.map(db => {
        if (db.id === dbId) {
            cheDoMoi = db.cheDo || 'TT152';
            return { ...db, dangLamViec: true };
        }
        return { ...db, dangLamViec: false };
    });

    try {
        await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'databases', data: dbs })
        });
        window.serverCauHinhCache.databases = dbs;
        localStorage.setItem('BIZMATE_CHEDO_KETOAN', cheDoMoi);
        renderDanhSachDatabase();
        alert("Đã chuyển đổi kỳ làm việc thành công!");
    } catch (e) {
        alert("Lỗi kết nối khi chuyển kỳ làm việc!");
    }
}

// 3. Modal Thêm dữ liệu mới
let loaiThemDuLieuHienTai = 'moi';
function moModalThemDuLieu(loai) {
    loaiThemDuLieuHienTai = loai;
    const titleEl = document.getElementById('modal-dulieu-title');
    const boxNamTruoc = document.getElementById('box-chon-nam-truoc');
    const selectNguon = document.getElementById('select-nguon-nam-truoc');
    const inputTen = document.getElementById('input-ten-dulieu');

    const dbs = layDanhSachDatabase();
    const namHienTai = new Date().getFullYear();
    const tenGoiY = `KETOAN_${namHienTai + 1}`;
    if (inputTen) inputTen.value = tenGoiY;

    if (loai === 'namtruoc') {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-file-arrow-down mr-2 text-emerald-400"></i> Thêm dữ liệu từ năm trước`;
        if (boxNamTruoc) boxNamTruoc.classList.remove('hidden');
        
        if (selectNguon) {
            selectNguon.innerHTML = "";
            dbs.forEach(db => {
                const opt = document.createElement('option');
                opt.value = db.id;
                opt.textContent = `${db.ten} (Tạo ngày: ${db.ngayTao})`;
                selectNguon.appendChild(opt);
            });
        }
    } else {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-database mr-2 text-emerald-400"></i> Thêm dữ liệu kế toán mới`;
        if (boxNamTruoc) boxNamTruoc.classList.add('hidden');
    }

    const modal = document.getElementById('modal-them-dulieu');
    if (modal) modal.classList.remove('hidden');
}

function dongModalThemDuLieu() {
    const modal = document.getElementById('modal-them-dulieu');
    if (modal) modal.classList.add('hidden');
}

async function thucHienTaoDuLieuMoi() {
    const inputTen = document.getElementById('input-ten-dulieu');
    const tenDB = inputTen ? inputTen.value.trim().toUpperCase() : "";
    
    if (!tenDB) {
        alert("Vui lòng nhập tên dữ liệu!");
        return;
    }

    let dbs = layDanhSachDatabase();
    const biTrung = dbs.some(db => db.ten.toUpperCase() === tenDB);
    if (biTrung) {
        alert(`Tên dữ liệu "${tenDB}" đã tồn tại trên hệ thống! Vui lòng đặt tên khác.`);
        if (inputTen) { inputTen.focus(); inputTen.select(); }
        return;
    }

    const cheDo = document.querySelector('input[name="setup_chedo"]:checked')?.value || 'TT152';
    const phuongPhapGiaXuat = document.querySelector('input[name="setup_giatrixuat"]:checked')?.value || 'BinhQuanCuoiKy';
    const phuongPhapThueGTGT = document.querySelector('input[name="setup_thuegtgt"]:checked')?.value || 'KhauTru';
    const ngayBatDau = document.getElementById('input-ngay-batdau')?.value || '2026-01-01';

    const ngayTao = new Date().toLocaleDateString('vi-VN');
    const newId = 'db_' + Date.now();

    dbs.forEach(db => db.dangLamViec = false);
    
    const dbMoi = {
        id: newId,
        ten: tenDB,
        ngayTao: ngayTao,
        cheDo: cheDo,
        phuongPhapGiaXuat: phuongPhapGiaXuat,
        phuongPhapThueGTGT: phuongPhapThueGTGT,
        ngayBatDau: ngayBatDau,
        dangLamViec: true
    };

    dbs.push(dbMoi);

    try {
        await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'databases', data: dbs })
        });
        window.serverCauHinhCache.databases = dbs;
        localStorage.setItem('BIZMATE_CHEDO_KETOAN', cheDo);
        
        dongModalThemDuLieu();
        renderDanhSachDatabase();
        alert(`Đã khởi tạo và chuyển sang làm việc với dữ liệu [${tenDB}] thành công!`);
    } catch (e) {
        alert("Lỗi kết nối khi khởi tạo cơ sở dữ liệu mới!");
    }
}

async function xoaCoSoDuLieu(dbId) {
    let dbs = layDanhSachDatabase();
    if (dbs.length <= 1) {
        alert("Hệ thống bắt buộc phải duy trì ít nhất một cơ sở dữ liệu làm việc!");
        return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa cơ sở dữ liệu này không?")) return;
    
    dbs = dbs.filter(db => db.id !== dbId);
    try {
        await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'databases', data: dbs })
        });
        window.serverCauHinhCache.databases = dbs;
        renderDanhSachDatabase();
    } catch (e) {
        alert("Lỗi kết nối khi xóa cơ sở dữ liệu!");
    }
}

// 4. Thông tin công ty & Cấu hình doanh nghiệp
function napDuLieuCauHinhVaoForm() {
    const dataLocal = window.serverCauHinhCache.doanhNghiep || {};
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    const cheDoHienTai = localStorage.getItem('BIZMATE_CHEDO_KETOAN') || 'TT152';
    const tenCheDoMap = {
        'TT152': 'Thông tư số 152/TT-BTC (Hộ kinh doanh, cá nhân kinh doanh)',
        'TT133': 'Thông tư số 133/2016/TT-BTC (Doanh nghiệp nhỏ và vừa)',
        'TT99': 'Thông tư số 99/2025/TT-BTC (Doanh nghiệp lớn / Thay thế TT 200)'
    };

    setVal('config-chedo-ketoan', tenCheDoMap[cheDoHienTai] || cheDoHienTai);
    setVal('config-tendonvi', dataLocal.tenDonVi || 'CÔNG TY TNHH BIZMATE');
    setVal('config-mst', dataLocal.mst || '0200xxxxxx');
    setVal('config-diachi', dataLocal.diaChi || 'Lê Chân, Thành phố Hải Phòng');
    setVal('config-coquanthue', dataLocal.coQuanThue || '');
    setVal('config-nguoilapphieu', dataLocal.nguoiLapPhiếu || '');
    setVal('config-thukho', dataLocal.thuKho || '');
    setVal('config-ketoantruong', dataLocal.keToanTruong || '');
    setVal('config-giamdoc', dataLocal.giamDoc || '');
}

async function luuCauHinhHeThong() {
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';

    const tenDonVi = getVal('config-tendonvi');
    const mst = getVal('config-mst');
    const diaChi = getVal('config-diachi');

    if (!tenDonVi || !mst || !diaChi) {
        alert("Vui lòng nhập đầy đủ Tên đơn vị, Mã số thuế và Địa chỉ!");
        return;
    }

    const cauHinhMoi = {
        tenDonVi,
        mst,
        diaChi,
        coQuanThue: getVal('config-coquanthue'),
        nguoiLapPhiếu: getVal('config-nguoilapphieu'),
        thuKho: getVal('config-thukho'),
        keToanTruong: getVal('config-ketoantruong'),
        giamDoc: getVal('config-giamdoc')
    };

    try {
        const res = await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'doanhNghiep', data: cauHinhMoi })
        });
        const result = await res.json();
        if (result.success) {
            window.serverCauHinhCache.doanhNghiep = cauHinhMoi;
            if (typeof napCauHinhDoanhNghiep === 'function') napCauHinhDoanhNghiep();
            alert("Đã lưu thông tin đơn vị lên server thành công!");
        }
    } catch (e) {
        alert("Lỗi kết nối khi lưu thông tin đơn vị!");
    }
}

function taiLaiCauHinh() {
    napDuLieuCauHinhVaoForm();
    alert("Đã khôi phục lại thông tin đã lưu!");
}

// Lưu cấu hình Kiểm soát rủi ro lên Server
async function luuKiemSoatRuiRo() {
    const amtien = document.querySelector('input[name="opt_kiemtra_amtien"]:checked')?.value || '1';
    const amkho = document.querySelector('input[name="opt_kiemtra_amkho"]:checked')?.value || '1';
    const maxTmVal = document.getElementById('opt-max-tienmat')?.value.replace(/,/g, '') || '5000000';
    const maxTmCheck = document.querySelector('input[name="opt_kiemtra_max_tm"]:checked')?.value || '0';
    const ngayKhoaSo = document.getElementById('opt-ngay-khoaso')?.value || '';
    const ngayBatDau = document.getElementById('opt-ngay-batdau-hach-toan')?.value || '2026-01-01';

    const cauHinhRuiRo = {
        kiemTraAmTien: amtien,
        kiemTraAmKho: amkho,
        maxTienMặt: maxTmVal,
        kiemTraMaxTM: maxTmCheck,
        ngayKhoaSo: ngayKhoaSo,
        ngayBatDauHachToan: ngayBatDau
    };

    try {
        const res = await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'ruiRo', data: cauHinhRuiRo })
        });
        const result = await res.json();
        if (result.success) {
            window.serverCauHinhCache.ruiRo = cauHinhRuiRo;
            alert("Đã lưu thiết lập kiểm soát rủi ro lên server thành công!");
        }
    } catch (e) {
        alert("Lỗi kết nối khi lưu kiểm soát rủi ro!");
    }
}

function napKiemSoatRuiRo() {
    const data = window.serverCauHinhCache.ruiRo || {};
    const radAmTien = document.querySelector(`input[name="opt_kiemtra_amtien"][value="${data.kiemTraAmTien || '1'}"]`);
    if (radAmTien) radAmTien.checked = true;

    const radAmKho = document.querySelector(`input[name="opt_kiemtra_amkho"][value="${data.kiemTraAmKho || '1'}"]`);
    if (radAmKho) radAmKho.checked = true;

    if (document.getElementById('opt-max-tienmat')) {
        document.getElementById('opt-max-tienmat').value = Number(data.maxTienMặt || 5000000).toLocaleString('en-US');
    }
    const radMaxTM = document.querySelector(`input[name="opt_kiemtra_max_tm"][value="${data.kiemTraMaxTM || '0'}"]`);
    if (radMaxTM) radMaxTM.checked = true;

    if (document.getElementById('opt-ngay-khoaso')) document.getElementById('opt-ngay-khoaso').value = data.ngayKhoaSo || '';
    if (document.getElementById('opt-ngay-batdau-hach-toan')) document.getElementById('opt-ngay-batdau-hach-toan').value = data.ngayBatDauHachToan || '2026-01-01';
}

// Lưu tùy chọn thao tác nhanh lên Server
async function luuTuyChonThaoTacNhanh() {
    const cauHinhNhanh = {
        giuManHinh: document.getElementById('opt-giu-manhinh')?.checked || false,
        hienGiaTon: document.getElementById('opt-canhbao-amkho')?.checked || false,
        tuDongNgay: document.getElementById('opt-tu-dong-dien')?.checked || false,
        moDashboard: document.getElementById('opt-mo-dashboard')?.checked || false
    };

    try {
        const res = await fetch('/api/cau-hinh/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'thaoTacNhanh', data: cauHinhNhanh })
        });
        const result = await res.json();
        if (result.success) {
            window.serverCauHinhCache.thaoTacNhanh = cauHinhNhanh;
            alert("Đã lưu tùy chọn thao tác nhanh lên server thành công!");
        }
    } catch (e) {
        alert("Lỗi kết nối khi lưu thao tác nhanh!");
    }
}

function napTuyChonThaoTacNhanh() {
    const data = window.serverCauHinhCache.thaoTacNhanh || {};
    if (document.getElementById('opt-giu-manhinh')) document.getElementById('opt-giu-manhinh').checked = !!data.giuManHinh;
    if (document.getElementById('opt-canhbao-amkho')) document.getElementById('opt-canhbao-amkho').checked = !!data.hienGiaTon;
    if (document.getElementById('opt-tu-dong-dien')) document.getElementById('opt-tu-dong-dien').checked = !!data.tuDongNgay;
    if (document.getElementById('opt-mo-dashboard')) document.getElementById('opt-mo-dashboard').checked = !!data.moDashboard;
}