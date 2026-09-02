fetch('posts.json')
    .then(res => res.json())
    .then(posts => {
        // 取得目前頁面的檔名，並轉成細寫、去走 .html 尾綴（加強容錯率）
        const rawPath = window.location.pathname.split('/').pop().toLowerCase();
        const currentPathClean = rawPath.replace('.html', '');
        
        // 嘗試用多種方式去配對 posts.json 入面嘅 url
        const currentPost = posts.find(post => {
            const postUrl = post.url ? post.url.toLowerCase() : '';
            const postUrlClean = postUrl.replace('.html', '');
            return postUrl === rawPath || postUrlClean === currentPathClean || rawPath.includes(postUrlClean);
        });

        if (!currentPost) {
            console.warn("搵唔到對應嘅文章資料，當前網址檔名係:", rawPath);
            return;
        }

        const currentDay = Number(currentPost.dayoftravel);
        const currentSeries = currentPost.series;

        // 嚴格限制：只在「同一個系列 (series)」嘅文章入面尋找上一篇同下一篇
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

        // 建立 HTML 結構
        const container = document.getElementById('pagination-container');
        if (!container) return;

        let html = '<div class="flip-pages-box">';

        // 上一篇
        html += '<div class="prev-content">';
        if (prevPost) {
            html += `<span class="arrow left">← </span>`;
            html += `<a class="prev-article-title" href="${prevPost.url}">`;
            html += `<strong>上一篇文章：</strong><br>${formatTitle(prevPost.title)}`;
            html += `</a>`;
        }
        html += '</div>';

        // 系列名稱 (Series)
        html += `<div class="series-name">${formatSeries(currentPost.series)}</div>`;

        // 下一篇
        html += '<div class="next-content">';
        if (nextPost) {
            html += `<a class="next-article-title" href="${nextPost.url}">`;
            html += `<strong>下一篇文章：</strong><br>${formatTitle(nextPost.title)}`;
            html += `</a>`;
            html += `<span class="arrow right"> →</span>`;
        }
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;
    })
    .catch(err => console.error('載入翻頁資料失敗:', err));