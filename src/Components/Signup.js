import React, {useState}from "react";
import { Link, useNavigate } from 'react-router-dom';
import {SingupValidation} from './SingupValidation';
import axios from "axios";

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
      setValue(prev => ({...prev,[event.target.name]:[event.target.values]}))
    }
    const handleSubmit =(event)=>{
      event.preventDefault();
      setErrors(SingupValidation(values));
      if(errors.name==="" && errors.email==="" && errors.password===""){
        axios.post('http://localhost:8081/singup', values)
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


