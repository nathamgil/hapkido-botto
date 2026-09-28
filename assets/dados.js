/* =====================================================================
   Hapkido Botto — camada de dados
   Mesma interface nos dois modos:
     - demonstração: localStorage (dados só neste navegador)
     - no ar: Supabase (tabelas do db/schema.sql + bucket "fotos")
   Site e painel só falam com window.BD, nunca direto com o banco.
   ===================================================================== */

window.BD = (function () {
  var T = window.HB, demo = T.modoDemo;
  var SEED = 'v1';

  /* ---------- utilidades comuns ---------- */
  var U = {
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    digitos: function (s) { return String(s || '').replace(/\D/g, ''); },
    wa: function (fone, texto) {
      var d = U.digitos(fone); if (d && d.length <= 11) d = '55' + d;
      return 'https://wa.me/' + d + (texto ? '?text=' + encodeURIComponent(texto) : '');
    },
    hoje: function (d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    mesAno: function (iso) {
      if (!iso) return '';
      var p = iso.split('-'), m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return m[+p[1] - 1] + '/' + p[0];
    },
    BRANCA: { id: 'branca', nome: 'Branca', cor: '#F4F1EA', texto: '#17171A' },
    faixa: function (id) { return id === 'branca' ? U.BRANCA : (T.faixas.find(function (f) { return f.id === id; }) || T.faixas[0]); },
    proxima: function (id) {
      if (id === 'branca') return T.faixas[0].id;
      var i = T.faixas.findIndex(function (f) { return f.id === id; });
      return i >= 0 && i < T.faixas.length - 1 ? T.faixas[i + 1].id : null;
    },
    iniciais: function (nome) {
      var p = String(nome || '').replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
      return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
    },
    // "1º Dan" para faixa preta; "2 graus" nas coloridas; vazio se 0.
    grau: function (a) {
      if (a.faixa === 'preta') return (a.grau || 1) + 'º Dan';
      return a.grau ? a.grau + (a.grau > 1 ? ' graus' : ' grau') : '';
    },
    /* Reduz a foto no navegador antes de guardar (JPEG ~900px). */
    reduzir: function (arquivo, lado) {
      lado = lado || 900;
      return new Promise(function (ok, erro) {
        var img = new Image(), url = URL.createObjectURL(arquivo);
        img.onload = function () {
          var e = Math.min(1, lado / Math.max(img.width, img.height));
          var c = document.createElement('canvas'); c.width = Math.round(img.width * e); c.height = Math.round(img.height * e);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(function (b) { b ? ok(b) : erro(new Error('Não consegui ler a foto.')); }, 'image/jpeg', 0.82);
        };
        img.onerror = function () { erro(new Error('Arquivo de imagem inválido.')); };
        img.src = url;
      });
    }
  };

  /* ---------- modo demonstração ---------- */
  var K = function (k) { return 'hb_' + k; };
  function ler(k, def) { try { var v = localStorage.getItem(K(k)); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function gravar(k, v) {
    try { localStorage.setItem(K(k), JSON.stringify(v)); }
    catch (e) { throw new Error('O navegador ficou sem espaço para fotos no modo demonstração. Ligue o Supabase para guardar de verdade.'); }
  }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function novoId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  function semear() {
    if (ler('seed') === SEED) return;
    gravar('alunos', copia(T.alunosDemo));
    gravar('turmas', copia(T.turmasDemo));
    gravar('galeria', copia(T.galeriaDemo).map(function (g, i) { g.ordem = i; return g; }));
    gravar('graduacoes', []);
    gravar('config', { whatsapp: T.whatsapp, whatsappVisivel: T.whatsappVisivel });
    gravar('seed', SEED);
  }
  function ok(v) { return Promise.resolve(v); }
  function tenta(fn) { try { return ok(fn()); } catch (e) { return Promise.reject(e); } }

  var Demo = {
    alunos: function () { semear(); return ok(ler('alunos', [])); },
    turmas: function () { semear(); return ok(ler('turmas', [])); },
    galeria: function () { semear(); return ok(ler('galeria', []).sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); })); },
    config: function () { semear(); return ok(ler('config', {})); },
    graduacoes: function () { semear(); return ok(ler('graduacoes', [])); },

    entrar: function () { return ok(true); },
    sessao: function () { return ok(true); },
    sair: function () { return ok(); },

    salvarAluno: function (a) {
      return tenta(function () {
        var t = ler('alunos', []);
        if (!a.id) { a.id = novoId('a'); t.push(a); }
        else { var i = t.findIndex(function (x) { return x.id === a.id; }); if (i >= 0) t[i] = a; else t.push(a); }
        gravar('alunos', t); return a;
      });
    },
    excluirAluno: function (id) { return tenta(function () { gravar('alunos', ler('alunos', []).filter(function (x) { return x.id !== id; })); }); },
    /* Gradua uma lista de alunos na mesma data e guarda no histórico. */
    graduar: function (lista, data) {
      return tenta(function () {
        var t = ler('alunos', []), h = ler('graduacoes', []);
        lista.forEach(function (g) {
          var a = t.find(function (x) { return x.id === g.id; }); if (!a) return;
          h.push({ id: novoId('g'), aluno_id: a.id, nome: a.nome, de: a.faixa, de_grau: a.grau || 0, para: g.faixa, grau: g.grau || 0, data: data });
          a.faixa = g.faixa; a.grau = g.grau || 0; a.desde = data;
        });
        gravar('alunos', t); gravar('graduacoes', h);
      });
    },
    enviarFoto: function (arquivo) {
      return U.reduzir(arquivo, 700).then(function (b) {
        return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(b); });
      });
    },
    salvarGaleria: function (g) {
      return tenta(function () {
        var t = ler('galeria', []);
        if (!g.id) { g.id = novoId('g'); g.ordem = t.length; t.push(g); }
        else { var i = t.findIndex(function (x) { return x.id === g.id; }); if (i >= 0) t[i] = g; }
        gravar('galeria', t); return g;
      });
    },
    ordenarGaleria: function (ids) { return tenta(function () { var t = ler('galeria', []); t.forEach(function (g) { g.ordem = ids.indexOf(g.id); }); gravar('galeria', t); }); },
    excluirGaleria: function (id) { return tenta(function () { gravar('galeria', ler('galeria', []).filter(function (x) { return x.id !== id; })); }); },
    salvarTurmas: function (lista) { return tenta(function () { lista.forEach(function (x) { if (!x.id) x.id = novoId('t'); }); gravar('turmas', lista); }); },
    salvarConfig: function (c) { return tenta(function () { gravar('config', c); }); },
    zerarDemo: function () { Object.keys(localStorage).filter(function (k) { return k.indexOf('hb_') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); }
  };

  /* ---------- modo no ar (Supabase) ---------- */
  var sb = null;
  function cliente() {
    if (sb) return Promise.resolve(sb);
    return new Promise(function (res, erro) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
      s.onload = function () { sb = window.supabase.createClient(T.supabaseUrl, T.supabaseKey); res(sb); };
      s.onerror = function () { erro(new Error('Sem conexão com o banco.')); };
      document.head.appendChild(s);
    });
  }
  function q(fn) { return cliente().then(fn).then(function (r) { if (r && r.error) throw new Error(r.error.message); return r ? r.data : null; }); }
  var uuid = /^[0-9a-f-]{36}$/;
  function semIdLocal(o) { var d = Object.assign({}, o); if (!uuid.test(d.id || '')) delete d.id; delete d.exemplo; return d; }

  var Nuvem = {
    alunos: function () { return q(function (c) { return c.from('alunos').select('*').order('ordem').order('desde'); }); },
    turmas: function () { return q(function (c) { return c.from('turmas').select('*').order('ordem'); }); },
    galeria: function () { return q(function (c) { return c.from('galeria').select('*').order('ordem'); }); },
    config: function () { return q(function (c) { return c.from('config').select('dados').eq('id', 1).maybeSingle(); }).then(function (r) { return (r && r.dados) || {}; }); },
    graduacoes: function () { return q(function (c) { return c.from('graduacoes').select('*').order('data', { ascending: false }).limit(300); }); },

    entrar: function (email, senha) { return cliente().then(function (c) { return c.auth.signInWithPassword({ email: email, password: senha }); }).then(function (r) { if (r.error) throw new Error('E-mail ou senha incorretos.'); return true; }); },
    sessao: function () { return cliente().then(function (c) { return c.auth.getSession(); }).then(function (r) { return !!(r.data && r.data.session); }); },
    sair: function () { return cliente().then(function (c) { return c.auth.signOut(); }); },

    salvarAluno: function (a) { return q(function (c) { return c.from('alunos').upsert(semIdLocal(a)).select().single(); }); },
    excluirAluno: function (id) { return q(function (c) { return c.from('alunos').delete().eq('id', id); }); },
    graduar: function (lista, data) { return q(function (c) { return c.rpc('graduar', { p_lista: lista, p_data: data }); }); },
    enviarFoto: function (arquivo) {
      return U.reduzir(arquivo, 1400).then(function (b) {
        var nome = Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.jpg';
        return cliente().then(function (c) {
          return c.storage.from('fotos').upload(nome, b, { contentType: 'image/jpeg' }).then(function (r) {
            if (r.error) throw new Error(r.error.message);
            return c.storage.from('fotos').getPublicUrl(nome).data.publicUrl;
          });
        });
      });
    },
    salvarGaleria: function (g) { return q(function (c) { return c.from('galeria').upsert(semIdLocal(g)).select().single(); }); },
    ordenarGaleria: function (ids) { return q(function (c) { return c.from('galeria').upsert(ids.map(function (id, i) { return { id: id, ordem: i }; })); }); },
    excluirGaleria: function (id) { return q(function (c) { return c.from('galeria').delete().eq('id', id); }); },
    salvarTurmas: function (lista) {
      return q(function (c) {
        return c.from('turmas').delete().gte('ordem', 0).then(function () {
          return c.from('turmas').insert(lista.map(function (x, i) { return { modalidade: x.modalidade, dia: x.dia, hora: x.hora, turma: x.turma, ordem: i }; }));
        });
      });
    },
    salvarConfig: function (cfg) { return q(function (c) { return c.from('config').upsert({ id: 1, dados: cfg }); }); },
    zerarDemo: function () {}
  };

  var api = demo ? Demo : Nuvem;
  api.U = U;
  api.demo = demo;
  return api;
})();
