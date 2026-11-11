// Global game state.
//
// MakeCode has no import and export: everything that is written here is visible in every other file.

// ---- Progress ----
let currentFloor = 1
let keysHeld = 0
let bossActive = false
let playing = true
// Lock for the speech bubble with the hint at the stairs: the tile handler fires in every frame while the
// hero stands there.
let hintEndMs = 0

// ---- Hero ----
let hero: Sprite = null
let heroSpeed = HERO_SPEED
let facingX = 1
let facingY = 0
let reloadMs = RELOAD_NORMAL_MS
let fireReadyMs = 0
let graceEndMs = 0
let tripleShot = false
let aPressed = false

// ---- Display, light and darkness ----
let hudKey: Sprite = null
let darknessSprite: Sprite = null
let lightRadius = 0
let lightEndMs = 0
// The two display images (the map and the floor sign) are made once at the start and then only repainted. Making new
// images again and again in the middle of the game would break up the memory, until one of them fails and the game
// crashes. MakeCode's garbage collector does clean up, but it does not push the free pieces together.
let mapBuffer: Image = null
let floorBuffer: Image = null

// ---- Grid and rooms ----
let grid: number[] = []
let roomCenterX: number[] = []
let roomCenterY: number[] = []
let wallLayer: Image = null

// ---- Enemies ----
let enemies: Enemy[] = []

// Helper variables that several functions use together. They are right at the top so that every file can see them, even
// though only single functions need them. Short names: x, y = coordinates; s and r = sprites; newFireball = the hero's
// newest fireball; newEnemyImage = the image of the enemy that placeEnemy is placing; hitEnemy = the enemy that was
// hit; darkImage = the image of the darkness (160 × 120); stage = the full-screen image for intro, tutorial boards and
// ending (160 × 120); titleImageWithHint and titleImagePlain = the two title images with and without the hint.
let highestKind = 0
let lastRoom = 0
let chestChoice = 0
let blinkCounter = 0
let newEnemyHealth = 0
let newEnemySpeed = 0
let enemyX = 0
let enemyY = 0
let x = 0
let y = 0
let s: Sprite = null
let newFireball: Sprite = null
let r: Sprite = null
let hitEnemy: Enemy = null
let darkImage: Image = null
let stage: Image = null
let newEnemyImage: Image = null
let titleImageWithHint: Image = null
let titleImagePlain: Image = null
// The star puffs of defeated enemies that can be seen right now (vanish in events.ts). The list is empty as soon as
// none is running.
let puffs: Sprite[] = []
