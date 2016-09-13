let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let User = require('../models/user');


function login(req, res) {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).end();
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (!isMatch) {
                return res.status(401).end();
            }
            res.json({message: "Yey Logged In"});
        });
    })
}

module.exports = { login };