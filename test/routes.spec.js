process.env.NODE_ENV = 'test';

var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../server');

chai.use(chaiHttp);

describe('GET /api/secrets', function() {
  it('should return all secrets', function(done) {
    chai.request(server)
    .get('/api/secrets')
    .end(function(err, res) {
    res.should.have.status(200);
    res.should.be.json; // jshint ignore:line
    res.body.should.be.a('object');
    res.body.should.have.property('wowow');
    done();
    });
  });
});
