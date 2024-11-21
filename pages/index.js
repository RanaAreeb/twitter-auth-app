// pages/index.js
import Dashboard from '../components/Dashboard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/home.module.css';

export default function Home() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);

  // Store credentials from query params into localStorage
  useEffect(() => {
    if (router.query.accessToken && router.query.userId) {
      setAccessToken(router.query.accessToken);
      setUserId(router.query.userId);
      localStorage.setItem('accessToken', router.query.accessToken);
      localStorage.setItem('userId', router.query.userId);
    }
  }, [router.query]);

  // Restore authentication details and token balance from localStorage
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(
          `/api/getUserInfo?userId=${userId}&accessToken=${accessToken}`
        );
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
          localStorage.setItem('username', data.username);
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
      }
    };

    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedBalance = parseInt(localStorage.getItem('balance')) || 100; // Default balance

    if (storedAccessToken && storedUserId) {
      setAccessToken(storedAccessToken);
      setUserId(storedUserId);
      setBalance(storedBalance);

      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        fetchUsername(); // Fetch username only if not stored
      }
    }
  }, [userId, accessToken]);

  const authenticate = () => {
    router.push('/api/auth'); // Redirect to authentication endpoint
  };

  return (
    <>
      <Dashboard />
      <div className={styles.container}>
        <h1 className={styles.heading}>Welcome to the Twitter Interaction App!</h1>
        <p className={styles.instructions}>
          Use this app to interact with Twitter and manage your token balance.
        </p>
        {!userId || !accessToken ? (
          <div className={styles.buttons}>
            <button className={styles.button} onClick={authenticate}>
              Authenticate with Twitter
            </button>
          </div>
        ) : (
          <div>
            <h2 className={styles.welcome}>
              Welcome, <span className={styles.username}>@{username || userId}</span>!
            </h2>
            <h3 className={styles.balance}>Balance: {balance} TOKENS</h3>
            <div className={styles.buttons}>
              <button
                className={styles.button}
                onClick={() => router.push('/uploadTweet')}
              >
                Upload a Tweet (Costs 5 Tokens)
              </button>
              <button
                className={styles.button}
                onClick={() => router.push('/publicTweets')}
              >
                Like Tweets (Earn 2 Tokens)
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
