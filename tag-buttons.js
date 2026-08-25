// tag-buttons.js —— 終極萬能版（任何頁面、任何時間生成嘅 tag 都捉到）
(function () {
    function bindAllTagButtons() {
        document.querySelectorAll('.tag-button[data-tag]').forEach(btn => {
            // 避免重複綁定
            if (btn.dataset.bound) return;
            
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function () {
                const tagName = this.getAttribute('data-tag');
                window.open(`tag-filter.html?tag=${tagName}`, '_blank');
            });
            btn.dataset.bound = 'true'; // 標記已綁定
        });
    }

    // 頁面載入完成後先綁定
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindAllTagButtons);
    } else {
        bindAllTagButtons();
    }

    // 監聽動態新增嘅 tag（例如主頁用 JS 生成）
    const observer = new MutationObserver(bindAllTagButtons);
    observer.observe(document.body, { childList: true, subtree: true });
})();