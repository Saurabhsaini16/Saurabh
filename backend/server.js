require('dotenv').config();
const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8,
});

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3307,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

const resetTokens = {}; 

// SIGNUP
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err) => {
    if (err) return res.status(500).json({ message: "Signup failed", error: err });
    return res.json({ message: "User registered successfully" });
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Login failed", error: err });
    if (results.length > 0) {
      return res.json({ message: "Success", name: results[0].name, email: results[0].email });
    } else {
      return res.json({ message: "Fail" });
    }
  });
});

// FORGOT PASSWORD
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const sql = "SELECT * FROM login WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const token = uuidv4();
    resetTokens[token] = email;

    const resetLink = `http://localhost:3000/reset-password/${token}`;
    console.log(`Password reset link: ${resetLink}`);

    res.json({ message: "Reset link sent. Check server logs for the link.", token });
  });
});

// RESET PASSWORD
app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const email = resetTokens[token];

  if (!email) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const sql = "UPDATE login SET password = ? WHERE email = ?";
  db.query(sql, [password, email], (err) => {
    if (err) return res.status(500).json({ message: "Error updating password", error: err });

    delete resetTokens[token];
    res.json({ message: "Password reset successful" }); // FIXED MESSAGE
  });
});

// SOCKET.IO SETUP
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-online", (email) => {
    onlineUsers[email] = socket.id;
    socket.userEmail = email;
    io.emit("update-user-list", Object.keys(onlineUsers));
  });

  socket.on("disconnect", () => {
    if (socket.userEmail) {
      delete onlineUsers[socket.userEmail];
      io.emit("update-user-list", Object.keys(onlineUsers));
    }
    console.log("User disconnected:", socket.id);
  });

  socket.on("connection-request", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("connection-request", { from });
    }
  });

  socket.on("session-started", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("session-started", { from });
    }
  });

  socket.on("session-ended", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("session-ended", { from });
    }
  });

  socket.on("send-message", ({ to, text, file }) => {
    const from = socket.userEmail;
    const timestamp = Date.now();

    if (Array.isArray(to)) {
      to.forEach((recipient) => {
        const targetSocket = onlineUsers[recipient];
        if (targetSocket) {
          io.to(targetSocket).emit("receive-message", { from, text, file, timestamp });
        }
      });
    } else {
      const targetSocket = onlineUsers[to];
      if (targetSocket) {
        io.to(targetSocket).emit("receive-message", { from, text, file, timestamp });
      }
    }
  });

  socket.on("send-signal", ({ to, data }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("receive-signal", { from: socket.userEmail, data });
    }
  });
});

server.listen(8081, "0.0.0.0", () => {
  console.log("HTTP + WebSocket server listening on port 8081");
});
