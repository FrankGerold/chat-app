const generateMsg = (msg, user) => {
  return {
    msg,
    createdAt: new Date().getTime(),
    user
  }
}

module.exports = { generateMsg };
