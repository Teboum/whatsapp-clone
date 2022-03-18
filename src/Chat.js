import React, { useEffect, useState } from "react";
import "./Chat.css";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined, AttachFile, MoreVert } from "@material-ui/icons";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import axios from "./axios";
import socket from "./socket"

function Chat({setChat,chat,setMessages, messages ,user , token,homeID ,newMessage,setNewMessage}) {
  const [input,setInput]=useState('')
 
  const sendMessage = async (e)=>{
    e.preventDefault()
    var date =new Date()
    try { const {data} = await axios.post('messages/new',{
      message: input,
      userId:user._id,
      receiver:homeID.id,
      timestamp: date,
      }
      )

    }catch(err){
      console.log(err);
    }
    setInput('')
  }
 useEffect(()=>{
  messages.messages?setChat(messages.messages):setChat([])
  
   return ()=>{

   }
 },[messages])
 
  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar src={homeID.friendPic?homeID.friendPic:null} />
        <div className="chat__headerInfo">
          <h3>{homeID.name}</h3>
          <p>Last seen at ...</p>
        </div>
        <div className="chat__headerRight">
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className="chat__body">
        {chat&&chat.map((message,i) => (

          <p
            key={i+"k"}
            className={`chat__message ${message.receiver===user._id && "chat__receiver"}`}
          >
            <span  key={i}className="chat__name">{homeID.name}</span>
            {message.message}
            <span key={i+"d"} className="chat__timestamp">{message.timestamp}</span>
          </p>
        ))}
      </div>
      <div className="chat__footer">
        <InsertEmoticonIcon />
        <form>
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message" />
          <button onClick={sendMessage}type="submit">send a message</button>
        </form>
        <MicIcon />
      </div>
    </div>
  );
}

export default Chat;
