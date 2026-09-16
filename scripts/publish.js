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

    // 確保 posts 係一個陣列
    const postsArray = Array.isArray(posts) ? posts : [posts];

    for (const post of postsArray) {
        if (!post || typeof post !== 'object') continue;

        if (post.writedate && String(post.writedate) <= today) {
            // 強制防禦：確保 url 絕對是字串
            let rawUrl = post.url;
            if (Array.isArray(rawUrl)) {
                rawUrl = rawUrl[0] || '';
            }
            const urlStr = typeof rawUrl === 'string' ? rawUrl : (rawUrl ? String(rawUrl) : '');
            
            // 安全取得 filename
            const filename = urlStr ? path.basename(urlStr) : '';
            if (!filename || typeof filename !== 'string') continue;

            // 動態提取年份（強制轉字串）
            let year = String(new Date().getFullYear()); 
            let urlMatched = false;

            if (urlStr) {
                const match = urlStr.match(/published\/(\d{4})/);
                if (match && match[1]) {
                    year = String(match[1]);
                    urlMatched = true;
                }
            }
            if (!urlMatched && post.dayoftravel) {
                let travelStr = post.dayoftravel;
                if (Array.isArray(travelStr)) travelStr = travelStr[0];
                travelStr = String(travelStr || '');
                if (travelStr.length >= 4) {
                    year = travelStr.substring(0, 4);
                }
            }

            // 嚴格確保所有路徑參數全部都是純字串
            const safeYear = String(year);
            const safeFilename = String(filename);
            const sourcePath = path.join(repoRoot, 'posts_not_yet_published', safeFilename);
            const targetDir = path.join(repoRoot, 'published', safeYear);
            const targetPath = path.join(targetDir, safeFilename);

            const relSource = `posts_not_yet_published/${safeFilename}`;
            const relTarget = `published/${safeYear}/${safeFilename}`;

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

    if (movedCount > 0) {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ✅ **已成功掃取到文章並完成移動** |\n| **掃取日期** | \`${today}\` |\n| **移動數量** | \`${movedCount}\` 個檔案 |\n| **檔案清單** | ${movedList.map(f => `\`${f}\``).join(', ')} |`);
    } else {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ℹ️ **今日沒有文章需要發布** |\n| **掃取日期** | \`${today}\` |\n| **說明** | 掃描 \`posts.json\` 後未發現符合或早于今日 (`+ today +`) 的未發布文章。 |`);
    }
} catch (err) {
    const errCode = err.message ? err.message.split(':')[0] : 'ERR_UNKNOWN';
    appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ❌ **執行發生錯誤** |\n| **錯誤代碼** | \`${errCode}\` |\n| **詳細訊息** | \`${err.message}\` |`);
    process.exit(1);
}