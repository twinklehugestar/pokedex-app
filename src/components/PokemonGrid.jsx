import PokemonCard from './PokemonCard';
import './PokemonGrid.css';

function PokemonGrid({ pokemons, loading, onLoadMore, hasMore, onPokemonClick, favorites, toggleFavorite, viewMode = 'grid' }) {
  return (
    <div className="pokemon-grid-container">
      <div className={`pokemon-grid ${viewMode === 'list' ? 'pokemon-list' : ''}`}>
        {pokemons.map((pokemon, index) => (
          <PokemonCard 
            key={`${pokemon.name}-${index}`} 
            pokemon={pokemon} 
            onClick={onPokemonClick}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            viewMode={viewMode}
          />
        ))}
      </div>
      
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {!loading && hasMore && onLoadMore && (
        <div className="load-more-container">
          <button className="load-more-btn glass-panel" onClick={onLoadMore}>
            Load More Pokemons
          </button>
        </div>
      )}
    </div>
  );
}

export default PokemonGrid;
