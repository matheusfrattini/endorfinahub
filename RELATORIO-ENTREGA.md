# Relatório — Entrega: Campinas, CFG.email e ajustes finos

Execução das Tarefas 1 a 5 de `ENTREGA-HOJE.md`.

---

## ⚠️ O que você precisa fazer manualmente

Nada do que foi feito aqui chega sozinho em produção:

1. **Apps Script:** abrir `apps-script/endorfina-formulario.gs`, colar o conteúdo atualizado
   no editor do Google Apps Script e criar **Nova versão** do deploy. A única mudança neste
   arquivo foi textual (linha ~405: `cidade: 'Jacareí'` → `cidade: 'Campinas'` no payload de
   teste de `instalar()`) — nenhuma lógica de envio, planilha ou WhatsApp foi tocada.
2. **Publicar os arquivos do site** (`index.html`, `css/style.css`, `js/main.js`,
   `site.webmanifest`, `README.md`) — nada foi enviado a nenhum servidor, só commitado
   localmente.
3. **Resolver a divergência de e-mail (ver abaixo, é importante).**

### 🔴 CFG.email × AVISAR_EMAIL — ainda desalinhados, por decisão sua

Você confirmou manter a edição pendente de `CFG.email` em `js/main.js` como estava:
**`endorfina10hub@gmail.com`**.

O Apps Script (`AVISAR_EMAIL`, linha 1 do `.gs`) continua com **`endorfinahub@gmail.com`** —
regra 1 do brief só permitia mudanças de texto relacionadas a Jacareí nesse arquivo, então eu
não alterei `AVISAR_EMAIL`. Resultado: o e-mail que aparece no site (rodapé, seção Contato) é
diferente do e-mail que recebe o aviso de novo lead pelo Apps Script.

Se isso não for intencional, ajuste manualmente um dos dois campos antes do deploy:
- `js/main.js`, linha 7 (`email:`) — o que aparece no site; ou
- `apps-script/endorfina-formulario.gs`, linha 1 (`AVISAR_EMAIL`) — pra onde vai o aviso.

---

## Resultado das 6 verificações (Tarefa 5)

| # | Verificação | Resultado |
|---|---|---|
| 1 | Busca `jacare` (case-insensitive, sem acento) | ✅ Zero ocorrências fora de relatórios/briefs históricos (ver lista abaixo). |
| 2 | Auditoria de referências de imagem (`src`/`srcset`/`href`/`url()`) | ✅ 57 referências verificadas por script — zero órfãs, todos os arquivos existem. |
| 3 | Toda `<img>` de conteúdo tem `width`, `height` e `alt` | ✅ 13 tags `<img>` conferidas — todas com os três atributos; `alt=""` só nas 2 decorativas (`mud`, `crowd`), com `aria-hidden="true"`, como já era. |
| 4 | Lint/parse de sintaxe (`.js` e `.gs`) | ✅ `js/main.js` e `apps-script/endorfina-formulario.gs` passam em `node --check`. |
| 5 | Contagem de uso de cada foto | ✅ 13 fotos em uso, cada uma exatamente 1 vez. `hibrido-corda-naval.jpg` (já excluída, ver `RELATORIO-IMAGENS.md`) e `ocr-selfie-trilha.jpg` (reserva, Tarefa 4) seguem com 0 usos, sem estarem órfãs — são reserva deliberada. |
| 6 | Busca por `wa.me` hardcoded fora do `CFG` | ✅ Único `wa.me` no HTML é o botão flutuante, com `data-cfg="whatsapp"` — sobrescrito por `applyCFG()` em runtime. Zero hardcoded de fato. |

**Arquivos com `jacare` remanescente (intocados, são registro histórico):**
`RELATORIO.md`, `RELATORIO-FORMULARIO.md` (padrão `RELATORIO-*.md`, exceção explícita da regra
1.4) e também `INTEGRACAO-FORMULARIO.md` e `endorfina-hub-v2.md` — que não seguem o padrão de
nome `RELATORIO-*.md`, mas são briefs de tarefas já executadas (mesma natureza de
`ENTREGA-HOJE.md`), não documentação viva do projeto. Tratei-os como registro e não reescrevi;
se a intenção era outra, me avise e eu atualizo o texto deles também.

---

## Arquivos alterados por tarefa

**Tarefa 1 — remover Jacareí** (`d1baefa`)
`index.html`, `css/style.css`, `js/main.js`, `apps-script/endorfina-formulario.gs`,
`site.webmanifest`, `README.md`

Cobriu: meta description, `og:description`, `twitter:description`, JSON-LD `areaServed`, tag
`Training Club Híbrido · Jacareí + Campinas` no hero, 2 cards "Sunday Run — Jacareí" (Início e
Experiências), 2 ocorrências de "Treinos coletivos semanais em Jacareí e Campinas" (card e
parágrafo, página Treinos), `<option>Jacareí</option>` do select de cidade, placeholder de
telefone `(12)` → `(19)` (formulário e modal), texto de fallback "Onde treinamos" e do rodapé,
`CFG.cidades`, os 3 textos de `DESCS` no roteador, o payload de teste do `.gs`.

**Achado não previsto no brief — stat duplicado (decisão sua):** a Tarefa 1.3 pedia pra trocar
o stat "[2] Cidades: Jacareí e Campinas" por "[6] Frentes de treino" — mas esse card já existia
no bloco (era o stat anterior). Você optou por remover o card Jacareí em vez de duplicar; o
grid de stats caiu de 4 para 3 colunas (`.stats` em `css/style.css`, com stack em coluna única
≤780px, igual ao padrão de `.grid-3`).

**Tarefa 2 — consolidar CFG.email** (`6389a37`)
`js/main.js` — commitada a edição pendente (`endorfina10hub@gmail.com`) como estava, por
decisão sua. Ver aviso no topo sobre o desalinhamento com `AVISAR_EMAIL`.

**Tarefa 3 — fundir Recovery + Lifestyle** (`70d3b0d`)
`index.html`, `css/style.css` — os dois `.tipo-band` (Recovery, Lifestyle) viraram um único
`.tipo-band` com grid de 2 colunas (`gap:64px`), `h2` reduzido para
`clamp(1.6rem,3vw,2.4rem)` em cada coluna, `padding` vertical `140px` (mobile `80px`,
inalterado), empilhando em coluna única (`gap:56px`) ≤780px. A seção de citação (`.dark`
"Aprendi que o descanso também é treino...") que ficava entre os dois blocos passou a vir
depois do bloco fundido — não havia como preservar sua posição "no meio" sem duplicar o
`.tipo-band`.

**Tarefa 4 — remover foto de "Já realizadas"** (`59da58f`)
`index.html` — seção "Já realizadas" virou só tipografia (`.head` com `mono` + `h2` + `p.lede`,
sem `.split`/`.figure`). `ocr-selfie-trilha.jpg` (e variantes `-800w`/`.webp`) seguem em
`assets/img/`, sem uso e sem realocação, como pedido. Adjacência terra/âmbar entre "Já
realizadas" e "Além da agenda" (achado do `RELATORIO-ORGANIZACAO.md`) está resolvida — as duas
seções sem foto entre "Card do Bravus Race" (`ocr-lama-retrato`, terra) e "Além da agenda"
(`ocr-barra-suspensao`, terra) quebram a adjacência. Nenhum outro `.tipo-band` sobrou na
página (só existe mais um agora, o fundido da Tarefa 3), então não há violação de blocos
tipográficos consecutivos.

**Tarefa 5 — este relatório**
`RELATORIO-ENTREGA.md` (novo).

---

## `[colchetes]` pendentes de dado do cliente

Nenhum foi preenchido ou inventado (regra 4). Lista completa, por página:

**Config (`js/main.js`, `CFG`)**
- `whatsapp`: `'5500000000000'` — placeholder de 13 dígitos, ainda não é um número real.
- `sheetUrl`: `'COLE_AQUI_A_URL_DO_APPS_SCRIPT'` — depende do deploy do `.gs` (passo manual 1).
- `grupo`: `''` — link do grupo de WhatsApp, vazio.
- `siteUrl`: `'https://endorfinahub.com.br'` — comentário no código pede confirmação do domínio final.

**JSON-LD (`index.html`, `<head>`)**
- `"telephone": "[telefone de contato]"`
- `"openingHours": "[dias e horários de funcionamento]"`

**Início**
- 2 depoimentos: `[Nome] · corredora/aluno desde [mês/ano]`
- Stats: `[+300]` pessoas, `[40+]` experiências realizadas (o `[6]` frentes de treino já é
  valor real, não placeholder)

**O Hub**
- 6× `[Nome do profissional]` no grid do time

**O que fazemos**
- 4× `R$ [valor]` nos cards de serviço

**Experiências**
- 3× `[local]` nos itens da agenda
- 1 depoimento: `[Nome] · aluno desde [mês/ano]`

Nenhum desses estava relacionado a Jacareí — todos pré-existentes, listados aqui só para
consolidar o que falta antes do lançamento.
