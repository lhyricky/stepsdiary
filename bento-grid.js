// （Bento Grid 專用版 - 嚴格格子數限制）
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

            // 1. 先篩選出所有 priority-recommend 為 "Y" 的文章
            let priorityPosts = posts.filter(post => post["priority-recommend"] === "Y");
            let otherPosts = posts.filter(post => post["priority-recommend"] !== "Y");
            
            // 結合起來（確保優先的排在前面）
            let availablePosts = priorityPosts.concat(otherPosts);

            let selectedPosts = [];
            let totalSlots = 0;
            const targetSlots = 24; // 目標總方格數（4 欄 × 6 行）

            // 2. 依照 5 的循環計算每篇文章佔用的格子數，直到剛好湊滿 24 格
            for (let i = 0; i < availablePosts.length; i++) {
                let positionInCycle = (i % 5) + 1;
                let cost = 1; // 預設佔 1 格

                if (positionInCycle === 1) {
                    cost = 4; // 2x2 大正方形 = 4 格
                } else if (positionInCycle === 4) {
                    cost = 2; // 2行高縱向長條 = 2 格
                }

                // 如果加上這篇會超過 24 格，就停止（或者如果你想剛好塞滿，可以這樣卡控）
                if (totalSlots + cost > targetSlots) {
                    break;
                }

                selectedPosts.push(availablePosts[i]);
                totalSlots += cost;

                if (totalSlots === targetSlots) {
                    break;
                }
            }

            // 3. 渲染被選中的文章
            selectedPosts.forEach(post => {
                const item = document.createElement("div");
                item.className = "grid-item";

                const img = document.createElement("img");
                const pictureSrc = post.picture && post.picture.startsWith("http") 
                    ? post.picture 
                    : `https://image.stepsdiary.cc/${post.picture || "NAV/Cover-with-icons.jpg"}`;
                
                img.src = pictureSrc;
                img.alt = post.title || "";
                img.loading = "lazy";

                const title = document.createElement("div");
                title.className = "title-overlay";
                title.textContent = post.title || "無標題";

                const link = document.createElement("a");
                link.href = post.url || "#";
                link.rel = "noopener";
                link.className = "grid-item-link";
                link.title = post.title || "";

                // 組合元素
                item.appendChild(img);
                item.appendChild(title);
                item.appendChild(link);

                // 左上角 Tag 標籤（安全抓取第二個標籤，如果沒有則退守第一個）
                if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
                    const badge = document.createElement("div");
                    badge.className = "tag-badge";
                    
                    // 如果有第二個就用第二個（例如：福島縣、京都府），否則用第一個
                    const tagText = post.tags.length >= 2 ? post.tags[1] : post.tags[0];
                    badge.textContent = tagText.trim();
                    
                    item.appendChild(badge);
                }

                grid.appendChild(item);
            });
        })
        .catch(err => {
            grid.innerHTML = `<p style="color:#666;grid-column:1/-1;text-align:center;">載入文章失敗：${err.message}</p>`;
            console.error(err);
        });
});