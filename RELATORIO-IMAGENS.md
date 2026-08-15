# Relatório — Catálogo e auditoria do acervo de imagens

Execução das Tarefas 1 a 4 de `CATALOGO-IMAGENS.md`. Tarefa 100% de leitura e diagnóstico —
nenhum arquivo de código, imagem ou `.webp` foi criado, apagado, renomeado ou movido.

---

## 1. Resumo executivo

- **19 arquivos de imagem** em `assets/`: 16 fotos em `assets/img/` + 3 ícones de PWA na raiz
  de `assets/` (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`).
- Das 16 fotos: **7 horizontais**, **8 verticais**, **1 quadrada** (`park.jpeg`). Somando os
  3 ícones quadrados, o total por orientação é 7 horizontais / 8 verticais / 4 quadradas.
- Uma das 16 é derivada de outra: `mud-800w.jpg` é o mesmo conteúdo de `mud.jpg`, só
  redimensionado — 15 fotos com conteúdo distinto no total.
- **14 referências a imagem no código apontam para arquivos que não existem em disco** — ver
  Alerta de produção abaixo. Todas as 14 são variantes (`.webp` ou `-800w.jpg`) das 4 fotos
  já usadas no site (`hill`, `mud`, `rope`, `crowd`, `wall`).
- **10 fotos existem em `assets/img/` e não são referenciadas em nenhum lugar do código** —
  são as fotos novas mencionadas no contexto da tarefa, ainda sem uso.
- Nenhuma imagem tem extensão mentirosa (todas as `.jpg`/`.jpeg` são JPEG de verdade, todos os
  `.png` são PNG de verdade — conferido pelo cabeçalho binário, não pela extensão) e nenhuma
  tem EXIF orientation diferente de 1 (nenhuma tem a tag presente, então não há risco de foto
  torta no navegador).

---

## 2. ⚠️ Alerta de produção — leia antes do resto

### 2.1 Todo `<picture>` do site está quebrado hoje, em qualquer navegador moderno

**Não existe nenhum arquivo `.webp` em `assets/img/` — zero.** Mas o `index.html` tem **8**
blocos `<picture>` (mais 2 `<link rel="preload">`) que começam com
`<source type="image/webp" srcset="...">` apontando para arquivos `.webp` inexistentes.

Isso é exatamente o cenário descrito na Tarefa 2, item 4: quando o navegador suporta
`image/webp` (Chrome, Firefox, Safari e Edge atuais — ou seja, a esmagadora maioria do
tráfego real), ele **sempre** escolhe esse `<source>` pelo tipo declarado, sem checar se o
arquivo existe. Se a URL der 404, o navegador **não cai** para o `<source type="image/jpeg">`
nem para o `<img>` de fallback — ele renderiza um ícone de imagem quebrada. Hoje, isso afeta
literalmente toda foto do site:

| Linha(s) em `index.html` | Bloco `<picture>` | `.webp` que faltam |
|---|---|---|
| 99–102 | Hero, camada A (herói de fundo) | `hill.webp`, `hill-800w.webp` |
| 104–107 | Hero, camada B (herói de fundo) | `mud.webp`, `mud-800w.webp` |
| 135–138 | Figura "força" (corda) | `rope.webp`, `rope-800w.webp` |
| 224–227 | Imagem decorativa (`aria-hidden`) | `crowd.webp`, `crowd-800w.webp` |
| 250–253 | Figura "comunidade" (hill) | `hill.webp`, `hill-800w.webp` |
| 367–370 | Figura "obstáculos" (mud) | `mud.webp`, `mud-800w.webp` |
| 372–375 | Figura "muro" (wall) | `wall.webp`, `wall-800w.webp` |
| 390–393 | Figura "comunidade" (crowd) | `crowd.webp`, `crowd-800w.webp` |

Além disso, `hill-800w.jpg`, `rope-800w.jpg`, `crowd-800w.jpg` e `wall-800w.jpg` (as variantes
`.jpg` de 800px usadas no segundo `<source>`, o de fallback) **também não existem** — mas isso
não piora nada na prática, porque esse segundo `<source>` nunca chega a ser escolhido em
navegador com suporte a WebP.

Também existem dois `<link rel="preload" as="image" type="image/webp">` (linhas 29–30, para
`hill.webp` e `mud.webp`) — mesmo problema, requisições que sempre falham; não quebram nada
sozinhas, mas confirmam que o herói da página (as duas primeiras imagens carregadas) está
entre os afetados.

**Isso não é uma regressão desta tarefa** — a Tarefa 1 do brief `INTEGRACAO-FORMULARIO.md`
(sessão anterior) não mexeu em imagens, e o contexto deste brief já avisava que ".webp foram
apagados". Só não havia, até agora, um diagnóstico explícito de que o efeito é "toda foto do
site aparece quebrada", não "as fotos ficam um pouco mais pesadas por não ter WebP".

### 2.2 O que falta para corrigir (fora do escopo desta tarefa — só reportando)

Gerar os 10 `.webp` que faltam (`hill`, `hill-800w`, `mud`, `mud-800w`, `rope`, `rope-800w`,
`crowd`, `crowd-800w`, `wall`, `wall-800w`) resolve o problema visual. Os 4 `.jpg` de 800w que
também faltam (`hill-800w.jpg`, `rope-800w.jpg`, `crowd-800w.jpg`, `wall-800w.jpg`) podem ser
gerados junto, por completude, mas não é urgente. Regra 3 desta tarefa proíbe gerar `.webp`
agora — fica só o diagnóstico.

---

## 3. Inventário técnico (Tarefa 1)

Formato real lido pelo cabeçalho binário do arquivo, não pela extensão. Nenhuma imagem HEIC
disfarçada de `.jpg` foi encontrada. Nenhuma tag EXIF de orientação diferente de 1 foi
encontrada (coluna omitida da tabela — todas vieram `ausente`, equivalente a "sem rotação").

### Horizontais (7)

| Arquivo | Formato real | Dimensões | Proporção | Peso | Alpha |
|---|---|---|---|---|---|
| `felpbravus.jpeg` | JPEG | 1600 × 1066 | 3:2 | 232,6 KB | Não |
| `acad.jpeg` | JPEG | 1280 × 854 | 3:2 | 259,0 KB | Não |
| `spinnet.jpeg` | JPEG | 1280 × 854 | 3:2 | 156,6 KB | Não |
| `hill.jpg` | JPEG | 1200 × 784 | ~3:2 | 225,2 KB | Não |
| `mud.jpg` | JPEG | 1200 × 784 | ~3:2 | 230,9 KB | Não |
| `wall.jpg` | JPEG | 1200 × 784 | ~3:2 | 146,4 KB | Não |
| `mud-800w.jpg` | JPEG | 800 × 523 | ~3:2 | 121,7 KB | Não |

### Verticais (8)

| Arquivo | Formato real | Dimensões | Proporção | Peso | Alpha |
|---|---|---|---|---|---|
| `mud.jpeg` | JPEG | 1078 × 1386 | ~4:5 | 348,1 KB | Não |
| `run.jpeg` | JPEG | 1070 × 1600 | ~2:3 | 244,8 KB | Não |
| `runn.jpeg` | JPEG | 1066 × 1600 | ~2:3 | 219,0 KB | Não |
| `mudd.jpeg` | JPEG | 960 × 1280 | 3:4 | 349,8 KB | Não |
| `kart.jpeg` | JPEG | 900 × 1600 | 9:16 | 241,7 KB | Não |
| `force.jpeg` | JPEG | 854 × 1280 | ~2:3 | 150,5 KB | Não |
| `rope.jpg` | JPEG | 784 × 1200 | ~2:3 | 132,8 KB | Não |
| `crowd.jpg` | JPEG | 644 × 1200 | ~9:16 | 142,7 KB | Não |

### Quadradas (4)

| Arquivo | Formato real | Dimensões | Proporção | Peso | Alpha |
|---|---|---|---|---|---|
| `park.jpeg` | JPEG | 1280 × 1280 | 1:1 | 422,6 KB | Não |
| `icon-512.png` | PNG | 512 × 512 | 1:1 | 42,1 KB | Não |
| `icon-192.png` | PNG | 192 × 192 | 1:1 | 16,9 KB | Não |
| `apple-touch-icon.png` | PNG | 180 × 180 | 1:1 | 15,8 KB | Não |

Nota: os 3 PNGs de ícone estão em modo RGB (sem canal alpha, fundo sólido opaco), não RGBA.
Não é um defeito — só um dado técnico, caso algum dia sejam usados como ícone "maskable".

---

## 4. Referências órfãs e arquivos órfãos (Tarefa 2)

### 4.1 Referências órfãs (código aponta, arquivo não existe) — 14

| Arquivo esperado | Onde é referenciado | Existe em outro formato? |
|---|---|---|
| `assets/img/hill.webp` | `index.html:100`, `:251`, preload `:29` | Sim — `hill.jpg` (1200×784) |
| `assets/img/hill-800w.webp` | `index.html:100`, `:251` | Não (nem o `.jpg` de 800w existe) |
| `assets/img/hill-800w.jpg` | `index.html:101`, `:252` | Sim, em resolução cheia — `hill.jpg` |
| `assets/img/mud.webp` | `index.html:105`, `:368`, preload `:30` | Sim — `mud.jpg` (1200×784) |
| `assets/img/mud-800w.webp` | `index.html:105`, `:368` | Sim, em JPEG — `mud-800w.jpg` já existe |
| `assets/img/rope.webp` | `index.html:136` | Sim — `rope.jpg` (784×1200) |
| `assets/img/rope-800w.webp` | `index.html:136` | Não (nem o `.jpg` de 800w existe) |
| `assets/img/rope-800w.jpg` | `index.html:137` | Sim, em resolução cheia — `rope.jpg` |
| `assets/img/crowd.webp` | `index.html:225`, `:391` | Sim — `crowd.jpg` (644×1200) |
| `assets/img/crowd-800w.webp` | `index.html:225`, `:391` | Não (nem o `.jpg` de 800w existe) |
| `assets/img/crowd-800w.jpg` | `index.html:226`, `:392` | Sim, em resolução cheia — `crowd.jpg` |
| `assets/img/wall.webp` | `index.html:373` | Sim — `wall.jpg` (1200×784) |
| `assets/img/wall-800w.webp` | `index.html:373` | Não (nem o `.jpg` de 800w existe) |
| `assets/img/wall-800w.jpg` | `index.html:374` | Sim, em resolução cheia — `wall.jpg` |

Todas as 14 estão em `assets/img/`. Nenhuma referência quebrada foi encontrada em `css/style.css`
(não tem nenhum `url()` de imagem), em `js/main.js` (o `CFG` não tem campo de imagem) ou em
`site.webmanifest` (os dois ícones que ele referencia, `icon-192.png` e `icon-512.png`, existem).

### 4.2 Arquivos órfãos (existem em disco, ninguém referencia) — 10

Todas em `assets/img/`, todas com data de modificação de 14/08 (mais recentes que o lote em uso,
que é de 13/08) — batem com "novas fotos foram adicionadas" do contexto da tarefa:

`acad.jpeg`, `felpbravus.jpeg`, `force.jpeg`, `kart.jpeg`, `mud.jpeg`, `mudd.jpeg`, `park.jpeg`,
`run.jpeg`, `runn.jpeg`, `spinnet.jpeg`.

⚠️ **Atenção ao nome:** `mud.jpeg` e `mudd.jpeg` soam como variantes de `mud.jpg`, mas são fotos
completamente diferentes — `mud.jpg` (em uso) é do evento de obstáculos na lama; `mud.jpeg` é a
foto de uma corrida de rua com medalhas (sem barro nenhuma); `mudd.jpeg` é uma selfie de grupo
em trilha enlameada (evento de obstáculos, mas outro instante/ângulo). Os três nomes quase
idênticos são uma armadilha para quem for alocar essas fotos depois.

---

## 5. Descrições completas (Tarefa 3)

Agrupadas por orientação: Horizontais, depois Verticais, depois Quadradas. Os 3 ícones de PWA
estão descritos ao final, de forma resumida — são elementos de interface, não fotos do acervo,
e a maioria dos campos do template (modalidade, composição, crop) não se aplica a eles.

### Horizontais

`mud-800w.jpg` não tem bloco próprio nesta seção — é pixel-a-pixel o mesmo conteúdo de
`mud.jpg`, apenas redimensionado para 800px de largura. Ver a descrição de `mud.jpg` abaixo.

#### hill.jpg

- **Conteúdo:** Grupo comemorando no alto de um morro/trilha, várias pessoas com o punho
  erguido em pose de força, clima de vitória pós-prova.
- **Sujeitos:** Grupo de 13 pessoas, mistura de homens e mulheres, a maioria com camiseta
  cinza de evento ou sem camisa.
- **Modalidade:** Evento/OCR, Comunidade.
- **Cenário:** Outdoor, topo de morro/trilha rural, vegetação rasteira, serra ao fundo em
  camadas, dia ensolarado.
- **Luz e cor:** Luz dura de meio-dia, céu azul com nuvens esparsas, verde e tons de pele
  bronzeada dominantes, contraste e saturação altos (parece ter recebido tratamento HDR leve).
- **Composição:** Grupo ocupa o terço inferior/central, ângulo no nível dos olhos, boa
  profundidade com a serra ao fundo.
- **Área limpa para texto:** Faixa de céu no terço superior, mas com uma árvore invadindo o
  canto superior esquerdo — a área realmente limpa fica concentrada no canto superior direito,
  cerca de 20% do quadro.
- **Marcas de terceiros:** "BRAVUS SPEED" em destaque nas camisetas de várias pessoas; logo
  "Jeep" pequeno, também nas camisetas.
- **Rostos identificáveis:** 13.
- **Qualidade técnica:** Nítida, bem exposta, sem defeitos.
- **Crop sugerido:** Já funciona bem como hero horizontal full-bleed; não recomendo cortar
  para vertical (perderia o grupo inteiro).
- **Aproveitamento:** Alto — grupo grande, energia forte, já validada em produção.

#### mud.jpg

- **Conteúdo:** Grupo coberto de lama posando em frente a uma estrutura de rede/escalada de
  prova de obstáculos, ao entardecer.
- **Sujeitos:** 9 pessoas em primeiro plano, poses de força; outras ao fundo, desfocadas,
  subindo a estrutura de rede.
- **Modalidade:** Evento/OCR, Performance, Comunidade.
- **Cenário:** Outdoor, arena de prova de obstáculos, terreno de barro/lama vermelha, estrutura
  de madeira e corda ao fundo, tenda branca à direita.
- **Luz e cor:** Luz quente e baixa (fim de tarde), tons terrosos/dourados dominantes, alto
  contraste entre a lama avermelhada e a pele/roupas escuras.
- **Composição:** Grupo centralizado, ângulo no nível dos olhos, profundidade em camadas
  (grupo → estrutura de rede → céu).
- **Área limpa para texto:** Sem área limpa — fundo ocupado por estrutura, tenda e placas.
- **Marcas de terceiros:** "BRAVUS SPEED" e "Jeep" em destaque nas camisetas; placa parcialmente
  legível ao fundo ("...O HEAVEN", provável nome de obstáculo do evento).
- **Rostos identificáveis:** 9 nítidos em primeiro plano; mais pessoas ao fundo, fora de foco,
  não identificáveis.
- **Qualidade técnica:** Nítida no grupo principal, boa exposição para a luz difícil de fim de
  tarde, leve grão em sombra.
- **Crop sugerido:** Cortar a faixa azul com texto "VAI C..." no canto inferior direito (placa
  cortada, sem função estética).
- **Aproveitamento:** Alto — imagem de assinatura do evento, já em produção.

#### wall.jpg

- **Conteúdo:** Cinco atletas sentados lado a lado no topo de caixotes de madeira de uma prova
  de obstáculos, comemorando com os braços erguidos.
- **Sujeitos:** 5 pessoas (4 homens, 1 mulher pela silhueta central — a maioria com o rosto
  visível), todos em pose de comemoração.
- **Modalidade:** Evento/OCR, Comunidade.
- **Cenário:** Outdoor, estrutura de madeira de prova de obstáculos, fotografado de baixo para
  cima contra o céu.
- **Luz e cor:** Céu azul vibrante com nuvens brancas volumosas ocupando mais da metade do
  quadro; contraste alto entre o céu claro e os caixotes/pessoas em contraluz parcial.
- **Composição:** Sujeitos na metade inferior do quadro, ângulo de contra-plongée (câmera
  baixa, olhando para cima) — dá sensação de grandiosidade.
- **Área limpa para texto:** Excelente — o céu ocupa cerca de 55% da imagem, textura de nuvens
  suave, praticamente sem elementos competindo.
- **Marcas de terceiros:** "BRAVUS RACE" pintado em destaque nos caixotes de madeira, repetido
  3 vezes.
- **Rostos identificáveis:** 5.
- **Qualidade técnica:** Nítida, ângulo forte; rostos ligeiramente subexpostos por estarem em
  contraluz parcial contra o céu claro.
- **Crop sugerido:** Nenhum necessário no formato atual; se precisar de retrato, cortar boa
  parte do céu superior e centralizar nos 5 atletas.
- **Aproveitamento:** Alto — composição visualmente forte, já em produção.

#### acad.jpeg

- **Conteúdo:** Grande grupo posando sob uma estrutura metálica de calistenia (barras, argolas),
  em ambiente de treino ao ar livre.
- **Sujeitos:** 24 pessoas (2 delas em primeiríssimo plano, borradas — provavelmente cabeças de
  quem passou perto da câmera), mistura de homens e mulheres, roupas pretas de treino.
- **Modalidade:** Calistenia, Comunidade.
- **Cenário:** Outdoor, estrutura de treino tipo "cage"/rig com barras fixas e argolas, casa de
  telhado alaranjado ao fundo, área arborizada.
- **Luz e cor:** Luz difusa de sombra (o grupo está sob a estrutura coberta), fundo mais claro
  e ensolarado — contraste entre primeiro plano em sombra e fundo iluminado.
- **Composição:** Grupo em 3 fileiras dentro da estrutura, ângulo no nível dos olhos, barras da
  estrutura criam linhas fortes ao redor do grupo.
- **Área limpa para texto:** Sem área limpa relevante — estrutura metálica, casa e árvores
  preenchem todo o fundo.
- **Marcas de terceiros:** "Endorfina Rate 3" nas camisetas pretas (marca própria do Hub, não
  terceiro); boné com logo Nike; jaqueta com texto parcialmente legível ("AESTHE...").
- **Rostos identificáveis:** ~22 nítidos; 2 pessoas em primeiríssimo plano estão borradas e não
  são identificáveis.
- **Qualidade técnica:** Nítida no grupo principal; duas cabeças borradas em primeiro plano na
  base do quadro competem visualmente com o grupo em foco.
- **Crop sugerido:** Cortar ~8% da base para remover as duas cabeças borradas em primeiro plano.
- **Aproveitamento:** Alto — grande grupo, ambiente de calistenia bem reconhecível, boa após o
  crop sugerido.

#### felpbravus.jpeg

- **Conteúdo:** Homem sorrindo em primeiro plano, emergindo de uma piscina de lama/água
  barrenta, sob um obstáculo de arame farpado.
- **Sujeitos:** 1 pessoa nítida em primeiro plano ("Felipe", pelo nome na bandana); 2 pessoas
  parcialmente visíveis e desfocadas ao redor.
- **Modalidade:** Evento/OCR.
- **Cenário:** Outdoor, poço de água/lama de prova de obstáculos, obstáculo de arame farpado
  logo acima da superfície da água.
- **Luz e cor:** Luz quente de fim de tarde, tom âmbar/laranja intenso dominando toda a imagem
  (reflexo da água barrenta), alto contraste.
- **Composição:** Sujeito principal centralizado, ângulo no nível da água (câmera baixa),
  reflexo do rosto na água abaixo, arame farpado cria linha horizontal forte no terço superior.
- **Área limpa para texto:** A superfície da água em primeiro plano, canto inferior-esquerdo
  (~15% do quadro), é relativamente lisa e desfocada — funcionaria para uma legenda pequena.
- **Marcas de terceiros:** Bandana "BRAVUS SPEED / FELIPE" em destaque.
- **Rostos identificáveis:** 1 nítido; mais 2 parcialmente visíveis, desfocados, não totalmente
  identificáveis.
- **Qualidade técnica:** Nítida no sujeito principal, ótima profundidade de campo rasa, tom de
  cor muito dominante (âmbar) que pode dificultar uso ao lado de outras fotos com paleta neutra.
- **Crop sugerido:** Crop quadrado 1:1 centrado no rosto funcionaria bem para redes sociais.
- **Aproveitamento:** Médio — retrato de ação forte e expressivo, mas de evento de terceiros
  (Bravus), sem branding do Hub; boa para textura/atmosfera de "evento", não para header.

#### spinnet.jpeg

- **Conteúdo:** Homem puxando cordas de batalha (battle ropes) numa estação de treino ao ar
  livre, em pé sobre uma caixa, num evento com estrutura de feira/expo ao fundo.
- **Sujeitos:** 1 pessoa em ação.
- **Modalidade:** Treino Híbrido, Performance.
- **Cenário:** Outdoor, estação de treino funcional numa feira/ativação de marca (banners e
  estrutura de vidro/acrílico ao fundo), céu com nuvens.
- **Luz e cor:** Céu azul vibrante com nuvens brancas volumosas no terço superior, azul dos
  banners de fundo, pele bronzeada em destaque.
- **Composição:** Sujeito à esquerda do centro, ângulo levemente de baixo para cima, cordas se
  estendem na diagonal para o canto inferior direito, dando dinamismo.
- **Área limpa para texto:** Boa — o céu ocupa cerca de 40% do quadro, nuvens suaves, sem
  elementos competindo.
- **Marcas de terceiros:** Shorts Under Armour em destaque; banners ao fundo com texto de marca
  de terceiro (feira/expo — algo como "...FIT HO..." e outro texto parcialmente legível), não
  identificados com certeza pela imagem espelhada (ver qualidade técnica).
- **Rostos identificáveis:** 1.
- **Qualidade técnica:** Nítida, mas a imagem aparenta estar **espelhada horizontalmente** — o
  texto dos banners ao fundo aparece invertido/de trás para frente, o que é típico de um erro
  de flip horizontal na edição (ou de ter sido capturada refletida em vidro/acrílico). Isso
  também inverte a lateralidade do movimento do atleta.
- **Crop sugerido:** Antes de qualquer uso, inverter horizontalmente (flip) para corrigir o
  texto espelhado dos banners; depois disso, um crop 4:5 centrado no atleta funcionaria bem
  para redes sociais.
- **Aproveitamento:** Baixo — tecnicamente comprometida (precisa de correção de flip antes de
  qualquer uso público) e o texto de banner de terceiro ilegível/espelhado atrapalha a leitura
  da cena.

### Verticais

#### mud.jpeg

- **Conteúdo:** Grupo de corredores posando com medalhas de participação após uma corrida de
  rua, sentados e em pé numa praça.
- **Sujeitos:** 11 pessoas, mistura de homens e mulheres, todos com número de peito (bib) e
  medalha vermelha.
- **Modalidade:** Corrida, Evento/OCR, Comunidade.
- **Cenário:** Outdoor, praça/calçadão urbano, caixa d'água e coreto ao fundo, palmeiras.
- **Luz e cor:** Sol a pino, céu azul saturado, sombras duras, verde das árvores e cinza das
  camisetas de corrida dominantes.
- **Composição:** Grupo em duas fileiras (em pé atrás, sentados/agachados na frente), ângulo no
  nível dos olhos, fundo com profundidade (árvores → prédio → céu).
- **Área limpa para texto:** Faixa de céu azul no terço superior, mas cortada por um poste de
  luz alto no centro-direita — área limpa fica concentrada no canto superior esquerdo, ~20%.
- **Marcas de terceiros:** Números de peito com patrocinadores ilegíveis (resolução baixa),
  boné com "AL7" em destaque, medalhas com fita vermelha de evento.
- **Rostos identificáveis:** 11.
- **Qualidade técnica:** Boa nitidez geral (qualidade de celular, não de câmera profissional),
  sombras duras características de sol a pino.
- **Crop sugerido:** Cortar ~10% da direita para remover o poste de luz que corta o quadro sem
  função estética.
- **Aproveitamento:** Médio-Alto — boa foto de comunidade de corrida com prova de rua real,
  mas o nome do arquivo (`mud.jpeg`) é enganoso: não há barro nenhum nesta foto.

#### run.jpeg

- **Conteúdo:** Homem correndo sozinho numa rua arborizada, em movimento, olhando para frente.
- **Sujeitos:** 1 pessoa nítida em primeiro plano correndo; 1 pessoa desfocada ao fundo,
  caminhando.
- **Modalidade:** Corrida.
- **Cenário:** Outdoor, rua residencial, calçada com grade/alambrado, vegetação densa ao fundo.
- **Luz e cor:** Luz de dia clara e difusa, verde vibrante da vegetação domina o terço superior,
  cinza do asfalto no terço inferior.
- **Composição:** Sujeito centralizado, ângulo no nível dos olhos, congelado em movimento
  (pernas em passada), bom desfoque de fundo (teleobjetiva).
- **Área limpa para texto:** A vegetação verde do topo (~35% do quadro) é razoavelmente uniforme
  em textura, funcionaria com um overlay escuro por trás do texto.
- **Marcas de terceiros:** Logo Nike (swoosh) no shorts branco, discreto.
- **Rostos identificáveis:** 1 nítido (o corredor em primeiro plano); 1 desfocado ao fundo, não
  totalmente identificável.
- **Qualidade técnica:** Muito nítida, ótimo congelamento de movimento, teleobjetiva profissional
  com bokeh de fundo bem controlado — a melhor foto tecnicamente do lote.
- **Crop sugerido:** Nenhum necessário.
- **Aproveitamento:** Alto — foto de ação profissional, foco perfeito, ótima para a seção de
  Corrida.

#### runn.jpeg

- **Conteúdo:** Dois homens correndo lado a lado numa rua, sorrindo e fazendo sinal de "hang
  loose" para a câmera.
- **Sujeitos:** 2 pessoas nítidas em primeiro plano; mais 3 pessoas desfocadas ao fundo.
- **Modalidade:** Corrida, Comunidade.
- **Cenário:** Outdoor, rua/avenida arborizada com ciclofaixa vermelha, luz forte de sol atrás
  dos sujeitos.
- **Luz e cor:** Contraluz forte (sol atrás), fundo estourado/muito claro, verde da vegetação
  nas bordas.
- **Composição:** Dupla centralizada, ângulo no nível dos olhos, boa profundidade com pessoas
  desfocadas ao fundo.
- **Área limpa para texto:** O fundo estourado (superexposto) atrás da dupla, principalmente no
  terço superior-central (~20%), é bem claro/quase branco — funcionaria para texto escuro.
- **Marcas de terceiros:** Boné Nike em destaque em um dos dois; shorts Nike em ambos.
- **Rostos identificáveis:** 2 nítidos em primeiro plano; 3 desfocados ao fundo, não totalmente
  identificáveis.
- **Qualidade técnica:** Nítida nos dois sujeitos principais, mas com estouro de luz (highlight)
  considerável no fundo — perda de detalhe na área clara.
- **Crop sugerido:** Cortar levemente a faixa da ciclofaixa vermelha/branca no canto inferior
  esquerdo (elemento de baixo contraste, mas presente e um pouco distrativo).
- **Aproveitamento:** Médio — boa energia de dupla correndo, mas o estouro de luz no fundo reduz
  o acabamento técnico.

#### mudd.jpeg

- **Conteúdo:** Selfie de grupo em trilha enlameada, com uma pessoa segurando o braço estendido
  em primeiro plano e o resto do grupo posando atrás, comemorando.
- **Sujeitos:** 11 pessoas no total — 1 em primeiro plano (quem tira a foto) + 10 ao fundo.
- **Modalidade:** Evento/OCR, Comunidade.
- **Cenário:** Outdoor, trilha de mata fechada, vegetação alta dos dois lados, chão de barro.
- **Luz e cor:** Luz natural de mata, verde intenso dominante, céu claro visível em pequenos
  recortes entre as folhas.
- **Composição:** Formato de selfie com grande angular — pessoa em primeiro plano ocupa a base
  do quadro com o braço esticado, grupo se abre em leque atrás dela; perspectiva distorcida
  (típica de selfie).
- **Área limpa para texto:** Sem área limpa relevante — vegetação densa preenche quase todo o
  quadro; só um pequeno recorte de céu no canto superior esquerdo.
- **Marcas de terceiros:** "BRAVUS" nas bandanas vermelhas de várias pessoas; "BRAVUS RACE" em
  destaque numa camiseta.
- **Rostos identificáveis:** 11.
- **Qualidade técnica:** Nítida, mas com a distorção de perspectiva típica de selfie em grande
  angular (braço/mão em primeiro plano desproporcionalmente grande).
- **Crop sugerido:** Crop quadrado 1:1 centrado na pessoa que tira a selfie funcionaria bem para
  redes sociais; como está, o braço em primeiro plano ocupa espaço morto na base do quadro.
- **Aproveitamento:** Médio — energia boa e autêntica, mas o ângulo de selfie é menos
  profissional que as fotos de câmera do mesmo evento (`hill.jpg`, `mud.jpg`, `wall.jpg`).

#### kart.jpeg

- **Conteúdo:** Grupo posando numa esquina residencial após corrida/treino em grupo, em
  formação de duas fileiras.
- **Sujeitos:** 16 pessoas, mistura de homens e mulheres de idades variadas, em roupa de
  corrida/treino casual.
- **Modalidade:** Corrida, Comunidade.
- **Cenário:** Outdoor, calçada/esquina de bairro residencial, poste de luz alto ao centro,
  árvores e palmeira ao fundo, casas visíveis.
- **Luz e cor:** Céu nublado/encoberto quase todo branco-acinzentado, luz baixa e difusa
  (início da manhã ou fim de tarde), cores dessaturadas em comparação às fotos de sol forte.
- **Composição:** Grupo no terço inferior, ângulo no nível dos olhos, poste de luz cortando o
  quadro verticalmente ao centro — elemento de composição um pouco intrusivo.
- **Área limpa para texto:** Excelente — o céu nublado ocupa cerca de 45-50% do quadro, textura
  uniforme, só interrompido pelo poste central.
- **Marcas de terceiros:** Camisetas com logo "Endorfina Pace" (marca própria do Hub, não é
  terceiro) em pelo menos duas pessoas; boné com trevo da Adidas, discreto.
- **Rostos identificáveis:** 16.
- **Qualidade técnica:** Qualidade de foto de celular (nitidez inferior às fotos de câmera
  profissional do lote), mas sem defeitos graves; céu achatado por causa do dia nublado.
- **Crop sugerido:** Cortar ~30% do topo (céu vazio) se for usar em formato mais compacto tipo
  card ou thumbnail.
- **Aproveitamento:** Médio — comunidade de corrida real e reconhecível, mas qualidade de
  celular e pose estática; boa como foto de bastidor/comunidade, não como imagem de destaque.

#### force.jpeg

- **Conteúdo:** Homem pendurado em barra de estrutura metálica (obstáculo de prova), olhando
  para a câmera com expressão séria.
- **Sujeitos:** 1 pessoa, mesma pessoa de `felpbravus.jpeg` (bandana "BRAVUS/FELIPE").
- **Modalidade:** Evento/OCR, Performance.
- **Cenário:** Outdoor, estrutura metálica de treliça (obstáculo de prova), argolas de ginástica
  visíveis desfocadas ao fundo à esquerda.
- **Luz e cor:** Luz de fim de tarde, tons terrosos/dourados na pele, fundo verde desfocado.
- **Composição:** Sujeito centralizado, ângulo levemente de baixo para cima (plongée invertido/
  contra-plongée sutil), braços erguidos seguram uma barra que corta o topo do quadro.
- **Área limpa para texto:** Áreas de bokeh verde desfocado nos cantos inferior-esquerdo e
  inferior-direito, cerca de 15-20% cada, mas fragmentadas pela estrutura metálica.
- **Marcas de terceiros:** Bandana "BRAVUS / FELIPE" em destaque.
- **Rostos identificáveis:** 1.
- **Qualidade técnica:** Nítida, boa separação sujeito/fundo (profundidade de campo rasa),
  levemente em contraluz.
- **Crop sugerido:** Nenhum necessário — já é um retrato de ação vertical bem enquadrado.
- **Aproveitamento:** Médio — tecnicamente muito boa, mas é de evento de terceiros (Bravus),
  sem branding do Hub; funciona melhor como textura/atmosfera de "performance" do que como
  imagem que remeta à marca.

#### rope.jpg

- **Conteúdo:** Homem puxando um cabo de aço grosso em zigue-zague no chão, em estação de força
  de prova de obstáculos.
- **Sujeitos:** 1 pessoa em ação nítida em primeiro plano; 1 pessoa parcialmente visível atrás,
  observando.
- **Modalidade:** Evento/OCR, Performance.
- **Cenário:** Outdoor, terreno de terra vermelha, muro de blocos de concreto ao fundo, cone de
  sinalização laranja e fita zebrada visíveis.
- **Luz e cor:** Luz natural difusa, tons terrosos (terra vermelha) e cinza do muro, vermelho da
  bandana como ponto de cor.
- **Composição:** Sujeito principal levemente à esquerda do centro, ângulo no nível dos olhos,
  profundidade rasa (fundo desfocado propositalmente).
- **Área limpa para texto:** O muro de blocos cinza ao fundo é razoavelmente uniforme, ocupa a
  faixa central-superior (~25% do quadro) — daria para um texto curto com bom contraste.
- **Marcas de terceiros:** "BRAV..." (Bravus) legível na bandana vermelha, discreto.
- **Rostos identificáveis:** 2 (o atleta em foco e a pessoa atrás, ambos reconhecíveis).
- **Qualidade técnica:** Muito nítida no sujeito principal, ótima profundidade de campo rasa,
  parece foto de câmera profissional com teleobjetiva.
- **Crop sugerido:** Nenhum — já está no formato vertical usado no site.
- **Aproveitamento:** Alto — ação individual clara, ótima para ilustrar força/performance, já
  em produção.

#### crowd.jpg

- **Conteúdo:** Multidão de dezenas de participantes de evento reunidos em campo aberto, com
  um grupo em primeiro plano posando para a câmera.
- **Sujeitos:** Grande multidão (mais de 50 pessoas visíveis); cerca de 12 rostos nítidos em
  primeiro plano, o restante é massa de gente ao fundo.
- **Modalidade:** Evento/OCR, Comunidade.
- **Cenário:** Outdoor, campo de terra, palmeiras e árvores ao fundo, estrutura de obstáculos
  visível ao longe.
- **Luz e cor:** Luz nublada/difusa, céu claro sem sol direto, predomínio de vermelho (camisetas
  do evento) sobre o verde da vegetação.
- **Composição:** Foto vertical, grupo em primeiro plano ocupa o terço inferior, multidão
  preenche o terço médio, céu e árvores no topo — pouca profundidade de campo controlada
  (é uma foto de grupo grande, não um retrato).
- **Área limpa para texto:** Sem área limpa relevante — o topo tem árvores e uma faixa pequena
  de céu (~15% do quadro), insuficiente para headline.
- **Marcas de terceiros:** "BRAVUS FIRE" em destaque na maioria das camisetas vermelhas.
- **Rostos identificáveis:** ~12 nítidos em primeiro plano; centenas ao fundo, não
  identificáveis (baixa resolução/desfoque de multidão).
- **Qualidade técnica:** Nítida no primeiro plano, ruído leve por ISO mais alto (luz mais baixa),
  fora de foco natural na multidão distante.
- **Crop sugerido:** Cortar cerca de 10% da base — há uma pessoa cortada de forma abrupta no
  canto inferior esquerdo.
- **Aproveitamento:** Médio — boa para transmitir escala/comunidade, mas granulada e sem espaço
  de texto; funciona melhor como imagem decorativa de fundo (como já é usada, com
  `aria-hidden="true"`) do que como imagem de destaque.

### Quadradas

#### park.jpeg

- **Conteúdo:** Grande grupo posando num pátio pavimentado ao lado de uma casa/sede laranja,
  a maioria sem camisa, um homem deitado no chão em primeiro plano vestindo camisa da Seleção
  Brasileira.
- **Sujeitos:** 22 pessoas, quase todos homens, poses de força e comemoração.
- **Modalidade:** Comunidade, Calistenia (estrutura metálica verde visível na borda esquerda,
  possivelmente barra fixa, mas não é o foco da imagem).
- **Cenário:** Outdoor, pátio de pedra portuguesa/piso verde, casa de telhado colonial laranja
  ao fundo, árvores altas.
- **Luz e cor:** Sol forte de meio-dia, sombras duras e bem definidas no chão, laranja da casa
  contrasta com o verde do piso e das árvores.
- **Composição:** Grupo ocupa quase todo o quadro em três "camadas" (em pé, agachados, deitado),
  ângulo no nível dos olhos, pouca profundidade (grupo compacto e largo).
- **Área limpa para texto:** A parede laranja da casa ao fundo (canto superior direito, ~15-20%
  do quadro) é razoavelmente uniforme — funcionaria para um texto curto com bom contraste.
- **Marcas de terceiros:** Camisa da Seleção Brasileira (CBF/Nike) em destaque no centro-baixo;
  boné Nike; camiseta com texto "PROFIT"; boné "LA"; camiseta verde com um logo "G" não
  identificado com certeza — todas discretas, exceto a camisa da Seleção.
- **Rostos identificáveis:** 22.
- **Qualidade técnica:** Nítida, boa exposição, sombras duras típicas de sol a pino sem difusor.
- **Crop sugerido:** Nenhum necessário — já bem equilibrada no quadro quadrado.
- **Aproveitamento:** Alto — grupo grande, boa luz, ambiente reconhecível de treino ao ar livre;
  atenção à camisa da Seleção Brasileira em destaque se o uso for institucional (marca de
  terceiro muito reconhecível).

### Ícones de PWA (não são fotos do acervo — descrição resumida)

#### apple-touch-icon.png / icon-192.png / icon-512.png

- **Conteúdo:** Logo vetorial de um sol estilizado (círculo com 8 raios triangulares) dentro de
  um anel cinza, sobre fundo bege claro sólido. As três versões conferidas (`apple-touch-icon`,
  `icon-192`, `icon-512`) têm exatamente o mesmo desenho, só em resoluções diferentes.
- **Sujeitos:** Não se aplica — ícone gráfico, sem pessoas.
- **Modalidade:** Não se aplica.
- **Cenário:** Não se aplica.
- **Luz e cor:** Amarelo/dourado (sol) sobre cinza (anel) e bege claro (fundo) — paleta
  consistente com o `theme_color`/`background_color` do `site.webmanifest`.
- **Composição:** Ícone centralizado, simétrico.
- **Área limpa para texto:** Não se aplica.
- **Marcas de terceiros:** Nenhuma.
- **Rostos identificáveis:** 0.
- **Qualidade técnica:** Vetorial/limpo, sem defeitos; fundo sólido opaco (RGB, sem alpha) nos
  três arquivos.
- **Crop sugerido:** Não se aplica.
- **Aproveitamento:** Não se aplica — são ícones de interface (favicon/PWA), não fotos do
  acervo para alocação de layout.

---

## 6. Cobertura por modalidade

Contagem por foto do acervo (16 fotos, `mud-800w.jpg` contada junto com `mud.jpg` por ser o
mesmo conteúdo; uma foto pode contar em mais de uma frente):

| Frente | Fotos | Quais |
|---|---|---|
| Corrida | 4 | `kart.jpeg`, `mud.jpeg`, `run.jpeg`, `runn.jpeg` |
| Calistenia | 1 | `acad.jpeg` |
| Treino Híbrido | 1 | `spinnet.jpeg` |
| Performance | 4 | `mud.jpg`/`mud-800w.jpg`, `rope.jpg`, `force.jpeg`, `spinnet.jpeg` |
| **Recovery** | **0** | — |
| **Lifestyle** | **0** | — |
| Evento/OCR | 9 | `hill.jpg`, `mud.jpg`/`mud-800w.jpg`, `wall.jpg`, `rope.jpg`, `crowd.jpg`, `felpbravus.jpeg`, `force.jpeg`, `mudd.jpeg`, `mud.jpeg` |
| Comunidade | 10 | `hill.jpg`, `mud.jpg`/`mud-800w.jpg`, `wall.jpg`, `crowd.jpg`, `acad.jpeg`, `kart.jpeg`, `mud.jpeg`, `mudd.jpeg`, `park.jpeg`, `runn.jpeg` |
| **Retrato** | **0** | — |

**Três frentes com zero fotos: Recovery, Lifestyle e Retrato.** Não há nenhuma imagem de
alongamento, gelo, massagem ou descanso pós-treino (Recovery); nenhuma imagem de convívio
casual fora do contexto de treino/prova (Lifestyle); e nenhum retrato individual posado — as
fotos com uma só pessoa em destaque (`rope.jpg`, `force.jpeg`, `felpbravus.jpeg`, `run.jpeg`)
são todas fotos de ação em pleno evento/treino, não retratos no sentido de pose controlada.

`park.jpeg` foi contada só em Comunidade — a estrutura metálica visível na borda esquerda é
ambígua demais (pode ser barra fixa ou apenas um brinquedo/trave) para classificar com
confiança como Calistenia.

---

## 7. Pendências

- **Não gerei nenhum `.webp`**, por regra explícita da Tarefa 3 — os 10 arquivos `.webp` que
  faltam (listados na seção 2) continuam faltando; a correção do Alerta de produção depende
  de uma etapa seguinte, fora deste escopo.
- **Não abri os arquivos com nenhuma ferramenta de metadata além do que o Pillow expõe.** Não
  verifiquei campos de EXIF além de `Orientation` (câmera, data de captura, GPS) — não fazia
  parte do pedido da Tarefa 1, mas registro que não foram conferidos, caso seja relevante para
  decisões de direito de imagem/procedência.
- **Não tenho como confirmar identidade das pessoas fotografadas** para fins de LGPD além de
  contar rostos nítidos — não há como saber se há termo de uso de imagem assinado para os
  participantes dos eventos de terceiros (Bravus Race) que aparecem em 8 das 16 fotos.
- **Os dois logos não identificados com certeza** (`park.jpeg`: camiseta verde com "G"; nomes de
  banner em `spinnet.jpeg`, ilegíveis por estarem espelhados) ficaram como "não identificado" —
  não tentei adivinhar a marca.
