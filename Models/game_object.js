/**
 * Created by skolin on 28.04.17.
 */

var game_object = require('./game_object');

module.exports = game_object = {
    game_object: function (pos_x, pos_y) {
        this.id = game_object.obj_int_counter++;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.origin_x = pos_x;
        this.origin_y = pos_y;
        this.type = 'none';
        this.is_destructable = false;
        this.team = 'environmental';

        this.buffs = [];
        this.shields = [];
    },
    obj_int_counter: 0
};