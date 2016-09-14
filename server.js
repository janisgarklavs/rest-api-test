/**
 * REST Api server for test purposes
 * @author Janis Garklavs
 */

/*
* Package imports
*/
let express = require('express');
let bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');


/*
* Configuration block
*/

const DBHost = process.env.DBHOST || "mongodb://localhost/myDevDB";
const port = process.env.PORT || 8080;
const secret = process.env.SECRET || "mySecret";

mongoose.Promise = require('bluebird');

let app = express();
app.set('secret', secret);
app.use(bodyParser.json({ type: 'application/json'}));

/*
* Database connection
*/
mongoose.connect(DBHost);
let db = mongoose.connection.on('error', console.error.bind(console, 'connection: error:'));
autoIncrement.initialize(db);


/*
* Local imports
*/
let middlewares = require('./app/middlewares');
let auth = require('./app/routes/auth');
let users = require('./app/routes/users');

/*
* Error handling middleware.
*/
app.use( (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

/*
* Api routes
*/
app.route("/login")
    .post(auth.login);
app.route("/users")
    .get(middlewares.auth, users.getUsers)
    .post(middlewares.limitUserCount, users.createUser);
app.route("/users/:id")
    .get(middlewares.auth, users.getUser)
    .delete(middlewares.auth, users.deleteUser);

/*
* Starting the application
*/
app.listen(port);
console.log("Starting rest api on port: "+ port);

module.exports = app;