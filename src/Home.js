import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";      
import io from "socket.io-client";

let socket;

export default function Home() {
  const location = useLocation();
  const userName = location.state?.name;
  const userEmail = location.state?.email;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userEmail) {
      navigate("/", { replace: true });
      return;
    }

    const socketServerURL = window.location.hostname === "localhost"
  ? "http://localhost:8081"
  : `http://${window.location.hostname}:8081`;

    socket = io(socketServerURL);


   // socket = io("http://192.168.1.3:8081");

    socket.emit("user-online", userEmail);

    socket.on("update-user-list", (users) => {
      setOnlineUsers(users.filter(email => email !== userEmail));
    });

    socket.on("receive-message", ({ from, text, file, timestamp }) => {
      setMessages(prev => [...prev, { from, text, file, timestamp }]);
    });

    socket.on("connection-request", ({ from }) => {
      setNotification(`Connection request received from ${from}`);
    });

    socket.on("session-started", ({ from }) => {
      setSessionStarted(true);
      setNotification(`Chat session started with ${from}`);
    });

    socket.on("session-ended", ({ from }) => {
      setNotification(`Chat session ended by ${from}`);
      setSelectedUser(null);
      setMessages([]);
      setSessionStarted(false);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [userEmail, navigate]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setNotification(`Waiting for ${user} to accept the chat...`);
    socket.emit("connection-request", { from: userEmail, to: user });
  };

  const handleAcceptConnection = () => {
    if (notification.includes("Connection request received from")) {
      const fromUser = notification.split("from ")[1];
      setSelectedUser(fromUser);
      setSessionStarted(true);
      setNotification(`Chat session started with ${fromUser}`);
      socket.emit("session-started", { from: userEmail, to: fromUser });
    }
  };

  const handleCloseSession = () => {
    socket.emit("session-ended", { from: userEmail, to: selectedUser });
    setSelectedUser(null);
    setMessages([]);
    setNotification("");
    setSessionStarted(false);
  };

  const handleSend = () => {
    if (!selectedUser || (!message && !file)) return;

    const data = {
      to: selectedUser,
      text: message,
      file: file ? { name: file.name, type: file.type, content: "" } : null,
      timestamp: Date.now()
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        data.file.content = reader.result;
        socket.emit("send-message", data);
        setMessages(prev => [...prev, { from: userEmail, text: message, file: data.file, timestamp: data.timestamp }]);
        setMessage("");
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("send-message", data);
      setMessages(prev => [...prev, { from: userEmail, text: message, timestamp: data.timestamp }]);
      setMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Welcome, {userName}</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              socket.emit("user-offline", userEmail);
              socket.disconnect();
              navigate("/", { replace: true });
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Log Out
          </button>
          {selectedUser && (
            <button
              onClick={handleCloseSession}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ffc107",
                color: "#000",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Close Session
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div style={{ backgroundColor: "#e9ecef", padding: "10px", borderRadius: "5px", marginBottom: "15px" }}>
          {notification}
          {notification.includes("Connection request received") && (
            <button onClick={handleAcceptConnection} style={{ marginLeft: "10px", padding: "5px 10px" }}>
              Accept
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Online Users:</h3>
          {onlineUsers.length === 0 ? (
            <p>No users are currently online.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {onlineUsers.map((user, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    padding: "10px",
                    backgroundColor: selectedUser === user ? "#cce5ff" : "#f0f0f0",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  {user}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 2 }}>
          {selectedUser && sessionStarted ? (
            <>
              <h3>Chat with {selectedUser}</h3>
              <div style={{
                height: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9"
              }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.from === userEmail ? "flex-end" : "flex-start",
                      marginBottom: "15px"
                    }}
                  >
                    <div style={{
                      backgroundColor: msg.from === userEmail ? "#dcf8c6" : "#ffffff",
                      padding: "10px",
                      borderRadius: "15px",
                      maxWidth: "75%",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      wordWrap: "break-word"
                    }}>
                      {msg.text}
                      {msg.file && (
                        <div style={{ marginTop: "5px" }}>
                          <a
                            href={msg.file.content}
                            download={msg.file.name}
                            style={{ color: "#007bff", textDecoration: "underline" }}
                          >
                            Download {msg.file.name}
                          </a>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  value={message}
                  placeholder="Type your message..."
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button onClick={handleSend} style={{ padding: "10px 20px", cursor: "pointer" }}>Send</button>
              </div>
            </>
          ) : (
            <h4>Select a user to start chatting</h4>
          )}
        </div>
      </div>
    </div>
  );
}
