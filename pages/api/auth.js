// pages/api/auth.js
import { generateCodeVerifier, generateCodeChallenge } from '../../utils/pkce';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store code_verifier in an HTTP-only, secure cookie
  res.setHeader('Set-Cookie', serialize('code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300, // 5 minutes
  }));

  const twitterAuthUrl = `${process.env.NEXT_PUBLIC_TWITTER_AUTH_URL}?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=tweet.read users.read like.read like.write&state=state123&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.redirect(twitterAuthUrl);
}
