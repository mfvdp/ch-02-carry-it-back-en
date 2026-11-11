// Tutorial boards: the tutorial in the intro. It runs after the story (Intro.play) and before the title image. Six
// boards explain the controls, the goal, the treasures, the enemies and the dungeon itself.
//
// Everything is timed, and A skips (as in the intro): every loop asks Intro.isSkipped() and then falls through at once.
//
// Painting goes into the same full-screen image stage as in the intro, so there is no new image in flash and no extra
// working memory. The sprites come at double size from graphics.ts (Intro.drawDouble). The icons (D-pad, buttons, map,
// arrow) are pure rectangle and circle drawings.
//
// Text width: font5 and font8 are 6 pixels wide per character. A line on the board has at most 22 characters (x 14
// to 145), so 4 pixels of space stay free on the left and right up to the inner frame (x 9 and 150); from 24 characters
// on, the text lies on the frame. Over the full width 26 fit. The lowest line sits at y 103: descenders (g, p) end
// at 110, the black outline of the text at 111, and the inner frame lies at 112. The texts come from the catalog
// (texts.ts). Whoever changes a text watches this number of characters, otherwise it sticks out over the edge. font8
// can draw umlauts and accents, so they are allowed.
//
// Important: this file has to be in the list "files" in pxt.json (after intro.ts), otherwise it is not compiled at all
// (compiled meaning turned into a program, not translated into a language).
namespace Tutorial {
    // The settings for the speed: FRAME_MS is the time between frames in milliseconds, FRAMES is the number of frames
    // of a normal board. 9 × 550 ms are about 5 s per board. Better too slow than too fast: whoever is done presses A.
    const FRAME_MS = 550
    const FRAMES = 9
    // Every appearance of an enemy lasts ENEMY_FRAMES × ENEMY_FRAME_MS, so a good two seconds. A name plus three lines
    // take time to read.
    const ENEMY_FRAME_MS = 420
    const ENEMY_FRAMES = 5

    // The board: a stone wall with a black field in the middle. The inner frame glows in the torch beat, so the page is
    // alive without the writing wobbling.
    function drawBoard(flicker: number) {
        drawBrickwork(stage, 0, 120, 6 - flicker * 2, 154 + flicker * 2, 58)
        stage.fillRect(8, 6, 144, 108, 15)
        stage.drawRect(8, 6, 144, 108, 12)
        stage.drawRect(9, 7, 142, 106, 11 + flicker * 2)
    }

    // ---- Small painters for icons ----

    // The D-pad, 16 × 16 pixels.
    function drawDpad(targetX: number, targetY: number) {
        stage.fillRect(targetX + 5, targetY, 6, 16, 11)
        stage.fillRect(targetX, targetY + 5, 16, 6, 11)
        stage.fillRect(targetX + 6, targetY + 1, 4, 14, 12)
        stage.fillRect(targetX + 1, targetY + 6, 14, 4, 12)
    }

    // A round button with a letter, 16 × 16 pixels.
    function drawButton(targetX: number, targetY: number, label: string) {
        stage.fillCircle(targetX + 8, targetY + 8, 8, 12)
        stage.fillCircle(targetX + 8, targetY + 8, 7, 2)
        stage.print(label, targetX + 5, targetY + 4, 1, image.font8)
    }

    // A mini map in the colors of the real map on button B: ground gray, stairs yellow, hero = green dot (color 7).
    function drawMapIcon(targetX: number, targetY: number) {
        stage.fillRect(targetX, targetY, 18, 14, 15)
        stage.drawRect(targetX, targetY, 18, 14, 12)
        stage.fillRect(targetX + 2, targetY + 2, 5, 4, 12)
        stage.fillRect(targetX + 6, targetY + 4, 4, 2, 12)
        stage.fillRect(targetX + 9, targetY + 6, 6, 5, 12)
        stage.setPixel(targetX + 3, targetY + 3, 7)
        stage.fillRect(targetX + 12, targetY + 8, 2, 2, 5)
    }

    // An arrow pointing to the right, it points from the key to the stairs.
    function drawArrow(targetX: number, targetY: number, length: number) {
        stage.fillRect(targetX, targetY - 1, length, 3, 5)
        stage.drawLine(targetX + length, targetY, targetX + length - 5, targetY - 5, 5)
        stage.drawLine(targetX + length, targetY, targetX + length - 5, targetY + 5, 5)
    }

    // ---- Board 1: controls ----
    function showControlsPage(flicker: number) {
        drawBoard(flicker)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.CONTROLS), 12, 5, 15, image.font8)
        drawDpad(14, 26)
        stage.drawTransparentImage(IMG_HERO, 34, 26)
        stage.print(Catalog.text(Catalog.TextId.MOVE_AIM), 56, 31, 13, image.font8)
        drawButton(14, 50, "A")
        stage.drawTransparentImage(IMG_FIREBALL, 34, 50)
        stage.print(Catalog.text(Catalog.TextId.FIREBALL), 56, 55, 13, image.font8)
        drawButton(14, 74, "B")
        drawMapIcon(34, 75)
        stage.print(Catalog.text(Catalog.TextId.HOLD_MAP), 56, 79, 13, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.FACE_1), 94, 11, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.FACE_2), 104, 11, 15, image.font8)
    }

    // ---- Board 2: the goal ----
    function showGoalPage(flicker: number) {
        drawBoard(flicker)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.GOAL), 12, 5, 15, image.font8)
        Intro.drawDouble(IMG_KEY, 26, 26)
        drawArrow(64, 42, 26)
        Intro.drawDouble(TILE_STAIRS, 96, 26)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.FIND_KEY), 62, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.USE_STAIRS), 72, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.format(Catalog.TextId.EVERY_FLOORS,
            BOSS_EVERY), 84, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.BOSS_STAIRS), 94, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.format(Catalog.TextId.CROWN_FLOOR, FINAL_BOSS_FLOOR),
            103, 5, 15, image.font8)
    }

    // ---- Board 3: treasures ----
    function showTreasuresPage(flicker: number) {
        drawBoard(flicker)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.TREASURES), 12, 5, 15, image.font8)
        stage.drawTransparentImage(IMG_HEART, 16, 26)
        stage.print(Catalog.text(Catalog.TextId.HEART_INFO), 40, 31, 13, image.font8)
        stage.drawTransparentImage(IMG_TORCH, 16, 46)
        stage.print(Catalog.text(Catalog.TextId.TORCH_INFO), 40, 51, 13, image.font8)
        stage.drawTransparentImage(IMG_CHEST, 16, 66)
        stage.print(Catalog.text(Catalog.TextId.CHEST_INFO), 40, 71, 13, image.font8)
        stage.drawTransparentImage(IMG_COIN, 16, 86)
        stage.print(Catalog.text(Catalog.TextId.COIN_INFO), 40, 91, 13, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.TAKE_ALL), 103, 5, 15, image.font8)
    }

    // Board 4: the parade of the enemies. Image, name and hints for each enemy are in if-chains. Arrays would cost more
    // here, they would sit in working memory the whole time the game runs.
    function enemyImage(kind: number) {
        if (kind == 1) {
            return IMG_SLIME
        }
        if (kind == 2) {
            return IMG_BAT
        }
        if (kind == 3) {
            return IMG_MAGE
        }
        if (kind == 4) {
            return IMG_GUARD
        }
        if (kind == 5) {
            return IMG_BOSS
        }
        return IMG_SKELETON
    }

    function enemyName(kind: number) {
        if (kind == 1) {
            return Catalog.text(Catalog.TextId.SLIME)
        }
        if (kind == 2) {
            return Catalog.text(Catalog.TextId.BAT)
        }
        if (kind == 3) {
            return Catalog.text(Catalog.TextId.MAGE)
        }
        if (kind == 4) {
            return Catalog.text(Catalog.TextId.GUARD)
        }
        if (kind == 5) {
            return Catalog.text(Catalog.TextId.BOSS)
        }
        return Catalog.text(Catalog.TextId.SKELETON)
    }

    // The lines "From floor N." are made from the constants in settings.ts. So the tutorial and the game can never
    // drift apart, even when you change the values.
    function enemyLine(kind: number, which: number) {
        if (kind == 0) {
            if (which == 0) {
                return Catalog.text(Catalog.TextId.FOLLOWS)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.TWO_HITS)
            }
        } else if (kind == 1) {
            if (which == 0) {
                return Catalog.text(Catalog.TextId.TOUGH)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.THREE_HITS)
            }
        } else if (kind == 2) {
            if (which == 0) {
                return Catalog.text(Catalog.TextId.FLIES)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.ONE_HIT)
            }
            if (which == 2) {
                return Catalog.format(Catalog.TextId.FROM_FLOOR, BAT_FLOOR)
            }
        } else if (kind == 3) {
            if (which == 0) {
                return Catalog.text(Catalog.TextId.DISTANCE)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.SHOOTS)
            }
            if (which == 2) {
                return Catalog.format(Catalog.TextId.FROM_FLOOR, MAGE_FLOOR)
            }
        } else if (kind == 4) {
            if (which == 0) {
                return Catalog.text(Catalog.TextId.BEHIND)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.BACK_ONLY)
            }
            if (which == 2) {
                return Catalog.format(Catalog.TextId.FROM_FLOOR, GUARD_FLOOR)
            }
        } else if (kind == 5) {
            if (which == 0) {
                return Catalog.format(Catalog.TextId.BOSS_EVERY, BOSS_EVERY)
            }
            if (which == 1) {
                return Catalog.text(Catalog.TextId.BOSS_KEY)
            }
            if (which == 2) {
                return Catalog.text(Catalog.TextId.ENRAGES)
            }
        }
        return ""
    }

    function showEnemyPage(kind: number, flicker: number) {
        drawBoard(flicker)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.ENEMIES), 12, 5, 15, image.font8)
        Intro.drawDouble(enemyImage(kind), 64, 26)
        drawOutlinedText(stage, enemyName(kind), 62, 1, 15, image.font8)
        for (let which = 0; which < 3; which++) {
            if (enemyLine(kind, which).length > 0) {
                drawOutlinedText(stage, enemyLine(kind,
                    which), 76 + which * 10, 13, 15, image.font8)
            }
        }
    }

    // Board 5: the dungeon itself. Besides the closing greeting it is the only page without a board and frame, it shows
    // the real view into the game including the circle of light.
    function showDungeonPage(flicker: number) {
        stage.fill(15)
        drawGround(stage, 30, 64, 64)
        stage.drawTransparentImage(TILE_SPIKES, 76, 40)
        stage.drawTransparentImage(IMG_HERO, 48, 40)
        // The circle of light breathes slightly in the torch beat.
        Intro.drawIris(64, 48, 32 + flicker * 2)
        // The writing only comes after the iris, otherwise it gets painted over in black.
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.DUNGEON), 8, 5, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.DARKNESS), 76, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.SPIKES), 86, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.TORCH_HELP), 96, 13, 15, image.font8)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.MAP_HELP), 106, 13, 15, image.font8)
    }

    // ---- Board 6: closing greeting, a still image ----
    function showFarewellPage() {
        stage.fill(15)
        drawOutlinedText(stage, Catalog.text(Catalog.TextId.LUCK), 44, 5, 4, image.font8)
        Intro.drawDouble(IMG_HERO, 64, 68)
    }

    // ---- Plays all the boards. A skips the rest at once. ----
    export function play() {
        for (let f = 0; f < FRAMES; f++) {
            if (Intro.isSkipped()) {
                return
            }
            showControlsPage(f % 2)
            Intro.show()
            Intro.wait(FRAME_MS)
        }
        for (let f = 0; f < 8; f++) {
            if (Intro.isSkipped()) {
                return
            }
            showGoalPage(f % 2)
            Intro.show()
            Intro.wait(FRAME_MS)
        }
        for (let f = 0; f < FRAMES; f++) {
            if (Intro.isSkipped()) {
                return
            }
            showTreasuresPage(f % 2)
            Intro.show()
            Intro.wait(FRAME_MS)
        }
        for (let kind = 0; kind <= 5; kind++) {
            for (let f = 0; f < ENEMY_FRAMES; f++) {
                if (Intro.isSkipped()) {
                    return
                }
                showEnemyPage(kind, f % 2)
                Intro.show()
                Intro.wait(ENEMY_FRAME_MS)
            }
        }
        for (let f = 0; f < FRAMES; f++) {
            if (Intro.isSkipped()) {
                return
            }
            showDungeonPage(f % 2)
            Intro.show()
            Intro.wait(FRAME_MS)
        }
        if (Intro.isSkipped()) {
            return
        }
        showFarewellPage()
        Intro.show()
        Intro.wait(1500)
    }
}
