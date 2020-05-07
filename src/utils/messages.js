const generateMsg = msg => {
  return {
    msg,
    createdAt: new Date().getTime()
  }
}

module.exports = { generateMsg };
