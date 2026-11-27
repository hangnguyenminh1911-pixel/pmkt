// Giữ tên cũ để tương thích; dùng hàm escapeHtml() chung trong core.js
function escapeHtmlVTHH(str) {
    return escapeHtml(str);
}

// Xác định dòng chứng từ sẽ nhận hàng hóa sau khi Thêm/Sửa.
// - Mở từ nút trên một dòng chứng từ: gắn với dòng đó.
// - Mở từ màn Danh mục (dòng cũ đã bị ẩn/xóa): bỏ liên kết để không ghi đè nhầm dòng cũ.
function datDongNhanHangHoa(btn) {
    if (typeof dongDangChonHangHoa === 'undefined') return;
    if (btn) {
        dongDangChonHangHoa = btn.closest('.item-row');
        return;
    }
    if (!dongDangChonHangHoa || !dongDangChonHangHoa.isConnected || dongDangChonHangHoa.closest('.hidden')) {
        dongDangChonHangHoa = null;
    }
}

// 8. Thêm nhanh hàng hóa mới vào server (Phím tắt F6)
async function themNhanhHangHoa() {
    const ma = prompt("Nhập Mã hàng hóa (ví dụ: SP003):");
    if (!ma) return;
    const ten = prompt("Nhập Tên hàng hóa:");
    if (!ten) return;
    const dvt = prompt("Đơn vị tính (Cái, Hộp, Kg...):") || "Cái";
    const ton = parseFloat(prompt("Số lượng tồn kho ban đầu:") || 0);
    const giaBan = parseFloat(prompt("Đơn giá bán:") || 0);

    try {
        const res = await fetch('/api/them-hang-hoa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ma, ten, dvt, ton, giaBan })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            alert("Thêm hàng hóa mới thành công!");
            if (typeof taiDanhSachHangHoa === 'function') await taiDanhSachHangHoa();
            datDongNhanHangHoa(null);
            if (typeof dongDangChonHangHoa !== 'undefined' && dongDangChonHangHoa && typeof chonHangHoaTuBang === 'function') {
                chonHangHoaTuBang({ ma: ma.trim().toUpperCase(), ten, dvt, ton, giaBan });
            }
            hienThiDanhSachVTHH();
        } else {
            alert(data.message || "Lỗi thêm hàng!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

// 1. Tự động nhảy Tài khoản kho theo Tính chất được chọn
function doiTinhChatHangHoa(tinhChat) {
    const tkKhoSelect = document.getElementById('quick-tkkho-hh');
    if (!tkKhoSelect) return;

    const mapTkKho = {
        hanghoa: '156',
        congcudungcu: '153',
        nguyenvatlieu: '152',
        thanhpham: '155',
        dichvu: 'khong'
    };
    tkKhoSelect.value = mapTkKho[tinhChat] || '156';
}

// Thu gọn hoặc mở rộng khung "Đơn vị chuyển đổi"
function toggleDonViChuyenDoi() {
    const box = document.getElementById('box-don-vi-quydoi');
    const icon = document.getElementById('icon-toggle-quydoi');
    if (!box) return;

    if (box.classList.contains('hidden')) {
        box.classList.remove('hidden');
        if (icon) icon.textContent = "-";
    } else {
        box.classList.add('hidden');
        if (icon) icon.textContent = "+";
    }
}

// Thêm một dòng quy đổi mới vào bảng
function themDongQuyDoi() {
    const tbody = document.getElementById('tbody-don-vi-chuyen-doi');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = "quydoi-row hover:bg-emerald-50/30";
    tr.innerHTML = `
        <td class="p-1.5 border-r">
            <input type="text" placeholder="Ví dụ: Thùng" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-dvt">
        </td>
        <td class="p-1.5 border-r">
            <input type="number" value="1" min="0.0001" step="any" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-tyle">
        </td>
        <td class="p-1.5 border-r">
            <select onchange="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-pheptinh">
                <option value="nhan">Phép nhân</option>
                <option value="chia">Phép chia</option>
            </select>
        </td>
        <td class="p-1.5 border-r">
            <input type="text" readonly placeholder="Mô tả..." class="w-full px-2.5 py-1 border rounded bg-gray-50 text-emerald-800 font-semibold qd-mota">
        </td>
        <td class="p-1.5 text-center">
            <button type="button" onclick="xoaDongQuyDoi(this)" class="text-red-500 hover:text-red-700 text-sm" title="Xóa dòng"><i class="fa-solid fa-trash-can"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
}

function xoaDongQuyDoi(btn) {
    const row = btn.closest('tr');
    if (row) row.remove();
}

function xoaHetDongQuyDoi() {
    const tbody = document.getElementById('tbody-don-vi-chuyen-doi');
    if (tbody) tbody.innerHTML = "";
}

function tuDongTinhMoTa(el) {
    const row = el ? el.closest('tr') : null;
    const dvtChinh = document.getElementById('quick-dvt-hh')?.value.trim() || "ĐVT chính";
    const rows = row ? [row] : document.querySelectorAll('#tbody-don-vi-chuyen-doi .quydoi-row');

    rows.forEach(r => {
        const dvtQD = r.querySelector('.qd-dvt')?.value.trim();
        const tyLe = parseFloat(r.querySelector('.qd-tyle')?.value) || 1;
        const phepTinh = r.querySelector('.qd-pheptinh')?.value || 'nhan';
        const motaInput = r.querySelector('.qd-mota');

        if (!motaInput) return;
        if (!dvtQD) {
            motaInput.value = "";
            return;
        }
        motaInput.value = phepTinh === 'nhan'
            ? `1 ${dvtQD} = ${tyLe} ${dvtChinh}`
            : `1 ${dvtQD} = 1/${tyLe} ${dvtChinh}`;
    });
}

function capNhatMoTaQuyDoi() {
    tuDongTinhMoTa(null);
}

let dangSuaMaHangHoa = null;

function moModalThemHH(btn) {
    dangSuaMaHangHoa = null;

    const modalTitle = document.querySelector('#modal-them-hang-hoa h3');
    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-box-open mr-2"></i>Thêm nhanh Vật tư, Hàng hóa`;

    const inputMa = document.getElementById('quick-ma-hh');
    if (inputMa) {
        inputMa.removeAttribute('readonly');
        inputMa.classList.remove('bg-gray-100');
        inputMa.value = "";
    }

    const tinhChatEl = document.getElementById('quick-tinhchat-hh');
    if (tinhChatEl) {
        tinhChatEl.value = "hanghoa";
        doiTinhChatHangHoa("hanghoa");
    }

    if (document.getElementById('quick-ten-hh')) document.getElementById('quick-ten-hh').value = "";
    if (document.getElementById('quick-dvt-hh')) document.getElementById('quick-dvt-hh').value = "Cái";
    if (document.getElementById('quick-ton-hh')) document.getElementById('quick-ton-hh').value = "0";
    if (document.getElementById('quick-giamua-hh')) document.getElementById('quick-giamua-hh').value = "0";
    if (document.getElementById('quick-gia-hh')) document.getElementById('quick-gia-hh').value = "0";

    const tbodyQD = document.getElementById('tbody-don-vi-chuyen-doi');
    if (tbodyQD) tbodyQD.innerHTML = "";

    datDongNhanHangHoa(btn);
    const boxHH = document.getElementById('dropdown-table-hh');
    if (boxHH) boxHH.classList.add('hidden');

    document.getElementById('modal-them-hang-hoa')?.classList.remove('hidden');
    if (inputMa) inputMa.focus();
}

function dongModalThemHH() {
    document.getElementById('modal-them-hang-hoa')?.classList.add('hidden');
}

async function luuNhanhHangHoa() {
    const tinhChat = document.getElementById('quick-tinhchat-hh')?.value || 'hanghoa';
    const tkKho = document.getElementById('quick-tkkho-hh')?.value || '156';
    const ma = document.getElementById('quick-ma-hh')?.value.trim().toUpperCase() || '';
    const ten = document.getElementById('quick-ten-hh')?.value.trim() || '';
    const dvt = document.getElementById('quick-dvt-hh')?.value.trim() || "Cái";
    const ton = parseFloat(document.getElementById('quick-ton-hh')?.value) || 0;
    const giaVon = parseFloat((document.getElementById('quick-giamua-hh')?.value || "0").replace(/,/g, '')) || 0;
    const giaBan = parseFloat((document.getElementById('quick-gia-hh')?.value || "0").replace(/,/g, '')) || 0;

    if (!ma || !ten) {
        alert("Vui lòng nhập đầy đủ Mã và Tên hàng hóa!");
        return;
    }

    const danhSachQuyDoi = [];
    document.querySelectorAll('#tbody-don-vi-chuyen-doi .quydoi-row').forEach(r => {
        const dvtQD = r.querySelector('.qd-dvt')?.value.trim();
        const tyLe = parseFloat(r.querySelector('.qd-tyle')?.value) || 1;
        const phepTinh = r.querySelector('.qd-pheptinh')?.value;
        const moTa = r.querySelector('.qd-mota')?.value;
        if (dvtQD) danhSachQuyDoi.push({ dvtQD, tyLe, phepTinh, moTa });
    });

    const payloadHH = {
        ma, ten, tinhChat, tkKho, dvt, ton, giaVon, giaBan,
        donViChuyenDoi: danhSachQuyDoi
    };

    const url = dangSuaMaHangHoa ? '/api/cap-nhat-hang-hoa' : '/api/them-hang-hoa';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadHH)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            alert(dangSuaMaHangHoa ? "Cập nhật hàng hóa thành công!" : "Đã thêm hàng hóa mới thành công!");
            if (typeof taiDanhSachHangHoa === 'function') await taiDanhSachHangHoa();
            if (typeof dongDangChonHangHoa !== 'undefined' && dongDangChonHangHoa && typeof chonHangHoaTuBang === 'function') {
                chonHangHoaTuBang(payloadHH);
            }
            hienThiDanhSachVTHH();
            dongModalThemHH();
        } else {
            alert(data.message || "Thao tác không thành công!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ! Hãy kiểm tra terminal 'node server.js'");
    }
}

function moModalSuaHH(maHang) {
    const hh = (window.danhSachHangHoaServer || []).find(i => i.ma === maHang);
    if (!hh) {
        alert("Không tìm thấy thông tin hàng hóa!");
        return;
    }

    dangSuaMaHangHoa = maHang;
    datDongNhanHangHoa(null);

    const modalTitle = document.querySelector('#modal-them-hang-hoa h3');
    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square mr-2"></i>Sửa thông tin Vật tư, Hàng hóa: ${escapeHtmlVTHH(hh.ma)}`;

    const inputMa = document.getElementById('quick-ma-hh');
    if (inputMa) {
        inputMa.value = hh.ma;
        inputMa.setAttribute('readonly', true);
        inputMa.classList.add('bg-gray-100');
    }

    if (document.getElementById('quick-tinhchat-hh')) document.getElementById('quick-tinhchat-hh').value = hh.tinhChat || "hanghoa";
    if (document.getElementById('quick-tkkho-hh')) document.getElementById('quick-tkkho-hh').value = hh.tkKho || "156";
    if (document.getElementById('quick-ten-hh')) document.getElementById('quick-ten-hh').value = hh.ten || "";
    if (document.getElementById('quick-dvt-hh')) document.getElementById('quick-dvt-hh').value = hh.dvt || "Cái";
    if (document.getElementById('quick-ton-hh')) document.getElementById('quick-ton-hh').value = hh.ton || "0";

    if (document.getElementById('quick-giamua-hh')) {
        document.getElementById('quick-giamua-hh').value = Number(hh.giaVon || 0).toLocaleString('en-US');
    }
    if (document.getElementById('quick-gia-hh')) {
        document.getElementById('quick-gia-hh').value = Number(hh.giaBan || 0).toLocaleString('en-US');
    }

    const tbodyQD = document.getElementById('tbody-don-vi-chuyen-doi');
    if (tbodyQD) {
        tbodyQD.innerHTML = "";
        let dsQD = [];
        if (Array.isArray(hh.donViChuyenDoi)) dsQD = hh.donViChuyenDoi;
        else if (hh.quyDoi) dsQD = [hh.quyDoi];

        dsQD.forEach(qd => {
            const tr = document.createElement('tr');
            tr.className = "quydoi-row hover:bg-emerald-50/30";
            tr.innerHTML = `
                <td class="p-1.5 border-r">
                    <input type="text" value="${escapeHtmlVTHH(qd.dvtQD || qd.dvtQuyDoi || '')}" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-dvt">
                </td>
                <td class="p-1.5 border-r">
                    <input type="number" value="${escapeHtmlVTHH(qd.tyLe || qd.tyLeQuyDoi || 1)}" min="0.0001" step="any" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-tyle">
                </td>
                <td class="p-1.5 border-r">
                    <select onchange="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-pheptinh">
                        <option value="nhan" ${(qd.phepTinh || qd.phepTinhQuyDoi) === 'nhan' ? 'selected' : ''}>Phép nhân</option>
                        <option value="chia" ${(qd.phepTinh || qd.phepTinhQuyDoi) === 'chia' ? 'selected' : ''}>Phép chia</option>
                    </select>
                </td>
                <td class="p-1.5 border-r">
                    <input type="text" readonly value="${escapeHtmlVTHH(qd.moTa || qd.moTaQuyDoi || '')}" class="w-full px-2.5 py-1 border rounded bg-gray-50 text-emerald-800 font-semibold qd-mota">
                </td>
                <td class="p-1.5 text-center">
                    <button type="button" onclick="xoaDongQuyDoi(this)" class="text-red-500 hover:text-red-700 text-sm" title="Xóa dòng"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbodyQD.appendChild(tr);
        });
    }

    document.getElementById('modal-them-hang-hoa')?.classList.remove('hidden');
}

function locDanhSachVTHH() {
    const tuKhoa = (document.getElementById('tim-kiem-vthh')?.value || "").trim().toLowerCase();
    const tinhChatLoc = document.getElementById('loc-tinhchat-vthh')?.value || "tat_ca";
    const danhSachGoc = window.danhSachHangHoaServer || [];

    const ketQua = danhSachGoc.filter(item => {
        const matchTuKhoa = !tuKhoa ||
            (item.ma && String(item.ma).toLowerCase().includes(tuKhoa)) ||
            (item.ten && String(item.ten).toLowerCase().includes(tuKhoa));

        const itemTC = item.tinhChat || "hanghoa";
        const matchTinhChat = (tinhChatLoc === "tat_ca") || (itemTC === tinhChatLoc);

        return matchTuKhoa && matchTinhChat;
    });

    hienThiDanhSachVTHH(ketQua);
}

function datLaiBoLocVTHH() {
    const inputSearch = document.getElementById('tim-kiem-vthh');
    const selectFilter = document.getElementById('loc-tinhchat-vthh');
    if (inputSearch) inputSearch.value = "";
    if (selectFilter) selectFilter.value = "tat_ca";

    hienThiDanhSachVTHH(window.danhSachHangHoaServer || []);
}

function hienThiDanhSachVTHH(danhSachTuyChon = null) {
    const tbody = document.getElementById('tbody-danhmuc-vthh') || document.querySelector('#view-danhmuc-vthh tbody');
    const footerCount = document.getElementById('lbl-tong-so-vthh');
    if (!tbody) return;
    tbody.innerHTML = "";

    const danhSach = danhSachTuyChon !== null ? danhSachTuyChon : (window.danhSachHangHoaServer || []);

    if (footerCount) {
        footerCount.textContent = String(danhSach.length).padStart(2, '0');
    }

    if (danhSach.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="py-6 text-center text-gray-400 italic">Không tìm thấy vật tư, hàng hóa nào phù hợp.</td></tr>`;
        return;
    }

    const mapTinhChat = {
        "hanghoa": { ten: "Hàng hóa", color: "bg-blue-100 text-blue-800" },
        "dichvu": { ten: "Dịch vụ", color: "bg-purple-100 text-purple-800" },
        "nguyenvatlieu": { ten: "Nguyên vật liệu", color: "bg-amber-100 text-amber-800" },
        "thanhpham": { ten: "Thành phẩm", color: "bg-emerald-100 text-emerald-800" },
        "congcudungcu": { ten: "CCDC", color: "bg-gray-100 text-gray-800" }
    };

    danhSach.forEach((item, index) => {
        const tcKey = item.tinhChat || "hanghoa";
        const tcInfo = mapTinhChat[tcKey] || { ten: "Hàng hóa", color: "bg-blue-100 text-blue-800" };
        const maSafe = escapeHtmlVTHH(item.ma);
        const maEnc = maHoaThamSoOnclick(item.ma);

        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-center">
                <input type="checkbox" value="${maSafe}" class="chk-item-vthh rounded text-orange-900 focus:ring-orange-700 cursor-pointer" onchange="capNhatNutXoaVTHH()">
            </td>
            <td class="py-2.5 px-3 text-center text-gray-500 font-medium">${index + 1}</td>
            <td class="py-2.5 px-3 font-medium text-orange-900">${maSafe}</td>
            <td class="py-2.5 px-3 font-medium text-gray-800">${escapeHtmlVTHH(item.ten)}</td>
            <td class="py-2.5 px-3 text-center">
                <span class="${tcInfo.color} text-xs px-2.5 py-0.5 rounded-full font-medium inline-block">
                    ${tcInfo.ten}
                </span>
            </td>
            <td class="py-2.5 px-3 text-center">${escapeHtmlVTHH(item.dvt || "Cái")}</td>
            <td class="py-2.5 px-3 text-right">${Number(item.giaVon || 0).toLocaleString('en-US')} đ</td>
            <td class="py-2.5 px-3 text-right font-semibold text-blue-700">${Number(item.giaBan || 0).toLocaleString('en-US')} đ</td>
            <td class="py-2.5 px-3 text-center whitespace-nowrap">
                <div class="inline-flex items-center justify-center space-x-3">
                    <button type="button" onclick="moModalSuaHH(decodeURIComponent('${maEnc}'))" class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition" title="Sửa hàng hóa">
                        <i class="fa-solid fa-pen text-[11px] mr-1"></i>Sửa
                    </button>
                    <button type="button" onclick="xoaHangHoa(decodeURIComponent('${maEnc}'))" class="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 hover:underline transition" title="Xóa hàng hóa">
                        <i class="fa-solid fa-trash text-[11px] mr-1"></i>Xóa
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function suaHangHoaTaiDong(btn) {
    const row = btn.closest('.item-row');
    if (!row) return;

    if (typeof dongDangChonHangHoa !== 'undefined') {
        dongDangChonHangHoa = row;
    }

    const inputMa = row.querySelector('.item-mahang');
    const maHang = inputMa ? inputMa.value.trim().toUpperCase() : "";

    if (!maHang) {
        alert("Dòng này chưa chọn hàng hóa! Vui lòng chọn hoặc nhập mã hàng trước khi sửa.");
        if (inputMa) inputMa.focus();
        return;
    }

    if (typeof dongBangChonHH === "function") dongBangChonHH();
    moModalSuaHH(maHang);
}

async function xoaHangHoa(maHang) {
    if (!confirm(`Bạn có chắc chắn muốn xóa vật tư, hàng hóa [${maHang}] không?`)) return;

    try {
        const res = await fetch(`/api/xoa-hang-hoa/${encodeURIComponent(maHang)}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok && data.success) {
            alert(data.message);
            if (typeof taiDanhSachHangHoa === 'function') await taiDanhSachHangHoa();
            locDanhSachVTHH();
        } else {
            alert(data.message || "Không thể xóa hàng hóa này!");
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ! Hãy kiểm tra terminal 'node server.js'");
    }
}

function chonTatCaVTHH(masterChk) {
    document.querySelectorAll('.chk-item-vthh').forEach(c => {
        c.checked = masterChk.checked;
    });
    capNhatNutXoaVTHH();
}

function capNhatNutXoaVTHH() {
    const tatCaItems = document.querySelectorAll('.chk-item-vthh');
    const dsChon = Array.from(document.querySelectorAll('.chk-item-vthh:checked')).map(c => c.value);

    const btn = document.getElementById('btn-xoa-nhieu-vthh');
    const lblCount = document.getElementById('count-chon-vthh');
    const masterChk = document.getElementById('chk-all-vthh');

    if (lblCount) lblCount.textContent = dsChon.length;
    if (masterChk && tatCaItems.length > 0) {
        masterChk.checked = (dsChon.length === tatCaItems.length);
    }

    if (btn) {
        if (dsChon.length > 0) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }
}

async function xoaNhieuVTHH() {
    const dsChon = Array.from(document.querySelectorAll('.chk-item-vthh:checked')).map(c => c.value);
    if (dsChon.length === 0) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa ${dsChon.length} mặt hàng đã chọn không?`)) return;

    try {
        const res = await fetch('/api/xoa-nhieu-hang-hoa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ danhSachMa: dsChon })
        });
        const result = await res.json();
        alert(result.message || (res.ok && result.success ? "Đã xóa thành công!" : "Xóa không thành công!"));

        if (res.ok && result.success) {
            if (typeof taiDanhSachHangHoa === 'function') await taiDanhSachHangHoa();
            hienThiDanhSachVTHH();

            const master = document.getElementById('chk-all-vthh');
            if (master) master.checked = false;
            capNhatNutXoaVTHH();
        }
    } catch (e) {
        alert("Lỗi kết nối khi xóa hàng hóa hàng loạt! Hãy kiểm tra terminal server.");
    }
}