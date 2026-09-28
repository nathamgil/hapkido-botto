/* Hapkido Botto — site público */
(function () {
  var T = window.HB, U = BD.U;
  var $ = function (s) { return document.querySelector(s); };
  var esc = U.esc;
  var ALUNOS = [], GALERIA = [], CFG = {};
  var filtro = null;

  /* ---------- menu ---------- */
  var btn = $('#menu-btn'), menu = $('#menu');
  btn.onclick = function () { var a = menu.classList.toggle('aberto'); btn.setAttribute('aria-expanded', a); };
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('aberto'); btn.setAttribute('aria-expanded', false); } });

  /* ---------- desenho da faixa (cinto com nó) ---------- */
  function cinto(cor, listras) {
    var l = '', borda = cor === '#0B0B0C' ? '#D8B26E' : 'rgba(255,255,255,.18)';
    for (var i = 0; i < (listras || 0); i++) l += '<rect x="' + (150 - i * 9) + '" y="15" width="5" height="10" fill="#D8B26E"/>';
    return '<svg class="cinto" viewBox="0 0 170 40" aria-hidden="true">' +
      '<rect x="4" y="13" width="162" height="14" rx="3" fill="' + cor + '" stroke="' + borda + '"/>' +
      '<path d="M78 26 L66 39 L76 39 L85 29 Z" fill="' + cor + '" stroke="rgba(0,0,0,.35)"/>' +
      '<path d="M92 26 L104 39 L94 39 L85 29 Z" fill="' + cor + '" stroke="rgba(0,0,0,.35)"/>' +
      '<rect x="75" y="9" width="20" height="22" rx="4" fill="' + cor + '" stroke="' + (borda[0] === '#' ? borda : 'rgba(0,0,0,.4)') + '"/>' + l + '</svg>';
  }

  function publicados() { return ALUNOS.filter(function (a) { return a.publicar !== false && a.faixa !== 'branca'; }); }
  function fotoOk(a) { return a.foto && a.autorizado; }
  function nomeExibido(a) { return a.nome; }

  /* ---------- trilha ---------- */
  function trilha() {
    var pub = publicados();
    var html = '<li><button type="button" disabled>' + cinto('#F4F1EA') + '<span class="nome">Branca</span><span class="qtd">o começo</span></button></li>';
    T.faixas.forEach(function (f) {
      var n = pub.filter(function (a) { return a.faixa === f.id; }).length;
      html += '<li><button type="button" data-f="' + f.id + '">' + cinto(f.cor, f.id === 'preta' ? 1 : 0) +
        '<span class="nome">' + f.nome + '</span><span class="qtd">' + (n ? n + (n > 1 ? ' alunos' : ' aluno') : 'ver mural') + '</span></button></li>';
    });
    $('#trilha').innerHTML = html;
    $('#trilha').onclick = function (e) {
      var b = e.target.closest('button[data-f]'); if (!b) return;
      if (b.dataset.f === 'preta') { $('#pretas').scrollIntoView(); return; }
      filtro = b.dataset.f; abas(); mural(); $('#mural').scrollIntoView();
    };
  }

  /* ---------- faixas pretas ---------- */
  function hall() {
    var pretas = publicados().filter(function (a) { return a.faixa === 'preta'; })
      .sort(function (a, b) { return (a.ordem == null ? 99 : a.ordem) - (b.ordem == null ? 99 : b.ordem) || (b.grau || 1) - (a.grau || 1) || String(a.desde).localeCompare(String(b.desde)); });
    var reais = pretas.filter(function (a) { return !a.exemplo; }).length;
    $('#contagem-preta').innerHTML = '<b>' + reais + '</b><span>' + (reais === 1 ? 'faixa preta' : 'faixas pretas') + '</span>';
    if (!pretas.length) { $('#hall').innerHTML = '<p class="vazio">Em breve, a galeria dos faixas pretas.</p>'; return; }
    $('#hall').innerHTML = pretas.map(function (a, i) {
      var mestre = i === 0 && (a.grau || 1) >= 4;
      var listras = ''; for (var k = 0; k < (a.grau || 1); k++) listras += '<i></i>';
      return '<button type="button" class="placa' + (mestre ? ' mestre' : '') + '" data-id="' + esc(a.id) + '">' +
        (a.exemplo ? '<span class="exemplo-tag">exemplo</span>' : '') +
        '<div class="placa-foto">' + (fotoOk(a) ? '<img src="' + esc(a.foto) + '" alt="' + esc(a.nome) + '" loading="lazy">' : '<div class="placa-ini">' + esc(U.iniciais(a.nome)) + '</div>') +
        (mestre ? '' : '<div class="placa-dan"><span class="dan">' + (a.grau || 1) + 'º DAN</span><span class="listras">' + listras + '</span></div>') + '</div>' +
        '<div class="placa-corpo">' + (mestre ? '<span class="selo-mestre">Fundador · ' + (a.grau || 1) + 'º Dan</span>' : '') +
        '<p class="placa-nome">' + esc(nomeExibido(a)) + '</p>' +
        (a.titulo ? '<div class="placa-titulo">' + esc(a.titulo) + '</div>' : '') +
        '<div class="placa-meta">' + esc(a.modalidade || '') + (a.desde && !mestre ? ' · faixa preta desde ' + U.mesAno(a.desde) : '') + '</div>' +
        (mestre && a.bio ? '<p class="placa-bio">' + esc(a.bio) + '</p>' : '') + '</div></button>';
    }).join('');
  }

  /* ---------- mural por faixa ---------- */
  var coloridas = T.faixas.filter(function (f) { return f.id !== 'preta'; });
  function abas() {
    var pub = publicados();
    var html = '<button class="aba" role="tab" aria-selected="' + (!filtro) + '" data-f=""><span class="bolinha" style="background:conic-gradient(' +
      coloridas.map(function (f, i) { return f.cor + ' ' + (i * 100 / coloridas.length) + '% ' + ((i + 1) * 100 / coloridas.length) + '%'; }).join(',') + ')"></span>Todas</button>';
    coloridas.slice().reverse().forEach(function (f) {
      var n = pub.filter(function (a) { return a.faixa === f.id; }).length;
      html += '<button class="aba" role="tab" aria-selected="' + (filtro === f.id) + '" data-f="' + f.id + '"><span class="bolinha" style="background:' + f.cor + '"></span>' + f.nome + ' <span class="n">' + n + '</span></button>';
    });
    $('#abas').innerHTML = html;
  }
  $('#abas').onclick = function (e) { var b = e.target.closest('.aba'); if (!b) return; filtro = b.dataset.f || null; abas(); mural(); };
  $('#busca').oninput = function () { mural(); };

  function mural() {
    var termo = $('#busca').value.trim().toLowerCase();
    var ordem = coloridas.map(function (f) { return f.id; }).reverse();
    var lista = publicados().filter(function (a) {
      return a.faixa !== 'preta' && (!filtro || a.faixa === filtro) && (!termo || a.nome.toLowerCase().indexOf(termo) >= 0);
    }).sort(function (a, b) { return ordem.indexOf(a.faixa) - ordem.indexOf(b.faixa) || (b.grau || 0) - (a.grau || 0) || a.nome.localeCompare(b.nome); });
    if (!lista.length) {
      $('#mural-lista').innerHTML = '<p class="vazio">' + (termo ? 'Ninguém com esse nome nesta faixa.' : 'Ainda não há alunos cadastrados nesta faixa.') + '</p>';
      return;
    }
    $('#mural-lista').innerHTML = lista.map(function (a) {
      var f = U.faixa(a.faixa);
      return '<button type="button" class="cartao" data-id="' + esc(a.id) + '">' +
        '<div class="avatar" style="border-color:' + f.cor + ';' + (fotoOk(a) ? '' : 'background:' + f.cor + ';color:' + f.texto) + '">' +
        (fotoOk(a) ? '<img src="' + esc(a.foto) + '" alt="" loading="lazy">' : esc(U.iniciais(a.nome))) + '</div>' +
        '<div class="cartao-nome">' + esc(nomeExibido(a)) + '</div>' +
        '<div class="cartao-faixa" style="background:' + f.cor + '"></div>' +
        '<div class="cartao-meta">Faixa ' + f.nome.toLowerCase() + (U.grau(a) ? ' · ' + U.grau(a) : '') + (a.desde ? '<br>desde ' + U.mesAno(a.desde) : '') + '</div></button>';
    }).join('');
  }

  /* ---------- ficha do aluno ---------- */
  var ficha = $('#ficha');
  function abrirFicha(id) {
    var a = ALUNOS.find(function (x) { return String(x.id) === String(id); }); if (!a) return;
    var f = U.faixa(a.faixa), listras = '';
    for (var k = 0; k < (a.faixa === 'preta' ? (a.grau || 1) : (a.grau || 0)); k++) listras += '<i></i>';
    ficha.innerHTML = '<div class="ficha-caixa"><button class="lb-fechar" data-fechar aria-label="Fechar">×</button>' +
      '<div class="ficha-foto">' + (fotoOk(a) ? '<img src="' + esc(a.foto) + '" alt="' + esc(a.nome) + '">' : '<div class="placa-ini" style="min-height:320px">' + esc(U.iniciais(a.nome)) + '</div>') + '</div>' +
      '<div class="ficha-txt"><p class="kicker">Faixa ' + f.nome.toLowerCase() + '</p><h3 id="ficha-nome">' + esc(nomeExibido(a)) + '</h3>' +
      (a.titulo ? '<div class="placa-titulo">' + esc(a.titulo) + '</div>' : '') +
      '<div class="ficha-faixa" style="background:' + f.cor + '">' + listras + '</div>' +
      '<ul class="ficha-dados">' + (U.grau(a) ? '<li><b>Graduação:</b> ' + U.grau(a) + '</li>' : '') +
      '<li><b>Modalidade:</b> ' + esc(a.modalidade || '—') + '</li>' +
      (a.desde ? '<li><b>Nesta faixa desde:</b> ' + U.mesAno(a.desde) + '</li>' : '') + '</ul>' +
      (a.bio ? '<p>' + esc(a.bio) + '</p>' : '') + '</div></div>';
    ficha.hidden = false;
    ficha.querySelector('[data-fechar]').focus();
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.placa, .cartao'); if (c) abrirFicha(c.dataset.id);
  });
  ficha.addEventListener('click', function (e) { if (e.target === ficha || e.target.closest('[data-fechar]')) ficha.hidden = true; });

  /* ---------- horários ---------- */
  function grade(turmas) {
    if (!turmas.length) { $('#grade').innerHTML = '<p class="nota">Horários em atualização. Chame no WhatsApp.</p>'; return; }
    $('#grade').innerHTML = turmas.map(function (t) {
      return '<div class="aula' + (/senshi/i.test(t.modalidade) ? ' senshi' : '') + '"><div class="aula-mod">' + esc(t.modalidade) + '</div>' +
        '<div class="aula-dia">' + esc(t.dia) + '</div>' +
        '<div class="aula-hora' + (t.hora ? '' : ' pendente') + '">' + (t.hora ? esc(t.hora) : 'horário a confirmar') + '</div>' +
        (t.turma ? '<div class="nota">' + esc(t.turma) + '</div>' : '') + '</div>';
    }).join('');
  }

  /* ---------- galeria + lightbox ---------- */
  var lb = $('#lightbox'), atual = 0;
  function galeria() {
    $('#galeria-lista').innerHTML = GALERIA.map(function (g, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Ampliar: ' + esc(g.legenda || 'foto') + '"><img src="' + esc(g.src) + '" alt="' + esc(g.legenda || '') + '" loading="lazy"></button>';
    }).join('');
  }
  function mostrar(i) {
    atual = (i + GALERIA.length) % GALERIA.length;
    $('#lb-img').src = GALERIA[atual].src; $('#lb-img').alt = GALERIA[atual].legenda || '';
    $('#lb-leg').textContent = GALERIA[atual].legenda || '';
    lb.hidden = false;
  }
  $('#galeria-lista').onclick = function (e) { var b = e.target.closest('button'); if (b) mostrar(+b.dataset.i); };
  $('#lb-fechar').onclick = function () { lb.hidden = true; };
  $('#lb-ant').onclick = function () { mostrar(atual - 1); };
  $('#lb-prox').onclick = function () { mostrar(atual + 1); };
  lb.onclick = function (e) { if (e.target === lb) lb.hidden = true; };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lb.hidden = true; ficha.hidden = true; }
    if (!lb.hidden && e.key === 'ArrowLeft') mostrar(atual - 1);
    if (!lb.hidden && e.key === 'ArrowRight') mostrar(atual + 1);
  });

  /* ---------- contato ---------- */
  function contato() {
    var e = T.endereco;
    $('#end').innerHTML = esc(e.linha1) + '<br>' + esc(e.linha2) + '<br><a href="' + e.maps + '" target="_blank" rel="noopener">Abrir no Google Maps</a>';
    $('#mapa').src = e.embed;
    var wa = CFG.whatsapp || T.whatsapp;
    if (wa) {
      $('#rede-wa').hidden = false; $('#rede-wa').href = U.wa(wa);
      $('#rede-wa').textContent = 'WhatsApp ' + (CFG.whatsappVisivel || T.whatsappVisivel || '');
      $('#wa-flutua').href = U.wa(wa, 'Olá! Vim pelo site e quero saber sobre a aula experimental.');
      $('#wa-flutua').target = '_blank';
    } else {
      $('#f-enviar').textContent = 'Chamar no Instagram';
      $('#f-nota').textContent = 'A mensagem é copiada. É só colar no direct do @hapkidobotto.';
    }
  }
  $('#form-aula').onsubmit = function (ev) {
    ev.preventDefault();
    var msg = 'Olá, mestre! Vim pelo site e quero agendar uma aula experimental.\n' +
      'Nome: ' + $('#f-nome').value.trim() + '\n' +
      ($('#f-idade').value.trim() ? 'Idade de quem vai treinar: ' + $('#f-idade').value.trim() + '\n' : '') +
      'Modalidade: ' + $('#f-mod').value +
      ($('#f-tea').checked ? '\nObs.: tem TDAH, TEA ou outra necessidade que gostaria de conversar.' : '');
    var wa = CFG.whatsapp || T.whatsapp;
    if (wa) { window.open(U.wa(wa, msg), '_blank'); return; }
    try { navigator.clipboard.writeText(msg); } catch (e) {}
    window.open('https://ig.me/m/' + T.instagram, '_blank');
  };

  /* ---------- carga ---------- */
  Promise.all([BD.alunos(), BD.turmas(), BD.galeria(), BD.config()]).then(function (r) {
    ALUNOS = r[0] || []; GALERIA = r[2] || []; CFG = r[3] || {};
    trilha(); hall(); abas(); mural(); grade(r[1] || []); galeria(); contato();
  }).catch(function (e) {
    console.error(e);
    $('#hall').innerHTML = '<p class="vazio">Não foi possível carregar agora. Tente de novo em instantes.</p>';
    contato();
  });
})();
