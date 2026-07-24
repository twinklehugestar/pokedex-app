import { useState } from 'react';
import { Grid, List } from 'lucide-react';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import { useFavorites } from '../hooks/useFavorites';
import './Favorites.css';

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1 className="text-gradient">My Favorites</h1>
        <p className="subtitle">You have {favorites.length} favorite pokemons saved.</p>
        
        {favorites.length > 0 && (
          <div className="view-sort-row">
            <div className="view-mode-toggle glass-panel">
              <button 
                type="button"
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
                title="그리드 뷰"
              >
                <Grid size={18} color={viewMode === 'grid' ? "var(--neon-cyan)" : "var(--text-secondary)"} />
              </button>
              <button 
                type="button"
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title="리스트 뷰"
              >
                <List size={18} color={viewMode === 'list' ? "var(--neon-cyan)" : "var(--text-secondary)"} />
              </button>
            </div>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state glass-panel">
          <h2>No favorites yet!</h2>
          <p>Go back to the home page and click the heart icon on your favorite pokemons to save them here.</p>
        </div>
      ) : (
        <PokemonGrid 
          pokemons={favorites}
          loading={false}
          hasMore={false}
          onPokemonClick={setSelectedPokemon}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          viewMode={viewMode}
        />
      )}

      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)}
          isFavorite={favorites.some(p => p.id === selectedPokemon.id)}
          onToggleFavorite={() => toggleFavorite(selectedPokemon)}
        />
      )}
    </div>
  );
}

export default Favorites;
