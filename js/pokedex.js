/* pokedex.js — Página Pokédex: carrega os 30 Pokémon, busca e filtro por tipo. */
(() => {
  const TOTAL = 30;
  const campoBusca = document.getElementById("busca");
  const campoTipo = document.getElementById("tipo");
  const formulario = document.getElementById("filtros");
  const resumo = document.getElementById("resumo");
  const grade = document.getElementById("grade");
  const carregando = document.getElementById("carregando");
  const erro = document.getElementById("erro");
  const semResultados = document.getElementById("sem-resultados");
  let pokemons = [];

  Componentes.iniciar();

  function mostrarEstado(estado) {
    carregando.hidden = estado !== "carregando";
    erro.hidden = estado !== "erro";
    formulario.hidden = estado !== "pronto";
    if (estado !== "pronto") {
      grade.replaceChildren();
      semResultados.hidden = true;
      resumo.textContent = "";
    }
  }

  async function carregar() {
    mostrarEstado("carregando");
    try {
      pokemons = await PokeAPI.listarPokemon(TOTAL, 0);
      preencherTipos();
      mostrarEstado("pronto");
      aplicarFiltros();
    } catch (falha) {
      console.error(falha);
      mostrarEstado("erro");
    }
  }

  // O filtro só lista os tipos que existem nos Pokémon carregados.
  function preencherTipos() {
    const tipos = [...new Set(pokemons.flatMap((p) => p.tipos))].sort((a, b) =>
      Componentes.nomeDoTipo(a).localeCompare(Componentes.nomeDoTipo(b), "pt-BR")
    );
    campoTipo.replaceChildren(new Option("Todos os tipos", ""));
    for (const tipo of tipos) campoTipo.append(new Option(Componentes.nomeDoTipo(tipo), tipo));
  }

  function filtrar() {
    const termo = campoBusca.value.trim().toLowerCase().replace(/^#/, "");
    const tipo = campoTipo.value;
    return pokemons.filter((p) => {
      const passaNoTipo = !tipo || p.tipos.includes(tipo);
      // Só números: compara com o número do Pokémon. Texto: procura dentro do nome.
      const passaNaBusca = !termo || (/^\d+$/.test(termo) ? p.id === Number(termo) : p.nome.includes(termo));
      return passaNoTipo && passaNaBusca;
    });
  }

  function aplicarFiltros() {
    const resultado = filtrar();
    grade.replaceChildren(...resultado.map((p) => Componentes.criarCard(p)));
    semResultados.hidden = resultado.length > 0;
    resumo.textContent = `Mostrando ${resultado.length} de ${pokemons.length} Pokémon`;
  }

  function limparFiltros() {
    campoBusca.value = "";
    campoTipo.value = "";
    aplicarFiltros();
    campoBusca.focus();
  }

  formulario.addEventListener("submit", (evento) => evento.preventDefault());
  campoBusca.addEventListener("input", aplicarFiltros);
  campoTipo.addEventListener("change", aplicarFiltros);
  document.getElementById("limpar-filtros").addEventListener("click", limparFiltros);
  document.getElementById("tentar-novamente").addEventListener("click", carregar);

  carregar();
})();
