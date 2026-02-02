const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { updateNews } = require('./news-fetcher');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const NEWS_FILE = path.join(__dirname, 'news-data.json');

const sources = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    coze: 'COZE/扣子',
    dify: 'DIFY',
    langchain: 'LangChain',
    jiqizhixin: '机器之心',
    '36kr': '36氪',
    qbitai: '量子位',
    latepost: '晚点LATEPOST'
};

function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayOfWeek(date) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const d = new Date(date);
    return days[d.getDay()];
}

function loadNewsData() {
    try {
        if (fs.existsSync(NEWS_FILE)) {
            const data = fs.readFileSync(NEWS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading news data:', error);
    }
    return { dailySummary: [], weeklyNews: [] };
}

function saveNewsData(data) {
    try {
        fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('News data saved successfully');
    } catch (error) {
        console.error('Error saving news data:', error);
    }
}

app.get('/api/news', (req, res) => {
    try {
        const data = loadNewsData();
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load news data'
        });
    }
});

app.get('/api/news/daily', (req, res) => {
    try {
        const data = loadNewsData();
        const yesterday = getYesterdayDate();
        const dayOfWeek = getDayOfWeek(yesterday);
        
        res.json({
            success: true,
            date: yesterday,
            dayOfWeek: dayOfWeek,
            summary: data.dailySummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load daily summary'
        });
    }
});

app.get('/api/news/weekly', (req, res) => {
    try {
        const data = loadNewsData();
        const sourceFilter = req.query.source;
        
        let news = data.weeklyNews;
        if (sourceFilter && sourceFilter !== 'all') {
            news = news.filter(item => item.source === sourceFilter);
        }
        
        res.json({
            success: true,
            news: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load weekly news'
        });
    }
});

app.post('/api/news/update', (req, res) => {
    try {
        const { dailySummary, weeklyNews } = req.body;
        
        const data = {
            dailySummary: dailySummary || [],
            weeklyNews: weeklyNews || [],
            lastUpdated: new Date().toISOString()
        };
        
        saveNewsData(data);
        
        res.json({
            success: true,
            message: 'News updated successfully',
            lastUpdated: data.lastUpdated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update news'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  /api/news - Get all news`);
    console.log(`  GET  /api/news/daily - Get daily summary`);
    console.log(`  GET  /api/news/weekly - Get weekly news`);
    console.log(`  POST /api/news/update - Update news data`);
    console.log(`  GET  /api/health - Health check`);
    
    cron.schedule('0 8 * * *', () => {
        console.log('Running scheduled news update...');
        updateNews().catch(console.error);
    });
    
    console.log(`Scheduled task: News update at 8:00 AM daily`);
    
    updateNews().catch(console.error);
});
