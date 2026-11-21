// ==============================================================
// BỘ ĐIỀU KHIỂN XEM TRƯỚC VÀ IN BIỂU MẪU CHUẨN KẾ TOÁN (A4)
// ==============================================================
let phieuDangInHienTai = null;

// Hàm chuyển số tiền thành chữ tiếng Việt chuẩn xác
function docSoThanhChu(soTien) {
    soTien = Math.round(Math.abs(Number(soTien) || 0));
    if (soTien === 0) return "Không đồng";

    const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const donViTien = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

    function docBlock(baSo) {
        let tram = Math.floor(baSo / 100);
        let chuc = Math.floor((baSo % 100) / 10);
        let donVi = baSo % 10;
        let ketQua = "";

        if (tram > 0) ketQua += chuSo[tram] + " trăm ";
        if (chuc > 1) {
            ketQua += chuSo[chuc] + " mươi ";
            if (donVi === 1) ketQua += "mốt ";
            else if (donVi === 5) ketQua += "lăm ";
            else if (donVi > 0) ketQua += chuSo[donVi] + " ";
        } else if (chuc === 1) {
            ketQua += "mười ";
            if (donVi === 5) ketQua += "lăm ";
            else if (donVi > 0) ketQua += chuSo[donVi] + " ";
        } else if (tram > 0 && donVi > 0) {
            ketQua += "lẻ " + chuSo[donVi] + " ";
        } else if (donVi > 0) {
            ketQua += chuSo[donVi] + " ";
        }
        return ketQua.trim();
    }

    let chuoi = "";
    let i = 0;
    while (soTien > 0) {
        let baSo = soTien % 1000;
        if (baSo > 0) {
            let s = docBlock(baSo);
            chuoi = s + " " + donViTien[i] + " " + chuoi;
        }
        soTien = Math.floor(soTien / 1000);
        i++;
    }
    chuoi = chuoi.trim();
    return chuoi.charAt(0).toUpperCase() + chuoi.slice(1) + " đồng chẵn./.";
}

function moMenuInTuDanhSach(soCT) {
    napCauHinhDoanhNghiep(); // Nạp cấu hình cố định
    const item = (window.danhSachChungTuCache || []).find(c => c.soChungTu === soCT);
    if (!item) {
        alert("Không tìm thấy dữ liệu phiếu!");
        return;
    }
    phieuDangInHienTai = item;
    document.getElementById('chon-mau-in-nhanh').value = "PBH";
    taoNoiDungBieuMauIn("PBH");
    document.getElementById('modal-xem-in-phieu').classList.remove('hidden');
}

function inPhieuHienTai(loaiMau) {
    napCauHinhDoanhNghiep(); // Nạp cấu hình cố định
    // Thu thập dữ liệu hiện có trên form để in ngay cả khi chưa bấm lưu
    const rows = document.querySelectorAll('#voucher-items .item-row');
    let danhSachHang = [];
    rows.forEach((r, idx) => {
        const ma = r.querySelector('.item-mahang')?.value.trim();
        const ten = r.querySelector('.item-tenhang')?.value.trim();
        const dvt = r.querySelector('.dvt-select')?.value;
        const sl = parseFloat(r.querySelector('.qty-input')?.value) || 0;
        const gia = parseFloat((r.querySelector('.price-input')?.value || "0").replace(/,/g, '')) || 0;
        const ck = parseFloat((r.querySelector('.ck-tien-input')?.value || "0").replace(/,/g, '')) || 0;
        const thue = parseFloat((r.querySelector('.row-tienthue')?.value || "0").replace(/,/g, '')) || 0;
        const tong = parseFloat((r.querySelector('.row-tongthanhtoan')?.value || "0").replace(/,/g, '')) || 0;
        if (ma) {
            danhSachHang.push({ stt: idx + 1, maHang: ma, tenHang: ten, dvt, soLuong: sl, donGia: gia, tienCK: ck, tienThue: thue, tongThanhToan: tong });
        }
    });

    const tongTienText = document.getElementById('lbl-tong-thanh-toan')?.textContent || "0";
    const tongSo = parseFloat(tongTienText.replace(/\D/g, "")) || 0;

    phieuDangInHienTai = {
        soChungTu: document.getElementById('so-chung-tu-ban')?.value || "BH-0000",
        ngayChungTu: document.getElementById('ngay-chung-tu-ban')?.value || new Date().toISOString().slice(0, 10),
        doiTuong: document.getElementById('ten-khach-hang')?.value || "Khách hàng lẻ",
        diaChi: document.getElementById('input-diachi')?.value || "Hải Phòng",
        dienGiai: document.getElementById('diễn-giải')?.value || "Bán hàng thu tiền",
        chiTiet: danhSachHang,
        tongThanhToanSo: tongSo
    };

    document.getElementById('chon-mau-in-nhanh').value = loaiMau;
    const selTT = document.getElementById('select-che-do-ke-toan');
    if (selTT) selTT.value = window.cauHinhDoanhNghiep.cheDoKeToan;
    taoNoiDungBieuMauIn(loaiMau);
    document.getElementById('modal-xem-in-phieu').classList.remove('hidden');
}

// 3. Chuyển đổi qua lại giữa các mẫu in
function chuyenDoiMauIn(loaiMau) {
    if (!phieuDangInHienTai) return;
    taoNoiDungBieuMauIn(loaiMau);
}

function dongModalInPhieu() {
    document.getElementById('modal-xem-in-phieu').classList.add('hidden');
}

function thucHienInTrang() {
    window.print();
}

// Bật/tắt menu dropdown in chứng từ
function toggleMenuInDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('dropdown-menu-in');
    if (menu) menu.classList.toggle('hidden');
}

// Click ngoài thì ẩn dropdown
window.addEventListener('click', function(e) {
    const menu = document.getElementById('dropdown-menu-in');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
});

// Đọc cấu hình từ localStorage đã được thiết lập từ setup.html
function napCauHinhDoanhNghiep() {
    let dataLocal = null;
    try {
        dataLocal = JSON.parse(localStorage.getItem('BIZMATE_THONGTIN_DOANHNGHIEP'));
    } catch (e) {
        dataLocal = null;
    }

    // Lấy đúng chế độ đã lưu từ bước tạo mới dữ liệu
    const cheDoDaLuu = (dataLocal && dataLocal.cheDoKeToan) || localStorage.getItem('BIZMATE_CHEDO_KETOAN') || 'TT152';

    if (dataLocal) {
        window.cauHinhDoanhNghiep = {
            tenDonVi: dataLocal.tenDonVi || "CÔNG TY TNHH BIZMATE",
            diaChi: dataLocal.diaChi || "Lê Chân, Thành phố Hải Phòng",
            mst: dataLocal.mst || "0200xxxxxx",
            namTaiChinh: dataLocal.namTaiChinh || "2026",
            cheDoKeToan: cheDoDaLuu
        };
    } else {
        window.cauHinhDoanhNghiep = {
            tenDonVi: "CÔNG TY TNHH BIZMATE",
            diaChi: "Lê Chân, Thành phố Hải Phòng",
            mst: "0200xxxxxx",
            namTaiChinh: "2026",
            cheDoKeToan: cheDoDaLuu
        };
    }

    // Cập nhật nhãn hiển thị chế độ kế toán trên header modal in
    const badgeEl = document.getElementById('badge-che-do-ke-toan');
    if (badgeEl) {
        const tenCheDoMap = {
            'TT152': 'Chế độ: Thông tư 152 (Hộ KD)',
            'TT133': 'Chế độ: Thông tư 133/2016 (Doanh nghiệp vừa & nhỏ)',
            'TT99':  'Chế độ: Thông tư 99 (Doanh nghiệp lớn)'
        };
        badgeEl.innerHTML = `<i class="fa-solid fa-book-bookmark mr-1 text-amber-300"></i> ${tenCheDoMap[cheDoDaLuu] || cheDoDaLuu}`;
    }
}

// Gọi hàm nạp cấu hình ngay khi tải trang
napCauHinhDoanhNghiep();

// Hàm trả về thông tin văn bản Thông tư chuẩn xác theo quy định mới
function layThongTinThongTu(loaiChungTu, cheDo) {
    const mapTT = {
        // 1. Chế độ kế toán doanh nghiệp (Thay thế TT 200)
        'TT99': {
            tenTT: 'Thông tư số 99/TT-BTC',
            ngayBanHanh: 'của Bộ Tài chính (thay thế TT 200/2014/TT-BTC)',
            bieuMau: {
                'PBH': 'Mẫu số 01 - BH',
                'PXK': 'Mẫu số 02 - VT',
                'PTM': 'Mẫu số 01 - TT',
                'PNH': 'Mẫu số 02 - TT'
            }
        },
        // 2. Chế độ kế toán doanh nghiệp nhỏ và vừa
        'TT133': {
            tenTT: 'Thông tư số 133/2016/TT-BTC',
            ngayBanHanh: 'ngày 26/08/2016 của Bộ Tài chính',
            bieuMau: {
                'PBH': 'Mẫu số 01 - BH',
                'PXK': 'Mẫu số 02 - VT',
                'PTM': 'Mẫu số 01 - TT',
                'PNH': 'Mẫu số 02 - TT'
            }
        },
        // 3. Chế độ kế toán hộ kinh doanh, cá nhân kinh doanh (Thay thế TT 88)
        'TT152': {
            tenTT: 'Thông tư số 152/TT-BTC',
            ngayBanHanh: 'của Bộ Tài chính (thay thế TT 88/2021/TT-BTC)',
            bieuMau: {
                'PBH': 'Mẫu số 01 - HKD',
                'PXK': 'Mẫu số 02 - HKD',
                'PTM': 'Mẫu số 03 - HKD',
                'PNH': 'Mẫu số 04 - HKD'
            }
        }
    };

    const ttHienTai = mapTT[cheDo] || mapTT['TT152'];
    return {
        tenMau: ttHienTai.bieuMau[loaiChungTu] || 'Mẫu số 01 - BH',
        chuKyTT: `(Ban hành theo ${ttHienTai.tenTT}<br>${ttHienTai.ngayBanHanh})`
    };
}
// Chuyển đổi số chứng từ hiển thị theo đúng quy chuẩn từng loại mẫu in
function laySoChungTuTheoLoai(soCTBanHang, loaiChungTu) {
    if (!soCTBanHang) return "";
    
    // Tách lấy cụm MM/YYYY-XXXX từ số chứng từ bán hàng (ví dụ: BH 10/2026-0001 -> 10/2026-0001)
    const match = soCTBanHang.match(/(\d{2}\/\d{4}-\d{4})/);
    const duoiSo = match ? match[1] : soCTBanHang.replace(/^[A-Z\s]+/, '');

    const mapTienTo = {
        'PBH': 'BH',    // Phiếu bán hàng:          BH 10/2026-0001
        'PXK': 'PXK',   // Phiếu xuất kho:          PXK 10/2026-0001
        'PTM': 'PT',    // Phiếu thu tiền mặt:      PT 10/2026-0001
        'PNH': 'BC'     // Phiếu thu NH (Báo Có):   BC 10/2026-0001
    };

    const tienTo = mapTienTo[loaiChungTu] || 'BH';
    return `${tienTo} ${duoiSo}`;
}
// Hàm sinh HTML in ấn chuẩn form
function taoNoiDungBieuMauIn(loai) {
    const data = phieuDangInHienTai;
    const khungIn = document.getElementById('khung-giay-in-a4');
    if (!khungIn || !data) return;

    const config = window.cauHinhDoanhNghiep;
    const thongTinTT = layThongTinThongTu(loai, config.cheDoKeToan);

    const d = new Date(data.ngayChungTu || new Date());
    const ngay = String(d.getDate()).padStart(2, '0');
    const thang = String(d.getMonth() + 1).padStart(2, '0');
    const nam = d.getFullYear();

    let tongTien = data.tongThanhToanSo;
    if (!tongTien && data.tongThanhToan) {
        tongTien = parseFloat(String(data.tongThanhToan).replace(/\D/g, "")) || 0;
    }
    const tienChu = docSoThanhChu(tongTien);
    const soChungTuGoc = data.soChungTu || "BH 10/2026-0001";
    const soChungTuHienThi = laySoChungTuTheoLoai(soChungTuGoc, loai);

    // 1. Header văn bản chuẩn
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div style="line-height: 1.5;">
                <p style="font-weight: bold; text-transform: uppercase; font-size: 14px; margin: 0;">Đơn vị: ${config.tenDonVi}</p>
                <p style="margin: 3px 0 0 0;">Địa chỉ: ${config.diaChi}</p>
                <p style="margin: 3px 0 0 0;">Mã số thuế: ${config.mst}</p>
            </div>
            <div style="text-align: center; line-height: 1.35;">
                <p style="font-weight: bold; font-size: 14px; margin: 0;">${thongTinTT.tenMau}</p>
                <p style="font-style: italic; font-size: 11.5px; margin: 3px 0 0 0;">${thongTinTT.chuKyTT}</p>
            </div>
        </div>
    `;

    // 2. Nội dung chi tiết từng mẫu
    if (loai === 'PBH') {
        html += `
            <div style="text-align: center; margin: 20px 0 16px 0;">
                <h2 style="font-size: 21px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">PHIẾU BÁN HÀNG</h2>
                <p style="font-style: italic; margin: 5px 0 0 0; font-size: 13px;">Ngày ${ngay} tháng ${thang} năm ${nam}</p>
                <p style="margin: 4px 0 0 0; font-weight: bold;">Số: <span style="color: #b91c1c;">${soChungTuHienThi}</span></p>
            </div>

            <div style="line-height: 1.7; margin-bottom: 14px; font-size: 13.5px;">
                <p style="margin: 0;">- Khách hàng: <b>${data.doiTuong || 'Khách hàng lẻ'}</b></p>
                <p style="margin: 0;">- Địa chỉ: ${data.diaChi || 'Hải Phòng'}</p>
                <p style="margin: 0;">- Diễn giải: ${data.dienGiai || 'Bán hàng hóa'}</p>
            </div>

            <!-- BẢNG CÓ OUTLINE VÀ VIỀN TỪNG Ô ĐẦY ĐỦ -->
            <table class="print-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">STT</th>
                        <th style="width: 100px;">Mã hàng</th>
                        <th>Tên vật tư, hàng hóa</th>
                        <th style="width: 60px;">ĐVT</th>
                        <th style="width: 60px;">SL</th>
                        <th style="width: 100px; text-align: right;">Đơn giá</th>
                        <th style="width: 120px; text-align: right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${(data.chiTiet && data.chiTiet.length > 0) ? data.chiTiet.map((ct, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td style="font-weight: 600; text-align: center;">${ct.maHang || ''}</td>
                            <td>${ct.tenHang || ''}</td>
                            <td style="text-align: center;">${ct.dvt || ''}</td>
                            <td style="text-align: center; font-weight: bold;">${ct.soLuong || 0}</td>
                            <td style="text-align: right;">${Number(ct.donGia || 0).toLocaleString('vi-VN')}</td>
                            <td style="text-align: right; font-weight: bold;">${Number((ct.soLuong || 0) * (ct.donGia || 0)).toLocaleString('vi-VN')}</td>
                        </tr>
                    `).join('') : `
                        <tr><td colspan="7" style="text-align: center; font-style: italic;">Không có mặt hàng nào</td></tr>
                    `}
                    <tr style="font-weight: bold; background-color: #fafafa;">
                        <td colspan="6" style="text-align: right; text-transform: uppercase;">Tổng cộng thanh toán:</td>
                        <td style="text-align: right; color: #b91c1c; font-size: 14px;">${Number(tongTien).toLocaleString('vi-VN')} đ</td>
                    </tr>
                </tbody>
            </table>

            <p style="font-style: italic; margin: 8px 0 35px 0; font-size: 13.5px;">Số tiền viết bằng chữ: <b>${tienChu}</b></p>

            <!-- BẢNG CHỮ KÝ ĐỒNG BỘ 4 BÊN -->
            <table class="signature-table" style="width: 100%; text-align: center; font-size: 13.5px;">
                <tr>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Người mua hàng</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Người lập phiếu</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Thủ kho</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Giám đốc / KTT</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, đóng dấu)</span>
                    </td>
                </tr>
            </table>
        `;
    } 
    else if (loai === 'PXK') {
        html += `
            <!-- CỤM TIÊU ĐỀ + NỢ/CÓ ĐẶT NGANG HÀNG NHAU -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 15px 0 16px 0;">
                <!-- Cột trống bên trái để giữ khối tiêu đề cân đối chính giữa -->
                <div style="width: 120px;"></div>

                <!-- Cột giữa: Tiêu đề, Ngày, Số phiếu -->
                <div style="text-align: center; flex: 1;">
                    <h2 style="font-size: 21px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">PHIẾU XUẤT KHO</h2>
                    <p style="font-style: italic; margin: 4px 0 0 0; font-size: 13px;">Ngày ${ngay} tháng ${thang} năm ${nam}</p>
                    <p style="margin: 3px 0 0 0; font-weight: bold;">Số: <span style="color: #b91c1c;">${soChungTuHienThi}</span></p>
                </div>

                <!-- Cột phải: Khối định khoản Nợ / Có đưa lên cao -->
                <div style="width: 120px; text-align: left; font-size: 13.5px; line-height: 1.5;">
                    <p style="margin: 0;">Nợ: <b>632</b></p>
                    <p style="margin: 0;">Có: <b>156</b></p>
                </div>
            </div>

            <!-- PHẦN THÔNG TIN NGƯỜI NHẬN & LÝ DO CHIẾM TRỌN HÀNG NGANG -->
            <div style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.7;">
                <p style="margin: 0;">- Họ và tên người nhận hàng: <b>${data.doiTuong || ''}</b></p>
                <p style="margin: 0;">- Lý do xuất kho: ${data.dienGiai || 'Xuất bán hàng hóa'}</p>
                <p style="margin: 0;">- Xuất tại kho: <b>Kho chính Hải Phòng</b></p>
            </div>

            <table class="print-table">
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 35px;">STT</th>
                        <th rowspan="2">Tên, nhãn hiệu, quy cách vật tư, sản phẩm</th>
                        <th rowspan="2" style="width: 85px;">Mã số</th>
                        <th rowspan="2" style="width: 55px;">ĐVT</th>
                        <th colspan="2" style="width: 120px;">Số lượng</th>
                        <th rowspan="2" style="width: 95px; text-align: right;">Đơn giá</th>
                        <th rowspan="2" style="width: 115px; text-align: right;">Thành tiền</th>
                    </tr>
                    <tr>
                        <th style="width: 60px;">Chứng từ</th>
                        <th style="width: 60px;">Thực xuất</th>
                    </tr>
                </thead>
                <tbody>
                    ${(data.chiTiet && data.chiTiet.length > 0) ? data.chiTiet.map((ct, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${ct.tenHang || ''}</td>
                            <td style="text-align: center; font-weight: 600;">${ct.maHang || ''}</td>
                            <td style="text-align: center;">${ct.dvt || ''}</td>
                            <td style="text-align: center;">${ct.soLuong || 0}</td>
                            <td style="text-align: center; font-weight: bold;">${ct.soLuong || 0}</td>
                            <td style="text-align: right;">${Number(ct.donGia || 0).toLocaleString('vi-VN')}</td>
                            <td style="text-align: right; font-weight: bold;">${Number((ct.soLuong || 0) * (ct.donGia || 0)).toLocaleString('vi-VN')}</td>
                        </tr>
                    `).join('') : `
                        <tr><td colspan="8" style="text-align: center; font-style: italic;">Không có mặt hàng nào</td></tr>
                    `}
                    <tr style="font-weight: bold; background-color: #fafafa;">
                        <td colspan="7" style="text-align: right; text-transform: uppercase;">Cộng tiền hàng xuất kho:</td>
                        <td style="text-align: right; color: #b91c1c;">${Number(tongTien).toLocaleString('vi-VN')} đ</td>
                    </tr>
                </tbody>
            </table>

            <p style="font-style: italic; margin: 8px 0 35px 0; font-size: 13.5px;">Tổng số tiền (viết bằng chữ): <b>${tienChu}</b></p>

            <table class="signature-table" style="width: 100%; text-align: center; font-size: 13.5px;">
                <tr>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Người lập phiếu</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Người nhận hàng</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Thủ kho</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Kế toán trưởng</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                </tr>
            </table>
        `;
    }
    else if (loai === 'PTM') {
        html += `
            <!-- CỤM TIÊU ĐỀ + NỢ/CÓ ĐẶT NGANG HÀNG NHAU -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 15px 0 16px 0;">
                <div style="width: 120px;"></div>

                <div style="text-align: center; flex: 1;">
                    <h2 style="font-size: 21px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">PHIẾU THU</h2>
                    <p style="font-style: italic; margin: 4px 0 0 0; font-size: 13px;">Ngày ${ngay} tháng ${thang} năm ${nam}</p>
                    <p style="margin: 3px 0 0 0; font-weight: bold;">Số: <span style="color: #b91c1c;">${soChungTuHienThi}</span></p>
                </div>

                <div style="width: 120px; text-align: left; font-size: 13.5px; line-height: 1.5;">
                    <p style="margin: 0;">Nợ: <b>1111</b></p>
                    <p style="margin: 0;">Có: <b>131 / 511</b></p>
                </div>
            </div>

            <div style="line-height: 2.1; margin-bottom: 30px; font-size: 14px;">
                <p style="margin: 0;">- Họ và tên người nộp tiền: <b>${data.doiTuong || ''}</b></p>
                <p style="margin: 0;">- Địa chỉ: ${data.diaChi || 'Hải Phòng'}</p>
                <p style="margin: 0;">- Lý do nộp: ${data.dienGiai || 'Thanh toán tiền mua hàng theo hóa đơn/chứng từ ' + soChungTuGoc}</p>
                <p style="margin: 0;">- Số tiền: <b style="font-size: 15.5px; color: #047857;">${Number(tongTien).toLocaleString('vi-VN')} VND</b></p>
                <p style="margin: 0;">- Viết bằng chữ: <b>${tienChu}</b></p>
                <p style="margin: 0;">- Kèm theo: 01 Chứng từ gốc (Phiếu bán hàng số ${soChungTuGoc})</p>
            </div>

            <table class="signature-table" style="width: 100%; text-align: center; font-size: 13.5px;">
                <tr>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Giám đốc</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên, đóng dấu)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Kế toán trưởng</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Người nộp tiền</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 25%; vertical-align: top;">
                        <b>Thủ quỹ</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                </tr>
            </table>
            <div style="text-align: center; font-style: italic; font-size: 12px; margin-top: 55px; color: #4b5563;">
                (Đã nhận đủ số tiền: ${Number(tongTien).toLocaleString('vi-VN')} đồng)
            </div>
        `;
    }
    else if (loai === 'PNH') {
        html = `
            <!-- HEADER CHỨNG TỪ NỘI BỘ -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                <div style="line-height: 1.5;">
                    <p style="font-weight: bold; text-transform: uppercase; font-size: 14px; margin: 0;">Đơn vị: ${config.tenDonVi}</p>
                    <p style="margin: 3px 0 0 0;">Địa chỉ: ${config.diaChi}</p>
                    <p style="margin: 3px 0 0 0;">Mã số thuế: ${config.mst}</p>
                </div>
                <div style="text-align: right; line-height: 1.4;">
                    <p style="font-weight: bold; font-size: 13.5px; margin: 0;">Số CT: <span style="color: #b91c1c;">${soChungTuHienThi}</span></p>
                    <p style="font-style: italic; font-size: 11.5px; margin: 2px 0 0 0; color: #4b5563;">(Chứng từ kế toán nội bộ)</p>
                </div>
            </div>

            <!-- TIÊU ĐỀ BIỂU MẪU -->
            <!-- CỤM TIÊU ĐỀ + NỢ/CÓ ĐẶT NGANG HÀNG NHAU -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 15px 0 16px 0;">
                <div style="width: 120px;"></div>

                <div style="text-align: center; flex: 1;">
                    <h2 style="font-size: 21px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">PHIẾU BÁO CÓ</h2>
                    <p style="font-style: italic; margin: 4px 0 0 0; font-size: 13px;">Ngày ${ngay} tháng ${thang} năm ${nam}</p>
                    <p style="margin: 3px 0 0 0; font-weight: bold;">Số: <span style="color: #b91c1c;">${soChungTuHienThi}</span></p>
                </div>

                <div style="width: 120px; text-align: left; font-size: 13.5px; line-height: 1.5;">
                    <p style="margin: 0;">Nợ: <b>1121</b></p>
                    <p style="margin: 0;">Có: <b>131 / 511</b></p>
                </div>
            </div>

            <div style="line-height: 2.1; margin-bottom: 30px; font-size: 14px; border: 1px solid #000; padding: 14px; background-color: #fafafa;">
                <p style="margin: 0;">- Đơn vị thụ hưởng: <b>${config.tenDonVi}</b></p>
                <p style="margin: 0;">- Tài khoản nhận: <b>1903.xxxx.xxxx tại Techcombank - CN Hải Phòng</b></p>
                <p style="margin: 0;">- Đơn vị thanh toán: <b>${data.doiTuong || ''}</b></p>
                <p style="margin: 0;">- Nội dung giao dịch: Chuyển khoản tiền mua hàng theo ${soChungTuGoc}</p>
                <p style="margin: 0;">- Số tiền ghi Có: <b style="font-size: 15.5px; color: #047857;">${Number(tongTien).toLocaleString('vi-VN')} VND</b></p>
                <p style="margin: 0;">- Viết bằng chữ: <b>${tienChu}</b></p>
                <p style="margin: 0; font-style: italic; font-size: 12.5px; color: #4b5563;">- Kèm theo: Giấy báo Có / Lệnh chuyển tiền từ Ngân hàng phục vụ</p>
            </div>

            <!-- BẢNG KÝ TÊN -->
            <table class="signature-table" style="width: 100%; text-align: center; font-size: 13.5px;">
                <tr>
                    <td style="width: 33.3%; vertical-align: top;">
                        <b>Người lập biểu</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 33.3%; vertical-align: top;">
                        <b>Kế toán thanh toán</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên)</span>
                    </td>
                    <td style="width: 33.3%; vertical-align: top;">
                        <b>Kế toán trưởng / Giám đốc</b><br>
                        <span style="font-style: italic; font-size: 12px;">(Ký, họ tên, đóng dấu)</span>
                    </td>
                </tr>
            </table>
        `;
    }

    khungIn.innerHTML = html;
}
