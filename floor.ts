// Building a whole floor.

function buildFloor () {
    let keyRoom: number;
let roll: number;
let heartLimit: number;
clearFloor()
    let tries = 0
    while (true) {
        emptyGrid()
        createRooms()
        tries += 1
        // Emergency exit: createRooms normally makes 6 to 10 rooms, 4 is practically certain. Without this limit a run
        // of bad luck would flood memory with newly built grids.
        if (roomCenterX.length >= 4 || tries >= 8) {
            break;
        }
    }
    lastRoom = roomCenterX.length - 1
    grid[roomCenterY[lastRoom] * GRID_WIDTH + roomCenterX[lastRoom]] = 2
    placeTraps()
    drawGrid()
    placeDecor()
    if (currentFloor == 1) {
        placeMural()
    }
    keysHeld = 0
    hudKey.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(hero, tiles.getTileLocation(roomCenterX[0], roomCenterY[0]))
    scene.cameraFollowSprite(hero)
    // One boss every BOSS_EVERY floors, and on the final boss floor always, even when it is not a multiple of that.
    bossActive = currentFloor % BOSS_EVERY == 0 || currentFloor == FINAL_BOSS_FLOOR
    if (bossActive) {
        placeEnemy(roomCenterX[lastRoom], roomCenterY[lastRoom], 5)
    } else {
        // lastRoom is the room with the stairs. If the key were there, it would stand on the stairs tile, and the floor
        // would be over as soon as it is picked up. lastRoom is practically always at least 3 (the loop above asks for
        // four rooms and only gives up after eight tries), so the range stays valid.
        keyRoom = randint(1, lastRoom - 1)
        placeItem(roomCenterX[keyRoom], roomCenterY[keyRoom], 1)
    }
    for (let o = 1; o < lastRoom + 1; o++) {
        // The basic enemy counts against ENEMY_MAX too. anotherEnemy only checks the limit for second and third
        // enemies. Without this check more basic enemies would be added in a floor with many rooms, even when the list
        // is long since full. The boss is already in the list, it is placed above before this loop.
        if (enemies.length < ENEMY_MAX) {
            placeEnemy(roomCenterX[o], roomCenterY[o], randomKind())
        }
        // Second and third enemy come in as a gentle increase (see anotherEnemy in enemies.ts), with an offset,
        // otherwise they would stand exactly on top of each other.
        if (anotherEnemy(SECOND_ENEMY_FROM, SECOND_ENEMY_MAX)) {
            placeEnemy(roomCenterX[o], roomCenterY[o], randomKind(), 1)
        }
        if (anotherEnemy(THIRD_ENEMY_FROM, THIRD_ENEMY_MAX)) {
            placeEnemy(roomCenterX[o], roomCenterY[o], randomKind(), 2)
        }
        // The deeper, the more often a heart lies in the room instead of a coin. That is a small balance for the fact
        // that more enemies and more traps wait below.
        heartLimit = 2 + Math.min(Math.idiv(currentFloor, HEART_BONUS_EVERY), HEART_BONUS_MAX)
        roll = randint(0, 9)
        if (roll < heartLimit) {
            placeItem(roomCenterX[o], roomCenterY[o], 2)
        } else if (roll < heartLimit + 2) {
            placeItem(roomCenterX[o], roomCenterY[o], 3)
        } else if (roll < heartLimit + 4) {
            placeItem(roomCenterX[o], roomCenterY[o], 4)
        } else {
            placeItem(roomCenterX[o], roomCenterY[o], 5)
        }

    }
    // A burning torch ends with the floor. Without the reset lightEndMs would stay in the future, and when that time
    // later ran out, the check would find the radius already at LIGHT_NORMAL and would do nothing.
    lightEndMs = 0
    setLight(LIGHT_NORMAL)
    showFloor()
    Sound.startDungeonMusic(currentFloor)
    if (bossActive) {
        if (currentFloor == FINAL_BOSS_FLOOR) {
            hero.sayText(Catalog.text(Catalog.TextId.CROWN_THIEF), 2000, false)
        } else {
            hero.sayText(Catalog.format(Catalog.TextId.FLOOR_BOSS, currentFloor), 1800, false)
        }
        Sound.playBossAppears()
    } else {
        hero.sayText(Catalog.format(Catalog.TextId.FLOOR_SPEECH, currentFloor), 1300, false)
    }
}
