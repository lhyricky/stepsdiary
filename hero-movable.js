// hero-movable.js   ← 請儲存為 hero-movable.js（UTF-8 編碼）

document.addEventListener('DOMContentLoaded', function () {
  const wrapper = document.getElementById('heroWrapper');
  const dotsContainer = document.getElementById('heroDots');
  const total = wrapper.children.length;   // 自動計有幾多張（你而家係6張）
  let current = 0;
  let timer = null;

  // 產生 6 個小圓點
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.dataset.index = i;
    if (i === 0) dot.classList.add('active');
    dot.onclick = function () {
      goTo(i);
    };
    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll('span');

  // 跳去第 n 張
  function goTo(n) {
    current = n;
    wrapper.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach(d => d.classList.remove('active'));
    dots[current].classList.add('active');
  }

  // 下一張
  function next() {
    current = (current + 1) % total;
    goTo(current);
  }

  // 開始自動播放
  function start() {
    timer = setInterval(next, 5000);  // 每 5 秒
  }

  // 暫停
  function stop() {
    clearInterval(timer);
  }

  // 啟動
  start();

  // 滑鼠移入暫停，移走繼續
  const hero = document.querySelector('.main-page-hero');
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
});