//http://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server
//node server.js
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + '/dist')).listen(server_port, server_ip_address);
