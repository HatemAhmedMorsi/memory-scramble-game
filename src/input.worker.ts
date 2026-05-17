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

// Defined as string array to prevent 'never' error
let inputQueue: string[] = [];

ctx.onmessage = (e: MessageEvent) => {
    const { type, cardId } = e.data;

    if (type === 'USER_CLICK') {
        const idString = String(cardId);
        if (!inputQueue.includes(idString)) {
            inputQueue.push(idString);

            ctx.postMessage({
                type: 'VALIDATED_INPUT',
                payload: {
                    cardId: idString,
                    processedAt: Date.now()
                }
            });

            // Remove from queue after cooldown
            setTimeout(() => {
                inputQueue = inputQueue.filter(id => id !== idString);
            }, 300);
        }
    }
};