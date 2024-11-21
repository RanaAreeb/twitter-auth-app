import dbConnect from '../../lib/db';
import User from '../../models/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username: name }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this username or email' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      username: name, // Map "name" to "username" in the database
      email,
      password: hashedPassword,
      inAppCurrency: 100, // Default in-app currency for new users
    });

    return res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
