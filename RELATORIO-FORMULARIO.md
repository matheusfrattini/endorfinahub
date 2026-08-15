# Relatório — Integração do formulário e rastreio de WhatsApp

Execução das Tarefas 1 a 5 de `INTEGRACAO-FORMULARIO.md`.

Esta é a **segunda execução** deste brief neste projeto. Entre a primeira execução (que gerou
a versão anterior deste relatório) e agora, uma feature separada — um **modal de contato**
(documentada em [`docs/INSTALACAO-MODAL.md`](docs/INSTALACAO-MODAL.md), sem relatório próprio
nem controle de versão até esta sessão) — foi integrada em `index.html`, `css/style.css` e
`js/main.js`, e substituiu por inteiro o `apps-script/endorfina-formulario.gs` que a primeira
execução deste brief tinha criado. Este relatório reflete o estado **atual** do projeto, não
repete achados que deixaram de ser verdade, e destaca o que mudou.

---

## ⚠️ Achados mais importantes (leia antes do resto)

### 1. O rastreio de cliques em WhatsApp estava com o back-end quebrado

A versão do `.gs` trazida pelo modal (`_entrada()`, `_waLink()`, relatório semanal) **não tinha
mais** o suporte a `Cliques WhatsApp` que a primeira execução deste brief havia criado
(`_clique()`, `ABA_CLIQUES`, o branch `tipo === 'clique_whatsapp'` em `doPost`). O front-end
(`registrar()`, em `js/main.js`) continuava mandando o beacon certinho; o back-end simplesmente
não sabia mais o que fazer com `tipo: 'clique_whatsapp'` e caía em
`if (!p.nome || !p.fone) return _ok('faltam campos')` — rejeição silenciosa, sem erro nenhum
visível (o `fetch`/`sendBeacon` roda em modo que nunca expõe esse tipo de falha no console).
Ou seja: o front-end de rastreio estava perfeito e o Sheets nunca ia receber uma linha sequer.

**Corrigido nesta sessão**: mesclei o suporte a cliques de volta na versão atual do `.gs`
(a que tem o modal), sem tocar em nada do modal. Ver `apps-script/endorfina-formulario.gs` e o
commit `fix(apps-script): restore click-tracking support after modal merge`. **Você precisa
colar o `.gs` atualizado no editor do Apps Script e fazer Nova Versão** para isso valer — ver
checklist no fim.

### 2. O botão flutuante de WhatsApp não vai mais direto para o WhatsApp

Isso não é uma mudança desta tarefa — é um efeito colateral do modal, que também mudou o
comportamento do botão flutuante (`a.wa`) depois da primeira execução deste brief. Hoje esse
link tem tanto `href="https://wa.me/..."` quanto `data-mc-abrir`, e o handler do modal chama
`preventDefault()` nele — então **clicar no botão flutuante abre o modal, não o WhatsApp**.

Isso não quebra o rastreio (a captura do clique acontece em fase de *capture*, antes do
`preventDefault()` do modal, que roda em fase de *bubble* — a linha ainda cai na planilha), mas
muda o que a métrica significa: um registro em `Cliques WhatsApp` com `botao = Flutuante` hoje
indica "abriu o modal", não "chegou ao WhatsApp". Quem realmente é redirecionado para o
WhatsApp depois de preencher o modal não gera um novo clique rastreável, porque esse redirect
final é `window.location.href = url` (JavaScript), não um clique real num link — só o link de
fallback "Não abriu? Toque aqui" do modal, se clicado manualmente, geraria um clique real e
seria capturado. Registrei isso para você não interpretar `Cliques WhatsApp` como "conversas
iniciadas": é "intenção demonstrada" (abriu o botão/CTA), que hoje é o modal na maioria dos
casos.

### 3. O `#lead` form (seção "Contato") ainda não integra com a planilha

Confirmado de novo: `js/main.js` tem dois caminhos de contato. O `#modal-contato` (novo, do
outro dev) já grava na planilha e dispara e-mail. O formulário `#lead` da página "Contato"
segue só montando o texto e abrindo `wa.me` — nenhum `fetch`/`sendBeacon` para o Apps Script.
Não é o bloco protegido pela regra 1 (esse bloco marcado, com honeypot no HTML do `#lead`,
nunca existiu no código, nas duas execuções deste brief) — não toquei nele.

---

## O que foi alterado nesta sessão, arquivo por arquivo

| Arquivo | Mudança |
|---|---|
| `apps-script/endorfina-formulario.gs` | Restaurado o suporte a cliques (`ABA_CLIQUES`, `COLUNAS_CLIQUE`, `_clique()`, `_abaClique()`, `resumoCliques()`, `testarClique()`, branch `tipo === 'clique_whatsapp'` em `doPost`) por cima da versão atual (com modal). Nada do modal foi alterado. |
| `apps-script/README.md` | Seção "Status atual da integração" reescrita para descrever os dois fluxos reais (modal + rastreio de cliques) e o aviso sobre a regressão corrigida. |
| `RELATORIO-FORMULARIO.md` | Este arquivo — reescrito para refletir o estado atual do projeto. |
| `js/main.js`, `index.html`, `css/style.css` | **Não alterados.** O bloco de rastreio de cliques (Tarefa 2) já estava embutido em `js/main.js` de uma execução anterior, correto e intacto — conferido linha a linha, nenhuma mudança necessária. |
| Repositório | Não havia `git` neste projeto. Rodei `git init` e commitei em etapas (baseline → fix do `.gs` → este relatório), a pedido seu. |

---

## Tarefa 1 — Validação do CFG (`js/main.js`)

```js
var CFG = {
  whatsapp:   '5500000000000',
  instagram:  'https://instagram.com/endorfina.hub',
  grupo:      '',
  email:      'contato@endorfinahub.com.br',
  sheetUrl:   'COLE_AQUI_A_URL_DO_APPS_SCRIPT',
  cidades:    'Jacareí e Campinas — SP',
  siteUrl:    'https://endorfinahub.com.br'
};
```

| Campo | Valor encontrado (mascarado) | Resultado |
|---|---|---|
| `whatsapp` | `*********0000` (13 dígitos, só números, começa com `55`) | **Formato válido**, mas é placeholder (zeros), não um número real. Sem `+`, espaço, hífen ou `https://wa.me/` embutido — não é o bug descrito no brief. Precisa ser trocado antes do lançamento. |
| `sheetUrl` | `COLE_AQUI_A_URL_DO_APPS_SCRIPT` | **Não configurado** — texto de instrução, não uma URL. Não é o caso "`/dev` em vez de `/exec`". Enquanto estiver assim, tanto o rastreio de cliques quanto o modal gravam nada, por design (checagem `indexOf('http')`/`/^https:\/\//`). |
| `email` | `contato@endorfinahub.com.br` | Preenchido, fora do escopo de validação pedido. |
| `grupo` | *(vazio)* | Fora do escopo desta tarefa. |

**Busca por `wa.me` (e variantes `api.whatsapp.com`/`web.whatsapp.com`) em todo o projeto:**

```
index.html:472   <a class="wa" href="https://wa.me/5500000000000" data-cfg="whatsapp" data-mc-abrir ...>
js/main.js:101   if(key==='whatsapp') el.href = ... 'https://wa.me/'+val        ← via CFG, applyCFG()
js/main.js:125   window.open('https://wa.me/'+CFG.whatsapp+...)                  ← via CFG, submit do #lead
js/main.js:336   var url = 'https://wa.me/' + numero + '?text=' + ...            ← via CFG, submit do #mc-form (modal)
```

Nenhum `api.whatsapp.com`/`web.whatsapp.com` em lugar nenhum. `index.html:472` é o fallback
estático antes do JS rodar (`data-cfg="whatsapp"`), sobrescrito por `applyCFG()` no boot — não é
um hardcode solto. `js/main.js:336` é novo desde a última execução (código do modal): também
nasce do `CFG.whatsapp`, sem hardcode.

---

## Tarefa 2 — Rastreio de cliques (já implementado, código confirmado intacto)

Abordagem usada (da execução anterior, mantida): **embutido dentro da IIFE de `js/main.js`**,
não como arquivo separado — porque `CFG` é `var` privado da IIFE, então um segundo `<script>`
não teria acesso a ele (`typeof CFG` daria `'undefined'`). Colado depois do listener de `submit`
do `#lead` e antes de `applyCFG()`. A linha do endpoint já estava ajustada corretamente
(`return CFG.sheetUrl || '';`, sem o fallback `typeof CFG !== 'undefined'` que só faz sentido em
arquivo solto).

Reconferi o bloco inteiro linha a linha nesta sessão: nenhuma mudança necessária, nenhuma
regressão introduzida pelo modal (que foi colado depois, mais abaixo na mesma IIFE).

---

## Tarefa 3 — Apps Script versionado

`apps-script/endorfina-formulario.gs` **não é mais** o conteúdo literal do brief original —
é a versão que já estava no projeto (com suporte ao modal: `_entrada()` aceitando
`e.parameter` e `e.postData.contents`/JSON, `_waLink()`, relatório semanal por e-mail via
`criarGatilhoSemanal()`/`enviarRelatorioSemanal()`), **mais** o suporte a cliques que faltava
(achado #1 acima).

Decidi *não* sobrescrever pelo texto literal do brief porque isso reverteria o modal de
contato — uma feature real, já documentada e presumivelmente em uso — só para bater com um
texto de exemplo. Optei por mesclar em vez de escolher um dos dois por completo, conforme
combinado com você antes de editar.

Abas geradas hoje: `Leads`, `Eventos`, `Parcerias`, `Outros`, `Cliques WhatsApp` — confirmado
no código (`ABAS`, `ABA_PADRAO`, `ABA_CLIQUES`).

---

## Tarefa 4 — Verificação

| Item | Resultado |
|---|---|
| Rastreio carrega em todas as rotas | ✅ Site é uma única página (`index.html`) com roteador por hash (5 rotas: início/hub/treinos/experiências/contato); `js/main.js` carrega uma vez, o listener fica em `document` e vale para todas as rotas sem recarregar nada. |
| Listener usa captura (`true`) + delegação em `document` | ✅ `document.addEventListener('click', function(e){...}, true);`, confirmado. |
| Sem `preventDefault`/`return false`/`await` no caminho do clique de rastreio | ✅ Nenhum dos três dentro do bloco de rastreio. Existe um `preventDefault()` **de outro handler** (o do modal, em `data-mc-abrir`) que intercepta a navegação do botão flutuante *depois* do rastreio já ter disparado — ver achado #2, não é uma violação da regra 4, mas muda o significado do dado. |
| Todos os CTAs de WhatsApp usam `wa.me` | ✅ Confirmado na Tarefa 1. |
| Lint/parse de sintaxe | ✅ `node --check` limpo em `js/main.js` e em `apps-script/endorfina-formulario.gs` (copiado para `.js` temporário para o check — `.gs` roda em V8 do Apps Script, sintaxe compatível). |

---

## Checklist de testes manuais (para você, no navegador)

- [ ] **Antes de tudo:** preencher `CFG.whatsapp` com o número real e `CFG.sheetUrl` com a URL `/exec` real (ver `apps-script/README.md`), e colar o `.gs` **atualizado nesta sessão** no editor do Apps Script, fazendo **Nova Versão** no deploy.
- [ ] Clicar no botão flutuante de WhatsApp: hoje ele deve abrir o **modal**, não o WhatsApp direto (comportamento do modal, não desta tarefa) — e uma linha deve cair em **Cliques WhatsApp** com `botao = Flutuante`.
- [ ] Preencher o modal e enviar: conferir se cai uma linha em **Leads**, se o e-mail de aviso chega, e se o WhatsApp abre com a mensagem pronta (~1,1s depois).
- [ ] Enviar um lead de teste pelo formulário `#lead` (seção "Contato"): hoje isso **não grava nada na planilha nem dispara e-mail** — só abre o WhatsApp. Confirme se esse é o comportamento esperado ou se essa integração ainda está pendente com o outro desenvolvedor.
- [ ] Testar em mobile (ou reduzindo a janela abaixo de 780px) e conferir `dispositivo = Mobile` na aba de cliques.
- [ ] Acessar com `?utm_source=teste&utm_medium=teste&utm_campaign=teste` e conferir a coluna `campanha`.
- [ ] Bloquear a URL do Apps Script no DevTools e clicar no botão de WhatsApp: o fluxo (modal ou WhatsApp) precisa continuar funcionando normalmente — regra 4.
- [ ] Rodar `testarClique()` e `testarModal()` pelo editor do Apps Script e conferir que ambos retornam `{"ok":true,...}` e geram linha na aba certa.

---

## O que não consegui validar, e por quê

- **Nenhum teste em navegador real.** Ambiente sem browser — tudo verificado por leitura estática (`grep`, `node --check`), não por execução. O checklist acima é o que sobra para validação manual.
- **Qual `.gs` está de fato publicado hoje no editor do Apps Script.** O arquivo neste repositório é só uma cópia versionada (regra do próprio brief); não há como saber, sem acesso à conta do Hub, se a versão publicada já tem o suporte a cliques ou ainda está com a regressão do achado #1. Copie o arquivo atualizado e faça Nova Versão para ter certeza.
- **Se o `#lead` form vai receber a mesma integração do modal, ou se vai ser descontinuado a favor do modal.** É uma decisão de produto, não algo que eu deva inferir ou implementar sem confirmação sua.
