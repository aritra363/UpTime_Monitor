/* 
  Title : Notifications
  Description : Handle all notification related work
  Author : Aritra Pal
  Date : 29/11/2022 
*/

//dependencies
const https = require("https");
const environment = require("../helpers/environments");
const client = require("twilio")(
  environment.twilio.accountSid,
  environment.twilio.authToken
);

//module Scaffolding
const notifications = {};

//send sms to the user
notifications.sendTwilioSms = (phone, sms, callback) => {
  //validation
  const userPhone = typeof phone === "string" ? phone : false;
  const userMsg =
    typeof sms === "string" &&
    sms.trim().length > 0 &&
    sms.trim().length <= 1600
      ? sms.trim()
      : false;
  if (userPhone && userPhone) {
    /* //object to send
    const payload = {
      From: environment.twilio.from,
      To: `+${userPhone}`,
      Body: userMsg,
    };
    //stringy the payload
    const stringifyPayload = JSON.stringify(payload);

    //configure request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${environment.twilio.accountSid}/Messages.json`,
      auth: `${environment.twilio.accountSid}:${environment.twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    //instantaniate request
    const req = https.request(requestDetails, (res) => {
      const statuscode = res.statusCode;
      //check if request is successfull
      if (statuscode === 200 || statuscode === 201) {
        callback(false);
      } else {
        callback(`Returned Status code ${statuscode} + ${res.error_message}`);
      }
    });

    //if error in sending request
    req.on("error", (err) => {
      callback(err);
    });

    //attach the payload
    req.write(stringifyPayload);

    //end request
    req.end(); */

    client.messages
      .create({
        body: userMsg,
        from: environment.twilio.from,
        to: `+${userPhone}`,
      })
      .then((message) => {
        if (message.errorCode === null) {
          callback(false);
        } else {
          callback(message.errorMessage);
        }
      });
  } else {
    callback("Invalid Inputs");
  }
};

//exports
module.exports = notifications;
