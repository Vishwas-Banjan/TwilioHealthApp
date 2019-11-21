const http = require("http");
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/UserProfile");
const Symptom = require("./models/SymptomProfile");
const dotenv = require("dotenv");
dotenv.config();
// const accountSid = 'AC9ea3957bbd012ebc900652245d1b16c7';
// const authToken = 'bca878659d3fe03d47283bc000205209';
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const symptomsArray = [
  "None",
  "Headache",
  "Dizziness",
  "Nausea",
  "Fatigue",
  "Sadness"
];

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL);

const phone = process.env.TWILIO_PHONE_NO;
const pleaseSelectSymptops =
  "Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None";
const plesaseSelectSeverityRating =
  "On a scale from 0 (none) to 4 (severe), how would you rate your Headache in the last 24 hours?";

const sendResponseMessage = (msg, res) => {
  console.log("sending response: " + msg);
  const twiml = new MessagingResponse();
  twiml.message(msg);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
};

const giveSymptom = (message, leftOptions = []) => {
  for (let index = 0; index < leftOptions.length; index++) {
    if (index == message) {
      return leftOptions[index];
    }
  }

  return null;

  //     let thisMessage = "";
  //     switch (message) {
  //         case 0:
  //         thisMessage = "None";
  //         break;
  //         case 1:
  //         thisMessage = "Headache";
  //         break;
  //         case 2:
  //         thisMessage = "Dizziness";
  // break;
  //         case 3:
  //         thisMessage = "Nausea";
  // break;
  //         case 4:
  //         thisMessage = "Fatigue";
  // break;
  //         case 5:
  //         thisMessage = "Sadness";
  // break;
  //         default:
  //         return null;
  //     }
};

const giveSeverity = (severity, symptom) => {
  switch (severity) {
    case 0:
      return "You do not have a " + symptom;

    case 1:

    case 2:
      return `You have a mild ${symptom} where ${symptom} is the symptom`;

    case 3:
      return `You have a moderate ${symptom} where ${symptom} is the symptom`;

    case 4:
      return `You have a severe ${symptom} where ${symptom} is the symptom`;

    default:
      return null;
  }
};

const generateFirstMessage = (leftOptions = []) => {
  let i = 0;
  return (
    "Please indicate your symptom?\n" +
    leftOptions.map(option => {
      let str = "(" + i + ")" + option;
      i++;
      return str;
    })
  );
};

const newUserHandle = (message, userId, userDoc, res) => {
  //Create Account
  console.log("Account does not exist");
  console.log(client);
  client.messages
    .create({
      body: "Welcome to the Study",
      from: process.env.TWILIO_PHONE_NO,
      to: userId
    })
    .then(result => {
      console.log(result);
      console.log("sent welcome message");

      var newUser = new User({
        userId: userId,
        symptom: null,
        left: symptomsArray
      });
      newUser.save().then(result => {
        //User Created
        console.log(message);

        if (message != "START") {
          sendResponseMessage("Please say 'START' to start the server.", res);
          
        } else {
          userDoc.symptom = "";
          userDoc.save(()=>{
            processTheGivenMessage(message, userDoc, res, userId);
          });
        }
      });
    });
};

const handleNotFoundErr = (res, err) => {
  console.log(err);
  sendResponseMessage(
    "Servers are currently down, please try again later.",
    res
  );
  return;
};

const processTheGivenMessage = (message, userDoc, res, userId) => {
  if (message == "START") {
    //Account Exists
    console.log("Account exists!");
    userDoc.symptom = "";
          userDoc.save(()=>{
            sendResponseMessage(generateFirstMessage(userDoc.left), res);
          });
  } else {
    let symptopServer = userDoc.symptom;

    message = Number.parseInt(message);
    // means user is at 1st step
    if (
      symptopServer == null ||
      symptopServer == "" ||
      symptopServer == undefined
    ) {

      console.log(userDoc.left.length);
      
      if (symptopServer == null&&userDoc.left.length>=6) {
        sendResponseMessage("Please say 'START' to start the server.", res);
        return;
      }
      if (message == 0) {
        sendResponseMessage("Thank you and we will check with you later.", res);
        return;
      }
      // TODO: MAKE CHANGE IN LOGIC
      let symptopInput = giveSymptom(message, userDoc.left, symptomsArray);
      console.log(symptopInput + ": symptopInput");

      if (symptopInput == null) {
        // invalid input by user
        sendResponseMessage(generateFirstMessage(userDoc.left), res);
      } else {
        // valid input
        if (symptopInput == "None") {
          sendResponseMessage("Thank you, we will check with you later.", res);
        }

        console.log(userDoc.left);

        // TODO: pop the current element from array
        userDoc.left.pull(symptopInput);

        console.log(userDoc);

        userDoc.symptom = symptopInput;

        userDoc.save((err, results) => {
          if (err != null) {
            handleNotFoundErr(res, err);
          }
          sendResponseMessage(plesaseSelectSeverityRating, res);
        });
      }
    } else {
      console.log(message + ": severity rating.");

      // user at second step
      if (0 <= message && message <= 4) {
        // valid input
        User.updateOne({ userId: userId }, { symptom: "" })
          .exec()
          .then(doc => {
            console.log(symptopServer);
            let secondResponse = giveSeverity(message, symptopServer);
            if (secondResponse == null) {
              sendResponseMessage(
                "Again " + generateFirstMessage(userDoc.left),
                res
              );
            } else {
              client.messages
                .create({
                  body: secondResponse,
                  from: process.env.TWILIO_PHONE_NO,
                  to: userId
                })
                .then(() => {
                  if (userDoc.left.length <= 3) {
                    // do not repeat the process
                    // TODO: need to send two response
                    userDoc.remove();
                    sendResponseMessage("Thank you and see you soon", res);

                    // User.remove({userId: userId})
                    // sendResponseMessage("Thank you and see you soon", res);
                    // return;
                    // userDoc.left.set(symptomsArray);
                    // console.log(userDoc.left);
                    // userDoc.symptom = "";
                    // userDoc.save((err, results) => {
                    //   if (err != null) {
                    //     handleNotFoundErr(res, err);
                    //   }
                    //   sendResponseMessage("Thank you and see you soon", res);
                    //   User.remove({userId: userId});
                    //   return;
                    // });
                  } else {
                    client.messages
                      .create({
                        body: generateFirstMessage(userDoc.left),
                        from: process.env.TWILIO_PHONE_NO,
                        to: userId
                      })
                      .then(message => console.log(message.sid));
                    // and repeat the 1st step
                  }
                });
              // sendResponseMessage(secondResponse, res);
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        sendResponseMessage(plesaseSelectSeverityRating, res);
      }
    }
  }
};

app.post("/sms", (req, res) => {
  // let twiml = new MessagingResponse();
  var userId = req.body.From;
  let message = req.body.Body;
  User.findOne({ userId: userId }, (err, userDoc) => {
    if (err != null) {
      handleNotFoundErr(err, err);
    }
    // if account exists
    if (userDoc == null || userDoc.length <= 0) {
      // user do not exists
      // createAccountThenCheckForStart
      newUserHandle(message, userId, userDoc, res);
    } else {
      processTheGivenMessage(message, userDoc, res, userId);
    }
  });
});

app.get("/", (req, res) => {
  User.findOne({ userId: "+19803131561" }, (err, userDoc) => {
    console.log(userDoc);
    userDoc.symptom = "heaD";
    userDoc.save(function(err, result) {
      console.log(err);

      res.json(result);
    });
  }).catch(err => {
    console.log(err + ": err");
  });
  // console.log(Number.parseInt(req.body.message))
  // res.json({'cool':'stuff'})
});

http.createServer(app).listen(3000, () => {
  console.log("Express server listening on port 3000");
});
