import axios from 'axios';
import dbConnect from '../../lib/db';
import Tweet from '../../models/Tweet';
import User from '../../models/User';

export default async function handler(req, res) {
  const { accessToken, userId, tweetId } = req.query;

  if (!accessToken || !userId || !tweetId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    await dbConnect();

    // Check if the user is in the list of users who liked the tweet
    const likingUsersEndpoint = `https://api.twitter.com/2/tweets/${tweetId}/liking_users`;
    const likingUsersResponse = await axios.get(likingUsersEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: { max_results: 100 },
    });

    const likingUsers = likingUsersResponse.data.data || [];
    const isLikedByUser = likingUsers.some((user) => user.id === userId);

    if (isLikedByUser) {
      // Update database: increment likesCount for the tweet and reward user
      const tweet = await Tweet.findOne({ tweetId });
      if (tweet) {
        tweet.likesCount += 1;
        await tweet.save();
      }

      // Find user by `userId` (string) instead of `_id`
      const user = await User.findOne({ userId }); // Assuming userId is stored as a string field in the `User` schema
      if (user) {
        user.inAppCurrency += 5; // Reward user with 5 points
        await user.save();
      }

      return res.status(200).json({ message: 'Tweet liked successfully, user rewarded!', isLikedByUser: true });
    }

    // If not found in liking_users, check the user's liked tweets
    const likedTweetsEndpoint = `https://api.twitter.com/2/users/${userId}/liked_tweets`;
    const likedTweetsResponse = await axios.get(likedTweetsEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: { max_results: 100 },
    });

    const likedTweets = likedTweetsResponse.data.data || [];
    const userLikedTweet = likedTweets.some((tweet) => tweet.id === tweetId);

    if (userLikedTweet) {
      // Update database similarly as above
      const tweet = await Tweet.findOne({ tweetId });
      if (tweet) {
        tweet.likesCount += 1;
        await tweet.save();
      }

      const user = await User.findOne({ userId }); // Find user by `userId` (string)
      if (user) {
        user.inAppCurrency += 5;
        await user.save();
      }

      return res.status(200).json({ message: 'Tweet liked successfully, user rewarded!', isLikedByUser: true });
    }

    return res.status(200).json({ message: 'Please like the tweet on Twitter first.', isLikedByUser: false });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || error.message;
    console.error('Error checking if user liked the tweet:', errorMessage);
    return res.status(statusCode).json({
      error: 'Failed to retrieve like information',
      details: errorMessage,
    });
  }
}
