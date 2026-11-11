// Making the dungeon: grid, rooms, corridors, traps and tilemap.

function emptyGrid () {
    // Only make it the very first time. A new array for every floor would have to be copied over several times while
    // filling, at every try of the repeat loop in buildFloor, and the memory would be shuffled around. Every call would
    // then cost about 4 KB of data and 8 KB of copying garbage.
    if (grid.length != GRID_WIDTH * GRID_HEIGHT) {
        grid = []
        for (let index = 0; index < GRID_WIDTH * GRID_HEIGHT; index++) {
            grid.push(0)
        }
        return
    }
    for (let index = 0; index < GRID_WIDTH * GRID_HEIGHT; index++) {
        grid[index] = 0
    }
}

function dig (x: number, y: number) {
    if (x > 0 && x < GRID_WIDTH - 1 && y > 0 && y < GRID_HEIGHT - 1) {
        grid[y * GRID_WIDTH + x] = 1
    }
}

// Corridors are two tiles wide. With only one tile a corridor would be exactly 16 pixels wide, and the hero
// is 16 pixels high. He would fit through, but only when lined up pixel-exactly, and every turn would jam. Because the
// walls are really solid (see drawGrid), this is decisive. Two tiles give 16 pixels of room to move.
function digCorridor (x1: number, y1: number, x2: number, y2: number) {
    x = x1
    y = y1
    while (x != x2) {
        dig(x, y)
        dig(x, y + 1)
        if (x < x2) {
            x += 1
        } else {
            x += -1
        }
    }
    while (y != y2) {
        dig(x, y)
        dig(x + 1, y)
        if (y < y2) {
            y += 1
        } else {
            y += -1
        }
    }
    dig(x, y)
    dig(x + 1, y)
    dig(x, y + 1)
    dig(x + 1, y + 1)
}

function createRooms () {
    let roomWidth: number;
let roomHeight: number;
let roomX: number;
let roomY: number;
let centerX: number;
let centerY: number;
let roomFree: boolean;
roomCenterX = []
    roomCenterY = []
    for (let index = 0; index < 50; index++) {
        roomWidth = randint(3, 7)
        roomHeight = randint(3, 5)
        roomX = randint(1, GRID_WIDTH - roomWidth - 2)
        roomY = randint(1, GRID_HEIGHT - roomHeight - 2)
        centerX = roomX + Math.idiv(roomWidth, 2)
        centerY = roomY + Math.idiv(roomHeight, 2)
        roomFree = true
        for (let j = 0; j <= roomCenterX.length - 1; j++) {
            if (absValue(roomCenterX[j] - centerX) < 6 && absValue(roomCenterY[j] - centerY) < 5) {
                roomFree = false
            }
        }
        if (roomFree) {
            for (let y2 = 0; y2 <= roomHeight - 1; y2++) {
                for (let x2 = 0; x2 <= roomWidth - 1; x2++) {
                    dig(roomX + x2, roomY + y2)
                }
            }
            if (roomCenterX.length > 0) {
                digCorridor(roomCenterX[roomCenterX.length - 1],
                    roomCenterY[roomCenterY.length - 1], centerX, centerY)
            }
            roomCenterX.push(centerX)
            roomCenterY.push(centerY)
        }
    }
}

function placeTraps () {
    let x3: number;
    let y3: number;
    let farAway: any;
    // count, tries and placed are local variables of this function and start from scratch at every call. If they were
    // global, they would never be reset, and from floor 2 on hardly any traps would be added.
    let placed = 0
    let tries = 0
    // One more trap per FLOORS_PER_TRAP floors.
    let count = 1 + Math.idiv(currentFloor, FLOORS_PER_TRAP)
    if (count > TRAP_MAX) {
        count = TRAP_MAX
    }
    while (placed < count && tries < 300) {
        tries += 1
        x3 = randint(1, GRID_WIDTH - 2)
        y3 = randint(1, GRID_HEIGHT - 2)
        farAway = absValue(x3 - roomCenterX[0]) > 2 || absValue(y3 - roomCenterY[0]) > 2
        if (grid[y3 * GRID_WIDTH + x3] == 1 && farAway) {
            grid[y3 * GRID_WIDTH + x3] = 3
            placed += 1
        }
    }
}

function drawGrid () {
    let cell: number;
let tileNumber: number;
let buffer = Buffer.create(4 + GRID_WIDTH * GRID_HEIGHT)
buffer[0] = GRID_WIDTH
    buffer[2] = GRID_HEIGHT
    wallLayer = image.create(GRID_WIDTH, GRID_HEIGHT)
    for (let y4 = 0; y4 <= GRID_HEIGHT - 1; y4++) {
        for (let x4 = 0; x4 <= GRID_WIDTH - 1; x4++) {
            cell = grid[y4 * GRID_WIDTH + x4]
            tileNumber = 0
            if (cell == 0) {
                // The value must be exactly 2. tilemap.ts checks with "layers.getPixel(col, row) === TM_WALL", and
                // TM_WALL stands for the number 2. The comparison is exact, it is not a test for "not zero". With any
                // other number not a single wall would be solid: shots would fly through, enemies would walk through
                // walls, and the "got stuck" detection in the enemy AI would come to nothing.
                wallLayer.setPixel(x4, y4, 2)
                if (isGround(x4, y4 + 1)) {
                    tileNumber = 6
                } else if (isGround(x4 - 1, y4) || isGround(x4 + 1, y4) || isGround(x4, y4 - 1)) {
                    tileNumber = 5
                } else {
                    tileNumber = 0
                }
            } else if (cell == 2) {
                tileNumber = 7
            } else if (cell == 3) {
                tileNumber = 8
            } else {
                tileNumber = randint(1, 3)
            }
            buffer[4 + y4 * GRID_WIDTH + x4] = tileNumber
        }
    }
    tiles.setCurrentTilemap(tiles.createTilemap(buffer, wallLayer,
        [TILE_ROCK, TILE_GROUND, TILE_GROUND_2, TILE_GROUND_3, TILE_GROUND,
            TILE_WALL, TILE_WALL_BASE, TILE_STAIRS, TILE_SPIKES],
        TileScale.Sixteen))
}
