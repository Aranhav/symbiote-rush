// Main game logic

import { GAME_HEIGHT, ONOMATOPOEIA, SPIDERVERSE } from './config.js';
import { playSound } from './audio.js';
import { Venom, GreenGoblin, PumpkinBomb } from './characters.js';
import { InkSplatter, SpeedLine, AfterImage, ComicText } from './effects.js';
import { TaxiCab, FireHydrant, Dumpster, ConstructionBarrier, StormCloud, ElectroBolt, Building } from './obstacles.js';
import { randomPhrase, checkCollision } from './utils.js';
import {
    drawHalftone,
    drawColorMisregistration,
    drawChromaticAberration,
    drawPanelBorders,
    drawActionLines,
    drawSpiderVerseOverlay,
    drawGlitchEffect,
    drawStartScreen
} from './visuals.js';
import { checkGDPRConsent, canSaveScore } from './gdpr.js';

// Canvas and DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const hiScoreEl = document.getElementById('hi-score');
const gameOverScreen = document.getElementById('game-over-screen');
const startScreen = document.getElementById('start-screen');
const restartBtn = document.getElementById('restart-icon');
const finalScoreEl = document.getElementById('final-score');
const deathReasonEl = document.getElementById('death-reason');
const mobileHint = document.getElementById('mobile-hint');

// Game state
let gameSpeed = 5;
let score = 0;
let highScore = 0;
// Load high score only if consent given
if (canSaveScore()) {
    highScore = localStorage.getItem('symbioteScore') || 0;
}

let frame = 0;
let isGameOver = false;
let isPlaying = false;
let obstacles = [];
let comicTexts = [];
let buildings = [];
let goblin = null;
let pumpkinBombs = [];
let electroBolts = [];
let clouds = [];
let scaleRatio = 1;
let logicalWidth = 600;
let glitchTimer = 0;
let glitchActive = false;
let inkSplatters = [];
let speedLines = [];
let afterImages = [];

// Game objects
let venom = new Venom();
let spawnTimer = 0;
let goblinTimer = 0;
let boltTimer = 0;
const inputs = { jump: false, duck: false, jumpPressed: false };

// Check GDPR on load
checkGDPRConsent();

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaleRatio = canvas.height / GAME_HEIGHT;
    logicalWidth = canvas.width / scaleRatio;

    // Show mobile hint if on small screen
    if (window.innerWidth < 768 && mobileHint) {
        mobileHint.style.display = 'block';
    }
}

window.addEventListener('resize', resize);
resize();

// Input handling
document.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        if (!isPlaying && !isGameOver) startGame();
        else if (isPlaying && !inputs.jump) {
            inputs.jump = true;
            inputs.jumpPressed = true;
        }
        e.preventDefault();
    }
    if (['ArrowDown', 'KeyS'].includes(e.code)) {
        inputs.duck = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', e => {
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) inputs.jump = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) inputs.duck = false;
});

// Improved Touch Handling
canvas.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevent scrolling/zooming
    if (!isPlaying && !isGameOver) startGame();
    else if (isPlaying && !inputs.jump) {
        inputs.jump = true;
        inputs.jumpPressed = true;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    inputs.jump = false;
    inputs.duck = false;
}, { passive: false });

canvas.addEventListener('click', () => { if (!isPlaying && !isGameOver) startGame(); });
restartBtn.addEventListener('click', resetGame);

function startGame() {
    isPlaying = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    for (let i = 0; i < 5; i++) buildings.push(new Building(i * 120, logicalWidth, gameSpeed));
    for (let i = 0; i < 3; i++) clouds.push(new StormCloud(i * 200 + Math.random() * 100, logicalWidth, gameSpeed));
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    isGameOver = false;
    isPlaying = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    comicTexts = [];
    pumpkinBombs = [];
    buildings = [];
    electroBolts = [];
    clouds = [];
    inkSplatters = [];
    speedLines = [];
    afterImages = [];
    goblin = null;
    spawnTimer = goblinTimer = boltTimer = 0;
    glitchTimer = 0;
    glitchActive = false;
    venom = new Venom();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    updateScore();
    for (let i = 0; i < 5; i++) buildings.push(new Building(i * 120, logicalWidth, gameSpeed));
    for (let i = 0; i < 3; i++) clouds.push(new StormCloud(i * 200 + Math.random() * 100, logicalWidth, gameSpeed));
    requestAnimationFrame(gameLoop);
}

function updateScore() {
    scoreEl.innerText = Math.floor(score).toString().padStart(5, '0');
    hiScoreEl.innerText = `HI ${Math.floor(highScore).toString().padStart(5, '0')}`;
}

function gameLoop() {
    if (!isPlaying) return;

    // Glitch effect timing
    glitchTimer++;
    if (glitchTimer > 120 && Math.random() < 0.02) {
        glitchActive = true;
        setTimeout(() => glitchActive = false, 50 + Math.random() * 100);
        glitchTimer = 0;
    }

    // Clear with gradient sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(0.3, '#0d0d2b');
    skyGrad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds (background layer)
    clouds.forEach(c => c.draw(ctx, scaleRatio));
    clouds = clouds.filter(c => !c.update());
    if (clouds.length < 4 && Math.random() < 0.01) clouds.push(new StormCloud(undefined, logicalWidth, gameSpeed));

    // Buildings
    buildings.forEach(b => b.draw(ctx, scaleRatio));
    buildings = buildings.filter(b => !b.update());
    if (buildings.length < 6 && Math.random() < 0.02) buildings.push(new Building(undefined, logicalWidth, gameSpeed));

    // Ground
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, (GAME_HEIGHT - 50) * scaleRatio, canvas.width, canvas.height);
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, (GAME_HEIGHT - 52) * scaleRatio, canvas.width, 4 * scaleRatio);

    // Road lines
    ctx.fillStyle = '#ffff00';
    const lineOffset = (frame * gameSpeed * 2) % 80;
    for (let x = -lineOffset; x < canvas.width; x += 80) {
        ctx.fillRect(x, (GAME_HEIGHT - 35) * scaleRatio, 40 * scaleRatio, 3 * scaleRatio);
    }

    // Update entities
    venom.update(inputs, isPlaying, inkSplatters, speedLines, afterImages, comicTexts, gameSpeed, frame);
    obstacles.forEach(o => o.update());
    obstacles = obstacles.filter(o => !o.markedForDeletion);
    electroBolts.forEach(b => b.update());
    electroBolts = electroBolts.filter(b => !b.markedForDeletion);
    pumpkinBombs = pumpkinBombs.filter(b => !b.update());
    comicTexts.forEach(t => t.update());
    comicTexts = comicTexts.filter(t => t.life > 0);

    // Spawn obstacles
    spawnTimer++;
    if (spawnTimer > 80 / (gameSpeed / 5)) {
        const types = [
            () => new TaxiCab(logicalWidth, gameSpeed),
            () => new FireHydrant(logicalWidth, gameSpeed),
            () => new Dumpster(logicalWidth, gameSpeed),
            () => new ConstructionBarrier(logicalWidth, gameSpeed)
        ];
        obstacles.push(types[Math.floor(Math.random() * types.length)]());
        spawnTimer = 0;
    }

    // Spawn lightning from clouds
    boltTimer++;
    if (boltTimer > 180 && score > 100 && clouds.length > 0) {
        const cloud = clouds[Math.floor(Math.random() * clouds.length)];
        if (cloud.x > 100 && cloud.x < logicalWidth - 100) {
            const bolt = cloud.spawnLightning();
            if (bolt) {
                electroBolts.push(new ElectroBolt(bolt.x + 20, bolt.y, gameSpeed));
                playSound('electric');
            }
        }
        boltTimer = 0;
    }

    // Spawn goblin
    goblinTimer++;
    if (goblinTimer > 400 && !goblin && score > 150) {
        goblin = new GreenGoblin(logicalWidth, gameSpeed);
        goblinTimer = 0;
    }
    if (goblin && goblin.update(venom.x, pumpkinBombs, comicTexts)) goblin = null;

    // Update comic effects
    afterImages = afterImages.filter(a => !a.update());
    speedLines = speedLines.filter(s => !s.update());
    inkSplatters = inkSplatters.filter(s => !s.update());

    // Draw afterimages first (behind character)
    afterImages.forEach(a => a.draw(ctx, scaleRatio));

    // Draw speed lines
    speedLines.forEach(s => s.draw(ctx, scaleRatio));

    // Draw everything
    obstacles.forEach(o => o.draw(ctx, scaleRatio));
    electroBolts.forEach(b => b.draw(ctx, scaleRatio));
    pumpkinBombs.forEach(b => b.draw(ctx, scaleRatio));
    if (goblin) goblin.draw(ctx, scaleRatio);
    venom.draw(ctx, scaleRatio);

    // Draw ink splatters
    inkSplatters.forEach(s => s.draw(ctx, scaleRatio));

    // Draw comic texts
    comicTexts.forEach(t => t.draw(ctx, scaleRatio));

    // Spider-Verse visual effects (layered for maximum comic feel)
    drawActionLines(ctx, canvas, scaleRatio, isPlaying);
    drawHalftone(ctx, canvas, scaleRatio);
    drawColorMisregistration(ctx, canvas, scaleRatio);
    drawChromaticAberration(ctx, canvas, scaleRatio, glitchActive);
    drawSpiderVerseOverlay(ctx, canvas, scaleRatio, frame);
    drawGlitchEffect(ctx, canvas, scaleRatio, glitchActive);
    drawPanelBorders(ctx, canvas, scaleRatio);

    // Collisions
    const bounds = venom.getBounds();
    for (let o of obstacles) {
        if (checkCollision(bounds, o.getBounds())) {
            const reasons = {
                TaxiCab: 'Hit by taxi!',
                FireHydrant: 'Tripped on hydrant!',
                Dumpster: 'Crashed into dumpster!',
                ConstructionBarrier: 'Hit barrier!'
            };
            // Comic effects on hit
            const hitText = randomPhrase(ONOMATOPOEIA.hit);
            comicTexts.push(new ComicText(hitText, venom.x + 30, venom.y));
            inkSplatters.push(new InkSplatter(venom.x + 25, venom.y + 35, SPIDERVERSE.pink));
            inkSplatters.push(new InkSplatter(o.x + o.w / 2, o.y + o.h / 2, SPIDERVERSE.cyan));
            gameOver(reasons[o.constructor.name] || 'Crashed!');
            return;
        }
    }
    for (let b of electroBolts) {
        if (checkCollision(bounds, b.getBounds())) {
            const zapText = randomPhrase(ONOMATOPOEIA.electric);
            comicTexts.push(new ComicText(zapText, b.x + 20, b.y + b.h - 30));
            inkSplatters.push(new InkSplatter(venom.x + 25, venom.y + 35, SPIDERVERSE.cyan));
            gameOver('Electrocuted!');
            return;
        }
    }
    for (let b of pumpkinBombs) {
        if (checkCollision(bounds, b.getBounds())) {
            const boomText = randomPhrase(ONOMATOPOEIA.bomb);
            comicTexts.push(new ComicText(boomText, b.x, b.y));
            inkSplatters.push(new InkSplatter(b.x, b.y, SPIDERVERSE.orange));
            inkSplatters.push(new InkSplatter(venom.x + 25, venom.y + 35, SPIDERVERSE.pink));
            gameOver('Pumpkin bomb!');
            return;
        }
    }
    if (goblin && checkCollision(bounds, goblin.getBounds())) {
        comicTexts.push(new ComicText('WHAM!', goblin.x + 35, goblin.y + 30));
        inkSplatters.push(new InkSplatter(goblin.x + 35, goblin.y + 30, SPIDERVERSE.purple));
        gameOver('Hit by Goblin!');
        return;
    }

    // Score
    score += 0.1;
    if (Math.floor(score) % 100 === 0 && Math.floor(score) !== Math.floor(score - 0.1)) {
        playSound('score');
    }
    updateScore();

    // Speed up
    if (gameSpeed < 15) gameSpeed += 0.001;

    frame++;
    requestAnimationFrame(gameLoop);
}

function gameOver(reason) {
    isPlaying = false;
    isGameOver = true;
    playSound('die');

    if (score > highScore) {
        highScore = Math.floor(score);
        if (canSaveScore()) {
            localStorage.setItem('symbioteScore', highScore);
        }
    }
    updateScore();
    deathReasonEl.innerText = reason;
    finalScoreEl.innerText = `SCORE: ${Math.floor(score).toString().padStart(5, '0')}`;
    gameOverScreen.style.display = 'block';
}

// Init
hiScoreEl.innerText = `HI ${Math.floor(highScore).toString().padStart(5, '0')}`;
drawStartScreen(ctx, canvas, scaleRatio, venom);
