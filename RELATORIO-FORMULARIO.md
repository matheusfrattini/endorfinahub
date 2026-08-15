# Relatório — Integração do formulário e rastreio de WhatsApp

Execução das Tarefas 1 a 5 de `INTEGRACAO-FORMULARIO.md`.

---

## ⚠️ Achado mais importante (leia antes do resto)

O brief descreve o estado atual como: *"O formulário de contato envia os dados para um Google
Apps Script publicado como App da Web, que grava numa planilha e avisa por e-mail. Em seguida
abre o WhatsApp com a mensagem pronta. Isso já funciona."*

**Isso não é o que está no código.** Conferi `js/main.js` e `index.html` inteiros: o listener de
`submit` do formulário (`#lead`) só monta o texto e faz `window.open('https://wa.me/...')` —
não existe nenhum `fetch`/`sendBeacon` para planilha, nenhum bloco marcado
`FORMULÁRIO -> PLANILHA DO GOOGLE + WHATSAPP`, e nenhum campo honeypot (`empresa`) no HTML do
formulário. Hoje, enviar o formulário **não grava nada em planilha nem dispara e-mail** — só
abre o WhatsApp, exatamente como o botão flutuante.

Isso não bloqueou nenhuma das 5 tarefas (todas são aditivas e seguras mesmo sem essa integração
existir ainda), mas é preciso saber disso antes de assumir que "metade dos contatos fica
invisível" — hoje é **a totalidade** dos contatos que não cai em planilha, só o clique isolado
de WhatsApp que esta tarefa passa a rastrear. A integração do formulário com o Apps Script,
segundo o brief, está a cargo de outro desenvolvedor — não toquei nela (regra 1).

---

## O que foi alterado, arquivo por arquivo

| Arquivo | Mudança |
|---|---|
| `js/main.js` | Adicionado o bloco de rastreio de cliques em WhatsApp, **embutido dentro da IIFE principal** (não como arquivo separado — ver justificativa abaixo), logo depois do listener de `submit` do formulário e antes de `applyCFG()`. Nenhuma outra linha do arquivo foi tocada. |
| `apps-script/endorfina-formulario.gs` | Criado do zero. Cópia versionada do código a ser colado manualmente no editor do Google Apps Script. Não roda no site. |
| `apps-script/README.md` | Criado do zero. Explica instalação, o passo obrigatório de "Nova versão" a cada deploy, a armadilha do "Quem pode acessar", as abas geradas, e o status real da integração (ver achado acima). |
| `INTEGRACAO-FORMULARIO.md` | Salvo na raiz do projeto (era só um texto colado na conversa) para ficar versionado, como o `endorfina-hub-v2.md`. |

Nenhum arquivo de layout, CSS ou HTML foi alterado (regra 3).

---

## Tarefa 1 — Validação do CFG

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
| `whatsapp` | `*********0000` (13 caracteres, só dígitos, começa com `55`) | **Formato válido**, mas é um número placeholder (zeros), não um número real. Precisa ser trocado antes do lançamento — não é o bug descrito no brief (não tem `+`, espaço, hífen nem `https://wa.me/` embutido). |
| `sheetUrl` | `COLE_AQUI_A_URL_DO_APPS_SCRIPT` | **Não configurado.** Não é uma URL, não começa com `https://script.google.com/macros/s/`. Não é o caso "`/dev` em vez de `/exec`" — é texto de instrução, ainda não preenchido. Enquanto estiver assim, o rastreio de cliques (Tarefa 2) faz nada silenciosamente, por design (ver `endpoint()`/`registrar()`). |
| `email` | `contato@endorfinahub.com.br` | Preenchido (o brief presumia vazio — não é o caso; não fazia parte da validação pedida, só registro). |
| `grupo` | *(vazio)* | Como já era antes; fora do escopo desta tarefa. |

**Busca por `wa.me` hardcoded** em todos os `.html`/`.js`/`.css`:

```
js/main.js:101   if(key==='whatsapp') el.href = ... 'https://wa.me/'+val    ← via CFG, dentro de applyCFG()
js/main.js:125   window.open('https://wa.me/'+CFG.whatsapp+...)             ← via CFG, no submit do form
index.html:472   <a class="wa" href="https://wa.me/5500000000000" data-cfg="whatsapp" ...>
```

A ocorrência em `index.html:472` **não é um hardcode solto**: é o valor estático do HTML (fallback
antes do JS rodar), já marcado com `data-cfg="whatsapp"` e sobrescrito por `applyCFG()` no boot a
partir de `CFG.whatsapp` — hoje os dois valores até coincidem, por acaso, porque `CFG.whatsapp`
também é o placeholder de zeros. Nenhum `api.whatsapp.com` ou `web.whatsapp.com` encontrado em
lugar nenhum do projeto.

---

## Tarefa 2 — Abordagem escolhida: **embutido em `js/main.js`**, não arquivo separado

O brief oferecia as duas opções e pedia para registrar qual foi usada e por quê.

`js/main.js` inteiro é **uma única IIFE**: `(function(){ var CFG = {...}; ... })();`. `CFG` é
declarado com `var` **dentro** dessa função — ou seja, é uma variável privada ao escopo da
IIFE, **não fica disponível em `window`/escopo global**.

Se eu tivesse criado `js/rastreio-whatsapp.js` como arquivo separado (carregado depois de
`js/main.js` via segunda tag `<script>`, como o brief sugeria como padrão), o `typeof CFG !==
'undefined'` dentro dele teria dado sempre `'undefined'` — o rastreio nunca teria acesso a
`CFG.sheetUrl` e nunca funcionaria, silenciosamente, para sempre. É exatamente o cenário que o
brief previu na frase "se o projeto usar uma IIFE única [...] e você julgar melhor embutir" —
e é o caso aqui.

Colei o bloco (mantendo sua própria IIFE interna intacta) dentro da IIFE de `main.js`, depois
do listener de `submit` do formulário. Ajustei **só** a linha que lê o endpoint, como pedido:

```js
// antes (só funcionaria como arquivo solto, com fallback pra CFG global inexistente):
return (typeof CFG !== 'undefined' && CFG.sheetUrl) ? CFG.sheetUrl : '';
// depois (CFG já está no escopo, por closure):
return CFG.sheetUrl || '';
```

Nada mais do bloco original foi alterado — comentários internos (que ainda falam em "colar em
`main.js`") foram mantidos como no template.

---

## Tarefa 3 — Apps Script versionado

Criado `apps-script/endorfina-formulario.gs` com o conteúdo exato do brief, e
`apps-script/README.md` com instruções de instalação, o aviso de "Nova versão" a cada edição,
o aviso de "Quem pode acessar: Qualquer pessoa", e a tabela das 5 abas geradas
(`Leads`, `Eventos`, `Parcerias`, `Outros`, `Cliques WhatsApp`).

---

## Tarefa 4 — Verificação estática

| Item | Resultado |
|---|---|
| Rastreio carrega em todas as rotas | ✅ Embutido em `js/main.js`, carregado uma única vez via `<script src="js/main.js">` em `index.html`; o listener fica em `document` e vale para as 5 rotas do hash-router, sem precisar recarregar nada na troca de página. |
| Listener usa captura (`true`) + delegação em `document` | ✅ `document.addEventListener('click', function(e){...}, true);` — confirmado. |
| Sem `preventDefault`/`return false`/`await` no caminho do clique | ✅ O único `preventDefault()` dentro do bloco de rastreio é comentado como ausente de propósito ("sem preventDefault"); os dois `preventDefault()` que existem no arquivo são de outros handlers (navegação por hash e `submit` do formulário), não tocados por esta tarefa. Nenhum `await` no arquivo inteiro. |
| Todos os CTAs de WhatsApp usam `wa.me` | ✅ Confirmado na Tarefa 1 — só `wa.me`, nenhum `api.whatsapp.com`/`web.whatsapp.com`. |
| Lint/parse de sintaxe | ✅ `node --check` limpo em `js/main.js` e em `apps-script/endorfina-formulario.gs` (testado como JS puro — o `.gs` roda no V8 do Apps Script, sintaxe compatível). |

---

## Checklist de testes manuais (para você, no navegador)

- [ ] **Antes de tudo:** preencher `CFG.whatsapp` com o número real e `CFG.sheetUrl` com a URL `/exec` real do Apps Script (ver `apps-script/README.md`).
- [ ] Clicar no botão flutuante de WhatsApp em cada uma das 5 páginas e conferir se aparece uma linha na aba **Cliques WhatsApp** da planilha, com `botao = Flutuante` e a `origem` (hash) correta.
- [ ] Clicar em algum CTA de WhatsApp dentro do conteúdo (ex.: outro link com `wa.me`, se houver) e conferir se `botao` mostra o texto do link.
- [ ] Testar em mobile (ou reduzindo a janela abaixo de 780px) e conferir se `dispositivo = Mobile` na planilha.
- [ ] Acessar o site com `?utm_source=teste&utm_medium=teste&utm_campaign=teste` e conferir se a coluna `campanha` chega preenchida.
- [ ] Desligar a internet (ou bloquear a URL do Apps Script no DevTools) e clicar no botão de WhatsApp: **o WhatsApp precisa abrir normalmente**, mesmo sem registrar o clique — esse é o comportamento esperado (regra 4), não um bug.
- [ ] **Fora do escopo desta tarefa, mas necessário para o brief fazer sentido:** enviar um lead de teste pelo formulário e conferir se cai na planilha, dispara e-mail e abre o WhatsApp — hoje isso **não vai acontecer** (ver "Achado mais importante"), porque o `submit` do formulário não chama o Apps Script. Repetir com assunto "Quero ser parceiro" e conferir a aba `Parcerias` só fará sentido depois que essa integração for feita.

---

## O que não consegui validar, e por quê

- **Nenhum teste em navegador real.** Este ambiente não tem browser — tudo acima foi verificado por leitura estática do código (grep, `node --check`), não por execução. O checklist da seção anterior é o que sobra para validação manual.
- **Se a planilha/Apps Script realmente recebe e grava os cliques.** Depende de `CFG.sheetUrl` apontar para uma implantação real, o que não é o caso hoje (é placeholder). Sem isso, não há como testar de ponta a ponta.
- **O fluxo completo do formulário → planilha → e-mail → WhatsApp** descrito no brief como já funcionando. Como detalhado acima, essa integração não existe no código atual — não é algo que eu não consegui validar, é algo que ainda não foi implementado.
