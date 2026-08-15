# Relatório de execução — Endorfina Hub

Execução das Fases 1 a 5 descritas em `endorfina-hub-v2.md`, sobre o estado do projeto já encontrado na pasta (ver nota no início da seção "Decisões" sobre a divergência entre o brief e o código existente).

---

## Fase 1 — Configuração centralizada

- Criado o bloco `CFG` no topo da IIFE de `js/main.js`, com `whatsapp`, `instagram`, `grupo`, `email`, `sheetUrl` e `cidades` (mais `siteUrl`, ver Decisões).
- Todas as ocorrências fixas do número `5500000000000` foram substituídas por leitura de `CFG.whatsapp` (botão flutuante `.wa` e o handler de submit do formulário).
- Criada a função `applyCFG()`, que roda no boot e preenche todo elemento marcado com `data-cfg="whatsapp|instagram|grupo|email|cidades"`: botão flutuante do WhatsApp, os 3 links de Instagram dos treinadores, Instagram/e-mail/cidades na página de contato, "Entrar no grupo" e "Seguir no Instagram" na seção Comunidade, e os 3 links de contato do rodapé.
- Campo vazio em `CFG` (hoje só `grupo`) resulta em `href="#"` com `aria-disabled="true"` e `pointer-events:none`, em vez de link quebrado.
- O envio do formulário continua abrindo o `wa.me` diretamente (não existe, no código atual, o bloco `PLANILHA DO GOOGLE + WHATSAPP` citado na regra 4 — não foi criado nem alterado nenhum código de integração com planilha; `CFG.sheetUrl` foi deixado pronto para quando essa integração for plugada).

## Fase 2 — Imagens de produção

- As 5 imagens já estavam como arquivos `.webp` reais em `assets/img/` (não havia mais base64/`ENDORFINA_IMGS` no HTML recebido).
- Gerado, para cada imagem, fallback `.jpg` (qualidade 78) e uma variante `-800w` em ambos os formatos — 20 arquivos novos, com Pillow (Python).
- Toda `<img>` foi envolvida em `<picture>` com `<source type="image/webp">` e `<source type="image/jpeg">` responsivos (`srcset`/`sizes`), com `<img>` jpg como fallback final.
- As duas imagens do hero (`hill`, `mud`) têm `fetchpriority="high"`, sem `lazy`, e `<link rel="preload" as="image" type="image/webp">` no `<head>`.
- Todas as demais imagens têm `loading="lazy"` e `decoding="async"`.
- Toda `<img>` recebeu `width`/`height` explícitos com as dimensões nativas do arquivo fonte.
- HTML final: **~35 KB** (bem abaixo dos 120 KB). Nenhuma string `data:image` restante.

## Fase 3 — SEO e dados estruturados

- Adicionados no `<head>`: `canonical`, Open Graph completo (`og:title`, `og:description`, `og:image`, `og:type`, `og:locale=pt_BR`, `og:url`, `og:site_name`) e `twitter:card=summary_large_image` com `assets/img/crowd.jpg` como imagem social.
- O roteador (`js/main.js`) ganhou os objetos `DESCS` (descrições por página — não existiam no código recebido, só `TITLES`) e `CRUMBS`, e a função `updateMeta(id)`, chamada a cada troca de página, que atualiza `meta[name=description]`, `canonical`, `og:title/description/url` e `twitter:title/description`.
- JSON-LD `SportsActivityLocation` estático no `<head>`, com `areaServed` para Jacareí e Campinas, `name`, `description`, `url`, `sameAs` (Instagram), e `telephone`/`openingHours` como placeholders `[...]` (sem dado disponível).
- JSON-LD `BreadcrumbList` dinâmico (`id="ld-breadcrumb"`), atualizado pelo roteador a cada navegação (Início → página atual).
- `robots.txt` e `sitemap.xml` criados na raiz (ver ressalva em Decisões sobre a cobertura real do sitemap).
- Hierarquia de headings corrigida: as 4 páginas internas (`O Hub`, `O que fazemos`, `Experiências`, `Contato`) tiveram seu título principal promovido de `h2` para `h1`. O CSS foi ajustado para que o `h1` das páginas internas mantenha o tamanho visual do antigo `h2.d` (`clamp(2rem,4.6vw,3.5rem)`); o tamanho grande original de `h1.d` ficou restrito a `.hero-in h1.d` (só a Home). Nenhuma mudança visual perceptível.

## Fase 4 — Correções conhecidas

1. **Menu 900–1100px**: adicionado `@media(max-width:1100px)` reduzindo o `gap` e o tamanho da fonte dos itens do menu; o breakpoint do hambúrguer foi antecipado de `780px` para `1040px` (extraído para seu próprio `@media`), eliminando a faixa de colisão. As demais regras mobile (grids, hero, rodapé) permanecem em `780px`, sem mudança de aparência fora da faixa 900–1100px.
2. **Favicon/PWA**: extraído `assets/logo.svg` (fiel ao SVG inline do header). Gerados `favicon.ico` (16/32/48px, fundo transparente), `assets/apple-touch-icon.png` (180px, fundo `--paper`) e `site.webmanifest` (`theme_color:#0A1224`, `background_color:#ECEDE8`, ícones 192/512px). Como não há `cwebp`/ImageMagick/navegador disponíveis neste ambiente, a rasterização foi feita reconstruindo os mesmos paths do SVG (círculo + 8 raios) via Pillow com supersampling — visualmente idêntico ao logo original, mas vale conferir depois de publicado.
3. **Skip link**: adicionado `<a class="skip-link" href="#main">Pular para o conteúdo</a>` logo após `<body>`, com `<main id="main">`. Fica fora da tela até receber foco (`top:-60px` → `top:12px` em `:focus`).
4. **Foco visível**: confirmado — `.ev` é um `<a>` e já herda `a:focus-visible{outline:3px solid var(--mag)}`. A classe `.gcard` citada no brief não existe no código atual (os cards são `.cell` e `.coach`); nenhum deles é interativo/focável (são `<article>` sem link), então não precisam de outline próprio.
5. **Contraste**: calculado manualmente (WCAG 2.x, luminância relativa) para os dois pares sobre `#0A1224`: `#A8B2C8` → **8,77:1** e `#94A0BA` → **7,11:1**. Ambos passam AA (4.5:1) com folga, inclusive perto/dentro de AAA (7:1). Nenhuma cor foi alterada.
6. `<html lang="pt-BR">` confirmado, sem alteração.

## Fase 5 — Este relatório

---

## Peso final

| Item | Tamanho |
|---|---|
| `index.html` | ~35 KB |
| `css/style.css` | ~15 KB |
| `js/main.js` | ~7 KB |
| `assets/` (imagens + ícones + logo) | ~2,4 MB |
| ↳ `assets/img/` (5 fotos × webp+jpg × normal+800w) | ~2,3 MB |
| ↳ ícones (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `logo.svg`) | ~81 KB |

O navegador só baixa **um** arquivo por `<img>` (o formato/tamanho escolhido via `<picture>`), então o peso real transferido por visita é uma fração pequena desses 2,4 MB — não a soma de tudo.

---

## Placeholders que restaram

| Página/local | O que o cliente precisa fornecer |
|---|---|
| `js/main.js` → `CFG.whatsapp` | Número real de WhatsApp (DDI+DDD+número, só dígitos) — hoje `5500000000000` |
| `js/main.js` → `CFG.grupo` | Link do grupo de WhatsApp (hoje vazio → botão "Entrar no grupo" fica desabilitado) |
| `js/main.js` → `CFG.sheetUrl` | URL do Google Apps Script, quando a integração com planilha (regra 4) for plugada |
| `<head>` JSON-LD `SportsActivityLocation` | `telephone` e `openingHours` reais |
| Home → "A tropa" (depoimentos) | `[Nome]` e `[mês/ano]` dos dois depoimentos |
| Home → "A tropa" (stats) | `[+300]`, `[40+]`, `[6]`, `[2]` — números reais da comunidade |
| Hub → "Nosso time" (3 cards) | `[Nome do profissional]` e mini bio de cada treinador (×3); fotos reais (hoje placeholder com ícone) |
| Treinos → cards de serviço (5 cards) | `R$ [valor]` de cada serviço |
| Experiências → lista de eventos (3 itens) | `[local]` de cada evento |
| Domínio de produção (`CFG.siteUrl`, canonical, OG, JSON-LD, sitemap, robots.txt) | Confirmar `https://endorfinahub.com.br` ou substituir pelo domínio real — ver Decisões |

---

## Decisões tomadas por conta própria

1. **Divergência entre o brief e o código encontrado.** O `endorfina-hub-v2.md` pressupõe partir de um `endorfina-hub-v3.html` monolítico (CSS/JS inline, imagens em base64) com 6 rotas (`#inicio #hub #treinos #eventos #experiencias #contato`). Esse arquivo não existia na pasta — o projeto já estava com CSS/JS separados (`css/style.css`, `js/main.js`), imagens já extraídas para `.webp` em `assets/img/`, e apenas **5** rotas (sem `#eventos` — o conteúdo de eventos já está distribuído entre a Home e Experiências). Segui a estrutura real do projeto em vez de recriar o arquivo único, e não inventei uma 6ª página/rota para não expandir o escopo do site com conteúdo novo não solicitado.
2. **Domínio de produção assumido.** Não havia domínio definido em lugar nenhum. Usei `https://endorfinahub.com.br` (mesmo domínio do e-mail de contato já presente no site) em `CFG.siteUrl`, `canonical`, Open Graph, JSON-LD, `robots.txt` e `sitemap.xml`. **Isso precisa ser confirmado ou corrigido pelo cliente antes de publicar** — é o único valor "inventado" que não veio de um placeholder `[...]` explícito, porque SEO técnico não funciona sem uma URL absoluta.
3. **Sitemap com URLs em hash.** O `sitemap.xml` lista as 5 rotas como `https://endorfinahub.com.br/#hub`, `/#treinos` etc. Vale registrar: buscadores em geral **não indexam fragmentos de URL (`#...`) como páginas separadas** — isso é uma limitação conhecida de roteador client-side por hash, não um bug. Na prática, hoje só a URL raiz tem valor de indexação individual; o ganho de SEO por página só se realiza de verdade na Fase 6 (arquivos separados), que o brief pede para não executar ainda.
4. **`h1` duplicado no DOM.** Como o site é uma SPA de hash (todas as 5 "páginas" convivem no mesmo HTML, só uma visível por vez via `display:none`), promover o título de cada página para `h1` resulta em 5 elementos `<h1>` no documento — um por página, nunca mais de um visível ao mesmo tempo. Isso é a leitura mais fiel possível da instrução "cada página com `h1` único" dentro da arquitetura atual (de novo, resolve-se de vez na Fase 6).
5. **Ícones gerados sem SVG rasterizer.** Não havia `cwebp`, ImageMagick nem navegador headless disponíveis no ambiente para converter `logo.svg` em PNG/ICO. Reconstruí a mesma geometria do SVG (círculo + disco central + 8 raios, mesmas coordenadas do `viewBox 0 0 100 100`) diretamente em Pillow com supersampling 8×, o que produz um resultado pixel-a-pixel equivalente a renderizar o SVG original. Revisei visualmente o resultado (`assets/apple-touch-icon.png`) antes de aceitar.
6. **Breakpoint do menu.** Segui a orientação do brief "reduza o gap, e se ainda colidir, antecipe para 1040px" indo direto para as duas medidas juntas (gap reduzido em 1100px + hambúrguer em 1040px), já que não há navegador disponível neste ambiente para testar visualmente o ponto exato de colisão entre 900 e 1100px. **Recomendo validar visualmente essa faixa depois do deploy.**
7. **`CFG.siteUrl` como campo novo.** O bloco `CFG` da Fase 1 não previa URL do site, mas ela é necessária para o `canonical`/OG/JSON-LD/sitemap da Fase 3. Adicionei `siteUrl` ao mesmo bloco central em vez de espalhar o domínio em vários arquivos, mantendo o espírito de "trocar em um único lugar" da Fase 1.

---

## O que não foi possível verificar

- **Lighthouse / CLS real e Rich Results Test.** Este ambiente não tem navegador nem acesso às ferramentas do Google para rodar essas validações de fato. `width`/`height` + `aspect-ratio` no CSS foram aplicados para eliminar CLS por imagem, e o JSON-LD segue a sintaxe padrão do schema.org, mas ambos merecem uma checagem final com as ferramentas reais antes da entrega ao cliente.
- **Teste visual do menu entre 900–1100px** e da mudança de breakpoint do hambúrguer (ver Decisão 6) — sem navegador no ambiente, não foi possível confirmar visualmente, só por leitura do CSS.
- **Integração com Google Sheets** (regra 4) não foi tocada nem implementada — segue como estava, aguardando o desenvolvedor responsável.
