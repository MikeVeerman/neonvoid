/**
 * Powerup.js - Collectible powerup entities
 * Types: health (+25 HP), laser (3x bullet size for 50 shots)
 */

const POWERUP_TYPES = {
    HEALTH: 'health',
    LASER: 'laser'
};

class Powerup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        const texture = type === POWERUP_TYPES.HEALTH ? 'powerup_health' : 'powerup_laser';
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;

        // Scale down 512px sprite to 32px game size
        this.setScale(32 / 512);

        // Slow downward drift
        this.setVelocity(0, 50);

        // Add bobbing animation
        scene.tweens.add({
            targets: this,
            y: y + 10,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add glow effect
        scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Apply powerup effect to player
     */
    collect(player) {
        if (this.type === POWERUP_TYPES.HEALTH) {
            // Health powerup: +25 HP, capped at max
            player.health = Math.min(
                player.health + 25,
                GAME_CONFIG.PLAYER.MAX_HEALTH
            );
        } else if (this.type === POWERUP_TYPES.LASER) {
            // Laser powerup: 3x bullet size for 50 shots
            player.laserShotsRemaining = 50;
        }

        this.destroy();
    }

    /**
     * Check if powerup is off screen
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y > GAME_CONFIG.HEIGHT + 50) {
            this.destroy();
        }
    }
}

/**
 * PowerupManager - Handles powerup spawning and collection
 */
class PowerupManager {
    constructor(scene) {
        this.scene = scene;
        this.powerups = scene.add.group();
    }

    /**
     * Get the powerup group for collision detection
     */
    getGroup() {
        return this.powerups;
    }

    /**
     * Spawn a random powerup at position (10% chance)
     */
    trySpawn(x, y) {
        // 10% chance to spawn
        if (Math.random() > 0.10) return null;

        // 50/50 chance for health or laser
        const type = Math.random() < 0.5 ? POWERUP_TYPES.HEALTH : POWERUP_TYPES.LASER;

        const powerup = new Powerup(this.scene, x, y, type);
        this.powerups.add(powerup);

        return powerup;
    }

    /**
     * Clear all powerups
     */
    reset() {
        this.powerups.clear(true, true);
    }
}
