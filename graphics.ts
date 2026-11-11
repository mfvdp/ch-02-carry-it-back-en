// Graphics: all the tiles, sprites and images made from them.
//
// Colors in the dungeon (letters as in the images):
//   f black = outlines, joints, depth
//   c dark violet = base tone of ground and rock
//   b gray-mauve = brick, metal, stone in the light
//   d light beige = shiny edge, skin
//   4, 5, e = warm tones (torch, gold, wood)
//
// Be thrifty: every new image costs space in flash. That is why variants are only made at the start, from clone() plus
// fillRect, drawLine and setPixel.
let TILE_STAIRS: Image = null
let TILE_SPIKES: Image = null
let IMG_SKELETON: Image = null
let IMG_SLIME: Image = null
let IMG_BAT: Image = null
let IMG_MAGE: Image = null
let IMG_GUARD: Image = null
// The guard's facing directions. He blocks everything except hits right in his back (events.ts). So the shield has to
// visibly point to the front, otherwise nobody can tell where his back is.
let IMG_GUARD_RIGHT: Image = null
let IMG_GUARD_UP: Image = null
let IMG_GUARD_DOWN: Image = null
let IMG_BOSS: Image = null
let IMG_HEART: Image = null
let IMG_KEY: Image = null
let IMG_COIN: Image = null
let IMG_FIREBALL: Image = null
let IMG_CHEST: Image = null
let IMG_TORCH: Image = null
let IMG_MAGIC_ORB: Image = null
let DECOR_BARREL: Image = null
let DECOR_BONES: Image = null
// The hero's facing directions. IMG_HERO stays the standard image.
let IMG_HERO_DOWN: Image = null
let IMG_HERO_UP: Image = null
let IMG_HERO_LEFT: Image = null
let IMG_HERO_RIGHT: Image = null


// Brickwork in running bond: the joints are at y = 0, 4, 8 and 12, and the end joints of the rows are shifted by half a
// brick. This way the tiles fit together without a seam, even across the edge.
let TILE_WALL = img`
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b c b b b f b b b b b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b b b f b b b c b b b f b b b b
    c c c f c c c c c c c f c c c c
    f f f f f f f f f f f f f f f f
    d b b b b b b f d b b b b b b f
    b b b b b b b f b b b c b b b f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b f d b b b b b b f d b b b
    b c b f b b b b b b b f b b c b
    c c c f c c c c c c c f c c c c
    `
// Worn stone slabs: four slabs per tile, and the joints carry on across the tile edge.
let TILE_GROUND = img`
    b b c c c c c f b b b c c c c f
    c c c c c c c f c c c c c c c f
    c c c f c c c f c c c c c c c f
    c c c c c c c f c c c c f c c f
    c c c c c c c f c c c c c c c f
    c f c c c c c f c c c c c c c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    b b b c c c c f b b c c c c c f
    c c c c c c c f c c c c c c c f
    c c c c c f c f c c c f c c c f
    c c c c c c c f c c c c c c c f
    c c f c c c c f c c c c c c c f
    c c c c c c c f c c c c c f c f
    c c c c c c c f c c c c c c c f
    f f f f f f f f f f f f f f f f
    `
// Stairs: five steps that look deep, narrow and dark at the top, wider and brighter toward the front. You see at once
// that it leads down, and not just a striped pattern.
TILE_STAIRS = img`
    f f f f f f f f f f f f f f f f
    f f f f f f b b b b f f f f f f
    f f f f f f c c c c f f f f f f
    f f f f f b b b b b b f f f f f
    f f f f f c c c c c c f f f f f
    f f f f f c c c c c c f f f f f
    f f f f b b b b b b b b f f f f
    f f f f c c c c c c c c f f f f
    f f f f c c c c c c c c f f f f
    f f f d d d d d d d d d d f f f
    f f f b b b b b b b b b b f f f
    f f f c c c c c c c c c c f f f
    f f d d d d d d d d d d d d f f
    f f b b b b b b b b b b b b f f
    f f c c c c c c c c c c c c f f
    f f f f f f f f f f f f f f f f
    `
// Hero from the front: golden helmet, blue tunic with a light-blue crest. All four facing directions have the same
// outline (x from 2 to 13 and y from 0 to 15), so the hit area does not change when the image is switched.
let IMG_HERO = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 d d d d d d 5 f . . .
    . . . f d d f d d f d d f . . .
    . . . f d d d d d d d d f . . .
    . . . . f d d e e d d f . . . .
    . . . f f f 8 8 8 8 f f f . . .
    . . f 8 8 8 8 9 9 8 8 8 8 f . .
    . . f d 8 8 9 9 9 9 8 8 d f . .
    . . f d 8 8 8 9 9 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Hero from behind: no face, the whole head is hair, and the neck shows below it.
IMG_HERO_UP = img`
    . . . . . f f f f f f . . . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . f f f d d d d f f f . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f d 8 8 8 8 8 8 8 8 d f . .
    . . f 8 4 4 4 4 4 4 4 4 8 f . .
    . . f 8 8 8 8 f f 8 8 8 8 f . .
    . . . f 8 8 f . . f 8 8 f . . .
    . . . f e e f . . f e e f . . .
    . . . f f f . . . . f f f . . .
    `
// Hero in profile, facing left. For facing right the image is mirrored.
IMG_HERO_LEFT = img`
    . . . . . f f f f f . . . . . .
    . . . . f 5 5 5 5 5 f . . . . .
    . . . f 5 5 5 5 5 5 5 f . . . .
    . . . f d d 5 5 5 5 5 f . . . .
    . . . f d f d 5 5 5 5 f . . . .
    . . . f d d d 5 5 5 5 f . . . .
    . . . . f d d d 5 5 f . . . . .
    . . . f f f 8 8 8 8 f f . . . .
    . . f 8 8 8 8 8 8 8 8 8 8 f . .
    . . f d 8 8 8 9 9 8 8 8 e f . .
    . . f d 8 8 8 9 8 8 8 8 e f . .
    . . . f 8 4 4 4 4 4 4 8 f . . .
    . . . f 8 8 8 8 8 8 8 8 f . . .
    . . . f 8 8 f f 8 8 f f . . . .
    . . . f e e f . f e e f . . . .
    . . . f f f . . . f f f . . . .
    `
// Facing down, the hero looks like in the standard image. It is the same image, so no second one is needed in flash.
IMG_HERO_DOWN = IMG_HERO
IMG_HERO_RIGHT = IMG_HERO_LEFT.clone()
IMG_HERO_RIGHT.flipX()
// Skeleton: hollow eyes, rib cage, thin bone arms.
IMG_SKELETON = img`
    . . . . . f f f f f f . . . . .
    . . . . f 1 1 1 1 1 1 f . . . .
    . . . f 1 1 1 1 1 1 1 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 f f 1 1 f f 1 f . . .
    . . . f 1 1 1 f f 1 1 1 f . . .
    . . . . f 1 f f f f 1 f . . . .
    . . . . . f 1 1 1 1 f . . . . .
    . . . f f f 1 1 1 1 f f f . . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f 1 f 1 1 f f 1 1 f 1 f . .
    . . f 1 f 1 f 1 1 f 1 f 1 f . .
    . . f f f . f 1 1 f . f f f . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . . f 1 f f 1 f . . . . .
    . . . . f f f . . f f f . . . .
    `
// Slime: a round blob, a highlight at the top left, a cold shadow at the bottom.
IMG_SLIME = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . f f 7 1 7 7 7 7 f f . . .
    . . f 7 7 1 7 7 7 7 7 7 7 f . .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 f 1 7 7 f 1 7 7 f .
    . f 7 7 7 7 f f 7 7 f f 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 7 f f f f f f 7 7 7 f .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    . f 7 7 6 6 7 7 7 7 6 6 7 7 f .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f f f f f f f f f f f f f f .
    . . . . . . . . . . . . . . . .
    `
// Heart: a bright highlight at the top left, so it stands out on the dark ground.
IMG_HEART = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . f f f . . . . f f f . . .
    . . f 3 3 2 f f f f 2 2 2 f . .
    . f 2 1 1 2 2 2 2 2 2 2 2 2 f .
    . f 2 1 2 2 2 2 2 2 2 2 2 2 f .
    . f 2 2 2 2 2 2 2 2 2 2 2 2 f .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . . f 2 2 2 2 2 2 2 2 f . . .
    . . . . f 2 2 2 2 2 2 f . . . .
    . . . . . f 2 2 2 2 f . . . . .
    . . . . . . f 2 2 f . . . . . .
    . . . . . . . f f . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Key: a thick bit, a round handle with a hole, a highlight.
IMG_KEY = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . f f f f . . . . . . . .
    . . . f 1 5 5 5 f . . . . . . .
    . . f 5 5 f f 5 5 f . . . . . .
    . . f 5 f f f f 5 f f f f f . .
    . . f 5 5 f f 5 5 5 5 5 5 5 f .
    . . . f 5 5 5 5 f f 5 f 5 5 f .
    . . . . f f f f . . f f f f f .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// Coin: gold edge, an embossed ring, a shine at the top left.
IMG_COIN = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . f f f f f f . . . . .
    . . . . f 5 1 5 5 5 5 f . . . .
    . . . f 5 1 5 5 5 5 5 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 4 5 5 5 4 5 f . . .
    . . . f 5 5 5 4 4 4 5 5 f . . .
    . . . f 5 5 5 5 5 5 5 5 f . . .
    . . . . f 5 5 5 5 5 5 f . . . .
    . . . . . f f f f f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
// The hero's fireball: white core, then yellow, orange and a red edge.
IMG_FIREBALL = img`
    . . 2 4 4 2 . .
    . 2 4 5 5 4 2 .
    2 4 5 5 5 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 1 1 5 4 2
    2 4 5 5 5 5 4 2
    . 2 4 5 5 4 2 .
    . . 2 4 4 2 . .
    `
// Derived tiles: more variety in the ground and in the wall.
//
// Variant 2: cracks across two slabs.
let TILE_GROUND_2 = TILE_GROUND.clone()
TILE_GROUND_2.drawLine(1, 3, 6, 5, 15)
TILE_GROUND_2.drawLine(6, 5, 5, 6, 15)
TILE_GROUND_2.drawLine(9, 10, 13, 13, 15)
TILE_GROUND_2.setPixel(11, 9, 11)
TILE_GROUND_2.setPixel(2, 10, 15)
// Variant 3: gravel on the slab at the bottom right, a fine crack on the left.
let TILE_GROUND_3 = TILE_GROUND.clone()
TILE_GROUND_3.setPixel(9, 10, 11)
TILE_GROUND_3.setPixel(11, 9, 11)
TILE_GROUND_3.setPixel(12, 12, 11)
TILE_GROUND_3.setPixel(10, 13, 11)
TILE_GROUND_3.setPixel(13, 11, 15)
TILE_GROUND_3.drawLine(2, 11, 5, 11, 15)
TILE_GROUND_3.setPixel(4, 2, 11)
// Wall base: this is where the wall meets the ground. A light plinth and a black shadow joint below it show at once
// where the wall ends.
let TILE_WALL_BASE = TILE_WALL.clone()
TILE_WALL_BASE.fillRect(0, 12, 16, 2, 11)
TILE_WALL_BASE.fillRect(0, 14, 16, 1, 12)
TILE_WALL_BASE.fillRect(0, 15, 16, 1, 15)
TILE_WALL_BASE.fillRect(4, 12, 1, 2, 15)
TILE_WALL_BASE.fillRect(11, 12, 1, 2, 15)
TILE_WALL_BASE.setPixel(1, 13, 7)
TILE_WALL_BASE.setPixel(2, 13, 7)
TILE_WALL_BASE.setPixel(13, 13, 7)
// Rock: the solid mountain behind the walls, almost black and with little texture.
let TILE_ROCK = image.create(16, 16)
TILE_ROCK.fill(15)
TILE_ROCK.drawLine(2, 2, 5, 3, 12)
TILE_ROCK.drawLine(9, 6, 12, 5, 12)
TILE_ROCK.drawLine(4, 11, 7, 12, 12)
TILE_ROCK.setPixel(1, 8, 12)
TILE_ROCK.setPixel(6, 8, 12)
TILE_ROCK.setPixel(13, 9, 12)
TILE_ROCK.setPixel(11, 14, 12)
// Spike trap: a dark pit in the ground, three spikes with a bright ridge.
TILE_SPIKES = TILE_GROUND.clone()
TILE_SPIKES.fillRect(1, 1, 14, 14, 15)
TILE_SPIKES.drawLine(1, 1, 14, 1, 12)
TILE_SPIKES.fillRect(3, 5, 1, 3, 11)
TILE_SPIKES.fillRect(2, 8, 3, 2, 11)
TILE_SPIKES.fillRect(1, 10, 5, 3, 11)
TILE_SPIKES.fillRect(8, 3, 1, 3, 11)
TILE_SPIKES.fillRect(7, 6, 3, 3, 11)
TILE_SPIKES.fillRect(6, 9, 5, 4, 11)
TILE_SPIKES.fillRect(12, 5, 1, 3, 11)
TILE_SPIKES.fillRect(11, 8, 3, 2, 11)
TILE_SPIKES.fillRect(10, 10, 5, 3, 11)
TILE_SPIKES.setPixel(3, 5, 1)
TILE_SPIKES.setPixel(2, 8, 1)
TILE_SPIKES.setPixel(1, 10, 1)
TILE_SPIKES.setPixel(8, 3, 1)
TILE_SPIKES.setPixel(7, 6, 1)
TILE_SPIKES.setPixel(6, 9, 1)
TILE_SPIKES.setPixel(12, 5, 1)
TILE_SPIKES.setPixel(11, 8, 1)
TILE_SPIKES.setPixel(10, 10, 1)
// More enemies and items.
//
// Bat: wide wings, pointed ears, red eyes.
IMG_BAT = img`
    . . . . . f f . . f f . . . . .
    f f . . f a a f f a a f . . f f
    f a f f a a a a a a a a f f a f
    f a a a a a 2 a a 2 a a a a a f
    f a a a a a a f f a a a a a a f
    . f a a a a a a a a a a a a f .
    . . f f a a a a a a a a f f . .
    . . . . f f a a a a f f . . . .
    `
// Mage: a pointed hood, glowing eyes in the shadow, a magic orb in the hands. The point makes his outline
// recognizable at once.
IMG_MAGE = img`
    . . . . . . . f f . . . . . . .
    . . . . . . f a a f . . . . . .
    . . . . . f a a a a f . . . . .
    . . . . f a a a a a a f . . . .
    . . . f a a f f f f a a f . . .
    . . . f a f 9 f f 9 f a f . . .
    . . . f a f f f f f f a f . . .
    . . . . f a a a a a a f . . . .
    . . . f f a a a a a a f f . . .
    . . f a a a a a a a a a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a f 3 1 1 3 f a a f . .
    . . f a a a f 3 3 f a a a f . .
    . . f a a a a a a a a a a f . .
    . . f a a a a a a a a a a f . .
    . . . f f f f f f f f f f . . .
    `
// Guard: heavy armor, a pot helmet with a visor slit and a big round shield on the left side. He has the widest outline
// of all the enemies.
IMG_GUARD = img`
    . . . . . . . f f f f f . . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f f b f f f . . .
    . . . . . . f b b b b b f . . .
    . . . . . . f f c c f f f . . .
    . . f f f f f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 9 6 f b c c c b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . f b 6 6 6 f b b b b b b f . .
    . . f b 6 6 f b b b b b f . . .
    . . . f b b f b b b b f . . . .
    . . . . f f f b b b b f . . . .
    . . . . . . f e e f e e f . . .
    . . . . . . f f f . f f f . . .
    `
// Facing right is mirrored (like the hero). For up and down the guard needs images of his own, because the round shield
// moves to the top or the bottom edge. All four images are made at the start. During the game only setImage switches
// between them, without making new images.
IMG_GUARD_RIGHT = IMG_GUARD.clone()
IMG_GUARD_RIGHT.flipX()
// Facing down: pot helmet with a visor slit seen from the front, the shield hangs across the legs.
IMG_GUARD_DOWN = img`
    . . . . . f f f f f f . . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f b f f b f f . . . .
    . . . . f b b b b b b f . . . .
    . . . . f f c c c c f f . . . .
    . . . f b b b b b b b b f . . .
    . . . f b b b b b b b b f . . .
    . . . f b b c c c c b b f . . .
    . . . f b b b b b b b b f . . .
    . . f f f f f f f f f f f f . .
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . . . f f f f f f f f f f . . .
    `
// Facing up: you see the back, and the shield sticks out as a wide arc above the helmet.
IMG_GUARD_UP = img`
    . . . f f f f f f f f f f . . .
    . . f 6 6 6 6 6 6 6 6 6 6 f . .
    . f 6 6 6 6 6 9 9 6 6 6 6 6 f .
    . f 6 6 6 6 9 9 9 9 6 6 6 6 f .
    . . f f f f f f f f f f f f . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b c c b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . f b b b b b b b f . . .
    . . . . . f b b b b b f . . . .
    . . . . . f b b b b b f . . . .
    . . . . . f e e f e e f . . . .
    . . . . . f f f . f f f . . . .
    `
// Boss: horns, glowing yellow eyes, fangs. He is drawn twice as big with setScale(2), so the shapes are coarse and
// without fine details.
IMG_BOSS = img`
    . f f . . . . . . . . . . f f .
    . f 4 f . f f f f f f . f 4 f .
    . f 4 f f 2 2 2 2 2 2 f f 4 f .
    . . f 4 2 2 2 2 2 2 2 2 4 f . .
    . . f 2 5 5 2 2 2 2 5 5 2 f . .
    . . f 2 5 f 2 2 2 2 f 5 2 f . .
    . . f 2 2 2 2 2 2 2 2 2 2 f . .
    . . f 2 f 1 1 1 1 1 1 f 2 f . .
    . . . f 2 f 1 f f 1 f 2 f . . .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . f 4 f 2 2 e e e e 2 2 f 4 f .
    . f 4 f 2 2 2 e e 2 2 2 f 4 f .
    . . f f 2 2 2 2 2 2 2 2 f f . .
    . . . f 2 2 f f f f 2 2 f . . .
    . . . f 2 2 f . . f 2 2 f . . .
    . . f f f f . . . . f f f f . .
    `
// Chest: wooden planks with dark joints, metal bands, a golden lock.
IMG_CHEST = img`
    . . f f f f f f f f f f f f . .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f e e e f e e e e f e e e f .
    . f e e e f e e e e f e e e f .
    . f b b b b f f f f b b b b f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f 5 f f 5 f e e e f .
    . f e e e f 5 5 5 5 f e e e f .
    . f e e e f e e e e f e e e f .
    . f 4 4 4 4 4 4 4 4 4 4 4 4 f .
    . f b b b b b b b b b b b b f .
    . . f f f f f f f f f f f f . .
    `
// Torch: a white flame tip, a wrapped handle.
IMG_TORCH = img`
    . . . 5 . . . .
    . . 4 5 4 . . .
    . 4 5 1 5 4 . .
    . 4 5 1 1 5 4 .
    . 4 5 5 5 5 4 .
    . . 4 5 5 4 . .
    . . 2 4 4 2 . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    . . f b b f . .
    . . f e e f . .
    `
// The enemies' magic orb: a violet edge, a pink core. It looks completely different from the hero's yellow fireball.
IMG_MAGIC_ORB = img`
    . . a a a a . .
    . a 3 3 3 3 a .
    a 3 3 1 3 3 3 a
    a 3 1 1 3 3 3 a
    a 3 3 3 3 3 3 a
    a 3 3 3 3 3 3 a
    . a 3 3 3 3 a .
    . . a a a a . .
    `
// Barrel: a light lid rim, wooden planks, two metal hoops.
DECOR_BARREL = img`
    . . f f f f f f f f . .
    . f d d d d d d d d f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f b b b b b b b b f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . f e e f e e f e e f .
    . . f f f f f f f f . .
    `
// Bone: lit white on top, beige in the shadow at the bottom.
DECOR_BONES = img`
    . f f . . . . . . f f .
    f 1 1 f . . . . f 1 1 f
    f 1 1 1 f f f f 1 1 1 f
    f 1 1 1 1 1 1 1 1 1 1 f
    f d d d d d d d d d d f
    f d d d f f f f d d d f
    f d d f . . . . f d d f
    . f f . . . . . . f f .
    `

// The Calliope Hacker: a person in a black hooded sweater with the hood up, seen from behind, at a desk with a monitor,
// a Calliope mini and a GameKit, plus a sleeping cat, a turquoise backpack and turquoise sneakers. The image is 64
// × 40 pixels. Its colors are matched to the standard palette of this game (black f, turquoise 6, rim light 9, wood e,
// wall c), so no palette swap is needed. On black the sweater would be invisible, so he always stands in front of a
// board in color c (Intro.drawStudio).
let IMG_HACKER = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . c . c . b b b b b b b b b b b b b b b b b b b b b b . . . . . . . . . . .
    . . . . . . . . . . . . . f b b f f f f f f 9 . c . c . c . c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 . c . c c c c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f b f f f f f f f f f 9 c c c c c c c f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . c . . . . . . . . .
    . . . . . . . . . . . f b f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c . c . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . c . c . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c c . c . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 6 6 6 6 6 f f f f f f f f f f f f c c c c . c . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c . c 5 5 . .
    . . . . . . . . . . . b f f f f f f f f f f f f 9 c c c c c c f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f c c 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f b f f f f f f f f f f f f 9 c c c c c f f f f f f f f f f f f f f f f f f f f f f c 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f b b f f f f f f f f f f f 9 c c c c f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f b b b b f f f f f f f f 9 c c c f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c c f f f 8 8 8 8 f f f f f f f f f f f f f f f c 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 c f f f f f f f f f f f f f f f f f f f f f f c c 5 8 8 8 8 8 5 . c
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f b f f f f 9 f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c f c 5 5 c .
    . . . . f 6 6 6 6 6 6 6 8 f f f f f f f f f f f f f b f f f f 9 c c c c c c c c c b b b c c c c c c c c c c c c c c c c . c . .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f b f f f f f d d c c c b b b b b b b b b c c c c c c c c c c c c . c . c .
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f b f f f f d d f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f f 8 b 9 b 6 b 2 b f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 8 6 6 6 6 6 6 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f d b d f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 8 8 6 6 6 6 8 8 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 8 8 6 6 8 8 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . f 8 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f b f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c c c c c c c c c c c b b c c . c . c . c . . b d d d d d d
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f c c c c c c c c c c c b b c . c . c . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . c f f f f f b . c . c . c . c . c . c b b . c . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . c f f f f b c . c . c . c . c . c . b b . . 8 6 6 6 8 . . . b d b b b b d
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f b . . . c . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 f f f 6 8 . . b d d d d d d
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f b . . . . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d b b b b d
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . b b . 8 6 b b b 6 8 . . b d d d d d d
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . b b . 8 6 6 6 6 6 8 . . b d d d d d d
    8 6 6 6 6 6 6 6 6 6 8 . . . . b b . . . . . . b b . . . . . . . . . . . . . . . . . . . . b b . . 8 8 8 8 8 . . . b d b b b b d
    . 8 8 8 8 8 8 8 8 8 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b d d d d d d
    `
// The picture on the wall in the start room of floor 1: the same Hacker, small, in a golden frame. Pure decoration
// without collision (items.ts).
let IMG_HACKER_MURAL = img`
    5 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    4 c c c c c c c c c c c c c c c c c c 4
    4 c c c f f f c c c c f f f f f f f c 4
    4 c c f b f f 9 c c c f 5 5 5 f f f c 4
    4 c c f b f f f 9 c c f f f f f f f c 4
    4 c c f f f f f 9 c c f 9 9 9 9 f f c 4
    4 c 6 f f f f f f 9 c f f f f f f f c 4
    4 c 6 f f f f f f f 9 f f 2 2 f f f c 4
    4 c 6 f f f f f f f f 9 f f f f f f c 4
    4 c 6 f f f f f f f f d e e e e e e e 4
    4 c 6 6 6 6 f f f f c c e c c c c e c 4
    4 c c c c c f f c f f c e c c c c e c 4
    4 c c c c 6 6 c c 6 6 c e c c c c e c 4
    4 c c c c 1 1 c c 1 1 c c c c c c c c 4
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4
    `
// The Hacker as a spectator at the edge of the throne room in the ending (ending.ts), seen from behind like on the
// studio card. The second image cheers with raised arms.
let IMG_SPECTATOR = img`
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . . . . . . . . .
    . . . . f f f 9 . . . .
    . . . f f f f f 9 . . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . b f f f f f f f f 9 .
    . b f f f f f f f f 9 .
    . b . f f f f f f . 9 .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
let IMG_SPECTATOR_CHEER = img`
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b . . . . . . . . 9 .
    . b f . f f f 9 . 9 9 .
    . . b f f f f f 9 9 . .
    . . b b f f f f f 9 . .
    . . b f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f 9 . . .
    . . f f f f f f f f . .
    . . f f f f f f f 9 . .
    . . f f f f f f f 9 . .
    . . . f f f f f f . . .
    . . . f f . . f f . . .
    . . 6 6 6 . . 6 6 6 . .
    . . 1 1 1 . . 1 1 1 . .
    `
// Vanishing: a defeated enemy disappears in bright stars (yellow and white, never in its own colors and never red).
// Each of the three images lasts about 150 ms, and advancePuffs() in events.ts switches between them.
let IMG_PUFF_1 = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . 5 5 1 1 1 5 5 . . . . .
    . . . . . . 5 1 5 . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMG_PUFF_2 = img`
    . . . . . . . 1 . . . . . . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . . . . . . 5 . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . 5 . . . . . . . .
    . 5 . . . . 5 1 5 . . . . 5 . .
    5 1 5 . . . . 5 . . . . 5 1 5 .
    . 5 . . . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 5 . . . . . . . 5 . . . .
    . . 5 1 5 . . 5 . . 5 1 5 . . .
    . . . 5 . . 5 1 5 . . 5 . . . .
    . . . . . . . 1 . . . . . . . .
    . . . . . . . . . . . . . . . .
    `
let IMG_PUFF_3 = img`
    . . . . . . . . . . . . . . . .
    . 1 . . . . . . . . . . . . 5 .
    . . . . . . . 5 . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . 5 . . . . . . . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    1 . . . . . . . . . . . . . . 5
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . 1 . . . . . . . . . 5 . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . 5 . . . . . . 1 . . . . . . .
    . . . . . . . . . . . . . 1 . .
    . . . . . . . . . . . . . . . .
    `
