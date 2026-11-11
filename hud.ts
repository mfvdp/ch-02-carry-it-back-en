// Display: the floor number at the bottom left and the map on button B.
//
// Important: both images are made once at the start (createHud, called from main.ts) and then only painted again. If
// the map image were made anew at every press of B (about 5.5 KB) and the floor sign at every change of floor, that
// would break up the Calliope's tight memory until, in the middle of the game, a new image fails: the game crashes and
// the picture freezes.

let hudFloor: Sprite = null
let mapSprite: Sprite = null

// Edge length of one tile of the dungeon on the map.
const MAP_CELL = 4
// Top edge of the map, above it stands the label.
const MAP_TOP_MARGIN = 12

// Makes the two display images, once at the start, while the memory is still in one piece.
function createHud() {
    mapBuffer = image.create(GRID_WIDTH * MAP_CELL +
        4, GRID_HEIGHT * MAP_CELL + MAP_TOP_MARGIN + 2)
    floorBuffer = image.create(60, 10)
}

// Writes the current floor at the bottom left into the display.
function showFloor() {
    // image.font8 is six pixels wide (charWidth: 6 in screen/text.ts), not five. "FLOOR 12" is 8 characters and
    // therefore needs 48 pixels. With only 30 pixels everything from column 30 on would be cut off silently, and only
    // "FLOOR" without the number would stay visible.
    floorBuffer.fill(0)
    floorBuffer.print(Catalog.format(Catalog.TextId.FLOOR, currentFloor), 0, 1, 5, image.font8)
    if (hudFloor == null) {
        hudFloor = sprites.create(floorBuffer, KIND_HUD)
        hudFloor.setFlag(SpriteFlag.Ghost, true)
        hudFloor.setFlag(SpriteFlag.RelativeToCamera, true)
        hudFloor.z = 100
        hudFloor.setPosition(32, 112)
    }
    // A setImage is not needed: the sprite shows the same image, and whoever paints into the image changes the
    // display at once.
}

// Paints the map image of the current floor into the fixed buffer.
function drawMapImage() {
    let canvas = mapBuffer
    canvas.fill(15)
    canvas.drawRect(0, 0, canvas.width, canvas.height, 12)
    canvas.print(Catalog.format(Catalog.TextId.MAP_FLOOR, currentFloor), 3, 2, 5, image.font8)
    for (let ky = 0; ky < GRID_HEIGHT; ky++) {
        for (let kx = 0; kx < GRID_WIDTH; kx++) {
            let cell = grid[ky * GRID_WIDTH + kx]
            let color = -1
            if (cell == 1) {
                color = 12
            } else if (cell == 2) {
                color = 5
            } else if (cell == 3) {
                color = 2
            }
            if (color >= 0) {
                canvas.fillRect(2 + kx * MAP_CELL, MAP_TOP_MARGIN + ky * MAP_CELL,
                    MAP_CELL, MAP_CELL, color)
            }
        }
    }
    // The hero as a bright dot. One tile in the dungeon is 16 pixels wide.
    let hx = Math.idiv(hero.x, 16)
    let hy = Math.idiv(hero.y, 16)
    if (hx >= 0 && hx < GRID_WIDTH && hy >= 0 && hy < GRID_HEIGHT) {
        canvas.fillRect(2 + hx * MAP_CELL, MAP_TOP_MARGIN + hy * MAP_CELL,
            MAP_CELL, MAP_CELL, 7)
    }
    return canvas
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // hero and grid are only made in main.ts and in buildFloor(), so after runTitleScreen(). But this handler is
    // already registered during the intro and the title image, and the title image even advertises "B shows the map".
    // Without this check drawMapImage() there reaches for hero == null (hero.x is a getter, so a call on a null
    // reference), and the game crashes before it has begun.
    if (hero == null || grid.length == 0 || !playing || mapSprite != null) {
        return
    }
    mapSprite = sprites.create(drawMapImage(), KIND_HUD)
    mapSprite.setFlag(SpriteFlag.Ghost, true)
    mapSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    mapSprite.z = 200
    mapSprite.setPosition(80, 60)
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (mapSprite != null) {
        mapSprite.destroy()
        mapSprite = null
    }
})
