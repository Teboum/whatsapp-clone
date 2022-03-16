//importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
import multer from "multer";
import { check, validationResult } from "express-validator";
import USER from "./dbUser.js";
import env from "dotenv";
import asyncHandler from "express-async-handler";
import { createServer } from "http";
import fs from "fs-extra";

env.config();
//app config
const app = express();

import {
  getTokenLogin,
  getTokenRegistration,
  isCode,
  isLogin,
} from "./utils.js";
const httpServer = createServer(app);

const port = process.env.PORT || 9000;

// const pusher = new Pusher({
//   appId: "1198267",
//   key: "b19265744ce797e7dc48",
//   secret: "78f4f34749d3fd7009de",
//   cluster: "eu",
//   useTLS: true
// });

// pusher.trigger("my-channel", "my-event", {
//   message: "hello world",
// });
///middleware
// db.once("open", function () {
//
//   const msgCollection = db.collection("messages");
//   const changeStream = msgCollection.watch({
//     $match: { "fullDocument._id": _id },
//   });
//   changeStream.on("change", (change) => {
//     console.log(change, "change");
//     if (change.operationType == "update") {
//       var messageDetails =
//         change.updateDescription.updatedFields[
//           Object.keys(change.updateDescription.updatedFields)[0]
//         ];
//       // pusher.trigger("messages", "inserted", {
//       //   name: messageDetails.name,
//       //   message: messageDetails.message,
//       //   timestamp: messageDetails.timestamp,
//       //   received: messageDetails.received,
//       // });
//
//     }  else {
//       console.log("error occured");
//     }
//   });
//   console.log("db is connect");
// });

// pusher.trigger("my-channel", "my-event", {
//   message: "hello world",
// });
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

//????

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.findById(req.query.chatId)
    .select("_id messages")
    .then((data) => {
      res.status(200).send(data.messages);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/messages/new", async (req, res) => {
  const dbMessage = { ...req.body };
  delete dbMessage.userId;
  Messages.updateOne(
    { _id: req.body._id },
    {
      $push: {
        messages: { message: req.body.message, sender: req.body.sender },
      },
      lastMessage: req.body.message,
    },
    { new: true },
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res
          .status(201)
          .send({ message: req.body.message, sender: req.body.sender });
      }
    }
  );
});
app.post(
  "/login",
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        console.log(file, "file1");
        cb(null, "pictures");
      },
      filename: (req, file, cb) => {
        console.log(file, "file2");
        file.originalname = Date.now() + "-" + file.originalname;
        cb(null, file.originalname);
      },
    }),
  }).single("picture"),
  check("name").custom((value, { req }) => {
    if (!/^[a-zA-Z|| ]+$/.test(req.body.name)) throw "Name Format Incorrect !";
    else return true;
  }),
  check("phone").custom((value, { req }) => {
    if (!tel.match(/^\+(?:[0-9] ?){6,14}[0-9]$/))
      throw "Telephone format is incorrect !";
    else return true;
  }),
  async (req, res, next) => {
    const user = req.body;
    user.picture = req.file ? req.file.originalname : "picture";
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
    user.code = random;
    res.status(200).json({ code: random, token: getTokenRegistration(user) });
  }
);

app.post(
  "/login-code",
  isCode,
  check("code")
    .not()
    .isEmpty()
    .isLength(6)
    .withMessage("Code contient 6 chiffres au minimum")
    .isInt()
    .withMessage("Le code est composé de chiffres"),
  async (req, res, next) => {
    if (+req.body.code === req.user.code) {
      delete req.user.code;
      req.user.picture === "picture" && delete req.user.picture;
      req.user.active = true;
      console.log(req.user);
      USER.findOneAndUpdate(
        { phone: req.user.phone },
        { $set: req.user },
        { upsert: true, new: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            console.log(err);
            res.status(500).json({ error: err });
          }
          const image =
            doc.picture != "picture"
              ? fs.readFileSync("./pictures/" + doc.picture)
              : "picture";
          doc = doc.toObject();
          delete doc.picture;
          delete doc.__v;
          const token = getTokenLogin(doc);
          console.log(token, "token");
          return res
            .status(200)
            .json({ user: { ...doc }, image: image, token: token });
        }
      );
    } else {
      res.status(403).json({ error: "Code Incorrect" });
    }
  }
);

app.get("/search-friend", (req, res, next) => {
  var regex = (req.query.value.charAt(0) === "+", "0")
    ? new RegExp(req.query.value.slice(1))
    : new RegExp(req.query.value);
  USER.find({
    $and: [
      { phone: { $regex: regex, $options: "i" } },
      { _id: { $ne: req.query.userId } },
    ],
  })
    .limit(5)
    .then((data) => {
      const friendsArray = [];
      data.map((elem, i) => {
        friendsArray.push({
          _id: elem._id,
          name: elem.name,
          phone: elem.phone,
          active: elem.active,
        });
      });
      return res.json(friendsArray);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.get(
  "/set-chat",
  isLogin,
  asyncHandler(async (req, res) => {
    const regex = new RegExp(req.query.contactId);
    const regex2 = new RegExp(req.user._id);
    try {
      let chat = await Messages.findOne(
        {
          users: {
            $all: [req.query.contactId, req.user._id],
          },
        }
        // users: {
        //   $and: [
        //     {
        //       elemMatch: { _id: req.query.contactId },
        //     },
        //     { elemMatch: { _id: req.user._id } },
        //   ],
        // },
      )
        .select("-messages")
        .populate("users", "-password");

      if (!chat) {
        chat = await Messages.create({
          users: [req.query.contactId, req.user._id],
        });
        chat = await Messages.findById(chat._id)
          .select("-messages")
          .populate("users", "-password");
        chat.users.map((e, i) => {
          chat.users[i].picture =
            e.picture != "picture"
              ? fs.readFileSync("./pictures/" + e.picture)
              : "picture";
        });
        res.status(200).json(chat);
      } else {
        chat.users.map((e, i) => {
          chat.users[i].picture =
            e.picture != "picture"
              ? fs.readFileSync("./pictures/" + e.picture)
              : "picture";
        });
        res.status(200).send(chat);
      }
    } catch (err) {
      console.log(err);
      res.json({ error: err.message });
    }
  })
);

app.get(
  "/friend-list",
  isLogin,
  asyncHandler(async (req, res, next) => {
    Messages.find({
      users: req.query._id,
    })
      .select("-messages")
      .populate("users", "-password")
      .exec((err, messages) => {
        if (err) {
          res.status(500).json({ error: err.message });
        }
        console.log("%j", messages);
        messages.map((e, i) => {
          e.users.map((ey, iy) => {
            messages[i].users[iy].picture =
              ey.picture != "picture"
                ? fs.readFileSync("./pictures/" + e.picture)
                : "picture";
          });
        });
        res.status(200).json({ chats: messages });
      });
  })
);
//listen
httpServer.listen(port, () => console.log(`Listening on port: ${port}`));

//-------------Socket.IO-----------//
import { Server } from "socket.io";

const io = new Server(httpServer, {
  pingTimeout: 600000,
  cors: {
    origin: "http://localhost:3000",
  },
});
let myId;
io.on("connection", (socket) => {
  socket.on("setup", (id) => {
    myId = id;
    console.log(id);
    socket.join(id);
  });
  socket.on("newMessage", (newMessage) => {
    console.log(newMessage);
    socket.in(newMessage.remoteId).emit("message received", newMessage);
  });

  socket.on("inRoom", (ids) => {
    console.log(ids, "in");
    socket.in(ids.remoteId).emit("inRoom", ids.id);
  });
  socket.on("outRoom", (ids) => {
    console.log(ids, "out");
    socket.in(ids.remoteId).emit("leave", ids.id);
  });

  socket.off("setup", () => {
    socket.leave(myId);
  });
});
