// 用相對路徑向上跳兩級尋找根目錄嘅 posts.json（由 published/2025/ 跳到根目錄要兩層 ../../）
// 或者用絕對路徑配合 GitHub Pages repo base 修正，最穩陣係相對路徑向上跳：
fetch('../../posts.json')
    .then(res => res.json())
    .then(posts => {
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

        function formatTitle(title) {
            if (!title) return '';
            return title.replace('：', '：<br>');
        }

        function formatSeries(series) {
            if (!series) return '';
            return series.replace('-', '<br>');
        }

        // 修正：因為你文章在 published/2025/，post.url 如果係相對/絕對，需要對應番跳去正確位置
        // 假設 posts.json 裡面嘅 url 係類似 "published/2025/xxxx.html" 或 "/published/2025/xxxx.html"
        function getSafeUrl(url) {
            if (!url) return '#';
            // 如果依家喺 published/2025/ 入面，指向其他同類檔案，直接用相對路徑最安全
            // 假設 url 格式係完整由根起計嘅相對路徑，可以用相對跳層或維持原狀
            return url.startsWith('/') ? '../../' + url.replace(/^\/+/, '') : url;
        }

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