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

            // 動態提取年份：優先從 url (published/YYYY/) 抓取，其次從 dayoftravel 抓取，最後用當前年份
            let year = new Date().getFullYear().toString(); 
            let urlMatched = false;

            if (post.url) {
                const match = post.url.match(/published\/(\d{4})/);
                if (match && match) {
                    year = match; // 修正：正確取到捕獲到的年份群組
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

    if (movedCount > 0) {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ✅ **已成功更新位置** |\n| **移動數量** | \`${movedCount}\` 個檔案 |\n| **清單** | ${movedList.map(f => `\`${f}\``).join(', ')} |`);
    } else {
        appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ℹ️ **是日沒有檔案需要移動** |\n| **日期檢查** | 檢查至 \`${today}\`，無到期未發布文章 |`);
    }
} catch (err) {
    const errCode = err.message.split(':')[0] || 'ERR_UNKNOWN';
    appendSummary(`### 🚀 自動發布狀態報告\n| 項目 | 狀態 / 詳情 |\n| :--- | :--- |\n| **狀態** | ❌ **錯誤代碼 / 發生例外** |\n| **錯誤代碼** | \`${errCode}\` |\n| **詳細訊息** | \`${err.message}\` |`);
    process.exit(1);
}