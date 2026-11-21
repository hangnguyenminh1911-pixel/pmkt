        
        // Biến lưu trữ dòng đang được chọn để Xem/Sửa (nếu = null nghĩa là đang Thêm mới)
        let dangSuaRow = null;

        // Hàm mở chi tiết chứng từ để Xem hoặc Sửa
        function xemChungTu(button) {
            dangSuaRow = button.closest('tr');
            const soCT = dangSuaRow.children[2].textContent.trim();

            // 1. Tìm trực tiếp dữ liệu gốc từ bộ nhớ Cache đã fetch từ Server
            const itemData = (window.danhSachChungTuCache || []).find(item => item.soChungTu === soCT);
            if (!itemData) {
                alert("Không tìm thấy dữ liệu chứng từ!");
                return;
            }

            // 2. Mở modal và gán thông tin chung
            document.getElementById('modal-title').textContent = "Xem / Sửa phiếu bán hàng: " + itemData.soChungTu;
            document.getElementById('voucher-modal').classList.remove('hidden');

            const inputSoCT = document.getElementById('so-chung-tu-ban');
            inputSoCT.value = itemData.soChungTu;
            inputSoCT.setAttribute('readonly', true);
            inputSoCT.classList.add('bg-gray-100');

            document.getElementById('ngay-chung-tu-ban').value = itemData.ngayChungTu || "";
            document.getElementById('diễn-giải').value = itemData.dienGiai || "";
            document.getElementById('input-diachi').value = itemData.diaChi || "";

            // Gán đối tượng khách hàng (tự động xử lý cả phiếu cũ và phiếu mới)
            const inputMaKH = document.getElementById('input-makhachhang');
            const inputTenKH = document.getElementById('ten-khach-hang');

            let maKH = itemData.maDoiTuong || "";
            let tenKH = itemData.doiTuong || "";

            // Nếu là phiếu cũ chỉ lưu mã KH001 vào trường doiTuong
            if (!maKH && (tenKH === "KH001" || tenKH === "KH002")) {
                maKH = tenKH;
                const khFound = (window.danhSachKhachHangServer || []).find(k => k.ma === maKH);
                tenKH = khFound ? khFound.ten : (maKH === "KH001" ? "Công ty TNHH Thực phẩm Sạch Miền Bắc" : "Công ty CP Chế biến Hải sản Hải Phòng");
            }

            if (inputMaKH) inputMaKH.value = maKH;
            if (inputTenKH) inputTenKH.value = tenKH;

            // 3. Khôi phục ô Chiết khấu HĐ
            const ckHdInput = document.getElementById('ck-hd-input');
            if (ckHdInput) {
                ckHdInput.value = itemData.ckHd ? Number(String(itemData.ckHd).replace(/,/g, '')).toLocaleString('en-US') : "";
            }

            // 4. Khôi phục danh sách chi tiết hàng hóa
            const tbody = document.getElementById('voucher-items');
            tbody.innerHTML = ""; // Xóa sạch các dòng cũ

            const danhSachHang = itemData.chiTiet || [];

            if (Array.isArray(danhSachHang) && danhSachHang.length > 0) {
                danhSachHang.forEach((item) => {
                    themDong(); // Tạo dòng mới
                    
                    const rows = tbody.querySelectorAll('.item-row');
                    const rowMoi = rows[rows.length - 1];
                    if (!rowMoi) return;

                    // 4.1. Điền Mã hàng, Tên hàng
                    const inputMaHH = rowMoi.querySelector('.item-mahang');
                    const inputTenHH = rowMoi.querySelector('.item-tenhang');
                    const tonEl = rowMoi.querySelector('.ton');

                    const maHang = item.maHang || "";
                    let tenHang = item.tenHang || "";

                    // Tra cứu thông tin mặt hàng từ danh mục Server để lấy ĐVT quy đổi và Tồn gốc
                    let thongTinHH = (window.danhSachHangHoaServer || []).find(h => h.ma === maHang);

                    // Dự phòng tên hàng cho các mã cũ nếu server chưa kịp phản hồi
                    if (!tenHang) {
                        if (thongTinHH) {
                            tenHang = thongTinHH.ten;
                        } else if (maHang === "HHC01") {
                            tenHang = "Hàng hóa A";
                        } else if (maHang === "HHC02") {
                            tenHang = "Hàng hóa B";
                        }
                    }

                    if (inputMaHH) inputMaHH.value = maHang;
                    if (inputTenHH) inputTenHH.value = tenHang;

                    // 4.2. Khôi phục Dropdown ĐVT và tính SL tồn theo ĐVT đã lưu
                    if (thongTinHH) {
                        // Gọi hàm napDanhSachDVTVaoDong và truyền item.dvt vào để nó tự chọn đúng đơn vị đã lưu
                        napDanhSachDVTVaoDong(rowMoi, thongTinHH, item.dvt);

                        // Tính toán lại tồn kho hiển thị theo đúng ĐVT đã lưu
                        const dvtSelect = rowMoi.querySelector('.dvt-select');
                        if (dvtSelect && dvtSelect.selectedIndex >= 0) {
                            const opt = dvtSelect.options[dvtSelect.selectedIndex];
                            const tyLe = parseFloat(opt.dataset.tyle) || 1;
                            const phepTinh = opt.dataset.pheptinh || "nhan";
                            const tonGoc = parseFloat(thongTinHH.ton) || 0;

                            let tonHienThi = tonGoc;
                            if (phepTinh === "nhan") {
                                tonHienThi = tyLe > 0 ? (tonGoc / tyLe) : 0;
                            } else {
                                tonHienThi = tonGoc * tyLe;
                            }

                            if (tonEl) {
                                tonEl.textContent = Number(tonHienThi.toFixed(2)).toLocaleString('en-US');
                            }
                        }
                    } else {
                        // Trường hợp không tìm thấy hàng trong danh mục server (phiếu test cũ)
                        const dvtSelect = rowMoi.querySelector('.dvt-select');
                        if (dvtSelect) {
                            dvtSelect.innerHTML = `<option value="${item.dvt || 'Cái'}">${item.dvt || 'Cái'}</option>`;
                        }
                        if (tonEl) tonEl.textContent = "0";
                    }

                    // 4.2. Điền Số lượng và Đơn giá
                    const qtyInput = rowMoi.querySelector('.qty-input');
                    if (qtyInput) qtyInput.value = item.soLuong;

                    const priceInput = rowMoi.querySelector('.price-input');
                    if (priceInput) priceInput.value = Number(item.donGia || 0).toLocaleString('en-US');

                    // 4.3. Điền Chiết khấu dòng
                    const ckTienInput = rowMoi.querySelector('.ck-tien-input');
                    if (ckTienInput && item.tienCK !== undefined) {
                        ckTienInput.value = Number(item.tienCK).toLocaleString('en-US');
                    }

                    const ckPctInput = rowMoi.querySelector('.ck-pct-input');
                    if (ckPctInput && item.pctCK !== undefined) {
                        ckPctInput.value = item.pctCK;
                    }

                    // 4.4. Điền Thuế suất
                    const thueSelect = rowMoi.querySelector('.thuesuat-select');
                    if (thueSelect && item.thueSuat !== undefined) {
                        thueSelect.value = item.thueSuat;
                    }
                });
            } else {
                themDong();
            }

            // 5. Tính toán lại tổng tiền đầy đủ
            tinhToan();
        }
        // Biến lưu trữ dữ liệu chứng từ tải từ server
        window.danhSachChungTuCache = [];

        // 1. Hàm nạp danh sách từ Server Node.js
        async function taiDanhSachChungTu() {
            try {
                const response = await fetch('/api/danh-sach-chung-tu');
                const ketQua = await response.json();

                if (ketQua.success) {
                    window.danhSachChungTuCache = ketQua.data || [];
                    // Hiển thị toàn bộ dữ liệu ban đầu ra bảng
                    hienThiDanhSachBanHang(window.danhSachChungTuCache);
                    // Vẽ lại danh sách phiếu thu / phiếu chi / phiếu mua hàng (js/thuchi-muahang.js)
                    if (typeof hienThiDanhSachChungTuKhac === 'function') hienThiDanhSachChungTuKhac();
                }
            } catch (error) {
                console.error("Lỗi tải danh sách:", error);
            }
        }

        // 2. Hàm vẽ/hiển thị danh sách phiếu ra bảng HTML
            function hienThiDanhSachBanHang(danhSach) {
                // Chỉ hiển thị phiếu bán hàng (phiếu cũ không có loaiChungTu được coi là phiếu bán hàng)
                danhSach = (danhSach || []).filter(laChungTuBanHang);
                const tbody = document.getElementById('tbody-danh-sach-banhang') || document.querySelector('#view-phieu-banhang tbody');
                if (!tbody) return;
                tbody.innerHTML = "";

                if (!danhSach || danhSach.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="py-6 text-center text-gray-400 italic">
                                Không tìm thấy chứng từ nào phù hợp với điều kiện lọc!
                            </td>
                        </tr>
                    `;
                    const footerCount = document.querySelector('#view-phieu-banhang .border-t span.font-bold');
                    if (footerCount) footerCount.textContent = "00";
                    return;
                }

                danhSach.forEach((item, index) => {
                    let ngayHienThi = item.ngayChungTu || "";
                    if (ngayHienThi.includes('-')) {
                        const parts = ngayHienThi.split('-');
                        if (parts.length === 3) ngayHienThi = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }

                    const soCT = item.soChungTu || "";

                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-50 border-b";
                    tr.innerHTML = `
                        <!-- 1. CHECKBOX TỪNG DÒNG CHỨNG TỪ (Khớp với chk-all-ct ở thead) -->
                        <td class="py-2.5 px-3 text-center">
                            <input type="checkbox" value="${soCT}" class="chk-item-ct rounded text-orange-900 focus:ring-orange-700 cursor-pointer" onchange="capNhatNutXoaCT()">
                        </td>
                        <!-- 2. STT VÀ CÁC CỘT TIẾP THEO -->
                        <td class="py-3 px-4 text-center text-gray-500 font-medium">${index + 1}</td>
                        <td class="py-3 px-4 font-medium text-orange-900">${soCT}</td>
                        <td class="py-3 px-4">${ngayHienThi}</td>
                        <td class="py-3 px-4">${item.doiTuong || ""}</td>
                        <td class="py-3 px-4">${item.dienGiai || ""}</td>
                        <td class="py-3 px-4 text-right font-semibold text-blue-600">${item.tongThanhToan || "0 đ"}</td>
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                            <button onclick="xemChungTu(this)" class="text-blue-600 hover:underline mr-2 text-xs font-medium" title="Xem / Sửa phiếu"><i class="fa-solid fa-eye mr-1"></i>Xem</button>
                            <button onclick="moMenuInTuDanhSach('${soCT}')" class="text-emerald-700 hover:underline mr-2 text-xs font-medium" title="In biểu mẫu"><i class="fa-solid fa-print mr-1"></i>In</button>
                            <button onclick="xoaChungTu(this)" class="text-red-600 hover:underline text-xs font-medium" title="Xóa chứng từ"><i class="fa-solid fa-trash mr-1"></i>Xóa</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Cập nhật số lượng phiếu ở chân bảng
                const footerCount = document.querySelector('#view-phieu-banhang .border-t span.font-bold');
                if (footerCount) {
                    footerCount.textContent = String(danhSach.length).padStart(2, '0');
                }
            }

            // Phân biệt phiếu bán hàng với phiếu thu/chi/mua hàng dùng chung kho chứng từ
            function laChungTuBanHang(item) {
                const loai = (item && item.loaiChungTu ? String(item.loaiChungTu) : 'BH').toUpperCase();
                return loai === 'BH';
            }

            // BỔ SUNG 2 HÀM ĐIỀU KHIỂN SỰ KIỆN CHECKBOX CHỨNG TỪ
            function chonTatCaCT(masterChk) {
                document.querySelectorAll('.chk-item-ct').forEach(chk => {
                    chk.checked = masterChk.checked;
                });
                capNhatNutXoaCT();
            }

            function capNhatNutXoaCT() {
                const dsChon = Array.from(document.querySelectorAll('.chk-item-ct:checked')).map(c => c.value);
                const btn = document.getElementById('btn-xoa-nhieu-ct');
                const lblCount = document.getElementById('count-chon-ct');

                if (lblCount) lblCount.textContent = dsChon.length;
                if (btn) {
                    if (dsChon.length > 0) btn.classList.remove('hidden');
                    else btn.classList.add('hidden');
                }
            }

            // Xóa các phiếu bán hàng đã tích chọn (gọi API xóa từng phiếu rồi tải lại danh sách)
            async function xoaNhieuChungTu() {
                const dsChon = Array.from(document.querySelectorAll('.chk-item-ct:checked')).map(c => c.value);
                if (dsChon.length === 0) return;

                if (!confirm(`Bạn có chắc chắn muốn xóa ${dsChon.length} chứng từ đã chọn không?\n\n${dsChon.join('\n')}`)) return;

                let soThanhCong = 0;
                const dsLoi = [];
                for (const soCT of dsChon) {
                    try {
                        const res = await fetch(`/api/xoa-chung-tu/${encodeURIComponent(soCT)}`, { method: 'DELETE' });
                        const result = await res.json();
                        if (result.success) soThanhCong++;
                        else dsLoi.push(`${soCT}: ${result.message || 'Lỗi không xác định'}`);
                    } catch (e) {
                        dsLoi.push(`${soCT}: Lỗi kết nối máy chủ`);
                    }
                }

                let thongBao = `Đã xóa ${soThanhCong}/${dsChon.length} chứng từ.`;
                if (dsLoi.length > 0) thongBao += `\n\nKhông xóa được:\n${dsLoi.join('\n')}`;
                alert(thongBao);

                // Tải lại danh sách và bỏ chọn
                await taiDanhSachChungTu();
                const master = document.getElementById('chk-all-ct');
                if (master) master.checked = false;
                capNhatNutXoaCT();
            }

        // 3. Hàm kích hoạt lọc dữ liệu khi bấm nút "Lọc" hoặc gõ Enter
        function apDungLocChungTu() {
            // Đóng tất cả menu phễu dropdown
            document.querySelectorAll('[id^="dropdown-filter-"]').forEach(el => {
                el.classList.add('hidden');
            });

            // Đọc giá trị thanh lọc chính
            const tuNgay = document.getElementById('filter-tu-ngay')?.value || "";
            const denNgay = document.getElementById('filter-den-ngay')?.value || "";
            const tuKhoa = (document.getElementById('filter-tim-kiem')?.value || "").trim().toLowerCase();

            // Đọc giá trị phễu từng cột
            const subSoCT = (document.getElementById('subfilter-soct')?.value || "").trim().toLowerCase();
            const subNgay = document.getElementById('subfilter-ngayban')?.value || "";
            const subKH = (document.getElementById('subfilter-khachhang')?.value || "").trim().toLowerCase();
            const subDienGiai = (document.getElementById('subfilter-diengiai')?.value || "").trim().toLowerCase();
            const subSoTien = parseFloat(document.getElementById('subfilter-sotien')?.value) || 0;

            // Tiến hành lọc trên danh sách đang có
            const ketQuaLoc = window.danhSachChungTuCache.filter(item => {
                const itemNgay = item.ngayChungTu || "";
                const itemSoCT = (item.soChungTu || "").toLowerCase();
                const itemKH = (item.doiTuong || "").toLowerCase();
                const itemDienGiai = (item.dienGiai || "").toLowerCase();
                const itemTien = parseFloat(String(item.tongThanhToan || "0").replace(/\D/g, "")) || 0;

                // Lọc theo khoảng ngày (Từ ngày - Đến ngày)
                if (tuNgay && itemNgay < tuNgay) return false;
                if (denNgay && itemNgay > denNgay) return false;

                // Lọc theo từ khóa tìm kiếm nhanh
                if (tuKhoa && !itemSoCT.includes(tuKhoa) && !itemKH.includes(tuKhoa) && !itemDienGiai.includes(tuKhoa)) {
                    return false;
                }

                // Lọc theo phễu từng cột
                if (subSoCT && !itemSoCT.includes(subSoCT)) return false;
                if (subNgay && itemNgay !== subNgay) return false;
                if (subKH && !itemKH.includes(subKH)) return false;
                if (subDienGiai && !itemDienGiai.includes(subDienGiai)) return false;
                if (subSoTien > 0 && itemTien < subSoTien) return false;

                return true;
            });

            // Vẽ lại bảng với danh sách đã lọc
            hienThiDanhSachBanHang(ketQuaLoc);
        }

        // 4. Hàm xóa trắng tất cả ô lọc và đưa bảng về ban đầu khi bấm "Đặt lại"
        function datLaiBoLoc() {
            if (document.getElementById('filter-tu-ngay')) document.getElementById('filter-tu-ngay').value = "";
            if (document.getElementById('filter-den-ngay')) document.getElementById('filter-den-ngay').value = "";
            if (document.getElementById('filter-tim-kiem')) document.getElementById('filter-tim-kiem').value = "";
            if (document.getElementById('subfilter-soct')) document.getElementById('subfilter-soct').value = "";
            if (document.getElementById('subfilter-ngayban')) document.getElementById('subfilter-ngayban').value = "";
            if (document.getElementById('subfilter-khachhang')) document.getElementById('subfilter-khachhang').value = "";
            if (document.getElementById('subfilter-diengiai')) document.getElementById('subfilter-diengiai').value = "";
            if (document.getElementById('subfilter-sotien')) document.getElementById('subfilter-sotien').value = "";

            hienThiDanhSachBanHang(window.danhSachChungTuCache);
        }

        // Tự động nạp dữ liệu từ Server mỗi khi mở trang hoặc ấn F5
        window.addEventListener('DOMContentLoaded', () => {
            taiDanhSachChungTu();
        });
        // Mở Modal Lập phiếu bán hàng
        function openVoucherModal(loaiPhieu) {
        dangSuaRow = null; 
        document.getElementById('modal-title').textContent = "Lập " + loaiPhieu + " mới";

        // Mở khóa ô số chứng từ khi tạo mới
        const inputSoCT = document.getElementById('so-chung-tu-ban');
        if (inputSoCT) {
            inputSoCT.removeAttribute('readonly');
            inputSoCT.classList.remove('bg-gray-100');
        }

        lamMoiPhieuBanHang();
        document.getElementById('voucher-modal').classList.remove('hidden');
    }

        // Đóng Modal
        function closeVoucherModal() {
            document.getElementById('voucher-modal').classList.add('hidden');
        }

        // Tự động cập nhật Tên và Địa chỉ khi chọn Mã ở ô 1
        function chonDoiTuong(select) {
            const option = select.options[select.selectedIndex];
            const tenInput = document.getElementById('ten-khach-hang'); // Sửa đúng ID ten-khach-hang
            const diachiInput = document.getElementById('input-diachi');

            if (!option || !select.value) {
                if (tenInput) tenInput.value = "";
                if (diachiInput) diachiInput.value = "";
                return;
            }

            // Đọc trực tiếp từ thuộc tính data- của option đã chọn
            const tenKH = option.getAttribute('data-ten') || "";
            const diaChi = option.getAttribute('data-diachi') || "";

            if (tenInput) tenInput.value = tenKH;
            if (diachiInput && !diachiInput.value) {
                diachiInput.value = diaChi;
            }
        }

        // Khi chọn hàng hóa tự động điền ĐVT, Tồn kho, Đơn giá
        function chonHangHoa(select) {
            const option = select.options[select.selectedIndex];
            const row = select.closest('tr');
            
            // 1. Tự động cập nhật ĐVT và SL TỒN từ thuộc tính data- của option
            const dvt = option.getAttribute('data-dvt') || "";
            const ton = option.getAttribute('data-ton') || "0";
            
            // Cập nhật cả trường hợp là thẻ text hay thẻ input[cite: 4]
            const dvtEl = row.querySelector('.dvt');
            if (dvtEl) {
                if (dvtEl.tagName === 'INPUT') dvtEl.value = dvt;
                else dvtEl.textContent = dvt;
            }
            
            const tonEl = row.querySelector('.ton');
            if (tonEl) {
                if (tonEl.tagName === 'INPUT') tonEl.value = ton;
                else tonEl.textContent = ton;
            }

            // 2. Gán đơn giá và định dạng dấu phẩy[cite: 4]
            const gia = option.getAttribute('data-gia') || "0";
            row.querySelector('.price-input').value = Number(gia).toLocaleString('en-US');

            // 3. Tự động đặt số lượng là 1 nếu đang để 0 hoặc trống[cite: 4]
            const qtyInput = row.querySelector('.qty-input');
            if (!qtyInput.value || parseFloat(qtyInput.value) === 0) {
                qtyInput.value = 1;
            }

            // 4. Kiểm tra tồn kho ngay lập tức
            kiemTraTonKho(qtyInput);

            tinhToan();
        }
        // Hàm cảnh báo khi số lượng vượt quá tồn kho thực tế
        function kiemTraTonKho(input) {
            const row = input.closest('tr');
            const qty = parseFloat(input.value) || 0;
            
            // Đọc số lượng tồn kho (hỗ trợ cả ô input hoặc text trần)
            const tonEl = row.querySelector('.ton');
            const tonKho = parseFloat(tonEl.value || tonEl.textContent) || 0;

            // Nếu số lượng xuất bán lớn hơn số lượng tồn trong kho
            if (qty > tonKho) {
                const xacNhan = confirm(
                    `CẢNH BÁO: Số lượng xuất bán (${qty}) vượt quá số lượng tồn kho (${tonKho})!\n\nBạn có muốn tiếp tục không?`
                );
                
                if (xacNhan) {
                    // Nếu người dùng chọn "Có" (OK): Đổi màu viền đỏ cảnh báo để dễ nhận biết, cho phép nhập tiếp
                    input.classList.add('border-red-500', 'text-red-600', 'font-bold');
                } else {
                    // Nếu người dùng chọn "Không" (Cancel): Trả về bằng đúng số lượng tồn tối đa
                    input.value = tonKho;
                    input.classList.remove('border-red-500', 'text-red-600', 'font-bold');
                    tinhToan();
                }
            } else {
                // Trở về kiểu hiển thị bình thường khi số lượng hợp lệ
                input.classList.remove('border-red-500', 'text-red-600', 'font-bold');
            }
        }

        // 1. Biến lưu trữ danh mục hàng hóa từ Server và dòng hiện tại đang chọn hàng
        window.danhSachHangHoaServer = [];
        let dongDangChonHangHoa = null;

        // 2. Nạp danh mục hàng hóa từ Server
        async function taiDanhSachHangHoa() {
            try {
                const response = await fetch('/api/danh-sach-hang-hoa');
                const ketQua = await response.json();
                if (ketQua.success) {
                    window.danhSachHangHoaServer = ketQua.data || [];
                }
            } catch (e) {
                console.error("Lỗi tải danh mục hàng hóa:", e);
            }
        }

        // 3. Render dữ liệu ra bảng Popup chọn hàng
        function renderBangChonHH(danhSach) {
            const tbody = document.getElementById('tbody-bang-chon-hh');
            if (!tbody) return;
            tbody.innerHTML = "";

            if (!danhSach || danhSach.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-gray-400 italic">Không tìm thấy hàng hóa phù hợp.</td></tr>`;
                return;
            }

            danhSach.forEach(hh => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-amber-50 cursor-pointer transition";
                tr.onclick = () => chonHangHoaTuBang(hh);
                tr.innerHTML = `
                    <td class="py-2 px-2 border-r font-bold text-orange-900">${hh.ma}</td>
                    <td class="py-2 px-2 border-r">${hh.ten}</td>
                    <td class="py-2 px-2 border-r text-center text-gray-600">${hh.dvt || ""}</td>
                    <td class="py-2 px-2 border-r text-right font-semibold ${hh.ton > 0 ? 'text-green-700' : 'text-red-600'}">${Number(hh.ton || 0).toLocaleString('en-US')}</td>
                    <td class="py-2 px-2 text-right font-medium text-blue-700">${Number(hh.giaBan || 0).toLocaleString('en-US')}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // 4. Mở Popup bảng chọn hàng và định vị ngay dưới ô đang gõ
        function moBangChonHH(inputEl, event) {
            if (event) event.stopPropagation();
            dongDangChonHangHoa = inputEl.closest('tr');
            
            renderBangChonHH(window.danhSachHangHoaServer);

            const box = document.getElementById('dropdown-table-hh');
            if (!box) return;

            // Tính toán tọa độ để dropdown hiện ngay dưới ô input của dòng đó
            const rect = inputEl.getBoundingClientRect();
            box.style.top = (rect.bottom + 4) + 'px';
            box.style.left = Math.min(rect.left, window.innerWidth - 740) + 'px';
            box.classList.remove('hidden');
        }

        // 5. Đóng Popup
        function dongBangChonHH() {
            const box = document.getElementById('dropdown-table-hh');
            if (box) box.classList.add('hidden');
        }

        // 6. Tìm kiếm hàng hóa trực tiếp khi gõ vào ô Mã hoặc Tên
        function locBangChonHH(inputEl) {
            dongDangChonHangHoa = inputEl.closest('tr');
            const val = (inputEl.value || "").toLowerCase().trim();
            
            const ketQua = window.danhSachHangHoaServer.filter(item => 
                item.ma.toLowerCase().includes(val) || 
                item.ten.toLowerCase().includes(val)
            );

            renderBangChonHH(ketQua);
            
            const box = document.getElementById('dropdown-table-hh');
            if (box) {
                const rect = inputEl.getBoundingClientRect();
                box.style.top = (rect.bottom + 4) + 'px';
                box.style.left = Math.min(rect.left, window.innerWidth - 740) + 'px';
                box.classList.remove('hidden');
            }
        }

        // 7. Điền thông tin khi nhấp chọn 1 hàng hóa trên Popup
        function chonHangHoaTuBang(hh) {
        if (!dongDangChonHangHoa) return;

        // Điền mã & tên vào 2 ô
        const inputMa = dongDangChonHangHoa.querySelector('.item-mahang');
        const inputTen = dongDangChonHangHoa.querySelector('.item-tenhang');
        if (inputMa) inputMa.value = hh.ma;
        if (inputTen) inputTen.value = hh.ten;

        // Nạp ĐVT chính + các ĐVT quy đổi vào dropdown của dòng
        napDanhSachDVTVaoDong(dongDangChonHangHoa, hh);

        // Điền SL tồn kho gốc ban đầu
        const tonEl = dongDangChonHangHoa.querySelector('.ton');
        if (tonEl) tonEl.textContent = Number(hh.ton || 0).toLocaleString('en-US');

        // Điền đơn giá bán mặc định
        const priceInput = dongDangChonHangHoa.querySelector('.price-input');
        if (priceInput) priceInput.value = Number(hh.giaBan || 0).toLocaleString('en-US');

        // Tự động gán SL = 1 nếu đang để 0 hoặc trống
        const qtyInput = dongDangChonHangHoa.querySelector('.qty-input');
        if (qtyInput && (parseFloat(qtyInput.value) <= 0 || !qtyInput.value)) {
            qtyInput.value = 1;
        }

        tinhToan();
        dongBangChonHH();
    }

        // 9. Cập nhật hàm tạo dòng mới: tách ô Mã và Tên riêng
        function themDong() {
        const tbody = document.getElementById('voucher-items');
        const newRow = document.createElement('tr');
        newRow.className = "hover:bg-gray-50 item-row";
        newRow.innerHTML = `
            <td class="py-2 px-2 text-center text-gray-500 stt font-medium"></td>
            <td class="py-2 px-2 text-center align-middle">
                <div class="flex items-center justify-center space-x-2">
                    <button type="button" onclick="chenDong(this)" class="text-green-700 hover:text-green-900 text-sm" title="Chèn dòng"><i class="fa-solid fa-plus-square"></i></button>
                    <button type="button" onclick="xoaDong(this)" class="text-red-600 hover:text-red-800 text-sm" title="Xóa dòng"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
            <td class="py-2 px-1">
                <div class="flex space-x-1 items-center">
                    <!-- Ô nhập mã chiếm trọn không gian -->
                    <div class="relative flex-1">
                        <input type="text" onclick="moBangChonHH(this, event)" onkeyup="locBangChonHH(this)" placeholder="Mã..." class="w-full pl-2 pr-4 py-1 border rounded font-semibold text-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-700 item-mahang uppercase bg-white cursor-pointer text-xs" autocomplete="off">
                        <i class="fa-solid fa-caret-down absolute right-1.5 top-2 text-gray-400 pointer-events-none text-[9px]"></i>
                    </div>
                    
                    <!-- Nhóm 2 nút thao tác mini tinh tế -->
                    <div class="flex items-center space-x-0.5 shrink-0">
                        <button type="button" onclick="event.stopPropagation(); moModalThemHH(this)" class="w-5 h-5 bg-orange-900/90 text-white rounded hover:bg-orange-800 flex items-center justify-center text-[10px] font-bold shadow-xs transition" title="Thêm nhanh hàng hóa">+</button>
                        <button type="button" onclick="event.stopPropagation(); suaHangHoaTaiDong(this)" class="w-5 h-5 bg-blue-600/90 text-white rounded hover:bg-blue-700 flex items-center justify-center text-[9px] shadow-xs transition" title="Sửa thông tin hàng hóa này"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </div>
            </td>
            <td class="py-2 px-2">
                <input type="text" onclick="moBangChonHH(this, event)" onkeyup="locBangChonHH(this)" placeholder="Tên hàng hóa..." class="w-full px-2 py-1 border rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-700 item-tenhang cursor-pointer">
            </td>
            <td class="py-2 px-1 text-center">
                <select onchange="thayDoiDVT(this)" class="w-full px-1.5 py-1 border rounded bg-white text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-700 dvt-select cursor-pointer">
                    <option value="">--</option>
                </select>
            </td>
            <td class="py-2 px-2 text-center text-gray-600 ton font-semibold">0</td>
            <td class="py-2 px-2 text-center">
                <input type="number" value="1" min="0" oninput="tinhToan()" onchange="kiemTraTonKho(this)" class="w-full px-1 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-orange-700 qty-input">
            </td>
            <td class="py-2 px-2 text-right">
                <input type="text" value="0" oninput="formatNumberInput(this); tinhToan()" class="w-full px-1 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-orange-700 price-input">
            </td>
            <td class="py-2 px-2 text-right font-medium">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-medium row-thanhtien focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2 text-center">
                <input type="number" value="0" min="0" max="100" oninput="tinhTheoPhanTramCK(this)" class="w-full px-1 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-orange-700 ck-pct-input">
            </td>
            <td class="py-2 px-2 text-right">
                <input type="text" value="0" oninput="formatNumberInput(this); tinhTheoTienCK(this)" class="w-full px-1 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-orange-700 ck-tien-input">
            </td>
            <td class="py-2 px-2 text-center">
                <select onchange="tinhToan()" class="w-full px-1.5 py-1 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-orange-700 thuesuat-select">
                    <option value="0.08">8%</option>
                    <option value="0.10">10%</option>
                    <option value="0">0%</option>
                    <option value="KCT">KCT</option>
                    <option value="KKKNT">KKKNT</option>
                </select>
            </td>
            <td class="py-2 px-2 text-right font-medium">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-medium row-tienthue focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2 text-right font-semibold text-orange-900">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-bold text-orange-900 row-tongthanhtoan focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2">
                <input type="text" placeholder="Diễn giải dòng..." class="w-full px-1.5 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-700">
            </td>
            <td class="py-2 px-2 text-center"><input type="text" value="131" class="w-full px-1 py-1 border rounded text-center text-xs"></td>
            <td class="py-2 px-2 text-center"><input type="text" value="5111" class="w-full px-1 py-1 border rounded text-center text-xs"></td>
        `;
        tbody.appendChild(newRow);
        capNhatSTT();
        tinhToan();
    }

        // Đóng Popup khi bấm ra ngoài
        window.addEventListener('click', function(e) {
            const boxHH = document.getElementById('dropdown-table-hh');
            if (boxHH && !boxHH.contains(e.target) && !e.target.classList.contains('item-mahang') && !e.target.classList.contains('item-tenhang')) {
                dongBangChonHH();
            }
        });

        // Tải thêm danh mục hàng hóa khi mở trang
        window.addEventListener('DOMContentLoaded', async () => {
            taiDanhSachChungTu();
            taiDanhSachDoiTuong();
            await taiDanhSachHangHoa(); // Chờ server gửi đủ dữ liệu hàng hóa về
            hienThiDanhSachVTHH();       // Vẽ ngay danh sách đó ra bảng ngoài màn hình
        });

        // Xóa dòng hàng
        function xoaDong(button) {
            const row = button.closest('tr');
            const tbody = document.getElementById('voucher-items');
            if (tbody.rows.length > 1) {
                row.remove();
                capNhatSTT();
                tinhToan();
            } else {
                alert("Chứng từ phải có ít nhất một dòng hàng hóa!");
            }
        }

        // Cập nhật lại số thứ tự STT
        function capNhatSTT() {
            const rows = document.querySelectorAll('#voucher-items .item-row');
            rows.forEach((row, index) => {
                row.querySelector('.stt').textContent = index + 1;
            });
        }
        // Khi gõ vào ô Chiết khấu HĐ: nếu xóa trống hoặc về 0 thì xóa sạch chiết khấu từng dòng
        function onThayDoiCKHD(input) {
            const val = parseFloat(input.value.replace(/,/g, '')) || 0;
            
            if (val === 0) {
                const rows = document.querySelectorAll('#voucher-items .item-row');
                rows.forEach(row => {
                    const ckInput = row.querySelector('.ck-tien-input');
                    const ckPctInput = row.querySelector('.ck-pct-input');
                    if (ckInput) ckInput.value = "0";
                    if (ckPctInput) ckPctInput.value = "";
                });
                // Tự động tính toán lại tiền thuế, tổng thanh toán và tổng chiết khấu
                tinhToan();
            }
        }
        // Phân bổ chiết khấu hóa đơn xuống các dòng chi tiết
        function phanBoChietKhauHD() {
            const ckInput = document.getElementById('ck-hd-input');
            const totalCKHD = parseFloat(ckInput.value.replace(/,/g, '')) || 0;
            
            if (totalCKHD <= 0) {
                alert("Vui lòng nhập số tiền chiết khấu HĐ hợp lệ trước khi phân bổ!");
                ckInput.focus();
                return;
            }

            const type = document.getElementById('phanbo-type').value; // 'soluong' hoặc 'sotien'
            const rows = document.querySelectorAll('#voucher-items .item-row');
            
            if (rows.length === 0) {
                alert("Chưa có dòng hàng hóa nào để phân bổ!");
                return;
            }

            // 1. Tính tổng cơ sở phân bổ (Tổng Số Lượng hoặc Tổng Thành Tiền)
            let totalBase = 0;
            rows.forEach(row => {
                const qty = parseFloat(row.querySelector('.qty-input').value.replace(/,/g, '')) || 0;
                const price = parseFloat(row.querySelector('.price-input').value.replace(/,/g, '')) || 0;
                
                if (type === 'soluong') {
                    totalBase += qty;
                } else {
                    totalBase += (qty * price); // Thành tiền
                }
            });

            if (totalBase === 0) {
                alert("Tổng số lượng hoặc tổng thành tiền các dòng đang bằng 0, không thể phân bổ!");
                return;
            }

            // 2. Phân bổ xuống từng dòng và xử lý lệch số học do làm tròn (round)
            let daPhanBo = 0;
            rows.forEach((row, index) => {
                const qty = parseFloat(row.querySelector('.qty-input').value.replace(/,/g, '')) || 0;
                const price = parseFloat(row.querySelector('.price-input').value.replace(/,/g, '')) || 0;
                const base = (type === 'soluong') ? qty : (qty * price);
                
                let allocatedCK = 0;
                // Nếu là dòng cuối cùng, gán phần còn lại để tổng tiền chiết khấu các dòng khớp 100% với chiết khấu HĐ
                if (index === rows.length - 1) {
                    allocatedCK = Math.max(0, totalCKHD - daPhanBo);
                } else {
                    allocatedCK = Math.round((base / totalBase) * totalCKHD);
                    daPhanBo += allocatedCK;
                }

                // Điền số tiền chiết khấu vào dòng và xóa % CK
                row.querySelector('.ck-tien-input').value = allocatedCK.toLocaleString('en-US');
                row.querySelector('.ck-pct-input').value = "";
            });

            // 3. Tự động tính toán lại Thành tiền, Tiền thuế và Tổng thanh toán cho từng dòng & cả hóa đơn
            tinhToan();
            alert("Đã phân bổ chiết khấu thành công!");
        }
                      
        // Hàm chèn dòng mới
        function chenDong(button) {
        const currentRow = button.closest('tr');
        const newRow = document.createElement('tr');
        newRow.className = "hover:bg-gray-50 item-row";
        newRow.innerHTML = `
            <td class="py-2 px-2 text-center text-gray-500 stt font-medium"></td>
            <td class="py-2 px-2 text-center align-middle">
                <div class="flex items-center justify-center space-x-2">
                    <button type="button" onclick="chenDong(this)" class="text-green-700 hover:text-green-900 text-sm" title="Chèn dòng"><i class="fa-solid fa-plus-square"></i></button>
                    <button type="button" onclick="xoaDong(this)" class="text-red-600 hover:text-red-800 text-sm" title="Xóa dòng"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
            <td class="py-2 px-1">
                <div class="flex space-x-1 items-center">
                    <!-- Ô nhập mã chiếm trọn không gian -->
                    <div class="relative flex-1">
                        <input type="text" onclick="moBangChonHH(this, event)" onkeyup="locBangChonHH(this)" placeholder="Mã..." class="w-full pl-2 pr-4 py-1 border rounded font-semibold text-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-700 item-mahang uppercase bg-white cursor-pointer text-xs" autocomplete="off">
                        <i class="fa-solid fa-caret-down absolute right-1.5 top-2 text-gray-400 pointer-events-none text-[9px]"></i>
                    </div>
                    
                    <!-- Nhóm 2 nút thao tác mini tinh tế -->
                    <div class="flex items-center space-x-0.5 shrink-0">
                        <button type="button" onclick="event.stopPropagation(); moModalThemHH(this)" class="w-5 h-5 bg-orange-900/90 text-white rounded hover:bg-orange-800 flex items-center justify-center text-[10px] font-bold shadow-xs transition" title="Thêm nhanh hàng hóa">+</button>
                        <button type="button" onclick="event.stopPropagation(); suaHangHoaTaiDong(this)" class="w-5 h-5 bg-blue-600/90 text-white rounded hover:bg-blue-700 flex items-center justify-center text-[9px] shadow-xs transition" title="Sửa thông tin hàng hóa này"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </div>
            </td>
            <td class="py-2 px-2">
                <input type="text" onclick="moBangChonHH(this, event)" onkeyup="locBangChonHH(this)" placeholder="Tên hàng hóa..." class="w-full px-2 py-1 border rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-700 item-tenhang cursor-pointer">
            </td>
            <td class="py-2 px-1 text-center">
                <select onchange="thayDoiDVT(this)" class="w-full px-1.5 py-1 border rounded bg-white text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-700 dvt-select cursor-pointer">
                    <option value="">--</option>
                </select>
            </td>
            <td class="py-2 px-2 text-center text-gray-600 ton font-semibold">0</td>
            <td class="py-2 px-2 text-center">
                <input type="number" value="1" min="0" oninput="tinhToan()" onchange="kiemTraTonKho(this)" class="w-full px-1 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-orange-700 qty-input">
            </td>
            <td class="py-2 px-2 text-right">
                <input type="text" value="0" oninput="formatNumberInput(this); tinhToan()" class="w-full px-1 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-orange-700 price-input">
            </td>
            <td class="py-2 px-2 text-right font-medium">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-medium row-thanhtien focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2 text-center">
                <input type="number" value="0" min="0" max="100" oninput="tinhTheoPhanTramCK(this)" class="w-full px-1 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-orange-700 ck-pct-input">
            </td>
            <td class="py-2 px-2 text-right">
                <input type="text" value="0" oninput="formatNumberInput(this); tinhTheoTienCK(this)" class="w-full px-1 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-orange-700 ck-tien-input">
            </td>
            <td class="py-2 px-2 text-center">
                <select onchange="tinhToan()" class="w-full px-1.5 py-1 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-orange-700 thuesuat-select">
                    <option value="0.08">8%</option>
                    <option value="0.10">10%</option>
                    <option value="0">0%</option>
                    <option value="KCT">KCT</option>
                    <option value="KKKNT">KKKNT</option>
                </select>
            </td>
            <td class="py-2 px-2 text-right font-medium">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-medium row-tienthue focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2 text-right font-semibold text-orange-900">
                <input type="text" class="w-full px-2 py-1 border rounded bg-gray-50 text-right font-bold text-orange-900 row-tongthanhtoan focus:outline-none" value="0" readonly>
            </td>
            <td class="py-2 px-2">
                <input type="text" placeholder="Diễn giải dòng..." class="w-full px-1.5 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-700">
            </td>
            <td class="py-2 px-2 text-center"><input type="text" value="131" class="w-full px-1 py-1 border rounded text-center text-xs"></td>
            <td class="py-2 px-2 text-center"><input type="text" value="5111" class="w-full px-1 py-1 border rounded text-center text-xs"></td>
        `;
        currentRow.after(newRow);
        capNhatSTT();
        tinhToan();
    }
        
        // Cập nhật lại hàm đánh số thứ tự STT
        function capNhatSTT() {
            const rows = document.querySelectorAll('#voucher-items .item-row');
            rows.forEach((row, index) => {
                const sttCell = row.querySelector('.stt');
                if (sttCell) {
                    sttCell.textContent = index + 1;
                }
            });
        }
        function lamMoiPhieuBanHang() {
        // 1. Reset thông tin chung
        document.getElementById('ngay-chung-tu-ban').value = new Date().toISOString().split('T')[0];
        document.getElementById('so-hoa-don-ban').value = "";
        document.getElementById('ky-hieu-ban').value = "";
        
        // Reset khách hàng & tên hiển thị
        const maKHEl = document.getElementById('input-makhachhang');
        if (maKHEl) maKHEl.value = "";
        const tenKHEl = document.getElementById('ten-khach-hang');
        if (tenKHEl) tenKHEl.value = "";

        // SỬA ĐÚNG ID: input-diachi (thay vì input-dia-chi)
        const diaChi = document.getElementById('input-diachi');
        if (diaChi) diaChi.value = "";
        const nguoiMua = document.getElementById('input-nguoimua');
        if (nguoiMua) nguoiMua.value = "";
        const dienGiai = document.getElementById('diễn-giải');
        if (dienGiai) dienGiai.value = "";

        // Xóa sạch tbody và tạo 1 dòng mới chuẩn
        const tbody = document.getElementById('voucher-items');
        tbody.innerHTML = "";
        themDong();

        // 3. Reset chiết khấu hóa đơn
        const ckHd = document.getElementById('ck-hd-input');
        if (ckHd) ckHd.value = "";
        
        // 4. Cấp lại số chứng từ mới & tính toán lại về 0
        tuDongSinhSoChungTu();
        tinhToan();
    }
        async function luuChungTu() {
            // 1. Kiểm tra Ngày chứng từ
            const inputNgay = document.getElementById('ngay-chung-tu-ban');
            if (!inputNgay || !inputNgay.value) {
                alert("Vui lòng chọn Ngày chứng từ!");
                if (inputNgay) inputNgay.focus();
                return;
            }

            // 2. Kiểm tra số chứng từ & chống trùng lặp
            const inputSoCT = document.getElementById('so-chung-tu-ban');
            const soChungTuCanLuu = inputSoCT ? inputSoCT.value.trim() : "";

            if (!soChungTuCanLuu) {
                alert("Vui lòng nhập Số chứng từ!");
                if (inputSoCT) inputSoCT.focus();
                return;
            }

            const regexSoCT = /^BH\s(0[1-9]|1[0-2])\/\d{4}-(?!0000)(\d{4})$/;
            if (!regexSoCT.test(soChungTuCanLuu)) {
                alert(`Số chứng từ không đúng định dạng chuẩn!\n\nQuy tắc: BH MM/YYYY-XXXX (Ví dụ: BH 10/2026-0001)`);
                if (inputSoCT) inputSoCT.focus();
                return;
            }

            // 2.2. Kiểm tra chống trùng số chứng từ trên TOÀN BỘ CƠ SỞ DỮ LIỆU
            const soChungTuChuan = soChungTuCanLuu.replace(/\s+/g, ' ').trim().toUpperCase();

            // Nếu đang THÊM MỚI (dangSuaRow == null)
            if (!dangSuaRow) {
                const biTrung = (window.danhSachChungTuCache || []).some(item => {
                    const soTonTai = (item.soChungTu || "").replace(/\s+/g, ' ').trim().toUpperCase();
                    return soTonTai === soChungTuChuan;
                });

                if (biTrung) {
                    alert(`CẢNH BÁO: Số chứng từ "${soChungTuCanLuu}" đã tồn tại trên hệ thống!\n\nVui lòng nhập số khác hoặc để hệ thống tự động cấp số.`);
                    if (inputSoCT) {
                        inputSoCT.focus();
                        inputSoCT.classList.add('border-red-500', 'text-red-600', 'font-bold');
                    }
                    return;
                }
            } 
            // Nếu đang SỬA PHIẾU CŨ: cho phép giữ nguyên số của chính nó, nhưng chặn nếu sửa trùng số của phiếu khác
            else {
                const soCTCuCuaPhieuNay = dangSuaRow.children[2]?.textContent.replace(/\s+/g, ' ').trim().toUpperCase();
                
                if (soChungTuChuan !== soCTCuCuaPhieuNay) {
                    const biTrungVoiPhieuKhac = (window.danhSachChungTuCache || []).some(item => {
                        const soTonTai = (item.soChungTu || "").replace(/\s+/g, ' ').trim().toUpperCase();
                        return soTonTai === soChungTuChuan;
                    });

                    if (biTrungVoiPhieuKhac) {
                        alert(`CẢNH BÁO: Số chứng từ "${soChungTuCanLuu}" đã được dùng cho một chứng từ khác!\n\nKhông thể đổi sang số này.`);
                        if (inputSoCT) {
                            inputSoCT.focus();
                            inputSoCT.classList.add('border-red-500', 'text-red-600', 'font-bold');
                        }
                        return;
                    }
                }
            }

            // Nếu hợp lệ thì xóa viền đỏ cảnh báo (nếu trước đó bị đánh dấu)
            if (inputSoCT) {
                inputSoCT.classList.remove('border-red-500', 'text-red-600', 'font-bold');
            }

            // 3. Kiểm tra Khách hàng
            const maKH = document.getElementById('input-makhachhang')?.value.trim();
            if (!maKH) {
                alert("Vui lòng chọn Khách hàng!");
                document.getElementById('input-makhachhang')?.focus();
                return;
            }

            // 4. Kiểm tra Địa chỉ
            const inputDiaChi = document.getElementById('input-diachi');
            if (!inputDiaChi || !inputDiaChi.value.trim()) {
                alert("Vui lòng nhập Địa chỉ khách hàng!");
                if (inputDiaChi) inputDiaChi.focus();
                return;
            }

            // 5. Kiểm tra Diễn giải
            const inputDienGiai = document.getElementById('diễn-giải');
            if (!inputDienGiai || !inputDienGiai.value.trim()) {
                alert("Vui lòng nhập Diễn giải chung cho chứng từ!");
                if (inputDienGiai) inputDienGiai.focus();
                return;
            }

            // 6. Kiểm tra Chi tiết hàng hóa
            const rows = document.querySelectorAll('#voucher-items .item-row');
            if (rows.length === 0) {
                alert("Chứng từ phải có ít nhất 1 dòng hàng hóa!");
                return;
            }

            let danhSachHangHoa = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const stt = i + 1;

                const inputMaHH = row.querySelector('.item-mahang');
                const inputTenHH = row.querySelector('.item-tenhang');
                const maHH = inputMaHH ? inputMaHH.value.trim() : "";
                if (!maHH) {
                    alert(`Dòng ${stt}: Vui lòng chọn Mã hàng hóa!`);
                    if (inputMaHH) inputMaHH.focus();
                    return;
                }

                const dvtVal = row.querySelector('.dvt-select')?.value || "";

                const qtyInput = row.querySelector('.qty-input');
                const qty = parseFloat(qtyInput ? qtyInput.value.replace(/,/g, '') : 0) || 0;
                if (qty <= 0) {
                    alert(`Dòng ${stt}: Vui lòng nhập Số lượng (phải lớn hơn 0)!`);
                    if (qtyInput) qtyInput.focus();
                    return;
                }

                const priceInput = row.querySelector('.price-input');
                const price = parseFloat(priceInput ? priceInput.value.replace(/,/g, '') : 0) || 0;
                const ckPctVal = row.querySelector('.ck-pct-input') ? row.querySelector('.ck-pct-input').value : "";
                const ckTienVal = row.querySelector('.ck-tien-input') ? row.querySelector('.ck-tien-input').value.replace(/,/g, '') : "0";

                // Push vào mảng:
                danhSachHangHoa.push({
                    stt: stt,
                    maHang: maHH,
                    tenHang: inputTenHH ? inputTenHH.value.trim() : "",
                    dvt: dvtVal, // Lưu ĐVT thực tế được chọn khi xuất bán
                    soLuong: qty,
                    donGia: price,
                    pctCK: ckPctVal,
                    tienCK: parseFloat(ckTienVal) || 0,
                    thueSuat: row.querySelector('.thuesuat-select') ? row.querySelector('.thuesuat-select').value : "0",
                    thanhTien: row.querySelector('.row-thanhtien') ? row.querySelector('.row-thanhtien').value : "0",
                    tienThue: row.querySelector('.row-tienthue') ? row.querySelector('.row-tienthue').value : "0",
                    tongThanhToan: row.querySelector('.row-tongthanhtoan') ? row.querySelector('.row-tongthanhtoan').value : "0"
                });
            }

            // 7. Lấy Tên khách hàng từ ô 2 và đóng gói dữ liệu
            const tenKH = document.getElementById('ten-khach-hang')?.value.trim() || maKH;
            const duLieuPhieu = {
                soChungTu: document.getElementById('so-chung-tu-ban').value,
                ngayChungTu: inputNgay.value,
                maDoiTuong: maKH,
                doiTuong: tenKH,
                diaChi: inputDiaChi.value.trim(),
                dienGiai: inputDienGiai.value.trim(),
                ckHd: document.getElementById('ck-hd-input') ? document.getElementById('ck-hd-input').value : "",
                chiTiet: danhSachHangHoa,
                tongThanhToan: document.getElementById('lbl-tong-thanh-toan').innerText
            };

            // 8. Gửi lưu lên Server
            try {
                const response = await fetch('/api/luu-chung-tu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(duLieuPhieu)
                });

                const ketQua = await response.json();
                if (ketQua.success) {
                    alert(ketQua.message || "Lưu phiếu bán hàng thành công!");
                    closeVoucherModal();
                    taiDanhSachChungTu(); // Tải lại danh sách từ server
                } else {
                    alert("Có lỗi khi lưu chứng từ: " + (ketQua.message || "Không xác định"));
                }
            } catch (error) {
                console.error("Lỗi kết nối server:", error);
                alert("Không thể kết nối đến máy chủ Node.js!");
            }
        }
// Khi gõ vào ô % CK
function tinhTheoPhanTramCK(input) {
    const row = input.closest('tr');
    const qty = parseFloat(row.querySelector('.qty-input').value.replace(/,/g, '')) || 0;
    const price = parseFloat(row.querySelector('.price-input').value.replace(/,/g, '')) || 0;
    const thanhTien = qty * price;
    
    const pct = parseFloat(input.value) || 0;
    if (pct > 0) {
        const tienCK = Math.round((thanhTien * pct) / 100);
        row.querySelector('.ck-tien-input').value = tienCK.toLocaleString('en-US');
    } else {
        row.querySelector('.ck-tien-input').value = "0";
    }
    tinhToan();
}

// Khi tự gõ vào ô Tiền chiết khấu (để trống hoặc xóa % CK)
function tinhTheoTienCK(input) {
    const row = input.closest('tr');
    row.querySelector('.ck-pct-input').value = ""; // Xóa % CK khi người dùng chủ động gõ tiền
    tinhToan();
}

// Hàm tính toán tổng quát
function tinhToan() {
    const rows = document.querySelectorAll('#voucher-items .item-row');
    let tongTienHangChuaThue = 0;
    let tongTienCKGlobal = 0;
    let tongTienThue = 0;
    let tongThanhToanGlobal = 0;

    rows.forEach(row => {
        const qtyEl = row.querySelector('.qty-input');
        const priceEl = row.querySelector('.price-input');
        const ckPctEl = row.querySelector('.ck-pct-input');
        const ckTienEl = row.querySelector('.ck-tien-input');
        const thueSelect = row.querySelector('.thuesuat-select');
        const ttEl = row.querySelector('.row-thanhtien');
        const thueEl = row.querySelector('.row-tienthue');
        const tongRowEl = row.querySelector('.row-tongthanhtoan');

        const qty = parseFloat(qtyEl ? qtyEl.value.replace(/,/g, '') : 0) || 0;
        const price = parseFloat(priceEl ? priceEl.value.replace(/,/g, '') : 0) || 0;
        
        // 1. Thành tiền = Số lượng x Đơn giá
        const thanhTien = qty * price;
        if (ttEl) ttEl.value = Math.round(thanhTien).toLocaleString('en-US');

        // 2. Tiền chiết khấu dòng
        const tienCK = parseFloat(ckTienEl ? ckTienEl.value.replace(/,/g, '') : 0) || 0;

        // 3. Giá trị chịu thuế
        const giaTriChiuThue = Math.max(0, thanhTien - tienCK);

        // 4. Tiền thuế
        const thueVal = thueSelect ? thueSelect.value : "0";
        let tienThue = 0;
        if (thueVal !== 'KCT' && thueVal !== 'KKKNT') {
            const taxRate = parseFloat(thueVal) || 0;
            tienThue = giaTriChiuThue * taxRate;
        }
        if (thueEl) thueEl.value = Math.round(tienThue).toLocaleString('en-US');

        // 5. Tổng thanh toán dòng
        const tongThanhToanRow = giaTriChiuThue + tienThue;
        if (tongRowEl) tongRowEl.value = Math.round(tongThanhToanRow).toLocaleString('en-US');

        // Cộng dồn toàn phiếu
        tongTienHangChuaThue += giaTriChiuThue;
        tongTienCKGlobal += tienCK;
        tongTienThue += tienThue;
        tongThanhToanGlobal += tongThanhToanRow;
    });

    // 6. Gán an toàn xuống phần tổng cộng ở footer (kiểm tra tồn tại trước khi gán để không bao giờ bị văng lỗi)
    const elHang = document.getElementById('lbl-tong-tien-hang');
    const elCK = document.getElementById('lbl-tong-tien-ck');
    const elThue = document.getElementById('lbl-tong-tien-thue');
    const elTong = document.getElementById('lbl-tong-thanh-toan');

    if (elHang) elHang.textContent = Math.round(tongTienHangChuaThue).toLocaleString('vi-VN') + " đ";
    if (elCK) elCK.textContent = Math.round(tongTienCKGlobal).toLocaleString('vi-VN') + " đ";
    if (elThue) elThue.textContent = Math.round(tongTienThue).toLocaleString('vi-VN') + " đ";
    if (elTong) elTong.textContent = Math.round(tongThanhToanGlobal).toLocaleString('vi-VN') + " đ";
}
// Hàm tự động sinh số chứng từ tăng dần theo tháng và chống trùng tuyệt đối
// Cấu trúc chuẩn: [TIỀN_TỐ] MM/YYYY-XXXX (Ví dụ: BH 10/2026-0001, PT 10/2026-0001)
function tuDongSinhSoChungTu(loaiTienTo = 'BH') {
    const inputNgay = document.getElementById('ngay-chung-tu-ban');
    const inputSoCT = document.getElementById('so-chung-tu-ban');
    if (!inputSoCT) return;

    // 1. Lấy ngày chứng từ (nếu trống thì lấy ngày hiện tại)
    if (inputNgay && !inputNgay.value) {
        inputNgay.value = new Date().toISOString().split('T')[0];
    }
    const ngayChon = inputNgay ? inputNgay.value : new Date().toISOString().split('T')[0];
    const d = new Date(ngayChon);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    // Tiền tố cần tìm: "BH 10/2026-"
    const prefix = `${loaiTienTo} ${month}/${year}-`;

    // 2. Quét TẤT CẢ chứng từ trong bộ nhớ cache nạp từ Server (không phụ thuộc vào bảng HTML)
    const tatCaChungTu = window.danhSachChungTuCache || [];
    let maxSTT = 0;

    tatCaChungTu.forEach(item => {
        const soCT = (item.soChungTu || "").trim();
        if (soCT.startsWith(prefix)) {
            // Tách lấy 4 chữ số cuối sau dấu gạch ngang
            const parts = soCT.split('-');
            const sttStr = parts[parts.length - 1];
            const stt = parseInt(sttStr, 10);
            if (!isNaN(stt) && stt > maxSTT) {
                maxSTT = stt;
            }
        }
    });

    // 3. Quét dự phòng thêm cả trên giao diện bảng hiện tại (đề phòng phiếu vừa thêm chưa kịp đồng bộ)
    const rows = document.querySelectorAll('#view-phieu-banhang tbody tr');
    rows.forEach(row => {
        const cellCT = row.children[2]; // Cột số chứng từ (sau checkbox và STT)
        if (cellCT) {
            const textCT = cellCT.textContent.replace(/\s+/g, ' ').trim();
            if (textCT.startsWith(prefix)) {
                const parts = textCT.split('-');
                const sttStr = parts[parts.length - 1];
                const stt = parseInt(sttStr, 10);
                if (!isNaN(stt) && stt > maxSTT) {
                    maxSTT = stt;
                }
            }
        }
    });

    // 4. Số thứ tự mới = Số lớn nhất + 1, định dạng 4 chữ số (0001, 0002, ...)
    const nextSTT = String(maxSTT + 1).padStart(4, '0');
    const soMoi = `${prefix}${nextSTT}`;

    inputSoCT.value = soMoi;
    return soMoi;
}
function xoaChungTu(button) {
    const row = button.closest('tr');
    const soCT = row.children[2].textContent.trim();

    const xacNhan = confirm(`Bạn có chắc chắn muốn xóa chứng từ số: ${soCT} không?`);
    if (!xacNhan) return;

    // 1. Xóa dòng khỏi giao diện
    row.remove();

    // 2. Cập nhật lại cột STT trong bảng danh sách
    const rows = document.querySelectorAll('#view-phieu-banhang tbody tr');
    rows.forEach((r, idx) => {
        r.children[0].textContent = idx + 1;
    });

    // 3. Cập nhật dòng footer "Tổng số: XX phiếu bán hàng"
    const footerCount = document.querySelector('#view-phieu-banhang .border-t span.font-bold');
    if (footerCount) {
        footerCount.textContent = String(rows.length).padStart(2, '0');
    }

    // 4. (Tùy chọn) Gửi yêu cầu xóa lên Server Node.js
    fetch(`/api/xoa-chung-tu/${encodeURIComponent(soCT)}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => console.log("Server phản hồi xóa:", data))
        .catch(err => console.log("Chưa có API xóa trên Node.js server"));

    alert(`Đã xóa thành công chứng từ ${soCT}!`);
}
// 1. Biến bộ nhớ lưu danh mục khách hàng lấy từ Server
window.danhSachKhachHangServer = [];

// 2. Hàm gọi Server nạp danh mục khách hàng
async function taiDanhSachDoiTuong() {
    try {
        const response = await fetch('/api/danh-sach-doi-tuong');
        const ketQua = await response.json();
        if (ketQua.success) {
            window.danhSachKhachHangServer = ketQua.data || [];
        }
    } catch (e) {
        console.error("Lỗi tải danh mục khách hàng:", e);
    }
}

// 3. Render danh sách khách hàng ra bảng dropdown
function renderBangChonKH(danhSach) {
    const tbody = document.getElementById('tbody-bang-chon-kh');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!danhSach || danhSach.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-gray-400 italic">Không có khách hàng nào. Bấm nút '+' để thêm mới.</td></tr>`;
        return;
    }

    danhSach.forEach(kh => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-blue-50 cursor-pointer transition";
        tr.onclick = () => chonKhachHangTuBang(kh);
        tr.innerHTML = `
            <td class="py-2 px-3 border-r font-semibold text-orange-900">${kh.ma}</td>
            <td class="py-2 px-3 border-r">${kh.ten}</td>
            <td class="py-2 px-3 text-gray-500">${kh.mst || "-"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. Mở dropdown bảng khách hàng
function moBangChonKH(event) {
    if (event) event.stopPropagation();
    renderBangChonKH(window.danhSachKhachHangServer);
    const box = document.getElementById('dropdown-table-kh');
    if (box) box.classList.remove('hidden');
}

// 5. Đóng dropdown
function dongBangChonKH() {
    const box = document.getElementById('dropdown-table-kh');
    if (box) box.classList.add('hidden');
}

// 6. Tìm kiếm tức thì khi gõ phím
function locBangChonKH(tuKhoa) {
    const val = (tuKhoa || "").toLowerCase().trim();
    const ketQua = window.danhSachKhachHangServer.filter(item => 
        item.ma.toLowerCase().includes(val) || 
        item.ten.toLowerCase().includes(val) || 
        (item.mst && item.mst.includes(val))
    );
    renderBangChonKH(ketQua);
    const box = document.getElementById('dropdown-table-kh');
    if (box) box.classList.remove('hidden');
}

// 7. Chọn khách hàng: nạp Mã vào ô 1, Tên vào ô 2 và Địa chỉ
function chonKhachHangTuBang(kh) {
    document.getElementById('input-makhachhang').value = kh.ma;
    document.getElementById('ten-khach-hang').value = kh.ten;
    
    const diachiInput = document.getElementById('input-diachi');
    if (diachiInput) {
        diachiInput.value = kh.diaChi || "";
    }

    dongBangChonKH();
}

// 8. Bấm nút '+' để thêm nhanh khách hàng mới lên Server
async function themNhanhKhachHang() {
    const ma = prompt("Nhập Mã khách hàng mới (ví dụ: KH003):");
    if (!ma) return;
    const ten = prompt("Nhập Tên khách hàng / Công ty:");
    if (!ten) return;
    const mst = prompt("Nhập Mã số thuế (nếu có):") || "";
    const diaChi = prompt("Nhập Địa chỉ (nếu có):") || "";

    try {
        const res = await fetch('/api/them-doi-tuong', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ma, ten, mst, diaChi, phanLoai: "Khách hàng" })
        });
        const data = await res.json();
        if (data.success) {
            alert("Thêm khách hàng thành công!");
            await taiDanhSachDoiTuong(); // Tải lại danh sách mới nhất
            chonKhachHangTuBang({ ma, ten, mst, diaChi }); // Tự động chọn luôn vào phiếu
        } else {
            alert(data.message || "Không thể thêm đối tượng!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

// Tự động tải danh mục khách hàng khi mở trang
window.addEventListener('DOMContentLoaded', async () => {
    taiDanhSachChungTu();
    await taiDanhSachDoiTuong(); // Chờ nạp đối tượng từ server
    hienThiDanhSachDT();          // Vẽ ngay ra bảng danh mục đối tượng
    await taiDanhSachHangHoa();
    hienThiDanhSachVTHH();
});

// Click ra ngoài thì ẩn bảng
window.addEventListener('click', function(e) {
    const box = document.getElementById('dropdown-table-kh');
    const input = document.getElementById('input-makhachhang');
    if (box && !box.contains(e.target) && e.target !== input) {
        dongBangChonKH();
    }
});

// 1. Hàm nạp các đơn vị tính (chính + quy đổi) vào thẻ select của dòng
    function napDanhSachDVTVaoDong(row, thongTinHH, dvtDuocChon = null) {
        const dvtSelect = row.querySelector('.dvt-select');
        if (!dvtSelect) return;

        dvtSelect.innerHTML = "";

        const dvtChinh = thongTinHH.dvt || "Cái";
        const giaChinh = parseFloat(thongTinHH.giaBan) || 0;
        const tonChinh = parseFloat(thongTinHH.ton) || 0;

        // Lưu dữ liệu gốc của mặt hàng vào dataset của dòng để tra cứu khi đổi ĐVT
        row.dataset.giaGoc = giaChinh;
        row.dataset.tonGoc = tonChinh;
        row.dataset.dvtChinh = dvtChinh;

        // 1.1. Thêm ĐVT chính (Tỷ lệ = 1, Phép tính = nhân)
        const optChinh = document.createElement('option');
        optChinh.value = dvtChinh;
        optChinh.textContent = dvtChinh;
        optChinh.dataset.tyle = "1";
        optChinh.dataset.pheptinh = "nhan";
        dvtSelect.appendChild(optChinh);

        // 1.2. Thêm các ĐVT chuyển đổi (hỗ trợ cả mảng donViChuyenDoi hoặc đối tượng quyDoi đơn lẻ)
        let dsQuyDoi = [];
        if (Array.isArray(thongTinHH.donViChuyenDoi)) {
            dsQuyDoi = thongTinHH.donViChuyenDoi;
        } else if (thongTinHH.quyDoi) {
            dsQuyDoi = [thongTinHH.quyDoi];
        }

        dsQuyDoi.forEach(qd => {
            const tenQD = qd.dvtQD || qd.dvtQuyDoi;
            const tyLe = qd.tyLe || qd.tyLeQuyDoi || 1;
            const phepTinh = qd.phepTinh || qd.phepTinhQuyDoi || "nhan";

            if (tenQD) {
                const opt = document.createElement('option');
                opt.value = tenQD;
                opt.textContent = tenQD;
                opt.dataset.tyle = tyLe;
                opt.dataset.pheptinh = phepTinh;
                dvtSelect.appendChild(opt);
            }
        });

        // 1.3. Chọn giá trị mặc định
        if (dvtDuocChon) {
            dvtSelect.value = dvtDuocChon;
        } else {
            dvtSelect.value = dvtChinh;
        }
    }

    // 2. Sự kiện khi người dùng đổi ĐVT trên dòng
    function thayDoiDVT(selectEl) {
        const row = selectEl.closest('.item-row');
        if (!row) return;

        const opt = selectEl.options[selectEl.selectedIndex];
        if (!opt) return;

        const tyLe = parseFloat(opt.dataset.tyle) || 1;
        const phepTinh = opt.dataset.pheptinh || "nhan";

        const giaGoc = parseFloat(row.dataset.giaGoc) || 0;
        const tonGoc = parseFloat(row.dataset.tonGoc) || 0;

        let giaMoi = giaGoc;
        let tonMoi = tonGoc;

        // Tính Đơn giá và SL tồn theo đơn vị quy đổi
        if (phepTinh === "nhan") {
            giaMoi = giaGoc * tyLe;
            tonMoi = tyLe > 0 ? (tonGoc / tyLe) : 0;
        } else {
            giaMoi = tyLe > 0 ? (giaGoc / tyLe) : 0;
            tonMoi = tonGoc * tyLe;
        }

        // Cập nhật lên dòng giao diện
        const priceInput = row.querySelector('.price-input');
        if (priceInput) {
            priceInput.value = Math.round(giaMoi).toLocaleString('en-US');
        }

        const tonEl = row.querySelector('.ton');
        if (tonEl) {
            // Định dạng làm tròn tối đa 2 chữ số thập phân cho tồn quy đổi
            tonEl.textContent = Number(tonMoi.toFixed(2)).toLocaleString('en-US');
        }

        // Kiểm tra lại tồn kho với số lượng hiện có và tính toán lại tiền
        const qtyInput = row.querySelector('.qty-input');
        if (qtyInput) kiemTraTonKho(qtyInput);

        tinhToan();
    }
