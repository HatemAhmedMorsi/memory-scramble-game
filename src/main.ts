let flippedCards: HTMLElement[] = [];
let matches: number = 0;
let totalPairs: number = 0;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const inputWorker = new Worker(new URL('./input.worker.ts', import.meta.url), { type: 'module' });
const timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });

const grid = document.getElementById('grid') as HTMLElement;
const setupScreen = document.getElementById('setup-screen') as HTMLElement;
const gameContainer = document.getElementById('game-container') as HTMLElement;
const resultModal = document.getElementById('result-modal') as HTMLElement;
const resultMessage = document.getElementById('result-message') as HTMLElement;
const restartBtn = document.getElementById('restart-btn') as HTMLElement;

document.getElementById('start-btn')?.addEventListener('click', () => {
    const nRows = parseInt((document.getElementById('input-rows') as HTMLInputElement).value);
    const nCols = parseInt((document.getElementById('input-cols') as HTMLInputElement).value);
    const timeout = parseInt((document.getElementById('input-time') as HTMLInputElement).value);

    if (nRows <= 0 || nCols <= 0 || timeout <= 0) {
        alert("Enter positive numbers!");
        return;
    }
    if ((nRows * nCols) % 2 !== 0) {
        alert("Total cells must be even!");
        return;
    }

    totalPairs = (nRows * nCols) / 2;
    setupScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    grid.innerHTML = '';
    // Responsive grid handling
    grid.style.gridTemplateColumns = `repeat(${nCols}, minmax(0, 1fr))`;
    grid.style.width = nCols > 10 ? '95vw' : `${nCols * 90}px`;


    initBoard(nRows, nCols);
    startTimer(timeout);
});

function startTimer(duration: number) {
    timerWorker.postMessage({ action: 'START' });
    timerWorker.onmessage = (e) => {
        if (e.data.type === 'TICK') {
            const left = duration - e.data.payload;
            document.getElementById('timer')!.innerText = `Time: ${left}s`;
            if (left <= 0) showResult("Game Over! Time's up.");
        }
    };
}

function showResult(msg: string) {
    timerWorker.postMessage({ action: 'STOP' });
    resultMessage.innerText = msg;
    resultModal.style.display = 'flex';
}



restartBtn.addEventListener('click', () => {
    // 1. Reset UI Visibility
    resultModal.style.display = 'none';
    gameContainer.style.display = 'none';
    setupScreen.style.display = 'block';

    // 2. Reset Game Logic
    matches = 0;
    flippedCards = [];
    totalPairs = 0;

    // 3. Reset UI Stats (Score and Timer)
    grid.innerHTML = '';
    
    //     
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    if (scoreElement) scoreElement.innerText = `Matches: 0`;
    if (timerElement) timerElement.innerText = `Time: 0s`;

    // 4. IMPORTANT: Reset and Stop the Worker
    
    timerWorker.postMessage({ action: 'STOP' });
});

function initBoard(rows: number, cols: number) {
    const icons: string[] = ['🍎', '🚀', '⭐', '💎', '🌈', '⚽', '🎨', '⚡', '🌙', '🍀', '🦋', '🎁', '🐱', '🐘', '🍦', '🍕'];
    let gameIcons: string[] = [];
    for (let i = 0; i < totalPairs; i++) {
        gameIcons.push(icons[i % icons.length]);
    }
    gameIcons = [...gameIcons, ...gameIcons];
    gameIcons.sort(() => Math.random() - 0.5);

    gameIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = index.toString();
        card.dataset.value = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${icon}</div>
            </div>`;
        grid.appendChild(card);
    });
}

grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.card') as HTMLElement;
    if (card && !card.classList.contains('is-flipped') && flippedCards.length < 2) {
        inputWorker.postMessage({ type: 'USER_CLICK', cardId: card.getAttribute('data-id') });
    }
});

inputWorker.onmessage = (e) => {
    if (e.data.type === 'VALIDATED_INPUT') {
        const card = document.querySelector(`.card[data-id="${e.data.payload.cardId}"]`) as HTMLElement;
        if (card) {
            card.classList.add('is-flipped');
            flippedCards.push(card);
            if (flippedCards.length === 2) checkMatch();
        }
    }
};

async function checkMatch() {
    const [c1, c2] = flippedCards;
    
    grid.style.pointerEvents = 'none'; 

    if (c1.dataset.value === c2.dataset.value) {
        matches++;
        (document.getElementById('score') as HTMLElement).innerText = `Matches: ${matches}`;
        
        await delay(300); 
        flippedCards = [];
        
        if (matches === totalPairs) showResult("Victory! Master of Memory.");
    } else {
        await delay(800);
        c1.classList.remove('is-flipped');
        c2.classList.remove('is-flipped');
        flippedCards = [];
    }

    grid.style.pointerEvents = 'auto';
}