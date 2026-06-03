const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon list');
  return response.json();
};

export const fetchPokemonDetail = async (idOrName) => {
  const response = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon detail');
  return response.json();
};

export const fetchPokemonSpecies = async (idOrName) => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${idOrName}`);
  if (!response.ok) throw new Error('Failed to fetch pokemon species');
  return response.json();
};

export const fetchEvolutionChain = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch evolution chain');
  return response.json();
};

export const fetchTypes = async () => {
  const response = await fetch(`${BASE_URL}/type`);
  if (!response.ok) throw new Error('Failed to fetch types');
  return response.json();
};

export const typeMapKo = {
  normal: '노말', fire: '불꽃', water: '물', electric: '전기', grass: '풀',
  ice: '얼음', fighting: '격투', poison: '독', ground: '땅', flying: '비행',
  psychic: '에스퍼', bug: '벌레', rock: '바위', ghost: '고스트', dragon: '드래곤',
  dark: '악', steel: '강철', fairy: '페어리'
};

export const statMapKo = {
  'hp': '체력',
  'attack': '공격',
  'defense': '방어',
  'special-attack': '특수공격',
  'special-defense': '특수방어',
  'speed': '스피드'
};

export const fetchPokemonsByType = async (type) => {
  const response = await fetch(`${BASE_URL}/type/${type}`);
  if (!response.ok) throw new Error('Failed to fetch type');
  const data = await response.json();
  return data.pokemon.map(p => p.pokemon);
};

