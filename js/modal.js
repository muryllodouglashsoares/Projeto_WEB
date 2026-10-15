/* modal.js — Janela de detalhes do Pokémon (usada na Pokédex e em Favoritos).
   Usa o elemento nativo <dialog>, que já bloqueia a página ao fundo e fecha com Escape.
   Acrescentamos: foco preso dentro da janela e devolução do foco ao botão de origem. */
const Modal = (() => {
  const NOMES_ESTATISTICAS = {
    hp: "HP", attack: "Ataque", defense: "Defesa",
    "special-attack": "Ataque especial", "special-defense": "Defesa especial", speed: "Velocidade",
  };
  const VALOR_MAXIMO_DA_BARRA = 150; // valor que preenche a barra por completo
  const FOCAVEIS = 'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const { el } = Componentes;

  let dialogo, corpo, botaoFechar;
  let origem = null; // botão que abriu o modal
  let origemId = null;
  let tentativa = 0; // ignora respostas antigas se o usuário fechar ou abrir outro Pokémon

  function criar() {
    if (dialogo) return;
    dialogo = el("dialog", "modal");
    dialogo.setAttribute("aria-label", "Detalhes do Pokémon");

    botaoFechar = el("button", "modal__fechar");
    botaoFechar.type = "button";
    botaoFechar.setAttribute("aria-label", "Fechar detalhes");
    botaoFechar.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    corpo = el("div", "modal__corpo");
    dialogo.append(botaoFechar, corpo);
    document.body.append(dialogo);

    botaoFechar.addEventListener("click", fechar);
    dialogo.addEventListener("click", (evento) => {
      if (evento.target === dialogo) fechar(); // clique no fundo escurecido
    });
    dialogo.addEventListener("keydown", prenderFoco);
    dialogo.addEventListener("close", aoFechar); // dispara com o botão, com Escape ou no fundo
  }

  function prenderFoco(evento) {
    if (evento.key !== "Tab") return;
    const itens = [...dialogo.querySelectorAll(FOCAVEIS)];
    if (!itens.length) return evento.preventDefault();
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function fechar() {
    if (dialogo && dialogo.open) dialogo.close();
  }

  function aoFechar() {
    tentativa++;
    document.body.classList.remove("modal-aberto");
    // Se o botão de origem saiu da tela (ex.: card removido), procura o equivalente ou usa o conteúdo.
    let alvo = origem;
    if (!alvo || !alvo.isConnected) {
      alvo = document.querySelector(`[data-detalhes-id="${origemId}"]`) || document.getElementById("conteudo");
    }
    if (alvo) alvo.focus();
  }

  function mostrarMensagem(texto, papel) {
    const mensagem = el("p", "modal__mensagem", texto);
    mensagem.setAttribute("role", papel);
    corpo.replaceChildren(mensagem);
    return mensagem;
  }

  function mostrarErro(id) {
    const mensagem = mostrarMensagem(
      "Não foi possível carregar os detalhes. Verifique sua conexão com a internet e tente novamente.",
      "alert"
    );
    const botao = el("button", "btn", "Tentar novamente");
    botao.type = "button";
    botao.addEventListener("click", () => abrir(id, origem));
    mensagem.after(botao);
  }

  function criarEstatisticas(estatisticas) {
    const lista = el("ul", "stats");
    for (const { nome, valor } of estatisticas) {
      const largura = Math.min((valor / VALOR_MAXIMO_DA_BARRA) * 100, 100);
      const barra = el("div", "stat__barra");
      barra.setAttribute("aria-hidden", "true"); // o valor numérico ao lado já informa o dado
      const preenchimento = el("div", "stat__preenchimento");
      preenchimento.style.setProperty("--largura", `${largura}%`);
      barra.append(preenchimento);

      const item = el("li", "stat");
      item.append(el("span", "stat__nome", NOMES_ESTATISTICAS[nome] || nome), el("strong", "stat__valor", valor), barra);
      lista.append(item);
    }
    return lista;
  }

  function criarMedida(rotulo, valor) {
    const bloco = el("div", "medida");
    bloco.append(el("dt", null, rotulo), el("dd", null, valor));
    return bloco;
  }

  function mostrarDetalhes(pokemon) {
    const nome = Componentes.formatarNome(pokemon.nome);
    const principal = Componentes.tipoConhecido(pokemon.tipos[0]) ? pokemon.tipos[0] : "normal";
    const numero = (valor, unidade) =>
      `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unidade}`;
    dialogo.setAttribute("aria-label", `Detalhes de ${nome}`);

    const topo = el("div", "detalhe__topo");
    topo.append(
      Componentes.criarImagem(pokemon, "detalhe__imagem"),
      el("p", "detalhe__numero", Componentes.formatarNumero(pokemon.id)),
      el("h2", "detalhe__nome", nome),
      Componentes.criarListaTipos(pokemon.tipos),
      Componentes.criarBotaoFavorito(pokemon, true)
    );

    const medidas = el("dl", "medidas");
    medidas.append(criarMedida("Altura", numero(pokemon.altura, "m")), criarMedida("Peso", numero(pokemon.peso, "kg")));

    const habilidades = el("ul", "chips");
    for (const habilidade of pokemon.habilidades) {
      const texto = habilidade.nome.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      habilidades.append(el("li", "chip", habilidade.oculta ? `${texto} (oculta)` : texto));
    }

    const conteudo = el("div", "detalhe__conteudo");
    const secao = (titulo, ...filhos) => {
      const bloco = el("section", "detalhe__secao");
      bloco.append(el("h3", null, titulo), ...filhos);
      return bloco;
    };
    conteudo.append(
      secao("Medidas", medidas),
      secao("Habilidades", habilidades),
      secao("Estatísticas base", criarEstatisticas(pokemon.estatisticas))
    );

    const detalhe = el("div", `detalhe detalhe--${principal}`);
    detalhe.append(topo, conteudo);
    corpo.replaceChildren(detalhe);
    corpo.scrollTop = 0;
  }

  async function abrir(id, botaoOrigem) {
    criar();
    origem = botaoOrigem || document.activeElement;
    origemId = id;
    const minhaTentativa = ++tentativa;

    mostrarMensagem("Carregando detalhes…", "status");
    if (!dialogo.open) {
      dialogo.showModal();
      document.body.classList.add("modal-aberto");
    }
    botaoFechar.focus();

    try {
      const pokemon = await PokeAPI.buscarPorId(id);
      if (minhaTentativa !== tentativa || !dialogo.open) return;
      mostrarDetalhes(pokemon);
    } catch (erro) {
      if (minhaTentativa !== tentativa || !dialogo.open) return;
      mostrarErro(id);
    }
  }

  return { abrir };
})();
