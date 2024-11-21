import mongoose from 'mongoose';

const TweetSchema = new mongoose.Schema({
  url: { type: String, required: true },
  tweetId: { type: String, required: true, unique: true },
  likesCount: { type: Number, default: 0 },
});

export default mongoose.models.Tweet || mongoose.model('Tweet', TweetSchema);
