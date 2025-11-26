// Game constants and configuration

// ============================================
// PHYSICS CONSTANTS
// ============================================
export const GRAVITY = 0.6;
export const JUMP_STRENGTH = -12;
export const DOUBLE_JUMP_STRENGTH = -10;
export const GAME_HEIGHT = 400;

// ============================================
// ENHANCED SPIDER-VERSE COLOR PALETTE
// ============================================
export const SPIDERVERSE = {
    // Primary Neons (iconic Spider-Verse colors)
    pink: '#ff00ff',
    pinkLight: '#ff66ff',
    pinkDark: '#cc00cc',

    cyan: '#00ffff',
    cyanLight: '#66ffff',
    cyanDark: '#00cccc',

    yellow: '#ffff00',
    yellowLight: '#ffff66',
    yellowDark: '#cccc00',

    // Enhanced accent colors
    purple: '#aa00ff',
    purpleDeep: '#6600cc',
    purpleLight: '#cc66ff',

    orange: '#ff3300',
    orangeHot: '#ff6600',
    orangeDark: '#cc2600',

    // New accents
    electricBlue: '#00bfff',
    electricBlueDark: '#0099cc',
    symbioteGreen: '#00ff66',
    symbioteGreenDark: '#00cc52',

    // Neutrals
    black: '#000000',
    white: '#ffffff',

    // Background depths (richer atmosphere)
    bgDeep: '#050510',
    bgMid: '#0a0a1a',
    bgNear: '#1a1a3a',
    bgSurface: '#2a2a4a',
    darkBlue: '#020205',

    // UI specific
    uiGlow: '#ff1493',
    uiHighlight: '#00bfff'
};

// ============================================
// ANIMATION STYLE SETTINGS
// ============================================
export const ANIMATION_STYLES = {
    smooth: {
        frameSkip: 1,
        label: 'Smooth (60fps)',
        description: 'Buttery smooth animation'
    },
    spiderverse: {
        frameSkip: 2,
        label: 'Spider-Verse (12fps)',
        description: 'Authentic comic book feel'
    },
    comic: {
        frameSkip: 3,
        label: 'Comic Book (8fps)',
        description: 'Maximum stylization'
    }
};

// ============================================
// QUALITY SETTINGS
// ============================================
export const QUALITY_SETTINGS = {
    low: {
        halftone: false,
        scanlines: false,
        chromaticAberration: false,
        colorMisregistration: false,
        actionLines: false,
        afterImages: false,
        speedLines: true,
        inkSplatters: true,
        dynamicLighting: false,
        glowEffects: false,
        maxParticles: 15
    },
    medium: {
        halftone: true,
        scanlines: true,
        chromaticAberration: false,
        colorMisregistration: true,
        actionLines: true,
        afterImages: true,
        speedLines: true,
        inkSplatters: true,
        dynamicLighting: false,
        glowEffects: true,
        maxParticles: 30
    },
    high: {
        halftone: true,
        scanlines: true,
        chromaticAberration: true,
        colorMisregistration: true,
        actionLines: true,
        afterImages: true,
        speedLines: true,
        inkSplatters: true,
        dynamicLighting: true,
        glowEffects: true,
        maxParticles: 50
    }
};

// ============================================
// SPAWN TIMINGS (in frames at 60fps, will be converted to ms)
// ============================================
export const SPAWN_CONFIG = {
    obstacle: {
        baseInterval: 80,      // Base frames between obstacles
        speedMultiplier: 5     // Divider for game speed adjustment
    },
    goblin: {
        interval: 400,         // Frames between goblin spawns
        minScore: 150          // Minimum score for goblin to appear
    },
    lightning: {
        interval: 180,         // Frames between lightning
        minScore: 100          // Minimum score for lightning
    }
};

// ============================================
// EFFECT DURATIONS (in frames at 60fps)
// ============================================
export const EFFECT_CONFIG = {
    inkSplatter: {
        life: 40,
        scaleUpDuration: 10
    },
    speedLine: {
        life: 8
    },
    afterImage: {
        life: 6
    },
    comicText: {
        life: 35
    },
    explosion: {
        life: 50,
        particleCount: 20
    },
    scorePopup: {
        life: 60
    },
    glitch: {
        minInterval: 120,      // Min frames between glitches
        probability: 0.02,     // Chance per eligible frame
        minDuration: 50,       // Min ms duration
        maxDuration: 150       // Max ms duration
    }
};

// ============================================
// SCREEN SHAKE SETTINGS
// ============================================
export const SHAKE_CONFIG = {
    collision: { intensity: 15, duration: 300 },
    landing: { intensity: 3, duration: 100 },
    nearMiss: { intensity: 2, duration: 80 },
    explosion: { intensity: 20, duration: 400 }
};

// ============================================
// NEAR MISS DETECTION
// ============================================
export const NEAR_MISS_THRESHOLD = 15; // Pixels

// ============================================
// BRANDING
// ============================================
export const KAIROSS_BRANDING = "KAIROSS.IN";

// ============================================
// DIALOGUE PHRASES
// ============================================
export const VENOM_PHRASES = ['WE ARE VENOM!', 'HUNGRY!', 'OURS!', 'LETHAL!', 'TEETH!', 'CHOMP!'];
export const GOBLIN_PHRASES = ['HAHAHA!', 'CATCH!', 'SURPRISE!', 'BOOM!', 'TOO SLOW!'];

// ============================================
// ONOMATOPOEIA
// ============================================
export const ONOMATOPOEIA = {
    jump: ['THWIP!', 'WHOOSH!', 'HUP!'],
    land: ['THUD!', 'STOMP!'],
    hit: ['CRASH!', 'WHAM!', 'POW!', 'SPLAT!'],
    electric: ['ZZZAP!', 'CRACKLE!', 'BZZT!'],
    bomb: ['KABOOM!', 'BOOM!', 'BLAM!'],
    nearMiss: ['CLOSE!', 'WHEW!', 'NICE!'],
    score: ['YEAH!', 'BONUS!', 'SICK!']
};

// ============================================
// GAME SETTINGS STATE (mutable)
// ============================================
export const gameSettings = {
    animationStyle: 'spiderverse',
    quality: 'high',
    soundEnabled: true
};

// Load saved settings from localStorage
export function loadSettings() {
    try {
        const saved = localStorage.getItem('symbioteSettings');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(gameSettings, parsed);
        }
    } catch (e) {
        console.warn('Could not load settings:', e);
    }
}

// Save settings to localStorage
export function saveSettings() {
    try {
        localStorage.setItem('symbioteSettings', JSON.stringify(gameSettings));
    } catch (e) {
        console.warn('Could not save settings:', e);
    }
}

// Get current quality config
export function getCurrentQuality() {
    return QUALITY_SETTINGS[gameSettings.quality] || QUALITY_SETTINGS.high;
}

// Get current animation frame skip
export function getFrameSkip() {
    const style = ANIMATION_STYLES[gameSettings.animationStyle] || ANIMATION_STYLES.spiderverse;
    return style.frameSkip;
}
