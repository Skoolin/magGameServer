/**
 * Created by skolin on 05.10.17.
 */
var now = require('performance-now');
var main = require('./../mainGameLoop');
module.exports = spells = {
    parse_spell: function(c, datapacket) {
        var data = PacketModels.cast.parse(datapacket);
        //TODO check whether spell is allowed by player
        //TODO add remaining spells

        var spell_id = get_spell_id_from_runes(data.rune_1, data.rune_2, data.rune_3);

        switch (spell_id) {
            case 16: cast_shockwave(c, data); break;
            case 23: cast_energyball(c, data); break;
            case 41: cast_moving_dmg_shield(c, data); break;
            case 24: cast_flash(c, data); break;
            case 32: cast_homing_attack(c, data); break;
            case 45: cast_wall(c, data); break;
            case 114:
                cast_fireball(c, data);
                break;
            default:
                break;
        }
    }
};

function cast_shockwave(c, data) {
    //TODO
}

function cast_energyball(c, data) {
    var energyball = new game_object.game_object(c.user.pos_x, c.user.pos_y);
    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    energyball.vel_x = x_dir/len;
    energyball.vel_y = y_dir/len;
    energyball.owner = c.user;
    energyball.range = 100;
    energyball.speed = 25;
    energyball.damage = 50;
    energyball.hitboxSize = 4;
    energyball.type = 'projectile';

    maps[c.user.current_room].game_objects.push(energyball);
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(23), packet.get2byteShort(c.user._id), data.x_pos, data.y_pos, packet.get8byteLong(now())]));
}

function cast_moving_dmg_shield(c, data) {
    var dmgshield = new game_object.game_object(c.user.pos_x, c.user.pos_y);
    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    dmgshield.vel_x = x_dir/len;
    dmgshield.vel_y = y_dir/len;
    dmgshield.owner = c.user;
    dmgshield.range = 50;
    dmgshield.speed = 10;
    dmgshield.health = 100;
    dmgshield.hitboxSize = 8;
    dmgshield.type = 'movdmgshield';
    dmgshield.is_destructable = true;

    maps[c.user.current_room].game_objects.push(dmgshield);
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(41), packet.get2byteShort(c.user._id), data.x_pos, data.y_pos, packet.get4byteint(dmgshield.id), packet.get8byteLong(now())]));
}

function cast_flash(c, data) {
    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    // TODO remove hardcoded value
    var max_range = 5;
    if (len < max_range) {
        c.pos_x = target_x;
        c.pos_y = target_y;
        c.target_x = target_x;
        c.target_y = target_y;
    } else {
        c.pos_x += (x_dir/len) * max_range;
        c.pos_y += (y_dir/len) * max_range;

        c.target_x = c.pos_x;
        c.target_y = c.pos_y;
    }
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(24), packet.get2byteShort(c.user._id), c.pos_x, c.pos_y, packet.get8byteLong(now())]));
}

function cast_homing_attack(c, data) {
    var user = c.user;
    var missile = new game_object.game_object(user.pos_x, user.pos_y);
    maps[user.current_room].clients.forEach(function (client) {
        if (client.user.id === data.target_id) {
            missile.target = client.user;
        }
    });

    var max_range = 40;
    if (main.distSq(user.pos_x, user.pos_y, missile.target.pos_x, missile.target.pos_y) <= max_range*max_range) {
        missile.damage = 15;
        missile.speed = 30;
        missile.type = 'homing_attack';
        maps[user.current_room].game_objects.push(missile);
        c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(32), packet.get2byteShort(user._id), packet.get2byteShort(data.target_id), packet.get8byteLong(now())]));
    }

}

function cast_wall(c, data) {

    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    // TODO remove hardcoded value
    var max_range = 8;
    if (!(len < max_range)) {
        target_x = c.user.pos.pos_x + (x_dir/len) * max_range;
        target_y = c.user.pos_y + (y_dir/len) * max_range;
    }

    var wall = new game_object.game_object(target_x, target_y);
    wall.is_destructable = true;
    wall.health = 60;
    wall.duration = 4;
    wall.owner = c.user;
    wall.type = 'wall';
}

function cast_fireball(c, data) {
    var fireBall = new game_object.game_object(c.user.pos_x, c.user.pos_y);
    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    fireBall.vel_x = x_dir/len;
    fireBall.vel_y = y_dir/len;
    fireBall.owner = c.user;
    fireBall.range = 100;
    fireBall.speed = 25;
    fireBall.damage = 50;
    fireBall.hitboxSize = 4;
    fireBall.type = 'projectile';

    maps[c.user.current_room].game_objects.push(fireBall);
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(114), packet.get2byteShort(c.user._id), data.x_pos, data.y_pos, packet.get8byteLong(now())]));
}

function get_spell_id_from_runes(rune_1, rune_2, rune_3) {
    console.log(rune_1 + ' ' + rune_2);
    switch (rune_1) {
        case 4:
            switch  (rune_2) {
                case 4:
                    return 16; // Shockwave
                case 5:
                    return 24; // Flash
                case 7:
                    return 45; // Wall
                case 14:
                    return 114; // Fireball
                default:
                    return 0;
            }
        case 5:
            switch (rune_2) {
                case 4:
                    return 23; // Energy Ball
                case 5:
                    return 32; // Homing Attack
                case 7:
                    return 53; // Dmg. Red. Area
                default: return 0;
            }
        case 7:
            switch (rune_2) {
                case 4: return 45; // Wall
                case 5: return 55; // Dmg. Shield
                case 7: return 78; // Resistance
                default: return 0;
            }
        default:
            return 0;
    }
}