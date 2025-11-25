// Visual effect classes

import { SPIDERVERSE } from './config.js';

export class InkSplatter {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || SPIDERVERSE.pink;
        this.life = 40;
        this.scale = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this.drops = [];
        for (let i = 0; i < 5 + Math.random() * 5; i++) {
            this.drops.push({
                angle: Math.random() * Math.PI * 2,
                dist: 5 + Math.random() * 15,
                size: 2 + Math.random() * 4
            });
        }
    }

    update() {
        this.life--;
        if (this.life > 30) this.scale = Math.min(1, this.scale + 0.15);
        else this.scale *= 0.95;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale * scaleRatio, this.scale * scaleRatio);
        ctx.fillStyle = this.color;

        // Main splat
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Drops
        this.drops.forEach(d => {
            ctx.beginPath();
            ctx.arc(
                Math.cos(d.angle) * d.dist,
                Math.sin(d.angle) * d.dist,
                d.size,
                0, Math.PI * 2
            );
            ctx.fill();
        });

        ctx.restore();
    }
}

export class SpeedLine {
    constructor(y, gameSpeed) {
        this.x = 150;
        this.y = y;
        this.length = 50 + Math.random() * 100;
        this.life = 8;
        this.color = Math.random() > 0.5 ? SPIDERVERSE.cyan : SPIDERVERSE.pink;
        this.gameSpeed = gameSpeed;
    }

    update() {
        this.life--;
        this.x -= this.gameSpeed * 2;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.globalAlpha = this.life / 8;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * scaleRatio;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x * scaleRatio, this.y * scaleRatio);
        ctx.lineTo((this.x - this.length) * scaleRatio, this.y * scaleRatio);
        ctx.stroke();
        ctx.restore();
    }
}

export class AfterImage {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.life = 6;
        this.color = SPIDERVERSE.cyan;
    }

    update() {
        this.life--;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.globalAlpha = this.life / 12;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            (this.x + this.w / 2) * scaleRatio,
            (this.y + this.h / 2) * scaleRatio,
            this.w / 2 * scaleRatio,
            this.h / 2 * scaleRatio,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }
}

export class ComicText {
    constructor(text, x, y, color) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.life = 35;
        this.scale = 0;
        this.rotation = (Math.random() - 0.5) * 0.3;
        this.color = color || (Math.random() > 0.5 ? SPIDERVERSE.yellow : SPIDERVERSE.white);
    }

    update() {
        this.life--;
        if (this.life > 25) this.scale = Math.min(1.2, this.scale + 0.2);
        else if (this.life > 15) this.scale = 1;
        else this.scale *= 0.88;
        this.y -= 1.5;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale * scaleRatio * 0.5, this.scale * scaleRatio * 0.5);

        // Comic book style - multiple outlines for bold effect
        ctx.font = 'bold 42px Bangers';
        ctx.textAlign = 'center';

        // Outer glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        // Multiple outlines for thick comic effect
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.strokeText(this.text, 0, 0);

        ctx.lineWidth = 4;
        ctx.strokeStyle = SPIDERVERSE.pink;
        ctx.strokeText(this.text, 2, 2);

        // Fill
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(this.text, -1, -1);

        ctx.restore();
    }
}
