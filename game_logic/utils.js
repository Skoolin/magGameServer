/**
 * Created by skolin on 13.02.18.
 */
module.exports = utils = {
    hurt: function(object, amount) {
        var resistance = 0;
        object.buffs.forEach(function (buff) {
            if (buff.resistance) {
                resistance = Math.min(resistance + buff.resistance, 0.6);
                // 0.6 is maximum resistance
            }
        });

        amount = amount * (1- resistance);
        var i = object.shields.length;
        while(i--) {
            var shield = object.shields[i];
            var blocked = Math.min(amount, shield.amount);
            amount = Math.max(0, amount - blocked);
            shield.amount -= blocked;
            if(shield.amount <= 0) {
                object.shields.splice(i, 1);
            }
        }

        object.currentHealth -= amount;
    }
};