document.addEventListener('DOMContentLoaded', () => {
    const directoryContainer = document.getElementById('directory-container');
    const mobileDirectory = document.querySelector('#mobile-directory-container .sidebar-directory');

    if (!directoryContainer) return;

    // 1. 抓取頁面中所有帶有 id 的 h2 標題
    const h2Tags = document.querySelectorAll('h2[id]');
    if (h2Tags.length === 0) return;

    // 2. 建立一個有序列表 <ol>
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

    // 3. 將生成好的清單加入電腦版目錄容器中
    directoryContainer.appendChild(ol);

    // 4. 同步複製一份到手機版目錄容器（如果手機版容器存在的話）
    if (mobileDirectory) {
        mobileDirectory.innerHTML = directoryContainer.innerHTML;
    }
});