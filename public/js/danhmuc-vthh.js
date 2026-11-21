
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
                if (data.success) {
                    alert("Thêm hàng hóa mới thành công!");
                    await taiDanhSachHangHoa();
                    chonHangHoaTuBang({ ma, ten, dvt, ton, giaBan });
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

            if (tinhChat === 'hanghoa') {
                tkKhoSelect.value = '156'; // Hàng hóa -> 156
            } else if (tinhChat === 'congcudungcu') {
                tkKhoSelect.value = '153'; // Công cụ dụng cụ -> 153
            } else if (tinhChat === 'nguyenvatlieu') {
                tkKhoSelect.value = '152'; // Nguyên vật liệu -> 152
            } else if (tinhChat === 'thanhpham') {
                tkKhoSelect.value = '155'; // Thành phẩm -> 155
            } else if (tinhChat === 'dichvu') {
                tkKhoSelect.value = 'khong'; // Dịch vụ không tính kho
            }
        }

       // 1. Thu gọn hoặc mở rộng khung "Đơn vị chuyển đổi"
        function toggleDonViChuyenDoi() {
            const box = document.getElementById('box-don-vi-quydoi');
            const icon = document.getElementById('icon-toggle-quydoi');
            if (!box) return;
            
            if (box.classList.contains('hidden')) {
                box.classList.remove('hidden');
                icon.textContent = "-";
            } else {
                box.classList.add('hidden');
                icon.textContent = "+";
            }
        }

        // 2. Thêm một dòng quy đổi mới vào bảng
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

        // 3. Xóa 1 dòng quy đổi
        function xoaDongQuyDoi(btn) {
            const row = btn.closest('tr');
            if (row) row.remove();
        }

        // 4. Xóa toàn bộ các dòng quy đổi
        function xoaHetDongQuyDoi() {
            const tbody = document.getElementById('tbody-don-vi-chuyen-doi');
            if (tbody) tbody.innerHTML = "";
        }

        // 5. Tự động tính toán chuỗi Mô tả theo đúng tỷ lệ và phép tính
        function tuDongTinhMoTa(el) {
            const row = el ? el.closest('tr') : null;
            const dvtChinh = document.getElementById('quick-dvt-hh')?.value.trim() || "ĐVT chính";

            // Nếu truyền vào một ô cụ thể thì tính cho dòng đó, nếu không thì quét toàn bộ bảng
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

                if (phepTinh === 'nhan') {
                    motaInput.value = `1 ${dvtQD} = ${tyLe} ${dvtChinh}`;
                } else {
                    motaInput.value = `1 ${dvtQD} = 1/${tyLe} ${dvtChinh}`;
                }
            });
        }

        // 6. Gọi từ ô "ĐVT chính" (oninput="capNhatMoTaQuyDoi()"): tính lại mô tả cho toàn bộ các dòng quy đổi
        function capNhatMoTaQuyDoi() {
            tuDongTinhMoTa(null);
        }

        // Lắng nghe khi người dùng đổi ô "ĐVT chính" ở trên thì tự cập nhật lại cột mô tả của các dòng quy đổi
        document.getElementById('quick-dvt-hh')?.addEventListener('input', () => {
            tuDongTinhMoTa(null);
        });

        // 3. Mở modal con và khôi phục form mặc định
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

        if (btn) dongDangChonHangHoa = btn.closest('.item-row');
        const boxHH = document.getElementById('dropdown-table-hh');
        if (boxHH) boxHH.classList.add('hidden');

        document.getElementById('modal-them-hang-hoa').classList.remove('hidden');
        if (inputMa) inputMa.focus();
    }

        // 4. Đóng modal con
        function dongModalThemHH() {
            const modalHH = document.getElementById('modal-them-hang-hoa');
            if (modalHH) modalHH.classList.add('hidden');
        }

        // 5. Lưu đầy đủ dữ liệu mới lên Server Node.js
        async function luuNhanhHangHoa() {
        const tinhChat = document.getElementById('quick-tinhchat-hh').value;
        const tkKho = document.getElementById('quick-tkkho-hh').value;
        const ma = document.getElementById('quick-ma-hh').value.trim().toUpperCase();
        const ten = document.getElementById('quick-ten-hh').value.trim();
        const dvt = document.getElementById('quick-dvt-hh').value.trim() || "Cái";
        const ton = parseFloat(document.getElementById('quick-ton-hh').value) || 0;
        const giaVon = parseFloat((document.getElementById('quick-giamua-hh')?.value || "0").replace(/,/g, '')) || 0;
        const giaBan = parseFloat(document.getElementById('quick-gia-hh').value.replace(/,/g, '')) || 0;

        if (!ma || !ten) {
            alert("Vui lòng nhập đầy đủ Mã và Tên hàng hóa!");
            return;
        }

        const qdRows = document.querySelectorAll('#tbody-don-vi-chuyen-doi .quydoi-row');
        const danhSachQuyDoi = [];
        qdRows.forEach(r => {
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

            if (data.success) {
                alert(dangSuaMaHangHoa ? "Cập nhật hàng hóa thành công!" : "Đã thêm hàng hóa mới thành công!");
                await taiDanhSachHangHoa();

                if (dongDangChonHangHoa) {
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
    // Biến lưu mã hàng đang sửa (null = Thêm mới)
    let dangSuaMaHangHoa = null;

    // 1. Hàm mở form sửa thông tin hàng hóa
    function moModalSuaHH(maHang) {
    const hh = (window.danhSachHangHoaServer || []).find(i => i.ma === maHang);
    if (!hh) {
        alert("Không tìm thấy thông tin hàng hóa!");
        return;
    }

    dangSuaMaHangHoa = maHang;

    const modalTitle = document.querySelector('#modal-them-hang-hoa h3');
    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square mr-2"></i>Sửa thông tin Vật tư, Hàng hóa: ${hh.ma}`;

    const inputMa = document.getElementById('quick-ma-hh');
    inputMa.value = hh.ma;
    inputMa.setAttribute('readonly', true);
    inputMa.classList.add('bg-gray-100');

    document.getElementById('quick-tinhchat-hh').value = hh.tinhChat || "hanghoa";
    document.getElementById('quick-tkkho-hh').value = hh.tkKho || "156";
    document.getElementById('quick-ten-hh').value = hh.ten || "";
    document.getElementById('quick-dvt-hh').value = hh.dvt || "Cái";
    document.getElementById('quick-ton-hh').value = hh.ton || "0";
    
    // Nạp cả giá mua và giá bán
    if (document.getElementById('quick-giamua-hh')) {
        document.getElementById('quick-giamua-hh').value = Number(hh.giaVon || 0).toLocaleString('en-US');
    }
    document.getElementById('quick-gia-hh').value = Number(hh.giaBan || 0).toLocaleString('en-US');

    // Nạp bảng quy đổi
    const tbodyQD = document.getElementById('tbody-don-vi-chuyen-doi');
    if (tbodyQD) {
        tbodyQD.innerHTML = "";
        let dsQD = [];
        if (Array.isArray(hh.donViChuyenDoi)) dsQD = hh.donViChuyenDoi;
        else if (hh.quyDoi) dsQD = [hh.quyDoi];

        if (dsQD.length > 0) {
            dsQD.forEach(qd => {
                const tr = document.createElement('tr');
                tr.className = "quydoi-row hover:bg-emerald-50/30";
                tr.innerHTML = `
                    <td class="p-1.5 border-r">
                        <input type="text" value="${qd.dvtQD || qd.dvtQuyDoi || ''}" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-dvt">
                    </td>
                    <td class="p-1.5 border-r">
                        <input type="number" value="${qd.tyLe || qd.tyLeQuyDoi || 1}" min="0.0001" step="any" oninput="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-tyle">
                    </td>
                    <td class="p-1.5 border-r">
                        <select onchange="tuDongTinhMoTa(this)" class="w-full px-2 py-1 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 qd-pheptinh">
                            <option value="nhan" ${(qd.phepTinh || qd.phepTinhQuyDoi) === 'nhan' ? 'selected' : ''}>Phép nhân</option>
                            <option value="chia" ${(qd.phepTinh || qd.phepTinhQuyDoi) === 'chia' ? 'selected' : ''}>Phép chia</option>
                        </select>
                    </td>
                    <td class="p-1.5 border-r">
                        <input type="text" readonly value="${qd.moTa || qd.moTaQuyDoi || ''}" class="w-full px-2.5 py-1 border rounded bg-gray-50 text-emerald-800 font-semibold qd-mota">
                    </td>
                    <td class="p-1.5 text-center">
                        <button type="button" onclick="xoaDongQuyDoi(this)" class="text-red-500 hover:text-red-700 text-sm" title="Xóa dòng"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                `;
                tbodyQD.appendChild(tr);
            });
        }
    }

    document.getElementById('modal-them-hang-hoa').classList.remove('hidden');
}
    
    // 1. Hàm tìm kiếm hàng hóa tức thì
        function locDanhSachVTHH() {
        const tuKhoa = (document.getElementById('tim-kiem-vthh')?.value || "").trim().toLowerCase();
        const tinhChatLoc = document.getElementById('loc-tinhchat-vthh')?.value || "tat_ca";
        const danhSachGoc = window.danhSachHangHoaServer || [];

        const ketQua = danhSachGoc.filter(item => {
            const matchTuKhoa = !tuKhoa || 
                (item.ma && item.ma.toLowerCase().includes(tuKhoa)) ||
                (item.ten && item.ten.toLowerCase().includes(tuKhoa));

            const itemTC = item.tinhChat || "hanghoa";
            const matchTinhChat = (tinhChatLoc === "tat_ca") || (itemTC === tinhChatLoc);

            return matchTuKhoa && matchTinhChat;
        });

        hienThiDanhSachVTHH(ketQua);
    }
    // Hàm đặt lại bộ lọc VTHH
        function datLaiBoLocVTHH() {
            const inputSearch = document.getElementById('tim-kiem-vthh');
            const selectFilter = document.getElementById('loc-tinhchat-vthh');
            if (inputSearch) inputSearch.value = "";
            if (selectFilter) selectFilter.value = "tat_ca";
            
            hienThiDanhSachVTHH(window.danhSachHangHoaServer || []);
        }
        // 2. Cập nhật hàm hiển thị bảng danh mục (nhận danh sách lọc tùy chọn)
        function hienThiDanhSachVTHH(danhSachTuyChon = null) {
        const tbody = document.getElementById('tbody-danhmuc-vthh') || document.querySelector('#view-danhmuc-vthh tbody');
        const footerCount = document.getElementById('lbl-tong-so-vthh');
        if (!tbody) return;
        tbody.innerHTML = "";

        const danhSach = danhSachTuyChon !== null ? danhSachTuyChon : (window.danhSachHangHoaServer || []);

        // Cập nhật Footer đếm số dòng
        if (footerCount) {
            footerCount.textContent = String(danhSach.length).padStart(2, '0');
        }

        if (danhSach.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-gray-400 italic">Không tìm thấy vật tư, hàng hóa nào phù hợp.</td></tr>`;
            return;
        }

        // Bản đồ nhãn và màu sắc cho từng tính chất
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

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50";
            tr.innerHTML = `
                <td class="py-2.5 px-3 text-center">
                    <input type="checkbox" value="${item.ma}" class="chk-item-vthh rounded text-orange-900 focus:ring-orange-700 cursor-pointer" onchange="capNhatNutXoaVTHH()">
                </td>
                <td class="py-2.5 px-3 text-center text-gray-500 font-medium">${index + 1}</td>
                <td class="py-2.5 px-3 font-medium text-orange-900">${item.ma}</td>
                <td class="py-2.5 px-3 font-medium text-gray-800">${item.ten}</td>
                <td class="py-2.5 px-3 text-center">
                    <span class="${tcInfo.color} text-xs px-2.5 py-0.5 rounded-full font-medium inline-block">
                        ${tcInfo.ten}
                    </span>
                </td>
                <td class="py-2.5 px-3 text-center">${item.dvt || "Cái"}</td>
                <td class="py-2.5 px-3 text-right">${Number(item.giaVon || 0).toLocaleString('en-US')} đ</td>
                <td class="py-2.5 px-3 text-right font-semibold text-blue-700">${Number(item.giaBan || 0).toLocaleString('en-US')} đ</td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <div class="inline-flex items-center justify-center space-x-3">
                        <button type="button" onclick="moModalSuaHH('${item.ma}')" class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition" title="Sửa hàng hóa">
                            <i class="fa-solid fa-pen text-[11px] mr-1"></i>Sửa
                        </button>
                        <button type="button" onclick="xoaHangHoa('${item.ma}')" class="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 hover:underline transition" title="Xóa hàng hóa">
                            <i class="fa-solid fa-trash text-[11px] mr-1"></i>Xóa
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    // Hàm mở form sửa cho hàng hóa đang đứng tại dòng hiện tại
    function suaHangHoaTaiDong(btn) {
        const row = btn.closest('.item-row');
        if (!row) return;

        // Ghi nhớ dòng hiện tại để sau khi sửa xong sẽ tự động nạp lại dữ liệu vào dòng này
        dongDangChonHangHoa = row;

        const inputMa = row.querySelector('.item-mahang');
        const maHang = inputMa ? inputMa.value.trim().toUpperCase() : "";

        if (!maHang) {
            alert("Dòng này chưa chọn hàng hóa! Vui lòng chọn hoặc nhập mã hàng trước khi sửa.");
            if (inputMa) inputMa.focus();
            return;
        }

        // Đóng popup tìm kiếm nếu đang mở
        if (typeof dongBangChonHH === "function") dongBangChonHH();

        // Mở sub-modal sửa hàng hóa cho mã hàng này
        moModalSuaHH(maHang);
    }
    
    // Hàm xóa hàng hóa khỏi danh mục
    async function xoaHangHoa(maHang) {
        const xacNhan = confirm(`Bạn có chắc chắn muốn xóa vật tư, hàng hóa [${maHang}] không?`);
        if (!xacNhan) return;

        try {
            const res = await fetch(`/api/xoa-hang-hoa/${encodeURIComponent(maHang)}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert(data.message);
                if (typeof taiDanhSachHangHoa === 'function') await taiDanhSachHangHoa();
                if (typeof locDanhSachVTHH === 'function') locDanhSachVTHH();
            } else {
                // Hiển thị thông báo chặn xóa từ server
                alert(data.message || "Không thể xóa hàng hóa này!");
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ! Hãy kiểm tra terminal 'node server.js'");
        }
    }
    // ==============================================================
    // BỘ HÀM CHỌN TẤT CẢ & HIỆN NÚT XÓA HÀNG LOẠT VẬT TƯ HÀNG HÓA
    // ==============================================================

    // 1. Tích ô vuông cạnh STT -> Chọn hoặc bỏ chọn tất cả các dòng
    function chonTatCaVTHH(masterChk) {
        const danhSachItem = document.querySelectorAll('.chk-item-vthh');
        danhSachItem.forEach(c => {
            c.checked = masterChk.checked;
        });
        capNhatNutXoaVTHH();
    }

    // 2. Cập nhật số lượng và ẩn/hiện nút Xóa màu đỏ
    function capNhatNutXoaVTHH() {
        const tatCaItems = document.querySelectorAll('.chk-item-vthh');
        const dsChon = Array.from(document.querySelectorAll('.chk-item-vthh:checked')).map(c => c.value);
        
        const btn = document.getElementById('btn-xoa-nhieu-vthh');
        const lblCount = document.getElementById('count-chon-vthh');
        const masterChk = document.getElementById('chk-all-vthh');

        // Hiển thị số lượng đã chọn lên nhãn nút
        if (lblCount) lblCount.textContent = dsChon.length;

        // Tự động đồng bộ trạng thái ô chọn tất cả cạnh STT
        if (masterChk && tatCaItems.length > 0) {
            masterChk.checked = (dsChon.length === tatCaItems.length);
        }

        // Hiện nút đỏ khi có ít nhất 1 dòng được chọn, ngược lại thì ẩn
        if (btn) {
            if (dsChon.length > 0) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        }
    }

    // 3. Thực hiện xóa các mặt hàng đã chọn (gọi API server)
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
            alert(result.message);

            // Nạp lại danh mục và làm mới bảng
            await taiDanhSachHangHoa();
            hienThiDanhSachVTHH();

            // Reset ô chọn tất cả và ẩn nút xóa
            const master = document.getElementById('chk-all-vthh');
            if (master) master.checked = false;
            capNhatNutXoaVTHH();
        } catch (e) {
            alert("Lỗi kết nối khi xóa hàng hóa hàng loạt! Hãy kiểm tra terminal server.");
        }
    }
// ==============================================================
// 1. ĐIỀU KHIỂN CHỌN & XÓA NHIỀU VẬT TƯ HÀNG HÓA
// ==============================================================

// Bấm checkbox ở tiêu đề để chọn hoặc bỏ chọn tất cả
function chonTatCaVTHH(masterChk) {
    document.querySelectorAll('.chk-item-vthh').forEach(c => {
        c.checked = masterChk.checked;
    });
    capNhatNutXoaVTHH();
}

// Kiểm tra số lượng đã chọn để hiển thị/ẩn nút Xóa đỏ
function capNhatNutXoaVTHH() {
    const dsChon = Array.from(document.querySelectorAll('.chk-item-vthh:checked')).map(c => c.value);
    const btn = document.getElementById('btn-xoa-nhieu-vthh');
    const lblCount = document.getElementById('count-chon-vthh');
    
    if (lblCount) lblCount.textContent = dsChon.length;
    if (btn) {
        if (dsChon.length > 0) {
            btn.classList.remove('hidden'); // Hiện nút xóa khi có tích chọn
        } else {
            btn.classList.add('hidden');    // Ẩn đi khi không chọn dòng nào
        }
    }
}

// Thực hiện xóa các mặt hàng đã chọn
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
        alert(result.message);
        
        // Tải lại danh sách hàng hóa và vẽ lại bảng
        await taiDanhSachHangHoa();
        hienThiDanhSachVTHH();

        // Bỏ chọn nút master và ẩn nút xóa
        const master = document.getElementById('chk-all-vthh');
        if (master) master.checked = false;
        capNhatNutXoaVTHH();
    } catch (e) {
        alert("Lỗi kết nối khi xóa hàng hóa hàng loạt!");
    }
}
