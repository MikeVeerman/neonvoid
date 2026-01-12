/**
 * Bullet.js - Bullet entity and bullet pool management
 * Handles both player and enemy projectiles
 */

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, isPlayerBullet = true) {
        const texture = isPlayerBullet ? 'bullet_player' : 'bullet_enemy';
        super(scene, x, y, texture);

        this.isPlayerBullet = isPlayerBullet;
        this.damage = isPlayerBullet
            ? GAME_CONFIG.BULLETS.PLAYER_DAMAGE
            : GAME_CONFIG.BULLETS.ENEMY_DAMAGE;

        // Scale down 512px sprite to 24px game size (1.5x larger)
        this.setScale(24 / 512);
    }

    /**
     * Fire the bullet from a position with given velocity
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} velocityX - X velocity
     * @param {number} velocityY - Y velocity
     * @param {boolean} isPlayer - True if fired by player
     */
    fire(x, y, velocityX, velocityY, isPlayer = true) {
        this.isPlayerBullet = isPlayer;
        this.damage = isPlayer
            ? GAME_CONFIG.BULLETS.PLAYER_DAMAGE
            : GAME_CONFIG.BULLETS.ENEMY_DAMAGE;

        // Set the correct texture based on bullet type
        this.setTexture(isPlayer ? 'bullet_player' : 'bullet_enemy');

        // Position and enable the bullet
        if (this.body) {
            this.body.reset(x, y);
        } else {
            this.setPosition(x, y);
        }
        this.setActive(true);
        this.setVisible(true);

        // Set velocity
        this.setVelocity(velocityX, velocityY);

        // Rotate bullet to face direction of travel
        this.setRotation(Math.atan2(velocityY, velocityX) + Math.PI / 2);
    }

    /**
     * Disable the bullet (return to pool)
     */
    kill() {
        this.setActive(false);
        this.setVisible(false);
        if (this.body) {
            this.body.stop();
        }
    }

    /**
     * Called every frame - check if bullet is out of bounds
     */
    preUpdate(time, delta) {
        if (!this.active) return;

        super.preUpdate(time, delta);

        // Deactivate if off screen
        if (this.y < -20 || this.y > GAME_CONFIG.HEIGHT + 20 ||
            this.x < -20 || this.x > GAME_CONFIG.WIDTH + 20) {
            this.kill();
        }
    }
}

/**
 * BulletPool - Manages a pool of reusable bullets
 * Prevents garbage collection from creating stutters
 */
class BulletPool extends Phaser.Physics.Arcade.Group {
    constructor(scene, isPlayerPool = true) {
        super(scene.physics.world, scene);

        this.isPlayerPool = isPlayerPool;
        this.scene = scene;

        // Create bullets manually with the correct texture
        const texture = isPlayerPool ? 'bullet_player' : 'bullet_enemy';
        for (let i = 0; i < GAME_CONFIG.BULLETS.POOL_SIZE; i++) {
            const bullet = new Bullet(scene, 0, 0, isPlayerPool);
            bullet.setActive(false);
            bullet.setVisible(false);
            scene.add.existing(bullet);
            scene.physics.add.existing(bullet);
            this.add(bullet);
        }

        // Set physics properties for all bullets in pool
        this.children.iterate((bullet) => {
            bullet.setScale(24 / 512);  // 1.5x larger
            bullet.body.setSize(128, 128); // Hitbox relative to original image size
            bullet.body.setOffset(192, 192);
        });
    }

    /**
     * Fire a bullet from the pool
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} velocityX - X velocity (default 0)
     * @param {number} velocityY - Y velocity (default based on pool type)
     * @returns {Bullet|null} The fired bullet, or null if pool exhausted
     */
    fire(x, y, velocityX = 0, velocityY = null) {
        // Get first inactive bullet from pool
        const bullet = this.getFirstDead(false);

        if (bullet) {
            // Default velocity based on pool type
            if (velocityY === null) {
                velocityY = this.isPlayerPool
                    ? -GAME_CONFIG.BULLETS.PLAYER_SPEED
                    : GAME_CONFIG.BULLETS.ENEMY_SPEED;
            }

            bullet.fire(x, y, velocityX, velocityY, this.isPlayerPool);
            return bullet;
        }

        return null;
    }

    /**
     * Fire a bullet aimed at a target
     * @param {number} fromX - Start X position
     * @param {number} fromY - Start Y position
     * @param {number} toX - Target X position
     * @param {number} toY - Target Y position
     * @param {number} speed - Bullet speed
     * @returns {Bullet|null} The fired bullet
     */
    fireAt(fromX, fromY, toX, toY, speed = null) {
        const bullet = this.getFirstDead(false);

        if (bullet) {
            const bulletSpeed = speed || (this.isPlayerPool
                ? GAME_CONFIG.BULLETS.PLAYER_SPEED
                : GAME_CONFIG.BULLETS.ENEMY_SPEED);

            // Calculate direction vector
            const dx = toX - fromX;
            const dy = toY - fromY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalize and apply speed
            const velocityX = (dx / distance) * bulletSpeed;
            const velocityY = (dy / distance) * bulletSpeed;

            bullet.fire(fromX, fromY, velocityX, velocityY, this.isPlayerPool);
            return bullet;
        }

        return null;
    }
}
