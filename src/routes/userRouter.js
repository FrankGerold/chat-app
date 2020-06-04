const express = require('express')


const User = require('../models/user')
const auth = require('../middleware/auth')

const router = new express.Router()


// User routes


// Login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)

    const token = await user.generateAuthToken()

    res.send({user, token})
  } catch (e) {
    res.status(400).send()
  }
})


// user profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})


// Log out user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})


// Kick all logins off current user!
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})


// Create new user
router.post('/users', async (req, res) => {
  let userParams = new User(req.body)

  try {
    let user = await userParams.save()

    let token = await user.generateAuthToken()

    sendWelcomeEmail(user.email, user.name)

    res.status(201)
    .send({user, token})

  } catch (e) {
    res.status(400)
    .send(e)
  }
})
// app.post('/users', (req, res) => {
  //   let newUser = new User(req.body)
  //
  //   newUser.save()
  //   .then(() => res.status(201).send(newUser))
  //   .catch(e => {
    //     res.status(400)
    //     .send(e)
    //   })
    // })


// Update user profile
router.patch('/users/me', auth, async (req, res) => {
  let updateParams = req.body

  // validate update fields
  let attemptedUpdates = Object.keys(updateParams)
  const allowedUpdates = ['name', 'email', 'password', 'age']

  // every tests if all elements in an array pass the test
  const isValidOperation = attemptedUpdates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400)
    .send({
      error: 'Invalid Update'
    })
  }

  // Attempt to update user
  try {
    let updatedUser = req.user

    attemptedUpdates.forEach(update => updatedUser[update] = updateParams[update])

    await updatedUser.save()

    res.send(updatedUser)
  } catch (e) {
    res.status(400)
    .send(e)
  }
})


// Delete User
router.delete('/users/me', auth, async (req, res) => {
  let id = req.user._id

  try {
    // let user = await User.findByIdAndDelete(id)
    //
    // if (!user) {
    //   return res.status(404).send('user not found')
    // }

     let user = await req.user.remove()

    sendFarewell(req.user.email, req.user.name)

    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  let buffer = await sharp(req.file.buffer)
    .png()
    .resize({width: 250, height: 250})
    .toBuffer()

  req.user.avatar = buffer

  await req.user.save()

  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar', auth, async (req, res) => {
  let user = req.user
  try {
    user.avatar = undefined

    await user.save()

    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
}, (error, req, res, next) => {
  res.status(400)
  .send({
    error: error.message
  })
})


router.get('/users/:id/avatar', async (req, res) => {
  try {
    let user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/jpg')
    .send(user.avatar)
  } catch (e) {
    res.status(404).send(e)
  }
})



////////////////////////////////////////////////////////////////
// Dev routes, not in final app


// List all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500)
    .send(e)
  }
})
  // app.get('/users', (req, res) => {
  //   User.find({})
  //   .then(users=>res.send(users))
  //   .catch(e => {
  //     res.status(500)
  //     .send(/*e*/)
  //   })
  // })

// app.get('/users/:id', (req, res) => {
//   let _id = req.params.id
//


// specific user page
router.get('/users/:id', async (req, res) => {
  let id = req.params.id

  try {
    let user = await User.findById(id)

    if (!user) {
      return res.status(404)
      .send('user not found')
    }

    res.send(user)

  } catch (e) {
    res.status(500)
    .send(e)
  }
})

//   User.findById(_id)
//   .then(user => {
//     if (!user) {
//       return res.status(404).send('user not found')
//     }
//
//     res.send(user)
//   })
//   .catch(e => res.status(500).send())
// })


router.patch('/users/:id', async (req, res) => {
  let id = req.params.id
  let updateParams = req.body

  // validate update fields
  let attemptedUpdates = Object.keys(updateParams)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  // every tests if all elements in an array pass the test
  const isValidOperation = attemptedUpdates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400)
    .send({
      error: 'Invalid Update'
    })
  }


  // Attempt to update user
  try {
    // let updatedUser = await User.findByIdAndUpdate(id, updateParams, {
    //   new: true,
    //   runValidators: true
    // })
    // CHange syntax to allow middleware to work with updates
    let updatedUser = await User.findById(id)
    // console.log('USER: ', user)
    //
    // let updatedUser = {
    //   ...user._doc
    // }
    // console.log('UPDATED: ', updatedUser);

    attemptedUpdates.forEach(update => updatedUser[update] = updateParams[update])

    await updatedUser.save()

    if (!updatedUser) {
      return res.status(404)
      .send('user not found')
    }

    res.send(updatedUser)
  } catch (e) {
    res.status(400)
    .send(e)
  }
})

//////////////////////////////////////////////////////////////////


module.exports = router;
