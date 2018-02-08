/**
 * Created by skolin on 26.04.17.
 */
var mongoose = require('mongoose');
var intCounter = 0;

var userSchema = new mongoose.Schema({
    _id: Number,
    username: {type: String, unique: true},
    password: String,

    current_room: String,
    pos_x: Number,
    pos_y: Number,
    team: String

});

userSchema.statics.register = function (username, password, cb) {


    var team_id = Math.floor(Math.random()*2+1);
    var team_string = 'none';
    var _pos_x, _pos_y;
    switch(team_id) {
        case 0:
            team_string = 'life';
            _pos_x = maps[config.starting_zone].life_start_x;
            _pos_y = maps[config.starting_zone].life_start_y;
            break;
        case 1:
            team_string = 'death';
            _pos_x = maps[config.starting_zone].death_start_x;
            _pos_y = maps[config.starting_zone].death_start_y;
            break;
    }

    var new_user = new User({

        team: team_string,
        _id: intCounter++,
        username: username,
        password: password,

        current_room: maps[config.starting_zone].room,
        pos_x: _pos_x,
        pos_y: _pos_y
    });

    new_user.save(function(err) {
        if(!err) {
            cb(true);
        } else {
            cb(false);
        }
    });

};

userSchema.statics.login = function (username, password, cb) {

    User.findOne({username: username}, function(err, user){

        if(!err && user) {
            if(user.password === password) {
                cb(true, user);
            } else {
                cb(false, null);
            }
        } else {
            //error || user doesn't exist...
            cb(false, null);
        }

    });

};

module.exports = User = gamedb.model('User', userSchema);