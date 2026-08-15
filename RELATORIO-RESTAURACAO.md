# Relatório — Restauração das imagens do site

Execução das Tarefas 1 a 4 de `RESTAURAR-IMAGENS.md`. Objetivo: eliminar o quebra de imagem
em produção diagnosticado em `RELATORIO-IMAGENS.md` (seção 2) — zero `.webp` existiam em
`assets/img/`, mas todos os `<picture>` do site abrem com `<source type="image/webp">`.

---

## O que foi feito, na ordem

1. **`tools/gerar-imagens.py`** — script Pillow idempotente que lê cada `.jpg`/`.jpeg` de
   `assets/img/` (ignorando os que já são derivadas `-800w`) e gera `<nome>.webp`,
   `<nome>-800w.jpg` e `<nome>-800w.webp`.
2. Rodei o script sobre o acervo como estava. Os 14 arquivos que faltavam (seção 4.1 do
   relatório anterior) foram gerados; nenhum dos 5 `.jpg` em uso no site (`hill`, `mud`, `wall`,
   `rope`, `crowd`) foi alterado — só `mud-800w.jpg`, que já era uma derivada existente, foi
   regravado.
3. Renomeei as 10 fotos órfãs para nomes descritivos (tabela na seção 4) e rodei o gerador de
   novo, para essas 10 saírem com derivadas sob o nome novo.
4. Este relatório.

---

## ⚠️ Achado durante a Tarefa 2: colisão de nome `mud.jpg` × `mud.jpeg`

Antes do rename da Tarefa 3, `mud.jpg` (em uso, evento de obstáculos) e `mud.jpeg` (órfã,
corrida de rua — ver `RELATORIO-IMAGENS.md`) geravam saída para o **mesmo** nome de arquivo:
`mud.webp`, `mud-800w.jpg`, `mud-800w.webp`. O script processa os arquivos em ordem alfabética
e `mud.jpeg` vem antes de `mud.jpg` (`.jpeg` < `.jpg` por ordenação de string) — então a
derivada de `mud.jpg` sobrescreveu a de `mud.jpeg` por último, sem aviso.

**O resultado final ficou correto por sorte de ordenação**, não por design: confirmei nas
imagens em disco que `mud.webp`/`mud-800w.jpg`/`mud-800w.webp` são 1200×784 (dimensão de
`mud.jpg`, a foto certa), não 1078×1386 (`mud.jpeg`). Ainda assim, é exatamente o tipo de
armadilha silenciosa que a Tarefa 3 existe para eliminar — depois do rename de `mud.jpeg` para
`corrida-medalhas.jpg`, a colisão não existe mais para nenhum arquivo do acervo. Não modifiquei
o script para detectar colisões de nome porque não fazia parte do pedido e o problema já é
resolvido pela própria Tarefa 3; registro aqui para o caso de novas fotos criarem uma colisão
parecida no futuro (duas fontes com o mesmo nome-base e extensões diferentes).

---

## 1. Arquivos gerados

30 arquivos novos + 1 regravado (`mud-800w.jpg`), cobrindo os 15 nomes-base do acervo
(5 em uso + 10 recém-renomeados):

| Base | Original (fonte) | `.webp` (full) | `-800w.jpg` | `-800w.webp` |
|---|---|---|---|---|
| `hill` | 1200×784, 225,2 KB | 1200×784, 190,4 KB | 800×523, 109,4 KB | 800×523, 94,8 KB |
| `mud` | 1200×784, 230,9 KB | 1200×784, 187,9 KB | 800×523, 115,3 KB | 800×523, 103,6 KB |
| `wall` | 1200×784, 146,4 KB | 1200×784, 99,1 KB | 800×523, 77,8 KB | 800×523, 55,8 KB |
| `rope` | 784×1200, 132,8 KB | 784×1200, 87,0 KB | 784×1200*, 131,0 KB | 784×1200*, 81,2 KB |
| `crowd` | 644×1200, 142,7 KB | 644×1200, 108,8 KB | 644×1200*, 138,0 KB | 644×1200*, 100,6 KB |
| `calistenia-grupo` | 1280×854, 259,0 KB | 1280×854, 170,7 KB | 800×534, 111,2 KB | 800×534, 87,6 KB |
| `comunidade-patio` | 1280×1280, 422,6 KB | 1280×1280, 346,3 KB | 800×800, 173,2 KB | 800×800, 153,0 KB |
| `corrida-dupla` | 1066×1600, 219,0 KB | 1066×1600, 129,2 KB | 800×1201, 134,4 KB | 800×1201, 85,1 KB |
| `corrida-grupo-rua` | 900×1600, 241,7 KB | 900×1600, 181,9 KB | 800×1422, 179,4 KB | 800×1422, 135,8 KB |
| `corrida-medalhas` | 1078×1386, 348,1 KB | 1078×1386, 293,9 KB | 800×1029, 201,9 KB | 800×1029, 176,2 KB |
| `corrida-solo` | 1070×1600, 244,8 KB | 1070×1600, 155,4 KB | 800×1196, 144,3 KB | 800×1196, 97,6 KB |
| `hibrido-corda-naval` | 1280×854, 156,6 KB | 1280×854, 92,0 KB | 800×534, 68,0 KB | 800×534, 47,6 KB |
| `ocr-barra-suspensao` | 854×1280, 150,5 KB | 854×1280, 88,6 KB | 800×1199, 122,4 KB | 800×1199, 72,7 KB |
| `ocr-lama-retrato` | 1600×1066, 232,6 KB | 1600×1066, 138,8 KB | 800×533, 72,2 KB | 800×533, 52,8 KB |
| `ocr-selfie-trilha` | 960×1280, 349,8 KB | 960×1280, 296,2 KB | 800×1067, 221,6 KB | 800×1067, 204,0 KB |

`*` = sem upscale, ver seção 5.

---

## 2. Comparativo de peso — JPEG vs WebP

| | Peso total |
|---|---|
| JPEG original (15 fontes, resolução cheia) | 3.502,6 KB |
| WebP gerado (15, mesma resolução) | 2.566,2 KB |
| **Economia no full-size** | **26,7%** |
| JPEG `-800w` gerado (15) | 2.000,1 KB |
| WebP `-800w` gerado (15) | 1.548,5 KB |
| **Economia no `-800w`** | **22,6%** |
| Total de `.webp` gerados (full + 800w, 30 arquivos) | 4.114,7 KB |

A economia de WebP sobre JPEG na mesma resolução ficou entre 22% e 27% — consistente com o
que se espera de `quality=78-80`/`method=6` em fotos com bastante detalhe (pele, vegetação,
multidões), que comprimem pior que ilustrações ou fotos de fundo mais liso.

---

## 3. Auditoria de referências pós-correção

Repeti a varredura de `index.html`, `css/style.css`, `js/main.js` e `site.webmanifest` por
`src`, `srcset`, `href` de preload e `url()`: **23 referências únicas a imagem, 0 órfãs.**

Os 14 arquivos que faltavam na auditoria anterior (`RELATORIO-IMAGENS.md`, seção 4.1) agora
existem todos:

```
hill.webp ✓       hill-800w.webp ✓    hill-800w.jpg ✓
mud.webp ✓        mud-800w.webp ✓
rope.webp ✓       rope-800w.webp ✓    rope-800w.jpg ✓
crowd.webp ✓      crowd-800w.webp ✓   crowd-800w.jpg ✓
wall.webp ✓       wall-800w.webp ✓    wall-800w.jpg ✓
```

Também abri os 28 (agora 30, após a Tarefa 3) `.webp` gerados com Pillow — todos decodificam
sem erro e as dimensões batem com o esperado.

---

## 4. Tabela de-para dos renames (Tarefa 3)

| Nome antigo | Nome novo |
|---|---|
| `acad.jpeg` | `calistenia-grupo.jpg` |
| `kart.jpeg` | `corrida-grupo-rua.jpg` |
| `park.jpeg` | `comunidade-patio.jpg` |
| `run.jpeg` | `corrida-solo.jpg` |
| `runn.jpeg` | `corrida-dupla.jpg` |
| `mud.jpeg` | `corrida-medalhas.jpg` |
| `mudd.jpeg` | `ocr-selfie-trilha.jpg` |
| `felpbravus.jpeg` | `ocr-lama-retrato.jpg` |
| `force.jpeg` | `ocr-barra-suspensao.jpg` |
| `spinnet.jpeg` | `hibrido-corda-naval.jpg` |

Feito com `git mv`, preservando o histórico de cada arquivo. As derivadas geradas na Tarefa 2
sob o nome antigo (`acad.webp`, `kart-800w.jpg` etc.) foram removidas antes de regenerar sob o
nome novo, para não deixar cópias duplicadas e obsoletas no acervo — o próprio problema que a
Tarefa 3 existe para resolver.

Os 5 arquivos em uso no site (`hill.jpg`, `mud.jpg`, `wall.jpg`, `rope.jpg`, `crowd.jpg`) não
foram tocados nem renomeados.

---

## 5. Fontes que não puderam gerar `-800w` sem upscale

Duas fontes já têm largura original menor que 800px — a variante `-800w` foi gerada na largura
original, sem ampliar (regra do gerador: nunca faz upscale):

| Arquivo | Largura original | `-800w` gerado em |
|---|---|---|
| `crowd.jpg` | 644px | 644px (idêntico à fonte) |
| `rope.jpg` | 784px | 784px (idêntico à fonte) |

Nos dois casos o `<source>` de 800w no `srcset` do `index.html` aponta para um arquivo que
existe e é válido — só não é, de fato, mais largo que a versão "cheia". Isso não quebra nada
(o navegador escolhe pela regra `sizes`, não pela largura real do arquivo), mas os dois
arquivos `-800w.*` de `crowd`/`rope` são, na prática, cópias do arquivo de resolução cheia
recomprimidas com qualidade menor (78 em vez de 80) — ligeiramente mais leves, mesma resolução.

---

## 6. Checklist de verificação manual (para você, no navegador)

- [ ] Abrir a home com cache limpo (hard reload / Ctrl+Shift+R) e confirmar que o hero
      (imagens `hill`/`mud` de fundo) carrega normalmente, sem ícone de imagem quebrada.
- [ ] Abrir DevTools → Network, filtrar por `Img`, recarregar a página e confirmar
      **zero requisições 404** para `assets/img/`.
- [ ] Percorrer as 5 rotas do site (início, hub, treinos, experiências, contato) e confirmar
      que nenhuma imagem aparece quebrada em nenhuma delas.
- [ ] Reduzir a janela para ≤780px (ou emular mobile no DevTools) e, no painel Network,
      confirmar que as URLs `-800w.webp`/`-800w.jpg` são as efetivamente carregadas, não as de
      resolução cheia.
- [ ] Testar num navegador sem suporte a WebP (ou forçar via DevTools) e confirmar que o
      `<source type="image/jpeg">` assume corretamente.

---

## O que não consegui validar, e por quê

- **Nenhum teste em navegador real** — ambiente sem browser; a verificação foi 100% por
  decodificação Pillow + auditoria estática de referências. O checklist acima é o que sobra
  para você confirmar visualmente.
- **Qualidade visual percebida do WebP em `quality=78-80`** — não fiz comparação lado a lado
  em tela; os números de economia de peso (seção 2) são objetivos, mas a avaliação de "ficou
  bom visualmente" fica para o checklist manual.
