const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth')

// Route for creating a user
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for logging in a user
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send('Error: ' + e)
  }
})

// Route for logging out a user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send('You have now logged out.')
  } catch (e) {
    res.status(500).send(e)
  }
})

// Route for logging a user out of all their registered devices
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('You have now logged out of all devices.')
  } catch (e) {
    res.status(500).send(e)
  }
})

// Route for returning the user's profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

// Route for updating the user's information
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Route for deleting a user
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(_id)
    //
    // if (!user) {
    //   return res.status(404).send(_id)
    // }

    // Achieves the same as the commented out block above
    await req.user.remove()
    res.send(req.user)
  } catch (e) {
    res.status(500).send('Eh what\'s up with deleting this?')
  }
})

// Function for uploading an avatar. Limiting the file size to 1MB plus a filter
// to ensure an image file
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('File must be a .jpg, .jpeg or .png'))
    }

    callback(undefined, true)
  }
})

// Route for uploading an profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  // Use Sharp to resize the images and convert to png
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// Route for fetching a user's avatar
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error('Uh oh')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

  } catch (e) {
    res.status(404).send(e)
  }
})

// Route for deleting the user's avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

module.exports = router
