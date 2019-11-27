// CRUD operations - create, read, update, delete!

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

// We don't use localhost as there have been issues with this slowing the app and he's not sure why!
const connectionURL = 'mongodb://127.0.0.1:27017'
// Name this whatever you want
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if (error) {
    return console.log('Unable to connect to database.')
  }

  const db = client.db(databaseName)

  // db.collection('users').insertOne({
  //   name: 'Wise',
  //   age: '41'
  // }, (error, result) => {
  //   if (error) {
  //     return console.log('Unable to insert user.')
  //   }
  //
  //   console.log(result.ops)
  // })

  db.collection('users').insertMany([
    {
      name: 'Little Monkey',
      age: 15
    }, {
      name: 'King Kong',
      age: 83
    }
  ], (error, result) => {
    if (error) {
      return console.log('Unable to insert users.')
    }

    console.log(result.ops)
  })
})
