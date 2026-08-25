// load-posts.js —— 改為最多只顯示最新 2 篇
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("posts-container");

    if (!container) {
        console.error("找不到 #posts-container");
        return;
    }

    fetch("posts.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - posts.json 載入失敗`);
            }
            return response.json();
        })
        .then(posts => {
            // 1. 先按 dayoftravel 降冪排好（最新排最前）
            posts.sort((a, b) => {
                const numA = Number(a.dayoftravel) || 0;
                const numB = Number(b.dayoftravel) || 0;
                return numB - numA;
            });

            // 2. 只取最新嘅 2 篇（如果少過 2 篇就全部顯示）
            const latestPosts = posts.slice(0, 2);

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

            // 可選：如果想顯示「查看更多」按鈕，可以加返下面呢句
            // if (posts.length > 2) {
            //     container.innerHTML += `<div style="text-align:center;margin-top:30px;"><a href="all-posts.html" class="more-btn">查看更多文章 →</a></div>`;
            // }
        })
        .catch(error => {
            console.error("載入 posts.json 失敗：", error);
            container.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">載入文章失敗，請稍後再試</p>`;
        });
});