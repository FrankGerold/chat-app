const http = require('http')

const socket = require('socket.io')
const Filter = require('bad-words')

const app = require('./app')
const { generateMsg } = require('./utils/messages')

const server = http.createServer(app)
const io = socket(server)

const port = process.env.PORT

let count = 0

io.on('connection', (socket) => {
  console.log('New SOcket COnnection@');
  let introMessage = 'Welcome to the Node/Express Chat App!'

  socket.emit('message', generateMsg(introMessage))
  socket.broadcast.emit('message', generateMsg('User has joined the chat!'))

  socket.on('increment', () => {
    count++;
    io.emit('countUpdated', count);
  })

  socket.on('message', (message, acknowledge) => {
    let filter = new Filter()

    if (filter.isProfane(message)) {
      return acknowledge('No cursing!')
    }

    io.emit('chat', message)
    acknowledge()
  })

  socket.on('location', (loc, acknowledge) => {
    console.log(loc);

    io.emit('locMessage', `https://www.google.com/maps?q=${loc.lat},${loc.long}`)
    acknowledge()
  })

})


server.listen(port, () => {
  console.log(`Server running on port ${port}.`, 'Env msg: ', process.env.MSG_ONE);
})
