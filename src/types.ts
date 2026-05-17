/**
 * Represents the structure of a single game card
 */
export interface Card {
    id: number;          // Unique identifier for each card instance
    value: number;       // The underlying value (e.g., emoji index) used for matching pairs
    isFlipped: boolean;  // Current visual state: true if the card is face up
    isMatched: boolean;  // Game state: true if the card has been successfully paired
}

/**
 * Represents performance data for monitoring system perfofrmance
 */
export interface PerformanceMetrics {
    operation: string;   // Name of the task being measured (e.g., "Initialize Game")
    duration: number;    // Time taken in milliseconds using the Performance API
    timestamp: number;   // The exact time the operation occurred (Unix timestamp)
}