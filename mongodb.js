// CRUD operations - create, read, update, delete!

const { MongoClient, ObjectID } = require('mongodb')

// We don't use localhost as there have been issues with this slowing the app and he's not sure why!
const connectionURL = 'mongodb://127.0.0.1:27017'
// Name this whatever you want
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if (error) {
    return console.log('Unable to connect to database.')
  }

  const db = client.db(databaseName)

  db.collection('users').deleteOne({
    name: "Chirpy"
  }).then((result) => {
    console.log(result)
  }).catch((error) => {
    console.log(error)
  })
})
