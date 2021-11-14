//importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
import multer from "multer";
import { check, validationResult } from 'express-validator';
import USER from "./dbUser.js"
import env from "dotenv";
env.config()
//app config
const app = express();
import {createServer} from "http"
import {Server} from "socket.io"
import client from 'twilio'
import { getTokenRegistration, isAuth } from "./utils.js";
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }})
const port = process.env.PORT || 9000;


const pusher = new Pusher({
  appId: "1198267",
  key: "b19265744ce797e7dc48",
  secret: "78f4f34749d3fd7009de",
  cluster: "eu",
  useTLS: true
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world",
});
///middleware
app.use(express.json());
app.use(cors());

//dbconfig
const dbURL =
  "mongodb://admin:fxuZEDagYerQjaj8@cluster0-shard-00-00.m50nl.mongodb.net:27017,cluster0-shard-00-01.m50nl.mongodb.net:27017,cluster0-shard-00-02.m50nl.mongodb.net:27017/WhatsDB?ssl=true&replicaSet=atlas-13e21j-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(dbURL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("db is connect");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    
    if (change.operationType == "insert") {
      const messageDetails = change.fullDocument;
      // pusher.trigger("messages", "inserted", {
      //   name: messageDetails.name,
      //   message: messageDetails.message,
      //   timestamp: messageDetails.timestamp,
      //   received: messageDetails.received,
      // });
     
       
    io.emit("FromAPI",messageDetails)

      
    } else {
      console.log("error occured");
    }
  });
});


//????

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
 
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
    
      res.status(201).send(data);
    }
  });
});
app.post("/login",multer({
  
  storage:multer.diskStorage({
    destination:(req,file,cb)=>{
      console.log(file,'file1');
      cb(null,"pictures")
    },
    filename:(req,file,cb)=>{
      console.log(file,'file2');
      file.originalname =Date.now()+"-"+file.originalname
      cb(null,file.originalname)
    }
 })
}).single("picture"),check("name").custom((value,{req})=>{
  if(!/^[a-zA-Z|| ]+$/.test(req.body.name))throw "Name Format Incorrect !"
  else return true
}),check("phone").custom((value,{req})=>{
  if(!tel.match(/^\+(?:[0-9] ?){6,14}[0-9]$/))throw "Telephone format is incorrect !"
  else return true
}),check("date").not().isEmpty().withMessage("date required"),async(req,res,next)=>{
  const user = req.body
  user.picture=req.file?req.file.originalname:"picture"
  var random = Math.floor(100000 + Math.random() * 900000);
  // const Client=client(
  //   process.env.TWILIO_ACCOUNT_SID,
  //   process.env.TWILIO_AUTH_TOKEN
  // );
  // console.log(process.env.TWILIO_PHONE_NUMBER,"phonetwil");
  // Client.messages.create({
  //   from: "+14792694607",
  //   to: process.env.TWILIO_PHONE_NUMBER,
  //   body: "Whats Code : "+random
  // }).then((message) => console.log(message.sid)).catch(er=>console.log(er));
  user.code=random
  res.status(200).json({code:random,token:getTokenRegistration(user)})
  
})

app.post("/login-code",isAuth,  check("code")
.not()
.isEmpty()
.isLength(6)
.withMessage("Code contient 6 chiffres au minimum")
.isInt()
.withMessage("Le code est composé de chiffres"),(req,res,next)=>{
  console.log(req.body,req.user);
})
console.log("app");
//listen
httpServer.listen(port, () => console.log(`Listening on port: ${port}`));
