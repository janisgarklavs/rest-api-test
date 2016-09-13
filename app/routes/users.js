let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let User = require('../models/user');

function getUsers (req, res) {
    let query = User.find({});
    query.exec((err, users) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(users.map(formatUser));
    });
}

function createUser (req, res) {
    var newUser = new User(req.body);
    newUser.save((err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).location('/users/'+user._id).json(formatUser(user));
    });
}

function getUser (req, res) {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).end();
        }
        res.json(formatUser(user));
    });
}

function deleteUser (req, res) {
    User.remove({_id: req.params.id}, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(204).end();
    });
}


function formatUser(data) {
    let user = {
        id: data._id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        created: Date.parse(data.created) / 1000
    };
    
    return user;
} 


module.exports = { getUsers, createUser, getUser, deleteUser };