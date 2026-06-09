const axios = require('axios');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'keyword parameter required' });
  }

  try {
    // TikTok unofficial search API
    const response = await axios.get(
      `https://www.tikwm.com/api/feed/search`,
      {
        params: {
          keywords: keyword,
          count: 10,
          cursor: 0,
          HD: 1
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = response.data;

    if (!data || !data.data || !data.data.videos) {
      return res.status(404).json({ error: 'No videos found' });
    }

    const videos = data.data.videos.map(video => ({
      id: video.id,
      title: video.title,
      videoUrl: video.play,         // Direct video URL (no watermark)
      hdVideoUrl: video.hdplay,     // HD version
      cover: video.cover,
      author: video.author?.nickname,
      duration: video.duration,
      views: video.play_count,
      likes: video.digg_count
    }));

    return res.status(200).json(videos);

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
