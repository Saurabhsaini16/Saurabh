const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const { data } = require("react-router-dom");
const { check, validationResult } = require('express-validator');


const app = express();
app.use(cors());
app.use(express.json());

const db= mysql.createConnection({
    host: "localhost",
    port: 3307,
    user:"root",
    password:"",
    database:"signup"


})

app.post("/signup",(req,res) =>{
    const sql="INSERT INTO login(`name`,`email`,`password`) VALUES(?, ?, ?)";
    const values=[
        req.body.name,
        req.body.email,
        req.body.password
    ]
    db.query(sql,values,(err,data)=>{
        if (err) {
            console.error("Error inserting data: ", err);  // Log the error for debugging
            return res.status(500).json({ message: "Error inserting data", error: err });
        }
        return res.status(201).json({ message: "User created successfully", data });   
    })
})

app.post('/login', [
    check('email', "Email length error").isEmail().isLength({ min: 10, max: 30 }),
    check('password', "Password length 8-10").isLength({ min: 8, max: 20 })
], (req, res) => {
    console.log("Login request received:", req.body);  // Debugging
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const sql = "SELECT * FROM login WHERE `email`= ? AND `password`= ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (data.length > 0) {
            return res.json({ message: "Success" });
        } else {
            return res.json({ message: "Fail" });
        }
    });
});
app.listen(8081,()=>{
    console.log("listening");
})