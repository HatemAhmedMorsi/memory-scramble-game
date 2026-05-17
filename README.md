Memory Scramble Game
📋 Project Overview
This is a modern, high-performance Memory Match game built with TypeScript, focusing on core Software Engineering principles like Concurrency, Asynchronous Programming, and Performance Optimization. The game is designed to handle extreme stress cases (up to a 30x30 grid) while maintaining a smooth UI and accurate timing.
________________________________________


* PROJECT SPECIFICATIONS:
 * -----------------------
 * 1. Concurrency: Offloads timing logic to 'timerWorker' to ensure accuracy under high DOM load.
 * 2. Performance: Implements "Batch Rendering" via Promises and requestAnimationFrame 
 *    to handle large grids (up to 30x30) without blocking the Main Thread.
 * 3. Memory Management: Uses DocumentFragment for batch DOM injection to minimize Reflow/Repaint.
 * 4. Async Flow: Manages game states (flip, match, delay) using Async/Await to avoid callback hell.
 * 5. Scalability: Responsive CSS Grid logic that adapts dynamically to 'nCols'.
 ________________________________________

🏗 Architecture Explanation
The project follows a Multi-Threaded Architecture to ensure that heavy UI operations or game logic do not block the main execution thread.
1. Concurrency Model (Web Workers)
To achieve a "Zero-Lag" experience, the application offloads time-sensitive and background tasks to separate threads:
•	Timer Worker: Handles the countdown logic independently. This ensures the timer remains accurate even if the main thread is busy rendering 900+ cards.
•	Input Worker: Manages user interactions and event buffering, preventing "Input Lag" during intense gameplay.
•	Message Passing: Uses the postMessage API for secure, asynchronous communication between the Main Thread and Workers.
2. Asynchronous Flow (Promises & Async/Await)
The game logic uses Promises to manage sequential events without falling into "Callback Hell":
•	Sequential Animations: Card flipping and matching delays are handled via a custom delay promise, making the code readable and predictable.
•	Lifecycle Management: Starting the game, generating the board, and triggering the timer are orchestrated using async/await.
3. Performance & Rendering Optimization
Handling a 30x30 grid (900 cards) required specific engineering decisions:
•	DocumentFragment: Instead of 900 individual DOM injections, we use a DocumentFragment to batch the entire board creation into a single reflow operation.
•	CSS Grid & Variables: Dynamic layout calculation is offloaded to the browser's CSS engine using CSS Variables (--cols), ensuring the UI is fully responsive and fits within the viewport regardless of the grid size.
•	GPU Acceleration: Used transform-style: preserve-3d and backface-visibility to ensure card animations are handled by the GPU.
________________________________________
🚀 Getting Started
Prerequisites
•	Node.js (v16+)
•	npm
Installation
1.	Clone the repository:
Bash
git clone https://github.com/HatemAhmedMorsi/memory-scramble-game.git
2.	Install dependencies:
Bash
npm install
Running the Project
•	Development Mode:
*   **Build for Dev:**
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
---

## 🛠 Tech Stack
*   **Language:** TypeScript
*   **Styling:** Modern CSS3 (Grid, Flexbox, Variables)
*   **Concurrency:** Web Workers API
*   **Asynchronous Logic:** ES6 Promises & Async/Await
*   **Build Tool:** Vite (for fast HMR and bundling)

---
________________________________________
Authors:
1.	Mohammed Hesham Ahmed (Student ID: 11422025410051)
2.	Hatem Ahmed Morsy(Student ID: 11422025483037)
________________________________________
