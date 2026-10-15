/* favoritos-pagina.js — Página Favoritos: mostra os Pokémon salvos no navegador. */
(() => {
  const grade = document.getElementById("grade");
  const vazio = document.getElementById("vazio");
  const contador = document.getElementById("contador");
  const titulo = document.getElementById("titulo");

  Componentes.iniciar();

  function renderizar() {
    const tinhaFocoNaLista = grade.contains(document.activeElement);
    const lista = Favoritos.listar().sort((a, b) => a.id - b.id);

    contador.textContent = lista.length === 1 ? "1 Pokémon favorito" : `${lista.length} Pokémon favoritos`;
    grade.replaceChildren(...lista.map((p) => Componentes.criarCard(p)));
    grade.hidden = lista.length === 0;
    vazio.hidden = lista.length > 0;

    // Se o card focado foi removido, leva o foco ao título para não "perder" o teclado.
    if (tinhaFocoNaLista) titulo.focus();
  }

  Favoritos.aoMudar(renderizar);
  renderizar();
})();
