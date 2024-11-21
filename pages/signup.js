import { useState } from 'react';
import { useRouter } from 'next/router';
import Popup from '../components/Popup'; // Import Popup component
import styles from '../styles/signup.module.css';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', success: true });
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setPopup({ show: true, message: 'Sign-up successful! Please log in.', success: true });
      router.push('/login');
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
      <h1>Sign Up</h1>
      <form className={styles.signupForm} onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.signupInput}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.signupInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.signupInput}
        />
        <button type="submit" className={styles.signupButton}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
