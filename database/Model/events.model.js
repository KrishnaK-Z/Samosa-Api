const mongoose = require('mongoose');

const EventsSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    fromDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    toDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    eventTime: {
        type: String,
        required: true,
        default: Date.now
    }
});

EventsSchema.set('timestamps', true);

const Events = mongoose.model('Events', EventsSchema);

module.exports = { Events };