document.addEventListener('DOMContentLoaded', () => {
    // 第一步：讀取 series.json
    fetch('./series.json')
        .then(response => response.json())
        .then(seriesData => {
            if (!seriesData || seriesData.length === 0) return;

            const parentContainer = document.getElementById('series-container');
            if (!parentContainer) return;

            parentContainer.innerHTML = '';

            // 第二步：讀取 posts.json 用來核對與過濾文章
            return fetch('./posts.json')
                .then(response => response.json())
                .then(posts => {
                    if (!posts) posts = [];

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

                        // 過濾出屬於這個系列的文章
                        const seriesPosts = posts.filter(p => p.series === targetSeries);
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

                        section.innerHTML = `
                            <div class="series-overlay"></div>
                            <div class="series-content-wrapper">
                                <h5 class="series-title">${displaySeriesTitle}</h5>
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

                                track.innerHTML = currentPosts.map(post => {
                                    const imgSrc = post.picture ? post.picture : '';
                                    return `
                                        <a href="${post.url || '#'}" class="series-card">
                                            <img src="${imgSrc}" alt="${post.title || ''}" loading="lazy">
                                            <h4>${post.title || ''}</h4>
                                        </a>
                                    `;
                                }).join('');
                            }

                            renderSlider(false);

                            const prevBtns = section.querySelectorAll('.series-prev-btn');
                            const nextBtns = section.querySelectorAll('.series-next-btn');

                            prevBtns.forEach(btn => {
                                btn.addEventListener('click', () => {
                                    if (currentIndex > 0) {
                                        currentIndex--;
                                        renderSlider(true);
                                    }
                                });
                            });

                            nextBtns.forEach(btn => {
                                btn.addEventListener('click', () => {
                                    const maxIndex = Math.ceil(totalItems / itemsPerPage) - 1;
                                    if (currentIndex < maxIndex) {
                                        currentIndex++;
                                        renderSlider(true);
                                    }
                                });
                            });
                        }
                    });
                });
        })
        .catch(error => console.error('Error loading series or posts JSON:', error));
});