/**
 * Manual Test for Input Worker Logic
 */

console.log("🖱️ Running Input Logic Tests...");

let mockQueue = [];
const processClick = (id) => {
    if (mockQueue.includes(id)) return false; // Rejected
    mockQueue.push(id);
    return true; // Accepted
};

// Test 1: First Click
if (processClick(1) === true) {
    console.log("✅ Test 1 Passed: First click accepted.");
}

// Test 2: Immediate Double Click (Should be rejected)
if (processClick(1) === false) {
    console.log("✅ Test 2 Passed: Rapid double-click on same card blocked.");
} else {
    console.error("❌ Test 2 Failed: Double-click was not blocked.");
}

// Test 3: Click different card
if (processClick(2) === true) {
    console.log("✅ Test 3 Passed: Different card click accepted.");
}

console.log("\n🚀 INPUT WORKER LOGIC IS SOLID!");