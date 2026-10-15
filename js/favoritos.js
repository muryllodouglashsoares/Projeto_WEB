/* favoritos.js — Salva e lê os favoritos no localStorage ("pokeexplorer:favoritos"). */
const Favoritos = (() => {
  const CHAVE = "pokeexplorer:favoritos";
  const EVENTO = "favoritos:mudou";
  let armazenamentoDisponivel = testarArmazenamento();
  let reserva = []; // só é usada se o localStorage estiver indisponível

  function testarArmazenamento() {
    try {
      localStorage.setItem("__teste__", "1");
      localStorage.removeItem("__teste__");
      return true;
    } catch (erro) {
      return false;
    }
  }

  // Valida um registro e devolve só os campos necessários (ou null se for inválido).
  function limparItem(item) {
    if (!item || typeof item !== "object") return null;
    const id = Number(item.id);
    if (!Number.isInteger(id) || id < 1) return null;
    if (typeof item.nome !== "string" || !item.nome.trim()) return null;
    return {
      id,
      nome: item.nome.trim(),
      imagem: typeof item.imagem === "string" && /^https?:\/\//.test(item.imagem) ? item.imagem : "",
      tipos: Array.isArray(item.tipos) ? item.tipos.filter((t) => typeof t === "string") : [],
    };
  }

  function listar() {
    if (!armazenamentoDisponivel) return reserva.slice();
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return [];
      const dados = JSON.parse(bruto);
      if (!Array.isArray(dados)) return [];
      const vistos = new Set(); // impede duplicados pelo ID
      const lista = [];
      for (const item of dados) {
        const valido = limparItem(item);
        if (valido && !vistos.has(valido.id)) {
          vistos.add(valido.id);
          lista.push(valido);
        }
      }
      return lista;
    } catch (erro) {
      return []; // JSON inválido: o site continua funcionando com a lista vazia
    }
  }

  function salvar(lista) {
    if (armazenamentoDisponivel) {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(lista));
        return;
      } catch (erro) {
        armazenamentoDisponivel = false; // ex.: navegador bloqueou ou não há espaço
      }
    }
    reserva = lista;
  }

  function notificar() {
    document.dispatchEvent(new CustomEvent(EVENTO));
  }

  function estaFavoritado(id) {
    return listar().some((item) => item.id === id);
  }

  // Adiciona se não existir, remove se já existir. Retorna true se ficou favoritado.
  function alternar(pokemon) {
    const lista = listar();
    const posicao = lista.findIndex((item) => item.id === pokemon.id);
    if (posicao >= 0) {
      lista.splice(posicao, 1);
    } else {
      const novo = limparItem(pokemon);
      if (novo) lista.push(novo);
    }
    salvar(lista);
    notificar();
    return posicao < 0;
  }

  function aoMudar(funcao) {
    document.addEventListener(EVENTO, funcao);
  }

  // Mantém tudo sincronizado quando outra aba altera os favoritos ou ao voltar pelo histórico.
  window.addEventListener("storage", (evento) => {
    if (evento.key === CHAVE || evento.key === null) notificar();
  });
  window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) notificar();
  });

  return {
    listar,
    estaFavoritado,
    alternar,
    aoMudar,
    persistenciaDisponivel: () => armazenamentoDisponivel,
  };
})();
