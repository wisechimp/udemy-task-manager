const app = require('./app.js')

const port = process.env.PORT

app.listen(port, () => {
  console.log('Server is on port ' + port + '.')
})
