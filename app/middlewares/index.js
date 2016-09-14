let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');

let User = require('../models/user');

/*
* Authentication middleware handling Authorization Header to check if valid jwt token provided
*/
function auth(req, res, next) {
    let token = req.get('Authorization');
    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided."});
    }
    jwt.verify(token, req.app.get('secret'), (err, decoded) => {
        if (err) {
            return res.status(403).json({success: false, message: "Failed to authenticate."});
        }
        next();
    });
} 
/*
* Middleware to check if database holds more than 20 records 
*/
function limitUserCount(req, res, next) {
    User.count({}, (err, count) => {
        if (count >= 20) return res.status(403).json({ success: false, message: "Too many users exists." });
        next();
    }) ;    
}

module.exports = { auth, limitUserCount };