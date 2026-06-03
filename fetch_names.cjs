const fs = require('fs');
const https = require('https');

const query = JSON.stringify({
  query: `query {
    pokemon_v2_pokemonspecies {
      name
      pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 3}}) {
        name
      }
    }
  }`
});

const options = {
  hostname: 'beta.pokeapi.co',
  path: '/graphql/v1beta',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const result = {};
      json.data.pokemon_v2_pokemonspecies.forEach(species => {
        const koNameObj = species.pokemon_v2_pokemonspeciesnames[0];
        if (koNameObj) {
          // Map Korean name -> English name
          result[koNameObj.name] = species.name;
        }
      });
      fs.writeFileSync('src/api/pokemonNamesKo.json', JSON.stringify(result, null, 2));
      console.log('Saved ' + Object.keys(result).length + ' names to src/api/pokemonNamesKo.json');
    } catch (e) {
      console.error(e);
      console.log(data);
    }
  });
});

req.on('error', console.error);
req.write(query);
req.end();
