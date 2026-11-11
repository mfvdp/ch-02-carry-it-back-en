// Items and decoration: placing them and clearing them away when the floor changes.

function placeItem (column: number, row: number, kind: number) {
    let t: Sprite;
if (kind == 1) {
        t = sprites.create(IMG_KEY, KIND_KEY)
    } else if (kind == 2) {
        t = sprites.create(IMG_HEART, KIND_HEART)
    } else if (kind == 3) {
        t = sprites.create(IMG_TORCH, KIND_TORCH)
    } else if (kind == 4) {
        t = sprites.create(IMG_CHEST, KIND_CHEST)
    } else {
        t = sprites.create(IMG_COIN, KIND_COIN)
    }
    // Plus GhostThroughTiles: items only need the overlap with the hero, no tile events. Without this flag the physics
    // checks all the touched tiles for every item in every frame and makes short-lived objects while doing so.
    t.setFlag(SpriteFlag.GhostThroughWalls, true)
    t.setFlag(SpriteFlag.GhostThroughTiles, true)
    tiles.placeOnTile(t, tiles.getTileLocation(column, row))
}

function placeDecor () {
    let x5: number;
let y5: number;
let decorSprite: Sprite;
let torchSprite: Sprite;
for (let index = 0; index < 8 + roomCenterX.length; index++) {
        x5 = randint(1, GRID_WIDTH - 2)
        y5 = randint(1, GRID_HEIGHT - 2)
        if (grid[y5 * GRID_WIDTH + x5] == 1) {
            if (randint(0, 1) == 0) {
                decorSprite = sprites.create(DECOR_BARREL, KIND_DECOR)
            } else {
                decorSprite = sprites.create(DECOR_BONES, KIND_DECOR)
            }
            // Pure decoration: not a single event hangs on it, so the full Ghost flag. It takes it out of
            // the physics completely.
            decorSprite.setFlag(SpriteFlag.Ghost, true)
            decorSprite.z = -1
            tiles.placeOnTile(decorSprite, tiles.getTileLocation(x5, y5))
        }
    }
    for (let index = 0; index < 10; index++) {
        x5 = randint(1, GRID_WIDTH - 2)
        y5 = randint(1, GRID_HEIGHT - 2)
        if (grid[y5 * GRID_WIDTH + x5] == 0 && isGround(x5, y5 + 1)) {
            torchSprite = sprites.create(IMG_TORCH, KIND_DECOR)
            torchSprite.setFlag(SpriteFlag.Ghost, true)
            torchSprite.z = -1
            tiles.placeOnTile(torchSprite, tiles.getTileLocation(x5, y5))
            torchSprite.y = torchSprite.y + 3
        }
    }
}

// Is the column wx below the wall wy all the way down to the start row continuously ground? Then the wall belongs to
// the start room.
function groundToStart (wx: number, wy: number) {
    for (let y = wy + 1; y <= roomCenterY[0]; y++) {
        if (!(isGround(wx, y))) {
            return false
        }
    }
    return true
}

// The Calliope Hacker as a picture on the wall of the start room on floor 1: a small cameo at the edge, pure decoration
// without collision (Ghost) and under the darkness. It shows as soon as the hero's light falls on it. The search looks
// for the nearest wall tile with floor below it (a visible wall face) above the start point, at most six columns to the
// side and five rows up. Pass 0: the wall belongs to the start room (floor all the way down to the start row) and has
// wall to its left and right, because the picture is two pixels wider than a tile. Pass 1: without the neighbours.
// Pass 2: any wall in the search area. Checked on 20 000 built floors: about 94 % in the first pass, about 99 % in
// total. Otherwise the floor stays without a picture.
function placeMural () {
    let bestX = -1
    let bestY = -1
    let bestDistance = 0
    let distanceSquared = 0
    for (let attempt = 0; attempt < 3 && bestX < 0; attempt++) {
        for (let wy = roomCenterY[0] - 5; wy <= roomCenterY[0] - 1; wy++) {
            for (let wx = roomCenterX[0] - 6; wx <= roomCenterX[0] + 6; wx++) {
                if (wy < 1 || wx < 1 || wx > GRID_WIDTH - 2 ||
                    isGround(wx, wy) || !(isGround(wx, wy + 1))) {
                    continue
                }
                if (attempt == 0 && (isGround(wx - 1, wy) || isGround(wx + 1, wy))) {
                    continue
                }
                if (attempt < 2 && !(groundToStart(wx, wy))) {
                    continue
                }
                distanceSquared = (wx - roomCenterX[0]) * (wx - roomCenterX[0]) +
                    (wy - roomCenterY[0]) * (wy - roomCenterY[0])
                if (bestX < 0 || distanceSquared < bestDistance) {
                    bestX = wx
                    bestY = wy
                    bestDistance = distanceSquared
                }
            }
        }
    }
    if (bestX < 0) {
        return
    }
    // A random wall torch at the same spot gives way to the mural.
    for (let f of sprites.allOfKind(KIND_DECOR)) {
        if (absValue(f.x - (bestX * 16 + 8)) < 20 && absValue(f.y - (bestY * 16 + 8)) < 16) {
            f.destroy()
        }
    }
    let muralSprite = sprites.create(IMG_HACKER_MURAL, KIND_DECOR)
    muralSprite.setFlag(SpriteFlag.Ghost, true)
    muralSprite.z = -1
    tiles.placeOnTile(muralSprite, tiles.getTileLocation(bestX, bestY))
    // Above the wall edge, in the middle of the wall surface.
    muralSprite.y = muralSprite.y - 2
}

function clearFloor () {
    for (let a of sprites.allOfKind(SpriteKind.Enemy)) {
        a.destroy()
    }
    for (let c of sprites.allOfKind(KIND_KEY)) {
        c.destroy()
    }
    for (let e of sprites.allOfKind(KIND_HEART)) {
        e.destroy()
    }
    for (let f of sprites.allOfKind(KIND_COIN)) {
        f.destroy()
    }
    for (let g of sprites.allOfKind(KIND_CHEST)) {
        g.destroy()
    }
    for (let h of sprites.allOfKind(KIND_TORCH)) {
        h.destroy()
    }
    for (let m of sprites.allOfKind(KIND_DECOR)) {
        m.destroy()
    }
    for (let n of sprites.allOfKind(KIND_ENEMY_FIREBALL)) {
        n.destroy()
    }
    // The hero's own fireballs too: otherwise an old shot would still fly through the new floor for up to 800 ms.
    for (let z of sprites.allOfKind(SpriteKind.Projectile)) {
        z.destroy()
    }
    for (let q of puffs) {
        q.destroy()
    }
    puffs = []
    enemies = []
}
