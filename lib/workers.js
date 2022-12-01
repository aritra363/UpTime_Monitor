/* 
  Title : Worker Handler
  Description : Handles the main operation i.e. to check if the link is up or down
  Author : Aritra Pal
  Date : 30/11/2022 
*/

// Dependencies
const url = require("url");
const https = require("https");
const http = require("http");
const data = require("./data");
const utils = require("../helpers/utilities");
const notifications = require("../helpers/notifications");

// workers object - Module Scaffolding
const workers = {};

//gather all the checks function
workers.gatherAllChecks = () => {
  //read from filebase
  data.list("checks", (err, fileNameArray) => {
    if (!err && fileNameArray && fileNameArray.length > 0) {
      //get the check data for each check file
      fileNameArray.forEach((element) => {
        data.read("checks", element, (err, checkData) => {
          //send the checks to validation
          workers.validateAllChecks(utils.parseJSON(checkData));
        });
      });
    } else {
      console.log(err);
    }
  });
};

//all checks data validator
workers.validateAllChecks = (checkData) => {
  if (checkData && checkData.id) {
    //add up/down state and lastchecked time for first time and check for next time
    checkData.state =
      typeof checkData.state == "string" &&
      ["up", "down"].indexOf(checkData.state) > -1
        ? checkData.state
        : "down";
    checkData.lastTimeChecked =
      typeof checkData.lastTimeChecked === "number" &&
      checkData.lastTimeChecked > 0
        ? checkData.lastTimeChecked
        : false;
    //pass the data to perform checking if link up or down
    workers.performCheck(checkData);
  } else {
    console.log("Invalid CheckData", checkData, checkData.id);
  }
};

//function for performing checks(i.e. link up or down)
workers.performCheck = (checkData) => {
  //prepare initial check for outcome
  let checkOutCome = {
    error: false,
  };
  //mark the outcome has not been sent
  let isOutComeSent = false;
  //parse the url into hostname path etc
  const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  //request object
  const requestDetails = {
    protocol: `${checkData.protocol}:`,
    hostname,
    path,
    method: checkData.method.toUpperCase(),
    timeout: checkData.timeout * 1000,
  };

  //check which protocol to use
  const protocolToUse = checkData.protocol === "http" ? http : https;

  //make request
  const req = protocolToUse.request(requestDetails, (res) => {
    const status = res.statusCode;
    //update the checkdata
    //check if the outcome is sent or not
    checkOutCome = {
      error: false,
      responseCode: status,
    };
    if (!isOutComeSent) {
      workers.updateCheckData(checkData, checkOutCome);
    }
  });

  //check for error
  req.on("error", (err) => {
    checkOutCome = {
      error: true,
      value: err,
    };
    if (!isOutComeSent) {
      workers.updateCheckData(checkData, checkOutCome);
    }
  });

  //check for timeout
  req.on("timeout", () => {
    checkOutCome = {
      error: false,
      value: "timeout",
    };
    if (!isOutComeSent) {
      workers.updateCheckData(checkData, checkOutCome);
    }
  });
  //Request Send
  req.end();
};

//To update the checkdata
workers.updateCheckData = (checkData, checkOutCome) => {
  //check if link is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    checkData.successcode.indexOf(checkOutCome.responseCode)
      ? "up"
      : "down";

  //check if to send sms or not
  let sendSms =
    checkData.lastTimeChecked && checkData.state !== state ? true : false;
  //update the checkData
  checkData.state = state;
  checkData.lastTimeChecked = Date.now();

  data.update("checks", checkData.id, checkData, (err) => {
    if (!err) {
      //send sms
      if (sendSms) {
        workers.sendAlert(checkData);
      }
    } else {
      console.log("Error updating the Check file");
    }
  });
};

//alert user for status change
workers.sendAlert = (checkData) => {
  notifications.sendTwilioSms(
    checkData.phone,
    `Your Link ${checkData.protocol}://${checkData.url} is ${checkData.state}`
  );
};

//timer to loop the gather process
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

//Initialize the worker
workers.init = () => {
  //gather all the user checks from filebase
  workers.gatherAllChecks();
  //loop the gathering work
  workers.loop();
};

//export
module.exports = workers;
