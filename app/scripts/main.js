/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

var stage, circleContainer, player, up, down, left, right, floor, maxFloor;
floor = maxFloor = 250;

function resetControls() {
  up = false;
  down = false;
  left = false;
  right = false;
}
resetControls();

function createPlayer() {
  player = new createjs.Container();
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
      player.y -= delta / 1000 * 1000;
    } else if (left) {
      player.x -= delta / 1000 * 500;
    } else if (right) {
      player.x += delta / 1000 * 500;
    } else {
      //gravity
      if (player.y < floor) {
        player.y += delta / 1000 * 500;
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
    // var line = circleContainer.getChildByName('line');
    line.rotation += delta / 1000 * 100;
  });
}

function createObstacles(){
  var obstacles = new createjs.Container();

  var o1 = new createjs.Shape();
  o1.graphics.beginFill('blue').drawRect(0, 0, 100, -100);

  var o2 = new createjs.Shape();
  o2.graphics.beginFill('blue').drawRect(100, 0, 100, -150);

  var o3 = new createjs.Shape();
  o3.graphics.beginFill('blue').drawRect(200, 0, 100, -100);

  var o4 = new createjs.Shape();
  o4.graphics.beginFill('blue').drawRect(300, 0, 100, -150);

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
  });
}

function init() {
  stage = new createjs.Stage('demoCanvas');

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

  circleHit ? circleContainer.alpha = 0.5 : circleContainer.alpha = 1;
}

function tick(event) {
  handleHitObjects();
  stage.update(event);
  resetControls();
  // printMouse();
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
