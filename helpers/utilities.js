/* 
  Title : Utilities Helper
  Description : Help with diferent utilities
  Author : Aritra Pal
  Date : 17/11/2022 
*/

//dependencies
const crypto = require("crypto");
const environments = require("./environments");

//module scaffolding
const utilities = {};

//Convert the post data into json if invalid input return blank object
utilities.parseJSON = (stringData) => {
  let output;
  //try catch block if the input is invalid
  try {
    output = JSON.parse(stringData);
  } catch {
    output = {};
  }
  return output;
};
//Convert the user password to hash
utilities.hash = (userPass) => {
  if (typeof userPass === "string" && userPass.length > 0) {
    //convert to hash
    const userHash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(userPass)
      .digest("hex");

    return userHash;
  } else {
    return false;
  }
};

//create a random string
utilities.randomString = (strLength) => {
  //if length is number and greater than 0 then
  const length =
    typeof strLength === "number" && strLength > 0 ? strLength : false;
  //if condition fulfills
  if (length) {
    //create a random string
    const possibleCharaters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";
    //loop through length times
    for (let i = 0; i <= length; i++) {
      //extract a character from random position
      const randomChar = possibleCharaters.charAt(
        Math.floor(Math.random() * possibleCharaters.length)
      );
      //add randomchar to output
      output += randomChar;
    }
    return output;
  } else {
    return false;
  }
};

module.exports = utilities;
