// ==============================================================
// QUẢN LÝ DANH MỤC TÀI KHOẢN NGÂN HÀNG & HỆ THỐNG TÀI KHOẢN KẾ TOÁN
// ==============================================================

window.danhSachNganHangServer = [];
window.heThongTaiKhoanServer = [];

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, ''');
}

// 1. Mở modal thêm mới tài khoản ngân hàng
function moModalThemNganHang() {
    document.getElementById('modal-nh-title').innerHTML = `<i class="fa-solid fa-building-columns mr-2 text-yellow-300"></i> Thêm tài khoản ngân hàng`;
    document.getElementById('nh-is-edit').value = "0";

    const inputStk = document.getElementById('nh-stk');
    inputStk.value = "";
    inputStk.removeAttribute('readonly');
    inputStk.classList.remove('bg-gray-100');

    document.getElementById('nh-ten').value = "";
    document.getElementById('nh-chinhanh').value = "";
    document.getElementById('nh-tkketoan').value = "1121";

    document.getElementById('modal-nganhang').classList.remove('hidden');
    inputStk.focus();
}

// 2. Mở modal sửa tài khoản ngân hàng
function moModalSuaNganHang(stk) {
    const item = (window.danhSachNganHangServer || []).find(i => i.stk === stk);
    if (!item) return;

    document.getElementById('modal-nh-title').innerHTML = `<i class="fa-solid fa-pen mr-2 text-yellow-300"></i> Sửa tài khoản ngân hàng`;
    document.getElementById('nh-is-edit').value = "1";

    const inputStk = document.getElementById('nh-stk');
    inputStk.value = item.stk;
    inputStk.setAttribute('readonly', true);
    inputStk.classList.add('bg-gray-100');

    document.getElementById('nh-ten').value = item.tenNganHang || "";
    document.getElementById('nh-chinhanh').value = item.chiNhanh || "";
    document.getElementById('nh-tkketoan').value = item.tkKeToan || "1121";

    document.getElementById('modal-nganhang').classList.remove('hidden');
    document.getElementById('nh-ten').focus();
}

// 3. Đóng modal
function dongModalNganHang() {
    document.getElementById('modal-nganhang').classList.add('hidden');
}

// 4. Lưu tài khoản ngân hàng (Xử lý chung cho Thêm & Sửa)
async function luuTaiKhoanNganHang() {
    const isEdit = document.getElementById('nh-is-edit').value === "1";
    const stk = document.getElementById('nh-stk').value.trim();
    const tenNganHang = document.getElementById('nh-ten').value.trim();
    const chiNhanh = document.getElementById('nh-chinhanh').value.trim();
    const tkKeToan = document.getElementById('nh-tkketoan').value.trim() || "1121";

    if (!stk || !tenNganHang) {
        alert("Vui lòng nhập đầy đủ Số tài khoản và Tên ngân hàng!");
        return;
    }

    const endpoint = isEdit ? '/api/sua-ngan-hang' : '/api/them-ngan-hang';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stk, tenNganHang, chiNhanh, tkKeToan })
        });
        const result = await res.json();

        if (res.ok && result.success) {
            alert(result.message);
            dongModalNganHang();
            taiDanhSachNganHang();
        } else {
            alert(result.message || "Thao tác không thành công!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

// 5. Render bảng Ngân hàng
function renderBangNganHang(danhSach) {
    const tbody = document.getElementById('tbody-danhmuc-nganhang');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!danhSach || danhSach.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-gray-400 italic">Chưa có tài khoản ngân hàng công ty nào.</td></tr>`;
        return;
    }

    danhSach.forEach((item, index) => {
        const stkSafe = escapeHtml(item.stk);
        const stkJs = encodeURIComponent(String(item.stk ?? ''));
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 text-center text-gray-500">${index + 1}</td>
            <td class="py-3 px-4 font-bold text-orange-900">${stkSafe}</td>
            <td class="py-3 px-4 font-medium text-gray-800">${escapeHtml(item.tenNganHang)}</td>
            <td class="py-3 px-4 text-gray-600">${escapeHtml(item.chiNhanh || '-')}</td>
            <td class="py-3 px-4 text-center font-mono font-semibold text-blue-700">${escapeHtml(item.tkKeToan || '1121')}</td>
            <td class="py-3 px-4 text-center space-x-3">
                <button type="button" onclick="moModalSuaNganHang(decodeURIComponent('${stkJs}'))" class="text-blue-600 hover:underline text-xs font-medium"><i class="fa-solid fa-pen mr-1"></i>Sửa</button>
                <button type="button" onclick="xoaTaiKhoanNH(decodeURIComponent('${stkJs}'))" class="text-red-600 hover:underline text-xs font-medium"><i class="fa-solid fa-trash mr-1"></i>Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 4b. Tải danh sách tài khoản ngân hàng công ty từ Server
async function taiDanhSachNganHang() {
    const tbody = document.getElementById('tbody-danhmuc-nganhang');
    try {
        const res = await fetch('/api/danh-sach-ngan-hang', { cache: 'no-store' });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || 'Máy chủ trả về lỗi');
        window.danhSachNganHangServer = result.data || [];
        renderBangNganHang(window.danhSachNganHangServer);
    } catch (e) {
        console.error("Lỗi tải danh sách ngân hàng:", e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-500 italic">Không tải được danh sách tài khoản ngân hàng. Vui lòng thử lại.</td></tr>`;
    }
}

// 4c. Xóa tài khoản ngân hàng
async function xoaTaiKhoanNH(stk) {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ngân hàng ${stk}?`)) return;
    try {
        const res = await fetch(`/api/xoa-ngan-hang/${encodeURIComponent(stk)}`, { method: 'DELETE' });
        const result = await res.json();
        alert(result.message || (res.ok && result.success ? "Đã xóa!" : "Xóa không thành công!"));
        if (res.ok && result.success) taiDanhSachNganHang();
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

// 5. Tải danh mục hệ thống tài khoản kế toán từ Server theo chế độ hiện tại
async function taiHeThongTaiKhoan() {
    const tbody = document.getElementById('tbody-hethong-taikhoan');
    const cheDo = localStorage.getItem('BIZMATE_CHEDO_KETOAN') || '';
    const query = cheDo ? `?cheDo=${encodeURIComponent(cheDo)}` : '';

    try {
        const res = await fetch(`/api/he-thong-tai-khoan${query}`, { cache: 'no-store' });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || 'Lỗi tải hệ thống tài khoản');
        window.heThongTaiKhoanServer = result.data || [];
        renderHeThongTaiKhoan(window.heThongTaiKhoanServer);
    } catch (e) {
        console.error("Lỗi tải hệ thống tài khoản:", e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-500 italic">Không tải được hệ thống tài khoản.</td></tr>`;
    }
}

// 6. Render hệ thống tài khoản kế toán ra bảng
function renderHeThongTaiKhoan(danhSach) {
    const tbody = document.getElementById('tbody-hethong-taikhoan');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!danhSach || danhSach.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-400 italic">Chưa có dữ liệu hệ thống tài khoản.</td></tr>`;
        return;
    }

    danhSach.forEach((item, index) => {
        const isCap1 = Number(item.cap) === 1;
        const tr = document.createElement('tr');
        tr.className = isCap1 ? "bg-gray-50/80 font-bold text-gray-900" : "hover:bg-gray-50 text-gray-700";
        tr.innerHTML = `
            <td class="py-2.5 px-4 text-center text-gray-500">${index + 1}</td>
            <td class="py-2.5 px-4 text-center font-mono text-orange-900">${escapeHtml(item.soHieu)}</td>
            <td class="py-2.5 px-4">${escapeHtml(item.tenTaiKhoan)}</td>
            <td class="py-2.5 px-4 text-center">${escapeHtml(item.cap)}</td>
            <td class="py-2.5 px-4 text-center text-xs">
                <span class="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-medium">${escapeHtml(item.tinhChat)}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 7. Lọc tìm kiếm hệ thống tài khoản nhanh
function locHeThongTaiKhoan() {
    const tuKhoa = (document.getElementById('tim-kiem-tk')?.value || "").toLowerCase().trim();
    const danhSachGoc = window.heThongTaiKhoanServer || [];

    const ketQua = danhSachGoc.filter(item =>
        String(item.soHieu ?? '').toLowerCase().includes(tuKhoa) ||
        String(item.tenTaiKhoan ?? '').toLowerCase().includes(tuKhoa)
    );

    renderHeThongTaiKhoan(ketQua);
}