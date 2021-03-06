"use strict";
const fs = require("fs");
const readline = require("readline");

var lastLine;

const lastLines = (filename) => {
  console.log("finame:" + filename);
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(filename, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      console.log("cannot read the file");
      reject(error);
    }

    fs.accessSync(filename, fs.constants.R_OK | fs.constants.W_OK, (error) => {
      console.log("cannot read the file");
      reject(error);
    });
    let lines = [];
    let r1 = readline.createInterface({
      input: fs.createReadStream(filename),
      output: process.stdout,
      terminal: false,
    });

    r1.on("error", (error) => {
      console.log("error is here");
      reject(error);
    });

    r1.on("line", (input) => {
      lines.push(input);
    });

    r1.on("close", () => {
      lastLine = lines.length > 0 ? lines[lines.length - 1] : "";
      console.log("last line" + lastLine);
      resolve(lines.slice(-10));
    });
  });
};

const newLines = (filename) => {
  //   console.log("LAST LINE!!: " + lastLine);
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(filename, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      console.log("cannot read the file");
      reject(error);
    }

    let lines = [];
    let register = false;
    let r1 = readline.createInterface({
      input: fs.createReadStream(filename),
      output: process.stdout,
      terminal: false,
    });

    r1.on("line", (input) => {
      // console.log(input)
      if (register || lastLine == "") {
        lines.push(input);
        console.log(input);
      } else if (input === lastLine) {
        register = true;
      }
    });

    r1.on("close", () => {
      lastLine = lines.length > 0 ? lines[lines.length - 1] : "";
      resolve(lines);
    });
  });
};

module.exports = {
  lastLines,
  newLines,
};
