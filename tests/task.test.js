const request = require('supertest')

const app = require('../src/app')
const Task = require('../src/models/task')
const {
  userOneId,
  userOne,
  setupDatabase
} = require('./fixtures/db')

// Clean the database and create the dummy user between each test
beforeEach(setupDatabase)

// Assert that the tasks are being created by returning a 201 (created)
// plus checking that the status is false (the default) and the task id
// exists, ie is not null
test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From my test'
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})
