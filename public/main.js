const socket = io()

let pictionary = () => {
    let canvas, context, guessBox

    let onKeyDown = (event) => {
        if (event.keyCode != 13) {
            return;
        }

        console.log(guessBox.val())
        let guess = guessBox.val()
        socket.emit('guess', guess)
        guessBox.val('')
    }

    guessBox = $('#guess input')
    guessBox.on('keydown', onKeyDown)

    let lastGuess = (guess) => {
        $('#last-guess').text(guess)
    }

    let draw = (position) => {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };

    let drawing = false;

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousedown', (event) => {
        drawing = true
    })
    canvas.on('mouseup', (event) => {
        console.log('STOP DRAWINGGG');
        drawing = false
    })
    canvas.on('mousemove', (event) => {
        let offset = canvas.offset();
        let position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        if (drawing === true) {
            draw(position);
            socket.emit('draw', position)
        }
    });
    socket.on('draw', draw)
    socket.on('guess', lastGuess)
};

$(document).ready(() => {
    pictionary();
});
