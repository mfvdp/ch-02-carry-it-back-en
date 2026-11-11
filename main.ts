// A random-dungeon game for MakeCode Arcade.
//
// D-pad = walk, A = fireball. Find the key, look for the stairs, deeper and deeper. Every 5 floors a boss waits.
// Chests give upgrades.
//
// This file only contains the game start and the update loops. Everything else is in files of their own. The order in
// pxt.json is the order in which they are run.

// With DIAGNOSTICS on, shows a color and stops for a moment so that the screen can show it at all. Without DIAGNOSTICS
// the call costs nothing.
function showDiagnosticColor(color: number) {
    if (!DIAGNOSTICS) {
        return
    }
    scene.setBackgroundColor(color)
    pause(700)
}

Catalog.initialize()
showDiagnosticColor(8)
runTitleScreen()
showDiagnosticColor(6)
scene.setBackgroundColor(15)
info.setLife(START_LIVES)
info.setScore(0)
hero = sprites.create(IMG_HERO, SpriteKind.Player)
hero.z = 5
controller.moveSprite(hero, heroSpeed, heroSpeed)
showDiagnosticColor(7)
if (DARKNESS) {
    // The darkness hangs fixed in front of the camera (160 × 120 pixels). The hole of light moves within the image to
    // the hero's screen position (drawLight, below in game.onUpdate).
    darkImage = image.create(160, 120)
    darknessSprite = sprites.create(darkImage, KIND_HUD)
    darknessSprite.setFlag(SpriteFlag.Ghost, true)
    darknessSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    darknessSprite.z = 90
    darknessSprite.setPosition(80, 60)
}
hudKey = sprites.create(IMG_KEY, KIND_HUD)
hudKey.setFlag(SpriteFlag.Ghost, true)
hudKey.setFlag(SpriteFlag.RelativeToCamera, true)
hudKey.setPosition(80, 10)
hudKey.z = 100
// Make the map and the floor sign now, while the memory is still in one piece, and never again while the
// game is running.
createHud()
showDiagnosticColor(5)
setLight(LIGHT_NORMAL)
// Paint once straight away: game.onUpdate only runs after buildFloor(), until then the area would
// be completely see-through.
if (darknessSprite != null) {
    drawLight()
}
showDiagnosticColor(4)
buildFloor()
showDiagnosticColor(2)
game.onUpdate(function () {
    if (!(playing)) {
        return
    }
    if (hero.vx != 0 || hero.vy != 0) {
        if (absValue(hero.vx) > absValue(hero.vy)) {
            facingY = 0
            facingX = signOf(hero.vx)
        } else {
            facingX = 0
            facingY = signOf(hero.vy)
        }
        setHeroImage()
    }
    if (controller.A.isPressed()) {
        launchVolley()
    }
    if (puffs.length > 0) {
        advancePuffs()
    }
    if (darknessSprite != null) {
        drawLight()
    }
})
game.onUpdateInterval(280, function () {
    let sprite: Sprite;
let dx: number;
let dy: number;
let distance: any;
let stuck: any;
let mayTurn: boolean;
let sideways: boolean;
if (!(playing)) {
        return
    }
    for (let enemy of enemies) {
        if (enemy.health > 0) {
            sprite = enemy.sprite
dx = hero.x - sprite.x
            dy = hero.y - sprite.y
            distance = absValue(dx) + absValue(dy)
            if (distance > 100 && enemy.kind != 5) {
                sprite.vx = 0
                sprite.vy = 0
            } else {
                stuck = absValue(sprite.x - enemy.oldX) < 1 &&
                    absValue(sprite.y - enemy.oldY) < 1
                enemy.oldX = sprite.x
enemy.oldY = sprite.y
mayTurn = true
                if (enemy.kind == 4 && game.runtime() < enemy.nextActionMs) {
                    mayTurn = false
                }
                if (mayTurn) {
                    // If dx == 0 and dy == 0, the old facing direction is kept. signOf(0) would be 0, and with the
                    // facing direction (0, 0) the guard would be invulnerable from every direction (the "from behind"
                    // check in events.ts would never come true). He would stand still and show the wrong shield image.
                    if (absValue(dx) > absValue(dy)) {
                        enemy.facingX = signOf(dx)
enemy.facingY = 0
                    } else if (dy != 0) {
                        enemy.facingX = 0
enemy.facingY = signOf(dy)
                    }
                    if (enemy.kind == 4) {
                        enemy.nextActionMs = game.runtime() + 1400
                        setGuardImage(enemy)
                    }
                }
                if (enemy.kind == 2) {
                    sprite.vx = signOf(dx) * enemy.speed
                    sprite.vy = signOf(dy) * enemy.speed + randint(0 - 25, 25)
                } else if (enemy.kind == 3) {
                    if (distance < 70) {
                        sprite.vx = 0 - signOf(dx) * enemy.speed
                        sprite.vy = 0 - signOf(dy) * enemy.speed
                    } else if (distance > 115) {
                        sprite.vx = signOf(dx) * enemy.speed
                        sprite.vy = signOf(dy) * enemy.speed
                    } else {
                        sprite.vx = 0
                        sprite.vy = 0
                    }
                    if (game.runtime() > enemy.nextActionMs) {
                        enemy.nextActionMs = game.runtime() + 1700
shootEnemyFireball(sprite, signOf(dx) * 70, signOf(dy) * 70)
                    }
                } else if (enemy.kind == 4) {
                    sprite.vx = enemy.facingX * enemy.speed
                    sprite.vy = enemy.facingY * enemy.speed
                } else if (enemy.kind == 5) {
                    steerBoss(enemy, dx, dy)
                } else {
                    sideways = absValue(dx) > absValue(dy)
                    if (stuck) {
                        sideways = !(sideways)
                    }
                    if (randint(0, 6) == 0) {
                        sideways = !(sideways)
                    }
                    if (sideways) {
                        sprite.vy = 0
                        sprite.vx = signOf(dx) * enemy.speed
                    } else {
                        sprite.vx = 0
                        sprite.vy = signOf(dy) * enemy.speed
                    }
                }
            }
        }
    }
})
game.onUpdateInterval(120, function () {
    if (!(playing)) {
        return
    }
    if (game.runtime() < graceEndMs) {
        hero.setFlag(SpriteFlag.Invisible, Math.idiv(game.runtime(), 120) % 2 == 0)
    } else {
        hero.setFlag(SpriteFlag.Invisible, false)
    }
    if (lightEndMs > 0 && game.runtime() > lightEndMs) {
        lightEndMs = 0
        setLight(LIGHT_NORMAL)
    }
})
