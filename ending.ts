// Ending: the victory. It runs when the crown thief falls (started in events.ts, on the floor FINAL_BOSS_FLOOR).
//
// The hero steps up to the toppled thief, the crown floats over to him, he puts it on and escapes through the portal of
// light. Then game.over(true) follows.
//
// Painting is done like in the intro, into a full-screen image of 160 × 120 pixels. But it is not a background, because
// the tilemap would lie in front of a background image. So the image hangs on a display sprite with z = 300, which lies
// above everything. Whoever changes the image changes the display at once, just like with the darkness.
//
// Beforehand play() tidies up: enemies, items and above all the 9.6 KB darkness are removed. Then there is surely room
// for the stage. A skips the scenes like in the intro.
namespace Ending {
    // Becomes true as soon as A has been pressed.
    let skipRequested = false
    // Until this time (game.runtime) a press expires. The ending starts in the middle of a fight, often with a mashed
    // A. A shot that comes too late must not skip the whole victory.
    let lockEndMs = 0

    // Waits in small bites and remembers a button press.
    function wait(durationMs: number) {
        let remaining = durationMs
        let step = 0
        while (remaining > 0) {
            if (aPressed && game.runtime() < lockEndMs) {
                aPressed = false
            }
            if (aPressed) {
                skipRequested = true
                return
            }
            step = 30
            if (remaining < step) {
                step = remaining
            }
            pause(step)
            remaining = remaining - step
        }
        if (aPressed && game.runtime() >= lockEndMs) {
            skipRequested = true
        }
    }

    // The thief's throne room: wall, floor, two torches. At the front right, at the edge, the Calliope Hacker stands as
    // a spectator, seen from behind like on the studio card. He is painted twice as big as the figures of the
    // coronation, because at normal size the black sweater sank into the dark stones. With cheer = true he throws his
    // arms up in the beat of the torches, otherwise he stands still.
    function drawHall(flicker: number, cheer: boolean = false) {
        drawBrickwork(stage, 0, 96, 20 - flicker * 2, 140 + flicker * 2, 44)
        drawGround(stage, 96, 20, 140)
        drawTorch(stage, 20, flicker, 44)
        drawTorch(stage, 140, flicker, 44)
        if (cheer && flicker == 1) {
            Intro.drawDouble(IMG_SPECTATOR_CHEER, 136, 79)
        } else {
            Intro.drawDouble(IMG_SPECTATOR, 136, 79)
        }
    }

    // A small crown, as it fits the hero. targetX and targetY are the top left corner of the spikes. s is the scale: at
    // s = 1 the band is eight pixels wide, at s = 2 sixteen. s = 2 is used for the hero at double size
    // at the coronation.
    function drawSmallCrown(targetX: number, targetY: number, s: number = 1) {
        stage.fillRect(targetX, targetY + 2 * s, 8 * s, 2 * s, 5)
        stage.fillRect(targetX, targetY, 2 * s, 2 * s, 5)
        stage.fillRect(targetX + 3 * s, targetY, 2 * s, 2 * s, 5)
        stage.fillRect(targetX + 6 * s, targetY, 2 * s, 2 * s, 5)
        stage.fillRect(targetX + 4 * s, targetY + 2 * s, s, s, 2)
    }

    // Little stars circle above the thief on the ground.
    function drawStars(cx: number, cy: number, f: number) {
        if (f % 3 == 0) {
            stage.setPixel(cx - 8, cy, 5)
            stage.setPixel(cx + 6, cy - 3, 1)
        } else if (f % 3 == 1) {
            stage.setPixel(cx, cy - 5, 1)
            stage.setPixel(cx + 8, cy + 1, 5)
        } else {
            stage.setPixel(cx - 5, cy - 4, 5)
            stage.setPixel(cx + 2, cy + 2, 1)
        }
    }

    export function play() {
        // Stop the game and make room. moveSprite(0, 0) freezes the hero. Otherwise he could still run onto the stairs
        // invisibly during the ending and build a new floor.
        playing = false
        Sound.stopMusic()
        // The victory music carries the ending up to the ending card: D major as the resolution of the D minor story.
        Sound.startVictoryMusic()
        controller.moveSprite(hero, 0, 0)
        if (darknessSprite != null) {
            darknessSprite.destroy()
            darknessSprite = null
        }
        // Let go of the image reference as well: the sprite is gone, but darkImage would otherwise keep the image of
        // the darkness in memory.
        darkImage = null
        clearFloor()
        aPressed = false
        skipRequested = false
        lockEndMs = game.runtime() + 1000
        // The stage: a display sprite above everything.
        stage = image.create(160, 120)
        let stageSprite = sprites.create(stage, KIND_HUD)
        stageSprite.setFlag(SpriteFlag.Ghost, true)
        stageSprite.setFlag(SpriteFlag.RelativeToCamera, true)
        stageSprite.z = 300
        stageSprite.setPosition(80, 60)
        // The thief is toppled: flipY turns him upside down.
        let bossToppled = IMG_BOSS.clone()
        bossToppled.flipY()
        let bigFont = image.doubledFont(image.font8)
        // 1) The hero steps up to the defeated thief, the opening fades in.
        for (let f = 0; f < 11; f++) {
            if (skipRequested) {
                break
            }
            drawHall(f % 2)
            Intro.drawDouble(bossToppled, 100, 64)
            drawStars(116, 58, f)
            Intro.drawCrown(116, 56, f % 2 == 0)
            stage.drawTransparentImage(IMG_HERO_RIGHT, -16 + f * 10, 78)
            Cinema.drawFrame(0, 0, Cinema.openBars(f))
            wait(130)
        }
        // 2) The coronation. Part A: the crown floats over, and time itself slows down: every frame stays longer than
        // the one before. Bells in the distance.
        const CORONATION_FRAME_MS = [140, 140, 160, 200, 260, 330, 420]
        Sound.playBell()
        for (let f = 0; f < 7; f++) {
            if (skipRequested) {
                break
            }
            let kx = 116 - f * 4
            let ky = 56 + f * 2
            drawHall(f % 2, true)
            Intro.drawDouble(bossToppled, 100, 64)
            stage.drawTransparentImage(IMG_HERO_RIGHT, 84, 78)
            Cinema.drawWreath(kx, ky, 24 + f * 5, f % 2, 4, 5)
            Intro.drawCrown(kx, ky, true)
            Cinema.drawGlint(kx, ky, 5 + (f % 2) * 2, 1)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            wait(CORONATION_FRAME_MS[f])
        }
        // Part B: the flash, the crown touches the head.
        if (!skipRequested) {
            Sound.playCrown()
            stage.fill(1)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            wait(70)
        }
        // Part C: the hero in close-up. The crowned one at double size, shock wave, wreaths of light, confetti.
        for (let f = 0; f < 5; f++) {
            if (skipRequested) {
                break
            }
            stage.fill(15)
            Cinema.drawWave(80, 50, 20 + f * 28, 1, 5, 4)
            Cinema.drawWreath(80, 50, 150, f % 2, 5, 14)
            Cinema.drawWreath(80, 50, 150, 1 - f % 2, 4, 7)
            Intro.drawDouble(IMG_HERO_RIGHT, 64, 42)
            drawSmallCrown(72, 36, 2)
            Cinema.dropConfetti(f)
            Cinema.shakeFrame(f, Cinema.BAR_HEIGHT)
            wait(90)
        }
        // Part D: still image in golden light.
        Sound.playChest()
        for (let f = 0; f < 5; f++) {
            if (skipRequested) {
                break
            }
            stage.fill(15)
            Cinema.drawWreath(80, 50, 150, f % 2, 14, 12)
            stage.fillCircle(80, 54, 44, 4)
            stage.fillCircle(80, 54, 32, 5)
            Intro.drawDouble(IMG_HERO_RIGHT, 64, 42)
            drawSmallCrown(72, 36, 2)
            Cinema.drawGlint(80, 38, 8, 1)
            Cinema.dropConfetti(f + 5)
            drawOutlinedText(stage, Catalog.text(Catalog.TextId.KING_RETURNS), 96, 5, 15, image.font8)
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            wait(200)
        }
        // 3) The escape as a paper cut-out: the hero is a silhouette in front of the blazing portal, only his
        // crown stays golden.
        let heroShadow = IMG_HERO_LEFT.clone()
        for (let c = 1; c < 16; c++) {
            heroShadow.replace(c, 15)
        }
        for (let f = 0; f < 8; f++) {
            if (skipRequested) {
                break
            }
            drawHall(f % 2, true)
            Intro.drawDouble(bossToppled, 100, 64)
            Cinema.drawBeam(6, 70, 0, 180, 26 + f * 5, 13)
            Cinema.drawBeam(6, 70, 1, 150, 14, 1)
            Cinema.drawBeam(6, 70, 15, 150, 14, 1)
            stage.fillCircle(6, 70, 22 + f * 5, 13)
            stage.fillCircle(6, 70, 14 + f * 5, 1)
            stage.drawTransparentImage(heroShadow, 84 - f * 10, 78)
            drawSmallCrown(88 - f * 10, 75)
            // The film closes slowly around the silhouette.
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT + f * 2)
            wait(120)
        }
        // 4) The light floods the hall.
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                break
            }
            stage.fillCircle(6, 70, 20 + f * 32, 1)
            Cinema.drawFrame(0, 0, 22)
            wait(110)
        }
        // 5) White closing: the flood of light cools through gold, red, brown and gray into black, the same afterglow
        // as on the studio card (Intro.playLogo). The circle closes: the game ends the way it began.
        stage.fill(1)
        for (let f = 0; f < 6; f++) {
            if (skipRequested) {
                break
            }
            Cinema.coolDown()
            Cinema.drawFrame(0, 0, 22)
            wait(130)
        }
        // From here on the ending card takes over the music.
        Sound.stopMusic()
        // 6) Ending card 1: ESCAPED. It always runs, even after a press of A, because you have earned it
        // with the victory.
        Sound.playEnding()
        let start = 0
        if (skipRequested) {
            start = 3
        }
        for (let f = start; f < 4; f++) {
            stage.fill(15)
            Cinema.drawWreath(80, 24, 130, f % 2, 14, 10)
            Intro.drawCrown(80, 20, f % 2 == 0)
            drawOutlinedText(stage, Catalog.text(Catalog.TextId.ESCAPED), 40, 5, 4, bigFont)
            if (f >= 1) {
                drawOutlinedText(stage,
                    Catalog.text(Catalog.TextId.CROWN_BACK), 62, 13, 15, image.font8)
            }
            if (f >= 2) {
                drawOutlinedText(stage, Catalog.format(Catalog.TextId.SCORE, info.score()),
                    74, 5, 15, image.font8)
            }
            if (f >= 3) {
                drawOutlinedText(stage, Catalog.format(Catalog.TextId.FLOORS,
                    currentFloor), 86, 4, 15, image.font8)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            if (f < 3) {
                // wait instead of pause: a press of A only speeds up the build-up, the finished still image below
                // it stays standing.
                wait(220)
            }
        }
        pause(1400)
        // 7) Ending card 2: CALLIOPE HACKER, exactly the studio card from the intro (with the figure), with its chord
        // of 2 seconds. The game begins and ends with the same image and the same sound. The chord also carries the
        // long standing time instead of leaving it silent.
        Sound.playLogo()
        start = 0
        if (skipRequested) {
            start = 5
        }
        for (let f = start; f < 6; f++) {
            stage.fill(15)
            Cinema.drawWreath(80, 51, 110, f % 2, 14, 8)
            drawOutlinedText(stage, "CALLIOPE", Intro.NAME_Y, 5, 4, bigFont)
            drawOutlinedText(stage, "HACKER", Intro.HACKER_Y, 4, 2, bigFont)
            Intro.drawStudio()
            if (f % 2 == 0) {
                Cinema.drawGlint(26, Intro.NAME_Y + 4, 5, 1)
            } else {
                Cinema.drawGlint(134, Intro.HACKER_Y + 10, 5, 1)
            }
            if (f >= 2) {
                drawOutlinedText(stage, Catalog.text(Catalog.TextId.THANKS),
                    Intro.PRESENTS_Y, 13, 15, image.font8)
            }
            Cinema.drawFrame(0, 0, Cinema.BAR_HEIGHT)
            if (f < 5) {
                wait(150)
            }
        }
        // On purpose longer than the first ending card: the sign is the last shot of the game, so it stays long enough
        // to be read calmly.
        pause(2600)
        // The curtain closes.
        for (let f = 0; f < 4; f++) {
            Cinema.drawFrame(0, 0, 8 + f * 17)
            pause(70)
        }
        // Tidy up, save the best score, show the victory screen.
        Sound.stopMusic()
        stageSprite.destroy()
        stage = null
        info.saveHighScore()
        game.over(true)
    }
}
