import Dashboard from '../components/Dashboard';
import Popup from '../components/Popup';
import { useEffect, useState } from 'react';
import styles from '../styles/publicTweets.module.css';

export default function PublicTweets() {
  const [tweets, setTweets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: '', success: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tweetResponse = await fetch('/api/tweets');
        const tweetsData = await tweetResponse.json();
        setTweets(tweetsData);

        const storedBalance = parseInt(localStorage.getItem('balance')) || 100;
        const storedUserId = localStorage.getItem('userId');
        const storedAccessToken = localStorage.getItem('accessToken');

        setBalance(storedBalance);
        setUserId(storedUserId);
        setAccessToken(storedAccessToken);
      } catch (error) {
        console.error('Failed to fetch tweets:', error);
      }
    };

    fetchData();
  }, []);

  const handleLikeCheck = async (tweetId) => {
    if (!userId || !accessToken) {
      setPopup({ show: true, message: 'You must authenticate first.', success: false });
      return;
    }

    try {
      const response = await fetch(`/api/checkUserLike?accessToken=${accessToken}&userId=${userId}&tweetId=${tweetId}`);
      const data = await response.json();

      if (data.isLikedByUser) {
        setTweets((prevTweets) =>
          prevTweets.map((tweet) =>
            tweet.tweetId === tweetId
              ? { ...tweet, likesCount: tweet.likesCount + 1 }
              : tweet
          )
        );

        const newBalance = balance + 5; // Reward 5 points for liking a tweet
        setBalance(newBalance);
        localStorage.setItem('balance', newBalance);

        setPopup({ show: true, message: 'You liked the tweet and earned 5 points!', success: true });
      } else {
        setPopup({ show: true, message: 'Please like the tweet on Twitter first.', success: false });
      }
    } catch (error) {
      setPopup({ show: true, message: 'Failed to check like status. Please try again.', success: false });
      console.error('Error checking like status:', error);
    }
  };

  return (
    <>
      <Dashboard />
      {popup.show && (
        <Popup
          message={popup.message}
          success={popup.success}
          onClose={() => setPopup({ ...popup, show: false })}
        />
      )}
      <div className={styles.container}>
        <h1>Public Tweets</h1>
        <p>Balance: {balance} POINTS</p>
        <div className={styles.scrollable}>
          {tweets.length === 0 ? (
            <p>No tweets uploaded yet. Please upload a tweet.</p>
          ) : (
            tweets.map((tweet) => (
              <div key={tweet.tweetId} className={styles.tweetBox}>
                <p>
                  <strong>Tweet Link:</strong>{' '}
                  <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                    {tweet.url}
                  </a>
                </p>
                <p>
                  <strong>Likes:</strong> {tweet.likesCount}
                </p>
                <button
                  className={styles.button}
                  onClick={() => handleLikeCheck(tweet.tweetId)}
                >
                  Like Tweet / Check Liked (Earn 5 Points)
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
