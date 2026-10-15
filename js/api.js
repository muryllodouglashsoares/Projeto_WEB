/* api.js — Comunicação com a PokéAPI (https://pokeapi.co). */
const PokeAPI = (() => {
  const URL_BASE = "https://pokeapi.co/api/v2";
  const cache = new Map(); // id -> Pokémon já consultado (evita pedir de novo)

  async function buscarJson(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`A PokéAPI respondeu com o status ${resposta.status}.`);
    return resposta.json();
  }

  // Converte a resposta grande da API em um objeto simples, só com o que o site usa.
  function normalizar(dados) {
    const arte = dados.sprites?.other?.["official-artwork"]?.front_default;
    return {
      id: dados.id,
      nome: dados.name,
      imagem: arte || dados.sprites?.front_default || "",
      tipos: [...dados.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      altura: dados.height / 10, // a API usa decímetros -> metros
      peso: dados.weight / 10, // a API usa hectogramas -> quilogramas
      habilidades: dados.abilities.map((h) => ({ nome: h.ability.name, oculta: h.is_hidden })),
      estatisticas: dados.stats.map((s) => ({ nome: s.stat.name, valor: s.base_stat })),
    };
  }

  // Consulta os detalhes usando a URL retornada pela listagem.
  async function buscarDetalhes(url) {
    const pokemon = normalizar(await buscarJson(url));
    cache.set(pokemon.id, pokemon);
    return pokemon;
  }

  // Lista os Pokémon e depois consulta os detalhes de cada um, ordenados pelo número.
  async function listarPokemon(limite = 30, inicio = 0) {
    const lista = await buscarJson(`${URL_BASE}/pokemon?limit=${limite}&offset=${inicio}`);
    const detalhes = await Promise.all(lista.results.map((item) => buscarDetalhes(item.url)));
    return detalhes.sort((a, b) => a.id - b.id);
  }

  // Usada pelo modal. Se o Pokémon já foi carregado, não faz nova requisição.
  async function buscarPorId(id) {
    if (cache.has(id)) return cache.get(id);
    return buscarDetalhes(`${URL_BASE}/pokemon/${id}`);
  }

  return { listarPokemon, buscarPorId };
})();
