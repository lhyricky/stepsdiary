console.log("🟢 Pagination script 啟動，當前網址:", window.location.href);

fetch('../../posts.json')
    .then(res => {
        console.log("🟢 fetch 狀態碼:", res.status);
        if (!res.ok) throw new Error(`HTTP 錯誤: ${res.status}`);
        return res.json();
    })
    .then(posts => {
        console.log("🟢 成功讀取 posts.json，總文章數:", posts.length);
        const currentFile = window.location.pathname.split('/').pop().toLowerCase();
        console.log("🟢 解析出來當前檔名:", currentFile);

        const currentPost = posts.find(post => {
            if (!post.url) return false;
            const postFile = post.url.split('/').pop().toLowerCase();
            return postFile === currentFile;
        });

        console.log("🟢 配對到的 currentPost:", currentPost);

        if (!currentPost) {
            console.warn("⚠️ 搵唔到對應嘅文章資料，當前檔名係:", currentFile);
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

        function getSafeUrl(url) {
            if (!url) return '#';
            if (url.startsWith('/')) {
                return '../../' + url.replace(/^\/+/, '');
            }
            return url.split('/').pop();
        }

        const container = document.getElementById('pagination-container');
        console.log("🟢 搵唔搵到 pagination-container:", container);
        if (!container) {
            console.warn("⚠️ 搵唔到 #pagination-container 元素！");
            return;
        }

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
        console.log("🟢 渲染完成！");
    })
    .catch(err => console.error('🔴 載入翻頁資料失敗:', err));