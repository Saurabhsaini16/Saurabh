import React, {useState}from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import SignupValidation from "./SignupValidation";

export default function Signup() {
   const [islogin,setIslogin]= useState(false);
    const [values,setValue]=useState({
        name:'',
        email:'',
        password:''
    })
    const navigate = useNavigate();
    const [errors,setErrors]=useState({})
    const handleInput=(event)=>{
      setValue(prev => ({...prev,[event.target.name]:[event.target.value]}))
    }
    const handleSubmit =(event)=>{
      event.preventDefault();
      setErrors(SignupValidation(values));
      if(errors.name==="" && errors.email==="" && errors.password===""){
        const API_BASE = `http://${window.location.hostname}:8081`;
              axios.post(`${API_BASE}/signup`, values)
       // axios.post('http://localhost:8081/signup', values)
        .then(res =>{navigate('/');})
        .catch(err => console.log(err));
      }
    }
  return (
    <div className="container"> 
      <div className="form-container">
        <form className="myform" onSubmit={handleSubmit}>
          <div><h3>Signup</h3></div>
          <div ><label>Username</label></div>
          <div><input type="text" placeholder="Username" name="name" onChange={handleInput}></input>
          {errors.name && <span className="text-danger"> {errors.name} </span>}</div>
          <div ><label>Email</label></div>
          <div><input type="email" placeholder="Email" name="email" onChange={handleInput}></input>
          {errors.email && <span className="text-danger"> {errors.email} </span>}</div>
          <div><label>Password</label></div>
          <div><input type="password" placeholder="Password" name="password" onChange={handleInput}></input>
          {errors.password && <span className="text-danger"> {errors.password} </span>}</div>
          <div className="form-toggle">
          <button><Link to="/" className={islogin ? 'active' : ""} onClick={()=> setIslogin(true)}>Login</Link></button>
          <button type="submit" className={!islogin ? 'active' : ""} onClick={()=> setIslogin(false)}>Signup</button>
          </div>
        </form>
      </div>
    </div>
  );
}


