var AVISAR_EMAIL    = 'endorfinahub@gmail.com';
var RELATORIO_EMAIL = 'matheusfrattinids@gmail.com';
var ASSUNTO_EMAIL   = '[Site] Novo contato — Endorfina Hub';
var FUSO            = 'America/Sao_Paulo';

var ABAS = {
  'Quero treinar': 'Leads',
  'Quero participar de um evento': 'Eventos',
  'Quero ser parceiro': 'Parcerias',
  'Outro assunto': 'Outros'
};
var ABA_PADRAO = 'Leads';

var COLUNAS = [
  ['recebido_em', 'Recebido em'],
  ['nome',        'Nome'],
  ['fone',        'WhatsApp'],
  ['cidade',      'Cidade'],
  ['assunto',     'Assunto'],
  ['objetivo',    'Objetivo'],
  ['msg',         'Mensagem'],
  ['origem',      'Página de origem'],
  ['status',      'Status']
];

var ALIAS = {
  telefone:      'fone',
  whatsapp:      'fone',
  website:       'empresa',
  objetivoLabel: 'objetivo',
  mensagem:      'msg'
};

var OBJETIVOS = {
  corrida:    'Corrida',
  calistenia: 'Calistenia',
  hibrido:    'Treino híbrido',
  lifestyle:  'Lifestyle',
  recovery:   'Recovery'
};

function doPost(e) {
  try {
    var p = _entrada(e);

    if (p.empresa) return _ok('ignorado');

    if (!p.nome || !p.fone) return _ok('faltam campos');

    var aba = _aba(ABAS[p.assunto] || ABA_PADRAO);

    var dados = {
      recebido_em: Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm'),
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
    console.error(err);
    return _ok('erro');
  }
}

function doGet() {
  return ContentService.createTextOutput('Endorfina Hub — endpoint ativo.');
}

function _entrada(e) {
  var bruto = {};
  var k;

  if (e && e.parameter) {
    for (k in e.parameter) bruto[k] = e.parameter[k];
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var json = JSON.parse(e.postData.contents);
      for (k in json) {
        if (bruto[k] === undefined || bruto[k] === '') bruto[k] = json[k];
      }
    } catch (err) {}
  }

  var p = {};
  for (k in bruto) {
    var destino = ALIAS[k] || k;
    if (p[destino] === undefined || p[destino] === '') p[destino] = bruto[k];
  }

  if (p.objetivo) {
    var slug = String(p.objetivo).toLowerCase().trim();
    if (OBJETIVOS[slug]) p.objetivo = OBJETIVOS[slug];
  }

  if (!p.assunto && p.objetivo) p.assunto = 'Quero treinar';
  if (!p.origem && p.referrer) p.origem = p.referrer;

  return p;
}

function _avisar(d) {
  if (!AVISAR_EMAIL) return;

  var waLink = _waLink(d.fone);

  var corpo =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;color:#0A1224">' +
      '<p style="font-size:12px;letter-spacing:2px;color:#E5A200;text-transform:uppercase;margin:0 0 6px">' +
        (d.assunto || 'Novo contato') +
      '</p>' +
      '<h2 style="margin:0 0 18px;font-size:22px">' + d.nome + '</h2>' +
      '<table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9">' +
        _linha('WhatsApp', d.fone) +
        _linha('Cidade', d.cidade || '—') +
        _linha('Objetivo', d.objetivo || '—') +
        _linha('Mensagem', d.msg || '—') +
        _linha('Origem', d.origem || '—') +
        _linha('Recebido', d.recebido_em) +
      '</table>' +
      (waLink
        ? '<p style="margin:24px 0 0">' +
            '<a href="' + waLink + '" style="background:#1FBF62;color:#062617;padding:12px 20px;' +
            'text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block">' +
            'Responder no WhatsApp</a>' +
          '</p>'
        : '') +
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

function _waLink(fone) {
  var d = String(fone || '').replace(/\D/g, '');
  if (d.length < 10) return '';
  if (d.length <= 11) d = '55' + d;
  return 'https://wa.me/' + d;
}

function _linha(rot, val) {
  return '<tr><td style="color:#5B6376;padding-right:16px;vertical-align:top">' + rot +
         '</td><td><b>' + val + '</b></td></tr>';
}

function criarGatilhoSemanal() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarRelatorioSemanal') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('enviarRelatorioSemanal')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .inTimezone(FUSO)
    .create();

  Logger.log('Gatilho semanal criado: segundas, 08h (' + FUSO + ').');
}

function enviarRelatorioSemanal() {
  var corte = new Date();
  corte.setDate(corte.getDate() - 7);

  var contatos    = [];
  var porAba      = {};
  var porObjetivo = {};

  _todasAbas().forEach(function (nomeAba) {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomeAba);
    if (!sh || sh.getLastRow() < 2) return;

    var linhas = sh.getRange(2, 1, sh.getLastRow() - 1, COLUNAS.length).getValues();

    linhas.forEach(function (l) {
      var quando = _parseData(l[_idx('recebido_em')]);
      if (!quando || quando < corte) return;

      var objetivo = l[_idx('objetivo')] || '—';

      contatos.push({
        quando:   quando,
        data:     Utilities.formatDate(quando, FUSO, 'dd/MM HH:mm'),
        nome:     l[_idx('nome')],
        fone:     l[_idx('fone')],
        cidade:   l[_idx('cidade')],
        objetivo: objetivo,
        aba:      nomeAba
      });

      porAba[nomeAba]       = (porAba[nomeAba] || 0) + 1;
      porObjetivo[objetivo] = (porObjetivo[objetivo] || 0) + 1;
    });
  });

  contatos.sort(function (a, b) { return a.quando - b.quando; });

  MailApp.sendEmail({
    to: RELATORIO_EMAIL,
    subject: 'Endorfina Hub — ' + contatos.length + ' contato(s) na semana',
    htmlBody: _corpoRelatorio(contatos, porAba, porObjetivo),
    name: 'Site Endorfina Hub'
  });
}

function _corpoRelatorio(contatos, porAba, porObjetivo) {
  var hoje = Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy');
  var url  = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  var h =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:660px;color:#0A1224">' +
      '<p style="font-size:12px;letter-spacing:2px;color:#E5A200;text-transform:uppercase;margin:0 0 6px">' +
        'Relatório semanal · ' + hoje +
      '</p>' +
      '<h2 style="margin:0 0 20px;font-size:22px">Endorfina Hub — contatos do site</h2>' +
      '<p style="font-size:40px;font-weight:bold;color:#E5A200;margin:0;line-height:1">' +
        contatos.length +
      '</p>' +
      '<p style="margin:2px 0 24px;color:#5B6376">contatos nos últimos 7 dias</p>';

  h += _bloco('Por assunto', porAba);
  h += _bloco('Por objetivo', porObjetivo);

  if (contatos.length) {
    h += '<h3 style="font-size:15px;margin:24px 0 8px">Contatos</h3>' +
         '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:13px">' +
         '<tr style="background:#0A1224;color:#FFC01E;text-align:left">' +
         '<th>Data</th><th>Nome</th><th>WhatsApp</th><th>Cidade</th><th>Objetivo</th></tr>';

    contatos.forEach(function (c, i) {
      h += '<tr style="background:' + (i % 2 ? '#F5F7FA' : '#FFFFFF') + '">' +
             '<td>' + c.data + '</td>' +
             '<td>' + c.nome + '</td>' +
             '<td>' + c.fone + '</td>' +
             '<td>' + (c.cidade || '—') + '</td>' +
             '<td>' + c.objetivo + '</td>' +
           '</tr>';
    });
    h += '</table>';
  } else {
    h += '<p style="color:#5B6376">Nenhum contato registrado nesta semana.</p>';
  }

  h += '<p style="margin-top:26px;font-size:12px">' +
         '<a href="' + url + '" style="color:#E5A200">Abrir a planilha completa</a>' +
       '</p></div>';

  return h;
}

function _bloco(titulo, mapa) {
  var chaves = Object.keys(mapa);
  if (!chaves.length) return '';

  var h = '<h3 style="font-size:15px;margin:0 0 8px">' + titulo + '</h3>' +
          '<ul style="margin:0 0 18px;padding-left:18px;font-size:14px;line-height:1.8">';

  chaves.sort(function (a, b) { return mapa[b] - mapa[a]; })
        .forEach(function (k) { h += '<li>' + k + ': <b>' + mapa[k] + '</b></li>'; });

  return h + '</ul>';
}

function _parseData(v) {
  if (v instanceof Date) return v;

  var m = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})/);
  if (!m) return null;

  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]);
}

function _idx(chave) {
  for (var i = 0; i < COLUNAS.length; i++) {
    if (COLUNAS[i][0] === chave) return i;
  }
  return -1;
}

function _todasAbas() {
  var vistas = {};
  var lista  = [];

  Object.keys(ABAS).forEach(function (k) { vistas[ABAS[k]] = true; });
  vistas[ABA_PADRAO] = true;

  Object.keys(vistas).forEach(function (n) { lista.push(n); });
  return lista;
}

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

function instalar() {
  Object.keys(ABAS).forEach(function (k) { _aba(ABAS[k]); });
  _aba(ABA_PADRAO);
  doPost({ parameter: {
    nome: 'Teste do sistema', fone: '12999999999', cidade: 'Jacareí',
    assunto: 'Quero treinar', objetivo: 'Começar a correr',
    msg: 'Linha de teste — pode apagar.', origem: '#contato'
  }});
  SpreadsheetApp.getUi && SpreadsheetApp.flush();
}

function testarModal() {
  var r = doPost({ postData: { contents: JSON.stringify({
    nome: 'Teste modal', fone: '12988887777',
    objetivo: 'hibrido', origem: 'site-modal'
  }) } });
  Logger.log(r.getContent());
}
