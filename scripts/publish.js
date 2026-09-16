const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
function appendSummary(markdown) {
    if (summaryPath) {
        fs.appendFileSync(summaryPath, markdown + '\n');
    }
    console.log(markdown);
}

try {
    const repoRoot = path.join(__dirname, '..');
    const postsPath = path.join(repoRoot, 'posts.json');
    
    if (!fs.existsSync(postsPath)) {
        throw new Error('ERR_POSTS_JSON_MISSING: 找不到 posts.json 檔案');
    }

    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    console.log('今日 UTC 日期:', today);

    let movedCount = 0;
    let movedList = [];

    for (const post of posts) {
        if (post.writedate && post.writedate <= today) {
            const filename = path.basename(post.url || '');
            if (!filename) continue;

            // 動態提取年份
            let year = new Date().getFullYear().toString(); 
            let urlMatched = false;

            if (post.url) {
                const match = post.url.match(/published\/(\d{4})/);
                if (match && match[1]) {
                    year = match[1]; // 正確取用擷取群組 (Group 1)
                    urlMatched = true;
                }
            }
            if (!urlMatched && post.dayoftravel) {
                const travelStr = post.dayoftravel.toString();
                if (travelStr.length >= 4) {
                    year = travelStr.substring(0, 4);
                }
            }

            const sourcePath = path.join(repoRoot, 'posts_not_yet_published', filename);
            const targetDir = path.join(repoRoot, 'published', year);
            const targetPath = path.join(targetDir, filename);

            const relSource = `posts_not_yet_published/${filename}`;
            const relTarget = `published/${year}/${filename}`;

            if (fs.existsSync(sourcePath)) {
                fs.mkdirSync(targetDir, { recursive: true });
                try {
                    execSync(`git mv "${relSource}" "${relTarget}"`, { cwd: repoRoot, stdio: 'inherit' });
                } catch (err) {
                    console.warn(`git mv 失敗，fallback 至 fs.renameSync: ${err.message}`);
                    fs.renameSync(sourcePath, targetPath);
                }
                movedCount++;
                movedList.push(relTarget);
            }
        }
    }

    // 根據掃取結果顯示不同的狀態報告
    if (movedCount > 0) {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ✅ **已成功掃取到文章並完成移動** |\n| **掃取日期** | \`${today}\` |\n| **移動數量** | \`${movedCount}\` 個檔案 |\n| **檔案清單** | ${movedList.map(f => `\`${f}\``).join(', ')} |`);
    } else {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ℹ️ **今日沒有文章需要發布** |\n| **掃取日期** | \`${today}\` |\n| **說明** | 掃描 \`posts.json\` 後未發現符合或早于今日 (`+ today +`) 的未發布文章。 |`);
    }
} catch (err) {
    const errCode = err.message.split(':')[0] || 'ERR_UNKNOWN';
    appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ❌ **執行發生錯誤** |\n| **錯誤代碼** | \`${errCode}\` |\n| **詳細訊息** | \`${err.message}\` |`);
    process.exit(1);
}