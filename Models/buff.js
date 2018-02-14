/**
 * Created by skolin on 13.02.18.
 */
var buff = require('./buff');

module.exports = buff = {
    buff: function (duration) {
        this.id = buff.buff_int_counter++;
        this.duration = duration;
        this.type = 'none';
    },
    buff_int_counter: 0
};