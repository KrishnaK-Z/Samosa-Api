const express = require('express');
const app = express();

/**
 * Connects to Mongoose DB
 */
require('./database/DB/mongoose');

// Environmental Variables
require('dotenv').config();
const port = process.env.PORT || 3000;

// Route Handlers
const userRouteHandler = require('./routes/user');
const eventsRouteHandeler = require('./routes/events');

// Request as JSON Object
app.use(express.json());

// Request as string or array
app.use(express.urlencoded({
    extended: false
}));

// CORS Middleware applied to for every endpoint to allow the haeders
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, POST, HEAD, PUT, OPTIONS, PATCH, DELETE");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    response.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next();
});

// User related endpoints
app.use('/user', userRouteHandler);

app.use('/events', eventsRouteHandeler);

// Events releated endpoints

app.listen(port, () => {
    console.log("Server Started");
});