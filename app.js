import {
  estado, iniciar, entrarGoogle, sair, guardarPerfil, marcarLicao, concluirNivel,
  reiniciarProgresso, enviarFoto, enderecoFoto, enviarOpiniao, evento,
} from './armazenamento.js';
import { PONTOS_TAGS, INTERESSES, sugerirNivel, NIVEIS, LICOES, PROJETOS, RISCOS, PONTOS } from './dados.js';
import { desenharPonto, FIGURAS } from './diagramas.js';

const raiz = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let ui = {}; // estado passageiro do ecrã atual
let ultimaRota = '';

const ICONES = {
  inicio: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  guia: '<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-3a3 3 0 0 0-3 3"/><path d="M14 20a2 2 0 0 1 2-2h4V5"/>',
  treino: '<circle cx="12" cy="13" r="8"/><path d="M10 3h4v2h-4z"/><path d="M8 15c1.5-2 3.5-3 6-2"/>',
  projeto: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1.5-3h5L16 6"/>',
  conta: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  certo: '<path d="M4 12l5 5L20 6"/>',
  seta: '<path d="M9 6l6 6-6 6"/>',
  voltar: '<path d="M15 6l-6 6 6 6"/>',
  fala: '<path d="M4 5h16v11H9l-5 4z"/>',
};
const icone = (n) => `<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n]}</svg>`;

// ---------- Vídeo do YouTube ----------
// Aceita o endereço completo do vídeo (normal, curto ou Shorts) ou só o código de 11 caracteres.
function lerYoutube(valor) {
  if (!valor) return null;
  const texto = String(valor).trim();
  const m = texto.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  if (m) return { id: m[1], vertical: texto.includes('/shorts/') };
  return /^[\w-]{11}$/.test(texto) ? { id: texto, vertical: false } : null;
}
function blocoVideo(valor, titulo, mostrarVazio) {
  const v = lerYoutube(valor);
  if (!v) return mostrarVazio ? `<div class="video vazio"><p>Vídeo deste ponto em preparação.</p></div>` : '';
  return `<div class="video ${v.vertical ? 'vertical' : ''}"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1&loop=1&playlist=${v.id}"
    title="Vídeo: ${esc(titulo)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

// ---------- Regras de níveis ----------
function statusNivel(n) {
  const inicial = estado.perfil.nivel_inicial;
  if (estado.niveis.has(n)) return 'concluido';
  if (n < inicial) return 'dispensado';
  if (n === 1 || n === inicial || estado.niveis.has(n - 1)) return 'aberto';
  return 'fechado';
}
const nivelAtual = () => (NIVEIS.find((x) => statusNivel(x.n) === 'aberto') || NIVEIS[NIVEIS.length - 1]).n;
const temConteudo = (n) => Boolean(LICOES[n]);

// ---------- Rotas ----------
function lerRota() {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  return { nome: partes[0] || 'inicio', arg: partes[1] || '' };
}
const ir = (destino) => { location.hash = '#/' + destino; };

function desenhar() {
  const r = lerRota();
  const chave = r.nome + '/' + r.arg;
  if (chave !== ultimaRota) { ui = {}; ultimaRota = chave; evento('ecra', { rota: chave }); window.scrollTo(0, 0); }
  // No questionário, a letra escolhida mostra-se logo, antes de ser guardada.
  document.documentElement.dataset.letra = ui.ob?.letra || estado.perfil?.tamanho_letra || 'normal';

  if (!estado.utilizador) { raiz.innerHTML = ecraEntrar(); return; }
  if (!estado.perfil.onboarding_feito || r.nome === 'boas-vindas') { raiz.innerHTML = ecraBoasVindas(); return; }

  const ecras = { inicio: ecraInicio, guia: ecraGuia, nivel: ecraNivel, licao: ecraLicao, festa: ecraFesta,
    treino: ecraTreino, ponto: ecraPonto, projeto: ecraProjeto, mesa: ecraMesa, conta: ecraConta };
  const ecra = ecras[r.nome] || ecraInicio;
  const semMoldura = r.nome === 'festa';
  raiz.innerHTML = semMoldura ? ecra(r.arg) : moldura(r.nome, ecra(r.arg));
  if (r.nome === 'inicio') preencherGaleria();
}

function moldura(rota, conteudo) {
  const abas = [['inicio', 'Início'], ['guia', 'Guia'], ['treino', 'Treino'], ['projeto', 'Meu projeto']];
  const ativa = { nivel: 'guia', licao: 'guia', ponto: 'treino', mesa: 'projeto' }[rota] || rota;
  return `
    <header class="topo">
      <a class="marca" href="#/inicio">Bordado Livre</a>
      <div class="topo-acoes">
        <button class="botao-topo" data-acao="abrir-opiniao">${icone('fala')}<span>Opinião</span></button>
        <a class="botao-topo" href="#/conta" aria-label="Minha conta">${icone('conta')}</a>
      </div>
    </header>
    <main class="pagina">${conteudo}</main>
    <nav class="abas" aria-label="Menu principal">
      ${abas.map(([id, nome]) => `<a href="#/${id}" class="aba" ${ativa === id ? 'aria-current="page"' : ''}>${icone(id)}<span>${nome}</span></a>`).join('')}
    </nav>`;
}

// ---------- Entrar ----------
function ecraEntrar() {
  return `<main class="entrar">
    <svg class="logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="64" r="44" fill="#FBF9F3" stroke="#C5A06E" stroke-width="9"/><rect x="52" y="8" width="16" height="12" rx="3" fill="#9A8968"/><path d="M60 88 C40 74 36 58 44 51 C51 45 58 50 60 57 C62 50 69 45 76 51 C84 58 80 74 60 88 Z" fill="none" stroke="#B84A24" stroke-width="4" stroke-dasharray="7 4" stroke-linecap="round"/></svg>
    <h1>Bordado Livre</h1>
    <p class="lema">Aprenda a bordar um ponto de cada vez, no seu ritmo.</p>
    <button class="botao grande" data-acao="entrar-google">Entrar com Google</button>
    <p class="nota">Usamos a sua conta Google só para guardar o seu progresso.</p>
    <p class="nota">Esta é uma versão de teste. A sua opinião ajuda a melhorar o aplicativo.</p>
  </main>`;
}

// ---------- Questionário de entrada ----------
function ecraBoasVindas() {
  if (!ui.ob) {
    const p = estado.perfil;
    ui.ob = { passo: 0, pontos: new Set(p.pontos_conhecidos), interesses: new Set(p.interesses), mao: p.mao, letra: p.tamanho_letra, nivel: null, fotoEnviada: false };
  }
  const o = ui.ob;
  const etiquetas = (lista, escolhidas, grupo) => `<div class="etiquetas">${lista.map((t) =>
    `<button class="etiqueta" data-acao="etiqueta" data-grupo="${grupo}" data-id="${t.id}" aria-pressed="${escolhidas.has(t.id)}">${t.desenho ? `<svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">${t.desenho}</svg>` : ''}${esc(t.nome)}</button>`).join('')}</div>`;
  const opcoes = (grupo, lista, atual) => `<div class="opcoes">${lista.map(([id, nome]) =>
    `<button class="opcao" data-acao="opcao" data-grupo="${grupo}" data-id="${id}" aria-pressed="${atual === id}">${nome}</button>`).join('')}</div>`;
  const passos = [
    () => `<h1>O que você já sabe fazer?</h1><p>Toque nos pontos que você já conhece. Se não conhece nenhum, é só continuar.</p>${etiquetas(PONTOS_TAGS, o.pontos, 'pontos')}`,
    () => `<h1>O que você quer bordar?</h1><p>Toque em tudo o que lhe interessa.</p>${etiquetas(INTERESSES, o.interesses, 'interesses')}`,
    () => `<h1>Do seu jeito</h1><p>Com que mão você segura a agulha?</p>${opcoes('mao', [['destra', 'Mão direita'], ['canhota', 'Mão esquerda']], o.mao)}
           <p>Que tamanho de letra fica melhor para ler?</p>${opcoes('letra', [['normal', 'Assim'], ['grande', 'Maior'], ['maior', 'Bem grande']], o.letra)}`,
    () => `<h1>Quer mostrar um bordado seu?</h1><p>Se você já bordou alguma coisa, envie uma foto. Ela fica guardada na sua galeria. Não é obrigatório.</p>
           ${o.fotoEnviada ? '<p class="aviso-bom">Foto recebida. Que lindo!</p>' : `<label class="botao secundario">Escolher uma foto<input type="file" accept="image/*" hidden data-foto="entrada"></label>`}`,
    () => {
      if (o.nivel === null) o.nivel = sugerirNivel([...o.pontos]);
      const nv = NIVEIS[o.nivel - 1];
      return `<h1>Seu ponto de partida</h1>
        <div class="cartao destaque"><p class="sobretitulo">Nível ${nv.n}</p><h2>${nv.titulo}</h2><p>${nv.resumo}</p></div>
        <p>Você pode mudar isso quando quiser.</p>
        <label class="campo">Prefiro começar em outro nível
          <select data-campo="nivel">${NIVEIS.map((x) => `<option value="${x.n}" ${x.n === o.nivel ? 'selected' : ''}>Nível ${x.n}: ${x.titulo}</option>`).join('')}</select>
        </label>`;
    },
  ];
  const ultimo = o.passo === passos.length - 1;
  return `<main class="pagina boas-vindas">
    <p class="progresso-ob" aria-label="Passo ${o.passo + 1} de ${passos.length}">${passos.map((_, i) => `<span class="${i <= o.passo ? 'feito' : ''}"></span>`).join('')}</p>
    ${passos[o.passo]()}
    <div class="rodape-ob">
      ${o.passo > 0 ? `<button class="botao secundario" data-acao="ob-voltar">Voltar</button>` : '<span></span>'}
      <button class="botao" data-acao="${ultimo ? 'ob-terminar' : 'ob-seguir'}">${ultimo ? 'Começar' : (o.passo === 3 && !o.fotoEnviada ? 'Agora não' : 'Continuar')}</button>
    </div>
  </main>`;
}

// ---------- Início ----------
function ecraInicio() {
  const n = nivelAtual();
  const nv = NIVEIS[n - 1];
  const nome = estado.perfil.nome ? `, ${esc(estado.perfil.nome)}` : '';
  let passo;
  if (!temConteudo(n)) {
    passo = `<p class="sobretitulo">Nível ${n}</p><h2>${nv.titulo}</h2><p>Este nível ainda está sendo preparado. Enquanto isso, pratique os pontos na área de Treino.</p>
      <a class="botao" href="#/treino">Ir para o Treino</a>`;
  } else {
    const proxima = LICOES[n].find((l) => !estado.licoes.has(l.id));
    passo = proxima
      ? `<p class="sobretitulo">Nível ${n} · ${nv.titulo}</p><h2>${proxima.titulo}</h2><a class="botao" href="#/licao/${proxima.id}">Continuar a lição</a>`
      : `<p class="sobretitulo">Nível ${n} · ${nv.titulo}</p><h2>${PROJETOS[n].titulo}</h2><p>Você terminou as lições. Agora é hora de bordar o projeto.</p><a class="botao" href="#/nivel/${n}">Ver o projeto</a>`;
  }
  const feitos = NIVEIS.filter((x) => statusNivel(x.n) === 'concluido').length;
  return `<h1>Olá${nome}</h1>
    <section class="cartao destaque"><p class="rotulo">Seu próximo passo</p>${passo}</section>
    <section class="cartao"><h2>Seu caminho</h2>
      <p>${feitos} de ${NIVEIS.length} níveis concluídos</p>
      <div class="barra"><span style="width:${Math.round((feitos / NIVEIS.length) * 100)}%"></span></div>
      <a class="ligacao" href="#/guia">Ver todos os níveis ${icone('seta')}</a>
    </section>
    <section class="cartao"><h2>Meus bordados</h2><div id="galeria" class="galeria"><p class="nota">As fotos dos seus trabalhos aparecem aqui.</p></div></section>`;
}

async function preencherGaleria() {
  const fotos = estado.fotos.filter((f) => f.tipo === 'entrada' || f.tipo === 'nivel').slice(0, 6);
  const caixa = document.getElementById('galeria');
  if (!caixa || fotos.length === 0) return;
  try {
    const enderecos = await Promise.all(fotos.map(enderecoFoto));
    if (document.getElementById('galeria') !== caixa) return;
    caixa.innerHTML = enderecos.map((u) => `<img src="${esc(u)}" alt="Foto de um bordado seu" loading="lazy">`).join('');
  } catch (e) { console.error(e); }
}

// ---------- Guia ----------
function ecraGuia() {
  const textos = { concluido: 'Concluído', dispensado: 'Você já sabe', aberto: 'Aberto', fechado: 'Fechado' };
  return `<h1>Guia</h1><p>Sete níveis, um de cada vez. Termine um para abrir o seguinte.</p>
    <ol class="caminho">${NIVEIS.map((x) => {
      const s = statusNivel(x.n);
      const dentro = `<span class="numero" style="--cor:${x.cor}">${s === 'concluido' ? icone('certo') : s === 'fechado' ? icone('cadeado') : x.n}</span>
        <span class="texto"><strong>${x.titulo}</strong><span>${x.resumo}</span><em class="selo ${s}">${textos[s]}</em></span>`;
      return s === 'fechado'
        ? `<li class="nivel fechado" aria-disabled="true">${dentro}</li>`
        : `<li><a class="nivel ${s}" href="#/nivel/${x.n}">${dentro}${icone('seta')}</a></li>`;
    }).join('')}</ol>`;
}

function ecraNivel(arg) {
  const n = Number(arg) || 1;
  const nv = NIVEIS[n - 1];
  if (!nv || statusNivel(n) === 'fechado') return `<h1>Nível fechado</h1><p>Termine o nível anterior para abrir este.</p><a class="botao" href="#/guia">Voltar ao guia</a>`;
  const voltar = `<a class="ligacao voltar" href="#/guia">${icone('voltar')} Guia</a>`;
  if (!temConteudo(n)) {
    return `${voltar}<p class="sobretitulo">Nível ${n}</p><h1>${nv.titulo}</h1><p>${nv.resumo}</p>
      <div class="cartao"><p>Este nível ainda está sendo preparado. Nesta versão de teste, só o nível 1 está completo.</p>
      <a class="botao" href="#/treino">Praticar pontos no Treino</a></div>`;
  }
  const projeto = PROJETOS[n];
  const concluido = statusNivel(n) === 'concluido';
  return `${voltar}<p class="sobretitulo">Nível ${n}</p><h1>${nv.titulo}</h1><p>${nv.resumo}</p>
    <h2>Lições</h2>
    <ol class="lista-licoes">${LICOES[n].map((l) => `<li><a href="#/licao/${l.id}" class="${estado.licoes.has(l.id) ? 'feita' : ''}">
      <span class="marca-licao">${estado.licoes.has(l.id) ? icone('certo') : ''}</span><span>${l.titulo}</span>${icone('seta')}</a></li>`).join('')}</ol>
    <h2>Projeto do nível</h2>
    <div class="cartao"><h3>${projeto.titulo}</h3><p>${projeto.texto}</p>
      <ol class="passos">${projeto.passos.map((p) => `<li>${p}</li>`).join('')}</ol>
      <a class="botao secundario" href="#/mesa/${projeto.risco}">Abrir a mesa de luz</a>
    </div>
    ${concluido ? '<p class="aviso-bom">Você já concluiu este nível.</p>' : `
    <div class="cartao destaque"><h3>Terminou o bordado?</h3><p>Envie uma foto do seu trabalho para concluir o nível e abrir o próximo.</p>
      <label class="botao">Enviar a foto do meu trabalho<input type="file" accept="image/*" hidden data-foto="nivel" data-nivel="${n}"></label>
      <button class="botao texto" data-acao="sem-foto" data-nivel="${n}">Não consigo enviar a foto</button>
    </div>
    <button class="botao texto" data-acao="ja-sei" data-nivel="${n}">Já sei tudo isto, quero pular este nível</button>`}`;
}

function ecraLicao(arg) {
  const n = Number(arg.split('-')[0]);
  const lista = LICOES[n] || [];
  const i = lista.findIndex((l) => l.id === arg);
  const l = lista[i];
  if (!l) return `<h1>Lição não encontrada</h1><a class="botao" href="#/guia">Voltar ao guia</a>`;
  return `<a class="ligacao voltar" href="#/nivel/${n}">${icone('voltar')} Nível ${n}</a>
    <p class="sobretitulo">Lição ${i + 1} de ${lista.length}</p><h1>${l.titulo}</h1>
    ${blocoVideo(l.video, l.titulo, false)}
    ${l.figura ? `<div class="figura">${FIGURAS[l.figura]}</div>` : ''}
    <ol class="passos">${l.passos.map((p) => `<li>${p}</li>`).join('')}</ol>
    ${l.ponto ? `<a class="botao secundario" href="#/ponto/${l.ponto}">Abrir o treino do ponto</a>` : ''}
    <div class="dica"><strong>Dica</strong><p>${l.dica}</p></div>
    <button class="botao" data-acao="licao-feita" data-id="${l.id}">${estado.licoes.has(l.id) ? 'Continuar' : 'Concluí esta lição'}</button>`;
}

function ecraFesta(arg) {
  const n = Number(arg) || 1;
  const seguinte = NIVEIS[n];
  const cores = ['#B84A24', '#265335', '#163870', '#D99B26'];
  return `<main class="festa">
    <div class="confete" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 41) % 100}%;background:${cores[i % 4]};animation-delay:${(i % 8) * 0.12}s"></i>`).join('')}</div>
    <h1>Parabéns!</h1><p class="lema">Você concluiu o nível ${n}.</p>
    ${seguinte ? `<div class="cartao destaque"><p class="rotulo">Novo nível aberto</p><p class="sobretitulo">Nível ${seguinte.n}</p><h2>${seguinte.titulo}</h2><p>${seguinte.resumo}</p></div>` : ''}
    <a class="botao grande" href="#/guia">Ver o meu caminho</a>
  </main>`;
}

// ---------- Treino ----------
function ecraTreino() {
  const canhota = estado.perfil.mao === 'canhota';
  return `<h1>Treino</h1><p>Escolha um ponto e siga um passo de cada vez. Pode repetir quantas vezes quiser.</p>
    <ul class="grelha-pontos">${PONTOS.map((p) => `<li><a class="cartao-ponto" href="#/ponto/${p.id}">
      ${desenharPonto(p, p.passos.length - 1, { canhota })}<strong>${p.nome}</strong><span>${p.para}</span></a></li>`).join('')}</ul>`;
}

function ecraPonto(arg) {
  const p = PONTOS.find((x) => x.id === arg);
  if (!p) return `<h1>Ponto não encontrado</h1><a class="botao" href="#/treino">Voltar ao Treino</a>`;
  if (ui.passo === undefined) { ui.passo = 0; ui.canhota = estado.perfil.mao === 'canhota'; }
  const total = p.passos.length;
  const s = p.passos[ui.passo];
  const texto = s.t.replaceAll('{lado}', ui.canhota ? 'de cima' : 'de baixo');
  return `<a class="ligacao voltar" href="#/treino">${icone('voltar')} Treino</a>
    <h1>${p.nome}</h1><p class="nota">${p.outros} Use ${p.fios}.</p>
    ${blocoVideo(p.video, p.nome, true)}
    <h2>Passo a passo</h2>
    <div class="diagrama">${desenharPonto(p, ui.passo, { canhota: ui.canhota })}</div>
    <p class="legenda"><span class="frente"></span> pela frente do tecido <span class="avesso"></span> pelo avesso</p>
    <div class="cartao passo-atual" aria-live="polite">
      <p class="sobretitulo">Passo ${ui.passo + 1} de ${total} · a agulha ${s.a === 'sobe' ? 'sobe' : 'desce'}</p>
      <p class="texto-passo">${texto}</p>
    </div>
    <div class="par-botoes">
      <button class="botao secundario" data-acao="passo-menos" ${ui.passo === 0 ? 'disabled' : ''}>Passo anterior</button>
      ${ui.passo < total - 1 ? `<button class="botao" data-acao="passo-mais">Próximo passo</button>` : `<button class="botao" data-acao="passo-zero">Ver de novo</button>`}
    </div>
    <button class="botao texto" data-acao="trocar-mao">${ui.canhota ? 'Ver para a mão direita' : 'Ver para a mão esquerda'}</button>
    <div class="dica"><strong>Dica</strong><p>${p.dica}</p></div>
    <div class="cartao"><h2>Se algo der errado</h2><ul class="passos">${p.erros.map((e) => `<li>${e}</li>`).join('')}</ul></div>`;
}

// ---------- Meu projeto e mesa de luz ----------
function ecraProjeto() {
  const enviados = (tipo) => estado.fotos.filter((f) => f.tipo === tipo).length;
  return `<h1>Meu projeto</h1>
    <p>Aqui você vai fotografar o seu desenho e a sua caixa de linhas, e o aplicativo monta o passo a passo para você bordar.</p>
    <div class="cartao"><p><strong>Esta parte ainda está sendo preparada.</strong> Se quiser ajudar no teste, envie a foto de um desenho que você gostaria de bordar e a foto da sua caixa de linhas.</p>
      <label class="botao secundario">Enviar a foto do desenho<input type="file" accept="image/*" hidden data-foto="risco"></label>
      <p class="nota">${enviados('risco')} foto(s) de desenho enviada(s).</p>
      <label class="botao secundario">Enviar a foto da caixa de linhas<input type="file" accept="image/*" hidden data-foto="caixa"></label>
      <p class="nota">${enviados('caixa')} foto(s) da caixa enviada(s).</p>
    </div>
    <div class="cartao destaque"><h2>Mesa de luz</h2><p>Use a tela do celular para passar um risco pequeno para o tecido, sem impressora.</p>
      <a class="botao" href="#/mesa">Abrir a mesa de luz</a></div>`;
}

function pxPorMm() {
  let v = null;
  try { v = Number(localStorage.getItem('bordado_px_mm')); } catch { /* segue com o valor padrão */ }
  return v || (matchMedia('(pointer: coarse)').matches ? 6.2 : 3.78);
}
const svgRisco = (r, escala) => `<svg viewBox="0 0 ${r.larguraMm} ${r.alturaMm}" width="${r.larguraMm * escala}" height="${r.alturaMm * escala}" aria-label="Risco: ${r.nome}">
  ${r.caminhos.map((d) => `<path d="${d}" fill="none" stroke="#000" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;

function ecraMesa(arg) {
  if (!ui.risco) { ui.risco = RISCOS[arg] ? arg : 'coracao'; ui.escala = pxPorMm(); }
  const r = RISCOS[ui.risco];
  return `<a class="ligacao voltar" href="#/projeto">${icone('voltar')} Meu projeto</a><h1>Mesa de luz</h1>
    <h2>1. Escolha o risco</h2>
    <div class="opcoes">${Object.entries(RISCOS).map(([id, x]) => `<button class="opcao" data-acao="risco" data-id="${id}" aria-pressed="${ui.risco === id}">${x.nome}</button>`).join('')}</div>
    <div class="previa">${svgRisco(r, 2.2)}</div><p class="nota">Tamanho real: ${r.larguraMm / 10} cm de largura.</p>
    <h2>2. Acerte o tamanho</h2>
    <p>Encoste o lado mais curto de um cartão de banco na barra abaixo. Mexa no controle até a barra ficar do tamanho do cartão.</p>
    <div class="regua" style="width:${54 * ui.escala}px"></div>
    <input type="range" class="controle" min="2.5" max="9" step="0.05" value="${ui.escala}" data-campo="escala" aria-label="Ajustar o tamanho">
    <h2>3. Acenda a mesa</h2>
    <ol class="passos"><li>Coloque o brilho da tela no máximo.</li><li>Ponha o tecido por cima da tela e prenda com fita crepe.</li><li>Contorne o desenho com lápis, bem de leve.</li></ol>
    <button class="botao grande" data-acao="acender">Acender a mesa de luz</button>`;
}

let trava = null;
async function acenderMesa() {
  const r = RISCOS[ui.risco];
  const camada = document.createElement('div');
  camada.className = 'mesa-luz';
  camada.innerHTML = `${svgRisco(r, ui.escala)}<button class="sair-mesa"><span></span>Segure aqui 3 segundos para sair</button>`;
  document.body.appendChild(camada);
  evento('mesa_luz', { risco: ui.risco, escala: ui.escala });
  try { trava = await navigator.wakeLock?.request('screen'); } catch { trava = null; }
  const botao = camada.querySelector('.sair-mesa');
  let relogio = null;
  const soltar = () => { clearTimeout(relogio); botao.classList.remove('a-segurar'); };
  botao.addEventListener('pointerdown', () => {
    botao.classList.add('a-segurar');
    relogio = setTimeout(() => { trava?.release?.(); trava = null; camada.remove(); }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => botao.addEventListener(e, soltar));
  camada.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ---------- Conta ----------
function ecraConta() {
  const p = estado.perfil;
  const opcoes = (grupo, lista, atual) => `<div class="opcoes">${lista.map(([id, nome]) =>
    `<button class="opcao" data-acao="pref" data-grupo="${grupo}" data-id="${id}" aria-pressed="${atual === id}">${nome}</button>`).join('')}</div>`;
  return `<h1>Minha conta</h1>
    <label class="campo">Como quer ser chamada?<input type="text" value="${esc(p.nome)}" maxlength="40" data-campo="nome" autocomplete="given-name"></label>
    <h2>Tamanho da letra</h2>${opcoes('tamanho_letra', [['normal', 'Normal'], ['grande', 'Maior'], ['maior', 'Bem grande']], p.tamanho_letra)}
    <h2>Mão da agulha</h2>${opcoes('mao', [['destra', 'Direita'], ['canhota', 'Esquerda']], p.mao)}
    <h2>Meu nível</h2><p>Você começou no nível ${p.nivel_inicial}.</p>
    <a class="botao secundario" href="#/boas-vindas">Refazer o questionário</a>
    <button class="botao texto" data-acao="reiniciar">Recomeçar o guia do zero</button>
    <hr><button class="botao secundario" data-acao="sair">Sair</button>
    ${estado.convidado ? '<p class="nota">Modo convidado: nada é guardado na base de dados.</p>' : ''}`;
}

// ---------- Avisos e opinião ----------
function avisar(texto) {
  const a = document.createElement('div');
  a.className = 'aviso-flutuante'; a.setAttribute('role', 'status'); a.textContent = texto;
  document.body.appendChild(a);
  setTimeout(() => a.remove(), 4000);
}
async function tentar(fn) {
  try { await fn(); } catch (e) { console.error(e); avisar('Não deu certo. Verifique a internet e tente de novo.'); }
}
function abrirOpiniao() {
  const d = document.getElementById('opiniao');
  d.querySelector('textarea').value = '';
  d.showModal();
}

// ---------- Ações ----------
const ACOES = {
  'entrar-google': () => tentar(entrarGoogle),
  'abrir-opiniao': abrirOpiniao,
  etiqueta: (b) => {
    const grupo = ui.ob[b.dataset.grupo];
    grupo.has(b.dataset.id) ? grupo.delete(b.dataset.id) : grupo.add(b.dataset.id);
    ui.ob.nivel = null; desenhar();
  },
  opcao: (b) => { ui.ob[b.dataset.grupo] = b.dataset.id; desenhar(); },
  'ob-seguir': () => { ui.ob.passo++; desenhar(); window.scrollTo(0, 0); },
  'ob-voltar': () => { ui.ob.passo--; desenhar(); window.scrollTo(0, 0); },
  'ob-terminar': () => tentar(async () => {
    const o = ui.ob;
    await guardarPerfil({ onboarding_feito: true, pontos_conhecidos: [...o.pontos], interesses: [...o.interesses], mao: o.mao, tamanho_letra: o.letra, nivel_inicial: o.nivel });
    evento('questionario_fim', { pontos: [...o.pontos], interesses: [...o.interesses], nivel: o.nivel, foto: o.fotoEnviada });
    location.hash = '#/inicio'; desenhar();
  }),
  'licao-feita': (b) => tentar(async () => {
    await marcarLicao(b.dataset.id);
    const n = Number(b.dataset.id.split('-')[0]);
    const proxima = LICOES[n].find((l) => !estado.licoes.has(l.id));
    ir(proxima ? `licao/${proxima.id}` : `nivel/${n}`);
  }),
  'sem-foto': (b) => {
    if (confirm('Tudo bem. Você pode enviar a foto depois, quando conseguir. Quer concluir o nível agora?')) terminarNivel(Number(b.dataset.nivel), 'sem_foto');
  },
  'ja-sei': (b) => { if (confirm('Pular este nível e abrir o próximo?')) terminarNivel(Number(b.dataset.nivel), 'ja_sei'); },
  'passo-mais': () => { ui.passo++; desenhar(); },
  'passo-menos': () => { ui.passo--; desenhar(); },
  'passo-zero': () => { ui.passo = 0; desenhar(); },
  'trocar-mao': () => { ui.canhota = !ui.canhota; desenhar(); },
  risco: (b) => { ui.risco = b.dataset.id; desenhar(); },
  acender: acenderMesa,
  pref: (b) => tentar(async () => { await guardarPerfil({ [b.dataset.grupo]: b.dataset.id }); desenhar(); }),
  reiniciar: () => { if (confirm('Isso apaga todo o seu progresso no guia. Quer mesmo recomeçar?')) tentar(async () => { await reiniciarProgresso(); avisar('Guia recomeçado.'); desenhar(); }); },
  sair: () => tentar(async () => { await sair(); location.hash = ''; desenhar(); }),
};

function terminarNivel(n, forma) {
  tentar(async () => { await concluirNivel(n, forma); evento('nivel_concluido', { nivel: n, forma }); ir(`festa/${n}`); });
}

raiz.addEventListener('click', (e) => {
  const b = e.target.closest('[data-acao]');
  if (b && ACOES[b.dataset.acao]) ACOES[b.dataset.acao](b);
});

raiz.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.foto && el.files[0]) {
    const tipo = el.dataset.foto;
    avisar('Enviando a foto…');
    tentar(async () => {
      await enviarFoto(el.files[0], tipo, el.dataset.nivel ? Number(el.dataset.nivel) : null);
      evento('foto_enviada', { tipo });
      if (tipo === 'nivel') { terminarNivel(Number(el.dataset.nivel), 'foto'); return; }
      if (tipo === 'entrada' && ui.ob) ui.ob.fotoEnviada = true;
      avisar('Foto recebida. Obrigada!'); desenhar();
    });
  } else if (el.dataset.campo === 'nivel') {
    ui.ob.nivel = Number(el.value); desenhar();
  } else if (el.dataset.campo === 'nome') {
    tentar(() => guardarPerfil({ nome: el.value.trim() }));
  }
});

raiz.addEventListener('input', (e) => {
  if (e.target.dataset.campo !== 'escala') return;
  ui.escala = Number(e.target.value);
  try { localStorage.setItem('bordado_px_mm', String(ui.escala)); } catch { /* sem armazenamento local */ }
  raiz.querySelector('.regua').style.width = `${54 * ui.escala}px`;
});

document.getElementById('opiniao').addEventListener('submit', (e) => {
  const texto = e.target.querySelector('textarea').value.trim();
  if (e.submitter?.value !== 'enviar' || !texto) return;
  tentar(async () => { await enviarOpiniao(ultimaRota, texto); avisar('Obrigada pela sua opinião!'); });
});

window.addEventListener('hashchange', desenhar);

iniciar(desenhar).then(desenhar).catch((e) => {
  console.error(e);
  raiz.innerHTML = '<main class="entrar"><h1>Bordado Livre</h1><p>Não foi possível abrir o aplicativo. Verifique a internet e tente de novo.</p><button class="botao" onclick="location.reload()">Tentar de novo</button></main>';
});
