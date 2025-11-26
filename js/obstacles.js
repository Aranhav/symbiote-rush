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

        // Outline for visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Body
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(30, 20);
        ctx.lineTo(40, 40);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top light
        ctx.fillStyle = '#fff';
        ctx.fillRect(15, 15, 10, 5);
        ctx.strokeRect(15, 15, 10, 5);

        // Checkers
        ctx.fillStyle = '#000';
        ctx.fillRect(5, 30, 5, 5);
        ctx.fillRect(15, 30, 5, 5);
        ctx.fillRect(25, 30, 5, 5);
        ctx.fillRect(10, 35, 5, 5);
        ctx.fillRect(20, 35, 5, 5);
        ctx.fillRect(30, 35, 5, 5);

        // Wheels
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(10, 40, 6, 0, Math.PI * 2);
        ctx.arc(30, 40, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y + 5, w: this.w, h: this.h - 5 };
    }
}

export class FireHydrant {
    constructor(logicalWidth, gameSpeed) {
        this.w = 30;
        this.h = 40;
        this.x = logicalWidth + 50; // Adjusted to use logicalWidth
        this.y = GAME_HEIGHT - 50 - this.h;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed; // Adjusted to use gameSpeed
    }

    update() {
        this.x -= this.gameSpeed;
        if (this.x < -this.w) this.markedForDeletion = true;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Body
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.rect(5, 10, 20, 30);
        ctx.fill();
        ctx.stroke();

        // Top
        ctx.beginPath();
        ctx.arc(15, 10, 10, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        // Nozzles
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.rect(0, 15, 5, 5);
        ctx.rect(25, 15, 5, 5);
        ctx.fill();
        ctx.strokeRect(0, 15, 5, 5);
        ctx.strokeRect(25, 15, 5, 5);

        ctx.restore();
    }
}

export class Dumpster {
    constructor(logicalWidth, gameSpeed) { // Adjusted to use logicalWidth
        this.w = 80;
        this.h = 50;
        this.x = logicalWidth + 50; // Adjusted to use logicalWidth
        this.y = GAME_HEIGHT - 50 - this.h;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed; // Adjusted to use gameSpeed
    }

    update() {
        this.x -= this.gameSpeed;
        if (this.x < -this.w) this.markedForDeletion = true;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Body
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(80, 0);
        ctx.lineTo(75, 50);
        ctx.lineTo(5, 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lid
        ctx.fillStyle = '#1a6b1a';
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(80, 0);
        ctx.lineTo(80, 5);
        ctx.lineTo(0, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Graffiti
        ctx.fillStyle = '#ff00ff';
        ctx.font = '10px Arial';
        ctx.fillText('TRASH', 20, 30);

        ctx.restore();
    }
}

export class ConstructionBarrier {
    constructor(logicalWidth, gameSpeed) { // Adjusted to use logicalWidth
        this.w = 60;
        this.h = 40;
        this.x = logicalWidth + 50; // Adjusted to use logicalWidth
        this.y = GAME_HEIGHT - 50 - this.h;
        this.markedForDeletion = false;
        this.gameSpeed = gameSpeed; // Adjusted to use gameSpeed
    }

    update() {
        this.x -= this.gameSpeed;
        if (this.x < -this.w) this.markedForDeletion = true;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(scaleRatio, scaleRatio);

        // Outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        // Legs
        ctx.fillStyle = '#888';
        ctx.fillRect(5, 0, 5, 40);
        ctx.fillRect(50, 0, 5, 40);
        ctx.strokeRect(5, 0, 5, 40);
        ctx.strokeRect(50, 0, 5, 40);

        // Board
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(0, 10, 60, 15);
        ctx.strokeRect(0, 10, 60, 15);

        // Stripes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(10, 10); ctx.lineTo(20, 10); ctx.lineTo(10, 25); ctx.lineTo(0, 25);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(30, 10); ctx.lineTo(40, 10); ctx.lineTo(30, 25); ctx.lineTo(20, 25);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(50, 10); ctx.lineTo(60, 10); ctx.lineTo(50, 25); ctx.lineTo(40, 25);
        ctx.fill();

        // Light
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(30, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}

export class StormCloud {
    constructor(x, logicalWidth, gameSpeed) {
        this.w = 100;
        this.h = 60;
        this.x = x !== undefined ? x : logicalWidth;
        this.y = 20 + Math.random() * 50;
        this.markedForDeletion = false;
        this.speed = gameSpeed * 0.5;
        this.pulseAnim = Math.random() * Math.PI * 2;
        this.hasLightning = false;
        this.lightningCooldown = 0;
    }

    update() {
        this.x -= this.speed;
        this.pulseAnim += 0.05;
        if (this.lightningCooldown > 0) this.lightningCooldown--;
        if (this.x < -this.w) this.markedForDeletion = true;
        return !this.markedForDeletion;
    }

    spawnLightning() {
        if (this.lightningCooldown <= 0) {
            this.hasLightning = true;
            this.lightningCooldown = 200;
            setTimeout(() => this.hasLightning = false, 500);
            return { x: this.x + this.w / 2, y: this.y + this.h };
        }
        return null;
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

        // Outline
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
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
