export {};
/**
 * @file timer.worker.ts
 * @description Background worker for game timing.
 * 
 * @spec
 *  - action 'START': Initializes an interval if not already running.
 *  - action 'STOP' : Clears the existing interval.
 *  - action 'RESET': Resets the counter to zero and clears interval.
 *  - post-condition: Sends 'TICK' message with the current second count.
 */

let seconds = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

const ctx: Worker = self as any;

ctx.onmessage = (e: MessageEvent) => {
    const { action } = e.data;

    switch (action) {
        case 'START':
            if (!intervalId) {
                intervalId = setInterval(() => {
                    seconds++;
                    // Emit the current elapsed time
                    ctx.postMessage({ type: 'TICK', payload: seconds });
                }, 1000);
            }
            break;

        case 'STOP':
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
                seconds = 0;
            }
            break;

        case 'RESET':
            seconds = 0;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            ctx.postMessage({ type: 'TICK', payload: seconds });
            break;
    }
};