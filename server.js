const http = require('http')
const express = require('express')
const socket_io = require('socket.io')

const app = express()
app.use(express.static('public'))

const server = http.Server(app)
const io = socket_io(server)

io.on('connection', (socket) => {

    socket.on('draw', (position) => {
        console.log('drawing:', position);
        socket.broadcast.emit('draw', position)
    })

})

server.listen(8080)
