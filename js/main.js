(function(){
  /* ===== CONFIGURAÇÃO DO CLIENTE — editar só aqui ===== */
  var CFG = {
    whatsapp:   '5519981742371',                    // DDI + DDD + número, só dígitos
    instagram:  'https://instagram.com/endorfina.hub',
    grupo:      '',                                 // link do grupo de WhatsApp
    email:      'endorfina10hub@gmail.com',
    sheetUrl:   'https://script.google.com/macros/s/AKfycbzVQUj9LrC_iHYI6XZn0plpIigjfn6IuX3readDvH6ya226LzY4SLFXhgDwCKm8lF0a/exec',
    cidades:    'Campinas e região — SP',
    siteUrl:    'https://endorfinahub.com.br'      // domínio final de produção — confirmar com o cliente
  };

  var PAGES=['inicio','hub','treinos','experiencias','contato'];
  var TITLES={inicio:'Endorfina Hub — Training Club Híbrido',hub:'O Hub — Endorfina Hub',treinos:'O que fazemos — Endorfina Hub',experiencias:'Experiências — Endorfina Hub',contato:'Faça parte — Endorfina Hub'};
  var DESCS={
    inicio:'Training Club Híbrido em Campinas e região: corrida, calistenia, treino híbrido, recovery e lifestyle em comunidade. Treine, supere-se e viva a experiência.',
    hub:'Conheça o Endorfina Hub: um ecossistema de movimento que reúne treinadores, modalidades e experiências para evoluir de forma natural — nunca sozinho.',
    treinos:'Consultoria online, avaliação física, personal presencial, treino híbrido, recovery e grupos de corrida. Escolha por onde você quer começar a treinar.',
    experiencias:'Corridas, provas de obstáculo, meet ups e recovery em grupo. Veja a agenda de experiências do Endorfina Hub em Campinas e região.',
    contato:'Fale com o time do Endorfina Hub pelo WhatsApp e comece a treinar em Campinas. Resposta em até 1 dia útil.'
  };
  var CRUMBS={inicio:'Início',hub:'O Hub',treinos:'O que fazemos',experiencias:'Experiências',contato:'Contato'};
  var hdr=document.getElementById('hdr'), menu=document.getElementById('menu'), burger=document.getElementById('burger');

  /* ---- router ---- */
  function go(id,push){
    if(PAGES.indexOf(id)<0) id='inicio';
    PAGES.forEach(function(p){
      document.getElementById('p-'+p).classList.toggle('on',p===id);
    });
    menu.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.classList.toggle('active',a.getAttribute('href')==='#'+id && !a.classList.contains('btn'));
    });
    menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'auto'});
    hdr.classList.toggle('on-dark',id!=='inicio');
    document.title = TITLES[id]||'Endorfina Hub';
    updateMeta(id);
    observe();
    onScroll();
  }

  /* ---- SEO: meta por página + breadcrumb ---- */
  function updateMeta(id){
    var title = TITLES[id]||'Endorfina Hub';
    var desc = DESCS[id]||DESCS.inicio;
    var url = CFG.siteUrl + (id==='inicio' ? '/' : '/#'+id);
    var setAttr=function(sel,attr,val){ var el=document.querySelector(sel); if(el) el.setAttribute(attr,val); };
    setAttr('meta[name="description"]','content',desc);
    setAttr('link[rel="canonical"]','href',url);
    setAttr('meta[property="og:title"]','content',title);
    setAttr('meta[property="og:description"]','content',desc);
    setAttr('meta[property="og:url"]','content',url);
    setAttr('meta[name="twitter:title"]','content',title);
    setAttr('meta[name="twitter:description"]','content',desc);

    var items=[{'@type':'ListItem',position:1,name:'Início',item:CFG.siteUrl+'/'}];
    if(id!=='inicio') items.push({'@type':'ListItem',position:2,name:CRUMBS[id],item:url});
    var ld={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items};
    var sc=document.getElementById('ld-breadcrumb');
    if(sc) sc.textContent = JSON.stringify(ld);
  }
  window.addEventListener('hashchange',function(){go(location.hash.replace('#',''));});
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href').slice(1);
    if(PAGES.indexOf(id)>-1){ e.preventDefault(); if(location.hash!=='#'+id){location.hash=id;} else {go(id);} }
  });

  /* ---- header state ---- */
  function onScroll(){
    hdr.classList.toggle('solid',window.scrollY>18);
    var onHero = document.getElementById('p-inicio').classList.contains('on') && window.scrollY < window.innerHeight-90;
    hdr.classList.toggle('on-dark', onHero || !document.getElementById('p-inicio').classList.contains('on'));
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  /* ---- mobile menu ---- */
  burger.addEventListener('click',function(){
    var o=menu.classList.toggle('open');
    burger.setAttribute('aria-expanded',o);
    if(o){hdr.classList.add('on-dark','solid');}else{onScroll();}
  });

  /* ---- hero: costura híbrida ---- */
  var hero=document.getElementById('hero');
  if(hero && matchMedia('(hover:hover)').matches){
    hero.addEventListener('mousemove',function(e){
      var r=hero.getBoundingClientRect();
      var p=((e.clientX-r.left)/r.width)*100;
      hero.style.setProperty('--seam', Math.max(26,Math.min(76, 26+p*0.5+13))+'%');
    });
    hero.addEventListener('mouseleave',function(){hero.style.setProperty('--seam','52%');});
  }

  /* ---- CFG: preenche links marcados com data-cfg ---- */
  function applyCFG(){
    document.querySelectorAll('[data-cfg]').forEach(function(el){
      var key=el.getAttribute('data-cfg'), val=CFG[key], empty=!val;
      if(el.tagName==='A'){
        if(key==='whatsapp') el.href = empty ? '#' : 'https://wa.me/'+val;
        else if(key==='email') el.href = empty ? '#' : 'mailto:'+val;
        else el.href = empty ? '#' : val;
        el.toggleAttribute('aria-disabled', empty);
        el.style.pointerEvents = empty ? 'none' : '';
      }
      if(!empty && el.hasAttribute('data-cfg-text')) el.textContent = val;
    });
  }

  /* ---- reveal ---- */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  function observe(){ document.querySelectorAll('.page.on .rv:not(.in)').forEach(function(el){io.observe(el);}); }

  /* ---- form -> whatsapp ---- */
  var form=document.getElementById('lead');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var f=new FormData(form), note=document.getElementById('formnote');
    if(!f.get('nome')||!f.get('fone')){ note.textContent='Preencha nome e WhatsApp para continuar.'; note.style.color='#FF2D78'; return; }
    if(!CFG.whatsapp){ note.textContent='WhatsApp do Hub não configurado. Avise o time.'; note.style.color='#FF2D78'; return; }
    var txt='Olá, Endorfina Hub! Sou '+f.get('nome')+' ('+f.get('cidade')+'). Meu objetivo: '+f.get('objetivo')+'.'+(f.get('msg')?' '+f.get('msg'):'')+' Meu WhatsApp: '+f.get('fone');
    window.open('https://wa.me/'+CFG.whatsapp+'?text='+encodeURIComponent(txt),'_blank');
    note.textContent='Abrimos o WhatsApp com sua mensagem pronta. É só enviar.'; note.style.color='#FFC01E';
  });

  /* ==================================================================
     RASTREIO DOS CLIQUES EM WHATSAPP
     ------------------------------------------------------------------
     Intercepta qualquer link que aponte para wa.me, registra o clique
     na planilha (aba "Cliques WhatsApp") e só então deixa a conversa
     abrir. Se o registro falhar ou demorar, o WhatsApp abre do mesmo
     jeito — a conversão nunca é bloqueada por causa do rastreio.
  ================================================================== */
  (function () {

    /* usa o mesmo endpoint do formulário */
    function endpoint() {
      return CFG.sheetUrl || '';
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

  (function initModalContato() {
    'use strict';

    var dlg = document.getElementById('modal-contato');
    if (!dlg || typeof dlg.showModal !== 'function') return;

    var form     = document.getElementById('mc-form');
    var okBox    = document.getElementById('mc-ok');
    var okNome   = document.getElementById('mc-ok-nome');
    var okLink   = document.getElementById('mc-ok-link');
    var erroBox  = document.getElementById('mc-erro');
    var btn      = form.querySelector('.mc__enviar');
    var campoTel = document.getElementById('mc-tel');

    var OBJETIVOS = {
      corrida:    'corrida',
      calistenia: 'calistenia',
      hibrido:    'treino híbrido',
      lifestyle:  'lifestyle',
      recovery:   'recovery'
    };

    var abertoEm = 0;

    function abrir() {
      resetar();
      abertoEm = Date.now();
      dlg.showModal();
      setTimeout(function () { document.getElementById('mc-nome').focus(); }, 60);
    }

    function resetar() {
      form.hidden = false;
      okBox.hidden = true;
      erroBox.hidden = true;
      btn.disabled = false;
      btn.textContent = 'Chamar no WhatsApp';
      form.reset();
      limparInvalidos();
    }

    document.addEventListener('click', function (ev) {
      var abre = ev.target.closest('[data-mc-abrir]');
      if (abre) { ev.preventDefault(); abrir(); return; }
      if (ev.target.closest('[data-mc-fechar]')) { dlg.close(); }
    });

    dlg.addEventListener('click', function (ev) {
      if (ev.target === dlg) dlg.close();
    });

    campoTel.addEventListener('input', function () {
      var d = campoTel.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      campoTel.value = out;
    });

    function limparInvalidos() {
      form.querySelectorAll('[aria-invalid]').forEach(function (el) {
        el.removeAttribute('aria-invalid');
      });
    }

    function falhar(msg, campo) {
      erroBox.textContent = msg;
      erroBox.hidden = false;
      if (campo) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); }
      return false;
    }

    function validar(dados) {
      limparInvalidos();
      erroBox.hidden = true;

      if (dados.nome.length < 2) {
        return falhar('Escreva seu nome para continuar.', document.getElementById('mc-nome'));
      }
      if (dados.foneDigitos.length < 10 || dados.foneDigitos.length > 11) {
        return falhar('Confira o WhatsApp: precisa ter DDD + número.', campoTel);
      }
      if (!dados.objetivo) {
        return falhar('Escolha um objetivo.', null);
      }
      return true;
    }

    function gravar(dados) {
      var endpoint = (typeof CFG !== 'undefined' && CFG.sheetUrl) ? CFG.sheetUrl : '';
      if (!/^https:\/\//.test(endpoint)) return;

      var corpo = JSON.stringify({
        nome:     dados.nome,
        fone:     dados.foneDigitos,
        assunto:  'Quero treinar',
        objetivo: dados.objetivo,
        origem:   dados.origem,
        referrer: document.referrer || ''
      });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, new Blob([corpo], { type: 'text/plain' }));
          return;
        }
        fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: corpo
        });
      } catch (e) {}
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      if (form.empresa.value !== '' || Date.now() - abertoEm < 1500) {
        dlg.close();
        return;
      }

      var objRadio = form.querySelector('input[name="objetivo"]:checked');
      var dados = {
        nome:        form.nome.value.trim(),
        foneDigitos: form.fone.value.replace(/\D/g, ''),
        objetivo:    objRadio ? objRadio.value : '',
        origem:      'site-modal'
      };

      if (!validar(dados)) return;

      btn.disabled = true;

      var numero = (typeof CFG !== 'undefined' && CFG.whatsapp) ? CFG.whatsapp : '';
      var texto  = 'Oi! Vim do site, meu nome é ' + dados.nome +
                   ' e tenho interesse em saber mais sobre ' +
                   (OBJETIVOS[dados.objetivo] || dados.objetivo) + '.';

      var url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);

      gravar(dados);

      okNome.textContent = dados.nome.split(' ')[0];
      okLink.href = url;
      form.hidden = true;
      okBox.hidden = false;

      setTimeout(function () { window.location.href = url; }, 1100);
    });

  })();

  applyCFG();
  go(location.hash.replace('#','')||'inicio');
})();
