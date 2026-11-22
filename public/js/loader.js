// ==============================================================
// NẠP GIAO DIỆN DASHBOARD THEO TỪNG PHẦN (views/, modals/)
// 1. Tải song song mọi file trong các thẻ <div data-partial="..."> và thay thế đúng vị trí
//    (giữ nguyên id, thứ tự, cấu trúc lồng nhau như khi còn nằm chung trong dashboard.html)
// 2. Sau khi giao diện đã đủ, nạp lần lượt các file JS nghiệp vụ theo đúng thứ tự cũ
// 3. Chạy các hàm khởi tạo đã đăng ký bằng khiGiaoDienSanSang() (thay cho DOMContentLoaded)
// ==============================================================
(function () {
    // Thứ tự nạp giữ nguyên như các thẻ <script> trước đây trong dashboard.html
    const DANH_SACH_JS = [
        'js/core.js',
        'js/banhang.js',
        'js/thuchi-muahang.js',
        'js/danhmuc-doituong.js',
        'js/danhmuc-vthh.js',
        'js/import-excel.js',
        'js/in-phieu.js',
        'js/settings.js',
        'js/sodu.js',
        'js/accountManager.js'
    ];

    const hangDoiKhoiTao = [];
    let daSanSang = false;

    // Các file JS gọi hàm này thay cho window.addEventListener('DOMContentLoaded', ...)
    window.khiGiaoDienSanSang = function (fn) {
        if (daSanSang) fn();
        else hangDoiKhoiTao.push(fn);
    };

    async function napMotPhan(el) {
        const duongDan = el.getAttribute('data-partial');
        try {
            const res = await fetch(duongDan, { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            el.outerHTML = await res.text();
        } catch (e) {
            console.error('Không tải được giao diện ' + duongDan + ':', e);
            el.outerHTML = '<div class="m-4 p-3 border border-red-300 bg-red-50 text-red-700 text-sm rounded">Không tải được ' + duongDan + '. Vui lòng tải lại trang (F5).</div>';
        }
    }

    function napScript(src) {
        return new Promise(resolve => {
            const s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = () => resolve();
            s.onerror = () => { console.error('Không tải được ' + src); resolve(); };
            document.body.appendChild(s);
        });
    }

    async function khoiDong() {
        // Nạp song song tất cả views/modals rồi mới chèn (tránh nhấp nháy từng phần)
        const cacPhan = Array.from(document.querySelectorAll('[data-partial]'));
        await Promise.all(cacPhan.map(napMotPhan));

        for (const src of DANH_SACH_JS) {
            await napScript(src);
        }

        daSanSang = true;
        for (const fn of hangDoiKhoiTao) {
            try { fn(); } catch (e) { console.error('Lỗi khởi tạo:', e); }
        }
        document.dispatchEvent(new CustomEvent('giaodien:sansang'));
    }

    // Promise cho phép code khác (và bộ kiểm thử) chờ giao diện nạp xong
    window.giaoDienSanSang = new Promise(resolve => {
        const chay = () => khoiDong().then(resolve);
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay);
        else chay();
    });
})();
