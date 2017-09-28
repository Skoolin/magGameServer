/**
 * Created by skolin on 25.04.17.
 */
//Import required Libraries
require(__dirname + '/Resources/config.js');
var fs = require('fs');
var net = require('net');
require('./packet.js');
require('./mainGameLoop.js');

//Load the initializers
var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(function (initFile) {
    console.log('Loading Initializers: ' + initFile);
    require(__dirname + "/Initializers/" + initFile);
});

//Load the models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function (modelFile) {
    console.log('Loading Model: ' + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//Load the maps
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function (mapFile) {
    console.log('Loading Map: ' + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

function loop() {
    mainGameLoop.run();
}

loop();
setInterval(loop, 50);

net.createServer(function (socket) {

    console.log('socket connected: ' + socket.remoteAddress + ':' + socket.remotePort);
    var c_inst = new require('./client.js');
    var thisClient = new c_inst();

    thisClient.socket = socket;
    thisClient.initiate();

    socket.on('error', thisClient.error);

    socket.on('end', thisClient.end);

    socket.on('data', thisClient.data);

}).listen(config.port, config.ip);

console.log("Initialize Completed, Server running on port: " + config.port + " for environment: " + config.environment);

//4. initiate the server and listen to the internets
//all of server logic