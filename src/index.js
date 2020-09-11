const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMsg, generateLocationMsg } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')


app.use(express.static(publicDirectoryPath) )


io.on('connection', (socket) => {
    console.log('new webSocket connection')

    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({id: socket.id, username, room})

        if(error) {
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMsg('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin', `${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        
    })

    socket.on('sendMsg', (msg, callback) => {
        const user = getUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMsg(user.username, msg))
        }

        callback()
    })

    socket.on('location', (coords, callback) => {
        const user = getUser(socket.id)

        if(user) {
             io.to(user.room).emit('locationMessage', generateLocationMsg(user.username, `http://google.com/maps?q=${coords.lat},${coords.long}`))
        }

        callback()
        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMsg('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })
})

server.listen(port, () => {
    console.log(`server is up and running in port ${port}`)
})