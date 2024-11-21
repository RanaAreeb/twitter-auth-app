// pages/api/auth/callback.js
import axios from 'axios';
import { parse, serialize } from 'cookie';
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  const { code } = req.query;

  // Retrieve code_verifier from cookies
  const cookies = parse(req.headers.cookie || '');
  const codeVerifier = cookies.code_verifier;

  if (!codeVerifier) {
    console.error('Missing code verifier');
    return res.status(400).send('Missing code verifier');
  }

  try {
    // Encode client_id and client_secret for Basic Auth
    const authHeader = Buffer.from(`${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

    // Prepare URL-encoded form data for token exchange request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', process.env.NEXT_PUBLIC_REDIRECT_URI);
    formData.append('code_verifier', codeVerifier);

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(process.env.TWITTER_TOKEN_URL, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error('Missing access_token in token response');
      return res.status(500).send('Missing access_token in token response');
    }

    // Retrieve authenticated user's profile to obtain user ID
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = userResponse.data.data.id;

    if (!userId) {
      console.error('Missing user_id in user profile response');
      return res.status(500).send('Missing user_id in user profile response');
    }

    // Clear the code_verifier cookie after successful verification
    res.setHeader('Set-Cookie', serialize('code_verifier', '', { maxAge: -1, path: '/' }));

    // Redirect to the main page with the access token and user ID
    res.redirect(`/?accessToken=${accessToken}&userId=${userId}`);
  } catch (error) {
    console.error("Error during callback processing:", error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
}
