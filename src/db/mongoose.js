const mongoose = require('mongoose')

mongoUrl = process.env.MONGODB_URL

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
