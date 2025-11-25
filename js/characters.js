// Character classes - Venom, Green Goblin, and Pumpkin Bomb

import { GRAVITY, JUMP_STRENGTH, DOUBLE_JUMP_STRENGTH, GAME_HEIGHT, VENOM_PHRASES, GOBLIN_PHRASES } from './config.js';
import { playSound } from './audio.js';
import { ComicText, InkSplatter, SpeedLine, AfterImage } from './effects.js';
import { randomPhrase } from './utils.js';

export class Venom {
    constructor() {
        this.x = 80;
        this.y = GAME_HEIGHT - 100;
        this.w = 50;
        this.h = 70;
        this.vy = 0;
        this.isJumping = false;
        this.canDoubleJump = true;
        this.isDucking = false;
        this.runFrame = 0;
        this.animTimer = 0;
        this.tongueWave = 0;
    }

    update(inputs, isPlaying, inkSplatters, speedLines, afterImages, comicTexts, gameSpeed, frame) {
        const groundY = GAME_HEIGHT - 50;

        if (inputs.jump && inputs.jumpPressed) {
            if (!this.isJumping) {
                this.vy = JUMP_STRENGTH;
                this.isJumping = true;
                this.canDoubleJump = true;
                playSound('jump');
                comicTexts.push(new ComicText(randomPhrase(VENOM_PHRASES), this.x + 60, this.y));
            } else if (this.canDoubleJump) {
                this.vy = DOUBLE_JUMP_STRENGTH;
                this.canDoubleJump = false;
                playSound('doubleJump');
            }
            inputs.jumpPressed = false;
        }

        this.isDucking = inputs.duck && !this.isJumping;
        this.h = this.isDucking ? 40 : 70;

        if (this.isJumping && inputs.duck) this.vy += GRAVITY * 2;

        this.y += this.vy;
        this.vy += GRAVITY;

        const wasJumping = this.isJumping;
        if (this.y + this.h >= groundY) {
            this.y = groundY - this.h;
            this.vy = 0;
            this.isJumping = false;
            this.canDoubleJump = true;
            // Land effect
            if (wasJumping && isPlaying) {
                inkSplatters.push(new InkSplatter(this.x + 25, groundY, '#00bfff'));
            }
        }

        this.animTimer++;
        if (this.animTimer > 5) {
            this.runFrame = (this.runFrame + 1) % 4;
            this.animTimer = 0;
        }
        this.tongueWave += 0.15;

        // Generate speed lines and afterimages
        if (isPlaying && frame % 3 === 0) {
            speedLines.push(new SpeedLine(this.y + Math.random() * this.h, gameSpeed));
        }
        if (isPlaying && frame % 4 === 0) {
            afterImages.push(new AfterImage(this.x - 10, this.y, this.w, this.h));
        }
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Comic book thick outline
        ctx.strokeStyle = '#ffffff'; // White outline for contrast against dark bg
        ctx.lineWidth = 2;

        const tw = Math.sin(this.tongueWave) * 5;

        if (this.isDucking) {
            // Ducking pose
            // Body
            const bodyGrad = ctx.createLinearGradient(0, 10, 0, 40);
            bodyGrad.addColorStop(0, '#2a2a4e'); // Lighter top for volume
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
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(58, 10, 8, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(68, 12, 6, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else {
            // Standing pose
            const legAnim = Math.sin(this.runFrame * Math.PI / 2) * 8;

            // Tendrils (background) - Dynamic and sharp
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

            // Legs - Muscular shape
            ctx.fillStyle = '#000000';
            ctx.strokeStyle = '#333'; // Subtle inner detail
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
            bodyGrad.addColorStop(0, '#3a3a5e'); // Highlight
            bodyGrad.addColorStop(1, '#000000');
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(10, 20); // Left shoulder
            ctx.quadraticCurveTo(25, 10, 40, 20); // Neck/Right shoulder
            ctx.lineTo(35, 50); // Right hip
            ctx.lineTo(15, 50); // Left hip
            ctx.closePath();
            ctx.fill();

            // White Rim Light for contrast
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Spider symbol - Distinct White
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(25, 25);
            ctx.lineTo(20, 20); // Top left leg
            ctx.lineTo(30, 20); // Top right leg
            ctx.lineTo(25, 35); // Bottom point
            ctx.lineTo(18, 30); // Bottom left leg
            ctx.lineTo(32, 30); // Bottom right leg
            ctx.fill();

            // Arms - Muscular
            ctx.fillStyle = '#000000';
            const armSwing = this.isJumping ? 0 : Math.sin(this.runFrame * Math.PI / 2) * 0.3;
            // Left arm
            ctx.beginPath();
            ctx.ellipse(5, 30, 8, 14, -0.5 - armSwing, 0, Math.PI * 2);
            ctx.fill();
            // Right arm
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

            // Eyes (large, angular, glowing)
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
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
                ctx.lineTo(29 + i * 3, 18 + (i % 2) * 3); // Sharper teeth
                ctx.lineTo(30 + i * 3, 12);
                ctx.fill();
            }

            // Tongue - Dynamic
            ctx.strokeStyle = '#ff00cc'; // Neon pink
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(44, 16);
            ctx.quadraticCurveTo(55, 14 + tw, 70, 5 + tw);
            ctx.stroke();

            // Saliva drips
            if (Math.random() > 0.8) {
                ctx.fillStyle = '#00ffff'; // Alien saliva
                ctx.beginPath();
                ctx.arc(70, 5 + tw, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x + 5, y: this.y + 5, w: this.w - 10, h: this.h - 10 };
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
    }

    update(venomX, pumpkinBombs, comicTexts) {
        this.x -= this.speed;
        this.animFrame += 0.1;
        this.flameAnim += 0.3;

        if (!this.hasThrownBomb && this.x < venomX + 100) {
            this.throwBomb(venomX, pumpkinBombs, comicTexts);
            this.hasThrownBomb = true;
        }

        return this.x + this.w < -50;
    }

    throwBomb(targetX, pumpkinBombs, comicTexts) {
        playSound('goblin');
        comicTexts.push(new ComicText(randomPhrase(GOBLIN_PHRASES), this.x, this.y - 20));
        pumpkinBombs.push(new PumpkinBomb(this.x + 35, this.y + 50, targetX));
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Glider
        const gliderGrad = ctx.createLinearGradient(0, 50, 70, 50);
        gliderGrad.addColorStop(0, '#4b0082');
        gliderGrad.addColorStop(0.5, '#6a0dad');
        gliderGrad.addColorStop(1, '#4b0082');
        ctx.fillStyle = gliderGrad;
        ctx.beginPath();
        ctx.moveTo(5, 52);
        ctx.quadraticCurveTo(35, 48, 65, 52);
        ctx.quadraticCurveTo(35, 58, 5, 52);
        ctx.fill();

        // Flames
        const flameSize = 8 + Math.sin(this.flameAnim) * 3;
        const flameGrad = ctx.createRadialGradient(8, 55, 2, 8, 55, flameSize);
        flameGrad.addColorStop(0, '#fff');
        flameGrad.addColorStop(0.3, '#ffff00');
        flameGrad.addColorStop(0.7, '#ff6600');
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(8, 55, flameSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(62, 55, flameSize, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const bodyGrad = ctx.createRadialGradient(35, 30, 5, 35, 30, 25);
        bodyGrad.addColorStop(0, '#32cd32');
        bodyGrad.addColorStop(1, '#228b22');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(35, 30, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.ellipse(15, 28, 6, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(55, 28, 6, 10, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Gloves
        ctx.fillStyle = '#4b0082';
        ctx.beginPath();
        ctx.arc(12, 36, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(58, 36, 5, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headGrad = ctx.createRadialGradient(35, 8, 3, 35, 8, 15);
        headGrad.addColorStop(0, '#32cd32');
        headGrad.addColorStop(1, '#228b22');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(35, 8, 15, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#4b0082';
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

        // Eyes
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(28, 6, 5, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(42, 6, 5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
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
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.rotation += 0.1;
        this.glowAnim += 0.2;
        return this.y > GAME_HEIGHT + 50;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate((this.x) * scaleRatio, (this.y) * scaleRatio);
        ctx.rotate(this.rotation);
        ctx.scale(scaleRatio, scaleRatio);

        // Glow
        const glow = 12 + Math.sin(this.glowAnim) * 4;
        const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, glow);
        glowGrad.addColorStop(0, 'rgba(0, 255, 0, 0.6)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glow, 0, Math.PI * 2);
        ctx.fill();

        // Pumpkin
        const pumpGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 10);
        pumpGrad.addColorStop(0, '#ff9933');
        pumpGrad.addColorStop(1, '#cc5500');
        ctx.fillStyle = pumpGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#00ff00';
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
        ctx.fillStyle = '#228b22';
        ctx.fillRect(-2, -13, 4, 4);

        ctx.restore();
    }

    getBounds() {
        return { x: this.x - 8, y: this.y - 8, w: 16, h: 16 };
    }
}
