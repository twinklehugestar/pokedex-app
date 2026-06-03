import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('pokemon-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse favorites from local storage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (pokemon) => {
    setFavorites((prev) => {
      const isFav = prev.some((p) => p.id === pokemon.id);
      if (isFav) {
        return prev.filter((p) => p.id !== pokemon.id);
      } else {
        // Save necessary data to display in card and modal
        return [...prev, { 
          id: pokemon.id, 
          name: pokemon.name, 
          types: pokemon.types,
          sprites: pokemon.sprites,
          stats: pokemon.stats,
          height: pokemon.height,
          weight: pokemon.weight
        }];
      }
    });
  };

  const isFavorite = (id) => favorites.some((p) => p.id === id);

  return { favorites, toggleFavorite, isFavorite };
}
