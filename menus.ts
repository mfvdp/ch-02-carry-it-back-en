// Pause menu and end screen of the game, using the texts from texts.ts.
namespace Catalog {
    function pauseMenu(): void {
        if (menuOpen) return
        menuOpen = true
        game.pushScene()
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let selected = 0
        const count = 2
        const r = scene.createRenderable(250, function (target: Image) {
            target.fill(15)
            target.printCenter(text(TextId.PAUSED), 18, 5, image.font8)
            target.printCenter(text(TextId.RESUME), 46, selected == 0 ? 5 : 1, image.font8)
            target.printCenter(format(TextId.SOUND_STATUS, music.volume()), 64,
                selected == count - 1 ? 5 : 1, image.font8)
        })
        while (controller.menu.isPressed() || controller.A.isPressed() || controller.B.isPressed()) pause(20)
        let up = false
        let down = false
        let a = false
        let close = false
        while (!close) {
            const u = controller.up.isPressed()
            const d = controller.down.isPressed()
            const pressed = controller.A.isPressed()
            if (u && !up) selected = (selected + count - 1) % count
            if (d && !down) selected = (selected + 1) % count
            if (controller.B.isPressed() || controller.menu.isPressed()) close = true
            if (pressed && !a) {
                if (selected == 0) close = true
                else if (selected == count - 1) {
                    const v = music.volume() == 0 ? 128 : 0
                    music.setVolume(v)
                    settings.writeNumber("#volume", v)
                }
            }
            up = u
            down = d
            a = pressed
            pause(20)
        }
        while (controller.A.isPressed() || controller.B.isPressed() || controller.menu.isPressed()) pause(20)
        r.destroy()
        game.popScene()
        menuOpen = false
    }
    export function installMenus(): void {
        controller.menu.onEvent(ControllerButtonEvent.Pressed, pauseMenu)
        game.onGameOver(function (win: boolean) {
            info.saveHighScore()
            const score = info.score()
            const best = info.highScore()
            game.pushScene()
            controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
            scene.createRenderable(250, function (target: Image) {
                target.fill(15)
                target.printCenter(text(win ? TextId.WON : TextId.GAME_OVER),
                    26, win ? 5 : 2, image.font8)
                target.printCenter(format(TextId.SCORE, score), 52, 1, image.font8)
                target.printCenter(format(TextId.BEST, best), 69, 5, image.font8)
                target.printCenter(text(TextId.RESTART), 98, 1, image.font8)
            })
            waitForFreshA(1000)
            // After the game has ended, the restart goes to the title image and does not play the intro again (see
            // restartMarker in texts.ts). The short pause gives the simulator time to save the marker: in the browser,
            // control.reset() reloads the whole page, and the settings are only written there every 200 ms. On the
            // device, settings are written to flash at once.
            settings.writeNumber(restartMarker, 1)
            pause(300)
            control.reset()
        })
    }

    // Waits for a fresh press of A, but not before lockMs milliseconds have passed. A is also the fire button, so a
    // player who holds A or mashes it at the last hit would otherwise skip the text at the end without reading it.
    export function waitForFreshA(lockMs: number): void {
        const lockEndMs = control.millis() + lockMs
        let a = true
        while (true) {
            const pressed = controller.A.isPressed()
            if (pressed && !a && control.millis() >= lockEndMs) break
            a = pressed
            pause(20)
        }
    }

    // Breaks a text into lines of at most width characters. After a period a new line always starts, so that for
    // example "Score: 345" stays together. A single colon with a space in front of it (how French writes it) stays with
    // the word before it.
    export function wrapText(message: string, width: number): string[] {
        const words = message.split(" ")
        const lines: string[] = []
        let line = ""
        for (let i = 0; i < words.length; i++) {
            let w = words[i]
            if (i + 1 < words.length && words[i + 1] == ":") {
                w = w + " :"
                i++
            }
            if (line.length == 0) line = w
            else if (line.length + 1 + w.length <= width) line = line + " " + w
            else {
                lines.push(line)
                line = w
            }
            if (w.charAt(w.length - 1) == ".") {
                lines.push(line)
                line = ""
            }
        }
        if (line.length > 0) lines.push(line)
        return lines
    }

    // Shows the text at the end of the game (TextId.GAME_END) in a box of its own above the frozen game picture. A only
    // counts after one second, so nobody skips the text and the score by accident. After that the
    // hint TextId.PRESS_A appears.
    export function farewell(message: string): void {
        const lines = wrapText(message, 22)
        game.pushScene()
        game.currentScene().flags |= scene.Flag.SeeThrough
        controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {})
        let ready = false
        const h = lines.length * 11 + 26
        const top = (120 - h) >> 1
        const r = scene.createRenderable(250, function (target: Image) {
            target.fillRect(8, top, 144, h, 1)
            target.drawRect(8, top, 144, h, 12)
            target.drawRect(9, top + 1, 142, h - 2, 11)
            for (let i = 0; i < lines.length; i++) {
                target.printCenter(lines[i], top + 8 + i * 11, 15, image.font8)
            }
            if (ready) target.printCenter(text(TextId.PRESS_A), top + h - 14, 12, image.font8)
        })
        control.runInParallel(function () {
            pause(1000)
            ready = true
        })
        waitForFreshA(1000)
        r.destroy()
        game.popScene()
    }
}
