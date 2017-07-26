var path = require('path');
var express = require('express');
var app = express(); 
var env = require('dotenv').config();
var Yelp = require("yelp-api-v3");
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

const server = app
  .use(express.static(__dirname))
  .listen(process.env.PORT, () => console.log(`Listening on ${ process.env.PORT }`));
var url = process.env.MONGO_URL;

const io = require('socket.io')(server);

var yelp = new Yelp({
  app_id: process.env.APP_ID,
  app_secret: process.env.APP_SECRET
});

io.on('connection', (socket) => {
    
    console.log("new connection: " + socket.id);

    app.get('/getbars/:zip_code',(req,res)=>{
       console.log("getting for zip code: " + req.params.zip_code);  
        yelp.search({term: "bar",location: req.params.zip_code, limit: 25})
       .then((data)=>{
           res.send(data);
       });
    });

});