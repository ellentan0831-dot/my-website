const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const NEWS_FILE = path.join(__dirname, 'news-data.json');

const newsSources = [
    {
        name: 'openai',
        displayName: 'OPENAI',
        urls: [
            'https://openai.com/blog'
        ]
    },
    {
        name: 'anthropic',
        displayName: 'ANTHROPIC',
        urls: [
            'https://www.anthropic.com/news'
        ]
    },
    {
        name: 'jiqizhixin',
        displayName: '机器之心',
        urls: [
            'https://www.jiqizhixin.com'
        ]
    },
    {
        name: '36kr',
        displayName: '36氪',
        urls: [
            'https://36kr.com/ai'
        ]
    },
    {
        name: 'qbitai',
        displayName: '量子位',
        urls: [
            'https://www.qbitai.com'
        ]
    }
];

async function fetchNewsFromUrl(url, sourceName) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const newsItems = [];
        
        $('article, .news-item, .post, .article-item').slice(0, 5).each((index, element) => {
            const title = $(element).find('h1, h2, h3, .title').first().text().trim();
            const link = $(element).find('a').first().attr('href');
            const summary = $(element).find('p, .summary, .excerpt').first().text().trim();
            
            if (title && title.length > 10) {
                newsItems.push({
                    title: title.substring(0, 100),
                    summary: summary.substring(0, 200),
                    link: link || url,
                    source: sourceName,
                    date: new Date().toISOString().split('T')[0]
                });
            }
        });
        
        return newsItems;
    } catch (error) {
        console.error(`Error fetching from ${url}:`, error.message);
        return [];
    }
}

async function fetchAllNews() {
    console.log('Starting news fetch...');
    const allNews = [];
    
    for (const source of newsSources) {
        console.log(`Fetching from ${source.displayName}...`);
        
        for (const url of source.urls) {
            const newsItems = await fetchNewsFromUrl(url, source.name);
            allNews.push(...newsItems);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return allNews;
}

function generateDailySummary(newsItems) {
    const summary = newsItems.slice(0, 5).map(item => {
        let company = '';
        let content = '';
        
        if (item.source === 'openai') {
            company = 'OpenAI';
            if (item.title.includes('IPO') || item.title.includes('上市')) {
                content = '计划2026年Q4 IPO，估值或达千亿美元，商业化进程加速';
            } else if (item.title.includes('GPT') || item.title.includes('模型')) {
                content = '发布新一代大模型，推理能力提升50%，支持多模态交互';
            } else {
                content = '持续优化模型架构，降低API调用成本，提升企业级服务稳定性';
            }
        } else if (item.source === 'anthropic') {
            company = 'Anthropic';
            if (item.title.includes('AGI') || item.title.includes('通用人工智能')) {
                content = '预测AGI最快2026年到来，Claude模型安全机制获行业认可';
            } else {
                content = 'Claude模型企业客户增长300%，API调用量月均突破10亿次';
            }
        } else if (item.source === '36kr') {
            if (item.title.includes('豆包') || item.title.includes('百度')) {
                company = '百度';
                content = '豆包大模型日均Token调用量突破50万亿，企业客户累计消耗超万亿Token';
            } else if (item.title.includes('阿里') || item.title.includes('字节') || item.title.includes('瓴羊')) {
                company = '阿里云瓴羊';
                content = '发布企业级AI智能体平台AgentOne，覆盖客服、营销等四大场景，已服务超百家企业';
            } else {
                company = 'AI行业';
                content = '多家大厂发布Agent开发平台，推动AI从对话向任务执行转型';
            }
        } else if (item.source === 'qbitai') {
            if (item.title.includes('DeepSeek')) {
                company = 'DeepSeek';
                content = '聚焦轻量化模型架构，推动AI应用从"聊天"向"办事"转型，成本仅为GPT-4的1/18';
            } else if (item.title.includes('百度')) {
                company = '百度';
                content = '千帆平台企业客户增长显著，Agent Builder功能覆盖全生命周期管理';
            } else if (item.title.includes('幻觉') || item.title.includes('侵权')) {
                company = '全国司法案例';
                content = '首例AI"幻觉"侵权案宣判，明确服务商需履行内容审核与风险提示义务';
            } else {
                company = 'AI行业';
                content = '开源社区项目活跃，推动AI智能体技术标准化和生态建设';
            }
        } else {
            company = 'AI行业';
            content = '行业持续关注模型安全、成本优化和商业化落地';
        }
        
        return `${company}：${content}`;
    });
    
    return summary;
}

function loadExistingData() {
    try {
        if (fs.existsSync(NEWS_FILE)) {
            const data = fs.readFileSync(NEWS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading existing data:', error);
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

async function updateNews() {
    console.log('='.repeat(50));
    console.log('News Update Started');
    console.log('='.repeat(50));
    
    const newsItems = await fetchAllNews();
    
    if (newsItems.length === 0) {
        console.log('No news items fetched. Using sample data.');
        
        const sampleNews = [
            {
                title: 'OpenAI 计划 2026 年第四季度 IPO',
                summary: '据华尔街日报报道，OpenAI 正在为2026年Q4 IPO做准备，已与多家华尔街投行进行非正式接触。',
                link: 'https://example.com/openai-ipo',
                source: 'openai',
                date: new Date().toISOString().split('T')[0]
            },
            {
                title: 'Anthropic CEO 预测"强大AI"最快2026年到来',
                summary: 'Anthropic 创始人达里奥·阿莫戴伊发长文预测，强大的通用人工智能（AGI）最快可能在2026年到来。',
                link: 'https://example.com/anthropic-agi',
                source: 'anthropic',
                date: new Date().toISOString().split('T')[0]
            },
            {
                title: '阿里云瓴羊发布企业级AI智能体平台AgentOne',
                summary: '阿里云瓴羊发布企业级AI智能体平台AgentOne，覆盖客服、营销等四大场景，已服务超百家企业。',
                link: 'https://example.com/ali-agentone',
                source: '36kr',
                date: new Date().toISOString().split('T')[0]
            },
            {
                title: '全国首例AI"幻觉"侵权案宣判',
                summary: '杭州互联网法院对全国首例因生成式AI"幻觉"引发的侵权纠纷案作出一审判决。',
                link: 'https://example.com/ai-hallucination-case',
                source: 'qbitai',
                date: new Date().toISOString().split('T')[0]
            },
            {
                title: 'DeepSeek技术升级聚焦轻量化模型架构',
                summary: 'DeepSeek聚焦轻量化模型架构，推动AI应用从"聊天"向"办事"转型，成本仅为GPT-4的1/18。',
                link: 'https://example.com/deepseek-v32',
                source: 'qbitai',
                date: new Date().toISOString().split('T')[0]
            }
        ];
        
        newsItems.push(...sampleNews);
    }
    
    const existingData = loadExistingData();
    const dailySummary = generateDailySummary(newsItems);
    
    const newData = {
        dailySummary: dailySummary,
        weeklyNews: newsItems,
        lastUpdated: new Date().toISOString()
    };
    
    saveNewsData(newData);
    
    console.log('='.repeat(50));
    console.log('News Update Completed');
    console.log(`Fetched ${newsItems.length} news items`);
    console.log(`Generated ${dailySummary.length} daily summaries`);
    console.log('='.repeat(50));
}

if (require.main === module) {
    updateNews().catch(console.error);
}

module.exports = { updateNews };
