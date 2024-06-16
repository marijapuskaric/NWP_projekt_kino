const mongoose = require('mongoose');

const userProjectionReservationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    projectionId: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjectionModel', required: true},
    numberOfSeats: {type: Number, required: true}
});

module.exports = mongoose.model('UserProjecitonReservationModel', userProjectionReservationSchema);