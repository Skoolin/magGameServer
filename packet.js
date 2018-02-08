/**
 * Created by skolin on 26.04.17.
 */
var bufferConcat = require('buffer-concat');
var zeroBuffer = new Buffer('00', 'hex');
var now = require('performance-now');
var spells = require('./game_logic/spells');
module.exports = packet = {

    parse: function(c, datapacket) {
        var header = PacketModels.header.parse(datapacket);
        var data;
        switch (header.command) {
            case 1: //MOVE
                parseMove(c, datapacket);
                break;
            case 2: //CAST
                spells.parse_spell(c, datapacket);
                break;
            case 6: //LOGIN
                data = PacketModels.login.parse(datapacket);
                    User.login(data.username, data.password, function(result, user){
                        if(result) {
                            user.hitbox_size = 1;
                            user.id = game_object.obj_int_counter++;
                            //TODO add user.distance, user.sqr_distance, user.hurt
                            c.user = user;
                            console.log("login: " + c.user.username);
                            c.enterroom(c.user.current_room);
                            c.socket.write(packet.build([packet.get1byte(6), packet.get2byteShort(c.user._id), packet.get2byteShort(0), c.user.pos_x, c.user.pos_y]));
                            maps[c.user.current_room].clients.forEach(function (otherClient) {
                                if(c.user.username !== otherClient.user.username) {
                                    c.socket.write(packet.build([packet.get1byte(3), packet.get2byteShort(otherClient.user._id), otherClient.user.pos_x, otherClient.user.pos_y]));
                                }
                            });
                        } else {
                            c.socket.write(packet.build([packet.get1byte(7)]));
                        }
                    });
                break;
            case 8: //REGISTER
                data = PacketModels.register.parse(datapacket);
                User.register(data.username, data.password, function(result){
                    if(result) {
                        c.socket.write(packet.build([packet.get1byte(8)]));
                    } else {
                        c.socket.write(packet.build([packet.get1byte(9)]));
                    }
                });
                break;

            case 10: //SYNCHRONIZE
                data = PacketModels.synchronize.parse(datapacket);
                c.socket.write((packet.build([packet.get1byte(10), packet.get8byteLong(data.clientStartingTime), packet.get8byteLong(now())])));
                break;
            default:
                break;
        }
    },

    get2byteShort: function (int) {
        var buffer = new Buffer(2);
        buffer.writeUInt16BE(int, 0);
        return buffer;
    },

    get4byteint: function (int) {
        var buffer = new Buffer(4);
        buffer.writeUInt32BE(int, 0);
        return buffer;
    },

    get1byte: function (int) {
        var buffer = new Buffer(1);
        buffer.writeUInt8(int, 0);
        return buffer;
    },

    get8byteLong: function (long) {
        var buffer = new Buffer(8);
        buffer.writeUIntBE(long, 0, 8);
        return buffer;
    },

    build: function(params) {
        var packetParts = [];
        var packetSize = 0;

        params.forEach(function(param) {
            var buffer;

            if(typeof param === 'string') {
                buffer = new Buffer(param, 'utf8');
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            }
            else if (typeof param === 'number') {
                buffer = new Buffer(4);
                buffer.writeFloatBE(param, 0);
            }
            else if (param instanceof Buffer) {
                buffer = param;
            }
            else {
                console.log("WARNING: Unknown data type in packet builder!");
            }

            packetSize += buffer.length;
            packetParts.push(buffer);
        });

        var dataBuffer = Buffer.concat(packetParts, packetSize);

        var size = new Buffer(4);

        size.writeUInt8((dataBuffer.length & 0xff000000) >> 24, 0);
        size.writeUInt8((dataBuffer.length & 0x00ff0000) >> 16, 1);
        size.writeUInt8((dataBuffer.length & 0x0000ff00) >> 8, 2);
        size.writeUInt8((dataBuffer.length & 0x000000ff), 3);


        return Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);
    }
};

function parseMove(c, datapacket) {
    var data = PacketModels.move.parse(datapacket);
    c.user.target_x = data.x_pos;
    c.user.target_y = data.y_pos;
    c.broadcastroom(packet.build([packet.get1byte(1), packet.get2byteShort(c.user._id), c.user.pos_x, c.user.pos_y, c.user.target_x, c.user.target_y, packet.get8byteLong(now())]));
}