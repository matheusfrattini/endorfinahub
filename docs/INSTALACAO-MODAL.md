# Modal de contato — Endorfina Hub

Quatro arquivos. O passo 4 depende da URL gerada no passo 3.

Os arquivos de código não têm comentários — tudo que precisa ser lembrado está aqui.

## 1. HTML

Colar `modal-contato.html` imediatamente antes de `</body>` no `index.html`.

Transformar os CTAs em gatilhos: qualquer elemento com `data-mc-abrir` passa a abrir o modal.

```html
<button class="whatsapp-float" data-mc-abrir aria-label="Falar com a equipe">…</button>
<a href="#contato" data-mc-abrir>Quero começar</a>
```

O `href` continua servindo de fallback caso o JS não carregue — o handler dá `preventDefault()` quando carrega.

O campo `empresa` é honeypot. Fica escondido por CSS, nunca por `type="hidden"`, e usa o mesmo nome que o formulário existente já usa.

## 2. CSS

Colar `modal-contato.css` no fim do CSS do site.

As cores herdam `--azul-profundo`, `--sol-dourado` e `--magenta`. Se os nomes no projeto forem outros, ajustar só as cinco primeiras linhas dentro de `.mc { … }`.

## 3. Apps Script

`endorfina-formulario.gs` substitui o arquivo atual por inteiro. Não criar um segundo projeto: dois `doPost` no mesmo script e o último vence, em silêncio.

Na conta endorfinahub@gmail.com:

1. Planilha > Extensões > Apps Script
2. Colar o arquivo, salvar
3. Conferir `RELATORIO_EMAIL` no topo
4. Implantar > Nova implantação > App da Web
   - Executar como: **Eu (endorfinahub@gmail.com)**
   - Quem pode acessar: **Qualquer pessoa**
5. Copiar a URL terminada em `/exec`
6. Rodar `criarGatilhoSemanal()` uma vez pelo editor e autorizar

A cada alteração no script é **Gerenciar implantações > editar > Nova versão**. Salvar o código não republica nada.

O gatilho fica preso à conta que o criou, então troca de senha não derruba o relatório. O que derruba é alguém apagar o gatilho, o script ou a planilha.

## 4. JavaScript

Colar `modal-contato.js` **dentro da IIFE** de `js/main.js`, depois da definição do `CFG`. Não funciona como arquivo separado: `CFG` é privado daquele escopo.

```js
whatsapp: '5512999999999',
sheetUrl: 'https://script.google.com/macros/s/…/exec'
```

## Decisões que não são óbvias no código

**`navigator.sendBeacon`, não `fetch`.** Não bloqueia, sobrevive à navegação e o `text/plain` evita preflight CORS. Se `sheetUrl` não estiver configurado, a função retorna cedo e o WhatsApp abre igual — a gravação nunca trava o redirect.

**`window.location.href`, não `window.open`.** Navegação na mesma aba não exige gesto do usuário nem é barrada por popup blocker, o que permite o 1,1s de animação do check antes de sair da página.

**`_entrada()` aceita dois formatos.** `e.parameter` para o formulário form-encoded e `e.postData.contents` para o JSON do modal. Apelidos normalizados: `telefone`→`fone`, `website`→`empresa`, `objetivoLabel`→`objetivo`.

**`_parseData()` aceita texto e Date.** `recebido_em` é gravado como texto `dd/MM/yyyy HH:mm`, mas o Sheets converte para Date dependendo da configuração da planilha. Sem isso o relatório voltaria sempre vazio.

**`_waLink()` corrige bug da versão anterior.** O link de resposta concatenava um número fixo com o telefone do lead, gerando número inválido. Agora monta só com o número do lead, somando `55` quando vem sem DDI.

## Checklist de teste

Antes de publicar, pelo editor do Apps Script:

- [ ] `testarModal()` retorna `{"ok":true,"msg":"gravado"}` e a linha cai em Leads com objetivo "Treino híbrido"
- [ ] `enviarRelatorioSemanal()` chega no e-mail com layout correto
- [ ] O botão "Responder no WhatsApp" do e-mail de aviso abre o número do lead

No navegador:

- [ ] Botão flutuante abre o modal, não o WhatsApp
- [ ] Enviar vazio: erro pede o nome e foca o campo
- [ ] Telefone com 9 dígitos: erro pede DDD + número
- [ ] Sem objetivo: erro pede o objetivo
- [ ] Preenchido: check anima e o WhatsApp abre em ~1s
- [ ] Mensagem chega como `Oi! Vim do site, meu nome é X e tenho interesse em saber mais sobre treino híbrido.`
- [ ] Link "Não abriu? Toque aqui" funciona
- [ ] Enviar em menos de 1,5s: descartado
- [ ] Preencher `empresa` pelo console: descartado
- [ ] Tab circula só dentro do modal, Esc fecha, clique fora fecha

Dispositivos, nesta ordem de risco:

- [ ] iPhone / Safari
- [ ] Navegador interno do Instagram
- [ ] Android / Chrome
- [ ] Desktop (cai no WhatsApp Web)
