// ==========================================
// 1. XỬ LÝ EXCEL CHO VẬT TƯ HÀNG HÓA
// ==========================================
// BỘ ĐIỀU KHIỂN POPUP NHẬP EXCEL & TẢI FILE MẪU CHUẨN (VTHH & ĐỐI TƯỢNG)
// ==============================================================
let dangChonImportLoai = 'vthh'; // 'vthh' hoặc 'doituong'
let fileImportDangChon = null;

// 1. Mở modal chọn file nhập khẩu
function moModalChonFileImport(loai) {
    dangChonImportLoai = loai;
    fileImportDangChon = null;
    
    const inputFile = document.getElementById('input-file-import-dialog');
    if (inputFile) inputFile.value = "";
    
    document.getElementById('ten-file-da-chon').innerHTML = "Nhấn vào đây để chọn tệp từ máy tính của bạn";
    document.getElementById('btn-tieptuc-import').disabled = true;

    const titleEl = document.getElementById('import-dialog-title');
    if (loai === 'vthh') {
        titleEl.innerHTML = `<i class="fa-solid fa-boxes-stacked mr-2 text-emerald-400"></i> Nhập khẩu Danh mục Vật tư Hàng hóa`;
    } else {
        titleEl.innerHTML = `<i class="fa-solid fa-users mr-2 text-emerald-400"></i> Nhập khẩu Danh mục Đối tượng (Khách hàng / NCC)`;
    }

    document.getElementById('modal-chon-file-import').classList.remove('hidden');
}

// 2. Đóng modal chọn file
function dongModalChonFileImport() {
    document.getElementById('modal-chon-file-import').classList.add('hidden');
}

// 3. Xử lý khi người dùng chọn file từ ổ cứng
function xuLyChonFileImportDialog(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileImportDangChon = file;
    document.getElementById('ten-file-da-chon').innerHTML = `
        <span class="text-emerald-700 font-bold"><i class="fa-solid fa-file-circle-check mr-1.5"></i>${file.name}</span>
        <span class="text-gray-500 font-normal">(${(file.size / 1024).toFixed(1)} KB)</span>
    `;
    document.getElementById('btn-tieptuc-import').disabled = false;
}

// 4. Bấm "Tiếp tục" -> Chuyển sang Modal Xem trước & Thẩm định (Preview & Validate)
function chuyenSangXemTruoc() {
    if (!fileImportDangChon) {
        alert("Vui lòng chọn file Excel trước khi tiếp tục!");
        return;
    }
    dongModalChonFileImport();

    // Giả lập sự kiện để gọi hàm đọc & kiểm tra tương ứng
    const mockEvent = { target: { files: [fileImportDangChon], value: "" } };
    if (dangChonImportLoai === 'vthh') {
        nhapExcelVTHH(mockEvent);
    } else {
        nhapExcelDT(mockEvent);
    }
}

// 5. Nút "Tải file mẫu" trong popup (Sinh file mẫu chuẩn có sẵn tiêu đề và dòng ví dụ)
function taiFileMauExcel() {
    if (dangChonImportLoai === 'vthh') {
        const mauVTHH = [
            {
                "STT": 1,
                "Mã hàng (SKU) (*)": "SP_MAU01",
                "Tên vật tư, hàng hóa (*)": "Sản phẩm mẫu A",
                "Tính chất": "Hàng hóa",
                "Đơn vị tính chính (*)": "Cái",
                "Tồn kho ban đầu": 100,
                "Giá mua mặc định": 50000,
                "Giá bán mặc định": 80000,
                "Tài khoản kho": "156",
                "ĐVT quy đổi 1": "Thùng",
                "Tỷ lệ quy đổi 1": 24,
                "Phép tính 1": "Nhân",
                "Giá bán quy đổi 1": 1900000,
                "ĐVT quy đổi 2": "Hộp",
                "Tỷ lệ quy đổi 2": 6,
                "Phép tính 2": "Nhân",
                "Giá bán quy đổi 2": 480000
            }
        ];
        const ws = XLSX.utils.json_to_sheet(mauVTHH);
        ws['!cols'] = [
            { wch: 6 }, { wch: 18 }, { wch: 35 }, { wch: 16 }, { wch: 16 },
            { wch: 15 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
            { wch: 16 }, { wch: 15 }, { wch: 12 }, { wch: 18 },
            { wch: 16 }, { wch: 15 }, { wch: 12 }, { wch: 18 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_HangHoa");
        XLSX.writeFile(wb, `Mau_Nhap_HangHoa_Chuan.xlsx`);
    } else {
        const mauDT = [
            {
                "STT": 1,
                "Mã đối tượng (*)": "DT_MAU01",
                "Tên đối tượng (*)": "Công ty TNHH Mẫu Việt Nam",
                "Phân loại": "Khách hàng",
                "Mã số thuế": "0102030405",
                "Địa chỉ": "Số 123 Đường Lê Lai, Hải Phòng",
                "Mã ĐVCQHNS": "",
                "Điện thoại": "0912345678",
                "Email nhận HĐĐT": "ketoan@mau.vn",
                "Người liên hệ": "Nguyễn Văn A",
                "Số tài khoản NH": "190300001234",
                "Ngân hàng": "Techcombank - CN Hải Phòng"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(mauDT);
        ws['!cols'] = [
            { wch: 6 }, { wch: 18 }, { wch: 40 }, { wch: 22 }, { wch: 16 },
            { wch: 45 }, { wch: 16 }, { wch: 16 }, { wch: 28 }, { wch: 22 },
            { wch: 18 }, { wch: 30 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_DoiTuong");
        XLSX.writeFile(wb, `Mau_Nhap_DoiTuong_Chuan.xlsx`);
    }
}
// Xuất Excel Vật tư hàng hóa
function xuatExcelVTHH() {
    const danhSach = window.danhSachHangHoaServer || [];
    if (danhSach.length === 0) {
        alert("Danh mục hàng hóa đang rỗng!");
        return;
    }

    const mapTinhChat = {
        "hanghoa": "Hàng hóa", "dichvu": "Dịch vụ",
        "nguyenvatlieu": "Nguyên vật liệu", "thanhpham": "Thành phẩm", "congcudungcu": "Công cụ dụng cụ"
    };

    const dataExcel = danhSach.map((item, index) => {
        const qd1 = (item.donViChuyenDoi && item.donViChuyenDoi[0]) || {};
        const qd2 = (item.donViChuyenDoi && item.donViChuyenDoi[1]) || {};

        return {
            "STT": index + 1,
            "Mã hàng (SKU) (*)": item.ma || "",
            "Tên vật tư, hàng hóa (*)": item.ten || "",
            "Tính chất": mapTinhChat[item.tinhChat] || item.tinhChat || "Hàng hóa",
            "Đơn vị tính chính (*)": item.dvt || "Cái",
            "Tồn kho ban đầu": Number(item.ton || 0),
            "Giá mua mặc định": Number(item.giaVon || 0),
            "Giá bán mặc định": Number(item.giaBan || 0),
            "Tài khoản kho": item.tkKho || "156",
            "ĐVT quy đổi 1": qd1.dvtQD || qd1.tenDVT || "",
            "Tỷ lệ quy đổi 1": qd1.tyLe || "",
            "Phép tính 1": qd1.phepTinh || "",
            "Giá bán quy đổi 1": qd1.giaBan || "",
            "ĐVT quy đổi 2": qd2.dvtQD || qd2.tenDVT || "",
            "Tỷ lệ quy đổi 2": qd2.tyLe || "",
            "Phép tính 2": qd2.phepTinh || "",
            "Giá bán quy đổi 2": qd2.giaBan || ""
        };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    ws['!cols'] = [
        { wch: 6 }, { wch: 18 }, { wch: 35 }, { wch: 16 }, { wch: 16 },
        { wch: 15 }, { wch: 16 }, { wch: 16 }, { wch: 14 },
        { wch: 16 }, { wch: 15 }, { wch: 12 }, { wch: 18 },
        { wch: 16 }, { wch: 15 }, { wch: 12 }, { wch: 18 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhMuc_VTHH");
    XLSX.writeFile(wb, `DanhMuc_HangHoa_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Biến lưu trữ phiên nạp hiện tại
let phienImportHienTai = {
    loai: null,           // 'vthh' hoặc 'doituong'
    duLieuHopLe: [],      // Mảng dữ liệu sạch sẵn sàng gửi lên server
    coLoi: false
};

function dongModalPreviewExcel() {
    document.getElementById('modal-preview-excel').classList.add('hidden');
    // Reset các input file để có thể chọn lại cùng 1 file nếu cần
    const fileVTHH = document.getElementById('file-import-vthh');
    const fileDT = document.getElementById('file-import-dt');
    if (fileVTHH) fileVTHH.value = "";
    if (fileDT) fileDT.value = "";
}

// ==========================================
// 1. THẨM ĐỊNH VÀ XEM TRƯỚC VẬT TƯ HÀNG HÓA
// ==========================================
function nhapExcelVTHH(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (rows.length === 0) {
                alert("File Excel rỗng, không có dữ liệu!");
                return;
            }

            const mapTCNguoc = {
                "Hàng hóa": "hanghoa", "Dịch vụ": "dichvu",
                "Nguyên vật liệu": "nguyenvatlieu", "Thành phẩm": "thanhpham",
                "Công cụ dụng cụ": "congcudungcu"
            };

            // Lấy danh sách mã hàng đã có sẵn trên hệ thống
            const danhSachHienTai = window.danhSachHangHoaServer || [];
            const setMaHeThong = new Set(danhSachHienTai.map(h => (h.ma || '').trim().toUpperCase()));

            let danhSachReview = [];
            let setMaTrongFile = new Set();
            let soLoi = 0;

            rows.forEach((r, idx) => {
                const soDong = idx + 2;
                const ma = String(r["Mã hàng (SKU) (*)"] || r["Mã hàng (SKU)"] || r["Mã hàng"] || r["ma"] || "").trim();
                const ten = String(r["Tên vật tư, hàng hóa (*)"] || r["Tên vật tư, hàng hóa"] || r["Tên hàng"] || r["ten"] || "").trim();
                const dvt = String(r["Đơn vị tính (*)"] || r["Đơn vị tính"] || r["ĐVT"] || r["dvt"] || "").trim();
                const giaVon = Number(r["Giá mua mặc định"] || r["giaVon"] || 0);
                const giaBan = Number(r["Giá bán mặc định"] || r["giaBan"] || 0);
                
                let loiDong = [];

                // 1. Kiểm tra trường bắt buộc
                if (!ma) loiDong.push("Thiếu mã hàng (*)");
                if (!ten) loiDong.push("Thiếu tên hàng (*)");
                if (!dvt) loiDong.push("Thiếu ĐVT (*)");

                // 2. Kiểm tra số tiền
                if (isNaN(giaVon) || giaVon < 0) loiDong.push("Giá mua phải là số ≥ 0");
                if (isNaN(giaBan) || giaBan < 0) loiDong.push("Giá bán phải là số ≥ 0");

                const maUpper = ma.toUpperCase();

                // 3. Kiểm tra trùng mã nội bộ trong file Excel
                if (ma) {
                    if (setMaTrongFile.has(maUpper)) {
                        loiDong.push(`Mã trùng với dòng khác trong file`);
                    } else {
                        setMaTrongFile.add(maUpper);
                    }

                    // 4. Kiểm tra trùng mã với hệ thống đã có
                    if (setMaHeThong.has(maUpper)) {
                        loiDong.push(`Mã đã tồn tại trên phần mềm`);
                    }
                }

                if (loiDong.length > 0) soLoi++;
                // ==============================================================
                // BẮT ĐẦU: ĐOẠN BÓC TÁCH CÁC CỘT QUY ĐỔI VÀO MẢNG donViChuyenDoi
                // ==============================================================
                const donViChuyenDoi = [];

                // 1. Bóc tách Quy đổi 1 (nếu có nhập Tên ĐVT và Tỷ lệ > 0)
                const qd1_ten = String(r["ĐVT quy đổi 1"] || "").trim();
                const qd1_tyLe = parseFloat(r["Tỷ lệ quy đổi 1"]);
                if (qd1_ten && !isNaN(qd1_tyLe) && qd1_tyLe > 0) {
                    donViChuyenDoi.push({
                        tenDVT: qd1_ten,
                        tyLe: qd1_tyLe,
                        phepTinh: String(r["Phép tính 1"] || "Nhân").trim() === "Chia" ? "Chia" : "Nhân",
                        giaBan: parseFloat(r["Giá bán quy đổi 1"]) || 0
                    });
                }

                // 2. Bóc tách Quy đổi 2 (nếu có nhập)
                const qd2_ten = String(r["ĐVT quy đổi 2"] || "").trim();
                const qd2_tyLe = parseFloat(r["Tỷ lệ quy đổi 2"]);
                if (qd2_ten && !isNaN(qd2_tyLe) && qd2_tyLe > 0) {
                    donViChuyenDoi.push({
                        tenDVT: qd2_ten,
                        tyLe: qd2_tyLe,
                        phepTinh: String(r["Phép tính 2"] || "Nhân").trim() === "Chia" ? "Chia" : "Nhân",
                        giaBan: parseFloat(r["Giá bán quy đổi 2"]) || 0
                    });
                }
                // ==============================================================
                // KẾT THÚC BÓC TÁCH
                // ==============================================================

                // Đưa vào danh sách xem trước (Preview) và nạp lên server

                danhSachReview.push({
                dong: soDong,
                ma: maUpper,
                ten: ten,
                tinhChat: mapTCNguoc[r["Tính chất"]] || r["tinhChat"] || "hanghoa",
                dvt: dvt,
                ton: parseFloat(r["Tồn kho ban đầu"] || r["ton"] || 0),
                giaVon: giaVon,
                giaBan: giaBan,
                tkKho: String(r["Tài khoản kho"] || "156").trim(),
                donViChuyenDoi: donViChuyenDoi, // <-- Gắn mảng vừa bóc tách vào đây
                hopLe: loiDong.length === 0,
                lyDoLoi: loiDong.join("; ")
            });
        });

            // Hiển thị giao diện xem trước
            moModalPreview("vthh", danhSachReview, soLoi);

        } catch (err) {
            console.error(err);
            alert("Lỗi khi đọc file Excel! Hãy đảm bảo file đúng định dạng.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==========================================
// 2. XỬ LÝ EXCEL CHO ĐỐI TƯỢNG
// ==========================================

// Xuất Excel Đối tượng
function xuatExcelDT() {
    const danhSach = window.danhSachKhachHangServer || [];
    if (danhSach.length === 0) {
        alert("Danh mục đối tượng đang rỗng, không có dữ liệu để xuất!");
        return;
    }

    const dataExcel = danhSach.map((item, index) => ({
        "STT": index + 1,
        "Mã đối tượng (*)": item.ma || "",
        "Tên đối tượng (*)": item.ten || "",
        "Phân loại": item.phanLoai || "Khách hàng",
        "Mã số thuế": item.mst || "",
        "Địa chỉ": item.diaChi || "",
        "Mã ĐVCQHNS": item.maCQHNS || "",
        "Điện thoại": item.dienThoai || "",
        "Email nhận HĐĐT": item.email || "",
        "Người liên hệ": item.nguoiLienHe || "",
        "Số tài khoản NH": item.soTKNH || "",
        "Ngân hàng": item.nganHang || ""
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);

    // Tự động định dạng độ rộng cột (Column Widths) để chữ không bị che cụt
    ws['!cols'] = [
        { wch: 6 },   // STT
        { wch: 18 },  // Mã đối tượng (*)
        { wch: 40 },  // Tên đối tượng (*)
        { wch: 22 },  // Phân loại
        { wch: 16 },  // Mã số thuế
        { wch: 45 },  // Địa chỉ
        { wch: 16 },  // Mã ĐVCQHNS
        { wch: 16 },  // Điện thoại
        { wch: 28 },  // Email
        { wch: 22 },  // Người liên hệ
        { wch: 18 },  // STK NH
        { wch: 30 }   // Ngân hàng
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhMuc_DoiTuong");
    XLSX.writeFile(wb, `DanhMuc_DoiTuong_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Hàm hiển thị bảng danh sách lỗi ra Modal
function hienThiBangLoiExcel(tieuDe, danhSachLoi) {
    document.getElementById('mo-ta-loi-excel').textContent = tieuDe;
    const tbody = document.getElementById('tbody-chi-tiet-loi-excel');
    tbody.innerHTML = "";

    danhSachLoi.forEach(err => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-red-50/50";
        tr.innerHTML = `
            <td class="py-2 px-3 text-center font-bold text-gray-700">Dòng ${err.dong}</td>
            <td class="py-2 px-3 font-semibold text-orange-900">${err.ma || '(Chưa có)'}</td>
            <td class="py-2 px-3 text-red-600 font-medium">${err.lyDo}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('modal-loi-excel').classList.remove('hidden');
}

function dongModalLoiExcel() {
    document.getElementById('modal-loi-excel').classList.add('hidden');
}

// 1. Nhập Excel Đối tượng có kiểm tra tính hợp lệ
function nhapExcelDT(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (rows.length === 0) {
                alert("File Excel rỗng, không có dữ liệu!");
                return;
            }

            // Lấy danh sách mã đối tượng đã có trên hệ thống
            const danhSachHienTai = window.danhSachKhachHangServer || [];
            const setMaHeThong = new Set(danhSachHienTai.map(k => (k.ma || '').trim().toUpperCase()));

            let danhSachReview = [];
            let setMaTrongFile = new Set();
            let soLoi = 0;

            rows.forEach((r, idx) => {
                const soDong = idx + 2;
                const ma = String(r["Mã đối tượng (*)"] || r["Mã đối tượng"] || r["Mã"] || r["ma"] || "").trim();
                const ten = String(r["Tên đối tượng (*)"] || r["Tên đối tượng"] || r["Tên"] || r["ten"] || "").trim();

                let loiDong = [];

                if (!ma) loiDong.push("Thiếu mã đối tượng (*)");
                if (!ten) loiDong.push("Thiếu tên đối tượng (*)");

                const maUpper = ma.toUpperCase();

                // Kiểm tra trùng mã nội bộ trong file
                if (ma) {
                    if (setMaTrongFile.has(maUpper)) {
                        loiDong.push(`Mã trùng với dòng khác trong file`);
                    } else {
                        setMaTrongFile.add(maUpper);
                    }

                    // Kiểm tra trùng mã với hệ thống đã có
                    if (setMaHeThong.has(maUpper)) {
                        loiDong.push(`Mã đã tồn tại trên phần mềm`);
                    }
                }

                if (loiDong.length > 0) soLoi++;

                danhSachReview.push({
                    dong: soDong,
                    ma: maUpper,
                    ten: ten,
                    phanLoai: String(r["Phân loại"] || r["phanLoai"] || "Khách hàng").trim(),
                    mst: String(r["Mã số thuế"] || r["MST"] || "").trim(),
                    diaChi: String(r["Địa chỉ"] || "").trim(),
                    maCQHNS: String(r["Mã ĐVCQHNS"] || "").trim(),
                    dienThoai: String(r["Điện thoại"] || "").trim(),
                    email: String(r["Email nhận HĐĐT"] || "").trim(),
                    nguoiLienHe: String(r["Người liên hệ"] || "").trim(),
                    soTKNH: String(r["Số tài khoản NH"] || "").trim(),
                    nganHang: String(r["Ngân hàng"] || "").trim(),
                    loaiHinh: "to_chuc",
                    hopLe: loiDong.length === 0,
                    lyDoLoi: loiDong.join("; ")
                });
            });

            // Hiển thị giao diện xem trước
            moModalPreview("doituong", danhSachReview, soLoi);

        } catch (err) {
            console.error(err);
            alert("Lỗi khi đọc file Excel! Hãy đảm bảo file đúng định dạng.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==========================================
// 3. HIỂN THỊ DỮ LIỆU LÊN BẢNG PREVIEW
// ==========================================
function moModalPreview(loai, danhSach, soLoi) {
    phienImportHienTai.loai = loai;
    phienImportHienTai.duLieuHopLe = danhSach;
    phienImportHienTai.coLoi = soLoi > 0;

    // Cập nhật thống kê
    document.getElementById('preview-tong-dong').textContent = danhSach.length;
    document.getElementById('preview-hop-le').textContent = danhSach.length - soLoi;
    document.getElementById('preview-so-loi').textContent = soLoi;

    const statusBadge = document.getElementById('preview-status-badge');
    const btnSubmit = document.getElementById('btn-xacnhan-import');

    if (soLoi > 0) {
        statusBadge.innerHTML = `<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Phát hiện ${soLoi} lỗi - Cần sửa file</span>`;
        btnSubmit.disabled = true;
    } else {
        statusBadge.innerHTML = `<span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xs"><i class="fa-solid fa-check mr-1"></i>Dữ liệu hoàn toàn hợp lệ</span>`;
        btnSubmit.disabled = false;
    }

    const thead = document.getElementById('preview-thead');
    const tbody = document.getElementById('preview-tbody');
    tbody.innerHTML = "";

    if (loai === "vthh") {
        document.getElementById('preview-excel-title').innerHTML = `<i class="fa-solid fa-boxes-stacked mr-2 text-emerald-400"></i> Xem trước Danh mục Vật tư Hàng hóa`;
        
        // Cân đối chiều rộng cột VTHH
        thead.innerHTML = `
            <tr>
                <th class="py-2.5 px-3 text-center w-14 whitespace-nowrap">Dòng</th>
                <th class="py-2.5 px-3 text-center w-24 whitespace-nowrap">Trạng thái</th>
                <th class="py-2.5 px-3 w-32 whitespace-nowrap">Mã hàng</th>
                <th class="py-2.5 px-3 w-64">Tên vật tư, hàng hóa</th>
                <th class="py-2.5 px-3 text-center w-20 whitespace-nowrap">ĐVT</th>
                <th class="py-2.5 px-3 text-right w-28 whitespace-nowrap">Giá mua</th>
                <th class="py-2.5 px-3 text-right w-28 whitespace-nowrap">Giá bán</th>
                <th class="py-2.5 px-3 min-w-[220px]">Chi tiết lỗi / Ghi chú</th>
            </tr>
        `;

        danhSach.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = item.hopLe ? "hover:bg-gray-50" : "bg-red-50/70 text-red-950 font-medium";
            tr.innerHTML = `
                <td class="py-2 px-3 text-center text-gray-500 font-semibold">${item.dong}</td>
                <td class="py-2 px-3 text-center">
                    ${item.hopLe 
                        ? '<span class="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block">Hợp lệ</span>'
                        : '<span class="bg-red-200 text-red-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block">Lỗi</span>'}
                </td>
                <td class="py-2 px-3 font-semibold ${item.hopLe ? 'text-orange-900' : 'text-red-700'}">${item.ma || '(Trống)'}</td>
                <td class="py-2 px-3">${item.ten || '(Trống)'}</td>
                <td class="py-2 px-3 text-center">${item.dvt || '-'}</td>
                <td class="py-2 px-3 text-right">${Number(item.giaVon || 0).toLocaleString()} đ</td>
                <td class="py-2 px-3 text-right font-semibold text-blue-700">${Number(item.giaBan || 0).toLocaleString()} đ</td>
                <td class="py-2 px-3 ${item.hopLe ? 'text-gray-400 italic' : 'text-red-600 font-medium'}">
                    ${item.hopLe ? 'Sẵn sàng nạp' : `<i class="fa-solid fa-circle-exclamation mr-1"></i>${item.lyDoLoi}`}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } else {
        document.getElementById('preview-excel-title').innerHTML = `<i class="fa-solid fa-users mr-2 text-emerald-400"></i> Xem trước Danh mục Đối tượng`;
        
        // Cân đối chiều rộng cột Đối tượng
        thead.innerHTML = `
            <tr>
                <th class="py-2.5 px-3 text-center w-14 whitespace-nowrap">Dòng</th>
                <th class="py-2.5 px-3 text-center w-24 whitespace-nowrap">Trạng thái</th>
                <th class="py-2.5 px-3 w-32 whitespace-nowrap">Mã đối tượng</th>
                <th class="py-2.5 px-3 w-64">Tên đối tượng</th>
                <th class="py-2.5 px-3 text-center w-36 whitespace-nowrap">Phân loại</th>
                <th class="py-2.5 px-3 w-28 whitespace-nowrap">Mã số thuế</th>
                <th class="py-2.5 px-3 w-60">Địa chỉ</th>
                <th class="py-2.5 px-3 min-w-[220px]">Chi tiết lỗi / Ghi chú</th>
            </tr>
        `;

        danhSach.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = item.hopLe ? "hover:bg-gray-50" : "bg-red-50/70 text-red-950 font-medium";
            tr.innerHTML = `
                <td class="py-2 px-3 text-center text-gray-500 font-semibold">${item.dong}</td>
                <td class="py-2 px-3 text-center">
                    ${item.hopLe 
                        ? '<span class="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block">Hợp lệ</span>'
                        : '<span class="bg-red-200 text-red-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block">Lỗi</span>'}
                </td>
                <td class="py-2 px-3 font-semibold ${item.hopLe ? 'text-orange-900' : 'text-red-700'}">${item.ma || '(Trống)'}</td>
                <td class="py-2 px-3 font-medium text-gray-800">${item.ten || '(Trống)'}</td>
                <td class="py-2 px-3 text-center text-gray-600">${item.phanLoai || '-'}</td>
                <td class="py-2 px-3 text-gray-600">${item.mst || '-'}</td>
                <td class="py-2 px-3 text-gray-600">${item.diaChi || '-'}</td>
                <td class="py-2 px-3 ${item.hopLe ? 'text-gray-400 italic' : 'text-red-600 font-medium'}">
                    ${item.hopLe ? 'Sẵn sàng nạp' : `<i class="fa-solid fa-circle-exclamation mr-1"></i>${item.lyDoLoi}`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('modal-preview-excel').classList.remove('hidden');
}

// ==========================================
// 4. XÁC NHẬN NẠP DỮ LIỆU LÊN SERVER
// ==========================================
async function thucHienImportServer() {
    if (phienImportHienTai.coLoi) {
        alert("File còn dòng dữ liệu lỗi, không thể nạp vào hệ thống!");
        return;
    }

    const loai = phienImportHienTai.loai;
    const duLieu = phienImportHienTai.duLieuHopLe;
    const url = loai === "vthh" ? '/api/import-hang-hoa' : '/api/import-doi-tuong';

    const btnSubmit = document.getElementById('btn-xacnhan-import');
    const textCu = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang nạp dữ liệu...`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duLieu)
        });
        const result = await res.json();

        if (result.success) {
            alert(result.message);
            dongModalPreviewExcel();

            if (loai === "vthh") {
                await taiDanhSachHangHoa();
                hienThiDanhSachVTHH();
            } else {
                await taiDanhSachDoiTuong();
                hienThiDanhSachDT();
            }
        } else {
            alert(result.message || "Có lỗi xảy ra khi nạp vào hệ thống!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ! Hãy kiểm tra lại tiến trình node server.js.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textCu;
    }
}
