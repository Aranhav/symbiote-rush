// Utility functions

export function randomPhrase(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function checkCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
