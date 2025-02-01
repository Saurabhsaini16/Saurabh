import React from 'react'

export default function Footer() {
    let footersytle={
        position: "absolute",
        top:"100vh",
        width:"100%"
    }
  return (
    <footer className="bg-dark text-light py-3" sytle={footersytle}>
        <p className="text-center">Copyright &copy; Peer-2-peer Sharing</p>
    </footer>
  )
}
