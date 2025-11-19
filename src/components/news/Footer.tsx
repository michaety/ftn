import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="ftn-footer">
      <div className="ftn-container">
        <div className="ftn-footer-content">
          <p>&copy; {new Date().getFullYear()} Fishtank News. All rights reserved.</p>
          <div className="ftn-footer-links">
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
