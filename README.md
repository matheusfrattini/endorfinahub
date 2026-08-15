# Endorfina Hub — Site

Training Club Híbrido · Jacareí + Campinas

## Estrutura

```
endorfina-hub/
├── index.html          # 5 páginas com router hash (#inicio, #hub, #treinos, #experiencias, #contato)
├── css/style.css
├── js/main.js          # CFG central, router + SEO por página, menu mobile, hero seam, reveal, form → WhatsApp
├── assets/img/         # hill, mud, crowd, rope, wall — .webp + .jpg, normal e -800w
├── assets/logo.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── RELATORIO.md        # relatório da execução das Fases 1-5
├── .vscode/
└── .gitignore
```

## Rodar localmente

Instale a extensão **Live Server** e clique em "Go Live" (canto inferior direito do VS Code).
Ou pelo terminal:

```bash
python3 -m http.server 5500
```

Depois abra `http://localhost:5500`.

> Não abra o `index.html` com duplo clique (`file://`) — o router funciona, mas as fontes e caminhos ficam instáveis.

## ⚠️ Placeholders a substituir antes de publicar

Toda a configuração do cliente está centralizada no topo de `js/main.js`, no bloco `CFG` — troque ali o WhatsApp, Instagram, grupo, e-mail e domínio, que o site inteiro se atualiza sozinho.

| Onde | O quê |
|---|---|
| `js/main.js` → `CFG.whatsapp` | número real do WhatsApp — hoje `5500000000000` |
| `js/main.js` → `CFG.grupo` | link do grupo de WhatsApp — hoje vazio |
| `js/main.js` → `CFG.siteUrl` | domínio final de produção — hoje `https://endorfinahub.com.br` (assumido) |
| `index.html` | `[Nome]`, `[mês/ano]` nos depoimentos |
| `index.html` | `[+300]`, `[40+]`, `[6]`, `[2]` nas stats |
| `index.html` | `R$ [valor]` nos cards de serviços |
| `index.html` | `[Nome do profissional]`, mini bios e fotos reais do time |
| `index.html` | datas e `[local]` dos eventos |
| `<head>` (JSON-LD) | `telephone` e `openingHours` do `SportsActivityLocation` |

Busque por `[` no arquivo para encontrar todos de uma vez (`Ctrl+F`). Detalhes completos em [RELATORIO.md](RELATORIO.md).

## Deploy

Como é 100% estático, sobe direto em Netlify, Vercel, GitHub Pages ou Hostinger — basta arrastar a pasta.

## Notas técnicas

- Router hash-based: 5 páginas em um HTML. `sitemap.xml`/`canonical` usam URLs com `#`, que buscadores não indexam como páginas separadas — para SEO real por página, separe em `hub.html`, `treinos.html` etc. (Fase 6 do `endorfina-hub-v2.md`, só rodar quando pedido).
- Imagens: `webp` + fallback `jpg` (qualidade 78), com variante `-800w` de cada, servidas via `<picture>`. Se trocar por fotos novas, gere os 4 arquivos por imagem (`nome.webp`, `nome.jpg`, `nome-800w.webp`, `nome-800w.jpg`).
- Formulário sem backend: monta a mensagem e abre o `wa.me`. Integração com planilha (Google Apps Script) está pendente, a cargo de outro desenvolvedor.
