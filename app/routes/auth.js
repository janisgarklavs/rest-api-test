let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');

let User = require('../models/user');

/*
* POST /login 
* Authenticates the user and retreives jwt token for accessing protected resources.
*/
function login(req, res) {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).json({success: false, message: "Failed to authenticate."});;
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (!isMatch) {
                return res.status(401).json({success: false, message: "Failed to authenticate."});
            }
            const tokenData = {id: user._id};
            const token = jwt.sign(tokenData, req.app.get('secret'), {
                expiresIn: 86400
            });
            res.json({
                token: token,
                id : user._id,
                username: user.username, 
                created: Date.parse(user.created) / 1000
            })
        });
    })
}

module.exports = { login };