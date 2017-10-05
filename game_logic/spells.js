/**
 * Created by skolin on 05.10.17.
 */
var now = require('performance-now');

module.exports = spells = {
    parse_spell: function(c, datapacket) {
        var data = PacketModels.cast.parse(datapacket);
        //TODO check whether spell is allowed by player
        //TODO add remaining spells

        var spell_id = get_spell_id_from_runes(data.rune_1, data.rune_2, data.rune_3);

        switch (spell_id) {
            case 114:
                cast_fireball(c, data);
                break;
            default:
                break;
        }
    }
}

function cast_fireball(c, data) {
    var fireBall = new game_object(c.user.pos_x, c.user.pos_y);
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
    fireBall.type = 'fireball';

    maps[c.user.current_room].game_objects.push(fireBall);
    c.broadcastroom(packet.build([packet.get1byte(2), packet.get2byteShort(23), packet.get2byteShort(c.user._id), data.x_pos, data.y_pos, packet.get8byteLong(now())]));
}

function get_spell_id_from_runes(rune_1, rune_2, rune_3) {
    console.log(rune_1 + ' ' + rune_2);
    switch (rune_1) {
        case 4:
            switch  (rune_2) {
                case 14:
                    return 114;
                default:
                    return 0;
            }
        default:
            return 0;
    }
}