import { useState, useEffect } from 'react';
import { fetchPokemonList, fetchPokemonDetail, fetchPokemonsByType } from '../api/pokeApi';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import TypeFilter from '../components/TypeFilter';
import { useFavorites } from '../hooks/useFavorites';
import { Search, ArrowUpDown } from 'lucide-react';
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
  
  const [allPokemonsList, setAllPokemonsList] = useState([]);
  const [typeFilteredList, setTypeFilteredList] = useState([]); 
  
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  
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
          setAllPokemonsList(data.results);
          list = data.results;
        } else {
          list = allPokemonsList;
        }
      } else {
        if (reset) {
          list = await fetchPokemonsByType(selectedType);
          setTypeFilteredList(list);
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
  }, [selectedType, sortOrder]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSelectedType('all');
      loadPokemons(true);
      return;
    }
    
    setLoading(true);
    setSearchError('');
    try {
      const data = await fetchPokemonDetail(searchTerm.toLowerCase().trim());
      setPokemons([data]);
      setHasMore(false);
      setSelectedType('all'); 
    } catch (err) {
      setPokemons([]);
      setSearchError('해당 포켓몬을 찾을 수 없습니다. 이름(영어)이나 번호를 확인해주세요.');
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
            placeholder="이름(영어)이나 번호로 검색 (예: pikachu, 25)" 
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
            </select>
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
    </div>
  );
}

export default Home;
