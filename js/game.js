// Main game logic - Enhanced with performance optimizations

import {
    GAME_HEIGHT, ONOMATOPOEIA, SPIDERVERSE, SHAKE_CONFIG, NEAR_MISS_THRESHOLD,
    getCurrentQuality, getFrameSkip, gameSettings, loadSettings, saveSettings
} from './config.js';
import { playSound } from './audio.js';
import { Venom, GreenGoblin, PumpkinBomb } from './characters.js';
import { InkSplatter, SpeedLine, AfterImage, ComicText, ExplosionParticle, ScorePopup } from './effects.js';
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
    drawStartScreen,
    drawNeonGlow,
    drawDynamicLighting
} from './visuals.js';
import { checkGDPRConsent, canSaveScore } from './gdpr.js';

// Core systems
import { DeltaTime, ObjectPool, TimerManager, ScreenShake, filterInPlace } from './core/performance.js';
import { renderCache } from './core/render-cache.js';
import { gradientCache } from './core/gradient-cache.js';

// ============================================
// CANVAS AND DOM ELEMENTS
// ============================================
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

// ============================================
// CORE SYSTEMS INITIALIZATION
// ============================================
const deltaTime = new DeltaTime();
const timerManager = new TimerManager();
const screenShake = new ScreenShake();

// Object pools for effects
const inkSplatterPool = new ObjectPool(() => new InkSplatter(0, 0), 30, 100);
const speedLinePool = new ObjectPool(() => new SpeedLine(0, 5), 20, 50);
const afterImagePool = new ObjectPool(() => new AfterImage(0, 0, 50, 70), 15, 40);
const comicTextPool = new ObjectPool(() => new ComicText('', 0, 0), 10, 25);
const explosionPool = new ObjectPool(() => new ExplosionParticle(0, 0), 20, 50);
const scorePopupPool = new ObjectPool(() => new ScorePopup(0, 0, 0), 10, 20);

// ============================================
// GAME STATE
// ============================================
let gameSpeed = 5;
let score = 0;
let highScore = 0;
let frame = 0;
let animationFrame = 0;
let isGameOver = false;
let isPlaying = false;
let scaleRatio = 1;
let logicalWidth = 600;

// Glitch effect state
let glitchTimer = 0;
let glitchActive = false;
let glitchEndTime = 0;

// Entity arrays
let obstacles = [];
let buildings = [];
let goblin = null;
let pumpkinBombs = [];
let electroBolts = [];
let clouds = [];

// Spawn timers
let spawnTimer = 0;
let goblinTimer = 0;
let boltTimer = 0;

// Game objects
let venom = new Venom();
const inputs = { jump: false, duck: false, jumpPressed: false };

// Near miss tracking
let lastNearMissTime = 0;
let nearMissCombo = 0;

// ============================================
// INITIALIZATION
// ============================================
loadSettings();
checkGDPRConsent();

if (canSaveScore()) {
    highScore = localStorage.getItem('symbioteScore') || 0;
}

// ============================================
// RESIZE HANDLING
// ============================================
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const MIN_LOGICAL_WIDTH = 600;
    const widthScale = canvas.width / MIN_LOGICAL_WIDTH;
    const heightScale = canvas.height / GAME_HEIGHT;
    scaleRatio = Math.min(widthScale, heightScale);
    logicalWidth = canvas.width / scaleRatio;

    // Invalidate render caches on resize
    renderCache.invalidate(canvas.width, canvas.height, scaleRatio);
    gradientCache.invalidate(canvas.width, canvas.height);
    gradientCache.buildCommonGradients(ctx, canvas);

    if (window.innerWidth < 768 && mobileHint) {
        mobileHint.style.display = 'block';
    }
}

window.addEventListener('resize', resize);
resize();

// ============================================
// INPUT HANDLING
// ============================================
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

// Touch handling with swipe detection
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    touchStartY = e.touches[0].clientY;
    if (!isPlaying && !isGameOver) startGame();
    else if (isPlaying && !inputs.jump) {
        inputs.jump = true;
        inputs.jumpPressed = true;
    }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 30) inputs.duck = true;
}, { passive: false });

canvas.addEventListener('touchend', e => {
    e.preventDefault();
    inputs.jump = false;
    inputs.duck = false;
}, { passive: false });

canvas.addEventListener('click', () => { if (!isPlaying && !isGameOver) startGame(); });
restartBtn.addEventListener('click', resetGame);

// ============================================
// SETTINGS UI
// ============================================
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const animationStyleSelect = document.getElementById('animation-style');
const qualitySelect = document.getElementById('quality-setting');
const soundToggle = document.getElementById('sound-toggle');
const fpsCounter = document.getElementById('fps-counter');

// Initialize settings UI from saved values
if (animationStyleSelect) animationStyleSelect.value = gameSettings.animationStyle;
if (qualitySelect) qualitySelect.value = gameSettings.quality;
if (soundToggle) soundToggle.checked = gameSettings.soundEnabled;

// Settings button toggle
if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('open');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            settingsPanel.classList.remove('open');
        }
    });
}

// Animation style change
if (animationStyleSelect) {
    animationStyleSelect.addEventListener('change', (e) => {
        gameSettings.animationStyle = e.target.value;
        saveSettings();
    });
}

// Quality change
if (qualitySelect) {
    qualitySelect.addEventListener('change', (e) => {
        gameSettings.quality = e.target.value;
        renderCache.setQuality(e.target.value);
        saveSettings();
    });
}

// Sound toggle
if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
        gameSettings.soundEnabled = e.target.checked;
        saveSettings();
    });
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================
function startGame() {
    isPlaying = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    deltaTime.reset();

    for (let i = 0; i < 5; i++) buildings.push(new Building(i * 120, logicalWidth, gameSpeed));
    for (let i = 0; i < 3; i++) clouds.push(new StormCloud(i * 200 + Math.random() * 100, logicalWidth, gameSpeed));

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    isGameOver = false;
    isPlaying = true;
    score = 0;
    gameSpeed = 5;
    frame = 0;
    animationFrame = 0;
    glitchTimer = 0;
    glitchActive = false;
    nearMissCombo = 0;

    // Clear entity arrays
    obstacles = [];
    pumpkinBombs = [];
    buildings = [];
    electroBolts = [];
    clouds = [];
    goblin = null;
    spawnTimer = goblinTimer = boltTimer = 0;

    // Clear pools
    inkSplatterPool.clear();
    speedLinePool.clear();
    afterImagePool.clear();
    comicTextPool.clear();
    explosionPool.clear();
    scorePopupPool.clear();
    timerManager.clear();
    screenShake.reset();

    venom = new Venom();
    deltaTime.reset();

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

// ============================================
// MAIN GAME LOOP
// ============================================
function gameLoop(timestamp) {
    if (!isPlaying) return;

    const dt = deltaTime.update(timestamp);
    const dtMult = deltaTime.getMultiplier();
    const quality = getCurrentQuality();
    const frameSkip = getFrameSkip();

    // Update systems
    timerManager.update(dt);
    screenShake.update(dt);

    // Glitch effect timing (frame-based, not setTimeout)
    glitchTimer += dtMult;
    if (glitchTimer > 120 && Math.random() < 0.02) {
        glitchActive = true;
        glitchEndTime = timestamp + 50 + Math.random() * 100;
        glitchTimer = 0;
    }
    if (glitchActive && timestamp > glitchEndTime) {
        glitchActive = false;
    }

    // Animation frame counter for frame-skip effect
    animationFrame++;
    const shouldAnimate = animationFrame % frameSkip === 0;

    // ============================================
    // UPDATE PHASE
    // ============================================

    // Update player
    venom.update(inputs, isPlaying, dtMult, shouldAnimate, {
        inkSplatterPool, speedLinePool, afterImagePool, comicTextPool, screenShake
    }, gameSpeed, frame);

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(dtMult);
        if (obstacles[i].markedForDeletion) {
            obstacles.splice(i, 1);
        }
    }

    // Update electro bolts
    for (let i = electroBolts.length - 1; i >= 0; i--) {
        electroBolts[i].update(dtMult);
        if (electroBolts[i].markedForDeletion) {
            electroBolts.splice(i, 1);
        }
    }

    // Update pumpkin bombs
    for (let i = pumpkinBombs.length - 1; i >= 0; i--) {
        if (pumpkinBombs[i].update(dtMult)) {
            pumpkinBombs.splice(i, 1);
        }
    }

    // Update clouds
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].update(dtMult);
        if (clouds[i].markedForDeletion) {
            clouds.splice(i, 1);
        }
    }

    // Update buildings
    for (let i = buildings.length - 1; i >= 0; i--) {
        if (buildings[i].update(dtMult)) {
            buildings.splice(i, 1);
        }
    }

    // Update goblin
    if (goblin) {
        if (goblin.update(venom.x, pumpkinBombs, comicTextPool, dtMult)) {
            goblin = null;
        }
    }

    // Update object pools
    inkSplatterPool.update(dtMult);
    speedLinePool.update(dtMult);
    afterImagePool.update(dtMult);
    comicTextPool.update(dtMult);
    explosionPool.update(dtMult);
    scorePopupPool.update(dtMult);

    // ============================================
    // SPAWNING
    // ============================================

    spawnTimer += dtMult;
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

    boltTimer += dtMult;
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

    goblinTimer += dtMult;
    if (goblinTimer > 400 && !goblin && score > 150) {
        goblin = new GreenGoblin(logicalWidth, gameSpeed);
        goblinTimer = 0;
    }

    if (clouds.length < 4 && Math.random() < 0.01) {
        clouds.push(new StormCloud(undefined, logicalWidth, gameSpeed));
    }
    if (buildings.length < 6 && Math.random() < 0.02) {
        buildings.push(new Building(undefined, logicalWidth, gameSpeed));
    }

    // ============================================
    // RENDER PHASE
    // ============================================

    // Clear with gradient sky
    const skyGrad = gradientCache.getSky(ctx, canvas.height);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake
    ctx.save();
    screenShake.apply(ctx);

    // Clouds (background layer)
    clouds.forEach(c => c.draw(ctx, scaleRatio));

    // Buildings
    buildings.forEach(b => b.draw(ctx, scaleRatio));

    // Dynamic lighting (if enabled)
    if (quality.dynamicLighting) {
        drawDynamicLighting(ctx, canvas, scaleRatio, {
            venomX: venom.x + venom.w / 2,
            venomY: venom.y + venom.h / 2,
            gameSpeed,
            hasGoblin: goblin !== null,
            lightningActive: electroBolts.some(b => b.life > 30)
        });
    }

    // Ground
    ctx.fillStyle = SPIDERVERSE.bgNear;
    ctx.fillRect(0, (GAME_HEIGHT - 50) * scaleRatio, canvas.width, canvas.height);
    ctx.fillStyle = SPIDERVERSE.bgSurface;
    ctx.fillRect(0, (GAME_HEIGHT - 52) * scaleRatio, canvas.width, 4 * scaleRatio);

    // Road lines
    ctx.fillStyle = SPIDERVERSE.yellow;
    const lineOffset = (frame * gameSpeed * 2) % 80;
    for (let x = -lineOffset; x < canvas.width; x += 80) {
        ctx.fillRect(x, (GAME_HEIGHT - 35) * scaleRatio, 40 * scaleRatio, 3 * scaleRatio);
    }

    // After images (behind character)
    if (quality.afterImages) {
        afterImagePool.draw(ctx, scaleRatio);
    }

    // Speed lines
    if (quality.speedLines) {
        speedLinePool.draw(ctx, scaleRatio);
    }

    // Draw entities
    obstacles.forEach(o => o.draw(ctx, scaleRatio));
    electroBolts.forEach(b => b.draw(ctx, scaleRatio));
    pumpkinBombs.forEach(b => b.draw(ctx, scaleRatio));
    if (goblin) goblin.draw(ctx, scaleRatio);
    venom.draw(ctx, scaleRatio, quality.glowEffects);

    // Draw effects
    if (quality.inkSplatters) {
        inkSplatterPool.draw(ctx, scaleRatio);
    }
    explosionPool.draw(ctx, scaleRatio);
    comicTextPool.draw(ctx, scaleRatio);
    scorePopupPool.draw(ctx, scaleRatio);

    // Restore before post-processing
    ctx.restore();

    // ============================================
    // POST-PROCESSING EFFECTS
    // ============================================

    if (quality.actionLines) {
        drawActionLines(ctx, canvas, scaleRatio, isPlaying, renderCache);
    }
    if (quality.halftone) {
        drawHalftone(ctx, canvas, scaleRatio, renderCache);
    }
    if (quality.colorMisregistration) {
        drawColorMisregistration(ctx, canvas, scaleRatio);
    }
    if (quality.chromaticAberration) {
        drawChromaticAberration(ctx, canvas, scaleRatio, glitchActive);
    }
    drawSpiderVerseOverlay(ctx, canvas, scaleRatio, frame, renderCache);
    drawGlitchEffect(ctx, canvas, scaleRatio, glitchActive);
    drawPanelBorders(ctx, canvas, scaleRatio);

    // ============================================
    // COLLISION DETECTION
    // ============================================
    const bounds = venom.getBounds();

    for (let o of obstacles) {
        // Near miss detection
        checkNearMiss(bounds, o, timestamp);

        if (checkCollision(bounds, o.getBounds())) {
            const reasons = {
                TaxiCab: 'Hit by taxi!',
                FireHydrant: 'Tripped on hydrant!',
                Dumpster: 'Crashed into dumpster!',
                ConstructionBarrier: 'Hit barrier!'
            };
            triggerCollisionEffects(o);
            gameOver(reasons[o.constructor.name] || 'Crashed!');
            return;
        }
    }

    for (let b of electroBolts) {
        if (checkCollision(bounds, b.getBounds())) {
            const zapText = randomPhrase(ONOMATOPOEIA.electric);
            comicTextPool.acquire(zapText, b.x + 20, b.y + b.h - 30);
            triggerExplosion(venom.x + 25, venom.y + 35, SPIDERVERSE.electricBlue);
            screenShake.shake(SHAKE_CONFIG.explosion.intensity, SHAKE_CONFIG.explosion.duration);
            gameOver('Electrocuted!');
            return;
        }
    }

    for (let b of pumpkinBombs) {
        if (checkCollision(bounds, b.getBounds())) {
            const boomText = randomPhrase(ONOMATOPOEIA.bomb);
            comicTextPool.acquire(boomText, b.x, b.y);
            triggerExplosion(b.x, b.y, SPIDERVERSE.orangeHot);
            triggerExplosion(venom.x + 25, venom.y + 35, SPIDERVERSE.pink);
            screenShake.shake(SHAKE_CONFIG.explosion.intensity, SHAKE_CONFIG.explosion.duration);
            gameOver('Pumpkin bomb!');
            return;
        }
    }

    if (goblin && checkCollision(bounds, goblin.getBounds())) {
        comicTextPool.acquire('WHAM!', goblin.x + 35, goblin.y + 30);
        triggerExplosion(goblin.x + 35, goblin.y + 30, SPIDERVERSE.purple);
        screenShake.shake(SHAKE_CONFIG.collision.intensity, SHAKE_CONFIG.collision.duration);
        gameOver('Hit by Goblin!');
        return;
    }

    // ============================================
    // SCORE UPDATE
    // ============================================
    score += 0.1 * dtMult;
    if (Math.floor(score) % 100 === 0 && Math.floor(score) !== Math.floor(score - 0.1 * dtMult)) {
        playSound('score');
        // Score milestone popup
        scorePopupPool.acquire(venom.x + 50, venom.y - 20, 100, true);
    }
    updateScore();

    // Speed up
    if (gameSpeed < 15) gameSpeed += 0.001 * dtMult;

    frame++;
    requestAnimationFrame(gameLoop);
}

// ============================================
// COLLISION EFFECTS
// ============================================
function triggerCollisionEffects(obstacle) {
    const hitText = randomPhrase(ONOMATOPOEIA.hit);
    comicTextPool.acquire(hitText, venom.x + 30, venom.y);
    triggerExplosion(venom.x + 25, venom.y + 35, SPIDERVERSE.pink);
    triggerExplosion(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, SPIDERVERSE.cyan);
    screenShake.shake(SHAKE_CONFIG.collision.intensity, SHAKE_CONFIG.collision.duration);
}

function triggerExplosion(x, y, color) {
    const particle = explosionPool.acquire(x, y, color, 15);
}

// ============================================
// NEAR MISS DETECTION
// ============================================
function checkNearMiss(venomBounds, obstacle, timestamp) {
    const oBounds = obstacle.getBounds();

    // Check if obstacle just passed player (within threshold)
    const justPassed = oBounds.x + oBounds.w < venomBounds.x &&
                       oBounds.x + oBounds.w > venomBounds.x - NEAR_MISS_THRESHOLD * 2;

    if (justPassed && !obstacle._nearMissTriggered) {
        // Check vertical proximity
        const verticalOverlap = venomBounds.y < oBounds.y + oBounds.h + NEAR_MISS_THRESHOLD &&
                               venomBounds.y + venomBounds.h > oBounds.y - NEAR_MISS_THRESHOLD;

        if (verticalOverlap) {
            obstacle._nearMissTriggered = true;

            // Cooldown check
            if (timestamp - lastNearMissTime > 500) {
                lastNearMissTime = timestamp;
                nearMissCombo++;

                // Visual feedback
                const nearMissText = randomPhrase(ONOMATOPOEIA.nearMiss);
                comicTextPool.acquire(nearMissText, venom.x + 60, venom.y - 30, SPIDERVERSE.yellow);
                screenShake.shake(SHAKE_CONFIG.nearMiss.intensity, SHAKE_CONFIG.nearMiss.duration);

                // Bonus score
                const bonus = 10 * nearMissCombo;
                score += bonus;
                scorePopupPool.acquire(venom.x + 40, venom.y - 50, bonus, false);
            }
        }
    }

    // Reset combo if too much time passed
    if (timestamp - lastNearMissTime > 2000) {
        nearMissCombo = 0;
    }
}

// ============================================
// GAME OVER
// ============================================
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

// ============================================
// INITIALIZATION
// ============================================
hiScoreEl.innerText = `HI ${Math.floor(highScore).toString().padStart(5, '0')}`;
drawStartScreen(ctx, canvas, scaleRatio, venom, renderCache);
