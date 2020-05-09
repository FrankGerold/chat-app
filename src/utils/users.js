const users = []

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase()

  room = room.trim().toLowerCase()

  // validate
  if (!username || !room) {
    return {
      error: 'Username and Room are required'
    }
  }

  // Check for existing user
  let existingUser = users.find(user => user.room === room && user.username === username)

  // validate username
  if (existingUser) {
    return {
      error: 'Username in use'
    }
  }

  // Store user
  let user = { id, username, room }
  users.push(user)
  return { user }
}


const removeUser = id => {
  let  index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}


const getUser = id => users.find(user => user.id === id)


const getUsersInRoom = room => users.filter(user => user.room === room)

// console.log(addUser({id:1, username:'fg', room:'bl'}));
// console.log(addUser({id:2, username:'122', room:'bl'}));
// console.log(addUser({id:3, username:'fg', room:'bl'}));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
