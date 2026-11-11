// Small helper functions without a state of their own.

function absValue (n: number) {
    if (n < 0) {
        return 0 - n
    }
    return n
}

function signOf (n: number) {
    if (n > 0) {
        return 1
    }
    if (n < 0) {
        return -1
    }
    return 0
}

function isGround (x: number, y: number) {
    if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) {
        return false
    }
    return grid[y * GRID_WIDTH + x] > 0
}
