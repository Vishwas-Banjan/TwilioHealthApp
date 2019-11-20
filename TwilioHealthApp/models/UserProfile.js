var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: {type: String, required: true},
    symptom: String,
    left: [String]
});
module.exports = mongoose.model('User', userSchema);
