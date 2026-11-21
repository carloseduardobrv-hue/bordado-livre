// Guarda e lê os dados de cada pessoa. Com login usa o Supabase; em modo convidado guarda só neste aparelho.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const CHAVE_LOCAL = 'bordado_convidado_v1';
const convidado = new URLSearchParams(location.search).has('convidado');

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
});

export const estado = {
  convidado,
  utilizador: null,
  perfil: null,
  licoes: new Set(),
  niveis: new Map(), // nivel -> forma
  fotos: [],
};

const PERFIL_VAZIO = {
  nome: '', onboarding_feito: false, pontos_conhecidos: [], interesses: [],
  mao: 'destra', tamanho_letra: 'normal', nivel_inicial: 1,
};

function lerLocal() {
  try { return JSON.parse(localStorage.getItem(CHAVE_LOCAL)) || {}; } catch { return {}; }
}
function gravarLocal() {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify({
      perfil: estado.perfil, licoes: [...estado.licoes], niveis: [...estado.niveis],
    }));
  } catch { /* sem armazenamento local: segue só em memória */ }
}

export async function iniciar(aoMudar) {
  if (convidado) {
    estado.utilizador = { id: 'convidado', nome: 'Convidada' };
    await carregar();
    return;
  }
  const { data } = await sb.auth.getSession();
  await definirSessao(data.session);
  sb.auth.onAuthStateChange((evento, sessao) => {
    if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT') {
      // Fora do callback, para não bloquear o cliente do Supabase.
      setTimeout(async () => { await definirSessao(sessao); aoMudar(); }, 0);
    }
  });
}

async function definirSessao(sessao) {
  if (!sessao) {
    estado.utilizador = null; estado.perfil = null;
    estado.licoes = new Set(); estado.niveis = new Map(); estado.fotos = [];
    return;
  }
  if (estado.utilizador && estado.utilizador.id === sessao.user.id && estado.perfil) return;
  const meta = sessao.user.user_metadata || {};
  estado.utilizador = { id: sessao.user.id, nome: meta.full_name || meta.name || '' };
  await carregar();
}

export async function carregar() {
  if (convidado) {
    const l = lerLocal();
    estado.perfil = { ...PERFIL_VAZIO, ...(l.perfil || {}) };
    estado.licoes = new Set(l.licoes || []);
    estado.niveis = new Map(l.niveis || []);
    return;
  }
  const id = estado.utilizador.id;
  const [perfil, licoes, niveis, fotos] = await Promise.all([
    sb.from('perfis').select('*').eq('id', id).maybeSingle(),
    sb.from('licoes_feitas').select('licao_id').eq('user_id', id),
    sb.from('niveis_concluidos').select('nivel, forma').eq('user_id', id),
    sb.from('fotos').select('id, tipo, nivel, caminho, criado_em').eq('user_id', id).order('criado_em', { ascending: false }),
  ]);
  const erro = perfil.error || licoes.error || niveis.error || fotos.error;
  if (erro) throw erro;
  if (perfil.data) {
    estado.perfil = perfil.data;
  } else {
    const novo = { ...PERFIL_VAZIO, id, nome: estado.utilizador.nome.split(' ')[0] || '' };
    const criado = await sb.from('perfis').insert(novo).select().single();
    if (criado.error) throw criado.error;
    estado.perfil = criado.data;
  }
  estado.licoes = new Set(licoes.data.map((l) => l.licao_id));
  estado.niveis = new Map(niveis.data.map((n) => [n.nivel, n.forma]));
  estado.fotos = fotos.data;
}

export async function entrarGoogle() {
  const destino = location.origin + location.pathname;
  const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: destino } });
  if (error) throw error;
}

export async function sair() {
  if (convidado) { localStorage.removeItem(CHAVE_LOCAL); location.search = ''; return; }
  await sb.auth.signOut();
}

export async function guardarPerfil(mudancas) {
  estado.perfil = { ...estado.perfil, ...mudancas };
  if (convidado) { gravarLocal(); return; }
  const { error } = await sb.from('perfis')
    .update({ ...mudancas, atualizado_em: new Date().toISOString() }).eq('id', estado.utilizador.id);
  if (error) throw error;
}

export async function marcarLicao(licaoId) {
  if (estado.licoes.has(licaoId)) return;
  estado.licoes.add(licaoId);
  if (convidado) { gravarLocal(); return; }
  const { error } = await sb.from('licoes_feitas').upsert({ user_id: estado.utilizador.id, licao_id: licaoId });
  if (error) throw error;
}

export async function concluirNivel(nivel, forma) {
  estado.niveis.set(nivel, forma);
  if (convidado) { gravarLocal(); return; }
  const { error } = await sb.from('niveis_concluidos')
    .upsert({ user_id: estado.utilizador.id, nivel, forma, concluido_em: new Date().toISOString() });
  if (error) throw error;
}

export async function reiniciarProgresso() {
  estado.licoes = new Set(); estado.niveis = new Map();
  if (convidado) { gravarLocal(); return; }
  const id = estado.utilizador.id;
  const a = await sb.from('licoes_feitas').delete().eq('user_id', id);
  const b = await sb.from('niveis_concluidos').delete().eq('user_id', id);
  if (a.error || b.error) throw (a.error || b.error);
}

// Reduz a foto para no máximo 1568 px de lado, em JPEG, antes de enviar.
async function reduzirFoto(ficheiro) {
  const imagem = await createImageBitmap(ficheiro);
  const escala = Math.min(1, 1568 / Math.max(imagem.width, imagem.height));
  const tela = document.createElement('canvas');
  tela.width = Math.round(imagem.width * escala);
  tela.height = Math.round(imagem.height * escala);
  tela.getContext('2d').drawImage(imagem, 0, 0, tela.width, tela.height);
  return new Promise((resolver, rejeitar) =>
    tela.toBlob((b) => (b ? resolver(b) : rejeitar(new Error('Não foi possível preparar a foto.'))), 'image/jpeg', 0.85));
}

export async function enviarFoto(ficheiro, tipo, nivel = null) {
  const blob = await reduzirFoto(ficheiro);
  if (convidado) {
    const foto = { id: String(Date.now()), tipo, nivel, caminho: null, local: URL.createObjectURL(blob), criado_em: new Date().toISOString() };
    estado.fotos.unshift(foto);
    return foto;
  }
  const id = estado.utilizador.id;
  const caminho = `${id}/${tipo}-${Date.now()}.jpg`;
  const envio = await sb.storage.from('fotos').upload(caminho, blob, { contentType: 'image/jpeg' });
  if (envio.error) throw envio.error;
  const linha = await sb.from('fotos').insert({ user_id: id, tipo, nivel, caminho }).select().single();
  if (linha.error) throw linha.error;
  estado.fotos.unshift(linha.data);
  return linha.data;
}

export async function enderecoFoto(foto) {
  if (foto.local) return foto.local;
  const { data, error } = await sb.storage.from('fotos').createSignedUrl(foto.caminho, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function enviarOpiniao(ecra, texto) {
  if (convidado) return;
  const { error } = await sb.from('opinioes').insert({ user_id: estado.utilizador.id, ecra, texto });
  if (error) throw error;
}

// Registo de uso para o teste. Uma falha aqui nunca deve travar o app.
export function evento(nome, dados = null) {
  if (convidado || !estado.utilizador) return;
  sb.from('eventos').insert({ user_id: estado.utilizador.id, nome, dados }).then(() => {}, () => {});
}
