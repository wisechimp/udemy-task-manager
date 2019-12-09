const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const {
  userOneId,
  userOne,
  setupDatabase
} = require('./fixtures/db')

// Clean the database and create the dummy user between each test
beforeEach(setupDatabase)

// Assert that a new user is being signed up correctly by returning
// a 201 (created)
test('Should sign up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
    name: 'William',
    email: 'william@example.com',
    password: 'MyPass777'
  })
    .expect(201)

    // E.g. assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assert the response contains the correct name
    expect(response.body.user.name).toBe('William')

    // Assert any piece in the object matches so can do the above with this
    expect(response.body).toMatchObject({
      user: {
        name: 'William',
        email: 'william@example.com'
      },
      token : user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777')
})

// Assert that the dummy user is being signed up correctly by returning
// a 200 (OK)
test('Should login an existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
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

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

// Asserting that an unregistered user cannot delete by returning
// a 401 (unauthorised)
test('Should not delete if unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

// Assert that an uploaded image gets stored as a toBuffer
test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    // toBe() doesn't work here because an object cannot === another object
    // as they sit in separate parts of memory.
    expect(user.avatar).toEqual(expect.any(Buffer))
})

// Assert that update is correctly updating a user's details
test('Should update user\'s info', async () => {
  await request(app)
  .patch('/users/me')
  .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  .send({
    name: 'Todd'
  })
  .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).toBe('Todd')
})

//Assert that non existant fields cannot be updated
test('Should not update non existant fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Denver, CO'
    })
    .expect(400)
})
