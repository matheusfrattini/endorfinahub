# Apps Script — Endorfina Hub

## O que é este arquivo

`endorfina-formulario.gs` é uma **cópia versionada** do código que recebe os dados do site
(formulário e cliques em WhatsApp), grava numa planilha do Google Sheets e avisa por e-mail.

Ele **não roda a partir daqui** — o Git não executa Apps Script. O código real vive no editor
do Google Apps Script, dentro da planilha do Hub. Sempre que este arquivo for alterado aqui no
repositório, é preciso **copiar e colar manualmente** o conteúdo inteiro no editor do Apps
Script para a mudança valer no site.

## Como instalar (resumo — o passo a passo completo está no cabeçalho do `.gs`)

1. Crie/abra a planilha do Hub no Google Sheets (com a conta do Hub).
2. Menu **Extensões > Apps Script**.
3. Apague o conteúdo existente e cole `endorfina-formulario.gs` inteiro.
4. Troque `AVISAR_EMAIL` pelo Gmail que deve receber os avisos.
5. Rode a função `instalar()` uma vez (▶) e autorize quando pedir — isso cria as abas e um
   registro de teste em cada uma (pode apagar essas linhas de teste depois).
6. **Implantar > Nova implantação > tipo "App da Web"**.
7. Copie a URL que termina em `/exec` e cole em `CFG.sheetUrl`, em `js/main.js`.

## ⚠️ Depois de qualquer edição no código

Só salvar (Ctrl+S) **não é suficiente**. A URL `/exec` continua servindo a versão antiga até
você fazer, no editor do Apps Script:

**Implantar > Gerenciar implantações > (ícone de lápis) > Versão: Nova versão > Implantar**

Esquecer esse passo é a causa mais comum de "eu editei mas nada mudou".

## ⚠️ "Quem pode acessar" precisa ser "Qualquer pessoa"

Na tela de implantação, a opção **"Quem pode acessar"** tem que ser **Qualquer pessoa**, nunca
"Qualquer pessoa com Conta do Google". Isso importa porque o site chama esse endpoint com
`fetch(..., { mode: 'no-cors' })` (via `sendBeacon` ou `fetch`) — nesse modo o navegador **nunca
mostra o erro no console**, mesmo que a permissão esteja errada e a chamada esteja falhando
silenciosamente. Se a planilha não estiver recebendo nada e não houver erro nenhum no console,
esta é a primeira coisa a conferir.

## Relatório semanal por e-mail

Rodar `criarGatilhoSemanal()` uma vez pelo editor do Apps Script (▶) instala o gatilho que
chama `enviarRelatorioSemanal()` toda segunda-feira às 08h, fuso `America/Sao_Paulo`. Rodar de
novo substitui o gatilho anterior, não duplica.

O gatilho fica preso à conta do Google que o criou — trocar a senha dessa conta não o derruba.
O que derruba é alguém apagar o gatilho, o script ou a planilha.

## Testar sem depender do site

Rodar `testarModal()` pelo editor do Apps Script valida a ponte que aceita JSON (o formato que
o modal envia via `sendBeacon`/`fetch`), sem precisar abrir o navegador nem publicar nada.

## Abas geradas na planilha

| Aba | O que recebe |
|---|---|
| `Leads` | Formulário com assunto "Quero treinar" (e também o padrão, se o assunto não bater com nenhum mapeamento) |
| `Eventos` | Formulário com assunto "Quero participar de um evento" |
| `Parcerias` | Formulário com assunto "Quero ser parceiro" |
| `Outros` | Formulário com assunto "Outro assunto" |
| `Cliques WhatsApp` | Cada clique em qualquer link `wa.me` do site (botão flutuante e CTAs), sem gerar e-mail |

## Status atual da integração no site

No código atual (`js/main.js`), o envio do formulário **ainda abre só o WhatsApp** — não existe,
hoje, nenhuma chamada `fetch`/`sendBeacon` para este endpoint na lógica de submit do formulário
(não há bloco `FORMULÁRIO -> PLANILHA DO GOOGLE + WHATSAPP`, nem campo honeypot no HTML). O
rastreio de cliques em WhatsApp (`registrar()`, embutido em `js/main.js`) já está pronto e vai
funcionar assim que `CFG.sheetUrl` apontar para uma URL `/exec` real — ele grava só na aba
`Cliques WhatsApp`. A gravação de **leads do formulário** na planilha depende de uma integração
separada, que segundo o brief está sendo feita por outro desenvolvedor. Detalhes em
[`../RELATORIO-FORMULARIO.md`](../RELATORIO-FORMULARIO.md).
