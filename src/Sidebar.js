import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import ChatIcon from "@material-ui/icons/Chat";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import axios from "./axios.js";
import {db} from "./dexie.js"
import { set } from "js-cookie";

function Sidebar({lastMessage,user,token,image,setHomeID,setHomeChange,homeID}) {
  const [friendList,setFriendList]=useState([])
  const [friendListSearch,setFriendListSearch]=useState([])
  const [search,setSearch]=useState(false)
  // const [friendImg,setFriendImg]=useState(false)
  // const image ="data:image/png;base64,"+new Buffer.from(data.picture).toString("base64")
  // setFriendImg(image)
  useEffect(() => {

    axios.get(("/friendList?id="+user._id),{
      headers:{
          'Authorization' : 'bearer '+token
       }
   }).then(({data})=>{
    
      setFriendList(data.friendList)
      console.log(data.friendList);
      if(db.friendList.toArray().length>0)data.friendList.map(e=>{console.log(e); db.friendList.add(e)})
      
     
      setHomeID({_id:data.friendList[0]._id,id:data.friendList[0].id,name:data.friendList[0].name})
      sessionStorage.setItem('homeID',{id:data.friendList[0].id,name:data.friendList[0].name})
      
    }).catch(err=>{console.log(err.message)})
   
    return () => { }
  }, [])
  useEffect(() => {
    console.log(friendList,lastMessage);
    friendList.length>0&&setFriendList(prev=>{
      var prep = prev.filter(elem=>elem._id===lastMessage._id)[0]
      prep.lastMessage=lastMessage.message
      prev[prev.findIndex(elem=>elem._id===lastMessage._id)]=prep
      return prev
    })
    return () => {
      
    }
  }, [lastMessage])
  const searchChange = (e)=>{
    if(e.target.value!=='')setSearch(true)
    else setSearch(false)
    axios.get("/search-friend",{params:{value:e.target.value,userId:user._id}}).then(({data})=>{
      setFriendListSearch(data)
    
     
    })
  }
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={image} />
        <div className="sidebar__headerRight">
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlined />
      <div className={search?'search__container':null}> 
          <input placeholder="Search or start new chat" type="text" onChange={searchChange} />
          
          {search&&<ul className="dropdpwn">{friendListSearch.map((elem,i)=>
              <li className="dropdown__list" onClick={e=>{console.log(elem,homeID);setHomeID({name:elem.name,id:elem._id,_id:homeID._id?false:true})}}> 
                <h4>{elem.name}</h4>
                <p>{elem.phone}<span className={search?'active':null}>{elem.active?" Active":''}</span></p>
              </li>
            
          )} </ul>}
         
        </div>
        </div>
      </div>
      <div className="sidebar__chats">
        {friendList.map((element,index)=><SidebarChat setHomeID={setHomeID} setHomeChange={setHomeChange} setHomeID={setHomeID} friend={element} key={index}/>)}
      </div>
    </div>
  );
}

export default Sidebar;
