// Spider-Verse visual effects
// Optimized with cached rendering for 60fps performance

import { SPIDERVERSE, GAME_HEIGHT, getCurrentQuality } from './config.js';
import { StormCloud, Building } from './obstacles.js';
import { gradientCache } from './core/gradient-cache.js';

// ============================================
// HALFTONE PATTERN (Ben-Day dots)
// Now uses cached offscreen canvas
// ============================================
export function drawHalftone(ctx, canvas, scaleRatio, renderCache) {
    const quality = getCurrentQuality();
    if (!quality.halftone) return;

    renderCache.drawHalftone(ctx, canvas, scaleRatio);
}

// ============================================
// CMYK COLOR MISREGISTRATION
// ============================================
export function drawColorMisregistration(ctx, canvas, scaleRatio) {
    const quality = getCurrentQuality();
    if (!quality.colorMisregistration) return;

    const offset = 2 * scaleRatio;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.15;

    // Cyan offset left
    ctx.fillStyle = 'cyan';
    ctx.fillRect(-offset, -offset / 2, canvas.width, canvas.height);

    // Magenta offset right
    ctx.fillStyle = 'magenta';
    ctx.fillRect(offset, offset / 2, canvas.width, canvas.height);

    ctx.restore();
}

// ============================================
// CHROMATIC ABERRATION (color fringing)
// Enhanced with dynamic intensity
// ============================================
export function drawChromaticAberration(ctx, canvas, scaleRatio, glitchActive) {
    const quality = getCurrentQuality();
    if (!quality.chromaticAberration && !glitchActive) return;

    const offset = (glitchActive ? 6 : 2) * scaleRatio;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = glitchActive ? 0.2 : 0.08;

    // Red channel offset
    ctx.fillStyle = '#ff0040';
    ctx.fillRect(-offset, 0, canvas.width, canvas.height);

    // Cyan channel offset
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(offset, 0, canvas.width, canvas.height);

    ctx.restore();
}

// ============================================
// COMIC PANEL BORDERS
// Enhanced with neon glow effect
// ============================================
export function drawPanelBorders(ctx, canvas, scaleRatio) {
    const borderWidth = 8 * scaleRatio;
    const quality = getCurrentQuality();
    ctx.save();

    // Thick black border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);

    // Inner white line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2 * scaleRatio;
    ctx.strokeRect(borderWidth + 2, borderWidth + 2, canvas.width - (borderWidth + 4) * 2 + borderWidth, canvas.height - (borderWidth + 4) * 2 + borderWidth);

    // Corner accents with optional glow
    const cornerSize = 20 * scaleRatio;

    if (quality.glowEffects) {
        ctx.shadowBlur = 15 * scaleRatio;
        ctx.shadowColor = SPIDERVERSE.pink;
    }

    ctx.fillStyle = SPIDERVERSE.pink;
    // Top left
    ctx.fillRect(0, 0, cornerSize, borderWidth);
    ctx.fillRect(0, 0, borderWidth, cornerSize);
    // Top right
    ctx.fillRect(canvas.width - cornerSize, 0, cornerSize, borderWidth);
    ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, cornerSize);

    if (quality.glowEffects) {
        ctx.shadowColor = SPIDERVERSE.cyan;
    }

    ctx.fillStyle = SPIDERVERSE.cyan;
    // Bottom left
    ctx.fillRect(0, canvas.height - borderWidth, cornerSize, borderWidth);
    ctx.fillRect(0, canvas.height - cornerSize, borderWidth, cornerSize);
    // Bottom right
    ctx.fillRect(canvas.width - cornerSize, canvas.height - borderWidth, cornerSize, borderWidth);
    ctx.fillRect(canvas.width - borderWidth, canvas.height - cornerSize, borderWidth, cornerSize);

    ctx.restore();
}

// ============================================
// ACTION LINES (Speed lines from center)
// Now uses cached offscreen canvas
// ============================================
export function drawActionLines(ctx, canvas, scaleRatio, isPlaying, renderCache) {
    const quality = getCurrentQuality();
    if (!quality.actionLines) return;

    renderCache.drawActionLines(ctx, canvas, scaleRatio, isPlaying);
}

// ============================================
// SPIDER-VERSE OVERLAY
// Uses cached gradients for performance
// ============================================
export function drawSpiderVerseOverlay(ctx, canvas, scaleRatio, frame, renderCache) {
    const quality = getCurrentQuality();
    const width = canvas.width;
    const height = canvas.height;

    // Invalidate gradient cache on resize
    gradientCache.invalidate(width, height);

    // Vignette (using cached gradient)
    const vignette = gradientCache.getVignette(ctx, width, height);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Scan lines (using cached canvas)
    if (quality.scanlines) {
        renderCache.drawScanlines(ctx, canvas, scaleRatio);
    }

    // Color bleed edges (using cached gradients)
    ctx.save();
    ctx.globalAlpha = 0.2; // Slightly reduced for cleaner look

    const pinkEdge = gradientCache.getLinear(ctx, 'pinkEdge', 0, 0, width * 0.15, 0, [
        [0, 'rgba(255, 0, 255, 0.25)'],
        [1, 'transparent']
    ]);
    ctx.fillStyle = pinkEdge;
    ctx.fillRect(0, 0, width * 0.15, height);

    const cyanEdge = gradientCache.getLinear(ctx, 'cyanEdge', width, 0, width * 0.85, 0, [
        [0, 'rgba(0, 255, 255, 0.25)'],
        [1, 'transparent']
    ]);
    ctx.fillStyle = cyanEdge;
    ctx.fillRect(width * 0.85, 0, width * 0.15, height);
    ctx.restore();

    // Random ink drips at top (only on medium+ quality)
    if (quality.inkSplatters) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#000';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + 50) * scaleRatio;
            const h = (20 + Math.sin(frame * 0.01 + i) * 10) * scaleRatio;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.quadraticCurveTo(x + 5 * scaleRatio, h * 0.7, x + 3 * scaleRatio, h);
            ctx.quadraticCurveTo(x - 5 * scaleRatio, h * 0.7, x, 0);
            ctx.fill();
        }
        ctx.restore();
    }
}

// ============================================
// GLITCH/DISTORTION EFFECT
// ============================================
export function drawGlitchEffect(ctx, canvas, scaleRatio, glitchActive) {
    if (!glitchActive) return;

    ctx.save();
    // Slice and offset random horizontal strips
    const sliceCount = 5;
    for (let i = 0; i < sliceCount; i++) {
        const y = Math.random() * canvas.height;
        const h = 5 + Math.random() * 20;
        const offset = (Math.random() - 0.5) * 30 * scaleRatio;

        ctx.drawImage(canvas, 0, y, canvas.width, h, offset, y, canvas.width, h);
    }
    ctx.restore();
}

// ============================================
// NEON GLOW EFFECT (NEW)
// Adds bloom around bright elements
// ============================================
export function drawNeonGlow(ctx, canvas, scaleRatio, elements) {
    const quality = getCurrentQuality();
    if (!quality.glowEffects) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const el of elements) {
        const { x, y, radius, color, intensity = 1 } = el;

        // Create multi-layer glow
        const glowRadius = radius * 3 * scaleRatio;
        const gradient = ctx.createRadialGradient(
            x * scaleRatio, y * scaleRatio, 0,
            x * scaleRatio, y * scaleRatio, glowRadius
        );

        // Parse color and create alpha versions
        const alphaOuter = 0.1 * intensity;
        const alphaInner = 0.4 * intensity;

        gradient.addColorStop(0, color);
        gradient.addColorStop(0.2, colorWithAlpha(color, alphaInner));
        gradient.addColorStop(0.5, colorWithAlpha(color, alphaOuter));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x * scaleRatio, y * scaleRatio, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ============================================
// DYNAMIC LIGHTING (NEW)
// Atmospheric lighting based on game state
// ============================================
export function drawDynamicLighting(ctx, canvas, scaleRatio, gameState) {
    const quality = getCurrentQuality();
    if (!quality.dynamicLighting) return;

    const { venomX, venomY, gameSpeed, hasGoblin, lightningActive } = gameState;
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();

    // Player spotlight (subtle)
    ctx.globalCompositeOperation = 'soft-light';
    const spotlightGradient = ctx.createRadialGradient(
        venomX * scaleRatio, venomY * scaleRatio, 0,
        venomX * scaleRatio, venomY * scaleRatio, 150 * scaleRatio
    );
    spotlightGradient.addColorStop(0, 'rgba(255, 0, 255, 0.15)');
    spotlightGradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.05)');
    spotlightGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = spotlightGradient;
    ctx.fillRect(0, 0, width, height);

    // Speed-based color intensity
    if (gameSpeed > 6) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = (gameSpeed - 6) * 0.02; // Subtle increase with speed
        ctx.fillStyle = SPIDERVERSE.pink;
        ctx.fillRect(0, 0, width, height);
    }

    // Goblin warning glow
    if (hasGoblin) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = SPIDERVERSE.orange;
        ctx.fillRect(0, 0, width, height);
    }

    // Lightning flash
    if (lightningActive) {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = SPIDERVERSE.electricBlue;
        ctx.fillRect(0, 0, width, height);
    }

    // Street-level glow (using cached gradient)
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.5;
    const streetGlow = gradientCache.getLinear(ctx, 'streetGlow', 0, height * 0.7, 0, height, [
        [0, 'transparent'],
        [1, 'rgba(255, 20, 147, 0.08)']
    ]);
    ctx.fillStyle = streetGlow;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    ctx.restore();
}

// ============================================
// START SCREEN
// Uses cached gradients and effects
// ============================================
export function drawStartScreen(ctx, canvas, scaleRatio, venom, renderCache) {
    const width = canvas.width;
    const height = canvas.height;

    // Invalidate caches on resize
    gradientCache.invalidate(width, height);
    renderCache.invalidate(width, height, scaleRatio);

    // Sky gradient (cached)
    const skyGrad = gradientCache.getLinear(ctx, 'startSky', 0, 0, 0, height, [
        [0, SPIDERVERSE.bgDeep],
        [0.3, '#0d0d2b'],
        [1, SPIDERVERSE.bgNear]
    ]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Initial clouds
    for (let i = 0; i < 3; i++) {
        const cloud = new StormCloud(i * 200 + 50, 600, 5);
        cloud.draw(ctx, scaleRatio);
    }

    for (let i = 0; i < 5; i++) {
        const building = new Building(i * 120, 600, 5);
        building.draw(ctx, scaleRatio);
    }

    // Ground
    ctx.fillStyle = SPIDERVERSE.bgNear;
    ctx.fillRect(0, (GAME_HEIGHT - 50) * scaleRatio, width, height);
    ctx.fillStyle = SPIDERVERSE.bgSurface;
    ctx.fillRect(0, (GAME_HEIGHT - 52) * scaleRatio, width, 4 * scaleRatio);

    // Road lines
    ctx.fillStyle = SPIDERVERSE.yellow;
    for (let x = 0; x < width; x += 80) {
        ctx.fillRect(x, (GAME_HEIGHT - 35) * scaleRatio, 40 * scaleRatio, 3 * scaleRatio);
    }

    venom.draw(ctx, scaleRatio);

    // All Spider-Verse effects (using caches)
    drawHalftone(ctx, canvas, scaleRatio, renderCache);
    drawColorMisregistration(ctx, canvas, scaleRatio);
    drawChromaticAberration(ctx, canvas, scaleRatio, false);
    drawSpiderVerseOverlay(ctx, canvas, scaleRatio, 0, renderCache);
    drawPanelBorders(ctx, canvas, scaleRatio);

    // Title text in comic style with glow
    ctx.save();

    const quality = getCurrentQuality();
    if (quality.glowEffects) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = SPIDERVERSE.pink;
    }

    ctx.font = `bold ${60 * scaleRatio}px Bangers`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8 * scaleRatio;
    ctx.strokeText('SYMBIOTE RUSH', width / 2, height * 0.25);
    ctx.fillStyle = SPIDERVERSE.pink;
    ctx.fillText('SYMBIOTE RUSH', width / 2, height * 0.25);

    // Subtitle with cyan glow
    if (quality.glowEffects) {
        ctx.shadowColor = SPIDERVERSE.cyan;
    }

    ctx.font = `bold ${24 * scaleRatio}px Bangers`;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4 * scaleRatio;
    ctx.strokeText('SPIDER-VERSE EDITION', width / 2, height * 0.32);
    ctx.fillStyle = SPIDERVERSE.cyan;
    ctx.fillText('SPIDER-VERSE EDITION', width / 2, height * 0.32);

    // Kaiross Branding
    ctx.shadowBlur = 0;
    ctx.font = `${16 * scaleRatio}px "Press Start 2P"`;
    ctx.fillStyle = SPIDERVERSE.white;
    ctx.globalAlpha = 0.8;
    ctx.fillText('KAIROSS.IN', width / 2, height * 0.9);
    ctx.globalAlpha = 1.0;

    ctx.restore();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Convert hex color to rgba with alpha
function colorWithAlpha(hexColor, alpha) {
    // Handle rgb/rgba colors
    if (hexColor.startsWith('rgb')) {
        const match = hexColor.match(/[\d.]+/g);
        if (match) {
            return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
        }
    }

    // Handle hex colors
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Draw speed lines behind player (for extra effect)
export function drawSpeedLines(ctx, scaleRatio, x, y, speed) {
    const quality = getCurrentQuality();
    if (!quality.speedLines || speed < 5) return;

    ctx.save();
    ctx.globalAlpha = Math.min((speed - 5) * 0.1, 0.4);
    ctx.strokeStyle = SPIDERVERSE.white;
    ctx.lineWidth = 2 * scaleRatio;

    const lineCount = Math.floor(speed);
    for (let i = 0; i < lineCount; i++) {
        const offsetY = (Math.random() - 0.5) * 60 * scaleRatio;
        const lineLength = (30 + Math.random() * 50) * scaleRatio;

        ctx.beginPath();
        ctx.moveTo((x - 30) * scaleRatio, (y + offsetY) * scaleRatio);
        ctx.lineTo((x - 30 - lineLength) * scaleRatio, (y + offsetY) * scaleRatio);
        ctx.stroke();
    }

    ctx.restore();
}
