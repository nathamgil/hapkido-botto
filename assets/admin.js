/* Hapkido Botto — painel do mestre
   Abas: Alunos · Dia de exame · Galeria · Horários · Histórico · Configurações */
(function () {
  var T = window.HB, U = BD.U, esc = U.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TODAS = [U.BRANCA].concat(T.faixas);
  var S = { aba: 'alunos', alunos: [], galeria: [], turmas: [], hist: [], cfg: {}, filtro: '', busca: '' };

  function aviso(txt, ruim) {
    var a = $('#aviso'); a.textContent = txt; a.className = 'aviso on' + (ruim ? ' ruim' : '');
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { a.className = 'aviso'; }, 3200);
  }
  function erro(e) { console.error(e); aviso(e && e.message ? e.message : 'Algo deu errado.', true); }
  function opcoesFaixa(sel) { return TODAS.map(function (f) { return '<option value="' + f.id + '"' + (f.id === sel ? ' selected' : '') + '>' + f.nome + '</option>'; }).join(''); }
  function avatar(a) {
    var f = U.faixa(a.faixa);
    return '<div class="av" style="border-color:' + f.cor + ';' + (a.foto ? '' : 'background:' + f.cor + ';color:' + f.texto) + '">' +
      (a.foto ? '<img src="' + esc(a.foto) + '" alt="">' : esc(U.iniciais(a.nome))) + '</div>';
  }

  /* ---------- login ---------- */
  function login() {
    $('#app').innerHTML = '<div class="login"><img src="fotos/logo.png" alt=""><h1>Painel Hapkido Botto</h1>' +
      '<form id="f-login"><div class="campo"><label for="l-email">E-mail</label><input id="l-email" type="email" autocomplete="username" required></div>' +
      '<div class="campo"><label for="l-senha">Senha</label><input id="l-senha" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn btn-p" type="submit">Entrar</button><p class="erro" id="l-erro"></p></form></div>';
    $('#f-login').onsubmit = function (e) {
      e.preventDefault();
      BD.entrar($('#l-email').value, $('#l-senha').value).then(iniciar).catch(function (x) { $('#l-erro').textContent = x.message; });
    };
  }

  /* ---------- estrutura ---------- */
  var ABAS = [['alunos', 'Alunos'], ['exame', 'Dia de exame'], ['galeria', 'Galeria'], ['horarios', 'Horários'], ['historico', 'Histórico'], ['config', 'Configurações']];
  function iniciar() {
    $('#app').innerHTML = '<header class="barra"><img src="fotos/logo.png" alt=""><strong>Painel Hapkido Botto</strong>' +
      (BD.demo ? '<span class="demo">DEMONSTRAÇÃO · dados só neste navegador</span>' : '') +
      '<div class="dir"><a href="index.html" target="_blank">Ver site</a>' + (BD.demo ? '<button id="zerar">Restaurar exemplo</button>' : '<button id="sair">Sair</button>') + '</div></header>' +
      '<nav class="abas" role="tablist">' + ABAS.map(function (a) { return '<button role="tab" data-aba="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</nav><main id="conteudo"></main>';
    $('.abas').onclick = function (e) { var b = e.target.closest('[data-aba]'); if (b) { S.aba = b.dataset.aba; desenhar(); } };
    if ($('#sair')) $('#sair').onclick = function () { BD.sair().then(login); };
    if ($('#zerar')) $('#zerar').onclick = function () { if (confirm('Apagar o que foi feito aqui e voltar aos dados de exemplo?')) { BD.zerarDemo(); carregar(); } };
    carregar();
  }
  function carregar() {
    return Promise.all([BD.alunos(), BD.galeria(), BD.turmas(), BD.graduacoes(), BD.config()]).then(function (r) {
      S.alunos = r[0] || []; S.galeria = r[1] || []; S.turmas = r[2] || []; S.hist = r[3] || []; S.cfg = r[4] || {};
      desenhar();
    }).catch(erro);
  }
  function desenhar() {
    $$('.abas [data-aba]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.aba === S.aba); });
    ({ alunos: abaAlunos, exame: abaExame, galeria: abaGaleria, horarios: abaHorarios, historico: abaHistorico, config: abaConfig })[S.aba]();
  }

  /* ---------- ALUNOS ---------- */
  function ordemFaixa(id) { return TODAS.findIndex(function (f) { return f.id === id; }); }
  function abaAlunos() {
    var cont = {}; S.alunos.forEach(function (a) { cont[a.faixa] = (cont[a.faixa] || 0) + 1; });
    var lista = S.alunos.filter(function (a) {
      return (!S.filtro || a.faixa === S.filtro) && (!S.busca || a.nome.toLowerCase().indexOf(S.busca.toLowerCase()) >= 0);
    }).sort(function (a, b) { return ordemFaixa(b.faixa) - ordemFaixa(a.faixa) || (b.grau || 0) - (a.grau || 0) || a.nome.localeCompare(b.nome); });

    $('#conteudo').innerHTML =
      '<div class="topo-aba"><h2>Alunos</h2><button class="btn btn-p" id="novo">+ Cadastrar aluno</button></div>' +
      '<p class="ajuda">Todo aluno da cinza em diante aparece no mural do site. A preta vai para a Galeria de Honra. A branca fica só aqui no painel. Foto só aparece no site com autorização de imagem.</p>' +
      '<div class="resumo">' + TODAS.slice().reverse().map(function (f) { return '<div style="border-top-color:' + f.cor + '"><b>' + (cont[f.id] || 0) + '</b><span>' + f.nome + '</span></div>'; }).join('') + '</div>' +
      '<div class="filtros"><button class="chip" aria-pressed="' + (!S.filtro) + '" data-f="">Todas</button>' +
      TODAS.slice().reverse().map(function (f) { return '<button class="chip" aria-pressed="' + (S.filtro === f.id) + '" data-f="' + f.id + '"><span class="bol" style="background:' + f.cor + '"></span>' + f.nome + '</button>'; }).join('') + '</div>' +
      '<input class="busca" id="busca" type="search" placeholder="Procurar aluno pelo nome…" value="' + esc(S.busca) + '">' +
      '<div class="lista">' + (lista.length ? lista.map(function (a) {
        var f = U.faixa(a.faixa), prox = U.proxima(a.faixa);
        return '<div class="linha">' + avatar(a) + '<div><div class="linha-nome">' + esc(a.nome) + '</div><div class="linha-meta">' +
          '<span class="tag" style="background:' + f.cor + ';color:' + f.texto + '">' + f.nome + (U.grau(a) ? ' · ' + U.grau(a) : '') + '</span>' +
          '<span>' + esc(a.modalidade || '') + '</span>' + (a.desde ? '<span>desde ' + U.mesAno(a.desde) + '</span>' : '') +
          (a.publicar === false ? '<span class="tag tag-off">oculto no site</span>' : '') +
          (a.foto && !a.autorizado ? '<span class="tag tag-off">foto sem autorização</span>' : '') +
          (a.exemplo ? '<span class="tag tag-ex">exemplo</span>' : '') + '</div></div>' +
          '<div class="linha-acoes"><button class="btn btn-peq" data-editar="' + esc(a.id) + '">Editar</button>' +
          (prox ? '<button class="btn btn-peq btn-ouro" data-graduar="' + esc(a.id) + '">Graduar → ' + U.faixa(prox).nome + '</button>'
                : '<button class="btn btn-peq btn-ouro" data-dan="' + esc(a.id) + '">+1 Dan</button>') + '</div></div>';
      }).join('') : '<p class="vazio">Nenhum aluno aqui ainda.</p>') + '</div>';

    $('#novo').onclick = function () { formAluno({ faixa: 'branca', grau: 0, modalidade: T.modalidades[0], desde: U.hoje(), publicar: true, autorizado: false }); };
    $('.filtros').onclick = function (e) { var b = e.target.closest('[data-f]'); if (b) { S.filtro = b.dataset.f; abaAlunos(); } };
    $('#busca').oninput = function (e) { S.busca = e.target.value; var p = e.target.selectionStart; abaAlunos(); var n = $('#busca'); n.focus(); n.setSelectionRange(p, p); };
    $('.lista').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var achar = function (id) { return S.alunos.find(function (x) { return String(x.id) === id; }); };
      if (b.dataset.editar) formAluno(Object.assign({}, achar(b.dataset.editar)));
      if (b.dataset.graduar) {
        var a = achar(b.dataset.graduar), p = U.proxima(a.faixa);
        if (!confirm('Graduar ' + a.nome + ' para a faixa ' + U.faixa(p).nome.toLowerCase() + ' com data de hoje?')) return;
        BD.graduar([{ id: a.id, faixa: p, grau: p === 'preta' ? 1 : 0 }], U.hoje()).then(function () { aviso('Parabéns! ' + a.nome + ' agora é faixa ' + U.faixa(p).nome.toLowerCase() + '.'); return carregar(); }).catch(erro);
      }
      if (b.dataset.dan) {
        var d = achar(b.dataset.dan), g = (d.grau || 1) + 1;
        if (!confirm('Promover ' + d.nome + ' a ' + g + 'º Dan com data de hoje?')) return;
        BD.graduar([{ id: d.id, faixa: 'preta', grau: g }], U.hoje()).then(function () { aviso(d.nome + ' agora é ' + g + 'º Dan.'); return carregar(); }).catch(erro);
      }
    };
  }

  function formAluno(a) {
    var m = $('#modal'), novo = !a.id;
    m.innerHTML = '<form class="caixa" id="f-aluno"><h2>' + (novo ? 'Cadastrar aluno' : 'Editar aluno') + '</h2>' +
      '<div class="foto-campo">' + avatar(a) + '<div><label class="btn btn-peq" style="cursor:pointer">Escolher foto<input type="file" accept="image/*" id="a-foto" hidden></label>' +
      (a.foto ? ' <button type="button" class="btn btn-peq" id="a-semfoto">Tirar foto</button>' : '') + '<br><small>A foto é reduzida antes de enviar.</small></div></div>' +
      '<div class="campo"><label for="a-nome">Nome como vai aparecer no site</label><input id="a-nome" required value="' + esc(a.nome || '') + '"><small>Para menores, pode usar só o primeiro nome e a inicial do sobrenome (ex.: Ana S.).</small></div>' +
      '<div class="grid2"><div class="campo"><label for="a-faixa">Faixa atual</label><select id="a-faixa">' + opcoesFaixa(a.faixa) + '</select></div>' +
      '<div class="campo"><label for="a-grau" id="a-grau-rot">' + (a.faixa === 'preta' ? 'Dan' : 'Graus na faixa') + '</label><input id="a-grau" type="number" min="0" max="10" value="' + (a.grau || 0) + '"></div></div>' +
      '<div class="grid2"><div class="campo"><label for="a-mod">Modalidade</label><select id="a-mod">' + T.modalidades.map(function (x) { return '<option' + (x === a.modalidade ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="a-desde">Nesta faixa desde</label><input id="a-desde" type="date" value="' + esc(a.desde || '') + '"></div></div>' +
      '<div class="campo"><label for="a-titulo">Título (opcional)</label><input id="a-titulo" placeholder="ex.: Instrutor, Atleta da equipe, Campeão baiano 2025" value="' + esc(a.titulo || '') + '"></div>' +
      '<div class="campo"><label for="a-bio">Trajetória (opcional, aparece ao clicar no card)</label><textarea id="a-bio">' + esc(a.bio || '') + '</textarea></div>' +
      '<label class="check"><input type="checkbox" id="a-aut"' + (a.autorizado ? ' checked' : '') + '><span>Tenho autorização de uso de imagem<small>Do próprio aluno ou do responsável, se for menor. Sem isso, o site mostra só as iniciais.</small></span></label>' +
      '<label class="check"><input type="checkbox" id="a-pub"' + (a.publicar !== false ? ' checked' : '') + '><span>Mostrar no site<small>Desmarque para deixar o aluno só no painel.</small></span></label>' +
      '<div class="caixa-acoes">' + (novo ? '' : '<button type="button" class="btn btn-perigo esq" id="a-excluir">Excluir</button>') +
      '<button type="button" class="btn" id="a-cancelar">Cancelar</button><button class="btn btn-p" type="submit" id="a-salvar">Salvar</button></div></form>';
    m.hidden = false;
    $('#a-nome').focus();
    $('#a-faixa').onchange = function () {
      var p = this.value === 'preta'; $('#a-grau-rot').textContent = p ? 'Dan' : 'Graus na faixa';
      if (p && +$('#a-grau').value < 1) $('#a-grau').value = 1;
    };
    $('#a-cancelar').onclick = fechar;
    if ($('#a-semfoto')) $('#a-semfoto').onclick = function () { a.foto = ''; formAlunoManter(); };
    function formAlunoManter() { lerCampos(); formAluno(a); }
    $('#a-foto').onchange = function () {
      var f = this.files[0]; if (!f) return;
      aviso('Enviando foto…');
      BD.enviarFoto(f).then(function (url) { a.foto = url; formAlunoManter(); aviso('Foto pronta. Lembre de salvar.'); }).catch(erro);
    };
    if ($('#a-excluir')) $('#a-excluir').onclick = function () {
      if (!confirm('Excluir ' + a.nome + ' do painel e do site?')) return;
      BD.excluirAluno(a.id).then(function () { fechar(); aviso('Aluno excluído.'); return carregar(); }).catch(erro);
    };
    function lerCampos() {
      a.nome = $('#a-nome').value.trim(); a.faixa = $('#a-faixa').value; a.grau = +$('#a-grau').value || 0;
      if (a.faixa === 'preta' && a.grau < 1) a.grau = 1;
      a.modalidade = $('#a-mod').value; a.desde = $('#a-desde').value || null;
      a.titulo = $('#a-titulo').value.trim(); a.bio = $('#a-bio').value.trim();
      a.autorizado = $('#a-aut').checked; a.publicar = $('#a-pub').checked;
    }
    $('#f-aluno').onsubmit = function (e) {
      e.preventDefault(); lerCampos();
      if (a.exemplo && !/exemplo/i.test(a.nome)) a.exemplo = false;
      $('#a-salvar').disabled = true;
      BD.salvarAluno(a).then(function () { fechar(); aviso('Salvo.'); return carregar(); }).catch(function (x) { $('#a-salvar').disabled = false; erro(x); });
    };
  }
  function fechar() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#modal').hidden) fechar(); });

  /* ---------- DIA DE EXAME ---------- */
  function abaExame() {
    var lista = S.alunos.slice().sort(function (a, b) { return ordemFaixa(a.faixa) - ordemFaixa(b.faixa) || a.nome.localeCompare(b.nome); });
    $('#conteudo').innerHTML = '<div class="topo-aba"><h2>Dia de exame</h2></div>' +
      '<p class="ajuda">Marque quem passou no exame, confira a faixa nova e confirme uma vez só. Todos ficam graduados na mesma data e o site se atualiza sozinho.</p>' +
      '<div class="exame-topo"><div class="campo"><label for="e-data">Data do exame</label><input id="e-data" type="date" value="' + U.hoje() + '"></div>' +
      '<button class="btn btn-p" id="e-ok">Confirmar graduações (<span id="e-n">0</span>)</button></div>' +
      '<div class="lista" id="e-lista">' + lista.map(function (a) {
        var prox = U.proxima(a.faixa) || 'preta', f = U.faixa(a.faixa);
        var grau = a.faixa === 'preta' ? (a.grau || 1) + 1 : (prox === 'preta' ? 1 : 0);
        return '<label class="exame-linha" data-id="' + esc(a.id) + '"><input type="checkbox">' +
          '<span><b>' + esc(a.nome) + '</b><br><span class="tag" style="background:' + f.cor + ';color:' + f.texto + '">' + f.nome + (U.grau(a) ? ' · ' + U.grau(a) : '') + '</span></span>' +
          '<select aria-label="Nova faixa">' + opcoesFaixa(prox) + '</select>' +
          '<input type="number" min="0" max="10" value="' + grau + '" aria-label="Grau ou Dan" title="Grau (ou Dan, na preta)" style="min-height:44px;border:2px solid var(--linha);border-radius:10px;padding:0 8px"></label>';
      }).join('') + '</div>';
    var contar = function () { var n = $$('#e-lista input[type=checkbox]:checked').length; $('#e-n').textContent = n; $$('.exame-linha').forEach(function (l) { l.classList.toggle('marcado', $('input[type=checkbox]', l).checked); }); };
    $('#e-lista').onchange = contar;
    $('#e-ok').onclick = function () {
      var sel = $$('.exame-linha').filter(function (l) { return $('input[type=checkbox]', l).checked; }).map(function (l) {
        return { id: l.dataset.id, faixa: $('select', l).value, grau: +$('input[type=number]', l).value || 0 };
      });
      if (!sel.length) { aviso('Marque pelo menos um aluno.', true); return; }
      if (!confirm('Confirmar ' + sel.length + ' graduação(ões) em ' + $('#e-data').value.split('-').reverse().join('/') + '?')) return;
      BD.graduar(sel, $('#e-data').value).then(function () { aviso(sel.length + ' aluno(s) graduado(s). Oss!'); S.aba = 'historico'; return carregar(); }).catch(erro);
    };
  }

  /* ---------- GALERIA ---------- */
  function abaGaleria() {
    $('#conteudo').innerHTML = '<div class="topo-aba"><h2>Galeria</h2></div>' +
      '<label class="upload">📷 Toque para adicionar fotos (pode escolher várias)<input type="file" accept="image/*" multiple id="g-up"></label>' +
      '<div class="gal">' + S.galeria.map(function (g, i) {
        return '<div class="gal-item" data-id="' + esc(g.id) + '"><img src="' + esc(g.src) + '" alt=""><div class="corpo">' +
          '<input value="' + esc(g.legenda || '') + '" placeholder="Legenda" aria-label="Legenda">' +
          '<div class="btns"><button class="btn btn-peq" data-mover="-1"' + (i ? '' : ' disabled') + ' aria-label="Mover para antes">←</button>' +
          '<button class="btn btn-peq" data-mover="1"' + (i < S.galeria.length - 1 ? '' : ' disabled') + ' aria-label="Mover para depois">→</button>' +
          '<button class="btn btn-peq" data-salvar>Salvar</button><button class="btn btn-peq btn-perigo" data-excluir aria-label="Excluir">✕</button></div></div></div>';
      }).join('') + '</div>';
    $('#g-up').onchange = function () {
      var fs = Array.prototype.slice.call(this.files); if (!fs.length) return;
      aviso('Enviando ' + fs.length + ' foto(s)…');
      fs.reduce(function (p, f) { return p.then(function () { return BD.enviarFoto(f).then(function (url) { return BD.salvarGaleria({ src: url, legenda: '', ordem: S.galeria.length + 1 }); }); }); }, Promise.resolve())
        .then(function () { aviso('Fotos adicionadas.'); return carregar(); }).catch(erro);
    };
    $('.gal').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var item = b.closest('.gal-item'), id = item.dataset.id, g = S.galeria.find(function (x) { return String(x.id) === id; });
      if (b.hasAttribute('data-salvar')) { g.legenda = $('input', item).value.trim(); BD.salvarGaleria(g).then(function () { aviso('Legenda salva.'); }).catch(erro); }
      if (b.hasAttribute('data-excluir') && confirm('Tirar esta foto da galeria?')) BD.excluirGaleria(id).then(carregar).catch(erro);
      if (b.dataset.mover) {
        var ids = S.galeria.map(function (x) { return x.id; }), i = ids.indexOf(g.id), j = i + +b.dataset.mover;
        ids.splice(j, 0, ids.splice(i, 1)[0]);
        BD.ordenarGaleria(ids).then(carregar).catch(erro);
      }
    };
  }

  /* ---------- HORÁRIOS ---------- */
  function abaHorarios() {
    var dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo', 'A confirmar'];
    function linha(t) {
      return '<div class="turma-linha"><div class="campo"><label>Modalidade</label><select data-k="modalidade">' + T.modalidades.map(function (x) { return '<option' + (x === t.modalidade ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="campo"><label>Dia</label><select data-k="dia">' + dias.map(function (x) { return '<option' + (x === t.dia ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="campo"><label>Horário</label><input data-k="hora" placeholder="19h às 20h30" value="' + esc(t.hora || '') + '"></div>' +
        '<div class="campo"><label>Turma</label><input data-k="turma" placeholder="Infantil, adulto…" value="' + esc(t.turma || '') + '"></div>' +
        '<button type="button" class="btn btn-peq btn-perigo" data-tirar aria-label="Remover">✕</button></div>';
    }
    $('#conteudo').innerHTML = '<div class="topo-aba"><h2>Horários</h2><button class="btn" id="h-add">+ Aula</button><button class="btn btn-p" id="h-salvar">Salvar horários</button></div>' +
      '<p class="ajuda">A ordem daqui é a ordem do site. Horário em branco aparece como "a confirmar".</p><div id="h-lista">' + S.turmas.map(linha).join('') + '</div>';
    $('#h-add').onclick = function () { $('#h-lista').insertAdjacentHTML('beforeend', linha({ modalidade: T.modalidades[0], dia: 'Segunda' })); };
    $('#h-lista').onclick = function (e) { if (e.target.closest('[data-tirar]')) e.target.closest('.turma-linha').remove(); };
    $('#h-salvar').onclick = function () {
      var lista = $$('.turma-linha').map(function (l) { var t = {}; $$('[data-k]', l).forEach(function (c) { t[c.dataset.k] = c.value.trim(); }); return t; });
      BD.salvarTurmas(lista).then(function () { aviso('Horários salvos.'); return carregar(); }).catch(erro);
    };
  }

  /* ---------- HISTÓRICO ---------- */
  function abaHistorico() {
    var h = S.hist.slice().sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });
    $('#conteudo').innerHTML = '<div class="topo-aba"><h2>Histórico de graduações</h2></div>' +
      (h.length ? '<table class="hist"><thead><tr><th>Data</th><th>Aluno</th><th>De</th><th>Para</th></tr></thead><tbody>' + h.map(function (g) {
        var de = U.faixa(g.de), para = U.faixa(g.para);
        var gd = g.de === 'preta' ? ' ' + (g.de_grau || 1) + 'º Dan' : '', gp = g.para === 'preta' ? ' ' + (g.grau || 1) + 'º Dan' : (g.grau ? ' · ' + g.grau + 'º grau' : '');
        return '<tr><td>' + String(g.data).split('-').reverse().join('/') + '</td><td><b>' + esc(g.nome) + '</b></td>' +
          '<td><span class="tag" style="background:' + de.cor + ';color:' + de.texto + '">' + de.nome + gd + '</span></td>' +
          '<td><span class="tag" style="background:' + para.cor + ';color:' + para.texto + '">' + para.nome + gp + '</span></td></tr>';
      }).join('') + '</tbody></table>' : '<p class="vazio">As graduações feitas pelo painel aparecem aqui, com data.</p>');
  }

  /* ---------- CONFIGURAÇÕES ---------- */
  function abaConfig() {
    $('#conteudo').innerHTML = '<div class="topo-aba"><h2>Configurações</h2></div>' +
      '<form class="caixa" id="f-cfg" style="max-width:560px;box-shadow:none;border:1px solid var(--linha)">' +
      '<div class="campo"><label for="c-wa">WhatsApp da aula experimental</label><input id="c-wa" inputmode="tel" placeholder="(71) 9xxxx-xxxx" value="' + esc(S.cfg.whatsappVisivel || S.cfg.whatsapp || '') + '"><small>É para onde vai o botão "Aula experimental" do site. Vazio = direct do Instagram.</small></div>' +
      '<div class="caixa-acoes"><button class="btn btn-p">Salvar</button></div></form>';
    $('#f-cfg').onsubmit = function (e) {
      e.preventDefault();
      var v = $('#c-wa').value.trim(), d = U.digitos(v);
      if (d && d.length < 10) { aviso('Número incompleto. Use DDD + número.', true); return; }
      S.cfg.whatsapp = d ? (d.length <= 11 ? '55' + d : d) : ''; S.cfg.whatsappVisivel = v;
      BD.salvarConfig(S.cfg).then(function () { aviso('Salvo.'); }).catch(erro);
    };
  }

  /* ---------- partida ---------- */
  BD.sessao().then(function (ok) { ok ? iniciar() : login(); }).catch(function (e) { erro(e); login(); });
})();
