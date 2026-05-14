import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileService } from '../utils/profileService';
import styles from './Auth.module.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await ProfileService.login(email, password);
      } else {
        await ProfileService.register(name, email, password);
      }
      navigate('/advisor'); // Take them to setup their profile details next
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>🕉️</div>
          <h2>{isLogin ? 'Welcome Back Seeker' : 'Join the Cosmic Journey'}</h2>
          <p>{isLogin ? 'Login to access your personalized Vedic insights' : 'Create an account to save your birth details permanently'}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Shiva Kumar" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login Now' : 'Register Account')}
          </button>
        </form>

        <div className={styles.footer}>
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </div>

        <div className={styles.guestLink}>
          <button onClick={() => {
            localStorage.setItem('astro_guest_mode', 'true');
            navigate('/');
          }}>
            Continue as Guest (No account needed)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
