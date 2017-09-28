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
    pos_y: Number

});

userSchema.statics.register = function (username, password, cb) {

    var new_user = new User({
        _id: intCounter++,
        username: username,
        password: password,

        current_room: maps[config.starting_zone].room,
        pos_x: maps[config.starting_zone].start_x,
        pos_y: maps[config.starting_zone].start_y
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