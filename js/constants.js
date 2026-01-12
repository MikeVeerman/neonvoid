/**
 * Game Constants - Neon Void Arcade Shooter
 * All configurable values in one place for easy tuning
 */

const GAME_CONFIG = {
    // Display settings
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: 0x0A0A1A,

    // Player settings
    PLAYER: {
        SPEED: 300,
        MAX_HEALTH: 100,
        INVINCIBILITY_DURATION: 1500, // ms after taking damage
        START_X: 400,
        START_Y: 500,
        FIRE_RATE: 150, // ms between shots
    },

    // Bullet settings
    BULLETS: {
        PLAYER_SPEED: 600,
        PLAYER_DAMAGE: 25,
        ENEMY_SPEED: 300,
        ENEMY_DAMAGE: 20,
        POOL_SIZE: 50,
    },

    // Enemy settings
    ENEMIES: {
        TYPE_A: {
            SPEED: 120,
            HEALTH: 50,
            SCORE: 100,
            CHASE_ACCURACY: 0.02, // How quickly they turn toward player
        },
        TYPE_B: {
            SPEED: 60,
            HEALTH: 75,
            SCORE: 150,
            FIRE_RATE: 2000, // ms between shots
        },
    },

    // Wave settings
    WAVES: {
        INITIAL_DELAY: 2000, // ms before first wave
        BETWEEN_WAVES_DELAY: 3000, // ms between waves
        ENEMIES_PER_WAVE_BASE: 5,
        ENEMIES_PER_WAVE_INCREMENT: 2,
        MAX_ENEMIES_ON_SCREEN: 15,
    },

    // Sprite settings
    SPRITES: {
        PLAYER_SIZE: 32,
        ENEMY_SIZE: 32,
        BULLET_SIZE: 16,
        EXPLOSION_SIZE: 64,
    },

    // Colors (for programmatic sprite generation)
    COLORS: {
        PLAYER_PRIMARY: 0x00FFFF,    // Cyan
        PLAYER_SECONDARY: 0x008B8B,  // Teal
        PLAYER_HIGHLIGHT: 0xFFFFFF,  // White
        PLAYER_ENGINE: 0x00BFFF,     // Deep sky blue

        ENEMY_A_PRIMARY: 0xFF00FF,   // Magenta
        ENEMY_A_SECONDARY: 0xFF1493, // Hot pink
        ENEMY_A_CORE: 0x9400D3,      // Purple

        ENEMY_B_PRIMARY: 0x4B0082,   // Indigo
        ENEMY_B_SECONDARY: 0xFF00FF, // Magenta

        BULLET_PLAYER: 0xFFD700,     // Gold
        BULLET_PLAYER_GLOW: 0xFFA500,// Orange
        BULLET_ENEMY: 0xFF0000,      // Red
        BULLET_ENEMY_GLOW: 0xDC143C, // Crimson

        EXPLOSION: [0xFFFFFF, 0xFFFF00, 0xFFA500, 0xFF4500, 0xFF0000],

        STARS: [0xFFFFFF, 0xADD8E6, 0xE6E6FA],
    },

    // Animation frame counts
    ANIMATIONS: {
        PLAYER_IDLE_FRAMES: 4,
        PLAYER_THRUST_FRAMES: 4,
        ENEMY_A_FRAMES: 4,
        ENEMY_B_FRAMES: 4,
        EXPLOSION_FRAMES: 8,
    },

    // UI settings
    UI: {
        FONT_FAMILY: 'Courier New',
        SCORE_X: 20,
        SCORE_Y: 20,
        HEALTH_X: 20,
        HEALTH_Y: 50,
        WAVE_X: 400,
        WAVE_Y: 20,
    },
};

// Freeze config to prevent accidental modification
Object.freeze(GAME_CONFIG);
Object.freeze(GAME_CONFIG.PLAYER);
Object.freeze(GAME_CONFIG.BULLETS);
Object.freeze(GAME_CONFIG.ENEMIES);
Object.freeze(GAME_CONFIG.ENEMIES.TYPE_A);
Object.freeze(GAME_CONFIG.ENEMIES.TYPE_B);
Object.freeze(GAME_CONFIG.WAVES);
Object.freeze(GAME_CONFIG.SPRITES);
Object.freeze(GAME_CONFIG.COLORS);
Object.freeze(GAME_CONFIG.ANIMATIONS);
Object.freeze(GAME_CONFIG.UI);
