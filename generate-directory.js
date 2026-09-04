document.addEventListener('DOMContentLoaded', () => {
    const directoryContainer = document.getElementById('directory-container');
    if (!directoryContainer) return;

    // 抓取頁面中所有帶有 id 的 h2 標題
    const h2Tags = document.querySelectorAll('.main-paragraph h2[id]');
    if (h2Tags.length === 0) return;

    // 建立一個有序列表 <ol>
    const ol = document.createElement('ol');

    h2Tags.forEach(h2 => {
        const id = h2.getAttribute('id');
        const text = h2.textContent;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = text;

        li.appendChild(a);
        ol.appendChild(li);
    });

    // 將生成好的清單加入目錄容器中（保留原本置中的「目錄」標題）
    directoryContainer.appendChild(ol);
});