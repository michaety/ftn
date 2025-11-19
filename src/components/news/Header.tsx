import React from 'react';

interface HeaderProps {
  role?: 'admin' | 'editor' | 'public';
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ role = 'public', userName }) => {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="ftn-header">
      <div className="ftn-container">
        <div className="ftn-header-content">
          <h1 className="ftn-logo">
            <a href={role === 'admin' ? '/admin' : role === 'editor' ? '/editor' : '/'}>
              FISHTANK NEWS
            </a>
          </h1>
          
          <nav className="ftn-nav">
            {role === 'public' ? (
              <>
                <a href="/">Home</a>
                <a href="/login">Login</a>
              </>
            ) : (
              <>
                {role === 'admin' && (
                  <>
                    <a href="/admin">Dashboard</a>
                    <a href="/admin/articles">Articles</a>
                    <a href="/admin/users">Users</a>
                    <a href="/admin/invites">Invites</a>
                  </>
                )}
                {role === 'editor' && (
                  <>
                    <a href="/editor">Dashboard</a>
                    <a href="/editor/articles">My Articles</a>
                    <a href="/editor/new">New Article</a>
                  </>
                )}
                <span className="ftn-user">{userName}</span>
                <button onClick={handleLogout} className="ftn-logout-btn">Logout</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
