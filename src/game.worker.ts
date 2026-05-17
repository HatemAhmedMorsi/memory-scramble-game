// src/game.worker.ts
export {};
import { Card } from './types';

/**
 * @description initialize & construct & shuffles  cards randomly.
 * @param {number} size size must be an even positive integer.
 * @returns {Array} returns shuffled array where each value appears exactly twice.
 * @throws {Error} if size equals zero or negative.
 * @spec
 *  pre-condition: size > 0 && size % 2 == 0
 *  post-condition: returns an array of length 'size' with pairs of values
 */
export const initializeCards = (size: number): Card[] => {
    // Defensive check for input validity
    if (size <= 0 || size % 2 !== 0) {
        throw new Error("Size must be a positive even integer");
    }

    let cards: Card[] = [];
    for (let i = 0; i < size / 2; i++) {
        const cardValue = i;
        
        // Creating pairs with initial state
        cards.push({ id: i * 2, value: cardValue, isFlipped: false, isMatched: false });
        cards.push({ id: i * 2 + 1, value: cardValue, isFlipped: false, isMatched: false });
    }

    // Fisher-Yates Shuffle Algorithm (O(n) complexity)
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    return cards;
};

/**
 * Web Worker Message Handling
 * Casting self to Worker for proper TypeScript support in worker context
 */
const ctx: Worker = self as any;

// (Message Passing)
ctx.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;
    
    if (type === 'INIT_GAME') {
        try {
            const startTime = performance.now();
            
            // Logic Execution
            const cards = initializeCards(payload.size);
            
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);

            // Successful response
            ctx.postMessage({
                type: 'INIT_COMPLETE',
                payload: { 
                    cards, 
                    duration: `${duration}ms`
                }
            });
        } catch (error: any) {
            // Error propagation to main thread
            ctx.postMessage({
                type: 'ERROR',
                payload: error.message
            });
        }
    }
};