// Settings: tweak the game here!
//
// This file runs before all the other game files that build on it. In pxt.json only the texts (texts.ts) and the menus
// (menus.ts) come before it.
//
// You can change every number here and try the game in the simulator right away.
//
// The name of the game in two lines, separated by "|". It is shown big on the title card of the intro and on the wooden
// sign of the title image, each line in the middle.
namespace GameName {
    export const TITLE = "CARRY IT|BACK"   // Title lettering, "|" separates the two lines
    export const TITLE_LINES = TITLE.split("|")
}
// Switches for finding problems on real hardware.
//
// DIAGNOSTICS shows colored boxes at the start. Every start step has its own color and stays on screen for a moment. If
// the game stops, the picture freezes at the last color reached, and you can see exactly how far the start got. On the
// GameKit this is needed, because a crash there shows neither an error code nor a sad face, only black.
//
// With DARKNESS = false the image with the circle of light is left out (see light.ts). It hangs fixed in front of the
// camera, is as big as the whole screen and takes about 9.6 KB. That helps a lot when the screen stays black.
let DIAGNOSTICS = false
let DARKNESS = true
// PLAY_INTRO switches the whole intro on or off: the story, the card "Calliope Hacker presents" with the title card,
// and the tutorial boards. When you want to try the game itself, this saves about a minute at every start. To find
// problems at the start, it is best to turn on DIAGNOSTICS as well.
let PLAY_INTRO = true

let START_LIVES = 6
let HERO_SPEED = 95
let BOOTS_SPEED = 25
// Upper limit for the boots upgrades. Without it the boots from the chests would keep piling up, and the hero would at
// some point be impossible to steer.
let HERO_SPEED_MAX = 170
// From this tier on, the enemies stop getting faster. The limit is chosen so that even the fastest kind of enemy (the
// bat with 34 + 2 × tier = 74) stays below the hero's basic speed of 95: running away must always be possible. Because
// one tier lasts FLOORS_PER_TIER floors, the limit is only reached on floor 39. Deeper floors get harder through more
// enemies and more traps, not through more speed.
let TIER_MAX = 20
// How many floors one enemy tier lasts. With 2 the difficulty rises only half as fast as it would if every floor
// brought a new tier.
let FLOORS_PER_TIER = 2

// The floor where a kind of enemy shows up for the first time. Bat, mage and guard are far apart so that the difficulty
// does not jump up. The tutorial boards in the intro read these values too, so the tutorial and the game can
// never drift apart.
let BAT_FLOOR = 4
let MAGE_FLOOR = 7
let GUARD_FLOOR = 10

// Second and third enemy in the same room. From the floor named here, the chance starts at one tenth and grows by
// another tenth with every floor, up to the maximum in each case (in tenths).
let SECOND_ENEMY_FROM = 4
let SECOND_ENEMY_MAX = 6
let THIRD_ENEMY_FROM = 12
let THIRD_ENEMY_MAX = 4
// Emergency brake for memory and frame rate: there are never more than ENEMY_MAX enemies on one floor.
let ENEMY_MAX = 18

// Traps: every FLOORS_PER_TRAP floors, one more trap is added (at most TRAP_MAX).
let FLOORS_PER_TRAP = 2
let TRAP_MAX = 10

// Boss: health = BOSS_HEALTH_BASE + floor, but at most BOSS_HEALTH_MAX. This way the fight does not drag on forever
// on deep floors.
let BOSS_HEALTH_BASE = 14
let BOSS_HEALTH_MAX = 40
// The boss gets enraged when only this fraction of its health is left (3 means: the last third).
let BOSS_RAGE_FRACTION = 3

// A balance for the depth: every HEART_BONUS_EVERY floors, a room has a heart instead of a coin one tenth more often,
// at most HEART_BONUS_MAX tenths more.
let HEART_BONUS_EVERY = 5
let HEART_BONUS_MAX = 2

// The final boss waits on this floor: the crown thief with the stolen crown on his head and with full health. Whoever
// beats him wins the game: the hero takes the crown and escapes (ending.ts). buildFloor always puts the boss on this
// floor, even when it is not a multiple of BOSS_EVERY.
let FINAL_BOSS_FLOOR = 15
let FIREBALL_SPEED = 135
let RELOAD_NORMAL_MS = 420
let RELOAD_FAST_MS = 190
let GRACE_MS = 2000
let GRID_WIDTH = 26
let GRID_HEIGHT = 22
let LIGHT_NORMAL = 46
let LIGHT_TORCH = 80
let TORCH_DURATION_MS = 12000
let BOSS_EVERY = 5
// How long (in ms) a defeated enemy vanishes in stars.
let PUFF_MS = 450
