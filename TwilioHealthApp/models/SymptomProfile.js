var mongoose = require('mongoose');

const symptomSchema = mongoose.Schema({
    symptomName: {type: String, required: true},
    severityMild: {type: String, required: true},
    severityModerate: {type: String, required: true},
    severitySevere: {type: String, required: true}
});
module.exports = mongoose.model('Symptom', symptomSchema);
