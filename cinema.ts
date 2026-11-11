// Cinema: the toolbox for intro and ending.
//
// Four gestures, the same everywhere:
//   drawFrame()   bars, round corners, camera shake, in every frame
//   drawWave()    the shock wave of an impact
//   drawBeam, drawWreath   wedges of light (god rays)
//   coolDown()    everything glowing sinks one step toward black
//
// Everything is always painted into the full-screen image stage. Here no image is ever made and nothing is ever waited
// for. The waiting and the check of the A button stay in Intro.wait() and Ending.wait().
//
// This namespace has no state of its own: everything goes through the parameters. Otherwise at some point the title
// image would get cinema bars.
//
// No decimals and no angle functions: all directions come from the tables DIRECTION_X and DIRECTION_Y.
namespace Cinema {
    // The bar height in the normal case: 8 at the top and 8 at the bottom out of 120 pixels. That looks like a wide
    // screen without squashing the picture. What stays visible is y = 8 to 111.
    export const BAR_HEIGHT = 8

    // 16 directions on a circle with radius 64, rounded to whole numbers (64 × cos and 64 × sin in steps of 22.5
    // degrees). A point in direction k at distance r is at x = cx + Math.idiv(DIRECTION_X[k] * r, 64). Adding 4 to a
    // direction k always gives the direction turned by 90 degrees, so the end edge of a wedge is square to its axis.
    const DIRECTION_X = [64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24, 0, 24, 45, 59]
    const DIRECTION_Y = [0, 24, 45, 59, 64, 59, 45, 24, 0, -24, -45, -59, -64, -59, -45, -24]

    // How many pixels in row j (counted from the edge of the bar) stay black on the left and on the right: the rounded
    // corner of the cinema frame.
    const CORNER_PIXELS = [10, 6, 4, 3, 2, 2, 1, 1]

    // Camera shake that dies down bit by bit. Level 0 is the blow itself.
    const JOLT_X = [4, -3, 3, -2, 2, -1, 1, 0]
    const JOLT_Y = [-3, 3, -2, 2, -1, 1, 0, 0]

    // Starting speeds of the sparks, pure pixel values.
    const SPARK_SPEED_X = [-9, -7, -5, -2, 0, 2, 5, 7, 9, -4, 4, 0]
    const SPARK_SPEED_Y = [-3, -6, -8, -9, -10, -9, -8, -6, -3, -7, -7, -11]

    // Confetti colors. Only use in the ending (see dropConfetti()).
    const CONFETTI_COLORS = [5, 4, 1, 5, 2, 4, 3, 7, 10]

    // The cinema frame: bars at the top and bottom, a fine light edge, rounded corners. It is always the last paint
    // command of a frame.
    //
    // shiftX and shiftY do not move the picture, they move the opening: with shiftY = 3 the top bar grows and the
    // bottom one shrinks. The eye sees a camera jolt in that. The trick costs nothing, and no scene has to change its
    // coordinates for it. (stage.scroll() would be the obvious way, but with shiftY not 0 it makes a copy of the image
    // of 9.6 KB inside. Do not use it.)
    export function drawFrame(shiftX: number, shiftY: number, barHeight: number) {
        let topBar = barHeight + shiftY
        let bottomBar = barHeight - shiftY
        if (topBar < 0) {
            topBar = 0
        }
        if (bottomBar < 0) {
            bottomBar = 0
        }
        stage.fillRect(0, 0, 160, topBar, 15)
        stage.fillRect(0, 120 - bottomBar, 160, bottomBar, 15)
        if (shiftX > 0) {
            stage.fillRect(0, topBar, shiftX, 120 - topBar - bottomBar, 15)
        }
        if (shiftX < 0) {
            stage.fillRect(160 + shiftX, topBar, 0 - shiftX, 120 - topBar - bottomBar, 15)
        }
        // The light edge: without it the bar blurs into a black image, and you would not see the frame at all.
        if (topBar > 0) {
            stage.fillRect(0, topBar - 1, 160, 1, 12)
        }
        if (bottomBar > 0) {
            stage.fillRect(0, 120 - bottomBar, 160, 1, 12)
        }
        for (let j = 0; j < 8; j++) {
            stage.fillRect(0, topBar + j, CORNER_PIXELS[j], 1, 15)
            stage.fillRect(160 - CORNER_PIXELS[j], topBar + j, CORNER_PIXELS[j], 1, 15)
            stage.fillRect(0, 119 - bottomBar - j, CORNER_PIXELS[j], 1, 15)
            stage.fillRect(160 - CORNER_PIXELS[j], 119 - bottomBar - j, CORNER_PIXELS[j], 1, 15)
        }
    }

    // Frame with a camera shake at the given level: 0 is the blow itself, the higher the calmer. From 8 on, the
    // camera stands still.
    export function shakeFrame(level: number, h: number) {
        if (level < 0 || level > 7) {
            drawFrame(0, 0, h)
        } else {
            drawFrame(JOLT_X[level], JOLT_Y[level], h)
        }
    }

    // Bar height for frame f of a scene: the first four frames open the bars (59, 42, 25, then 8).
    export function openBars(f: number) {
        if (f >= 3) {
            return BAR_HEIGHT
        }
        return BAR_HEIGHT + (3 - f) * 17
    }

    // A shock wave: three color rings from the outside in, the middle is cleared again. So only use it on a black
    // background and always as the first thing in a frame. With four built-in fillCircle calls it is very cheap.
    // drawCircle would be wrong here: that is a TypeScript loop that calls setPixel about 6 × r times per circle.
    export function drawWave(cx: number, cy: number,
        r: number, f1: number, f2: number, f3: number) {
        if (r < 4) {
            return
        }
        stage.fillCircle(cx, cy, r, f1)
        stage.fillCircle(cx, cy, r - 3, f2)
        stage.fillCircle(cx, cy, r - 6, f3)
        stage.fillCircle(cx, cy, r - 10, 15)
    }

    // A single ring as an outline. It is the only way to lay a wave over a finished image. It is expensive (see above),
    // so at most one call per frame and r at most 120.
    export function drawRing(cx: number, cy: number, r: number, color: number) {
        if (r < 1 || r > 120) {
            return
        }
        stage.drawCircle(cx, cy, r, color)
    }

    // Sparks on a flight path at time t, calculated with whole numbers:
    //   x = cx + vx * t / 2
    //   y = cy + vy * t / 2 + t * t / 2   (the last part is gravity)
    //
    // They do not have to fade: coolDown() turns the sparks that stay behind into a glowing trail by itself. There can
    // be at most 12 sparks (n).
    export function drawSparks(cx: number, cy: number, t: number, n: number, color: number) {
        for (let k = 0; k < n; k++) {
            stage.setPixel(cx + Math.idiv(SPARK_SPEED_X[k] * t, 2),
                cy + Math.idiv(SPARK_SPEED_Y[k] * t, 2) + Math.idiv(t * t, 2), color)
        }
    }

    // A wedge of light: a triangle from the source in direction i. The end edge is square to it, hence the direction i
    // + 4. fillTriangle is built in and clips by itself, so length may go past the edge of the image.
    export function drawBeam(qx: number, qy: number, i: number,
        length: number, width: number, color: number) {
        let ex = qx + Math.idiv(DIRECTION_X[i % 16] * length, 64)
        let ey = qy + Math.idiv(DIRECTION_Y[i % 16] * length, 64)
        let bx = Math.idiv(DIRECTION_X[(i + 4) % 16] * width, 64)
        let by = Math.idiv(DIRECTION_Y[(i + 4) % 16] * width, 64)
        stage.fillTriangle(qx, qy, ex +
            bx, ey + by, ex - bx, ey - by, color)
    }

    // Eight wedges of light in a wreath. phase 0 or 1 turns it on by half a division. If you alternate between the two,
    // it looks like a slow turn, and nothing has to be calculated.
    export function drawWreath(cx: number, cy: number, r: number, phase: number,
        color: number, width: number) {
        for (let i = phase; i < 16; i += 2) {
            drawBeam(cx, cy, i, r, width, color)
        }
    }

    // An eight-pointed glint: a cross plus diagonals of half the length. With only four lines this is the cheapest
    // highlight there is.
    export function drawGlint(sx: number, sy: number, radius: number, color: number) {
        let h = Math.idiv(radius, 2)
        stage.drawLine(sx - radius, sy, sx + radius, sy, color)
        stage.drawLine(sx, sy - radius, sx, sy + radius, color)
        stage.drawLine(sx - h, sy - h, sx + h, sy + h, color)
        stage.drawLine(sx - h, sy + h, sx + h, sy - h, color)
    }

    // Glowing metal cools down: white, yellow, orange, red, brown, gray, black. As with Intro.dim(), the order goes
    // from dark to bright, otherwise a color would fall through the whole ladder in one go.
    //
    // The most important effect of the whole toolbox: you paint rings, beams and sparks once, leave the stage standing
    // and only call coolDown() once per frame. Everything glows out by itself, a particle system without a
    // single state variable.
    //
    // Careful: colors 12 and 14 fall along too, so the brickwork falls apart. Only use it on a stage that is meant to
    // go to black anyway. Colors 11 and 13 survive: whatever should stay standing is painted in 13. Never call it twice
    // in the same frame.
    export function coolDown() {
        stage.replace(12, 15)
        stage.replace(14, 12)
        stage.replace(2, 14)
        stage.replace(4, 2)
        stage.replace(5, 4)
        stage.replace(1, 5)
    }

    // Falling confetti. Without randint, so that it really falls and does not just flicker.
    //
    // Only use in the ending: colors 3, 7 and 10 appear here, and Intro.dim() does not know them. In the intro such a
    // speck would stay bright during the fade-out. The ending never runs through dim(), so it is allowed here.
    export function dropConfetti(f: number) {
        for (let k = 0; k < 18; k++) {
            stage.fillRect(k * 9 + 4, (k * 27 +
                f * 11) % 104 + 10, 2, 3, CONFETTI_COLORS[k % 9])
        }
    }
}
