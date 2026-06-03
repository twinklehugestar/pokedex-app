import { useState, useEffect, useRef } from 'react';
import { X, Heart, Play, Activity, Image as ImageIcon } from 'lucide-react';
import { fetchPokemonSpecies, fetchEvolutionChain, typeMapKo, statMapKo } from '../api/pokeApi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './PokemonModal.css';

function PokemonModal({ pokemon, onClose, isFavorite, onToggleFavorite, onNavigateToPokemon }) {
  const [species, setSpecies] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [koreanName, setKoreanName] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Clear audio cache on pokemon change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Fetch species and evolution
    fetchPokemonSpecies(pokemon.id).then(async (speciesData) => {
      setSpecies(speciesData);
      
      const koNameEntry = speciesData.names.find(n => n.language.name === 'ko');
      setKoreanName(koNameEntry ? koNameEntry.name : pokemon.name);

      if (speciesData.evolution_chain?.url) {
        fetchEvolutionChain(speciesData.evolution_chain.url).then(async (evoData) => {
          const evos = await getEvolutions(evoData.chain);
          setEvolution(evos);
        });
      }
    });

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [pokemon.id]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    } else {
      const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`);
      audioRef.current = audio;
      audio.play();
    }
  };

  const getEvolutions = async (chain) => {
    let evos = [];
    let current = chain;
    while (current) {
      const id = current.species.url.split('/').filter(Boolean).pop();
      evos.push({
        name: current.species.name,
        id: id,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      });
      current = current.evolves_to[0]; 
    }
    
    const evosWithKo = await Promise.all(evos.map(async (evo) => {
      try {
        const spData = await fetchPokemonSpecies(evo.id);
        const koName = spData.names.find(n => n.language.name === 'ko');
        if (koName) evo.name = koName.name;
      } catch (e) {}
      return evo;
    }));
    return evosWithKo;
  };

  const mainType = pokemon.types[0].type.name;
  
  const hasAnimatedSprite = !!pokemon.sprites?.other?.showdown?.front_default;
  const imageUrl = isAnimated && hasAnimatedSprite
    ? pokemon.sprites.other.showdown.front_default
    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  const statData = pokemon.stats.map(s => ({
    subject: statMapKo[s.stat.name] || s.stat.name,
    A: s.base_stat,
    fullMark: 255,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content type-bg-${mainType} glass-panel`} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <div className="modal-title">
            <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
            <h2 className="pokemon-name">{koreanName || pokemon.name}</h2>
          </div>
          <div className="modal-actions">
            {hasAnimatedSprite && (
              <button 
                className={`action-btn ${isAnimated ? 'active' : ''}`} 
                onClick={() => setIsAnimated(!isAnimated)} 
                title="Toggle Animation"
              >
                <ImageIcon size={24} color={isAnimated ? 'var(--neon-cyan)' : 'var(--text-secondary)'} />
              </button>
            )}
            <button className="action-btn" onClick={playAudio} title="울음소리 재생">
              <Play size={24} color="var(--neon-cyan)" />
            </button>
            <button className={`action-btn fav-btn ${isFavorite ? 'active' : ''}`} onClick={onToggleFavorite} title="즐겨찾기">
              <Heart fill={isFavorite ? 'var(--neon-pink)' : 'none'} color={isFavorite ? 'var(--neon-pink)' : 'var(--text-primary)'} size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="pokemon-showcase">
            <div className={`showcase-glow type-${mainType}`}></div>
            <img 
              src={imageUrl} 
              alt={koreanName || pokemon.name} 
              className={`showcase-image ${isAnimated ? 'pixel-art' : ''}`} 
            />
            <div className="pokemon-types modal-types">
              {pokemon.types.map(t => (
                <span key={t.type.name} className={`type-badge type-${t.type.name}`}>
                  {typeMapKo[t.type.name] || t.type.name}
                </span>
              ))}
            </div>
            
            <div className="physical-stats">
              <div className="stat-box">
                <span className="stat-label">키</span>
                <span className="stat-value">{pokemon.height / 10} m</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">몸무게</span>
                <span className="stat-value">{pokemon.weight / 10} kg</span>
              </div>
            </div>
          </div>

          <div className="pokemon-details">
            <div className="stats-container">
              <h3 className="section-title"><Activity size={18}/> 종족치 (스탯)</h3>
              <div className="stats-radar">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={statData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 255]} tick={false} axisLine={false} />
                    <Radar name="Stats" dataKey="A" stroke={`var(--type-${mainType})`} fill={`var(--type-${mainType})`} fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {evolution.length > 1 && (
              <div className="evolution-container">
                <h3 className="section-title">진화 트리</h3>
                <div className="evolution-chain">
                  {evolution.map((evo, index) => (
                    <div key={evo.id} className="evo-step">
                      <div className="evo-image-wrapper" onClick={() => onNavigateToPokemon && onNavigateToPokemon(evo.id)}>
                        <img src={evo.image} alt={evo.name} className="evo-image clickable" />
                      </div>
                      <span className="evo-name clickable-text" onClick={() => onNavigateToPokemon && onNavigateToPokemon(evo.id)}>
                        {evo.name}
                      </span>
                      {index < evolution.length - 1 && <div className="evo-arrow">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;
