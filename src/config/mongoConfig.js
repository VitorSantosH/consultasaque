const mongoose = require('mongoose')

let conn
try {
    conn = mongoose.createConnection('mongodb://localhost:27017/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

} catch (error) {
    console.log(error)
}






module.exports = conn;