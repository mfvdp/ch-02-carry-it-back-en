// Enemies: the data class, creating them, searching, shots and the control of the boss.

class Enemy {
    sprite: Sprite
    kind: number
    health: number
    // The health at the start, it never changes. steerBoss uses it to work out the rage threshold as a fraction.
    healthMax: number
    speed: number
    facingX: number
    facingY: number
    oldX: number
    oldY: number
    nextActionMs: number
    enraged: boolean
    constructor(s: Sprite, kind: number, health: number, speed: number) {
        this.sprite = s
        this.kind = kind
        this.health = health
        this.healthMax = health
        this.speed = speed
        this.facingX = 1
        this.facingY = 0
        this.oldX = 0
        this.oldY = 0
        this.nextActionMs = 0
        this.enraged = false
    }
    
}

// offset moves the second (1) and third (2) enemy of a room away from the room center. Without an offset they would
// stand exactly on top of each other: you would only see one, and the physics would keep pushing the two apart.
function placeEnemy (column: number, row: number, kind: number, offset: number = 0) {
    // One tier per FLOORS_PER_TIER floors, rounded up, so floor 1 stays at tier 1. From TIER_MAX on the enemies do not
    // get any faster, otherwise they would at some point overtake the hero, whose speed ends at HERO_SPEED_MAX.
    let tier = Math.min(Math.idiv(currentFloor + FLOORS_PER_TIER - 1, FLOORS_PER_TIER), TIER_MAX)
    newEnemyImage = IMG_SKELETON
    newEnemyHealth = 2
    newEnemySpeed = 20 + tier * 2
    if (kind == 1) {
        newEnemyImage = IMG_SLIME
        newEnemyHealth = 3
        newEnemySpeed = 16 + tier * 2
    } else if (kind == 2) {
        newEnemyImage = IMG_BAT
        newEnemyHealth = 1
        newEnemySpeed = 34 + tier * 2
    } else if (kind == 3) {
        newEnemyImage = IMG_MAGE
        newEnemyHealth = 2
        newEnemySpeed = 20 + tier
    } else if (kind == 4) {
        // The facing starts to the right (see the constructor of Enemy), so the shield must start on the right too. The
        // image and the "from behind" check must never drift apart.
        newEnemyImage = IMG_GUARD_RIGHT
        newEnemyHealth = 4
        newEnemySpeed = 18 + tier * 2
    } else if (kind == 5) {
        // The boss gets more health with every floor, but only up to BOSS_HEALTH_MAX. Otherwise the fight would last
        // forever on deep floors.
        newEnemyImage = IMG_BOSS
        newEnemyHealth = Math.min(BOSS_HEALTH_BASE + currentFloor, BOSS_HEALTH_MAX)
        newEnemySpeed = 16 + tier
        if (currentFloor >= FINAL_BOSS_FLOOR) {
            // The crown thief: the stolen crown is painted onto a copy of the boss image (row 0 is free there, in row 1
            // the band replaces the top edge of the head). The original in graphics.ts stays unchanged. He also starts
            // with full health, because this is the final fight.
            newEnemyImage = IMG_BOSS.clone()
            for (let zx = 5; zx <= 10; zx++) {
                newEnemyImage.setPixel(zx, 1, 5)
            }
            newEnemyImage.setPixel(7, 1, 2)
            newEnemyImage.setPixel(8, 1, 2)
            newEnemyImage.setPixel(5, 0, 5)
            newEnemyImage.setPixel(7, 0, 5)
            newEnemyImage.setPixel(8, 0, 5)
            newEnemyImage.setPixel(10, 0, 5)
            newEnemyHealth = BOSS_HEALTH_MAX
        }
    }
    s = sprites.create(newEnemyImage, SpriteKind.Enemy)
    if (kind == 2) {
        s.setFlag(SpriteFlag.GhostThroughWalls, true)
    }
    if (kind == 5) {
        s.setScale(2, ScaleAnchor.Middle)
    }
    tiles.placeOnTile(s, tiles.getTileLocation(column, row))
    // The room center has at least one free tile in every direction (createRooms: the smallest room is 3 × 3). So the
    // offsets of 12 and 8 pixels always stay on the ground.
    if (offset == 1) {
        s.x = s.x + 12
        s.y = s.y - 8
    } else if (offset == 2) {
        s.x = s.x - 12
        s.y = s.y + 8
    }
    enemies.push(new Enemy(s, kind, newEnemyHealth, newEnemySpeed))
}

// Rolls the dice for whether another enemy joins the room. From the floor fromFloor the chance starts at one tenth and
// grows by one tenth with every floor, up to the maximum cap (also in tenths).
function anotherEnemy (fromFloor: number, cap: number) {
    if (enemies.length >= ENEMY_MAX) {
        return false
    }
    let z = currentFloor - fromFloor + 1
    if (z < 1) {
        return false
    }
    if (z > cap) {
        z = cap
    }
    return randint(1, 10) <= z
}

// Turns the guard's shield visibly in the facing direction. This is the only way the player can see where "behind" is,
// because only hits right in the back count. All four images are the same size and are made at the start. setImage does
// nothing by itself when the image is already the right one.
function setGuardImage (guard: Enemy) {
    if (guard.facingY > 0) {
        guard.sprite.setImage(IMG_GUARD_DOWN)
    } else if (guard.facingY < 0) {
        guard.sprite.setImage(IMG_GUARD_UP)
    } else if (guard.facingX < 0) {
        guard.sprite.setImage(IMG_GUARD)
    } else {
        guard.sprite.setImage(IMG_GUARD_RIGHT)
    }
}

function findEnemy (s: Sprite) {
    for (let q of enemies) {
        if (q.sprite == s) {
            return q
        }
    }
    return null
}

function shootEnemyFireball (shooter: Sprite, vx: number, vy: number) {
    r = sprites.createProjectileFromSprite(IMG_MAGIC_ORB, shooter, vx, vy)
    r.setKind(KIND_ENEMY_FIREBALL)
    r.lifespan = 2500
    r.setFlag(SpriteFlag.DestroyOnWall, true)
}
function randomKind () {
    // The thresholds are in settings.ts. The tutorial boards in the intro read the same constants, so that their lines
    // "From floor N." are always right.
    highestKind = 1
    if (currentFloor >= BAT_FLOOR) {
        highestKind = 2
    }
    if (currentFloor >= MAGE_FLOOR) {
        highestKind = 3
    }
    if (currentFloor >= GUARD_FLOOR) {
        highestKind = 4
    }
    return randint(0, highestKind)
}

function steerBoss(enemy: Enemy, dx: number, dy: number) {
    let sprite = enemy.sprite
    // Enraged in the last third of the fight: the limit is a fraction of the health, so the wild phase stays a real
    // part of the fight, even with strong bosses.
    if (enemy.health <= Math.idiv(enemy.healthMax, BOSS_RAGE_FRACTION) && !enemy.enraged) {
        enemy.enraged = true
        enemy.speed = enemy.speed + 16
        sprite.startEffect(effects.fire, 500)
        scene.cameraShake(4, 400)
    }
    
    if (absValue(dx) > absValue(dy)) {
        sprite.vy = 0
        sprite.vx = signOf(dx) * enemy.speed
    } else {
        sprite.vx = 0
        sprite.vy = signOf(dy) * enemy.speed
    }
    
    if (game.runtime() > enemy.nextActionMs) {
        enemy.nextActionMs = game.runtime() + 2200
        shootEnemyFireball(sprite, 60, 0)
        shootEnemyFireball(sprite, 0 - 60, 0)
        shootEnemyFireball(sprite, 0, 60)
        shootEnemyFireball(sprite, 0, 0 - 60)
        if (enemy.enraged) {
            shootEnemyFireball(sprite, 45, 45)
            shootEnemyFireball(sprite, 45, 0 - 45)
            shootEnemyFireball(sprite, 0 - 45, 45)
            shootEnemyFireball(sprite, 0 - 45, 0 - 45)
        }
        
    }
    
}
