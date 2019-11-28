const mongoose = require('mongoose')
const validator = require('validator')

const Task = mongoose.model('Task', {
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
})

module.exports = Task

// const newTask = new Task({
// })
//
// newTask.save().then(() => {
//   console.log(newTask)
// }).catch((error) => {
//   console.log('Error!', error)
// })
