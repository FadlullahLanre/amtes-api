const mongoose = require("mongoose")

mongoose.set('strictQuery', true);

const connectDB = (url) => {
    return mongoose.connect(url, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected!!!');
      });
}

module.exports = connectDB
