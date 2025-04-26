import React, { useState } from "react";
import { LoginValidation } from './LoginValidation';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [values, setValue] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleInput = (event) => {
    setValue(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = LoginValidation(values);
    setErrors(validationErrors);

    // Check if validation passed
    if (validationErrors.email === "" && validationErrors.password === "") {

      const API_BASE = `http://${window.location.hostname}:8081`;
      axios.post(`${API_BASE}/login`, values)
      
      //axios.post('http://192.168.1.3:8081/login', values)
        .then(res => {
          console.log("Login response:", res.data);
          if (res.data.message === "Success") {
            // Passing email to Home page using navigate()
            navigate('/home', { state: { email: res.data.email ,name: res.data.name} });
          } else {
            alert("No Record Found");
          }
        })
        .catch(err => {
          console.error("Login error:", err);
        });
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <form className="myform" onSubmit={handleSubmit}>
          <div><h3>Login</h3></div>
          <div><label>Email</label></div>
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              onChange={handleInput}
              value={values.email}
            />
            {errors.email && <span className="text-danger"> {errors.email} </span>}
          </div>
          <div><label>Password</label></div>
          <div>
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleInput}
              value={values.password}
            />
            {errors.password && <span className="text-danger"> {errors.password} </span>}
          </div>
          <a href="#">Forget password?</a>
          <div className="form-toggle">
            <button type="submit" className={isLogin ? 'active' : ""} onClick={() => setIsLogin(true)}>Login</button>
            <button><Link to="/signup" className={!isLogin ? 'active' : ""} onClick={() => setIsLogin(false)}>Signup</Link></button>
          </div>
        </form>
      </div>
    </div>
  );
}
