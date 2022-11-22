const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const request = require('supertest')
const path = require('path')
const express = require('../');
const bodyParser = require('body-parser')

process.env.NODE_ENV='production'

describe('response test', function () {
  it('should return text with statusCode 200 and body with hello,world', function (done) {
    request(createServer())
    .get('/api/hello')
    .expect(200)
    .expect('hello, world')
    .end(function(err, res) {
      if (err) return done(err)
      done()
    });
  })
  it('should return json with statusCode 200 and body.data with hello,again', function (done) {
    request(createServer())
    .get('/api/helloAgain')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) { return done(err) }
      const { code, message, data } = res.body
      expect(code).to.be.equal(200);
      expect(data).to.be.equal('hello, again');
      return done();
    })
  })
})

describe('login and fetch data test', function () {
  it('should return with statusCode 200 and body.data with a token', function (done) {
    request(createServer())
    .post('/api/user/login')
    .send({ username: 'david', password: '123456' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) { return done(err) }
      const { code, message, data } = res.body
      expect(code).to.be.equal(200);
      expect(data).to.have.property('token');
      return done();
    })
  })
})

describe('fetch data test', function () {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJkYXZpZCIsImlhdCI6MTY2OTEwODg1OCwiZXhwIjoxNjY5MTE2MDU4fQ.ngZhTY_FKRltBv6KxObqDmL2q_IpA0NIA7ZqTM_Ti6k'
  it('should return with statusCode 401 if request without token', function (done) {
    request(createServer())
    .get('/api/books/1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401)
    .end((err, res) => {
      if (err) { return done(err) }
      return done();
    })
  })
  it('should return with statusCode 200 if user have permisson', function (done) {
    request(createServer())
    .get('/api/books/1')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) { return done(err) }
      return done();
    })
  })
  it('should return with statusCode 403 if user have no permisson', function (done) {
    request(createServer())
    .get('/api/users/1')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403)
    .end((err, res) => {
      if (err) { return done(err) }
      return done();
    })
  })
})

function createServer () {
  const app = express();
  app.initJWT('123456', { expiresIn: '2h' }, { requestProperty: 'user' })
  app.setUserAuth('userAuth', async (jwtAuth) => {
    return { isAdmin: false, permissions: ['book.query'] }
  })
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.loadControllers(path.join(__dirname, 'controllers'))
  app.useLastMiddlewares()
  return app
}
