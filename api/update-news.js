const { updateNews } = require('./news-fetcher');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting scheduled news update...');
    await updateNews();
    
    return res.status(200).json({
      success: true,
      message: 'News updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
