/**
 * main.js - Neon Void Arcade Shooter
 * Main game scene and Phaser configuration
 */

/**
 * BootScene - Loads sprites from assets folder
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load AI-generated sprites from assets folder
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('enemy_a', 'assets/sprites/enemy_a.png');
        this.load.image('enemy_b', 'assets/sprites/enemy_b.png');
        this.load.image('bullet_player', 'assets/sprites/bullet_player.png');
        this.load.image('bullet_enemy', 'assets/sprites/bullet_enemy.png');
        this.load.image('explosion', 'assets/sprites/explosion.png');
        this.load.image('background', 'assets/sprites/background.png');
        this.load.image('powerup_health', 'assets/sprites/powerup_health.png');
        this.load.image('powerup_laser', 'assets/sprites/powerup_laser.png');

        // Generate starfield programmatically (simple stars work better generated)
        this.generateStarfield();
    }

    generateStarfield() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);
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

        this.textures.addCanvas('starfield', canvas);
    }

    create() {
        // Proceed to game scene
        this.scene.start('GameScene');
    }
}

/**
 * GameScene - Main gameplay scene
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Game state
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;

        // Set up game world
        this.createBackground();
        this.createBulletPools();
        this.createPlayer();
        this.createEnemyManager();
        this.createPowerupManager();
        this.createUI();
        this.createAnimations();
        this.setupCollisions();
        this.setupEvents();

        // Start the game
        this.startGame();
    }

    /**
     * Create scrolling background and starfield
     */
    createBackground() {
        // Tiled background
        this.background = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'background'
        );
        this.background.setDepth(-10);

        // Parallax starfield (slower layer)
        this.starfield1 = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'starfield'
        );
        this.starfield1.setDepth(-9);
        this.starfield1.setAlpha(0.6);

        // Faster starfield layer
        this.starfield2 = this.add.tileSprite(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            GAME_CONFIG.WIDTH,
            GAME_CONFIG.HEIGHT,
            'starfield'
        );
        this.starfield2.setDepth(-8);
        this.starfield2.setAlpha(0.3);
        this.starfield2.setScale(0.5);
    }

    /**
     * Create bullet pools for player and enemies
     */
    createBulletPools() {
        this.playerBullets = new BulletPool(this, true);
        this.enemyBullets = new BulletPool(this, false);
    }

    /**
     * Create the player
     */
    createPlayer() {
        this.player = new Player(
            this,
            GAME_CONFIG.PLAYER.START_X,
            GAME_CONFIG.PLAYER.START_Y
        );

        // Set up player input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.player.setupInput(this.cursors, this.wasd, this.fireKey);
        this.player.setBulletPool(this.playerBullets);
    }

    /**
     * Create enemy manager
     */
    createEnemyManager() {
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.setReferences(this.player, this.enemyBullets);
    }

    /**
     * Create powerup manager
     */
    createPowerupManager() {
        this.powerupManager = new PowerupManager(this);
    }

    /**
     * Create UI elements
     */
    createUI() {
        const textStyle = {
            fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
            fontSize: '20px',
            fill: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 2,
        };

        // Score display
        this.scoreText = this.add.text(
            GAME_CONFIG.UI.SCORE_X,
            GAME_CONFIG.UI.SCORE_Y,
            'SCORE: 0',
            textStyle
        );
        this.scoreText.setDepth(100);

        // Health display
        this.healthText = this.add.text(
            GAME_CONFIG.UI.HEALTH_X,
            GAME_CONFIG.UI.HEALTH_Y,
            'HEALTH: 100',
            { ...textStyle, fill: '#00FF00' }
        );
        this.healthText.setDepth(100);

        // Laser powerup display (hidden initially)
        this.laserText = this.add.text(
            GAME_CONFIG.UI.HEALTH_X,
            GAME_CONFIG.UI.HEALTH_Y + 25,
            '',
            { ...textStyle, fill: '#FFA500' }
        );
        this.laserText.setDepth(100);

        // Wave display
        this.waveText = this.add.text(
            GAME_CONFIG.UI.WAVE_X,
            GAME_CONFIG.UI.WAVE_Y,
            'WAVE 1',
            { ...textStyle, fontSize: '24px' }
        );
        this.waveText.setOrigin(0.5, 0);
        this.waveText.setDepth(100);

        // Game over text (hidden initially)
        this.gameOverText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 50,
            'GAME OVER',
            {
                fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
                fontSize: '48px',
                fill: '#FF0000',
                stroke: '#000000',
                strokeThickness: 4,
            }
        );
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(100);
        this.gameOverText.setVisible(false);

        // Restart prompt
        this.restartText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 20,
            'Press SPACE to restart',
            {
                fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
                fontSize: '20px',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
            }
        );
        this.restartText.setOrigin(0.5);
        this.restartText.setDepth(100);
        this.restartText.setVisible(false);

        // Final score text
        this.finalScoreText = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 60,
            '',
            {
                fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
                fontSize: '24px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2,
            }
        );
        this.finalScoreText.setOrigin(0.5);
        this.finalScoreText.setDepth(100);
        this.finalScoreText.setVisible(false);

        // Wave announcement (for dramatic effect)
        this.waveAnnouncement = this.add.text(
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2,
            '',
            {
                fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
                fontSize: '36px',
                fill: '#FF00FF',
                stroke: '#000000',
                strokeThickness: 3,
            }
        );
        this.waveAnnouncement.setOrigin(0.5);
        this.waveAnnouncement.setDepth(100);
        this.waveAnnouncement.setAlpha(0);
    }

    /**
     * Create animations (placeholder - using static sprites now)
     */
    createAnimations() {
        // Animations removed - using AI-generated static sprites
    }

    /**
     * Set up physics collisions
     */
    setupCollisions() {
        // Player bullets hit enemies
        this.physics.add.overlap(
            this.playerBullets,
            this.enemyManager.getGroup(),
            this.onBulletHitEnemy,
            null,
            this
        );

        // Enemy bullets hit player
        this.physics.add.overlap(
            this.enemyBullets,
            this.player,
            this.onBulletHitPlayer,
            null,
            this
        );

        // Enemies collide with player
        this.physics.add.overlap(
            this.enemyManager.getGroup(),
            this.player,
            this.onEnemyHitPlayer,
            null,
            this
        );

        // Player collects powerups
        this.physics.add.overlap(
            this.powerupManager.getGroup(),
            this.player,
            this.onCollectPowerup,
            null,
            this
        );
    }

    /**
     * Set up game events
     */
    setupEvents() {
        // Enemy death event (for explosions and score)
        this.events.on('enemyDied', (x, y, scoreValue) => {
            try {
                this.spawnExplosion(x, y);
                this.addScore(scoreValue);
            } catch (e) {
                console.error('Error in enemyDied handler:', e);
            }
        });

        // Player death event
        this.events.on('playerDied', (x, y) => {
            this.spawnExplosion(x, y, 1.5); // Bigger explosion
            this.gameOver();
        });

        // Wave events
        this.events.on('waveStart', (waveNumber) => {
            this.showWaveAnnouncement(waveNumber);
        });

        this.events.on('waveComplete', (waveNumber) => {
            // Could add bonus points or effects here
        });
    }

    /**
     * Start the game
     */
    startGame() {
        this.isGameOver = false;

        // Delay before first wave
        this.time.delayedCall(GAME_CONFIG.WAVES.INITIAL_DELAY, () => {
            this.enemyManager.startWaves();
        });
    }

    /**
     * Collision: Player bullet hits enemy
     */
    onBulletHitEnemy(obj1, obj2) {
        if (!obj1 || !obj2) return;
        if (!obj1.active || !obj2.active) return;

        // Determine which is the bullet and which is the enemy
        // Bullets have isPlayerBullet property, enemies have scoreValue
        let bullet, enemy;
        if (obj1.isPlayerBullet !== undefined) {
            bullet = obj1;
            enemy = obj2;
        } else {
            bullet = obj2;
            enemy = obj1;
        }

        const damage = bullet.damage || GAME_CONFIG.BULLETS.PLAYER_DAMAGE;

        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        if (bullet.body) bullet.body.stop();

        // Handle enemy damage directly (don't rely on prototype methods)
        if (enemy.health === undefined) enemy.health = 50;
        enemy.health -= damage;

        // Flash effect on hit
        enemy.setTint(0xFFFFFF);
        this.time.delayedCall(50, () => {
            if (enemy.active) enemy.clearTint();
        });

        if (enemy.health <= 0) {
            const ex = enemy.x;
            const ey = enemy.y;
            const score = enemy.scoreValue || 100;

            enemy.setActive(false);
            enemy.setVisible(false);
            if (enemy.body) enemy.body.enable = false;

            this.spawnExplosion(ex, ey);
            this.addScore(score);

            // 10% chance to spawn powerup
            this.powerupManager.trySpawn(ex, ey);

            enemy.destroy();
        }
    }

    /**
     * Collision: Enemy bullet hits player
     */
    onBulletHitPlayer(obj1, obj2) {
        if (!obj1 || !obj2 || !this.player) return;
        if (!obj1.active || !obj2.active) return;
        if (this.player.isInvincible) return;

        // Determine which is the bullet (has isPlayerBullet property)
        const bullet = (obj1.isPlayerBullet !== undefined) ? obj1 : obj2;

        const damage = bullet.damage || GAME_CONFIG.BULLETS.ENEMY_DAMAGE;

        // Deactivate bullet
        bullet.setActive(false);
        bullet.setVisible(false);
        if (bullet.body) bullet.body.stop();

        this.player.takeDamage(damage);
        this.updateHealthDisplay();
    }

    /**
     * Collision: Enemy collides with player
     */
    onEnemyHitPlayer(enemy, playerSprite) {
        if (!enemy || !this.player) return;
        if (!enemy.active || !this.player.active) return;
        if (this.player.isInvincible) return;

        // Store position before destroying
        const ex = enemy.x;
        const ey = enemy.y;

        // Deactivate and destroy the enemy
        enemy.setActive(false);
        enemy.setVisible(false);
        if (enemy.body) enemy.body.enable = false;

        this.spawnExplosion(ex, ey);
        enemy.destroy();

        // Damage player heavily for collision
        this.player.takeDamage(30);
        this.updateHealthDisplay();
    }

    /**
     * Collision: Player collects powerup
     */
    onCollectPowerup(obj1, obj2) {
        if (!obj1 || !obj2) return;

        // Determine which is the powerup (has type property)
        const powerup = obj1.type ? obj1 : obj2;

        if (!powerup.active) return;

        let message = '';

        // Apply powerup effect
        if (powerup.type === POWERUP_TYPES.HEALTH) {
            this.player.health = Math.min(
                this.player.health + 25,
                GAME_CONFIG.PLAYER.MAX_HEALTH
            );
            this.updateHealthDisplay();
            message = 'PowerUp +25 Health';
        } else if (powerup.type === POWERUP_TYPES.LASER) {
            this.player.laserShotsRemaining = 50;
            this.updateLaserDisplay();
            message = 'PowerUp Laser';
        }

        // Show powerup message
        this.showPowerupMessage(message, powerup.x, powerup.y);

        // Destroy powerup
        powerup.destroy();
    }

    /**
     * Show powerup collected message
     */
    showPowerupMessage(message, x, y) {
        const text = this.add.text(x, y, message, {
            fontFamily: GAME_CONFIG.UI.FONT_FAMILY,
            fontSize: '18px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
        });
        text.setOrigin(0.5);
        text.setDepth(100);

        // Animate: float up and fade out
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * Spawn an explosion effect
     */
    spawnExplosion(x, y, scale = 1) {
        // Check if texture exists
        if (!this.textures.exists('explosion')) {
            console.warn('Explosion texture not found');
            return;
        }

        const explosion = this.add.sprite(x, y, 'explosion');
        if (!explosion) return;

        // Scale down 512px sprite to 96px game size (1.5x larger), then apply additional scale
        explosion.setScale((96 / 512) * scale);
        explosion.setDepth(50);
        explosion.setAlpha(1);

        // Animate the explosion: expand and fade out
        this.tweens.add({
            targets: explosion,
            scaleX: (96 / 512) * scale * 1.5,
            scaleY: (96 / 512) * scale * 1.5,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                if (explosion && explosion.active) {
                    explosion.destroy();
                }
            }
        });
    }

    /**
     * Add to score
     */
    addScore(points) {
        this.score += points;
        this.scoreText.setText(`SCORE: ${this.score}`);

        // Flash effect
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
        });
    }

    /**
     * Update health display
     */
    updateHealthDisplay() {
        const health = this.player.health;
        this.healthText.setText(`HEALTH: ${health}`);

        // Color based on health
        if (health > 60) {
            this.healthText.setFill('#00FF00'); // Green
        } else if (health > 30) {
            this.healthText.setFill('#FFFF00'); // Yellow
        } else {
            this.healthText.setFill('#FF0000'); // Red
        }
    }

    /**
     * Update laser powerup display
     */
    updateLaserDisplay() {
        const shots = this.player.laserShotsRemaining || 0;
        if (shots > 0) {
            this.laserText.setText(`LASER: ${shots}`);
        } else {
            this.laserText.setText('');
        }
    }

    /**
     * Show wave announcement
     */
    showWaveAnnouncement(waveNumber) {
        this.waveText.setText(`WAVE ${waveNumber}`);
        this.waveAnnouncement.setText(`WAVE ${waveNumber}`);

        this.tweens.add({
            targets: this.waveAnnouncement,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 1.5 },
            duration: 1500,
            ease: 'Power2',
        });
    }

    /**
     * Handle game over state
     */
    gameOver() {
        this.isGameOver = true;

        // Stop enemy spawning
        this.enemyManager.stop();

        // Show game over UI
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);
        this.finalScoreText.setText(`Final Score: ${this.score}`);
        this.finalScoreText.setVisible(true);

        // Animate game over text
        this.tweens.add({
            targets: this.gameOverText,
            scale: { from: 0.5, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
        });

        // Listen for restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.restartGame();
        });
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Reset state
        this.score = 0;
        this.isGameOver = false;

        // Reset UI
        this.scoreText.setText('SCORE: 0');
        this.gameOverText.setVisible(false);
        this.restartText.setVisible(false);
        this.finalScoreText.setVisible(false);

        // Reset entities
        this.player.reset();
        this.enemyManager.reset();

        // Clear all bullets
        this.playerBullets.getChildren().forEach(b => b.kill());
        this.enemyBullets.getChildren().forEach(b => b.kill());

        // Update displays
        this.updateHealthDisplay();

        // Start new game
        this.startGame();
    }

    /**
     * Main game loop
     */
    update(time, delta) {
        if (this.isGameOver) return;

        // Scroll background
        this.background.tilePositionY -= 0.5;
        this.starfield1.tilePositionY -= 1;
        this.starfield2.tilePositionY -= 2;

        // Update game entities
        this.player.update(time, delta);
        this.enemyManager.update(time, delta);
    }
}

/**
 * Phaser Game Configuration
 */
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
    pixelArt: true, // Prevents anti-aliasing for crisp sprites
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false, // Set to true to see hitboxes
        },
    },
    scene: [BootScene, GameScene],
};

// Create the game instance
const game = new Phaser.Game(config);
