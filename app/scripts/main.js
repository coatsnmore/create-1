/*eslint no-unused-vars: 1, no-use-before-define: 0, no-unused-expressions: 0*/

'use strict';

// var stage, output;
//
//     function init() {
//       stage = new createjs.Stage('demoCanvas');
//
//       // to get onMouseOver & onMouseOut events, we need to enable them on the stage:
//       stage.enableMouseOver();
//
//       output = new createjs.Text('Test press, click, doubleclick, mouseover, and mouseout', '14px Arial');
//       output.x = output.y = 10;
//       stage.addChild(output);
//
//       var circle = new createjs.Shape();
//       circle.graphics.beginFill('red').drawCircle(0, 0, 50);
//       circle.x = circle.y = 100;
//       circle.name = 'circle';
//       stage.addChild(circle);
//
//       var square = new createjs.Shape();
//       square.graphics.beginFill('green').drawRect(-50, -50, 100, 100);
//       square.x = 250;
//       square.y = 100;
//       square.name = 'square';
//       stage.addChild(square);
//
//       // add a handler for all the events we're interested in:
//       circle.on('click', handleMouseEvent);
//       circle.on('dblclick', handleMouseEvent);
//       circle.on('mouseover', handleMouseEvent);
//       circle.on('mouseout', handleMouseEvent);
//
//       square.on('click', handleMouseEvent);
//       square.on('dblclick', handleMouseEvent);
//       square.on('mouseover', handleMouseEvent);
//       square.on('mouseout', handleMouseEvent);
//
//       stage.update();
//       createjs.Ticker.addEventListener('tick', stage);
//     }
//
//     function handleMouseEvent(evt) {
//       output.text = 'evt.target: ' + evt.target + ', evt.type: ' + evt.type;
//
//       if(evt.type === 'mouseover'){
//         console.log('blue pls');
//         // evt.target.graphics.beginFill('blue');
//         evt.target.rotation += 5;
//       }
//
//       // to save CPU, we're only updating when we need to, instead of on a tick:1
//       stage.update();
//     }
var stage, circleContainer, player;

function init() {
  stage = new createjs.Stage('demoCanvas');

  player = new createjs.Container();
  var body = new createjs.Shape();
  body.graphics.beginFill('red').drawRect(100, 35, 5, 5);
  body.y = 50;
  body.x = 50;

  circleContainer = new createjs.Container();

  var line = new createjs.Shape();
  line.graphics.setStrokeStyle(3);
  line.graphics.beginStroke('yellow');
  line.graphics.moveTo(0, 20);
  line.graphics.lineTo(0, 40);
  line.graphics.endStroke();
  line.y = 50;

  var little = new createjs.Shape();
  little.graphics.beginFill('red').drawCircle(0, 0, 10);
  little.y = 50;

  var circle = new createjs.Shape();
  circle.graphics.beginFill('black').drawCircle(0, 0, 40);
  circle.y = 50;

  //order is important
  circleContainer.addChild(circle);
  circleContainer.addChild(little);
  circleContainer.addChild(line);
  stage.addChild(circleContainer);

  player.addChild(body);
  stage.addChild(player);

  // Stage will pass delta when it calls stage.update(arg)
  // which will pass them to tick event handlers for us in time based animation.
  circleContainer.on('tick', function(event) {
    var tickerEvent = event;
    var delta = tickerEvent.delta;
    circleContainer.x += delta / 1000 * 100;
    line.rotation += delta / 1000 * 100;
    if (circleContainer.x > stage.canvas.width) {
      circleContainer.x = 0;
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
}
