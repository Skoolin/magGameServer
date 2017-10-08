/**
 * Created by skolin on 28.04.17.
 */
var now = require('performance-now');
var lastFrameTime = 0;
var main = require('./mainGameLoop');

module.exports = mainGameLoop = {
    run: function () {
        var frameTimeNow = now();
        //in seconds
        var delta = (frameTimeNow - lastFrameTime) / 1000;
        lastFrameTime = frameTimeNow;
        var map = require(config.data_paths.maps + 'hometown');
        map.clients.forEach(function (client) {
            var user = client.user;
            var sqDist = main.distSq(user.pos_x, user.pos_y, user.target_x, user.target_y);
            if (sqDist > 0.6) {
                var dist = Math.sqrt(sqDist);
                user.pos_x -= delta * user.speed * (user.pos_x - user.target_x) / dist;
                user.pos_y -= delta * user.speed * (user.pos_y - user.target_y) / dist;
            }
        });
        var i = map.game_objects.length;
        while(i--) {
            var obj = map.game_objects[i];
            switch (obj.type) {
                case 'projectile':
                    if (obj.range < this.dist(obj.pos_x, obj.pos_y, obj.origin_x, obj.origin_y)) {
                        map.game_objects.splice(i, 1);
                        continue;
                    }
                    map.clients.forEach(function (client) {
                        if(client.user === obj.owner) {
                            return;
                        }
                        var user = client.user;
                        var sqDist = main.distSq(user.pos_x, user.pos_y, obj.pos_x, obj.pos_y);
                        if (sqDist < obj.hitboxSize * obj.hitboxSize) {
                            user.currentHealth -= obj.damage;
                            if(user.currentHealth <= 0) {
                                user.currentHealth = 0;
                                console.log('user died: ' + user.username);
                                user.pos_x = -100;
                                user.pos_y = -100;
                                user.target_x = -100;
                                user.target_y = -100;
                                client.broadcastroom(packet.build([packet.get1byte(4), packet.get2byteShort(user._id)]));
                                user.isDead = true;
                            } else {
                                client.broadcastroom(packet.build([packet.get1byte(11), packet.get2byteShort(user._id), packet.get2byteShort(user.currentHealth)]));
                            }
                            map.game_objects.splice(i, 1);
                        }
                    });
                    j = map.game_objects.length;
                    while (j--) {
                        var game_obj = map.game_objects[j];
                        if(game_obj.is_destructable) {
                            if(game_obj.owner === obj.owner) {
                                continue;
                            }

                            var sqDist = main.distSq(game_obj.pos_x, game_obj.pos_y, obj.pos_x, obj.pos_y);
                            if (sqDist < obj.hitboxSize * obj.hitboxSize) {
                                game_obj.health -= obj.damage;
                                if(game_obj.health <= 0) {
                                    client.broadcastroom(packet.build([packet.get1byte(13), packet.get2byteShort(game_obj.id)]));
                                    map.game_objects.splice(j, 1);

                                } else {
                                    client.broadcastroom(packet.build([packet.get1byte(12), packet.get2byteShort(game_obj.id), packet.get2byteShort(game_obj.health)]));
                                }
                                map.game_objects.splice(i, 1);
                            }
                        }
                    }
                    obj.pos_x += obj.speed * delta * obj.vel_x;
                    obj.pos_y += obj.speed * delta * obj.vel_y;
                    break;
                case 'movdmgshield':
                    if (obj.range < dist(obj.pos_x, obj.pos_y, obj.origin_x, obj.origin_y)) {
                        map.game_objects.splice(i, 1);
                        continue;
                    }
                    obj.pos_x += obj.speed * delta * obj.vel_x;
                    obj.pos_y += obj.speed * delta * obj.vel_y;
                    break;
                case 'homing_attack':
                    var hunted_client;
                    if (map.clients.some(function (client) {
                        if (client.user === obj.target) {
                            hunted_client = client;
                            return true;
                        }
                        })) {
                        // TODO not < 1 but calculate this value somehow
                        if (main.distSq(obj.pos_x, obj.pos_y, obj.target.pos_x, obj.target.pos_y) < 1) {
                            obj.target.currentHealth -= obj.damage;
                            if (obj.target.currentHealth <= 0) {
                                obj.target.currentHealth = 0;
                                console.log('user died: ' + user.username);
                                obj.target.pos_x = -100;
                                obj.target.pos_y = -100;
                                obj.target.target_x = -100;
                                obj.target.target_y = -100;
                                hunted_client.broadcastroom(packet.build([packet.get1byte(4), packet.get2byteShort(obj.target._id)]));
                                obj.target.isDead = true;
                            } else {
                                hunted_client.broadcastroom(packet.build([packet.get1byte(11), packet.get2byteShort(obj.target._id), packet.get2byteShort(obj.target.currentHealth)]));
                            }
                            map.game_objects.splice(i, 1);
                        } else {
                            var vel_x = obj.target.pos_x - obj.pos_x;
                            var vel_y = obj.target.pos_y - obj.pos_y;

                            var dist = main.dist(obj.pos_x, obj.pos_y, obj.target.pos_x, obj.target.pos_y);

                            vel_x /= dist;
                            vel_y /= dist;
                            obj.pos_x += obj.speed * delta * vel_x;
                            obj.pos_y += obj.speed * delta * vel_y;
                        }
                    } else {
                        map.game_objects.splice(i, 1);
                    }
                    break;
                case 'wall':
                    if(obj.duration < delta) {
                        map.clients[i].broadcastroom(packet.build([packet.get1byte(13), packet.get4byteint(obj.id)]));
                        map.game_objects.splice(i, 1);
                    } else {
                        obj.duration -= delta;
                    }
                    break;
                default:
                    map.game_objects.splice(i, 1);
                    break;
            }
        }
    },

    distSq: function(x, y, x2, y2) {
        return (x - x2) * (x - x2) + (y - y2) * (y - y2);
    },

    dist: function(x, y, x2, y2) {
        return Math.sqrt(this.distSq(x, y, x2, y2));
    }
};