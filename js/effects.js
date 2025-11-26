// Visual effect classes
// Optimized for object pooling with reset() methods

import { SPIDERVERSE, EFFECT_CONFIG, getCurrentQuality } from './config.js';

// ============================================
// INK SPLATTER (Comic book style splat)
// ============================================
export class InkSplatter {
    constructor(x, y, color) {
        this.x = x || 0;
        this.y = y || 0;
        this.color = color || SPIDERVERSE.pink;
        this.life = EFFECT_CONFIG.inkSplatter.life;
        this.maxLife = EFFECT_CONFIG.inkSplatter.life;
        this.scale = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this.drops = [];
        this._initDrops();
    }

    _initDrops() {
        this.drops.length = 0;
        const dropCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < dropCount; i++) {
            this.drops.push({
                angle: Math.random() * Math.PI * 2,
                dist: 5 + Math.random() * 15,
                size: 2 + Math.random() * 4
            });
        }
    }

    // Reset for object pooling
    reset(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || SPIDERVERSE.pink;
        this.life = this.maxLife;
        this.scale = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this._initDrops();
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;
        const scaleUpDuration = EFFECT_CONFIG.inkSplatter.scaleUpDuration;

        if (this.life > this.maxLife - scaleUpDuration) {
            this.scale = Math.min(1, this.scale + 0.15 * dtMult);
        } else {
            this.scale *= Math.pow(0.95, dtMult);
        }

        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.scale < 0.01) return;

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
        for (const d of this.drops) {
            ctx.beginPath();
            ctx.arc(
                Math.cos(d.angle) * d.dist,
                Math.sin(d.angle) * d.dist,
                d.size,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }
}

// ============================================
// SPEED LINE (Motion blur effect)
// ============================================
export class SpeedLine {
    constructor(y, gameSpeed) {
        this.x = 150;
        this.y = y || 200;
        this.length = 50 + Math.random() * 100;
        this.life = EFFECT_CONFIG.speedLine.life;
        this.maxLife = EFFECT_CONFIG.speedLine.life;
        this.color = Math.random() > 0.5 ? SPIDERVERSE.cyan : SPIDERVERSE.pink;
        this.gameSpeed = gameSpeed || 5;
    }

    reset(y, gameSpeed) {
        this.x = 150;
        this.y = y;
        this.length = 50 + Math.random() * 100;
        this.life = this.maxLife;
        this.color = Math.random() > 0.5 ? SPIDERVERSE.cyan : SPIDERVERSE.pink;
        this.gameSpeed = gameSpeed;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;
        this.x -= this.gameSpeed * 2 * dtMult;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
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

// ============================================
// AFTER IMAGE (Ghost trail effect)
// ============================================
export class AfterImage {
    constructor(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 50;
        this.h = h || 50;
        this.life = EFFECT_CONFIG.afterImage.life;
        this.maxLife = EFFECT_CONFIG.afterImage.life;
        this.color = SPIDERVERSE.cyan;
    }

    reset(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.life = this.maxLife;
        this.color = SPIDERVERSE.cyan;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / (this.maxLife * 2));
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

// ============================================
// COMIC TEXT (Pop-up text effect)
// ============================================
export class ComicText {
    constructor(text, x, y, color) {
        this.text = text || 'POW!';
        this.x = x || 100;
        this.y = y || 200;
        this.life = EFFECT_CONFIG.comicText.life;
        this.maxLife = EFFECT_CONFIG.comicText.life;
        this.scale = 0;
        this.rotation = (Math.random() - 0.5) * 0.3;
        this.color = color || (Math.random() > 0.5 ? SPIDERVERSE.yellow : SPIDERVERSE.white);
        this.velocityY = -1.5;
    }

    reset(text, x, y, color) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.life = this.maxLife;
        this.scale = 0;
        this.rotation = (Math.random() - 0.5) * 0.3;
        this.color = color || (Math.random() > 0.5 ? SPIDERVERSE.yellow : SPIDERVERSE.white);
        this.velocityY = -1.5;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;

        // Scale animation
        if (this.life > this.maxLife * 0.7) {
            this.scale = Math.min(1.2, this.scale + 0.2 * dtMult);
        } else if (this.life > this.maxLife * 0.4) {
            this.scale = 1;
        } else {
            this.scale *= Math.pow(0.88, dtMult);
        }

        this.y += this.velocityY * dtMult;
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0 || this.scale < 0.01) return;

        const quality = getCurrentQuality();

        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale * scaleRatio * 0.5, this.scale * scaleRatio * 0.5);

        // Comic book style - multiple outlines for bold effect
        ctx.font = 'bold 42px Bangers';
        ctx.textAlign = 'center';

        // Outer glow (only on high quality)
        if (quality.glowEffects) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }

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

// ============================================
// EXPLOSION PARTICLE (NEW - For bomb explosions)
// ============================================
export class ExplosionParticle {
    constructor(x, y, color) {
        this.x = x || 0;
        this.y = y || 0;
        this.vx = 0;
        this.vy = 0;
        this.life = EFFECT_CONFIG.explosion.life;
        this.maxLife = EFFECT_CONFIG.explosion.life;
        this.color = color || SPIDERVERSE.orange;
        this.size = 5;
        this.gravity = 0.2;
        this.friction = 0.98;
    }

    reset(x, y, color) {
        this.x = x;
        this.y = y;
        // Random explosion direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2; // Bias upward
        this.life = this.maxLife;
        this.color = color || SPIDERVERSE.orange;
        this.size = 3 + Math.random() * 6;
        this.gravity = 0.15 + Math.random() * 0.1;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;

        // Physics
        this.vy += this.gravity * dtMult;
        this.vx *= Math.pow(this.friction, dtMult);
        this.vy *= Math.pow(this.friction, dtMult);

        this.x += this.vx * dtMult;
        this.y += this.vy * dtMult;

        // Shrink over time
        this.size *= Math.pow(0.97, dtMult);

        return this.life <= 0 || this.size < 0.5;
    }

    draw(ctx, scaleRatio) {
        if (this.size < 0.5) return;

        const alpha = Math.max(0, this.life / this.maxLife);
        const quality = getCurrentQuality();

        ctx.save();

        // Glow effect
        if (quality.glowEffects) {
            ctx.shadowBlur = 10 * scaleRatio;
            ctx.shadowColor = this.color;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x * scaleRatio,
            this.y * scaleRatio,
            this.size * scaleRatio,
            0, Math.PI * 2
        );
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = SPIDERVERSE.yellow;
        ctx.beginPath();
        ctx.arc(
            this.x * scaleRatio,
            this.y * scaleRatio,
            this.size * 0.4 * scaleRatio,
            0, Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// SCORE POPUP (NEW - For score displays)
// ============================================
export class ScorePopup {
    constructor(x, y, score, color) {
        this.x = x || 0;
        this.y = y || 0;
        this.score = score || 0;
        this.life = EFFECT_CONFIG.scorePopup.life;
        this.maxLife = EFFECT_CONFIG.scorePopup.life;
        this.color = color || SPIDERVERSE.yellow;
        this.scale = 0;
        this.velocityY = -2;
    }

    reset(x, y, score, color) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.life = this.maxLife;
        this.color = color || SPIDERVERSE.yellow;
        this.scale = 0;
        this.velocityY = -2;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;

        // Scale animation - quick pop in, slow fade
        if (this.life > this.maxLife * 0.8) {
            this.scale = Math.min(1, this.scale + 0.3 * dtMult);
        } else {
            this.scale *= Math.pow(0.98, dtMult);
        }

        // Float upward with deceleration
        this.y += this.velocityY * dtMult;
        this.velocityY *= Math.pow(0.95, dtMult);

        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0 || this.scale < 0.01) return;

        const alpha = Math.min(1, this.life / (this.maxLife * 0.5));
        const quality = getCurrentQuality();

        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = alpha;

        const text = `+${this.score}`;
        ctx.font = `bold ${24 * scaleRatio}px Bangers`;
        ctx.textAlign = 'center';

        // Glow
        if (quality.glowEffects) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
        }

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3 * scaleRatio;
        ctx.strokeText(text, 0, 0);

        // Fill
        ctx.fillStyle = this.color;
        ctx.fillText(text, 0, 0);

        ctx.restore();
    }
}

// ============================================
// LIGHTNING BOLT (NEW - For electric effects)
// ============================================
export class LightningBolt {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 100;
        this.life = 8;
        this.maxLife = 8;
        this.segments = [];
        this._generateSegments();
    }

    _generateSegments() {
        this.segments.length = 0;
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const segmentCount = 8 + Math.floor(Math.random() * 6);
        const perpX = -dy;
        const perpY = dx;
        const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
        const normPerpX = perpX / perpLen;
        const normPerpY = perpY / perpLen;

        let prevX = this.x1;
        let prevY = this.y1;

        for (let i = 1; i <= segmentCount; i++) {
            const t = i / segmentCount;
            let x = this.x1 + dx * t;
            let y = this.y1 + dy * t;

            // Add randomness except for last segment
            if (i < segmentCount) {
                const offset = (Math.random() - 0.5) * 30;
                x += normPerpX * offset;
                y += normPerpY * offset;
            }

            this.segments.push({ x1: prevX, y1: prevY, x2: x, y2: y });
            prevX = x;
            prevY = y;
        }
    }

    reset(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.life = this.maxLife;
        this._generateSegments();
    }

    deactivate() {
        this.segments.length = 0;
    }

    update(dtMult = 1) {
        this.life -= dtMult;
        // Regenerate occasionally for flicker effect
        if (Math.random() < 0.3) {
            this._generateSegments();
        }
        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0) return;

        const alpha = Math.max(0, this.life / this.maxLife);
        const quality = getCurrentQuality();

        ctx.save();
        ctx.globalAlpha = alpha;

        // Glow
        if (quality.glowEffects) {
            ctx.shadowBlur = 20 * scaleRatio;
            ctx.shadowColor = SPIDERVERSE.electricBlue;
        }

        // Main bolt
        ctx.strokeStyle = SPIDERVERSE.electricBlue;
        ctx.lineWidth = 3 * scaleRatio;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (const seg of this.segments) {
            ctx.moveTo(seg.x1 * scaleRatio, seg.y1 * scaleRatio);
            ctx.lineTo(seg.x2 * scaleRatio, seg.y2 * scaleRatio);
        }
        ctx.stroke();

        // White core
        ctx.shadowBlur = 0;
        ctx.strokeStyle = SPIDERVERSE.white;
        ctx.lineWidth = 1.5 * scaleRatio;
        ctx.beginPath();
        for (const seg of this.segments) {
            ctx.moveTo(seg.x1 * scaleRatio, seg.y1 * scaleRatio);
            ctx.lineTo(seg.x2 * scaleRatio, seg.y2 * scaleRatio);
        }
        ctx.stroke();

        ctx.restore();
    }
}

// ============================================
// NEAR MISS EFFECT (NEW - For close calls)
// ============================================
export class NearMissEffect {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.life = 20;
        this.maxLife = 20;
        this.rings = [];
        for (let i = 0; i < 3; i++) {
            this.rings.push({
                radius: 10,
                maxRadius: 40 + i * 20,
                alpha: 1
            });
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.life = this.maxLife;
        for (let i = 0; i < this.rings.length; i++) {
            this.rings[i].radius = 10;
            this.rings[i].maxRadius = 40 + i * 20;
            this.rings[i].alpha = 1;
        }
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;

        for (const ring of this.rings) {
            ring.radius += 3 * dtMult;
            ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);
        }

        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0) return;

        const quality = getCurrentQuality();

        ctx.save();

        for (const ring of this.rings) {
            if (ring.alpha <= 0) continue;

            ctx.globalAlpha = ring.alpha * 0.6;

            if (quality.glowEffects) {
                ctx.shadowBlur = 10 * scaleRatio;
                ctx.shadowColor = SPIDERVERSE.cyan;
            }

            ctx.strokeStyle = SPIDERVERSE.cyan;
            ctx.lineWidth = 2 * scaleRatio;
            ctx.beginPath();
            ctx.arc(
                this.x * scaleRatio,
                this.y * scaleRatio,
                ring.radius * scaleRatio,
                0, Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ============================================
// COMBO TEXT (NEW - For combo multipliers)
// ============================================
export class ComboText {
    constructor(x, y, combo) {
        this.x = x || 0;
        this.y = y || 0;
        this.combo = combo || 2;
        this.life = 45;
        this.maxLife = 45;
        this.scale = 0;
        this.bounce = 0;
    }

    reset(x, y, combo) {
        this.x = x;
        this.y = y;
        this.combo = combo;
        this.life = this.maxLife;
        this.scale = 0;
        this.bounce = 0;
    }

    deactivate() {
        // Clean up if needed
    }

    update(dtMult = 1) {
        this.life -= dtMult;

        // Bouncy scale animation
        if (this.life > this.maxLife * 0.7) {
            this.scale = Math.min(1.3, this.scale + 0.25 * dtMult);
            this.bounce = Math.sin((this.maxLife - this.life) * 0.5) * 0.2;
        } else if (this.life > this.maxLife * 0.3) {
            this.scale = 1 + this.bounce;
            this.bounce *= 0.9;
        } else {
            this.scale *= Math.pow(0.92, dtMult);
        }

        return this.life <= 0;
    }

    draw(ctx, scaleRatio) {
        if (this.life <= 0 || this.scale < 0.01) return;

        const alpha = Math.min(1, this.life / (this.maxLife * 0.3));
        const quality = getCurrentQuality();

        ctx.save();
        ctx.translate(this.x * scaleRatio, this.y * scaleRatio);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = alpha;

        const text = `${this.combo}x COMBO!`;
        ctx.font = `bold ${32 * scaleRatio}px Bangers`;
        ctx.textAlign = 'center';

        // Rainbow glow for high combos
        const glowColor = this.combo >= 5 ? SPIDERVERSE.pink :
                         this.combo >= 3 ? SPIDERVERSE.cyan :
                         SPIDERVERSE.yellow;

        if (quality.glowEffects) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = glowColor;
        }

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4 * scaleRatio;
        ctx.strokeText(text, 0, 0);

        // Fill with gradient effect
        ctx.fillStyle = glowColor;
        ctx.fillText(text, 0, 0);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(text, -1, -2);

        ctx.restore();
    }
}
