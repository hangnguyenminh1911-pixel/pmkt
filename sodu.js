// ==========================================
// QUẢN LÝ SỐ DƯ ĐẦU KỲ & XỬ LÝ EXCEL (GỌI API QUA SERVER)
// ==========================================

let duLieuPreviewSoDu = null;
let loaiTabDangImport = "kho"; // 'kho' hoặc 'congno'
let cheDoImportHienTai = "themmoi"; // 'themmoi' hoặc 'capnhat'

// Biến bộ nhớ cache lưu số dư tải từ Server
window.serverSoDuCache = {
    tonKho: {},
    congNo: {},
    tien: {}
};

// 1. Tải toàn bộ dữ liệu số dư từ Server
async function taiSoDuTuServer() {
    try {
        const res = await fetch('/api/so-du');
        const result = await res.json();
        if (result.success) {
            window.serverSoDuCache = result.data;
        }
    } catch (e) {
        console.error("Lỗi kết nối tải số dư từ server:", e);
    }
}

// 2. HIỂN THỊ MÀN HÌNH SỐ DƯ
async function hienThiManHinhSoDuDauKy() {
    const viewSoDu = document.getElementById('view-sodu-dauky');
    if (!viewSoDu) return;
    
    // Đồng bộ dữ liệu mới nhất từ server trước khi render
    await taiSoDuTuServer();
    
    renderSoDuTonKho();
    renderSoDuCongNo();
}

// 3. CHUYỂN TAB SỐ DƯ
async function chuyenTabSoDu(loai) {
    const subKho = document.getElementById('subview-sodu-kho');
    const subCongNo = document.getElementById('subview-sodu-congno');
    const subTien = document.getElementById('subview-sodu-tien');

    const btnKho = document.getElementById('tab-sodu-kho');
    const btnCongNo = document.getElementById('tab-sodu-congno');
    const btnTien = document.getElementById('tab-sodu-tien');

    if (subKho) subKho.classList.add('hidden');
    if (subCongNo) subCongNo.classList.add('hidden');
    if (subTien) subTien.classList.add('hidden');

    if (btnKho) btnKho.className = "text-gray-500 hover:text-gray-800 pb-1 px-2 transition shrink-0";
    if (btnCongNo) btnCongNo.className = "text-gray-500 hover:text-gray-800 pb-1 px-2 transition shrink-0";
    if (btnTien) btnTien.className = "text-gray-500 hover:text-gray-800 pb-1 px-2 transition shrink-0";

    // Đồng bộ dữ liệu mới nhất từ server trước khi đổi tab
    await taiSoDuTuServer();

    if (loai === 'kho') {
        if (subKho) subKho.classList.remove('hidden');
        if (btnKho) btnKho.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-2 transition font-bold shrink-0";
        renderSoDuTonKho();
    } else if (loai === 'congno') {
        if (subCongNo) subCongNo.classList.remove('hidden');
        if (btnCongNo) btnCongNo.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-2 transition font-bold shrink-0";
        renderSoDuCongNo();
    } else if (loai === 'tien') {
        if (subTien) subTien.classList.remove('hidden');
        if (btnTien) btnTien.className = "text-orange-900 border-b-2 border-orange-900 pb-1 px-2 transition font-bold shrink-0";
        renderSoDuTaiKhoanTien();
    }
}

// ==========================================
// RENDER TỒN KHO & CÔNG NỢ
// ==========================================
function renderSoDuTonKho() {
    const tbody = document.getElementById('tbody-sodu-tonkho');
    if (!tbody) return;
    tbody.innerHTML = "";

    const danhSachHH = window.danhSachHangHoaServer || [];
    let dataSoDu = window.serverSoDuCache.tonKho || {};
    
    const chiHienThiCoSoDu = document.getElementById('chk-chi-hien-thi-co-sodu-kho')?.checked || false;
    const tuKhoa = (document.getElementById('search-sodu-kho')?.value || "").toLowerCase().trim();

    let tongSL = 0;
    let tongTien = 0;
    let demHienThi = 0;

    danhSachHH.forEach((item) => {
        const savedItem = dataSoDu[item.ma] || { sl: item.ton || 0, gia: item.giaVon || 0 };
        const sl = parseFloat(savedItem.sl) || 0;
        const gia = parseFloat(savedItem.gia) || 0;
        const thanhTien = sl * gia;

        const matchTuKhoa = !tuKhoa || 
            (item.ma && item.ma.toLowerCase().includes(tuKhoa)) || 
            (item.ten && item.ten.toLowerCase().includes(tuKhoa));
        if (!matchTuKhoa) return;

        if (chiHienThiCoSoDu && sl === 0 && thanhTien === 0) return;

        demHienThi++;
        tongSL += sl;
        tongTien += thanhTien;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 sodu-kho-row";
        tr.dataset.ma = item.ma;
        tr.innerHTML = `
            <td class="py-2.5 px-4 text-center text-gray-500">${demHienThi}</td>
            <td class="py-2.5 px-4 text-center font-bold text-orange-900">${item.ma}</td>
            <td class="py-2.5 px-4 font-medium text-gray-800">${item.ten}</td>
            <td class="py-2.5 px-4 text-center">${item.dvt || 'Cái'}</td>
            <td class="py-2.5 px-4 text-center">
                <input type="number" min="0" value="${sl}" onfocus="this.select()" oninput="tinhThanhTienSoDuKho(this)" class="w-full px-2 py-1 border rounded text-center font-bold sodu-sl focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white">
            </td>
            <td class="py-2.5 px-4 text-right">
                <input type="text" value="${Number(gia).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhThanhTienSoDuKho(this)" class="w-full px-2 py-1 border rounded text-right font-medium sodu-gia focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white">
            </td>
            <td class="py-2.5 px-4 text-right font-bold text-orange-900 sodu-thanhtien">
                ${Number(thanhTien).toLocaleString('en-US')} đ
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (demHienThi === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400 italic">Không tìm thấy mặt hàng nào phù hợp.</td></tr>`;
    }

    document.getElementById('footer-tong-sl-ton').textContent = Number(tongSL).toLocaleString('en-US');
    document.getElementById('footer-tong-tien-ton').textContent = Number(tongTien).toLocaleString('en-US') + " đ";
}

function tinhThanhTienSoDuKho(input) {
    const row = input.closest('tr');
    const sl = parseFloat(row.querySelector('.sodu-sl').value) || 0;
    const gia = parseFloat(row.querySelector('.sodu-gia').value.replace(/,/g, '')) || 0;
    const tt = sl * gia;
    row.querySelector('.sodu-thanhtien').textContent = Number(tt).toLocaleString('en-US') + " đ";
    tinhTongCongTonKho();
}

function tinhTongCongTonKho() {
    let tongSL = 0;
    let tongTien = 0;
    document.querySelectorAll('.sodu-kho-row').forEach(r => {
        const sl = parseFloat(r.querySelector('.sodu-sl').value) || 0;
        const gia = parseFloat(r.querySelector('.sodu-gia').value.replace(/,/g, '')) || 0;
        tongSL += sl;
        tongTien += (sl * gia);
    });
    document.getElementById('footer-tong-sl-ton').textContent = Number(tongSL).toLocaleString('en-US');
    document.getElementById('footer-tong-tien-ton').textContent = Number(tongTien).toLocaleString('en-US') + " đ";
}

function datLaiSoDuKhoVeKhong() {
    if (!confirm("Bạn có muốn đặt lại toàn bộ số lượng và đơn giá tồn kho về 0 không?")) return;
    document.querySelectorAll('.sodu-kho-row').forEach(r => {
        r.querySelector('.sodu-sl').value = 0;
        r.querySelector('.sodu-gia').value = "0";
        r.querySelector('.sodu-thanhtien').textContent = "0 đ";
    });
    tinhTongCongTonKho();
}

// Lưu số dư tồn kho lên Server
async function luuSoDuTonKho() {
    const rows = document.querySelectorAll('.sodu-kho-row');
    let dataToSave = {};

    rows.forEach(r => {
        const ma = r.dataset.ma;
        const sl = parseFloat(r.querySelector('.sodu-sl').value) || 0;
        const gia = parseFloat(r.querySelector('.sodu-gia').value.replace(/,/g, '')) || 0;
        dataToSave[ma] = { sl, gia };
    });

    try {
        const res = await fetch('/api/so-du/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'kho', data: dataToSave })
        });
        const result = await res.json();
        if (result.success) {
            window.serverSoDuCache.tonKho = dataToSave;
            alert("Đã lưu số dư tồn kho đầu kỳ lên server thành công!");
        } else {
            alert(result.message || "Lỗi lưu số dư tồn kho!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi lưu tồn kho!");
    }
}

function renderSoDuCongNo() {
    const tbody = document.getElementById('tbody-sodu-congno');
    if (!tbody) return;
    tbody.innerHTML = "";

    const danhSachDT = window.danhSachKhachHangServer || [];
    let dataSoDu = window.serverSoDuCache.congNo || {};
    
    const chiHienThiCoSoDu = document.getElementById('chk-chi-hien-thi-co-sodu-cn')?.checked || false;
    const tuKhoa = (document.getElementById('search-sodu-cn')?.value || "").toLowerCase().trim();
    const phanLoaiLoc = document.getElementById('filter-phanloai-cn')?.value || "tat_ca";

    let tongNo131 = 0;
    let tongCo331 = 0;
    let demHienThi = 0;

    danhSachDT.forEach((item) => {
        const savedItem = dataSoDu[item.ma] || { no131: 0, co331: 0 };
        const no131 = parseFloat(savedItem.no131) || 0;
        const co331 = parseFloat(savedItem.co331) || 0;
        const plStr = item.phanLoai || "Khách hàng";
        const mstStr = item.mst || "";

        if (phanLoaiLoc === "khach_hang" && !plStr.includes("Khách hàng")) return;
        if (phanLoaiLoc === "nha_cung_cap" && !plStr.includes("Nhà cung cấp")) return;

        const matchTuKhoa = !tuKhoa || 
            (item.ma && item.ma.toLowerCase().includes(tuKhoa)) || 
            (item.ten && item.ten.toLowerCase().includes(tuKhoa)) ||
            (mstStr && mstStr.toLowerCase().includes(tuKhoa));
        if (!matchTuKhoa) return;

        if (chiHienThiCoSoDu && no131 === 0 && co331 === 0) return;

        demHienThi++;
        tongNo131 += no131;
        tongCo331 += co331;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 sodu-cn-row";
        tr.dataset.ma = item.ma;
        tr.innerHTML = `
            <td class="py-2.5 px-3 text-center text-gray-500">${demHienThi}</td>
            <td class="py-2.5 px-3 font-bold text-orange-900">${item.ma}</td>
            <td class="py-2.5 px-3 font-semibold text-gray-700">${mstStr || "-"}</td>
            <td class="py-2.5 px-4 font-medium text-gray-800">${item.ten}</td>
            <td class="py-2.5 px-3 text-center"><span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium">${plStr}</span></td>
            <td class="py-2.5 px-3 text-right">
                <input type="text" value="${Number(no131).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhTongCongCongNo()" class="w-full px-2 py-1 border rounded text-right font-medium sodu-no131 focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white">
            </td>
            <td class="py-2.5 px-3 text-right">
                <input type="text" value="${Number(co331).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhTongCongCongNo()" class="w-full px-2 py-1 border rounded text-right font-medium sodu-co331 focus:outline-none focus:ring-1 focus:ring-orange-700 bg-white">
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (demHienThi === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400 italic">Không tìm thấy đối tượng nào phù hợp với điều kiện lọc.</td></tr>`;
    }

    document.getElementById('footer-tong-no-131').textContent = Number(tongNo131).toLocaleString('en-US') + " đ";
    document.getElementById('footer-tong-co-331').textContent = Number(tongCo331).toLocaleString('en-US') + " đ";
}

function tinhTongCongCongNo() {
    let tongNo131 = 0;
    let tongCo331 = 0;
    document.querySelectorAll('.sodu-cn-row').forEach(r => {
        const no = parseFloat(r.querySelector('.sodu-no131').value.replace(/,/g, '')) || 0;
        const co = parseFloat(r.querySelector('.sodu-co331').value.replace(/,/g, '')) || 0;
        tongNo131 += no;
        tongCo331 += co;
    });
    document.getElementById('footer-tong-no-131').textContent = Number(tongNo131).toLocaleString('en-US') + " đ";
    document.getElementById('footer-tong-co-331').textContent = Number(tongCo331).toLocaleString('en-US') + " đ";
}

function datLaiSoDuCNVeKhong() {
    if (!confirm("Bạn có muốn đặt lại toàn bộ số dư công nợ về 0 không?")) return;
    document.querySelectorAll('.sodu-cn-row').forEach(r => {
        r.querySelector('.sodu-no131').value = "0";
        r.querySelector('.sodu-co331').value = "0";
    });
    tinhTongCongCongNo();
}

// Lưu số dư công nợ lên Server
async function luuSoDuCongNo() {
    const rows = document.querySelectorAll('.sodu-cn-row');
    let dataToSave = {};

    rows.forEach(r => {
        const ma = r.dataset.ma;
        const no131 = parseFloat(r.querySelector('.sodu-no131').value.replace(/,/g, '')) || 0;
        const co331 = parseFloat(r.querySelector('.sodu-co331').value.replace(/,/g, '')) || 0;
        dataToSave[ma] = { no131, co331 };
    });

    try {
        const res = await fetch('/api/so-du/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'congno', data: dataToSave })
        });
        const result = await res.json();
        if (result.success) {
            window.serverSoDuCache.congNo = dataToSave;
            alert("Đã lưu số dư công nợ đầu kỳ lên server thành công!");
        } else {
            alert(result.message || "Lỗi lưu số dư công nợ!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi lưu công nợ!");
    }
}

function renderSoDuTaiKhoanTien() {
    let dataSoDu = window.serverSoDuCache.tien || {};
    const inputTM = document.getElementById('sodu-tienmat-vnd');
    if (inputTM) {
        inputTM.value = Number(dataSoDu.tienMat || 0).toLocaleString('en-US');
    }
}

// Lưu số dư tài khoản tiền lên Server
async function luuSoDuTaiKhoanTien() {
    const tienMat = parseFloat(document.getElementById('sodu-tienmat-vnd')?.value.replace(/,/g, '')) || 0;
    const dataToSave = { tienMat, nganHang: [] };
    
    try {
        const res = await fetch('/api/so-du/luu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loai: 'tien', data: dataToSave })
        });
        const result = await res.json();
        if (result.success) {
            window.serverSoDuCache.tien = dataToSave;
            alert("Đã lưu số dư Tài khoản tiền lên server thành công!");
        } else {
            alert(result.message || "Lỗi lưu số dư tài khoản tiền!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối máy chủ khi lưu tài khoản tiền!");
    }
}

// ==========================================
// ĐIỀU KHIỂN MENU DROPDOWN NHẬP EXCEL
// ==========================================
function toggleMenuNhapExcel(menuId, event) {
    if (event) event.stopPropagation();
    document.querySelectorAll('[id^="dropdown-nhap-"]').forEach(el => {
        if (el.id !== menuId) el.classList.add('hidden');
    });
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('hidden');
}

window.addEventListener('click', function() {
    document.querySelectorAll('[id^="dropdown-nhap-"]').forEach(el => {
        el.classList.add('hidden');
    });
});

// ==========================================
// TẢI MẪU & XUẤT / NHẬP EXCEL SỐ DƯ
// ==========================================
function taiFileMauExcelSoDu(loai) {
    const wb = XLSX.utils.book_new();
    if (loai === 'kho') {
        const wsData = [
            ["MA_HANG", "TEN_HANG", "DVT", "SO_LUONG_TON", "DON_GIA_VON"],
            ["HH001", "Gạch ốp lát 60x60", "M2", 150, 120000]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{wch: 15}, {wch: 30}, {wch: 10}, {wch: 16}, {wch: 16}];
        XLSX.utils.book_append_sheet(wb, ws, "SoDu_TonKho");
        XLSX.writeFile(wb, "FileMau_SoDu_TonKho.xlsx");
    } else if (loai === 'congno') {
        const wsData = [
            ["MA_DOI_TUONG", "TEN_DOI_TUONG", "PHAN_LOAI", "DU_NO_131", "DU_CO_331"],
            ["KH001", "Công ty TNHH ABC", "Khách hàng", 15000000, 0]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{wch: 18}, {wch: 35}, {wch: 18}, {wch: 16}, {wch: 16}];
        XLSX.utils.book_append_sheet(wb, ws, "SoDu_CongNo");
        XLSX.writeFile(wb, "FileMau_SoDu_CongNo.xlsx");
    }
}

function xuatExcelSoDuPhanHe(loai) {
    const wb = XLSX.utils.book_new();
    if (loai === 'kho') {
        let dataKho = [];
        const dsHang = window.danhSachHangHoaServer || [];
        let soDuKho = window.serverSoDuCache.tonKho || {};
        dsHang.forEach(item => {
            const s = soDuKho[item.ma] || { sl: item.ton || 0, gia: item.giaVon || 0 };
            dataKho.push({ "Mã hàng": item.ma, "Tên hàng": item.ten, "ĐVT": item.dvt || "Cái", "Số lượng tồn": s.sl, "Đơn giá vốn": s.gia });
        });
        const ws = XLSX.utils.json_to_sheet(dataKho);
        XLSX.utils.book_append_sheet(wb, ws, "SoDu_TonKho");
        XLSX.writeFile(wb, "SoDuDauKy_TonKho.xlsx");
    }
    alert("Xuất Excel thành công!");
}

function xuLyImportExcelSoDu(event, loai, cheDo) {
    const file = event.target.files[0];
    if (!file) return;

    loaiTabDangImport = loai;
    cheDoImportHienTai = cheDo; // 'themmoi' hoặc 'capnhat'

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            if (jsonSheet.length === 0) {
                alert("Tệp Excel không có dữ liệu!");
                return;
            }

            if (loai === 'kho') {
                thamDinhVaPreviewSoDuKho(jsonSheet, cheDo);
            } else if (loai === 'congno') {
                thamDinhVaPreviewSoDuCongNo(jsonSheet, cheDo);
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi đọc tệp Excel: " + err.message);
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsArrayBuffer(file);
}

// THẨM ĐỊNH TỒN KHO & HIỂN THỊ TIÊU ĐỀ CHUẨN XÁC
function thamDinhVaPreviewSoDuKho(rows, cheDo) {
    const danhSachHH = window.danhSachHangHoaServer || [];
    const maHHSet = new Set(danhSachHH.map(h => h.ma));
    let soDuKhoHienTai = window.serverSoDuCache.tonKho || {};

    let hopLeCount = 0;
    let loiCount = 0;
    let html = "";
    duLieuPreviewSoDu = [];

    rows.forEach((r, idx) => {
        const soDong = idx + 2;
        
        const ma = String(r["MA_HANG"] || r["Mã hàng"] || r["Mã hàng (SKU)"] || r["Mã"] || r["ma"] || "").trim().toUpperCase();
        const ten = String(r["TEN_HANG"] || r["Tên hàng hóa"] || r["Tên hàng"] || r["Tên"] || r["ten"] || "").trim();
        
        const slKey = Object.keys(r).find(k => k.toUpperCase().includes('SO_LUONG') || k.toUpperCase().includes('SL') || k.toUpperCase().includes('TỒN') || k.toUpperCase().includes('TON'));
        const giaKey = Object.keys(r).find(k => k.toUpperCase().includes('DON_GIA') || k.toUpperCase().includes('GIÁ') || k.toUpperCase().includes('VON') || k.toUpperCase().includes('GIA'));

        const sl = parseFloat(slKey ? r[slKey] : (r["SO_LUONG_TON"] || r["Số lượng tồn"] || 0)) || 0;
        const gia = parseFloat(giaKey ? r[giaKey] : (r["DON_GIA_VON"] || r["Đơn giá vốn"] || 0)) || 0;

        let trangThai = '<span class="text-emerald-600 font-bold"><i class="fa-solid fa-check mr-1"></i> Hợp lệ</span>';
        let isLoi = false;

        if (!ma) {
            trangThai = '<span class="text-red-600 font-bold">Thiếu mã hàng</span>';
            isLoi = true;
        } else if (!maHHSet.has(ma)) {
            trangThai = '<span class="text-red-600 font-bold">Mã không có trong danh mục</span>';
            isLoi = true;
        } else {
            if (cheDo === 'themmoi') {
                if (soDuKhoHienTai[ma] && (soDuKhoHienTai[ma].sl > 0 || soDuKhoHienTai[ma].gia > 0)) {
                    trangThai = '<span class="text-red-600 font-bold">Trùng mã (Đã có số dư)</span>';
                    isLoi = true;
                }
            } else if (cheDo === 'capnhat') {
                if (soDuKhoHienTai[ma]) {
                    trangThai = '<span class="text-blue-600 font-bold">Cập nhật thay thế (Ghi đè)</span>';
                }
            }
        }

        if (isLoi) loiCount++; else hopLeCount++;
        duLieuPreviewSoDu.push({ ma, sl, gia, isLoi });

        html += `
            <tr class="hover:bg-gray-50 ${isLoi ? 'bg-red-50/50' : ''}">
                <td class="py-2 px-3 text-center text-gray-500">${soDong}</td>
                <td class="py-2 px-3 font-bold text-orange-900">${ma || '[Trống]'}</td>
                <td class="py-2 px-4">${ten || '-'}</td>
                <td class="py-2 px-3 text-right font-semibold">${Number(sl).toLocaleString('en-US')}</td>
                <td class="py-2 px-3 text-right font-semibold">${Number(gia).toLocaleString('en-US')} đ</td>
                <td class="py-2 px-3 text-center">${trangThai}</td>
            </tr>
        `;
    });

    moModalPreviewSoDuCustom({
        tieuDeModal: "Kiểm tra & Xem trước Nhập Excel Số dư Tồn kho",
        thongKeHtml: `<span>Kiểu nhập: <b>${cheDo === 'themmoi' ? 'Thêm mới (Chặn trùng)' : 'Cập nhật (Ghi đè)'}</b></span><span class="text-emerald-700 ml-3">Hợp lệ: <b>${hopLeCount}</b></span><span class="text-red-600 ml-3">Lỗi / Trùng: <b>${loiCount}</b></span>`,
        theadHtml: `
            <tr>
                <th class="py-2.5 px-3 text-center w-12">STT</th>
                <th class="py-2.5 px-3 w-32">Mã hàng</th>
                <th class="py-2.5 px-3">Tên vật tư, hàng hóa</th>
                <th class="py-2.5 px-3 text-right">Số lượng tồn</th>
                <th class="py-2.5 px-3 text-right">Đơn giá vốn</th>
                <th class="py-2.5 px-3 text-center w-40">Trạng thái kiểm tra</th>
            </tr>
        `,
        tbodyHtml: html,
        coLoi: loiCount > 0 && cheDo === 'themmoi'
    });
}

// THẨM ĐỊNH CÔNG NỢ & HIỂN THỊ TIÊU ĐỀ CHUẨN XÁC
function thamDinhVaPreviewSoDuCongNo(rows, cheDo) {
    const danhSachDT = window.danhSachKhachHangServer || [];
    const maDTSet = new Set(danhSachDT.map(d => d.ma));
    let soDuCNHienTai = window.serverSoDuCache.congNo || {};

    let hopLeCount = 0;
    let loiCount = 0;
    let html = "";
    duLieuPreviewSoDu = [];

    rows.forEach((r, idx) => {
        const soDong = idx + 2;
        
        const ma = String(r["MA_DOI_TUONG"] || r["Mã đối tượng"] || r["Mã"] || r["ma"] || "").trim().toUpperCase();
        const ten = String(r["TEN_DOI_TUONG"] || r["Tên đối tượng"] || r["Tên"] || r["ten"] || "").trim();
        
        const noKey = Object.keys(r).find(k => k.toUpperCase().includes('NO') || k.toUpperCase().includes('NỢ') || k.toUpperCase().includes('131'));
        const coKey = Object.keys(r).find(k => k.toUpperCase().includes('CO') || k.toUpperCase().includes('CÓ') || k.toUpperCase().includes('331'));

        const no131 = parseFloat(noKey ? r[noKey] : (r["DU_NO_131"] || r["Dư nợ (131)"] || 0)) || 0;
        const co331 = parseFloat(coKey ? r[coKey] : (r["DU_CO_331"] || r["Dư có (331)"] || 0)) || 0;

        let trangThai = '<span class="text-emerald-600 font-bold"><i class="fa-solid fa-check mr-1"></i> Hợp lệ</span>';
        let isLoi = false;

        if (!ma) {
            trangThai = '<span class="text-red-600 font-bold">Thiếu mã đối tượng</span>';
            isLoi = true;
        } else if (!maDTSet.has(ma)) {
            trangThai = '<span class="text-red-600 font-bold">Mã không có trong danh mục</span>';
            isLoi = true;
        } else {
            if (cheDo === 'themmoi') {
                if (soDuCNHienTai[ma] && (soDuCNHienTai[ma].no131 > 0 || soDuCNHienTai[ma].co331 > 0)) {
                    trangThai = '<span class="text-red-600 font-bold">Trùng mã (Đã có số dư)</span>';
                    isLoi = true;
                }
            } else if (cheDo === 'capnhat') {
                if (soDuCNHienTai[ma]) {
                    trangThai = '<span class="text-blue-600 font-bold">Cập nhật thay thế công nợ</span>';
                }
            }
        }

        if (isLoi) loiCount++; else hopLeCount++;
        duLieuPreviewSoDu.push({ ma, no131, co331, isLoi });

        html += `
            <tr class="hover:bg-gray-50 ${isLoi ? 'bg-red-50/50' : ''}">
                <td class="py-2 px-3 text-center text-gray-500">${soDong}</td>
                <td class="py-2 px-3 font-bold text-orange-900">${ma || '[Trống]'}</td>
                <td class="py-2 px-4">${ten || '-'}</td>
                <td class="py-2 px-3 text-right font-semibold text-blue-800">${Number(no131).toLocaleString('en-US')} đ</td>
                <td class="py-2 px-3 text-right font-semibold text-red-700">${Number(co331).toLocaleString('en-US')} đ</td>
                <td class="py-2 px-3 text-center">${trangThai}</td>
            </tr>
        `;
    });

    moModalPreviewSoDuCustom({
        tieuDeModal: "Kiểm tra & Xem trước Nhập Excel Số dư Công nợ",
        thongKeHtml: `<span>Kiểu nhập: <b>${cheDo === 'themmoi' ? 'Thêm mới (Chặn trùng)' : 'Cập nhật (Ghi đè)'}</b></span><span class="text-emerald-700 ml-3">Hợp lệ: <b>${hopLeCount}</b></span><span class="text-red-600 ml-3">Lỗi / Trùng: <b>${loiCount}</b></span>`,
        theadHtml: `
            <tr>
                <th class="py-2.5 px-3 text-center w-12">STT</th>
                <th class="py-2.5 px-3 w-32">Mã đối tượng</th>
                <th class="py-2.5 px-3">Tên khách hàng / Nhà cung cấp</th>
                <th class="py-2.5 px-3 text-right">Dư nợ (131)</th>
                <th class="py-2.5 px-3 text-right">Dư có (331)</th>
                <th class="py-2.5 px-3 text-center w-40">Trạng thái kiểm tra</th>
            </tr>
        `,
        tbodyHtml: html,
        coLoi: loiCount > 0 && cheDo === 'themmoi'
    });
}

function moModalPreviewSoDuCustom(config) {
    const titleEl = document.getElementById('preview-modal-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-table-cells mr-2"></i> ${config.tieuDeModal}`;

    const thongKeEl = document.getElementById('preview-thong-ke');
    if (thongKeEl) thongKeEl.innerHTML = config.thongKeHtml;

    const tableEl = document.getElementById('preview-table-sodu');
    if (tableEl) {
        tableEl.innerHTML = `
            <thead class="bg-gray-100 text-gray-700 uppercase sticky top-0 border-b">
                ${config.theadHtml}
            </thead>
            <tbody class="divide-y divide-gray-200">
                ${config.tbodyHtml}
            </tbody>
        `;
    }

    const btnXacNhan = document.getElementById('btn-xac-nhan-import-sodu');
    if (btnXacNhan) {
        if (config.coLoi) {
            btnXacNhan.disabled = true;
            btnXacNhan.className = "px-4 py-2 bg-gray-400 text-white rounded-lg text-xs font-medium cursor-not-allowed";
        } else {
            btnXacNhan.disabled = false;
            btnXacNhan.className = "px-4 py-2 bg-orange-900 text-white rounded-lg text-xs font-medium hover:bg-orange-800 transition shadow-xs";
        }
    }

    document.getElementById('modal-preview-sodu').classList.remove('hidden');
}

function dongModalPreviewSoDu() {
    document.getElementById('modal-preview-sodu').classList.add('hidden');
    duLieuPreviewSoDu = null;
}

// Thực thi nạp dữ liệu số dư từ Excel lên Server
async function thucThiImportSoDu() {
    if (!duLieuPreviewSoDu || duLieuPreviewSoDu.length === 0) return;

    if (loaiTabDangImport === 'kho') {
        let soDuKho = window.serverSoDuCache.tonKho || {};
        duLieuPreviewSoDu.forEach(item => {
            if (item.ma && !item.isLoi) {
                soDuKho[item.ma] = { sl: item.sl, gia: item.gia };
            }
        });

        try {
            const res = await fetch('/api/so-du/luu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loai: 'kho', data: soDuKho })
            });
            const result = await res.json();
            if (result.success) {
                window.serverSoDuCache.tonKho = soDuKho;
                renderSoDuTonKho();
                alert(cheDoImportHienTai === 'themmoi' ? "Nhập thêm mới tồn kho lên server thành công!" : "Cập nhật thay thế tồn kho thành công!");
            }
        } catch (e) {
            alert("Lỗi kết nối khi nạp số dư tồn kho!");
        }
    } else if (loaiTabDangImport === 'congno') {
        let soDuCN = window.serverSoDuCache.congNo || {};
        duLieuPreviewSoDu.forEach(item => {
            if (item.ma && !item.isLoi) {
                soDuCN[item.ma] = { no131: item.no131, co331: item.co331 };
            }
        });

        try {
            const res = await fetch('/api/so-du/luu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loai: 'congno', data: soDuCN })
            });
            const result = await res.json();
            if (result.success) {
                window.serverSoDuCache.congNo = soDuCN;
                renderSoDuCongNo();
                alert(cheDoImportHienTai === 'themmoi' ? "Nhập thêm mới công nợ lên server thành công!" : "Cập nhật thay thế công nợ thành công!");
            }
        } catch (e) {
            alert("Lỗi kết nối khi nạp số dư công nợ!");
        }
    }

    dongModalPreviewSoDu();
}