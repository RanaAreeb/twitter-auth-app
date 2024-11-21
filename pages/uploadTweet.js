import Dashboard from '../components/Dashboard';
import Popup from '../components/Popup'; // Import the Popup component
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/uploadTweet.module.css';

export default function UploadTweet() {
  const [tweetUrl, setTweetUrl] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [popup, setPopup] = useState({ show: false, message: '', success: true }); // Popup state
  const router = useRouter();

  useEffect(() => {
    // Retrieve balance from localStorage
    const storedBalance = parseInt(localStorage.getItem('balance')) || 100; // Default balance is 100 points
    setBalance(storedBalance);
  }, []);

  const extractTweetId = (url) => {
    try {
      const urlParts = new URL(url);
      const pathParts = urlParts.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      if (id) {
        return id;
      } else {
        setError('Invalid Tweet URL.');
        return null;
      }
    } catch {
      setError('Invalid URL format.');
      return null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // Check if the user has enough points
    if (balance < 50) {
      setPopup({ show: true, message: 'Insufficient points to upload a tweet. You need 50 points.', success: false });
      return;
    }

    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) return;

    try {
      // Send tweet data to the backend API
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl, tweetId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload tweet');
      }

      // Deduct points and update balance
      const newBalance = balance - 50;
      setBalance(newBalance);
      localStorage.setItem('balance', newBalance);

      setPopup({ show: true, message: 'Tweet uploaded successfully!', success: true });
      router.push('/publicTweets'); // Redirect to public tweets page
    } catch (error) {
      setPopup({ show: true, message: error.message, success: false });
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
        <h1>Upload Tweet</h1>
        <p>Balance: {balance} POINTS</p>
        <form className={styles.form} onSubmit={handleUpload}>
          <input
            type="text"
            placeholder="Enter Tweet URL"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Upload Tweet (Costs 50 Points)
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </>
  );
}
