'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');
var dns = require('dns');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connection Successful!");
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

/*** My solution ***/
  // Database
  // Create a schema and a model
  const Schema = mongoose.Schema;
  const urlSchema = new Schema({
    original_url:  String
    });
  const Url  = mongoose.model('Url', urlSchema);

  // routes
  app.post("/api/shorturl/new", function(req, res, next) {
    // check for database connection
    if (mongoose.connection.readyState === 1) {
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
      // check for correct format of URL enteres by a user
      if (!regex.test(req.body.url)) {
         res.json({
           error: "invalid URL"
         });
      } else {
        // if the format is correct check whether hostname exists. If not send a message of error
        dns.lookup(req.body.url.replace(/^https?:\/\/(www\.)?/, ""), (err, address, family) => {
         if (err) {
           res.json({
             error: "invalid URL"
           });
         } else {
         // if the hostname entered exists
         // make an entry to a database
          const entry = new Url({original_url: req.body.url});
          entry.save(function(error, data){
          });
      
        // send original and shortened URL as response
         res.json({
          original_url: req.body.url,
          short_url: entry._id
         }); 
           
        }
      });
    }
  }
});


  
app.get("/api/shorturl/:new", function(req, res) {
   Url.findById({_id: req.params.new}, function(error, data) {
     if (error) {
      console.log(error);
    }
     
    res.redirect(data.original_url);
     
     /*res.json({
       data: data.original_url
     });*/
  });

  
});

/******************/


app.listen(port, function () {
  console.log('Node.js listening ...');
});