/**
 * ----------
 * INIT CODE
 * ----------
 */
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 300
    export const ARCADE_SCREEN_HEIGHT = 300
}
namespace SpriteKind {
    export const Appearing = SpriteKind.create()
    export const Disappearing = SpriteKind.create()
    export const InvisAnchor = SpriteKind.create()
    export const Level1Enemy = SpriteKind.create()
    export const Level2Enemy = SpriteKind.create()
    export const Level3Enemy = SpriteKind.create()
    export const Level4Enemy = SpriteKind.create()
    export const Level5Enemy = SpriteKind.create()
    export const Level6Enemy = SpriteKind.create()
    export const Level7Enemy = SpriteKind.create()
    export const Level8Enemy = SpriteKind.create()
    export const Level8EnemySpawner = SpriteKind.create()
    export const Wall = SpriteKind.create()
}
const enum DodgeDistances {
    Close = 27,
    Medium = 30,
    Far = 33,
    SuperFar = 40
}
music.stopAllSounds()
let activeEnemies: Sprite[] = []
let level = 0
let updateTimer = false
let helpSelected = false
let dashing = false
let invulnerable = false
let totalDashesUsed = 0
let mySprite = sprites.create(assets.image`player`, SpriteKind.Player)
controller.moveSprite(mySprite)
mySprite.setBounceOnWall(true)
mySprite.setPosition(150, 250)
mySprite.z = 5
let pointer = sprites.create(assets.image`pointer`, SpriteKind.Food)
pointer.setFlag(SpriteFlag.Invisible, true)
pointer.z = 9
let dodgeRadialIndicator = sprites.create(assets.image`dodgeRadialIndicator`, SpriteKind.Food)
dodgeRadialIndicator.setFlag(SpriteFlag.Invisible, true)
dodgeRadialIndicator.z = 8
let dodgeHorizontalIndicator = sprites.create(assets.image`dodgeHorizontalIndicator`, SpriteKind.Food)
dodgeHorizontalIndicator.setFlag(SpriteFlag.Invisible, true)
dodgeHorizontalIndicator.z = 8
let dodgeVerticalIndicator = sprites.create(assets.image`dodgeVerticalIndicator`, SpriteKind.Food)
dodgeVerticalIndicator.setFlag(SpriteFlag.Invisible, true)
dodgeVerticalIndicator.z = 8
spriteutils.addEventHandler(spriteutils.UpdatePriorityModifier.After, spriteutils.UpdatePriority.Update, function () {
    pointer.setPosition(mySprite.x, mySprite.y)
    dodgeRadialIndicator.setPosition(mySprite.x, mySprite.y)
    dodgeHorizontalIndicator.setPosition(mySprite.x, mySprite.y)
    dodgeVerticalIndicator.setPosition(mySprite.x, mySprite.y)
})
let time = fancyText.create("0.00", 0, 0, fancyText.gothic_large)
time.setPosition(150, 15)
time.setFlag(SpriteFlag.RelativeToCamera, true)
time.z = 10
profilelife.setMaxLife(20)
profilelife.setFilledLifeImage(assets.image`filledLife`)
profilelife.setEmptyLifeImage(assets.image`emptyLife`)
profilelife.setBackgroundBorder(15, 1)
info.setLife(20)
info.showScore(false)
scene.setBackgroundColor(15)
let dashPrompt = fancyText.create("Press A to dash!", 100, 0, fancyText.geometric_sans_9)
dashPrompt.setPosition(999, 999)
dashPrompt.setFlag(SpriteFlag.RelativeToCamera, true)
dashPrompt.z = 10
timer.background(startGame)

/**
 * -------------------------
 * NECESSARY GAME FUNCTIONS
 * -------------------------
 */

// full game sequencing
function startGame() {
    let intro = sprites.create(assets.image`intro`, SpriteKind.Food)
    let helpPrompt = fancyText.create("Press B for help", 0, 0, fancyText.geometric_sans_9)
    helpPrompt.setPosition(150, 80)
    helpPrompt.setFlag(SpriteFlag.RelativeToCamera, true)
    helpPrompt.z = 10

    loops.pause(2000)
    
    sprites.destroy(intro)
    sprites.destroy(helpPrompt)
    dashPrompt.setPosition(250, 10)
    updateTimer = true

    if (helpSelected) return;
    timer.background(spawnLevel1Enemies)
    music.play(music.createSong(assets.song`theme1`), music.PlaybackMode.UntilDone)
    
    timer.background(spawnLevel2Enemies)
    music.play(music.createSong(assets.song`theme2`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel3Enemies)
    music.play(music.createSong(assets.song`theme3`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel4Enemies)
    music.play(music.createSong(assets.song`theme4`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel5Enemies)
    music.play(music.createSong(assets.song`theme5`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel6Enemies)
    music.play(music.createSong(assets.song`theme6`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel7Enemies)
    music.play(music.createSong(assets.song`theme7`), music.PlaybackMode.UntilDone)

    timer.background(spawnLevel8Enemies)
    music.play(music.createSong(assets.song`theme8`), music.PlaybackMode.UntilDone)
}

// help screen
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if(level != 0) return;
    helpSelected = true
    music.stopAllSounds()
    music.play(music.createSong(assets.song`helpTheme`), music.PlaybackMode.LoopingInBackground)
    game.setDialogFrame(assets.image`dialogFrame`)
    game.setDialogTextColor(1)
    game.showLongText("Survive for 2 minutes, but watch out! Every 15 seconds the music and obstacles change! Lose all lives and it's GAME OVER. Press A (or spacebar) to dash through obstacles. The final score is calculated by (# of dodges) X (remaining lives). The ranking is determined by the number of lives remaining.", DialogLayout.Center)
    game.reset()
})

// dash controls
controller.A.onEvent(ControllerButtonEvent.Pressed, dash)
controller.A.onEvent(ControllerButtonEvent.Repeated, dash)

function dash() {
    if (invulnerable) return;
    timer.throttle("dash", 1000, function () {
        totalDashesUsed++
        music.play(music.createSoundEffect(WaveShape.Sawtooth, 5000, 1, 255, 255, 200, SoundExpressionEffect.Warble, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        controller.moveSprite(mySprite, 300, 300)
        mySprite.setImage(assets.image`playerDark`)
        dashing = true
        invulnerable = true
        dashPrompt.setFlag(SpriteFlag.Invisible, true)
        timer.after(250, function () {
            controller.moveSprite(mySprite, 100, 100)
            mySprite.setImage(assets.image`player`)
            dashing = false
        })
        timer.after(350, function () {
            invulnerable = false
            animation.runImageAnimation(mySprite, assets.animation`refillDash`, 50, false)
        })
        timer.after(1000, function () {
            dashPrompt.setFlag(SpriteFlag.Invisible, false)
        })
    })
}

// check for player dodging an enemy
game.onUpdate(function () {
    for (let enemy of activeEnemies) {
        let close = false
        let wasClose = sprites.readDataBoolean(enemy, "playerClose")
        let dodgeImage: Sprite = dodgeRadialIndicator

        // if the enemy is a wall then close range is purely horizontal / vertical
        if (sprites.readDataBoolean(enemy, "isWall")) {
            if (sprites.readDataBoolean(enemy, "isHorizontal")) {
                close = Math.abs(mySprite.y - enemy.y) < sprites.readDataNumber(enemy, "dodgeRange")
                dodgeImage = dodgeHorizontalIndicator
            }
                
            else { // Vertical
                close = Math.abs(mySprite.x - enemy.x) < sprites.readDataNumber(enemy, "dodgeRange")
                dodgeImage = dodgeVerticalIndicator
            }
                
        }
        // otherwise the dodge range is radial
        else {
            close = spriteutils.distanceBetween(mySprite, enemy) < sprites.readDataNumber(enemy, "dodgeRange")
            dodgeImage = dodgeRadialIndicator
        }
        if (close && !invulnerable && !sprites.readDataBoolean(enemy, "playerClose")) {
            sprites.setDataBoolean(enemy, "playerClose", true)
            info.changeScoreBy(1)
            dodgeImage.setFlag(SpriteFlag.Invisible, false)
            music.play(music.createSoundEffect(WaveShape.Noise, 4556, 1, 255, 255, 50, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
            timer.after(50, function () {
                dodgeImage.setFlag(SpriteFlag.Invisible, true)
            })
        }
        else if (!close && wasClose) {
            sprites.setDataBoolean(enemy, "playerClose", false)
        }
    }
})

// take damage from enemy sprites
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level1Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level2Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level3Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level4Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level5Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level6Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level7Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Level8Enemy, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Wall, function (sprite, otherSprite) {
    takeDamage(otherSprite)
})

function takeDamage(otherSprite: Sprite) {
    if (invulnerable) return;
    timer.throttle("takeDamage", 500, function () {
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.InBackground)
        scene.cameraShake(6, 250)
        info.changeLifeBy(-1)
        if (!sprites.readDataBoolean(otherSprite, "isWall")) {
            sprites.destroy(otherSprite)
        }

        const p = palette.defaultPalette();
        for (let i = 0; i < p.length - 1; i++) {
            p.setColor(i, color.rgb(0, 0, 0));
        }
        p.setColor(15, color.rgb(255, 0, 0))
        palette.setColors(p)
        pointer.setFlag(SpriteFlag.Invisible, false)

        timer.after(400, function () {
            palette.reset()
            pointer.setFlag(SpriteFlag.Invisible, true)
        })
    })
}

// on death
info.onLifeZero(function () {
    game.reset()
})

/**
 * --------
 * VISUALS
 * --------
 */

// update time UI
game.onUpdate(function () {
    if (updateTimer) fancyText.setText(time, Math.roundWithPrecision((game.runtime() / 1000) - 2, 2).toString())
})

// dash effect
let dashEffect = extraEffects.createCustomSpreadEffectData(
    [1, 13, 11, 12],
    true,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Cloud),
    extraEffects.createPercentageRange(0, 0),
    extraEffects.createPercentageRange(0, 100),
    extraEffects.createTimeRange(600, 1200),
    30,
    30,
    extraEffects.createPercentageRange(-100, 100),
    0,
    0,
    1000
)
game.onUpdateInterval(100, function () {
    if (dashing) extraEffects.createSpreadEffectOnAnchor(mySprite, dashEffect, 100)
})

// spawn effects
let lv1SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [2],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv2SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [4],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv3SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [5],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv4SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [7],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv5SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [6],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv6SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [8],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv7SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [10],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)
let lv8SpawnEffect = extraEffects.createCustomSpreadEffectData(
    [3],
    false,
    extraEffects.createPresetSizeTable(ExtraEffectPresetShape.Twinkle),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createPercentageRange(50, 100),
    extraEffects.createTimeRange(200, 400),
    0,
    0,
    extraEffects.createPercentageRange(50, 100),
    0,
    0,
    200
)

// custom sprite destroy animation
function fancyDestroySprite(sprite: Sprite) {
    activeEnemies.removeElement(sprite)
    let dyingSprite = sprites.create(sprite.image, SpriteKind.Disappearing)
    dyingSprite.setPosition(sprite.x, sprite.y)
    dyingSprite.scale = sprite.scale
    let scaleTenth = dyingSprite.scale / 10
    timer.background(function () {
        for (let i = 0; i < 10; i++) {
            dyingSprite.changeScale(-scaleTenth)
            loops.pause(30)
        }
        sprites.destroy(dyingSprite)
    })
}
// custom wall destroy animation
function fancyDestroyWall(sprite: Sprite) {
    activeEnemies.removeElement(sprite)
    let dyingWall = sprites.create(sprite.image, SpriteKind.Disappearing)
    dyingWall.setScale(sprite.scale)
    dyingWall.setPosition(sprite.x, sprite.y)
    timer.background(function () {
        if (sprites.readDataBoolean(sprite, "isHorizontal")) {
            for (let i = 0; i < 5; i++) {
                dyingWall.sy -= 2
                loops.pause(30)
            }
        } else {
            for (let i = 0; i < 5; i++) {
                dyingWall.sx -= 2
                loops.pause(30)
            }
        }
        sprites.destroy(dyingWall)
    })
}

/**
 * -----------------
 * CODE FOR LEVEL 1 
 * 0.0-15.0
 * -----------------
 */

// call fancy destroy
sprites.onDestroyed(SpriteKind.Wall, function (wall: Sprite) {
    fancyDestroyWall(wall)
})
// create wall
function createWall(coordinate: number, isHorizontal: boolean) {
    timer.background(function() {
        let wall = sprites.create(assets.image`invis`, SpriteKind.Appearing)
        wall.scale = 10
        wall.z = -1
        wall.lifespan = 2000
        sprites.setDataBoolean(wall, "isWall", true)
        sprites.setDataBoolean(wall, "isHorizontal", isHorizontal)
        if (isHorizontal) {
            wall.setImage(assets.image`wallHorizontalPrev`)
            wall.setPosition(150, coordinate)
            wall.sy = 0
            for (let i = 0; i < 10; i++) {
                wall.sy += 1
                loops.pause(50)
            }
        }
        else {
            wall.setImage(assets.image`wallVerticalPrev`)
            wall.setPosition(coordinate, 150)
            wall.sx = 0
            for (let i = 0; i < 10; i++) {
                wall.sx += 1
                loops.pause(50)
            }
        }
        // 500ms has passed from scaling up the preview
        pause(200)
        if (isHorizontal)
            animation.runImageAnimation(wall, assets.animation`wallHorizontal`, 50, false)
        else 
            animation.runImageAnimation(wall, assets.animation`wallVertical`, 50, false)
        pause(400)
        // 600ms has passed from preview animating
        scene.cameraShake(6, 100)
        wall.setKind(SpriteKind.Wall)
        activeEnemies.push(wall)
        sprites.setDataNumber(wall, "dodgeRange", DodgeDistances.Medium)
        // takes 1100ms to become active, lasts 900ms since lifespan is 2000ms
    })
}
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level1Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLevel1Enemy() {
    let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level1Enemy)
    animation.runImageAnimation(myEnemy, assets.animation`enemy1`, 100, false)
    myEnemy.z = 1
    do {
        myEnemy.setPosition(randint(10, 290), randint(10, 290))
    }
    while (spriteutils.distanceBetween(mySprite, myEnemy) < 70)
    myEnemy.follow(mySprite, 100, 30)
    myEnemy.lifespan = 5000
    activeEnemies.push(myEnemy)
    sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Close)
    extraEffects.createSpreadEffectOnAnchor(myEnemy, lv1SpawnEffect, 100, 20)
}
// spawn enemies short interval (level 1 & 8 only)
game.onUpdateInterval(936, function () {
    if (!(level == 1 || level == 8)) return;
    createLevel1Enemy()
})
function spawnLevel1Enemies() {
    level = 1
    
    // walls
    loops.pause(1875)
    loops.pause(1875)
    loops.pause(1875)
    loops.pause(1875)
    for (let i = 0; i < 3; i++) {
        let firstHorizontal = Math.percentChance(50)
        createWall(randint(30, 270), firstHorizontal)
        loops.pause(703)
        createWall(randint(30, 270), !firstHorizontal)
        loops.pause(1172)
    }
    createWall(180, true)
}



/**
 * -----------------
 * CODE FOR LEVEL 2
 * 15.0-30.0
 * -----------------
 */

// call fancy destroy
sprites.onDestroyed(SpriteKind.Level2Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function fancyDestroySpritesOf(level: any) {
    for (let enemy of sprites.allOfKind(level)) {
        sprites.destroy(enemy)
    }
}
function createEnemyCluster() {
    let center = sprites.create(assets.image`invis`, SpriteKind.InvisAnchor)
    do {
        center.setPosition(randint(60, 240), randint(60, 240))
    }
    while (spriteutils.distanceBetween(mySprite, center) < 100)
    for (let i = 0; i < 6; i++) {
        let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level2Enemy)
        animation.runImageAnimation(myEnemy, assets.animation`enemy2`, 100, false)
        myEnemy.setPosition(center.x + randint(-50, 50), center.y + randint(-50, 50))
        myEnemy.z = 2
        activeEnemies.push(myEnemy)
        sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Close)
        extraEffects.createSpreadEffectOnAnchor(myEnemy, lv2SpawnEffect, 100, 20)
    }
}
function allEnemiesFollowPlayer(level: any, speed: number, rotation: number) {
    for (let enemy of sprites.allOfKind(level)) {
        enemy.follow(mySprite, speed, rotation)
    }
}
// spawn enemies long interval (level 2 & 6 only)
game.onUpdateInterval(1875, function () {
    if (!(level == 2 || level == 6)) return;
    createLevel1Enemy();
})
function spawnLevel2Enemies() {
    level = 2

    // cherries
    for (let i = 0; i < 4; i++) {
        createWall(randint(30, 270), Math.percentChance(50))
        scene.cameraShake(6, 200)
        createEnemyCluster()
        loops.pause(1172)
        scene.cameraShake(6, 200)
        createEnemyCluster()
        loops.pause(703)
        allEnemiesFollowPlayer(SpriteKind.Level2Enemy, 250, 30)
        loops.pause(1875)
        fancyDestroySpritesOf(SpriteKind.Level2Enemy)
    }
}



/**
 * -----------------
 * CODE FOR LEVEL 3
 * ~30.0-45.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level3Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function allEnemiesSetLifespan(level: any, span: number) {
    for (let enemy of sprites.allOfKind(level)) {
        enemy.lifespan = span
    }
}
function createLevel3Enemy() {
    let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level3Enemy)
    animation.runImageAnimation(myEnemy, assets.animation`enemy3`, 100, false)
    myEnemy.z = 1
    myEnemy.scale = 2
    do {
        myEnemy.setPosition(randint(20, 280), randint(20, 280))
    }
    while (spriteutils.distanceBetween(mySprite, myEnemy) < 70)
    activeEnemies.push(myEnemy)
    sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Far)
    extraEffects.createSpreadEffectOnAnchor(myEnemy, lv3SpawnEffect, 100, 40)
}
function spawnLevel3Enemies() {
    level = 3

    // walls
    timer.background(function() {
        for (let i = 0; i < 7; i++) {
            let firstHorizontal = Math.percentChance(50)
            createWall(randint(30, 270), firstHorizontal)
            loops.pause(703)
            createWall(randint(30, 270), !firstHorizontal)
            loops.pause(1172)
        }
        createWall(60, false)
    })

    // kitties
    for (let i = 0; i < 4; i++) {
        createLevel3Enemy()
        loops.pause(468)
        createLevel3Enemy()
        loops.pause(468)
        createLevel3Enemy()
        loops.pause(468)
        createLevel3Enemy()
        loops.pause(468)
        createLevel3Enemy()
        loops.pause(468)
        createLevel3Enemy()
        loops.pause(705)
        createLevel3Enemy()
        loops.pause(470)
        createLevel3Enemy()
        loops.pause(235)
        allEnemiesFollowPlayer(SpriteKind.Level3Enemy, 100, 20)
        allEnemiesSetLifespan(SpriteKind.Level3Enemy, 3000)
    }
    loops.pause(235)
    fancyDestroySpritesOf(SpriteKind.Level3Enemy)
}



/**
 * -----------------
 * CODE FOR LEVEL 4
 * ~45.0-60.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level4Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLevel4Enemy() {
    let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level4Enemy)
    animation.runImageAnimation(myEnemy, assets.animation`enemy4`, 100, false)
    myEnemy.z = 1
    do {
        myEnemy.setPosition(randint(10, 290), randint(10, 290))
    }
    while (spriteutils.distanceBetween(mySprite, myEnemy) < 100)
    myEnemy.follow(mySprite, 120)
    myEnemy.lifespan = 2000
    activeEnemies.push(myEnemy)
    sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Close)
    extraEffects.createSpreadEffectOnAnchor(myEnemy, lv4SpawnEffect, 100, 20)
    timer.after(100, function() {
        let initX = myEnemy.vx
        let initY = myEnemy.vy
        myEnemy.follow(mySprite, 0)
        myEnemy.setVelocity(initX, initY)
    })
}
function spawnLevel4Enemies() {    
    level = 4

    // explodeys
    timer.background(function() {
        for (let i = 0; i < 4; i++) {
            for (let i = 0; i < 8; i++) {
                createLevel4Enemy()
                loops.pause(234)
            }
            loops.pause(1878)
        }
    })

    // walls
    loops.pause(775)
    let startCoord = 10
    let offset = 30
    for (let i = 0; i < 8; i++) {
        createWall(startCoord + i * offset, false)
        loops.pause(234)
    }
    loops.pause(1878)
    startCoord = 290
    offset = -30
    for (let i = 0; i < 8; i++) {
        createWall(startCoord + i * offset, true)
        loops.pause(234)
    }
    loops.pause(1878)
    startCoord = 10
    offset = 30
    for (let i = 0; i < 8; i++) {
        createWall(startCoord + i * offset, true)
        if (i == 2 || i == 5 || i == 7)
            createWall(randint(30, 270), false)
        loops.pause(234)
    }
    loops.pause(1878)
    startCoord = 290
    offset = -30
    for (let i = 0; i < 8; i++) {
        createWall(startCoord + i * offset, false)
        if (i == 2 || i == 5 || i == 7)
            createWall(randint(30, 270), true)
        loops.pause(234)
    }
}



/**
 * -----------------
 * CODE FOR LEVEL 5
 * ~60.0-75.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level5Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLevel5Enemy() {
    let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level5Enemy)
    myEnemy.z = 1
    myEnemy.scale = 2
    myEnemy.lifespan = 4300
    myEnemy.y = randint(20, 280)
    activeEnemies.push(myEnemy)
    sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Far)
    extraEffects.createSpreadEffectOnAnchor(myEnemy, lv5SpawnEffect, 100, 40)

    if (Math.percentChance(50)) { // go left
        myEnemy.x = 272
        animation.runImageAnimation(myEnemy, assets.animation`enemy5left`, 100, false)
        myEnemy.ax = -30
    } else { // go right
        myEnemy.x = 2
        animation.runImageAnimation(myEnemy, assets.animation`enemy5right`, 100, false)
        myEnemy.ax = 30
    }
}

function spawnLevel5Enemies() {
    level = 5

    // explodeys
    timer.background(function () {
        for (let i = 0; i < 4; i++) {
            for (let i = 0; i < 8; i++) {
                createLevel4Enemy()
                loops.pause(234)
            }
            loops.pause(1878)
        }
    })

    // walls
    timer.background(function () {
        loops.pause(775)
        for (let i = 0; i < 4; i++) {
            createWall(randint(30, 270), Math.percentChance(50))
            loops.pause(468)
        }
        for (let i = 0; i < 3; i++) {
            loops.pause(1878)
            for (let i = 0; i < 4; i++) {
                createWall(randint(30, 270), Math.percentChance(50))
                loops.pause(468)
            }
        }
    })

    // cars
    for (let i = 0; i < 2; i++) {
        // 1875 ms is full measure so 234.375 is eighth measure
        // (every eight 234s add a 237)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        loops.pause(237)

        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(237)

        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        loops.pause(234)
        loops.pause(237)

        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(234)
        createLevel5Enemy()
        loops.pause(237)
    }
    fancyDestroySpritesOf(SpriteKind.Level5Enemy)
}



/**
 * -----------------
 * CODE FOR LEVEL 6
 * ~75.0-90.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level6Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLineOfLevel6Enemy(count: number, startY: number, startLeft: boolean) {
    for (let i = 0; i < count; i++) {
        let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level6Enemy)
        myEnemy.z = 5
        myEnemy.scale = 2
        myEnemy.lifespan = 2000
        myEnemy.y = startY + Math.sin(game.runtime() / 150) * 10
        activeEnemies.push(myEnemy)
        sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Far)
        if (startLeft) { // go right
            myEnemy.x = 2
            myEnemy.vx = 130
            animation.runImageAnimation(myEnemy, assets.animation`enemy6right`, 100, false)
        } else { // go left
            myEnemy.x = 272
            myEnemy.vx = -130
            animation.runImageAnimation(myEnemy, assets.animation`enemy6left`, 100, false)
        }
        extraEffects.createSpreadEffectOnAnchor(myEnemy, lv6SpawnEffect, 100, 40)
        loops.pause(58)
    }
}
function spawnLevel6Enemies() {
    level = 6

    // walls
    timer.background(function() {
        for (let i = 0; i < 4; i++) {
            createWall(randint(30, 270), Math.percentChance(50))
            loops.pause(1875)
        }
        for (let i = 0; i < 3; i++) {
            createWall(randint(30, 270), false)
            loops.pause(703)
            createWall(randint(30, 270), false)
            loops.pause(1172)
        }
        createWall(randint(30, 270), false)
        loops.pause(351)
        createWall(randint(30, 270), false)
        loops.pause(117)
        createWall(randint(30, 270), false)
        loops.pause(117)
        createWall(randint(30, 270), false)
    })
    
    // fish
    timer.background(function () {
        createLineOfLevel6Enemy(32, 240, true)
    })
    loops.pause(1878)
    timer.background(function () {
        createLineOfLevel6Enemy(32, 210, false)
    })
    loops.pause(1878)
    timer.background(function () {
        createLineOfLevel6Enemy(32, 110, true)
    })
    loops.pause(1878)
    timer.background(function () {
        createLineOfLevel6Enemy(32, 170, false)
    })
    loops.pause(1878)
    timer.background(function () {
        createLineOfLevel6Enemy(16, 140, true)
    })
    loops.pause(939)
    timer.background(function () {
        createLineOfLevel6Enemy(16, 190, false)
    })
    loops.pause(939)
    timer.background(function () {
        createLineOfLevel6Enemy(16, 100, true)
    })
    loops.pause(939)
    timer.background(function () {
        createLineOfLevel6Enemy(16, 60, false)
    })
    loops.pause(939)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 280, true)
    })
    loops.pause(469)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 170, false)
    })
    loops.pause(470)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 100, true)
    })
    loops.pause(469)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 210, false)
    })
    loops.pause(470)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 30, true)
    })
    loops.pause(469)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 100, false)
    })
    loops.pause(470)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 240, true)
    })
    loops.pause(469)
    timer.background(function () {
        createLineOfLevel6Enemy(8, 150, false)
    })
    loops.pause(470)
    fancyDestroySpritesOf(SpriteKind.Level6Enemy)
    fancyDestroySpritesOf(SpriteKind.Level1Enemy)
}



/**
 * -----------------
 * CODE FOR LEVEL 7
 * ~90.0-105.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level7Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLevel7Enemy() {
    let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level7Enemy)
    animation.runImageAnimation(myEnemy, assets.animation`enemy7`, 100, false)
    myEnemy.z = 1
    do {
        myEnemy.setPosition(randint(20, 280), randint(20, 280))
    }
    while (spriteutils.distanceBetween(mySprite, myEnemy) < 70)
    activeEnemies.push(myEnemy)
    sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.Far)
    extraEffects.createSpreadEffectOnAnchor(myEnemy, lv7SpawnEffect, 100, 20)
}
function spawnLevel7Enemies() {
    level = 7

    // burgers
    timer.background(function () {
        for (let i = 0; i < 4; i++) {
            createLevel7Enemy()
            loops.pause(819)
            createLevel7Enemy()
            loops.pause(117)
            createLevel7Enemy()
            loops.pause(351)
            createLevel7Enemy()
            loops.pause(351)
            createLevel7Enemy()
            loops.pause(117)
            loops.pause(117)
            createLevel7Enemy()
            loops.pause(819)
            createLevel7Enemy()
            loops.pause(117)
            createLevel7Enemy()
            loops.pause(351)
            createLevel7Enemy()
            loops.pause(117)
            createLevel7Enemy()
            loops.pause(117)
            loops.pause(117)
            createLevel7Enemy()
            loops.pause(117)
            loops.pause(117)
            loops.pause(6)
            fancyDestroySpritesOf(SpriteKind.Level7Enemy)
        }
        fancyDestroySpritesOf(SpriteKind.Level7Enemy)
    })
    // cherries
    timer.background(function () {
        for (let i = 0; i < 4; i++) {
            createWall(randint(30, 270), Math.percentChance(50))
            scene.cameraShake(6, 200)
            createEnemyCluster()
            loops.pause(1172)
            scene.cameraShake(6, 200)
            createEnemyCluster()
            loops.pause(703)
            allEnemiesFollowPlayer(SpriteKind.Level2Enemy, 250, 30)
            loops.pause(1875)
            fancyDestroySpritesOf(SpriteKind.Level2Enemy)
        }
    })
    

    // kitties
    timer.background(function () {
        for (let i = 0; i < 4; i++) {
            createLevel3Enemy()
            loops.pause(468)
            createLevel3Enemy()
            loops.pause(468)
            createLevel3Enemy()
            loops.pause(468)
            createLevel3Enemy()
            loops.pause(468)
            allEnemiesFollowPlayer(SpriteKind.Level3Enemy, 100, 20)
            allEnemiesSetLifespan(SpriteKind.Level3Enemy, 3000)
            loops.pause(1875)
        }
        fancyDestroySpritesOf(SpriteKind.Level3Enemy)
    })

    // explodeys
    timer.background(function () {
        for (let i = 0; i < 4; i++) {
            for (let i = 0; i < 8; i++) {
                createLevel4Enemy()
                loops.pause(234)
            }
            loops.pause(1878)
        }
    })

    // walls
    timer.background(function () {
        loops.pause(775)
        let startCoord = 10
        let offset = 30
        for (let i = 0; i < 4; i++) {
            createWall(startCoord + i * offset, false)
            loops.pause(468)
        }
        loops.pause(1878)
        startCoord = 290
        offset = -30
        for (let i = 0; i < 4; i++) {
            createWall(startCoord + i * offset, true)
            loops.pause(468)
        }
        loops.pause(1878)
        startCoord = 10
        offset = 30
        for (let i = 0; i < 4; i++) {
            createWall(startCoord + i * offset, true)
            loops.pause(468)
        }
        loops.pause(1878)
        startCoord = 290
        offset = -30
        for (let i = 0; i < 4; i++) {
            createWall(startCoord + i * offset, false)
            loops.pause(468)
        }
    })
}



/*
 * -----------------
 * CODE FOR LEVEL 8
 * ~105.0-120.0
 * -----------------
 */
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level8Enemy, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
// call fancy destroy
sprites.onDestroyed(SpriteKind.Level8EnemySpawner, function (sprite: Sprite) {
    fancyDestroySprite(sprite)
})
function createLevel8EnemySpawner() {
    let mySpawner = sprites.create(assets.image`invis`, SpriteKind.Level8EnemySpawner)
    animation.runImageAnimation(mySpawner, assets.animation`enemy8Spawner`, 100, false)
    mySpawner.z = 2
    mySpawner.lifespan = 2000
    do {
        mySpawner.setPosition(randint(20, 280), randint(20, 280))
    }
    while (spriteutils.distanceBetween(mySprite, mySpawner) < 100)
    activeEnemies.push(mySpawner)
    sprites.setDataNumber(mySpawner, "dodgeRange", DodgeDistances.SuperFar)

    createWall(mySpawner.x, false)
    createWall(mySpawner.y, true)

    mySpawner.setPosition(mySpawner.x - 32, mySpawner.y - 32)
    let px = mySpawner.x
    let py = mySpawner.y

    timer.background(function () {
        createLevel8Enemies(px, py, 4)
        extraEffects.createSpreadEffectOnAnchor(mySpawner, lv8SpawnEffect, 100, 100)
        loops.pause(117)
        loops.pause(117)
        loops.pause(117)
        createLevel8Enemies(px, py, 4)
        extraEffects.createSpreadEffectOnAnchor(mySpawner, lv8SpawnEffect, 100, 100)
        loops.pause(117)
        loops.pause(117)
        loops.pause(117)
        createLevel8Enemies(px, py, 4)
        extraEffects.createSpreadEffectOnAnchor(mySpawner, lv8SpawnEffect, 100, 100)
        loops.pause(117)
        createLevel8Enemies(px, py, 4)
        extraEffects.createSpreadEffectOnAnchor(mySpawner, lv8SpawnEffect, 100, 100)
    })
}
function createLevel8Enemies(cx: number, cy: number, count: number) {
    for(let i = 0; i < count; i++) {
        let myEnemy = sprites.create(assets.image`invis`, SpriteKind.Level8Enemy)
        animation.runImageAnimation(myEnemy, assets.animation`enemy8`, 100, false)
        myEnemy.scale = 3
        myEnemy.z = 1
        myEnemy.lifespan = 2000
        let speed = 100
        let angle = Math.random() * 2 * Math.PI
        let vx = Math.cos(angle) * speed
        let vy = Math.sin(angle) * speed
        myEnemy.setVelocity(vx, vy)
        myEnemy.setPosition(cx, cy)
        activeEnemies.push(myEnemy)
        sprites.setDataNumber(myEnemy, "dodgeRange", DodgeDistances.SuperFar)
    }
}
function spawnLevel8Enemies() {
    level = 8

    // lemons
    timer.background(function () {
        for(let i = 0; i < 4; i++) {
            createLevel8EnemySpawner()
            loops.pause(3750)
        }
    })

    loops.pause(15000)
    endGame()
}

function setColorPaletteToBrightness(val: number) {
    const p = palette.defaultPalette();
    for (let i = 0; i < p.length; i++) {
        p.setColor(i, color.rgb(val, val, val));
    }
    palette.setColors(p)
}
function endGame() {
    level = 999
    updateTimer = false
    fancyDestroySpritesOf(SpriteKind.Level1Enemy)
    fancyDestroySpritesOf(SpriteKind.Level8Enemy)
    
    // display stats
    let congrats = fancyText.create("Congrats!", 0, 0, fancyText.geometric_sans_9)
    congrats.setFlag(SpriteFlag.RelativeToCamera, true)
    congrats.z = 10

    let ranking = fancyText.create("", 0, 0, fancyText.gothic_large)
    ranking.setFlag(SpriteFlag.RelativeToCamera, true)
    ranking.z = 10
    
    if(info.life() >= 20) {
        congrats.setText("Flawless!!!")
        ranking.setText("SS")
        ranking.setColor(3)
    } else if(info.life() >= 18) {
        congrats.setText("Spectacular!!")
        ranking.setText("S")
        ranking.setColor(13)
    } else if (info.life() >= 14) {
        congrats.setText("Amazing!")
        ranking.setText("A")
        ranking.setColor(2)
    } else if (info.life() >= 10) {
        congrats.setText("Bravo!")
        ranking.setText("B")
        ranking.setColor(4)
    } else if (info.life() >= 6) {
        congrats.setText("Congrats!")
        ranking.setText("C")
        ranking.setColor(5)
    } else if (info.life() >= 2) {
        congrats.setText("Daredevil!")
        ranking.setText("D")
        ranking.setColor(6)
    } else {
        congrats.setText("Fought to the last life!")
        ranking.setText("F")
        ranking.setColor(14)
    }

    congrats.setPosition(150, 120)
    ranking.setPosition(150, 150)

    info.setScore(info.score() * info.life())
    let finalScore = fancyText.create("Final Score: " + info.score(), 0, 0, fancyText.geometric_sans_9)
    finalScore.setPosition(150, 180)
    finalScore.setFlag(SpriteFlag.RelativeToCamera, true)
    finalScore.z = 10

    loops.pause(2813)

    // cleanup screen
    sprites.destroy(mySprite)
    sprites.destroy(time)
    sprites.destroy(congrats)
    sprites.destroy(ranking)
    sprites.destroy(finalScore)
    sprites.destroy(dashPrompt)
    profilelife.setInvisible(true)
    
    // screen flash at end
    setColorPaletteToBrightness(250)
    loops.pause(50)
    setColorPaletteToBrightness(200)
    loops.pause(50)
    setColorPaletteToBrightness(150)
    loops.pause(50)
    setColorPaletteToBrightness(50)
    loops.pause(50)
    setColorPaletteToBrightness(0)

    loops.pause(737)

    palette.reset()
    game.gameOver(true)
}