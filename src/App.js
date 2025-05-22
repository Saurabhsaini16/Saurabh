
import './App.css';
import Navbar from './Components/Navbar';
import Footer from "./Components/Footer";
import Login from './Components/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './Components/Signup';
import Home from './Home';
import ForgotPassword from './Components/Forgotpassword';
import ResetPassword from './Components/Resetpassword';
function App() {
  return (
    <>
    <Navbar/>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/home' element={<Home/>}></Route>
      <Route path='/forgot-password' element={<ForgotPassword/>}></Route>
      <Route path="/reset-password/:token" element={<ResetPassword/>}></Route>
    </Routes>
    </BrowserRouter>
    <Footer/>
    </>
  );
}

export default App;
