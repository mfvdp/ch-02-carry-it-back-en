// All the event handlers. This file runs after kinds.ts and graphics.ts, because KIND_* and TILE_* are already read
// when the handlers are registered.

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    aPressed = true
})
sprites.onOverlap(SpriteKind.Player, KIND_HEART, function (player, thing) {
    thing.destroy(effects.hearts, 200)
    info.changeLifeBy(1)
    Sound.playHeart()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (fireball, enemySprite) {
    let fromBehind: any;
let keySprite: Sprite;
hitEnemy = findEnemy(enemySprite)
    // No fire effect on the projectile: every effect makes a particle source with 750 ms of run time and two image
    // copies. With triple rapid fire that would be 15 per second. The hit is visible enough on the enemy
    // (spray and vanish).
    fireball.destroy()
    if (hitEnemy == null) {
        return
    }
    if (hitEnemy.kind == 4) {
        fromBehind = fireball.vx * hitEnemy.facingX > 0 || fireball.vy * hitEnemy.facingY > 0
        if (!(fromBehind)) {
            enemySprite.startEffect(effects.spray, 100)
            Sound.playBlock()
            return
        }
    }
    hitEnemy.health = hitEnemy.health - 1
enemyX = enemySprite.x
    enemyY = enemySprite.y
    if (hitEnemy.health <= 0) {
        // No falling apart into its own colors: the enemy disappears at once and vanishes in bright stars, the boss a
        // little bigger. First all the particles on the enemy are destroyed, also the ones already flying. Otherwise
        // the red sparks of the rage fire (steerBoss) would drift on for about 0.7 s over the stars and the key.
        // (particleSources only exists after the first particle source. It goes backward because destroy() takes the
        // source out of the list.)
        let sources = game.currentScene().particleSources
        if (sources) {
            for (let i = sources.length - 1; i >= 0; i--) {
                if (sources[i].anchor == enemySprite) {
                    sources[i].clear()
                    sources[i].destroy()
                }
            }
        }
        enemySprite.destroy()
        vanish(enemyX, enemyY, hitEnemy.kind == 5)
        if (hitEnemy.kind == 5) {
            bossActive = false
            info.changeScoreBy(100)
            scene.cameraShake(6, 700)
            Sound.playBossPuff()
            if (currentFloor >= FINAL_BOSS_FLOOR) {
                // That was the crown thief: the crown is free, the game is won. There is still a bonus, then the ending
                // takes over (it blocks here, like the box at the end of the game).
                info.changeScoreBy(400)
                Ending.play()
                return
            }
            keySprite = sprites.create(IMG_KEY, KIND_KEY)
            // Not SpriteFlag.Ghost! Ghost includes GhostThroughSprites, so the key would have no overlaps any more and
            // could not be picked up. All the other items also use GhostThroughWalls (see placeItem in items.ts).
            keySprite.setFlag(SpriteFlag.GhostThroughWalls, true)
            keySprite.setPosition(enemyX, enemyY)
        } else {
            info.changeScoreBy(10)
            Sound.playEnemyPuff()
        }
    } else {
        // The hit flash comes from startEffect. A copy of the image is not needed for it: it would look the same and
        // would only cost memory at every hit.
        enemySprite.startEffect(effects.spray, 100)
        Sound.playHit()
    }
})

sprites.onOverlap(SpriteKind.Player, KIND_TORCH, function (player, thing) {
    thing.destroy(effects.fire, 200)
    lightEndMs = game.runtime() + TORCH_DURATION_MS
    setLight(LIGHT_TORCH)
    hero.sayText(Catalog.text(Catalog.TextId.TORCH), 700, false)
    Sound.playTorch()
})

sprites.onOverlap(SpriteKind.Player, KIND_COIN, function (player, thing) {
    thing.destroy()
    info.changeScoreBy(5)
    Sound.playCoin()
})
sprites.onOverlap(SpriteKind.Player, KIND_KEY, function (player, thing) {
    keysHeld += 1
    thing.destroy(effects.confetti, 200)
    hudKey.setFlag(SpriteFlag.Invisible, false)
    hero.sayText(Catalog.text(Catalog.TextId.KEY), 800, false)
    Sound.playKey()
})

sprites.onOverlap(SpriteKind.Player, KIND_CHEST, function (player, chest) {
    chest.destroy(effects.confetti, 300)
    Sound.playChest()
    chestChoice = randint(0, 3)
    if (chestChoice == 0 && !(tripleShot)) {
        tripleShot = true
        hero.sayText(Catalog.text(Catalog.TextId.TRIPLE), 1200, false)
    } else if (chestChoice == 1 && reloadMs > RELOAD_FAST_MS) {
        reloadMs = RELOAD_FAST_MS
        hero.sayText(Catalog.text(Catalog.TextId.RAPID), 1200, false)
    } else if (chestChoice == 2 && heroSpeed < HERO_SPEED_MAX) {
        // Without an upper limit the boots would pile up without end, and the hero would at some point be impossibly
        // fast to steer. When the maximum is reached, the chest falls back to the extra heart.
        heroSpeed = Math.min(heroSpeed + BOOTS_SPEED, HERO_SPEED_MAX)
        controller.moveSprite(hero, heroSpeed, heroSpeed)
        hero.sayText(Catalog.text(Catalog.TextId.BOOTS), 1200, false)
    } else {
        info.changeLifeBy(1)
        hero.sayText(Catalog.text(Catalog.TextId.EXTRA_HEART), 1200, false)
    }
})

scene.onOverlapTile(SpriteKind.Player, TILE_SPIKES, function (player, location) {
    if (game.runtime() < graceEndMs) {
        return
    }
    getHit(1)
    player.startEffect(effects.spray, 200)
})
scene.onOverlapTile(SpriteKind.Player, TILE_STAIRS, function (player, location) {
    if (bossActive || keysHeld == 0) {
        // This handler fires in every frame while the hero stands on the tile. Without the lock, sayText makes a new
        // text box in every frame and draws it character by character: about 40 KB of small garbage per second that
        // breaks up the memory while the player stands there puzzled.
        if (game.runtime() < hintEndMs) {
            return
        }
        hintEndMs = game.runtime() + 1200
        if (bossActive) {
            hero.sayText(Catalog.text(Catalog.TextId.NEED_BOSS), 900, false)
        } else {
            hero.sayText(Catalog.text(Catalog.TextId.NEED_KEY), 900, false)
        }
        return
    }
    // Depth counts: the deeper, the more points the cleared floor gives. That makes up for the fact that coins lie less
    // often deeper down (weighting of the hearts in buildFloor).
    info.changeScoreBy(currentFloor * 5)
    currentFloor += 1
    Sound.playFloorCleared()
    buildFloor()
})

sprites.onOverlap(KIND_ENEMY_FIREBALL, SpriteKind.Player, function (orb, player) {
    orb.destroy(effects.spray, 100)
    getHit(1)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player, enemySprite) {
    if (game.runtime() < graceEndMs) {
        return
    }
    getHit(1)
    if (enemySprite.x > player.x) {
        enemySprite.x = enemySprite.x + 22
    } else {
        enemySprite.x = enemySprite.x - 22
    }
    if (enemySprite.y > player.y) {
        enemySprite.y = enemySprite.y + 22
    } else {
        enemySprite.y = enemySprite.y - 22
    }
})

info.onLifeZero(function () {
    // First stop, then show the text: farewell blocks, and without this flag the enemy AI and the firing carry on
    // during the dialog.
    playing = false
    // Make room before the farewell text and game.over ask for another 9.6 KB in one piece: the darkness is not needed
    // any more, the garbage collector may take its image.
    if (darknessSprite != null) {
        darknessSprite.destroy()
        darknessSprite = null
    }
    darkImage = null
    Sound.playGameOver()
    // A box of its own instead of game.showLongText: A only counts after one second (see Catalog.farewell in menus.ts).
    Catalog.farewell(Catalog.format(Catalog.TextId.GAME_END, currentFloor, info.score()))
    // game.over(false) does not save the best score. Without this call the title image shows "Best: 0" forever.
    info.saveHighScore()
    game.over(false)
})

// Vanishing: a defeated enemy becomes a short puff of stars in yellow and white. This is on purpose not a particle
// effect (every particle source makes image copies, see above), but a single ghost sprite with three fixed images from
// flash and a limited life time. So even many defeated enemies one after another cost hardly any memory.
function vanish (x: number, y: number, big: boolean) {
    let puff = sprites.create(IMG_PUFF_1, KIND_PUFF)
    puff.setFlag(SpriteFlag.Ghost, true)
    puff.setPosition(x, y)
    puff.z = 6
    puff.lifespan = PUFF_MS
    if (big) {
        puff.setScale(2)
    }
    puffs.push(puff)
}

// Moves each running star puff on to its next image, depending on how much of its time is left, and forgets the ones
// that have gone. Runs from game.onUpdate.
function advancePuffs () {
    let puff: Sprite
    for (let i = puffs.length - 1; i >= 0; i--) {
        puff = puffs[i]
        if (puff.flags & sprites.Flag.Destroyed) {
            puffs.removeAt(i)
        } else if (puff.lifespan < Math.idiv(PUFF_MS, 3)) {
            if (puff.image != IMG_PUFF_3) {
                puff.setImage(IMG_PUFF_3)
            }
        } else if (puff.lifespan < Math.idiv(PUFF_MS * 2, 3)) {
            if (puff.image != IMG_PUFF_2) {
                puff.setImage(IMG_PUFF_2)
            }
        }
    }
}
