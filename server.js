const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const users = require("./routes/api/users");
const messages = require("./routes/api/messages");
const dotenv = require('dotenv')
dotenv.config()
const app = express();
const db = require('./db')
db()





const server = app.listen(process.env.PORT || 3000, console.log('run server 3000 port'))

const io = require("socket.io").listen(server);

// Body Parser middleware to parse request bodies
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());

// CORS middleware
app.use(cors());


// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);

// Assign socket object to every request
app.use(function(req, res, next) {
    req.io = io;
    next();
});

// Routes
app.use("/api/users", users);
app.use("/api/messages", messages);

app.get('/', function(req, res) {
    res.send('chat running');
  });