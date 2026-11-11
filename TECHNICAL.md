# Technical notes: Carry It Back

This file briefly explains how the source code is organized and how to build it. The welcome and the first ideas for
changing the game are in `README.md`.

## How the project is organized

This is a project for MakeCode Arcade, written in TypeScript. `pxt.json` gives the project name `carry-it-back` and
lists all files in the order in which MakeCode reads them and runs them. `mkc.json` says which device to build for: the
Calliope mini 3 with GameKit (variant "n3"). The files `tilemap.g.ts` and `tilemap.g.jres` are made by the editor; they
are just there and are not changed by hand.

The files of the game:

- `texts.ts`: All the texts of the game: every number in the enum TextId has exactly one text in the list strings.
- `menus.ts`: Pause menu and end screen of the game, using the texts from texts.ts.
- `settings.ts`: Settings: tweak the game here!
- `graphics.ts`: Graphics: all the tiles, sprites and images made from them.
- `kinds.ts`: Sprite kinds (SpriteKind) for items, decoration and the display.
- `enemies.ts`: Enemies: the data class, creating them, searching, shots and the control of the boss.
- `state.ts`: Global game state.
- `helpers.ts`: Small helper functions without a state of their own.
- `sound.ts`: Sound: all the sounds and the music in one place.
- `cinema.ts`: Cinema: the toolbox for intro and ending.
- `intro.ts`: Intro: the story and the studio card before the title image.
- `tutorial.ts`: Tutorial boards: the tutorial in the intro.
- `ending.ts`: Ending: the victory.
- `light.ts`: Darkness and light: the circle of sight around the hero.
- `dungeon.ts`: Making the dungeon: grid, rooms, corridors, traps and tilemap.
- `items.ts`: Items and decoration: placing them and clearing them away when the floor changes.
- `hero.ts`: The hero: shooting fireballs, choosing the image for the facing direction and taking hits.
- `title_screen.ts`: The title image and its building blocks: stone wall, torches, title image and title screen.
- `floor.ts`: Building a whole floor.
- `events.ts`: All the event handlers.
- `hud.ts`: Display: the floor number at the bottom left and the map on button B.
- `main.ts`: A random-dungeon game for MakeCode Arcade.
- `tilemap.g.ts`: Code made by the editor.

## How the game runs

1. `Catalog.initialize` in `texts.ts` checks whether this start is a restart after the game has ended, and sets up the
   menus.
2. `runTitleScreen` in `title_screen.ts` plays the intro: the story, the card "Calliope Hacker presents", the title card
   and the tutorial boards. You can skip every station with A. After that it shows the title image and waits for A.
3. `main.ts` makes the hero, the image for the darkness and the display, and calls `buildFloor`.
4. `buildFloor` in `floor.ts` builds one floor: `createRooms` and `digCorridor` (in `dungeon.ts`) dig rooms and
   corridors into the grid, the stairs and the traps are marked in it, and `drawGrid` turns it into the tilemap. Then
   the decoration, the key (or the boss), the enemies and the items are added.
5. In every frame the function in `game.onUpdate` in `main.ts` runs: the hero's facing direction, firing with A, the
   star puffs and the light. Every 280 milliseconds `game.onUpdateInterval` in `main.ts` steers the enemies.
6. Touches (a fireball hits an enemy, the hero picks something up, the hero stands on the stairs) are handled by the
   handlers in `events.ts`.
7. When the crown thief falls, `Ending.play` in `ending.ts` plays the ending.

The grid of a floor is 26 tiles wide and 22 tiles high. Every tile is a number in `grid`:
0 is wall, 2 is the stairs, 3 is a trap, everything else is ground. How hard the game gets is set in `settings.ts`.

## Sound, graphics and saving

- **Graphics:** The images are in `graphics.ts`. Names with `IMG_` are sprites, with `TILE_` tiles. Everything else is
  painted while playing from rectangles, circles and lines. That keeps the game file small.
- **Sound:** `sound.ts` collects all the sounds and the music. A sound is a short text of notes (`new
  music.Melody("…")`).
- **Saving:** The best score (`info.saveHighScore`) and the volume stay saved on the device. If you put a different
  program on it, MakeCode deletes the saved game the next time it starts.

## Building

- **In the browser:** Open arcade.makecode.com, choose "Import" and open the game file `carry-it-back.hex`. The whole
  source code is inside the game file. The simulator shows the game right away.
- **On your computer:** With the MakeCode command-line tool (npm package `makecode`), run `makecode build` in this
  folder. The game file for the device is then in `built/n3/binary.hex`.

## Putting it on the device

Plug the Calliope mini 3 into your computer with the USB cable. It shows up as a drive. Drag the game file (`.hex`) onto
that drive; the game then starts by itself. The GameKit screen has 160 × 120 pixels and 16 colors.

This game also exists in German, French and Spanish. All four versions are built from the same source project.
