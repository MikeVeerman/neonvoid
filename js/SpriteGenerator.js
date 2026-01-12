/**
 * SpriteGenerator - Programmatic Pixel Art Sprite Generation
 * Generates all game sprites using Canvas API
 * These match the AI prompt specifications for visual consistency
 */

class SpriteGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Generate all sprite sheets and register them with Phaser
     */
    generateAllSprites() {
        this.generatePlayerSheet();
        this.generateEnemyASheet();
        this.generateEnemyBSheet();
        this.generateBulletSheet();
        this.generateExplosionSheet();
        this.generateBackground();
        this.generateStarfield();
    }

    /**
     * Helper: Create a canvas and get its context
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
        return { canvas, ctx };
    }

    /**
     * Helper: Convert hex color to RGB string
     */
    hexToRgb(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Helper: Draw a pixel (scaled for visibility)
     */
    drawPixel(ctx, x, y, color, scale = 1) {
        ctx.fillStyle = typeof color === 'number' ? this.hexToRgb(color) : color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
    }

    /**
     * Generate Player Ship Sprite Sheet (128x64, 4x2 grid of 32x32 sprites)
     * Row 1: Idle animation (4 frames)
     * Row 2: Thrust animation (4 frames)
     */
    generatePlayerSheet() {
        const size = 32;
        const { canvas, ctx } = this.createCanvas(size * 4, size * 2);
        const C = GAME_CONFIG.COLORS;

        // Draw 4 idle frames (top row)
        for (let frame = 0; frame < 4; frame++) {
            const offsetX = frame * size;
            const pulseIntensity = Math.sin(frame * Math.PI / 2) * 0.3 + 0.7;
            this.drawPlayerShip(ctx, offsetX, 0, size, pulseIntensity, false);
        }

        // Draw 4 thrust frames (bottom row)
        for (let frame = 0; frame < 4; frame++) {
            const offsetX = frame * size;
            const thrustIntensity = (frame + 1) / 4;
            this.drawPlayerShip(ctx, offsetX, size, size, 1, true, thrustIntensity);
        }

        // Add to Phaser's texture manager
        this.scene.textures.addSpriteSheet('player', canvas, {
            frameWidth: size,
            frameHeight: size,
        });
    }

    /**
     * Draw a single player ship frame
     */
    drawPlayerShip(ctx, offsetX, offsetY, size, cockpitGlow, hasThrust, thrustIntensity = 1) {
        const C = GAME_CONFIG.COLORS;
        const cx = offsetX + size / 2;
        const cy = offsetY + size / 2;

        // Ship body - triangular shape pointing up
        ctx.fillStyle = this.hexToRgb(C.PLAYER_SECONDARY);
        ctx.beginPath();
        ctx.moveTo(cx, offsetY + 4);           // Top point
        ctx.lineTo(cx - 10, offsetY + 26);     // Bottom left
        ctx.lineTo(cx + 10, offsetY + 26);     // Bottom right
        ctx.closePath();
        ctx.fill();

        // Ship inner hull
        ctx.fillStyle = this.hexToRgb(C.PLAYER_PRIMARY);
        ctx.beginPath();
        ctx.moveTo(cx, offsetY + 7);
        ctx.lineTo(cx - 7, offsetY + 23);
        ctx.lineTo(cx + 7, offsetY + 23);
        ctx.closePath();
        ctx.fill();

        // Wing accents
        ctx.fillStyle = this.hexToRgb(C.PLAYER_SECONDARY);
        ctx.fillRect(cx - 12, offsetY + 18, 5, 8);
        ctx.fillRect(cx + 7, offsetY + 18, 5, 8);

        // Cockpit with glow effect
        const glowAlpha = 0.5 + cockpitGlow * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(cx, offsetY + 14, 3, 0, Math.PI * 2);
        ctx.fill();

        // Engine ports
        ctx.fillStyle = this.hexToRgb(C.PLAYER_ENGINE);
        ctx.fillRect(cx - 4, offsetY + 24, 3, 3);
        ctx.fillRect(cx + 1, offsetY + 24, 3, 3);

        // Thrust flames
        if (hasThrust) {
            const flameLength = 4 + thrustIntensity * 6;
            const gradient = ctx.createLinearGradient(
                cx, offsetY + 27,
                cx, offsetY + 27 + flameLength
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(0, 191, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');

            ctx.fillStyle = gradient;
            // Left flame
            ctx.beginPath();
            ctx.moveTo(cx - 4, offsetY + 27);
            ctx.lineTo(cx - 2.5, offsetY + 27 + flameLength);
            ctx.lineTo(cx - 1, offsetY + 27);
            ctx.fill();
            // Right flame
            ctx.beginPath();
            ctx.moveTo(cx + 1, offsetY + 27);
            ctx.lineTo(cx + 2.5, offsetY + 27 + flameLength);
            ctx.lineTo(cx + 4, offsetY + 27);
            ctx.fill();
        }
    }

    /**
     * Generate Enemy Type A (Chaser) Sprite Sheet (128x32, 4x1 grid)
     */
    generateEnemyASheet() {
        const size = 32;
        const { canvas, ctx } = this.createCanvas(size * 4, size);
        const C = GAME_CONFIG.COLORS;

        for (let frame = 0; frame < 4; frame++) {
            const offsetX = frame * size;
            const pulsePhase = frame / 4;
            this.drawEnemyA(ctx, offsetX, 0, size, pulsePhase);
        }

        this.scene.textures.addSpriteSheet('enemy_a', canvas, {
            frameWidth: size,
            frameHeight: size,
        });
    }

    /**
     * Draw a single Enemy Type A frame - Diamond shaped chaser
     */
    drawEnemyA(ctx, offsetX, offsetY, size, pulsePhase) {
        const C = GAME_CONFIG.COLORS;
        const cx = offsetX + size / 2;
        const cy = offsetY + size / 2;

        // Outer diamond shape
        ctx.fillStyle = this.hexToRgb(C.ENEMY_A_PRIMARY);
        ctx.beginPath();
        ctx.moveTo(cx, offsetY + 4);      // Top
        ctx.lineTo(cx + 12, cy);          // Right
        ctx.lineTo(cx, offsetY + 28);     // Bottom
        ctx.lineTo(cx - 12, cy);          // Left
        ctx.closePath();
        ctx.fill();

        // Inner diamond
        ctx.fillStyle = this.hexToRgb(C.ENEMY_A_SECONDARY);
        ctx.beginPath();
        ctx.moveTo(cx, offsetY + 8);
        ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx, offsetY + 24);
        ctx.lineTo(cx - 8, cy);
        ctx.closePath();
        ctx.fill();

        // Pulsing core
        const coreSize = 4 + Math.sin(pulsePhase * Math.PI * 2) * 2;
        const coreAlpha = 0.6 + Math.sin(pulsePhase * Math.PI * 2) * 0.4;

        // Core glow
        ctx.fillStyle = `rgba(148, 0, 211, ${coreAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize + 2, 0, Math.PI * 2);
        ctx.fill();

        // Core center
        ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // Accent spikes
        ctx.fillStyle = this.hexToRgb(C.ENEMY_A_PRIMARY);
        // Top spike
        ctx.fillRect(cx - 1, offsetY + 1, 2, 4);
        // Bottom spike
        ctx.fillRect(cx - 1, offsetY + 27, 2, 4);
    }

    /**
     * Generate Enemy Type B (Shooter) Sprite Sheet (128x32, 4x1 grid)
     */
    generateEnemyBSheet() {
        const size = 32;
        const { canvas, ctx } = this.createCanvas(size * 4, size);

        for (let frame = 0; frame < 4; frame++) {
            const offsetX = frame * size;
            const rotationPhase = frame / 4;
            this.drawEnemyB(ctx, offsetX, 0, size, rotationPhase);
        }

        this.scene.textures.addSpriteSheet('enemy_b', canvas, {
            frameWidth: size,
            frameHeight: size,
        });
    }

    /**
     * Draw a single Enemy Type B frame - Hexagonal turret
     */
    drawEnemyB(ctx, offsetX, offsetY, size, rotationPhase) {
        const C = GAME_CONFIG.COLORS;
        const cx = offsetX + size / 2;
        const cy = offsetY + size / 2;
        const radius = 11;

        // Draw hexagonal base
        ctx.fillStyle = this.hexToRgb(C.ENEMY_B_PRIMARY);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI / 3) - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Inner hexagon
        ctx.fillStyle = this.hexToRgb(C.ENEMY_B_SECONDARY);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI / 3) - Math.PI / 2;
            const x = cx + Math.cos(angle) * (radius - 4);
            const y = cy + Math.sin(angle) * (radius - 4);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Rotating turret barrels
        const turretAngle = rotationPhase * Math.PI * 2;
        ctx.fillStyle = this.hexToRgb(C.ENEMY_A_PRIMARY);

        for (let i = 0; i < 3; i++) {
            const angle = turretAngle + (i * Math.PI * 2 / 3);
            const barrelX = cx + Math.cos(angle) * 8;
            const barrelY = cy + Math.sin(angle) * 8;

            ctx.beginPath();
            ctx.arc(barrelX, barrelY, 3, 0, Math.PI * 2);
            ctx.fill();

            // Barrel glow
            ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(barrelX, barrelY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.hexToRgb(C.ENEMY_A_PRIMARY);
        }

        // Center eye
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Generate Bullet Sprite Sheet (32x16, 2x1 grid)
     * Frame 0: Player bullet (yellow/orange)
     * Frame 1: Enemy bullet (red/crimson)
     */
    generateBulletSheet() {
        const size = 16;
        const { canvas, ctx } = this.createCanvas(size * 2, size);
        const C = GAME_CONFIG.COLORS;

        // Player bullet (frame 0)
        this.drawBullet(ctx, 0, 0, size, C.BULLET_PLAYER, C.BULLET_PLAYER_GLOW);

        // Enemy bullet (frame 1)
        this.drawBullet(ctx, size, 0, size, C.BULLET_ENEMY, C.BULLET_ENEMY_GLOW);

        this.scene.textures.addSpriteSheet('bullets', canvas, {
            frameWidth: size,
            frameHeight: size,
        });
    }

    /**
     * Draw a single bullet
     */
    drawBullet(ctx, offsetX, offsetY, size, coreColor, glowColor) {
        const cx = offsetX + size / 2;
        const cy = offsetY + size / 2;

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
        gradient.addColorStop(0, this.hexToRgb(coreColor));
        gradient.addColorStop(0.5, this.hexToRgb(glowColor));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, offsetY, size, size);

        // Core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = this.hexToRgb(coreColor);
        ctx.beginPath();
        ctx.ellipse(cx, cy, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Generate Explosion Sprite Sheet (512x64, 8x1 grid of 64x64 sprites)
     */
    generateExplosionSheet() {
        const size = 64;
        const { canvas, ctx } = this.createCanvas(size * 8, size);
        const C = GAME_CONFIG.COLORS;

        for (let frame = 0; frame < 8; frame++) {
            const offsetX = frame * size;
            const progress = frame / 7; // 0 to 1
            this.drawExplosion(ctx, offsetX, 0, size, progress);
        }

        this.scene.textures.addSpriteSheet('explosion', canvas, {
            frameWidth: size,
            frameHeight: size,
        });
    }

    /**
     * Draw a single explosion frame
     */
    drawExplosion(ctx, offsetX, offsetY, size, progress) {
        const cx = offsetX + size / 2;
        const cy = offsetY + size / 2;

        // Explosion expands then fades
        const maxRadius = 28;
        const radius = progress < 0.5
            ? progress * 2 * maxRadius
            : maxRadius;

        const alpha = progress < 0.5
            ? 1
            : 1 - (progress - 0.5) * 2;

        if (alpha <= 0) return;

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.2, `rgba(255, 255, 0, ${alpha * 0.9})`);
        gradient.addColorStop(0.4, `rgba(255, 165, 0, ${alpha * 0.7})`);
        gradient.addColorStop(0.7, `rgba(255, 69, 0, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Add some particle debris for later frames
        if (progress > 0.3) {
            const particleCount = 8;
            const particleAlpha = alpha * 0.7;
            ctx.fillStyle = `rgba(255, 200, 100, ${particleAlpha})`;

            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const dist = radius * (0.6 + progress * 0.4);
                const px = cx + Math.cos(angle) * dist;
                const py = cy + Math.sin(angle) * dist;
                const pSize = 2 * (1 - progress);

                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Generate seamless background tile
     */
    generateBackground() {
        const size = 128;
        const { canvas, ctx } = this.createCanvas(size, size);

        // Base color - deep space blue
        ctx.fillStyle = '#0A0A1A';
        ctx.fillRect(0, 0, size, size);

        // Add subtle nebula wisps
        for (let i = 0; i < 3; i++) {
            const gradient = ctx.createRadialGradient(
                Math.random() * size, Math.random() * size, 0,
                Math.random() * size, Math.random() * size, 60
            );
            gradient.addColorStop(0, 'rgba(75, 0, 130, 0.1)');
            gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
        }

        // Add distant stars (single pixels)
        const starColors = ['#FFFFFF', '#ADD8E6', '#E6E6FA'];
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];
            ctx.globalAlpha = 0.3 + Math.random() * 0.7;
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1;

        this.scene.textures.addImage('background', canvas);
    }

    /**
     * Generate starfield for parallax scrolling
     */
    generateStarfield() {
        const size = 256;
        const { canvas, ctx } = this.createCanvas(size, size);

        // Transparent background
        ctx.clearRect(0, 0, size, size);

        // Add stars of varying sizes and brightness
        const starColors = ['#FFFFFF', '#ADD8E6', '#E6E6FA', '#FFF8DC'];

        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];
            ctx.globalAlpha = 0.4 + Math.random() * 0.6;

            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            const starSize = Math.random() > 0.8 ? 2 : 1;

            ctx.fillRect(x, y, starSize, starSize);
        }
        ctx.globalAlpha = 1;

        this.scene.textures.addImage('starfield', canvas);
    }
}
