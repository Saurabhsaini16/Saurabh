import React from 'react';

export default function Footer() {
  const footerStyle = {
    backgroundColor: '#343a40',
    color: '#ffffff',
    padding: '1rem 0',
    textAlign: 'center',
    width: '100%',
    fontSize: '1rem',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.2)',
    position: 'relative', 
    bottom: 0,
    left: 0,
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; 2025 Peer-2-Peer Sharing</p>
    </footer>
  );
}
