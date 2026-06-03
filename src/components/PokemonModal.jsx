import { useState, useEffect, useRef } from 'react';
import { X, Heart, Play, Activity, Image as ImageIcon } from 'lucide-react';
import { fetchPokemonSpecies, fetchEvolutionChain, typeMapKo, statMapKo } from '../api/pokeApi';
import pokemonNamesKo from '../api/pokemonNamesKo.json';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './PokemonModal.css';

function PokemonModal({ pokemon, onClose, isFavorite, onToggleFavorite, onNavigateToPokemon }) {
  const [species, setSpecies] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [koreanName, setKoreanName] = useState(() => {
    return pokemonNamesKo[pokemon.id] || pokemonNamesKo[pokemon.name] || pokemon.name;
  });
  const [isAnimated, setIsAnimated] = useState(() => {
    const saved = localStorage.getItem('pokedex_animate_default');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const audioRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Clear audio cache on pokemon change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Update Korean name instantly
    setKoreanName(pokemonNamesKo[pokemon.id] || pokemonNamesKo[pokemon.name] || pokemon.name);
    
    // Fetch species and evolution
    fetchPokemonSpecies(pokemon.id).then(async (speciesData) => {
      setSpecies(speciesData);

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

  const playAudio = (type) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    let cryUrl = null;
    if (pokemon.cries) {
      cryUrl = type === 'latest' ? pokemon.cries.latest : pokemon.cries.legacy;
    }
    
    // Fallback for latest if cries object doesn't exist
    if (!cryUrl && type === 'latest') {
      cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    }
    
    if (cryUrl) {
      const audio = new Audio(cryUrl);
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
    
    const evosWithKo = evos.map((evo) => {
      const koName = pokemonNamesKo[evo.id] || pokemonNamesKo[evo.name];
      if (koName) evo.name = koName;
      return evo;
    });
    return evosWithKo;
  };

  const getKoreanFlavorText = () => {
    if (!species) return '포켓몬 설명을 불러오는 중입니다...';
    const koEntry = species.flavor_text_entries?.find(e => e.language.name === 'ko');
    if (koEntry) {
      return koEntry.flavor_text.replace(/[\f\n\r\t]/g, ' ').trim();
    }
    const enEntry = species.flavor_text_entries?.find(e => e.language.name === 'en');
    return enEntry ? enEntry.flavor_text.replace(/[\f\n\r\t]/g, ' ').trim() : '이 포켓몬에 대한 설명이 없습니다.';
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
                onClick={() => {
                  const nextVal = !isAnimated;
                  setIsAnimated(nextVal);
                  localStorage.setItem('pokedex_animate_default', JSON.stringify(nextVal));
                }} 
                title="Toggle Animation"
              >
                <ImageIcon size={24} color={isAnimated ? 'var(--neon-cyan)' : 'var(--text-secondary)'} />
              </button>
            )}
            {(!pokemon.cries || pokemon.cries.latest) && (
              <button className="action-btn cry-btn" onClick={() => playAudio('latest')} title="최신 울음소리 재생">
                <Play size={16} color="var(--neon-cyan)" fill="var(--neon-cyan)" />
                <span className="cry-label">최신</span>
              </button>
            )}
            {pokemon.cries?.legacy && (
              <button className="action-btn cry-btn" onClick={() => playAudio('legacy')} title="클래식 울음소리 재생">
                <Play size={16} color="var(--neon-pink)" fill="var(--neon-pink)" />
                <span className="cry-label">클래식</span>
              </button>
            )}
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
            <div className="description-container glass-panel">
              <p className="pokemon-description">{getKoreanFlavorText()}</p>
            </div>

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
