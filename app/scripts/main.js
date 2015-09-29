/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0, no-loop-func: 1*/

'use strict';

var stage, circleContainer, player, floor, obstacles, lose, start,
  FULL_HEALTH, timer, timerInterval, bullets, activeBullets,
  MAX_BULLETS, activeBulletCount, INDICATOR_HEIGHT, oBullets,
  activeOBulletCount, wall, score, keys, canvas, LEVEL_LENGTH, goals, goalsHit, GOALS;

canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

keys = [];
wall = canvas.width;
floor = canvas.height - 50;
lose = false;
FULL_HEALTH = 25;
timer = 0;
activeBullets = [];
activeBulletCount = activeOBulletCount = 0;
MAX_BULLETS = 10;
INDICATOR_HEIGHT = 100;
score = 0;
goalsHit = 0;
GOALS = 5;

function createScore() {
  var scoreLabel;
  scoreLabel = new createjs.Text('Score: ' + score, '24px Arial', 'white');
  scoreLabel.x = 5;
  scoreLabel.y = 10;
  scoreLabel.alpha = 0.9;
  scoreLabel.name = 'scoreLabel';
  stage.addChild(scoreLabel);

  var goalLabel;
  goalLabel = new createjs.Text('Rings: ' + goalsHit + '/' + GOALS, '24px Arial', 'gold');
  goalLabel.x = 5;
  goalLabel.y = 40;
  goalLabel.alpha = 0.9;
  goalLabel.name = 'goalLabel';
  stage.addChild(goalLabel);
}

function createInterfaceContainer() {
  var ui = new createjs.Shape();

  ui.name = 'ui';
  ui.graphics.beginFill('white').drawRect(15, floor + 10, 50, -INDICATOR_HEIGHT - 20);
  ui.alpha = 0.5;

  stage.addChild(ui);
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
    bar.graphics.beginFill('red').drawRect(25, floor, 5, -height);
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
    ammo.graphics.beginFill('black').drawRect(50, floor, 5, -height);
  });

  stage.addChild(ammo);
}

function createObstacleBullets() {
  oBullets = new createjs.Container();
  oBullets.name = 'oBullets';
  var BULLET_COUNT = 200;

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
      // console.log('o0.x: ' + obstacles.children[0].x + obstacles.x);
      // console.log('o1.x: ' + obstacles.children[1].x + obstacles.x);
      // console.log('player.x: ' + player.x);

      // assign to obstacles in line of fire
      // if (Math.abs(player.y - (obstacles.y + o.y)) < 200 ||
      //   Math.abs(player.x - (obstacles.x + o.x)) < 200) {
      //   console.log('line of fire: ' + Math.abs(player.y - (obstacles.y + o.y)));
      //

      // assign single bullet
      rb.active = true;
      rb.x = obstacles.x + o.x + o.leftx;
      rb.y = obstacles.y + o.y + o.middle - o.bottomy;
      // }
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

      if (b.x >= wall) {
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
    // var delta = tickerEvent.delta;

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

function generateGoals() {
  var levelLength, SPACE, SIZE, START_X;
  SPACE = 400;
  SIZE = 10;
  START_X = 500;
  levelLength = LEVEL_LENGTH || 800;

  goals = new createjs.Container();
  goals.x = START_X;
  goals.y = floor;
  stage.addChild(goals);

  // console.log('goal.x: ' + ((levelLength - START_X) / (SIZE + SPACE)));

  for (var i = 0; i < GOALS; i++) {
    var goal = new createjs.Shape();
    goal.name = 'goal:' + i;
    goal.graphics.setStrokeStyle(5);
    goal.graphics.beginStroke('gold');
    goal.graphics.drawCircle(0, 0, SIZE);
    // goal.x = i * ((levelLength - START_X) / (SIZE + SPACE));
    goal.x = i * (SIZE + SPACE);
    goal.y = getRandomInt(0, -floor - 10);
    goals.addChild(goal);
  }

  goals.on('tick', function(event) {
    if(event.paused){
      return;
    }
    goals.x -= event.delta / 1000 * 50;

    if (goals.x <= -levelLength) {
      goals.x = 0;
    }
  });
}

function generateObstacles() {
  var o, x, y, SIZE, randomColor, OBSTACLE_COUNT, vX, vY, SPEED, FRICTION, OBSTACLE_START_X, VARIATIONS, SPACE;
  OBSTACLE_START_X = 300;
  SIZE = 20;
  SPACE = 20;
  OBSTACLE_COUNT = ((wall - OBSTACLE_START_X) / (SIZE + SPACE)) + (OBSTACLE_START_X / (SIZE + SPACE));
  SPEED = 3;
  FRICTION = 0.9;
  vX = 0;
  vY = 0;
  VARIATIONS = 3;

  // umm lets make the world longer by some factor
  OBSTACLE_COUNT *= 2;

  obstacles = new createjs.Container();
  obstacles.name = 'obstacles';
  obstacles.x = OBSTACLE_START_X;
  obstacles.y = floor;
  // obstacles.vX = 0;
  // obstacles.vY = 0;
  stage.addChild(obstacles);

  // create small
  var obstaclesLength;
  for (var i = 0; i < OBSTACLE_COUNT; i++) {
    randomColor = colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * (SIZE + SPACE + 10);
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE, SIZE, -SIZE);
    o.name = 'o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    o.vX = 0;
    o.vY = 0;
    obstacles.addChild(o);

    o.explode = function() {
      console.log('explode');
      this.alpha = 0.75;
    };

    o.notExplode = function() {
      console.log('not explode');
      this.alpha = 0;
    };
    // save x
    obstaclesLength = x;
    LEVEL_LENGTH = x;
  }

  // create another group of tall
  for (i = 0; i < OBSTACLE_COUNT; i++) {
    randomColor = colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * (SIZE + SPACE);
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE * 2, SIZE * 2, -SIZE * 3);
    o.name = '2o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    o.vX = 0;
    o.vY = 0;
    obstacles.addChild(o);

    o.explode = function() {
      console.log('explode');
      this.alpha = 0.75;
    };

    o.notExplode = function() {
      console.log('not explode');
      this.alpha = 0;
    };
  }

  // create another group of long
  for (i = 0; i < OBSTACLE_COUNT; i++) {
    randomColor = colors.map[getRandomInt(0, colors.count)];

    o = new createjs.Shape();
    x = i * (SIZE + SPACE);
    y = getRandomInt(0, floor);
    o.graphics.beginFill(randomColor).drawRect(x, -y + SIZE * 3, SIZE * 3, -SIZE * 2);
    o.name = '2o' + i;
    o.leftx = x;
    o.middle = SIZE / 2;
    o.bottomy = y;
    o.color = randomColor;
    o.vX = 0;
    o.vY = 0;
    obstacles.addChild(o);

    o.explode = function() {
      console.log('explode');
      this.alpha = 0.75;
    };

    o.notExplode = function() {
      console.log('not explode');
      this.alpha = 0;
    };
  }

  // move obstacles
  obstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;

    // always move to the left
    // obstacles.x -= delta / 1000 * 50;
    if (vX < SPEED) {
      vX++;
    }

    if (vY < SPEED) {
      vY++;
    }

    vX *= FRICTION;
    obstacles.x -= vX;

    var randomObstacleIndex = getRandomInt(0, OBSTACLE_COUNT * VARIATIONS);

    // randomize movemnt for a few
    var ro = obstacles.children[randomObstacleIndex];
    ro.x += vX * (50 * delta / 1000);
    ro.y -= vY * (50 * delta / 1000);

    randomObstacleIndex = getRandomInt(0, OBSTACLE_COUNT * VARIATIONS);
    ro = obstacles.children[randomObstacleIndex];
    ro.x -= vX * (25 * delta / 1000);
    ro.y += vY * (25 * delta / 1000);

    randomObstacleIndex = getRandomInt(0, OBSTACLE_COUNT * VARIATIONS);
    ro = obstacles.children[randomObstacleIndex];
    ro.x -= vX * (25 * delta / 1000);
    ro.y += vY * (25 * delta / 1000);

    // test for left wall
    if (obstacles.x <= -obstaclesLength) {
      obstacles.x = wall;
    }
  });
}

function generateBackgroundObstacles() {
  var o, x, y, SIZE, randomColor, OBSTACLE_COUNT;
  OBSTACLE_COUNT = 50;
  SIZE = 10;

  var bObstacles = new createjs.Container();
  bObstacles.name = 'obstacles';
  bObstacles.x = 10;
  bObstacles.y = floor;
  stage.addChild(bObstacles);

  var backgroundLength;
  for (var i = 0; i < OBSTACLE_COUNT; i++) {
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
    o.alpha = 0.5;
    bObstacles.addChild(o);

    backgroundLength = x;
  }

  // move obstacles
  bObstacles.on('tick', function(event) {
    if (event.paused) {
      return;
    }

    var tickerEvent = event;
    var delta = tickerEvent.delta;
    bObstacles.x -= delta / 1000 * 25;

    if (bObstacles.x <= -backgroundLength) {
      bObstacles.x = 0;
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

function createStart() {
  start = new createjs.Container();
  var startText = new createjs.Text('Click to Start', '48px Arial', 'black');
  var instructionText = new createjs.Text('Collect the rings!', '24px Arial', 'red');
  instructionText.y = 50;

  var startBox = new createjs.Shape();
  startBox.graphics.beginFill('white').drawRect(0, 0, 300, 100);

  start.addChild(startBox);
  start.addChild(startText);
  start.addChild(instructionText);
  start.name = 'start';
  start.x = 200;
  start.y = floor / 2;
  start.clicked = false;
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
  generateGoals();

  // interface
  createInterfaceContainer();
  createHealth();
  createAmmo();
  createStart();
  createScore();
}

// init
function init() {
  stage = new createjs.Stage('canvas');
  createStage();
  addStart();
  createjs.Ticker.on('tick', tick);
}

function handleHitObjects() {

  //circle
  // var mouseHits = stage.getObjectsUnderPoint(stage.mouseX, stage.mouseY, 0);
  // var circleHit = false;
  //
  // for (var i = 0; i < mouseHits.length; i++) {
  //   var o = mouseHits[i];
  //   // console.log('name: ' + o.name);
  //   if (o.parent === circleContainer) {
  //     circleHit = true;
  //   }
  // }
  //
  // circleContainer.alpha = circleHit ? 0.5 : 1;

  // stage hit player
  var playerhits = stage.getObjectsUnderPoint(player.x, player.y, 0);
  var playerHit = false;

  var o;
  for (var j = 0; j < playerhits.length; j++) {
    o = playerhits[j];
    if (o.parent === obstacles) {
      playerHit = true;
    } else if (o.parent === oBullets) {
      playerHit = true;
    } else if (o.parent === goals){
      o.alpha = 0;
      goalsHit++;
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

    for (var z = 0; z < bHits.length; z++) {
      o = bHits[z];
      // console.log('name: ' + o.name);
      if (o.parent === obstacles) {
        bulletHit = true;
        console.log('stage hit by bullet');
        // o.alpha = 0;
        o.explode();
        o.notExplode();
        o.alpha = 0;
        b.active = false;
        b.x = player.x;
        b.y = player.y;
        b.alpha = 0;
        activeBulletCount--;
        score += 50;
      }
    }
  }
}

// game loop
function tick(event) {
  if (!createjs.Ticker.paused) {
    testLose();
    testWin();
    handleHitObjects();
    updateScore();
  }
  stage.update(event);
  // printMouse();
}

function testWin(){
  // won
  if (goalsHit >= GOALS) {
    // display win
    var winLabel;
    winLabel = new createjs.Text('You got all the rings! You win!', '48px Arial', 'white');
    winLabel.x = 50;
    winLabel.y = 80;
    winLabel.alpha = 0.9;
    winLabel.name = 'winLabel';
    stage.addChild(winLabel);
    addStart();
  }
}

function updateScore() {
  var scoreLabel = stage.getChildByName('scoreLabel');
  stage.removeChild(scoreLabel);
  // createScore();

  var goalLabel = stage.getChildByName('goalLabel');
  stage.removeChild(goalLabel);

  createScore();
}

function playerOutOfBounds() {
  var ob = false;

  if (player.x <= 0 || player.x >= wall || player.y <= 0 || player.y >= floor + 10) {
    ob = true;
  }
  return ob;
}

function testLose() {
  var loseLabel, killedLabel, timerLabel;

  loseLabel = new createjs.Text('Lose', '48px Arial', '#F00');
  loseLabel.x = 200;
  loseLabel.y = 10;
  loseLabel.alpha = 0.5;
  loseLabel.name = 'loseLabel';

  killedLabel = new createjs.Text('Killed', '48px Arial', '#F00');
  killedLabel.x = 300;
  killedLabel.y = 10;
  killedLabel.alpha = 0.5;
  killedLabel.name = 'killedLabel';

  // lose
  if (lose || playerOutOfBounds()) {
    // stage.addChild(loseLabel);
    player.explode();
    player.health -= 5;
  } else {
    player.notExplode();
    // stage.removeChild(stage.getChildByName('loseLabel'));
  }

  // killed
  if (player.health <= 0) {
    // display timer
    timerLabel = new createjs.Text('You lasted: ' + timer + ' seconds', '24px Arial', 'white');
    timerLabel.x = 200;
    timerLabel.y = 80;
    timerLabel.alpha = 0.9;
    timerLabel.name = 'timerLabel';
    stage.addChild(timerLabel);
    stage.removeChild(stage.getChildByName('loseLabel'));

    addStart();
  }
}

function addStart() {
  stage.addChild(start);
  createjs.Ticker.paused = true;
  clearInterval(timerInterval);
  // stage.tick();

  start.on('click', function() {
    start.clicked = true;
    createjs.Ticker.paused = false;
    player.health = FULL_HEALTH;
    activeBulletCount = 0;
    goalsHit = 0;
    createStage();
    startTimer();
  });
}

function startTimer() {
  var timerStart = new Date();

  timerInterval = setInterval(function() {
    timer = Math.round((new Date() - timerStart) / 1000, 0);
  }, 1000);
}

function printMouse() {
  console.log('stage.mouseX: ' + stage.mouseX);
  console.log('stage.mouseY: ' + stage.mouseY);
  console.log('player.y: ' + player.y);
}

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
    6: 'purple',
    7: 'orange'
  },
  'count': 8
};
