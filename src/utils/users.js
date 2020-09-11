const users = []

//addUser, removeUser, getUser, getUsersInRoom
const addUser = ({ id, username, room }) => {
    //trimming data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validating data
    if(!username || !room) {
        return {
            error: 'Username and room should be Provided'
        }
    }

    //check for same name
    const existingUser = users.find( (user) => {
        return user.room === room && user.username === username
    })

    //validating for same name
    if(existingUser) {
        return {
            error: 'name is already taken'
        }
    }

    //storing user 
    const user = { id, username, room}
    users.push(user)
    return { user } 
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    return users.find( (user) => user.id === id )
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
