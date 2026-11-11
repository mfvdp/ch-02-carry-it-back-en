// Intro: the story and the studio card before the title image. runTitleScreen() in title_screen.ts calls it. It runs
// after every switch-on, but not at the restart after the game has ended (see Catalog.directToTitle).
//
// The intro runs in this order: story, studio card, title card, tutorial boards.
//   play()              the story of the hero:
//     1. Stormy night: lightning tears the castle out of the dark.
//     2. The treasure room: the thief steals the crown in the moonlight.
//     3. Camera ride through the corridor: his eyes, his trail of gold.
//     4. A torch lights up: "His trail ends here."
//     5. The portcullis crashes down, splinters fly.
//     6. The vow: the crown floats in a wreath of rays.
//   showCards()         the studio card "Calliope Hacker presents" (playLogo(), with the figure at the desk),
//                       then the title card and the fade-out
//   Tutorial.play()     the tutorial boards (own file tutorial.ts)
//
// createStage() makes the full-screen image stage once for all the parts, closeStage() fades out and frees it again.
// runTitleScreen() calls both, and in between stage must never be freed.
//
// Skipping with A, station by station: a press during the story jumps to the studio card, a press on the studio card
// jumps to the title card, a press on the title card jumps to the tutorial boards, a press during the tutorial boards
// jumps to the title image. Every station begins with startStation(): an old press expires, and presses in the first
// LOCK_MS milliseconds do not count. On the studio card the longer lock LOCK_STUDIO_CARD_MS applies. The Calliope
// Hacker is on screen there from the first frame, so whoever keeps pressing has seen him. The handler in events.ts sets
// aPressed only on the press, never while holding: whoever holds A has to let go first. So neither holding nor mashing
// skips two stations at once.
//
// Everything is always painted into the same full-screen image stage, so that the working memory is not filled up with
// several images of 160 × 120 pixels. The only image in flash is the Calliope Hacker (IMG_HACKER in graphics.ts).
namespace Intro {
    // Vanishing point of the camera ride.
    const CORRIDOR_VANISH_X = 80
    const CORRIDOR_VANISH_Y = 54

    // Becomes true as soon as A stops the running station.
    let skipRequested = false
    // May the running station be stopped with A?
    let canSkip = true
    // Until this time (game.runtime) every press expires.
    let lockEndMs = 0
    // For this long after a change of station no press counts.
    const LOCK_MS = 500
    // On the studio card "Calliope Hacker presents" A only counts after 1.5 s. The figure is there from the
    // first frame (playLogo()).
    const LOCK_STUDIO_CARD_MS = 1500

    // Starts a new station: an old press expires, and in the next LOCK_MS milliseconds no presses count. Right now
    // every station can be skipped; with skippable = false a station would always run to the end.
    export function startStation(skippable: boolean) {
        aPressed = false
        skipRequested = false
        canSkip = skippable
        lockEndMs = game.runtime() + LOCK_MS
    }

    // Evaluates a press: in the lock time, or on a station that runs through, it expires. Otherwise it
    // stops the station.
    function checkPress() {
        if (aPressed) {
            if (canSkip && game.runtime() >= lockEndMs) {
                skipRequested = true
            } else {
                aPressed = false
            }
        }
    }

    // For the title image: has a valid press been made since startStation()?
    export function pressed() {
        checkPress()
        return skipRequested
    }

    // ---- Small helpers ----

    // Waits in small bites and remembers a button press.
    export function wait(durationMs: number) {
        let remaining = durationMs
        let step = 0
        while (remaining > 0) {
            checkPress()
            if (skipRequested) {
                return
            }
            step = 30
            if (remaining < step) {
                step = remaining
            }
            pause(step)
            remaining = remaining - step
        }
        checkPress()
    }

    // Shows the current state of stage on the screen.
    export function show() {
        scene.setBackgroundImage(stage)
    }

    // The cinema bars close over the still image. Painting again is not needed: the bars simply eat the last frame of
    // the scene. The counterpart of Cinema.openBars().
    export function closeBars() {
        for (let f = 0; f < 4; f++) {
            if (skipRequested) {
                return
            }
            Cinema.drawFrame(0, 0, 8 + f * 17)
            show()
            wait(60)
        }
    }

    // The flash: a single blazing white frame. Never two, two would make a flicker like a strobe light.
    export function whiteFlash() {
        if (skipRequested) {
            return
        }
        stage.fill(1)
        Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
        show()
        wait(60)
    }

    // Has A stopped the running station? The tutorial boards in tutorial.ts ask this, but cannot reach skipRequested
    // directly: the variable is private in this namespace.
    export function isSkipped() {
        return skipRequested
    }

    // Makes the full-screen image that the whole intro is painted into, and begins the first station (the story).
    export function createStage() {
        startStation(true)
        stage = image.create(160, 120)
        stage.fill(15)
        scene.setBackgroundImage(stage)
    }

    // Fades out and frees the full-screen image. Always runs, even when A has stopped things, and then only the
    // fade-out is skipped (break instead of return). Without freeing it, 9.6 KB would stay behind, and the two title
    // images would blow the memory.
    export function closeStage() {
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                break
            }
            dim()
            show()
            wait(70)
        }
        Sound.stopMusic()
        scene.setBackgroundImage(image.create(16, 16))
        stage = null
    }

    // Paints an existing sprite image at double size into stage. This way the tutorial boards need not a single
    // additional image in flash. Color 0 is transparent and stays free. qx and qy count the pixels in the source image
    // q, targetX and targetY are the top left corner on the stage.
    export function drawDouble(q: Image, targetX: number, targetY: number) {
        let color = 0
        for (let qy = 0; qy < q.height; qy++) {
            for (let qx = 0; qx < q.width; qx++) {
                color = q.getPixel(qx, qy)
                if (color != 0) {
                    stage.fillRect(targetX + qx * 2, targetY + qy * 2, 2, 2, color)
                }
            }
        }
    }

    // Darkens the whole image by one step. The order goes from dark to bright, otherwise a color would fall through the
    // whole ladder to black in one go. Colors 8 and 9 are the hero's blues: he stands on the last tutorial board, so he
    // has to sink into black as well, otherwise his body would stay bright in the fade-out.
    export function dim() {
        stage.replace(12, 15)
        stage.replace(14, 12)
        stage.replace(2, 12)
        stage.replace(8, 12)
        stage.replace(11, 14)
        stage.replace(4, 14)
        stage.replace(13, 11)
        stage.replace(5, 4)
        stage.replace(1, 13)
        stage.replace(9, 8)
    }

    // The card "Calliope Hacker presents" (the studio card): CALLIOPE HACKER, after the story

    // A word under a wandering shine of light: whatever is close to it glows. It is graded by distance like the
    // torchlight (stoneColor in title_screen.ts), but in the glow colors 5, 4, 14 and 12.
    function drawLogoWord(word: string, wy: number, bigFont: image.Font, shineX: number) {
        let wx = Math.idiv(160 - word.length * 12, 2)
        let distance = 0
        let color = 0
        for (let i = 0; i < word.length; i++) {
            distance = absValue(wx + i * 12 + 6 - shineX)
            color = 12
            if (distance < 46) {
                color = 14
            }
            if (distance < 26) {
                color = 4
            }
            if (distance < 12) {
                color = 5
            }
            stage.print(word.charAt(i), wx + i * 12, wy, color, bigFont)
        }
    }

    // Heights on the studio card: the name at the top, below it the Calliope Hacker at the desk, at the very bottom
    // "presents". The ending card in ending.ts uses them too.
    export const NAME_Y = 14
    export const HACKER_Y = 32
    export const PRESENTS_Y = 99
    const CRATER_CENTER_Y = 31

    // The Calliope Hacker on his board: golden frame (like the picture on the wall in the game), wall in the monitor
    // glow (color c) and in front of it the figure from graphics.ts. Without the board the black sweater would vanish
    // into the black background. The function paints anew in every frame of the studio card, after the effects and
    // before the frame. This way the figure stands still from the first frame, and coolDown() cannot eat into it.
    export function drawStudio() {
        stage.fillRect(45, 52, 70, 43, 4)
        stage.fillRect(46, 53, 68, 41, 12)
        stage.setPixel(45, 52, 5)
        stage.setPixel(114, 52, 5)
        stage.drawTransparentImage(IMG_HACKER, 48, 54)
    }

    // The studio card as a small film of about five seconds. It comes after the story as the card "Calliope Hacker
    // presents". The Calliope Hacker sits on his board at the desk from the first frame (so there is no opening fade).
    // Above him the lettering builds up: starry night, a dot races closer, IMPACT, CALLIOPE HACKER stands white-hot in
    // the crater, cools to gold, a shine of light passes over it, then "presents" stands there.
    export function playLogo() {
        if (skipRequested) {
            return
        }
        let bigFont = image.doubledFont(image.font8)
        // Act 1: starry night, a dot in the sky gets bigger.
        Sound.playApproach()
        for (let f = 0; f < 2; f++) {
            if (skipRequested) {
                return
            }
            stage.fill(15)
            for (let k = 0; k < 30; k++) {
                stage.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            for (let k = 0; k < 5; k++) {
                stage.setPixel(randint(0, 159), randint(8, 111), 13)
            }
            stage.fillCircle(20, 12 + f * 3, 1 + f, 13)
            drawStudio()
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(320)
        }
        // Act 2: the approach, the meteor pulls its tail.
        for (let f = 0; f < 7; f++) {
            if (skipRequested) {
                return
            }
            let mx = 20 + Math.idiv(60 * f, 6)
            let my = 12 + Math.idiv((CRATER_CENTER_Y - 12) * f, 6)
            stage.fill(15)
            for (let k = 0; k < 20; k++) {
                stage.setPixel(randint(0, 159), randint(8, 111), 12)
            }
            stage.drawLine(20, 12, mx, my, 14)
            stage.drawLine(21, 13, mx, my, 4)
            stage.fillCircle(mx, my, f + 3, 4)
            stage.fillCircle(mx, my, f + 1, 5)
            stage.fillCircle(mx, my, Math.idiv(f + 1, 2), 1)
            Cinema.drawSparks(mx, my, 2, 6, 5)
            drawStudio()
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(55)
        }
        // Act 3: the flash, a single blazing frame (like whiteFlash(), but with the figure on his board).
        Sound.playImpact()
        if (skipRequested) {
            return
        }
        stage.fill(1)
        drawStudio()
        Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
        show()
        wait(60)
        // Act 4: the shock wave races outward, the name stands white-hot in the crater. drawWave() must come first,
        // because it clears its middle. The frame comes last.
        const CRATER_COLORS = [1, 1, 5, 5, 4]
        const CORE_COLORS = [1, 1, 1, 5, 5]
        const BORDER_COLORS = [1, 1, 5, 5, 4]
        for (let f = 0; f < 5; f++) {
            if (skipRequested) {
                return
            }
            stage.fill(15)
            Cinema.drawWave(80, CRATER_CENTER_Y, 20 + f * 28, 1, 5, 4)
            Cinema.drawWave(80, CRATER_CENTER_Y, 4 + f * 22, 4, 14, 12)
            Cinema.drawWreath(80, CRATER_CENTER_Y, 40 + f * 26, f % 2, 5, 6)
            stage.fillCircle(80, CRATER_CENTER_Y, 16 - f * 3, CRATER_COLORS[f])
            drawOutlinedText(stage, "CALLIOPE",
                NAME_Y, CORE_COLORS[f], BORDER_COLORS[f], bigFont)
            drawOutlinedText(stage, "HACKER",
                HACKER_Y, CORE_COLORS[f], BORDER_COLORS[f], bigFont)
            Cinema.drawSparks(80, CRATER_CENTER_Y, f + 1, 12, 1)
            drawStudio()
            Cinema.shakeFrame(f, Cinema.BAR_HEIGHT)
            show()
            wait(70)
        }
        // Act 5: the glow cools down. No fill(): the stage from act 4 stays standing, coolDown() lets waves, wedges and
        // the sparks that stayed behind die away by themselves, while the letters are painted freshly hot again
        // in every frame.
        const GLOW_COLORS = [1, 1, 5, 5, 5, 5, 5]
        for (let f = 0; f < 7; f++) {
            if (skipRequested) {
                return
            }
            Cinema.coolDown()
            Cinema.drawSparks(80, CRATER_CENTER_Y, f + 6, 12, 1)
            drawOutlinedText(stage, "CALLIOPE", NAME_Y, GLOW_COLORS[f], 4, bigFont)
            drawOutlinedText(stage, "HACKER", HACKER_Y, GLOW_COLORS[f], 2, bigFont)
            if (f >= 3) {
                // Nine small flames burn above the words (four above CALLIOPE, five above HACKER).
                for (let lx = 62; lx <= 98; lx += 12) {
                    stage.drawLine(lx, NAME_Y - 1, lx + randint(0 - 1, 1), NAME_Y - 5, 4)
                    stage.setPixel(lx, NAME_Y - 6, 5)
                }
                for (let lx = 56; lx <= 104; lx += 12) {
                    stage.drawLine(lx, HACKER_Y - 1, lx + randint(0 - 1, 1), HACKER_Y - 5, 4)
                    stage.setPixel(lx, HACKER_Y - 6, 5)
                }
            }
            drawStudio()
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(120)
        }
        // Act 6: the shine of light passes over the words, the glow in the background keeps dying out.
        Sound.playStudio()
        for (let shineX = 0 - 20; shineX <= 190; shineX += 22) {
            if (skipRequested) {
                return
            }
            Cinema.coolDown()
            drawLogoWord("CALLIOPE", NAME_Y, bigFont, shineX)
            drawLogoWord("HACKER", HACKER_Y, bigFont, shineX)
            drawStudio()
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(55)
        }
        // Act 7: a still image in backlight, with the logo chord. 16 frames of 130 ms make a good two seconds, and the
        // chord (2.0 s) carries almost to the end. This way you can really read "presents".
        Sound.playLogo()
        for (let f = 0; f < 16; f++) {
            if (skipRequested) {
                return
            }
            Cinema.coolDown()
            Cinema.drawWreath(80, CRATER_CENTER_Y + 20, 100, f % 2, 14, 8)
            drawOutlinedText(stage, "CALLIOPE", NAME_Y, 5, 4, bigFont)
            drawOutlinedText(stage, "HACKER", HACKER_Y, 4, 2, bigFont)
            drawStudio()
            if (f % 2 == 0) {
                Cinema.drawGlint(26, NAME_Y + 4, 5, 1)
            } else {
                Cinema.drawGlint(134, HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.PRESENTS),
                    PRESENTS_Y, 13, 15, image.font8)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(130)
        }
        closeBars()
    }

    // Story text: two lines type themselves out frame by frame while the scene carries on behind them.

    // Paints the text state for frame f: line 1 grows from the first frame. Line 2 only begins when line 1 is done
    // (eight frames later).
    function drawStoryText(line1: string, line2: string, f: number, y1: number, y2: number) {
        let z1 = Math.min(f + 1, line1.length)
        let z2 = f + 1 - line1.length - 8
        if (z2 > line2.length) {
            z2 = line2.length
        }
        stage.print(line1.substr(0, z1), Math.idiv(160 - line1.length * 6, 2), y1, 13, image.font8)
        if (z2 > 0) {
            stage.print(line2.substr(0, z2),
                Math.idiv(160 - line2.length * 6, 2), y2, 13, image.font8)
        }
    }

    // How many frames the double line needs, including reading time.
    function storyFrameCount(line1: string, line2: string) {
        return line1.length + 8 + line2.length + 16
    }

    // ---- 1. Stormy night over the castle ----

    // Castle silhouette on the hill, stars, rain. bright = a flash of lightning lights up the sky, and the castle
    // stands as a black paper cut-out in front of the glaring wall.
    function drawCastle(bright: boolean) {
        stage.fill(15)
        if (bright) {
            stage.fillRect(0, 0, 160, 90, 13)
        } else {
            for (let k = 0; k < 14; k++) {
                stage.setPixel(randint(0, 159), randint(0, 58), 1)
            }
        }
        // The hill. In the lightning it becomes a silhouette too.
        let hill = 12
        if (bright) {
            hill = 15
        }
        stage.fillCircle(80, 152, 76, hill)
        // Keep, two towers, battlements: all black outlines.
        stage.fillRect(64, 46, 32, 34, 15)
        stage.fillRect(52, 38, 12, 42, 15)
        stage.fillRect(96, 38, 12, 42, 15)
        for (let zx = 52; zx < 64; zx += 5) {
            stage.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 96; zx < 108; zx += 5) {
            stage.fillRect(zx, 33, 3, 6, 15)
        }
        for (let zx = 64; zx < 96; zx += 6) {
            stage.fillRect(zx, 41, 3, 6, 15)
        }
        // Flag on the keep.
        stage.drawLine(80, 46, 80, 34, 15)
        stage.fillRect(81, 34, 6, 3, 2)
        // Lit windows: at night the only thing you can see.
        stage.fillRect(70, 56, 3, 4, 5)
        stage.fillRect(84, 52, 3, 4, 5)
        stage.fillRect(56, 46, 2, 3, 5)
        stage.fillRect(100, 50, 2, 3, 5)
        // Rain, brighter in the lightning.
        let rain = 12
        if (bright) {
            rain = 11
        }
        for (let k = 0; k < 26; k++) {
            let rx = randint(0, 159)
            let ry = randint(0, 104)
            stage.drawLine(rx, ry, rx - 2, ry + 6, rain)
        }
        // Bank of fog at the bottom: the writing stays easy to read on it.
        stage.fillRect(0, 92, 160, 28, 15)
        for (let k = 0; k < 20; k++) {
            stage.setPixel(randint(0, 159), 92 + randint(0, 3), 12)
        }
    }

    // A bolt of lightning: a jagged path from the sky to one of the towers.
    function drawLightning() {
        let bx = 58
        if (randint(0, 1) == 1) {
            bx = 102
        }
        let fromX = bx + randint(0 - 30, 30)
        let fromY = 0
        let toX = 0
        let toY = 0
        for (let k = 1; k <= 4; k++) {
            toX = bx + randint(0 - 14, 14)
            toY = Math.idiv(34 * k, 4)
            if (k == 4) {
                toX = bx
            }
            stage.drawLine(fromX, fromY, toX, toY, 1)
            stage.drawLine(fromX + 1, fromY, toX + 1, toY, 13)
            fromX = toX
            fromY = toY
        }
    }

    function sceneCastle() {
        if (skipRequested) {
            return
        }
        let line1 = Catalog.text(Catalog.TextId.INTRO_1)
        let line2 = Catalog.text(Catalog.TextId.INTRO_2)
        let lightning = 0
        let near = false
        let total = storyFrameCount(line1, line2)
        for (let f = 0; f < total; f++) {
            if (skipRequested) {
                return
            }
            // Three bolts of lightning, each stays for two frames. The third one strikes close: a blazing white frame,
            // the camera shakes.
            if (lightning == 0 && (f == 5 || f == 30 || f == total - 8)) {
                lightning = 2
                near = f == total - 8
                Sound.playThunder()
                if (near) {
                    Sound.playImpact()
                }
            }
            drawCastle(lightning > 0)
            if (lightning > 0) {
                drawLightning()
                lightning -= 1
            }
            drawStoryText(line1, line2, f, 94, 103)
            if (near && lightning == 1) {
                stage.fill(1)
            }
            Cinema.shakeFrame(8 - lightning * 3, Cinema.openBars(f))
            show()
            wait(70)
        }
        closeBars()
        wait(900)
    }

    // ---- 2. The treasure room: the thief steals the crown ----

    // The crown, painted and not an image in flash. cx is the middle, cy the height of the points of the spikes.
    // sparkle sets highlights. The ending also paints the crown thief's loot with it.
    export function drawCrown(cx: number, cy: number, sparkle: boolean) {
        stage.fillRect(cx - 10, cy + 4, 20, 5, 5)
        stage.fillRect(cx - 10, cy + 8, 20, 1, 4)
        stage.fillRect(cx - 10, cy, 4, 4, 5)
        stage.fillRect(cx - 2, cy - 3, 4, 7, 5)
        stage.fillRect(cx + 6, cy, 4, 4, 5)
        stage.fillRect(cx - 1, cy + 5, 2, 2, 2)
        if (sparkle) {
            stage.setPixel(cx + 3, cy - 2, 1)
            stage.setPixel(cx - 7, cy + 2, 1)
        }
    }

    // The treasure room: a moonbeam falls on the pedestal. The beam gets wider toward the floor, which gives
    // perspective: two trapezoids instead of two rectangles.
    function drawTreasureRoom() {
        stage.fill(15)
        stage.fillPolygon4(70, 0, 94, 0, 104, 94, 60, 94, 14)
        stage.fillPolygon4(75, 0, 89, 0, 96, 94, 68, 94, 11)
        // Dust dances in the light.
        for (let k = 0; k < 8; k++) {
            stage.setPixel(randint(69, 94), randint(4, 88), 13)
        }
        // Floor and pedestal.
        stage.fillRect(0, 94, 160, 3, 12)
        stage.fillRect(74, 78, 16, 4, 11)
        stage.fillRect(77, 82, 10, 12, 12)
        stage.fillRect(72, 92, 20, 2, 11)
    }

    // The thief: a black shadow figure with a hood and red eyes. centerX and centerY are the middle of his body.
    function drawThief(centerX: number, centerY: number) {
        // First the gray edge, then the black inside it.
        stage.fillCircle(centerX, centerY - 10, 6, 12)
        stage.fillCircle(centerX, centerY, 9, 12)
        stage.fillRect(centerX - 9, centerY, 18, 12, 12)
        stage.fillCircle(centerX, centerY - 10, 5, 15)
        stage.fillCircle(centerX, centerY, 8, 15)
        stage.fillRect(centerX - 8, centerY, 16, 11, 15)
        // The eyes glow.
        stage.fillRect(centerX - 3, centerY - 11, 2, 2, 2)
        stage.fillRect(centerX + 1, centerY - 11, 2, 2, 2)
    }

    function sceneThief() {
        if (skipRequested) {
            return
        }
        let line1 = Catalog.text(Catalog.TextId.INTRO_3)
        let line2 = Catalog.text(Catalog.TextId.INTRO_4)
        // The crown shines alone in the moonlight.
        for (let f = 0; f < 7; f++) {
            if (skipRequested) {
                return
            }
            drawTreasureRoom()
            drawCrown(82, 69, f % 2 == 0)
            Cinema.drawFrame(0, 0, Cinema.openBars(f))
            show()
            wait(200)
        }
        // The thief sneaks in from the right.
        for (let f = 0; f < 9; f++) {
            if (skipRequested) {
                return
            }
            drawTreasureRoom()
            drawCrown(82, 69, f % 3 == 0)
            drawThief(146 - f * 6, 82)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(100)
        }
        if (skipRequested) {
            return
        }
        // He grabs it! The beam flares up, god rays fan out downward, the crown sits on the hood.
        Sound.playWhoosh()
        drawTreasureRoom()
        stage.fillPolygon4(64, 0, 100, 0, 116, 94, 48, 94, 13)
        Cinema.drawBeam(82, 0, 3, 120, 20, 1)
        Cinema.drawBeam(82, 0, 4, 120, 24, 1)
        Cinema.drawBeam(82, 0, 5, 120, 20, 1)
        drawThief(94, 82)
        drawCrown(94, 55, true)
        Cinema.drawGlint(94, 52, 8, 1)
        Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
        show()
        wait(280)
        // Escape to the left, gold sparks fly after him.
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                return
            }
            drawTreasureRoom()
            let thiefX = 94 - (f + 1) * 22
            drawThief(thiefX, 82)
            drawCrown(thiefX, 55, true)
            Cinema.drawGlint(thiefX, 55, 5, 1)
            stage.drawLine(thiefX + 12, 74, thiefX + 30, 74, 12)
            stage.drawLine(thiefX + 14, 84, thiefX + 32, 84, 12)
            for (let k = 0; k < 5; k++) {
                stage.setPixel(thiefX + 12 + randint(0, 40), 60 + randint(0, 30), 5)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(80)
        }
        // The empty pedestal stays behind, the lines type themselves out.
        let total = storyFrameCount(line1, line2)
        for (let f = 0; f < total; f++) {
            if (skipRequested) {
                return
            }
            drawTreasureRoom()
            drawStoryText(line1, line2, f, 96, 104)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(70)
        }
        closeBars()
        wait(900)
    }

    // ---- 6. The vow: the crown in a wreath of rays ----

    // The stolen crown floats in a dome of light: 16 wedges of light in two wreaths that seem to turn
    // against each other.
    function drawVow(f: number) {
        stage.fill(15)
        Cinema.drawWreath(80, 36, 62, f % 2, 4, 6)
        Cinema.drawWreath(80, 36, 40, 1 - f % 2, 5, 3)
        let r = 16 + (f % 2) * 2
        stage.fillCircle(80, 36, r, 4)
        stage.fillCircle(80, 36, r - 2, 15)
        drawCrown(80, 30, f % 2 == 0)
        if (f % 2 == 0) {
            Cinema.drawGlint(80, 30, 7, 1)
        }
        // Gold sparks dance around the crown.
        for (let k = 0; k < 6; k++) {
            stage.setPixel(80 + randint(0 - 26, 26), 36 + randint(0 - 20, 20), 5)
        }
    }

    function sceneVow() {
        if (skipRequested) {
            return
        }
        let line1 = Catalog.text(Catalog.TextId.INTRO_5)
        let line2 = Catalog.text(Catalog.TextId.INTRO_6)
        Sound.playStudio()
        let total = storyFrameCount(line1, line2)
        for (let f = 0; f < total; f++) {
            if (skipRequested) {
                return
            }
            drawVow(f)
            drawStoryText(line1, line2, f, 78, 94)
            Cinema.drawFrame(0, 0, Cinema.openBars(f))
            show()
            wait(70)
        }
        closeBars()
        wait(400)
    }

    // ---- 7. The title card with the name of the game ----
    // The same sequence as on the studio card (playLogo): flash, wave, glow. It ends the story.
    function sceneTitle() {
        if (skipRequested) {
            return
        }
        let bigFont = image.doubledFont(image.font8)
        // a) The dome of light builds up out of the black.
        for (let f = 0; f < 3; f++) {
            if (skipRequested) {
                return
            }
            stage.fill(15)
            Cinema.drawWreath(80, 46, 60 + f * 30, f % 2, 14, 8 + f * 4)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(100)
        }
        // b) The flash.
        Sound.playImpact()
        whiteFlash()
        // c) Shock wave, the title stands there white-hot.
        const CORE_COLORS = [1, 1, 5, 5]
        const BORDER_COLORS = [1, 5, 5, 4]
        for (let f = 0; f < 4; f++) {
            if (skipRequested) {
                return
            }
            stage.fill(15)
            Cinema.drawWave(80, 46, 22 + f * 30, 1, 5, 4)
            Cinema.drawWreath(80, 46, 60 + f * 22, f % 2, 4, 8)
            drawOutlinedText(stage,
                GameName.TITLE_LINES[0], 30, CORE_COLORS[f], BORDER_COLORS[f], bigFont)
            drawOutlinedText(stage,
                GameName.TITLE_LINES[1], 50, CORE_COLORS[f], BORDER_COLORS[f], bigFont)
            Cinema.drawSparks(80, 46, f + 1, 12, 1)
            Cinema.shakeFrame(f, Cinema.BAR_HEIGHT)
            show()
            wait(80)
        }
        // d) Cooling down and a still image with a fanfare.
        Sound.playFanfare()
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                return
            }
            Cinema.coolDown()
            drawOutlinedText(stage, GameName.TITLE_LINES[0], 30, 5, 4, bigFont)
            drawOutlinedText(stage, GameName.TITLE_LINES[1], 50, 4, 2, bigFont)
            if (f % 2 == 0) {
                Cinema.drawGlint(40, 34, 6, 1)
            } else {
                Cinema.drawGlint(120, 58, 6, 1)
            }
            if (f >= 2) {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.CREDIT), 78, 13, 15, image.font8)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(160)
        }
        // No closeBars(): closingFade() does the fade-out and the curtain.
    }

    // ---- 3. The camera ride through the corridor ----

    // A wall ring: the bigger, the closer and brighter. beat makes the rings alternately dark and takes care
    // of the torches.
    function drawCorridorRing(cx: number, cy: number, s: number, beat: number) {
        let h = Math.idiv(s * 3, 4)
        let color = 15
        let tx = 0
        let ty = 0
        let r = 0
        if (s > 95) {
            color = 11
        } else if (s > 46) {
            color = 14
        } else if (s > 20) {
            color = 12
        }
        if (beat % 2 == 1) {
            color = darkerStone(color)
        }
        stage.fillRect(cx - s, cy - h, s * 2, h * 2, color)
        // On every third ring a torch hangs on the left and on the right.
        if (s > 22 && beat % 3 == 1) {
            tx = Math.idiv(s * 8, 10)
            ty = cy - Math.idiv(h, 3)
            r = Math.idiv(s, 14)
            if (r < 1) {
                r = 1
            }
            stage.fillCircle(cx - tx, ty, r + 2, 4)
            stage.fillCircle(cx - tx, ty, r, 5)
            stage.fillCircle(cx + tx, ty, r + 2, 4)
            stage.fillCircle(cx + tx, ty, r, 5)
        }
    }

    function sceneCorridor() {
        if (skipRequested) {
            return
        }
        // stretch runs from 100 to 130 and then starts again from the beginning. Because the rings are exactly a factor
        // of 1.3 apart, the jump is invisible. The code only counts cycle up.
        let stretch = 100
        let speed = 4
        let cycle = 0
        let sway = 0
        let lift = 0
        let cx = 0
        let cy = 0
        let s = 0
        let ring = 0
        for (let f = 0; f < 32; f++) {
            if (skipRequested) {
                return
            }
            stage.fill(15)
            // A little swaying, as if somebody were really walking there.
            sway = f % 8
            if (sway > 4) {
                sway = 8 - sway
            }
            cx = CORRIDOR_VANISH_X - 2 + sway
            lift = f % 6
            if (lift > 3) {
                lift = 6 - lift
            }
            cy = CORRIDOR_VANISH_Y - 1 + lift
            s = Math.idiv(300 * stretch, 100)
            ring = 0
            while (s > 7) {
                drawCorridorRing(cx, cy, s, ring + cycle)
                s = Math.idiv(s * 10, 13)
                ring = ring + 1
            }
            // The edges of the corridor run into the four corners.
            stage.drawLine(0, 0, cx, cy, 15)
            stage.drawLine(159, 0, cx, cy, 15)
            stage.drawLine(0, 119, cx, cy, 15)
            stage.drawLine(159, 119, cx, cy, 15)
            // Far ahead the thief dashes through the dark: his red eyes flicker at the vanishing point ...
            if (f >= 12 && f <= 26 && f % 3 != 0) {
                stage.fillRect(cx - 3, cy - 2, 2, 2, 2)
                stage.fillRect(cx + 2, cy - 2, 2, 2, 2)
            }
            // ... and his loot loses gold sparks.
            if (f >= 6) {
                for (let k = 0; k < 3; k++) {
                    stage.setPixel(cx + randint(0 - 12, 12), cy + randint(0 - 8, 8), 5)
                }
            }
            // The story runs as a subtitle under the ride. It is one line for the whole ride, two one after the other
            // would be too fast to read.
            if (f >= 8) {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.INTRO_7), 96, 5, 15, image.font8)
            }
            // The swaying turns into a handheld camera: the frame jolts sideways with it, no coordinate of
            // the scene changes.
            Cinema.drawFrame(sway - 2, 0, Cinema.openBars(f))
            show()
            wait(55)
            stretch = stretch + speed
            if (stretch >= 130) {
                stretch = stretch - 30
                cycle = cycle + 1
            }
            // It goes faster and faster downward.
            if (f % 11 == 10) {
                speed = speed + 2
            }
        }
        if (skipRequested) {
            return
        }
        // Leave the last frame standing for a moment so the sentence sinks in.
        wait(800)
        closeBars()
    }

    // ---- 4. The chamber behind the corridor ----

    // Wall, floor, archway and two torches.
    function drawChamber(flicker: number) {
        drawBrickwork(stage, 0, 96, 28 - flicker * 2, 132 + flicker * 2, 42)
        drawGround(stage, 96, 28, 132)
        // Archway: first the stone frame, then the blackness inside it.
        stage.fillRect(62, 38, 36, 58, 12)
        stage.fillCircle(80, 40, 18, 12)
        stage.fillRect(65, 41, 30, 55, 15)
        stage.fillCircle(80, 42, 15, 15)
        // Two steps in front of the arch.
        stage.fillRect(66, 92, 28, 2, 12)
        stage.fillRect(62, 94, 36, 2, 11)
        drawTorch(stage, 28, flicker, 42)
        drawTorch(stage, 132, flicker, 42)
        // Puddles of light on the floor.
        stage.fillRect(19, 96, 19, 2, 5)
        stage.fillRect(123, 96, 19, 2, 5)
        // Loose bones in the dust.
        stage.fillRect(40, 104, 11, 2, 1)
        stage.fillRect(44, 100, 2, 6, 1)
        stage.fillCircle(112, 107, 4, 13)
        stage.setPixel(110, 106, 15)
        stage.setPixel(114, 106, 15)
    }

    // Paint one row of pixels black on the left and on the right of the circle of light.
    function drawIrisRow(yy: number, cx: number, halfWidth: number) {
        let left = cx - halfWidth
        if (left > 0) {
            stage.fillRect(0, yy, left, 1, 15)
        }
        let right = cx + halfWidth
        if (right < 160) {
            stage.fillRect(right, yy, 160 - right, 1, 15)
        }
    }

    // Everything outside the circle is painted black. It looks as if the torchlight only reached that far. The tutorial
    // board "The dungeon" in tutorial.ts uses this circle of light too. The calculation only uses whole numbers and no
    // Math.sqrt: the half width halfWidth only goes down while the distance dy from the middle grows, it never goes up.
    // So r steps downward are enough over the whole image instead of 120 square roots.
    export function drawIris(cx: number, cy: number, r: number) {
        let radiusSquared = r * r
        let halfWidth = r
        let row = 0
        for (let dy = 0; dy < 120; dy++) {
            while (halfWidth > 0 && halfWidth * halfWidth + dy * dy > radiusSquared) {
                halfWidth = halfWidth - 1
            }
            row = cy - dy
            if (row >= 0 && row < 120) {
                drawIrisRow(row, cx, halfWidth)
            }
            row = cy + dy
            if (dy > 0 && row >= 0 && row < 120) {
                drawIrisRow(row, cx, halfWidth)
            }
        }
    }

    function sceneChamber() {
        if (skipRequested) {
            return
        }
        let r = 0
        Sound.playTorch()
        for (let f = 0; f < 18; f++) {
            if (skipRequested) {
                return
            }
            drawChamber(f % 2)
            // Dusty torchlight: two wedges fall into the room, and the iris clips them to the circle of
            // light straight away.
            Cinema.drawBeam(28, 44, 3, 80, 12, 14)
            Cinema.drawBeam(132, 44, 5, 80, 12, 14)
            // The spark slowly catches fire and then quickly gets bright.
            r = Math.idiv(f * f, 2) + randint(0, 3)
            if (r > 135) {
                r = 135
            }
            // The circle of light wanders from the left torch to the middle.
            drawIris(28 + Math.idiv(f * 52, 17), 44, r)
            Cinema.drawFrame(0, 0, Cinema.openBars(f))
            show()
            wait(60)
        }
        if (skipRequested) {
            return
        }
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.INTRO_8), 100, 5, 15, image.font8)
        Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
        show()
        wait(700)
        if (skipRequested) {
            return
        }
        // Two red eyes flash up for a moment in the black archway, the camera jerks back ...
        stage.fillRect(76, 58, 2, 2, 2)
        stage.fillRect(82, 58, 2, 2, 2)
        Cinema.shakeFrame(3, Cinema.BAR_HEIGHT)
        show()
        wait(400)
        // ... and they are gone again.
        stage.fillRect(76, 58, 2, 2, 15)
        stage.fillRect(82, 58, 2, 2, 15)
        Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
        show()
        wait(600)
        closeBars()
        wait(400)
    }

    // ---- 5. The portcullis ----

    // The iron gate. h is the height of the tips of the bars.
    function drawPortcullis(h: number) {
        // The horizontal struts fall down with it.
        for (let by = h - 118; by < h - 8; by += 30) {
            if (by > 0 - 5) {
                stage.fillRect(0, by, 160, 5, 11)
                stage.fillRect(0, by, 160, 1, 13)
                stage.fillRect(0, by + 4, 160, 1, 12)
            }
        }
        // The upright bars with their tips.
        for (let bx = 5; bx < 158; bx += 14) {
            stage.fillRect(bx, 0, 5, h - 5, 11)
            stage.fillRect(bx, 0, 1, h - 5, 13)
            stage.fillRect(bx + 4, 0, 1, h - 5, 12)
            stage.drawLine(bx, h - 5, bx + 2, h, 11)
            stage.drawLine(bx + 4, h - 5, bx + 2, h, 12)
            stage.drawLine(bx + 1, h - 5, bx + 2, h - 1, 13)
        }
    }

    // Dust that splashes up on impact.
    function drawDust(f: number) {
        let height = 6 + f * 4
        for (let k = 0; k < 20; k++) {
            stage.fillRect(randint(0, 155), 112 - randint(0, height), 3, 2, 11)
        }
    }

    function scenePortcullis() {
        if (skipRequested) {
            return
        }
        let h = 0
        let barFrame = 0
        // The gate rushes down, streaks follow behind.
        for (h = 10; h < 118; h += 13) {
            if (skipRequested) {
                return
            }
            drawChamber(h % 2)
            drawPortcullis(h)
            for (let bx = 7; bx < 158; bx += 14) {
                stage.drawLine(bx, h - 26, bx, h - 10, 13)
            }
            Cinema.drawFrame(0, 0, Cinema.openBars(barFrame))
            barFrame += 1
            show()
            wait(30)
        }
        Sound.playDoorClosed()
        Sound.playImpact()
        // The flash: a blazing white frame.
        whiteFlash()
        // Impact: the gate springs back once, dust flies up, stone splinters rain down, a pressure wave of stone rolls
        // away from the floor, the camera shakes and calms down.
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                return
            }
            h = 118
            if (f == 1) {
                h = 112
            }
            drawChamber(f % 2)
            drawPortcullis(h)
            drawDust(f)
            for (let k = 0; k < 8; k++) {
                stage.fillRect(randint(0, 157), randint(0, 24) + f * 14, 2, 2, 12)
            }
            // Stone sparks are gray, not golden.
            Cinema.drawRing(80, 118, 24 + f * 22, 11)
            Cinema.drawSparks(80, 114, f + 1, 12, 11)
            Cinema.shakeFrame(f, Cinema.BAR_HEIGHT)
            show()
            wait(70)
        }
        // Closing words behind the bars of the gate: first the threat, then the hero's defiant answer. Each sentence
        // gets four frames of 300 ms, which is enough time to read it.
        for (let f = 0; f < 8; f++) {
            if (skipRequested) {
                return
            }
            drawChamber(f % 2)
            drawPortcullis(118)
            if (f < 4) {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.INTRO_9), 100, 2, 15, image.font8)
            } else {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.INTRO_10), 100, 5, 15, image.font8)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            show()
            wait(300)
        }
        closeBars()
    }

    // ---- 8. Closing fade ----
    function closingFade() {
        if (skipRequested) {
            return
        }
        for (let f = 0; f < 6; f++) {
            dim()
            // The cinema bars close with the fade-out.
            Cinema.drawFrame(0, 0, 8 + f * 10)
            show()
            wait(70)
            if (skipRequested) {
                return
            }
        }
    }

    // Plays the story. A press of A jumps to the studio card. createStage() makes the stage and the first station.
    export function play() {
        Sound.startIntroMusic()
        sceneCastle()
        sceneThief()
        sceneCorridor()
        sceneChamber()
        scenePortcullis()
        sceneVow()
    }

    // The studio card "Calliope Hacker presents" with the figure, then the title card and the fade-out. There are two
    // stations: a press on the studio card (from LOCK_STUDIO_CARD_MS) jumps to the title card, a press on the title
    // card (from LOCK_MS) jumps to the tutorial boards. The studio card has a sound of its own, so the intro music is
    // silent under it. It starts again with the title card and carries the tutorial boards, closeStage() stops it.
    export function showCards() {
        startStation(true)
        lockEndMs = game.runtime() + LOCK_STUDIO_CARD_MS
        Sound.stopMusic()
        playLogo()
        startStation(true)
        Sound.startIntroMusic()
        sceneTitle()
        closingFade()
    }
}
