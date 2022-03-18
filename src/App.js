import React, { useEffect, useState } from "react";
import { BrowserRouter as Router,Routes, Route, Switch } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Pusher from "pusher-js";
import axios from "./axios";
import socket from "./socket"
import Login from "./Login";
import Home from "./Home";
import Cookies from "js-cookie";




function App() {
  const [messages, setMessages] = useState(false);
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user'))||false)
  const [token ,setToken]=useState(Cookies.get("token"))||false
  const [image,setImage]=useState(sessionStorage.getItem('image')||null)
  const [homeID,setHomeID]=useState(sessionStorage.getItem('homeID')||false)
  const [homeChange,setHomeChange]=useState(false)
  const [lastMessage,setLastMessage]=useState(false)
  const [chat,setChat]=useState([])
  useEffect(() => {

     if(user){ axios.get("/messages/sync",{params:{
        id1:user._id,
        id2:homeID.id
      }}).then(({data}) => {
        console.log(data);
        if(data){
        setMessages(data); 
        setHomeID(prev=>{return{...prev,_id:data._id}})}
        else setMessages({})
       }).catch(err=>console.log(err.message));
        
      }
  return ()=>{}
  }, [homeID._id]);
  useEffect(() => {
    if(homeID._id)socket.on('connect')
    socket.emit('homeId',homeID._id)
    socket.on('fromAPI',(newMessage)=> {
      console.log(newMessage);
      if(newMessage._idMessages){setHomeID(prev=>{return{...prev,_id:newMessage._idMessages}})}
      else{
        console.log(newMessage);
        setLastMessage(newMessage)
        setChat(prev=>[...prev,newMessage])
      }
      }) 
    return () => socket.onclose
  }, [])
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
        {user?<Route  exact path="*" element={<Home lastMessage={lastMessage} setChat={setChat} chat={chat} setHomeChange={setHomeChange} setHomeID={setHomeID} homeID={homeID} setToken={setToken} messages={messages} user={user} token={token} image={image} setMessages={setMessages}/>} />:<Route path="*" element={<Login  token={token} setToken={setToken} setUser={setUser} setImage={setImage}/>} />}
        </Routes>
      </Router>  
       
     
    </div>
  );
}

export default App;
