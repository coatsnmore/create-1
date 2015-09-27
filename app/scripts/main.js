/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

var stage, circleContainer, player, up, down, left,
  right, floor, maxFloor, obstacles, lose, start,
  FULL_HEALTH, timer, timerInterval, bullets, activeBullets, fire,
  MAX_BULLETS, activeBulletCount, INDICATOR_HEIGHT, oBullets,
  activeOBulletCount, wall, score, keys;

keys = [];
wall = 500;
floor = maxFloor = 250;
lose = false;
FULL_HEALTH = 25;
timer = 0;
activeBullets = [];
activeBulletCount = activeOBulletCount = 0;
MAX_BULLETS = 10;
INDICATOR_HEIGHT = 100;
score = 0;

function resetControls() {
  up = false;
  down = false;
  left = false;
  right = false;
  fire = false;
}
resetControls();

function createScore() {
  var scoreLabel;
  scoreLabel = new createjs.Text('Score: ' + score, '24px Arial', 'white');
  scoreLabel.x = 50;
  scoreLabel.y = 10;
  scoreLabel.alpha = 0.9;
  scoreLabel.name = 'scoreLabel';
  stage.addChild(scoreLabel);
}

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

function createObstacleBullets() {
  oBullets = new createjs.Container();
  oBullets.name = 'oBullets';
  var BULLET_COUNT = 50;

  for (var i = 0; i < BULLET_COUNT; i++) {
    var ob = new createjs.Shape();
    ob.name = 'ob:' + i;
    ob.graphics.setStrokeStyle(2);
    ob.graphics.beginStroke('red');
    ob.graphics.drawCircle(0, 0, 5);
    ob.active = false;
    oBullets.addChild(ob);
  }

  stage.addChild(oBullets);

  bullets.on('tick', function(event) {
    if (event.paused) {
      return;
    }
    // add 1 new active bullet to a random visible obstacle
    // if active then move
    // if outside stage, make inactive

    // best effort to find visible obstacle
    var cLength = obstacles.children.length;
    var o = obstacles.children[getRandomInt(0, cLength)];

    // best effort to find inactive bullet
    var ri = getRandomInt(0, oBullets.children.length);
    var rb = oBullets.children[ri];

    if (o.alpha > 0 && !rb.active && (obstacles.x + o.leftx) < wall) {
      // assign single bullet
      rb.active = true;
      rb.x = obstacles.x + o.leftx;
      rb.y = obstacles.y + o.middle - o.bottomy;
    }

    // animate all bullets
    for (var j = 0; j < oBullets.children.length; j++) {
      var b = oBullets.children[j];

      if (b.active) {
        b.alpha = 1;
        b.x -= 5;
      }

      if (b.x <= -50) {
        b.active = false;
        b.alpha = 1.0;
      }
    }
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
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
    if (event.paused) {
      return;
    }

    // for all bullets
    // if active then move
    // if outside stage, make inactive
    for (var j = 0; j < bullets.children.length; j++) {
      var b = bullets.children[j];

      if (b.active) {
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
  var FRICTION = 0.8,
    SPEED = 4,
    vX = 0,
    vY = 0;

  player = new createjs.Container();

  player.name = 'player';
  player.health = FULL_HEALTH;

  var body = new createjs.Shape();
  body.graphics.beginFill('white').drawRect(-2.5, -2.5, 5, 5);

  var shell = new createjs.Shape();
  shell.graphics.beginFill('purple').drawRect(-5, -5, 10, 10);

  var shell2 = new createjs.Shape();
  shell2.graphics.beginFill('white').drawRect(-10, -10, 20, 20);

  player.x = 200;
  player.y = floor - 50;

  player.addChild(shell2);
  player.addChild(shell);
  player.addChild(body);

  stage.addChild(player);

  player.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;

    // 38 up
    // 40 down
    // 37 left
    // 39 right
    if (keys[38]) {
      if (vY > -SPEED) {
        vY--;
      }
    }

    if (keys[40]) {
      if (vY < SPEED) {
        vY++;
      }
    }
    if (keys[39]) {
      if (vX < SPEED) {
        vX++;
      }
    }
    if (keys[37]) {
      if (vX > -SPEED) {
        vX--;
      }
    }

    vY *= FRICTION;
    player.y += vY;

    vX *= FRICTION;
    player.x += vX;

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
    little.graphics.drawCircle(0, 0, 20);
    little.name = 'littleExplode';

    if (!circle) {
      circle = new createjs.Shape();
      circle.alpha = 1;
    }

    circle.graphics.setStrokeStyle(2);
    circle.graphics.beginStroke('red');
    circle.graphics.drawCircle(0, 0, 30);
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

  player.fire = function() {
    if (activeBulletCount < MAX_BULLETS) {
      activeBulletCount++;
      bullets.children[activeBulletCount].active = true;
      bullets.children[activeBulletCount].x = player.x;
      bullets.children[activeBulletCount].y = player.y;
    }
  };
}

function createCircle() {
  circleContainer = new createjs.Container();

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

function generateObstacles() {
  var o, x, y, r, SIZE, randomColor, OBSTACLE_COUNT;
  OBSTACLE_COUNT = 100;
  SIZE = 20;

  obstacles = new createjs.Container();
  obstacles.name = 'obstacles';
  obstacles.x = 400;
  obstacles.y = floor;
  stage.addChild(obstacles);

  for (var i = 0; i < OBSTACLE_COUNT; i++) {
    // r  = getRandomInt(0, );
    randomColor = colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * (SIZE + 10);
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE, SIZE, -SIZE);
    o.name = 'o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    obstacles.addChild(o);
  }

  // move obstacles
  obstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;
    obstacles.x -= delta / 1000 * 50;

    var randomObstacleIndex = getRandomInt(0, OBSTACLE_COUNT);

    // if(randomObstacleIndex % 2 === 1){
    //   obstacles[randomObstacleIndex].y -= delta / 1000 * 10;
    // }
    //else {
    //   obstacles[randomObstacleIndex].y += delta / 1000 * 10;
    // }

    if (obstacles.x <= -(OBSTACLE_COUNT * (SIZE + 10))) {
      obstacles.x = wall;
    }
  });
}

function generateBackgroundObstacles() {
  var o, x, y, r, SIZE, randomColor, OBSTACLE_COUNT;
  OBSTACLE_COUNT = 50;
  SIZE = 10;

  var bObstacles = new createjs.Container();
  bObstacles.name = 'obstacles';
  bObstacles.x = 400;
  bObstacles.y = floor;
  stage.addChild(bObstacles);

  for (var i = 0; i < OBSTACLE_COUNT; i++) {
    // r  = getRandomInt(0, );
    randomColor = 'white'; //colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * 30;
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE, SIZE, -SIZE);
    o.name = 'o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    o.alpha = 0.5;
    bObstacles.addChild(o);
  }

  // move obstacles
  bObstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;
    bObstacles.x -= delta / 1000 * 25;

    if (bObstacles.x <= -500) {
      bObstacles.x = 500;
    }
  });
}

function generateFarBackgroundObstacles() {
  var o, x, y, r, SIZE, randomColor, OBSTACLE_COUNT;
  OBSTACLE_COUNT = 50;
  SIZE = 200;

  var bObstacles = new createjs.Container();
  bObstacles.name = 'obstacles';
  bObstacles.x = 400;
  bObstacles.y = floor;
  stage.addChild(bObstacles);

  for (var i = 0; i < OBSTACLE_COUNT; i++) {
    // r  = getRandomInt(0, );
    randomColor = colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * 30;
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE, SIZE, -SIZE);
    o.name = 'o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    o.alpha = 0.25;
    bObstacles.addChild(o);
  }

  // move obstacles
  bObstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;
    bObstacles.x -= delta / 1000 * 5;

    if (bObstacles.x <= -500) {
      bObstacles.x = 500;
    }
  });
}

function createObstacles() {
  obstacles = new createjs.Container();
  obstacles.name = 'obstacles';

  var o1 = new createjs.Shape();
  o1.graphics.beginFill('blue').drawRect(0, 0, 50, -100);
  o1.name = 'o1';
  o1.leftx = 0;
  o1.middle = 100 / 2;
  o1.bottomy = 0;

  var o2 = new createjs.Shape();
  o2.graphics.beginFill('yellow').drawRect(100, -100, 50, -50);
  o2.name = 'o2';
  o2.middle = 50 / 2;
  o2.leftx = 100;
  o2.bottomy = 100;
  // console.log('o2.middle = ' + o2.middle);

  var o3 = new createjs.Shape();
  o3.graphics.beginFill('green').drawRect(200, 0, 50, -100);
  o3.name = 'o3';
  o3.middle = 100 / 2;
  o3.leftx = 200;
  o3.bottomy = 0;

  var o4 = new createjs.Shape();
  o4.graphics.beginFill('blue').drawRect(300, -150, 50, -50);
  o4.name = 'o4';
  o4.middle = 50 / 2;
  o4.leftx = 300;
  o4.bottomy = 150;

  var o5 = new createjs.Shape();
  o5.graphics.beginFill('green').drawRect(400, -150, 50, -50);
  o5.name = 'o5';
  o5.middle = 50 / 2;
  o5.leftx = 400;
  o5.bottomy = 150;

  var o6 = new createjs.Shape();
  o6.graphics.beginFill('cyan').drawRect(500, -150, 50, -100);
  o6.name = 'o6';
  o6.middle = 100 / 2;
  o6.leftx = 500;
  o6.bottomy = 150;

  var o7 = new createjs.Shape();
  o7.graphics.beginFill('blue').drawRect(600, -100, 50, -150);
  o7.name = 'o7';
  o7.middle = 150 / 2;
  o7.leftx = 600;
  o7.bottomy = 100;

  var o8 = new createjs.Shape();
  o8.graphics.beginFill('green').drawRect(700, -100, -50, -50);
  o8.name = 'o8';
  o8.middle = 50 / 2;
  o8.leftx = 700;
  o8.bottomy = 100;

  var o9 = new createjs.Shape();
  o9.graphics.beginFill('blue').drawRect(800, -100, 50, -150);
  o9.name = 'o9';
  o9.middle = 150 / 2;
  o9.leftx = 800;
  o9.bottomy = 100;

  obstacles.x = 400;
  obstacles.y = floor;
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

// basically reset
function createStage() {
  score = 0;
  stage.removeAllChildren();

  // game objects
  generateFarBackgroundObstacles();
  generateBackgroundObstacles();
  createPlayer();
  generateObstacles();
  createBullets();
  createObstacleBullets();

  // interface
  createCircle();
  createHealth();
  createAmmo();
  createStart();
  createScore();
}

// init
function init() {
  stage = new createjs.Stage('demoCanvas');
  createStage();
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

  // stage hit player
  var playerhits = stage.getObjectsUnderPoint(player.x, player.y, 0);
  var playerHit = false;

  for (var j = 0; j < playerhits.length; j++) {
    o = playerhits[j];
    if (o.parent === obstacles) {
      playerHit = true;
    } else if (o.parent === oBullets) {
      playerHit = true;
    }
  }

  obstacles.alpha = playerHit ? 0.5 : 1;
  lose = playerHit ? true : false;

  // player bullets hit stage
  for (var k = 0; k < bullets.children.length; k++) {
    var b = bullets.children[k];

    if (!b.active) {
      continue;
    }
    var bHits = stage.getObjectsUnderPoint(b.x, b.y, 0);
    var bulletHit = false;

    if (bHits.length > 0) {
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
        score += 25;
      }
    }
  }
}

// game loop
function tick(event) {
  if (!createjs.Ticker.paused) {
    testLose();
    handleHitObjects();
    updateScore();
  }
  stage.update(event);
  resetControls();
}

function updateScore() {
  // stage.removeChildByName('scoreLabel');
  var scoreLabel = stage.getChildByName('scoreLabel');
  console.log('scoreLabel: ' + scoreLabel);
  stage.removeChild(scoreLabel);
  createScore();
}

function testLose() {
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
    player.health -= 5;
  } else {
    player.notExplode();
    stage.removeChild(stage.getChildByName('loseLabel'));
  }

  // killed
  if (player.health <= 0) {
    // display timer
    timerLabel = new createjs.Text('You lasted: ' + timer + ' seconds', '24px Arial', 'white');
    timerLabel.x = 50;
    timerLabel.y = 50;
    timerLabel.alpha = 0.9;
    timerLabel.name = 'timerLabel';
    stage.addChild(timerLabel);

    clearInterval(timerInterval);

    stage.removeChild(stage.getChildByName('loseLabel'));

    addStart();
  }
}

function addStart() {
  stage.addChild(start);
  createjs.Ticker.paused = true;
  // stage.tick();

  start.on('click', function(event) {
    start.clicked = true;
    createjs.Ticker.paused = false;
    player.health = FULL_HEALTH;
    createStage();
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

// window.onkeydown = function(e) {
//   // color = createjs.Graphics.getRGB(0xFFFFFF * Math.random(), 1);
//   // console.log('which: ' + e.which);
//   // 38 up
//   // 40 down
//   // 37 left
//   // 39 right
//   // 32 space
//   switch (e.which) {
//     case 38:
//       up = true;
//       down = false;
//       left = false;
//       right = false;
//       fire = false;
//       break;
//     case 39:
//       up = false;
//       down = false;
//       left = false;
//       right = true;
//       fire = false;
//       break;
//     case 40:
//       up = false;
//       down = true;
//       left = false;
//       right = false;
//       fire = false;
//       break;
//     case 37:
//       up = false;
//       down = false;
//       left = true;
//       right = false;
//       fire = false;
//       break;
//     case 32:
//       up = false;
//       down = false;
//       left = false;
//       right = false;
//       fire = true;
//       playerFire();
//       break;
//   }
//
//   e.preventDefault();
// };

document.body.addEventListener('keydown', function(e) {
  keys[e.which] = true;

  if (e.which === 32) {
    player.fire();
  }
  e.preventDefault();
});

document.body.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
  e.preventDefault();
});

var colors = {
  'map': {
    0: 'red',
    1: 'blue',
    2: 'yellow',
    3: 'cyan',
    4: 'green',
    5: 'white',
    6: 'gray'
  },
  'count': 7
};
