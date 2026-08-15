# Endorfina Hub — Integração do formulário e rastreio de WhatsApp

> **Como usar:** salve este arquivo na raiz do projeto e mande no Claude Code:
> *"leia INTEGRACAO-FORMULARIO.md e execute as tarefas 1 a 5"*.

---

## Contexto

Site do **Endorfina Hub** (Training Club Híbrido — Jacareí e Campinas/SP), já em produção
com CSS e JS separados, imagens em `.webp` e bloco `CFG` centralizado em `js/main.js`.

O formulário de contato envia os dados para um **Google Apps Script** publicado como App da
Web, que grava numa planilha e avisa por e-mail. Em seguida abre o WhatsApp com a mensagem
pronta. Isso **já funciona**.

O que falta: o **botão flutuante de WhatsApp** manda a pessoa direto para a conversa e não
deixa rastro nenhum. Metade dos contatos fica invisível. Esta tarefa fecha esse buraco.

---

## Regras invioláveis

1. **Não altere a lógica de envio do formulário.** O bloco marcado
   `FORMULÁRIO -> PLANILHA DO GOOGLE + WHATSAPP` dentro do JS está validado e testado.
   Você pode ler, não pode reescrever `submit`, `fetch`, honeypot ou a montagem do `wa.me`.
2. **Zero dependência nova.** Sem npm, sem framework, sem lib de analytics.
   Só JavaScript nativo.
3. **Não mexa em cor, fonte, layout ou markup visual.** Esta tarefa é 100% comportamental.
4. **O rastreio nunca pode bloquear a conversão.** Se o endpoint falhar, estiver vazio ou
   fora do ar, o link do WhatsApp abre normalmente. Nada de `preventDefault`, nada de
   `await` antes de abrir o link, nada de bloquear o clique.
5. **Não invente valores de configuração.** Se um campo do `CFG` estiver vazio ou com
   placeholder, deixe como está e registre no relatório.

---

## Tarefa 1 — Conferir o bloco CFG

Em `js/main.js`, confirme que o `CFG` tem estas chaves e que os valores estão coerentes:

```js
var CFG = {
  whatsapp:  '5512999999999',   // 13 dígitos, sem +, sem máscara. DDD 12 (Jacareí) ou 19 (Campinas)
  instagram: 'https://instagram.com/endorfina.hub',
  grupo:     '',
  email:     '',
  sheetUrl:  '',                // URL do Apps Script, termina em /exec
  cidades:   'Jacareí e Campinas — SP'
};
```

Validações a fazer (reporte, **não corrija sozinho**):

- `CFG.whatsapp` deve conter **apenas dígitos** e ter **12 ou 13 caracteres**, começando com `55`.
  Se tiver `+`, espaço, parêntese, hífen ou a URL `https://wa.me/` embutida, **isso é um bug** — reporte.
- `CFG.sheetUrl`, se preenchido, deve começar com `https://script.google.com/macros/s/` e terminar em `/exec`.
  Se terminar em `/dev`, reporte: essa URL só funciona para o dono logado.
- Confirme que **nenhum** `wa.me` hardcoded sobrou espalhado pelo projeto. Rode uma busca
  em todos os `.html`, `.js` e `.css`. Todo link de WhatsApp do Hub deve nascer do `CFG`.

---

## Tarefa 2 — Adicionar o rastreio de cliques

Crie o arquivo `js/rastreio-whatsapp.js` com **exatamente** o conteúdo abaixo e carregue-o
no final do `<body>` de todas as páginas, **depois** de `js/main.js`.

Se o projeto usar uma IIFE única em `main.js` e você julgar melhor embutir em vez de criar
arquivo novo, pode fazê-lo — mas então cole o bloco **depois** do `CFG` e **depois** do
listener de submit, e ajuste apenas a linha que lê `CFG.sheetUrl` para o escopo correto.
Registre no relatório qual das duas abordagens você escolheu.

```javascript
/* ==================================================================
   ENDORFINA HUB — Rastreio dos cliques em WhatsApp
   ------------------------------------------------------------------
   ONDE COLAR: em js/main.js, DENTRO da IIFE principal, depois do
   bloco CFG e depois do listener de submit do formulário.

   O QUE FAZ: intercepta qualquer link que aponte para wa.me, registra
   o clique na planilha (aba "Cliques WhatsApp") e só então abre a
   conversa. Se o registro falhar ou demorar, o WhatsApp abre do mesmo
   jeito — a conversão nunca é bloqueada por causa do rastreio.
================================================================== */

(function () {

  /* usa o mesmo endpoint do formulário */
  function endpoint() {
    return (typeof CFG !== 'undefined' && CFG.sheetUrl) ? CFG.sheetUrl : '';
  }

  /* rótulo legível do botão, para você saber qual converte mais */
  function rotulo(a) {
    if (a.classList.contains('wa')) return 'Flutuante';
    var t = (a.textContent || '').replace(/\s+/g, ' ').trim();
    return t ? t.slice(0, 60) : 'Link WhatsApp';
  }

  function dispositivo() {
    return matchMedia('(max-width: 780px)').matches ? 'Mobile' : 'Desktop';
  }

  function campanha() {
    var q = new URLSearchParams(location.search);
    return ['utm_source', 'utm_medium', 'utm_campaign']
      .map(function (k) { return q.get(k); })
      .filter(Boolean)
      .join(' · ');
  }

  function registrar(a) {
    var url = endpoint();
    if (url.indexOf('http') !== 0) return;          /* endpoint não configurado */

    var dados = new URLSearchParams({
      tipo:        'clique_whatsapp',
      origem:      location.hash || '#inicio',
      botao:       rotulo(a),
      dispositivo: dispositivo(),
      referrer:    document.referrer || 'Acesso direto',
      campanha:    campanha()
    });

    /* sendBeacon não bloqueia a navegação e sobrevive à troca de aba */
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, dados);
    } else {
      fetch(url, { method: 'POST', mode: 'no-cors', body: dados, keepalive: true })
        .catch(function () {});
    }
  }

  /* delegação: pega inclusive links criados depois pelo CFG */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="wa.me"]') : null;
    if (!a) return;
    registrar(a);
    /* sem preventDefault: o link segue normalmente */
  }, true);

})();
```

---

## Tarefa 3 — Versionar o Apps Script

Crie `apps-script/endorfina-formulario.gs` com o conteúdo abaixo. **Este arquivo não roda no
site** — ele existe para ficar versionado no repositório. O código real vive no editor do
Google Apps Script e é colado manualmente lá pelo desenvolvedor.

Crie também `apps-script/README.md` explicando, em português:
- que o arquivo `.gs` é uma cópia versionada e precisa ser colada manualmente no editor;
- que após qualquer edição é obrigatório fazer **Implantar > Gerenciar implantações > lápis > Versão: Nova versão**, porque só salvar mantém a URL servindo a versão antiga;
- que na implantação, "Quem pode acessar" precisa ser **Qualquer pessoa** — a opção
  "Qualquer pessoa com Conta do Google" causa falha silenciosa, já que o `fetch` roda em
  `no-cors` e o erro não aparece no console;
- quais são as abas geradas: `Leads`, `Eventos`, `Parcerias`, `Outros`, `Cliques WhatsApp`.

```javascript
/**
 * ENDORFINA HUB — Recebedor de formulário do site
 * ------------------------------------------------------------------
 * O que faz:
 *   1. Recebe o POST do formulário do site
 *   2. Grava uma linha na aba certa da planilha (por assunto)
 *   3. Dispara um e-mail de aviso para o Gmail do Hub
 *
 * COMO INSTALAR (5 minutos)
 *   1. Crie uma planilha nova no Google Sheets (com a conta do Hub).
 *   2. Menu  Extensões > Apps Script.
 *   3. Apague o conteúdo e cole este arquivo inteiro.
 *   4. Troque o valor de AVISAR_EMAIL abaixo.
 *   5. Rode a função  instalar()  uma vez (botão ▶). Autorize quando pedir.
 *   6. Implantar > Nova implantação > tipo "App da Web"
 *        Executar como:        Eu (a conta do Hub)
 *        Quem pode acessar:    Qualquer pessoa
 *   7. Copie a URL que termina em /exec e cole no site, na constante
 *      SHEET_URL (dentro do <script> do endorfina-hub.html).
 *
 * IMPORTANTE: toda vez que editar este código, é preciso fazer
 * "Implantar > Gerenciar implantações > editar > Nova versão",
 * senão a URL continua rodando a versão antiga.
 */

// ------------------------------------------------------------------ CONFIG
var AVISAR_EMAIL = 'contato.endorfinahub@gmail.com';  // <<< TROQUE
var ASSUNTO_EMAIL = '[Site] Novo contato — Endorfina Hub';

// Mapa: valor do campo "assunto" no site  ->  nome da aba na planilha
var ABAS = {
  'Quero treinar': 'Leads',
  'Quero participar de um evento': 'Eventos',
  'Quero ser parceiro': 'Parcerias',
  'Outro assunto': 'Outros'
};
var ABA_PADRAO = 'Leads';

// Aba que registra cliques no botão flutuante de WhatsApp (não gera e-mail)
var ABA_CLIQUES = 'Cliques WhatsApp';
var COLUNAS_CLIQUE = [
  ['recebido_em', 'Data e hora'],
  ['origem',      'Página'],
  ['botao',       'Botão'],
  ['dispositivo', 'Dispositivo'],
  ['referrer',    'Veio de'],
  ['campanha',    'Campanha (utm)']
];

// Colunas gravadas, na ordem. A chave é o name= do campo no HTML.
var COLUNAS = [
  ['recebido_em', 'Recebido em'],
  ['nome',        'Nome'],
  ['fone',        'WhatsApp'],
  ['cidade',      'Cidade'],
  ['assunto',     'Assunto'],
  ['objetivo',    'Objetivo'],
  ['msg',         'Mensagem'],
  ['origem',      'Página de origem'],
  ['status',      'Status']   // preenchido à mão pelo time: Novo / Respondido / Fechado
];

// ------------------------------------------------------------------ ENTRADA
function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // honeypot: bot preencheu campo invisível -> descarta em silêncio
    if (p.empresa) return _ok('ignorado');

    // clique no botão de WhatsApp: só registra, não manda e-mail
    if (p.tipo === 'clique_whatsapp') return _clique(p);

    // validação mínima
    if (!p.nome || !p.fone) return _ok('faltam campos');

    var aba = _aba(ABAS[p.assunto] || ABA_PADRAO);

    var dados = {
      recebido_em: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
      nome:     _limpa(p.nome),
      fone:     _limpa(p.fone),
      cidade:   _limpa(p.cidade),
      assunto:  _limpa(p.assunto),
      objetivo: _limpa(p.objetivo),
      msg:      _limpa(p.msg),
      origem:   _limpa(p.origem),
      status:   'Novo'
    };

    aba.appendRow(COLUNAS.map(function (c) { return dados[c[0]] || ''; }));

    _avisar(dados);
    return _ok('gravado');

  } catch (err) {
    // não devolve erro para o site: o visitante já foi para o WhatsApp
    console.error(err);
    return _ok('erro');
  }
}

// Permite testar no navegador abrindo a URL /exec
function doGet() {
  return ContentService.createTextOutput('Endorfina Hub — endpoint ativo.');
}

// ------------------------------------------------------------------ E-MAIL
function _avisar(d) {
  if (!AVISAR_EMAIL) return;

  var waLink = 'https://wa.me/55' + d.fone.replace(/\D/g, '').replace(/^55/, '');

  var corpo =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;color:#0A1224">' +
      '<p style="font-size:12px;letter-spacing:2px;color:#E5A200;text-transform:uppercase;margin:0 0 6px">' +
        d.assunto +
      '</p>' +
      '<h2 style="margin:0 0 18px;font-size:22px">' + d.nome + '</h2>' +
      '<table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9">' +
        _linha('WhatsApp', d.fone) +
        _linha('Cidade', d.cidade) +
        _linha('Objetivo', d.objetivo) +
        _linha('Mensagem', d.msg || '—') +
        _linha('Origem', d.origem) +
        _linha('Recebido', d.recebido_em) +
      '</table>' +
      '<p style="margin:24px 0 0">' +
        '<a href="' + waLink + '" style="background:#1FBF62;color:#062617;padding:12px 20px;' +
        'text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block">' +
        'Responder no WhatsApp</a>' +
      '</p>' +
      '<p style="margin-top:22px;font-size:12px;color:#5B6376">' +
        'Enviado pelo formulário do site. A linha já está na planilha.' +
      '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: AVISAR_EMAIL,
    subject: ASSUNTO_EMAIL + ' — ' + d.nome,
    htmlBody: corpo,
    name: 'Site Endorfina Hub'
  });
}

function _linha(rot, val) {
  return '<tr><td style="color:#5B6376;padding-right:16px;vertical-align:top">' + rot +
         '</td><td><b>' + val + '</b></td></tr>';
}

// ------------------------------------------------------------------ UTIL
function _aba(nome) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUNAS.map(function (c) { return c[1]; }));
    sh.getRange(1, 1, 1, COLUNAS.length)
      .setFontWeight('bold')
      .setBackground('#0A1224')
      .setFontColor('#FFC01E');
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 180);
    sh.setColumnWidth(7, 320);
  }
  return sh;
}

function _limpa(v) {
  return String(v == null ? '' : v).slice(0, 2000).trim();
}

function _ok(msg) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, msg: msg }))
                       .setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------------ CLIQUES
/**
 * Registra um clique no botão de WhatsApp. Sem e-mail: seria spam.
 * Serve para responder "quantas pessoas nos chamam sem passar pelo formulário"
 * e "de qual página elas saem".
 */
function _clique(p) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA_CLIQUES);
  if (!sh) {
    sh = ss.insertSheet(ABA_CLIQUES);
    sh.appendRow(COLUNAS_CLIQUE.map(function (c) { return c[1]; }));
    sh.getRange(1, 1, 1, COLUNAS_CLIQUE.length)
      .setFontWeight('bold').setBackground('#0A1224').setFontColor('#FFC01E');
    sh.setFrozenRows(1);
    sh.setColumnWidth(5, 260);
  }
  var d = {
    recebido_em: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
    origem:      _limpa(p.origem),
    botao:       _limpa(p.botao),
    dispositivo: _limpa(p.dispositivo),
    referrer:    _limpa(p.referrer),
    campanha:    _limpa(p.campanha)
  };
  sh.appendRow(COLUNAS_CLIQUE.map(function (c) { return d[c[0]] || ''; }));
  return _ok('clique');
}

/** Resumo dos cliques por página — rode quando quiser um panorama rápido. */
function resumoCliques() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_CLIQUES);
  if (!sh || sh.getLastRow() < 2) { Logger.log('Sem cliques registrados.'); return; }
  var linhas = sh.getRange(2, 1, sh.getLastRow() - 1, COLUNAS_CLIQUE.length).getValues();
  var porPagina = {}, porBotao = {};
  linhas.forEach(function (l) {
    porPagina[l[1] || '(sem)'] = (porPagina[l[1] || '(sem)'] || 0) + 1;
    porBotao[l[2] || '(sem)']  = (porBotao[l[2] || '(sem)']  || 0) + 1;
  });
  Logger.log('Total de cliques: ' + linhas.length);
  Logger.log('Por página: ' + JSON.stringify(porPagina));
  Logger.log('Por botão: '  + JSON.stringify(porBotao));
}

// ------------------------------------------------------------------ SETUP
/** Rode uma vez: cria as abas e um registro de teste. */
function instalar() {
  Object.keys(ABAS).forEach(function (k) { _aba(ABAS[k]); });
  _aba(ABA_PADRAO);
  _clique({ origem: '#inicio', botao: 'teste', dispositivo: 'setup', referrer: '', campanha: '' });
  doPost({ parameter: {
    nome: 'Teste do sistema', fone: '12999999999', cidade: 'Jacareí',
    assunto: 'Quero treinar', objetivo: 'Começar a correr',
    msg: 'Linha de teste — pode apagar.', origem: '#contato'
  }});
  SpreadsheetApp.getUi && SpreadsheetApp.flush();
}
```

---

## Tarefa 4 — Verificação

Sem browser no ambiente, faça o que der por análise estática e registre o resto como pendência:

1. Confirme que `js/rastreio-whatsapp.js` carrega em **todas** as 6 páginas
   (ou nas 6 rotas, se ainda for arquivo único com roteador por hash).
2. Confirme que o listener usa **captura** (`true` no terceiro argumento do
   `addEventListener`) e delegação no `document` — os links do WhatsApp são preenchidos pelo
   `CFG` depois do boot, então listener direto no elemento não pegaria todos.
3. Confirme que **não existe** `preventDefault`, `return false` ou `await` no caminho do clique.
4. Confirme que o botão flutuante (`a.wa`) e todos os CTAs de WhatsApp dentro do conteúdo
   têm `href` contendo `wa.me` — se algum usar `api.whatsapp.com` ou `web.whatsapp.com`,
   o seletor não vai pegar. Reporte se encontrar.
5. Rode um lint/parse de sintaxe em todos os `.js` alterados.

---

## Tarefa 5 — Relatório

Escreva `RELATORIO-FORMULARIO.md` com:

- O que foi alterado, arquivo por arquivo.
- Resultado das validações da Tarefa 1, com os valores encontrados
  (mascare o número do WhatsApp: mostre só os 4 últimos dígitos).
- Qual abordagem você usou na Tarefa 2 (arquivo separado ou embutido) e por quê.
- Qualquer `wa.me` hardcoded que tenha encontrado fora do `CFG`.
- Checklist de testes manuais que **eu** preciso fazer no navegador, incluindo:
  clicar no botão flutuante e conferir se a linha aparece na aba `Cliques WhatsApp`;
  enviar um lead de teste pelo formulário e conferir planilha, e-mail e WhatsApp;
  repetir com assunto "Quero ser parceiro" e conferir se cai na aba `Parcerias`.
- O que você não conseguiu validar e por quê.

---

## Ordem de execução

Um commit por tarefa, com mensagem descritiva. Se algo falhar ou contrariar uma regra
inviolável, **pare e reporte** — não improvise nem contorne.
