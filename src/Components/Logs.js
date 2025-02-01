import React, {useState}from "react";
import {LoginValidation} from './LoginValidation';
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
export default function Logs() {
const [islogin,setIslogin]= useState(true);
const [values,setValue]=useState({
    email:'',
    password:''
})
const navigate = useNavigate();
const [errors,setErrors]=useState({})
const handleInput=(event)=>{
  setValue(prev => ({...prev,[event.target.name]:[event.target.values]}))
}
const handleSubmit =(event)=>{
  event.preventDefault();
  setErrors(LoginValidation(values));
  if(errors.email==="" && errors.password===""){
    axios.post('http://localhost:8081/logs', values)
    .then(res => {
      if(res.data === "Success") {
        navigate('/home');
      }else{
        alert("NO Record Found");
      }
      })
    .catch(err => console.log(err));
  }
}
  return (
    <div className="container"> 
      <div className="form-container">
        <form className="myform" onSubmit={handleSubmit}>
          <div><h3>Login</h3></div>
          <div ><label>Email</label></div>
          <div><input type="email" placeholder="Enter Email" name="email" onChange={handleInput}></input>
          {errors.email && <span className="text-danger"> {errors.email} </span>}
          </div>
          <div><label>Password</label></div>
          <div><input type="password" placeholder="Password" name="password" onChange={handleInput}></input>
          {errors.password && <span className="text-danger"> {errors.password} </span>}</div>
          <a href="#">Forget password?</a>
          <div className="form-toggle">
            <button  type="submit" className={islogin ? 'active' : ""} onClick={()=> setIslogin(true)}>Login</button>
        <button><Link to="/Singup" className={!islogin ? 'active' : ""} onClick={()=> setIslogin(false)}>Signup</Link></button>
          </div>
        </form>    
      </div>
    </div>
  );
}
