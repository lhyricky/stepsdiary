document.addEventListener('DOMContentLoaded', () => {
    // 強制取得香港時間 (GMT+8) 的日期與小時
    const hkFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        hour12: false
    });
    const parts = hkFormatter.formatToParts(new Date());
    const partsObj = {};
    parts.forEach(p => partsObj[p.type] = p.value);

    const todayStr = `${partsObj.year}-${partsObj.month}-${partsObj.day}`;
    const hkHour = parseInt(partsObj.hour, 10);

    // 第一步：讀取 series.json
    fetch('/series.json')
        .then(response => response.json())
        .then(seriesData => {
            if (!seriesData || seriesData.length === 0) return;

            const parentContainer = document.getElementById('series-container');
            if (!parentContainer) return;

            parentContainer.innerHTML = '';

            // 第二步：讀取 posts.json 用來核對與過濾文章
            return fetch('/posts.json')
                .then(response => response.json())
                .then(posts => {
                    if (!posts) posts = [];

                    // 過濾掉 writedate 還沒到的文章（未夠中午 12 點前，今日的文章不會顯示）
                    const validPosts = posts.filter(p => {
                        if (!p.writedate) return true; // 如果冇寫日期就預設當作有效
                        if (hkHour < 12) {
                            return p.writedate < todayStr; // 12點前只顯示昨日及之前
                        }
                        return p.writedate <= todayStr;  // 12點後顯示今日及之前
                    });

                    // 針對 series.json 裡的每一個系列動態生成獨立的區塊
                    seriesData.forEach((seriesInfo, index) => {
                        const targetSeries = seriesInfo.series;
                        const bgImage = seriesInfo.image || '';
                        const description = seriesInfo.description || '';

                        const displaySeriesTitle = targetSeries.replace(/-/g, ' ');
                        const trackId = `seriesTrack-${index}`;

                        const section = document.createElement('section');
                        section.className = 'series-container';
                        if (bgImage) {
                            section.style.backgroundImage = `url('${bgImage}')`;
                        }

                        // 過濾出屬於這個系列且符合日期條件的文章
                        const seriesPosts = validPosts.filter(p => p.series === targetSeries);
                        const totalItems = seriesPosts.length;

                        // 動態判斷：如果文章數量為 0，顯示「不日推出」，否則顯示正常滑動骨架
                        let sliderContentHTML = '';
                        if (totalItems === 0) {
                            sliderContentHTML = `<div class="series-empty-notice">不日推出，敬請期待</div>`;
                        } else {
                            sliderContentHTML = `
                                <div class="series-slider-outer">
                                    <button class="series-nav-btn series-prev-btn" aria-label="上一頁">&#10094;</button>
                                    
                                    <div class="series-slider-container">
                                        <div class="series-track" id="${trackId}">
                                            <!-- 系列文章會由 JS 動態載入 -->
                                        </div>
                                    </div>
                                    
                                    <button class="series-nav-btn series-next-btn" aria-label="下一頁">&#10095;</button>
                                </div>

                                <div class="series-nav-controls">
                                    <button class="series-nav-btn series-prev-btn" aria-label="上一頁">&#10094;</button>
                                    <button class="series-nav-btn series-next-btn" aria-label="下一頁">&#10095;</button>
                                </div>
                            `;
                        }

                        // 只有當 totalItems > 0 時先生成文章總數的 <p> 標籤
                        const totalCountHTML = totalItems > 0 ? `<p class="series-total-count">共 ${totalItems} 篇文章</p>` : '';

                        section.innerHTML = `
                            <div class="series-overlay"></div>
                            <div class="series-content-wrapper">
                                <h5 class="series-title">${displaySeriesTitle}</h5>
                                ${totalCountHTML}
                                <p class="series-description">${description}</p>
                                ${sliderContentHTML}
                            </div>
                        `;

                        parentContainer.appendChild(section);

                        // 如果有文章才執行滑動邏輯
                        if (totalItems > 0) {
                            const track = document.getElementById(trackId);
                            let currentIndex = 0;
                            const itemsPerPage = 3;

                            function renderSlider(isAnimated = false) {
                                if (isAnimated) {
                                    track.style.opacity = '0';
                                    setTimeout(() => {
                                        updateContent();
                                        track.style.opacity = '1';
                                    }, 200);
                                } else {
                                    updateContent();
                                }
                            }

                            function updateContent() {
                                const start = currentIndex * itemsPerPage;
                                const end = start + itemsPerPage;
                                const currentPosts = seriesPosts.slice(start, end);

                                track.innerHTML = currentPosts.map((post, i) => {
                                    const imgSrc = post.picture ? post.picture : '';
                                    // 計算全域文章順序編號（從 1 開始）
                                    const itemNumber = start + i + 1;
                                    const postTitle = post.title || '';

                                    return `
                                        <a href="${post.url || '#'}" class="series-card">
                                            <img src="${imgSrc}" alt="${postTitle}" loading="lazy">
                                            <h4>${postTitle}（#${itemNumber}）</h4>
                                        </a>
                                    `;
                                }).join('');
                            }

                            renderSlider(false);

                            const prevBtns = section.querySelectorAll('.series-prev-btn');
                            const nextBtns = section.querySelectorAll('.series-next-btn');
                            const maxIndex = Math.ceil(totalItems / itemsPerPage) - 1;

                            prevBtns.forEach(btn => {
                                btn.addEventListener('click', () => {
                                    if (currentIndex > 0) {
                                        currentIndex--;
                                    } else {
                                        currentIndex = maxIndex; // 已經係第一頁，禁上一頁會跳去最尾
                                    }
                                    renderSlider(true);
                                });
                            });

                            nextBtns.forEach(btn => {
                                btn.addEventListener('click', () => {
                                    if (currentIndex < maxIndex) {
                                        currentIndex++;
                                    } else {
                                        currentIndex = 0; // 已經係最尾頁，禁下一頁會循環返去最頭
                                    }
                                    renderSlider(true);
                                });
                            });
                        }
                    });
                });
        })
        .catch(error => console.error('Error loading series or posts JSON:', error));
});