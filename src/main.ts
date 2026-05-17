/**
 * @file main.ts
 * @module MemoryMatchGame
 * @description Core logic controller for the Memory Match Game. 
 * Manages game state, UI synchronization, and worker orchestration.
 * 
 * 
 * ---  SPECIFICATIONS ---
 * 
 * @purpose 
 * To provide a high-performance, scalable memory game capable of handling 
 * large-scale grids (up to 30x30) using modern asynchronous patterns.
 * 
 * @global_invariants
 * 1. (matches <= totalPairs) is always true.
 * 2. flippedCards.length <= 2 at any point in time.
 * 3. inputWorker and timerWorker must be initialized before game start.
 * 
 * @pre_conditions
 * - Browser must support Web Workers and ES6 Modules.
 * - 'input.worker.ts' and 'timer.worker.ts' must exist in the same directory.
 * - HTML must contain elements with IDs: 'grid', 'setup-screen', 'game-container'.
 * 
 * @post_conditions
 * - All asynchronous operations (delays, renders) resolve without blocking the UI.
 * - System state is fully reset when the 'restart' signal is triggered.
 * 
 * @dependencies
 * - Vite (for asset bundling and worker URL resolution).
 * - TypeScript (for static type checking).
 */

let flippedCards: HTMLElement[] = [];
let matches: number = 0;
let totalPairs: number = 0;

// Utility for non-blocking delays
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Workers initialization
const inputWorker = new Worker(new URL('./input.worker.ts', import.meta.url), { type: 'module' });
const timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });

const grid = document.getElementById('grid') as HTMLElement;
const setupScreen = document.getElementById('setup-screen') as HTMLElement;
const gameContainer = document.getElementById('game-container') as HTMLElement;
const resultModal = document.getElementById('result-modal') as HTMLElement;
const resultMessage = document.getElementById('result-message') as HTMLElement;
const restartBtn = document.getElementById('restart-btn') as HTMLElement;

document.getElementById('start-btn')?.addEventListener('click', async () => {
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
    // Responsive grid handling - Offloading layout to CSS Grid
    grid.style.gridTemplateColumns = `repeat(${nCols}, minmax(0, 1fr))`;
    grid.style.width = nCols > 10 ? '95vw' : `${nCols * 90}px`;

    // High-Performance Board Initialization (Async)
    await initBoard(nRows, nCols);
    startTimer(timeout);
});

/**
 * @function startTimer
 * @description Communicates with the timer worker to begin the countdown.
 * 
 * @param {number} duration - The total time for the game in seconds.
 * @pre duration > 0.
 * @post timerWorker starts sending 'TICK' messages every second.
 * @post The 'timer' UI element updates in real-time.
 */
function startTimer(duration: number) {
    timerWorker.postMessage({ action: 'START' });
    timerWorker.onmessage = (e) => {
        if (e.data.type === 'TICK') {
            const left = duration - e.data.payload;
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.innerText = `Time: ${left}s`;
            if (left <= 0) showResult("Game Over! Time's up.");
        }
    };
}


/**
 * @function showResult
 * @description Terminates the game and displays the victory or defeat modal.
 * 
 * @param {string} msg - The message to be displayed to the user.
 * @pre A game-ending condition is met (Victory or Timeout).
 * @post timerWorker is stopped.
 * @post resultModal is displayed with the provided message.
 */
function showResult(msg: string) {
    timerWorker.postMessage({ action: 'STOP' });
    resultMessage.innerText = msg;
    resultModal.style.display = 'flex';
}

restartBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
    gameContainer.style.display = 'none';
    setupScreen.style.display = 'block';
    matches = 0;
    flippedCards = [];
    totalPairs = 0;
    grid.innerHTML = '';
    
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    if (scoreElement) scoreElement.innerText = `Matches: 0`;
    if (timerElement) timerElement.innerText = `Time: 0s`;

    timerWorker.postMessage({ action: 'STOP' });
});

/**
 * Optimized initBoard: 
 * Uses DocumentFragment and Async-Batching to render up to 900 cards smoothly.
 */

/**
 * @function initBoard
 * @description Initializes the game board by shuffling icons and rendering cards in batches.
 * 
 * @pre rows * cols must be an even number.
 * @pre rows and cols must be positive integers.
 * @post The 'grid' DOM element will be populated with (rows * cols) card elements.
 * @post The game board will be visible and interactable.
 */
async function initBoard(rows: number, cols: number) {
    const icons: string[] = ['🍎', '🚀', '⭐', '💎', '🌈', '⚽', '🎨', '⚡', '🌙', '🍀', '🦋', '🎁', '🐱', '🐘', '🍦', '🍕'];
    let gameIcons: string[] = [];
    for (let i = 0; i < totalPairs; i++) {
        gameIcons.push(icons[i % icons.length]);
    }
    gameIcons = [...gameIcons, ...gameIcons];
    gameIcons.sort(() => Math.random() - 0.5);

    const fragment = document.createDocumentFragment();
    const batchSize = 60; // Render 60 cards at a time to prevent UI freezing

    for (let i = 0; i < gameIcons.length; i++) {
        const icon = gameIcons[i];
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = i.toString();
        card.dataset.value = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${icon}</div>
            </div>`;
        
        fragment.appendChild(card);

        // Every 60 cards, we wait for the next animation frame
        if (i % batchSize === 0) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            grid.appendChild(fragment); // Batch append
        }
    }
    // Append the last remaining cards
    grid.appendChild(fragment);
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


/**
 * @function checkMatch
 * @description Compares two flipped cards to determine if they are a match.
 * 
 * @pre flippedCards.length === 2.
 * @post If match: 'matches' incremented, cards remain flipped.
 * @post If no match: 'is-flipped' class removed from both cards after a delay.
 * @post inputWorker is ready to receive the next set of clicks.
 */
async function checkMatch() {
    const [c1, c2] = flippedCards;
    grid.style.pointerEvents = 'none'; // Lock input

    if (c1.dataset.value === c2.dataset.value) {
        matches++;
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = `Matches: ${matches}`;
        
        await delay(400); // UI breathing room
        flippedCards = [];
        
        if (matches === totalPairs) showResult("Victory! Master of Memory.");
    } else {
        await delay(800); // Visual feedback delay
        c1.classList.remove('is-flipped');
        c2.classList.remove('is-flipped');
        flippedCards = [];
    }

    grid.style.pointerEvents = 'auto'; // Unlock input
}