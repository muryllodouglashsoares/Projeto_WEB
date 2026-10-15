# PokéExplorer

Projeto escolar de WEB 1. Explora os 30 primeiros Pokémon da [PokéAPI](https://pokeapi.co/) e salva favoritos no navegador (localStorage).
Feito com HTML5, CSS3 e JavaScript puro (fetch + async/await). Sem backend, banco de dados, login ou frameworks.

## Como executar

Não precisa instalar nada, nem chave de API. Só é preciso **internet** (para a PokéAPI e para as fontes do Google).

**Opção 1 — Live Server (VS Code)**
1. Instale a extensão **Live Server** (Ritwick Dey) no VS Code.
2. Abra a pasta `pokeexplorer` em *File > Open Folder*.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

**Opção 2 — Python (se estiver instalado)**
```
cd pokeexplorer
python -m http.server 5500
```
Abra http://localhost:5500 no navegador.

## Estrutura

```
index.html  pokedex.html  favoritos.html  equipe.html
css/style.css            estilos das quatro páginas
js/comum.js              menu do celular e imagem alternativa (todas as páginas)
js/api.js                consultas à PokéAPI (fetch + async/await)
js/favoritos.js          leitura/gravação no localStorage
js/componentes.js        card, etiquetas de tipo e botão de coração
js/modal.js              janela de detalhes (<dialog>)
js/pokedex.js            lógica da página Pokédex (busca e filtro)
js/favoritos-pagina.js   lógica da página Favoritos
assets/favicon.svg       ícone da aba
```
