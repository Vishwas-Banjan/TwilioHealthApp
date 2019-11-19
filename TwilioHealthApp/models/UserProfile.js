var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: {type: String, required: true},
    symptom: {
        name: {type: String}
    },
    completed: [{
        symptom: String
    }]
});
module.exports = mongoose.model('User', userSchema);
