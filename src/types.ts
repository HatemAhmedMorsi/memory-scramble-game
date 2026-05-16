// src/types.ts
export interface Card {
    id: number;
    value: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export interface PerformanceMetrics {
    operation: string;
    duration: number; // count ms by using Performance API
}