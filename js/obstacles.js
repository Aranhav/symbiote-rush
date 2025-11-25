// Obstacle classes - TaxiCab, FireHydrant, Dumpster, ConstructionBarrier, StormCloud, ElectroBolt, Building

import { GAME_HEIGHT } from './config.js';

export class TaxiCab {
    constructor(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = GAME_HEIGHT - 80;
        this.w = 60;
        this.h = 30;
        this.wheelAnim = 0;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.x -= this.gameSpeed;
        this.wheelAnim += this.gameSpeed * 0.3;
        if (this.x + this.w < -50) this.markedForDeletion = true;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Body
        const bodyGrad = ctx.createLinearGradient(0, 0, 0, 25);
        bodyGrad.addColorStop(0, '#ffea00');
        bodyGrad.addColorStop(1, '#e6c200');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(0, 10, 60, 18, 3);
        ctx.fill();

        // Cabin
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.roundRect(15, 2, 25, 12, [4, 4, 0, 0]);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(18, 4, 8, 8);
        ctx.fillRect(29, 4, 8, 8);

        // Taxi sign
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(22, 0, 12, 4, 2);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(12, 28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(48, 28, 6, 0, Math.PI * 2);
        ctx.fill();

        // Hubcaps
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(12, 28, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(48, 28, 3, 0, Math.PI * 2);
        ctx.fill();

        // Lights
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(57, 18, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(3, 18, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y + 5, w: this.w, h: this.h - 5 };
    }
}

export class FireHydrant {
    constructor(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = GAME_HEIGHT - 70;
        this.w = 16;
        this.h = 22;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.x -= this.gameSpeed;
        if (this.x + this.w < -50) this.markedForDeletion = true;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Body
        const grad = ctx.createLinearGradient(0, 0, 16, 0);
        grad.addColorStop(0, '#cc0000');
        grad.addColorStop(0.5, '#ff3333');
        grad.addColorStop(1, '#cc0000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(3, 4, 10, 16, 2);
        ctx.fill();

        // Top
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.roundRect(1, 0, 14, 6, [3, 3, 0, 0]);
        ctx.fill();

        // Nozzles
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.roundRect(-2, 8, 6, 5, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(12, 8, 6, 5, 2);
        ctx.fill();

        // Caps
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(-1, 10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(17, 10, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

export class Dumpster {
    constructor(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = GAME_HEIGHT - 85;
        this.w = 50;
        this.h = 35;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.x -= this.gameSpeed;
        if (this.x + this.w < -50) this.markedForDeletion = true;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Body
        const grad = ctx.createLinearGradient(0, 5, 0, 35);
        grad.addColorStop(0, '#3cb371');
        grad.addColorStop(1, '#2e8b57');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(2, 8, 46, 27, 2);
        ctx.fill();

        // Lid
        ctx.fillStyle = '#45da45';
        ctx.beginPath();
        ctx.roundRect(0, 2, 50, 8, [3, 3, 0, 0]);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(8, 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(42, 35, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y + 5, w: this.w, h: this.h - 5 };
    }
}

export class ConstructionBarrier {
    constructor(logicalWidth, gameSpeed) {
        this.x = logicalWidth + 50;
        this.y = GAME_HEIGHT - 75;
        this.w = 40;
        this.h = 28;
        this.lightAnim = 0;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.x -= this.gameSpeed;
        this.lightAnim += 0.15;
        if (this.x + this.w < -50) this.markedForDeletion = true;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Legs
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(4, 20, 4, 8);
        ctx.fillRect(32, 20, 4, 8);

        // Board
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.roundRect(0, 6, 40, 16, 2);
        ctx.fill();

        // Stripes
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 6, 8, 16);
        ctx.fillRect(16, 6, 8, 16);
        ctx.fillRect(32, 6, 8, 16);

        // Light
        const lightOn = Math.sin(this.lightAnim * 4) > 0;
        ctx.fillStyle = lightOn ? '#ffff00' : '#aa8800';
        ctx.beginPath();
        ctx.arc(20, 3, 4, 0, Math.PI * 2);
        ctx.fill();

        if (lightOn) {
            const glowGrad = ctx.createRadialGradient(20, 3, 2, 20, 3, 10);
            glowGrad.addColorStop(0, 'rgba(255, 255, 0, 0.5)');
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(20, 3, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y + 6, w: this.w, h: this.h - 6 };
    }
}

export class StormCloud {
    constructor(x, logicalWidth, gameSpeed) {
        this.x = x !== undefined ? x : logicalWidth + 100;
        this.y = 30 + Math.random() * 40;
        this.w = 80 + Math.random() * 40;
        this.h = 35 + Math.random() * 15;
        this.speed = gameSpeed * 0.15;
        this.pulseAnim = Math.random() * Math.PI * 2;
        this.hasLightning = false;
        this.lightningCooldown = 0;
    }

    update() {
        this.x -= this.speed;
        this.pulseAnim += 0.05;
        if (this.lightningCooldown > 0) this.lightningCooldown--;
        return this.x + this.w < -50;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        const pulse = Math.sin(this.pulseAnim) * 0.1;

        // Cloud shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.w * 0.5 + 5, this.h * 0.6 + 5, this.w * 0.45, this.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main cloud body - dark storm cloud
        const cloudGrad = ctx.createRadialGradient(this.w * 0.5, this.h * 0.4, 5, this.w * 0.5, this.h * 0.4, this.w * 0.5);
        cloudGrad.addColorStop(0, '#4a4a6a');
        cloudGrad.addColorStop(0.5, '#3a3a5a');
        cloudGrad.addColorStop(1, '#2a2a4a');
        ctx.fillStyle = cloudGrad;

        // Multiple ellipses for fluffy cloud shape
        ctx.beginPath();
        ctx.ellipse(this.w * 0.3, this.h * 0.5, this.w * 0.25 * (1 + pulse), this.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.w * 0.5, this.h * 0.35, this.w * 0.3 * (1 + pulse), this.h * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.w * 0.7, this.h * 0.5, this.w * 0.25 * (1 + pulse), this.h * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow when charged
        if (this.hasLightning) {
            const innerGlow = ctx.createRadialGradient(this.w * 0.5, this.h * 0.6, 5, this.w * 0.5, this.h * 0.6, 30);
            innerGlow.addColorStop(0, 'rgba(0, 191, 255, 0.6)');
            innerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.ellipse(this.w * 0.5, this.h * 0.6, 30, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    spawnLightning() {
        if (this.lightningCooldown <= 0) {
            this.hasLightning = true;
            this.lightningCooldown = 200;
            setTimeout(() => this.hasLightning = false, 500);
            return new ElectroBolt(this.x + this.w * 0.5, this.y + this.h);
        }
        return null;
    }
}

export class ElectroBolt {
    constructor(cloudX, cloudY, gameSpeed) {
        this.x = cloudX - 20;
        this.y = cloudY;
        this.w = 40;
        this.h = GAME_HEIGHT - cloudY - 60;
        this.flickerAnim = 0;
        this.markedForDeletion = false;
        this.life = 60;
        this.gameSpeed = gameSpeed;
        this.generateBolt();
    }

    generateBolt() {
        this.points = [{ x: 20, y: 0 }];
        let y = 0;
        const targetY = this.h;
        while (y < targetY) {
            y += 12 + Math.random() * 10;
            this.points.push({
                x: 10 + Math.random() * 20,
                y: Math.min(y, targetY)
            });
        }
        // Branches
        this.branches = [];
        for (let i = 1; i < this.points.length - 1; i++) {
            if (Math.random() < 0.4) {
                const branchPoints = [this.points[i]];
                let bx = this.points[i].x;
                let by = this.points[i].y;
                const dir = Math.random() > 0.5 ? 1 : -1;
                for (let j = 0; j < 3; j++) {
                    bx += dir * (8 + Math.random() * 8);
                    by += 8 + Math.random() * 6;
                    branchPoints.push({ x: bx, y: by });
                }
                this.branches.push(branchPoints);
            }
        }
    }

    update() {
        this.x -= this.gameSpeed * 0.15;
        this.flickerAnim += 0.5;
        this.life--;
        if (Math.random() < 0.15) this.generateBolt();
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        const flash = Math.sin(this.flickerAnim * 8) > 0;
        const alpha = this.life / 60;

        // Outer glow
        ctx.shadowColor = '#00bfff';
        ctx.shadowBlur = 20;

        // Main bolt
        ctx.strokeStyle = flash ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 191, 255, ${alpha})`;
        ctx.lineWidth = flash ? 5 : 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();

        // Branches
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(0, 191, 255, ${alpha * 0.7})`;
        this.branches.forEach(branch => {
            ctx.beginPath();
            ctx.moveTo(branch[0].x, branch[0].y);
            for (let i = 1; i < branch.length; i++) {
                ctx.lineTo(branch[i].x, branch[i].y);
            }
            ctx.stroke();
        });

        // Inner core
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();

        // Impact sparks at bottom
        if (flash && this.life > 30) {
            ctx.fillStyle = '#00ffff';
            const lastPoint = this.points[this.points.length - 1];
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI;
                const dist = 5 + Math.random() * 15;
                ctx.beginPath();
                ctx.arc(
                    lastPoint.x + Math.cos(angle) * dist,
                    lastPoint.y + Math.sin(angle) * dist * 0.5,
                    1 + Math.random() * 2,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }

        ctx.restore();
    }

    getBounds() {
        const lastPoint = this.points[this.points.length - 1];
        return { x: this.x + lastPoint.x - 15, y: this.y + lastPoint.y - 20, w: 30, h: 25 };
    }
}

export class Building {
    constructor(x, logicalWidth, gameSpeed) {
        this.x = x || logicalWidth + Math.random() * 100;
        this.w = 50 + Math.random() * 60;
        this.h = 80 + Math.random() * 120;
        this.y = GAME_HEIGHT - 50 - this.h;
        this.windows = [];
        for (let wy = 10; wy < this.h - 15; wy += 15) {
            for (let wx = 8; wx < this.w - 8; wx += 12) {
                this.windows.push({ x: wx, y: wy, lit: Math.random() > 0.4 });
            }
        }
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.x -= this.gameSpeed * 0.12;
        return this.x + this.w < -50;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Building
        const grad = ctx.createLinearGradient(0, 0, this.w, 0);
        grad.addColorStop(0, '#2a2a4a');
        grad.addColorStop(0.1, '#1a1a3a');
        grad.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.w, this.h);

        // Windows
        this.windows.forEach(w => {
            ctx.fillStyle = w.lit ? '#ffff66' : '#0a0a1a';
            ctx.fillRect(w.x, w.y, 6, 8);
        });

        ctx.restore();
    }
}
