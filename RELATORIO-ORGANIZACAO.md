# Relatório — Organização das páginas e redistribuição do acervo

Execução das Tarefas 1 a 6 de `ORGANIZAR-PAGINAS.md`. Pré-requisito conferido antes de
começar: todos os `.webp`/`-800w` existem, as 10 fotos órfãs já estão com nomenclatura
descritiva, auditoria de referências em zero órfãs (`RELATORIO-RESTAURACAO.md`).

Nota lateral: havia uma edição sua não commitada em `js/main.js` (`CFG.email`) quando comecei.
Não toquei nesse arquivo em nenhuma das 5 tarefas (regra 3) — a edição continua lá, intacta e
fora dos meus commits.

---

## 1. Tabela final de alocação — foto → página → seção

14 fotos usadas, cada uma em exatamente **uma** seção (confirmado por script: contei quantas
vezes cada `<img src="assets/img/<foto>.jpg">` aparece em `index.html` — todas deram 1,
`hibrido-corda-naval` deu 0).

| Foto | Página | Seção | `object-position` |
|---|---|---|---|
| `wall` | Início | Hero, camada A | `center 65%` |
| `corrida-grupo-rua` | Início | Hero, camada B | `center 40%` |
| `rope` | Início | Quem somos | `center center` |
| `corrida-medalhas` | Início | Agenda / Próximas experiências | `center 30%` |
| `mud` | Início | CTA final ("Faça parte") | `center 60%` |
| `hill` | O Hub | Topo da página | `center 55%` |
| `comunidade-patio` | O Hub | Split "Comunidade" (nova) | `center 45%` |
| `calistenia-grupo` | Treinos | Topo da página (novo split) | `center 40%` |
| `corrida-solo` | Treinos | "Grupos de corrida" (novo, principal) | `center center` |
| `corrida-dupla` | Treinos | "Grupos de corrida" (novo, card secundário) | `center 35%` |
| `crowd` | Experiências | Faixa "Escala" no topo (nova, reaproveita `.cta-band`) | `center 40%` |
| `ocr-lama-retrato` | Experiências | "Card do Bravus Race" (novo) | `center center` |
| `ocr-selfie-trilha` | Experiências | "Já realizadas" | `center 35%` |
| `ocr-barra-suspensao` | Experiências | "Além da agenda" (novo, topo da zona Recovery/Lifestyle) | `center center` |

**Contato:** sem imagem, como pedido — não havia nenhuma antes, nada a remover.

### Sobre "EVENTOS" e "EXPERIÊNCIAS" como duas tabelas separadas

O brief lista `EVENTOS` e `EXPERIÊNCIAS` como se fossem páginas distintas, mas o site só tem
5 rotas (Início, O Hub, O que fazemos, **Experiências**, Contato) — não existe uma página
"Eventos" separada. Interpretei as duas tabelas como duas **zonas temáticas dentro da mesma
página** `id="p-experiencias"`: a zona "Eventos" (faixa de escala → agenda → card do Bravus
Race → já realizadas) vem primeiro, a zona "Experiências" (recovery/lifestyle, com seu próprio
"topo" — `ocr-barra-suspensao`) vem depois. Registro essa leitura aqui porque é uma decisão de
interpretação, não algo explícito no brief — se a intenção era outra (por exemplo, duas rotas
novas), preciso que você confirme antes de eu mexer no roteador.

---

## 2. Fotos que não entraram no site

| Foto | Motivo |
|---|---|
| `hibrido-corda-naval.jpg` | Regra 5: está espelhada horizontalmente (texto de banner ao fundo aparece invertido — achado já registrado em `RELATORIO-IMAGENS.md`). Fica de fora desta rodada, sem uso em lugar nenhum. |

Nenhuma outra foto do acervo de 15 ficou de fora — as outras 14 têm alocação na tabela acima.

---

## 3. Verificação de alternância cromática (Tarefa 5.3)

Duas famílias, conforme o brief: **terra/âmbar** (`mud`, `rope`, `ocr-lama-retrato`,
`ocr-barra-suspensao`, `ocr-selfie-trilha`) e **céu/verde** (todas as outras).

Percorri a ordem final de cada página comparando só **seções diretamente consecutivas** —
uma seção sem foto entre duas fotos já quebra a adjacência, então não conta como violação.

| Página | Sequência de fotos (por seção) | Resultado |
|---|---|---|
| Início | Hero (wall+corrida-grupo-rua, céu — ver nota) → Quem somos (rope, terra) → Agenda (corrida-medalhas, céu) → CTA (mud, terra) | ✅ Alterna corretamente entre seções distintas. |
| O Hub | Topo (hill, céu) → [Time, sem foto] → Comunidade (comunidade-patio, céu) | ✅ Não são seções adjacentes — o grid do time separa as duas. |
| Treinos | Topo (calistenia-grupo, céu) → [Serviços, sem foto — separado em seção própria nesta tarefa] → Grupos de corrida (corrida-solo + corrida-dupla, céu) | ✅ Corrigido nesta tarefa: o grid de serviços virou uma seção própria (antes vivia dentro da mesma seção do topo, deixando as duas fotos céu/verde adjacentes). |
| Experiências | Faixa Escala (crowd, céu) → [Agenda, sem foto] → Card Bravus Race (ocr-lama-retrato, terra) → [Agenda — ver abaixo] → Já realizadas (ocr-selfie-trilha, terra) → **Além da agenda (ocr-barra-suspensao, terra)** → [Recovery, Lifestyle, sem foto] | ⚠️ Um caso não resolvido — ver abaixo. |
| Contato | Sem foto | — |

### ⚠️ Achado não corrigido: `ocr-selfie-trilha` → `ocr-barra-suspensao`, ambas terra/âmbar

A seção "Já realizadas" (`ocr-selfie-trilha`) fica diretamente seguida pela seção "Além da
agenda" (`ocr-barra-suspensao`) — as duas são terra/âmbar. Corrigi dois outros casos parecidos
nesta mesma tarefa (Treinos, e a ordem original de "Card do Bravus Race"/"Já realizadas" em
Experiências, que resolvi movendo a lista de agenda para entre as duas), porque em ambos os
casos eu tinha liberdade de posicionamento — o brief não fixava a ordem exata daquelas seções
novas. Este caso é diferente: `ocr-barra-suspensao` está explicitamente descrita como "Topo da
página" da zona Experiências, e "Já realizadas" é o item que fecha a tabela da zona Eventos —
as duas pontas têm posição fixada pelo brief. Reordenar exigiria inventar uma seção nova entre
elas (não pedida) ou desrespeitar o "topo"/"fechamento" que o brief definiu — por isso, sigo a
regra "reporte a posição, não reordene por conta própria" em vez de improvisar.

**Nota à parte (não é uma violação, mas registro por transparência):** o Hero da Início tem
duas fotos simultâneas na mesma seção (`wall` e `corrida-grupo-rua`, camada A e B da "costura
híbrida"), ambas céu/verde. Não conta como "seções adjacentes" — é uma seção só, com duas
fotos coexistindo por design — mas fica registrado caso vocês queiram uma delas em terra/âmbar
no futuro.

---

## 4. Overlays unificados

| Onde | Antes | Depois |
|---|---|---|
| `.cta-band` (CTA final da Início, faixa "Escala" de Experiências) | `.cta-band img{opacity:.28}` — escurecia a foto inteira de forma uniforme, sem gradiente | `.cta-band::after{background:linear-gradient(180deg, rgba(10,18,36,.25) 0%, rgba(10,18,36,.75) 100%)}`, imagem volta para opacidade 1 (o gradiente é quem escurece) |

**Não toquei** nos gradientes angulares do Hero (`.hero .layer.a::after` / `.layer.b::after`,
105deg/255deg) — eles não são um scrim de legibilidade de texto sobre foto, são o blend da
costura híbrida entre as duas camadas de imagem (o texto do hero fica em `.hero-in`, numa faixa
separada, não sobreposto diretamente aos pixels da foto). Não encontrei nenhum outro caso de
"foto com texto por cima" no CSS — só esses dois foram os candidatos reais.

Não há `filter: saturate()`/`brightness()` em nenhuma imagem do site (confirmado por busca —
o único `filter: brightness()` existente é do botão `.mc__enviar` do modal, não de foto).

---

## 5. Proporções por uso

| Uso | Antes | Depois |
|---|---|---|
| `.figure img` (split vertical — a maioria das fotos de conteúdo) | `aspect-ratio:4/5` | `aspect-ratio:2/3` |
| `.figure.card img` (card de evento — Preview de eventos, Card do Bravus Race) | não existia | `aspect-ratio:3/2` (classe nova) |
| `.figure.wide img` (topo de página em split largo — O Hub, Treinos) | `aspect-ratio:16/10` | Sem mudança — já correto, não é uma das 4 categorias do brief mas já satisfazia "contêiner com aspect-ratio declarado" |
| `.time-card figure` (retrato do time) | — | `aspect-ratio:3/4` (já correto desde a Tarefa 4) |
| Hero | `height:100svh` (viewport) | Sem mudança — ver nota abaixo |

**Por que não mexi no Hero:** a regra diz "hero: 16/9 (mobile: 4/5)" e também "a seção define a
altura, nunca a foto". O Hero já segue esse segundo princípio à risca — `height:100svh` faz a
*seção* ocupar a altura do viewport, e a foto só preenche o que sobra via `object-fit:cover`.
Trocar isso por `aspect-ratio:16/9` fixo seria pior, não melhor: quebraria o design de herói
full-bleed em telas muito altas ou muito baixas (a foto passaria a ter barras ou cortar de
forma imprevisível). Interpretei "16/9 (mobile 4/5)" como a *proporção aproximada* que o hero
já tem na prática em viewports comuns, não como uma instrução para trocar o mecanismo de altura
— mas é uma leitura minha, registro para você confirmar se a intenção era outra.

---

## 6. Confirmação: toda `<img>` de conteúdo tem `width`, `height` e `alt`

Conferido por script nas 14 `<img>` de conteúdo: todas têm as três. As duas imagens
puramente decorativas (`mud` no CTA da Início, `crowd` na faixa "Escala" de Experiências) têm
`alt=""` + `aria-hidden="true"` de propósito, por regra da Tarefa 1 — não é um `alt` faltando,
é um `alt` vazio deliberado.

---

## 7. Checklist de verificação manual (para você, no navegador)

- [ ] Percorrer as 5 páginas e confirmar visualmente que nenhuma foto se repete (a tabela da
      seção 1 diz que não repete pelo código; falta ver com os olhos como cada crop fica).
- [ ] DevTools → Network → filtrar por `Img`, reduzir a janela a ≤780px e recarregar: confirmar
      que as URLs `-800w.webp`/`-800w.jpg` são as carregadas, não as de resolução cheia.
- [ ] Conferir se as seções Recovery e Lifestyle (fundo escuro, só tipografia) parecem uma
      pausa editorial deliberada, não uma seção quebrada ou vazia por engano.
- [ ] Conferir se o grid do time (6 cards com inicial grande) mantém a altura estável — não deve
      haver salto de layout ao trocar um card por foto de teste.
- [ ] Rodar Lighthouse (aba Performance + a métrica CLS) e conferir se o CLS ficou abaixo de 0,1.
- [ ] Testar o card "Grupos de corrida" em Treinos especificamente: a foto secundária
      (`corrida-dupla`, 220px de largura) fica pequena de propósito — conferir se não fica
      apertada ou cortada de forma estranha em mobile.
- [ ] Conferir o crop do Hero em telas muito baixas (notebook com pouca altura) e muito altas
      (celular em modo retrato alongado) — é o único bloco que não usa `aspect-ratio` fixo.

---

## 8. O que não pude validar, e por quê

- **Nenhum teste visual em navegador real** — ambiente sem browser; tudo verificado por leitura
  estática (grep/regex sobre o HTML/CSS gerado) e scripts Python para contagem/adjacência, não
  por renderização real. O checklist acima é o que sobra para validação manual.
- **Se os crops (`object-position`) ficam bons na prática** — apliquei os valores exatos pedidos
  pela tabela do brief, mas só vendo renderizado dá pra confirmar se, por exemplo, `center 30%`
  em `corrida-medalhas` realmente enquadra as medalhas e não corta rostos.
- **CLS real via Lighthouse** — não tenho como rodar Lighthouse neste ambiente; a expectativa é
  boa (todo `<img>` tem `width`/`height`, todo contêiner de foto tem `aspect-ratio` exceto o
  Hero, que usa `100svh` fixo), mas o número real fica para o seu checklist.
- **A leitura de "EVENTOS"/"EXPERIÊNCIAS" como duas zonas de uma página só** (seção 1) e a
  decisão de não alterar o mecanismo de altura do Hero (seção 5) são interpretações minhas
  diante de um brief que não mapeia 1:1 com as páginas reais do site — ficam marcadas acima
  para você confirmar ou corrigir.
