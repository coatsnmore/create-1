/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

var stage, circleContainer, player, up, down, left, right;

function resetControls(){
  up = false;
  down = false;
  left = false;
  right = false;
}
resetControls();

function init() {
  stage = new createjs.Stage('demoCanvas');

  player = new createjs.Container();
  var body = new createjs.Shape();
  body.graphics.beginFill('red').drawRect(0, 0, 10, 10);

  circleContainer = new createjs.Container();

  var line = new createjs.Shape();
  line.graphics.setStrokeStyle(3);
  line.graphics.beginStroke('yellow');
  line.graphics.moveTo(0, 20);
  line.graphics.lineTo(0, 40);
  line.graphics.endStroke();

  var little = new createjs.Shape();
  little.graphics.beginFill('red').drawCircle(0, 0, 10);

  var circle = new createjs.Shape();
  circle.graphics.beginFill('black').drawCircle(0, 0, 40);

  var floor = 250;

  //order is important
  circleContainer.x = 50;
  circleContainer.y = floor;
  circleContainer.addChild(circle);
  circleContainer.addChild(little);
  circleContainer.addChild(line);
  stage.addChild(circleContainer);

  player.x = 300;
  player.y = floor;
  player.addChild(body);
  stage.addChild(player);

  // Stage will pass delta when it calls stage.update(arg)
  // which will pass them to tick event handlers for us in time based animation.
  circleContainer.on('tick', function(event) {
    var tickerEvent = event;
    var delta = tickerEvent.delta;
    line.rotation += delta / 1000 * 100;
  });

  // var upTime = 3;
  var upActive = false;
  function upTimeout (){
      upActive = false;
  }

  player.on('tick', function(event){
    var tickerEvent = event;
    var delta = tickerEvent.delta;

    if(up){
      var vy = player.y -= delta / 1000 * 1000;
      // player.y -= delta / 1000 * 1000;
      // player.y += 50
      console.log('vy: ' + vy);
    } else if (left){
      player.x -= delta / 1000 * 500;
    } else if (right){
      player.x += delta / 1000 * 500;
    } else {
      //gravity
      if(player.y < floor){
        // upActive = true;
        // setTimeout(upTimeout, 1000);
        player.y += delta / 1000 * 100;
      }
    }
  });

  createjs.Ticker.on('tick', tick);
}

function handleHitObjects() {
  var objectsHit = stage.getObjectsUnderPoint(stage.mouseX, stage.mouseY, 0);
  var circleHit = false;

  // console.log('circleHit: ' + objectsHit.length);
  for (var i = 0; i < objectsHit.length; i++) {
    var o = objectsHit[i];
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
  // countTimers();
}

// function countTimers(){
//   up
// }

function printMouse(){
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
