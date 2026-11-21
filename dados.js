// Conteúdo do protótipo (português do Brasil). Tudo o que é texto de aula vive aqui.

// Cada ponto leva um desenho pequeno, porque os nomes mudam de região para região.
export const PONTOS_TAGS = [
  { id: 'alinhavo', nome: 'Alinhavo', desenho: '<path d="M4 12h8M18 12h8M32 12h8"/>' },
  { id: 'atras', nome: 'Ponto atrás', desenho: '<path d="M4 12h40"/><path d="M14 8v8M24 8v8M34 8v8" stroke-width="1.2"/>' },
  { id: 'haste', nome: 'Ponto haste', desenho: '<path d="M4 16l13-7M13 16l13-7M22 16l13-7M31 16l13-7"/>' },
  { id: 'corrente', nome: 'Ponto corrente', desenho: '<ellipse cx="10" cy="12" rx="7" ry="4.5"/><ellipse cx="24" cy="12" rx="7" ry="4.5"/><ellipse cx="38" cy="12" rx="7" ry="4.5"/>' },
  { id: 'cheio', nome: 'Ponto cheio', desenho: '<path d="M9 5v14M14 3v18M19 3v18M24 3v18M29 3v18M34 3v18M39 5v14"/>' },
  { id: 'folha', nome: 'Ponto folha', desenho: '<path d="M4 12C14 2 34 2 44 12C34 22 14 22 4 12Z"/><path d="M4 12h40M15 12l5-6M25 12l5-6M15 12l5 6M25 12l5 6" stroke-width="1.2"/>' },
  { id: 'margarida', nome: 'Ponto margarida', desenho: '<path d="M24 21C14 15 17 5 24 4C31 5 34 15 24 21Z"/><path d="M24 4V1"/>' },
  { id: 'nofrances', nome: 'Nó francês', desenho: '<circle cx="10" cy="12" r="3.5" fill="currentColor"/><circle cx="24" cy="12" r="3.5" fill="currentColor"/><circle cx="38" cy="12" r="3.5" fill="currentColor"/>' },
];

export const INTERESSES = [
  { id: 'flores', nome: 'Flores' },
  { id: 'letras', nome: 'Letras e nomes' },
  { id: 'bichos', nome: 'Bichinhos' },
  { id: 'folhagens', nome: 'Folhagens' },
  { id: 'roupas', nome: 'Roupas' },
  { id: 'bebe', nome: 'Enxoval de bebê' },
  { id: 'presentes', nome: 'Presentes' },
  { id: 'quadros', nome: 'Bastidores para a parede' },
];

// Sugere o nível de partida a partir dos pontos que a pessoa marcou.
export function sugerirNivel(conhecidos) {
  const tem = (id) => conhecidos.includes(id);
  const linhas = ['alinhavo', 'atras', 'haste', 'corrente'].filter(tem).length;
  const cheios = ['cheio', 'folha'].filter(tem).length;
  const texturas = ['margarida', 'nofrances'].filter(tem).length;
  if (conhecidos.length === 0) return 1;
  if (linhas >= 3 && cheios === 2 && texturas >= 1) return 6;
  if (linhas >= 3 && cheios >= 1) return 5;
  if (linhas >= 3) return 4;
  if (linhas === 2) return 3;
  return 2;
}

export const NIVEIS = [
  { n: 1, titulo: 'Primeiros passos', resumo: 'Materiais, bastidor, linha e o seu primeiro ponto.', cor: '#265335' },
  { n: 2, titulo: 'Risco e arremates', resumo: 'Passar o desenho para o tecido e começar sem nó.', cor: '#163870' },
  { n: 3, titulo: 'Linhas e letras', resumo: 'Ponto atrás, haste e corrente para escrever nomes.', cor: '#B84A24' },
  { n: 4, titulo: 'Folhas e preenchimentos', resumo: 'Ponto cheio e ponto folha, sem falhas.', cor: '#265335' },
  { n: 5, titulo: 'Texturas e nós', resumo: 'Nó francês, margarida e rosinhas em relevo.', cor: '#D99B26' },
  { n: 6, titulo: 'Cores e sombreado', resumo: 'Escolher tons e fazer degradê com a agulha.', cor: '#163870' },
  { n: 7, titulo: 'Acabamentos', resumo: 'Fechar o bastidor e deixar a peça pronta para presentear.', cor: '#B84A24' },
];

export const LICOES = {
  1: [
    {
      id: '1-1', titulo: 'O que você vai precisar', figura: 'materiais',
      passos: [
        'Tecido de algodão cru. Evite malha e tecido que estica.',
        'Meada de linha para bordar, daquelas com 6 fios juntos.',
        'Agulha de bordar número 7 ou 9, com ponta fina. A agulha de ponto cruz não serve: ela não tem ponta.',
        'Bastidor de madeira de 16 cm, com parafuso.',
        'Uma tesourinha e um lápis.',
      ],
      dica: 'Não precisa comprar muita coisa para começar. Duas ou três cores de linha já bastam.',
    },
    {
      id: '1-2', titulo: 'Prender o tecido no bastidor', figura: 'bastidor',
      passos: [
        'Solte o parafuso e separe os dois aros.',
        'Coloque o tecido por cima do aro menor.',
        'Encaixe o aro maior por cima, prendendo o tecido no meio.',
        'Aperte o parafuso aos poucos e vá puxando as bordas do tecido.',
        'Bata de leve com o dedo: o tecido deve soar como um tamborzinho.',
      ],
      dica: 'Tecido frouxo deixa o bordado repuxado. Se afrouxar no meio do trabalho, puxe as bordas de novo.',
    },
    {
      id: '1-3', titulo: 'Preparar a linha', figura: 'linha',
      passos: [
        'Corte um pedaço do tamanho do seu antebraço, mais ou menos 40 cm.',
        'Abra a ponta e puxe um fio de cada vez, devagar. Assim a linha não embola.',
        'Junte 3 fios lado a lado.',
        'Passe os 3 fios pelo buraco da agulha.',
        'Dê um nozinho na ponta mais comprida.',
      ],
      dica: 'Não molhe a ponta da linha na boca: a umidade enferruja o buraco da agulha. Linha comprida demais dá nó no avesso.',
    },
    {
      id: '1-4', titulo: 'Seu primeiro ponto', figura: null, ponto: 'atras',
      passos: [
        'Risque uma linha reta de lápis no tecido, do tamanho de um dedo.',
        'Abra o treino do ponto atrás no botão abaixo e siga um passo de cada vez.',
        'Faça a linha inteira. Depois faça outra, com pontos mais curtinhos.',
        'Não tenha pressa. Ponto bonito é ponto feito devagar.',
      ],
      dica: 'Os primeiros pontos saem tortos para todo mundo. Na terceira linha já fica bem melhor.',
    },
  ],
};

export const PROJETOS = {
  1: {
    titulo: 'Coraçãozinho em ponto atrás',
    risco: 'coracao',
    texto: 'Um coração de 5 cm, todo em ponto atrás. Dá para terminar em uma tarde.',
    passos: [
      'Passe o risco para o tecido com a mesa de luz do aplicativo.',
      'Prenda o tecido no bastidor, com o coração no meio.',
      'Use 3 fios da cor que você mais gosta.',
      'Borde todo o contorno em ponto atrás. Nas curvas, faça pontos mais curtos.',
      'Arremate no avesso, passando a agulha por baixo de 3 ou 4 pontos.',
    ],
  },
};

// Riscos para a mesa de luz. Medidas em milímetros.
export const RISCOS = {
  coracao: {
    nome: 'Coração', larguraMm: 50, alturaMm: 45,
    caminhos: ['M25 42 C5 28 0 15 8 7 C15 0 23 4 25 12 C27 4 35 0 42 7 C50 15 45 28 25 42 Z'],
  },
  raminho: {
    nome: 'Raminho', larguraMm: 40, alturaMm: 56,
    caminhos: [
      'M20 55 C20 40 20 20 20 3',
      'M20 46 C13 45 8 40 7 34 C13 35 19 40 20 46', 'M20 46 C27 45 32 40 33 34 C27 35 21 40 20 46',
      'M20 32 C13 31 8 26 7 20 C13 21 19 26 20 32', 'M20 32 C27 31 32 26 33 20 C27 21 21 26 20 32',
      'M20 18 C14 17 10 13 9 8 C14 9 19 13 20 18', 'M20 18 C26 17 30 13 31 8 C26 9 21 13 20 18',
    ],
  },
  flor: {
    nome: 'Florzinha', larguraMm: 46, alturaMm: 46,
    caminhos: [
      'M23 23 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0',
      'M23 19 C17 12 19 3 23 2 C27 3 29 12 23 19',
      'M27 21 C35 17 43 20 43 24 C42 28 33 28 27 24',
      'M25 27 C31 33 31 42 27 43 C23 43 20 34 22 27',
      'M21 27 C15 33 6 33 4 29 C4 25 12 21 19 23',
      'M19 21 C11 19 6 12 9 8 C12 6 19 11 21 18',
    ],
  },
};

// Pontos da área de Treino. Coordenadas num quadro de 320 x 170.
// video: endereço do vídeo no YouTube (ou só o código). Vazio mostra "em preparação". As lições aceitam o mesmo campo.
// Cada passo: a = 'sobe' (agulha vem do avesso) ou 'desce' (agulha vai para o avesso).
// {lado} troca-se por "de baixo" (destras) ou "de cima" (canhotas).
export const PONTOS = [
  {
    id: 'alinhavo', video: '', nome: 'Alinhavo', outros: 'Também chamado de ponto corrido.',
    para: 'Contornos leves e linhas pontilhadas.', fios: '2 ou 3 fios',
    passos: [
      { a: 'sobe', p: [50, 85], t: 'Suba com a agulha no começo do risco.' },
      { a: 'desce', p: [90, 85], t: 'Desça um pouquinho à frente. Pronto, este é o primeiro ponto.' },
      { a: 'sobe', p: [130, 85], t: 'Por baixo do tecido, pule um espaço do mesmo tamanho e suba de novo.' },
      { a: 'desce', p: [170, 85], t: 'Desça à frente. O ponto e o espaço ficam do mesmo tamanho.' },
      { a: 'sobe', p: [210, 85], t: 'Suba de novo, depois de mais um espaço.' },
      { a: 'desce', p: [250, 85], t: 'Desça. Continue assim até o fim do risco.' },
    ],
    dica: 'Tente deixar todos os pontos do mesmo tamanho. Uns 3 ou 4 milímetros é uma boa medida.',
    erros: ['Tecido franzindo: você puxou a linha com força demais. Puxe só até ela encostar no tecido.'],
  },
  {
    id: 'atras', video: '', nome: 'Ponto atrás', outros: 'Em inglês: backstitch.',
    para: 'Contornos firmes, letras e nomes.', fios: '2 ou 3 fios',
    passos: [
      { a: 'sobe', p: [100, 85], t: 'Suba um pontinho à frente do começo do risco.' },
      { a: 'desce', p: [60, 85], t: 'Volte para trás e desça bem no começo do risco.' },
      { a: 'sobe', p: [140, 85], t: 'Por baixo do tecido, suba um pontinho à frente do primeiro furo.' },
      { a: 'desce', p: [100, 85], t: 'Volte e desça no mesmo furo do ponto anterior. Os pontos ficam encostados.' },
      { a: 'sobe', p: [180, 85], t: 'De novo: suba um pontinho à frente.' },
      { a: 'desce', p: [140, 85], t: 'Volte e desça no furo do ponto anterior.' },
      { a: 'sobe', p: [220, 85], t: 'Suba à frente mais uma vez.' },
      { a: 'desce', p: [180, 85], t: 'Volte e feche o ponto. Continue assim até o fim.' },
    ],
    dica: 'Nas curvas, faça pontos bem curtinhos, de 2 a 3 milímetros. A curva fica redondinha, sem quinas.',
    erros: [
      'Espacinhos entre os pontos: desça sempre no mesmo furo onde o ponto anterior terminou.',
      'Linha desfiando: o pedaço de linha está comprido demais. Corte do tamanho do antebraço.',
    ],
  },
  {
    id: 'haste', video: '', nome: 'Ponto haste', outros: 'Em Portugal: ponto pé de flor.',
    para: 'Caules, galhos e letras com curvas.', fios: '2 ou 3 fios',
    passos: [
      { a: 'sobe', p: [50, 85], t: 'Suba no começo do risco.' },
      { a: 'desce', p: [130, 85], t: 'Desça um ponto à frente. Não puxe tudo: deixe a linha frouxa do lado {lado}.' },
      { a: 'sobe', p: [90, 85], t: 'Suba no meio do caminho, com a linha frouxa sempre do lado {lado}. Agora puxe.' },
      { a: 'desce', p: [170, 85], t: 'Desça um ponto à frente, deixando a linha frouxa do lado {lado}.' },
      { a: 'sobe', p: [130, 85], t: 'Suba no furo onde o ponto anterior terminou. Puxe.' },
      { a: 'desce', p: [210, 85], t: 'Desça um ponto à frente.' },
      { a: 'sobe', p: [170, 85], t: 'Suba no furo onde o ponto anterior terminou. Vai formando um cordãozinho.' },
      { a: 'desce', p: [250, 85], t: 'Desça à frente. Continue assim até o fim do risco.' },
    ],
    dica: 'O segredo é a linha ficar sempre do mesmo lado da agulha. Se trocar de lado, o cordão se desmancha.',
    erros: ['Cordão serrilhado na curva: encurte os pontos e deixe a linha frouxa do lado de fora da curva.'],
  },
  {
    id: 'margarida', video: '', nome: 'Ponto margarida', outros: 'É um elo de ponto corrente, sozinho.',
    para: 'Pétalas e folhinhas pequenas.', fios: '3 ou 4 fios',
    passos: [
      { a: 'sobe', p: [160, 130], t: 'Suba na base da pétala.' },
      { a: 'desce', p: [160, 130], t: 'Desça no mesmo furo, mas não puxe tudo: deixe uma argola de linha por cima do tecido.',
        desenho: 'M160 130 C118 112 128 50 160 46 C192 50 202 112 160 130' },
      { a: 'sobe', p: [160, 52], t: 'Suba na ponta da pétala, por dentro da argola. Puxe devagar até a argola assentar.' },
      { a: 'desce', p: [160, 38], t: 'Desça logo depois da argola, com um pontinho pequeno que prende a pétala.' },
    ],
    dica: 'Não aperte demais: a pétala fica fininha. Deixe a argola fofa.',
    erros: ['Pétala torta: o pontinho que prende ficou fora do centro. Desça bem na ponta da argola.'],
  },
];
