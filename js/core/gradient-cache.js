// Gradient Cache System
// Caches expensive gradient objects to avoid recreating them every frame

export class GradientCache {
    constructor() {
        this.cache = new Map();
        this.lastWidth = 0;
        this.lastHeight = 0;
    }

    // Invalidate cache on resize
    invalidate(width, height) {
        if (width !== this.lastWidth || height !== this.lastHeight) {
            this.cache.clear();
            this.lastWidth = width;
            this.lastHeight = height;
            return true;
        }
        return false;
    }

    // Get or create a linear gradient
    getLinear(ctx, key, x0, y0, x1, y1, stops) {
        const cacheKey = `linear:${key}`;
        if (!this.cache.has(cacheKey)) {
            const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            stops.forEach(([offset, color]) => {
                gradient.addColorStop(offset, color);
            });
            this.cache.set(cacheKey, gradient);
        }
        return this.cache.get(cacheKey);
    }

    // Get or create a radial gradient
    getRadial(ctx, key, x0, y0, r0, x1, y1, r1, stops) {
        const cacheKey = `radial:${key}`;
        if (!this.cache.has(cacheKey)) {
            const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
            stops.forEach(([offset, color]) => {
                gradient.addColorStop(offset, color);
            });
            this.cache.set(cacheKey, gradient);
        }
        return this.cache.get(cacheKey);
    }

    // Build common gradients used throughout the game
    buildCommonGradients(ctx, canvas) {
        const width = canvas.width;
        const height = canvas.height;

        // Sky gradient
        this.getLinear(ctx, 'sky', 0, 0, 0, height, [
            [0, '#050510'],
            [0.3, '#0d0d2b'],
            [1, '#1a1a3a']
        ]);

        // Vignette gradient
        this.getRadial(ctx, 'vignette',
            width / 2, height / 2, height * 0.2,
            width / 2, height / 2, height * 0.9,
            [
                [0, 'transparent'],
                [1, 'rgba(0, 0, 0, 0.3)']
            ]
        );

        // Ground gradient
        this.getLinear(ctx, 'ground', 0, 0, 0, 100, [
            [0, '#1a1a3a'],
            [1, '#0a0a1a']
        ]);

        // Pink edge bleed
        this.getLinear(ctx, 'pinkEdge', 0, 0, width * 0.15, 0, [
            [0, 'rgba(255, 0, 255, 0.25)'],
            [1, 'transparent']
        ]);

        // Cyan edge bleed
        this.getLinear(ctx, 'cyanEdge', width, 0, width * 0.85, 0, [
            [0, 'rgba(0, 255, 255, 0.25)'],
            [1, 'transparent']
        ]);

        // Street glow
        this.getLinear(ctx, 'streetGlow', 0, height * 0.7, 0, height, [
            [0, 'transparent'],
            [1, 'rgba(255, 20, 147, 0.08)']
        ]);
    }

    // Get sky gradient
    getSky(ctx, height) {
        return this.getLinear(ctx, 'sky', 0, 0, 0, height, [
            [0, '#050510'],
            [0.3, '#0d0d2b'],
            [1, '#1a1a3a']
        ]);
    }

    // Get vignette gradient
    getVignette(ctx, width, height) {
        return this.getRadial(ctx, 'vignette',
            width / 2, height / 2, height * 0.2,
            width / 2, height / 2, height * 0.9,
            [
                [0, 'transparent'],
                [1, 'rgba(0, 0, 0, 0.3)']
            ]
        );
    }

    // Clear entire cache
    clear() {
        this.cache.clear();
    }

    // Get cache size (for debugging)
    size() {
        return this.cache.size;
    }
}

// Create singleton instance
export const gradientCache = new GradientCache();
