import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = `http://${window.location.hostname}:8081`;
      const res = await axios.post(`${API_BASE}/forgot-password`, { email });
      setMessage(res.data.message);

      if (res.data.token) {
        const link = `http://${window.location.hostname}:3000/reset-password/${res.data.token}`;
        setResetLink(link);
      }
    } catch (err) {
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
      <h3>Forgot Password</h3>
      <form className="myform" onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="my-button" type="submit">Send Reset Link</button>
      </form>

      {message && <p>{message}</p>}

      {resetLink && (
        <p>
          <strong>Reset Link:</strong>{' '}
          <a href={resetLink} target="_blank" rel="noopener noreferrer">
            {resetLink}
          </a>
        </p>
      )}
    </div>
    </div>
  );
}
