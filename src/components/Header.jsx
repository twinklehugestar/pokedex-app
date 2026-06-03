import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Home } from 'lucide-react';
import './Header.css';

function Header() {
  const location = useLocation();

  return (
    <header className="header glass-panel">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="text-gradient">Pokedex</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
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
