var game;
var ballOnPaddle=true;
var lives = 3;
var stageWidth = 800;
var livesText;
var bricks;

// Initialize Phaser and creates a game
var game = new Phaser.Game(800, 540, Phaser.CANVAS, 'gameDiv');

var mainState = {
    
    preload: function(){
        // Do all the scaling
        if(!game.device.desktop){
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            game.scale.setScreenSize(true);
        }else{
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.setScreenSize(true);
        }
         
        game.load.image('paddle', 'assets/paddle.png');
        game.load.image('ball', 'assets/ball.png');
        game.load.image('brick', 'assets/brick.png');
        
    },
    
    create: function(){
		game.stage.backgroundColor = '#71c5cf';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //create the paddle
        paddle = game.add.sprite(game.world.centerX, 500, 'paddle');
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        paddle.body.immovable = true;
        paddle.anchor.set(0.5,0.5);
        paddle.body.collideWorldBounds = true;
        
        //create the ball 
        ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'ball');
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.bounce.set(1);
        ball.anchor.set(0.5);
        ball.body.collideWorldBounds = true;
        //We don't want to check for out of worldBound when the ball goes down the screen
        game.physics.arcade.checkCollision.down = false;
        
        //Create a brick group (since we want to create more than one brick)
        bricks = game.add.group();
        bricks.enableBody = true;
        bricks.physicsBodyType = Phaser.Physics.ARCADE;
        
        //create all the bricks
        var brick;
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 15; x++) {
                brick = bricks.create(120+x*36,100+y*52,'brick');
                brick.body.immovable = true;
            }
        }
        
        game.input.onDown.add(this.handleOnDown, game);
        
        game.input.onUp.add(this.handleOnUp, game);
        
        lives = 3;
        
        var style = { font: "18px Arial", fill: "#000000", align: "center" };
        livesText = game.add.text(720, 20, "Lives : " + lives , style);  
        
    },
    
    update: function(){
        //If the ball goes out of the stage then restart
        if(ball.inWorld == false)
            this.ballLost();
        
        //If the ballOnPaddle is true then set the coordinates of the ball so that its just above the paddle
        if(ballOnPaddle == true){
            ball.body.x = paddle.body.x + paddle.width/2 - ball.width/2;
            ball.body.y = paddle.body.y - paddle.height;
        }else{
            game.physics.arcade.collide(ball, paddle, this.ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, this.ballHitBrick, null, this);
        }
        
        
    },
    
    handleOnDown: function(){
        //If the ball is on the paddle then shoot the ball else move the paddle left or right
        if(ballOnPaddle){
            ballOnPaddle=false;
            ball.body.velocity.y = -250;
            ball.body.velocity.x = 100;
        }else if(game.input.x < stageWidth/2){
            paddle.body.velocity.x = -250;
        }else if(game.input.x > stageWidth/2){
            paddle.body.velocity.x = 250;
        }
    },
    
    handleOnUp: function(){
       //stop the paddle from moving
       if(paddle.body.velocity.x != 0){
           paddle.body.velocity.x = 0;
       }
    },
    
    //This function is called if the ball goes out of the stage
    ballLost: function(){
        --lives;
        livesText.setText("Lives : "+lives);
        
        ballOnPaddle = true;
        
        if(lives<=0){
            game.state.start('main');
        }
    },
    
    //This function is called when ball collides with the paddle
    ballHitPaddle: function(ball,paddle){
        var diff = 0;

        if (ball.x < paddle.x){     //If the ball is on the right side of the paddle
            diff = paddle.x - ball.x;
            ball.body.velocity.x = (-10 * diff);     
        }else if (ball.x > paddle.x){   //If ball is on right side of the paddle
            diff = ball.x - paddle.x;
            ball.body.velocity.x = (10 * diff);
        }
    },
    
    //This function is called when ball collides with a brick
    ballHitBrick: function(ball,brick){
        brick.kill();
    }
}

//Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 