import { typeMapKo } from '../api/pokeApi';
import './TypeFilter.css';

const types = Object.keys(typeMapKo);

function TypeFilter({ selectedType, onSelectType }) {
  return (
    <div className="type-filter-container glass-panel">
      <button 
        className={`type-filter-btn ${selectedType === 'all' ? 'active' : ''}`}
        onClick={() => onSelectType('all')}
      >
        전체
      </button>
      {types.map(type => (
        <button
          key={type}
          className={`type-filter-btn type-${type} ${selectedType === type ? 'active' : ''}`}
          onClick={() => onSelectType(type)}
        >
          {typeMapKo[type]}
        </button>
      ))}
    </div>
  );
}

export default TypeFilter;
