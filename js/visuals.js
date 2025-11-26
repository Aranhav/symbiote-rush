// Spider-Verse visual effects

import { SPIDERVERSE, GAME_HEIGHT } from './config.js';
import { StormCloud, Building } from './obstacles.js';

// Prominent halftone dot pattern (Ben-Day dots)
export function drawHalftone(ctx, canvas, scaleRatio) {
    ctx.save();

    // Magenta dots (shadows)
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = SPIDERVERSE.pink;
    const dotSize = 3 * scaleRatio;
    const spacing = 6 * scaleRatio;
    for (let y = 0; y < canvas.height; y += spacing) {
        for (let x = (Math.floor(y / spacing) % 2 === 0 ? 0 : spacing / 2); x < canvas.width; x += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Cyan dots (offset layer)
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = SPIDERVERSE.cyan;
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
        for (let x = (Math.floor(y / spacing) % 2 === 0 ? spacing / 4 : spacing * 3 / 4); x < canvas.width; x += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

// CMYK color misregistration effect
export function drawColorMisregistration(ctx, canvas, scaleRatio) {
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

// Chromatic aberration (color fringing)
export function drawChromaticAberration(ctx, canvas, scaleRatio, glitchActive) {
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

// Comic panel borders
export function drawPanelBorders(ctx, canvas, scaleRatio) {
    const borderWidth = 8 * scaleRatio;
    ctx.save();

    // Thick black border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);

    // Inner white line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2 * scaleRatio;
    ctx.strokeRect(borderWidth + 2, borderWidth + 2, canvas.width - (borderWidth + 4) * 2 + borderWidth, canvas.height - (borderWidth + 4) * 2 + borderWidth);

    // Corner accents
    const cornerSize = 20 * scaleRatio;
    ctx.fillStyle = SPIDERVERSE.pink;
    // Top left
    ctx.fillRect(0, 0, cornerSize, borderWidth);
    ctx.fillRect(0, 0, borderWidth, cornerSize);
    // Top right
    ctx.fillRect(canvas.width - cornerSize, 0, cornerSize, borderWidth);
    ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, cornerSize);
    // Bottom left
    ctx.fillRect(0, canvas.height - borderWidth, cornerSize, borderWidth);
    ctx.fillRect(0, canvas.height - cornerSize, borderWidth, cornerSize);
    // Bottom right
    ctx.fillRect(canvas.width - cornerSize, canvas.height - borderWidth, cornerSize, borderWidth);
    ctx.fillRect(canvas.width - borderWidth, canvas.height - cornerSize, borderWidth, cornerSize);

    ctx.restore();
}

// Action lines radiating from center
export function drawActionLines(ctx, canvas, scaleRatio, isPlaying) {
    if (!isPlaying) return;
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 * scaleRatio;

    const centerX = canvas.width * 0.3;
    const centerY = canvas.height * 0.5;

    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const innerRadius = 100 * scaleRatio;
        const outerRadius = Math.max(canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * innerRadius,
            centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * outerRadius,
            centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
    }
    ctx.restore();
}

export function drawSpiderVerseOverlay(ctx, canvas, scaleRatio, frame) {
    // Vignette (Reduced opacity)
    const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)'); // Reduced from 0.5
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scan lines (Reduced opacity)
    ctx.save();
    ctx.globalAlpha = 0.03; // Reduced from 0.08
    ctx.fillStyle = '#000';
    for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
    }
    ctx.restore();

    // Color bleed edges (more saturated)
    ctx.save();
    ctx.globalAlpha = 0.25;
    const edgeGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.15, 0);
    edgeGrad.addColorStop(0, SPIDERVERSE.pink);
    edgeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, canvas.width * 0.15, canvas.height);

    const edgeGrad2 = ctx.createLinearGradient(canvas.width, 0, canvas.width * 0.85, 0);
    edgeGrad2.addColorStop(0, SPIDERVERSE.cyan);
    edgeGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGrad2;
    ctx.fillRect(canvas.width * 0.85, 0, canvas.width * 0.15, canvas.height);
    ctx.restore();

    // Random ink drips at top
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

// Glitch/distortion effect
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

// Draw initial screen with full Spider-Verse style
export function drawStartScreen(ctx, canvas, scaleRatio, venom) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(0.3, '#0d0d2b');
    skyGrad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, (GAME_HEIGHT - 50) * scaleRatio, canvas.width, canvas.height);
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, (GAME_HEIGHT - 52) * scaleRatio, canvas.width, 4 * scaleRatio);

    // Road lines
    ctx.fillStyle = '#ffff00';
    for (let x = 0; x < canvas.width; x += 80) {
        ctx.fillRect(x, (GAME_HEIGHT - 35) * scaleRatio, 40 * scaleRatio, 3 * scaleRatio);
    }

    venom.draw(ctx, scaleRatio);

    // All Spider-Verse effects
    drawHalftone(ctx, canvas, scaleRatio);
    drawColorMisregistration(ctx, canvas, scaleRatio);
    drawChromaticAberration(ctx, canvas, scaleRatio, false);
    drawSpiderVerseOverlay(ctx, canvas, scaleRatio, 0);
    drawPanelBorders(ctx, canvas, scaleRatio);

    // Title text in comic style
    ctx.save();
    ctx.font = 'bold 60px Bangers';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8 * scaleRatio;
    ctx.strokeText('SYMBIOTE RUSH', canvas.width / 2, canvas.height * 0.25);
    ctx.fillStyle = SPIDERVERSE.pink;
    ctx.fillText('SYMBIOTE RUSH', canvas.width / 2, canvas.height * 0.25);

    // Subtitle
    ctx.font = 'bold 24px Bangers';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4 * scaleRatio;
    ctx.strokeText('SPIDER-VERSE EDITION', canvas.width / 2, canvas.height * 0.32);
    ctx.fillStyle = SPIDERVERSE.cyan;
    ctx.fillText('SPIDER-VERSE EDITION', canvas.width / 2, canvas.height * 0.32);

    // Kaiross Branding
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.fillText('KAIROSS.IN', canvas.width / 2, canvas.height * 0.9);
    ctx.globalAlpha = 1.0;

    ctx.restore();
}
