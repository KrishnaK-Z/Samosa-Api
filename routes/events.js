const express = require('express');
const router = express.Router();
const { Events } = require('./../database/Model');
const authenticate = require('./../middleware/authenticate');

router.post('/addEvent', authenticate, (request, response) => {
    let newEvent = new Events(request.body);
    newEvent.save().then(event => {
        response.status(200).json({
            success: true,
            result: event
        });
    }).catch(error => {
        response.status(401).json({
            sucess: false,
            result: error
        });
    });
});

router.get('/', (request, response) => {
    Events.find().then(events => {
        response.status(200).json({
            success: true,
            result: events
        });
    }).catch(error => {
        response.status(401).json({
            success: false,
            result: error
        });
    });
});

module.exports = router;