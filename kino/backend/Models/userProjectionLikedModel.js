const mongoose = require('mongoose');

const userProjectionLikedSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
    projectionId: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjectionModel', required: true}
});

module.exports = mongoose.model('UserProjecitonLikedModel', userProjectionLikedSchema);
