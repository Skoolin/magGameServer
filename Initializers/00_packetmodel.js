/**
 * Created by skolin on 26.04.17.
 */
var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated:true};

module.exports = PacketModels = {
    header: new Parser().skip(4)
        .uint8("command", StringOptions),

    login: new Parser().skip(4)
        .uint8("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    register: new Parser().skip(4)
        .uint8("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    move: new Parser().skip(4)
        .uint8("command", StringOptions)
        .floatbe("x_pos", StringOptions)
        .floatbe("y_pos", StringOptions),

    cast: new Parser().skip(4)
        .uint8("command", StringOptions)
        .uint8("rune_1", StringOptions)
        .uint8("rune_2", StringOptions)
        .uint8("rune_3", StringOptions)
        .uint8("key_1", StringOptions)
        .uint8("key_2", StringOptions)
        .uint8("key_3", StringOptions)
        .floatbe("x_pos", StringOptions)
        .floatbe("y_pos", StringOptions)
        .uint16("target_id", StringOptions),

    synchronize: new Parser().skip(4)
        .uint8("command", StringOptions)
        .uint64("clientStartingTime", StringOptions),
};