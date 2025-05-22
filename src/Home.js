import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";

let socket;

export default function Home() {
  const location = useLocation();
  const userName = location.state?.name;
  const userEmail = location.state?.email;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sessionsStarted, setSessionsStarted] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userEmail) {
      navigate("/", { replace: true });
      return;
    }

    const socketServerURL =
      window.location.hostname === "localhost"
        ? "http://localhost:8081"
        : `http://${window.location.hostname}:8081`;

    socket = io(socketServerURL);

    socket.emit("user-online", userEmail);

    socket.on("update-user-list", (users) => {
      setOnlineUsers(users.filter((email) => email !== userEmail));
    });

    socket.on("receive-message", ({ from, text, file, timestamp }) => {
      setMessages((prev) => [...prev, { from, text, file, timestamp }]);
    });

    socket.on("connection-request", ({ from }) => {
      setNotifications((prev) => [...prev, { type: "request", from }]);
    });

    socket.on("session-started", ({ from }) => {
      setSessionsStarted((prev) => ({ ...prev, [from]: true }));
      setNotifications((prev) => [
        ...prev.filter((n) => !(n.type === "waiting" && n.to === from)),
        { type: "started", from },
      ]);
    });

    socket.on("session-ended", ({ from }) => {
      setSessionsStarted((prev) => {
        const copy = { ...prev };
        delete copy[from];
        return copy;
      });
      setNotifications((prev) => prev.filter((n) => n.from !== from));
      setMessages((prev) => prev.filter((msg) => msg.from !== from));
      setSelectedUsers((prev) => prev.filter((u) => u !== from));
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [userEmail, navigate]);

  const toggleSelectUser = (user) => {
    if (selectedUsers.includes(user)) {
      if (sessionsStarted[user]) handleCloseSession(user);
      setSelectedUsers((prev) => prev.filter((u) => u !== user));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
      setNotifications((prev) => [...prev, { type: "waiting", to: user }]);
      socket.emit("connection-request", { from: userEmail, to: user });
    }
  };

  const handleAcceptConnection = (fromUser) => {
    setNotifications((prev) =>
      prev.filter((n) => !(n.type === "request" && n.from === fromUser))
    );
    setSessionsStarted((prev) => ({ ...prev, [fromUser]: true }));
    if (!selectedUsers.includes(fromUser))
      setSelectedUsers((prev) => [...prev, fromUser]);
    socket.emit("session-started", { from: userEmail, to: fromUser });
    setNotifications((prev) => [...prev, { type: "started", from: fromUser }]);
  };

  const handleCloseSession = (user) => {
    socket.emit("session-ended", { from: userEmail, to: user });
    setSessionsStarted((prev) => {
      const copy = { ...prev };
      delete copy[user];
      return copy;
    });
    setSelectedUsers((prev) => prev.filter((u) => u !== user));
    setMessages((prev) => prev.filter((msg) => msg.from !== user));
    setNotifications((prev) => prev.filter((n) => n.from !== user));
  };

  const handleSend = () => {
    if (selectedUsers.length === 0 || (!message && !file)) return;
    const activeUsers = selectedUsers.filter((u) => sessionsStarted[u]);
    if (activeUsers.length === 0) return;
    const timestamp = Date.now();

    const sendToUser = (to) => {
      const data = {
        to,
        text: message,
        file: file
          ? { name: file.name, type: file.type, content: "" }
          : null,
        timestamp,
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          data.file.content = reader.result;
          socket.emit("send-message", data);
        };
        reader.readAsDataURL(file);
      } else {
        socket.emit("send-message", data);
      }
    };

    activeUsers.forEach(sendToUser);
    setMessages((prev) => [
      ...prev,
      {
        from: userEmail,
        text: message,
        file: file
          ? {
              name: file.name,
              type: file.type,
              content: file ? URL.createObjectURL(file) : null,
            }
          : null,
        timestamp,
      },
    ]);
    setMessage("");
    setFile(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredUsers = onlineUsers.filter((user) =>
    user.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        maxWidth: isMobile ? "100%" : "900px",
        margin: "0 auto",
        padding: isMobile ? "15px" : "30px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Welcome, {userName}</h2>
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
            cursor: "pointer",
            marginTop: isMobile ? "10px" : 0,
          }}
        >
          Log Out
        </button>
      </div>

      {notifications.map((note, idx) =>
        note.type === "request" ? (
          <div
            key={idx}
            style={{
              backgroundColor: "#e9ecef",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            Connection request from {note.from}
            <button
              onClick={() => handleAcceptConnection(note.from)}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              Accept
            </button>
          </div>
        ) : note.type === "waiting" ? (
          <div
            key={idx}
            style={{
              backgroundColor: "#fff3cd",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            Waiting for {note.to} to accept chat...
          </div>
        ) : note.type === "started" ? (
          <div
            key={idx}
            style={{
              backgroundColor: "#d4edda",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            Chat session started with {note.from}
          </div>
        ) : null
      )}

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "10px",
            height: "70vh",
            overflowY: "auto",
          }}
        >
          <h3>Online Users</h3>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          {filteredUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {filteredUsers.map((user, index) => (
                <li
                  key={index}
                  onClick={() => toggleSelectUser(user)}
                  style={{
                    padding: "10px",
                    backgroundColor: selectedUsers.includes(user)
                      ? "#cce5ff"
                      : "#f0f0f0",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {user}
                  {sessionsStarted[user] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseSession(user);
                      }}
                      style={{
                        marginLeft: "10px",
                        padding: "3px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                      }}
                    >
                      Close Session
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "10px",
            height: "70vh",
          }}
        >
          <h3>Chat</h3>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#777" }}>No messages yet</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "12px",
                    textAlign: msg.from === userEmail ? "right" : "left",
                  }}
                >
                  <strong>{msg.from === userEmail ? "You" : msg.from}</strong>
                  <p
                    style={{
                      margin: "5px 0",
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      backgroundColor:
                        msg.from === userEmail ? "#d1e7dd" : "#f8d7da",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.text}
                    {msg.file && (
                      <div style={{ marginTop: "6px" }}>
                        <a
                          href={msg.file.content}
                          download={msg.file.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0d6efd" }}
                        >
                          📎 {msg.file.name}
                        </a>
                      </div>
                    )}
                  </p>
                  <div style={{ fontSize: "10px", color: "#666" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ padding: "6px" }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "8px 16px",
                backgroundColor: "#198754",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
