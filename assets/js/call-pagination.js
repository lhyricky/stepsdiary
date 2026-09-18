console.log("🟢 Pagination script 啟動，當前網址:", window.location.href);

// 強制取得香港時間 (GMT+8) 的日期與小時
const hkFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    hour12: false
});
const parts = hkFormatter.formatToParts(new Date());
const partsObj = {};
parts.forEach(p => partsObj[p.type] = p.value);

const todayStr = `${partsObj.year}-${partsObj.month}-${partsObj.day}`;
const hkHour = parseInt(partsObj.hour, 10);

const getSlug = (str) => decodeURIComponent(str || '')
    .split('/')
    .pop()
    .replace(/\.html?$/i, '');

fetch('../../posts.json')
    .then(res => {
        console.log("🟢 fetch 狀態碼:", res.status);
        if (!res.ok) throw new Error(`HTTP 錯誤: ${res.status}`);
        return res.json();
    })
    .then(posts => {
        console.log("🟢 成功讀取 posts.json，總文章數:", posts.length);
        
        // 過濾掉 writedate 還沒到的文章（未夠中午 12 點前，今日的文章不能作為「下一篇」顯示）
        const validPosts = posts.filter(p => {
            if (!p.writedate) return true; // 如果冇寫日期就預設當作有效
            if (hkHour < 12) {
                return p.writedate < todayStr; // 12點前只視昨日及之前為有效
            }
            return p.writedate <= todayStr;  // 12點後視今日及之前為有效
        });

        const currentSlug = getSlug(window.location.pathname);
        console.log("🟢 解析出來當前 slug:", currentSlug);

        // 注意：這裡用 posts 搵返當前文章（確保自己頁面能夠正常顯示 pagination 框），但配對下一篇時用 validPosts
        const currentPost = posts.find(post => {
            if (!post.url) return false;
            return getSlug(post.url) === currentSlug;
        });

        console.log("🟢 配對到的 currentPost:", currentPost);

        if (!currentPost) {
            console.warn("⚠️ 搵唔到對應嘅文章資料，當前 slug 係:", currentSlug);
            return;
        }

        const currentDay = Number(currentPost.dayoftravel);
        const currentSeries = currentPost.series;

        let prevPost = null;
        let nextPost = null;

        // 改為使用 validPosts 來尋找上下篇，確保未到時間的下一篇唔會被出現在畫面上
        validPosts.forEach(post => {
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
            return url.startsWith('/') ? url : '/' + url;
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