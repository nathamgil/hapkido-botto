/* =====================================================================
   Hapkido Botto — configuração
   Único arquivo que precisa ser editado para o site sair do modo de
   demonstração e entrar no ar de verdade.
   ===================================================================== */

window.HB = {

  /* ---- Academia --------------------------------------------------- */
  nome:      'Hapkido Botto',
  instagram: 'hapkidobotto',
  instagramMestre: 'ric.botto',
  fundacao:  'abril de 2014',

  // WhatsApp da aula experimental, só dígitos com DDI. PENDENTE: pedir ao mestre.
  whatsapp:        '',
  whatsappVisivel: '',

  // Sede. Endereço do site antigo (Wix, 2013) — CONFIRMAR com o mestre.
  endereco: {
    linha1: 'Rua Ângelo de Brito, 1',
    linha2: 'Federação · Salvador, BA',
    maps:   'https://www.google.com/maps/search/?api=1&query=Rua+%C3%82ngelo+de+Brito+1+Federa%C3%A7%C3%A3o+Salvador+BA',
    embed:  'https://www.google.com/maps?q=Rua+%C3%82ngelo+de+Brito,+1,+Federa%C3%A7%C3%A3o,+Salvador+-+BA&output=embed'
  },

  /* ---- Supabase ---------------------------------------------------
     Enquanto estes dois campos estiverem vazios, o site roda em MODO
     DEMONSTRAÇÃO: o painel funciona de verdade na tela, mas os dados
     ficam guardados só no navegador de quem está olhando.

     Para ligar de verdade:
       1. supabase.com  ->  New project (região: South America / São Paulo)
       2. SQL Editor    ->  cole e rode db/schema.sql inteiro
       3. Authentication > Users -> crie o usuário do mestre
       4. SQL Editor    ->  insert into admins (user_id, nome) values ('<id>', 'Ricardo Botto');
       5. Settings > API -> copie "Project URL" e a chave "anon public"
       6. cole abaixo e publique de novo
  ------------------------------------------------------------------ */
  supabaseUrl: '',
  supabaseKey: '',

  /* ---- Sistema de faixas (ordem de graduação) ----------------------
     A branca é o começo e não entra no mural. Do cinza em diante, cada
     aluno aparece na sua faixa. "cor" pinta a faixa; "ponta" é o detalhe.
  ------------------------------------------------------------------ */
  faixas: [
    { id: 'cinza',    nome: 'Cinza',    cor: '#8A8D91', texto: '#fff' },
    { id: 'amarela',  nome: 'Amarela',  cor: '#F2C200', texto: '#1a1400' },
    { id: 'laranja',  nome: 'Laranja',  cor: '#EE7A12', texto: '#fff' },
    { id: 'verde',    nome: 'Verde',    cor: '#1E8B3A', texto: '#fff' },
    { id: 'azul',     nome: 'Azul',     cor: '#1F4FB5', texto: '#fff' },
    { id: 'vermelha', nome: 'Vermelha', cor: '#C8102E', texto: '#fff' },
    { id: 'preta',    nome: 'Preta',    cor: '#0B0B0C', texto: '#E9CF95' }
  ],

  modalidades: ['Hapkido', 'Senshi Kickboxing'],

  /* ---- Dados de partida da demonstração ---------------------------- */
  turmasDemo: [
    // Senshi às terças, quintas e sábados (informado pelo Natham). Horas e a grade do Hapkido: a confirmar.
    { id: 't1', modalidade: 'Hapkido',           dia: 'A confirmar', hora: '', turma: 'Crianças, jovens e adultos' },
    { id: 't2', modalidade: 'Senshi Kickboxing', dia: 'Terça',   hora: '', turma: '' },
    { id: 't3', modalidade: 'Senshi Kickboxing', dia: 'Quinta',  hora: '', turma: '' },
    { id: 't4', modalidade: 'Senshi Kickboxing', dia: 'Sábado',  hora: '', turma: '' }
  ],

  // O mestre é real (bio do @ric.botto). Os demais são exemplos até a
  // academia cadastrar os alunos de verdade no painel.
  alunosDemo: [
    { id: 'a0', nome: 'Ricardo Botto', titulo: 'Sabeomnim · fundador', faixa: 'preta', grau: 4, modalidade: 'Hapkido', desde: '2014-04-01',
      foto: 'fotos/mestre-neve.jpg', bio: '4º Dan Hapkido · 3º Dan Senshi Kickboxing · 2º Kyu Karatê Kyokushin. Melhor Técnico de Hapkido 2026 (Melhores do Esporte).',
      publicar: true, autorizado: true, exemplo: false, ordem: 0 },
    { id: 'a1', nome: 'Faixa preta (exemplo)', titulo: 'Instrutor', faixa: 'preta', grau: 1, modalidade: 'Hapkido', desde: '2022-12-10', foto: '', bio: 'Espaço para a trajetória de cada faixa preta da academia.', publicar: true, autorizado: true, exemplo: true, ordem: 1 },
    { id: 'a2', nome: 'Faixa preta (exemplo)', titulo: '', faixa: 'preta', grau: 1, modalidade: 'Hapkido', desde: '2024-06-15', foto: '', bio: '', publicar: true, autorizado: true, exemplo: true, ordem: 2 },
    { id: 'a3', nome: 'Faixa preta (exemplo)', titulo: '', faixa: 'preta', grau: 1, modalidade: 'Senshi Kickboxing', desde: '2025-11-29', foto: '', bio: '', publicar: true, autorizado: true, exemplo: true, ordem: 3 },
    { id: 'a4', nome: 'Aluna (exemplo)', faixa: 'vermelha', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a5', nome: 'Aluno (exemplo)', faixa: 'vermelha', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a6', nome: 'Aluna (exemplo)', faixa: 'azul', grau: 0, modalidade: 'Hapkido', desde: '2025-12-13', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a7', nome: 'Aluno (exemplo)', faixa: 'azul', grau: 0, modalidade: 'Senshi Kickboxing', desde: '2026-03-21', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a8', nome: 'Aluno (exemplo)', faixa: 'verde', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a9', nome: 'Aluna (exemplo)', faixa: 'laranja', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a10', nome: 'Aluno (exemplo)', faixa: 'amarela', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true },
    { id: 'a11', nome: 'Aluna (exemplo)', faixa: 'cinza', grau: 0, modalidade: 'Hapkido', desde: '2026-06-20', foto: '', publicar: true, autorizado: false, exemplo: true }
  ],

  galeriaDemo: [
    { id: 'g1', src: 'fotos/equipe-dojang.jpg',        legenda: 'Família Hapkido Botto no dojang' },
    { id: 'g2', src: 'fotos/equipe-brasil.jpg',        legenda: 'Equipe e troféus em competição' },
    { id: 'g3', src: 'fotos/trofeus-2026.jpg',         legenda: 'Melhores do Esporte 2026 — Melhor Técnico e Melhor Atleta' },
    { id: 'g4', src: 'fotos/turma-kids.jpg',           legenda: 'Turma infantil' },
    { id: 'g5', src: 'fotos/mestre-aula.jpg',          legenda: '12 anos de Hapkido Botto' },
    { id: 'g6', src: 'fotos/atleta-faixa-vermelha.jpg', legenda: 'Atleta da equipe' },
    { id: 'g7', src: 'fotos/aula-colegio.jpg',         legenda: 'Aula em colégio parceiro' },
    { id: 'g8', src: 'fotos/mestre-atletas.jpg',       legenda: 'Mestre Botto e atletas' },
    { id: 'g9', src: 'fotos/mestre-neve.jpg',          legenda: 'Hapkido em qualquer lugar' }
  ]
};

// Sem as chaves do Supabase, tudo roda no navegador (demonstração).
window.HB.modoDemo = !(window.HB.supabaseUrl && window.HB.supabaseKey);
