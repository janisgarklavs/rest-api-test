let express = require('express');
let app = express();
let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
let bodyParser = require('body-parser');

let config = require('config');


/**
 * Initialize MongoDB database
 */
let options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000} },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000} },
};
mongoose.connect(config.DBHost, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection: error:'));
let autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);



let middlewares = require('./app/middlewares');
let auth = require('./app/routes/auth');
let users = require('./app/routes/users');

const port = process.env.PORT || 8080;

app.use(bodyParser.json({ type: 'application/json'}));

app.route("/login")
    .post(auth.login);
app.route("/users")
    .get(middlewares.auth, users.getUsers)
    .post(middlewares.limitUserCount, users.createUser);
app.route("/users/:id")
    .get(middlewares.auth, users.getUser)
    .delete(middlewares.auth, users.deleteUser);

app.listen(port);
console.log("Listening on port "+ port);

module.exports = app;