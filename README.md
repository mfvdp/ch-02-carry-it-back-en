# Carry It Back

Hello! This is **Carry It Back**, a game by **Calliope Hacker** for the **Calliope mini 3 with GameKit**.

A thief has stolen the castle's crown and is hiding with it deep down in the dungeon. You climb down as a hero, floor by
floor. Every floor is built anew, at random, every time you play. In the dark you only see a small circle around you.
Find the key, look for the stairs and make enemies vanish with your fireball. Every 5 floors a boss is
waiting, and on floor 15 the crown thief. Beat him and bring the crown back! By the way, on the
first floor a small picture of the Calliope Hacker hangs on the wall.

## How to play

- **D-pad:** walk and aim (the hero looks the way he walks)
- **A:** fireball (hold it down to keep shooting)
- **Hold B:** look at the map of the floor
- **Menu:** pause, and there you can also turn the sound on and off
- **Collect chests and torches:** triple shot, rapid fire, speed boots, an extra heart or more light

## Change the game yourself

The whole source code is inside this game file. Open it in MakeCode Arcade (arcade.makecode.com, "Import"). All the
numbers you can play with are in `settings.ts`. Change a number, start the simulator and see what happens:

- **More lives:** There you find `START_LIVES = 6`. With `20` you start with lots more hearts.
- **A bigger circle of light:** There you find `LIGHT_NORMAL = 46`. With `90` you see much farther into the darkness.
- **Shoot faster:** There you find `RELOAD_NORMAL_MS = 420`, the waiting time between two shots in
  milliseconds. With `100` you fire almost without a break.

An explanation of the source code for kids, parents and teachers is on calliope-hacker.de.
