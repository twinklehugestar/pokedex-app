import { useState, useEffect } from 'react';
import { fetchPokemonList, fetchPokemonDetail, fetchPokemonsByType } from '../api/pokeApi';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import TypeFilter from '../components/TypeFilter';
import { useFavorites } from '../hooks/useFavorites';
import pokemonNamesKo from '../api/pokemonNamesKo.json';
import pokemonStats from '../api/pokemonStats.json';
import { Search, ArrowUpDown, ArrowUp, Grid2X2, List } from 'lucide-react';
import './Home.css';

const getId = (url) => parseInt(url.split('/').filter(Boolean).pop(), 10);

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('id_asc');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid');
  
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const [allPokemonsList, setAllPokemonsList] = useState([]);
  const [typeFilteredList, setTypeFilteredList] = useState([]); 
  
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [resetCount, setResetCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { favorites, toggleFavorite } = useFavorites();

  const loadPokemons = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setSearchError('');
    try {
      const currentOffset = reset ? 0 : offset;
      let list = [];

      if (selectedType === 'all') {
        if (allPokemonsList.length === 0) {
          const data = await fetchPokemonList(10000, 0);
          const filtered = data.results.filter(p => getId(p.url) < 10000);
          setAllPokemonsList(filtered);
          list = filtered;
        } else {
          list = allPokemonsList;
        }
      } else {
        if (reset) {
          const typeList = await fetchPokemonsByType(selectedType);
          const filtered = typeList.filter(p => getId(p.url) < 10000);
          setTypeFilteredList(filtered);
          list = filtered;
        } else {
          list = typeFilteredList;
        }
      }

      // Apply sorting
      let sortedList = [...list];
      if (sortOrder === 'id_asc') {
        sortedList.sort((a, b) => getId(a.url) - getId(b.url));
      } else if (sortOrder === 'id_desc') {
        sortedList.sort((a, b) => getId(b.url) - getId(a.url));
      } else if (sortOrder === 'name_asc') {
        sortedList.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOrder === 'name_desc') {
        sortedList.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOrder.startsWith('stat_')) {
        const getStatValue = (item, order) => {
          const id = getId(item.url);
          const stats = pokemonStats[id] || [0, 0, 0, 0, 0, 0];
          
          if (order === 'stat_hp_desc') return stats[0];
          if (order === 'stat_atk_desc') return stats[1];
          if (order === 'stat_def_desc') return stats[2];
          if (order === 'stat_spatk_desc') return stats[3];
          if (order === 'stat_spdef_desc') return stats[4];
          if (order === 'stat_spd_desc') return stats[5];
          if (order === 'stat_total_desc') return stats.reduce((sum, val) => sum + val, 0);
          return 0;
        };
        sortedList.sort((a, b) => getStatValue(b, sortOrder) - getStatValue(a, sortOrder));
      }

      const nextBatch = sortedList.slice(currentOffset, currentOffset + 20);
      
      if (reset) {
        setPokemons(nextBatch);
      } else {
        setPokemons(prev => [...prev, ...nextBatch]);
      }
      
      setOffset(currentOffset + 20);
      setHasMore(currentOffset + 20 < sortedList.length);
      
    } catch (err) {
      console.error(err);
      if (reset) setPokemons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemons(true);
  }, [selectedType, sortOrder, resetCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setSearchTerm('');
      setSelectedType('all');
      setSortOrder('id_asc');
      setResetCount(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.addEventListener('reset-home', handleReset);
    return () => window.removeEventListener('reset-home', handleReset);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setSelectedType('all');
      loadPokemons(true);
      return;
    }
    
    setLoading(true);
    setSearchError('');
    try {
      const englishName = pokemonNamesKo[query];
      const searchTarget = (englishName && /^[a-z0-9-]+$/.test(englishName))
        ? englishName
        : query.toLowerCase();
      
      const data = await fetchPokemonDetail(searchTarget);
      setPokemons([data]);
      setHasMore(false);
      setSelectedType('all'); 
    } catch (err) {
      setPokemons([]);
      setSearchError('해당 포켓몬을 찾을 수 없습니다. 이름이나 번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-bar glass-panel">
          <Search color="var(--text-secondary)" size={20} />
          <input 
            type="text" 
            placeholder="이름(한글/영어)이나 번호로 검색 (예: 피카츄, 25)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">검색</button>
        </form>
        {searchError && <p className="error-text">{searchError}</p>}
      </div>

      {!searchTerm && (
        <div className="filter-sort-section">
          <TypeFilter 
            selectedType={selectedType} 
            onSelectType={(type) => {
              setSearchTerm('');
              setSelectedType(type);
            }} 
          />
          <div className="list-controls">
            <div className="sort-container glass-panel">
              <ArrowUpDown size={16} color="var(--text-secondary)" />
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="sort-select"
              >
                <option value="id_asc">번호 오름차순</option>
                <option value="id_desc">번호 내림차순</option>
                <option value="name_asc">알파벳 오름차순</option>
                <option value="name_desc">알파벳 내림차순</option>
                <option value="stat_total_desc">종합 능력치 높은 순</option>
                <option value="stat_hp_desc">체력 높은 순</option>
                <option value="stat_atk_desc">공격력 높은 순</option>
                <option value="stat_def_desc">방어력 높은 순</option>
                <option value="stat_spatk_desc">특수공격 높은 순</option>
                <option value="stat_spdef_desc">특수방어 높은 순</option>
                <option value="stat_spd_desc">스피드 높은 순</option>
              </select>
            </div>
            <div className="view-toggle glass-panel" role="group" aria-label="목록 보기 방식">
              <button
                type="button"
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                aria-label="그리드형으로 보기"
                aria-pressed={viewMode === 'grid'}
                title="그리드형 보기"
              >
                <Grid2X2 size={18} />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                aria-label="목록형으로 보기"
                aria-pressed={viewMode === 'list'}
                title="목록형 보기"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <PokemonGrid 
        pokemons={pokemons}
        loading={loading}
        onLoadMore={() => loadPokemons(false)}
        hasMore={hasMore && !searchTerm}
        onPokemonClick={setSelectedPokemon}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        viewMode={viewMode}
      />

      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)}
          isFavorite={favorites.some(p => p.id === selectedPokemon.id)}
          onToggleFavorite={() => toggleFavorite(selectedPokemon)}
          onNavigateToPokemon={(newId) => {
            fetchPokemonDetail(newId).then(data => setSelectedPokemon(data));
          }}
        />
      )}

      {showScrollTop && (
        <button 
          className="scroll-top-btn glass-panel" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="맨 위로 이동"
        >
          <ArrowUp size={24} color="var(--neon-cyan)" />
        </button>
      )}
    </div>
  );
}

export default Home;
