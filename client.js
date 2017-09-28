/**
 * Created by skolin on 25.04.17.
 */
var now = require('performance-now');
var _ = require('underscore');

//statics, will be moved
var startingHealth = 100;

module.exports = function () {
    var client = this;

    //These objects will be added at runtime...
    //this.socket = {}
    //this.user = {}

    //Initialization
    this.initiate = function () {
        console.log('client initiated');
    };


    //Client Methods
    this.enterroom = function (selected_room) {

        maps[selected_room].clients.forEach(function (otherClient) {
            otherClient.socket.write(packet.build([packet.get1byte(3), packet.get2byteShort(client.user._id), client.user.pos_x, client.user.pos_y]));
        });

        var new_user = client.user;
        new_user.target_x = new_user.pos_x;
        new_user.target_y = new_user.pos_y;
        new_user.speed = 20;
        new_user.currentHealth = startingHealth;

        maps[selected_room].clients.push(client);

    };

    this.broadcastroom = function(data) {
        if(client.user.isDead) {
            return;
        }
        maps[client.user.current_room].clients.forEach(function (otherClient) {
            otherClient.socket.write(data);
        });

    };

    //Socket stuff
    this.data = function (data) {
        packet.parse(client, data);
    };

    this.error = function (err) {
        //console.log("client error: " + err.toString());
        //var index = maps[client.user.current_room].clients.indexOf(client);
        //maps[client.user.current_room].clients.splice(index);
    };

    this.end = function () {
        //console.log("client closes");
        if(client.user !== undefined) {
            console.log('user left: ' + client.user.username);
            var index = maps[client.user.current_room].clients.indexOf(client);
            maps[client.user.current_room].clients.splice(index);
            client.broadcastroom(packet.build([packet.get1byte(5), packet.get2byteShort(client._id)]));
        }
    };

};