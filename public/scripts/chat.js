const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('btn_location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  const visibleHeight = $messages.offsetHeight
  const constainerHeight = $messages.scrollHeight
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (constainerHeight - newMessageHeight <= scrollOffset)
    $messages.scrollTop = $messages.scrollHeight
}

// async function postData(url = '', data = {}) {
//   const response = await fetch(url, {
//     method: 'POST',
//     mode: 'no-cors',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   })
//   console.log(response)
//   return response.json() // will return object
// }

socket.on('message', (message) => {
  // const url = 'https://encryption-api-node.herokuapp.com/encrypt/aman'
  // const obj = { data: 'aman' }

  // fetch(url)
  //   .then((response) => response.json())
  //   .then((data) => console.log(data))

  // postData(url, obj).then((data) => {
  //   console.log(data) // JSON data parsed by `data.json()` call
  // })

  // TODO add encryption
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    location: message.location,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  $messageFormButton.setAttribute('disabled', 'disabled')
  const msg = e.target.elements.message.value
  // TODO add encryption
  $messageFormInput.value = ''
  $messageFormInput.focus()
  socket.emit('sendMessage', msg, () => {
    $messageFormButton.removeAttribute('disabled')
  })
})

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('Geolocation is not supported by your browser')
  $sendLocationButton.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      },
      () => {
        $sendLocationButton.removeAttribute('disabled')
      }
    )
  })
})

socket.emit(
  'join',
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      alert(error)
      location.href = '/'
    }
  }
)
