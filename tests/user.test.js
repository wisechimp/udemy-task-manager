const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.test' })

const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
console.log(userOneId)

const userOne = {
  _id: userOneId,
  name: 'Stereo Mike',
  email: 'mike@example.com',
  password: '56what??',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

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

test('Should login an existing user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)
})

test('Should not login a non existant user', async () => {
  await request(app).post('/users/login').send({
    email: 'Todd',
    password: 'rockfort'
  }).expect(400)
})

test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete user profile', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not delete if unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})
