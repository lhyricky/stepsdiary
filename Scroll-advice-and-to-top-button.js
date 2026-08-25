// 等頁面load好先run（避免元素未ready）
document.addEventListener('DOMContentLoaded', function() {
    const scrollAdvice = document.querySelector('.scroll-advice');
    if (!scrollAdvice) {
        console.warn('scroll-advice element not found!');
        return;
    }

    // 初始化：如果已經scroll過，就即刻hide
    if (window.scrollY > 0) {
        scrollAdvice.classList.add('hidden');
    }

    // scroll事件：只add hidden，唔remove（永遠唔返嚟）
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            scrollAdvice.classList.add('hidden');
        }
        // 注意：冇else remove，所以一旦hide，就永遠hide
    });
});

        // JS 功能：點擊滾動返頂部 (GO TO TOP BUTTON)
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // 平滑滾動
            });
        }

        // 顯示/隱藏按鈕（滾動超過 100px 就顯示）(GO TO TOP BUTTON)
        window.onscroll = function() {
            var btn = document.querySelector('.to-top-btn'); // 用 querySelector 取 class
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        };