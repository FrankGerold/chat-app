const http = require('http')

const socket = require('socket.io')
const Filter = require('bad-words')

const app = require('./app')
const { generateMsg } = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users')

const server = http.createServer(app)
const io = socket(server)

const port = process.env.PORT

let count = 0

io.on('connection', socket => {
  console.log('New SOcket COnnection@');
  let introMessage = 'Welcome to the Node/Express Chat App!'


  socket.on('join', ({ username, room }, callback) => {
    let { error, user } = addUser({
      id: socket.id,
      username,
      room
    })

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMsg(introMessage, 'Server'))
    socket.broadcast.to(user.room).emit('message', generateMsg(`${user.username} has joined ${user.room}!`, 'Server'))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })


  socket.on('increment', () => {
    count++;
    io.emit('countUpdated', count);
  })


  socket.on('message', (message, acknowledge) => {
    let filter = new Filter()
    let user = getUser(socket.id)

    if (filter.isProfane(message)) {
      return acknowledge('No cursing!')
    }

    io.to(user.room).emit('message', generateMsg(message, user.username))

    acknowledge()
  })


  socket.on('location', (loc, callback) => {
    let googleString = `https://www.google.com/maps?q=${loc.lat},${loc.long}`
    let user = getUser(socket.id)


    io.emit('locMessage', generateMsg(googleString, user.username))

    callback()
  })


  socket.on('disconnect', () => {
    let user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMsg(`${user.username} has left`, 'Server'))

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})


server.listen(port, () => {
  console.log(`Server running on port ${port}.`, 'Env msg: ', process.env.MSG_ONE);
})
