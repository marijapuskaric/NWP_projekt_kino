const mongoose = require('mongoose');

const projectionSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    runningTime: { type: String, required: true },
    img: {
        data: Buffer,
        contentType: String
    },
    availableSeats: { type: Number, required: true },
    takenSeats: { type: Number, default: 0 },
    showTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true }
});

module.exports = mongoose.model('ProjectionModel', projectionSchema);
