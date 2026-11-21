// ==============================================================
// PHIẾU THU TIỀN MẶT (PT) - PHIẾU CHI TIỀN MẶT (PC) - PHIẾU MUA HÀNG (PN)
// Dùng chung popup #modal-chung-tu-khac và kho chứng từ /api/luu-chung-tu
// (phân biệt bằng trường loaiChungTu). Phiếu bán hàng vẫn dùng popup riêng.
// ==============================================================

const CAU_HINH_CHUNG_TU_KHAC = {
    PT: {
        tenPhieu: 'Phiếu thu tiền mặt',
        tienTo: 'PT',
        nhanDoiTuong: 'Đối tượng nộp tiền',
        nhanNguoi: 'Người nộp tiền',
        nhanDienGiai: 'Lý do thu',
        kieuChiTiet: 'tien',
        chiNhaCungCap: false,
        viewId: 'view-thutien-tm',
        tbodyId: 'tbody-danh-sach-thutien',
        mauTien: 'text-green-600',
        tenDem: 'phiếu thu'
    },
    PC: {
        tenPhieu: 'Phiếu chi tiền mặt',
        tienTo: 'PC',
        nhanDoiTuong: 'Đối tượng nhận tiền',
        nhanNguoi: 'Người nhận tiền',
        nhanDienGiai: 'Lý do chi',
        kieuChiTiet: 'tien',
        chiNhaCungCap: false,
        viewId: 'view-chitien-tm',
        tbodyId: 'tbody-danh-sach-chitien',
        mauTien: 'text-red-600',
        tenDem: 'phiếu chi'
    },
    PN: {
        tenPhieu: 'Phiếu mua hàng',
        tienTo: 'PN',
        nhanDoiTuong: 'Nhà cung cấp',
        nhanNguoi: 'Người giao hàng',
        nhanDienGiai: 'Diễn giải',
        kieuChiTiet: 'hang',
        chiNhaCungCap: true,
        viewId: 'view-phieu-muahang',
        tbodyId: 'tbody-danh-sach-muahang',
        mauTien: 'text-gray-900',
        tenDem: 'phiếu mua hàng'
    }
};

// Trạng thái popup đang mở
let loaiChungTuKhacDangMo = null;   // 'PT' | 'PC' | 'PN'
let soChungTuKhacDangSua = null;    // null = thêm mới, ngược lại = số chứng từ gốc đang sửa

function layLoaiChungTuItem(item) {
    return (item && item.loaiChungTu ? String(item.loaiChungTu) : 'BH').toUpperCase();
}

function chuanHoaSoCTKhac(so) {
    return String(so || "").replace(/\s+/g, ' ').trim().toUpperCase();
}

function thoatHtmlCTK(v) {
    return String(v == null ? "" : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function docSoCTK(v) {
    return parseFloat(String(v == null ? "0" : v).replace(/,/g, '')) || 0;
}

// --------------------------------------------------------------
// 1. DANH SÁCH TRÊN TỪNG MÀN HÌNH
// --------------------------------------------------------------
function hienThiDanhSachChungTuKhac() {
    Object.keys(CAU_HINH_CHUNG_TU_KHAC).forEach(loai => hienThiDanhSachTheoLoai(loai));
}

function hienThiDanhSachTheoLoai(loai) {
    const cfg = CAU_HINH_CHUNG_TU_KHAC[loai];
    const tbody = document.getElementById(cfg.tbodyId);
    if (!tbody) return;

    const danhSach = (window.danhSachChungTuCache || [])
        .filter(item => layLoaiChungTuItem(item) === loai)
        .sort((a, b) => String(a.ngayChungTu || "").localeCompare(String(b.ngayChungTu || "")) ||
                        String(a.soChungTu || "").localeCompare(String(b.soChungTu || "")));

    tbody.innerHTML = "";
    if (danhSach.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-gray-400 italic">Chưa có ${cfg.tenDem} nào. Bấm "Thêm mới" để lập phiếu.</td></tr>`;
    }

    danhSach.forEach((item, index) => {
        let ngayHienThi = item.ngayChungTu || "";
        const parts = ngayHienThi.split('-');
        if (parts.length === 3) ngayHienThi = `${parts[2]}/${parts[1]}/${parts[0]}`;

        const soCT = item.soChungTu || "";
        const tenHienThi = loai === 'PN' ? (item.doiTuong || "") : (item.nguoiNopNhan || item.doiTuong || "");

        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 text-center text-gray-700">${index + 1}</td>
            <td class="py-3 px-4 font-medium text-orange-900">${thoatHtmlCTK(soCT)}</td>
            <td class="py-3 px-4">${thoatHtmlCTK(ngayHienThi)}</td>
            <td class="py-3 px-4">${thoatHtmlCTK(tenHienThi)}</td>
            <td class="py-3 px-4">${thoatHtmlCTK(item.dienGiai || "")}</td>
            <td class="py-3 px-4 text-right font-semibold ${cfg.mauTien}">${thoatHtmlCTK(item.tongThanhToan || "0 đ")}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                <button type="button" class="text-blue-600 hover:underline mr-3 btn-xem-ctk"><i class="fa-solid fa-eye"></i> Xem</button>
                <button type="button" class="text-red-600 hover:underline btn-xoa-ctk"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        `;
        tr.querySelector('.btn-xem-ctk').onclick = () => xemChungTuKhac(soCT);
        tr.querySelector('.btn-xoa-ctk').onclick = () => xoaChungTuKhac(soCT);
        tbody.appendChild(tr);
    });

    const footerCount = document.querySelector(`#${cfg.viewId} .border-t span.font-bold`);
    if (footerCount) footerCount.textContent = String(danhSach.length).padStart(2, '0');
}

// --------------------------------------------------------------
// 2. SINH SỐ CHỨNG TỪ: [TIỀN_TỐ] MM/YYYY-XXXX (VD: PT 11/2026-0001)
// --------------------------------------------------------------
function sinhSoChungTuKhac(loai, ngayChungTu) {
    const cfg = CAU_HINH_CHUNG_TU_KHAC[loai];
    const ngay = ngayChungTu || new Date().toISOString().split('T')[0];
    const [nam, thang] = ngay.split('-');
    const prefix = `${cfg.tienTo} ${thang}/${nam}-`;

    let maxSTT = 0;
    (window.danhSachChungTuCache || []).forEach(item => {
        const so = chuanHoaSoCTKhac(item.soChungTu);
        if (so.startsWith(prefix)) {
            const stt = parseInt(so.split('-').pop(), 10);
            if (!isNaN(stt) && stt > maxSTT) maxSTT = stt;
        }
    });
    return `${prefix}${String(maxSTT + 1).padStart(4, '0')}`;
}

function tuDongSinhSoChungTuKhac() {
    if (soChungTuKhacDangSua || !loaiChungTuKhacDangMo) return; // Đang sửa thì giữ nguyên số
    const ngay = document.getElementById('ctk-ngay').value;
    document.getElementById('ctk-so').value = sinhSoChungTuKhac(loaiChungTuKhacDangMo, ngay);
}

// --------------------------------------------------------------
// 3. MỞ / ĐÓNG POPUP
// --------------------------------------------------------------
function moModalChungTuKhac(loai, item = null) {
    const cfg = CAU_HINH_CHUNG_TU_KHAC[loai];
    if (!cfg) return;
    loaiChungTuKhacDangMo = loai;
    soChungTuKhacDangSua = item ? item.soChungTu : null;

    document.getElementById('ctk-title').textContent = item ? `${cfg.tenPhieu}: ${item.soChungTu}` : `Lập ${cfg.tenPhieu.toLowerCase()} mới`;
    document.getElementById('ctk-lbl-doituong').textContent = cfg.nhanDoiTuong;
    document.getElementById('ctk-lbl-nguoi').textContent = cfg.nhanNguoi;
    document.getElementById('ctk-lbl-diengiai').textContent = cfg.nhanDienGiai;
    document.getElementById('ctk-lbl-chitiet').textContent = cfg.kieuChiTiet === 'hang' ? 'Chi tiết hàng hóa mua vào' : 'Chi tiết số tiền';

    napDanhSachDoiTuongCTK(cfg.chiNhaCungCap);

    document.getElementById('ctk-ngay').value = item ? (item.ngayChungTu || "") : new Date().toISOString().split('T')[0];
    document.getElementById('ctk-doituong').value = item ? (item.maDoiTuong || "") : "";
    document.getElementById('ctk-diachi').value = item ? (item.diaChi || "") : "";
    document.getElementById('ctk-nguoi').value = item ? (item.nguoiNopNhan || "") : "";
    document.getElementById('ctk-diengiai').value = item ? (item.dienGiai || "") : "";

    // Đối tượng đã lưu nhưng không còn trong danh mục: vẫn hiển thị để không mất dữ liệu
    const sel = document.getElementById('ctk-doituong');
    if (item && item.maDoiTuong && sel.value !== item.maDoiTuong) {
        const opt = document.createElement('option');
        opt.value = item.maDoiTuong;
        opt.textContent = `${item.maDoiTuong} - ${item.doiTuong || ""}`;
        opt.dataset.ten = item.doiTuong || "";
        sel.appendChild(opt);
        sel.value = item.maDoiTuong;
    }

    const inputSo = document.getElementById('ctk-so');
    inputSo.classList.remove('border-red-500', 'text-red-600');
    if (item) {
        inputSo.value = item.soChungTu;
        inputSo.setAttribute('readonly', 'readonly');
        inputSo.classList.add('bg-gray-100');
    } else {
        inputSo.removeAttribute('readonly');
        inputSo.classList.remove('bg-gray-100');
        tuDongSinhSoChungTuKhac();
    }

    veDauBangChiTietCTK();
    const tbody = document.getElementById('ctk-items');
    tbody.innerHTML = "";
    const chiTiet = item && Array.isArray(item.chiTiet) ? item.chiTiet : [];
    if (chiTiet.length > 0) chiTiet.forEach(d => themDongChungTuKhac(d));
    else themDongChungTuKhac();
    tinhTongChungTuKhac();

    document.getElementById('modal-chung-tu-khac').classList.remove('hidden');
}

function dongModalChungTuKhac() {
    document.getElementById('modal-chung-tu-khac').classList.add('hidden');
    loaiChungTuKhacDangMo = null;
    soChungTuKhacDangSua = null;
}

function xemChungTuKhac(soCT) {
    const item = (window.danhSachChungTuCache || []).find(c => c.soChungTu === soCT);
    if (!item) {
        alert(`Không tìm thấy chứng từ ${soCT}. Vui lòng tải lại trang!`);
        return;
    }
    moModalChungTuKhac(layLoaiChungTuItem(item), item);
}

// --------------------------------------------------------------
// 4. ĐỐI TƯỢNG (KHÁCH HÀNG / NHÀ CUNG CẤP)
// --------------------------------------------------------------
function napDanhSachDoiTuongCTK(chiNhaCungCap) {
    const sel = document.getElementById('ctk-doituong');
    const tatCa = window.danhSachKhachHangServer || [];
    let ds = tatCa;
    if (chiNhaCungCap) {
        const dsNCC = tatCa.filter(dt => String(dt.phanLoai || "").includes('Nhà cung cấp'));
        if (dsNCC.length > 0) ds = dsNCC; // Chưa khai báo nhà cung cấp nào thì cho chọn toàn bộ đối tượng
    }
    sel.innerHTML = `<option value="">-- Chọn đối tượng --</option>` +
        ds.map(dt => `<option value="${thoatHtmlCTK(dt.ma)}" data-ten="${thoatHtmlCTK(dt.ten)}" data-diachi="${thoatHtmlCTK(dt.diaChi || "")}">${thoatHtmlCTK(dt.ma)} - ${thoatHtmlCTK(dt.ten)}</option>`).join('');
}

function chonDoiTuongCTK(sel) {
    const opt = sel.options[sel.selectedIndex];
    document.getElementById('ctk-diachi').value = opt && opt.dataset.diachi ? opt.dataset.diachi : "";
}

// --------------------------------------------------------------
// 5. BẢNG CHI TIẾT: tiền (PT/PC) hoặc hàng hóa (PN)
// --------------------------------------------------------------
function veDauBangChiTietCTK() {
    const thead = document.getElementById('ctk-thead');
    const laHang = CAU_HINH_CHUNG_TU_KHAC[loaiChungTuKhacDangMo].kieuChiTiet === 'hang';
    thead.innerHTML = laHang ? `
        <tr class="bg-gray-100 border-b text-gray-600 uppercase tracking-wider text-[11px]">
            <th class="py-2 px-2 text-center w-10">STT</th>
            <th class="py-2 px-2 w-56">Mã hàng</th>
            <th class="py-2 px-2">Tên hàng hóa</th>
            <th class="py-2 px-2 w-24">ĐVT</th>
            <th class="py-2 px-2 w-24 text-right">Số lượng</th>
            <th class="py-2 px-2 w-32 text-right">Đơn giá</th>
            <th class="py-2 px-2 w-36 text-right">Thành tiền</th>
            <th class="py-2 px-2 w-12 text-center"></th>
        </tr>` : `
        <tr class="bg-gray-100 border-b text-gray-600 uppercase tracking-wider text-[11px]">
            <th class="py-2 px-2 text-center w-10">STT</th>
            <th class="py-2 px-2">Diễn giải</th>
            <th class="py-2 px-2 w-48 text-right">Số tiền</th>
            <th class="py-2 px-2 w-12 text-center"></th>
        </tr>`;
}

function themDongChungTuKhac(duLieu = null) {
    const tbody = document.getElementById('ctk-items');
    const laHang = CAU_HINH_CHUNG_TU_KHAC[loaiChungTuKhacDangMo].kieuChiTiet === 'hang';
    const d = duLieu || {};
    const tr = document.createElement('tr');
    tr.className = "ctk-row border-b";
    const nutXoa = `<td class="p-1.5 text-center"><button type="button" onclick="xoaDongChungTuKhac(this)" class="text-red-500 hover:text-red-700" title="Xóa dòng"><i class="fa-solid fa-trash-can"></i></button></td>`;

    if (laHang) {
        const dsHH = window.danhSachHangHoaServer || [];
        const options = `<option value="">-- Chọn hàng --</option>` + dsHH.map(hh =>
            `<option value="${thoatHtmlCTK(hh.ma)}"${hh.ma === d.maHang ? ' selected' : ''}>${thoatHtmlCTK(hh.ma)} - ${thoatHtmlCTK(hh.ten)}</option>`).join('');
        tr.innerHTML = `
            <td class="p-1.5 text-center text-gray-500 ctk-stt"></td>
            <td class="p-1.5"><select onchange="chonHangHoaCTK(this)" class="w-full px-2 py-1 border rounded bg-white ctk-mahang">${options}</select></td>
            <td class="p-1.5"><input type="text" value="${thoatHtmlCTK(d.tenHang || "")}" class="w-full px-2 py-1 border rounded ctk-tenhang"></td>
            <td class="p-1.5"><input type="text" value="${thoatHtmlCTK(d.dvt || "")}" class="w-full px-2 py-1 border rounded ctk-dvt"></td>
            <td class="p-1.5"><input type="text" value="${Number(d.soLuong || 0).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhTongChungTuKhac()" class="w-full px-2 py-1 border rounded text-right ctk-soluong"></td>
            <td class="p-1.5"><input type="text" value="${Number(d.donGia || 0).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhTongChungTuKhac()" class="w-full px-2 py-1 border rounded text-right ctk-dongia"></td>
            <td class="p-1.5"><input type="text" readonly value="0" class="w-full px-2 py-1 border rounded text-right bg-gray-50 font-semibold ctk-thanhtien"></td>
            ${nutXoa}`;
        // Mã hàng đã lưu nhưng không còn trong danh mục
        const sel = tr.querySelector('.ctk-mahang');
        if (d.maHang && sel.value !== d.maHang) {
            const opt = document.createElement('option');
            opt.value = d.maHang; opt.textContent = `${d.maHang} - ${d.tenHang || ""}`;
            sel.appendChild(opt); sel.value = d.maHang;
        }
    } else {
        tr.innerHTML = `
            <td class="p-1.5 text-center text-gray-500 ctk-stt"></td>
            <td class="p-1.5"><input type="text" value="${thoatHtmlCTK(d.dienGiai || "")}" placeholder="Diễn giải dòng (để trống sẽ lấy theo lý do chung)" class="w-full px-2 py-1 border rounded ctk-diengiai-dong"></td>
            <td class="p-1.5"><input type="text" value="${Number(d.soTien || 0).toLocaleString('en-US')}" onfocus="this.select()" oninput="formatNumberInput(this); tinhTongChungTuKhac()" class="w-full px-2 py-1 border rounded text-right font-semibold ctk-sotien"></td>
            ${nutXoa}`;
    }
    tbody.appendChild(tr);
    capNhatSTTChungTuKhac();
    tinhTongChungTuKhac();
}

function xoaDongChungTuKhac(btn) {
    const row = btn.closest('tr');
    if (row) row.remove();
    if (document.querySelectorAll('#ctk-items .ctk-row').length === 0) themDongChungTuKhac();
    capNhatSTTChungTuKhac();
    tinhTongChungTuKhac();
}

function capNhatSTTChungTuKhac() {
    document.querySelectorAll('#ctk-items .ctk-row').forEach((r, i) => {
        const c = r.querySelector('.ctk-stt');
        if (c) c.textContent = i + 1;
    });
}

function chonHangHoaCTK(sel) {
    const row = sel.closest('tr');
    const hh = (window.danhSachHangHoaServer || []).find(h => h.ma === sel.value);
    row.querySelector('.ctk-tenhang').value = hh ? (hh.ten || "") : "";
    row.querySelector('.ctk-dvt').value = hh ? (hh.dvt || "") : "";
    // Phiếu mua: gợi ý đơn giá theo giá mua / giá vốn mặc định của hàng hóa
    const gia = hh ? (hh.giaMua || hh.giaVon || 0) : 0;
    row.querySelector('.ctk-dongia').value = Number(gia).toLocaleString('en-US');
    if (docSoCTK(row.querySelector('.ctk-soluong').value) === 0) row.querySelector('.ctk-soluong').value = "1";
    tinhTongChungTuKhac();
}

function tinhTongChungTuKhac() {
    if (!loaiChungTuKhacDangMo) return 0;
    const laHang = CAU_HINH_CHUNG_TU_KHAC[loaiChungTuKhacDangMo].kieuChiTiet === 'hang';
    let tong = 0;
    document.querySelectorAll('#ctk-items .ctk-row').forEach(r => {
        if (laHang) {
            const tt = Math.round(docSoCTK(r.querySelector('.ctk-soluong').value) * docSoCTK(r.querySelector('.ctk-dongia').value));
            r.querySelector('.ctk-thanhtien').value = tt.toLocaleString('en-US');
            tong += tt;
        } else {
            tong += docSoCTK(r.querySelector('.ctk-sotien').value);
        }
    });
    const lbl = document.getElementById('ctk-tong');
    if (lbl) lbl.textContent = Math.round(tong).toLocaleString('vi-VN') + " đ";
    return tong;
}

// --------------------------------------------------------------
// 6. LƯU / XÓA
// --------------------------------------------------------------
async function luuChungTuKhac() {
    const loai = loaiChungTuKhacDangMo;
    const cfg = CAU_HINH_CHUNG_TU_KHAC[loai];
    if (!cfg) return;

    const ngay = document.getElementById('ctk-ngay').value;
    if (!ngay) { alert("Vui lòng chọn Ngày chứng từ!"); return; }

    const inputSo = document.getElementById('ctk-so');
    const soCT = chuanHoaSoCTKhac(inputSo.value);
    const regexSo = new RegExp(`^${cfg.tienTo} (0[1-9]|1[0-2])\\/\\d{4}-(?!0000)\\d{4}$`);
    if (!regexSo.test(soCT)) {
        alert(`Số chứng từ không đúng định dạng!\n\nQuy tắc: ${cfg.tienTo} MM/YYYY-XXXX (Ví dụ: ${cfg.tienTo} 10/2026-0001)`);
        inputSo.focus();
        return;
    }

    // Chống trùng số trên toàn bộ kho chứng từ (trừ chính phiếu đang sửa)
    const biTrung = (window.danhSachChungTuCache || []).some(item =>
        chuanHoaSoCTKhac(item.soChungTu) === soCT && chuanHoaSoCTKhac(item.soChungTu) !== chuanHoaSoCTKhac(soChungTuKhacDangSua));
    if (biTrung) {
        alert(`CẢNH BÁO: Số chứng từ "${soCT}" đã tồn tại trên hệ thống!`);
        inputSo.classList.add('border-red-500', 'text-red-600');
        inputSo.focus();
        return;
    }

    const sel = document.getElementById('ctk-doituong');
    const maDT = sel.value;
    if (!maDT) { alert(`Vui lòng chọn ${cfg.nhanDoiTuong}!`); sel.focus(); return; }
    const tenDT = sel.options[sel.selectedIndex]?.dataset.ten || "";

    const dienGiai = document.getElementById('ctk-diengiai').value.trim();
    if (!dienGiai) { alert(`Vui lòng nhập ${cfg.nhanDienGiai}!`); document.getElementById('ctk-diengiai').focus(); return; }

    const rows = document.querySelectorAll('#ctk-items .ctk-row');
    const chiTiet = [];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const stt = i + 1;
        if (cfg.kieuChiTiet === 'hang') {
            const maHang = r.querySelector('.ctk-mahang').value;
            const soLuong = docSoCTK(r.querySelector('.ctk-soluong').value);
            const donGia = docSoCTK(r.querySelector('.ctk-dongia').value);
            if (!maHang && soLuong === 0 && donGia === 0) continue; // bỏ dòng trống
            if (!maHang) { alert(`Dòng ${stt}: Vui lòng chọn Mã hàng!`); return; }
            if (soLuong <= 0) { alert(`Dòng ${stt}: Số lượng phải lớn hơn 0!`); return; }
            chiTiet.push({
                stt: chiTiet.length + 1,
                maHang,
                tenHang: r.querySelector('.ctk-tenhang').value.trim(),
                dvt: r.querySelector('.ctk-dvt').value.trim(),
                soLuong,
                donGia,
                thanhTien: Math.round(soLuong * donGia)
            });
        } else {
            const soTien = docSoCTK(r.querySelector('.ctk-sotien').value);
            const dg = r.querySelector('.ctk-diengiai-dong').value.trim();
            if (soTien === 0 && !dg) continue; // bỏ dòng trống
            if (soTien <= 0) { alert(`Dòng ${stt}: Số tiền phải lớn hơn 0!`); return; }
            chiTiet.push({ stt: chiTiet.length + 1, dienGiai: dg || dienGiai, soTien });
        }
    }
    if (chiTiet.length === 0) {
        alert(cfg.kieuChiTiet === 'hang' ? "Phiếu mua hàng phải có ít nhất 1 dòng hàng hóa!" : "Vui lòng nhập Số tiền!");
        return;
    }

    const tong = chiTiet.reduce((s, d) => s + (cfg.kieuChiTiet === 'hang' ? d.thanhTien : d.soTien), 0);
    const duLieu = {
        loaiChungTu: loai,
        soChungTu: soCT,
        ngayChungTu: ngay,
        maDoiTuong: maDT,
        doiTuong: tenDT,
        diaChi: document.getElementById('ctk-diachi').value.trim(),
        nguoiNopNhan: document.getElementById('ctk-nguoi').value.trim(),
        dienGiai,
        chiTiet,
        tongThanhToan: Math.round(tong).toLocaleString('vi-VN') + " đ"
    };

    try {
        const res = await fetch('/api/luu-chung-tu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duLieu)
        });
        const ketQua = await res.json();
        if (!ketQua.success) {
            alert("Có lỗi khi lưu chứng từ: " + (ketQua.message || "Không xác định"));
            return;
        }
        alert(ketQua.message || `Lưu ${cfg.tenPhieu.toLowerCase()} thành công!`);
        dongModalChungTuKhac();
        await taiDanhSachChungTu(); // tải lại kho chứng từ và vẽ lại các danh sách
    } catch (e) {
        console.error("Lỗi kết nối server:", e);
        alert("Không thể kết nối đến máy chủ Node.js!");
    }
}

async function xoaChungTuKhac(soCT) {
    if (!confirm(`Bạn có chắc chắn muốn xóa chứng từ số: ${soCT} không?`)) return;
    try {
        const res = await fetch(`/api/xoa-chung-tu/${encodeURIComponent(soCT)}`, { method: 'DELETE' });
        const ketQua = await res.json();
        alert(ketQua.message || (ketQua.success ? `Đã xóa chứng từ ${soCT}!` : "Không xóa được chứng từ!"));
        await taiDanhSachChungTu();
    } catch (e) {
        alert("Lỗi kết nối máy chủ khi xóa chứng từ!");
    }
}
