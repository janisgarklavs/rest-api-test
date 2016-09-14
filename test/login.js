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

describe('Login', () => {
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });
    describe('/POST login', ()=> {
        it('it should return an user object with token on valid credentials', (done) => {
            let userData = createFakeUserData();
            let user = new User(userData);
            user.save((err, dbuser) => {
                let credentials = {username: userData.username, password: userData.password };
                chai.request(server)
                .post('/login')
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('token');
                    res.body.should.have.property('username').eql(userData.username);
                    res.body.should.have.property('created');
                    jwt.verify(res.body.token, process.env.SECRET, (err, decoded) => {
                        if (!err) {
                            done();
                        }
                    });
                    
                });
            });
        });
        it('it should return error when credentials are not valid', (done) => {
            let user = new User(createFakeUserData());
            user.save((err, dbuser) => {
                let credentials = {username: "querty", password: "querty" };
                chai.request(server)
                .post('/login')
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8');
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(false);
                    res.body.should.have.property('message').eql("Failed to authenticate.");
                    done();
                });
            });
        });
    });

});


