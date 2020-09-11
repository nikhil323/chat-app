const generateMsg = (username, text) => {
    return {
    username,
    text,
    createdAt: new Date().getTime()
    }
    
}

const generateLocationMsg = (username, link) => {
    return {
        username,
        url: link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}