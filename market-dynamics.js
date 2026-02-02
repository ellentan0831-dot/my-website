// API配置
const API_BASE_URL = (() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost 
        ? 'http://localhost:3000/api' 
        : `${window.location.origin}/api`;
})();

console.log('API Base URL:', API_BASE_URL);

async function fetchNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch news:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return null;
    }
}

async function fetchDailySummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/news/daily`);
        const result = await response.json();
        
        if (result.success) {
            return result;
        } else {
            console.error('Failed to fetch daily summary:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching daily summary:', error);
        return null;
    }
}

async function fetchWeeklyNews(source = 'all') {
    try {
        const url = source === 'all' 
            ? `${API_BASE_URL}/news/weekly`
            : `${API_BASE_URL}/news/weekly?source=${source}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.news;
        } else {
            console.error('Failed to fetch weekly news:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching weekly news:', error);
        return [];
    }
}

function renderDailySummary(data) {
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent) return;
    
    if (!data || !data.summary || data.summary.length === 0) {
        summaryContent.innerHTML = '<p>暂无数据</p>';
        return;
    }
    
    summaryContent.innerHTML = data.summary.map(item => {
        const colonIndex = item.indexOf('：');
        if (colonIndex !== -1) {
            const beforeColon = item.substring(0, colonIndex + 1);
            const afterColon = item.substring(colonIndex + 1);
            return `<p><span class="summary-highlight">${beforeColon}</span>${afterColon}</p>`;
        }
        return `<p><span class="summary-highlight">${item}</span></p>`;
    }).join('');
    
    const dateDisplay = document.querySelector('.summary-date-display');
    if (dateDisplay && data.date && data.dayOfWeek) {
        dateDisplay.textContent = `${data.date} ${data.dayOfWeek}`;
    }
}

function renderWeeklyNews(newsItems) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    if (!newsItems || newsItems.length === 0) {
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">暂无新闻数据</p>';
        return;
    }
    
    const sourceDisplayNames = {
        'openai': 'OPENAI',
        'anthropic': 'ANTHROPIC',
        'coze': 'COZE/扣子',
        'dify': 'DIFY',
        'langchain': 'LANGCHAIN',
        'jiqizhixin': '机器之心',
        '36kr': '36氪',
        'qbitai': '量子位',
        'latepost': '晚点LATEPOST'
    };
    
    newsGrid.innerHTML = newsItems.map(item => {
        const displayName = sourceDisplayNames[item.source] || item.source.toUpperCase();
        return `
            <div class="news-card" data-source="${item.source}">
                <div class="news-header">
                    <span class="news-source">${displayName}</span>
                    <span class="news-date">${item.date}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                <a href="${item.link}" target="_blank" class="news-link">阅读更多 →</a>
            </div>
        `;
    }).join('');
}

async function loadNews() {
    const dailyData = await fetchDailySummary();
    if (dailyData) {
        renderDailySummary(dailyData);
    }
    
    const weeklyNews = await fetchWeeklyNews('all');
    renderWeeklyNews(weeklyNews);
}

document.addEventListener('DOMContentLoaded', function() {
    const sourceBtns = document.querySelectorAll('.source-btn');
    
    sourceBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const source = this.getAttribute('data-source');
            
            sourceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const newsCards = document.querySelectorAll('.news-card');
            
            if (source === 'all') {
                newsCards.forEach(card => card.style.display = 'block');
            } else {
                newsCards.forEach(card => {
                    const cardSource = card.getAttribute('data-source');
                    card.style.display = cardSource === source ? 'block' : 'none';
                });
            }
        });
    });
    
    loadNews();
});
