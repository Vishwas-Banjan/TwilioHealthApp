const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/UserProfile');
const Symptom = require('./models/SymptomProfile');
const accountSid = 'AC9ea3957bbd012ebc900652245d1b16c7';
const authToken = 'bca878659d3fe03d47283bc000205209';
const client = require('twilio')(accountSid, authToken);


const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect( //TODO put password in process.env
    'mongodb+srv://vishwasbanjan:' + 'A36bpIIXYur15wc3' + '@node-rest-shop-7ftzc.mongodb.net/twilioHealthApp?retryWrites=true&w=majority'
);

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    var userId = req.body.From;
    var symptomsArray = ["Headache", "Dizziness", "Nausea", "Fatigue", "Sadness", "None"];

    switch (req.body.Body) {
        case "START":
            User.find({userId: userId}).exec().then((doc) => {
                if (!doc.length > 0) {
                    //Create Account
                    console.log("Account does not exist");
                    client.messages
                        .create({
                            body: 'Welcome to the Study',
                            from: '+12054987065',
                            to: userId
                        })
                        .then(message => {
                            var newUser = new User({
                                userId: userId,
                                symptom: {},
                                completed: []
                            });
                            newUser.save().then(result => {
                                //User Created
                                twiml.message('Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None');
                                res.writeHead(200, {'Content-Type': 'text/xml'});
                                res.end(twiml.toString());
                            });
                        });
                } else {
                    //Account Exists
                    console.log("Account exists!");
                    twiml.message('Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
            }).catch(err => {
                console.log(err)
            });
            break;
        case "0":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (doc.symptom != undefined) {
                    //Response is for severity
                    User.findOneAndUpdate({userId: userId}, {symptom: {}}).exec().then(result => {
                        console.log(result);
                        twiml.message('You do not have a ' + userDoc.symptom.name);
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    //Response is for Symptom
                    twiml.message('Thank you, we will check with you later.');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
            });
            break;
        case "1":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (!userDoc) {
                    twiml.message('To start the study, please SMS "START"');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                if (userDoc.symptom.name != undefined) {
                    //Response is for severity
                    Symptom.findOne({symptomName: userDoc.symptom.name}).select('severityMild').exec().then(doc => {
                        twiml.message('You have a mild '
                            + userDoc.symptom.name + ' where ' + doc.severityMild + '  is the symptom.');
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        User.findOneAndUpdate({userId: userId}, {symptom: {}}).then(result => {
                            client.messages
                                .create({
                                    body: 'Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None',
                                    from: '+12054987065',
                                    to: userId
                                });
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    //Response is for Symptom
                    User.findOneAndUpdate({userId: userId}, {
                        symptom: {name: "Headache"}
                    }).exec().then(result => {
                        User.findOneAndUpdate({userId: userId}, {
                            $push: {
                                completed: {
                                    symptom: "Headache"
                                }
                            }
                        }).then(doc => {
                            console.log(result);
                            twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your Headache in the last 24 hours?');
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        });

                    }).catch(err => {
                        console.log(err);
                    });

                }
            });
            break;
        case "2":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (!userDoc) {
                    twiml.message('To start the study, please SMS "START"');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                if (userDoc.symptom.name != undefined) {
                    //Response is for severity
                    Symptom.findOne({symptomName: userDoc.symptom.name}).select('severityMild').exec().then(doc => {
                        twiml.message('You have a mild '
                            + userDoc.symptom.name + ' where ' + doc.severityMild + '  is the symptom.');
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        User.findOneAndUpdate({userId: userId}, {symptom: {}}).then(result => {
                            client.messages
                                .create({
                                    body: 'Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None',
                                    from: '+12054987065',
                                    to: userId
                                });
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    //Response is for Symptom
                    User.findOneAndUpdate({userId: userId}, {
                        symptom: {name: "Dizziness"}
                    }).exec().then(result => {
                        User.findOneAndUpdate({userId: userId}, {
                            $push: {
                                completed: {
                                    symptom: "Dizziness"
                                }
                            }
                        }).then(doc => {
                            console.log(result);
                            twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your Dizziness in the last 24 hours?');
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        });

                    }).catch(err => {
                        console.log(err);
                    });

                }
            });
            break;
        case "3":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (!userDoc) {
                    twiml.message('To start the study, please SMS "START"');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                if (userDoc.symptom.name != undefined) {
                    //Response is for severity
                    Symptom.findOne({symptomName: userDoc.symptom.name}).select('severityModerate').exec().then(doc => {
                        twiml.message('You have a mild '
                            + userDoc.symptom.name + ' where ' + doc.severityModerate + '  is the symptom.');
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        User.findOneAndUpdate({userId: userId}, {symptom: {}}).then(result => {
                            client.messages
                                .create({
                                    body: 'Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None',
                                    from: '+12054987065',
                                    to: userId
                                });
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    //Response is for Symptom
                    User.findOneAndUpdate({userId: userId}, {
                        symptom: {name: "Nausea"}
                    }).exec().then(result => {
                        User.findOneAndUpdate({userId: userId}, {
                            $push: {
                                completed: {
                                    symptom: "Nausea"
                                }
                            }
                        }).exec().then(doc => {
                            console.log(doc);
                            twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your Nausea in the last 24 hours?');
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                            User.findOneAndUpdate({userId: userId}, {symptom: {}});
                        });
                    }).catch(err => {
                        console.log(err);
                    });

                }
            });
            break;
        case "4":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (!userDoc) {
                    twiml.message('To start the study, please SMS "START"');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                if (userDoc.symptom.name != undefined) {
                    //Response is for severity
                    Symptom.findOne({symptomName: userDoc.symptom.name}).select('severitySevere').exec().then(doc => {
                        console.log(doc);
                        twiml.message('You have a mild '
                            + userDoc.symptom.name + ' where ' + doc.severitySevere + '  is the symptom.');
                        res.writeHead(200, {'Content-Type': 'text/xml'});
                        res.end(twiml.toString());
                        User.findOneAndUpdate({userId: userId}, {symptom: {}}).then(result => {
                            client.messages
                                .create({
                                    body: 'Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None',
                                    from: '+12054987065',
                                    to: userId
                                })
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    //Response is for Symptom
                    User.findOneAndUpdate({userId: userId}, {
                        symptom: {name: "Fatigue"}
                    }).exec().then(result => {
                        User.findOneAndUpdate({userId: userId}, {
                            $push: {
                                completed: {
                                    symptom: "Fatigue"
                                }
                            }
                        }).exec().then(doc => {
                            console.log(result);
                            twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your Fatigue in the last 24 hours?');
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        })
                    }).catch(err => {
                        console.log(err);
                    });
                }
            });
            break;
        case "5":
            User.findOne({userId: userId}).exec().then(userDoc => {
                if (!userDoc) {
                    twiml.message('To start the study, please SMS "START"');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
                if (userDoc.symptom.name != undefined) {
                    //Response is for severity
                    twiml.message('Please enter a number from 0 to 4');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                } else {
                    //Response is for Symptom
                    User.findOneAndUpdate({userId: userId}, {
                        symptom: {name: "Fatigue"}
                    }).exec().then(result => {
                        User.findOneAndUpdate({userId: userId}, {
                            $push: {
                                completed: {
                                    symptom: "Sadness"
                                }
                            }
                        }).exec().then(doc => {
                            console.log(result);
                            twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your Sadness in the last 24 hours?');
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        })
                    }).catch(err => {
                        console.log(err);
                    });
                }
            });
            break;
        default:
            twiml.message('Invalid Input!');
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
            break;
    }

    function filterOptions(currentOption, completedOptions) {
        if (completedOptions.includes(currentOption)) {
            console.log("Invalid Selection");
        } else {
            symptomsArray.remove(currentOption).remove(completedOptions);
        }
    }
});


http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});
