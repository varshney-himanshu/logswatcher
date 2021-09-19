const express = require("express");
const fs = require("fs");
const ws = require("websocket").server;
const app = express();
const lastLines = require("./utils").lastLines;
const newLines = require("./utils").newLines;
const server = require("http").createServer(app);
socketServer = new ws({ httpServer: server });

var lastLine;
const FILENAME = "logs.himanshu";
// let lastline;

app.use("/public", express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>this is test server</h1>");
});

app.get("/log", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let connections = [];

socketServer.on("request", function (request) {
  console.log("Accepting the socket request");
  const client = request.accept(null, request.origin);
  connections.push(client);
});

socketServer.on("connect", (connection) => {
  lastLines(FILENAME)
    .then((lines) => {
      connection.send(JSON.stringify({ filename: FILENAME, lines }));
    })
    .catch((err) => {
      console.log("error is here in server.js" + err);
      connection.send(JSON.stringify(err));
    });

  connection.on("close", function (connection) {
    let i = connections.indexOf(connection);
    connections.splice(i, 1);
  });

  connection.on("close", function (connection) {
    // let i = connections.indexOf(connection);
    // connections.splice(i, 1);
    console.log("connection is closed");
  });

  console.log("connection is established!");
});

fs.watchFile(FILENAME, (curr, prev) => {
  if (curr.ctimeMs == 0) {
    connections.forEach((c) => {
      c.send(JSON.stringify({ error: "File doesn't exists at the moment." }));
    });
  } else if (curr.mtime !== prev.mtime) {
    newLines(FILENAME)
      .then((lines) => {
        if (lines.length > 0) {
          connections.forEach((c) => {
            c.send(JSON.stringify({ filename: FILENAME, lines }));
          });
        }
      })
      .catch((error) => {
        connections.forEach((c) => {
          c.send(JSON.stringify({ error }));
        });
      });
  }
});

server.listen(80, () => console.log("Server is listening at port 8080"));
