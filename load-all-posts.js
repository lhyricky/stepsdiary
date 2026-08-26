// load-all-posts.js（最終修正版）
document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("postsGrid");

    fetch("posts.json")
        .then(response => {
            if (!response.ok) throw new Error("載入 posts.json 失敗");
            return response.json();
        })
        .then(posts => {
            posts.forEach(post => {
                // 1. 建立格仔
                const item = document.createElement("div");
                item.className = "grid-item";

                // 2. 標題
                const title = document.createElement("div");
                title.className = "title-overlay";
                title.textContent = post.title || "無標題";

                // 3. 圖片
                const img = document.createElement("img");
                // 如果 post.picture 有內容就直接用（因為入面已經有 https://image.stepsdiary.cc/），如果冇就用預設圖
                img.src = post.picture && post.picture.startsWith("http") 
                ? post.picture 
                : `https://image.stepsdiary.cc/${post.picture || "NAV/Cover-with-icons.jpg"}`;
                img.alt = post.title || "";
                img.loading = "lazy";

                // 4. 可點擊嘅 <a>（一定要包住整格 + z-index）
                const link = document.createElement("a");
                link.href = post.url || "#";
                //link.target = "_blank";//
                link.rel = "noopener";
                // 關鍵！！！加返 CSS 令 <a> 包住整個格仔
                link.style.position = "absolute";
                link.style.top = "0";
                link.style.left = "0";
                link.style.right = "0";
                link.style.bottom = "0";
                link.style.zIndex = "2";        // 比 title 同 img 更高
                link.title = post.title || "";  // 滑鼠移上去會見到標題（好 UX）

                // 5. 正確層級順序（由下到上）
                item.appendChild(img);     // 圖片放最底
                item.appendChild(title);   // 標題中間
                item.appendChild(link);    // <a> 放最上面，包住晒

                grid.appendChild(item);
            });
        })
        .catch(err => {
            grid.innerHTML = `<p style="color:white;grid-column:1/-1;text-align:center;">載入失敗：${err.message}</p>`;
            console.error(err);
        });
});