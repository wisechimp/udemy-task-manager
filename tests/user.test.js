const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.test' })

const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
console.log(userOneId)

// Test data for a test user
const userOne = {
  _id: userOneId,
  name: 'Stereo Mike',
  email: 'mike@example.com',
  password: '56what??',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

// Clean the database and create the dummy user between each test
beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

// Assert that a new user is being signed up correctly by returning
// a 201 (created)
test('Should sign up a new user', async () => {
  await request(app)
    .post('/users')
    .send({
    name: 'William',
    email: 'william@example.com',
    password: 'MyPass777'
  })
    .expect(201)
})

// Assert that the dummy user is being signed up correctly by returning
// a 200 (OK)
test('Should login an existing user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)
})

// Assert that incorrect user details fail to access the database by
// returning a 400 (Bad request)
test('Should not login a non existant user', async () => {
  await request(app).post('/users/login').send({
    email: 'Todd',
    password: 'rockfort'
  }).expect(400)
})

// Assert that a user who has logged in can collect his personal data by
// returning a 200 (OK)
test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

// Assert that an unregistered user cannot return user information by
// returning a 401 (unauthorised)
test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

// Assert that a registered logged in user can delete their profile by
// returning a 200 (OK)
test('Should delete user profile', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

// Asserting that an unregistered user cannot delete by returning
// a 401 (unauthorised)
test('Should not delete if unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})
