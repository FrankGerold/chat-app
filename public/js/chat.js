const socket = io()


// DOM Elements
const $body = document.querySelector('body')
const $chatBox = document.createElement('div')
const $chatForm = document.querySelector('.messageForm')
const $incButton = document.querySelector('#increment')
const $locationButton = document.querySelector('#location-button')
const $chatButton = $chatForm.querySelector('input[type="submit"]')
const $chatField = $chatForm.querySelector('input[type="text"]')

const $msgTemplate = document.querySelector('#msg-template').innerHTML
const $locTemplate = document.querySelector('#location-msg').innerHTML


$body.append($chatBox)


// Listeners
$incButton.addEventListener('click', () => {
  console.log('clickec');
  socket.emit('increment')
})


$chatForm.addEventListener('submit', evt => {
  evt.preventDefault()
  $chatButton.setAttribute('disabled', 'disabled')

  let message = evt.target[0].value

  socket.emit('message', message, ack => {
    $chatButton.removeAttribute('disabled')
    $chatField.value = ''
    $chatField.focus()

    if (ack) {
      return console.log(ack);
    }

    console.log('Delivered!');
  })
})


$locationButton.addEventListener('click', () => {
  $locationButton.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert('Geolocation not supported.')
  }

  navigator.geolocation.getCurrentPosition(position => {
    $locationButton.setAttribute('disabled', 'disabled')
    socket.emit('location', {lat: position.coords.latitude, long: position.coords.longitude}, (resp) => {
      $locationButton.removeAttribute('disabled')

      if (resp) {
        return console.log(resp);
      }

      console.log('Location sent');
    })
  })
})

// Websocket events
socket.on('countUpdated', (count) => {
  console.log('Count Updated', count);
  $incButton.innerText=`+${count}`;
})


socket.on('message', message => {
  let newChatMessage = Mustache.render($msgTemplate, {
    message: message.msg,
    createdAt: moment(message.createdAt).format('h:mm a')
  })

  $chatBox.insertAdjacentHTML('afterbegin', newChatMessage)
})

socket.on('locMessage', message => {
  let newLocation = Mustache.render($locTemplate, {
    url: message.msg,
    createdAt: moment(message.createdAt).format('h:mm a')
  })

  $chatBox.insertAdjacentHTML('afterbegin', newLocation)
})
