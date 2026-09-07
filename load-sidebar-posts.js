// load-sidebar-posts.js —— 專為 Sidebar 設計，只顯示最新 2 篇嘅標題、日期同圖片
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-latest-posts");

    if (!container) {
        console.error("找不到 #sidebar-latest-posts 容器");
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
            // 1. 按 dayoftravel 降冪排好（最新排最前）
            posts.sort((a, b) => {
                const numA = Number(a.dayoftravel) || 0;
                const numB = Number(b.dayoftravel) || 0;
                return numB - numA;
            });

            // 2. 只取最新嘅 2 篇
            const latestPosts = posts.slice(0, 2);

            // 清空容器
            container.innerHTML = "";

            // 3. 渲染這 2 篇推介文章
            latestPosts.forEach(post => {
                const title     = post.title     || "無標題";
                const url       = post.url       || "#";
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