const socket = io()

let pictionary = () => {
    let canvas, context, guessBox, answer, drawer, id
    let drawing = false

    let hideCanvas = () => {
        $('#wait').show()
        $('#canvas').hide()
    }

    let showCanvas = () => {
        $('#wait').hide()
        $('#canvas').show()
    }

    let winAlert = statement => {
        alert(statement)
        //select, create context, set dimensions and clear canvas
        canvas = $('canvas')
        context = canvas[0].getContext('2d')
        canvas[0].width = canvas[0].offsetWidth;
        canvas[0].height = canvas[0].offsetHeight;
        context.clearRect(0,0, canvas.height, canvas.width)
    }

    let setAnswer = ans => {
        answer = ans
        $('#guess').hide()
        $('#instructions').show()
        $('#instructions').text('draw the word "' + answer + '"')
        $('#last-guess').show()
        $('#last-guess').text('')
    }

    //assigns the drawer and the guessers
    let drawerCheck = clientId => {
        if (clientId === id) {
            drawer = true
            $('h1').text('Pictionary (drawer)')
        } else {
            drawer = false
            $('h1').text('Pictionary (guesser)')
            $('#guess').show()
            $('#last-guess').hide()
            $('#instructions').hide()
        }
    }

    //when enter is pressed it emits input value and clears the input
    let onKeyDown = event => {
        if (event.keyCode != 13) {
            return
        }

        let guess = guessBox.val()
        socket.emit('guess', id, guess)
        guessBox.val('')
    }

    //guessbox listener
    guessBox = $('#guess input')
    guessBox.on('keydown', onKeyDown)

    let lastGuess = guess => {
        $('#last-guess').text('most recent guess: ' + guess)
    }

    //draw on canvas
    let draw = position => {
        context.beginPath()
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI)
        context.fill()
    }

    //select, create context, set dimensions of canvas
    canvas = $('canvas')
    context = canvas[0].getContext('2d')
    canvas[0].width = canvas[0].offsetWidth
    canvas[0].height = canvas[0].offsetHeight
    //checks if your the drawer on mouse down
    canvas.on('mousedown', event => {
        if (drawer === true) {
            drawing = true
        } else {
            alert('sorry the "guesser" cannot draw.')
        }
    })

    //stops drawing on mouse up
    canvas.on('mouseup', event => {
        drawing = false
    })

    //canvas mouse move listener
    canvas.on('mousemove', event => {
        //assign the canvas offset
        let offset = canvas.offset()
        //subtract offset of canvas relative to top left of canvas
        let position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top}

        //check if drawing has been enabled
        if (drawing === true) {
            //draw position to canvas
            draw(position)
            //send position to server to share
            socket.emit('draw', position)
        }
    })
    //listeners
    socket.on('setId', clientId => {id = clientId})
    socket.on('setDrawer', drawerCheck)
    socket.on('answer', setAnswer)
    socket.on('draw', draw)
    socket.on('correct', winAlert)
    socket.on('guess', lastGuess)
    socket.on('hideCanvas', hideCanvas)
    socket.on('showCanvas', showCanvas)
}

$(document).ready(() => {
    pictionary()
})
