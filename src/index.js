const http = require('http')

const socket = require('socket.io')

const app = require('./app')

const server = http.createServer(app)
const io = socket(server)

const port = process.env.PORT

let count = 0

io.on('connection', (socket) => {
  console.log('New SOcket COnnection@');

  socket.emit('countUpdated', count)

  socket.on('increment', () => {
    count++;
    io.emit('countUpdated', count);
  })
})

server.listen(port, () => {
  console.log(`Server running on port ${port}.`, 'Env msg: ', process.env.MSG_ONE);
})
