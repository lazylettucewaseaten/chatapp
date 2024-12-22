const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url)
}

module.exports = connectDB

//network restrictions 
 //use of cloud systm 
 