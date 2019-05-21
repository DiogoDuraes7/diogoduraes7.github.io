var map;
var cursors;
var debugGraphics;
var text;
var player;
var showDebug = false;
var groundLayer;
var coinLayer;
var coinsCollected = 0;
var timer;
var music;
var i;
var j;

let randomI = parseInt(Math.random() * 5);
let randomJ = ((parseInt(Math.random() * 4))+ 13);

function hitCoin(sprite, tile){
    coinLayer.removeTileAt(tile.x, tile.y);
    coinsCollected += 1;

    if (coinsCollected==28){
        updateText1();
    }
    // Return true to exit processing collision of this tile vs the sprite - in this case, it
    // doesn't matter since the coin tiles are not set to collide.
    return false;
}

function hitSecretDoor (sprite, tile)
{
    tile.alpha = 0;
    music.stop();
    this.scene.start('gamewin');
    coinsCollected=0;
    randomI = parseInt(Math.random() * 5);
    randomJ = ((parseInt(Math.random() * 4))+ 13);

    // Return true to exit processing collision of this tile vs the sprite - here, we want to allow
    // the player jump "through" the block and not collide.
    return true;
}


function updateText1 ()
{
    text.setText('Find the secret door!');
}

function gameOver ()
{
    music.stop();
    this.scene.start('gameover');
    coinsCollected=0;
}

//first scene
var Preloader = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Preloader ()
    {
        Phaser.Scene.call(this, { key: 'preloader' });
    },

    preload: function ()
    {
        this.load.image('buttonBG', 'assets/sprites/button-bg.png');
        this.load.image('buttonText', 'assets/sprites/button-text.png');
        this.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
        this.load.spritesheet('coin', 'assets/sprites/coin.png', { frameWidth: 32, frameHeight: 32 });
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/tile-collision-test.json');
        this.load.image('player', 'assets/sprites/orange-cat1.png');
        this.load.image('fundo', 'http://images1.fanpop.com/images/photos/2000000/Garfield-wallpapers-garfield-2026919-1024-768.jpg');
        this.load.audio('music', ['assets/audio/tech/bass.ogg', 'assets/audio/tech/bass.mp3']);
        //this.load.audio('music', ['assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
        //this.load.audio('music', 'assets/audio/goaman_intro.mp3');
        this.load.image('fundover', 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/b3f54e62430007.5a965f20d8cdb.gif');
        this.load.image('fundwin', 'https://cdn.cnn.com/cnnnext/dam/assets/180618215259-garfield-comic-strip-image.jpg');

        this.load.image('block', 'https://i.imgur.com/iIRsM1J.jpg');
    },

    create: function ()
    {
        console.log('%c Preloader ', 'background: green; color: white; display: block;');

        this.scene.start('mainmenu');
    }

});

var MainMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function MainMenu ()
    {
        Phaser.Scene.call(this, { key: 'mainmenu' });
        window.MENU = this;
    },

    create: function ()
    {
        console.log('%c MainMenu ', 'background: green; color: white; display: block;');

        var bg = this.add.image(0, 0, 'buttonBG');
        var text = this.add.image(0, 0, 'buttonText');
        var fundo=this.add.image(434, 310,'fundo');
        var texto=this.add.text(20, 10,'Welcome to prision, you have one mision, save Garfield!'+'\nPick the money and find the secret door at the time!'+'\nEnjoy the game :)').setFont('25px Arial').setFill('#ffffff').setShadow(4, 2, "#000000", 3);
        var container = this.add.container(160, 510, [ bg, text ]);
        
        bg.setInteractive();

        bg.once('pointerup', function () {

            this.scene.start('game');

        }, this);
    }
});

var Game = new Phaser.Class({

Extends: Phaser.Scene,

    initialize:

    function Game ()
    {
        Phaser.Scene.call(this, { key: 'game' });
        window.GAME = this;
    
        this.controls;
    },

    create: function ()
    {
    
    music = this.sound.add('music');
    var loopMarker = {
        name: 'loop',
        start: 0,
        duration: 7.68,
        config: {
            loop: true
        }
    };
    music.addMarker(loopMarker);
    music.play('loop', {
        delay: 0
    });

    map = this.make.tilemap({ key: 'map' });
    var groundTiles = map.addTilesetImage('ground_1x1');
    var coinTiles = map.addTilesetImage('coin');
    //var image = this.add.image(1300, 463, 'block');
    //var image = this.add.image(1359, 367, 'block');

    map.createDynamicLayer('Background Layer', groundTiles, 0, 0);
    groundLayer = map.createDynamicLayer('Ground Layer', groundTiles, 0, 0);
    coinLayer = map.createDynamicLayer('Coin Layer', coinTiles, 0, 0);
    groundLayer.setCollisionBetween(1, 25);

    var platforms = this.physics.add.staticGroup();
    platforms.create(1359, 367, 'block').refreshBody();
    platforms.create(1300, 463, 'block').refreshBody();

    // This will set Tile ID 26 (the coin tile) to call the function "hitCoin" when collided with
    coinLayer.setTileIndexCallback(26, hitCoin, this);

    // This will set the map location (2, 0) to call the function "hitSecretDoor" Un-comment this to
    // be jump through the ceiling above where the player spawns. You can use this to create a
    // secret area.
    groundLayer.setTileLocationCallback(randomI, randomJ, 1, 1, hitSecretDoor, this);

    player = this.physics.add.sprite(80, 70, 'player').setBounce(0.1);

    // We want the player to physically collide with the ground, but the coin layer should only
    // trigger an overlap so that collection a coin doesn'td kill player movement.
    this.physics.add.collider(player, groundLayer);
    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, coinLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);

    debugGraphics = this.add.graphics();

    this.input.keyboard.on('keydown_C', function (event)
    {
        showDebug = !showDebug;
        drawDebug();
    });

    cursors = this.input.keyboard.createCursorKeys();

    text = this.add.text(16, 16, '', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    timer=this.time.addEvent({ delay: 80000, callback: gameOver, callbackScope: this });
    text.setScrollFactor(0);

    if((i==randomI) && j==randomJ){
        if(player.body.setPositionY==i && player.body.setPositionX==j){
            this.scene.start('gamewin');
        }
    }

    },

    update: function (time, delta)
    {
        
    // Horizontal movement
    player.body.setVelocityX(0);
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
    }

    // Jumping
    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor())
    {
        player.body.setVelocityY(-280);
    }

    text.setText('Arrow keys to move. Space to jump' +
        '\nCoins collected: ' + coinsCollected+
        '\nTime: ' + Math.floor(80000 - timer.getElapsed()));
    }

});

var GameOver = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameOver ()
    {
        Phaser.Scene.call(this, { key: 'gameover' });
        window.OVER = this;
    },

    create: function ()
    {
        console.log('%c GameOver ', 'background: green; color: white; display: block;');


        this.add.image(400, 280, 'fundover');
        this.add.text(10, 10, 'Click to restart the game', { font: '30px Courier', fill: '#00ff00' });

        this.input.once('pointerup', function (event) {

            this.scene.start('preloader');

        }, this);
    }

});

var GameWin = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameWin ()
    {
        Phaser.Scene.call(this, { key: 'gamewin' });
        window.OVER = this;
    },

    create: function ()
    {
        console.log('%c GameWin ', 'background: green; color: white; display: block;');


        this.add.image(400, 280, 'fundwin');
        this.add.text(20, 10, 'Congratulations,\nYou win!! \nClick to start...', { font: '50px Arial', fill: '#00BFFF' });

        this.input.once('pointerup', function (event) {

            this.scene.start('preloader');

        }, this);
    }

});

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 576,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 } }
    },
    scene: [Preloader, MainMenu, Game, GameOver, GameWin],
    audio: {
        disableWebAudio: true
    }
};

var game = new Phaser.Game(config);