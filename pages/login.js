import { useState } from 'react';
import { useRouter } from 'next/router';
import Popup from '../components/Popup'; // Import Popup component
import styles from '../styles/login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', success: true });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setPopup({ show: true, message: 'Login successful!', success: true });
      router.push('/'); // Redirect to home
    } catch (err) {
      setPopup({ show: true, message: err.message, success: false });
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <div className="global-loader">Loading...</div>}
      {popup.show && (
        <Popup
          message={popup.message}
          success={popup.success}
          onClose={() => setPopup({ ...popup, show: false })}
        />
      )}
      <h1 className={styles.heading}>Login</h1>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.loginInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.loginInput}
        />
        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
      <div className={styles.signupContainer}>
        <p>Don&apos;t have an account?</p> {/* Fixed the single quote issue */}
        <button
          className={styles.signupButton}
          onClick={() => router.push('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
