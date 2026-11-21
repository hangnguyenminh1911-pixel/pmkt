        // Biến lưu mã đối tượng đang sửa (null = Thêm mới)
        let dangSuaMaDoiTuong = null;

        // 1. Mở Modal ở chế độ THÊM MỚI
        function moModalThemDT() {
            dangSuaMaDoiTuong = null;

            const modalTitle = document.querySelector('#modal-them-doi-tuong h3');
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-user-plus mr-2"></i>Thêm mới Đối tượng`;

            const inputMa = document.getElementById('quick-ma-dt');
            if (inputMa) {
                inputMa.removeAttribute('readonly');
                inputMa.classList.remove('bg-gray-100');
                inputMa.value = "";
            }

            // Reset các trường
            const radToChuc = document.querySelector('input[name="quick_loai_hinh"][value="to_chuc"]');
            if (radToChuc) radToChuc.checked = true;

            document.getElementById('quick-is-kh').checked = true;
            document.getElementById('quick-is-ncc').checked = false;

            document.getElementById('quick-mst-dt').value = "";
            document.getElementById('quick-cqhns-dt').value = "";
            document.getElementById('quick-dienthoai-dt').value = "";
            document.getElementById('quick-ten-dt').value = "";
            document.getElementById('quick-diachi-dt').value = "";
            document.getElementById('quick-nguoilh-dt').value = "";
            document.getElementById('quick-email-dt').value = "";
            document.getElementById('quick-tknh-dt').value = "";
            document.getElementById('quick-nganhang-dt').value = "";

            document.getElementById('modal-them-doi-tuong').classList.remove('hidden');
            if (inputMa) inputMa.focus();
        }

        // 2. Mở Modal ở chế độ SỬA thông tin đối tượng
        function moModalSuaDT(maDT) {
            const dt = (window.danhSachKhachHangServer || []).find(k => k.ma === maDT);
            if (!dt) {
                alert("Không tìm thấy thông tin đối tượng!");
                return;
            }

            dangSuaMaDoiTuong = maDT;

            const modalTitle = document.querySelector('#modal-them-doi-tuong h3');
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-user-pen mr-2"></i>Sửa thông tin Đối tượng: ${dt.ma}`;

            // Khóa ô Mã đối tượng
            const inputMa = document.getElementById('quick-ma-dt');
            if (inputMa) {
                inputMa.value = dt.ma;
                inputMa.setAttribute('readonly', true);
                inputMa.classList.add('bg-gray-100');
            }

            // Loại hình
            const loaiHinh = dt.loaiHinh || "to_chuc";
            const rad = document.querySelector(`input[name="quick_loai_hinh"][value="${loaiHinh}"]`);
            if (rad) rad.checked = true;

            // Phân loại
            const phanLoaiStr = dt.phanLoai || "Khách hàng";
            document.getElementById('quick-is-kh').checked = phanLoaiStr.includes("Khách hàng");
            document.getElementById('quick-is-ncc').checked = phanLoaiStr.includes("Nhà cung cấp");

            document.getElementById('quick-mst-dt').value = dt.mst || "";
            document.getElementById('quick-cqhns-dt').value = dt.maCQHNS || "";
            document.getElementById('quick-dienthoai-dt').value = dt.dienThoai || "";
            document.getElementById('quick-ten-dt').value = dt.ten || "";
            document.getElementById('quick-diachi-dt').value = dt.diaChi || "";
            document.getElementById('quick-nguoilh-dt').value = dt.nguoiLienHe || "";
            document.getElementById('quick-email-dt').value = dt.email || "";
            document.getElementById('quick-tknh-dt').value = dt.soTKNH || "";
            document.getElementById('quick-nganhang-dt').value = dt.nganHang || "";

            document.getElementById('modal-them-doi-tuong').classList.remove('hidden');
            document.getElementById('quick-ten-dt').focus();
        }

        // 3. Hàm gọi sửa nhanh đối tượng đang chọn trong Phiếu bán hàng
        function suaDoiTuongHienTai() {
            const maKH = document.getElementById('input-makhachhang')?.value.trim().toUpperCase();
            if (!maKH) {
                alert("Chưa chọn đối tượng! Vui lòng chọn hoặc nhập mã đối tượng trước khi sửa.");
                document.getElementById('input-makhachhang')?.focus();
                return;
            }
            moModalSuaDT(maKH);
        }

        // 4. Đóng modal
        function dongModalThemDT() {
            document.getElementById('modal-them-doi-tuong').classList.add('hidden');
        }

        // 5. Lưu thông tin đối tượng (Tự rẽ nhánh THÊM MỚI hoặc CẬP NHẬT)
        async function luuNhanhDoiTuong() {
            const ma = document.getElementById('quick-ma-dt').value.trim().toUpperCase();
            const ten = document.getElementById('quick-ten-dt').value.trim();

            if (!ma || !ten) {
                alert("Vui lòng nhập đầy đủ Mã đối tượng và Tên đối tượng!");
                return;
            }

            // Đọc loại hình
            const loaiHinh = document.querySelector('input[name="quick_loai_hinh"]:checked')?.value || "to_chuc";

            // Tổng hợp chuỗi phân loại
            const isKH = document.getElementById('quick-is-kh').checked;
            const isNCC = document.getElementById('quick-is-ncc').checked;
            let phanLoaiArr = [];
            if (isKH) phanLoaiArr.push("Khách hàng");
            if (isNCC) phanLoaiArr.push("Nhà cung cấp");
            const phanLoai = phanLoaiArr.length > 0 ? phanLoaiArr.join(", ") : "Khách hàng";

            const payloadDT = {
                ma,
                ten,
                loaiHinh,
                phanLoai,
                mst: document.getElementById('quick-mst-dt').value.trim(),
                maCQHNS: document.getElementById('quick-cqhns-dt').value.trim(),
                dienThoai: document.getElementById('quick-dienthoai-dt').value.trim(),
                diaChi: document.getElementById('quick-diachi-dt').value.trim(),
                nguoiLienHe: document.getElementById('quick-nguoilh-dt').value.trim(),
                email: document.getElementById('quick-email-dt').value.trim(),
                soTKNH: document.getElementById('quick-tknh-dt').value.trim(),
                nganHang: document.getElementById('quick-nganhang-dt').value.trim()
            };

            const url = dangSuaMaDoiTuong ? '/api/cap-nhat-doi-tuong' : '/api/them-doi-tuong';

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadDT)
                });
                const data = await res.json();

                if (data.success) {
                    alert(dangSuaMaDoiTuong ? "Cập nhật đối tượng thành công!" : "Đã lưu đối tượng mới thành công!");
                    await taiDanhSachDoiTuong(); // Nạp lại cache

                    // Tự động gán ngay vào phiếu bán hàng đang mở bên dưới
                    chonKhachHangTuBang(payloadDT);

                    // Vẽ lại bảng danh mục bên ngoài
                    hienThiDanhSachDT();

                    dongModalThemDT();
                } else {
                    alert(data.message || "Thao tác không thành công!");
                }
            } catch (e) {
                alert("Lỗi kết nối máy chủ! Hãy kiểm tra terminal 'node server.js'");
            }
        }
        // 1. Hàm vẽ bảng danh mục Đối tượng và tự động cập nhật Footer tổng số dòng
        function hienThiDanhSachDT(danhSachTuyChon = null) {
            const tbody = document.getElementById('tbody-danhmuc-dt') || document.querySelector('#view-danhmuc-dt tbody');
            const footerCount = document.getElementById('lbl-tong-so-dt');
            if (!tbody) return;
            tbody.innerHTML = "";

            // Lấy dữ liệu lọc hoặc lấy từ bộ nhớ server
            const danhSach = danhSachTuyChon !== null ? danhSachTuyChon : (window.danhSachKhachHangServer || []);

            // Cập nhật tổng số dòng
            if (footerCount) {
                footerCount.textContent = String(danhSach.length).padStart(2, '0');
            }

            if (danhSach.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-gray-400 italic">Không tìm thấy đối tượng nào phù hợp với bộ lọc.</td></tr>`;
                return;
            }

            danhSach.forEach((item, index) => {
                const pl = item.phanLoai || "Khách hàng";
                
                let tagColor = "bg-blue-100 text-blue-800";
                if (pl.includes("Nhà cung cấp") && !pl.includes("Khách hàng")) {
                    tagColor = "bg-green-100 text-green-800";
                } else if (pl.includes("Khách hàng") && pl.includes("Nhà cung cấp")) {
                    tagColor = "bg-purple-100 text-purple-800";
                }

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50";
                tr.innerHTML = `
                    <td class="py-2.5 px-3 text-center">
                        <input type="checkbox" value="${item.ma}" class="chk-item-dt rounded text-orange-900 focus:ring-orange-700 cursor-pointer" onchange="capNhatNutXoaDT()">
                    </td>
                    <td class="py-3 px-4 text-center text-gray-500 font-medium">${index + 1}</td>
                    <td class="py-3 px-4 font-medium text-orange-900">${item.ma}</td>
                    <td class="py-3 px-4 font-medium text-gray-800">${item.ten}</td>
                    <td class="py-3 px-4 text-gray-600">${item.mst || "-"}</td>
                    <td class="py-3 px-4 text-gray-600">${item.diaChi || "-"}</td>
                    
                    <!-- CỘT PHÂN LOẠI: Đã chỉnh font chữ thành text-sm đồng bộ với toàn bảng -->
                    <td class="py-3 px-4 text-center">
                        <span class="${tagColor} text-sm px-3 py-1 rounded-full font-medium inline-block">
                            ${pl}
                        </span>
                    </td>

                    <!-- CỘT THAO TÁC: Nhỏ gọn, nằm ngang 1 dòng tuyệt đối -->
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <div class="inline-flex items-center justify-center space-x-3">
                            <button type="button" onclick="moModalSuaDT('${item.ma}')" class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition" title="Sửa thông tin">
                                <i class="fa-solid fa-pen text-[11px] mr-1"></i>Sửa
                            </button>
                            <button type="button" onclick="xoaDoiTuong('${item.ma}')" class="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 hover:underline transition" title="Xóa đối tượng">
                                <i class="fa-solid fa-trash text-[11px] mr-1"></i>Xóa
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

    // 2. Hàm lọc tìm kiếm tức thì theo mã, tên hoặc MST
    function locDanhSachDT() {
        const tuKhoa = (document.getElementById('tim-kiem-dt')?.value || "").trim().toLowerCase();
        const loaiLoc = document.getElementById('loc-phanloai-dt')?.value || "tat_ca";
        const danhSachGoc = window.danhSachKhachHangServer || [];

        const ketQua = danhSachGoc.filter(item => {
            // Khớp từ khóa
            const matchTuKhoa = !tuKhoa || 
                (item.ma && item.ma.toLowerCase().includes(tuKhoa)) ||
                (item.ten && item.ten.toLowerCase().includes(tuKhoa)) ||
                (item.mst && item.mst.toLowerCase().includes(tuKhoa));

            // Khớp phân loại
            const pl = item.phanLoai || "";
            let matchLoai = true;
            if (loaiLoc === "khach_hang") {
                matchLoai = pl.includes("Khách hàng");
            } else if (loaiLoc === "nha_cung_cap") {
                matchLoai = pl.includes("Nhà cung cấp");
            }

            return matchTuKhoa && matchLoai;
        });

        hienThiDanhSachDT(ketQua);
    }

    // 3. Hàm đặt lại bộ lọc
    function datLaiBoLocDT() {
        const inputSearch = document.getElementById('tim-kiem-dt');
        const selectFilter = document.getElementById('loc-phanloai-dt');
        if (inputSearch) inputSearch.value = "";
        if (selectFilter) selectFilter.value = "tat_ca";
        
        // Hiển thị lại toàn bộ danh sách gốc
        hienThiDanhSachDT(window.danhSachKhachHangServer || []);
    }

    // 3. Hàm mở form sửa đối tượng từ danh mục (truyền mã vào)
    function moModalSuaDT(maDT) {
        const dt = (window.danhSachKhachHangServer || []).find(k => k.ma === maDT);
        if (!dt) {
            alert("Không tìm thấy thông tin đối tượng!");
            return;
        }

        dangSuaMaDoiTuong = maDT;

        const modalTitle = document.querySelector('#modal-them-doi-tuong h3');
        if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-user-pen mr-2"></i>Sửa thông tin Đối tượng: ${dt.ma}`;

        const inputMa = document.getElementById('quick-ma-dt');
        if (inputMa) {
            inputMa.value = dt.ma;
            inputMa.setAttribute('readonly', true);
            inputMa.classList.add('bg-gray-100');
        }

        document.getElementById('quick-ten-dt').value = dt.ten || "";
        document.getElementById('quick-mst-dt').value = dt.mst || "";
        document.getElementById('quick-diachi-dt').value = dt.diaChi || "";

        document.getElementById('modal-them-doi-tuong').classList.remove('hidden');
        document.getElementById('quick-ten-dt').focus();
    }

    // 4. Hàm xóa đối tượng khỏi hệ thống
    async function xoaDoiTuong(maDT) {
        const xacNhan = confirm(`Bạn có chắc chắn muốn xóa đối tượng [${maDT}] khỏi danh mục không?`);
        if (!xacNhan) return;

        try {
            const res = await fetch(`/api/xoa-doi-tuong/${encodeURIComponent(maDT)}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert(data.message);
                if (typeof taiDanhSachDoiTuong === 'function') await taiDanhSachDoiTuong();
                if (typeof locDanhSachDT === 'function') locDanhSachDT();
            } else {
                // Hiển thị thông báo chặn xóa từ server
                alert(data.message || "Không thể xóa đối tượng này!");
            }
        } catch (e) {
            alert("Lỗi kết nối máy chủ!");
        }
    }
    // ==============================================================
    // BỘ HÀM CHỌN TẤT CẢ & HIỆN NÚT XÓA HÀNG LOẠT ĐỐI TƯỢNG
    // ==============================================================
    function chonTatCaDT(masterChk) {
        document.querySelectorAll('.chk-item-dt').forEach(c => {
            c.checked = masterChk.checked;
        });
        capNhatNutXoaDT();
    }

    function capNhatNutXoaDT() {
        const tatCaItems = document.querySelectorAll('.chk-item-dt');
        const dsChon = Array.from(document.querySelectorAll('.chk-item-dt:checked')).map(c => c.value);
        
        const btn = document.getElementById('btn-xoa-nhieu-dt');
        const lblCount = document.getElementById('count-chon-dt');
        const masterChk = document.getElementById('chk-all-dt');

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

    async function xoaNhieuDT() {
        const dsChon = Array.from(document.querySelectorAll('.chk-item-dt:checked')).map(c => c.value);
        if (dsChon.length === 0) return;

        if (!confirm(`Bạn có chắc chắn muốn xóa ${dsChon.length} đối tượng đã chọn không?`)) return;

        try {
            const res = await fetch('/api/xoa-nhieu-doi-tuong', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ danhSachMa: dsChon })
            });
            const result = await res.json();
            alert(result.message);

            await taiDanhSachDoiTuong();
            hienThiDanhSachDT();

            const master = document.getElementById('chk-all-dt');
            if (master) master.checked = false;
            capNhatNutXoaDT();
        } catch (e) {
            alert("Lỗi kết nối khi xóa đối tượng hàng loạt!");
        }
    }
    // Hàm tự động tra cứu thông tin doanh nghiệp qua API VietQR
async function traCuuMaSoThue() {
    const inputMST = document.getElementById('quick-mst-dt');
    const mst = (inputMST?.value || "").trim().replace(/\s+/g, '');

    if (!mst) {
        alert("Vui lòng nhập Mã số thuế trước khi tra cứu!");
        inputMST?.focus();
        return;
    }

    const btn = document.getElementById('btn-tracuu-mst');
    const iconCu = btn.innerHTML;

    // Hiệu ứng đang xoay tìm kiếm
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
        // Gọi API mở tra cứu thông tin doanh nghiệp theo MST
        const response = await fetch(`https://api.vietqr.io/v2/business/${encodeURIComponent(mst)}`);
        const result = await response.json();

        if (result.code === "00" && result.data) {
            const data = result.data;

            // 1. Điền Tên đối tượng
            const inputTen = document.getElementById('quick-ten-dt');
            if (inputTen) {
                inputTen.value = data.name || data.shortName || "";
            }

            // 2. Điền Địa chỉ
            const inputDiaChi = document.getElementById('quick-diachi-dt');
            if (inputDiaChi) {
                inputDiaChi.value = data.address || "";
            }

            // 3. Tự động sinh Mã đối tượng nếu đang để trống (chuẩn hóa: MST hoặc KH_MST)
            const inputMa = document.getElementById('quick-ma-dt');
            if (inputMa && !inputMa.value.trim()) {
                inputMa.value = mst;
            }

            // 4. Mặc định là Tổ chức
            const radToChuc = document.querySelector('input[name="quick_loai_hinh"][value="to_chuc"]');
            if (radToChuc) radToChuc.checked = true;

        } else {
            alert(result.desc || "Không tìm thấy thông tin của Mã số thuế này trên hệ thống Tổng cục Thuế!");
        }
    } catch (error) {
        console.error("Lỗi tra cứu MST:", error);
        alert("Không thể kết nối đến máy chủ tra cứu! Vui lòng kiểm tra lại kết nối mạng.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = iconCu;
    }
}

// ==============================================================
// 2. ĐIỀU KHIỂN CHỌN & XÓA NHIỀU ĐỐI TƯỢNG (KHÁCH HÀNG / NCC)
// ==============================================================

function chonTatCaDT(masterChk) {
    document.querySelectorAll('.chk-item-dt').forEach(c => {
        c.checked = masterChk.checked;
    });
    capNhatNutXoaDT();
}

function capNhatNutXoaDT() {
    const dsChon = Array.from(document.querySelectorAll('.chk-item-dt:checked')).map(c => c.value);
    const btn = document.getElementById('btn-xoa-nhieu-dt');
    const lblCount = document.getElementById('count-chon-dt');

    if (lblCount) lblCount.textContent = dsChon.length;
    if (btn) {
        if (dsChon.length > 0) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }
}

async function xoaNhieuDT() {
    const dsChon = Array.from(document.querySelectorAll('.chk-item-dt:checked')).map(c => c.value);
    if (dsChon.length === 0) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa ${dsChon.length} đối tượng đã chọn không?`)) return;

    try {
        const res = await fetch('/api/xoa-nhieu-doi-tuong', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ danhSachMa: dsChon })
        });
        const result = await res.json();
        alert(result.message);

        // Tải lại danh sách đối tượng và vẽ lại bảng
        await taiDanhSachDoiTuong();
        hienThiDanhSachDT();

        const master = document.getElementById('chk-all-dt');
        if (master) master.checked = false;
        capNhatNutXoaDT();
    } catch (e) {
        alert("Lỗi kết nối khi xóa đối tượng hàng loạt!");
    }
}
