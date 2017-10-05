/**
 * Created by skolin on 28.04.17.
 */
module.exports = game_object = function (pos_x, pos_y) {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.origin_x = pos_x;
    this.origin_y = pos_y;
    this.type = 'none';
};