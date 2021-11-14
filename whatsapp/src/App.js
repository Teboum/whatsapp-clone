import React, { useEffect, useState } from "react";
import { BrowserRouter as Router,Routes, Route, Switch } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Pusher from "pusher-js";
import axios from "./axios";
import {io} from "socket.io-client"
import Login from "./Login";
import Home from "./Home";
const socket =io("http://localhost:9000")
function App() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
   (function(){
      axios.get("/messages/sync").then(({data}) => {
        setMessages(data);
        socket.on('connect',()=>{console.log("connecte")})
        socket.on('FromAPI',(newMessage)=> {console.log(messages,newMessage); setMessages(prev=>[...prev,newMessage])}) 
      });
      console.log("app","app");
    })();
  return socket.removeAllListeners()
  }, []);
  // useEffect(() => {
  //   // var pusher = new Pusher("b19265744ce797e7dc48", {
  //   //   cluster: "eu",
  //   // });

  //   // var channel = pusher.subscribe("messages");
  //   // channel.bind("inserted",  async function (newMessage) {
  //   //   JSON.stringify(newMessage);
  //   //   setMessages([...messages,newMessage]);
  //   // });
  //   console.log(messages);
    
  //   })
  //   return () => {
  //     // channel.unbind_all();
  //     // channel.unsubscribe();
  //   };
  // }, []);

  return (
    <div className="app">
     
      <Router>
        <Routes>
        <Route exact path="/login" element={<Login/>} />
         
        <Route exact path="/" element={<Home messages={messages}/>} />
        </Routes>
      </Router>  
       
     
    </div>
  );
}

export default App;
