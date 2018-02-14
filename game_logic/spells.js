/**
 * Created by skolin on 05.10.17.
 */
var now = require('performance-now');
var main = require('./../mainGameLoop');
var game_object = require('./../Models/game_object');
var shield = require('./../Models/shield');
var buff = require('./../Models/buff');
require('./../packet.js');
var utils = require('./utils');

module.exports = spells = {
    parse_spell: function(c, datapacket) {
        var data = PacketModels.cast.parse(datapacket);
        //TODO check whether spell is allowed by player
        //TODO add remaining spells

        var spell_id = get_spell_id_from_runes(data.rune_1, data.rune_2, data.rune_3);

        switch (spell_id) {
            case 16: cast_shockwave(c, data); break;
            case 23: cast_energyball(c, data); break;
            case 24: cast_flash(c, data); break;
            case 32: cast_homing_attack(c, data); break;
            case 41: cast_moving_dmg_shield(c, data); break;
            case 45: cast_wall(c, data); break;
            case 53: cast_dmg_red_area(c, data); break;
            case 55: cast_dmg_shield(c, data); break;
            case 78: cast_resistance(c, data); break;
            case 114: cast_fireball(c, data); break;
            default:
                break;
        }
    }
};

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
    energyball.damage = utils.calc_dmg(c.user, 50);
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
    dmgshield.currentHealth = 100;
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
    var max_range = 30;
    if (len < max_range) {
        c.user.pos_x = target_x;
        c.user.pos_y = target_y;
        c.user.target_x = target_x;
        c.user.target_y = target_y;
    } else {
        c.user.pos_x += (x_dir/len) * max_range;
        c.user.pos_y += (y_dir/len) * max_range;

        c.user.target_x = c.user.pos_x;
        c.user.target_y = c.user.pos_y;
    }
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(24), packet.get2byteShort(c.user._id), c.user.pos_x, c.user.pos_y, packet.get8byteLong(now())]));
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
        missile.damage = utils.calc_dmg(user, 15);
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
        target_x = c.user.pos_x + (x_dir/len) * max_range;
        target_y = c.user.pos_y + (y_dir/len) * max_range;
    }

    var wall = new game_object.game_object(target_x, target_y);
    wall.is_destructable = true;
    wall.currentHealth = 60;
    wall.duration = 4;
    wall.owner = c.user;
    wall.type = 'wall';
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(45), packet.get2byteShort(c.user._id), target_x, target_y, packet.get4byteint(wall.id), packet.get8byteLong(now())]));
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
    fireBall.damage = utils.calc_dmg(c.user, 50);
    fireBall.hitboxSize = 4;
    fireBall.type = 'projectile';

    maps[c.user.current_room].game_objects.push(fireBall);
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(114), packet.get2byteShort(c.user._id), data.x_pos, data.y_pos, packet.get8byteLong(now())]));
}

function cast_dmg_shield(c, data) {
    var target;
    maps[c.user.current_room].clients.forEach(function (client) {
        if (client.user.id === data.target_id) {
            target = client.user;
        }
    });

    var max_range = 50;
    if (target && main.distSq(user.pos_x, user.pos_y, target.pos_x, target.pos_y) <= max_range*max_range) {
        var dmg_shield_buff = new buff.buff(3);
        var shield = new shield.shield(100);
        target.buffs.push(dmg_shield_buff);
        target.shields.push(shield);
        dmg_shield_buff.shield_id = shield.id;
        dmg_shield_buff.on_remove = function (user, buff) {
            var j = user.shields.length;
            while (j--) {
                var _shield = user.shields[j];
                if(_shield.id === buff.shield_id) {
                    user.shields.splice(j, 1);
                }
            }
        };
        c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(55), packet.get2byteShort(user._id), packet.get2byteShort(data.target_id), packet.get8byteLong(now())]));
    }
}

function cast_shockwave(c, data) {
    var user = c.user;
    var knockback = 15;
    var range = 30;
    var packet_data = [packet.get1byte(2), packet.get2byteShort(16), packet.get2byteShort(user._id), packet.get8byteLong(now())];
    var packet_user_data = [];
    var number_of_pushed_users = 0;
    maps[user.current_room].clients.forEach(function (client) {
        var other = client.user;
        if(main.distSq(user.pos_x, user.pos_y, other.pos_x, other.pos_y) <= range * range) {
            var x_dir = other.pos_x - user.pos_x;
            var y_dir = other.pos_y - user.pos_y;
            var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);
            other.pos_x += (x_dir/len)*knockback;
            other.pos_y += (y_dir/len)*knockback;

            number_of_pushed_users += 1;
            packet_user_data.push(packet.get4byteint(other._id), packet.get1byte(1), other.pos_x, other.pos_y);
        }
    });
    packet_data.push(packet.get1byte(number_of_pushed_users));
    packet_data = packet_data.concat(packet_user_data);
    c.broadcastroom(packet.build(packet_data));
}

function cast_resistance(c, data) {
    var target;
    maps[c.user.current_room].clients.forEach(function (client) {
        if (client.user.id === data.target_id) {
            target = client.user;
        }
    });

    var max_range = 50;
    if (target && main.distSq(user.pos_x, user.pos_y, target.pos_x, target.pos_y) <= max_range*max_range) {
        var resistance_buff = new buff.buff(3);
        target.buffs.push(resistance_buff);
        resistance_buff.resistance = 0.15;
    }
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(78), packet.get2byteShort(user._id), packet.get2byteShort(data.target_id), packet.get8byteLong(now())]));
}

function cast_dmg_red_area(c, data) {
    var target_x = data.x_pos;
    var target_y = data.y_pos;

    var x_dir = target_x - c.user.pos_x;
    var y_dir = target_y - c.user.pos_y;

    var len = Math.sqrt(x_dir*x_dir + y_dir*y_dir);

    // TODO remove hardcoded value
    var max_range = 30;
    var dmg_red_area_duration = 6;
    var dmg_red_area_hitbox_size = 12;
    if (len < max_range) {
        var area = new game_object.game_object(target_x, target_y);
        area.vel_x = 0;
        area.vel_y = 0;
        area.duration = dmg_red_area_duration;
        area.owner = c.user;
        area.hitboxSize = dmg_red_area_hitbox_size;
        area.type = 'dmg_red_area';

        maps[c.user.current_room].game_objects.push(area);
        c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(53), packet.get2byteShort(c.user._id), c.user.pos_x, c.user.pos_y, packet.get8byteLong(now())]));
    }
}

function get_spell_id_from_runes(rune_1, rune_2, rune_3) {
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