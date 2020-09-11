const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location-sender')
const $message = document.querySelector('#message')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //selecting new message element
    const $newMessage = $message.lastElementChild

    //getting margine of that new element
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)

    //getting total height of new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // getting visible height
    const visibleHeight = $message.offsetHeight

    //msg contaner height 
    const containerHeight = $message.scrollHeight

    //how far down we have scrolled 
    const scrollOffSet = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet) {
        $message.scrollTop = $message.scrollHeight
    }
}

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href='/'
    }   
})

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        user: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        sendAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    //disabling form after the input is sent
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = event.target.elements.msgBox.value

    socket.emit('sendMsg', message, () => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        console.log('msg sent')
    })
}) 


$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Your browser does not support this functionality')
    }

    //disabling location button 
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude
        long = position.coords.longitude

        socket.emit('location', { lat, long}, () => {
            $locationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})