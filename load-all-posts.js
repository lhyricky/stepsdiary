// load-all-posts.js（Bento Grid 專用版）
document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("postsGrid");

    if (!grid) return;

    fetch("posts.json")
        .then(response => {
            if (!response.ok) throw new Error("載入 posts.json 失敗");
            return response.json();
        })
        .then(posts => {
            grid.innerHTML = ""; // 清空

            posts.forEach(post => {
                // 1. 建立格仔容器
                const item = document.createElement("div");
                item.className = "grid-item";

                // 2. 圖片設定
                const img = document.createElement("img");
                const pictureSrc = post.picture && post.picture.startsWith("http") 
                    ? post.picture 
                    : `https://image.stepsdiary.cc/${post.picture || "NAV/Cover-with-icons.jpg"}`;
                
                img.src = pictureSrc;
                img.alt = post.title || "";
                img.loading = "lazy"; // 確保所有動態載入圖片都開啟 lazy loading

                // 3. 標題文字層
                const title = document.createElement("div");
                title.className = "title-overlay";
                title.textContent = post.title || "無標題";

                // 4. 全格可點擊的 <a> 連結
                const link = document.createElement("a");
                link.href = post.url || "#";
                link.rel = "noopener";
                link.className = "grid-item-link";
                link.title = post.title || "";

                // 5. 組合元素
                item.appendChild(img);
                item.appendChild(title);
                item.appendChild(link);

                grid.appendChild(item);
            });
        })
        .catch(err => {
            grid.innerHTML = `<p style="color:#666;grid-column:1/-1;text-align:center;">載入文章失敗：${err.message}</p>`;
            console.error(err);
        });
});