let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let User = require('../models/user');

function auth(req, res, next) {
    console.log("auth MiddleWare");
    next();
} 

function limitUserCount(req, res, next) {
    User.count({}, (err, count) => {
        if (count > 20) return res.status(500).end();
        next();
    }) ;    
}

module.exports = { auth, limitUserCount };