/**
 * Created by skolin on 28.04.17.
 */
var now = require('performance-now');
var lastFrameTime = 0;
module.exports = mainGameLoop = {
    run: function () {
        var frameTimeNow = now();
        //in seconds
        var delta = (frameTimeNow - lastFrameTime) / 1000;
        lastFrameTime = frameTimeNow;
        var map = require(config.data_paths.maps + 'hometown');
        map.clients.forEach(function (client) {
            var user = client.user;
            var sqDist = distSq(user.pos_x, user.pos_y, user.target_x, user.target_y);
            if (sqDist > 0.6) {
                var dist = Math.sqrt(sqDist);
                user.pos_x -= delta * user.speed * (user.pos_x - user.target_x) / dist;
                user.pos_y -= delta * user.speed * (user.pos_y - user.target_y) / dist;
            }
        });
        var i = map.game_objects.length;
        while(i--) {
            var obj = map.game_objects[i];
            if (obj.range < dist(obj.pos_x, obj.pos_y, obj.origin_x, obj.origin_y)) {
                map.game_objects.splice(i, 1);
            }
            map.clients.forEach(function (client) {
                if(client.user === obj.owner) {
                    return;
                }
                var user = client.user;
                var sqDist = distSq(user.pos_x, user.pos_y, obj.pos_x, obj.pos_y);
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

            obj.pos_x += obj.speed * delta * obj.vel_x;
            obj.pos_y += obj.speed * delta * obj.vel_y;
        }
    }
};


function distSq(x, y, x2, y2) {
    return (x - x2) * (x - x2) + (y - y2) * (y - y2);
}

function dist(x, y, x2, y2) {
    return Math.sqrt(distSq(x, y, x2, y2));
}