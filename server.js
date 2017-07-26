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
    var today = new Date();
    
    socket.on("get all going",()=>{
        MongoClient.connect(url, (err,db)=>{
          if(err)
            console.log(err);
          else
          {
            var bars = db.collection('bars');
            var getAll = ()=>{
              bars.find({},{})
                  .toArray((err,data)=>{
                    if(err)
                     console.log(err);
                    else
                    {
                      console.log("sending: " + data.length);
                      socket.emit("receive all going",{going: data});
                      db.close();
                    }
                  });
            };
            getAll(db);
          }
          
        });
    });
    
    socket.on("update",(data)=>{
      //{post_id: id, user_id: this.state.userData}
      MongoClient.connect(url,(err,db)=>{
        if(err)
          console.log(err);
        else
        {
          var bars = db.collection('bars');
          var findOne = ()=>{
            bars.findOne({_id: data.post_id},(err,result)=>{
              if(err)
                console.log(err);
              else
              {
                if(result)
                {
                  io.sockets.emit("update one",{_id: data.post_id,going: data.user_id});
                  bars.update({_id: data.post_id}, {$push: {going: data.user_id}});
                }
                else
                {
                  io.sockets.emit("add one",{_id: data.post_id, going: [data.user_id]});
                  bars.insert({_id: data.post_id, going: [data.user_id]});
                }
              }
            });
          };
          findOne(db,()=>{db.close();});
        }
      });
    });
    //socket.emit("pull",{_id: id, pull: this.state.userData});
    
    socket.on("pull",(data)=>{
      MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
          var bars = db.collection('bars');
          var update = ()=>{
            bars.update({_id: data._id},{$pull: {going: data.pull}});
            socket.broadcast.emit("pull one",{_id: data._id,going: data.pull});
          };
          update(db,()=>{db.close();});
        }
      });  
    });
    
    //sdfasdfs
    
    app.get('/getbars/:zip_code',(req,res)=>{
       console.log("getting for zip code: " + req.params.zip_code);  
        yelp.search({term: "bar",location: req.params.zip_code, limit: 10})
       .then((data)=>{
           res.send(data);
       });
    });

});