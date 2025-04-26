const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MySQL setup
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database: "signup"
});

// Signup route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Signup failed", error: err });
    }
    return res.json({ message: "User registered successfully" });
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Login failed", error: err });
    }
    if (results.length > 0) {
      return res.json({ message: "Success", name: results[0].name, email: results[0].email });
    } else {
      return res.json({ message: "Fail" });
    }
  });
});

// In-memory online users map
const onlineUsers = {}; // { email: socket.id }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to online users list when they come online
  socket.on("user-online", (email) => {
    onlineUsers[email] = socket.id;
    io.emit("update-user-list", Object.keys(onlineUsers));
  });

  // Remove user from online users list when they disconnect
  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (disconnectedUser) {
      delete onlineUsers[disconnectedUser];
      io.emit("update-user-list", Object.keys(onlineUsers));
    }
    console.log("User disconnected:", socket.id);
  });

  // Handle connection requests
  socket.on("connection-request", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("connection-request", { from });
    }
  });

  // Handle chat session start
  socket.on("session-started", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("session-started", { from });
    }
  });

  // Handle session end
  socket.on("session-ended", ({ from, to }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("session-ended", { from });
    }
  });

  // Handle sending messages
  socket.on("send-message", ({ to, text, file }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      const from = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
      const timestamp = Date.now(); // Add timestamp here
      io.to(targetSocket).emit("receive-message", {
        from,
        text,
        file,
        timestamp
      });
    }
  });

  // Handle sending signals (for WebRTC signaling)
  socket.on("send-signal", ({ to, data }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("receive-signal", {
        from: Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id),
        data
      });
    }
  });
});

server.listen(8081,'0.0.0.0', () => {
  console.log("HTTP + WebSocket server listening on port 8081");
});
