/* componentes.js — Peças de interface compartilhadas: card, etiquetas de tipo e botão de coração. */
const Componentes = (() => {
  const TIPOS = {
    normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico", grass: "Planta", ice: "Gelo",
    fighting: "Lutador", poison: "Veneno", ground: "Terra", flying: "Voador", psychic: "Psíquico",
    bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
    steel: "Aço", fairy: "Fada",
  };
  const NS_SVG = "http://www.w3.org/2000/svg";

  function el(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  const tipoConhecido = (tipo) => Object.hasOwn(TIPOS, tipo);
  const nomeDoTipo = (tipo) => (tipoConhecido(tipo) ? TIPOS[tipo] : tipo);
  const formatarNumero = (id) => `#${String(id).padStart(3, "0")}`;
  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  function formatarNome(nome) {
    if (nome === "nidoran-f") return "Nidoran ♀";
    if (nome === "nidoran-m") return "Nidoran ♂";
    return nome.split("-").map(capitalizar).join("-");
  }

  function criarEtiquetaTipo(tipo) {
    const classe = tipoConhecido(tipo) ? `tipo tipo--${tipo}` : "tipo tipo--desconhecido";
    return el("li", classe, nomeDoTipo(tipo));
  }

  function criarListaTipos(tipos) {
    const lista = el("ul", "tipos");
    lista.setAttribute("aria-label", "Tipos");
    lista.append(...tipos.map(criarEtiquetaTipo));
    return lista;
  }

  function criarImagem(pokemon, classe) {
    const img = el("img", classe);
    img.dataset.nome = formatarNome(pokemon.nome); // usado pela imagem alternativa
    img.alt = `Ilustração de ${formatarNome(pokemon.nome)}`;
    img.loading = "lazy";
    img.decoding = "async";
    if (pokemon.imagem) img.src = pokemon.imagem;
    else Comum.usarImagemAlternativa(img);
    return img;
  }

  function criarIconeCoracao() {
    const svg = document.createElementNS(NS_SVG, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const caminho = document.createElementNS(NS_SVG, "path");
    caminho.setAttribute(
      "d",
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    );
    svg.append(caminho);
    return svg;
  }

  // Atualiza a aparência e a acessibilidade do botão conforme o estado atual salvo.
  function atualizarBotaoFavorito(botao) {
    const ativo = Favoritos.estaFavoritado(Number(botao.dataset.favoritoId));
    botao.classList.toggle("ativo", ativo);
    if (botao.dataset.comTexto === "sim") {
      // Botão com texto: o próprio texto já diz a ação.
      botao.querySelector(".rotulo").textContent = ativo ? "Remover dos favoritos" : "Adicionar aos favoritos";
    } else {
      // Botão só com coração: nome fixo + estado em aria-pressed.
      botao.setAttribute("aria-label", `Favoritar ${botao.dataset.nome}`);
      botao.setAttribute("aria-pressed", String(ativo));
      botao.title = ativo ? "Remover dos favoritos" : "Adicionar aos favoritos";
    }
  }

  function criarBotaoFavorito(pokemon, comTexto = false) {
    const botao = el("button", comTexto ? "btn btn--secundario btn-favorito-texto" : "btn-coracao");
    botao.type = "button";
    botao.dataset.favoritoId = pokemon.id;
    botao.dataset.nome = formatarNome(pokemon.nome);
    botao.dataset.comTexto = comTexto ? "sim" : "nao";
    botao.append(criarIconeCoracao());
    if (comTexto) botao.append(el("span", "rotulo"));

    botao.addEventListener("click", () => {
      const favoritou = Favoritos.alternar(pokemon); // dispara a atualização de todos os botões
      if (favoritou) {
        botao.classList.add("pulso");
        botao.addEventListener("animationend", () => botao.classList.remove("pulso"), { once: true });
      }
    });

    atualizarBotaoFavorito(botao);
    return botao;
  }

  // Card usado na Pokédex e em Favoritos. Funciona com dados da API ou do localStorage.
  function criarCard(pokemon) {
    const principal = tipoConhecido(pokemon.tipos[0]) ? pokemon.tipos[0] : "normal";
    const nome = formatarNome(pokemon.nome);
    const card = el("li", `card card--${principal}`);
    card.dataset.id = pokemon.id;

    const coracao = criarBotaoFavorito(pokemon);
    coracao.classList.add("card__coracao");

    const figura = el("div", "card__imagem");
    figura.append(criarImagem(pokemon));

    const detalhes = el("button", "btn btn--secundario btn--pequeno", "Ver detalhes");
    detalhes.type = "button";
    detalhes.dataset.detalhesId = pokemon.id;
    detalhes.setAttribute("aria-label", `Ver detalhes de ${nome}`);
    detalhes.addEventListener("click", () => Modal.abrir(pokemon.id, detalhes));

    card.append(
      coracao,
      figura,
      el("p", "card__numero", formatarNumero(pokemon.id)),
      el("h2", "card__nome", nome),
      criarListaTipos(pokemon.tipos),
      detalhes
    );
    return card;
  }

  function atualizarAviso() {
    let aviso = document.getElementById("aviso-armazenamento");
    if (Favoritos.persistenciaDisponivel()) {
      if (aviso) aviso.remove();
      return;
    }
    if (aviso) return;
    aviso = el(
      "div",
      "aviso container",
      "Atenção: o seu navegador não permite salvar dados neste site. Você pode favoritar durante esta visita, mas os favoritos não serão mantidos ao atualizar a página ou navegar."
    );
    aviso.id = "aviso-armazenamento";
    aviso.setAttribute("role", "alert");
    document.querySelector(".topo").after(aviso);
  }

  // Chamada pelas páginas que usam favoritos.
  function iniciar() {
    Favoritos.aoMudar(() => {
      document.querySelectorAll("[data-favorito-id]").forEach(atualizarBotaoFavorito);
      atualizarAviso();
    });
    atualizarAviso();
  }

  return {
    el, iniciar, criarCard, criarBotaoFavorito, criarImagem, criarListaTipos,
    formatarNome, formatarNumero, nomeDoTipo, tipoConhecido,
  };
})();
