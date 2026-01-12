/**
 * Enemy.js - Enemy entities and spawning logic
 * Contains EnemyA (chaser), EnemyB (shooter), and EnemyManager
 */

/**
 * Base Enemy class - shared functionality
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.health = 50;
        this.scoreValue = 100;
        this.speed = 100;

        // Reference to player for targeting
        this.player = null;

        // Configure physics - scale down 512px sprite to 48px game size (1.5x larger)
        this.setScale(48 / 512);
        this.body.setSize(384, 384); // Hitbox relative to original image size
        this.body.setOffset(64, 64);
    }

    /**
     * Set target player reference
     */
    setTarget(player) {
        this.player = player;
    }

    /**
     * Take damage from player bullet
     * @param {number} amount - Damage amount
     * @returns {boolean} True if enemy died
     */
    takeDamage(amount) {
        this.health -= amount;

        // Flash white on hit
        this.setTint(0xFFFFFF);
        this.scene.time.delayedCall(50, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Handle enemy death
     */
    die() {
        if (!this.active) return;  // Prevent double-death

        // Store values before destroying
        const x = this.x;
        const y = this.y;
        const score = this.scoreValue;
        const scene = this.scene;

        // Deactivate first to prevent further collisions
        this.setActive(false);
        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
        }

        // Emit death event for explosion and score
        scene.events.emit('enemyDied', x, y, score);

        // Destroy after event
        this.destroy();
    }

    /**
     * Check if enemy is off screen (for cleanup)
     */
    isOffScreen() {
        const margin = 50;
        return (
            this.y > GAME_CONFIG.HEIGHT + margin ||
            this.y < -margin ||
            this.x < -margin ||
            this.x > GAME_CONFIG.WIDTH + margin
        );
    }
}

/**
 * EnemyA - Chaser type that follows the player
 */
class EnemyA extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_a');

        this.health = GAME_CONFIG.ENEMIES.TYPE_A.HEALTH;
        this.scoreValue = GAME_CONFIG.ENEMIES.TYPE_A.SCORE;
        this.speed = GAME_CONFIG.ENEMIES.TYPE_A.SPEED;
        this.chaseAccuracy = GAME_CONFIG.ENEMIES.TYPE_A.CHASE_ACCURACY;

        // Current direction (normalized)
        this.directionX = 0;
        this.directionY = 1;
    }

    /**
     * Update - chase the player
     */
    update(time, delta) {
        if (!this.active || !this.player || !this.player.active) {
            // Move straight down if no target
            this.setVelocity(0, this.speed);
            return;
        }

        // Calculate direction to player
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Target direction (normalized)
            const targetDirX = dx / distance;
            const targetDirY = dy / distance;

            // Smoothly interpolate toward target direction
            this.directionX += (targetDirX - this.directionX) * this.chaseAccuracy * delta;
            this.directionY += (targetDirY - this.directionY) * this.chaseAccuracy * delta;

            // Normalize the direction
            const dirMag = Math.sqrt(
                this.directionX * this.directionX +
                this.directionY * this.directionY
            );

            if (dirMag > 0) {
                this.directionX /= dirMag;
                this.directionY /= dirMag;
            }
        }

        // Apply velocity
        this.setVelocity(
            this.directionX * this.speed,
            this.directionY * this.speed
        );

        // Rotate to face direction of movement
        this.setRotation(Math.atan2(this.directionY, this.directionX) + Math.PI / 2);
    }
}

/**
 * EnemyB - Shooter type that moves slowly and fires at player
 */
class EnemyB extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_b');

        this.health = GAME_CONFIG.ENEMIES.TYPE_B.HEALTH;
        this.scoreValue = GAME_CONFIG.ENEMIES.TYPE_B.SCORE;
        this.speed = GAME_CONFIG.ENEMIES.TYPE_B.SPEED;
        this.fireRate = GAME_CONFIG.ENEMIES.TYPE_B.FIRE_RATE;

        // Shooting state
        this.canShoot = true;
        this.lastShotTime = 0;

        // Reference to bullet pool (set by manager)
        this.bulletPool = null;

        // Movement pattern
        this.horizontalDirection = Math.random() > 0.5 ? 1 : -1;
        this.enteredScreen = false;
    }

    /**
     * Set the bullet pool for shooting
     */
    setBulletPool(bulletPool) {
        this.bulletPool = bulletPool;
    }

    /**
     * Update - move and shoot
     */
    update(time, delta) {
        if (!this.active) return;

        // Movement: Enter screen, then move side to side
        if (!this.enteredScreen) {
            // Move down until on screen
            this.setVelocity(0, this.speed);

            if (this.y > 80) {
                this.enteredScreen = true;
            }
        } else {
            // Side to side movement
            this.setVelocity(this.horizontalDirection * this.speed * 1.5, this.speed * 0.3);

            // Bounce off screen edges
            if (this.x < 40) {
                this.horizontalDirection = 1;
            } else if (this.x > GAME_CONFIG.WIDTH - 40) {
                this.horizontalDirection = -1;
            }
        }

        // Shooting logic
        this.handleShooting(time);
    }

    /**
     * Handle shooting at player
     */
    handleShooting(time) {
        if (!this.bulletPool || !this.player || !this.player.active) return;

        // Check fire rate
        if (time - this.lastShotTime < this.fireRate) return;

        // Only shoot if on screen
        if (this.y < 20 || this.y > GAME_CONFIG.HEIGHT - 20) return;

        // Fire at player
        this.bulletPool.fireAt(
            this.x,
            this.y + 16,
            this.player.x,
            this.player.y,
            GAME_CONFIG.BULLETS.ENEMY_SPEED
        );

        this.lastShotTime = time;
    }
}

/**
 * EnemyManager - Handles spawning and wave management
 */
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.add.group();
        this.player = null;
        this.enemyBulletPool = null;

        // Wave state
        this.currentWave = 0;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesPerWave = GAME_CONFIG.WAVES.ENEMIES_PER_WAVE_BASE;
        this.isSpawning = false;
        this.waveInProgress = false;

        // Spawn timing
        this.spawnTimer = null;
        this.waveTimer = null;
    }

    /**
     * Set references needed for enemy behavior
     */
    setReferences(player, enemyBulletPool) {
        this.player = player;
        this.enemyBulletPool = enemyBulletPool;
    }

    /**
     * Get the enemy group for collision detection
     */
    getGroup() {
        return this.enemies;
    }

    /**
     * Start the first wave
     */
    startWaves() {
        this.currentWave = 0;
        this.startNextWave();
    }

    /**
     * Begin the next wave
     */
    startNextWave() {
        this.currentWave++;
        this.enemiesSpawnedThisWave = 0;
        this.waveInProgress = true;

        // Calculate enemies for this wave
        this.enemiesPerWave = GAME_CONFIG.WAVES.ENEMIES_PER_WAVE_BASE +
            (this.currentWave - 1) * GAME_CONFIG.WAVES.ENEMIES_PER_WAVE_INCREMENT;

        // Emit wave start event
        this.scene.events.emit('waveStart', this.currentWave);

        // Start spawning enemies
        this.isSpawning = true;
        this.scheduleNextSpawn();
    }

    /**
     * Schedule the next enemy spawn
     */
    scheduleNextSpawn() {
        if (!this.isSpawning) return;

        // Variable delay based on wave
        const baseDelay = 1500;
        const minDelay = 500;
        const delay = Math.max(minDelay, baseDelay - this.currentWave * 100);

        this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.spawnEnemy();
        });
    }

    /**
     * Spawn a single enemy
     */
    spawnEnemy() {
        if (!this.isSpawning) return;

        // Check if we've spawned enough for this wave
        if (this.enemiesSpawnedThisWave >= this.enemiesPerWave) {
            this.isSpawning = false;
            return;
        }

        // Check max enemies on screen
        const activeEnemies = this.enemies.getChildren().filter(e => e.active).length;
        if (activeEnemies >= GAME_CONFIG.WAVES.MAX_ENEMIES_ON_SCREEN) {
            // Wait and try again
            this.scheduleNextSpawn();
            return;
        }

        // Random spawn position at top of screen
        const x = Phaser.Math.Between(50, GAME_CONFIG.WIDTH - 50);
        const y = -30;

        // Choose enemy type based on wave and randomness
        const typeB_chance = Math.min(0.4, 0.1 + this.currentWave * 0.05);
        const isTypeB = Math.random() < typeB_chance;

        let enemy;
        if (isTypeB) {
            enemy = new EnemyB(this.scene, x, y);
            enemy.setBulletPool(this.enemyBulletPool);
        } else {
            enemy = new EnemyA(this.scene, x, y);
        }

        enemy.setTarget(this.player);
        this.enemies.add(enemy);

        this.enemiesSpawnedThisWave++;

        // Schedule next spawn
        this.scheduleNextSpawn();
    }

    /**
     * Update all enemies
     */
    update(time, delta) {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.update(time, delta);

                // Clean up enemies that go off screen (bottom)
                if (enemy.y > GAME_CONFIG.HEIGHT + 100) {
                    enemy.destroy();
                }
            }
        });

        // Check if wave is complete (all enemies spawned and destroyed)
        if (this.waveInProgress && !this.isSpawning) {
            const activeEnemies = this.enemies.getChildren().filter(e => e.active).length;

            if (activeEnemies === 0) {
                this.waveInProgress = false;
                this.scene.events.emit('waveComplete', this.currentWave);

                // Start next wave after delay
                this.waveTimer = this.scene.time.delayedCall(
                    GAME_CONFIG.WAVES.BETWEEN_WAVES_DELAY,
                    () => {
                        this.startNextWave();
                    }
                );
            }
        }
    }

    /**
     * Stop all spawning (for game over)
     */
    stop() {
        this.isSpawning = false;
        this.waveInProgress = false;

        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        if (this.waveTimer) {
            this.waveTimer.remove();
        }
    }

    /**
     * Clear all enemies and reset state
     */
    reset() {
        this.stop();

        // Destroy all enemies
        this.enemies.clear(true, true);

        this.currentWave = 0;
        this.enemiesSpawnedThisWave = 0;
    }
}
