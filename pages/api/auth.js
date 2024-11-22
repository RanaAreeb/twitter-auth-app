// pages/api/auth.js
import { generateCodeVerifier, generateCodeChallenge } from '../../utils/pkce';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  // Generate PKCE code verifier and code challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store the code verifier securely in a cookie
  res.setHeader('Set-Cookie', serialize('code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900, // 15 minutes
  }));

  // Construct the Twitter OAuth URL
  const twitterAuthUrl = `${process.env.NEXT_PUBLIC_TWITTER_AUTH_URL}?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&scope=tweet.read users.read like.read like.write&state=state123&code_challenge=${codeChallenge}&code_challenge_method=S256`;


  // Redirect the user to the Twitter OAuth page
  res.redirect(twitterAuthUrl);
}
