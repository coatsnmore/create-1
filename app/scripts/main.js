/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

var stage, circleContainer, player, up, down, left,
  right, floor, maxFloor, obstacles, lose, start, health,
  FULL_HEALTH, timer, timerInterval, bullets, activeBullets, fire,
  MAX_BULLETS, activeBulletCount, INDICATOR_HEIGHT;

floor = maxFloor = 250;
lose = false;
FULL_HEALTH = 25;
timer = 0;
activeBullets = [];
activeBulletCount = 0;
MAX_BULLETS = 10;
INDICATOR_HEIGHT = 100;

function resetControls() {
  up = false;
  down = false;
  left = false;
  right = false;
}
resetControls();

function createHealth() {
  var bar = new createjs.Shape();

  bar.name = 'health';
  // bar.graphics.beginFill('red').drawRect(50, 50, 5, player.health);

  bar.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var height = (player.health * INDICATOR_HEIGHT) / FULL_HEALTH;

    bar.graphics.clear();
    bar.graphics.beginFill('red').drawRect(50, 200, 5, -height);
  });

  stage.addChild(bar);
}

function createAmmo() {
  var ammo = new createjs.Shape();
  ammo.name = 'ammo';

  ammo.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var height = ((MAX_BULLETS - activeBulletCount) * INDICATOR_HEIGHT) / MAX_BULLETS;

    ammo.graphics.clear();
    ammo.graphics.beginFill('yellow').drawRect(75, 200, 5, -height);
  });

  stage.addChild(ammo);
}

function createBullets() {

  bullets = new createjs.Container();

  for (var i = 0; i < MAX_BULLETS; i++) {
    var bullet = new createjs.Shape();
    bullet.name = 'bullet:' + i;
    bullet.graphics.setStrokeStyle(2);
    bullet.graphics.beginStroke('white');
    bullet.graphics.drawCircle(0, 0, 5);
    bullet.active = false;
    bullet.alpha = 0;
    bullets.addChild(bullet);
  }

  stage.addChild(bullets);

  bullets.on('tick', function(event) {
    // for all bullets
    // if active then move
    // if outside stage, make inactive
    for (var j = 0; j < bullets.children.length; j++) {
      var b = bullets.children[j];

      if(b.active){
        b.alpha = 1;
        b.x += 5;
      }

      if (b.x >= 500) {
        b.active = false;
        b.x = player.x;
        b.y = player.y;
        b.alpha = 0;
        activeBulletCount--;
      }
    }
  });
}

function createPlayer() {
  player = new createjs.Container();

  player.name = 'player';
  player.health = FULL_HEALTH;

  var body = new createjs.Shape();
  body.graphics.beginFill('red').drawRect(0, 0, 10, 10);

  circleContainer = new createjs.Container();

  player.x = 300;
  player.y = floor;
  player.addChild(body);
  stage.addChild(player);

  player.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;

    if (up) {
      player.y -= delta / 1000 * 100;
    } else if (left) {
      player.x -= delta / 1000 * 100;
    } else if (right) {
      player.x += delta / 1000 * 100;
    } else if (down) {
      player.y += delta / 1000 * 100;
    } else {
      //gravity
      if (player.y < floor) {
        // player.y += delta / 1000 * 500;
      }
    }
  });


  player.explode = function() {
    var little, circle;

    little = player.getChildByName('littleExplode');
    circle = player.getChildByName('bigExplode');

    if (!little) {
      little = new createjs.Shape();
      little.alpha = 1;
    }

    little.graphics.setStrokeStyle(2);
    little.graphics.beginStroke('yellow');
    little.graphics.drawCircle(5, 5, 10);
    little.name = 'littleExplode';

    if (!circle) {
      circle = new createjs.Shape();
      circle.alpha = 1;
    }

    circle.graphics.setStrokeStyle(2);
    circle.graphics.beginStroke('red');
    circle.graphics.drawCircle(5, 5, 20);
    circle.name = 'bigExplode';

    player.addChild(little);
    player.addChild(circle);
  };

  player.notExplode = function() {
    var little = player.getChildByName('littleExplode');
    var big = player.getChildByName('bigExplode');

    player.removeChild(little);
    player.removeChild(big);
  };
}

function createCircle() {
  var line = new createjs.Shape();
  line.graphics.setStrokeStyle(3);
  line.graphics.beginStroke('yellow');
  line.graphics.moveTo(0, 20);
  line.graphics.lineTo(0, 40);
  line.graphics.endStroke();
  line.name = 'line';

  var little = new createjs.Shape();
  little.graphics.beginFill('red').drawCircle(0, 0, 10);

  var circle = new createjs.Shape();
  circle.graphics.beginFill('grey').drawCircle(0, 0, 40);

  //order is important
  circleContainer.x = 50;
  circleContainer.y = floor;
  circleContainer.addChild(circle);
  circleContainer.addChild(little);
  circleContainer.addChild(line);
  stage.addChild(circleContainer);

  // Stage will pass delta when it calls stage.update(arg)
  // which will pass them to tick event handlers for us in time based animation.
  circleContainer.on('tick', function(event) {
    var tickerEvent = event;
    var delta = tickerEvent.delta;
    line.rotation += delta / 1000 * 100;
  });
}

function createObstacles() {
  obstacles = new createjs.Container();
  obstacles.name = 'obstacles';

  var o1 = new createjs.Shape();
  o1.graphics.beginFill('blue').drawRect(0, 0, 50, -100);
  o1.name = 'o1';

  var o2 = new createjs.Shape();
  o2.graphics.beginFill('yellow').drawRect(100, -100, 50, -50);
  o2.name = 'o2';

  var o3 = new createjs.Shape();
  o3.graphics.beginFill('green').drawRect(200, 0, 50, -100);
  o3.name = 'o3';

  var o4 = new createjs.Shape();
  o4.graphics.beginFill('blue').drawRect(300, -150, 50, -50);
  o4.name = 'o4';

  var o5 = new createjs.Shape();
  o5.graphics.beginFill('green').drawRect(400, -150, 50, -50);
  o5.name = 'o5';

  var o6 = new createjs.Shape();
  o6.graphics.beginFill('cyan').drawRect(500, -150, 50, -100);
  o6.name = 'o6';

  var o7 = new createjs.Shape();
  o7.graphics.beginFill('blue').drawRect(600, -100, 50, -150);
  o7.name = 'o7';

  var o8 = new createjs.Shape();
  o8.graphics.beginFill('green').drawRect(700, -100, -50, -50);
  o8.name = 'o8';

  var o9 = new createjs.Shape();
  o9.graphics.beginFill('blue').drawRect(800, -100, 50, -150);
  o9.name = 'o9';

  obstacles.x = 400;
  obstacles.y = floor + 100;
  obstacles.addChild(o1);
  obstacles.addChild(o2);
  obstacles.addChild(o3);
  obstacles.addChild(o4);
  obstacles.addChild(o5);
  obstacles.addChild(o6);
  obstacles.addChild(o7);
  obstacles.addChild(o8);
  obstacles.addChild(o9);

  stage.addChild(obstacles);

  obstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;
    obstacles.x -= delta / 1000 * 50;

    if (obstacles.x <= -500) {
      obstacles.x = 500;
    }
  });
}

function createStart() {
  start = new createjs.Container();
  var startText = new createjs.Text('Click to Start', '48px Arial', '#F00');
  var startBox = new createjs.Shape();
  startBox.graphics.beginFill('white').drawRect(0, 0, 290, 50);

  start.addChild(startBox);
  start.addChild(startText);
  start.name = 'start';
  start.x = 200;
  start.y = 150;
  start.clicked = false;
}

function cleanObjects() {
  stage.removeChild(stage.getChildByName('player'));
  stage.removeChild(stage.getChildByName('circleContainer'));
}

// init
function init() {
  stage = new createjs.Stage('demoCanvas');

  // cleanObjects();
  createPlayer();
  createObstacles();
  createBullets();

  createCircle();
  createHealth();
  createAmmo();
  createStart();

  addStart();

  createjs.Ticker.on('tick', tick);
}

function handleHitObjects() {

  //circle
  var mouseHits = stage.getObjectsUnderPoint(stage.mouseX, stage.mouseY, 0);
  var circleHit = false;

  for (var i = 0; i < mouseHits.length; i++) {
    var o = mouseHits[i];
    // console.log('name: ' + o.name);
    if (o.parent === circleContainer) {
      circleHit = true;
    }
  }

  circleContainer.alpha = circleHit ? 0.5 : 1;

  //player hit stage
  var playerhits = stage.getObjectsUnderPoint(player.x, player.y, 0);
  var playerHit = false;

  for (var j = 0; j < playerhits.length; j++) {
    o = playerhits[j];
    // console.log('name: ' + o.name);
    if (o.parent === obstacles) {
      playerHit = true;
    }
  }

  obstacles.alpha = playerHit ? 0.5 : 1;
  lose = playerHit ? true : false;

  // bullets hit stage
  for(var k = 0; k < bullets.children.length; k++){
    var b = bullets.children[k];

    if (!b.active){
      continue;
    }
    var bHits = stage.getObjectsUnderPoint(b.x, b.y, 0);
    var bulletHit = false;

    if(bHits.length > 0){
      console.log('bhits: ' + bHits.length);
    }

    for (var z = 0; z < bHits.length; z++) {
      o = bHits[z];
      // console.log('name: ' + o.name);
      if (o.parent === obstacles) {
        bulletHit = true;
        console.log('stage hit by bullet');
        o.alpha = 0;
        b.active = false;
        b.x = player.x;
        b.y = player.y;
        b.alpha = 0;
        activeBulletCount--;
      }
    }
  }
}

// game loop
function tick(event) {
  if (!createjs.Ticker.paused) {
    testLose();
    // playerFire();
    handleHitObjects();
  }
  stage.update(event);
  resetControls();
  // printMouse();
  // testStart();
}

function playerFire() {
  if (activeBulletCount < MAX_BULLETS) {
    activeBulletCount++;
    bullets.children[activeBulletCount].active = true;
    bullets.children[activeBulletCount].x = player.x;
    bullets.children[activeBulletCount].y = player.y;
  }
  // console.log('activeBulletCount: ' + activeBulletCount);
}

function testLose() {
  // console.log('lose: ' + lose);
  // console.log('health: ' + player.health);
  var loseLabel, killedLabel, timerLabel;

  loseLabel = new createjs.Text('Lose', '48px Arial', '#F00');
  loseLabel.x = 50;
  loseLabel.y = 10;
  loseLabel.alpha = 0.5;
  loseLabel.name = 'loseLabel';

  killedLabel = new createjs.Text('Killed', '48px Arial', '#F00');
  killedLabel.x = 300;
  killedLabel.y = 10;
  killedLabel.alpha = 0.5;
  killedLabel.name = 'killedLabel';


  // lose
  if (lose) {
    stage.addChild(loseLabel);
    player.explode();
    player.health--;
  } else {
    player.notExplode();
    stage.removeChild(stage.getChildByName('loseLabel'));
  }

  // killed
  if (player.health <= 0) {
    // timer
    timerLabel = new createjs.Text('You lasted: ' + timer, '48px Arial', '#F00');
    timerLabel.x = 50;
    timerLabel.y = 50;
    timerLabel.alpha = 0.5;
    timerLabel.name = 'timerLabel';
    stage.addChild(timerLabel);

    clearInterval(timerInterval);

    // stage.addChild(killedLabel);
    stage.removeChild(stage.getChildByName('loseLabel'));

    addStart();
  }
}

function addStart() {
  stage.addChild(start);
  createjs.Ticker.paused = true;
  // stage.tick();

  start.on('click', function(event) {
    // console.log('start clicked');
    start.clicked = true;
    createjs.Ticker.paused = false;
    player.health = FULL_HEALTH;
    stage.removeChild(stage.getChildByName('start'));
    stage.removeChild(stage.getChildByName('killedLabel'));
    stage.removeChild(stage.getChildByName('loseLabel'));
    stage.removeChild(stage.getChildByName('timerLabel'));

    startTimer();
  });
}

function startTimer() {
  var timerStart = new Date();

  timerInterval = setInterval(function() {
    timer = Math.round((new Date() - timerStart) / 1000, 0);
    // console.log('timer: ' + timer);
  }, 1000);
}

function printMouse() {
  console.log('stage.mouseX: ' + stage.mouseX);
  console.log('stage.mouseY: ' + stage.mouseY);
  console.log('player.y: ' + player.y);
}

window.onkeydown = function(e) {
  // color = createjs.Graphics.getRGB(0xFFFFFF * Math.random(), 1);
  // console.log('which: ' + e.which);
  // 38 up
  // 40 down
  // 37 left
  // 39 right
  // 32 space
  switch (e.which) {
    case 38:
      up = true;
      down = false;
      left = false;
      right = false;
      fire = false;
      break;
    case 39:
      up = false;
      down = false;
      left = false;
      right = true;
      fire = false;
      break;
    case 40:
      up = false;
      down = true;
      left = false;
      right = false;
      fire = false;
      break;
    case 37:
      up = false;
      down = false;
      left = true;
      right = false;
      fire = false;
      break;
    case 32:
      up = false;
      down = false;
      left = false;
      right = false;
      fire = true;
      playerFire();
      break;
  }

  e.preventDefault();
};
