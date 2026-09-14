fetch('/posts.json')
    .then(res => res.json())
    .then(posts => {
        // 1. 直接拎當前網址最尾嘅檔名嚟對應
        const currentFile = window.location.pathname.split('/').pop().toLowerCase();
        
        const currentPost = posts.find(post => {
            if (!post.url) return false;
            const postFile = post.url.split('/').pop().toLowerCase();
            return postFile === currentFile;
        });

        if (!currentPost) {
            console.warn("搵唔到對應嘅文章資料，當前檔名係:", currentFile);
            return;
        }

        const currentDay = Number(currentPost.dayoftravel);
        const currentSeries = currentPost.series;

        // 2. 嚴格根據 series 同 dayoftravel 搵前後篇
        let prevPost = null;
        let nextPost = null;

        posts.forEach(post => {
            if (post.series === currentSeries) {
                const postDay = Number(post.dayoftravel);
                if (postDay < currentDay) {
                    if (!prevPost || postDay > Number(prevPost.dayoftravel)) {
                        prevPost = post;
                    }
                } else if (postDay > currentDay) {
                    if (!nextPost || postDay < Number(nextPost.dayoftravel)) {
                        nextPost = post;
                    }
                }
            }
        });

        // 處理 title 換行函數：在「：」之後加 <br>
        function formatTitle(title) {
            if (!title) return '';
            return title.replace('：', '：<br>');
        }

        // 處理 series：去掉「-」並換行
        function formatSeries(series) {
            if (!series) return '';
            return series.replace('-', '<br>');
        }

        // 確保路徑係絕對路徑（由根目錄 / 開始，避免相對路徑疊加）
        function getSafeUrl(url) {
            if (!url) return '#';
            return '/' + url.replace(/^\/+/, '');
        }

        // 建立 HTML 結構
        const container = document.getElementById('pagination-container');
        if (!container) return;

        let html = '<div class="flip-pages-box">';

        // 上一篇
        html += '<div class="prev-content">';
        if (prevPost) {
            html += `<span class="arrow left">← </span>`;
            html += `<a class="prev-article-title" href="${getSafeUrl(prevPost.url)}">`;
            html += `<strong>上一篇文章：</strong><br>${formatTitle(prevPost.title)}`;
            html += `</a>`;
        }
        html += '</div>';

        // 系列名稱 (Series)
        html += `<div class="series-name">${formatSeries(currentPost.series)}</div>`;

        // 下一篇
        html += '<div class="next-content">';
        if (nextPost) {
            html += `<a class="next-article-title" href="${getSafeUrl(nextPost.url)}">`;
            html += `<strong>下一篇文章：</strong><br>${formatTitle(nextPost.title)}`;
            html += `</a>`;
            html += `<span class="arrow right"> →</span>`;
        }
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;
    })
    .catch(err => console.error('載入翻頁資料失敗:', err));