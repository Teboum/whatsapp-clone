import React, { useEffect, useState } from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";

function SidebarChat({friend,setHomeChange,setHomeID}) {
  const [friendImg,setFriendImg]=useState(false)
  useEffect(function(){
    console.log(friend);
    const image ="data:image/png;base64,"+new Buffer.from(friend.image).toString("base64")
    setFriendImg(image)
    return ()=>{
 }
  },[friend])
  function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }
 
  return (
    <div className="sidebarChat" onClick={e=>setHomeID({id:friend.id,name:friend.name,_id:friend._id,friendPic:friendImg?friendImg:null})}>
      <Avatar src={friendImg?friendImg:null}/>
      <div className="sidebarChat__info">
        <h2 className={friend.active?"active":null}>{titleCase(friend.name)}{friend.active&&" is online "}</h2>
        <p>{friend.lastMessage}</p>
      </div>
    </div>
  );
}

export default SidebarChat;
