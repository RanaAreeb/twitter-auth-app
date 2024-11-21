// components/Dashboard.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all cookies by setting their expiration dates to the past
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0];
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Redirect to the login page
    router.push('/login');
  };

  return (
    <div className={styles.navbar}>
      <Link href="/" className={styles.link}>
        Home
      </Link>
      <Link href="/uploadTweet" className={styles.link}>
        Upload Tweet
      </Link>
      <Link href="/publicTweets" className={styles.link}>
        Public Tweets
      </Link>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
