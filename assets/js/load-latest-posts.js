// load-posts.js —— 改為最多只顯示最新 2 篇
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("posts-container");

    if (!container) {
        console.error("找不到 #posts-container");
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

            // 1. 先按 writedate 降冪排好（最新發佈排最前）
            validPosts.sort((a, b) => {
                const dateA = a.writedate || "";
                const dateB = b.writedate || "";
                return dateB.localeCompare(dateA);
            });

            // 2. 只取最新嘅 2 篇（如果少過 2 篇就全部顯示）
            const latestPosts = validPosts.slice(0, 2);

            // 清空容器
            container.innerHTML = "";

            // 3. 只 render 呢 2 篇
            latestPosts.forEach(post => {
                const title       = post.title       || "無標題";
                const url         = post.url         || "#";
                const picture     = post.picture     || "NAV/Cover-of-icons.jpg";
                const description = post.description || "";
                const writedate   = post.writedate   || "";
                const tags        = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];

                const tagsHTML = tags
                    .map(tag => `<button class="tag-button" data-tag="${tag}">#${tag}</button>`)
                    .join("");

                const postHTML = `
                    <div class="passage-info">
                        <div class="passage-text">
                            <h3><a href="${url}">${title}</a></h3>
                            <p class="post-date">發佈於 ${writedate}</p>
                            <p class="preview">${description}</p>
                            <div class="tags">${tagsHTML}</div>
                        </div>
                        <img class="article-thumb" src="${picture}" alt="${title}" loading="lazy">
                    </div>
                `;

                container.innerHTML += postHTML;
            });
        })
        .catch(error => {
            console.error("載入 posts.json 失敗：", error);
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">載入文章失敗，請稍後再試</p>`;
        });
});