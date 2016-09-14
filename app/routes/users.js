let mongoose = require('mongoose');

let User = require('../models/user');

/*
* GET /users
* Retrieves the list of all users.
*/
function getUsers (req, res) {
    let query = User.find({});
    query.exec((err, users) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(users.map(formatUser));
    });
}

/*
* POST /users
* Creates new user.
*/
function createUser (req, res) {
    let newUser = new User(req.body);
    newUser.save((err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).location('/users/'+user._id).json(formatUser(user));
    });
}

/*
* GET /users/:id
* Retrieves specified user.
*/
function getUser (req, res) {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (!user) {
            return res.status(404).json({success: false, message: "User not found."});;
        }
        res.json(formatUser(user));
    });
}

/*
* DELETE /users/:id
* Removes specified user.
*/
function deleteUser (req, res) {
    User.remove({_id: req.params.id}, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(204).end();
    });
}

/*
* Output formatter for user object.
*/
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