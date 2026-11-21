// Desenha o diagrama de um ponto até um certo passo.
// Linha cheia = linha pela frente do tecido. Tracejado = linha pelo avesso.

const LARGURA = 320;
const ALTURA = 170;

function espelhar(p, canhota) {
  return canhota ? [LARGURA - p[0], p[1]] : p;
}

// Espelha os X de um caminho SVG simples (só comandos M e C com coordenadas absolutas).
function espelharCaminho(d, canhota) {
  if (!canhota) return d;
  let ehX = true;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => {
    const v = ehX ? LARGURA - Number(n) : Number(n);
    ehX = !ehX;
    return String(v);
  });
}

export function desenharPonto(ponto, ateQue, { canhota = false, cor = '#163870' } = {}) {
  const passos = ponto.passos;
  const numeros = new Map(); // "x,y" -> número do furo
  passos.forEach((s) => {
    const chave = s.p.join(',');
    if (!numeros.has(chave)) numeros.set(chave, numeros.size + 1);
  });

  let linhas = '';
  for (let i = 1; i <= ateQue; i++) {
    const anterior = passos[i - 1];
    const atual = passos[i];
    const pelaFrente = anterior.a === 'sobe';
    const novo = i === ateQue;
    if (atual.desenho) {
      linhas += `<path d="${espelharCaminho(atual.desenho, canhota)}" fill="none" stroke="${cor}" stroke-width="5" stroke-linecap="round" class="${novo ? 'fio-novo' : ''}"/>`;
      continue;
    }
    const [x1, y1] = espelhar(anterior.p, canhota);
    const [x2, y2] = espelhar(atual.p, canhota);
    if (x1 === x2 && y1 === y2) continue;
    linhas += pelaFrente
      ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${cor}" stroke-width="5" stroke-linecap="round" class="${novo ? 'fio-novo' : ''}"/>`
      : `<line x1="${x1}" y1="${y1 + 16}" x2="${x2}" y2="${y2 + 16}" stroke="#8C8A82" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>`;
  }

  let furos = '';
  const vistos = new Set();
  passos.forEach((s, i) => {
    const chave = s.p.join(',');
    if (vistos.has(chave)) return;
    vistos.add(chave);
    const [x, y] = espelhar(s.p, canhota);
    const feito = i <= ateQue;
    furos += `<circle cx="${x}" cy="${y}" r="3.5" fill="${feito ? '#1E221F' : '#B9B4A8'}"/>`
      + `<text x="${x}" y="${y - 14}" text-anchor="middle" font-size="15" font-weight="700" fill="${feito ? '#1E221F' : '#8C8A82'}">${numeros.get(chave)}</text>`;
  });

  const [ax, ay] = espelhar(passos[ateQue].p, canhota);
  const sobe = passos[ateQue].a === 'sobe';
  const agulha = `<g class="agulha">
    <circle cx="${ax}" cy="${ay}" r="13" fill="none" stroke="#B84A24" stroke-width="3"/>
    <path d="${sobe ? `M${ax} ${ay + 40} V${ay + 20} m-7 8 l7 -9 l7 9` : `M${ax} ${ay + 20} V${ay + 40} m-7 -8 l7 9 l7 -9`}" fill="none" stroke="#B84A24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

  return `<svg viewBox="0 0 ${LARGURA} ${ALTURA}" role="img" aria-label="Diagrama do ${ponto.nome}, passo ${ateQue + 1}">
    <rect width="${LARGURA}" height="${ALTURA}" rx="14" fill="#F7F3EA"/>
    ${linhas}${furos}${agulha}
  </svg>`;
}

// Ilustrações simples das lições do nível 1.
export const FIGURAS = {
  materiais: `<svg viewBox="0 0 320 150" role="img" aria-label="Bastidor, linhas, agulha e tesoura">
    <rect width="320" height="150" rx="14" fill="#F7F3EA"/>
    <circle cx="80" cy="78" r="50" fill="#FBF9F3" stroke="#C5A06E" stroke-width="8"/><rect x="72" y="14" width="16" height="12" rx="3" fill="#9A8968"/>
    <rect x="160" y="40" width="20" height="70" rx="6" fill="#B84A24"/><rect x="188" y="40" width="20" height="70" rx="6" fill="#265335"/><rect x="216" y="40" width="20" height="70" rx="6" fill="#163870"/>
    <line x1="262" y1="30" x2="262" y2="118" stroke="#5A5E5B" stroke-width="3" stroke-linecap="round"/><ellipse cx="262" cy="38" rx="2" ry="5" fill="#F7F3EA" stroke="#5A5E5B"/>
    <path d="M285 40 L300 110 M300 40 L285 110" stroke="#5A5E5B" stroke-width="3" stroke-linecap="round"/><circle cx="283" cy="120" r="8" fill="none" stroke="#5A5E5B" stroke-width="3"/><circle cx="302" cy="120" r="8" fill="none" stroke="#5A5E5B" stroke-width="3"/>
  </svg>`,
  bastidor: `<svg viewBox="0 0 320 150" role="img" aria-label="Tecido esticado no bastidor">
    <rect width="320" height="150" rx="14" fill="#F7F3EA"/>
    <rect x="70" y="10" width="180" height="130" rx="6" fill="#FBF9F3" stroke="#E2DDD3" stroke-width="2"/>
    <circle cx="160" cy="78" r="56" fill="#FFFFFF" stroke="#C5A06E" stroke-width="9"/><rect x="151" y="8" width="18" height="13" rx="3" fill="#9A8968"/>
    <path d="M160 34 v-10 M160 122 v10 M116 78 h-10 M204 78 h10" stroke="#B84A24" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  linha: `<svg viewBox="0 0 320 150" role="img" aria-label="Seis fios de linha, três deles separados">
    <rect width="320" height="150" rx="14" fill="#F7F3EA"/>
    <g stroke-width="5" stroke-linecap="round">
      <line x1="30" y1="40" x2="290" y2="40" stroke="#163870"/><line x1="30" y1="54" x2="290" y2="54" stroke="#163870"/><line x1="30" y1="68" x2="290" y2="68" stroke="#163870"/>
      <line x1="30" y1="92" x2="290" y2="92" stroke="#C9C5BA"/><line x1="30" y1="106" x2="290" y2="106" stroke="#C9C5BA"/><line x1="30" y1="120" x2="290" y2="120" stroke="#C9C5BA"/>
    </g>
    <text x="160" y="24" text-anchor="middle" font-size="14" fill="#1E221F">3 fios para bordar</text>
  </svg>`,
};
