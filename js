// Configurações do Baralho
const naipes = ['Ouros', 'Espadas', 'Copas', 'Paus'];
// Valores no truco (ordem de força será implementada depois)
const valoresSujo = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const valoresLimpo = ['Q', 'J', 'K', 'A', '2', '3']; // Retira 4, 5, 6 e 7

let baralho = [];
let maos = { voce: [], aliado: [], oponente1: [], oponente2: [] };
let vira = null;

function criarBaralho(tipo) {
    baralho = [];
    const valores = tipo === 'sujo' ? valoresSujo : valoresLimpo;
    
    for (let naipe of naipes) {
        for (let valor of valores) {
            baralho.push({ valor, naipe });
        }
    }
}

function embaralhar() {
    for (let i = baralho.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
    }
}

function distribuirCartas() {
    // Dá 3 cartas para cada um dos 4 jogadores
    for (let i = 0; i < 3; i++) {
        maos.voce.push(baralho.pop());
        maos.oponente2.push(baralho.pop());
        maos.aliado.push(baralho.pop());
        maos.oponente1.push(baralho.pop());
    }
    // A próxima carta é o Vira
    vira = baralho.pop();
}

function renderizarCartas() {
    // Mostra suas cartas
    const divSuaMao = document.getElementById('mao-voce');
    divSuaMao.innerHTML = '';
    maos.voce.forEach(carta => {
        divSuaMao.innerHTML += `<div class="carta">${carta.valor} <br> ${carta.naipe.charAt(0)}</div>`;
    });

    // Mostra o Vira no centro da mesa
    document.getElementById('vira').innerHTML = 
        `<div style="text-align: center; margin-bottom: 10px;">VIRA</div>
         <div class="carta" style="border: 2px solid gold;">${vira.valor} <br> ${vira.naipe.charAt(0)}</div>`;
    
    // (Opcional) Aqui você geraria o verso das cartas para os outros jogadores
}

function iniciarJogo(tipo) {
    // Esconde o menu e mostra a mesa
    document.getElementById('menu').classList.add('escondido');
    document.getElementById('mesa-de-truco').classList.remove('escondido');
    document.getElementById('mesa-de-truco').style.display = 'flex';

    // Roda a lógica
    criarBaralho(tipo);
    embaralhar();
    distribuirCartas();
    renderizarCartas();
}
