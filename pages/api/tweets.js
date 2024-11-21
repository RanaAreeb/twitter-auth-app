import dbConnect from '../../lib/db';
import Tweet from '../../models/Tweet';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Fetch all tweets
    try {
      const tweets = await Tweet.find();
      return res.status(200).json(tweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      return res.status(500).json({ error: 'Failed to fetch tweets' });
    }
  }

  if (req.method === 'POST') {
    // Add new tweet to the database
    const { url, tweetId } = req.body;

    if (!url || !tweetId) {
      return res.status(400).json({ error: 'URL and Tweet ID are required' });
    }

    try {
      const existingTweet = await Tweet.findOne({ tweetId });
      if (existingTweet) {
        return res.status(400).json({ error: 'Tweet already exists' });
      }

      const newTweet = await Tweet.create({
        url,
        tweetId,
        likesCount: 0, // Initialize with 0 likes
      });

      return res.status(201).json({ message: 'Tweet uploaded successfully', tweet: newTweet });
    } catch (error) {
      console.error('Error uploading tweet:', error);
      return res.status(500).json({ error: 'Failed to upload tweet' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
