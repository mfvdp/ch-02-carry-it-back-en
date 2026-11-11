// The hero: shooting fireballs, choosing the image for the facing direction and taking hits.

function shoot (aimX: number, aimY: number) {
    newFireball = sprites.createProjectileFromSprite(IMG_FIREBALL,
        hero, aimX * FIREBALL_SPEED, aimY * FIREBALL_SPEED)
    newFireball.lifespan = 800
    newFireball.setFlag(SpriteFlag.DestroyOnWall, true)
}

function launchVolley () {
    if (game.runtime() < fireReadyMs) {
        return
    }
    fireReadyMs = game.runtime() + reloadMs
    shoot(facingX, facingY)
    if (tripleShot) {
        shoot(facingX + facingY, facingY + facingX)
        shoot(facingX - facingY, facingY - facingX)
    }
    Sound.playFireball()
}

// Chooses the image that fits the facing direction. All four images are the same size, so the hit area does not change.
// setImage does nothing by itself when the image is already the right one.
function setHeroImage() {
    if (facingY > 0) {
        hero.setImage(IMG_HERO_DOWN)
    } else if (facingY < 0) {
        hero.setImage(IMG_HERO_UP)
    } else if (facingX < 0) {
        hero.setImage(IMG_HERO_LEFT)
    } else if (facingX > 0) {
        hero.setImage(IMG_HERO_RIGHT)
    }
}

function getHit (amount: number) {
    if (game.runtime() < graceEndMs) {
        return
    }
    graceEndMs = game.runtime() + GRACE_MS
    info.changeLifeBy(0 - amount)
    Sound.playHeroHit()
    scene.cameraShake(4, 250)
}
