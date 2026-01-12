# Neon Void

A retro arcade shooter built entirely through AI collaboration.

![Neon Void](https://img.shields.io/badge/Phaser-3.70-blue) ![AI Generated](https://img.shields.io/badge/Sprites-AI%20Generated-purple)

## Play

https://mikeveerman.github.io/neonvoid/

## How It Was Built

This game was created using **Claude Code** (Anthropic's CLI coding assistant) with **OpenAI DALL-E** for sprite generation.

### The Process

1. **Game Development** - Claude Code wrote all the game code:
   - Phaser 3 game engine setup
   - Player movement and shooting mechanics
   - Two enemy types with distinct AI behaviors
   - Wave-based spawning system
   - Collision detection and scoring
   - Parallax scrolling background

2. **Sprite Generation** - OpenAI's DALL-E API generated all visual assets:
   ```bash
   openai api images.generate \
     --prompt "32x32 pixel art spaceship, cyan neon colors, transparent background" \
     --size 512x512
   ```

3. **Asset Processing** - Claude Code handled post-processing:
   - Removed white backgrounds (converted to transparency)
   - Scaled sprites appropriately for the game
   - Integrated assets into the Phaser texture system

### Tech Stack

- **Game Engine**: Phaser 3
- **Code Generation**: Claude Code (Claude Opus 4.5)
- **Sprite Generation**: OpenAI DALL-E
- **Hosting**: GitHub Pages

### Controls

- **Arrow Keys / WASD** - Move
- **Space** - Shoot

### Assets Generated

| Sprite | Description |
|--------|-------------|
| Player | Cyan neon spaceship |
| Enemy A | Magenta diamond-shaped chaser |
| Enemy B | Indigo hexagonal turret |
| Bullets | Yellow (player) and red (enemy) energy bolts |
| Explosion | Fiery burst effect |
| Background | Deep space nebula |

## License

MIT
