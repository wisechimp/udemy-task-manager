const express = require('express')
const router = new express.Router()

const Task = require('../models/task')
const auth = require('../middleware/auth')

// Route for creating a task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for fetching all tasks
router.get('/tasks', auth, async (req, res) => {
  const match = {}

  // If completed=prune then we get the false ones...
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  try {
    //const tasks = await Task.find({ owner: req.user._id })
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip)
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send()
  }
})

// Route for fetching a single task
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Nothing to see here?')
    }

    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Route for updating a task
router.patch('/tasks/:id', auth, async(req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Nothing to see here.')
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for deleting a task
router.delete('/tasks/:id', auth, async(req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Nothing to see here')
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
