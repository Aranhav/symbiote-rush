// Core Performance Systems
// Delta-time tracking, Object pooling, Timer management, Array utilities

// ============================================
// DELTA TIME TRACKER
// ============================================
export class DeltaTime {
    constructor() {
        this.lastTime = 0;
        this.deltaTime = 16.67; // Default to 60fps
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.fpsAccumulator = 0;
        this.fpsFrameCount = 0;
    }

    update(timestamp) {
        if (this.lastTime === 0) {
            this.lastTime = timestamp;
            return this.deltaTime;
        }

        // Calculate delta time in milliseconds, capped to prevent spiral of death
        this.deltaTime = Math.min(timestamp - this.lastTime, 50); // Cap at ~20fps
        this.lastTime = timestamp;
        this.frameCount++;

        // FPS calculation
        this.fpsAccumulator += this.deltaTime;
        this.fpsFrameCount++;
        if (this.fpsAccumulator >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.fpsFrameCount * 1000) / this.fpsAccumulator);
            this.fpsAccumulator = 0;
            this.fpsFrameCount = 0;
        }

        return this.deltaTime;
    }

    // Get multiplier for frame-rate independent values (normalized to 60fps)
    getMultiplier() {
        return this.deltaTime / 16.67;
    }

    getFPS() {
        return this.fps;
    }

    reset() {
        this.lastTime = 0;
        this.deltaTime = 16.67;
    }
}

// ============================================
// OBJECT POOL
// ============================================
export class ObjectPool {
    constructor(factory, initialSize = 20, maxSize = 100) {
        this.factory = factory;
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    acquire(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else if (this.active.length < this.maxSize) {
            obj = this.factory();
        } else {
            // Pool exhausted - return null or reuse oldest
            return null;
        }

        if (obj.reset) {
            obj.reset(...args);
        }
        obj._poolActive = true;
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        if (!obj._poolActive) return;

        obj._poolActive = false;
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        if (obj.deactivate) {
            obj.deactivate();
        }
        this.pool.push(obj);
    }

    // Update all active objects, auto-release dead ones
    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const obj = this.active[i];
            if (obj.update) {
                const isDead = obj.update(dt);
                if (isDead) {
                    this.release(obj);
                }
            }
        }
    }

    // Draw all active objects
    draw(ctx, scaleRatio) {
        for (const obj of this.active) {
            if (obj.draw) {
                obj.draw(ctx, scaleRatio);
            }
        }
    }

    // Get count of active objects
    getActiveCount() {
        return this.active.length;
    }

    // Clear all active objects back to pool
    clear() {
        while (this.active.length > 0) {
            this.release(this.active[0]);
        }
    }

    // Iterate over active objects
    forEach(callback) {
        for (const obj of this.active) {
            callback(obj);
        }
    }
}

// ============================================
// TIMER MANAGER (Replaces setTimeout)
// ============================================
class Timer {
    constructor() {
        this.elapsed = 0;
        this.duration = 0;
        this.callback = null;
        this.loop = false;
        this.active = false;
    }

    reset(duration, callback, loop = false) {
        this.elapsed = 0;
        this.duration = duration;
        this.callback = callback;
        this.loop = loop;
        this.active = true;
    }

    update(dt) {
        if (!this.active) return false;

        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            if (this.callback) this.callback();

            if (this.loop) {
                this.elapsed -= this.duration;
            } else {
                this.active = false;
                return true; // Timer finished
            }
        }
        return false;
    }

    cancel() {
        this.active = false;
    }
}

export class TimerManager {
    constructor(poolSize = 20) {
        this.pool = new ObjectPool(() => new Timer(), poolSize, 50);
    }

    // Schedule a one-shot timer (replaces setTimeout)
    schedule(duration, callback) {
        const timer = this.pool.acquire(duration, callback, false);
        return timer;
    }

    // Schedule a repeating timer (replaces setInterval)
    scheduleRepeating(duration, callback) {
        const timer = this.pool.acquire(duration, callback, true);
        return timer;
    }

    // Cancel a timer
    cancel(timer) {
        if (timer) {
            timer.cancel();
            this.pool.release(timer);
        }
    }

    // Update all timers
    update(dt) {
        this.pool.update(dt);
    }

    // Clear all timers
    clear() {
        this.pool.clear();
    }
}

// ============================================
// SCREEN SHAKE CONTROLLER
// ============================================
export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.elapsed = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.decay = 0.9;
    }

    // Trigger a shake
    shake(intensity, duration = 300) {
        // Stack shakes if already shaking
        this.intensity = Math.max(this.intensity, intensity);
        this.duration = Math.max(this.duration - this.elapsed, duration);
        this.elapsed = 0;
    }

    update(dt) {
        if (this.duration <= 0 || this.intensity < 0.1) {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
            this.duration = 0;
            return;
        }

        this.elapsed += dt;
        const progress = this.elapsed / this.duration;
        const currentIntensity = this.intensity * (1 - progress);

        // Random offset based on intensity
        this.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        this.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

        if (this.elapsed >= this.duration) {
            this.intensity = 0;
            this.duration = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    apply(ctx) {
        if (this.offsetX !== 0 || this.offsetY !== 0) {
            ctx.translate(this.offsetX, this.offsetY);
        }
    }

    reset() {
        this.intensity = 0;
        this.duration = 0;
        this.elapsed = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// In-place array filter to avoid allocations
export function filterInPlace(arr, predicate) {
    let writeIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            if (writeIndex !== i) {
                arr[writeIndex] = arr[i];
            }
            writeIndex++;
        }
    }
    arr.length = writeIndex;
    return arr;
}

// Lerp function for smooth animations
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Clamp value between min and max
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Easing functions
export const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutBounce: t => {
        const n1 = 7.5625, d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};
