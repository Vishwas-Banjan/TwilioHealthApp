const accountSid = 'AC9ea3957bbd012ebc900652245d1b16c7';
const authToken = 'bca878659d3fe03d47283bc000205209';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'Welcome to the Study',
        from: '+12054987065',
        to: '+16462878066'
    })
    .then(message => console.log(message.sid));

