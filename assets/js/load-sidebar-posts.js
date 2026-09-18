// load-sidebar-posts.js —— 專為 Sidebar 設計，只顯示最新 2 篇嘅標題、日期同圖片
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-latest-posts");

    if (!container) {
        console.error("找不到 #sidebar-latest-posts 容器");
        return;
    }

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

    fetch("/posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - posts.json 載入失敗`);
            }
            return response.json();
        })
        .then(posts => {
            if (!posts) posts = [];

            // 0. 過濾掉 writedate 還沒到的文章（未夠中午 12 點前，今日的文章不會顯示）
            const validPosts = posts.filter(p => {
                if (!p.writedate) return true; // 如果冇寫日期就預設當作有效
                if (hkHour < 12) {
                    return p.writedate < todayStr; // 12點前只顯示昨日及之前
                }
                return p.writedate <= todayStr;  // 12點後顯示今日及之前
            });

            // 1. 按 writedate 降冪排好（最新發佈排最前）
            validPosts.sort((a, b) => {
                const dateA = a.writedate || "";
                const dateB = b.writedate || "";
                return dateB.localeCompare(dateA);
            });

            // 2. 只取最新嘅 2 篇
            const latestPosts = validPosts.slice(0, 2);

            // 清空容器
            container.innerHTML = "";

            // 只確保文章連結係絕對路徑（由根目錄 / 開始，避免相對路徑疊加）
            function getSafeUrl(url) {
                if (!url) return '#';
                return '/' + url.replace(/^\/+/, '');
            }

            // 3. 渲染這 2 篇推介文章
            latestPosts.forEach(post => {
                const title     = post.title     || "無標題";
                const url       = getSafeUrl(post.url);
                // 圖片直接使用 posts.json 嘅設定，唔好亂加斜線
                const picture   = post.picture   || "NAV/Cover-of-icons.jpg";
                const writedate = post.writedate || "";

                const postHTML = `
                    <a href="${url}" class="sidebar-post-item">
                        <img src="${picture}" alt="${title}" class="sidebar-post-thumb" loading="lazy">
                        <div class="sidebar-post-info">
                            <h4 class="sidebar-post-title">${title}</h4>
                            <p class="sidebar-post-date">發佈於 ${writedate}</p>
                        </div>
                    </a>
                `;

                container.innerHTML += postHTML;
            });
        })
        .catch(error => {
            console.error("載入 posts.json 失敗：", error);
            container.innerHTML = `<p style="text-align:center;color:#999;font-size:14px;padding:10px;">載入最新文章失敗</p>`;
        });
});