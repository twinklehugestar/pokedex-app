import { useState } from 'react';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import { useFavorites } from '../hooks/useFavorites';
import './Favorites.css';

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1 className="text-gradient">My Favorites</h1>
        <p className="subtitle">You have {favorites.length} favorite pokemons saved.</p>
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
