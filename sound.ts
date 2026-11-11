// Sound: all the sounds and the music in one place. The rest of the game only calls these functions and does not know
// how a noise is built.
//
// Why not music.playTone()? That function holds the caller up for as long as the tone lasts (for at most 2000 ms it is
// followed by a pause). But our noises play in the middle of the physics step, in the handlers for touches. The game
// would stop for a moment at every coin that is picked up.
//
// Instead we use music.Melody:
//   new music.Melody(text)   builds a sound from a short text pattern
//   melody.play(volume)      plays once in the background
//   melody.loop(volume)      plays in a loop in the background
//   melody.stop()            stops it
//
// play() and loop() start playing with control.runInParallel() in a thread of their own. The caller carries on at once,
// which is exactly what we need.
//
// The text pattern (the music notation) is made of words:
//   ~n            waveform: 1 triangle, 2 sawtooth, 3 sine, 4 tunable noise, 5 white noise,
//                 11 to 15 square, 16 to 18 filtered square
//   @a,d,s,r      envelope: attack in ms, decay in ms, sustain volume 0 to 255, release in ms
//   !hz,ms        one tone with a fixed frequency and length
//   ^hz           target frequency: the tone glides there
//   C4:2          note C in octave 4, length 2 (4 = one beat)
//   R:2           rest
//   -180          tempo in beats per minute
//
// A word without a note and without "!" plays nothing, it only changes the waveform, envelope or tempo. That is why a
// sound can be put together from several sections.
//
// Careful with gliding: with "^" the release r has to be 0. Otherwise the parser keeps calculating the frequency ramp
// past the end of the tone and ends up in the negative (an ugly chirp).
namespace Sound {
    // Volumes. At the end the parser calculates (value × music.volume()) >> 8, so these are relative levels.
    // VOLUME_FULL is for big moments.
    const VOLUME_FULL = 255
    // Normal rewards.
    const VOLUME_MEDIUM = 200
    // Very frequent noises.
    const VOLUME_QUIET = 150
    // Title music.
    const VOLUME_TITLE = 165
    // Loop in the dungeon, plays all the time.
    const VOLUME_MUSIC = 120
    // Second voice: it only supports and does not push to the front.
    const VOLUME_BASS = 115
    // Distant accents above the intro loop.
    const VOLUME_FAR = 95

    // The sounds. Each one is a Melody object of its own, so that a new call only cuts off itself and not
    // the other noises.

    // ---- Fighting ----
    // Fireball: a short, bright "pew" that fades fast.
    const SOUND_FIREBALL = new music.Melody("~15 @1,8,120,0 !1150,50^380")
    // Enemy hit but still there: a short, crunching blow.
    const SOUND_HIT = new music.Melody("~4 @0,6,180,0 !520,45^200")
    // Bounced off: first a metallic click, then a rising whir, which sounds like a ricochet.
    const SOUND_BLOCK = new music.Melody("~4 @0,0,255,0 !170,22 ~15 @0,3,110,0 !560,34^1600")
    // Enemy vanishes: a cloud of noise falling down, then two bright tones.
    const SOUND_ENEMY_PUFF = new music.Melody("~4 @0,0,255,0 !640,50^90 ~15 @1,8,110,0 !784,40 !1046,55")
    // Boss vanishes: a long burst of noise, a deep crash, then a victory figure. About 1.8 s, on purpose much
    // fuller and longer.
    const SOUND_BOSS_PUFF = new music.Melody(
        "~5 @8,700,0,1 !400,1 ~2 @4,2,200,0 !260,320^60 ~15 @2,18,150,0 -230 C5:2 E5:2 G5:2 C6:6")
    // Hero hit: a deep, sliding groan with a rumble.
    const SOUND_HERO_HIT = new music.Melody("~2 @0,0,255,0 !220,120^90 ~4 @0,2,170,0 !75,90")

    // ---- Items ---- (all of them rise, but they sound clearly different)
    // Key: a glockenspiel in four steps, filtered square.
    const SOUND_KEY = new music.Melody("~16 @1,14,120,70 -380 C5:2 G5:2 C6:2 E6:4")
    // Heart: a warm sine, deeper and softer than everything else.
    const SOUND_HEART = new music.Melody("~3 @12,2,210,90 -300 G4:2 C5:2 E5:4")
    // Coin: just two very short, high square tones.
    const SOUND_COIN = new music.Melody("~15 @1,4,95,45 -560 B5:2 E6:4")
    // Torch: a swelling noise (the lighting), then a warm triangle that glides upward (the flaring up).
    const SOUND_TORCH = new music.Melody("~5 @70,2,120,90 !1,150 ~1 @14,2,190,0 !430,150^760")
    // Chest: a wooden thud of the lid, followed by a small triad.
    const SOUND_CHEST = new music.Melody("~4 @0,0,255,0 !150,55^80 ~15 @1,10,110,80 -400 C5:2 E5:2 G5:2 C6:5")

    // ---- Intro ----
    // Studio sound: the shine of light travels over the letters.
    const SOUND_STUDIO = new music.Melody("~16 @3,26,120,140 -260 C4:2 G4:2 C5:2 E5:6")
    // The meteor's approach: tunable noise that swells from far away and rises as it does. About 0.74 s.
    const SOUND_APPROACH = new music.Melody("~4 @80,2,150,0 !70,660^1400")
    // The impact lasts about 0.5 s: first the white bang (built like SOUND_DOOR), then a sawtooth that falls
    // into the cellar.
    const SOUND_IMPACT = new music.Melody("~5 @0,170,0,1 !240,1 ~2 @0,8,255,0 !180,320^24")
    // The fanfare for the title card is in D minor, like the whole game: at this point the story has not
    // ended well yet.
    const SOUND_FANFARE = new music.Melody("~16 @2,14,190,140 -190 D4:2 A4:2 D5:2 F5:6 R:1 F5:2 A5:2 D6:10")
    // Thunderstorm over the castle: first the white bang of the impact, then the ripping end of the lightning bolt, and
    // only then the rumble. The rumble alone sounded like distant traffic, the blow was missing.
    const SOUND_THUNDER = new music.Melody("~5 @0,24,0,1 !2800,1"
        + " ~4 @0,3,215,0 !1800,70^300"
        + " ~5 @6,540,80,0 !96,660^30")
    // The thief dashes away: a hiss that whooshes upward.
    const SOUND_WHOOSH = new music.Melody("~5 @2,14,110,0 !260,220^1500")
    // Studio card and final image: the logo stands. Two voices, both exactly 2.0 s long (20 units of 100 ms each at
    // tempo 150). Above, a D major triad that climbs over two octaves ...
    const SOUND_LOGO_HIGH = new music.Melody("~16 @6,26,150,220 -150"
        + " D4:2 A4:2 D5:2 F#5:2 A5:4 D6:8")
    // ... below, the cadence D, A, D as a foundation under it.
    const SOUND_LOGO_LOW = new music.Melody("~1 @18,40,165,260 -150"
        + " D3:8 A2:4 D3:8")

    // ---- Flow ----
    // Floor cleared: a small fanfare that ends on a high note.
    const SOUND_FLOOR_CLEARED = new music.Melody("~15 @2,12,150,90 -300 C5:1 E5:1 G5:2 C6:2 G5:2 C6:6")
    // Boss appears: a swelling growl, then a deep sawtooth motif with a tritone (C to F sharp), on purpose out of tune.
    const SOUND_BOSS_APPEARS = new music.Melody(
        "~5 @150,2,110,200 !1,300 ~2 @10,2,235,120 -150 C3:2 R:1 C3:2 R:1 F#3:3 G3:8")
    // Door closed: first the hard bang, then the dull afterblow.
    const SOUND_DOOR = new music.Melody("~5 @0,90,0,1 !200,1 ~4 @0,10,200,0 !130,150^38")
    // Game over: the notes slide down chromatically (G, F sharp, F, E, D sharp), then it drops to a low, fat C.
    const SOUND_GAME_OVER = new music.Melody(
        "~15 @2,16,160,110 -200 G4:2 F#4:2 F4:2 E4:2 ~2 @6,2,190,300 D#4:2 C4:10")
    // Before the coronation: slow bells with lots of air. About 1.8 s, roughly as long as the slow motion
    // (CORONATION_FRAME_MS in ending.ts, 1.65 s together).
    const SOUND_BELL = new music.Melody("~3 @2,420,60,340 -100 D6:2 R:2 A6:2 R:1 D7:5")
    // The coronation: first the stroke of light, then a rising fanfare in D major (F sharp instead of F). The whole
    // game is in D minor, and here it resolves for the first time. About 1.9 s.
    const SOUND_CROWN = new music.Melody("~5 @1,40,0,1 !800,1"
        + " ~16 @2,12,205,130 -180 D5:1 F#5:1 A5:1 D6:1 F#6:2 A6:2 F#6:2 D6:12")
    // The ending: the same theme as the title music (D, F, A, G, F, E, D), but in D major, half as fast and as a warm
    // sine. Whoever knows the game hears the relief without knowing why. About 3.25 s.
    const SOUND_ENDING = new music.Melody(
        "~3 @18,6,160,240 -120 D4:2 F#4:2 A4:4 G4:2 F#4:2 E4:4 D4:2 C#4:2 D4:6")

    // ---- Music ----
    // All the big pieces of music except the dungeon loop have two voices: two Melody objects that loop separately
    // (each in a thread of its own). So that the voices do not drift apart, the upper and the lower voice always have
    // the same tempo and the same number of length units. The parser counts one unit as Math.idiv(15000, tempo).
    //   That works out exactly at tempo 100, 125 and 150.
    //
    // That is why the gap between the voices stays small and does not grow.

    // Title theme in D minor, 8 bars of 16 units at tempo 125, which makes 15.36 s per round. Dotted pickups, an octave
    // jump to D5 in the third bar and a G sharp 4, the tritone over the D bass. Bar 7 steps down from F5 through E5 and
    // D5 to C sharp 5.
    const MUSIC_TITLE = new music.Melody("~2 @6,30,150,90 -125"
        + " D4:3 D4:1 A4:6 A#4:2 A4:4"
        + " G4:3 G4:1 F4:6 E4:2 D4:4"
        + " D5:6 A4:2 F4:4 G#4:4"
        + " A4:12 R:4"
        + " F4:3 F4:1 C5:6 A#4:2 A4:4"
        + " D5:3 D5:1 C5:6 A#4:2 A4:4"
        + " F5:4 E5:4 D5:4 C#5:4"
        + " D5:8 A4:4 D4:4")
    // The base for it: a fifth bass in the same dotted pulse, triangle instead of sawtooth, so it carries without
    // scratching. Every bar has 3 + 1 + 4 + 3 + 1 + 4 = 16 units, exactly as many as the melody. The lowest note is A2
    // (110 Hz); below that the small speaker gets thin.
    const MUSIC_TITLE_BASS = new music.Melody("~1 @2,22,140,60 -125"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 D4:4"
        + " A2:3 A2:1 A2:4 A2:3 A2:1 E3:4"
        + " F3:3 F3:1 F3:4 F3:3 F3:1 C4:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A3:4"
        + " A#2:3 A#2:1 A#2:4 A2:3 A2:1 A2:4"
        + " D3:3 D3:1 D3:4 D3:3 D3:1 A2:4")

    // Background for the intro: Phrygian on D, with the half-step clashes E flat-D and B flat-A. A heartbeat pulse of
    // tone and rest, 8 bars of 16 units at tempo 100, which makes 19.2 s per round. So long that you hardly
    // notice the repeat.
    const MUSIC_INTRO = new music.Melody("~1 @2,90,60,150 -100"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " D3:2 R:2 D3:2 R:2 C3:2 R:2 D3:2 R:2"
        + " A#2:2 R:2 A#2:2 R:2 A2:2 R:2 A2:2 R:2"
        + " D3:2 R:2 D3:2 R:2 D3:2 R:2 D#3:2 R:2"
        + " F3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " G3:2 R:2 F3:2 R:2 D#3:2 R:2 D3:2 R:2"
        + " A2:2 R:2 A2:2 R:2 A#2:2 R:2 A2:2 R:2")
    // Above it only three accents in 19 seconds, almost everything is rest. A soft attack and a long release make them
    // sound as if they come from far away. This voice also counts 128 units.
    const MUSIC_INTRO_HIGH = new music.Melody("~16 @25,140,55,320 -100"
        + " R:16 R:16"
        + " R:8 A5:4 R:4"
        + " R:16"
        + " R:12 A#5:2 A5:2"
        + " R:16"
        + " R:8 D#5:4 D5:4"
        + " R:16")

    // Victory music for the ending: D major, the same tonic as the D minor title theme, only brightened. 4 bars of 16
    // units at tempo 100, which makes 9.6 s. Sawtooth as a fanfare, the peak B5 comes in the third bar, and then it
    // comes back down to the note D5 where it started.
    const MUSIC_VICTORY = new music.Melody("~2 @5,25,175,110 -100"
        + " D5:3 D5:1 F#5:4 A5:8"
        + " A5:2 G5:2 F#5:4 E5:4 D5:4"
        + " E5:3 E5:1 G5:4 B5:8"
        + " A5:6 F#5:2 D5:8")
    // Striding accompaniment bass in quarter notes, D, D, G, A/D: a whole cadence. 64 units, exactly as long
    // as the fanfare.
    const MUSIC_VICTORY_BASS = new music.Melody("~1 @3,25,150,90 -100"
        + " D3:4 D3:4 A3:4 D3:4"
        + " D3:4 D3:4 A2:4 A2:4"
        + " G3:4 G3:4 D3:4 D3:4"
        + " D3:4 D3:4 A2:4 D3:4")

    // Points to the background music that is playing right now, so that we can stop it on purpose without cutting off
    // the short noises (music.stopAllSounds would stop everything). currentSecondVoice is the lower voice. It may stay
    // null, and then the piece sounds with one voice (like the loop in the dungeon).
    let currentMusic: music.Melody = null
    let currentSecondVoice: music.Melody = null

    // Starts the background music. Both Melody objects play on here in threads of their own, and the caller is not held
    // up. For one-voice music pass null as the second voice.
    function startMusic(mainVoice: music.Melody, mainVolume: number,
        secondVoice: music.Melody, secondVolume: number) {
        stopMusic()
        currentMusic = mainVoice
        currentSecondVoice = secondVoice
        // First the lower voice, then the melody: the tiny head start of the bass is not noticed, the other way round
        // the melody would audibly lag behind.
        if (currentSecondVoice != null) {
            currentSecondVoice.loop(secondVolume)
        }
        currentMusic.loop(mainVolume)
    }

    // Plays a short sound in the background. Returns at once, the game carries on without a stutter.
    function playShort(melody: music.Melody, volume: number) {
        melody.play(volume)
    }

    // ---- Fighting ----
    export function playFireball() {
        playShort(SOUND_FIREBALL, VOLUME_QUIET)
    }
    export function playHit() {
        playShort(SOUND_HIT, VOLUME_MEDIUM)
    }
    export function playBlock() {
        playShort(SOUND_BLOCK, VOLUME_MEDIUM)
    }
    export function playEnemyPuff() {
        playShort(SOUND_ENEMY_PUFF, VOLUME_MEDIUM)
    }
    export function playBossPuff() {
        playShort(SOUND_BOSS_PUFF, VOLUME_FULL)
    }
    export function playHeroHit() {
        playShort(SOUND_HERO_HIT, VOLUME_FULL)
    }

    // ---- Items ----
    export function playKey() {
        playShort(SOUND_KEY, VOLUME_MEDIUM)
    }
    export function playHeart() {
        playShort(SOUND_HEART, VOLUME_MEDIUM)
    }
    export function playCoin() {
        playShort(SOUND_COIN, VOLUME_QUIET)
    }
    export function playTorch() {
        playShort(SOUND_TORCH, VOLUME_MEDIUM)
    }
    export function playChest() {
        playShort(SOUND_CHEST, VOLUME_FULL)
    }

    // ---- Intro ----
    export function playStudio() {
        playShort(SOUND_STUDIO, VOLUME_FULL)
    }
    export function playThunder() {
        playShort(SOUND_THUNDER, VOLUME_FULL)
    }
    export function playWhoosh() {
        playShort(SOUND_WHOOSH, VOLUME_MEDIUM)
    }
    export function playApproach() {
        playShort(SOUND_APPROACH, VOLUME_MEDIUM)
    }
    export function playImpact() {
        playShort(SOUND_IMPACT, VOLUME_FULL)
    }
    export function playFanfare() {
        playShort(SOUND_FANFARE, VOLUME_FULL)
    }
    // The logo stands: two voices at the same time, both 2.0 s long.
    export function playLogo() {
        playShort(SOUND_LOGO_LOW, VOLUME_BASS)
        playShort(SOUND_LOGO_HIGH, VOLUME_TITLE)
    }

    // ---- Flow ----
    export function playFloorCleared() {
        playShort(SOUND_FLOOR_CLEARED, VOLUME_FULL)
    }
    export function playBossAppears() {
        playShort(SOUND_BOSS_APPEARS, VOLUME_FULL)
    }
    export function playDoorClosed() {
        playShort(SOUND_DOOR, VOLUME_FULL)
    }
    export function playGameOver() {
        playShort(SOUND_GAME_OVER, VOLUME_FULL)
    }
    // Before the coronation: time slows down, bells from far away.
    export function playBell() {
        playShort(SOUND_BELL, VOLUME_MEDIUM)
    }
    // The crown sits on the hero's head.
    export function playCrown() {
        playShort(SOUND_CROWN, VOLUME_FULL)
    }
    // The ending: the title theme, resolved into major.
    export function playEnding() {
        playShort(SOUND_ENDING, VOLUME_FULL)
    }

    // ---- Music ----
    // Title theme, two voices, in an endless loop.
    export function startTitleMusic() {
        startMusic(MUSIC_TITLE, VOLUME_TITLE, MUSIC_TITLE_BASS, VOLUME_BASS)
    }

    // Background for the intro. It carries the story and the tutorial boards, Intro.closeStage() stops it.
    export function startIntroMusic() {
        startMusic(MUSIC_INTRO, VOLUME_MUSIC, MUSIC_INTRO_HIGH, VOLUME_FAR)
    }

    // Victory music in the ending. It plays until the first ending card, where Ending.play stops it.
    export function startVictoryMusic() {
        startMusic(MUSIC_VICTORY, VOLUME_TITLE, MUSIC_VICTORY_BASS, VOLUME_BASS)
    }

    // Loop in the dungeon: a deep, throbbing ostinato in D minor. Up to floor 9 the tempo gets faster with every floor
    // (100 + 12 per floor, at most 200). From floor 4 a crooked answer phrase with G sharp is added (a tritone to D).
    // On purpose bare, because the music plays all the time.
    export function startDungeonMusic(floorNumber: number) {
        let bpm: number;
        let pattern: string;
        stopMusic()
        bpm = 100 + floorNumber * 12
        if (bpm > 200) {
            bpm = 200
        }
        pattern = "~17 @4,2,80,70 -" + convertToText(bpm) + " D3:2 R:2 D3:2 A3:2 D3:2 R:2 F3:2 E3:2"
        if (floorNumber >= 4) {
            pattern = pattern + " G#3:2 A3:2 G#3:2 D3:4"
        }
        startMusic(new music.Melody(pattern), VOLUME_MUSIC, null, 0)
    }

    // Stops both voices of the background music. Short noises that are just fading out may play to the end.
    export function stopMusic() {
        if (currentMusic != null) {
            currentMusic.stop()
            currentMusic = null
        }
        if (currentSecondVoice != null) {
            currentSecondVoice.stop()
            currentSecondVoice = null
        }
    }
}
