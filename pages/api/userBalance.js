import dbConnect from '../../lib/db';
import User from '../../models/User';
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation

export default async function handler(req, res) {
  await dbConnect();

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.method === 'GET') {
      // Fetch user balance
      return res.status(200).json({ balance: user.inAppCurrency });
    }

    if (req.method === 'PUT') {
      const { deduction = 0, addition = 0 } = req.body;

      // Deduct points if required
      if (deduction > 0) {
        if (user.inAppCurrency < deduction) {
          return res.status(400).json({ error: 'Insufficient points' });
        }
        user.inAppCurrency -= deduction;
      }

      // Add points if required
      if (addition > 0) {
        user.inAppCurrency += addition;
      }

      await user.save();
      return res.status(200).json({ balance: user.inAppCurrency });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling user balance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
