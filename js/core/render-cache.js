// Render Cache System
// Pre-renders expensive visual effects to offscreen canvases

import { SPIDERVERSE } from '../config.js';

export class RenderCache {
    constructor() {
        // Cached canvases
        this.halftoneCanvas = null;
        this.scanlineCanvas = null;
        this.actionLinesCanvas = null;

        // Cache validity tracking
        this.lastWidth = 0;
        this.lastHeight = 0;
        this.lastScaleRatio = 0;

        // Quality settings
        this.quality = 'high';
    }

    // Check if cache needs to be rebuilt
    needsRebuild(width, height, scaleRatio) {
        return width !== this.lastWidth ||
               height !== this.lastHeight ||
               scaleRatio !== this.lastScaleRatio;
    }

    // Invalidate all caches (call on resize)
    invalidate(width, height, scaleRatio) {
        if (this.needsRebuild(width, height, scaleRatio)) {
            this.lastWidth = width;
            this.lastHeight = height;
            this.lastScaleRatio = scaleRatio;
            this.halftoneCanvas = null;
            this.scanlineCanvas = null;
            this.actionLinesCanvas = null;
            return true;
        }
        return false;
    }

    // Set quality level
    setQuality(quality) {
        if (this.quality !== quality) {
            this.quality = quality;
            // Invalidate caches on quality change
            this.halftoneCanvas = null;
            this.scanlineCanvas = null;
        }
    }

    // ============================================
    // HALFTONE PATTERN (Ben-Day dots)
    // Previously: 115,200+ arc() calls per frame
    // Now: Single drawImage() call per frame
    // ============================================
    buildHalftoneCache(width, height, scaleRatio) {
        this.halftoneCanvas = document.createElement('canvas');
        this.halftoneCanvas.width = width;
        this.halftoneCanvas.height = height;
        const ctx = this.halftoneCanvas.getContext('2d');

        const dotSize = 3 * scaleRatio;
        const spacing = 6 * scaleRatio;

        // Magenta dots layer (shadows)
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = SPIDERVERSE.pink;

        for (let y = 0; y < height; y += spacing) {
            const rowOffset = (Math.floor(y / spacing) % 2 === 0) ? 0 : spacing / 2;
            for (let x = rowOffset; x < width; x += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Cyan dots layer (offset)
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = SPIDERVERSE.cyan;

        for (let y = spacing / 2; y < height; y += spacing) {
            const rowOffset = (Math.floor(y / spacing) % 2 === 0) ? spacing / 4 : spacing * 3 / 4;
            for (let x = rowOffset; x < width; x += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }

    getHalftone(width, height, scaleRatio) {
        if (!this.halftoneCanvas || this.needsRebuild(width, height, scaleRatio)) {
            this.invalidate(width, height, scaleRatio);
            this.buildHalftoneCache(width, height, scaleRatio);
        }
        return this.halftoneCanvas;
    }

    // ============================================
    // SCANLINE PATTERN
    // Previously: 360 fillRect() calls per frame
    // Now: Single drawImage() call per frame
    // ============================================
    buildScanlineCache(width, height) {
        this.scanlineCanvas = document.createElement('canvas');
        this.scanlineCanvas.width = width;
        this.scanlineCanvas.height = height;
        const ctx = this.scanlineCanvas.getContext('2d');

        ctx.globalAlpha = 0.03;
        ctx.fillStyle = '#000';

        for (let y = 0; y < height; y += 3) {
            ctx.fillRect(0, y, width, 1);
        }

        ctx.globalAlpha = 1;
    }

    getScanlines(width, height, scaleRatio) {
        if (!this.scanlineCanvas || this.needsRebuild(width, height, scaleRatio)) {
            this.invalidate(width, height, scaleRatio);
            this.buildScanlineCache(width, height);
        }
        return this.scanlineCanvas;
    }

    // ============================================
    // ACTION LINES (Speed lines from center)
    // Pre-rendered for consistent performance
    // ============================================
    buildActionLinesCache(width, height, scaleRatio) {
        this.actionLinesCanvas = document.createElement('canvas');
        this.actionLinesCanvas.width = width;
        this.actionLinesCanvas.height = height;
        const ctx = this.actionLinesCanvas.getContext('2d');

        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1 * scaleRatio;

        const centerX = width * 0.3;
        const centerY = height * 0.5;
        const innerRadius = 100 * scaleRatio;
        const outerRadius = Math.max(width, height);

        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
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

        ctx.globalAlpha = 1;
    }

    getActionLines(width, height, scaleRatio) {
        if (!this.actionLinesCanvas || this.needsRebuild(width, height, scaleRatio)) {
            this.invalidate(width, height, scaleRatio);
            this.buildActionLinesCache(width, height, scaleRatio);
        }
        return this.actionLinesCanvas;
    }

    // ============================================
    // DRAW METHODS (Use cached canvases)
    // ============================================

    drawHalftone(ctx, canvas, scaleRatio) {
        if (this.quality === 'low') return;

        const cached = this.getHalftone(canvas.width, canvas.height, scaleRatio);
        if (cached) {
            ctx.drawImage(cached, 0, 0);
        }
    }

    drawScanlines(ctx, canvas, scaleRatio) {
        if (this.quality === 'low') return;

        const cached = this.getScanlines(canvas.width, canvas.height, scaleRatio);
        if (cached) {
            ctx.drawImage(cached, 0, 0);
        }
    }

    drawActionLines(ctx, canvas, scaleRatio, isPlaying) {
        if (!isPlaying || this.quality === 'low') return;

        const cached = this.getActionLines(canvas.width, canvas.height, scaleRatio);
        if (cached) {
            ctx.drawImage(cached, 0, 0);
        }
    }
}

// Create singleton instance
export const renderCache = new RenderCache();
