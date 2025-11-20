import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="ftn-footer">
      <div className="ftn-container">
        <div className="ftn-footer-content" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <p>All trademarks, images and logos are the property of their respective owners. | <a href="https://fishtank.live" target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>fishtank.live</a></p>
        </div>
      </div>
    </footer>
  );
};
