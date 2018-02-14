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
    },

    calc_dmg: function(object, base_dmg) {
        var dmg_increase = 0;
        var dmg_reduction = 0;
        object.buffs.forEach(function (buff) {
            if (buff.dmg_reduction) {
                dmg_reduction = Math.min(dmg_reduction + buff.dmg_reduction, 0.6);
                // 0.6 is maximum reduction
            } else if (buff.dmg_increase) {
                dmg_increase = Math.min(dmg_increase + buff.dmg_increase, 1.5);
                // 1.5 is maximum increase
            }
        });

        return base_dmg * (1 - dmg_reduction + dmg_increase);
    }
};