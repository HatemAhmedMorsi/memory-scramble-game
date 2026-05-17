export {};
/**
 * @file input.worker.ts
 * @description Dedicated worker to handle and queue user interactions.
 * 
 * @spec
 *  - Listen for 'CLICK' events from the main thread.
 *  - Validate if the click is within game bounds.
 *  - Throttle or Queue inputs to prevent "Double-Click".
 */

const ctx: Worker = self as any;

// A simple queue to manage rapid clicks
let inputQueue: number[] = [];

ctx.onmessage = (e: MessageEvent) => {
    const { type, cardId, timestamp } = e.data;

    if (type === 'USER_CLICK') {
        // Validation: Ignore if the click is already being processed
        if (!inputQueue.includes(cardId)) {
            inputQueue.push(cardId);

            // Logic: Pass the validated input back to the Game Controller
            ctx.postMessage({
                type: 'VALIDATED_INPUT',
                payload: {
                    cardId,
                    processedAt: Date.now()
                }
            });

            // Small cooldown to prevent accidental double taps
            setTimeout(() => {
                inputQueue = inputQueue.filter(id => id !== cardId);
            }, 300); 
        }
    }
};