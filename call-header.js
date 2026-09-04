document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. 讀取 posts.json
        const response = await fetch('./posts.json'); // 根據你實際嘅 json 路徑調整
        const posts = await response.json();

        // 2. 假設你需要知道當前係邊篇文章（例如用當前網頁嘅 slug 或檔名去對應 json 入面嘅 item）
        // 呢度示範用當前網址嘅 path 去搵，或者你可以直接指定 index
        const currentSlug = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
        const post = posts.find(p => p.url && p.url.includes(currentSlug)) || posts[0]; //  fallback 去第一篇

        if (!post) return;

        // 3. 渲染發佈日期與最後更新日期
        const dateContainer = document.getElementById('publish-date-container');
        if (dateContainer) {
            let dateHtml = `<p style="font-size: 15px;">發佈日期：${post.writedate}`;
            if (post.dateModified) {
                dateHtml += `<br/>最後更新日期：${post.dateModified}`;
            }
            dateHtml += `</p>`;
            dateContainer.innerHTML = dateHtml;
        }

        // 4. 動態生成 Tag Buttons
        const tagsContainer = document.getElementById('tag-buttons-container');
        if (tagsContainer && Array.isArray(post.tags)) {
            tagsContainer.innerHTML = post.tags.map(tag => 
                `<span class="tag-button" data-tag="${tag}">#${tag}</span>`
            ).join('');
        }

    } catch (error) {
        console.error('載入文章資料失敗:', error);
    }
});