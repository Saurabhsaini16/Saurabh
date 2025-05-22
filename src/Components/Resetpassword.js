import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage("Password should be at least 6 characters");
      return;
    }

    try {
      const API_BASE = `http://${window.location.hostname}:8081`;
      const response = await axios.post(`${API_BASE}/reset-password/${token}`, { password });
      setMessage(response.data.message);
      if (response.data.message === "Password reset successful") {
        setTimeout(() => navigate("/"), 2000); // Redirect to login page
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <form className="myform" onSubmit={handleReset}>
          <h3>Reset Password</h3>
          <div>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="my-button" type="submit">Reset Password</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}
