/**
 * Created by skolin on 13.02.18.
 */
var shield = require('./shield');

module.exports = shield = {
    shield: function (amount) {
        this.id = shield.shield_int_counter++;
        this.amount = amount;
    },
    shield_int_counter: 0
};