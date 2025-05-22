import React from 'react';
const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold fs-4" href="#">
          Peer-2-Peer Sharing
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <div className="d-flex gap-2">
            <a className="btn btn-outline-light" href="/">
              Login
            </a>
            <a className="btn btn-light text-primary" href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
