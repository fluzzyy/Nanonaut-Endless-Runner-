

// VARIABLES
var CANVAS_WIDTH = 800
var CANVAS_HEIGHT = 600
var NANONAUT_WIDTH = 181
var NAN0NAUT_HEIGHT = 229
var GROUND_Y = 540
var NANONAUT_Y_ACCELERATION = 1
var nanonautYSpeed = 0
var spaceKeyIsPressed = false
var SPACE_KEYCODE = 32
var NANONAUT_JUMP_SPEED = 20
var nanonautIsInTheAir = false
var NANONAUT_X_SPEED = 5
var BACKGROUND_WIDTH = 1000
//var NANONAUT_NR_FRAMES_PER_ROW = 5
var NANONAUT_NR_ANIMATION_FRAMES = 7
var nanonautFrameNr = 0
var NANONAUT_ANIMATION_SPEED = 3

var ROBOT_WIDTH = 141
var ROBOT_HEIGHT = 139
var ROBOT_NR_ANIMATION_FRAMES = 9
var ROBOT_ANIMATION_SPEED = 5
var ROBOT_X_SPEED = 4

var MIN_DISTANCE_BETWEEN_ROBOTS = 400
var MAX_DISTANCE_BETWEEN_ROBOTS = 1200
var MAX_ACTIVE_ROBOTS = 3

var SCREENSHAKE_RADIUS = 16

var NANONAUT_MAX_HEALTH = 100

var PLAY_GAME_MODE = 0
var GAME_OVER_GAME_MODE = 1


// SETUP

var canvas = document.createElement("canvas");
let c = canvas.getContext('2d')

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.body.appendChild(canvas);
var nanoImage = new Image()
nanoImage.src = 'animatedNanonaut.png'
var backgroundImage= new Image()
backgroundImage.src = 'background.png'
var bush1Image = new Image()
bush1Image.src = 'bush1.png'
var bush2Image = new Image()
bush2Image.src = 'bush2.png'
var robotImage = new Image()
robotImage.src = 'animatedRobot.png'

var robotSpriteSheet = {
    nrFramesPerRow: 3,
    spriteWidth: ROBOT_WIDTH,
    spriteHeight: ROBOT_HEIGHT,
    image: robotImage
}
var robotData =[]

var nanonautSpriteSheet = {
    nrFramesPerRow: 5,
    spriteWidth: NANONAUT_WIDTH,
    spriteHeight: NAN0NAUT_HEIGHT,
    image: nanoImage
}

var nanonautCollisionRectangle = {
    yOffset: 60,
    xOffset: 20,
    width: 50,
    height: 200
}
var robotCollisionRectangle = {
    yOffset: 50,
    xOffset: 20,
    width: 50,
    height: 100
}


let nanonautX = CANVAS_WIDTH / 2
let nanonautY = GROUND_Y - NAN0NAUT_HEIGHT

var nanonautHealth = NANONAUT_MAX_HEALTH

var cameraX = 0 
var cameraY = 0

var screenShake = false

var gameFrameCounter = 0

var gameMode = PLAY_GAME_MODE

var bushData = generateBushes()


window.addEventListener('keydown',onKeyDown)
window.addEventListener('keyup',onKeyUp)
window.addEventListener('load',start)

function start(){

   window.requestAnimationFrame(mainloop)
}

function generateBushes(){
    var generatedBushData = []
    var bushX = 0
    
    while (bushX < (2 * CANVAS_WIDTH)) {
        var bushImage
        if(Math.random() >= 0.5){
            bushImage = bush1Image
        }else{
            bushImage = bush2Image
        }
        generatedBushData.push({
            x: bushX,
            y: 80 + Math.random() * 20,
            image: bushImage
        })
        bushX += 150 + Math.random() * 20
        
    }
  
    return generatedBushData
}


// PLAYER INPUT
function onKeyDown(event){
   if(event.keyCode === SPACE_KEYCODE){
       spaceKeyIsPressed = true
       
   }
    
}
function onKeyUp(event){
    if(event.keyCode === SPACE_KEYCODE){
        spaceKeyIsPressed = false
    }
}


// MAIN LOOP
function mainloop(){
    update()
    draw()
    window.requestAnimationFrame(mainloop)
}


// UPDATEING
function update(){

    if(gameMode != PLAY_GAME_MODE) return

    gameFrameCounter = gameFrameCounter +1

        nanonautX = nanonautX + NANONAUT_X_SPEED


    if(spaceKeyIsPressed && !nanonautIsInTheAir){
        nanonautYSpeed = -NANONAUT_JUMP_SPEED
        nanonautIsInTheAir = true
    }

    // Update Character
    nanonautY = nanonautY +nanonautYSpeed
    nanonautYSpeed = nanonautYSpeed + NANONAUT_Y_ACCELERATION

    if(nanonautY >(GROUND_Y - NAN0NAUT_HEIGHT)){
        nanonautY = GROUND_Y - NAN0NAUT_HEIGHT
        nanonautYSpeed = 0
        nanonautIsInTheAir = false
      
    }

    // Update Animation
       if((gameFrameCounter % NANONAUT_ANIMATION_SPEED)=== 0){
           nanonautFrameNr = nanonautFrameNr + 1
           if(nanonautFrameNr >= NANONAUT_NR_ANIMATION_FRAMES){
               nanonautFrameNr = 0
           }
       }

   // Update Camera
   cameraX = nanonautX - 150 

        // update bushes
       for (let i = 0; i < bushData.length; i++) {
           if((bushData[i].x - cameraX) < -CANVAS_WIDTH){
               bushData[i].x += (2* CANVAS_WIDTH) + 150
           }
           
       }
       // Update robots
       //updateRobots()      
       screenShake = false
       var nanonautTouchedARobot = updateRobots()
       if(nanonautTouchedARobot){
           screenShake = true
           if(nanonautHealth > 0) nanonautHealth -=1
       } 
       // check if game is over
       if(nanonautHealth <= 0){
           gameMode = GAME_OVER_GAME_MODE 
           screenShake = false
       }
      
}
function updateRobots(){
    // move and animate robots and check collision with nanonaut
         var nanonautTouchedARobot = false
    for (var i = 0; i < robotData.length; i++) {
        if(doesNanonautOverlapRobot(
            nanonautX + nanonautCollisionRectangle.xOffset,
            nanonautY + nanonautCollisionRectangle.yOffset,
            nanonautCollisionRectangle.width,
            nanonautCollisionRectangle.height,
            robotData[i].x + robotCollisionRectangle.xOffset,
            robotData[i].y + robotCollisionRectangle.yOffset,
            robotCollisionRectangle.width,
            robotCollisionRectangle.height
        )){
            
            nanonautTouchedARobot = true
        }

        robotData[i].x -= ROBOT_X_SPEED
       if((gameFrameCounter % ROBOT_ANIMATION_SPEED) === 0){
           robotData[i].frameNr = robotData[i].frameNr +1
           if(robotData[i].frameNr >= ROBOT_NR_ANIMATION_FRAMES){
               robotData[i].frameNr = 0
           }
       }
        
    }
    // Remove robots that have gone off-screen
        var robotIndex = 0
        while (robotIndex < robotData.length) {
            if(robotData[robotIndex].x < cameraX - ROBOT_WIDTH){
                robotData.splice(robotIndex,1)
            }else{
                robotIndex += 1
            }
        }
        if(robotData.length < MAX_ACTIVE_ROBOTS){
            var lastRobotX = CANVAS_WIDTH
            if(robotData.length > 0){
                lastRobotX = robotData[robotData.length - 1].x
            }
            var newRobotX = lastRobotX + MIN_DISTANCE_BETWEEN_ROBOTS + Math.random()*(MAX_DISTANCE_BETWEEN_ROBOTS - MIN_DISTANCE_BETWEEN_ROBOTS)
            robotData.push({
                x: newRobotX,
                y: GROUND_Y - ROBOT_HEIGHT,
                frameNr: 0
            })
        }
        return nanonautTouchedARobot 
}

function doesNanonautOverlapRobotAlongOneAxis(nanonautNearX,nanonautFarX,robotNearX,robotFarX ){
    var nanonautOverlapsNearRobotEdge = (nanonautFarX >= robotNearX) &&
    (nanonautFarX <= robotFarX)
    var nanonautOverlapsFarRobotEdge = (nanonautNearX >= robotNearX) &&
    (nanonautNearX <= robotFarX)
    var nanonautOverlapsEntireRobot = (nanonautNearX <= robotNearX) &&
    (nanonautFarX >= robotFarX)
    return nanonautOverlapsNearRobotEdge || nanonautOverlapsFarRobotEdge || nanonautOverlapsEntireRobot
}
function doesNanonautOverlapRobot(nanonautX,nanonautY,nanonautWidth,nanonautHeight,robotX,robotY,robotWidth, robotHeight){
    var nanonautOverlapsRobotOnXAxis = doesNanonautOverlapRobotAlongOneAxis(
        nanonautX,
        nanonautX + nanonautWidth,
        robotX,
        robotX + robotWidth
    )
    var nanonautOverlapsRobotOnYAxis = doesNanonautOverlapRobotAlongOneAxis(
        nanonautY,
        nanonautY + nanonautHeight,
        robotY,
        robotY + robotHeight
    )
    return nanonautOverlapsRobotOnXAxis && nanonautOverlapsRobotOnYAxis
}



// DRAW

function draw(){

    // Shake the screen if necessary
    var shakenCameraX = cameraX
    var shakenCameraY = cameraY

    if(screenShake){
            shakenCameraX += (Math.random() - .5) * SCREENSHAKE_RADIUS
            shakenCameraY += (Math.random() - .5) * SCREENSHAKE_RADIUS
    }
  
    // Draw the sky
    c.fillStyle = 'LightSkyBlue'
    c.fillRect(0,0,CANVAS_WIDTH,GROUND_Y -40)

    // Draw background
    var backgroundX = -(shakenCameraX % BACKGROUND_WIDTH)
    c.drawImage(backgroundImage,backgroundX, -210)
    c.drawImage(backgroundImage,backgroundX + BACKGROUND_WIDTH, -210)

    // Draw the ground
    c.fillStyle = 'ForestGreen'
    c.fillRect(0,GROUND_Y - 40,CANVAS_WIDTH,CANVAS_HEIGHT - GROUND_Y + 40)

    // Draw bush
        for (let i = 0; i < bushData.length; i++) {
            c.drawImage(bushData[i].image, bushData[i].x - shakenCameraX,GROUND_Y - bushData[i].y - shakenCameraY)
        }

        // Draw robots
        for (let i = 0; i < robotData.length; i++) {
            drawAnimatedSprite(robotData[i].x - shakenCameraX,
                robotData[i].y - shakenCameraY,robotData[i].frameNr,robotSpriteSheet)
            
        }

    // draw character
        drawAnimatedSprite(nanonautX - shakenCameraX,nanonautY - shakenCameraY,nanonautFrameNr, nanonautSpriteSheet)

        // draw the distance the Nanonaut has travelled
        var nanonautDistance = nanonautX / 100
        c.fillStyle = 'black'
        c.font = '48px sans-serif'
        c.fillText(nanonautDistance.toFixed(0) + 'M',20,40)


        // Draw healthbar
        c.fillStyle = 'red'
        c.fillRect(400,10,nanonautHealth / NANONAUT_MAX_HEALTH * 380, 20)
        c.strokeStyle = 'red'
        c.strokeRect(400,10,380,20)

        // if the game is over , draw "GAME OVER"
    if(gameMode == GAME_OVER_GAME_MODE){
    c.fillStyle = 'black'
    c.font = '96px sans-serif'
    c.fillText('GAME OVER',120,300)
    
    }
         
         // Draw animated Sprite
    function drawAnimatedSprite(screenX,screenY,frameNr, spriteSheet){
    var spriteSheetRow = Math.floor(frameNr / spriteSheet.nrFramesPerRow)
    var spriteSheetColumn = frameNr % spriteSheet.nrFramesPerRow
    var spriteSheetX = spriteSheetColumn * spriteSheet.spriteWidth
    var spriteSheetY = spriteSheetRow * spriteSheet.spriteHeight
    c.drawImage(
        spriteSheet.image,
        spriteSheetX, spriteSheetY,
        spriteSheet.spriteWidth, spriteSheet.spriteHeight, screenX, screenY,
        spriteSheet.spriteWidth, spriteSheet.spriteHeight
    )
    
}

}
        

 


document.body.appendChild(canvas)
