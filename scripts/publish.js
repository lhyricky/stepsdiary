const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const postsPath = path.join(__dirname, '../posts.json');
if (!fs.existsSync(postsPath)) {
    console.error('找不到 posts.json');
    process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
// 取得今日日期 YYYY-MM-DD (UTC 或可按需要調整，呢度用標準 ISO date 前 10 位)
const today = new Date().toISOString().split('T')[0];
console.log('今日日期:', today);

let movedCount = 0;

posts.forEach(post => {
    if (post.writedate && post.writedate <= today) {
        const filename = path.basename(post.url);
        // 從 url (例: published/2024/xxx.html) 或 dayoftravel (例: 20240720) 提取年份
        let year = '2024';
        if (post.url) {
            const match = post.url.match(/published\/(\d{4})/);
            if (match) year = match;
        } else if (post.dayoftravel) {
            year = post.dayoftravel.toString().substring(0, 4);
        }

        const sourcePath = `posts_not_yet_published/${filename}`;
        const targetDir = `published/${year}`;
        const targetPath = `${targetDir}/${filename}`;

        // 檢查來源檔案係咪真係存在於 posts_not_yet_published
        if (fs.existsSync(sourcePath)) {
            fs.mkdirSync(targetDir, { recursive: true });
            
            // 用 git mv 確保 git 追蹤到檔案搬遷
            try {
                execSync(`git mv "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' });
                console.log(`成功搬移: ${sourcePath} -> ${targetPath}`);
                movedCount++;
            } catch (err) {
                console.error(`git mv 失敗，轉用普通 fs.renameSync:`, err.message);
                fs.renameSync(sourcePath, targetPath);
                movedCount++;
            }
        }
    }
});

if (movedCount > 0) {
    console.log(`共搬移咗 ${movedCount} 篇文章。`);
} else {
    console.log('今日無需要發布嘅到期文章。');
}