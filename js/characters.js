// Character classes - Venom, Green Goblin, and Pumpkin Bomb
// Enhanced with squash/stretch, delta-time, and frame-skip support

import {
    GRAVITY, JUMP_STRENGTH, DOUBLE_JUMP_STRENGTH, GAME_HEIGHT,
    VENOM_PHRASES, GOBLIN_PHRASES, SPIDERVERSE, SHAKE_CONFIG, getCurrentQuality
} from './config.js';
import { playSound } from './audio.js';
import { randomPhrase } from './utils.js';

export class Venom {
    constructor() {
        this.x = 80;
        this.y = GAME_HEIGHT - 100;
        this.w = 50;
        this.h = 70;
        this.baseH = 70;
        this.vy = 0;
        this.isJumping = false;
        this.canDoubleJump = true;
        this.isDucking = false;
        this.runFrame = 0;
        this.animTimer = 0;
        this.tongueWave = 0;

        // Squash and stretch
        this.scaleX = 1;
        this.scaleY = 1;
        this.targetScaleX = 1;
        this.targetScaleY = 1;

        // Landing state
        this.justLanded = false;
        this.landingTimer = 0;

        // Frame skip animation state
        this.lastDrawnFrame = 0;
    }

    update(inputs, isPlaying, dtMult, shouldAnimate, effects, gameSpeed, frame) {
        const groundY = GAME_HEIGHT - 50;
        const { inkSplatterPool, speedLinePool, afterImagePool, comicTextPool, screenShake } = effects;

        // Jump handling
        if (inputs.jump && inputs.jumpPressed) {
            if (!this.isJumping) {
                this.vy = JUMP_STRENGTH;
                this.isJumping = true;
                this.canDoubleJump = true;
                playSound('jump');

                // Squash on jump start
                this.targetScaleX = 0.8;
                this.targetScaleY = 1.3;

                // Comic text from pool
                const text = comicTextPool.acquire(randomPhrase(VENOM_PHRASES), this.x + 60, this.y);
            } else if (this.canDoubleJump) {
                this.vy = DOUBLE_JUMP_STRENGTH;
                this.canDoubleJump = false;
                playSound('doubleJump');

                // Extra stretch on double jump
                this.targetScaleX = 0.7;
                this.targetScaleY = 1.4;

                const text = comicTextPool.acquire('DOUBLE!', this.x + 60, this.y, SPIDERVERSE.cyan);
            }
            inputs.jumpPressed = false;
        }

        // Ducking
        this.isDucking = inputs.duck && !this.isJumping;
        this.h = this.isDucking ? 40 : this.baseH;

        // Fast fall
        if (this.isJumping && inputs.duck) {
            this.vy += GRAVITY * 2 * dtMult;
        }

        // Physics (delta-time scaled)
        this.y += this.vy * dtMult;
        this.vy += GRAVITY * dtMult;

        // Ground collision
        const wasJumping = this.isJumping;
        if (this.y + this.h >= groundY) {
            this.y = groundY - this.h;
            this.vy = 0;
            this.isJumping = false;
            this.canDoubleJump = true;

            // Landing effects
            if (wasJumping && isPlaying) {
                this.justLanded = true;
                this.landingTimer = 10;

                // Squash on landing
                this.targetScaleX = 1.3;
                this.targetScaleY = 0.7;

                // Ink splatter from pool
                inkSplatterPool.acquire(this.x + 25, groundY, SPIDERVERSE.electricBlue);

                // Screen shake on landing
                screenShake.shake(SHAKE_CONFIG.landing.intensity, SHAKE_CONFIG.landing.duration);
            }
        }

        // Squash/stretch interpolation
        const lerpSpeed = 0.2 * dtMult;
        this.scaleX += (this.targetScaleX - this.scaleX) * lerpSpeed;
        this.scaleY += (this.targetScaleY - this.scaleY) * lerpSpeed;

        // Return to normal scale
        this.targetScaleX += (1 - this.targetScaleX) * 0.1 * dtMult;
        this.targetScaleY += (1 - this.targetScaleY) * 0.1 * dtMult;

        // Landing timer
        if (this.landingTimer > 0) {
            this.landingTimer -= dtMult;
            if (this.landingTimer <= 0) {
                this.justLanded = false;
            }
        }

        // Animation (only on animation frames)
        if (shouldAnimate) {
            this.animTimer++;
            if (this.animTimer > 5) {
                this.runFrame = (this.runFrame + 1) % 4;
                this.animTimer = 0;
            }
            this.tongueWave += 0.15;
        }

        // Generate speed lines and afterimages (frame-skip aware)
        if (isPlaying && shouldAnimate) {
            const quality = getCurrentQuality();

            if (quality.speedLines && frame % 3 === 0) {
                speedLinePool.acquire(this.y + Math.random() * this.h, gameSpeed);
            }
            if (quality.afterImages && frame % 4 === 0) {
                afterImagePool.acquire(this.x - 10, this.y, this.w, this.h);
            }
        }
    }

    draw(ctx, scaleRatio) {
        ctx.save();

        // Apply squash/stretch centered at feet
        const centerX = this.x + this.w / 2;
        const bottomY = this.y + this.h;

        ctx.translate(centerX * scaleRatio, bottomY * scaleRatio);
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(-centerX * scaleRatio, -bottomY * scaleRatio);

        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        const quality = getCurrentQuality();

        // Comic book thick outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        const tw = Math.sin(this.tongueWave) * 5;

        if (this.isDucking) {
            this._drawDuckingPose(ctx, tw, quality);
        } else {
            this._drawStandingPose(ctx, tw, quality);
        }

        ctx.restore();
    }

    _drawDuckingPose(ctx, tw, quality) {
        // Body
        const bodyGrad = ctx.createLinearGradient(0, 10, 0, 40);
        bodyGrad.addColorStop(0, '#2a2a4e');
        bodyGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(35, 25, 40, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(60, 15, 18, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes (Glowing)
        if (quality.glowEffects) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(58, 10, 8, 5, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(68, 12, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    _drawStandingPose(ctx, tw, quality) {
        const legAnim = Math.sin(this.runFrame * Math.PI / 2) * 8;

        // Tendrils (background)
        ctx.strokeStyle = '#2a2a4e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(25, 30);
            ctx.quadraticCurveTo(
                -15 + Math.sin(this.tongueWave + i) * 12,
                20 + i * 12,
                -10 + Math.sin(this.tongueWave + i * 0.5) * 10,
                50 + i * 10
            );
            ctx.stroke();
        }

        // Legs
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        // Left leg
        ctx.beginPath();
        ctx.ellipse(18, 58 + (this.isJumping ? 0 : legAnim), 10, 16, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right leg
        ctx.beginPath();
        ctx.ellipse(35, 58 + (this.isJumping ? 0 : -legAnim), 10, 16, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Body - Muscular V-shape
        const bodyGrad = ctx.createRadialGradient(25, 30, 5, 25, 35, 35);
        bodyGrad.addColorStop(0, '#3a3a5e');
        bodyGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.quadraticCurveTo(25, 10, 40, 20);
        ctx.lineTo(35, 50);
        ctx.lineTo(15, 50);
        ctx.closePath();
        ctx.fill();

        // White Rim Light
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Spider symbol
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(25, 25);
        ctx.lineTo(20, 20);
        ctx.lineTo(30, 20);
        ctx.lineTo(25, 35);
        ctx.lineTo(18, 30);
        ctx.lineTo(32, 30);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#000000';
        const armSwing = this.isJumping ? 0 : Math.sin(this.runFrame * Math.PI / 2) * 0.3;
        ctx.beginPath();
        ctx.ellipse(5, 30, 8, 14, -0.5 - armSwing, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(45, 30, 8, 14, 0.5 + armSwing, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headGrad = ctx.createRadialGradient(30, 8, 2, 30, 8, 18);
        headGrad.addColorStop(0, '#1a1a2e');
        headGrad.addColorStop(1, '#000000');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(30, 8, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (glowing)
        if (quality.glowEffects) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
        }
        ctx.fillStyle = '#ffffff';
        // Left eye
        ctx.beginPath();
        ctx.moveTo(18, 2);
        ctx.quadraticCurveTo(10, 8, 18, 16);
        ctx.quadraticCurveTo(28, 12, 28, 6);
        ctx.quadraticCurveTo(24, 0, 18, 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.moveTo(32, 2);
        ctx.quadraticCurveTo(36, 0, 42, 4);
        ctx.quadraticCurveTo(50, 10, 42, 16);
        ctx.quadraticCurveTo(32, 12, 32, 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Mouth & Teeth
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.ellipse(38, 16, 12, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(28 + i * 3, 12);
            ctx.lineTo(29 + i * 3, 18 + (i % 2) * 3);
            ctx.lineTo(30 + i * 3, 12);
            ctx.fill();
        }

        // Tongue - Neon pink
        ctx.strokeStyle = SPIDERVERSE.pink;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(44, 16);
        ctx.quadraticCurveTo(55, 14 + tw, 70, 5 + tw);
        ctx.stroke();

        // Saliva drips
        if (Math.random() > 0.8) {
            ctx.fillStyle = SPIDERVERSE.cyan;
            ctx.beginPath();
            ctx.arc(70, 5 + tw, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getBounds() {
        return { x: this.x + 5, y: this.y + 5, w: this.w - 10, h: this.h - 10 };
    }

    // Reset for game restart
    reset() {
        this.x = 80;
        this.y = GAME_HEIGHT - 100;
        this.h = this.baseH;
        this.vy = 0;
        this.isJumping = false;
        this.canDoubleJump = true;
        this.isDucking = false;
        this.runFrame = 0;
        this.animTimer = 0;
        this.tongueWave = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.targetScaleX = 1;
        this.targetScaleY = 1;
        this.justLanded = false;
        this.landingTimer = 0;
    }
}

export class GreenGoblin {
    constructor(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = 80 + Math.random() * 60;
        this.w = 70;
        this.h = 60;
        this.speed = gameSpeed * 0.7;
        this.animFrame = 0;
        this.hasThrownBomb = false;
        this.flameAnim = 0;

        // For object pooling
        this._poolActive = false;
    }

    reset(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = 80 + Math.random() * 60;
        this.speed = gameSpeed * 0.7;
        this.animFrame = 0;
        this.hasThrownBomb = false;
        this.flameAnim = 0;
    }

    deactivate() {
        // Clean up if needed
    }

    update(venomX, pumpkinBombs, comicTextPool, dtMult = 1) {
        this.x -= this.speed * dtMult;
        this.animFrame += 0.1 * dtMult;
        this.flameAnim += 0.3 * dtMult;

        if (!this.hasThrownBomb && this.x < venomX + 100) {
            this.throwBomb(venomX, pumpkinBombs, comicTextPool);
            this.hasThrownBomb = true;
        }

        return this.x + this.w < -50;
    }

    throwBomb(targetX, pumpkinBombs, comicTextPool) {
        playSound('goblin');
        comicTextPool.acquire(randomPhrase(GOBLIN_PHRASES), this.x, this.y - 20);
        pumpkinBombs.push(new PumpkinBomb(this.x + 35, this.y + 50, targetX));
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        const quality = getCurrentQuality();

        // Glider
        const gliderGrad = ctx.createLinearGradient(0, 50, 70, 50);
        gliderGrad.addColorStop(0, SPIDERVERSE.purpleDeep);
        gliderGrad.addColorStop(0.5, SPIDERVERSE.purple);
        gliderGrad.addColorStop(1, SPIDERVERSE.purpleDeep);
        ctx.fillStyle = gliderGrad;
        ctx.beginPath();
        ctx.moveTo(5, 52);
        ctx.quadraticCurveTo(35, 48, 65, 52);
        ctx.quadraticCurveTo(35, 58, 5, 52);
        ctx.fill();

        // Flames with glow
        const flameSize = 8 + Math.sin(this.flameAnim) * 3;

        if (quality.glowEffects) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = SPIDERVERSE.orange;
        }

        const flameGrad = ctx.createRadialGradient(8, 55, 2, 8, 55, flameSize);
        flameGrad.addColorStop(0, '#fff');
        flameGrad.addColorStop(0.3, SPIDERVERSE.yellow);
        flameGrad.addColorStop(0.7, SPIDERVERSE.orange);
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(8, 55, flameSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(62, 55, flameSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Body
        const bodyGrad = ctx.createRadialGradient(35, 30, 5, 35, 30, 25);
        bodyGrad.addColorStop(0, SPIDERVERSE.symbioteGreen);
        bodyGrad.addColorStop(1, SPIDERVERSE.symbioteGreenDark);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(35, 30, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = SPIDERVERSE.symbioteGreenDark;
        ctx.beginPath();
        ctx.ellipse(15, 28, 6, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(55, 28, 6, 10, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Gloves
        ctx.fillStyle = SPIDERVERSE.purpleDeep;
        ctx.beginPath();
        ctx.arc(12, 36, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(58, 36, 5, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headGrad = ctx.createRadialGradient(35, 8, 3, 35, 8, 15);
        headGrad.addColorStop(0, SPIDERVERSE.symbioteGreen);
        headGrad.addColorStop(1, SPIDERVERSE.symbioteGreenDark);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(35, 8, 15, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = SPIDERVERSE.purpleDeep;
        ctx.beginPath();
        ctx.moveTo(22, 2);
        ctx.quadraticCurveTo(18, -8, 24, -6);
        ctx.quadraticCurveTo(26, 0, 22, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, 2);
        ctx.quadraticCurveTo(52, -8, 46, -6);
        ctx.quadraticCurveTo(44, 0, 48, 2);
        ctx.fill();

        // Eyes (glowing)
        if (quality.glowEffects) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = SPIDERVERSE.yellow;
        }
        ctx.fillStyle = SPIDERVERSE.yellow;
        ctx.beginPath();
        ctx.ellipse(28, 6, 5, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(42, 6, 5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(29, 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(41, 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Grin
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(35, 12, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    getBounds() {
        return { x: this.x + 10, y: this.y, w: this.w - 20, h: this.h };
    }
}

export class PumpkinBomb {
    constructor(x, y, targetX) {
        this.x = x;
        this.y = y;
        this.vx = (targetX - x) * 0.012;
        this.vy = -4;
        this.rotation = 0;
        this.glowAnim = 0;

        // For object pooling
        this._poolActive = false;
    }

    reset(x, y, targetX) {
        this.x = x;
        this.y = y;
        this.vx = (targetX - x) * 0.012;
        this.vy = -4;
        this.rotation = 0;
        this.glowAnim = 0;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.x += this.vx * dtMult;
        this.y += this.vy * dtMult;
        this.vy += 0.2 * dtMult;
        this.rotation += 0.1 * dtMult;
        this.glowAnim += 0.2 * dtMult;
        return this.y > GAME_HEIGHT + 50;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate((this.x) * scaleRatio, (this.y) * scaleRatio);
        ctx.rotate(this.rotation);
        ctx.scale(scaleRatio, scaleRatio);

        const quality = getCurrentQuality();

        // Glow
        const glow = 12 + Math.sin(this.glowAnim) * 4;

        if (quality.glowEffects) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = SPIDERVERSE.symbioteGreen;
        }

        const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, glow);
        glowGrad.addColorStop(0, 'rgba(0, 255, 102, 0.6)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Pumpkin
        const pumpGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 10);
        pumpGrad.addColorStop(0, SPIDERVERSE.orangeHot);
        pumpGrad.addColorStop(1, SPIDERVERSE.orangeDark);
        ctx.fillStyle = pumpGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = SPIDERVERSE.symbioteGreen;
        // Eyes
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(-3, -6);
        ctx.lineTo(-1, -3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, -3);
        ctx.lineTo(3, -6);
        ctx.lineTo(1, -3);
        ctx.fill();
        // Mouth
        ctx.beginPath();
        ctx.arc(0, 2, 5, 0, Math.PI);
        ctx.fill();

        // Stem
        ctx.fillStyle = SPIDERVERSE.symbioteGreenDark;
        ctx.fillRect(-2, -13, 4, 4);

        ctx.restore();
    }

    getBounds() {
        return { x: this.x - 8, y: this.y - 8, w: 16, h: 16 };
    }
}
