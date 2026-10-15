/* comum.js — Código usado em TODAS as páginas: menu do celular e imagem alternativa. */
const Comum = (() => {
  // Pokébola desenhada em SVG, usada quando uma imagem não carrega.
  const IMAGEM_ALTERNATIVA =
    "data:image/svg+xml," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
        "<circle cx='50' cy='50' r='44' fill='#fff' stroke='#1b2333' stroke-width='6'/>" +
        "<path d='M6 50a44 44 0 0 1 88 0z' fill='#d62828' stroke='#1b2333' stroke-width='6'/>" +
        "<path d='M6 50h88' stroke='#1b2333' stroke-width='6'/>" +
        "<circle cx='50' cy='50' r='11' fill='#fff' stroke='#1b2333' stroke-width='6'/></svg>"
    );

  function usarImagemAlternativa(img) {
    if (img.dataset.alternativa) return; // evita repetir caso a alternativa também falhe
    img.dataset.alternativa = "sim";
    img.alt = `Imagem de ${img.dataset.nome || "Pokémon"} indisponível`;
    img.src = IMAGEM_ALTERNATIVA;
  }

  // O evento "error" não "borbulha", por isso usamos a fase de captura.
  document.addEventListener(
    "error",
    (evento) => {
      const alvo = evento.target;
      if (alvo instanceof HTMLImageElement && alvo.hasAttribute("data-nome")) usarImagemAlternativa(alvo);
    },
    true
  );

  function iniciarMenu() {
    const botao = document.getElementById("menu-botao");
    const menu = document.getElementById("menu");
    if (!botao || !menu) return;

    const estaAberto = () => botao.getAttribute("aria-expanded") === "true";
    const definir = (aberto) => {
      botao.setAttribute("aria-expanded", String(aberto));
      menu.classList.toggle("menu--aberto", aberto);
    };

    botao.addEventListener("click", () => definir(!estaAberto()));
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && estaAberto()) {
        definir(false);
        botao.focus();
      }
    });
    document.addEventListener("click", (evento) => {
      if (estaAberto() && !evento.target.closest(".topo")) definir(false);
    });
    window.matchMedia("(min-width: 760px)").addEventListener("change", () => definir(false));
  }

  function iniciarImagensDaPagina() {
    // Imagens que já falharam antes deste script rodar (ex.: imagem da página inicial).
    document.querySelectorAll("img[data-nome]").forEach((img) => {
      if (img.complete && img.naturalWidth === 0) usarImagemAlternativa(img);
    });
  }

  iniciarMenu();
  iniciarImagensDaPagina();

  return { usarImagemAlternativa };
})();
