//http://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server
//node server.js
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + '/dist')).listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);
