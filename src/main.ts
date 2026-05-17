/**
 * @file main.ts
 * @description Main thread.
 */


// 1. Initialize Workers
const timerWorker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });
const inputWorker = new Worker(new URL('./input.worker.ts', import.meta.url), { type: 'module' });

// 2. Timer Worker Listener
timerWorker.onmessage = (e) => {
    const { type, payload } = e.data;
    if (type === 'TICK') {
        console.log(`⏱️ Timer: ${payload}s`);
    }
};

// 3. Input Worker Listener (The new test)
inputWorker.onmessage = (e) => {
    const { type, payload } = e.data;
    if (type === 'VALIDATED_INPUT') {
        console.log(`🖱️ Input Accepted: Card ID [${payload.cardId}] at ${payload.processedAt}`);
    }
};

// --- Execution Test Scenario ---

console.log("🚀 Starting Combined Integration Test...");

// Start the timer
timerWorker.postMessage({ action: 'START' });

// Simulate User Interactions (Clicks)
console.log("🖱️ Simulating Clicks...");

// Test Case 1: Normal Click
console.log("Test 1: Normal click on Card 10");
inputWorker.postMessage({ type: 'USER_CLICK', cardId: 10 });

// Test Case 2: Rapid Double Click (The second one should be ignored by the worker)
setTimeout(() => {
    console.log("Test 2: Rapid double-click on Card 20 (Simulating a glitch)");
    inputWorker.postMessage({ type: 'USER_CLICK', cardId: 20 });
    inputWorker.postMessage({ type: 'USER_CLICK', cardId: 20 }); // This should be filtered out
}, 2000);

// Test Case 3: Clicking a different card quickly
setTimeout(() => {
    console.log("Test 3: Clicking Card 30 immediately after");
    inputWorker.postMessage({ type: 'USER_CLICK', cardId: 30 });
}, 2100);

// Stop everything after 5 seconds
setTimeout(() => {
    console.log("🛑 Test Finished. Stopping Workers.");
    timerWorker.postMessage({ action: 'STOP' });
}, 5000);