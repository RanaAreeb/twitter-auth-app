import { useEffect } from 'react';
import styles from '../styles/popup.module.css';

export default function Popup({ message, onClose, success = true }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.popup} ${success ? styles.success : styles.error}`}>
      {message}
    </div>
  );
}
