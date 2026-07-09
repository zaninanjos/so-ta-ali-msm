const naipes = ['Ouros', 'Espadas', 'Copas', 'Paus'];
const valoresSujo = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const valoresLimpo = ['Q', 'J', 'K', 'A', '2', '3'];
const forcaBase = { '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10 };
const forcaNaipes = { 'Ouros': 1, 'Espadas': 2, 'Copas': 3, 'Paus': 4 };

let tipoBaralho = '';
let baralho = [];
let maos = { voce: [], aliado: [], oponente1: [], oponente2: [] };
let vira = null, manilhaValor = null;
let mesa = [], turnoAtual = 0;

// Placar
let tentosNos = 0, tentosEles = 0;
let vazasNos = 0, vazasEles = 0;
let valorRodada = 1;
let jogoTravado = false;

function iniciarJogo(tipo) {
    tipoBaralho = tipo;
    document.getElementById('menu').classList.add('escondido');
    document.getElementById('placar').classList.remove('escondido');
    document.getElementById('mesa-de-truco').classList.remove('escondido');
    tentosNos = 0; tentosEles = 0;
    atualizarPlacar();
    novaRodada();
}

function novaRodada() {
    vazasNos = 0; vazasEles = 0; valorRodada = 1;
    document.getElementById('btn-proxima').classList.add('escondido');
    document.getElementById('btn-truco').classList.remove('escondido');
    document.getElementById('btn-truco').innerText = "TRUCO!";
    atualizarPlacar();
    iniciarMao();
}

function iniciarMao() {
    mesa = [];
    jogoTravado = false;
    document.getElementById('cartas-jogadas').innerHTML = '';
    
    // Cria, embaralha e distribui
    baralho = [];
    const valores = tipoBaralho === 'sujo' ? valoresSujo : valoresLimpo;
    for (let naipe of naipes) {
        for (let valor of valores) {
            baralho.push({ valor, naipe, peso: forcaBase[valor] });
        }
    }
    baralho.sort(() => Math.random() - 0.5);

    maos = { voce: [], aliado: [], oponente1: [], oponente2: [] };
    for (let i = 0; i < 3; i++) {
        maos.voce.push(baralho.pop());
        maos.oponente2.push(baralho.pop());
        maos.aliado.push(baralho.pop());
        maos.oponente1.push(baralho.pop());
    }
    vira = baralho.pop();
    
    let indexVira = valores.indexOf(vira.valor);
    manilhaValor = valores[(indexVira + 1) % valores.length];

    renderizarCartas();
}

function renderizarCartas() {
    // Sua mão
    const divSuaMao = document.getElementById('mao-voce');
    divSuaMao.innerHTML = '';
    maos.voce.forEach((carta, index) => {
        let div = document.createElement('div');
        div.className = 'carta';
        div.innerHTML = `${carta.valor} <br> ${carta.naipe.charAt(0)}`;
        div.onclick = () => jogarCarta('voce', index);
        divSuaMao.appendChild(div);
    });

    // Mãos dos bots (viradas para baixo)
    ['aliado', 'oponente1', 'oponente2'].forEach(jogador => {
        const divMao = document.getElementById(`mao-${jogador}`);
        divMao.innerHTML = '';
        maos[jogador].forEach(() => {
            divMao.innerHTML += `<div class="carta carta-costas"></div>`;
        });
    });

    // Vira
    document.getElementById('vira').innerHTML = `<div style="text-align: center; color: white;">VIRA</div><div class="carta" style="border: 2px solid gold;">${vira.valor}<br>${vira.naipe.charAt(0)}</div>`;
}

function calcularPoder(carta) {
    if (carta.valor === manilhaValor) return 20 + forcaNaipes[carta.naipe];
    return carta.peso;
}

function jogarCarta(jogador, indexCarta) {
    if (jogoTravado || (jogador === 'voce' && mesa.length > 0 && mesa[mesa.length-1].dono !== 'oponente2' && mesa.length !== 0)) return;
    
    let cartaJogada = maos[jogador].splice(indexCarta, 1)[0];
    cartaJogada.poder = calcularPoder(cartaJogada);
    cartaJogada.dono = jogador;
    mesa.push(cartaJogada);
    
    renderizarCartas(); // Atualiza mãos
    
    // Mostra mesa
    const divMesa = document.getElementById('cartas-jogadas');
    divMesa.innerHTML += `<div class="carta">${cartaJogada.valor}<br>${cartaJogada.naipe.charAt(0)}<br><small style="font-size:10px">${jogador}</small></div>`;

    if (mesa.length === 4) {
        jogoTravado = true;
        setTimeout(verificarVencedorVaza, 1500);
    } else {
        jogoTravado = true;
        setTimeout(() => {
            jogoTravado = false;
            let proximo = jogador === 'voce' ? 'oponente1' : jogador === 'oponente1' ? 'aliado' : 'oponente2';
            if(proximo !== 'voce') botJoga(proximo);
        }, 800);
    }
}

function botJoga(jogador) {
    if (maos[jogador].length > 0) jogarCarta(jogador, 0); // Bot joga a primeira carta sempre (simples)
}

function verificarVencedorVaza() {
    let maior = mesa[0];
    for (let i = 1; i < mesa.length; i++) {
        if (mesa[i].poder > maior.poder) maior = mesa[i];
    }

    if (maior.dono === 'voce' || maior.dono === 'aliado') vazasNos++;
    else vazasEles++;

    atualizarPlacar();

    if (vazasNos >= 2 || vazasEles >= 2) {
        finalizarRodada(vazasNos >= 2 ? 'nos' : 'eles');
    } else {
        mesa = [];
        document.getElementById('cartas-jogadas').innerHTML = '';
        jogoTravado = false;
    }
}

function finalizarRodada(vencedor) {
    if (vencedor === 'nos') tentosNos += valorRodada;
    else tentosEles += valorRodada;
    
    atualizarPlacar();

    if (tentosNos >= 12) return alert("Sua equipe GANHOU o jogo!");
    if (tentosEles >= 12) return alert("Sua equipe PERDEU o jogo!");

    document.getElementById('btn-proxima').classList.remove('escondido');
    document.getElementById('btn-truco').classList.add('escondido');
}

function pedirTruco() {
    if(jogoTravado) return;
    
    // Lógica simples do Bot responder (50% aceita, 50% corre)
    let aceitou = Math.random() > 0.5;
    
    if(aceitou) {
        if (valorRodada === 1) valorRodada = 3;
        else if (valorRodada === 3) valorRodada = 6;
        else if (valorRodada === 6) valorRodada = 9;
        else if (valorRodada === 9) valorRodada = 12;
        
        alert("Eles ACEITARAM! A rodada agora vale " + valorRodada);
        document.getElementById('btn-truco').innerText = valorRodada === 12 ? "MÁXIMO" : "AUMENTAR";
        if(valorRodada === 12) document.getElementById('btn-truco').classList.add('escondido');
        atualizarPlacar();
    } else {
        alert("Eles CORRERAM! Você ganhou a rodada.");
        finalizarRodada('nos');
    }
}

function atualizarPlacar() {
    document.getElementById('pontos-nos').innerText = tentosNos;
    document.getElementById('pontos-eles').innerText = tentosEles;
    document.getElementById('vazas-nos').innerText = vazasNos;
    document.getElementById('vazas-eles').innerText = vazasEles;
    document.getElementById('valor-rodada').innerText = valorRodada;
}
