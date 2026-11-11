// Darkness and light: the circle of sight around the hero.
//
// The image with the darkness is 160 × 120 pixels big and hangs as a sprite fixed in front of the camera, relative to
// it. The circle of light is painted anew in every frame at the hero's screen position (drawLight, called from
// game.onUpdate in main.ts). That is three built-in fill calls per frame and costs practically nothing.
//
// An image in world coordinates at the hero would have to be 320 × 240 pixels big, because at the edges of the dungeon
// the camera stands still and the hero walks up to 80 and 60 pixels away from the middle. That would be 38 KB in one
// block, half of all the memory, and every free spot in memory would be split in two by it. An image of 160
// × 120 pixels is only 9.6 KB.
//
// The image is made once at the start (main.ts) and then only painted over.

// Only remembers the wanted radius. The painting is done anew in every frame.
function setLight (r: number) {
    lightRadius = r
}

// Paints the darkness: everything black, a twilight ring and a hole in the middle, centered on the hero's screen
// position. That is worked out from his world position minus the camera view. So the circle is right even when the
// camera stays at the edge of the dungeon.
function drawLight () {
    if (darkImage == null || hero == null) {
        return
    }
    let sx = hero.x - scene.cameraProperty(CameraProperty.Left)
    let sy = hero.y - scene.cameraProperty(CameraProperty.Top)
    darkImage.fill(15)
    darkImage.fillCircle(sx, sy, lightRadius + 6, 12)
    darkImage.fillCircle(sx, sy, lightRadius, 0)
}
