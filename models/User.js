import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Ensure unique usernames
  email: { type: String, required: true, unique: true },    // Ensure unique emails
  password: { type: String, required: true },              // Password field
  inAppCurrency: { type: Number, default: 100 },           // Default currency for new users
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
