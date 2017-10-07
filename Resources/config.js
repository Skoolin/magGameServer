/**
 * Created by skolin on 25.04.17.
 */
//Import required libraries
var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');

//Store the environment variable
var environment = args.env || "test";

//Common config... ie: name, version, max player etc...
var common_conf = {
    name: "magGame game server",
    version: "0.0.1",
    environment: environment,
    max_player: 200,
    data_paths: {
        mobs: __dirname + "/Game Data/" + "Mobs/",
        maps: __dirname + "/Game Data/" + "Maps/"
    },
    starting_zone: "map_hometown"
};

//Environment Specific Configuration
var conf = {
    production: {
        ip: args.ip || "0.0.0.0",
        port: args.port || 8081,
        database: "mongodb://127.0.0.1/magServer_prod"
    },

    test: {
        ip: args.ip || "0.0.0.0",
        port: args.port || 8082,
        database: "mongodb://127.0.0.1/magServer_test"
    }
};

extend(false, conf.production, common_conf);
extend(false, conf.test, common_conf);

module.exports = config = conf[environment];
