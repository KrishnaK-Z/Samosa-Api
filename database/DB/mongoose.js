/**
 * Contains the connection logic to MongoDB
 */
const mongoose = require('mongoose');

// Replace the mongoose promise using js promise
mongoose.Promise = global.Promise;

// Environmental Variables
require('dotenv').config();

mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true
}).then(() => {
    console.log("Mongoose Connected");
}).catch((error) => {
    console.error(error);
});

// To prevent deprectation warnings (from MongoDB native driver)
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


module.exports = {
    mongoose
};