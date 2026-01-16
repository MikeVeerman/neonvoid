# Add EnemyC - Bomber type enemy

## Description
Add a third enemy type (EnemyC) with unique bomber behavior to increase gameplay variety.

## Enemy Behavior
**EnemyC - Bomber**
- Flies horizontally across the screen (left-to-right or right-to-left)
- Periodically drops explosive mines that remain stationary for 2-3 seconds before exploding
- Mines create damage zones that can hurt the player
- Uses area denial tactics rather than direct attacks
- Should appear starting around wave 3+

## Implementation Tasks

### 1. Create EnemyC Class (js/Enemy.js)
- [ ] Add `EnemyC` class extending `Enemy` base class
- [ ] Implement horizontal movement pattern
- [ ] Add mine dropping logic with timer
- [ ] Handle mine pool reference

### 2. Create Mine/Bomb System
- [ ] Create new `Mine` class or bullet type for dropped explosives
- [ ] Implement stationary behavior (mines stay in place)
- [ ] Add explosion timer (2-3 second delay)
- [ ] Add collision detection with player
- [ ] Create explosion effect on detonation

### 3. Add Configuration (js/constants.js)
```javascript
TYPE_C: {
    SPEED: 120,
    HEALTH: 75,
    SCORE: 150,
    DROP_RATE: 1500, // milliseconds between drops
}
```

### 4. Update Spawn Logic (js/Enemy.js)
- [ ] Modify `EnemyManager.spawnEnemy()` to include EnemyC in spawn rotation
- [ ] Add spawn probability logic (e.g., 20% chance starting wave 3+)
- [ ] Balance spawn rates between all three enemy types

### 5. Assets
- [ ] Generate sprite for EnemyC using DALL-E (cyan/teal bomber-style craft)
- [ ] Generate sprite for mine/bomb object
- [ ] Add sprite loading in `main.js` preload

### 6. Collision System
- [ ] Add mine group to physics system
- [ ] Implement player-mine collision detection
- [ ] Add mine explosions to particle effects

## Design Notes
- Color scheme: Cyan/teal to distinguish from magenta (A) and indigo (B)
- Shape: Wider, horizontal oriented (triangle or hexagon)
- Difficulty: Should create "bullet hell" style patterns with multiple mines
- Balance: Don't spawn too many at once to avoid overwhelming the player

## Success Criteria
- [ ] EnemyC spawns in waves 3+
- [ ] Mines drop periodically and explode after delay
- [ ] Player takes damage from mine explosions
- [ ] Game difficulty increases appropriately
- [ ] All sprites are AI-generated and consistent with existing art style

## Files to Modify
- `js/Enemy.js` - Add EnemyC class and Mine class
- `js/constants.js` - Add TYPE_C configuration
- `js/main.js` - Load new sprites
- `assets/sprites/` - Add enemy_c.png and mine.png

## Estimated Complexity
**Medium** - Requires new movement pattern, new mine/bomb mechanic, additional collision system, and 2 new sprites.
