import React, { useState } from 'react';
import { api } from '../api';
import Icon from '../Icon';

const Auth = ({ onAuthSuccess, addToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Customer'); // Customer or Agent

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await api.auth.login(username, password);
        addToast('Welcome back! Login successful.', 'success');
        onAuthSuccess(data);
      } else {
        const data = await api.auth.register(
          username,
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
          role
        );
        addToast('Registration successful! Session started.', 'success');
        onAuthSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
      addToast(err.message || 'Authentication failed.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setRole('Customer');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-main)',
      padding: '24px'
    }}>
      <div className="card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '40px',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-white)',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
            }}>
              <Icon name="home" style={{ width: '24px', height: '24px' }} />
            </div>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--text-main)'
            }}>
              Smart<span style={{ color: 'var(--primary)' }}>Estate</span>
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isLogin ? 'Please enter your credentials to log in' : 'Start managing and searching properties today'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="badge-danger" style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: 'normal'
          }}>
            <Icon name="alertCircle" style={{ flexShrink: 0, width: '18px', height: '18px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`btn ${role === 'Customer' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setRole('Customer')}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={`btn ${role === 'Agent' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setRole('Agent')}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    Agent
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
          >
            {loading ? (
              <Icon name="loader" style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
            ) : (
              isLogin ? 'Log In' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-light)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
