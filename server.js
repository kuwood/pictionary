const http = require('http')
const express = require('express')
const socket_io = require('socket.io')

const app = express()
app.use(express.static('public'))

const server = http.Server(app)
const io = socket_io(server)

let numConnections = 0
const words = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

let answer
let usersArray = []
let drawer

io.on('connection', socket => {
    numConnections++
    usersArray.push(socket.client.id)
    if (numConnections === 1) {
        answer = words[Math.floor(Math.random()*words.length)]
        drawer = socket.client.id
        socket.emit('setId', socket.client.id)
        socket.emit('setDrawer', socket.client.id)
        socket.emit('answer', answer)
        io.emit('hideCanvas')
    } else {
        socket.emit('setId', socket.client.id)
        io.emit('showCanvas')
    }

    socket.on('draw', position => {
        socket.broadcast.emit('draw', position)
    })

    socket.on('guess', (id, guess) => {
        if (guess === answer) {
            let correct = answer + " is correct"
            io.sockets.emit('correct', correct)
            answer = words[Math.floor(Math.random()*words.length)]
            drawer = id
            io.emit('setDrawer', id)
            socket.emit('answer', answer)
        } else {
            socket.broadcast.emit('guess', guess)
        }
    })

    socket.on('disconnect', () => {
        let id = usersArray.indexOf(socket.client.id)
        usersArray.splice(id, 1)
        numConnections--
        if (numConnections === 1) {
            io.emit('hideCanvas')
            answer = words[Math.floor(Math.random()*words.length)]
            drawer = usersArray[0]
            io.emit('setDrawer', usersArray[0])
            io.emit('answer', answer)
        } else if (socket.client.id === drawer) {
            socket.broadcast.to(usersArray[0]).emit('welcome', 'welcome')
            drawer = usersArray[Math.floor(Math.random()*usersArray.length)]
            io.emit('setDrawer', drawer)
            answer = words[Math.floor(Math.random()*words.length)]
            io.to('/#'+drawer).emit('answer', answer)
        }
        console.log(usersArray)
    })
})

server.listen(8080)
