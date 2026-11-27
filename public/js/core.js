// ==============================================================
// TIỆN ÍCH DÙNG CHUNG CHO MỌI MODULE (core.js được nạp đầu tiên)
// ==============================================================

// Chuyển ký tự đặc biệt thành thực thể HTML để chèn dữ liệu vào innerHTML / thuộc tính an toàn
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Mã hóa giá trị để đặt trong onclick="ham(decodeURIComponent('...'))".
// encodeURIComponent không mã hóa dấu nháy đơn nên phải tự thay bằng %27.
function maHoaThamSoOnclick(str) {
    return encodeURIComponent(String(str ?? '')).replace(/'/g, '%27');
}

        function toggleMenu(menuId) {
            const menu = document.getElementById(menuId);
            const icon = document.getElementById('icon-' + menuId);
            
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.classList.add('rotate-180'); // Xoay mũi tên lên
            } else {
                menu.classList.add('hidden');
                icon.classList.remove('rotate-180'); // Trở về mũi tên xuống
            }
        }

        function hienThiNoiDung(loai) {
        const viewTongQuan = document.getElementById('view-tongquan');
        const viewVTHH = document.getElementById('view-danhmuc-vthh');
        const viewDT = document.getElementById('view-danhmuc-dt');
        const viewThuTien = document.getElementById('view-thutien-tm');
        const viewChiTien = document.getElementById('view-chitien-tm');
        const viewMuaHang = document.getElementById('view-phieu-muahang');
        const viewBanHang = document.getElementById('view-phieu-banhang');
        const viewCauHinh = document.getElementById('view-cau-hinh');
        
        // 1. THÊM BIẾN NÀY ĐỂ QUẢN LÝ VIEW SỐ DƯ ĐẦU KỲ
        const viewNganHang = document.getElementById('view-danhmuc-nganhang');
        const viewTKKeToan = document.getElementById('view-hethong-taikhoan');
        const viewSoDu = document.getElementById('view-sodu-dauky'); 
        
        const viewKhac = document.getElementById('view-khac');
        const pageTitle = document.getElementById('page-title');
        const khacTitle = document.getElementById('khac-title');

        // Ẩn tất cả các view trước khi hiển thị view được chọn
        viewTongQuan.classList.add('hidden');
        viewVTHH.classList.add('hidden');
        viewDT.classList.add('hidden');
        viewThuTien.classList.add('hidden');
        viewChiTien.classList.add('hidden');
        viewMuaHang.classList.add('hidden');
        viewBanHang.classList.add('hidden');
        if (viewCauHinh) viewCauHinh.classList.add('hidden');
        
        // 2. ẨN VIEW SỐ DƯ Ở ĐÂY
        if (viewSoDu) viewSoDu.classList.add('hidden'); 
        if (viewNganHang) viewNganHang.classList.add('hidden');
        if (viewTKKeToan) viewTKKeToan.classList.add('hidden');
        
        viewKhac.classList.add('hidden');

        // Kiểm tra điều kiện mở view tương ứng theo tham số 'loai' truyền vào
        if (loai === 'tongquan') {
            viewTongQuan.classList.remove('hidden');
            pageTitle.textContent = "Tổng quan tình hình kinh doanh";
        } else if (loai === 'danhmuc-vthh') {
            viewVTHH.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Danh mục Vật tư hàng hóa";
            hienThiDanhSachVTHH();
        } else if (loai === 'danhmuc-dt') {
            viewDT.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Danh mục Đối tượng (Khách hàng / Nhà cung cấp)";
            hienThiDanhSachDT();
        } else if (loai === 'danhmuc-nganhang') {
        if (viewNganHang) viewNganHang.classList.remove('hidden');
        pageTitle.textContent = "Danh mục Tài khoản Ngân hàng Công ty";
        taiDanhSachNganHang(); // Gọi hàm lấy dữ liệu từ server
        } else if (loai === 'hethong-taikhoan') {
            if (viewTKKeToan) viewTKKeToan.classList.remove('hidden');
            pageTitle.textContent = "Danh mục Hệ thống Tài khoản Kế toán";
            taiHeThongTaiKhoan(); // Gọi hàm lấy danh sách tài khoản
        } else if (loai === 'thutien-tm') {
            viewThuTien.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Thu tiền mặt";
        } else if (loai === 'chitien-tm') {
            viewChiTien.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Chi tiền mặt";
        } else if (loai === 'phieu-muahang') {
            viewMuaHang.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Phiếu mua hàng";
        } else if (loai === 'bh-phieubanhang') {
            viewBanHang.classList.remove('hidden');
            pageTitle.textContent = "Quản lý Phiếu bán hàng";
        } else if (loai === 'cau-hinh') {
            if (viewCauHinh) viewCauHinh.classList.remove('hidden');
            pageTitle.textContent = "Cấu hình hệ thống & Dữ liệu kế toán";
            napDuLieuCauHinhVaoForm();    
        } 
        // 3. THÊM NHÁNH NÀY ĐỂ KÍCH HOẠT HIỂN THỊ MÀN HÌNH SỐ DƯ ĐẦU KỲ
        else if (loai === 'sodu-dauky') {
            if (viewSoDu) viewSoDu.classList.remove('hidden');
            pageTitle.textContent = "Số dư đầu kỳ (Tồn kho & Công nợ)";
            hienThiManHinhSoDuDauKy(); // Gọi hàm nằm trong file sodu.js
        } 
        else {
            viewKhac.classList.remove('hidden');
            if (loai === 'tienich-mahong') khacTitle.textContent = "Tiện ích: Xử lý hóa đơn (Mã hàng)";
            pageTitle.textContent = khacTitle.textContent;
        }
    }
        function toggleFilterMenu(menuId, event) {
            event.stopPropagation();
            const menu = document.getElementById(menuId);
            
            // Chỉ đóng các menu phễu dropdown, không đụng vào ô input
            document.querySelectorAll('[id^="dropdown-filter-"]').forEach(el => {
                if (el.id !== menuId) el.classList.add('hidden');
            });

            menu.classList.toggle('hidden');
        }

        // Bấm ra ngoài màn hình chỉ đóng các dropdown phễu lọc
        window.addEventListener('click', function() {
            document.querySelectorAll('[id^="dropdown-filter-"]').forEach(el => {
                el.classList.add('hidden');
            });
        });

        function doiMauGiaoDien(colorName) {
            const sidebar = document.getElementById('sidebar-menu');
            const userAvatar = document.getElementById('user-avatar');

            sidebar.classList.remove('bg-theme-orange', 'bg-theme-blue', 'bg-theme-green', 'bg-theme-purple', 'bg-theme-dark');
            userAvatar.classList.remove('bg-theme-orange', 'bg-theme-blue', 'bg-theme-green', 'bg-theme-purple', 'bg-theme-dark');

            sidebar.classList.add('bg-theme-' + colorName);
            userAvatar.classList.add('bg-theme-' + colorName);
        }
        // Hàm định dạng số có dấu ngăn cách hàng nghìn (ví dụ: 1,000,000)
        function formatNumberInput(input) {
            // Lấy giá trị hiện tại, loại bỏ các ký tự không phải số
            let value = input.value.replace(/\D/g, "");
            if (value === "") {
                input.value = "";
                return;
            }
            // Định dạng lại với dấu phẩy ngăn cách hàng nghìn
            input.value = Number(value).toLocaleString('en-US');
        }
