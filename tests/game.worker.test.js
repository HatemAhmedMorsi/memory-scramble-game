// game.worker.test.js
// 1.  Logic  Worker
function initializeCards(size) {
    const emojis = ['🎮', '🎲', '🧩', '🎯', '👾', '🚀', '⭐', '🔥'];
    let cards = [];
    for (let i = 0; i < size / 2; i++) {
        const val = emojis[i % emojis.length];
        cards.push({ id: i * 2, value: val }, { id: i * 2 + 1, value: val });
    }
    return cards.sort(() => Math.random() - 0.5);
}

// 2.  Test Runner 
console.log("🧪 Running Final Emergency Tests...");

try {
    // Test 1: Size
    const data = initializeCards(16);
    if (data.length === 16) {
        console.log("✅ Test 1 Passed: Generated 16 cards.");
    } else {
        throw new Error(`Expected 16 cards, got ${data.length}`);
    }

    // Test 2: Pairs
    const counts = {};
    data.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    const allPairs = Object.values(counts).every(v => v === 2);
    if (allPairs) {
        console.log("✅ Test 2 Passed: All cards are in pairs.");
    } else {
        throw new Error("Some cards are missing their pairs!");
    }

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
} catch (err) {
    console.error("\n❌ TEST FAILED:");
    console.error(err.message);
    process.exit(1);
}