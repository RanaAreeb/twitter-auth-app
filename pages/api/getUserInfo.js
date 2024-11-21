// pages/api/getUserInfo.js
import axios from 'axios';

export default async function handler(req, res) {
  const { userId, accessToken } = req.query;

  if (!userId || !accessToken) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Fetch user info from Twitter API
    const url = `https://api.twitter.com/2/users/${userId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (data && data.data) {
      return res.status(200).json({ username: data.data.username });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to fetch user info' });
  }
}
