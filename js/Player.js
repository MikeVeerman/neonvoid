/**
 * Player.js - Player spaceship entity
 * Handles movement, shooting, health, and invincibility
 */

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player', 0);

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Player state
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.isInvincible = false;
        this.canShoot = true;
        this.isThrusting = false;

        // Configure physics body - scale down 512px sprite to 48px game size (1.5x larger)
        this.setScale(48 / 512);
        this.body.setSize(320, 384); // Hitbox relative to original image size
        this.body.setOffset(96, 64);
        this.setCollideWorldBounds(true);

        // Store reference to bullet pool (set by scene)
        this.bulletPool = null;

        // Input references (set by scene)
        this.cursors = null;
        this.wasd = null;
        this.fireKey = null;
    }

    /**
     * Set up input handlers
     */
    setupInput(cursors, wasd, fireKey) {
        this.cursors = cursors;
        this.wasd = wasd;
        this.fireKey = fireKey;
    }

    /**
     * Set the bullet pool reference
     */
    setBulletPool(bulletPool) {
        this.bulletPool = bulletPool;
    }

    /**
     * Called every frame - handle input and movement
     */
    update(time, delta) {
        if (!this.active) return;

        this.handleMovement();
        this.handleShooting(time);
    }

    /**
     * Process movement input
     */
    handleMovement() {
        const speed = GAME_CONFIG.PLAYER.SPEED;
        let velocityX = 0;
        let velocityY = 0;

        // Check arrow keys and WASD
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        // Calculate velocity
        if (left) velocityX = -speed;
        else if (right) velocityX = speed;

        if (up) velocityY = -speed;
        else if (down) velocityY = speed;

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707; // 1/sqrt(2)
            velocityY *= 0.707;
        }

        this.setVelocity(velocityX, velocityY);

        // Track if player is moving (for animation)
        this.isThrusting = velocityX !== 0 || velocityY !== 0;
    }

    /**
     * Process shooting input
     */
    handleShooting(time) {
        if (this.fireKey.isDown && this.canShoot && this.bulletPool) {
            this.shoot();
            this.canShoot = false;

            // Fire rate limiter
            this.scene.time.delayedCall(
                GAME_CONFIG.PLAYER.FIRE_RATE,
                () => { this.canShoot = true; }
            );
        }
    }

    /**
     * Fire a bullet
     */
    shoot() {
        // Fire from front of ship
        const bulletX = this.x;
        const bulletY = this.y - 15;

        this.bulletPool.fire(bulletX, bulletY);

        // Optional: slight recoil effect
        this.y += 2;
    }

    /**
     * Take damage from enemy or bullet
     * @param {number} amount - Damage amount
     * @returns {boolean} True if player died
     */
    takeDamage(amount) {
        if (this.isInvincible || !this.active) return false;

        this.health -= amount;

        // Flash effect
        this.flashDamage();

        // Start invincibility period
        this.startInvincibility();

        // Check for death
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Visual feedback when taking damage
     */
    flashDamage() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
        });
    }

    /**
     * Start invincibility period after taking damage
     */
    startInvincibility() {
        this.isInvincible = true;

        // Flashing effect during invincibility
        this.invincibilityTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.5 },
            duration: 100,
            yoyo: true,
            repeat: -1,
        });

        // End invincibility after duration
        this.scene.time.delayedCall(
            GAME_CONFIG.PLAYER.INVINCIBILITY_DURATION,
            () => {
                this.isInvincible = false;
                if (this.invincibilityTween) {
                    this.invincibilityTween.stop();
                }
                this.setAlpha(1);
            }
        );
    }

    /**
     * Handle player death
     */
    die() {
        // Disable physics and input
        this.setActive(false);
        this.body.enable = false;

        // Play explosion at player position
        this.scene.events.emit('playerDied', this.x, this.y);

        // Hide after brief delay
        this.scene.time.delayedCall(100, () => {
            this.setVisible(false);
        });
    }

    /**
     * Reset player for new game
     */
    reset() {
        this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.isInvincible = false;
        this.canShoot = true;

        this.setPosition(
            GAME_CONFIG.PLAYER.START_X,
            GAME_CONFIG.PLAYER.START_Y
        );

        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.setAlpha(1);
        this.setVelocity(0, 0);
    }
}
