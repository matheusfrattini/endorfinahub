# Endorfina Hub — Tarefas para execução autônoma

> **Como usar:** coloque `endorfina-hub-v3.html` na raiz de uma pasta vazia, junto com este arquivo e as 5 fotos originais (`.jpeg`). Rode o Claude Code na pasta e mande: *"leia CLAUDE-CODE-ENDORFINA.md e execute as fases 1 a 5"*.

---

## Contexto

Site institucional do **Endorfina Hub**, um Training Club Híbrido com operação em **Campinas (SP)**. Reúne treinadores e experiências de corrida, calistenia, treino híbrido, recovery e lifestyle.

O arquivo `endorfina-hub-v3.html` é um HTML único, autocontido, com roteamento client-side por hash. Ele já está com layout aprovado em estrutura: **Home + 5 páginas** (`#inicio`, `#hub`, `#treinos`, `#eventos`, `#experiencias`, `#contato`).

O objetivo destas tarefas é levar esse arquivo de *preview* para *produção*, **sem alterar a identidade visual**.

---

## Regras invioláveis

Estas coisas **não podem mudar** em nenhuma hipótese. Se alguma tarefa parecer exigir uma dessas mudanças, pare e reporte em vez de executar.

1. **Sistema de cores.** Os tokens em `:root` são finais: `--ink:#0A1224`, `--paper:#ECEDE8`, `--gold:#FFC01E`, `--gold-deep:#E5A200`, `--mag:#FF2D78` (exclusivo de erro e foco), `--ash:#5B6376`. Não introduza cor nova, gradiente novo nem sombra colorida.
2. **Tipografia.** Archivo (variável, `wdth 118`, `wght 800`) para display, Manrope para corpo, IBM Plex Mono para labels e datas. Não troque, não adicione fonte.
3. **Nenhuma dependência nova.** Sem framework, sem bundler, sem GSAP, sem jQuery, sem Tailwind, sem npm. Só HTML, CSS e JavaScript nativo. O site precisa abrir com duplo clique no arquivo.
4. **Não mexa no bloco do formulário.** A seção marcada com `FORMULÁRIO -> PLANILHA DO GOOGLE + WHATSAPP` dentro do `<script>` está sendo integrada em paralelo pelo desenvolvedor. Você pode *ler* esse trecho, mas não reescreva a lógica de `submit`, `fetch` ou `wa.me`.
5. **Não invente conteúdo de cliente.** Placeholders entre colchetes (`[Nome]`, `[00 Mês]`, `[valor]`) são intencionais e aguardam dados reais. Preserve-os. A única exceção está na Fase 1.
6. **Acessibilidade não regride.** Todo `prefers-reduced-motion` já implementado deve continuar funcionando. Não remova `aria-*` nem `alt` existentes.

---

## Fase 1 — Centralizar a configuração

Hoje os dados variáveis do cliente estão espalhados pelo arquivo. Isso quebra na hora da entrega.

Crie **um único bloco de configuração** no topo do `<script>` principal, imediatamente após a abertura da IIFE:

```js
/* ===== CONFIGURAÇÃO DO CLIENTE — editar só aqui ===== */
var CFG = {
  whatsapp:   '5500000000000',                    // DDI + DDD + número, só dígitos
  instagram:  'https://instagram.com/endorfina.hub',
  grupo:      '',                                 // link do grupo de WhatsApp
  email:      'contato@endorfinahub.com.br',
  sheetUrl:   'COLE_AQUI_A_URL_DO_APPS_SCRIPT',
  cidades:    'Jacareí e Campinas — SP'
};
```

Depois:

- Substitua **todas** as ocorrências espalhadas de `5500000000000` por leitura de `CFG.whatsapp`.
- Faça o botão flutuante do WhatsApp (`a.wa`), os links de Instagram (`href="#"` nos cards de treinador, no rodapé, na seção Comunidade), o link do grupo e os `mailto:` serem preenchidos por JS no boot, a partir do `CFG`.
- Se um valor do `CFG` estiver vazio, o link correspondente deve receber `aria-disabled="true"` e `pointer-events:none` em vez de virar link quebrado.
- Mantenha `SHEET_URL` e `WHATS` do bloco de formulário funcionando — aponte-os para `CFG` sem reescrever a lógica de envio.

**Aceite:** trocar o número de WhatsApp em um único lugar atualiza o site inteiro.

---

## Fase 2 — Imagens de produção

O arquivo carrega 5 fotos como data URI base64 dentro de um `<script>` no final. Isso pesa ~750 KB e destrói o carregamento.

1. Crie a pasta `assets/`.
2. Extraia as 5 imagens do bloco base64 para arquivos reais, nomeando pelas chaves existentes em minúsculo: `hill.webp`, `mud.webp`, `rope.webp`, `wall.webp`, `crowd.webp`.
3. Gere também versão `.jpg` de cada uma (qualidade 78) como fallback, e uma variante `-800w` de cada formato para telas pequenas.
4. Substitua cada `<img data-img="IMG_X">` por `<picture>` com `<source type="image/webp" srcset>` responsivo e `<img>` jpg como fallback.
5. **Apague completamente** o `<script>` que contém `ENDORFINA_IMGS` e a função que injeta os data URIs.
6. Nas imagens abaixo da dobra: `loading="lazy"` e `decoding="async"`. Nas duas imagens do hero: `fetchpriority="high"`, sem lazy, e `<link rel="preload" as="image">` no `<head>`.
7. Toda `<img>` precisa de `width` e `height` explícitos para eliminar layout shift.

**Aceite:** o HTML final abaixo de 120 KB; nenhuma string `data:image` restante; Lighthouse sem CLS causado por imagem.

---

## Fase 3 — SEO e dados estruturados

1. No `<head>`, adicione: `<link rel="canonical">`, Open Graph completo (`og:title`, `og:description`, `og:image`, `og:type`, `og:locale=pt_BR`, `og:url`) e `twitter:card=summary_large_image`. Use `assets/crowd.jpg` como imagem social.
2. Os objetos `TITLES` e `DESCS` já existem no roteador. Estenda o roteador para atualizar também `og:title`, `og:description` e o `canonical` a cada troca de página.
3. Adicione **JSON-LD** de `SportsActivityLocation` com duas entradas em `areaServed` (Jacareí e Campinas), incluindo `name`, `description`, `url`, `sameAs` (Instagram), `telephone` e `openingHours` — deixe `telephone` e `openingHours` como placeholder `[...]` se não houver dado.
4. Adicione `BreadcrumbList` refletindo a hierarquia Home → página.
5. Gere `robots.txt` e `sitemap.xml` na raiz, com as 6 URLs.
6. Verifique a hierarquia de headings: deve existir exatamente **um `<h1>` por página**. Hoje só a Home tem `<h1>` — as demais começam em `<h2>`. Promova o título principal de cada página a `<h1>`, mantendo a classe `.d` e o tamanho visual atual (use `h2.d` como base do CSS de `h1.d` nas páginas internas se necessário para não mudar aparência).

**Aceite:** cada página com `<h1>` único, meta próprio e JSON-LD validando no Rich Results Test.

---

## Fase 4 — Correções conhecidas

1. **Menu apertado entre 900px e 1100px.** Com 6 itens + botão, a navegação colide nessa faixa. Reduza o `gap` do `.menu` progressivamente e, se ainda colidir, antecipe o menu hambúrguer para `max-width:1040px`. Não remova itens do menu.
2. **Favicon e PWA básico.** O logotipo é o SVG do sol já inline no header. Extraia para `assets/logo.svg`, gere `favicon.ico`, `apple-touch-icon.png` (180px) e um `site.webmanifest` com `theme_color:#0A1224` e `background_color:#ECEDE8`.
3. **Skip link.** Adicione um link "Pular para o conteúdo" visível apenas no foco, apontando para `<main>`.
4. **Foco visível.** Confirme que `:focus-visible` (outline magenta) funciona em todos os elementos interativos, inclusive nos cards `.ev` e `.gcard`.
5. **Contraste.** Rode uma verificação WCAG AA no texto sobre fundo escuro (`#A8B2C8` e `#94A0BA` sobre `#0A1224`). Se algum par ficar abaixo de 4.5:1, clareie **apenas o texto**, nunca o fundo, e registre a mudança no relatório.
6. **`<html lang="pt-BR">`** já está correto — confirme que permanece após as edições.

---

## Fase 5 — Relatório

Ao final, escreva `RELATORIO.md` com:

- O que foi alterado em cada fase.
- Tabela de todos os placeholders `[...]` que restaram no arquivo, com página, seção e o dado que o cliente precisa fornecer.
- Peso final do HTML e da pasta `assets/`.
- Qualquer decisão que você tomou por conta própria e o motivo.
- Lista do que **não** conseguiu fazer, se houver.

---

## Fase 6 — Separação em arquivos (NÃO EXECUTAR AINDA)

> Só rode esta fase quando eu pedir explicitamente. O layout ainda está em aprovação com o cliente e o arquivo único acelera a iteração.

Quando autorizado:

- Divida em `index.html`, `hub.html`, `treinos.html`, `eventos.html`, `experiencias.html`, `contato.html`.
- Extraia CSS para `assets/style.css` e JS para `assets/app.js`, compartilhados.
- Remova o roteador por hash; header, footer e botão de WhatsApp passam a ser duplicados em cada arquivo (é HTML estático, sem include — mantenha-os idênticos byte a byte para facilitar manutenção).
- Substitua `href="#hub"` por `href="hub.html"` etc.
- Cada arquivo recebe seu próprio `title`, `description`, `canonical` e OG, vindos de `TITLES`/`DESCS`.
- Mantenha as transições entre páginas usando `@view-transition { navigation: auto; }` — as animações de `::view-transition-old/new(root)` já existentes passam a funcionar em navegação real.
- Atualize `sitemap.xml` com as URLs reais.

---

## Ordem de execução

Faça um commit por fase, com mensagem descritiva. Se uma fase falhar, pare e reporte — não siga para a próxima nem tente contornar quebrando uma das regras invioláveis.