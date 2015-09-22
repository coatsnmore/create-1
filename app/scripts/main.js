/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

var stage, circleContainer, player, up, down, left, right, floor, maxFloor, obstacles, lose, start;
floor = maxFloor = 250;
lose = false;

function resetControls() {
  up = false;
  down = false;
  left = false;
  right = false;
}
resetControls();

function createPlayer() {
  player = new createjs.Container();
  player.name = 'player';
  var body = new createjs.Shape();
  body.graphics.beginFill('red').drawRect(0, 0, 10, 10);

  circleContainer = new createjs.Container();

  player.x = 300;
  player.y = floor;
  player.addChild(body);
  stage.addChild(player);

  player.on('tick', function(event) {
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
  circle.graphics.beginFill('black').drawCircle(0, 0, 40);

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
  o2.graphics.beginFill('blue').drawRect(100, -100, 50, -50);
  o2.name = 'o2';

  var o3 = new createjs.Shape();
  o3.graphics.beginFill('blue').drawRect(200, 0, 50, -100);
  o3.name = 'o3';

  var o4 = new createjs.Shape();
  o4.graphics.beginFill('blue').drawRect(300, -150, 50, -50);
  o4.name = 'o4';

  obstacles.x = 400;
  obstacles.y = floor + 100;
  obstacles.addChild(o1);
  obstacles.addChild(o2);
  obstacles.addChild(o3);
  obstacles.addChild(o4);
  stage.addChild(obstacles);

  obstacles.on('tick', function(event) {
    var tickerEvent = event;
    var delta = tickerEvent.delta;
    obstacles.x -= delta / 1000 * 50;

    // obstacles.rotation -= delta / 1000 * 5;

    // spin em all
    // console.log('obstacles.children: ' + obstacles.children);
    // console.log('obstacles.children.length: ' + obstacles.children.length);
    // for (var i = 0; i < obstacles.children.length; i++){
    //   var o = obstacles.children[i];
    //   console.log('o: ' + o);
    //   o.rotation += delta / 1000 * 50;
    // }


    if (obstacles.x <= 0) {
      obstacles.x = 500;
    }
  });
}

function cleanObjects (){
  stage.removeChild(stage.getChildByName('player'));
  // stage.removeChild(stage.getChildByName('circleContainer'));
}

// Game Loop
function init() {
  stage = new createjs.Stage('demoCanvas');

  // cleanObjects();
  createPlayer();
  createCircle();
  createObstacles();

  createjs.Ticker.on('tick', tick);
}

function handleHitObjects() {

  //circle
  var mouseHits = stage.getObjectsUnderPoint(stage.mouseX, stage.mouseY, 0);
  var circleHit = false;

  for (var i = 0; i < mouseHits.length; i++) {
    var o = mouseHits[i];
    console.log('name: ' + o.name);
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
}

function tick(event) {
  testLose();
  handleHitObjects();
  stage.update(event);
  resetControls();
  printMouse();
}

function testLose() {
  console.log('lose' + lose);
  var loseLabel = new createjs.Text('Lose', '48px Arial', '#F00');
  loseLabel.x = loseLabel.y = 10;
  loseLabel.alpha = 0.5;
  loseLabel.name = 'loseLabel';

  if (lose) {
    stage.addChild(loseLabel);
  } else {
    stage.removeChild(stage.getChildByName('loseLabel'));
  }
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
  switch (e.which) {
    case 38:
      up = true;
      down = false;
      left = false;
      right = false;
      break;
    case 39:
      up = false;
      down = false;
      left = false;
      right = true;
      break;
    case 40:
      up = false;
      down = true;
      left = false;
      right = false;
      break;
    case 37:
      up = false;
      down = false;
      left = true;
      right = false;
      break;
  }

  e.preventDefault();
};
