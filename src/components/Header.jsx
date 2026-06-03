import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Home } from 'lucide-react';
import './Header.css';

function Header() {
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('reset-home'));
    }
  };

  return (
    <header className="header glass-panel">
      <div className="header-content">
        <Link to="/" className="logo" onClick={handleHomeClick}>
          <span className="text-gradient">Pokedex</span>
        </Link>
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/favorites" className={`nav-item ${location.pathname === '/favorites' ? 'active' : ''}`}>
            <Heart size={20} />
            <span>Favorites</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
