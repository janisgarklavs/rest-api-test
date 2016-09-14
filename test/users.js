let mongoose = require('mongoose');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let faker = require('faker');
let jwt = require('jsonwebtoken');

chai.use(chaiHttp);
process.env.NODE_ENV = 'test';

let server = require('../server');
let User = require('../app/models/user');

function createFakeUserData() {
    return {
        username: faker.random.uuid(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        password: faker.random.word()
    };
}

function createMultipleFakeUserData(amount) {
    let output = [];
    for (let i = 0; i < amount; i++) {
        output.push(createFakeUserData());
    }
    return output;
} 


function getValidJwtToken() {
    return jwt.sign({ id: 1111 } , process.env.SECRET, {
        expiresIn: 86400
    });
}

describe('Users', () => {
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });
    describe('/POST users', ()=> {
        it('it should create a new user', (done) => {
            let user = createFakeUserData();
            chai.request(server)
                .post('/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('username').eql(user.username);
                    res.body.should.have.property('first_name').eql(user.first_name);
                    res.body.should.have.property('last_name').eql(user.last_name);
                    res.body.should.have.property('created');
                    done();
                });
        });
        it('it should return error when more than 20 users are present in database', (done) => {
            let users = createMultipleFakeUserData(20)
            let user = createFakeUserData();
            User.create(users, (err, users) => {
                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(false);
                        res.body.should.have.property('message').eql("Too many users exists.");
                        done();
                    });
            });
        });
    });
    
    describe('/GET users', ()=> {
        it('it should return an empty array when no users present', (done) => {
            chai.request(server)
                .get('/users')
                .set('Authorization', getValidJwtToken())
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
        it('it should return error when no token provided', (done) => {
            chai.request(server)
                .get('/users')
                .end((err, res) => {
                    res.should.have.status(403);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("No token provided.");
                    done();
            });
        });
        it('it should return all users', (done) => {
            let users = createMultipleFakeUserData(5)
            User.create(users, (err, users) => {
                chai.request(server)
                    .get('/users')
                    .set('Authorization', getValidJwtToken())
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(5);
                        done();
                    });
            })
            
        });
    });

    describe('/GET/:id users', ()=> {
        it('it should return an individual user', (done) => {
            let user = new User(createFakeUserData());
            user.save((err, user) => {
                chai.request(server)
                    .get('/users/'+user._id)
                    .set('Authorization', getValidJwtToken())
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                        res.body.should.be.a('object');
                        res.body.should.have.property('id');
                        res.body.should.have.property('username').eql(user.username);
                        res.body.should.have.property('first_name').eql(user.first_name);
                        res.body.should.have.property('last_name').eql(user.last_name);
                        res.body.should.have.property('created');
                        done();
                    });
                });
        });
        it('it should return an error when user does not exists', (done) => {
            chai.request(server)
                .get('/users/1')
                .set('Authorization', getValidJwtToken())
                .end((err, res) => {
                    res.should.have.status(404);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("User not found.");
                    done();
                });
        });
        it('it should return an error when no authorization token provided', (done) => {
            let user = new User(createFakeUserData());
            user.save((err, user) => {
                chai.request(server)
                    .get('/users/'+user._id)
                    .end((err, res) => {
                        res.should.have.status(403);
                        res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').eql(false);
                        res.body.should.have.property('message').eql("No token provided.");
                        done();
                    });
                });
        });
    });


    describe('/DELETE/:id users', ()=> {
        it('it should delete the user', (done) => {
            let user = new User(createFakeUserData());
            user.save((err, user) => {
                chai.request(server)
                    .delete('/users/'+ user._id)
                    .set('Authorization', getValidJwtToken())
                    .end((err, res) => {
                        res.should.have.status(204);
                        User.findById(user._id, (err, found) => {
                            if ( !found ) {
                                done();
                            }
                        });
                        
                    });
            });
        });
        it('it should return an error when no authorization token provided', (done) => {
            chai.request(server)
                .delete('/users/15')
                .end((err, res) => {
                    res.should.have.status(403);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("No token provided.");
                    done();
                });
                
        });
    });

});


