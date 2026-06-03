import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { fetchPokemonDetail, typeMapKo } from '../api/pokeApi';
import pokemonNamesKo from '../api/pokemonNamesKo.json';
import './PokemonCard.css';

function PokemonCard({ pokemon, onClick, favorites, toggleFavorite }) {
  const [details, setDetails] = useState(null);
  const [koreanName, setKoreanName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        let pData = pokemon;
        if (!pokemon.id || !pokemon.types) {
          pData = await fetchPokemonDetail(pokemon.name);
        }
        
        if (isMounted) {
          setDetails(pData);
          const koName = pokemonNamesKo[pData.id] || pokemonNamesKo[pData.name] || pData.name;
          setKoreanName(koName);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [pokemon]);

  if (loading || !details) {
    return <div className="pokemon-card skeleton glass-panel"></div>;
  }

  const isFav = favorites.some(p => p.id === details.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    // We inject koreanName into the details before saving if needed, 
    // but saving details as is is fine. We can add koName.
    toggleFavorite({ ...details, koName: koreanName });
  };

  const mainType = details.types[0].type.name;

  return (
    <div className="pokemon-card glass-panel" onClick={() => onClick(details)}>
      <div className="card-header">
        <span className="pokemon-id">#{String(details.id).padStart(3, '0')}</span>
        <button className={`fav-btn ${isFav ? 'active' : ''}`} onClick={handleFavoriteClick}>
          <Heart fill={isFav ? 'var(--neon-pink)' : 'none'} color={isFav ? 'var(--neon-pink)' : 'var(--text-secondary)'} size={24} />
        </button>
      </div>
      <div className="card-image-container">
        <div className={`image-glow type-${mainType}`}></div>
        <img 
          src={details.sprites.other['official-artwork'].front_default || details.sprites.front_default} 
          alt={koreanName || details.name} 
          className="pokemon-image" 
          loading="lazy"
        />
      </div>
      <div className="card-info">
        <h3 className="pokemon-name">{koreanName || details.name}</h3>
        <div className="pokemon-types">
          {details.types.map(t => (
            <span key={t.type.name} className={`type-badge type-${t.type.name}`}>
              {typeMapKo[t.type.name] || t.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;
