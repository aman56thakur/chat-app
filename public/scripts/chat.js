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
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const constainerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if ((constainerHeight - newMessageHeight) <= scrollOffset) $messages.scrollTop = $messages.scrollHeight
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.location,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value
    $messageFormInput.value = ''
    $messageFormInput.focus()
    socket.emit('sendMessage', msg, () => {
        $messageFormButton.removeAttribute('disabled')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})