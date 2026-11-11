// The title image and its building blocks: stone wall, torches, title image and title screen.
//
// Everything is painted at run time from rectangles, circles and lines. Not a single additional image lies in flash,
// only the sprites that already exist in graphics.ts are copied into the title image as decoration.
//
// The helpers drawBrickwork(), drawGround(), drawTorch(), drawOutlinedText() and the two color ladders are also used by
// the intro in intro.ts.

// The brightness ladder of the torchlight:
//   13 (d) light edge, 11 (b) light stone, 14 (e) warm brown, 12 (c) shadow, 15 (f) black

// Which stone color belongs to this distance from the torch?
function stoneColor (distance: number) {
    if (distance < 30) {
        return 11
    }
    if (distance < 56) {
        return 14
    }
    if (distance < 86) {
        return 12
    }
    return 15
}

// One step darker on the same ladder.
function darkerStone (color: number) {
    if (color == 13) {
        return 11
    }
    if (color == 11) {
        return 14
    }
    if (color == 14) {
        return 12
    }
    return 15
}

// Rough distance between two points. Exact enough for the light and much cheaper than a square root.
function lightDistance (pointX: number, pointY: number, lx: number, ly: number) {
    let dx = absValue(pointX - lx)
    let dy = absValue(pointY - ly)
    if (dx > dy) {
        return dx + Math.idiv(dy, 2)
    }
    return dy + Math.idiv(dx, 2)
}

// Text with a dark border, otherwise the text disappears in the brickwork. The text is centered horizontally.
function drawOutlinedText (canvas: Image, text: string, y: number, color: number, border: number,
    font: image.Font) {
    let x = Math.idiv(canvas.width - text.length * font.charWidth, 2)
    canvas.print(text, x - 1, y, border, font)
    canvas.print(text, x + 1, y, border, font)
    canvas.print(text, x, y - 1, border, font)
    canvas.print(text, x, y + 1, border, font)
    canvas.print(text, x, y, color, font)
}

// A stone wall from y = top to y = bottom. leftTorchX and rightTorchX are the two torches at the height ly: stones near
// them become bright, farther away the wall sinks into black.
function drawBrickwork (canvas: Image, top: number,
    bottom: number, leftTorchX: number, rightTorchX: number, ly: number) {
    let row = 0
    let offset = 0
    let distance = 0
    let otherDistance = 0
    let color = 0
    // The joints stay black, so first fill everything black.
    canvas.fillRect(0, top, canvas.width, bottom - top, 15)
    for (let zy = top; zy < bottom; zy += 12) {
        offset = 0
        if (row % 2 == 1) {
            offset = 11
        }
        for (let zx = offset - 22; zx < canvas.width; zx += 22) {
            distance = lightDistance(zx + 10, zy + 5, leftTorchX, ly)
            otherDistance = lightDistance(zx + 10, zy + 5, rightTorchX, ly)
            if (otherDistance < distance) {
                distance = otherDistance
            }
            color = stoneColor(distance)
            // Every third stone is a little darker, that gives structure.
            if ((row + Math.idiv(zx + 44, 22)) % 3 == 0) {
                color = darkerStone(color)
            }
            canvas.fillRect(zx, zy, 20, 10, color)
            if (color == 11) {
                canvas.fillRect(zx, zy, 20, 1, 13)
                canvas.fillRect(zx, zy + 9, 20, 1, 12)
            } else if (color == 14) {
                canvas.fillRect(zx, zy, 20, 1, 4)
            }
            // A crack here and there.
            if ((row * 2 + Math.idiv(zx + 44, 22)) % 7 == 3 && color != 15) {
                canvas.drawLine(zx + 5, zy + 1, zx + 8, zy + 8, 15)
            }
        }
        row += 1
    }
}

// The stone floor under the wall, also graded by the torchlight. It is a touch darker than the wall.
function drawGround (canvas: Image, top: number, leftTorchX: number, rightTorchX: number) {
    let row = 0
    let offset = 0
    let distance = 0
    let otherDistance = 0
    canvas.fillRect(0, top, canvas.width, canvas.height - top, 15)
    canvas.fillRect(0, top, canvas.width, 2, 12)
    for (let zy = top + 3; zy < canvas.height; zy += 9) {
        offset = 0
        if (row % 2 == 1) {
            offset = 12
        }
        for (let zx = offset - 24; zx < canvas.width; zx += 24) {
            distance = lightDistance(zx + 11, zy + 4, leftTorchX, top + 10)
            otherDistance = lightDistance(zx + 11, zy + 4, rightTorchX, top + 10)
            if (otherDistance < distance) {
                distance = otherDistance
            }
            canvas.fillRect(zx, zy, 22, 7, darkerStone(stoneColor(distance)))
        }
        row += 1
    }
}

// A wall torch. fx is the middle, fy the height of the flame. flicker (0 or 1) makes the tip wobble. So two still
// images become two states of a burning torch.
function drawTorch (canvas: Image, fx: number, flicker: number = 0, fy: number = 42) {
    let tip = fy - 9 - flicker * 4
    // Handle and iron ring on the wall.
    canvas.fillRect(fx - 1, fy + 6, 3, 20, 14)
    canvas.fillRect(fx - 3, fy + 7, 7, 3, 11)
    canvas.fillRect(fx - 3, fy + 7, 7, 1, 13)
    // Flame: orange outside, yellow inside, white in the core.
    canvas.fillCircle(fx, fy + 3, 5, 4)
    canvas.drawLine(fx, tip, fx - 4, fy + 3, 4)
    canvas.drawLine(fx, tip, fx + 4, fy + 3, 4)
    canvas.drawLine(fx - 1 + flicker * 2, tip + 2, fx - 3, fy + 3, 4)
    canvas.fillCircle(fx, fy + 2, 3, 5)
    canvas.drawLine(fx, tip + 4, fx, fy + 2, 5)
    canvas.fillCircle(fx, fy + 1, 1, 1)
}

// Cobwebs in the two top corners.
function drawCobwebs (canvas: Image) {
    for (let side = 0; side < 2; side++) {
        let ex = 0
        let ri = 1
        if (side == 1) {
            ex = canvas.width - 1
            ri = -1
        }
        canvas.drawLine(ex, 0, ex + ri * 19, 8, 11)
        canvas.drawLine(ex, 0, ex + ri * 13, 14, 11)
        canvas.drawLine(ex, 0, ex + ri * 7, 19, 11)
        canvas.drawLine(ex + ri * 9, 4, ex + ri * 4, 9, 11)
        canvas.drawLine(ex + ri * 15, 7, ex + ri * 7, 15, 11)
    }
}

// The title image. hint fades in "PRESS A", flicker makes the second state of the torches. That makes the hint blink in
// time with the fire.
function drawTitleImage (hint: boolean, flicker: number = 0) {
    let bigFont = image.doubledFont(image.font8)
    stage = image.create(160, 120)
    stage.fill(15)
    // Wall, floor and the two torches right at the outside.
    drawBrickwork(stage, 0, 100, 14 - flicker * 2, 146 + flicker * 2, 46)
    drawGround(stage, 100, 14, 146)
    drawTorch(stage, 14, flicker, 46)
    drawTorch(stage, 146, flicker, 46)
    // Puddles of light on the floor under the torches.
    stage.fillRect(4 - flicker, 100, 21, 2, 4)
    stage.fillRect(9 - flicker, 100, 11, 1, 5)
    stage.fillRect(136 + flicker, 100, 21, 2, 4)
    stage.fillRect(141 + flicker, 100, 11, 1, 5)
    drawCobwebs(stage)
    // Two chains hold the sign to the ceiling.
    for (let ky = 0; ky < 12; ky += 3) {
        stage.fillRect(45, ky, 3, 2, 11)
        stage.fillRect(112, ky, 3, 2, 11)
        stage.setPixel(45, ky, 13)
        stage.setPixel(112, ky, 13)
    }
    // Wooden sign with a sunken middle.
    stage.fillRect(22, 11, 116, 50, 14)
    stage.fillRect(22, 22, 116, 1, 12)
    stage.fillRect(22, 44, 116, 1, 12)
    stage.drawRect(22, 11, 116, 50, 15)
    stage.drawRect(23, 12, 114, 48, 4)
    stage.fillRect(28, 17, 104, 38, 15)
    stage.drawRect(28, 17, 104, 38, 12)
    stage.setPixel(25, 14, 5)
    stage.setPixel(134, 14, 5)
    stage.setPixel(25, 57, 5)
    stage.setPixel(134, 57, 5)
    // The lettering glows: on top yellow writing with an orange border, below it orange writing with a red border.
    drawOutlinedText(stage, GameName.TITLE_LINES[0], 19, 5, 4, bigFont)
    drawOutlinedText(stage, GameName.TITLE_LINES[1], 37, 4, 2, bigFont)
    // Controls and best score. They are two lines because font8 is six pixels wide: at a screen width of 160 pixels
    // only 26 characters fit side by side. The frame of the wooden sign reaches down to y = 60, so the first line only
    // starts at 63 (its border at 62), otherwise the frame lines would run across the writing. The best score in font8
    // takes the rows 82 to 91 with its border, right below it at 92 stands the hero.
    drawOutlinedText(stage, Catalog.text(Catalog.TextId.TITLE_CONTROLS), 63, 13, 15, image.font8)
    drawOutlinedText(stage, Catalog.text(Catalog.TextId.TITLE_MAP), 73, 13, 15, image.font8)
    drawOutlinedText(stage, Catalog.format(Catalog.TextId.BEST,
        info.highScore()), 83, 5, 15, image.font8)
    // Decoration on the floor: the hero waits in front of the chest.
    stage.drawTransparentImage(IMG_CHEST, 14, 88)
    stage.drawTransparentImage(IMG_KEY, 112, 92)
    stage.drawTransparentImage(DECOR_BONES, 130, 106)
    stage.drawTransparentImage(IMG_HERO, 72, 92)
    if (hint) {
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.PRESS_A), 105, 1, 15, image.font8)
    }
    return stage
}

// The title screen: first the intro (story, card "Calliope Hacker presents" with the title card, tutorial boards), then
// it waits for A.
//
// The stage lives across all the parts of the intro: Intro.createStage() makes it, Intro.closeStage() frees it. Freeing
// must run on every path, also after a stop with A, otherwise the two title images are missing 9.6 KB of memory. Every
// station begins with Intro.startStation(): a press of A only skips the running station (see intro.ts).
function runTitleScreen () {
    aPressed = false
    // After the end of the game (restart with the marker) it goes straight to the title image.
    if (PLAY_INTRO && !(Catalog.directToTitle)) {
        Intro.createStage()
        Intro.play()
        Intro.showCards()
        Intro.startStation(true)
        Tutorial.play()
        Intro.closeStage()
    }
    titleImageWithHint = drawTitleImage(true, 0)
    titleImagePlain = drawTitleImage(false, 1)
    // The title image is a station too: the press that has just skipped the tutorial boards no longer counts, and in
    // the lock time after it even a mashed A does not start the game.
    Intro.startStation(true)
    scene.setBackgroundImage(titleImageWithHint)
    Sound.startTitleMusic()
    while (!(Intro.pressed())) {
        pause(120)
        blinkCounter += 1
        if (blinkCounter % 6 == 0) {
            scene.setBackgroundImage(titleImagePlain)
        } else if (blinkCounter % 6 == 3) {
            scene.setBackgroundImage(titleImageWithHint)
        }
    }
    Sound.stopMusic()
    scene.setBackgroundImage(image.create(16, 16))
    // The two title images are each 160 × 120 pixels big, together a good 19 KB, and are never needed again. Without
    // letting go of the references they would take up memory the whole time the game runs. That is a noticeable share
    // on the Calliope, which has little memory. The variable stage holds the same image as titleImagePlain, so it must
    // be cleared too.
    titleImageWithHint = null
    titleImagePlain = null
    stage = null
}
